"""Static regression checks for the administrator release-history screen."""

from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


class ReleaseHistoryUiTests(unittest.TestCase):
    def test_admin_release_history_tab_and_view_are_present(self):
        html = (ROOT / "public" / "index.html").read_text(encoding="utf-8")

        self.assertIn('class="tab adminOnly" data-view="releaseHistory"', html)
        self.assertIn('id="releaseHistoryView"', html)
        self.assertIn('id="releaseHistoryList"', html)

    def test_release_history_uses_the_current_version_and_readme_documents_it(self):
        app_js = (ROOT / "public" / "app.js").read_text(encoding="utf-8")
        readme = (ROOT / "README.md").read_text(encoding="utf-8")
        version = (ROOT / "VERSION").read_text(encoding="utf-8").strip()

        self.assertIn(f'const PORTAL_VERSION = "{version}";', app_js)
        self.assertIn("const RELEASE_HISTORY = [", app_js)
        self.assertIn(f'"version": "{version}"', app_js)
        self.assertIn(r'releaseHistory: "\ubc84\uc804 \uc774\ub825"', app_js)
        self.assertIn("## " + "\ubc84\uc804 \uc774\ub825", readme)
        self.assertIn("CHANGELOG.md", readme)


if __name__ == "__main__":
    unittest.main()
