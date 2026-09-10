"""HTTP-level end-to-end coverage for duplicate source Fig prevention."""

import json
import os
import socket
import subprocess
import sys
import tempfile
import time
import unittest
from pathlib import Path
from urllib.error import URLError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]


class DuplicateFigureHttpE2ETests(unittest.TestCase):
    """Exercise login, raw upload, Dataset save, Fig save, and Fig collection."""

    @classmethod
    def setUpClass(cls):
        cls.temp_dir = tempfile.TemporaryDirectory(prefix="battery-portal-e2e-duplicate-fig-")
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as probe:
            probe.bind(("127.0.0.1", 0))
            cls.port = probe.getsockname()[1]

        environment = os.environ.copy()
        environment.pop("DATABASE_URL", None)
        environment.update(
            {
                "DATA_DIR": str(Path(cls.temp_dir.name) / "data"),
                "STORAGE_BACKEND": "local",
                "APP_ENV": "local",
                "ALLOW_LEGACY_USER_HEADER": "false",
                "JWT_SECRET": "e2e-duplicate-figure-secret-only-for-local-test",
                "BOOTSTRAP_ADMIN_ID": "e2e-admin",
                "BOOTSTRAP_ADMIN_NAME": "E2E Admin",
                "BOOTSTRAP_ADMIN_PASSWORD": "e2e-test-password-only",
            }
        )
        cls.server = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "python_backend:app", "--host", "127.0.0.1", "--port", str(cls.port)],
            cwd=ROOT,
            env=environment,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        cls.base_url = f"http://127.0.0.1:{cls.port}"
        for _ in range(100):
            try:
                status, body = cls.request_json("/api/health")
                if status == 200 and body.get("ok"):
                    return
            except (URLError, ConnectionError, TimeoutError):
                time.sleep(0.1)
        cls.server.terminate()
        raise RuntimeError("The E2E Battery Portal server did not start.")

    @classmethod
    def tearDownClass(cls):
        if getattr(cls, "server", None):
            cls.server.terminate()
            try:
                cls.server.wait(timeout=10)
            except subprocess.TimeoutExpired:
                cls.server.kill()
        if getattr(cls, "temp_dir", None):
            cls.temp_dir.cleanup()

    @classmethod
    def request_json(cls, path, method="GET", payload=None, headers=None, raw_body=None):
        request_headers = {"Accept": "application/json", **(headers or {})}
        if raw_body is not None:
            data = raw_body
            request_headers.setdefault("Content-Type", "application/octet-stream")
        elif payload is not None:
            data = json.dumps(payload).encode("utf-8")
            request_headers.setdefault("Content-Type", "application/json")
        else:
            data = None
        request = Request(f"{cls.base_url}{path}", data=data, method=method, headers=request_headers)
        with urlopen(request, timeout=15) as response:
            return response.status, json.loads(response.read().decode("utf-8"))

    def test_same_raw_file_creates_one_dataset_and_one_figure_card(self):
        status, login = self.request_json(
            "/api/login",
            method="POST",
            payload={"id": "e2e-admin", "password": "e2e-test-password-only"},
        )
        self.assertEqual(status, 200)
        headers = {"Authorization": f"Bearer {login['token']}"}
        source = (
            b"cycle,discharge capacity (mAh g-1),voltage,current\n"
            b"1,160,3.70,0.010\n"
            b"2,155,3.65,0.010\n"
        )

        def inspect_and_save(figure_kind="cycling-performance"):
            inspect_status, inspection = self.request_json(
                "/api/inspect-upload",
                method="POST",
                raw_body=source,
                headers={**headers, "X-Filename": "same-cyc-source.csv"},
            )
            self.assertEqual(inspect_status, 200)
            self.assertEqual(inspection["detection"]["type"], "cyc")
            save_status, dataset = self.request_json(
                "/api/datasets",
                method="POST",
                headers=headers,
                payload={
                    "dataType": "cyc",
                    "figureKind": figure_kind,
                    "sourceName": inspection["filename"],
                    "uploadId": inspection["uploadId"],
                    "cell": {"cellId": "E2E-DUPLICATE-CELL", "sampleName": "same source"},
                    "columns": inspection["columns"],
                    "rows": inspection["rows"],
                    "canonicalRows": inspection.get("canonicalRows", []),
                    "columnMapping": inspection.get("columnMapping", {}),
                    "quality": inspection.get("quality", {}),
                    "parser": inspection.get("parser", {}),
                },
            )
            self.assertEqual(save_status, 201)
            return dataset

        first = inspect_and_save()
        figure_status, first_figure = self.request_json(
            "/api/figures",
            method="POST",
            headers=headers,
            payload={"datasetId": first["id"], "name": "Same raw source Fig"},
        )
        self.assertEqual(figure_status, 201)

        second = inspect_and_save("voltage-profile")
        self.assertEqual(second["id"], first["id"])
        self.assertTrue(second["reusedExistingSource"])
        self.assertEqual(second["figureKind"], "voltage-profile")

        workspace_status, workspace = self.request_json(
            f"/api/cells/{first['cellRecordId']}/workspace",
            headers=headers,
        )
        self.assertEqual(workspace_status, 200)
        matching_figures = [item for item in workspace["figures"] if item["datasetId"] == first["id"]]
        self.assertEqual(len(matching_figures), 1)
        self.assertEqual(matching_figures[0]["id"], first_figure["id"])
        self.assertEqual(matching_figures[0]["figureKind"], "voltage-profile")

        datasets_status, datasets = self.request_json("/api/datasets", headers=headers)
        self.assertEqual(datasets_status, 200)
        matching_datasets = [item for item in datasets if item["id"] == first["id"]]
        self.assertEqual(len(matching_datasets), 1)
        # The saved-list response must remain lightweight even when the source
        # file contains tens of thousands of raw CYC points.  Full rows load
        # only after the user opens a Dataset.
        self.assertFalse(matching_datasets[0]["rowsLoaded"])
        self.assertEqual(matching_datasets[0]["rows"], [])

        detail_status, detail = self.request_json(f"/api/datasets/{first['id']}", headers=headers)
        self.assertEqual(detail_status, 200)
        self.assertTrue(detail["rowsLoaded"])
        self.assertEqual(len(detail["rows"]), len(first["rows"]))

        comparison_status, comparison = self.request_json(
            f"/api/datasets/{first['id']}/comparison-series", headers=headers
        )
        self.assertEqual(comparison_status, 200)
        self.assertEqual(comparison["datasetId"], first["id"])
        self.assertEqual(comparison["pointCount"], 2)
        self.assertNotIn("rows", comparison)


if __name__ == "__main__":
    unittest.main()
