"""EIS-only, nonnegative RC-DRT density in d(ln tau); never rewrites input."""
from __future__ import annotations

import math
import re
import time
from collections import Counter

import numpy as np
from scipy.optimize import lsq_linear
from scipy.signal import find_peaks


def _number(value):
    if isinstance(value, bool) or value is None or str(value).strip() == "":
        return None
    try:
        value = float(value)
        return value if math.isfinite(value) else None
    except (ValueError, TypeError):
        return None


def _header(value):
    value = str(value).lower().replace("−", "-").replace("″", "''").replace("′", "'")
    value = re.sub(r"\[.*?\]|/\s*(?:ohm|Ω|ω).*", "", value)
    return re.sub(r"[\s_(){}]", "", value)


def _source(row, aliases):
    for key, value in row.items():
        if _header(key) in aliases:
            return True, _number(value)
    return False, None


def normalized_point(row, index=0):
    """Trust explicit canonical signs; repair only legacy verbatim -Im copies."""
    row = row if isinstance(row, dict) else {}
    raw = row.get("_raw") if isinstance(row.get("_raw"), dict) else {}
    def field(canonical, aliases):
        for key in canonical:
            if key in row:
                return _number(row[key])
        found, value = _source(row, aliases)
        return value if found else _source(raw, aliases)[1]
    f = field(("frequency_Hz", "frequency_hz", "frequency"), {"frequencyhz","freqhz","frequency","freq","f/hz","f"})
    zr = field(("z_real_ohm", "zreal"), {"rez","z'","zreal","zrealohm"})
    zi = field(("z_imag_ohm", "zimag"), {"imz","z''","zimag","zimagohm"})
    negative = {"-imz", "-z''", "-zimag", "-zimagohm"}
    found, neg = _source(raw, negative)
    if not found:
        found, neg = _source(row, negative)
    if found and row.get("signConvention") != "Z = Re(Z) + i Im(Z)":
        canonical_present = "z_imag_ohm" in row or "zimag" in row
        if not canonical_present or (neg is not None and zi == neg):
            zi = -neg if neg is not None else None
    sweep = row.get("sweep")
    if sweep is None or not str(sweep).strip():
        sweep = raw.get("sweep")
    sweep = str(sweep).strip() if sweep is not None else None
    return {"frequency_Hz":f,"z_real_ohm":zr,"z_imag_ohm":zi,"rowIndex":index,"sweep":sweep or None}


def partition_spectra(points):
    """Split acquisition-order points without sorting, averaging or dropping rows.

    Explicit sweep changes, repeated positive frequencies and reversals of the
    frequency direction start a new segment. Invalid frequencies stay visible
    in their segment but do not contribute to frequency-direction inference.
    """
    groups, current, seen = [], [], set()
    previous_frequency, direction, last_sweep = None, 0, None
    for point in points:
        frequency = _number(point.get("frequency_Hz"))
        valid_frequency = frequency is not None and frequency > 0
        sweep = point.get("sweep")
        sweep = str(sweep).strip() if sweep is not None else None
        sweep = sweep or None
        step = 0
        if valid_frequency and previous_frequency is not None:
            step = 1 if frequency > previous_frequency else -1 if frequency < previous_frequency else 0
        boundary = bool(current) and (
            (sweep is not None and last_sweep is not None and sweep != last_sweep)
            or (valid_frequency and frequency in seen)
            or (step and direction and step != direction)
        )
        if boundary:
            groups.append(current)
            current, seen = [], set()
            previous_frequency, direction, step = None, 0, 0
        current.append(point)
        if sweep is not None:
            last_sweep = sweep
        if valid_frequency:
            if step:
                direction = step
            previous_frequency = frequency
            seen.add(frequency)
    if current:
        groups.append(current)
    return groups


def normalize_eis(rows):
    points, reasons = [], Counter()
    for index, row in enumerate(rows):
        point = normalized_point(row, index)
        f = point["frequency_Hz"]
        if f is None:
            reasons["missing_or_nonfinite_frequency"] += 1
        elif f <= 0:
            reasons["nonpositive_frequency"] += 1
        elif point["z_real_ohm"] is None or point["z_imag_ohm"] is None:
            reasons["missing_or_nonfinite_impedance"] += 1
        else:
            points.append(point)
    return points, {"inputCount":len(rows),"validCount":len(points),"excludedCount":sum(reasons.values()),
                    "excludedReasons":dict(reasons),"duplicateFrequencyCount":len(points)-len({p["frequency_Hz"] for p in points})}


def integrate_region(tau, gamma, tau_a, tau_b):
    """Piecewise-linear interpolation and trapezoids strictly in ln(tau)."""
    tau, gamma = np.asarray(tau, dtype=float), np.asarray(gamma, dtype=float)
    if not (0 < tau_a < tau_b and tau_a >= tau[0] and tau_b <= tau[-1]):
        raise ValueError("Select an increasing tau interval inside the DRT grid.")
    u, a, b = np.log(tau), np.log(tau_a), np.log(tau_b)
    grid = np.concatenate(([a],u[(u > a) & (u < b)],[b]))
    return float(np.trapezoid(np.interp(grid,u,gamma),grid))


def fit_drt(rows, settings=None):
    settings = settings or {}
    m = settings.get("M",100)
    lam = _number(settings.get("lambda",1e-3))
    include_l = settings.get("includeL",True)
    mode = settings.get("mode","manual")
    if isinstance(m,bool) or not isinstance(m,int) or not 20 <= m <= 200:
        raise ValueError("M must be an integer between 20 and 200.")
    if lam is None or not 0 <= lam <= 10:
        raise ValueError("lambda must be finite and between 0 and 10.")
    if not isinstance(include_l,bool) or mode not in {"manual","auto"}:
        raise ValueError("Invalid includeL or lambda mode.")
    if not isinstance(rows,list) or len(rows) > 2000:
        raise ValueError("DRT supports at most 2000 source rows per calculation; no automatic subsampling is applied.")
    spectra = partition_spectra([normalized_point(row, index) for index, row in enumerate(rows)])
    spectrum_index = settings.get("spectrumIndex")
    if "spectrumIndex" in settings:
        if isinstance(spectrum_index, bool) or not isinstance(spectrum_index, int) or not 0 <= spectrum_index < len(spectra):
            raise ValueError("spectrumIndex must be an integer identifying an available spectrum (zero-based).")
        selected_indices = [point["rowIndex"] for point in spectra[spectrum_index]]
        points, quality = normalize_eis([rows[index] for index in selected_indices])
        for point in points:
            point["rowIndex"] = selected_indices[point["rowIndex"]]
    else:
        points, quality = normalize_eis(rows)
    if len(points) < 3 or len({p["frequency_Hz"] for p in points}) < 3:
        raise ValueError("DRT requires frequency, Re(Z), Im(Z) at three distinct positive frequencies.")
    f = np.array([p["frequency_Hz"] for p in points])
    z = np.array([complex(p["z_real_ohm"],p["z_imag_ohm"]) for p in points])
    z0 = float(np.median(np.abs(z)))
    if not math.isfinite(z0) or z0 <= 0:
        raise ValueError("Z0 must be finite and positive.")
    if f.min() < 1e-12 or f.max() > 1e15 or np.max(np.abs(z)) > 1e100:
        raise ValueError("Input exceeds the supported numerical range.")
    w = 2*np.pi*f
    wref, epsilon = float(w.max()),1e-12*z0
    u = np.linspace(np.log(.1/w.max()),np.log(10/w.min()),m)
    tau, h = np.exp(u),float(u[1]-u[0])
    q = np.full(m,h); q[[0,-1]] = h/2
    wt = w[:,None]*tau[None,:]
    kr, ki = q/(1+wt**2),-q*wt/(1+wt**2)
    n, offset = len(f),1+int(include_l)
    ar, ai = np.zeros((n,m+offset)),np.zeros((n,m+offset))
    ar[:,0], ar[:,offset:], ai[:,offset:] = 1,kr,ki
    if include_l:
        ai[:,1] = w/wref
    a, b = np.vstack((ar,ai)),np.concatenate((z.real/z0,z.imag/z0))
    s = z0/(np.maximum(np.abs(z),epsilon)*np.sqrt(n))
    weights = np.concatenate((s,s))
    aw, bw = a*weights[:,None],b*weights
    smooth = np.zeros((m-2,m+offset))
    for j in range(m-2):
        smooth[j,offset+j:offset+j+3] = np.array([1,-2,1])*np.sqrt(h)/h**2
    started = time.monotonic()
    def solve(value):
        if time.monotonic()-started > 45:
            raise ValueError("DRT calculation time limit reached; try manual lambda or a smaller M.")
        try:
            result = lsq_linear(np.vstack((aw,value*smooth)),np.concatenate((bw,np.zeros(m-2))),
                                bounds=(0,np.inf),method="bvls",tol=1e-10,max_iter=400)
        except Exception as exc:
            raise ValueError("DRT solver did not converge.") from exc
        if not result.success or not np.all(np.isfinite(result.x)):
            raise ValueError("DRT solver did not converge.")
        return result.x
    warnings, curve = [],[]
    if quality["duplicateFrequencyCount"]:
        warnings.append("Duplicate frequencies retained without averaging; multiple sweeps may not describe one stationary spectrum.")
    if quality["excludedCount"]:
        warnings.append("Invalid rows excluded from this calculation only; original rows remain unchanged.")
    auto_reliable = None
    if mode == "auto":
        solutions = []
        candidates = np.logspace(-6,1,41)
        for value in candidates:
            solution = solve(value)
            solutions.append(solution)
            curve.append({"lambda":float(value),"residual":float(np.linalg.norm(aw@solution-bw)),
                          "roughness":float(np.linalg.norm(smooth@solution))})
        lr = np.log(np.maximum([p["residual"] for p in curve],1e-30))
        le = np.log(np.maximum([p["roughness"] for p in curve],1e-30))
        t = np.log(candidates)
        dx,dy = np.gradient(lr,t),np.gradient(le,t)
        curvature = (dx*np.gradient(dy,t)-dy*np.gradient(dx,t))/np.maximum((dx*dx+dy*dy)**1.5,1e-30)
        curvature[:2] = curvature[-2:] = -np.inf
        best = int(np.argmax(curvature))
        auto_reliable = bool(np.isfinite(curvature[best]) and curvature[best] > .05 and
                             np.ptp(lr) > .2 and np.ptp(le) > .2 and 3 <= best <= 37 and
                             float(q@solutions[best][offset:]) > 1e-5)
        if auto_reliable:
            lam,x = float(candidates[best]),solutions[best]
        else:
            warnings.append("L-curve corner is unclear: automatic selection was NOT accepted; showing the specified manual lambda.")
            x = solve(lam)
    else:
        x = solve(lam)
    rs = float(z0*x[0]); inductance = float(z0*x[1]/wref) if include_l else 0.0
    gamma = z0*x[offset:]
    fitted = rs+kr@gamma+1j*(w*inductance+ki@gamma)
    rmse = float(100*np.sqrt(np.mean(np.abs(fitted-z)**2/np.maximum(np.abs(z),epsilon)**2)))
    if rmse > 5:
        warnings.append("Reconstruction error exceeds 5%; this nonnegative RC model may not describe the measured spectrum.")
    band = [float(1/w.max()),float(1/w.min())]
    warnings.append("Outside measured time band: interpret with caution. Peaks do not establish SEI, charge transfer, or ionic transport mechanisms.")
    peak_indices,_ = find_peaks(gamma,prominence=max(float(np.max(gamma))*.02,z0*1e-5))
    boundaries = [0]+[int(left+np.argmin(gamma[left:right+1])) for left,right in zip(peak_indices[:-1],peak_indices[1:])]+[m-1]
    peaks = [{"Peak":f"P{k+1}","tau_peak":float(tau[index]),"f_peak":float(1/(2*np.pi*tau[index])),
              "tau_a":float(tau[boundaries[k]]),"tau_b":float(tau[boundaries[k+1]]),
              "R_region":integrate_region(tau,gamma,tau[boundaries[k]],tau[boundaries[k+1]])}
             for k,index in enumerate(peak_indices)]
    metadata = {"analysisVersion":"rc-drt-1","lambda":lam,"M":m,"tau_min":float(tau[0]),"tau_max":float(tau[-1]),
                "Rs":rs,"L":inductance,"includeL":include_l,"variableCount":len(x),"mode":mode,
                "autoSelectionReliable":auto_reliable,"Z0":z0,"signConvention":"Z = Re(Z) + i Im(Z)",
                "excludedCount":quality["excludedCount"],"densityMeasure":"d(ln tau)","solver":"scipy.optimize.lsq_linear/bvls",
                "measuredTimeBand":band,"peakRegions":"neighboring local minima; editable intervals, not physical assignments",
                "spectrumIndex":spectrum_index,"spectrumCount":len(spectra)}
    reconstruction = [{"frequency_Hz":float(fi),"z_real_raw_ohm":float(zi.real),"z_imag_raw_ohm":float(zi.imag),
                       "z_real_fit_ohm":float(fit.real),"z_imag_fit_ohm":float(fit.imag),
                       "residual_real":float((fit-zi).real),"residual_imag":float((fit-zi).imag),"rowIndex":p["rowIndex"]}
                      for fi,zi,fit,p in zip(f,z,fitted,points)]
    return {"status":"ok","metadata":metadata,"quality":quality,"warnings":warnings,"lCurve":curve,"peaks":peaks,
            "relative_complex_RMSE_percent":rmse,"totalResistance":float(q@gamma),"reconstruction":reconstruction,
            "drt":[{"tau_s":float(t),"gamma_ohm":float(g),"outsideBand":bool(t<band[0] or t>band[1])} for t,g in zip(tau,gamma)]}
