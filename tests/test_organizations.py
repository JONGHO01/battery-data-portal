import os
import tempfile
import unittest


_TEMP_DIR = tempfile.mkdtemp(prefix="battery-portal-organization-test-")
os.environ["DATA_DIR"] = _TEMP_DIR
os.environ["STORAGE_BACKEND"] = "local"
os.environ["BOOTSTRAP_ADMIN_PASSWORD"] = "test-only-admin-password"

import python_backend as portal


class OrganizationRoleTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
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

    def test_organization_project_is_visible_to_members_and_editable_by_researchers(self):
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
            self.assertTrue(portal.can_view_row(conn, researcher, row))
            self.assertTrue(portal.can_edit_row(conn, researcher, row))
            self.assertTrue(portal.can_view_row(conn, viewer, row))
            self.assertFalse(portal.can_edit_row(conn, viewer, row))

    def test_researcher_can_add_shared_dataset_but_viewer_cannot_change_it(self):
        owner = {"id": "org-owner", "name": "Owner", "role": "user"}
        researcher = {"id": "org-researcher", "name": "Researcher", "role": "user"}
        viewer = {"id": "org-viewer", "name": "Viewer", "role": "user"}
        with portal.connect() as conn:
            organization = portal.create_organization_record(conn, owner, {"name": "Shared Upload Lab"})
            portal.upsert_organization_member(conn, organization["id"], researcher["id"], "researcher", owner)
            portal.upsert_organization_member(conn, organization["id"], viewer["id"], "viewer", owner)

        project = portal.create_project({"name": "Shared CYC", "organizationId": organization["id"]}, owner)
        campaign = portal.create_campaign(project["id"], {"name": "Batch A"}, researcher)
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
            researcher,
        )

        self.assertEqual(dataset["organizationId"], organization["id"])
        visible = portal.list_datasets(viewer)
        self.assertIn(dataset["id"], [item["id"] for item in visible])
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

    def test_sqlite_member_row_keeps_shared_project_permissions(self):
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
            self.assertTrue(portal.can_edit_row(conn, researcher_row, project_row))


if __name__ == "__main__":
    unittest.main()
