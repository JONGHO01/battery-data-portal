"""DRT/KK integration contracts; synthetic data only, no portal storage."""
import copy
import unittest

import numpy as np

from backend.analysis.eis_drt import fit_drt


def rows(offset=0, sweep=1):
    frequencies = np.logspace(-2, 5, 41)
    z = 3 + offset + 10 / (1 + 1j * 2 * np.pi * frequencies * .01)
    return [dict(frequency_Hz=float(f), z_real_ohm=float(value.real),
                 z_imag_ohm=float(value.imag), sweep=sweep)
            for f, value in zip(frequencies, z)]


class DrtDiagnosticsTests(unittest.TestCase):
    def test_current_version_has_separate_numeric_kk_without_physical_pass(self):
        source = rows()
        before = copy.deepcopy(source)
        result = fit_drt(source, {"M": 60, "includeL": False})
        metadata = result["metadata"]
        self.assertEqual(metadata["analysisVersion"], "rc-drt-4")
        diagnostic = metadata["kkConsistency"]
        self.assertIn(diagnostic["status"], ("computed", "inconclusive"))
        self.assertFalse(diagnostic["physicalValidationPerformed"])
        self.assertFalse(diagnostic["linearityValidated"])
        self.assertFalse(diagnostic["stationarityValidated"])
        self.assertFalse(metadata["physicalValidationPerformed"])
        self.assertLess(diagnostic["relativeComplexRMSEPercent"], 5)
        self.assertEqual(len(diagnostic["residuals"]), len(source))
        self.assertEqual(source, before)

    def test_kk_uses_only_the_selected_spectrum_and_original_frequency_order(self):
        first, second = rows(), rows(offset=50, sweep=2)
        result = fit_drt(first + second, {"M": 40, "includeL": False, "spectrumIndex": 1})
        diagnostic = result["metadata"]["kkConsistency"]
        self.assertEqual([p["frequency_Hz"] for p in diagnostic["residuals"]],
                         [p["frequency_Hz"] for p in second])
        self.assertEqual(len(result["reconstruction"]), len(second))
        self.assertTrue(all(p["z_real_raw_ohm"] > 50 for p in result["reconstruction"]))

    def test_small_sample_kk_is_inconclusive_not_a_synthetic_success(self):
        source = rows()[:4]
        result = fit_drt(source, {"M": 20, "includeL": False})
        diagnostic = result["metadata"]["kkConsistency"]
        self.assertEqual(diagnostic["status"], "inconclusive")
        self.assertFalse(diagnostic["selectionReliable"])
        self.assertIsNone(diagnostic["relativeComplexRMSEPercent"])
        self.assertFalse(result["metadata"]["physicalValidationPerformed"])


if __name__ == "__main__":
    unittest.main()
