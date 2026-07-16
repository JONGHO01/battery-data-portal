import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class CycFigureUiTests(unittest.TestCase):
    def test_cyc_figure_has_one_authoritative_renderer(self):
        app_js = (ROOT / "public" / "app.js").read_text(encoding="utf-8")
        self.assertEqual(app_js.count("function renderCycFigure(d)"), 1)

    def test_capacity_series_ignores_nonpositive_cycle_numbers(self):
        app_js = (ROOT / "public" / "app.js").read_text(encoding="utf-8")
        self.assertIn("if (!Number.isFinite(cycle) || cycle < 1 || !Number.isFinite(capacity)) continue;", app_js)
        self.assertIn("if (Math.abs(cycle - wholeCycle) > 1e-6) continue;", app_js)

    def test_capacity_series_reduces_repeated_measurements_to_one_point_per_cycle(self):
        app_js = (ROOT / "public" / "app.js").read_text(encoding="utf-8")
        self.assertIn("const finalCapacityByCycle = new Map();", app_js)
        self.assertIn("if (!previous || point.y > previous.y)", app_js)
        self.assertIn("const raw = [...finalCapacityByCycle.values()]", app_js)

    def test_cyc_figure_prioritizes_an_explicit_c_rate_column(self):
        app_js = (ROOT / "public" / "app.js").read_text(encoding="utf-8")
        self.assertIn('cRate: findColumn(columns, ["crate", "cratec", "ratec"', app_js)
        self.assertIn("const explicitSegments = explicitCRateSegments(rows, minCycle, maxCycle);", app_js)
        self.assertIn("if (explicitSegments.length >= 2) return explicitSegments;", app_js)

    def test_cyc_fig_choice_uses_distinct_rendering_paths(self):
        app_js = (ROOT / "public" / "app.js").read_text(encoding="utf-8")
        self.assertIn('const kind = ["cycling-performance", "voltage-profile", "cyc-combined"].includes(d.figureKind)', app_js)
        self.assertIn('if (kind === "voltage-profile") return renderCycVoltageProfileFigure(d);', app_js)
        self.assertIn('if (kind === "cyc-combined") return renderCycCombinedFigure(d);', app_js)

    def test_voltage_profile_requires_real_curve_points(self):
        app_js = (ROOT / "public" / "app.js").read_text(encoding="utf-8")
        self.assertIn("function cycVoltageProfileSeries(rows)", app_js)
        self.assertIn("points.length >= 2", app_js)

    def test_summary_only_cyc_data_has_a_voltage_and_current_fallback(self):
        app_js = (ROOT / "public" / "app.js").read_text(encoding="utf-8")
        self.assertIn("function cycVoltageCurrentTrend(rows)", app_js)
        self.assertIn("function cycVoltageCurrentTrendPanel", app_js)
        self.assertIn("Current (mA, +charge / -discharge)", app_js)
        self.assertIn("Summary trend: mean voltage and current by cycle", app_js)

    def test_raw_voltage_profile_legend_includes_current(self):
        app_js = (ROOT / "public" / "app.js").read_text(encoding="utf-8")
        self.assertIn("function formatCurrentForFigure", app_js)
        self.assertIn("Iavg", app_js)
        self.assertIn("Voltage/current behavior", app_js)


if __name__ == "__main__":
    unittest.main()
