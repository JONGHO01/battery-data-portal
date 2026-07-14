import unittest


from backend.analysis.dva import calculate_dva
from backend.analysis.pulse_resistance import summarize_pulse_resistance
from backend.analysis.rate_capability import summarize_rate_capability
from backend.analysis.smoothing import smooth_series


class ExtendedAnalysisModuleTests(unittest.TestCase):
    def test_smoothing_keeps_series_length_and_uses_an_odd_window(self):
        self.assertEqual(smooth_series([1, 10, 1, 10, 1], window=4), [1.0, 4.0, 7.0, 4.0, 1.0])

    def test_dva_uses_voltage_capacity_curve(self):
        result = calculate_dva(
            [
                {"voltage_v": 3.0, "specific_capacity_mah_g": 100},
                {"voltage_v": 3.1, "specific_capacity_mah_g": 110},
                {"voltage_v": 3.3, "specific_capacity_mah_g": 120},
            ]
        )
        self.assertEqual(result["status"], "ok")
        self.assertEqual(len(result["points"]), 2)

    def test_pulse_resistance_requires_real_current_transitions(self):
        result = summarize_pulse_resistance(
            [
                {"test_time_s": 0, "voltage_v": 3.7, "current_a": 0.0},
                {"test_time_s": 1, "voltage_v": 3.6, "current_a": 0.1},
                {"test_time_s": 2, "voltage_v": 3.59, "current_a": 0.1},
            ]
        )
        self.assertEqual(result["status"], "ok")
        self.assertGreater(result["pulses"][0]["resistance_ohm"], 0)

    def test_rate_capability_groups_capacities_by_c_rate(self):
        result = summarize_rate_capability(
            [
                {"cycle_index": 1, "c_rate": 0.1, "specific_capacity_mah_g": 160},
                {"cycle_index": 2, "c_rate": 0.1, "specific_capacity_mah_g": 158},
                {"cycle_index": 3, "c_rate": 1.0, "specific_capacity_mah_g": 130},
            ]
        )
        self.assertEqual(result["status"], "ok")
        self.assertEqual(result["groups"][0]["c_rate"], 0.1)
        self.assertEqual(result["groups"][1]["cycle_count"], 1)


if __name__ == "__main__":
    unittest.main()
