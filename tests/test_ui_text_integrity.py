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

