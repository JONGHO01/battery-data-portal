import os
import struct
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


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
        self.assertFalse(source_path.exists())
        self.assertEqual(saved["parser"]["name"], "csv")
        self.assertEqual(saved["quality"]["status"], "ok")
        self.assertEqual(saved["analysisProvenance"]["sourceUploadId"], upload_id)

    def test_stale_sde_dataset_is_reparsed_from_its_raw_artifact(self):
        """Legacy SDE rows must not keep frequency values in the Z' column."""

        source = bytearray(112 * 6)
        for point, (frequency, zreal, zimag) in enumerate(
            ((100000.0, 2.8, -0.4), (80000.0, 2.9, -0.5), (63000.0, 3.0, -0.6))
        ):
            offset = point * 112
            struct.pack_into("<f", source, offset, frequency)
            struct.pack_into("<f", source, offset + 28, zreal)
            struct.pack_into("<f", source, offset + 32, zimag)

        user = {"id": "tester", "name": "Tester", "role": "user"}
        dataset_id = "DATA-STALE-SDE-REPAIR-TEST"
        raw_artifact = portal.write_dataset_artifact(
            bytes(source),
            f"projects/repair/cells/repair/datasets/{dataset_id}/raw/legacy.SDE",
            "application/octet-stream",
        )
        legacy_rows = [
            {"sweep": 1, "point": index + 1, "frequency": frequency, "zreal": frequency, "zimag": zimag}
            for index, (frequency, _zreal, zimag) in enumerate(
                ((100000.0, 2.8, -0.4), (80000.0, 2.9, -0.5), (63000.0, 3.0, -0.6))
            )
        ]
        with portal.connect() as conn:
            portal.save_dataset(
                conn,
                {
                    "id": dataset_id,
                    "ownerId": user["id"],
                    "ownerName": user["name"],
                    "dataType": "eis",
                    "sourceName": "legacy.SDE",
                    "cell": {"cellId": "CELL-SDE-REPAIR"},
                    "columns": ["sweep", "point", "frequency", "zreal", "zimag"],
                    "rows": legacy_rows,
                    "rawArtifact": raw_artifact,
                    "parser": {"name": "seo", "version": "parser-2", "mappingVersion": "bdf-map-2"},
                },
                actor_user=user,
            )
            repaired = portal.repair_stale_sde_datasets(conn)
            saved = portal.dataset_from_row(
                portal.execute(conn, "SELECT * FROM datasets WHERE id = ?", (dataset_id,)).fetchone()
            )

        self.assertGreaterEqual(repaired, 1)
        self.assertAlmostEqual(float(saved["rows"][0]["zreal"]), 2.8, places=4)
        self.assertNotEqual(saved["rows"][0]["frequency"], saved["rows"][0]["zreal"])
        self.assertEqual(saved["parser"]["version"], portal.INSTRUMENT_PARSER_VERSION)
        self.assertTrue((portal.DATA_DIR / saved["parsedArtifact"]["localPath"]).exists())

    def test_retrying_a_completed_upload_returns_the_existing_dataset(self):
        """A browser retry must not turn an already saved upload into an error."""

        source = b"cycle,discharge capacity\n1,160\n"
        source_path, _ = portal.save_upload_bytes(source, "retry.csv", "raw")
        parsed = {
            "parser": {"name": "csv", "version": "parser-2"},
            "columnMapping": {"cycle_index": {"source": "cycle"}},
            "quality": {"status": "ok"},
            "canonicalRows": [{"record_index": 1, "cycle_index": 1, "discharge_capacity_mAh": 160.0}],
        }
        user = {"id": "tester", "name": "Tester", "role": "user"}
        with portal.connect() as conn:
            upload_id = portal.create_upload_session(conn, user, "retry.csv", source_path, None, source, parsed)

        def payload():
            return {
                "dataType": "cyc",
                "sourceName": "retry.csv",
                "figureKind": "cycling-performance",
                "cell": {"cellId": "CELL-RETRY"},
                "columns": ["cycle", "discharge capacity"],
                "rows": [{"cycle": 1, "discharge capacity": 160.0}],
                "uploadId": upload_id,
            }

        first = portal.create_dataset(payload(), user)
        retry = portal.create_dataset(payload(), user)

        self.assertEqual(retry["id"], first["id"])
        with portal.connect() as conn:
            count = portal.scalar(
                portal.execute(conn, "SELECT COUNT(*) FROM datasets WHERE id = ?", (first["id"],)).fetchone()
            )
        self.assertEqual(int(count), 1)

    def test_partial_artifact_finalization_cleans_up_the_raw_artifact(self):
        """A parsed-artifact failure must not leave an orphan raw object behind."""

        source = b"cycle,discharge capacity\n1,160\n"
        source_path, _ = portal.save_upload_bytes(source, "cleanup.csv", "raw")
        parsed = {
            "parser": {"name": "csv", "version": "parser-2"},
            "columnMapping": {"cycle_index": {"source": "cycle"}},
            "quality": {"status": "ok"},
            "canonicalRows": [{"record_index": 1, "cycle_index": 1, "discharge_capacity_mAh": 160.0}],
        }
        user = {"id": "tester", "name": "Tester", "role": "user"}
        with portal.connect() as conn:
            upload_id = portal.create_upload_session(conn, user, "cleanup.csv", source_path, None, source, parsed)
            item = portal.save_dataset(
                conn,
                {
                    "id": "DATA-PARTIAL-CLEANUP-TEST",
                    "ownerId": user["id"],
                    "ownerName": user["name"],
                    "dataType": "cyc",
                    "figureKind": "cycling-performance",
                    "cell": {"cellId": "CELL-CLEANUP"},
                    "rows": [{"cycle": 1, "capacity": 160}],
                    "columns": ["cycle", "capacity"],
                },
            )

            raw_artifact = {
                "objectKey": "datasets/DATA-PARTIAL-CLEANUP-TEST/raw/cleanup.csv",
                "localPath": "storage/datasets/DATA-PARTIAL-CLEANUP-TEST/raw/cleanup.csv",
            }
            with patch.object(
                portal,
                "write_dataset_artifact",
                side_effect=[raw_artifact, RuntimeError("parsed artifact failed")],
            ), patch.object(portal, "delete_from_object_storage") as delete_remote:
                with self.assertRaisesRegex(RuntimeError, "parsed artifact failed"):
                    portal.persist_upload_session_artifacts(conn, item, upload_id, user)

        delete_remote.assert_called_once_with(raw_artifact["objectKey"])

    def test_new_upload_of_the_same_source_reuses_dataset_and_figure(self):
        """A freshly inspected duplicate source must not add another Fig card."""

        source = b"cycle,discharge capacity\\n1,160\\n2,155\\n"
        parsed = {
            "parser": {"name": "csv", "version": "parser-2"},
            "columnMapping": {"cycle_index": {"source": "cycle"}},
            "quality": {"status": "ok"},
            "canonicalRows": [
                {"record_index": 1, "cycle_index": 1, "discharge_capacity_mAh": 160.0},
                {"record_index": 2, "cycle_index": 2, "discharge_capacity_mAh": 155.0},
            ],
        }
        user = {"id": "tester", "name": "Tester", "role": "user"}

        def payload(upload_id):
            return {
                "dataType": "cyc",
                "sourceName": "same-source.csv",
                "figureKind": "cycling-performance",
                "cell": {"cellId": "CELL-SAME-SOURCE"},
                "columns": ["cycle", "discharge capacity"],
                "rows": [{"cycle": 1, "discharge capacity": 160.0}],
                "uploadId": upload_id,
            }

        first_path, _ = portal.save_upload_bytes(source, "same-source.csv", "raw")
        with portal.connect() as conn:
            first_upload_id = portal.create_upload_session(conn, user, "same-source.csv", first_path, None, source, parsed)
        first = portal.create_dataset(payload(first_upload_id), user)
        portal.save_figure_record({"datasetId": first["id"], "name": "Same source"}, user)

        second_path, _ = portal.save_upload_bytes(source, "same-source.csv", "raw")
        with portal.connect() as conn:
            second_upload_id = portal.create_upload_session(conn, user, "same-source.csv", second_path, None, source, parsed)
        second = portal.create_dataset(payload(second_upload_id), user)

        self.assertEqual(second["id"], first["id"])
        self.assertTrue(second["reusedExistingSource"])
        self.assertFalse(second_path.exists())
        with portal.connect() as conn:
            dataset_count = portal.scalar(
                portal.execute(conn, "SELECT COUNT(*) FROM datasets WHERE owner_id = ? AND source_name = ?", (user["id"], "same-source.csv")).fetchone()
            )
            figure_count = portal.scalar(
                portal.execute(conn, "SELECT COUNT(*) FROM figures WHERE dataset_id = ?", (first["id"],)).fetchone()
            )
            duplicate_session = portal.execute(conn, "SELECT consumed_dataset_id, local_path FROM upload_sessions WHERE id = ?", (second_upload_id,)).fetchone()
        self.assertEqual(int(dataset_count), 1)
        self.assertEqual(int(figure_count), 1)
        self.assertEqual(duplicate_session["consumed_dataset_id"], first["id"])
        self.assertEqual(duplicate_session["local_path"], "")

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

    def test_saving_the_same_figure_and_report_reuses_their_artifact_paths(self):
        user = {"id": "tester", "name": "Tester", "role": "user"}
        dataset_id = "DATA-DERIVED-REUSE-TEST"
        with portal.connect() as conn:
            portal.save_dataset(
                conn,
                {
                    "id": dataset_id,
                    "ownerId": user["id"],
                    "ownerName": user["name"],
                    "dataType": "cyc",
                    "figureKind": "cycling-performance",
                    "cell": {"cellId": "CELL-REUSE"},
                    "rows": [{"cycle": 1, "capacity": 150}],
                    "columns": ["cycle", "capacity"],
                },
            )

        first_figure = portal.save_figure_record({"datasetId": dataset_id, "name": "First"}, user)
        second_figure = portal.save_figure_record({"datasetId": dataset_id, "name": "Second"}, user)
        first_report = portal.save_report({"datasetId": dataset_id, "reportType": "analysis", "content": {"v": 1}}, user)
        second_report = portal.save_report({"datasetId": dataset_id, "reportType": "analysis", "content": {"v": 2}}, user)

        self.assertEqual(first_figure["id"], second_figure["id"])
        self.assertEqual(first_figure["artifact"]["objectKey"], second_figure["artifact"]["objectKey"])
        self.assertEqual(first_report["id"], second_report["id"])
        self.assertEqual(first_report["artifact"]["objectKey"], second_report["artifact"]["objectKey"])

    def test_figure_identity_uses_dataset_type_and_source_not_shared_cell_id(self):
        """An EIS record linked to a CYC-looking Cell must still be labelled as EIS."""
        user = {"id": "tester", "name": "Tester", "role": "user"}
        dataset_id = "DATA-FIGURE-IDENTITY-EIS-TEST"
        source_name = "TalkFile_260309_PC_PTFE91_100cycle_01.SDE.sde"
        with portal.connect() as conn:
            portal.save_dataset(
                conn,
                {
                    "id": dataset_id,
                    "ownerId": user["id"],
                    "ownerName": user["name"],
                    "dataType": "eis",
                    "figureKind": "eis-combined",
                    "sourceName": source_name,
                    "cell": {"cellId": "260715_NCM622_50mg.cyc_083.wrd"},
                    "rows": [{"frequency": 1000.0, "zreal": 3.1, "zimag": -0.4}],
                    "columns": ["frequency", "zreal", "zimag"],
                },
            )

        figure = portal.save_figure_record(
            {"datasetId": dataset_id, "name": "CYC-looking stale label", "figureKind": "cycling-performance"},
            user,
        )
        self.assertEqual(figure["name"], f"EIS - {source_name}")
        self.assertEqual(figure["figureKind"], "eis-combined")

        with portal.connect() as conn:
            portal.execute(
                conn,
                "UPDATE figures SET name = ?, figure_kind = ? WHERE id = ?",
                ("wrong CYC label", "cycling-performance", figure["id"]),
            )
            portal.normalize_figure_record_identity(conn)
            repaired = portal.execute(conn, "SELECT * FROM figures WHERE id = ?", (figure["id"],)).fetchone()

        self.assertEqual(repaired["name"], f"EIS - {source_name}")
        self.assertEqual(repaired["figure_kind"], "eis-combined")

    def test_deleting_a_dataset_removes_dependent_records_and_local_artifacts(self):
        user = {"id": "tester", "name": "Tester", "role": "user"}
        dataset_id = "DATA-DELETE-CLEANUP-TEST"
        with portal.connect() as conn:
            raw_artifact = portal.write_dataset_artifact(b"raw", f"datasets/{dataset_id}/raw.csv", "text/csv")
            parsed_artifact = portal.write_dataset_artifact(b"parsed", f"datasets/{dataset_id}/parsed.json", "application/json")
            dataset = portal.save_dataset(
                conn,
                {
                    "id": dataset_id,
                    "ownerId": user["id"],
                    "ownerName": user["name"],
                    "dataType": "cyc",
                    "figureKind": "cycling-performance",
                    "cell": {"cellId": "CELL-DELETE"},
                    "rows": [{"cycle": 1, "capacity": 150}],
                    "columns": ["cycle", "capacity"],
                    "rawArtifact": raw_artifact,
                    "parsedArtifact": parsed_artifact,
                },
            )
            analysis = portal.create_analysis_run(conn, dataset, user, "retention", {})

        figure = portal.save_figure_record({"datasetId": dataset_id}, user)
        report = portal.save_report({"datasetId": dataset_id, "reportType": "analysis"}, user)
        artifact_paths = [
            portal.DATA_DIR / raw_artifact["localPath"],
            portal.DATA_DIR / parsed_artifact["localPath"],
            portal.DATA_DIR / analysis["artifact"]["localPath"],
            portal.DATA_DIR / figure["artifact"]["localPath"],
            portal.DATA_DIR / report["artifact"]["localPath"],
        ]

        self.assertEqual(portal.delete_dataset(dataset_id, user), {"ok": True})
        with portal.connect() as conn:
            self.assertIsNone(portal.execute(conn, "SELECT * FROM datasets WHERE id = ?", (dataset_id,)).fetchone())
            self.assertIsNone(portal.execute(conn, "SELECT * FROM analysis_runs WHERE dataset_id = ?", (dataset_id,)).fetchone())
            self.assertIsNone(portal.execute(conn, "SELECT * FROM figures WHERE dataset_id = ?", (dataset_id,)).fetchone())
            self.assertIsNone(portal.execute(conn, "SELECT * FROM reports WHERE dataset_id = ?", (dataset_id,)).fetchone())
        self.assertTrue(all(not path.exists() for path in artifact_paths))

    def test_legacy_analysis_table_is_migrated_before_deleting_its_dataset(self):
        """Live databases created before analysis artifacts must delete safely."""

        user = {"id": "tester", "name": "Tester", "role": "user"}
        dataset_id = "DATA-LEGACY-ANALYSIS-DELETE-TEST"
        with portal.connect() as conn:
            portal.save_dataset(
                conn,
                {
                    "id": dataset_id,
                    "ownerId": user["id"],
                    "ownerName": user["name"],
                    "dataType": "eis",
                    "figureKind": "nyquist-bode",
                    "cell": {"cellId": "CELL-LEGACY-ANALYSIS"},
                    "rows": [{"frequency": 1000, "zreal": 1.5, "zimag": -0.5}],
                    "columns": ["frequency", "zreal", "zimag"],
                },
            )
            execute = portal.execute
            execute(conn, "ALTER TABLE analysis_runs RENAME TO analysis_runs_with_artifact")
            execute(
                conn,
                """
                CREATE TABLE analysis_runs (
                  id TEXT PRIMARY KEY,
                  dataset_id TEXT NOT NULL,
                  owner_id TEXT NOT NULL,
                  analysis_name TEXT NOT NULL,
                  analysis_version TEXT NOT NULL,
                  parameters_json TEXT NOT NULL DEFAULT '{}',
                  result_json TEXT NOT NULL DEFAULT '{}',
                  provenance_json TEXT NOT NULL DEFAULT '{}',
                  created_at TEXT NOT NULL
                )
                """,
            )
            execute(
                conn,
                """
                INSERT INTO analysis_runs(
                  id, dataset_id, owner_id, analysis_name, analysis_version,
                  parameters_json, result_json, provenance_json, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                ("legacy-run", dataset_id, user["id"], "eis", "analysis-0", "{}", "{}", "{}", portal.now_iso()),
            )

        try:
            with portal.connect() as conn:
                portal.ensure_analysis_run_columns(conn)
                self.assertIn("artifact_json", portal.table_columns(conn, "analysis_runs"))

            self.assertEqual(portal.delete_dataset(dataset_id, user), {"ok": True})
            with portal.connect() as conn:
                self.assertIsNone(portal.execute(conn, "SELECT * FROM datasets WHERE id = ?", (dataset_id,)).fetchone())
                self.assertIsNone(portal.execute(conn, "SELECT * FROM analysis_runs WHERE dataset_id = ?", (dataset_id,)).fetchone())
        finally:
            with portal.connect() as conn:
                portal.execute(conn, "DROP TABLE IF EXISTS analysis_runs")
                portal.execute(conn, "ALTER TABLE analysis_runs_with_artifact RENAME TO analysis_runs")


if __name__ == "__main__":
    unittest.main()
