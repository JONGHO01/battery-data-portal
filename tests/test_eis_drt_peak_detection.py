"""Conservative DRT peak contracts on synthetic densities, never laboratory data."""
import unittest

import numpy as np

from backend.analysis import eis_drt


class ConservativeDrtPeakTests(unittest.TestCase):
    def detect(self, tau, gamma, **settings):
        self.assertTrue(callable(getattr(eis_drt, "peak_regions", None)),
                        "Expose conservative peak_regions for fitted DRT densities")
        return eis_drt.peak_regions(tau, gamma, **settings)

    def test_broad_peaks_survive_tiny_ripples_and_single_sample_spikes(self):
        log_tau = np.linspace(-5, 3, 801)
        tau = 10.0 ** log_tau
        gamma = (10 * np.exp(-((log_tau + 3) / .22) ** 2)
                 + 7 * np.exp(-((log_tau - .5) / .28) ** 2)
                 + .3 * np.exp(-((log_tau - 2) / .1) ** 2)
                 + .01 * (1 + np.sin(np.arange(tau.size) * 1.7)))
        gamma[350] += 3
        peaks = self.detect(tau, gamma)
        self.assertEqual(len(peaks), 2)
        np.testing.assert_allclose(np.log10([p["tau_peak"] for p in peaks]),
                                   [-3, .5], atol=.02)

    def test_five_percent_prominence_includes_threshold_but_rejects_smaller_peak(self):
        tau = 10.0 ** np.linspace(-3, 3, 181)
        indices = np.arange(tau.size)
        gamma = sum(height * np.maximum(1 - abs(indices - center) / 8, 0)
                    for center, height in [(30, 10), (90, .5), (150, .49)])
        peaks = self.detect(tau, gamma)
        self.assertEqual([p["tau_peak"] for p in peaks], [tau[30], tau[90]])

    def test_explicit_sample_width_uses_two_and_half_samples(self):
        tau = 10.0 ** np.linspace(-3, 3, 121)
        gamma = np.zeros(tau.size)
        gamma[18:23] = [0, 5, 10, 5, 0]  # FWHM = 2 samples: reject.
        gamma[57:64] = [0, 3, 6, 9, 6, 3, 0]  # FWHM = 3 samples: retain.
        peaks = self.detect(tau, gamma, min_width=2.5)
        self.assertEqual([p["tau_peak"] for p in peaks], [tau[60]])

    def test_close_peaks_are_suppressed_by_prominence_instead_of_height(self):
        tau = 10.0 ** (np.arange(111) / 100 - 3)
        gamma = np.interp(np.arange(tau.size),
                          [0, 20, 30, 40, 50, 55, 90, 110],
                          [0, 0, 8, 0, 10, 9, 12, 0])
        # At 30 prominence=8; at 50 height=10 but prominence=1.
        # Their separation is .20 decades, below the .25-decade default.
        peaks = self.detect(tau, gamma, min_width=2.5)
        self.assertEqual([p["tau_peak"] for p in peaks], [tau[30], tau[90]])
        separated = self.detect(tau, gamma, min_width=2.5, min_distance_decades=.15)
        self.assertEqual([p["tau_peak"] for p in separated],
                         [tau[30], tau[50], tau[90]])

    def test_distance_is_measured_in_decades_independent_of_grid_density(self):
        for size in (401, 801):
            with self.subTest(size=size):
                log_tau = np.linspace(-2, 2, size)
                gamma = (8 * np.exp(-((log_tau + .6) / .025) ** 2)
                         + 4 * np.exp(-((log_tau + .4) / .025) ** 2)
                         + 6 * np.exp(-((log_tau - .4) / .025) ** 2))
                # Isolate physical distance from the separate width criterion.
                peaks = self.detect(10.0 ** log_tau, gamma, min_width=0)
                np.testing.assert_allclose(np.log10([p["tau_peak"] for p in peaks]),
                                           [-.6, .4], atol=1e-12)

    def test_increasing_prominence_threshold_only_removes_candidates(self):
        log_tau = np.linspace(-4, 4, 801)
        gamma = sum(height * np.exp(-((log_tau - center) / .15) ** 2)
                    for center, height in [(-3, 10), (-1, 2), (1, .7), (3, .3)])
        selected = [{p["tau_peak"] for p in self.detect(
            10.0 ** log_tau, gamma, prominence_fraction=fraction)}
            for fraction in (.02, .05, .1, .3)]
        self.assertEqual([len(indices) for indices in selected], [4, 3, 2, 1])
        for less_strict, stricter in zip(selected, selected[1:]):
            self.assertTrue(stricter.issubset(less_strict))

    def test_flat_zero_monotonic_and_endpoint_only_densities_have_no_peaks(self):
        tau = np.logspace(-4, 1, 101)
        for gamma in (np.zeros(101), np.ones(101), np.arange(101, dtype=float),
                      np.arange(101, dtype=float)[::-1]):
            with self.subTest(first=gamma[0], last=gamma[-1]):
                self.assertEqual(self.detect(tau, gamma), [])

    def test_inputs_and_raw_peak_locations_are_preserved_and_results_repeat(self):
        tau = np.logspace(-3, 2, 101)
        gamma = np.interp(np.arange(101), [0, 20, 23, 29, 60, 70, 78, 100],
                          [0, 2, 10, 0, 0, 8, 0, 0])
        original_tau, original_gamma = tau.copy(), gamma.copy()
        tau.setflags(write=False)
        gamma.setflags(write=False)
        first = self.detect(tau, gamma)
        self.assertEqual([p["tau_peak"] for p in first], [tau[23], tau[70]])
        self.assertEqual([p["Peak"] for p in first], ["P1", "P2"])
        self.assertEqual(self.detect(tau, gamma), first)
        np.testing.assert_array_equal(tau, original_tau)
        np.testing.assert_array_equal(gamma, original_gamma)

    def test_region_boundaries_use_neighboring_minima_and_original_ln_tau_integral(self):
        tau = np.exp(np.linspace(-6, 4, 101))
        gamma = np.interp(np.arange(101), [0, 25, 47, 75, 100], [1, 10, 2, 8, 1])
        peaks = self.detect(tau, gamma)
        self.assertEqual(len(peaks), 2)
        self.assertEqual(peaks[0]["tau_a"], tau[0])
        self.assertEqual(peaks[0]["tau_b"], tau[47])
        self.assertEqual(peaks[1]["tau_a"], tau[47])
        self.assertEqual(peaks[1]["tau_b"], tau[-1])
        for peak, start, stop in zip(peaks, [0, 47], [47, 100]):
            expected = float(np.trapezoid(gamma[start:stop + 1], np.log(tau[start:stop + 1])))
            self.assertAlmostEqual(peak["R_region"], expected, places=12)
            self.assertAlmostEqual(peak["f_peak"], 1 / (2 * np.pi * peak["tau_peak"]))
        self.assertAlmostEqual(sum(p["R_region"] for p in peaks),
                               float(np.trapezoid(gamma, np.log(tau))), places=12)


if __name__ == "__main__":
    unittest.main()
