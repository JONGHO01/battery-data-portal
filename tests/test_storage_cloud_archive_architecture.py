import hashlib
import json
import gc
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import python_backend as portal


def dataset_row(**overrides):
    values = {
        "id": "DATA-CLOUD-001",
        "owner_id": "member-a",
        "owner_name": "Member A",
        "data_type": "cyc",
        "figure_kind": "cycling-performance",
        "created_at": "2026-08-25T01:02:03+00:00",
        "updated_at": "2026-08-25T01:02:03+00:00",
        "cell_json": "{}",
        "rows_json": "[]",
        "row_count": 2,
        "rows_storage": "artifact",
        "columns_json": '["cycle_index", "voltage_v"]',
        "source_name": "member-cycle.wrd",
        "figure_edits_json": "{}",
        "project_id": "project-a",
        "campaign_id": "campaign-a",
        "cell_record_id": "cell-a",
        "dataset_group_id": "group-a",
        "organization_id": "",
        "raw_artifact_json": "{}",
        "parsed_artifact_json": json.dumps(
            {
                "objectKey": "projects/project-a/cells/cell-a/datasets/data-cloud-001/parsed/normalized.json",
                "localPath": "",
                "storageUrl": "s3://portal-bucket/projects/project-a/parsed/normalized.json",
            }
        ),
        "column_mapping_json": "{}",
        "quality_json": "{}",
        "parser_json": "{}",
        "analysis_provenance_json": "{}",
    }
    values.update(overrides)
    return values


class CloudDatasetArchitectureTests(unittest.TestCase):
    def test_artifact_row_mode_keeps_only_the_count_in_postgresql(self):
        item = {
            "rows": [{"cycle_index": 1}, {"cycle_index": 2}],
            "parsedArtifact": {"objectKey": "datasets/one/parsed/normalized.json"},
        }

        with patch.multiple(portal, DATABASE_ROWS_MODE="artifact", USE_POSTGRES=True):
            rows, row_count, rows_storage = portal.database_rows_payload(item)

        self.assertEqual(rows, [])
        self.assertEqual(row_count, 2)
        self.assertEqual(rows_storage, "artifact")

    def test_dataset_detail_hydrates_fig_rows_from_object_storage(self):
        canonical_rows = [
            {"cycle_index": 1, "voltage_v": 3.6},
            {"cycle_index": 2, "voltage_v": 3.7},
        ]
        stored_document = json.dumps({"canonicalRows": canonical_rows}).encode("utf-8")

        with patch.object(portal, "read_object_storage_bytes", return_value=stored_document):
            detail = portal.dataset_detail_from_row(dataset_row())

        self.assertEqual(detail["rows"], canonical_rows)
        self.assertEqual(detail["rowCount"], 2)
        self.assertEqual(detail["rowsStorage"], "artifact")
        self.assertTrue(detail["rowsLoaded"])

    def test_compact_dataset_list_keeps_the_exact_row_count(self):
        compact = portal.dataset_from_row(dataset_row(row_count=123), include_rows=False)

        self.assertFalse(compact["rowsLoaded"])
        self.assertEqual(compact["rows"], [])
        self.assertEqual(compact["rowCount"], 123)

    def test_artifact_row_edit_rewrites_the_normalized_document(self):
        item = {
            "id": "data-edit",
            "columns": ["cycle_index"],
            "columnMapping": {"cycle_index": "cycle_index"},
            "quality": {},
            "parser": {"name": "test"},
            "parsedArtifact": {
                "objectKey": "projects/project-a/cells/cell-a/datasets/data-edit/parsed/normalized.json",
            },
        }
        replacement_rows = [{"cycle_index": 3}]

        with patch.object(portal, "write_dataset_artifact", return_value={"objectKey": item["parsedArtifact"]["objectKey"]}) as writer:
            artifact = portal.rewrite_normalized_artifact_rows(item, replacement_rows)

        document = json.loads(writer.call_args.args[0].decode("utf-8"))
        self.assertEqual(document["canonicalRows"], replacement_rows)
        self.assertEqual(artifact["objectKey"], item["parsedArtifact"]["objectKey"])


class ArchiveRegistryTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory(
            prefix="battery-portal-archive-registry-",
            ignore_cleanup_errors=True,
        )
        self.root = Path(self.temp_dir.name)
        self.patches = patch.multiple(
            portal,
            USE_POSTGRES=False,
            SQLITE_DB=self.root / "portal.sqlite3",
            DATA_DIR=self.root,
            UPLOAD_DIR=self.root / "uploads",
            ARTIFACT_DIR=self.root / "storage",
            USERS_JSON=self.root / "users.json",
            DATASETS_JSON=self.root / "datasets.json",
            BOOTSTRAP_ADMIN_PASSWORD="test-only-bootstrap-password",
        )
        self.patches.start()
        portal.init_db()

    def tearDown(self):
        self.patches.stop()
        gc.collect()
        self.temp_dir.cleanup()

    def test_archive_agent_token_is_required(self):
        with patch.object(portal, "ARCHIVE_AGENT_TOKEN", "archive-agent-secret-for-tests"):
            with self.assertRaises(portal.HTTPException) as missing:
                portal.require_archive_agent(None)
            with self.assertRaises(portal.HTTPException) as wrong:
                portal.require_archive_agent("wrong-token")
            self.assertTrue(portal.require_archive_agent("archive-agent-secret-for-tests"))

        self.assertEqual(missing.exception.status_code, 401)
        self.assertEqual(wrong.exception.status_code, 401)

    def test_raw_artifact_is_queued_and_only_verified_after_hash_match(self):
        raw = b"raw battery data"
        artifact = {
            "objectKey": "projects/project-a/cells/cell-a/datasets/data-a/raw/source.wrd",
            "sizeBytes": len(raw),
            "sha256": hashlib.sha256(raw).hexdigest(),
            "contentType": "application/octet-stream",
        }
        dataset = {
            "id": "data-a",
            "ownerId": "member-a",
            "ownerName": "Member A",
            "sourceName": "source.wrd",
            "createdAt": "2026-08-25T01:02:03+00:00",
        }

        with portal.connect() as conn:
            archive_id = portal.register_archive_artifact(conn, dataset, artifact, "raw")
            queued = portal.list_archive_artifacts(conn, state="pending", limit=10)

            with self.assertRaises(portal.HTTPException) as mismatch:
                portal.verify_archive_artifact(
                    conn,
                    archive_id,
                    size_bytes=len(raw),
                    sha256="0" * 64,
                    device_id="lab-workspace",
                    relative_path="member-a/2026/08/25/data-a/source.wrd",
                )

            verified = portal.verify_archive_artifact(
                conn,
                archive_id,
                size_bytes=len(raw),
                sha256=artifact["sha256"],
                device_id="lab-workspace",
                relative_path="member-a/2026/08/25/data-a/source.wrd",
            )

        self.assertEqual(mismatch.exception.status_code, 409)
        self.assertEqual(len(queued), 1)
        self.assertEqual(queued[0]["archiveId"], archive_id)
        self.assertEqual(queued[0]["backupState"], "pending")
        self.assertEqual(verified["backupState"], "verified")
        self.assertTrue(verified["isCleanupEligible"])


class LocalArchiveAgentTests(unittest.TestCase):
    def test_administrator_storage_status_names_b2(self):
        app_source = (Path(__file__).resolve().parents[1] / "public" / "app.js").read_text(encoding="utf-8")

        self.assertIn('storage?.provider === "b2" ? "B2"', app_source)
        self.assertIn("${storageProviderLabel} \\uc6d0\\ubcf8", app_source)

    def test_archive_path_is_partitioned_by_owner_date_and_dataset(self):
        from scripts.archive_agent import archive_relative_path

        relative = archive_relative_path(
            {
                "ownerId": "member/../../a",
                "createdAt": "2026-08-25T01:02:03+00:00",
                "datasetId": "DATA:001",
                "sourceName": "cycle source.wrd",
            }
        )

        self.assertEqual(relative.as_posix(), "member-a/2026/08/25/data-001/cycle-source.wrd")
        self.assertNotIn("..", relative.parts)

    def test_archive_token_is_never_sent_over_public_plain_http(self):
        from scripts.archive_agent import validate_portal_url

        self.assertEqual(validate_portal_url("https://portal.example.com/"), "https://portal.example.com")
        self.assertEqual(validate_portal_url("http://localhost:4174"), "http://localhost:4174")
        with self.assertRaises(ValueError):
            validate_portal_url("http://portal.example.com")


class B2DeploymentContractTests(unittest.TestCase):
    def test_b2_environment_and_operator_guide_stay_aligned(self):
        root = Path(__file__).resolve().parents[1]
        env_example = (root / ".env.example").read_text(encoding="utf-8")
        render_yaml = (root / "render.yaml").read_text(encoding="utf-8")
        operator_guide = (root / "docs" / "B2_LOCAL_ARCHIVE.md").read_text(encoding="utf-8")

        self.assertIn("S3_PROVIDER=b2", env_example)
        self.assertIn("S3_ENDPOINT_URL=https://s3.<B2_REGION>.backblazeb2.com", env_example)
        self.assertIn("S3_REGION=<B2_REGION>", env_example)
        self.assertIn('key: S3_PROVIDER\n        value: "b2"', render_yaml)
        self.assertIn('key: S3_REGION\n        sync: false', render_yaml)
        self.assertIn("Read and Write", operator_guide)
        self.assertIn("https://s3.<B2_REGION>.backblazeb2.com", operator_guide)
        self.assertIn("S3_PUBLIC_BASE_URL=", operator_guide)


if __name__ == "__main__":
    unittest.main()
