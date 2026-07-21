import unittest


from backend.storage_layout import artifact_key, safe_filename, safe_segment


class StorageLayoutTests(unittest.TestCase):
    def test_artifact_key_uses_project_cell_dataset_and_kind(self):
        key = artifact_key("Project A", "NCM 622 / 01", "DATA-123", "raw", "cycle data.xlsx")

        self.assertEqual(
            key,
            "projects/project-a/cells/ncm-622-01/datasets/data-123/raw/cycle-data.xlsx",
        )

    def test_empty_hierarchy_values_are_kept_in_a_safe_unassigned_bucket(self):
        self.assertEqual(safe_segment(""), "unassigned")
        self.assertTrue(artifact_key("", "", "DATA-123", "parsed", "normalized.json").startswith("projects/unassigned/"))

    def test_long_artifact_names_are_compacted_for_windows_paths(self):
        key = artifact_key(
            "project-" + "p" * 72,
            "cell-" + "c" * 72,
            "dataset-" + "d" * 72,
            "raw",
            "260416_ncm622_6_1_15mg_0.01483297g_1_0.1_0.33_1_2_3_4_re0.33_.cyc_057.wrd",
        )

        self.assertLessEqual(max(len(part) for part in key.split("/")), 40)
        self.assertTrue(key.endswith(".wrd"))
        self.assertLessEqual(len(safe_filename(key.rsplit("/", 1)[-1])), 40)


if __name__ == "__main__":
    unittest.main()
