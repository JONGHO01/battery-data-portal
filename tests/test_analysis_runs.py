import os
import tempfile
import unittest


_TEMP_DIR = tempfile.mkdtemp(prefix="battery-portal-analysis-run-test-")
os.environ["DATA_DIR"] = _TEMP_DIR
os.environ["STORAGE_BACKEND"] = "local"
os.environ["BOOTSTRAP_ADMIN_PASSWORD"] = "test-only-admin-password"

import python_backend as portal


class AnalysisRunPersistenceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        portal.init_db()
        with portal.connect() as conn:
            portal.execute(
                conn,
                "INSERT INTO users(id, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING",
                ("analysis-user", "Analysis User", portal.hash_password("password"), "user", portal.now_iso()),
            )

    def test_analysis_run_uses_canonical_rows_and_saves_a_separate_artifact(self):
        user = {"id": "analysis-user", "name": "Analysis User", "role": "user"}
        with portal.connect() as conn:
            dataset = portal.save_dataset(
                conn,
                {
                    "id": "DATA-ANALYSIS-RUN-TEST",
                    "ownerId": user["id"],
                    "ownerName": user["name"],
                    "dataType": "cyc",
                    "figureKind": "cycling-performance",
                    "cell": {"cellId": "CELL-ANALYSIS"},
                    "rows": [{"cycle": 1, "capacity": 1}],
                    "columns": ["cycle", "capacity"],
                    "parsedArtifact": portal.write_dataset_artifact(
                        portal.json_dumps(
                            {
                                "canonicalRows": [
                                    {"cycle_index": 1, "specific_capacity_mah_g": 160},
                                    {"cycle_index": 2, "specific_capacity_mah_g": 152},
                                ]
                            }
                        ).encode("utf-8"),
                        "projects/unassigned/cells/cell-analysis/datasets/data-analysis-run-test/parsed/normalized.json",
                        "application/json",
                    ),
                },
            )
            run = portal.create_analysis_run(conn, dataset, user, "retention", {})
            stored = portal.list_analysis_runs(conn, dataset["id"])

        self.assertEqual(run["status"], "ok")
        self.assertEqual(run["result"]["initial_capacity_mah_g"], 160.0)
        self.assertEqual(len(stored), 1)
        self.assertTrue((portal.DATA_DIR / run["artifact"]["localPath"]).exists())
        self.assertEqual(stored[0]["provenance"]["rowSource"], "parsed-artifact")

    def test_dataset_analysis_api_creates_and_lists_only_the_dataset_runs(self):
        user = {"id": "analysis-user", "name": "Analysis User", "role": "user"}
        with portal.connect() as conn:
            portal.save_dataset(
                conn,
                {
                    "id": "DATA-ANALYSIS-API-TEST",
                    "ownerId": user["id"],
                    "ownerName": user["name"],
                    "dataType": "cyc",
                    "figureKind": "cycling-performance",
                    "cell": {"cellId": "CELL-API"},
                    "rows": [
                        {"cycle": 1, "capacity": 150},
                        {"cycle": 2, "capacity": 145},
                    ],
                    "columns": ["cycle", "capacity"],
                },
            )

        created = portal.create_dataset_analysis(
            "DATA-ANALYSIS-API-TEST", {"analysisName": "retention", "parameters": {}}, user
        )
        listed = portal.list_dataset_analyses("DATA-ANALYSIS-API-TEST", user)

        self.assertEqual(created["analysisName"], "retention")
        self.assertEqual(created["status"], "ok")
        self.assertEqual([item["id"] for item in listed], [created["id"]])


if __name__ == "__main__":
    unittest.main()
