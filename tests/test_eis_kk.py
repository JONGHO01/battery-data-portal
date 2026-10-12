"""Bounded Lin-KK diagnostics on synthetic spectra, never real experiments."""
import unittest
from unittest.mock import patch

import numpy as np

from backend.analysis import eis_kk


def synthetic_spectrum(noise=False):
    f = np.logspace(-2, 5, 81)
    w = 2 * np.pi * f
    z = (3 + 5 / (1 + 1j * w * 1e-4) + 15 / (1 + 1j * w * .1)
         + 1j * w * 1e-6 + 1 / (1j * w * 10))
    if noise:
        rng = np.random.default_rng(2026)
        z += .004 * abs(z) * (rng.normal(size=len(f)) + 1j * rng.normal(size=len(f)))
    return f, z


class LinKkTests(unittest.TestCase):
    def assert_not_physical_validation(self, result):
        for field in ("physicalValidationPerformed", "linearityValidated", "stationarityValidated"):
            self.assertIs(result[field], False)
        for field in ("passed", "KKpassed", "valid", "physicsSuccess"):
            self.assertNotIn(field, result)

    def test_clean_rc_with_series_l_and_c_has_numeric_residual_not_a_pass(self):
        f, z = synthetic_spectrum()
        result = eis_kk.lin_kk_diagnostic(f, z)
        self.assertEqual(result["method"], "linear-kk-complex-v1")
        self.assertLess(result["relativeComplexRMSEPercent"], 5)
        self.assertTrue(result["includeSeriesCapacitance"])
        self.assertEqual(len(result["residuals"]), len(f))
        self.assertEqual(len(result["orderCurve"]), 28)
        self.assert_not_physical_validation(result)

    def test_numeric_residuals_preserve_order_and_inputs_without_mutation(self):
        f, z = synthetic_spectrum(noise=True)
        before_f, before_z = f.copy(), z.copy()
        f.flags.writeable = z.flags.writeable = False
        reference = eis_kk.lin_kk_diagnostic(f, z)
        self.assertIsNotNone(reference["modelOrder"])
        self.assertEqual(len(reference["residuals"]), len(f))
        permutation = np.random.default_rng(9).permutation(len(f))
        permuted = eis_kk.lin_kk_diagnostic(f[permutation], z[permutation])
        self.assertEqual(reference["modelOrder"], permuted["modelOrder"])
        self.assertAlmostEqual(reference["relativeComplexRMSEPercent"], permuted["relativeComplexRMSEPercent"], places=8)
        for new, old_index in zip(permuted["residuals"], permutation):
            self.assertEqual(new["frequency_Hz"], float(f[old_index]))
            self.assertAlmostEqual(new["relativeReal"], reference["residuals"][old_index]["relativeReal"], places=8)
            self.assertAlmostEqual(new["relativeImag"], reference["residuals"][old_index]["relativeImag"], places=8)
        np.testing.assert_array_equal(f, before_f)
        np.testing.assert_array_equal(z, before_z)

    def test_scale_does_not_change_dimensionless_diagnostic(self):
        f, z = synthetic_spectrum(noise=True)
        normal = eis_kk.lin_kk_diagnostic(f, z)
        large = eis_kk.lin_kk_diagnostic(f, z * 1000)
        self.assertIsNotNone(normal["relativeComplexRMSEPercent"])
        self.assertEqual(normal["modelOrder"], large["modelOrder"])
        self.assertEqual(normal["selectionReliable"], large["selectionReliable"])
        self.assertAlmostEqual(normal["relativeComplexRMSEPercent"], large["relativeComplexRMSEPercent"], places=7)
        self.assert_not_physical_validation(large)

    def test_invalid_inputs_return_explicit_inconclusive_without_numbers(self):
        f, z = synthetic_spectrum()
        cases = [(f[:7], z[:7], "insufficient_distinct_frequencies"),
                 (np.r_[f[:-1], f[0]], z, "duplicate_frequency"),
                 (f, np.r_[0j, z[1:]], "zero_impedance"),
                 (f, np.r_[complex(np.inf, 1), z[1:]], "nonfinite_input"),
                 (np.r_[-1, f[1:]], z, "nonpositive_frequency"),
                 (np.logspace(0, .9, len(f)), z, "narrow_frequency_span"),
                 (f[:, None], z, "invalid_shape"),
                 (f, z[:-1], "invalid_shape"),
                 (None, z, "invalid_input"),
                 (f.astype(str), z, "invalid_input"),
                 (np.logspace(-2, 5, 2001), np.full(2001, 3j), "too_many_points")]
        for frequency, impedance, reason in cases:
            with self.subTest(reason=reason):
                result = eis_kk.lin_kk_diagnostic(frequency, impedance)
                self.assertEqual(result["status"], "inconclusive")
                self.assertEqual(result["reason"], reason)
                self.assertFalse(result["selectionReliable"])
                self.assertIsNone(result["relativeComplexRMSEPercent"])
                self.assertEqual(result["residuals"], [])
                self.assert_not_physical_validation(result)

    def test_pure_resistance_has_no_resolved_rc_density_not_success(self):
        f = np.logspace(-2, 5, 81)
        result = eis_kk.lin_kk_diagnostic(f, np.full(len(f), 3 + 0j))
        self.assertEqual(result["status"], "inconclusive")
        self.assertEqual(result["reason"], "no_resolved_rc_density")
        self.assertFalse(result["selectionReliable"])
        self.assertLess(result["relativeComplexRMSEPercent"], 1e-8)
        self.assertIsNone(result["mu"])
        self.assert_not_physical_validation(result)

    def test_fixed_order_matches_exact_signed_rc_l_c_truth(self):
        f = np.logspace(-2, 5, 81)
        w = 2 * np.pi * f
        tau = np.logspace(np.log10(1 / w.max()), np.log10(1 / w.min()), 9)
        resistances = np.array([1, 2, -.5, 3, 4, 2, 1, 2, 1.])
        z = (3 + np.sum(resistances[None, :] / (1 + 1j * w[:, None] * tau), axis=1)
             + 1j * w * 1e-6 + 1 / (1j * w * 10))
        fit = eis_kk._fit_order(f, z, 9)
        np.testing.assert_allclose(fit["fitted"], z, rtol=1e-9, atol=1e-10)
        self.assertAlmostEqual(fit["mu"], 1 - .5 / 16, places=8)
        np.testing.assert_allclose(fit["residual"], (z - fit["fitted"]) / abs(z), atol=1e-12)

    def test_first_bad_mu_crossing_does_not_stop_clean_rc_reconstruction(self):
        f = np.logspace(-2, 5, 81)
        w = 2 * np.pi * f
        result = eis_kk.lin_kk_diagnostic(f, 3 + 10 / (1 + 1j * w * .01))
        self.assertLess(result["relativeComplexRMSEPercent"], 5)
        self.assertEqual(len(result["orderCurve"]), 28)
        # The small-order crossing is an underfitting artefact, not validation.
        bad = result["orderCurve"][1]
        self.assertLess(bad["mu"], .85)
        self.assertGreater(bad["rmse"], 5)
        self.assertGreater(result["modelOrder"], bad["order"])
        self.assert_not_physical_validation(result)

    def test_high_error_input_is_inconclusive_even_if_mu_crosses(self):
        f = np.logspace(-2, 5, 81)
        result = eis_kk.lin_kk_diagnostic(f, 3 + 1j * np.sin(9 * np.log(f)))
        self.assertGreater(result["relativeComplexRMSEPercent"], 5)
        self.assertEqual(result["status"], "inconclusive")
        self.assertFalse(result["selectionReliable"])
        self.assert_not_physical_validation(result)

    def test_time_budget_and_rank_failure_do_not_raise_or_claim_selection(self):
        f, z = synthetic_spectrum()
        with patch.object(eis_kk.time, "monotonic", side_effect=[0, 6]):
            result = eis_kk.lin_kk_diagnostic(f, z)
        self.assertEqual(result["reason"], "time_budget")
        self.assertFalse(result["selectionReliable"])
        with patch.object(eis_kk.np.linalg, "lstsq", side_effect=np.linalg.LinAlgError("private solver details")):
            result = eis_kk.lin_kk_diagnostic(f, z)
        self.assertEqual(result["reason"], "solver_failure")
        self.assertFalse(result["selectionReliable"])
        self.assertNotIn("private", str(result))

    def test_unresolved_order_limit_keeps_numbers_without_a_pass(self):
        f, z = synthetic_spectrum()
        with patch.object(eis_kk, "MU_CUTOFF", -1e6):
            result = eis_kk.lin_kk_diagnostic(f, z)
        self.assertEqual(result["reason"], "order_limit")
        self.assertEqual(result["status"], "inconclusive")
        self.assertFalse(result["selectionReliable"])
        self.assertIsNotNone(result["relativeComplexRMSEPercent"])
        self.assertEqual(len(result["residuals"]), len(f))
        self.assert_not_physical_validation(result)

    def test_partial_time_budget_retains_numbers_but_not_model_order_confidence(self):
        f, z = synthetic_spectrum()
        with patch.object(eis_kk.time, "monotonic", side_effect=[0, 0, 6]):
            result = eis_kk.lin_kk_diagnostic(f, z)
        self.assertEqual(result["reason"], "time_budget")
        self.assertEqual(result["status"], "inconclusive")
        self.assertFalse(result["selectionReliable"])
        self.assertEqual(len(result["orderCurve"]), 1)
        self.assertEqual(len(result["residuals"]), len(f))
        self.assert_not_physical_validation(result)

    def test_rank_and_condition_guards_do_not_expose_unstable_coefficients(self):
        f, z = synthetic_spectrum()
        def bad_rank(design, target, **kwargs):
            columns = design.shape[1]
            return np.zeros(columns), np.empty(0), columns - 1, np.ones(columns)
        def bad_condition(design, target, **kwargs):
            columns = design.shape[1]
            singular = np.ones(columns)
            singular[-1] = 1e-14
            return np.zeros(columns), np.empty(0), columns, singular
        for solver, reason in ((bad_rank, "rank_deficient"), (bad_condition, "ill_conditioned")):
            with self.subTest(reason=reason), patch.object(eis_kk.np.linalg, "lstsq", side_effect=solver):
                result = eis_kk.lin_kk_diagnostic(f, z)
            self.assertEqual(result["reason"], reason)
            self.assertFalse(result["selectionReliable"])
            self.assertEqual(result["residuals"], [])
            self.assertIsNone(result["mu"])
            self.assert_not_physical_validation(result)

    def test_boolean_and_extreme_ranges_are_safe_inconclusive_inputs(self):
        f, z = synthetic_spectrum()
        for frequency, impedance in ((np.full(len(f), True), z),
                                     (f.astype(complex), z), (f * 1e200, z),
                                     (f, z * 1e101)):
            with self.subTest():
                result = eis_kk.lin_kk_diagnostic(frequency, impedance)
                self.assertEqual(result["status"], "inconclusive")
                self.assertFalse(result["selectionReliable"])
                self.assertEqual(result["residuals"], [])
                self.assert_not_physical_validation(result)

    def test_reported_error_metrics_match_original_order_residuals(self):
        f, z = synthetic_spectrum(noise=True)
        result = eis_kk.lin_kk_diagnostic(f, z)
        residuals = np.array([complex(row["relativeReal"], row["relativeImag"])
                              for row in result["residuals"]])
        self.assertAlmostEqual(result["relativeComplexRMSEPercent"],
                               100 * np.sqrt(np.mean(abs(residuals)**2)), places=10)
        self.assertAlmostEqual(result["maxRelativeResidualPercent"],
                               100 * np.max(abs(residuals)), places=10)
        selected = next(row for row in result["orderCurve"] if row["order"] == result["modelOrder"])
        self.assertEqual(selected["rmse"], result["relativeComplexRMSEPercent"])
        self.assertEqual(result["residualConvention"], "(measured-model)/abs(measured)")


if __name__ == "__main__":
    unittest.main()
