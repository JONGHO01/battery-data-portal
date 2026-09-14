"""Synthetic WBCS metadata, never committed experimental binary files."""
import struct
from pathlib import Path

import pytest

from backend.parsers.wrd import extract_wrd_mass_g, read_wrd


def report_header(mass=0.04443, weight_name="CellWeight", weight_type=6):
    def string(text):
        encoded = text.encode("ascii")
        assert len(encoded) < 128
        return bytes([len(encoded)]) + encoded

    names = ["Name", "SchMaker", "ProductInfo", "CellType", weight_name,
             "CRate", "CellCapacity", "CellInfor"]
    # NRBF ClassWithMembersAndTypes; additional type metadata precedes values.
    return (b"\x05" + struct.pack("<i", 13)
            + string("WbcsFile.Sequence.TestReport") + struct.pack("<i", len(names))
            + b"".join(string(f"<{name}>k__BackingField") for name in names)
            + bytes([1, 1, 1, 1, 0, 1, 0, 4])
            + bytes([weight_type, 6]) + string("WbcsFile.Sequence.TestCellInfor")
            + struct.pack("<ii", 2, 2)
            + b"\x06" + struct.pack("<i", 19) + string("")
            + (b"\x09" + struct.pack("<i", 19)) * 3 + struct.pack("<d", mass)
            + b"\x0a" + struct.pack("<d", 0.00710941) + b"\x0a")


def test_reads_binary_cell_weight_when_filename_has_no_mass_unit():
    assert extract_wrd_mass_g(Path("sample_39.30803255_8.wrd"), report_header()) == 0.04443


def test_class_type_descriptor_before_actual_report_is_not_a_record():
    descriptor = b"\x04\x1cWbcsFile.Sequence.TestReport\x02\x00\x00\x00"
    assert extract_wrd_mass_g(Path("sample.wrd"), descriptor + report_header()) == 0.04443


def test_binary_mass_restores_specific_capacity_without_changing_raw_ah(tmp_path):
    path = tmp_path / "sample.wrd"
    capacities = [0.001, 0.005, 0.007166723873835356]
    points = b"".join(b"10mA" + struct.pack("<6d", 2.5, -0.001, 0, q, 0, 0)
                      for q in capacities)
    payload = report_header() + b" DISCHARGE Q " + points
    path.write_bytes(payload)
    rows, _ = read_wrd(path)
    assert rows[-1][3] == pytest.approx(161.3037108673274)
    assert [row[5] for row in rows[1:]] == capacities
    assert path.read_bytes() == payload


@pytest.mark.parametrize("mass", [0, -1, float("nan"), float("inf"), 500])
def test_invalid_binary_mass_does_not_create_specific_capacity(mass):
    assert extract_wrd_mass_g(Path("sample.wrd"), report_header(mass)) is None


def test_truncated_metadata_never_reads_adjacent_bytes_as_mass():
    header = report_header()
    # Every truncation before the end of the encoded mass must fail safely.
    mass_end = header.index(struct.pack("<d", 0.04443)) + 8
    for end in range(mass_end):
        assert extract_wrd_mass_g(Path("sample.wrd"), header[:end]) is None


def test_other_fields_and_unsupported_types_are_not_mass():
    assert extract_wrd_mass_g(Path("sample.wrd"), report_header(weight_name="SomeWeight")) is None
    assert extract_wrd_mass_g(Path("sample.wrd"), report_header(weight_type=8)) is None
    assert extract_wrd_mass_g(Path("sample.wrd"), b"<CellWeight>" + struct.pack("<d", 0.04443)) is None


def test_preserves_explicit_filename_mass_precedence():
    assert extract_wrd_mass_g(Path("sample_0.050g.wrd"), report_header()) == 0.05
