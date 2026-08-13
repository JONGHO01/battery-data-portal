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

    def test_saved_figure_group_styles_are_present(self):
        self.assertIn(".savedFigureDateGroup", self.style_css)
        self.assertIn(".savedFigureDateSummary", self.style_css)
        self.assertIn(".savedFigureTypeHeader", self.style_css)
        self.assertIn(".savedFigureTypeGrid", self.style_css)


if __name__ == "__main__":
    unittest.main()
