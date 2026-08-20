import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class SavedFigureGroupingUiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app_js = (ROOT / "public" / "app.js").read_text(encoding="utf-8")
        cls.style_css = (ROOT / "public" / "style.css").read_text(encoding="utf-8")

    def test_saved_figures_are_grouped_by_date_and_data_type(self):
        self.assertIn("function savedFigureDateKey(dataset)", self.app_js)
        self.assertIn("function savedFigureTypeKey(dataset)", self.app_js)
        self.assertIn('["cyc", "eis", "cv", "other"]', self.app_js)
        self.assertIn('class="savedFigureDateGroup"', self.app_js)
        self.assertIn('class="savedFigureTypeSection"', self.app_js)
        self.assertIn('class="savedFigureTypeGrid"', self.app_js)

    def test_source_filename_experiment_date_precedes_shared_cell_date(self):
        self.assertIn("function savedFigureSourceDateKey(sourceName)", self.app_js)

        date_key_start = self.app_js.index("function savedFigureDateKey(dataset)")
        date_key_end = self.app_js.index("function savedFigureDateLabel(dateKey)")
        date_key_source = self.app_js[date_key_start:date_key_end]

        self.assertIn(
            "const sourceDate = savedFigureSourceDateKey(dataset?.sourceName);",
            date_key_source,
        )
        self.assertIn("if (sourceDate) return sourceDate;", date_key_source)
        self.assertLess(
            date_key_source.index("if (sourceDate) return sourceDate;"),
            date_key_source.index("dataset?.cell?.date"),
        )

        card_start = self.app_js.index("function savedFigureCardHtml(dataset, text)")
        card_end = self.app_js.index("function renderSavedList()", card_start)
        card_source = self.app_js[card_start:card_end]
        self.assertIn("const dateKey = savedFigureDateKey(dataset);", card_source)
        self.assertIn("savedFigureDateLabel(dateKey)", card_source)

    def test_saved_figure_group_styles_are_present(self):
        self.assertIn(".savedFigureDateGroup", self.style_css)
        self.assertIn(".savedFigureDateSummary", self.style_css)
        self.assertIn(".savedFigureTypeHeader", self.style_css)
        self.assertIn(".savedFigureTypeGrid", self.style_css)


if __name__ == "__main__":
    unittest.main()
