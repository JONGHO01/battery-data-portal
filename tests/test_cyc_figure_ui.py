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

    def test_c_rate_filename_ignores_sample_index_before_fractional_rate(self):
        app_js = (ROOT / "public" / "app.js").read_text(encoding="utf-8")
        self.assertIn("const firstFractionalRate = labels.findIndex", app_js)
        self.assertIn("if (firstFractionalRate > 0) labels = labels.slice(firstFractionalRate);", app_js)

    def test_c_rate_guide_lines_require_complete_positive_displayed_cycles(self):
        app_js = (ROOT / "public" / "app.js").read_text(encoding="utf-8")
        self.assertIn("function cRateFigureSegments(segments, capPts)", app_js)
        self.assertIn("coveredCycles.length < 2", app_js)
        self.assertIn("cRateFigureSegments(inferCRateSegments(d, rows, capPts), capPts)", app_js)

    def test_cyc_capacity_axis_limits_dense_ticks_for_bad_outliers(self):
        app_js = (ROOT / "public" / "app.js").read_text(encoding="utf-8")
        self.assertIn("const yTickStep = Math.max(20, Math.ceil(capDomain[1] / 9 / 20) * 20);", app_js)

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

    def test_empty_figure_and_table_messages_are_clear_korean(self):
        html = (ROOT / "public" / "index.html").read_text(encoding="utf-8")
        app_js = (ROOT / "public" / "app.js").read_text(encoding="utf-8")
        self.assertIn("선택한 Dataset 없음", html)
        self.assertIn("선택한 Dataset 없음", app_js)
        self.assertIn("표시할 데이터가 없습니다.", app_js)
        self.assertIn('$("figureTitle").textContent = "선택한 Dataset 없음";', app_js)
        self.assertNotIn('textContent = "No dataset"', app_js)

    def _legacy_saved_fig_list_and_admin_label_use_clear_korean(self):
        app_js = (ROOT / "public" / "app.js").read_text(encoding="utf-8")
        start = app_js.rindex("function renderSavedList()")
        end = app_js.find("\nfunction ", start + 1)
        saved_list = app_js[start:] if end == -1 else app_js[start:end]
        for label in (
            "저장된 Fig가 없습니다.",
            "CYC 비교 선택",
            "CYC Fig만 비교할 수 있습니다.",
            "Fig 열기",
            "날짜 없음",
            "저장된 Fig 삭제",
            "저장된 Fig를 불러왔습니다.",
            "용량 유지율 Fig",
            "전압/전류 Fig",
            "EIS 통합 Fig",
        ):
            self.assertIn(label, app_js)
        self.assertIn(" · ", saved_list)
        self.assertIn('user.role === "admin" ? "관리자"', app_js)


    def test_saved_fig_comparison_uses_the_authoritative_readable_label_path(self):
        app_js = (ROOT / "public" / "app.js").read_text(encoding="utf-8")
        start = app_js.rindex("// Authoritative saved-Fig labels.")
        saved_fig_ui = app_js[start:]
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
        app_js = (ROOT / "public" / "app.js").read_text(encoding="utf-8")
        start = app_js.rindex("// Authoritative saved-Fig labels.")
        saved_list = app_js[start:]
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
