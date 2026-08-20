"""Static regression coverage for the member saved-files action."""

import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class AdminMemberSavedFilesColumnTests(unittest.TestCase):
    def test_member_table_exposes_a_dedicated_saved_files_column(self):
        html = (ROOT / "public" / "index.html").read_text(encoding="utf-8")
        script = (ROOT / "public" / "app.js").read_text(encoding="utf-8")
        styles = (ROOT / "public" / "style.css").read_text(encoding="utf-8")

        self.assertIn('<th class="memberFilesHeader">저장 파일</th>', html)
        self.assertIn(r"\uc800\uc7a5 \ud30c\uc77c \ubcf4\uae30", script)
        self.assertIn('class="memberFileCell"', script)
        self.assertIn('class="memberManageActions"', script)
        self.assertIn(".memberFileCell", styles)
        self.assertIn(".memberManageActions", styles)


if __name__ == "__main__":
    unittest.main()
