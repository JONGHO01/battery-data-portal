"""Static regression checks for the administrator release-history screen."""

from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


class ReleaseHistoryUiTests(unittest.TestCase):
    def test_admin_release_history_tab_and_view_are_present(self):
        html = (ROOT / "public" / "index.html").read_text(encoding="utf-8")

        self.assertIn('class="tab adminOnly" data-view="releaseHistory"', html)

    def test_admin_user_directory_is_visible_from_the_management_menu(self):
        html = (ROOT / "public" / "index.html").read_text(encoding="utf-8")
        app_js = (ROOT / "public" / "app.js").read_text(encoding="utf-8")

        self.assertIn('data-view="users"', html)
        self.assertIn('id="usersSummary"', html)
        self.assertIn('user.organizations', app_js)
        self.assertIn('user.createdAt', app_js)
        self.assertIn('id="releaseHistoryView"', html)
        self.assertIn('id="releaseHistoryList"', html)

    def test_user_directory_offers_password_reset_without_rendering_password_fields(self):
        app_js = (ROOT / "public" / "app.js").read_text(encoding="utf-8")

        self.assertIn('data-reset-user', app_js)
        self.assertIn('function resetUserPassword', app_js)
        self.assertIn('/password`', app_js)
        self.assertNotIn('user.password', app_js)

    def test_organization_chart_uses_existing_membership_roles(self):
        html = (ROOT / "public" / "index.html").read_text(encoding="utf-8")
        app_js = (ROOT / "public" / "app.js").read_text(encoding="utf-8")
        css = (ROOT / "public" / "style.css").read_text(encoding="utf-8")

        self.assertIn('id="organizationChart"', html)
        self.assertIn("function renderOrganizationChart", app_js)
        self.assertIn('role: "owner"', app_js)
        self.assertIn('role: "admin"', app_js)
        self.assertIn('role: "researcher"', app_js)
        self.assertIn('role: "viewer"', app_js)
        self.assertIn("state.organizationMembers", app_js)
        self.assertIn(".organizationChartGroup", css)

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
