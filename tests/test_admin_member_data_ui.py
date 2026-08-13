"""Static regression coverage for member-scoped administrator data browsing."""

import unittest
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


if __name__ == "__main__":
    unittest.main()
