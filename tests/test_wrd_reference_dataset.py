"""Dataset metadata hydration using only disposable synthetic artifacts."""
import copy
import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import MagicMock, patch

# The shared fixture sets DATA_DIR to an isolated directory before server import.
from tests.test_dataset_artifacts import portal
from tests.test_wrd_c_rate_reference import report_header


REFERENCE = {"oneC_mA": 7.10941, "source": "wrd_test_report_cell_capacity",
             "nominalCapacity_Ah": 0.00710941}


def dataset_row(raw_path="", parser=None):
    return {
        "id": "synthetic-reference", "owner_id": "reference-owner", "owner_name": "Fixture",
        "data_type": "cyc", "figure_kind": "cycling-performance", "created_at": "fixture",
        "updated_at": "fixture", "cell_json": "{}", "rows_json": "[]", "row_count": 3,
        "columns_json": "[]", "source_name": "synthetic.wrd", "figure_edits_json": "{}",
        "raw_artifact_json": json.dumps({"localPath": raw_path}),
        "parser_json": json.dumps(parser or {"name": "wrd", "version": "parser-8"}),
        "analysis_provenance_json": "{}",
    }


class WrdReferenceDatasetTests(unittest.TestCase):
    def assertReference(self, reference):
        self.assertEqual(reference["source"], REFERENCE["source"])
        self.assertAlmostEqual(reference["oneC_mA"], REFERENCE["oneC_mA"])
        self.assertAlmostEqual(reference["nominalCapacity_Ah"], REFERENCE["nominalCapacity_Ah"])

    def test_old_dataset_get_adds_reference_without_reparse_or_writes(self):
        with tempfile.TemporaryDirectory(prefix="wrd-detail-reference-") as directory:
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
            self.assertReference(result["cRateReference"])
            self.assertEqual(result["rows"], rendered)
            self.assertEqual(row, original_row)
            self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(), before_hash)

    def test_compact_lists_use_saved_parser_reference_without_reading_raw_files(self):
        row = dataset_row("missing.wrd", {"name": "wrd", "version": "parser-8",
                                          "cRateReference": REFERENCE})
        with patch.object(Path, "open", side_effect=AssertionError("List read raw source")):
            result = portal.dataset_from_row(row, include_rows=False)
        self.assertReference(result["cRateReference"])
        self.assertFalse(result["rowsLoaded"])

    def test_reference_rejects_wrong_source_or_inconsistent_current_and_missing_raw(self):
        for reference in [{**REFERENCE, "source": "minimum_current"},
                          {**REFERENCE, "oneC_mA": 0.7111},
                          {**REFERENCE, "oneC_mA": True},
                          {**REFERENCE, "nominalCapacity_Ah": -1}]:
            with self.subTest(reference=reference):
                row = dataset_row("", {"name": "wrd", "cRateReference": reference})
                self.assertIsNone(portal.dataset_from_row(row, include_rows=False).get("cRateReference"))
        with patch.object(portal, "load_analysis_rows", return_value=([], {"rowSource": "database"})):
            result = portal.dataset_detail_from_row(dataset_row())
        self.assertIsNone(result.get("cRateReference"))

    def test_unauthorized_get_does_not_read_nominal_reference(self):
        row = dataset_row("synthetic.wrd")
        cursor = MagicMock()
        cursor.fetchone.return_value = row
        with patch.object(portal, "connect"), patch.object(portal, "execute", return_value=cursor), patch.object(
                portal, "dataset_detail_from_row", side_effect=AssertionError("Unauthorized raw read")):
            with self.assertRaises(portal.HTTPException) as raised:
                portal.get_dataset(row["id"], user={"id": "different-user", "role": "user"})
        self.assertEqual(raised.exception.status_code, 403)

    def test_finalized_new_import_persists_reference_in_artifact_and_provenance(self):
        portal.init_db()
        user = {"id": "reference-owner", "name": "Fixture", "role": "user"}
        source = report_header() + b"synthetic measurements"
        source_path, _ = portal.save_upload_bytes(source, "synthetic.wrd", "raw")
        parsed = {"parser": {"name": "wrd", "version": "parser-8", "cRateReference": REFERENCE},
                  "canonicalRows": [{"cycle_index": 1, "current_a": -0.0014223}]}
        item = {"id": "synthetic-reference-finalized", "projectId": "fixture", "cellRecordId": "fixture",
                "cell": {}, "columns": ["cycle", "current (A)"], "dataType": "cyc"}
        with portal.connect() as conn:
            portal.execute(conn, "INSERT INTO users(id,name,password_hash,role,created_at) VALUES(?,?,?,?,?) ON CONFLICT(id) DO NOTHING",
                           (user["id"], user["name"], "fixture-only", "user", "fixture"))
            upload_id = portal.create_upload_session(conn, user, "synthetic.wrd", source_path, None, source, parsed)
            result = portal.persist_upload_session_artifacts(conn, item, upload_id, user)
        self.assertReference(result["analysisProvenance"]["cRateReference"])
        document = json.loads((portal.DATA_DIR / result["parsedArtifact"]["localPath"]).read_text(encoding="utf-8"))
        self.assertEqual(document["parser"]["cRateReference"], REFERENCE)
        self.assertNotIn("c_rate", document["canonicalRows"][0])


if __name__ == "__main__":
    unittest.main()
