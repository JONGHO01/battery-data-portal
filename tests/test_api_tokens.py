import os
import tempfile
import unittest


_TEMP_DIR = tempfile.mkdtemp(prefix="battery-portal-api-token-test-")
os.environ["DATA_DIR"] = _TEMP_DIR
os.environ["STORAGE_BACKEND"] = "local"
os.environ["BOOTSTRAP_ADMIN_PASSWORD"] = "test-only-admin-password"

import python_backend as portal


class ApiTokenTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        portal.init_db()
        with portal.connect() as conn:
            portal.execute(
                conn,
                "INSERT INTO users(id, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING",
                ("harvester-user", "Harvester User", portal.hash_password("password"), "user", portal.now_iso()),
            )

    def test_token_is_only_returned_at_creation_and_can_be_revoked(self):
        user = {"id": "harvester-user", "name": "Harvester User", "role": "user"}
        with portal.connect() as conn:
            created = portal.create_api_token(conn, user, "cycler-pc")
            listed = portal.list_api_tokens(conn, user)
            resolved = portal.get_user_from_api_token(created["token"], conn)
            portal.revoke_api_token(conn, created["id"], user)
            revoked = portal.get_user_from_api_token(created["token"], conn)

        self.assertTrue(created["token"].startswith("bdp_"))
        self.assertNotIn("token", listed[0])
        self.assertEqual(resolved["id"], user["id"])
        self.assertIsNone(revoked)

    def test_api_token_endpoints_keep_the_plaintext_out_of_lists(self):
        user = {"id": "harvester-user", "name": "Harvester User", "role": "user"}
        created = portal.create_current_user_api_token({"name": "lab-watcher"}, user)
        listed = portal.list_current_user_api_tokens(user)
        revoked = portal.delete_current_user_api_token(created["id"], user)

        self.assertIn("token", created)
        self.assertTrue(any(item["id"] == created["id"] and "token" not in item for item in listed))
        self.assertTrue(revoked["ok"])

    def test_harvester_ingest_reuses_the_normalized_upload_pipeline(self):
        user = {"id": "harvester-user", "name": "Harvester User", "role": "user"}
        previous_enabled = portal.HARVESTER_ENABLED
        portal.HARVESTER_ENABLED = True
        try:
            created = portal.ingest_harvester_upload(
                {
                    "filename": "cycler-summary.csv",
                    "contentBase64": portal.base64.b64encode(
                        b"Cycle,Discharge capacity (mAh g-1)\n1,160\n2,151\n"
                    ).decode("ascii"),
                    "dataset": {"cell": {"cellId": "AUTO-01", "sampleName": "Harvester sample"}},
                },
                user,
            )
        finally:
            portal.HARVESTER_ENABLED = previous_enabled

        self.assertEqual(created["dataset"]["dataType"], "cyc")
        self.assertTrue(created["dataset"]["rawArtifact"])
        self.assertEqual(created["inspection"]["parser"]["mappingVersion"], "bdf-map-1")


if __name__ == "__main__":
    unittest.main()
