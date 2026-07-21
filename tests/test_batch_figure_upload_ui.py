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
        self.assertIn("reusedExistingSource", self.app_js)
        self.assertIn("기존 Dataset과 Fig를 재사용했습니다.", self.app_js)

    def test_primary_analysis_button_starts_batch_workflow_for_multiple_files(self):
        self.assertIn("if (files.length > 1) return createBatchFigures();", self.app_js)
        self.assertIn('inspectButton.textContent = isBatch ? "여러 파일 분석·Fig 생성" : "파일 분석";', self.app_js)
        self.assertIn("button.classList.add(\"hidden\");", self.app_js)


    def test_finished_batch_releases_the_file_picker_for_the_next_selection(self):
        self.assertIn("function clearUploadSelectionAfterProcessing()", self.app_js)
        self.assertIn('input.value = "";', self.app_js)
        self.assertIn("clearUploadSelectionAfterProcessing();", self.app_js)
        self.assertIn("state.batchInProgress = false;", self.app_js)


    def test_batch_uses_the_selected_hierarchy_cell_when_the_form_cell_id_is_blank(self):
        self.assertIn("function batchCellForUpload(cell)", self.app_js)
        self.assertIn("selectedHierarchyCell()", self.app_js)
        self.assertIn("const cell = batchCellForUpload(collectCellForm());", self.app_js)

    def test_batch_does_not_require_a_second_cell_id_entry(self):
        self.assertNotIn("selectedHierarchyCell()?.cellId) {", self.app_js)
        self.assertIn("the backend creates the default Project/Campaign/Cell hierarchy", self.app_js)


if __name__ == "__main__":
    unittest.main()
