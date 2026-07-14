import os
import tempfile
import unittest
from pathlib import Path


_TEMP_DIR = tempfile.mkdtemp(prefix="battery-portal-artifact-test-")
os.environ["DATA_DIR"] = _TEMP_DIR
os.environ["STORAGE_BACKEND"] = "local"
os.environ["BOOTSTRAP_ADMIN_PASSWORD"] = "test-only-admin-password"

import python_backend as portal


class DatasetArtifactTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        portal.init_db()
        with portal.connect() as conn:
            portal.execute(
                conn,
                "INSERT INTO users(id, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING",
                ("tester", "Tester", portal.hash_password("password"), "user", portal.now_iso()),
            )

    def test_inspected_upload_becomes_raw_and_parsed_dataset_artifacts(self):
        source = b"cycle,voltage,current\n1,3.7,10\n2,3.6,10\n"
        source_path, _ = portal.save_upload_bytes(source, "cycle.csv", "raw")
        parsed = {
            "parser": {"name": "csv", "version": "parser-2", "mappingVersion": "bdf-map-1"},
            "columnMapping": {"cycle_index": {"source": "cycle"}},
            "quality": {"status": "ok", "counts": {"ok": 2, "review": 0, "exclude": 0}},
            "canonicalRows": [
                {"record_index": 1, "cycle_index": 1, "voltage_v": 3.7, "current_a": 0.01},
                {"record_index": 2, "cycle_index": 2, "voltage_v": 3.6, "current_a": 0.01},
            ],
        }
        user = {"id": "tester", "name": "Tester", "role": "user"}
        with portal.connect() as conn:
            upload_id = portal.create_upload_session(conn, user, "cycle.csv", source_path, None, source, parsed)
            item = portal.save_dataset(
                conn,
                {
                    "id": "DATA-ARTIFACT-TEST",
                    "ownerId": "tester",
                    "ownerName": "Tester",
                    "dataType": "cyc",
                    "figureKind": "cycling-performance",
                    "cell": {"cellId": "CELL-01"},
                    "columns": ["cycle", "voltage", "current"],
                    "rows": [{"cycle": 1, "capacity": 160}],
                },
            )
            item.update(portal.persist_upload_session_artifacts(conn, item, upload_id, user))
            portal.save_dataset(conn, item)
            saved = portal.dataset_from_row(portal.execute(conn, "SELECT * FROM datasets WHERE id = ?", (item["id"],)).fetchone())

        self.assertTrue((portal.DATA_DIR / saved["rawArtifact"]["localPath"]).exists())
        self.assertTrue((portal.DATA_DIR / saved["parsedArtifact"]["localPath"]).exists())
        self.assertEqual(saved["parser"]["name"], "csv")
        self.assertEqual(saved["quality"]["status"], "ok")
        self.assertEqual(saved["analysisProvenance"]["sourceUploadId"], upload_id)

    def test_saved_figure_and_report_keep_reproducible_artifacts(self):
        user = {"id": "tester", "name": "Tester", "role": "user"}
        with portal.connect() as conn:
            portal.save_dataset(
                conn,
                {
                    "id": "DATA-DERIVED-ARTIFACT-TEST",
                    "ownerId": user["id"],
                    "ownerName": user["name"],
                    "dataType": "cyc",
                    "figureKind": "cycling-performance",
                    "cell": {"cellId": "CELL-DERIVED"},
                    "rows": [{"cycle": 1, "capacity": 150}],
                    "columns": ["cycle", "capacity"],
                },
            )

        figure = portal.save_figure_record(
            {"datasetId": "DATA-DERIVED-ARTIFACT-TEST", "name": "Retention", "edits": {"aspect": "4:3"}},
            user,
        )
        report = portal.save_report(
            {"datasetId": "DATA-DERIVED-ARTIFACT-TEST", "reportType": "analysis", "content": {"main": "Stable"}},
            user,
        )

        self.assertTrue((portal.DATA_DIR / figure["artifact"]["localPath"]).exists())
        self.assertTrue((portal.DATA_DIR / report["artifact"]["localPath"]).exists())
        self.assertIn("/figure/", figure["artifact"]["objectKey"])
        self.assertIn("/report/", report["artifact"]["objectKey"])


if __name__ == "__main__":
    unittest.main()
