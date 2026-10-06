"""Synthetic TestReport nominal-capacity evidence; no experiment files."""
import io
import json
import math
import struct
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from backend.parsers import wrd

ROOT = Path(__file__).resolve().parents[1]


def report_header(capacity=0.00710941, capacity_name="CellCapacity", capacity_type=6):
    def string(value):
        encoded = value.encode("ascii")
        return bytes([len(encoded)]) + encoded

    names = ["Name", "SchMaker", "ProductInfo", "CellType", "CellWeight",
             "CRate", capacity_name, "CellInfor"]
    return (b"\x05" + struct.pack("<i", 13)
            + string("WbcsFile.Sequence.TestReport") + struct.pack("<i", len(names))
            + b"".join(string(f"<{name}>k__BackingField") for name in names)
            + bytes([1, 1, 1, 1, 0, 1, 0, 4])
            + bytes([6, capacity_type]) + string("WbcsFile.Sequence.TestCellInfor")
            + struct.pack("<ii", 2, 2)
            + b"\x06" + struct.pack("<i", 19) + string("")
            + (b"\x09" + struct.pack("<i", 19)) * 3 + struct.pack("<d", 0.04443)
            + b"\x0a" + struct.pack("<d", capacity) + b"\x0a")


class WrdCRateReferenceTests(unittest.TestCase):
    def reference(self, blob):
        with tempfile.TemporaryDirectory(prefix="wrd-reference-") as directory:
            path = Path(directory) / "sample.wrd"
            path.write_bytes(blob)
            return wrd.read_wrd_c_rate_reference(path)

    def test_nominal_ah_provides_one_c_ma_without_assuming_minimum_current(self):
        result = self.reference(report_header())
        self.assertEqual(result["source"], "wrd_test_report_cell_capacity")
        self.assertAlmostEqual(result["nominalCapacity_Ah"], 0.00710941)
        self.assertAlmostEqual(result["oneC_mA"], 7.10941)
        self.assertAlmostEqual(1.4223 / result["oneC_mA"], 0.2, places=3)
        self.assertAlmostEqual(0.7111 / result["oneC_mA"], 0.1, places=3)

    def test_invalid_or_missing_nominal_capacity_never_guesses_reference(self):
        for capacity in [0, -0.001, math.nan, math.inf, 1e300]:
            with self.subTest(capacity=capacity):
                self.assertIsNone(self.reference(report_header(capacity)))
        self.assertIsNone(self.reference(b"WbcsFile DISCHARGE Q 0.00710941Ah"))

    def test_unknown_member_or_primitive_type_is_not_nominal_capacity(self):
        self.assertIsNone(self.reference(report_header(capacity_name="OtherCapacity")))
        self.assertIsNone(self.reference(report_header(capacity_type=8)))
        self.assertIsNone(self.reference(b"<CellCapacity>" + struct.pack("<d", 0.00710941)))

    def test_truncated_metadata_does_not_borrow_adjacent_measurement_bytes(self):
        header = report_header()
        capacity_end = header.index(struct.pack("<d", 0.00710941)) + 8
        for end in range(capacity_end):
            with self.subTest(end=end):
                self.assertIsNone(self.reference(header[:end]))
        self.assertEqual(wrd.extract_wrd_mass_g(Path("sample.wrd"), header), 0.04443)
        self.assertEqual(wrd.extract_wrd_mass_g(Path("sample_0.050g.wrd"), header), 0.05)

    def test_metadata_reader_only_consumes_bounded_prefix(self):
        class BoundedStream(io.BytesIO):
            def read(self, size=-1):
                if size != 65536:
                    raise AssertionError("Metadata read must be bounded to 64 KiB")
                return super().read(size)

        stream = BoundedStream(report_header() + b"x" * 100000)
        with patch.object(Path, "open", return_value=stream), patch.object(
                Path, "read_bytes", side_effect=AssertionError("Full source read")):
            result = wrd.read_wrd_c_rate_reference(Path("sample.wrd"))
        self.assertAlmostEqual(result["oneC_mA"], 7.10941)
        self.assertIsNone(self.reference(b"x" * 65536 + report_header()))

    def test_inspection_keeps_reference_separate_from_explicit_c_rate_rows(self):
        points = b"".join(b"10mA" + struct.pack("<6d", 3.8 - index * 0.1,
                             -0.0014223, 0, capacity, 0, 0)
                          for index, capacity in enumerate([0.001, 0.004, 0.007]))
        with tempfile.TemporaryDirectory(prefix="wrd-inspection-reference-") as directory:
            path = Path(directory) / "sample.wrd"
            original = report_header() + b" DISCHARGE Q " + points
            path.write_bytes(original)
            result = subprocess.run([str(ROOT / ".venv/Scripts/python.exe"), "-X", "utf8", "-B",
                                     str(ROOT / "scripts/inspect_file.py"), str(path), "--full"],
                                    text=True, encoding="utf-8", capture_output=True, cwd=ROOT)
            self.assertEqual(result.returncode, 0, result.stderr)
            parsed = json.loads(result.stdout)
            reference = parsed["parser"]["cRateReference"]
            self.assertAlmostEqual(reference["oneC_mA"], 7.10941)
            self.assertEqual(reference["source"], "wrd_test_report_cell_capacity")
            self.assertNotIn("c_rate", parsed["columns"])
            self.assertEqual([row["discharge Q (Ah)"] for row in parsed["rows"]],
                             [0.001, 0.004, 0.007])
            self.assertEqual(path.read_bytes(), original)


if __name__ == "__main__":
    unittest.main()
