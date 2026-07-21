"""Static regression checks for upload-type selection and login submission."""

from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


class UploadSelectionUiTests(unittest.TestCase):
    def setUp(self):
        self.html = (ROOT / "public" / "index.html").read_text(encoding="utf-8")
        self.app_js = (ROOT / "public" / "app.js").read_text(encoding="utf-8")

    def test_login_button_submits_the_login_form_without_a_duplicate_click_handler(self):
        self.assertIn('id="loginButton" type="submit"', self.html)
        self.assertIn('on("loginForm", "submit", safeLogin);', self.app_js)
        self.assertNotIn('on("loginButton", "click", safeLogin);', self.app_js)

    def test_detected_type_choice_comes_before_read_only_column_names(self):
        self.assertIn("typeSelectProminent", self.app_js)
        self.assertIn("detectedTypeChoice selected", self.app_js)
        self.assertIn("columnPreviewHint", self.app_js)
        self.assertLess(self.app_js.index("typeSelectProminent"), self.app_js.index('<div class="columnPreview">'))

    def test_manual_type_dropdown_is_available_without_a_separate_radio_click(self):
        self.assertIn('<select id="manualType">', self.app_js)
        self.assertNotIn('<select id="manualType" ${isUnknown ? "" : "disabled"}>', self.app_js)
        self.assertIn('manualType.addEventListener("change", () => {', self.app_js)
        self.assertIn("manualRadio.checked = true;", self.app_js)

    def test_expired_login_token_returns_the_user_to_the_login_screen(self):
        self.assertIn("function isExpiredLoginResponse(res, body)", self.app_js)
        self.assertIn("function clearExpiredLogin(res, body)", self.app_js)
        self.assertIn("applyUser(null);", self.app_js)
        self.assertIn("if (clearExpiredLogin(res, body)) return;", self.app_js)

    def test_upload_panel_uses_clear_korean_labels(self):
        self.assertIn(r"CYC \ud30c\uc77c\uc744 \ub123\uc73c\uba74 \uc0ac\uc774\ud074, \ubc29\uc804\uc6a9\ub7c9, C-rate\ub97c \uc790\ub3d9 \ud310\ubcc4\ud569\ub2c8\ub2e4.", self.app_js)
        self.assertIn(r'label.textContent = "\uc120\ud0dd\ub41c \ud30c\uc77c \uc5c6\uc74c";', self.app_js)
        self.assertIn(r'files.length}\uac1c \ud30c\uc77c \uc120\ud0dd\ub428:', self.app_js)
        self.assertIn("async function createBatchFigures()", self.app_js)
        self.assertIn(r"\ud30c\uc77c \uc120\ud0dd \uc644\ub8cc", self.app_js)


if __name__ == "__main__":
    unittest.main()
