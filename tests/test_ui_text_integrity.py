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

