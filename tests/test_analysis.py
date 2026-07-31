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

    def test_retention_uses_the_largest_raw_capacity_once_per_cycle(self):
        """Point-level traces must not make the first point look like cycle capacity."""

        result = summarize_retention(
            [
                {"cycle_index": 1, "specific_capacity_mah_g": 20},
                {"cycle_index": 1, "specific_capacity_mah_g": 160},
                {"cycle_index": 2, "specific_capacity_mah_g": 18},
                {"cycle_index": 2, "specific_capacity_mah_g": 144},
            ]
        )

        self.assertEqual(result["cycle_count"], 2)
        self.assertEqual(result["initial_capacity_mah_g"], 160.0)
        self.assertEqual(result["final_capacity_mah_g"], 144.0)
        self.assertAlmostEqual(result["final_retention_pct"], 90.0)

    def test_retention_prefers_discharge_capacity_for_directional_raw_traces(self):
        """A charge trace must not replace the discharge retention series."""

        result = summarize_retention(
            [
                {"cycle_index": 1, "specific_capacity_mah_g": 195, "direction": "charge"},
                {"cycle_index": 1, "specific_capacity_mah_g": 165, "direction": "discharge"},
                {"cycle_index": 2, "specific_capacity_mah_g": 188, "direction": "charge"},
                {"cycle_index": 2, "specific_capacity_mah_g": 150, "direction": "discharge"},
            ]
        )

        self.assertEqual(result["initial_capacity_mah_g"], 165.0)
        self.assertEqual(result["final_capacity_mah_g"], 150.0)
        self.assertAlmostEqual(result["final_retention_pct"], 150 / 165 * 100)

    def test_dqdv_returns_no_result_when_a_summary_file_has_no_voltage_curve(self):
        result = calculate_dqdv(
            [
                {"cycle_index": 1, "specific_capacity_mah_g": 160},
                {"cycle_index": 2, "specific_capacity_mah_g": 152},
            ]
        )

        self.assertEqual(result["status"], "unavailable")
        self.assertIn("voltage", result["reason"].lower())

    def test_dqdv_rejects_cycle_summary_rows_even_when_they_have_end_voltage(self):
        """One capacity/voltage value per cycle is not a voltage-capacity trace."""

        result = calculate_dqdv(
            [
                {
                    "cycle_index": cycle,
                    "specific_capacity_mah_g": 160 - cycle,
                    "voltage_v": 3.7 - cycle * 0.01,
                }
                for cycle in range(1, 11)
            ]
        )

        self.assertEqual(result["status"], "unavailable")
        self.assertIn("within-cycle", result["reason"].lower())

    def test_dqdv_uses_ordered_raw_voltage_capacity_points_from_one_cycle(self):
        rows = [
            {
                "cycle_index": 1,
                "test_time_s": point,
                "voltage_v": 3.0 + point * 0.02,
                "specific_capacity_mah_g": point * 4.0,
                "current_a": -0.01,
            }
            for point in range(12)
        ]

        result = calculate_dqdv(rows)

        self.assertEqual(result["status"], "ok")
        self.assertEqual(result["series_count"], 1)
        self.assertEqual(result["series"][0]["cycle_index"], 1)
        self.assertEqual(result["series"][0]["direction"], "discharge")
        self.assertGreaterEqual(len(result["points"]), 4)
        self.assertTrue(all("dqdv_mah_g_v" in point for point in result["points"]))

    def test_dqdv_preserves_multiple_complete_raw_cycles(self):
        """A long CYC trace must keep later cycles available for dQ/dV."""

        rows = [
            {
                "cycle_index": cycle,
                "specific_capacity_mah_g": point * 2.0,
                "voltage_v": 4.2 - point * 0.05,
                "current_a": -0.01,
            }
            for cycle in (1, 2)
            for point in range(12)
        ]

        result = calculate_dqdv(rows)

        self.assertEqual(result["status"], "ok")
        self.assertEqual(result["series_count"], 2)
        self.assertEqual([series["cycle_index"] for series in result["series"]], [1, 2])

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
