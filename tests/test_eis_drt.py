"""Scientific contract tests; synthetic spectra never touch laboratory data."""
import copy
import unittest
from unittest.mock import patch
import numpy as np
from backend.analysis.eis_drt import fit_drt, normalize_eis, integrate_region


def spectrum(two=False, pure=False):
    f = np.logspace(-2, 6, 161)
    w = 2 * np.pi * f
    z = np.full(f.shape, 3, dtype=complex)
    if not pure:
        z += (5 / (1 + 1j*w*1e-4) + 15 / (1 + 1j*w*.1) + 1j*w*1e-6
              if two else 10 / (1 + 1j*w*.01))
    return [dict(frequency_Hz=float(a), z_real_ohm=float(b.real), z_imag_ohm=float(b.imag)) for a,b in zip(f,z)]


class DrtTests(unittest.TestCase):
    def test_sign_headers_and_no_double_inversion(self):
        variants = [{"frequency": 10, "Re(Z)": 5, key: value} for key,value in
                    [("Im(Z)",-2), ("Z''",-2), ("-Im(Z)",2), ("-Z''",2)]]
        for row in variants:
            before = copy.deepcopy(row)
            points, quality = normalize_eis([row])
            self.assertEqual(points[0]["z_imag_ohm"], -2)
            self.assertEqual(points[0]["z_real_ohm"], 5)
            self.assertEqual(row, before)
        legacy = {"frequency_hz":10,"z_real_ohm":5,"z_imag_ohm":2,"_raw":{"-Im(Z)":2}}
        corrected = dict(legacy, z_imag_ohm=-2)
        self.assertEqual(normalize_eis([legacy])[0], normalize_eis([corrected])[0])

    def test_single_rc_peak_and_integral(self):
        result = fit_drt(spectrum(), {"includeL":False})
        self.assertAlmostEqual(result["metadata"]["Rs"], 3, delta=.15)
        self.assertEqual(result["metadata"]["L"], 0)
        self.assertEqual(result["metadata"]["variableCount"], 101)
        peak = max(result["drt"], key=lambda p:p["gamma_ohm"])
        self.assertLess(abs(np.log10(peak["tau_s"]/.01)), .15)
        self.assertAlmostEqual(result["totalResistance"], 10, delta=.5)
        self.assertLess(result["relative_complex_RMSE_percent"], 2)

    def test_two_rc_with_inductance(self):
        result = fit_drt(spectrum(two=True), {})
        self.assertAlmostEqual(result["metadata"]["Rs"], 3, delta=.15)
        self.assertAlmostEqual(result["metadata"]["L"], 1e-6, delta=1e-7)
        for tau, resistance in [(1e-4,5),(.1,15)]:
            peak = min(result["peaks"], key=lambda p:abs(np.log(p["tau_peak"]/tau)))
            self.assertLess(abs(np.log10(peak["tau_peak"]/tau)), .2)
            self.assertAlmostEqual(peak["R_region"], resistance, delta=1)
            self.assertRegex(peak["Peak"], r"^P\d+$")

    def test_ln_integral_interpolates_between_grid_points(self):
        # gamma(u)=2+u. Integral from u=.2 to 1.7 is 4.425.
        self.assertAlmostEqual(integrate_region(np.exp([0,1,2]), [2,3,4], np.exp(.2), np.exp(1.7)), 4.425)

    def test_invalid_rows_duplicates_and_order_preserved(self):
        rows = spectrum()[:8]
        rows += [dict(rows[0]),dict(rows[0],frequency_Hz=0),dict(rows[0],z_real_ohm=float('nan')),dict(rows[0],z_imag_ohm=float('inf'))]
        points, quality = normalize_eis(rows)
        self.assertEqual(len(points), 9)
        self.assertEqual(quality["excludedCount"], 3)
        self.assertEqual(quality["duplicateFrequencyCount"], 1)
        self.assertEqual(points[0]["frequency_Hz"], points[-1]["frequency_Hz"])

    def test_missing_frequency_and_zero_scale_fail(self):
        with self.assertRaisesRegex(ValueError, "frequency"):
            fit_drt([{"z_real_ohm":5,"z_imag_ohm":-2}], {})
        with self.assertRaisesRegex(ValueError, "Z0"):
            fit_drt([dict(r,z_real_ohm=0,z_imag_ohm=0) for r in spectrum()], {})

    def test_pure_resistance_and_exact_disabled_L(self):
        result = fit_drt(spectrum(pure=True), {"includeL":False})
        self.assertAlmostEqual(result["metadata"]["Rs"], 3, delta=.001)
        self.assertLess(result["totalResistance"], .001)
        self.assertEqual(result["metadata"]["L"], 0)

    def test_settings_limits_and_solver_failure(self):
        for settings in [{"M":10000},{"M":2},{"lambda":-1},{"lambda":float('nan')},{"includeL":"false"}]:
            with self.assertRaises(ValueError): fit_drt(spectrum(), settings)
        with patch("backend.analysis.eis_drt.lsq_linear", side_effect=RuntimeError("private error")):
            with self.assertRaisesRegex(ValueError,"converge"): fit_drt(spectrum(), {})

    def test_metadata_reconstruction_and_outside_band(self):
        result = fit_drt(spectrum(), {})
        meta = result["metadata"]
        self.assertEqual(meta["M"],100)
        self.assertTrue(meta["includeL"])
        self.assertEqual(meta["signConvention"],"Z = Re(Z) + i Im(Z)")
        self.assertEqual(len(result["reconstruction"]),161)
        self.assertTrue(result["drt"][0]["outsideBand"])
        self.assertTrue(result["drt"][-1]["outsideBand"])
        for row in result["reconstruction"]:
            self.assertAlmostEqual(row["residual_imag"],row["z_imag_fit_ohm"]-row["z_imag_raw_ohm"])

    def test_auto_corner_is_not_claimed_for_pure_resistance(self):
        result = fit_drt(spectrum(pure=True), {"mode":"auto"})
        self.assertFalse(result["metadata"]["autoSelectionReliable"])
        self.assertEqual(len(result["lCurve"]),41)
        self.assertTrue(any("NOT accepted" in w for w in result["warnings"]))
