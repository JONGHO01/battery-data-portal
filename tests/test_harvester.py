import base64
import tempfile
import unittest
from pathlib import Path


from harvester.portal_harvester import build_upload_payload, validate_config


class HarvesterTests(unittest.TestCase):
    def test_payload_contains_file_and_dataset_metadata_but_no_secret(self):
        with tempfile.TemporaryDirectory(prefix="battery-harvester-test-") as temp_dir:
            path = Path(temp_dir) / "cycle.csv"
            path.write_bytes(b"cycle,capacity\n1,160\n")
            config = validate_config(
                {
                    "serverUrl": "https://portal.example.org",
                    "watchPaths": [temp_dir],
                    "dataset": {"dataType": "cyc", "cell": {"cellId": "AUTO-01"}},
                },
                Path(temp_dir) / "config.json",
            )
            payload = build_upload_payload(path, config)

        self.assertEqual(payload["filename"], "cycle.csv")
        self.assertEqual(base64.b64decode(payload["contentBase64"]), b"cycle,capacity\n1,160\n")
        self.assertEqual(payload["dataset"]["cell"]["cellId"], "AUTO-01")
        self.assertNotIn("token", payload)


if __name__ == "__main__":
    unittest.main()
