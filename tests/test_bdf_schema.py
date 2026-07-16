import unittest


from backend.schemas.bdf import (
    CANONICAL_COLUMNS,
    build_column_mapping,
    canonicalize_rows,
    evaluate_quality,
)


class BdfSchemaTests(unittest.TestCase):
    def test_maps_common_cycler_headers_to_portal_canonical_columns(self):
        columns = [
            "Cycle",
            "Discharge capacity (Ah/g)",
            "Current (mA)",
            "Voltage (V)",
            "Test Time (s)",
        ]

        mapping = build_column_mapping("cyc", columns)

        self.assertEqual(mapping["cycle_index"]["source"], "Cycle")
        self.assertEqual(mapping["specific_capacity_mah_g"]["source"], "Discharge capacity (Ah/g)")
        self.assertEqual(mapping["current_a"]["source"], "Current (mA)")
        self.assertEqual(mapping["voltage_v"]["source"], "Voltage (V)")
        self.assertEqual(mapping["test_time_s"]["source"], "Test Time (s)")

    def test_converts_ah_per_gram_and_milliampere_without_losing_raw_values(self):
        columns = ["Cycle", "Discharge capacity (Ah/g)", "Current (mA)", "Voltage (V)"]
        rows = [{"Cycle": 3, "Discharge capacity (Ah/g)": 0.152, "Current (mA)": 24.5, "Voltage (V)": 3.78}]

        canonical = canonicalize_rows("cyc", columns, rows)

        self.assertEqual(canonical[0]["cycle_index"], 3.0)
        self.assertAlmostEqual(canonical[0]["specific_capacity_mah_g"], 152.0)
        self.assertAlmostEqual(canonical[0]["current_a"], 0.0245)
        self.assertEqual(canonical[0]["_raw"]["Discharge capacity (Ah/g)"], 0.152)

    def test_maps_explicit_c_rate_values_for_cyc_rate_analysis(self):
        columns = ["Cycle", "C-rate (C)", "Discharge capacity (mAh/g)"]
        rows = [
            {"Cycle": 1, "C-rate (C)": "C/10", "Discharge capacity (mAh/g)": 160},
            {"Cycle": 2, "C-rate (C)": "0.33 C", "Discharge capacity (mAh/g)": 150},
            {"Cycle": 3, "C-rate (C)": 1, "Discharge capacity (mAh/g)": 130},
        ]

        mapping = build_column_mapping("cyc", columns)
        canonical = canonicalize_rows("cyc", columns, rows)

        self.assertEqual(mapping["c_rate"]["source"], "C-rate (C)")
        self.assertEqual(mapping["c_rate"]["targetUnit"], "C")
        self.assertEqual([row["c_rate"] for row in canonical], [0.1, 0.33, 1.0])
        self.assertIn("c_rate", CANONICAL_COLUMNS)

    def test_marks_rows_with_impossible_values_but_keeps_them_for_review(self):
        rows = [
            {"cycle_index": 1, "voltage_v": 3.7, "current_a": 0.01},
            {"cycle_index": 2, "voltage_v": 99.0, "current_a": 0.01},
        ]

        quality = evaluate_quality("cyc", rows)

        self.assertEqual(quality["summary"]["status"], "review")
        self.assertEqual(quality["rows"][1]["quality_flag"], "review")
        self.assertIn("voltage_out_of_range", quality["rows"][1]["exclude_reason"])
        self.assertIn("quality_flag", CANONICAL_COLUMNS)


if __name__ == "__main__":
    unittest.main()
