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
        position = self.html.index('id="smartFile"')
        self.assertIn("multiple", self.html[position - 220 : position + 260])
        self.assertIn('id="batchCreateFigures"', self.html)
        self.assertIn('id="batchFigureResults"', self.html)

    def test_batch_figures_are_processed_sequentially_and_recorded(self):
        for expected in (
            "const BATCH_FIGURE_FILE_LIMIT = 10;",
            "async function createBatchFigures()",
            "for (const file of files)",
            "await inspectFileUpload(file);",
            "await saveDatasetFromInspection(",
            "await saveFigureRecord(",
            'on("batchCreateFigures", "click", createBatchFigures);',
            "reusedExistingSource",
            r"\uac19\uc740 \uc6d0\ubcf8 \ud30c\uc77c\uc774\ub77c \uae30\uc874 Dataset\uacfc Fig\ub97c \uc7ac\uc0ac\uc6a9\ud588\uc2b5\ub2c8\ub2e4.",
        ):
            self.assertIn(expected, self.app_js)

    def test_primary_analysis_button_starts_batch_workflow_for_multiple_files(self):
        self.assertIn("if (files.length > 1) return createBatchFigures();", self.app_js)
        self.assertIn("function updateBatchFigureControl()", self.app_js)
        self.assertIn('button.classList.toggle("hidden", selectedUploadFiles().length < 2);', self.app_js)

    def test_finished_batch_releases_the_file_picker_for_the_next_selection(self):
        for expected in (
            "function clearUploadSelectionAfterProcessing()",
            'input.value = "";',
            "clearUploadSelectionAfterProcessing();",
            "state.batchInProgress = false;",
        ):
            self.assertIn(expected, self.app_js)

    def test_batch_uses_the_selected_hierarchy_cell_when_the_form_cell_id_is_blank(self):
        self.assertIn("function batchCellForUpload(cell)", self.app_js)
        self.assertIn("selectedHierarchyCell()", self.app_js)
        self.assertIn("const cell = batchCellForUpload(collectCellForm());", self.app_js)

    def test_batch_does_not_require_a_second_cell_id_entry(self):
        self.assertNotIn("selectedHierarchyCell()?.cellId) {", self.app_js)
        self.assertIn("the backend creates the default Project/Campaign/Cell hierarchy", self.app_js)


if __name__ == "__main__":
    unittest.main()
