"""Duplicate-name import tests use only an isolated local test database."""
import tempfile
import gc
import unittest
from pathlib import Path
from unittest.mock import patch

import python_backend as p


class DatasetImportTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory(prefix="portal-import-test-")
        root = Path(cls.temp.name)
        cls.paths = patch.multiple(p, DATA_DIR=root, UPLOAD_DIR=root / "uploads",
                                  ARTIFACT_DIR=root / "storage", SQLITE_DB=root / "test.sqlite3",
                                  USE_POSTGRES=False, STORAGE_BACKEND="local")
        cls.paths.start()
        p.init_db()
        cls.user = {"id": "import-owner", "name": "Owner", "role": "user"}
        cls.other = {"id": "import-other", "name": "Other", "role": "user"}
        with p.connect() as conn:
            for user in (cls.user, cls.other):
                p.execute(conn, "INSERT INTO users(id,name,password_hash,role,created_at) VALUES (?,?,?,?,?)",
                          (user["id"], user["name"], "test-only", user["role"], p.now_iso()))

    @classmethod
    def tearDownClass(cls):
        cls.paths.stop()
        gc.collect()
        cls.temp.cleanup()

    def seed(self, name, owner=None):
        owner = owner or self.user
        item_id = "IMPORT-" + p.secrets.token_hex(8)
        artifact = p.write_dataset_artifact(b"old original", f"tests/{item_id}/raw.csv", "text/csv")
        with p.connect() as conn:
            item = p.save_dataset(conn, {"id": item_id, "ownerId": owner["id"],
                "ownerName": owner["name"], "dataType": "cyc", "sourceName": name,
                "rows": [{"cycle": 1, "capacity": 150}], "rawArtifact": artifact})
        return item

    def payload(self, name):
        source = b"cycle,capacity\n1,160\n2,158\n"
        path, _ = p.save_upload_bytes(source, name, "raw")
        with p.connect() as conn:
            upload_id = p.create_upload_session(conn, self.user, name, path, None, source,
                {"canonicalRows": [{"cycle": 1, "capacity": 160}, {"cycle": 2, "capacity": 158}]})
        return {"uploadId": upload_id, "sourceName": name, "dataType": "cyc",
                "rows": [{"cycle": 1, "capacity": 160}], "columns": ["cycle", "capacity"]}

    def collision(self, payload):
        with self.assertRaises(p.HTTPException) as error:
            p.import_dataset(payload, self.user)
        self.assertEqual(error.exception.status_code, 409)
        self.assertEqual(error.exception.detail["code"], "duplicate_source_name")
        return error.exception.detail["conflicts"]

    def exists(self, item_id):
        with p.connect() as conn:
            return p.execute(conn, "SELECT id FROM datasets WHERE id=?", (item_id,)).fetchone() is not None

    def test_duplicate_requires_confirmation_and_keeps_original(self):
        old = self.seed("Confirm.csv")
        matches = self.collision(self.payload("confirm.csv"))
        self.assertEqual([x["id"] for x in matches], [old["id"]])
        self.assertTrue(self.exists(old["id"]))
        self.assertTrue((p.DATA_DIR / old["rawArtifact"]["localPath"]).exists())

    def test_confirmation_removes_old_artifacts_and_linked_records(self):
        old = self.seed("replace.csv")
        figure = p.save_figure_record({"datasetId": old["id"]}, self.user)
        with p.connect() as conn:
            p.execute(conn, "INSERT INTO workspace_profiles VALUES (?,?,?,?)", (old["id"], "{}", 1, p.now_iso()))
            p.execute(conn, "INSERT INTO workspace_versions VALUES (?,?,?,?,?)",
                      ("VERSION-" + old["id"], old["id"], self.user["id"], "{}", p.now_iso()))
        payload = self.payload("replace.csv")
        payload["replaceExisting"] = self.collision(payload)
        result = p.import_dataset(payload, self.user)
        self.assertEqual(result["deletedIds"], [old["id"]])
        self.assertEqual(result["deleteFailures"], [])
        self.assertFalse(self.exists(old["id"]))
        with p.connect() as conn:
            for table in ("workspace_profiles", "workspace_versions"):
                self.assertIsNone(p.execute(conn, f"SELECT dataset_id FROM {table} WHERE dataset_id=?", (old["id"],)).fetchone())
        self.assertTrue(self.exists(result["dataset"]["id"]))
        self.assertFalse((p.DATA_DIR / old["rawArtifact"]["localPath"]).exists())
        self.assertFalse((p.DATA_DIR / figure["artifact"]["localPath"]).exists())
        self.assertTrue((p.DATA_DIR / result["dataset"]["rawArtifact"]["localPath"]).exists())

    def test_other_owner_is_not_a_duplicate_even_for_admin_actor(self):
        old = self.seed("private.csv", self.other)
        result = p.import_dataset(self.payload("private.csv"), {**self.user, "role": "admin"})
        self.assertEqual(result["deletedIds"], [])
        self.assertTrue(self.exists(old["id"]))

    def test_forged_delete_target_and_stale_confirmation_are_rejected(self):
        old = self.seed("stale.csv")
        payload = self.payload("stale.csv")
        matches = self.collision(payload)
        payload["replaceExisting"] = [{**matches[0], "id": "another-owner"}]
        self.collision(payload)
        payload["replaceExisting"] = matches
        with p.connect() as conn:
            p.execute(conn, "UPDATE datasets SET updated_at=? WHERE id=?", ("changed", old["id"]))
        self.collision(payload)
        self.assertTrue(self.exists(old["id"]))

    def test_save_failure_never_deletes_old_source(self):
        old = self.seed("save-fail.csv")
        payload = self.payload("save-fail.csv")
        payload["replaceExisting"] = self.collision(payload)
        with patch.object(p, "persist_upload_session_artifacts", side_effect=RuntimeError("test storage failure")):
            with self.assertRaises(p.HTTPException):
                p.import_dataset(payload, self.user)
        self.assertTrue(self.exists(old["id"]))
        self.assertTrue((p.DATA_DIR / old["rawArtifact"]["localPath"]).exists())

    def test_deletion_failure_keeps_saved_new_file_and_reports_partial_result(self):
        old = self.seed("delete-fail.csv")
        payload = self.payload("delete-fail.csv")
        payload["replaceExisting"] = self.collision(payload)
        with patch.object(p, "delete_artifact", side_effect=RuntimeError("test deletion failure")):
            result = p.import_dataset(payload, self.user)
        self.assertEqual(result["deletedIds"], [])
        self.assertEqual(result["deleteFailures"], [old["id"]])
        self.assertTrue(self.exists(result["dataset"]["id"]))
        self.assertTrue(self.exists(old["id"]))

    def test_session_filename_wins_and_consumed_upload_is_not_replayed(self):
        old = self.seed("real-name.csv")
        payload = self.payload("real-name.csv")
        payload["sourceName"] = "forged-name.csv"
        payload["replaceExisting"] = self.collision(payload)
        result = p.import_dataset(payload, self.user)
        self.assertEqual(result["dataset"]["sourceName"], "real-name.csv")
        with self.assertRaises(p.HTTPException) as error:
            p.import_dataset(payload, self.user)
        self.assertEqual(error.exception.status_code, 409)
        self.assertTrue(self.exists(result["dataset"]["id"]))

    def test_identical_bytes_get_a_new_record_only_after_confirmation(self):
        old = p.import_dataset(self.payload("same-bytes.csv"), self.user)["dataset"]
        payload = self.payload("same-bytes.csv")
        payload["replaceExisting"] = self.collision(payload)
        new = p.import_dataset(payload, self.user)["dataset"]
        self.assertNotEqual(old["id"], new["id"])
        self.assertFalse(self.exists(old["id"]))
        self.assertTrue((p.DATA_DIR / new["rawArtifact"]["localPath"]).exists())

    def test_all_confirmed_duplicates_deleted_but_different_names_preserved(self):
        old = [self.seed("many.csv"), self.seed("MANY.csv")]
        untouched = self.seed("many.xlsx")
        payload = self.payload("many.csv")
        payload["replaceExisting"] = self.collision(payload)
        result = p.import_dataset(payload, self.user)
        self.assertEqual(set(result["deletedIds"]), {x["id"] for x in old})
        self.assertTrue(self.exists(untouched["id"]))

    def test_deletion_guard_keeps_a_record_changed_after_new_save(self):
        old = self.seed("changed-after-save.csv")
        payload = self.payload("changed-after-save.csv")
        payload["replaceExisting"] = self.collision(payload)
        original_finalize = p.finalize_dataset
        def finalize_then_edit(*args, **kwargs):
            saved = original_finalize(*args, **kwargs)
            with p.connect() as conn:
                p.execute(conn, "UPDATE datasets SET updated_at=? WHERE id=?", ("changed", old["id"]))
            return saved
        with patch.object(p, "finalize_dataset", side_effect=finalize_then_edit):
            result = p.import_dataset(payload, self.user)
        self.assertEqual(result["deleteFailures"], [old["id"]])
        self.assertTrue(self.exists(old["id"]))

    def test_strict_cloud_cleanup_never_silently_skips_missing_configuration(self):
        with patch.multiple(p, STORAGE_BACKEND="s3", REQUIRE_DURABLE_STORAGE=False), \
                patch.object(p, "storage_configuration_issues", return_value=["missing"]):
            with self.assertRaises(p.HTTPException) as error:
                p.delete_from_object_storage("test-only-key", strict=True)
        self.assertEqual(error.exception.status_code, 503)
