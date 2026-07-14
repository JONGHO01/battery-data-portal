import unittest


from backend.storage_layout import artifact_key, safe_segment


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


if __name__ == "__main__":
    unittest.main()
