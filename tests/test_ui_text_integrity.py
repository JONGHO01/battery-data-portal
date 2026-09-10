from html import unescape
from pathlib import Path
import re
import unittest


PROJECT_ROOT = Path(__file__).resolve().parents[1]


class UiTextIntegrityTests(unittest.TestCase):
    def test_frontend_source_has_no_mojibake_or_replacement_character(self):
        source = (PROJECT_ROOT / "public" / "app.js").read_text(encoding="utf-8")

        # The app has no intentional CJK ideographs. Their presence means UTF-8
        # Korean was decoded through a legacy code page and must be repaired.
        self.assertTrue(source.isascii(), "public/app.js must use ASCII plus Unicode escapes to avoid Windows code-page corruption")
        self.assertNotIn(chr(0xFFFD), source)

    def test_frontend_source_has_no_repeated_question_mark_garbling(self):
        source = (PROJECT_ROOT / "public" / "app.js").read_text(encoding="utf-8")

        # Single question marks are valid JavaScript syntax. A repeated run in
        # this source is a text-corruption symptom and must not ship.
        self.assertNotIn("???", source)

    def test_static_html_does_not_render_literal_unicode_escape_text(self):
        html = (PROJECT_ROOT / "public" / "index.html").read_text(encoding="utf-8")
        rendered_html = unescape(html)

        # HTML does not interpret JavaScript-style Unicode escapes. Any such
        # sequence becomes visible as literal backslash-u text in the portal.
        self.assertNotRegex(html, r"\\u[0-9a-fA-F]{4}")
        self.assertIn("이전 250행", rendered_html)
        self.assertIn("다음 250행", rendered_html)

    def test_home_status_uses_the_readable_menu_label(self):
        source = (PROJECT_ROOT / "public" / "app.js").read_text(encoding="utf-8")
        home_source = source[source.index("function showHome()") : source.index("function showWorkspace()")]

        self.assertIn(r'setStatus("\uba54\ub274");', home_source)
        self.assertNotIn(r'\uf9ce\ubdbe\ub3f1', home_source)

    def test_search_all_labels_use_readable_unicode_escapes(self):
        source = (PROJECT_ROOT / "public" / "app.js").read_text(encoding="utf-8")

        type_source = source[
            source.index("function typeDisplay(type)"):source.index("function renderSearchResults()")
        ]
        date_source = source[
            source.index("function renderDateOptions()"):source.index("function showDatasetImmediately(d)")
        ]

        self.assertIn(r'all: "\uc804\uccb4"', type_source)
        self.assertIn(r'<option value="">\uc804\uccb4 \ub0a0\uc9dc</option>', date_source)
        self.assertNotIn(r'?\uafa9\uaedc', type_source + date_source)
        self.assertNotIn(r'?\uc88e\ucb68', date_source)

    def test_login_screen_does_not_advertise_the_administrator_identifier(self):
        html = (PROJECT_ROOT / "public" / "index.html").read_text(encoding="utf-8")

        self.assertNotIn("관리자 계정:", html)
        self.assertNotIn("qq035786", html)
