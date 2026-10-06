"""Interpretation safeguards do not modify fitted densities or measurement rows."""
import copy
import unittest
from unittest.mock import patch

import numpy as np

from backend.analysis import eis_drt
from tests.test_eis_drt import spectrum


class DrtQualityTests(unittest.TestCase):
    def test_high_error_flat_lcurve_reports_the_model_fit_problem_first(self):
        curve = [{"lambda": float(value), "residual": .2, "roughness": .1}
                 for value in np.logspace(-6, 1, 41)]
        selection = eis_drt.select_lcurve(curve)
        self.assertFalse(selection["reliable"])
        self.assertEqual(selection["reason"], "poor_model_fit")

    def test_outside_band_peaks_are_retained_but_not_major_interpretations(self):
        peaks = [dict(Peak=f"P{i+1}", tau_peak=tau, tau_a=tau/2,
                      tau_b=tau*2, prominence=height, R_region=height*3)
                 for i, (tau, height) in enumerate([(1e-7, 100), (.001, 10), (.1, 8), (10, 90)])]
        before = copy.deepcopy(peaks)
        classified = eis_drt.classify_peak_regions(peaks, [1e-5, 1])
        self.assertEqual(peaks, before)
        self.assertEqual([p["Peak"] for p in classified if p["major"]], ["P2", "P3"])
        self.assertEqual([p["interpretationEligible"] for p in classified], [False, True, True, False])
        self.assertEqual([p["R_region"] for p in classified], [p["R_region"] for p in peaks])

    def test_in_band_peak_integral_can_still_depend_on_extrapolated_boundary(self):
        peak = dict(Peak="P1", tau_peak=.01, tau_a=1e-8, tau_b=.1,
                    prominence=3, R_region=7)
        result = eis_drt.classify_peak_regions([peak], [1e-5, 1])[0]
        self.assertTrue(result["interpretationEligible"])
        self.assertTrue(result["regionOutsideMeasuredBand"])
        self.assertEqual(result["R_region"], 7)

    def test_material_negative_solver_violation_is_not_silently_clipped(self):
        class InvalidSolution:
            success = True
            x = np.zeros(101)
        InvalidSolution.x[3] = -.1
        with patch.object(eis_drt, "lsq_linear", return_value=InvalidSolution()):
            with self.assertRaisesRegex(ValueError, "nonnegative"):
                eis_drt.fit_drt(spectrum(), {"includeL": False})

    def test_high_error_result_is_computed_but_not_physically_validated(self):
        rows = [dict(frequency=frequency, zreal=5, zimag=10)
                for frequency in np.logspace(-2, 4, 61)]
        result = eis_drt.fit_drt(rows, {"includeL": False})
        self.assertEqual(result["status"], "ok")
        self.assertGreater(result["relative_complex_RMSE_percent"], 5)
        self.assertEqual(result["metadata"]["fitQuality"], "poor_fit")
        self.assertIs(result["metadata"]["physicalValidationPerformed"], False)
        self.assertEqual(len(result["reconstruction"]), len(rows))


if __name__ == "__main__":
    unittest.main()
