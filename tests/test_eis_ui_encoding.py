from pathlib import Path
import unittest


PROJECT_ROOT = Path(__file__).resolve().parents[1]


class EisUiEncodingTests(unittest.TestCase):
    def test_eis_inspection_panel_uses_readable_korean_labels(self):
        source = (PROJECT_ROOT / "public" / "app.js").read_text(encoding="utf-8")

        expected_labels = [
            "EIS \\uc5f4 \\uc548\\ub0b4",
            "sweep</code>: \\ubc18\\ubcf5 \\uce21\\uc815 \\ud68c\\ucc28",
            "frequency</code>: \\uc778\\uac00\\ud55c \\uad50\\ub958 \\uc8fc\\ud30c\\uc218(Hz)",
            "zreal</code>: \\uc784\\ud53c\\ub358\\uc2a4\\uc758 \\uc2e4\\uc218\\ubd80",
            "zimag</code>: \\ud5c8\\uc218\\ubd80",
            "mag</code>: \\uc784\\ud53c\\ub358\\uc2a4 \\ud06c\\uae30",
            "phase</code>: \\uc704\\uc0c1\\uac01(degree)",
            "\\uc5b4\\ub5a4 Fig\\ub97c \\ub9cc\\ub4e4\\uc5b4 \\ub4dc\\ub9b4\\uae4c\\uc694?",
            "Nyquist + Bode \\ud1b5\\ud569 Fig",
        ]

        for label in expected_labels:
            self.assertIn(label, source)

    def test_eis_fig_uses_a_clean_data_fitted_nyquist_renderer(self):
        source = (PROJECT_ROOT / "public" / "app.js").read_text(encoding="utf-8")

        expected_fragments = [
            "function cleanNyquistBounds(points)",
            "function nyquistPanel({ x, y, w, h, title, xlabel, ylabel, points })",
            "const domains = cleanNyquistBounds(points);",
            'class="nyquistStart"',
            'class="nyquistStartLabel">HF start</text>',
            "frequency: row.frequency",
            "const startPoint = points.reduce(",
            "pointFrequency > bestFrequency",
            "const combinedPanelGap = 140;",
            'const kind = ["eis-combined", "nyquist", "bode"].includes(d.figureKind)',
            'if (d.dataType === "eis") return renderEisFigure(d);',
            'class="nyquistLine"',
            "stroke-linecap:round",
            "Nyquist impedance",
        ]

        for fragment in expected_fragments:
            self.assertIn(fragment, source)

        self.assertNotIn("function equalAspectNyquistBounds", source)

    def test_eis_fig_uses_the_saved_series_color(self):
        source = (PROJECT_ROOT / "public" / "app.js").read_text(encoding="utf-8")

        self.assertIn("const seriesColor = normalizeHexColor(style.seriesColor);", source)
        self.assertIn(".nyquistLine{fill:none;stroke:${seriesColor}", source)
        self.assertIn(".seriesLine{fill:none;stroke:${seriesColor}", source)

    def test_eis_combined_layout_avoids_duplicate_bode_x_axis_labels(self):
        source = (PROJECT_ROOT / "public" / "app.js").read_text(encoding="utf-8")

        expected_fragments = [
            "showXTickLabels = true, showXLabel = true",
            "showXTickLabels ? `<text x=",
            "showXLabel ? `<text x=",
            "showXTickLabels: false, showXLabel: false",
            "const compactEisSize = figureSvgSize(style, \"eis\");",
        ]

        for fragment in expected_fragments:
            self.assertIn(fragment, source)

    def test_nyquist_panel_does_not_reference_bode_axis_visibility_options(self):
        source = (PROJECT_ROOT / "public" / "app.js").read_text(encoding="utf-8")
        nyquist_source = source.split("function nyquistPanel", 1)[1].split("function renderEisFigure", 1)[0]

        self.assertNotIn("showXLabel", nyquist_source)
        self.assertNotIn("showXTickLabels", nyquist_source)
