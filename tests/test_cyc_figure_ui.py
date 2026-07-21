"""Regression checks for the CYC Fig rendering path."""

from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


class CycFigureUiTests(unittest.TestCase):
    def setUp(self):
        self.app_js = (ROOT / "public" / "app.js").read_text(encoding="utf-8")

    def test_cyc_figure_has_one_authoritative_renderer(self):
        self.assertEqual(self.app_js.count("function renderCycFigure(d)"), 1)

    def test_capacity_series_ignores_nonpositive_cycle_numbers(self):
        self.assertIn("if (!Number.isFinite(cycle) || cycle < 1 || !Number.isFinite(capacity)) continue;", self.app_js)
        self.assertIn("if (Math.abs(cycle - wholeCycle) > 1e-6) continue;", self.app_js)

    def test_capacity_series_reduces_repeated_measurements_to_one_point_per_cycle(self):
        self.assertIn("const finalCapacityByCycle = new Map();", self.app_js)
        self.assertIn("if (!previous || point.y > previous.y)", self.app_js)
        self.assertIn("const raw = [...finalCapacityByCycle.values()]", self.app_js)

    def test_cyc_figure_prioritizes_an_explicit_c_rate_column(self):
        self.assertIn('cRate: findColumn(columns, ["crate", "cratec", "ratec"', self.app_js)
        self.assertIn("const explicitSegments = explicitCRateSegments(rows, minCycle, maxCycle);", self.app_js)
        self.assertIn("if (explicitSegments.length >= 2) return explicitSegments;", self.app_js)

    def test_c_rate_filename_ignores_sample_index_before_fractional_rate(self):
        self.assertIn("const firstFractionalRate = labels.findIndex", self.app_js)
        self.assertIn("if (firstFractionalRate > 0) labels = labels.slice(firstFractionalRate);", self.app_js)

    def test_c_rate_guide_lines_require_complete_positive_displayed_cycles(self):
        self.assertIn("function cRateFigureSegments(segments, capPts)", self.app_js)
        self.assertIn("coveredCycles.length < 2", self.app_js)
        self.assertIn("cRateFigureSegments(inferCRateSegments(d, rows, capPts), capPts)", self.app_js)

    def test_cyc_capacity_axis_limits_dense_ticks_for_bad_outliers(self):
        self.assertIn("const yTickStep = Math.max(20, Math.ceil(capDomain[1] / 9 / 20) * 20);", self.app_js)

    def test_cyc_fig_choice_uses_distinct_rendering_paths(self):
        self.assertIn('const kind = ["cycling-performance", "voltage-profile", "cyc-combined"].includes(d.figureKind)', self.app_js)
        self.assertIn('if (kind === "voltage-profile") return renderCycVoltageProfileFigure(d);', self.app_js)
        self.assertIn('if (kind === "cyc-combined") return renderCycCombinedFigure(d);', self.app_js)

    def test_voltage_profile_requires_real_curve_points(self):
        self.assertIn("function cycVoltageProfileSeries(rows)", self.app_js)
        self.assertIn("points.length >= 2", self.app_js)

    def test_summary_only_cyc_data_has_a_voltage_and_current_fallback(self):
        self.assertIn("function cycVoltageCurrentTrend(rows)", self.app_js)
        self.assertIn("function cycVoltageCurrentTrendPanel", self.app_js)
        self.assertIn("Current (mA, +charge / -discharge)", self.app_js)
        self.assertIn("Summary trend: mean voltage and current by cycle", self.app_js)

    def test_raw_voltage_profile_legend_includes_current(self):
        self.assertIn("function formatCurrentForFigure", self.app_js)
        self.assertIn("Iavg", self.app_js)
        self.assertIn("Voltage/current behavior", self.app_js)

    def test_empty_figure_and_table_messages_are_clear_korean(self):
        html = (ROOT / "public" / "index.html").read_text(encoding="utf-8")
        self.assertIn("\uc120\ud0dd\ud55c Dataset \uc5c6\uc74c", html)
        self.assertIn(r"\uc120\ud0dd\ud55c Dataset \uc5c6\uc74c", self.app_js)
        self.assertIn(r"\ud45c\uc2dc\ud560 \ub370\uc774\ud130\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.", self.app_js)
        self.assertIn('$("figureTitle").textContent = "\\uc120\\ud0dd\\ud55c Dataset \\uc5c6\\uc74c";', self.app_js)
        self.assertNotIn('textContent = "No dataset"', self.app_js)

    def test_saved_fig_comparison_uses_the_authoritative_readable_label_path(self):
        start = self.app_js.rindex("// Authoritative saved-Fig labels.")
        saved_fig_ui = self.app_js[start:]
        for escaped_label in (
            r"\uc800\uc7a5\ub41c Fig\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.",
            r"CYC \ube44\uad50 Fig",
            r"\ube44\uad50 Fig \uc800\uc7a5",
            r"CYC Fig\ub97c 2\uac1c \uc774\uc0c1 \uc120\ud0dd\ud558\uba74",
        ):
            self.assertIn(escaped_label, saved_fig_ui)
        self.assertIn("function renderCycComparison()", saved_fig_ui)
        self.assertIn("function saveComparisonFigure()", saved_fig_ui)

    def test_saved_fig_list_uses_the_authoritative_readable_renderer(self):
        start = self.app_js.rindex("// Authoritative saved-Fig labels.")
        saved_list = self.app_js[start:]
        for escaped_label in (
            r"\uc800\uc7a5\ub41c Fig\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.",
            r"CYC \ube44\uad50 \uc120\ud0dd",
            r"CYC Fig\ub9cc \ube44\uad50\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.",
            r"Fig \uc5f4\uae30",
            r"\ub0a0\uc9dc \uc5c6\uc74c",
            r"\uc800\uc7a5\ub41c Fig \uc0ad\uc81c",
            r"\uc800\uc7a5\ub41c Fig\ub97c \ubd88\ub7ec\uc654\uc2b5\ub2c8\ub2e4.",
            r"\uc131\ub2a5 \ud14c\uc2a4\ud2b8 Fig",
            r"\uc804\uc555 \ud504\ub85c\ud30c\uc77c Fig",
            r"Nyquist + Bode Fig",
        ):
            self.assertIn(escaped_label, saved_list)
        self.assertIn("function renderSavedList()", saved_list)


if __name__ == "__main__":
    unittest.main()
