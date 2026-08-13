"""Regression checks for editable, per-figure axis ranges."""

from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


class FigureAxisRangeUiTests(unittest.TestCase):
    def setUp(self):
        self.html = (ROOT / "public" / "index.html").read_text(encoding="utf-8")
        self.app_js = (ROOT / "public" / "app.js").read_text(encoding="utf-8")

    def test_axis_range_editor_has_target_and_four_limits(self):
        for element_id in (
            "figureAxisRangeTarget",
            "figureXMin",
            "figureXMax",
            "figureYMin",
            "figureYMax",
            "applyFigureAxisRange",
            "resetFigureAxisRange",
            "figureAxisRangeMessage",
        ):
            self.assertIn(f'id="{element_id}"', self.html)

    def test_axis_ranges_are_normalized_saved_and_restored_per_graph(self):
        for expected in (
            "const FIGURE_AXIS_RANGE_KEYS",
            "function normalizeFigureAxisRange(value)",
            "function normalizeFigureAxisRanges(value)",
            "function resolveFigureAxisDomains(autoX, autoY, key)",
            "axisRanges: normalizeFigureAxisRanges(saved?.axisRanges)",
            "syncFigureAxisRangeControls(style);",
        ):
            self.assertIn(expected, self.app_js)

    def test_axis_ranges_are_applied_to_each_supported_figure(self):
        for graph_key in ("performance", "voltage", "dqdv", "eis", "cv"):
            self.assertIn(
                f'resolveFigureAxisDomains(',
                self.app_js,
            )
            self.assertIn(f'"{graph_key}"', self.app_js)

    def test_axis_range_controls_apply_reset_and_validate(self):
        for expected in (
            "function applyFigureAxisRange()",
            "function resetFigureAxisRange()",
            "function changeFigureAxisRangeTarget()",
            'on("applyFigureAxisRange", "click", applyFigureAxisRange);',
            'on("resetFigureAxisRange", "click", resetFigureAxisRange);',
            'on("figureAxisRangeTarget", "change", changeFigureAxisRangeTarget);',
            r"X \ucd5c\uc18c\uac12\uc740 X \ucd5c\ub300\uac12\ubcf4\ub2e4 \uc791\uc544\uc57c \ud569\ub2c8\ub2e4.",
            r"Y \ucd5c\uc18c\uac12\uc740 Y \ucd5c\ub300\uac12\ubcf4\ub2e4 \uc791\uc544\uc57c \ud569\ub2c8\ub2e4.",
        ):
            self.assertIn(expected, self.app_js)


if __name__ == "__main__":
    unittest.main()
