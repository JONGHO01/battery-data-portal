import unittest
from pathlib import Path


from backend.parsers.router import parser_key_for_path


class ParserRoutingTests(unittest.TestCase):
    def test_routes_supported_extensions_to_dedicated_parsers(self):
        self.assertEqual(parser_key_for_path(Path("sample.wrd")), "wrd")
        self.assertEqual(parser_key_for_path(Path("sample.SEO")), "seo")
        self.assertEqual(parser_key_for_path(Path("sample.xlsx")), "excel")
        self.assertEqual(parser_key_for_path(Path("sample.csv")), "csv")

    def test_rejects_unknown_extensions(self):
        with self.assertRaises(ValueError):
            parser_key_for_path(Path("sample.pdf"))


if __name__ == "__main__":
    unittest.main()
