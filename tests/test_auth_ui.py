"""Regression checks for actionable account registration errors in the browser."""

import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class AuthenticationUiTests(unittest.TestCase):
    def test_registration_displays_fastapi_detail_before_generic_fallback(self):
        source = (ROOT / "public" / "app.js").read_text(encoding="utf-8")
        register_block = source[source.index("async function safeRegister"):source.index("async function loadUsers")]
        self.assertIn('body.detail || body.error || "\\uc544\\uc774\\ub514 \\uc0dd\\uc131 \\uc2e4\\ud328"', register_block)

    def test_login_displays_fastapi_detail_before_generic_fallback(self):
        source = (ROOT / "public" / "app.js").read_text(encoding="utf-8")
        login_block = source[source.index("async function safeLogin"):source.index("async function safeRegister")]
        self.assertIn('body.detail || body.error || "\\ub85c\\uadf8\\uc778 \\uc2e4\\ud328"', login_block)


if __name__ == "__main__":
    unittest.main()
