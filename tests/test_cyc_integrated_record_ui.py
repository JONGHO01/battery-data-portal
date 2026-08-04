"""Regression checks for the saved CYC integrated-record workspace."""

from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


class CycIntegratedRecordUiTests(unittest.TestCase):
    def setUp(self):
        self.app_js = (ROOT / "public" / "app.js").read_text(encoding="utf-8")
        self.index_html = (ROOT / "public" / "index.html").read_text(encoding="utf-8")

    def test_saved_cyc_has_a_dedicated_integrated_record_route(self):
        self.assertIn('id="cycRecordView"', self.index_html)
        self.assertIn('id="cycRecordContent"', self.index_html)
        self.assertIn('function renderCycRecordView()', self.app_js)
        self.assertIn('activateView("cycRecord", "cyc")', self.app_js)

    def test_integrated_record_renders_all_three_raw_cyc_views(self):
        self.assertIn('captureCycRecordPanel(dataset, "cycling-performance")', self.app_js)
        self.assertIn('captureCycRecordPanel(dataset, "voltage-profile")', self.app_js)
        self.assertIn('captureCycRecordPanel(dataset, "dqdv")', self.app_js)
        self.assertIn('function captureCycRecordPanel(dataset, figureKind)', self.app_js)

    def test_integrated_record_keeps_electrode_metadata_linked_to_cyc(self):
        self.assertIn('function renderCycRecordElectrode(dataset)', self.app_js)
        self.assertIn('cell.electrodeCalc', self.app_js)
        self.assertIn('data-cyc-record-profile', self.app_js)
        self.assertIn('applyElectrodeProfileToSelectedCyc(profileId)', self.app_js)

    def test_electrode_calculator_is_hidden_without_removing_its_saved_data(self):
        self.assertIn('class="menuGroup electrodeMenu" hidden', self.index_html)
        self.assertIn('data-module="electrodeCalc" hidden', self.index_html)
        self.assertIn('data-view="electrodeCalc" hidden', self.index_html)
        self.assertIn('id="electrodeCalcView" class="view" hidden', self.index_html)
