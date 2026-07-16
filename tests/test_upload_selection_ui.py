"""Static regression checks for upload-type selection and login submission."""

from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


class UploadSelectionUiTests(unittest.TestCase):
    def setUp(self):
        self.html = (ROOT / "public" / "index.html").read_text(encoding="utf-8")
        self.app_js = (ROOT / "public" / "app.js").read_text(encoding="utf-8")

    def test_login_button_submits_the_login_form_without_a_duplicate_click_handler(self):
        self.assertIn('<button id="loginButton" type="submit">로그인</button>', self.html)
        self.assertIn('on("loginForm", "submit", safeLogin);', self.app_js)
        self.assertNotIn('on("loginButton", "click", safeLogin);', self.app_js)

    def test_detected_type_choice_comes_before_read_only_column_names(self):
        self.assertIn('typeSelectProminent', self.app_js)
        self.assertIn('자동 선택됨:', self.app_js)
        self.assertIn('columnPreviewHint', self.app_js)
        self.assertLess(
            self.app_js.index('typeSelectProminent'),
            self.app_js.index('<div class="columnPreview">'),
        )

    def test_manual_type_dropdown_is_available_without_a_separate_radio_click(self):
        self.assertIn('<select id="manualType">', self.app_js)
        self.assertNotIn('<select id="manualType" ${isUnknown ? "" : "disabled"}>', self.app_js)
        self.assertIn('manualType.addEventListener("change", () => {', self.app_js)
        self.assertIn('manualRadio.checked = true;', self.app_js)

    def test_expired_login_token_returns_the_user_to_the_login_screen(self):
        self.assertIn('function isExpiredLoginResponse(res, body)', self.app_js)
        self.assertIn('function clearExpiredLogin(res, body)', self.app_js)
        self.assertIn('applyUser(null);', self.app_js)
        self.assertIn('if (clearExpiredLogin(res, body)) return;', self.app_js)


if __name__ == "__main__":
    unittest.main()
