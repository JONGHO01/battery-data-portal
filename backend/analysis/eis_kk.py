"""Bounded numerical Lin-KK consistency diagnostic; no physical pass/fail.

The signed RC model and resistor-mass heuristic follow the published formulas:
https://doi.org/10.1016/j.electacta.2014.01.034
https://impedancepy.readthedocs.io/en/latest/validation.html
This independent implementation uses scaled SVD least squares, not normal
equation inversion. No experiment, density, database or environment is edited.
"""
from __future__ import annotations

import time

import numpy as np


MAX_SECONDS = 5.0
MAX_ORDER = 30
MAX_CONDITION = 1e12
MU_CUTOFF = .85
RMSE_GUARD_PERCENT = 5.0


class _OrderIssue(ValueError):
    """Controlled numerical diagnosis, never an external exception message."""


def _fit_order(f, z, order):
    """Signed fixed-time RC + nuisance R0, L and inverse-C; not a DRT fit."""
    w, z0 = 2 * np.pi * f, float(np.median(np.abs(z)))
    tau = np.exp(np.linspace(np.log(1 / w.max()), np.log(1 / w.min()), order))
    with np.errstate(over="ignore", divide="ignore", invalid="ignore"):
        modulus = np.abs(z) / z0
        kernel = 1 / (1 + 1j * w[:, None] * tau[None, :])
        # Scale the nuisance columns before SVD: the fitted coefficients are
        # numerical only and do not establish physical inductance/capacitance.
        model = np.column_stack((np.ones(len(f)), kernel,
                                 1j * w / w.max(), -1j * w.min() / w))
        design = np.vstack((model.real / modulus[:, None],
                            model.imag / modulus[:, None]))
        target = np.concatenate((z.real / z0 / modulus, z.imag / z0 / modulus))
        column_norm = np.linalg.norm(design, axis=0)
    if (not np.all(np.isfinite(design)) or not np.all(np.isfinite(target))
            or not np.all(np.isfinite(column_norm)) or np.any(column_norm <= 0)):
        raise _OrderIssue("unsupported_numeric_range")
    values, _, rank, singular = np.linalg.lstsq(design / column_norm, target, rcond=None)
    if rank < design.shape[1] or len(singular) != design.shape[1] or singular[-1] <= 0:
        raise _OrderIssue("rank_deficient")
    condition = float(singular[0] / singular[-1])
    if not np.isfinite(condition) or condition > MAX_CONDITION:
        raise _OrderIssue("ill_conditioned")
    coefficients = values / column_norm
    rc = coefficients[1:order + 1]
    positive, negative = float(np.maximum(rc, 0).sum()), float(np.maximum(-rc, 0).sum())
    zero_mass = 128 * np.finfo(float).eps * max(1.0, float(np.linalg.norm(coefficients, 1)))
    mu = float(1 - negative / positive) if positive > zero_mass else None
    with np.errstate(over="ignore", divide="ignore", invalid="ignore"):
        fitted = z0 * (model @ coefficients)
        residual = (z - fitted) / np.abs(z)
        rmse = float(100 * np.sqrt(np.mean(residual.real**2 + residual.imag**2)))
        maximum = float(100 * np.max(np.abs(residual)))
    if not (np.all(np.isfinite(fitted)) and np.all(np.isfinite(residual))
            and np.isfinite(rmse) and np.isfinite(maximum)):
        raise _OrderIssue("nonfinite_solution")
    return {"order": order, "mu": mu, "rmse": rmse, "maximum": maximum,
            "fitted": fitted, "residual": residual, "condition": condition}


def _empty_result(reason):
    return {"method": "linear-kk-complex-v1", "status": "inconclusive",
            "reason": reason, "modelOrder": None, "mu": None,
            "muCutoff": MU_CUTOFF, "selectionReliable": False,
            "relativeComplexRMSEPercent": None, "maxRelativeResidualPercent": None,
            "residuals": [], "orderCurve": [], "includeSeriesCapacitance": True,
            "selectionRule": "first_mu_cutoff_with_rmse_guard_else_lowest_residual",
            "rmseGuardPercent": RMSE_GUARD_PERCENT, "maxModelOrder": MAX_ORDER,
            "residualConvention": "(measured-model)/abs(measured)",
            "timeBudgetSeconds": MAX_SECONDS,
            "physicalValidationPerformed": False, "linearityValidated": False,
            "stationarityValidated": False}


def lin_kk_diagnostic(frequency, impedance):
    """Return numeric consistency residuals or explicit inconclusive metadata.

    Arrays retain their original acquisition order. Mu/order/error thresholds
    are bounded numerical heuristics, not tests proving physical validity.
    """
    result = _empty_result("invalid_input")
    if frequency is None or impedance is None:
        return result
    try:
        if len(frequency) > 2000 or len(impedance) > 2000:
            result["reason"] = "too_many_points"
            return result
        raw_f, raw_z = np.asarray(frequency), np.asarray(impedance)
    except (TypeError, ValueError):
        return result
    if raw_f.ndim != 1 or raw_z.ndim != 1 or raw_f.shape != raw_z.shape:
        result["reason"] = "invalid_shape"
        return result
    if raw_f.dtype.kind not in "iuf" or raw_z.dtype.kind not in "iufc":
        return result
    f, z = raw_f.astype(float), raw_z.astype(complex)
    if not np.all(np.isfinite(f)) or not np.all(np.isfinite(z)):
        result["reason"] = "nonfinite_input"
        return result
    if np.any(f <= 0):
        result["reason"] = "nonpositive_frequency"
        return result
    if len(np.unique(f)) != len(f):
        result["reason"] = "duplicate_frequency"
        return result
    if len(f) < 8:
        result["reason"] = "insufficient_distinct_frequencies"
        return result
    if np.any(np.abs(z) == 0):
        result["reason"] = "zero_impedance"
        return result
    if f.min() < 1e-12 or f.max() > 1e15 or np.abs(z).max() > 1e100:
        result["reason"] = "unsupported_numeric_range"
        return result
    if np.log10(f.max()) - np.log10(f.min()) < 1 - 1e-12:
        result["reason"] = "narrow_frequency_span"
        return result
    started, fits, end_reason = time.monotonic(), [], None
    z0 = float(np.median(np.abs(z)))
    tolerance = 128 * np.finfo(float).eps
    pure_resistance = (np.max(np.abs(z.imag / z0)) <= tolerance
                       and np.ptp(z.real / z0) <= tolerance)
    for order in range(3, min(MAX_ORDER, len(f) - 3) + 1):
        if time.monotonic() - started >= MAX_SECONDS:
            end_reason = "time_budget"
            break
        try:
            fit = _fit_order(f, z, order)
        except _OrderIssue as exc:
            end_reason = str(exc)
            result["orderCurve"].append({"order": order, "mu": None, "rmse": None, "reason": end_reason})
            continue
        except np.linalg.LinAlgError:
            end_reason = "solver_failure"
            result["orderCurve"].append({"order": order, "mu": None, "rmse": None, "reason": end_reason})
            continue
        fits.append(fit)
        result["orderCurve"].append({"order": order, "mu": fit["mu"], "rmse": fit["rmse"]})
        if time.monotonic() - started >= MAX_SECONDS:
            end_reason = "time_budget"
            break
        if pure_resistance:
            break
    if not fits:
        result["reason"] = end_reason or "order_selection_uncertain"
        return result
    candidates = [fit for fit in fits if fit["mu"] is not None
                  and fit["mu"] <= MU_CUTOFF and fit["rmse"] <= RMSE_GUARD_PERCENT]
    selected = candidates[0] if candidates and not end_reason and not pure_resistance else min(fits, key=lambda fit: fit["rmse"])
    reliable = bool(candidates and not end_reason and not pure_resistance)
    if pure_resistance or all(fit["mu"] is None for fit in fits):
        reason = "no_resolved_rc_density"
    elif end_reason:
        reason = end_reason
    elif reliable:
        reason = "heuristic_order_selected"
    elif any(fit["mu"] is not None and fit["mu"] <= MU_CUTOFF for fit in fits):
        reason = "order_selection_uncertain"
    else:
        reason = "order_limit"
    result.update(status="computed" if reliable else "inconclusive", reason=reason,
                  modelOrder=selected["order"], mu=None if pure_resistance else selected["mu"],
                  selectionReliable=reliable, relativeComplexRMSEPercent=selected["rmse"],
                  maxRelativeResidualPercent=selected["maximum"],
                  residuals=[{"frequency_Hz": float(fi), "relativeReal": float(ri.real),
                              "relativeImag": float(ri.imag)}
                             for fi, ri in zip(f, selected["residual"])])
    return result
