"""DRT inverse-problem contracts on deterministic synthetic EIS only."""
import copy
import unittest

import numpy as np
from scipy.optimize import lsq_linear

from backend.analysis import eis_drt
from backend.analysis.eis_drt import fit_drt


def synthetic_two_rc(noise=False, scale=1.0):
    frequency = np.logspace(-2, 5, 81)
    omega = 2 * np.pi * frequency
    impedance = (3 + 5 / (1 + 1j * omega * 1e-4)
                 + 15 / (1 + 1j * omega * .1))
    if noise:
        generator = np.random.default_rng(2026)
        impedance += .004 * abs(impedance) * (
            generator.normal(size=frequency.size)
            + 1j * generator.normal(size=frequency.size))
    return [dict(frequency_Hz=float(frequency_hz),
                 z_real_ohm=float(value.real * scale),
                 z_imag_ohm=float(value.imag * scale))
            for frequency_hz, value in zip(frequency, impedance)]


def independent_tikhonov_system(rows, tau):
    """Specify the quadrature model and integrated squared second derivative.

    The normalized weighted objective is ||A x-b||^2 + lambda^2 ||D x||^2.
    x contains Rs/Z0 followed by gamma(ln tau)/Z0. No smoothing of the
    measured spectrum or the returned density is part of this contract.
    """
    frequency = np.array([row["frequency_Hz"] for row in rows])
    impedance = np.array([complex(row["z_real_ohm"], row["z_imag_ohm"])
                          for row in rows])
    scale = float(np.median(abs(impedance)))
    u = np.log(tau)
    step = float(u[1] - u[0])
    quadrature = np.full(len(tau), step)
    quadrature[[0, -1]] *= .5
    omega_tau = 2 * np.pi * frequency[:, None] * tau[None, :]
    kernel = quadrature[None, :] / (1 + 1j * omega_tau)
    model = np.column_stack((np.ones(frequency.size), kernel))
    weights = 1 / (abs(impedance) * np.sqrt(frequency.size))
    design = np.vstack((model.real * weights[:, None] * scale,
                        model.imag * weights[:, None] * scale))
    target = np.concatenate((impedance.real * weights,
                             impedance.imag * weights))
    derivative = np.zeros((len(tau) - 2, len(tau) + 1))
    derivative[:, 1:] = np.diff(np.eye(len(tau)), n=2, axis=0) / step ** 1.5
    return design, target, derivative, scale


def result_vector(result, scale):
    return np.array([result["metadata"]["Rs"] / scale]
                    + [row["gamma_ohm"] / scale for row in result["drt"]])


def noisy_diagonal_lcurve():
    """An ill-conditioned ridge problem with a known truth and fixed noise.

    This exercises the noise/signal L-knee, not the noise-free scalar shrinkage
    arc. Analytic derivatives independently determine Cartesian signed
    curvature in (log residual norm, log solution norm), increasing lambda.
    Its selected knee is not claimed to minimize the error to the truth.
    """
    singular = np.logspace(0, -8, 80)
    truth = np.exp(-np.arange(80) / 12)
    target = singular * truth + 1e-4 * np.random.default_rng(20261012).normal(size=80)
    coefficient = np.logspace(-10, 1, 161)
    a, p = singular[None, :] ** 2, coefficient[:, None] ** 2
    denominator, b2 = a + p, target[None, :] ** 2
    solution = singular[None, :] * target[None, :] / denominator
    rho = np.sum(b2 * p ** 2 / denominator ** 2, axis=1)
    rho_first = np.sum(4 * b2 * a * p ** 2 / denominator ** 3, axis=1)
    rho_second = np.sum(8 * b2 * a * p ** 2 * (2 * a - p) / denominator ** 4, axis=1)
    eta = np.sum(a * b2 / denominator ** 2, axis=1)
    eta_first = np.sum(-4 * a * b2 * p / denominator ** 3, axis=1)
    eta_second = np.sum(-8 * a * b2 * p * (a - 2 * p) / denominator ** 4, axis=1)
    dx, dy = .5 * rho_first / rho, .5 * eta_first / eta
    dxx = .5 * (rho_second / rho - (rho_first / rho) ** 2)
    dyy = .5 * (eta_second / eta - (eta_first / eta) ** 2)
    curvature = (dx * dyy - dy * dxx) / (dx * dx + dy * dy) ** 1.5
    error = np.linalg.norm(solution - truth[None, :], axis=1) / np.linalg.norm(truth)
    curve = [{"lambda": float(value), "residualNorm": float(np.sqrt(residual) / np.linalg.norm(target)),
              "roughnessNorm": float(np.sqrt(roughness))}
             for value, residual, roughness in zip(coefficient, rho, eta)]
    return curve, curvature, error


class DrtRegularizationTests(unittest.TestCase):
    def select_corner(self, curve, **settings):
        selector = getattr(eis_drt, "select_lcurve", None)
        self.assertTrue(callable(selector), "Expose reproducible L-curve selection")
        return selector(curve, **settings)

    def scalar_lcurve(self):
        # min (x-1)^2 + lambda^2*x^2 gives x=1/(1+lambda^2).
        # This noise-free concave shrinkage arc is not the noisy inverse-
        # problem L-knee, despite its large absolute curvature near lambda=1.
        return [{"lambda": float(value),
                 "residualNorm": float(value ** 2 / (1 + value ** 2)),
                 "roughnessNorm": float(1 / (1 + value ** 2))}
                for value in np.logspace(-3, 3, 61)]

    def test_noisy_inverse_lcurve_selects_a_positive_curvature_knee(self):
        curve, signed_curvature, error = noisy_diagonal_lcurve()
        selected = self.select_corner(curve)
        self.assertTrue(selected["reliable"])
        self.assertIsInstance(selected["index"], int)
        self.assertGreater(signed_curvature[selected["index"]], 0)
        self.assertLess(error[selected["index"]], .5)
        self.assertEqual(len(selected["curvature"]), len(curve))

    def test_noise_free_concave_scalar_arc_is_not_accepted_as_an_l_knee(self):
        selected = self.select_corner(self.scalar_lcurve(), fit_error_limit=1.0)
        self.assertFalse(selected["reliable"])
        self.assertIsNone(selected["index"])

    def test_lcurve_corner_is_independent_of_input_lambda_order(self):
        ordered, _, _ = noisy_diagonal_lcurve()
        reversed_curve = list(reversed(ordered))
        shuffled = ordered[::2] + ordered[1::2]
        original = copy.deepcopy(shuffled)
        values = []
        for curve in (ordered, reversed_curve, shuffled):
            selected = self.select_corner(curve)
            self.assertTrue(selected["reliable"])
            values.append(curve[selected["index"]]["lambda"])
        self.assertEqual(values, [values[0]] * 3)
        self.assertEqual(shuffled, original)

    def test_flat_lcurve_does_not_claim_an_automatic_corner(self):
        curve = [{"lambda": float(value), "residualNorm": .01,
                  "roughnessNorm": .2} for value in np.logspace(-6, 1, 41)]
        selected = self.select_corner(curve)
        self.assertFalse(selected["reliable"])
        self.assertIsNone(selected["index"])
        self.assertIsInstance(selected["reason"], str)
        self.assertTrue(selected["reason"])

    def test_default_numerical_fit_guard_does_not_accept_a_high_error_corner(self):
        curve = self.scalar_lcurve()
        selected = self.select_corner(curve)
        if selected["reliable"]:
            self.assertLessEqual(curve[selected["index"]]["residualNorm"], .05)
        else:
            self.assertIsNone(selected["index"])
        # The guard is not a general proof of physical model validity.

    def test_manual_lambda_retains_the_hansen_squared_coefficient_convention(self):
        rows = synthetic_two_rc()
        coefficient = .001
        result = fit_drt(rows, {"M": 60, "includeL": False,
                                "mode": "manual", "lambda": coefficient})
        tau = np.array([row["tau_s"] for row in result["drt"]])
        design, target, derivative, scale = independent_tikhonov_system(rows, tau)
        reference = lsq_linear(
            np.vstack((design, coefficient * derivative)),
            np.concatenate((target, np.zeros(len(tau) - 2))),
            bounds=(0, np.inf), method="bvls", tol=1e-10, max_iter=400)
        self.assertTrue(reference.success)

        def objective(vector):
            return (np.linalg.norm(design @ vector - target) ** 2
                    + coefficient ** 2 * np.linalg.norm(derivative @ vector) ** 2)

        # Check the public solution, not the solver's internal call sequence.
        self.assertLessEqual(objective(result_vector(result, scale)),
                             objective(reference.x) * (1 + 1e-6) + 1e-12)
        self.assertEqual(result["metadata"]["lambda"], coefficient)
        self.assertEqual(result["metadata"]["regularizationConvention"], "lambda_squared")
        self.assertEqual(result["metadata"]["regularizationPenalty"], coefficient ** 2)

    def test_increasing_manual_lambda_reduces_density_roughness(self):
        rows = synthetic_two_rc()
        roughness = []
        for coefficient in (.0001, .001, .01):
            result = fit_drt(rows, {"M": 60, "includeL": False,
                                    "mode": "manual", "lambda": coefficient})
            tau = np.array([row["tau_s"] for row in result["drt"]])
            _, _, derivative, scale = independent_tikhonov_system(rows, tau)
            roughness.append(np.linalg.norm(derivative @ result_vector(result, scale)))
        self.assertTrue(all(right < left for left, right in zip(roughness, roughness[1:])))

    def test_manual_reconstruction_and_integral_are_consistent_across_log_grids(self):
        rows = synthetic_two_rc()
        results = [fit_drt(rows, {"M": size, "includeL": False,
                                  "mode": "manual", "lambda": .003})
                   for size in (60, 100, 160)]
        integrals = [result["totalResistance"] for result in results]
        self.assertLess((max(integrals) - min(integrals)) / np.mean(integrals), .1)
        fitted = [np.array([complex(row["z_real_fit_ohm"], row["z_imag_fit_ohm"])
                            for row in result["reconstruction"]])
                  for result in results]
        for impedance in fitted[1:]:
            self.assertLess(np.linalg.norm(impedance - fitted[0])
                            / np.linalg.norm(fitted[0]), .05)

    def test_noisy_nonnegative_fit_does_not_fail_on_solver_roundoff(self):
        rows = synthetic_two_rc(noise=True)
        original = copy.deepcopy(rows)
        for size in (60, 100, 160):
            with self.subTest(M=size):
                result = fit_drt(rows, {"M": size, "includeL": False, "mode": "auto"})
                gamma = np.array([row["gamma_ohm"] for row in result["drt"]])
                self.assertTrue(np.all(np.isfinite(gamma)))
                self.assertTrue(np.all(gamma >= 0))
                self.assertLess(result["relative_complex_RMSE_percent"], 5)
        self.assertEqual(rows, original)

    def test_auto_selection_and_dimensionless_shape_are_scale_invariant(self):
        normal = fit_drt(synthetic_two_rc(noise=True),
                         {"M": 100, "includeL": False, "mode": "auto"})
        large = fit_drt(synthetic_two_rc(noise=True, scale=1000),
                        {"M": 100, "includeL": False, "mode": "auto"})
        self.assertEqual(normal["metadata"]["autoSelectionReliable"],
                         large["metadata"]["autoSelectionReliable"])
        self.assertAlmostEqual(normal["metadata"]["lambda"], large["metadata"]["lambda"])
        self.assertAlmostEqual(normal["relative_complex_RMSE_percent"],
                               large["relative_complex_RMSE_percent"], places=8)
        self.assertAlmostEqual(normal["totalResistance"], large["totalResistance"] / 1000,
                               places=7)
        np.testing.assert_allclose(
            [row["gamma_ohm"] for row in normal["drt"]],
            [row["gamma_ohm"] / 1000 for row in large["drt"]], rtol=1e-7, atol=1e-7)


if __name__ == "__main__":
    unittest.main()
