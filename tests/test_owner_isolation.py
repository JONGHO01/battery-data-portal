"""Owner/admin isolation, including legacy organization-linked records."""

import asyncio
import tempfile
import unittest
from contextlib import contextmanager
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

import python_backend as portal


class AsgiClient:
    """Exercise real authentication/routes without optional httpx2 or a live server."""

    def get(self, route, headers):
        return self.request("GET", route, headers=headers)

    def request(self, method, route, headers, json=None):
        import json as codec
        body = codec.dumps(json).encode() if json is not None else b""
        messages = []

        async def run():
            consumed = False

            async def receive():
                nonlocal consumed
                if not consumed:
                    consumed = True
                    return {"type": "http.request", "body": body, "more_body": False}
                return {"type": "http.disconnect"}

            async def send(message):
                messages.append(message)

            await portal.app({
                "type": "http", "asgi": {"version": "3.0"}, "http_version": "1.1",
                "method": method, "scheme": "http", "path": route, "raw_path": route.encode(),
                "query_string": b"", "root_path": "", "server": ("testserver", 80),
                "client": ("127.0.0.1", 1), "headers": [
                    (key.lower().encode(), value.encode()) for key, value in
                    {**headers, "Content-Type": "application/json", "Content-Length": str(len(body))}.items()
                ],
            }, receive, send)

        asyncio.run(run())
        status = next(item["status"] for item in messages if item["type"] == "http.response.start")
        text = b"".join(item.get("body", b"") for item in messages).decode()
        return SimpleNamespace(status_code=status, text=text, json=lambda: codec.loads(text))


class OwnerIsolationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="portal-owner-isolation-")
        self.addCleanup(self.temp.cleanup)
        root = Path(self.temp.name)
        self.settings = patch.multiple(
            portal, DATA_DIR=root, UPLOAD_DIR=root / "uploads", ARTIFACT_DIR=root / "storage",
            USERS_JSON=root / "users.json", DATASETS_JSON=root / "datasets.json",
            SQLITE_DB=root / "test.sqlite3", USE_POSTGRES=False, DATABASE_URL="",
            STORAGE_BACKEND="local", REQUIRE_DURABLE_STORAGE=False, DATABASE_ROWS_MODE="full",
            BOOTSTRAP_ADMIN_ID="isolation-admin", BOOTSTRAP_ADMIN_NAME="Test Admin",
            BOOTSTRAP_ADMIN_PASSWORD="test-password-only", APP_ENV="local",
            JWT_SECRET="owner-isolation-test-secret", ALLOW_LEGACY_USER_HEADER=False,
            ADMIN_RAW_DATA_PASSWORD="test-raw-password-only",
        )
        self.settings.start()
        self.addCleanup(self.settings.stop)
        original_connect = portal.connect
        @contextmanager
        def tracked_connect():
            connection = original_connect()
            try:
                with connection:
                    yield connection
            finally:
                connection.close()

        connection_patch = patch.object(portal, "connect", tracked_connect)
        connection_patch.start()
        self.addCleanup(connection_patch.stop)
        portal.init_db()
        self.users = {
            "owner": {"id": "dataset-owner", "name": "Owner", "role": "user"},
            "admin": {"id": "isolation-admin", "name": "Admin", "role": "admin"},
            "outsider": {"id": "outsider", "name": "Outsider", "role": "user"},
        }
        for role in ("owner", "admin", "researcher", "viewer"):
            self.users["org-" + role] = {"id": "org-" + role, "name": role, "role": "user"}
        with portal.connect() as conn:
            for user in self.users.values():
                portal.execute(conn, "INSERT INTO users(id, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING",
                               (user["id"], user["name"], "test-unusable-hash", user["role"], portal.now_iso()))
            organization = portal.create_organization_record(conn, self.users["owner"], {"name": "Legacy Lab"})
            self.organization_id = organization["id"]
            for role in ("owner", "admin", "researcher", "viewer"):
                portal.upsert_organization_member(conn, organization["id"], "org-" + role, role, self.users["owner"])
        self.project = portal.create_project({"name": "Private experiment", "organizationId": self.organization_id}, self.users["owner"])
        self.dataset = portal.create_dataset({
            "dataType": "cyc", "sourceName": "owner-secret-LFP.csv", "projectId": self.project["id"],
            "cell": {"cellId": "owner-only-cell"}, "columns": ["cycle", "capacity"],
            "rows": [{"cycle": 1, "capacity": 160}, {"cycle": 2, "capacity": 159}],
        }, self.users["owner"])
        self.client = AsgiClient()

    def headers(self, name):
        return {"Authorization": "Bearer " + portal.create_token(self.users[name])}

    def test_owner_and_global_admin_keep_view_and_edit_permissions(self):
        with portal.connect() as conn:
            for table, identifier in (("datasets", self.dataset["id"]), ("projects", self.project["id"])):
                row = portal.execute(conn, f"SELECT * FROM {table} WHERE id = ?", (identifier,)).fetchone()
                for name in ("owner", "admin"):
                    with self.subTest(table=table, user=name):
                        self.assertTrue(portal.can_view_row(conn, self.users[name], row))
                        self.assertTrue(portal.can_edit_row(conn, self.users[name], row))

    def test_same_organization_roles_never_grant_dataset_or_project_access(self):
        with portal.connect() as conn:
            for table, identifier in (("datasets", self.dataset["id"]), ("projects", self.project["id"])):
                row = portal.execute(conn, f"SELECT * FROM {table} WHERE id = ?", (identifier,)).fetchone()
                for name in ("outsider", "org-owner", "org-admin", "org-researcher", "org-viewer"):
                    with self.subTest(table=table, user=name, permission="view"):
                        self.assertFalse(portal.can_view_row(conn, self.users[name], row))
                    with self.subTest(table=table, user=name, permission="edit"):
                        self.assertFalse(portal.can_edit_row(conn, self.users[name], row))

    def test_dataset_lists_exclude_other_owners_even_in_same_organization(self):
        for name in self.users:
            with self.subTest(user=name):
                response = self.client.get("/api/datasets", headers=self.headers(name))
                self.assertEqual(response.status_code, 200)
                ids = [item["id"] for item in response.json()]
                self.assertEqual(self.dataset["id"] in ids, name in ("owner", "admin"))
                if name not in ("owner", "admin"):
                    self.assertNotIn("owner-secret-LFP", response.text)

    def test_guessed_dataset_id_cannot_read_data_comparison_or_analysis(self):
        for name in self.users:
            for suffix in ("", "/comparison-series", "/analyses"):
                with self.subTest(user=name, suffix=suffix):
                    response = self.client.get(f"/api/datasets/{self.dataset['id']}{suffix}", headers=self.headers(name))
                    self.assertEqual(response.status_code, 200 if name in ("owner", "admin") else 403)
                    if name not in ("owner", "admin"):
                        self.assertNotIn("owner-secret-LFP", response.text)

    def test_guessed_dataset_id_cannot_modify_or_save_figures_reports_analyses(self):
        routes = [
            ("PATCH", f"/api/datasets/{self.dataset['id']}", {"figureEdits": {"title": "forbidden edit"}}),
            ("POST", "/api/figures", {"datasetId": self.dataset["id"]}),
            ("POST", "/api/reports", {"datasetId": self.dataset["id"]}),
            ("POST", f"/api/datasets/{self.dataset['id']}/analyses", {"analysisName": "retention"}),
        ]
        for name in ("outsider", "org-owner", "org-admin", "org-researcher", "org-viewer"):
            for method, route, payload in routes:
                with self.subTest(user=name, route=route):
                    response = self.client.request(method, route, json=payload, headers=self.headers(name))
                    self.assertEqual(response.status_code, 403)

    def test_nonadmins_cannot_use_administrator_raw_download_routes(self):
        for name in self.users:
            for suffix in ("", "/download"):
                with self.subTest(user=name, suffix=suffix):
                    response = self.client.get(f"/api/admin/raw-data/datasets/{self.dataset['id']}{suffix}", headers=self.headers(name))
                    # Even the global administrator still needs the existing second confirmation.
                    self.assertEqual(response.status_code, 403)

    def test_existing_foreign_dataset_id_cannot_be_claimed_via_create(self):
        response = self.client.request("POST", "/api/datasets", headers=self.headers("outsider"), json={
            "id": self.dataset["id"], "dataType": "cyc", "sourceName": "ownership-takeover.csv",
            "columns": ["cycle", "capacity"], "rows": [{"cycle": 1, "capacity": 0}],
        })
        self.assertEqual(response.status_code, 403)
        owner_data = self.client.get(f"/api/datasets/{self.dataset['id']}", headers=self.headers("owner"))
        self.assertEqual(owner_data.status_code, 200)
        self.assertEqual(owner_data.json()["sourceName"], "owner-secret-LFP.csv")

    def test_organization_administrator_cannot_delete_another_owners_dataset(self):
        response = self.client.request("DELETE", f"/api/datasets/{self.dataset['id']}", headers=self.headers("org-admin"))
        self.assertEqual(response.status_code, 403)
        response = self.client.get(f"/api/datasets/{self.dataset['id']}", headers=self.headers("owner"))
        self.assertEqual(response.status_code, 200)

    def test_workspace_lists_filter_before_disclosing_filenames(self):
        for name in self.users:
            with self.subTest(user=name):
                response = self.client.get("/api/data-workspace/files", headers=self.headers(name))
                self.assertEqual(response.status_code, 200)
                ids = [item["id"] for item in response.json()["items"]]
                self.assertEqual(self.dataset["id"] in ids, name in ("owner", "admin"))
                if name not in ("owner", "admin"):
                    self.assertNotIn("owner-secret-LFP", response.text)
                    self.assertEqual(response.json()["total"], 0)

    def test_workspace_foreign_ids_return_not_found_for_every_file_operation(self):
        prefix = f"/api/data-workspace/files/{self.dataset['id']}"
        routes = [
            ("POST", prefix + "/preview", {"recipe": {}}),
            ("PUT", prefix + "/profile", {"profile": {"material": "LFP"}, "revision": 0}),
            ("GET", prefix + "/versions", None),
            ("POST", prefix + "/versions", {"recipe": {}, "confirmed": True, "fingerprint": "bad"}),
            ("GET", prefix + "/download", None),
            ("GET", prefix + "/versions/nonexistent/download", None),
        ]
        for name in ("outsider", "org-owner", "org-admin", "org-researcher", "org-viewer"):
            for method, route, payload in routes:
                with self.subTest(user=name, route=route):
                    response = self.client.request(method, route, json=payload, headers=self.headers(name))
                    self.assertEqual(response.status_code, 404)
                    self.assertNotIn("owner-secret-LFP", response.text)

    def test_workspace_owner_and_global_admin_can_preview_without_modifying_source(self):
        for name in ("owner", "admin"):
            with self.subTest(user=name):
                response = self.client.request("POST", f"/api/data-workspace/files/{self.dataset['id']}/preview",
                                               json={"recipe": {}}, headers=self.headers(name))
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.json()["rows"], self.dataset["rows"])
                self.assertTrue(response.json()["fingerprint"])
                versions = self.client.get(f"/api/data-workspace/files/{self.dataset['id']}/versions", headers=self.headers(name))
                self.assertEqual(versions.status_code, 200)
                self.assertEqual(versions.json(), [])
        after = self.client.get(f"/api/datasets/{self.dataset['id']}", headers=self.headers("owner"))
        self.assertEqual(after.json()["rows"], self.dataset["rows"])


if __name__ == "__main__":
    unittest.main()
