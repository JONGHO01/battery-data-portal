"""Synthetic regressions for physical peak widths and measured-band scaling."""
import copy
from types import SimpleNamespace
import unittest
from unittest.mock import patch

import numpy as np

from backend.analysis import eis_drt


class DrtPeakStabilityTests(unittest.TestCase):
    def test_default_physical_width_preserves_smooth_peaks_at_60_100_160_points(self):
        for size in (60, 100, 160):
            with self.subTest(size=size):
                log_tau = np.linspace(-5, 3, size)
                gamma = (5 * np.exp(-((log_tau + 3) / .18) ** 2)
                         + 3 * np.exp(-((log_tau + .5) / .18) ** 2))
                peaks = eis_drt.peak_regions(10.0 ** log_tau, gamma)
                self.assertEqual(len(peaks), 2)
                locations = sorted(np.log10(p["tau_peak"]) for p in peaks)
                np.testing.assert_allclose(locations, [-3, -.5],
                                           atol=(log_tau[1] - log_tau[0]) / 2)

    def test_default_width_rejects_physically_narrow_peak_on_dense_grid(self):
        log_tau = np.linspace(-3, 3, 601)
        # FWHM is about .15 decades, although the peak spans 15 samples.
        gamma = np.exp(-((log_tau + 1) / .09) ** 2)
        self.assertEqual(eis_drt.peak_regions(10.0 ** log_tau, gamma), [])

    def test_explicit_sample_width_remains_a_legacy_override(self):
        tau = np.logspace(-3, 3, 121)
        gamma = np.zeros(tau.size)
        gamma[18:23] = [0, 5, 10, 5, 0]
        gamma[57:64] = [0, 3, 6, 9, 6, 3, 0]
        peaks = eis_drt.peak_regions(tau, gamma, min_width=2.5)
        self.assertEqual([p["tau_peak"] for p in peaks], [tau[60]])

    def test_large_extrapolated_tail_does_not_hide_measured_band_peak(self):
        log_tau = np.linspace(-5, 3, 161)
        tau = 10.0 ** log_tau
        inside = np.exp(-((log_tau + 2) / .2) ** 2)
        band = [1e-4, 1]
        for amplitude in (0, 100, 10000):
            with self.subTest(tail_amplitude=amplitude):
                gamma = inside + amplitude * np.maximum(log_tau - 1, 0) ** 2
                peaks = eis_drt.peak_regions(tau, gamma, measured_band=band)
                in_band = [p for p in peaks if band[0] <= p["tau_peak"] <= band[1]]
                self.assertEqual(len(in_band), 1)
                self.assertAlmostEqual(np.log10(in_band[0]["tau_peak"]), -2)

    def test_measured_band_none_uses_full_density_reference(self):
        log_tau = np.linspace(-5, 3, 161)
        tau = 10.0 ** log_tau
        gamma = (np.exp(-((log_tau + 2) / .2) ** 2)
                 + 100 * np.maximum(log_tau - 1, 0) ** 2)
        # With no measured band there is no basis for excluding the tail
        # from the reference amplitude; preserve the global-threshold behavior.
        self.assertEqual(eis_drt.peak_regions(tau, gamma), [])
        self.assertEqual(eis_drt.peak_regions(tau, gamma, measured_band=None), [])

    def test_outside_candidates_and_original_integrals_are_not_deleted_or_clipped(self):
        log_tau = np.linspace(-8, 3, 1101)
        tau = 10.0 ** log_tau
        centers = list(range(-6, 1))
        gamma = sum((1 + i / 10) * np.exp(-((log_tau - center) / .18) ** 2)
                    for i, center in enumerate(centers))
        gamma += 100 * np.exp(-((log_tau - 2) / .18) ** 2)
        original_tau, original_gamma = tau.copy(), gamma.copy()
        tau.setflags(write=False)
        gamma.setflags(write=False)
        band = [1e-7, 10]
        peaks = eis_drt.peak_regions(tau, gamma, measured_band=band)
        classified = eis_drt.classify_peak_regions(peaks, band)
        self.assertEqual(len(classified), 8)
        self.assertEqual(sum(p["major"] for p in classified), 5)
        self.assertEqual(sum(p["interpretationEligible"] for p in classified), 7)
        outside = [p for p in classified if not p["interpretationEligible"]]
        self.assertEqual(len(outside), 1)
        self.assertFalse(outside[0]["major"])
        self.assertAlmostEqual(np.log10(outside[0]["tau_peak"]), 2)
        for peak in classified:
            a, b = np.log(peak["tau_a"]), np.log(peak["tau_b"])
            u = np.log(tau)
            grid = np.concatenate(([a], u[(u > a) & (u < b)], [b]))
            expected = float(np.trapezoid(np.interp(grid, u, original_gamma), grid))
            self.assertAlmostEqual(peak["R_region"], expected, places=12)
        np.testing.assert_array_equal(tau, original_tau)
        np.testing.assert_array_equal(gamma, original_gamma)
        self.assertEqual(eis_drt.peak_regions(tau, gamma, measured_band=band), peaks)

    def test_fit_uses_measured_band_and_reports_converted_physical_width(self):
        frequencies = np.logspace(-3, 5, 31)
        rows = [dict(frequency_Hz=float(f), z_real_ohm=1, z_imag_ohm=0)
                for f in frequencies]
        before = copy.deepcopy(rows)
        for size in (60, 100, 160):
            with self.subTest(size=size):
                tau = np.exp(np.linspace(np.log(.1 / (2 * np.pi * frequencies.max())),
                                         np.log(10 / (2 * np.pi * frequencies.min())), size))
                log_tau = np.log10(tau)
                upper_band = np.log10(1 / (2 * np.pi * frequencies.min()))
                gamma = (np.exp(-((log_tau + 2) / .2) ** 2)
                         + 10000 * np.maximum(log_tau - upper_band - .1, 0) ** 2)
                solution = SimpleNamespace(success=True, x=np.concatenate(([1.0], gamma)))
                # Isolate detector wiring from inverse-solver discretization:
                # the complete known density is returned by the solver boundary.
                with patch.object(eis_drt, "lsq_linear", return_value=solution):
                    result = eis_drt.fit_drt(rows, {"M": size, "includeL": False})
                eligible = [p for p in result["peaks"] if p["interpretationEligible"]]
                self.assertEqual(len(eligible), 1)
                self.assertLessEqual(abs(np.log10(eligible[0]["tau_peak"]) + 2),
                                     (log_tau[1] - log_tau[0]) / 2)
                detection = result["metadata"]["peakDetection"]
                self.assertAlmostEqual(detection["minWidthDecades"], .2)
                self.assertAlmostEqual(detection["minWidthSamples"],
                                       .2 / (log_tau[1] - log_tau[0]))
                self.assertFalse(detection["smoothing"])
                np.testing.assert_array_equal([p["gamma_ohm"] for p in result["drt"]], gamma)
                self.assertEqual(rows, before)


if __name__ == "__main__":
    unittest.main()
