import asyncio
import io
import unittest
from contextlib import redirect_stderr
from unittest.mock import patch

import python_backend as portal


class RuntimeSecurityTests(unittest.TestCase):
    def test_safe_defaults_do_not_enable_header_impersonation_or_public_cors(self):
        self.assertFalse(portal.ALLOW_LEGACY_USER_HEADER)
        self.assertEqual(portal.CORS_ALLOW_ORIGINS, [])

    def test_default_upload_limit_accepts_common_wbcs_wrd_exports(self):
        # WBCS cycling exports can be larger than 50 MiB even when the parsed
        # cycle summary is small. Keep a bounded, but practical, default.
        self.assertGreaterEqual(portal.DEFAULT_MAX_UPLOAD_BYTES, 100 * 1024 * 1024)

    def test_sqlite_connections_wait_for_transient_dataset_save_writes(self):
        """A large artifact write must not immediately fail a concurrent save."""

        if portal.USE_POSTGRES:
            self.skipTest("SQLite-specific connection behavior")
        with portal.connect() as conn:
            timeout_ms = portal.scalar(portal.execute(conn, "PRAGMA busy_timeout").fetchone())
        self.assertGreaterEqual(int(timeout_ms), 30_000)

    def test_cors_parser_strips_empty_and_whitespace_entries(self):
        self.assertEqual(
            portal.parse_cors_allow_origins(" https://portal.example , ,https://lab.example "),
            ["https://portal.example", "https://lab.example"],
        )
        self.assertEqual(portal.parse_cors_allow_origins(""), [])

    def test_production_refuses_legacy_header_authentication(self):
        with patch.multiple(
            portal,
            APP_ENV="production",
            ALLOW_LEGACY_USER_HEADER=True,
            JWT_SECRET="test-secret-for-production-123",
            CORS_ALLOW_ORIGINS=["https://portal.example"],
            STORAGE_BACKEND="s3",
            REQUIRE_DURABLE_STORAGE=True,
        ), patch.object(portal, "storage_ready", return_value=True):
            with self.assertRaisesRegex(RuntimeError, "ALLOW_LEGACY_USER_HEADER"):
                portal.validate_runtime_configuration()

    def test_production_refuses_wildcard_cors_but_starts_with_storage_diagnostics(self):
        with patch.multiple(
            portal,
            APP_ENV="production",
            USE_POSTGRES=True,
            ALLOW_LEGACY_USER_HEADER=False,
            JWT_SECRET="test-secret-for-production-123",
            CORS_ALLOW_ORIGINS=["*"],
            STORAGE_BACKEND="local",
            REQUIRE_DURABLE_STORAGE=True,
        ):
            with self.assertRaisesRegex(RuntimeError, "CORS_ALLOW_ORIGINS"):
                portal.validate_runtime_configuration()

        with patch.multiple(
            portal,
            APP_ENV="production",
            USE_POSTGRES=True,
            ALLOW_LEGACY_USER_HEADER=False,
            JWT_SECRET="test-secret-for-production-123",
            CORS_ALLOW_ORIGINS=["https://portal.example"],
            STORAGE_BACKEND="local",
            REQUIRE_DURABLE_STORAGE=True,
        ):
            stderr = io.StringIO()
            with redirect_stderr(stderr):
                portal.validate_runtime_configuration()
            self.assertIn("Dataset uploads will be refused", stderr.getvalue())
            self.assertIn("STORAGE_BACKEND", stderr.getvalue())

    def test_production_requires_postgresql_for_persistent_account_logins(self):
        """A hosted portal must not create accounts in an ephemeral SQLite file."""

        with patch.multiple(
            portal,
            APP_ENV="production",
            USE_POSTGRES=False,
            ALLOW_LEGACY_USER_HEADER=False,
            JWT_SECRET="test-secret-for-production-123",
            CORS_ALLOW_ORIGINS=["https://portal.example"],
            STORAGE_BACKEND="s3",
            REQUIRE_DURABLE_STORAGE=True,
        ), patch.object(portal, "storage_ready", return_value=True):
            with self.assertRaisesRegex(RuntimeError, "DATABASE_URL"):
                portal.validate_runtime_configuration()

    def test_production_accepts_configured_object_storage(self):
        with patch.multiple(
            portal,
            APP_ENV="production",
            USE_POSTGRES=True,
            ALLOW_LEGACY_USER_HEADER=False,
            JWT_SECRET="test-secret-for-production-123",
            CORS_ALLOW_ORIGINS=["https://portal.example"],
            STORAGE_BACKEND="s3",
            REQUIRE_DURABLE_STORAGE=True,
        ), patch.object(portal, "storage_ready", return_value=True):
            portal.validate_runtime_configuration()

    def test_storage_configuration_reports_only_missing_variable_names(self):
        """Render diagnostics must never expose values, only required key names."""

        with patch.multiple(
            portal,
            STORAGE_BACKEND="s3",
            S3_BUCKET="",
            S3_ACCESS_KEY_ID="",
            S3_SECRET_ACCESS_KEY="",
            S3_ENDPOINT_URL="",
        ):
            self.assertEqual(
                portal.storage_configuration_issues(),
                ["S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"],
            )
            self.assertFalse(portal.storage_ready())

        with patch.multiple(
            portal,
            STORAGE_BACKEND="supabase",
            S3_BUCKET="portal-files",
            S3_ACCESS_KEY_ID="access",
            S3_SECRET_ACCESS_KEY="secret",
            S3_ENDPOINT_URL="",
        ):
            self.assertEqual(portal.storage_configuration_issues(), ["S3_ENDPOINT_URL"])

    def test_b2_requires_the_official_endpoint_and_matching_region(self):
        configured = {
            "STORAGE_BACKEND": "s3",
            "S3_PROVIDER": "b2",
            "S3_BUCKET": "battery-portal-private",
            "S3_ACCESS_KEY_ID": "access",
            "S3_SECRET_ACCESS_KEY": "secret",
            "S3_REGION": "us-west-004",
        }

        with patch.multiple(portal, **configured, S3_ENDPOINT_URL=""):
            self.assertEqual(portal.storage_configuration_issues(), ["S3_ENDPOINT_URL"])
        with patch.multiple(
            portal,
            **configured,
            S3_ENDPOINT_URL="http://example.com",
        ):
            self.assertEqual(portal.storage_configuration_issues(), ["S3_ENDPOINT_URL"])
        with patch.multiple(
            portal,
            **{**configured, "S3_REGION": "us-east-1"},
            S3_ENDPOINT_URL="https://s3.us-west-004.backblazeb2.com",
        ):
            self.assertEqual(portal.storage_configuration_issues(), ["S3_REGION"])
        with patch.multiple(
            portal,
            **configured,
            S3_ENDPOINT_URL="https://s3.us-west-004.backblazeb2.com",
        ):
            self.assertEqual(portal.storage_configuration_issues(), [])

    def test_health_reports_only_the_active_storage_provider(self):
        with patch.multiple(portal, STORAGE_BACKEND="local", S3_PROVIDER="b2"):
            self.assertEqual(portal.health()["storageProvider"], "local")
        with patch.multiple(portal, STORAGE_BACKEND="s3", S3_PROVIDER="b2"):
            self.assertEqual(portal.health()["storageProvider"], "b2")

    def test_invalid_b2_configuration_blocks_delete_before_creating_a_client(self):
        with patch.multiple(
            portal,
            STORAGE_BACKEND="s3",
            REQUIRE_DURABLE_STORAGE=True,
            S3_PROVIDER="b2",
            S3_BUCKET="battery-portal-private",
            S3_ENDPOINT_URL="http://untrusted.example",
            S3_REGION="us-west-004",
            S3_ACCESS_KEY_ID="access",
            S3_SECRET_ACCESS_KEY="secret",
        ), patch("boto3.client") as client:
            with self.assertRaises(portal.HTTPException) as blocked:
                portal.delete_from_object_storage("projects/one/datasets/two/raw/source.wrd")

        self.assertEqual(blocked.exception.status_code, 503)
        client.assert_not_called()

    def test_production_storage_warning_names_the_missing_render_variable(self):
        with patch.multiple(
            portal,
            APP_ENV="production",
            USE_POSTGRES=True,
            ALLOW_LEGACY_USER_HEADER=False,
            JWT_SECRET="test-secret-for-production-123",
            CORS_ALLOW_ORIGINS=["https://portal.example"],
            STORAGE_BACKEND="s3",
            REQUIRE_DURABLE_STORAGE=True,
            S3_BUCKET="",
            S3_ACCESS_KEY_ID="access",
            S3_SECRET_ACCESS_KEY="secret",
        ):
            stderr = io.StringIO()
            with redirect_stderr(stderr):
                portal.validate_runtime_configuration()
            self.assertIn("S3_BUCKET", stderr.getvalue())

    def test_production_signup_refuses_an_ephemeral_account_database(self):
        """The portal must not promise a reusable account stored only in /tmp."""

        with patch.multiple(portal, APP_ENV="production", USE_POSTGRES=False):
            with self.assertRaises(portal.HTTPException) as rejected:
                portal.register({"id": "new-researcher", "password": "safe-test-password-123"})
        self.assertEqual(rejected.exception.status_code, 503)
        self.assertIn("DATABASE_URL", rejected.exception.detail)

    def test_render_signup_requires_postgresql_even_without_app_env(self):
        """Render's built-in runtime marker protects manual service setup."""

        with patch.dict(portal.os.environ, {"RENDER": "true"}), patch.multiple(
            portal,
            APP_ENV="local",
            USE_POSTGRES=False,
        ):
            with self.assertRaises(portal.HTTPException) as rejected:
                portal.register({"id": "render-user", "password": "safe-test-password-123"})
        self.assertEqual(rejected.exception.status_code, 503)

    def test_production_never_falls_back_to_local_artifacts_when_storage_is_missing(self):
        with patch.multiple(
            portal,
            APP_ENV="production",
            STORAGE_BACKEND="local",
            REQUIRE_DURABLE_STORAGE=True,
        ):
            with self.assertRaises(portal.HTTPException) as rejected:
                portal.upload_to_object_storage(b"test", "datasets/test/raw.csv", "text/csv")
        self.assertEqual(rejected.exception.status_code, 503)
        self.assertIn("STORAGE_BACKEND", rejected.exception.detail)

    def test_health_reports_storage_state_without_exposing_credentials(self):
        with patch.multiple(
            portal,
            STORAGE_BACKEND="s3",
            S3_BUCKET="",
            S3_ACCESS_KEY_ID="access-value-that-must-not-appear",
            S3_SECRET_ACCESS_KEY="secret-value-that-must-not-appear",
            ARCHIVE_AGENT_TOKEN="archive-value-that-must-not-appear",
        ):
            payload = portal.health()
        self.assertFalse(payload["storageConfigured"])
        self.assertEqual(payload["storageMissingVariables"], ["S3_BUCKET"])
        self.assertTrue(payload["archiveAgentConfigured"])
        self.assertEqual(payload["databaseRowsMode"], portal.DATABASE_ROWS_MODE)
        self.assertNotIn("secret-value-that-must-not-appear", str(payload))
        self.assertNotIn("archive-value-that-must-not-appear", str(payload))

    def test_base64_upload_is_rejected_before_decoding_when_too_large_or_invalid(self):
        with patch.multiple(portal, MAX_BODY=3, MAX_BASE64_CHARS=4):
            with self.assertRaises(portal.HTTPException) as too_large:
                portal.inspect_file_common({"filename": "test.csv", "contentBase64": "AAAAA"}, "inspect_file.py", {})
            self.assertEqual(too_large.exception.status_code, 413)
            self.assertIn("허용 한도", str(too_large.exception.detail))

            with self.assertRaises(portal.HTTPException) as invalid:
                portal.inspect_file_common({"filename": "test.csv", "contentBase64": "####"}, "inspect_file.py", {})
            self.assertEqual(invalid.exception.status_code, 400)

    def test_streamed_raw_upload_stops_after_the_configured_limit(self):
        class ChunkedRequest:
            headers = {}

            async def stream(self):
                yield b"12"
                yield b"34"

        with patch.object(portal, "MAX_BODY", 3):
            with self.assertRaises(portal.HTTPException) as too_large:
                asyncio.run(portal.read_request_body_limited(ChunkedRequest()))
        self.assertEqual(too_large.exception.status_code, 413)

    def test_object_cleanup_only_accepts_the_configured_storage_urls(self):
        with patch.multiple(portal, S3_BUCKET="portal-bucket", S3_PUBLIC_BASE_URL="https://files.example/portal"):
            self.assertEqual(portal.object_key_from_storage_url("s3://portal-bucket/raw/sample.wrd"), "raw/sample.wrd")
            self.assertEqual(portal.object_key_from_storage_url("https://files.example/portal/raw/sample.wrd"), "raw/sample.wrd")
            self.assertEqual(portal.object_key_from_storage_url("https://untrusted.example/raw/sample.wrd"), "")


if __name__ == "__main__":
    unittest.main()
