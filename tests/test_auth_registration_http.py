"""HTTP regression coverage for durable local portal account sign-in."""

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


class RegistrationLoginHttpTests(unittest.TestCase):
    """A registered local account must work again after the server restarts."""

    @classmethod
    def setUpClass(cls):
        cls.temp_dir = tempfile.TemporaryDirectory(prefix="battery-portal-auth-")
        cls.environment = os.environ.copy()
        cls.environment.pop("DATABASE_URL", None)
        cls.environment.update(
            {
                "DATA_DIR": str(Path(cls.temp_dir.name) / "data"),
                "STORAGE_BACKEND": "local",
                "APP_ENV": "local",
                "ALLOW_LEGACY_USER_HEADER": "false",
                "JWT_SECRET": "local-auth-regression-secret-only-for-tests",
                "BOOTSTRAP_ADMIN_ID": "auth-test-admin",
                "BOOTSTRAP_ADMIN_NAME": "Auth Test Admin",
                "BOOTSTRAP_ADMIN_PASSWORD": "auth-test-admin-password",
            }
        )
        cls.server = None
        cls.start_server()

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
        raise RuntimeError("The local account regression server did not start.")

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
        # Windows can retain SQLite's file handle briefly after uvicorn exits.
        # Retry cleanup so the regression test does not leave a temp database.
        for attempt in range(20):
            try:
                cls.temp_dir.cleanup()
                return
            except PermissionError:
                if attempt == 19:
                    raise
                time.sleep(0.1)

    @classmethod
    def request_json(cls, path, method="GET", payload=None):
        data = json.dumps(payload).encode("utf-8") if payload is not None else None
        headers = {"Accept": "application/json"}
        if data is not None:
            headers["Content-Type"] = "application/json"
        request = Request(f"{cls.base_url}{path}", data=data, method=method, headers=headers)
        with urlopen(request, timeout=15) as response:
            return response.status, json.loads(response.read().decode("utf-8"))

    def test_registered_account_can_login_after_a_server_restart(self):
        account = {"id": "persisted-user", "name": "Persisted User", "password": "local-login-password-123"}
        status, created = self.request_json("/api/register", method="POST", payload=account)
        self.assertEqual(status, 201)
        self.assertEqual(created["user"]["id"], account["id"])

        self.stop_server()
        self.start_server()

        status, logged_in = self.request_json(
            "/api/login",
            method="POST",
            payload={"id": account["id"], "password": account["password"]},
        )
        self.assertEqual(status, 200)
        self.assertEqual(logged_in["user"]["id"], account["id"])
        self.assertTrue(logged_in["token"])

    def test_wrong_password_remains_a_login_error(self):
        """A bad password must not be mislabeled as an account-storage failure."""

        account = {"id": "wrong-password-user", "name": "Wrong Password User", "password": "local-login-password-456"}
        status, _ = self.request_json("/api/register", method="POST", payload=account)
        self.assertEqual(status, 201)

        with self.assertRaises(HTTPError) as rejected:
            self.request_json(
                "/api/login",
                method="POST",
                payload={"id": account["id"], "password": "not-the-right-password"},
            )
        self.assertEqual(rejected.exception.code, 401)
        payload = json.loads(rejected.exception.read().decode("utf-8"))
        self.assertIn("비밀번호", payload["error"])
