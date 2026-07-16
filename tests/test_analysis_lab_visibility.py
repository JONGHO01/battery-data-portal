"""Regression checks for temporarily hiding the advanced Analysis Lab UI."""

from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


class AnalysisLabVisibilityTests(unittest.TestCase):
    def test_analysis_lab_is_not_exposed_in_the_normal_navigation(self):
        html = (ROOT / "public" / "index.html").read_text(encoding="utf-8")

        self.assertNotIn('class="menuTrigger" data-view="analysisLab"', html)
        self.assertNotIn('class="moduleCard activeModule" data-view="analysisLab"', html)
        self.assertNotIn('class="tab" data-view="analysisLab"', html)

    def test_analysis_lab_implementation_and_historical_runs_are_preserved(self):
        html = (ROOT / "public" / "index.html").read_text(encoding="utf-8")
        app_js = (ROOT / "public" / "app.js").read_text(encoding="utf-8")

        self.assertIn('id="analysisLabView"', html)
        self.assertIn("function runSelectedDatasetAnalysis()", app_js)


if __name__ == "__main__":
    unittest.main()
