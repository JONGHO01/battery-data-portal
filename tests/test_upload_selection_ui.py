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
        self.assertLess(
            self.app_js.index("typeSelectProminent"),
            self.app_js.index('<div class="columnPreview">'),
        )

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
        self.assertIn("CYC 파일을 넣으면 사이클, 방전용량, C-rate를 자동 판별합니다.", self.app_js)
        self.assertIn('label.textContent = "선택한 파일 없음";', self.app_js)
        self.assertIn('files.length}개 파일 선택됨:', self.app_js)
        self.assertIn('"여러 파일 분석·Fig 생성" : "파일 분석"', self.app_js)
        self.assertIn('setStatus("파일 선택 완료 - 파일 분석을 눌러주세요.");', self.app_js)


if __name__ == "__main__":
    unittest.main()
