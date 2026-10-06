"""Original TestReport CellWeight evidence, using only synthetic fixtures."""
import copy
import hashlib
import io
import json
import math
import struct
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import MagicMock, patch

from backend.parsers import wrd
from tests.test_dataset_artifacts import portal
from tests.test_wrd_c_rate_reference import report_header
from tests.test_wrd_reference_dataset import REFERENCE, dataset_row

ROOT = Path(__file__).resolve().parents[1]
INFO = {"cellWeight_g": 0.04443, "source": "wrd_test_report_cell_weight"}


class WrdElectrodeInfoTests(unittest.TestCase):
    def info(self, blob, filename="synthetic.wrd"):
        with tempfile.TemporaryDirectory(prefix="wrd-electrode-info-") as directory:
            path = Path(directory) / filename
            path.write_bytes(blob)
            return wrd.read_wrd_electrode_info(path)

    def test_known_double_cell_weight_has_explicit_original_source(self):
        self.assertEqual(self.info(report_header()), INFO)

    def test_missing_weight_never_borrows_filename_mass_or_adjacent_bytes(self):
        self.assertIsNone(self.info(b"WbcsFile 0.04443g", "sample_0.050g.wrd"))
        self.assertIsNone(self.info(report_header().replace(b"<CellWeight>", b"<MassWeight>")))
        blob = bytearray(report_header())
        types = bytes([1, 1, 1, 1, 0, 1, 0, 4])
        blob[blob.index(types) + len(types)] = 8  # Int32 is not a Double.
        self.assertIsNone(self.info(bytes(blob)))

    def test_invalid_or_truncated_cell_weight_stays_unknown(self):
        header = report_header()
        packed = struct.pack("<d", INFO["cellWeight_g"])
        for mass in [0, -0.01, 0.0001, 1.01, math.nan, math.inf]:
            with self.subTest(mass=mass):
                self.assertIsNone(self.info(header.replace(packed, struct.pack("<d", mass), 1)))
        weight_end = header.index(packed) + 8
        for end in range(weight_end - 8, weight_end):
            with self.subTest(end=end):
                self.assertIsNone(self.info(header[:end]))
        self.assertEqual(self.info(header[:weight_end]), INFO)

    def test_weight_reader_consumes_only_64_kib_and_not_entire_source(self):
        class BoundedStream(io.BytesIO):
            def read(self, size=-1):
                if size != 65536:
                    raise AssertionError("Metadata read must be bounded to 64 KiB")
                return super().read(size)

        stream = BoundedStream(report_header() + b"x" * 100000)
        with patch.object(Path, "open", return_value=stream), patch.object(
                Path, "read_bytes", side_effect=AssertionError("Full source read")):
            self.assertEqual(wrd.read_wrd_electrode_info(Path("synthetic.wrd")), INFO)
        self.assertIsNone(self.info(b"x" * 65536 + report_header()))

    def test_inspection_adds_electrode_metadata_without_changing_measurements(self):
        points = b"".join(b"10mA" + struct.pack("<6d", 3.8 - index * 0.1,
                              -0.0014223, 0, capacity, 0, 0)
                          for index, capacity in enumerate([0.001, 0.004, 0.007]))
        with tempfile.TemporaryDirectory(prefix="wrd-inspection-electrode-") as directory:
            path = Path(directory) / "synthetic.wrd"
            original = report_header() + b" DISCHARGE Q " + points
            path.write_bytes(original)
            result = subprocess.run([str(ROOT / ".venv/Scripts/python.exe"), "-X", "utf8", "-B",
                                     str(ROOT / "scripts/inspect_file.py"), str(path), "--full"],
                                    text=True, encoding="utf-8", capture_output=True, cwd=ROOT)
            self.assertEqual(result.returncode, 0, result.stderr)
            parsed = json.loads(result.stdout)
            self.assertEqual(parsed["parser"]["electrodeInfo"], INFO)
            self.assertAlmostEqual(parsed["parser"]["cRateReference"]["oneC_mA"], 7.10941)
            self.assertEqual(parsed["parser"]["version"], "parser-8")
            self.assertEqual([row["discharge Q (Ah)"] for row in parsed["rows"]],
                             [0.001, 0.004, 0.007])
            self.assertEqual(path.read_bytes(), original)


class WrdElectrodeDatasetTests(unittest.TestCase):
    def test_old_authorized_detail_hydrates_weight_read_only_and_keeps_c_rate_reference(self):
        with tempfile.TemporaryDirectory(prefix="wrd-electrode-detail-") as directory:
            root = Path(directory)
            path = root / "synthetic.wrd"
            payload = report_header() + b"x" * 100000
            path.write_bytes(payload)
            row = dataset_row(path.name)
            original_row = copy.deepcopy(row)
            rendered = [{"cycle_index": 1, "current_a": -0.0014223}]
            before_hash = hashlib.sha256(payload).hexdigest()
            with patch.object(portal, "DATA_DIR", root), patch.object(
                    portal, "load_analysis_rows", return_value=(rendered, {"rowSource": "database"})), patch.object(
                    portal, "inspect_path", side_effect=AssertionError("Measurements reparsed")), patch.object(
                    portal, "save_dataset", side_effect=AssertionError("Dataset write")):
                result = portal.dataset_detail_from_row(row)
            self.assertEqual(result["electrodeInfo"], INFO)
            self.assertAlmostEqual(result["cRateReference"]["oneC_mA"], REFERENCE["oneC_mA"])
            self.assertEqual(result["rows"], rendered)
            self.assertEqual(row, original_row)
            self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(), before_hash)

    def test_compact_dataset_uses_saved_evidence_without_raw_file_access(self):
        row = dataset_row("missing.wrd", {"name": "wrd", "version": "parser-8",
                                          "electrodeInfo": INFO, "cRateReference": REFERENCE})
        with patch.object(Path, "open", side_effect=AssertionError("List read raw source")):
            result = portal.dataset_from_row(row, include_rows=False)
        self.assertEqual(result["electrodeInfo"], INFO)
        self.assertEqual(result["cRateReference"]["source"], REFERENCE["source"])
        self.assertAlmostEqual(result["cRateReference"]["oneC_mA"], REFERENCE["oneC_mA"])
        self.assertFalse(result["rowsLoaded"])

    def test_validation_rejects_untrusted_source_invalid_weight_and_non_cyc_type(self):
        for info in [None, {}, {**INFO, "source": "filename_mass"},
                     {**INFO, "cellWeight_g": True}, {**INFO, "cellWeight_g": "0.04443"},
                     {**INFO, "cellWeight_g": 0}, {**INFO, "cellWeight_g": math.inf},
                     {**INFO, "cellWeight_g": math.nan}, {**INFO, "cellWeight_g": 1.01}]:
            with self.subTest(info=info):
                row = dataset_row("", {"name": "wrd", "electrodeInfo": info})
                self.assertIsNone(portal.dataset_from_row(row, include_rows=False).get("electrodeInfo"))
        row = dataset_row("", {"name": "wrd", "electrodeInfo": INFO})
        row["data_type"] = "eis"
        self.assertIsNone(portal.dataset_from_row(row, include_rows=False).get("electrodeInfo"))

    def test_missing_or_outside_local_artifact_cannot_load_electrode_metadata(self):
        with patch.object(portal, "load_analysis_rows", return_value=([], {"rowSource": "database"})), patch.object(
                Path, "open", side_effect=AssertionError("Outside raw read")):
            result = portal.dataset_detail_from_row(dataset_row("../outside.wrd"))
        self.assertIsNone(result.get("electrodeInfo"))
        with patch.object(portal, "load_analysis_rows", return_value=([], {"rowSource": "database"})):
            result = portal.dataset_detail_from_row(dataset_row("missing-electrode-source.wrd"))
        self.assertIsNone(result.get("electrodeInfo"))

    def test_large_integer_weight_is_rejected_without_numeric_overflow(self):
        self.assertIsNone(portal.validated_wrd_electrode_info({**INFO, "cellWeight_g": 10 ** 1000}))

    def test_unauthorized_get_does_not_load_weight_metadata(self):
        row = dataset_row("synthetic.wrd")
        cursor = MagicMock()
        cursor.fetchone.return_value = row
        with patch.object(portal, "connect"), patch.object(portal, "execute", return_value=cursor), patch.object(
                portal, "dataset_detail_from_row", side_effect=AssertionError("Unauthorized raw read")):
            with self.assertRaises(portal.HTTPException) as raised:
                portal.get_dataset(row["id"], user={"id": "different-user", "role": "user"})
        self.assertEqual(raised.exception.status_code, 403)

    def test_new_import_persists_original_weight_in_artifact_and_provenance(self):
        portal.init_db()
        user = {"id": "electrode-info-owner", "name": "Fixture", "role": "user"}
        source = report_header() + b"synthetic measurements"
        source_path, _ = portal.save_upload_bytes(source, "synthetic.wrd", "raw")
        parsed = {"parser": {"name": "wrd", "version": "parser-8", "electrodeInfo": INFO,
                              "cRateReference": REFERENCE},
                  "canonicalRows": [{"cycle_index": 1, "current_a": -0.0014223}]}
        item = {"id": "synthetic-electrode-info-finalized", "projectId": "fixture", "cellRecordId": "fixture",
                "cell": {}, "columns": ["cycle", "current (A)"], "dataType": "cyc"}
        with portal.connect() as conn:
            portal.execute(conn, "INSERT INTO users(id,name,password_hash,role,created_at) VALUES(?,?,?,?,?) ON CONFLICT(id) DO NOTHING",
                           (user["id"], user["name"], "fixture-only", "user", "fixture"))
            upload_id = portal.create_upload_session(conn, user, "synthetic.wrd", source_path, None, source, parsed)
            result = portal.persist_upload_session_artifacts(conn, item, upload_id, user)
        self.assertEqual(result["analysisProvenance"]["electrodeInfo"], INFO)
        self.assertEqual(result["analysisProvenance"]["cRateReference"]["source"], REFERENCE["source"])
        self.assertAlmostEqual(result["analysisProvenance"]["cRateReference"]["oneC_mA"], REFERENCE["oneC_mA"])
        document = json.loads((portal.DATA_DIR / result["parsedArtifact"]["localPath"]).read_text(encoding="utf-8"))
        self.assertEqual(document["parser"]["electrodeInfo"], INFO)
        self.assertNotIn("mass_g", document["canonicalRows"][0])


if __name__ == "__main__":
    unittest.main()
