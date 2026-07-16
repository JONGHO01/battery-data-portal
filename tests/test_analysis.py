import unittest


from backend.analysis.dqdv import calculate_dqdv
from backend.analysis.eis import summarize_eis
from backend.analysis.retention import summarize_retention


class AnalysisTests(unittest.TestCase):
    def test_retention_uses_the_first_valid_capacity_as_reference(self):
        result = summarize_retention(
            [
                {"cycle_index": 1, "specific_capacity_mah_g": 160},
                {"cycle_index": 2, "specific_capacity_mah_g": 152},
            ]
        )

        self.assertEqual(result["initial_capacity_mah_g"], 160.0)
        self.assertAlmostEqual(result["final_retention_pct"], 95.0)

    def test_retention_converts_standard_discharge_capacity_ah_to_mah(self):
        """CYC files with absolute discharge capacity must not become unavailable."""

        result = summarize_retention(
            [
                {"cycle_index": 1, "discharge_capacity_ah": 0.150},
                {"cycle_index": 2, "discharge_capacity_ah": 0.135},
            ]
        )

        self.assertEqual(result["status"], "ok")
        self.assertEqual(result["capacity_unit"], "mAh")
        self.assertEqual(result["initial_capacity_mah"], 150.0)
        self.assertEqual(result["final_capacity_mah"], 135.0)
        self.assertAlmostEqual(result["final_retention_pct"], 90.0)

    def test_dqdv_returns_no_result_when_a_summary_file_has_no_voltage_curve(self):
        result = calculate_dqdv(
            [
                {"cycle_index": 1, "specific_capacity_mah_g": 160},
                {"cycle_index": 2, "specific_capacity_mah_g": 152},
            ]
        )

        self.assertEqual(result["status"], "unavailable")
        self.assertIn("voltage", result["reason"].lower())

    def test_eis_summary_reports_frequency_and_resistance_range(self):
        result = summarize_eis(
            [
                {"frequency_hz": 1000, "z_real_ohm": 1.2, "z_imag_ohm": -0.5},
                {"frequency_hz": 1, "z_real_ohm": 3.4, "z_imag_ohm": -1.1},
            ]
        )

        self.assertEqual(result["point_count"], 2)
        self.assertEqual(result["frequency_hz"]["min"], 1.0)
        self.assertEqual(result["z_real_ohm"]["max"], 3.4)


if __name__ == "__main__":
    unittest.main()
