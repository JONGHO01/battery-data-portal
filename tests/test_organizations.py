import tempfile
import unittest
from contextlib import contextmanager
from pathlib import Path
from unittest.mock import patch

import python_backend as portal


class OrganizationRoleTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp_dir = tempfile.TemporaryDirectory(prefix="battery-portal-organization-test-")
        cls.addClassCleanup(cls.temp_dir.cleanup)
        root = Path(cls.temp_dir.name)
        settings = patch.multiple(
            portal, DATA_DIR=root, UPLOAD_DIR=root / "uploads", ARTIFACT_DIR=root / "storage",
            USERS_JSON=root / "users.json", DATASETS_JSON=root / "datasets.json",
            SQLITE_DB=root / "test.sqlite3", USE_POSTGRES=False, DATABASE_URL="",
            STORAGE_BACKEND="local", REQUIRE_DURABLE_STORAGE=False, DATABASE_ROWS_MODE="full",
            BOOTSTRAP_ADMIN_ID="organization-test-admin", BOOTSTRAP_ADMIN_NAME="Test Admin",
            BOOTSTRAP_ADMIN_PASSWORD="test-only-admin-password", APP_ENV="local",
        )
        settings.start()
        cls.addClassCleanup(settings.stop)
        original_connect = portal.connect

        @contextmanager
        def closing_connect():
            connection = original_connect()
            try:
                with connection:
                    yield connection
            finally:
                connection.close()

        connections = patch.object(portal, "connect", closing_connect)
        connections.start()
        cls.addClassCleanup(connections.stop)
        portal.init_db()
        with portal.connect() as conn:
            for user_id in ("org-owner", "org-researcher", "org-viewer"):
                portal.execute(
                    conn,
                    "INSERT INTO users(id, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING",
                    (user_id, user_id, portal.hash_password("password"), "user", portal.now_iso()),
                )

    def test_member_roles_allow_viewing_but_limit_edits(self):
        owner = {"id": "org-owner", "name": "Owner", "role": "user"}
        researcher = {"id": "org-researcher", "name": "Researcher", "role": "user"}
        viewer = {"id": "org-viewer", "name": "Viewer", "role": "user"}
        with portal.connect() as conn:
            organization = portal.create_organization_record(conn, owner, {"name": "Battery Lab"})
            portal.upsert_organization_member(conn, organization["id"], researcher["id"], "researcher", owner)
            portal.upsert_organization_member(conn, organization["id"], viewer["id"], "viewer", owner)

            self.assertEqual(portal.organization_role(conn, researcher, organization["id"]), "researcher")
            self.assertTrue(portal.organization_can_view(conn, viewer, organization["id"]))
            self.assertFalse(portal.organization_can_edit(conn, viewer, organization["id"]))
            self.assertTrue(portal.organization_can_edit(conn, researcher, organization["id"]))

    def test_organization_project_is_private_to_its_owner_despite_membership(self):
        owner = {"id": "org-owner", "name": "Owner", "role": "user"}
        researcher = {"id": "org-researcher", "name": "Researcher", "role": "user"}
        viewer = {"id": "org-viewer", "name": "Viewer", "role": "user"}
        with portal.connect() as conn:
            organization = portal.create_organization_record(conn, owner, {"name": "Shared Lab"})
            portal.upsert_organization_member(conn, organization["id"], researcher["id"], "researcher", owner)
            portal.upsert_organization_member(conn, organization["id"], viewer["id"], "viewer", owner)
        project = portal.create_project({"name": "Shared campaign", "organizationId": organization["id"]}, owner)
        with portal.connect() as conn:
            row = portal.execute(conn, "SELECT * FROM projects WHERE id = ?", (project["id"],)).fetchone()
            self.assertEqual(project["organizationId"], organization["id"])
            self.assertFalse(portal.can_view_row(conn, researcher, row))
            self.assertFalse(portal.can_edit_row(conn, researcher, row))
            self.assertFalse(portal.can_view_row(conn, viewer, row))
            self.assertFalse(portal.can_edit_row(conn, viewer, row))
            self.assertTrue(portal.can_edit_row(conn, owner, row))

    def test_members_cannot_add_to_another_owners_project_or_view_its_dataset(self):
        owner = {"id": "org-owner", "name": "Owner", "role": "user"}
        researcher = {"id": "org-researcher", "name": "Researcher", "role": "user"}
        viewer = {"id": "org-viewer", "name": "Viewer", "role": "user"}
        with portal.connect() as conn:
            organization = portal.create_organization_record(conn, owner, {"name": "Shared Upload Lab"})
            portal.upsert_organization_member(conn, organization["id"], researcher["id"], "researcher", owner)
            portal.upsert_organization_member(conn, organization["id"], viewer["id"], "viewer", owner)

        project = portal.create_project({"name": "Shared CYC", "organizationId": organization["id"]}, owner)
        with self.assertRaises(portal.HTTPException) as denied:
            portal.create_campaign(project["id"], {"name": "Unauthorized batch"}, researcher)
        self.assertEqual(denied.exception.status_code, 403)
        campaign = portal.create_campaign(project["id"], {"name": "Batch A"}, owner)
        dataset = portal.create_dataset(
            {
                "dataType": "cyc",
                "sourceName": "shared.csv",
                "projectId": project["id"],
                "campaignId": campaign["id"],
                "cell": {"cellId": "Cell-01", "sampleName": "NCM test"},
                "columns": ["Cycle", "Discharge capacity"],
                "rows": [{"Cycle": 1, "Discharge capacity": 150.0}],
            },
            owner,
        )

        self.assertEqual(dataset["organizationId"], organization["id"])
        visible = portal.list_datasets(viewer)
        self.assertNotIn(dataset["id"], [item["id"] for item in visible])
        self.assertNotIn(dataset["id"], [item["id"] for item in portal.list_datasets(researcher)])
        self.assertIn(dataset["id"], [item["id"] for item in portal.list_datasets(owner)])
        with self.assertRaises(portal.HTTPException) as denied:
            portal.update_dataset(dataset["id"], {"figureKind": "cyc-performance"}, viewer)
        self.assertEqual(denied.exception.status_code, 403)

    def test_sqlite_user_row_can_create_dataset_in_own_project(self):
        """The FastAPI dependency returns a sqlite Row, not only a plain dict."""

        with portal.connect() as conn:
            owner_row = portal.execute(conn, "SELECT * FROM users WHERE id = ?", ("org-owner",)).fetchone()

        project = portal.create_project({"name": "Row-backed project"}, owner_row)
        dataset = portal.create_dataset(
            {
                "dataType": "cyc",
                "sourceName": "row-owner.csv",
                "projectId": project["id"],
                "cell": {"cellId": "Cell-Row"},
                "columns": ["Cycle", "Discharge capacity"],
                "rows": [{"Cycle": 1, "Discharge capacity": 150.0}],
            },
            owner_row,
        )
        figure = portal.save_figure_record(
            {"datasetId": dataset["id"], "name": "Row-backed figure", "edits": {"aspect": "4:3"}},
            owner_row,
        )

        self.assertEqual(dataset["projectId"], project["id"])
        self.assertEqual(dataset["ownerId"], "org-owner")
        self.assertEqual(figure["datasetId"], dataset["id"])

    def test_sqlite_user_row_can_save_eis_dataset_and_figure(self):
        """EIS uploads use the same SQLite-row permission path as CYC uploads."""

        with portal.connect() as conn:
            owner_row = portal.execute(conn, "SELECT * FROM users WHERE id = ?", ("org-owner",)).fetchone()

        project = portal.create_project({"name": "Row-backed EIS project"}, owner_row)
        dataset = portal.create_dataset(
            {
                "dataType": "eis",
                "sourceName": "onlyptfe_1_01.SEO",
                "projectId": project["id"],
                "cell": {"cellId": "Cell-EIS"},
                "columns": ["sweep", "point", "frequency", "zreal", "zimag", "mag", "phase"],
                "rows": [
                    {
                        "sweep": 1,
                        "point": 1,
                        "frequency": 100000.0,
                        "zreal": 253.8,
                        "zimag": -4.2,
                        "mag": 253.8,
                        "phase": -0.9,
                    }
                ],
            },
            owner_row,
        )
        figure = portal.save_figure_record(
            {"datasetId": dataset["id"], "name": "Row-backed EIS figure", "figureKind": "eis-combined"},
            owner_row,
        )

        self.assertEqual(dataset["dataType"], "eis")
        self.assertEqual(dataset["projectId"], project["id"])
        self.assertEqual(figure["figureKind"], "eis-combined")
        self.assertTrue((portal.DATA_DIR / figure["artifact"]["localPath"]).exists())

    def test_sqlite_member_row_does_not_gain_another_owners_project_permissions(self):
        owner = {"id": "org-owner", "name": "Owner", "role": "user"}
        researcher = {"id": "org-researcher", "name": "Researcher", "role": "user"}
        with portal.connect() as conn:
            organization = portal.create_organization_record(conn, owner, {"name": "Row Member Lab"})
            portal.upsert_organization_member(conn, organization["id"], researcher["id"], "researcher", owner)
        project = portal.create_project({"name": "Row Member Project", "organizationId": organization["id"]}, owner)

        with portal.connect() as conn:
            researcher_row = portal.execute(conn, "SELECT * FROM users WHERE id = ?", (researcher["id"],)).fetchone()
            project_row = portal.execute(conn, "SELECT * FROM projects WHERE id = ?", (project["id"],)).fetchone()
            self.assertEqual(portal.organization_role(conn, researcher_row, organization["id"]), "researcher")
            self.assertFalse(portal.can_view_row(conn, researcher_row, project_row))
            self.assertFalse(portal.can_edit_row(conn, researcher_row, project_row))

    def test_admin_user_directory_includes_signup_date_and_organization_memberships(self):
        """Administrators need a safe, complete view of registered accounts."""

        administrator = {"id": "portal-admin", "name": "Portal Admin", "role": "admin"}
        member = {"id": "directory-member", "name": "Directory Member", "role": "user"}
        with portal.connect() as conn:
            for item in (administrator, member):
                portal.execute(
                    conn,
                    "INSERT INTO users(id, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name = excluded.name, role = excluded.role",
                    (item["id"], item["name"], portal.hash_password("password"), item["role"], "2026-07-22T09:00:00+00:00"),
                )
            organization = portal.create_organization_record(conn, administrator, {"name": "Directory Lab"})
            portal.upsert_organization_member(conn, organization["id"], member["id"], "researcher", administrator)

        users = portal.list_users(administrator)
        directory_member = next(item for item in users if item["id"] == member["id"])
        self.assertEqual(directory_member["createdAt"], "2026-07-22T09:00:00+00:00")
        self.assertEqual(directory_member["organizations"], [{"id": organization["id"], "name": "Directory Lab", "role": "researcher"}])

    def test_admin_can_reset_a_member_password_without_exposing_any_password_value(self):
        """Admins may issue a replacement password, never read an existing one."""

        administrator = {"id": "password-reset-admin", "name": "Password Reset Admin", "role": "admin"}
        member = {"id": "password-reset-member", "name": "Password Reset Member", "role": "user"}
        with portal.connect() as conn:
            for item in (administrator, member):
                portal.execute(
                    conn,
                    "INSERT INTO users(id, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET password_hash = excluded.password_hash, role = excluded.role",
                    (item["id"], item["name"], portal.hash_password("old-password-123"), item["role"], portal.now_iso()),
                )

        result = portal.reset_user_password(member["id"], "new-temporary-password-456", administrator)
        self.assertEqual(result, {"ok": True, "userId": member["id"]})

        with portal.connect() as conn:
            stored = portal.get_user_by_id(member["id"], conn)
        self.assertTrue(portal.verify_password("new-temporary-password-456", stored["password_hash"]))
        self.assertFalse(portal.verify_password("old-password-123", stored["password_hash"]))

        directory_member = next(item for item in portal.list_users(administrator) if item["id"] == member["id"])
        self.assertNotIn("password", directory_member)
        self.assertNotIn("hash", directory_member)

        with self.assertRaises(portal.HTTPException) as denied:
            portal.reset_user_password(member["id"], "another-temporary-password-789", member)
        self.assertEqual(denied.exception.status_code, 403)


if __name__ == "__main__":
    unittest.main()
