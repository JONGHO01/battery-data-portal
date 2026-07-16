"""Regression checks for the portal's figure terminology."""

from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


class FigTerminologyUiTests(unittest.TestCase):
    def test_portal_ui_uses_fig_not_the_old_korean_loanword(self):
        for relative_path in (
            "public/index.html",
            "public/app.js",
            "server.js",
            "README.md",
        ):
            content = (ROOT / relative_path).read_text(encoding="utf-8")
            self.assertIn("Fig", content, relative_path)
            self.assertNotIn("피겨", content, relative_path)


if __name__ == "__main__":
    unittest.main()
