"""Static regression coverage for member-scoped administrator data browsing."""

import unittest
from html import unescape
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class AdminMemberDataUiTests(unittest.TestCase):
    def test_member_rows_link_to_owner_filtered_raw_data_view(self):
        source = (ROOT / "public" / "app.js").read_text(encoding="utf-8")

        self.assertIn("data-view-user-data", source)
        self.assertIn("openUserRawData", source)
        self.assertIn('params.set("owner_id", state.adminRawOwnerId)', source)
        self.assertIn("clearAdminRawOwnerFilter", source)

    def test_raw_data_view_exposes_selected_member_filter(self):
        source = (ROOT / "public" / "index.html").read_text(encoding="utf-8")

        self.assertIn('id="adminRawOwnerFilter"', source)
        self.assertIn('id="adminRawOwnerFilterText"', source)
        self.assertIn('id="clearAdminRawOwnerFilter"', source)

    def test_raw_data_view_uses_dataset_cards_instead_of_a_large_row_table(self):
        html = (ROOT / "public" / "index.html").read_text(encoding="utf-8")
        script = (ROOT / "public" / "app.js").read_text(encoding="utf-8")
        styles = (ROOT / "public" / "style.css").read_text(encoding="utf-8")

        self.assertIn('id="adminRawDatasetList"', html)
        self.assertIn("업로드 Dataset 관리", html)
        self.assertIn("새로고침", unescape(html))
        self.assertNotIn(unescape("&#49352;&#47160;&#44256;&#52840;"), unescape(html))
        self.assertNotIn("&#50896;&#48376; &#54665;", html)
        self.assertNotIn('id="adminRawDatasetSelect"', html)
        self.assertNotIn('id="adminRawDataTableWrap"', html)
        self.assertNotIn('id="adminRawPrevious"', html)
        self.assertNotIn('id="adminRawNext"', html)
        self.assertIn("adminRawDatasetCard", script)
        self.assertIn("data-admin-raw-download", script)
        self.assertIn("downloadAdminRawDataset", script)
        self.assertIn(".adminRawDatasetGrid", styles)
        self.assertIn(".adminRawDatasetCard", styles)


if __name__ == "__main__":
    unittest.main()
