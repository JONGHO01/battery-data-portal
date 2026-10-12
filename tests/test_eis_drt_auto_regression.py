"""Known-density noisy Cole-Cole counterexample; no laboratory data or I/O."""
import copy
import unittest

import numpy as np

from backend.analysis.eis_drt import fit_drt


PROCESSES = ((8.0, .001, .8), (30.0, .2, .7))


def cole_cole_density(tau):
    """Analytic density for R/[1+(j*omega*tau0)^alpha], in d(ln tau)."""
    tau = np.asarray(tau, dtype=float)
    return sum(resistance * np.sin(np.pi * exponent)
               / (2 * np.pi * (np.cosh(exponent * np.log(tau / center))
                               + np.cos(np.pi * exponent)))
               for resistance, center, exponent in PROCESSES)


def noisy_two_cpe_spectrum():
    frequency = np.logspace(-1, 5, 61)
    omega = 2 * np.pi * frequency
    impedance = 3 + sum(resistance / (1 + (1j * omega * center) ** exponent)
                        for resistance, center, exponent in PROCESSES)
    random = np.random.default_rng(123)
    impedance += .005 * abs(impedance) * (
        random.normal(size=len(frequency)) + 1j * random.normal(size=len(frequency)))
    return [dict(frequency_Hz=float(value), z_real_ohm=float(z.real), z_imag_ohm=float(z.imag))
            for value, z in zip(frequency, impedance)]


def density_relative_error(result):
    tau = np.array([point["tau_s"] for point in result["drt"]])
    gamma = np.array([point["gamma_ohm"] for point in result["drt"]])
    expected = cole_cole_density(tau)
    return float(np.sqrt(np.trapezoid((gamma - expected) ** 2, np.log(tau))
                         / np.trapezoid(expected ** 2, np.log(tau))))


class DrtAutoKnownDensityTests(unittest.TestCase):
    def test_noisy_two_cpe_auto_avoids_the_false_overregularized_corner(self):
        rows = noisy_two_cpe_spectrum()
        before = copy.deepcopy(rows)
        result = fit_drt(rows, {"M": 60, "includeL": False, "mode": "auto"})
        # Bounds are deliberately loose for this deterministic counterexample,
        # not a universal error requirement or an assertion of optimal lambda.
        self.assertLess(density_relative_error(result), .25)
        self.assertLess(result["relative_complex_RMSE_percent"], 1.5)
        self.assertIs(result["metadata"]["physicalValidationPerformed"], False)
        self.assertEqual(rows, before)


if __name__ == "__main__":
    unittest.main()
