"""Regression checks for the desktop navigation layout."""

from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


class NavigationLayoutTests(unittest.TestCase):
    def test_desktop_registration_sidebar_has_room_for_file_status(self):
        css = (ROOT / "public" / "style.css").read_text(encoding="utf-8")
        layout = css.split(".layout {", 1)[1].split("}", 1)[0]

        self.assertIn(
            "grid-template-columns: minmax(420px, 450px) minmax(0, 1fr);",
            layout,
        )

    def test_global_menu_keeps_each_menu_button_at_its_natural_width(self):
        css = (ROOT / "public" / "style.css").read_text(encoding="utf-8")
        global_menu = css.split(".globalMenu {", 1)[1].split("}", 1)[0]
        menu_group = css.split(".menuGroup {", 1)[1].split("}", 1)[0]

        self.assertIn("flex-wrap: nowrap;", global_menu)
        self.assertIn("overflow-x: auto;", global_menu)
        self.assertIn("flex: 0 0 auto;", menu_group)

    def test_experiment_storage_panel_is_hidden_in_standard_registration(self):
        html = (ROOT / "public" / "index.html").read_text(encoding="utf-8")

        self.assertIn('<section class="panel hierarchyPanel" hidden>', html)

    def test_search_result_cards_keep_both_action_buttons_inside_each_card(self):
        css = (ROOT / "public" / "style.css").read_text(encoding="utf-8")
        card = css.split(".searchResultCard {", 2)[2].split("}", 1)[0]
        open_button = css.split(".searchResultOpen {", 1)[1].split("}", 1)[0]
        actions = css.split(".searchResultActions {", 1)[1].split("}", 1)[0]

        self.assertIn("min-width: 0;", card)
        self.assertIn("overflow: hidden;", card)
        self.assertIn("min-width: 0;", open_button)
        self.assertIn("width: 100%;", actions)
        self.assertIn("min-width: 0;", actions)


if __name__ == "__main__":
    unittest.main()
