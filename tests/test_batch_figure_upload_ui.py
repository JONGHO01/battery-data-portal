"""Regression checks for the multi-file Fig creation workflow."""

from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


class BatchFigureUploadUiTests(unittest.TestCase):
    def setUp(self):
        self.html = (ROOT / "public" / "index.html").read_text(encoding="utf-8")
        self.app_js = (ROOT / "public" / "app.js").read_text(encoding="utf-8")

    def test_upload_picker_accepts_multiple_supported_files(self):
        self.assertIn('id="smartFile"', self.html)
        self.assertIn('multiple', self.html[self.html.index('id="smartFile"') - 220:self.html.index('id="smartFile"') + 260])
        self.assertIn('id="batchCreateFigures"', self.html)
        self.assertIn('id="batchFigureResults"', self.html)

    def test_batch_figures_are_processed_sequentially_and_recorded(self):
        self.assertIn('const BATCH_FIGURE_FILE_LIMIT = 10;', self.app_js)
        self.assertIn('async function createBatchFigures()', self.app_js)
        self.assertIn('for (const file of files)', self.app_js)
        self.assertIn('await inspectFileUpload(file);', self.app_js)
        self.assertIn('await saveDatasetFromInspection(', self.app_js)
        self.assertIn('await saveFigureRecord(', self.app_js)
        self.assertIn('on("batchCreateFigures", "click", createBatchFigures);', self.app_js)


if __name__ == "__main__":
    unittest.main()
