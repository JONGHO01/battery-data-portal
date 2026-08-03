"""HTTP regression coverage for administrator-only raw Dataset access."""

import json
import os
import socket
import subprocess
import sys
import tempfile
import time
import unittest
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]


class AdminRawDataHttpTests(unittest.TestCase):
    """Raw rows require both an admin session and a short-lived second scope."""

    @classmethod
    def setUpClass(cls):
        cls.temp_dir = tempfile.TemporaryDirectory(prefix="battery-portal-admin-raw-")
        cls.environment = os.environ.copy()
        cls.environment.pop("DATABASE_URL", None)
        cls.environment.update(
            {
                "DATA_DIR": str(Path(cls.temp_dir.name) / "data"),
                "STORAGE_BACKEND": "local",
                "APP_ENV": "local",
                "ALLOW_LEGACY_USER_HEADER": "false",
                "JWT_SECRET": "admin-raw-regression-secret-only-for-tests",
                "BOOTSTRAP_ADMIN_ID": "admin-raw-test",
                "BOOTSTRAP_ADMIN_NAME": "Admin Raw Test",
                "BOOTSTRAP_ADMIN_PASSWORD": "admin-raw-login-password",
                "ADMIN_RAW_DATA_PASSWORD": "raw-data-confirmation-for-tests",
                "ADMIN_RAW_DATA_TTL_SECONDS": "600",
            }
        )
        cls.server = None
        cls.start_server()

        status, member = cls.request_json(
            "/api/register",
            method="POST",
            payload={"id": "raw-member", "name": "Raw Member", "password": "raw-member-password"},
        )
        assert status == 201
        cls.member_token = member["token"]

        status, dataset = cls.request_json(
            "/api/datasets",
            method="POST",
            payload={
                "id": "raw-dataset-test",
                "dataType": "cyc",
                "figureKind": "cyc-performance",
                "sourceName": "member-upload.wrd",
                "columns": ["cycle", "capacity", "voltage"],
                "rows": [
                    {"cycle": 1, "capacity": 101.2, "voltage": 4.2},
                    {"cycle": 2, "capacity": 99.6, "voltage": 4.1},
                ],
            },
            headers=cls.auth_headers(cls.member_token),
        )
        assert status == 201
        cls.dataset_id = dataset["id"]

        status, admin = cls.request_json(
            "/api/login",
            method="POST",
            payload={"id": "admin-raw-test", "password": "admin-raw-login-password"},
        )
        assert status == 200
        cls.admin_token = admin["token"]

    @classmethod
    def reserve_port(cls):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as probe:
            probe.bind(("127.0.0.1", 0))
            return probe.getsockname()[1]

    @classmethod
    def start_server(cls):
        cls.port = cls.reserve_port()
        cls.base_url = f"http://127.0.0.1:{cls.port}"
        cls.server = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "python_backend:app", "--host", "127.0.0.1", "--port", str(cls.port)],
            cwd=ROOT,
            env=cls.environment,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        for _ in range(100):
            try:
                status, body = cls.request_json("/api/health")
                if status == 200 and body.get("ok"):
                    return
            except (URLError, ConnectionError, TimeoutError):
                time.sleep(0.1)
        cls.stop_server()
        raise RuntimeError("The administrator raw-data regression server did not start.")

    @classmethod
    def stop_server(cls):
        if not cls.server:
            return
        cls.server.terminate()
        try:
            cls.server.wait(timeout=10)
        except subprocess.TimeoutExpired:
            cls.server.kill()
        cls.server = None

    @classmethod
    def tearDownClass(cls):
        cls.stop_server()
        for attempt in range(20):
            try:
                cls.temp_dir.cleanup()
                return
            except PermissionError:
                if attempt == 19:
                    raise
                time.sleep(0.1)

    @classmethod
    def auth_headers(cls, token, extra=None):
        headers = {"Authorization": f"Bearer {token}"}
        headers.update(extra or {})
        return headers

    @classmethod
    def request_json(cls, path, method="GET", payload=None, headers=None):
        data = json.dumps(payload).encode("utf-8") if payload is not None else None
        request_headers = {"Accept": "application/json"}
        if data is not None:
            request_headers["Content-Type"] = "application/json"
        request_headers.update(headers or {})
        request = Request(f"{cls.base_url}{path}", data=data, method=method, headers=request_headers)
        try:
            with urlopen(request, timeout=15) as response:
                return response.status, json.loads(response.read().decode("utf-8"))
        except HTTPError as error:
            body = json.loads(error.read().decode("utf-8"))
            return error.code, body

    def test_raw_rows_require_admin_and_second_confirmation(self):
        member_status, _ = self.request_json(
            "/api/admin/raw-data/datasets",
            headers=self.auth_headers(self.member_token),
        )
        self.assertEqual(member_status, 403)

        initial_status, _ = self.request_json(
            "/api/admin/raw-data/datasets",
            headers=self.auth_headers(self.admin_token),
        )
        self.assertEqual(initial_status, 403)

        rejected_status, _ = self.request_json(
            "/api/admin/raw-data/access",
            method="POST",
            payload={"password": "wrong-confirmation"},
            headers=self.auth_headers(self.admin_token),
        )
        self.assertEqual(rejected_status, 401)

        accepted_status, access = self.request_json(
            "/api/admin/raw-data/access",
            method="POST",
            payload={"password": "raw-data-confirmation-for-tests"},
            headers=self.auth_headers(self.admin_token),
        )
        self.assertEqual(accepted_status, 200)
        self.assertGreater(access["expiresInSeconds"], 0)
        raw_headers = self.auth_headers(self.admin_token, {"X-Admin-Raw-Access": access["accessToken"]})

        list_status, listing = self.request_json("/api/admin/raw-data/datasets", headers=raw_headers)
        self.assertEqual(list_status, 200)
        item = next(dataset for dataset in listing["items"] if dataset["id"] == self.dataset_id)
        self.assertEqual(item["rowCount"], 2)
        self.assertNotIn("rows", item)

        detail_status, detail = self.request_json(
            f"/api/admin/raw-data/datasets/{self.dataset_id}?offset=1&limit=1",
            headers=raw_headers,
        )
        self.assertEqual(detail_status, 200)
        self.assertEqual(detail["totalRows"], 2)
        self.assertEqual(detail["offset"], 1)
        self.assertEqual(detail["rows"], [{"cycle": 2, "capacity": 99.6, "voltage": 4.1}])

        mismatched_status, _ = self.request_json(
            "/api/admin/raw-data/datasets",
            headers=self.auth_headers(self.member_token, {"X-Admin-Raw-Access": access["accessToken"]}),
        )
        self.assertEqual(mismatched_status, 403)

