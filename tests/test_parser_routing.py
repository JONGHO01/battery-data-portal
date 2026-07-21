import struct
import tempfile
import unittest
from pathlib import Path


from backend.parsers.router import inspect_path, parser_key_for_path
from backend.parsers.wrd import read_wrd


class ParserRoutingTests(unittest.TestCase):
    @staticmethod
    def _wrd_segment(capacities: tuple[float, ...]) -> bytes:
        return b"".join(
            b"10mA" + struct.pack("<6d", 2.5, -0.003, 0.0, capacity, 0.0, 0.0)
            for capacity in capacities
        )

    def test_routes_supported_extensions_to_dedicated_parsers(self):
        self.assertEqual(parser_key_for_path(Path("sample.wrd")), "wrd")
        self.assertEqual(parser_key_for_path(Path("sample.SEO")), "seo")
        self.assertEqual(parser_key_for_path(Path("sample.SDE")), "seo")
        self.assertEqual(parser_key_for_path(Path("sample.xlsx")), "excel")
        self.assertEqual(parser_key_for_path(Path("sample.csv")), "csv")

    def test_sde_uses_the_eis_binary_parser(self):
        blob = bytearray(112 * 6)
        for point, (frequency, zreal, zimag) in enumerate(
            ((100000.0, 2.8, -0.4), (80000.0, 2.9, -0.5), (63000.0, 3.0, -0.6))
        ):
            offset = point * 112
            struct.pack_into("<f", blob, offset, frequency)
            struct.pack_into("<f", blob, offset + 28, zreal)
            struct.pack_into("<f", blob, offset + 32, zimag)

        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "sample.SDE"
            path.write_bytes(blob)
            rows, sheet, key = inspect_path(path)

        self.assertEqual(key, "seo")
        self.assertEqual(sheet, "SDE EIS binary")
        self.assertEqual(rows[0], ["sweep", "point", "frequency", "zreal", "zimag", "mag", "phase"])
        self.assertEqual(len(rows) - 1, 3)

    def test_rejects_unknown_extensions(self):
        with self.assertRaises(ValueError):
            parser_key_for_path(Path("sample.pdf"))

    def test_wbcs_wrd_discharge_records_become_cyc_rows(self):
        header = b"WbcsFile example DISCHARGE Q 0.01483297g "
        points = b"".join(
            b"10mA" + struct.pack("<6d", 2.5, -0.00027, 0.0, discharge_q, 0.0, 0.0)
            for discharge_q in (0.00250, 0.00252, 0.00254)
        )
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "sample.wrd"
            path.write_bytes(header + points)
            rows, sheet = read_wrd(path)

        self.assertEqual(sheet, "WRD discharge summary")
        self.assertEqual(rows[0][0], "cycle")
        self.assertEqual(rows[1][0], 1)
        self.assertGreater(rows[1][1], 0)
        self.assertEqual(rows[1][5], 3)

    def test_wrd_prefers_precise_filename_mass_over_binary_text_noise(self):
        """A filename mass must win over an unrelated binary ``1g`` marker."""
        header = b"WbcsFile example DISCHARGE Q metadata 1g "
        points = self._wrd_segment((0.00250, 0.00252, 0.00254))
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "NCM622_0.0500000g.cyc_001.wrd"
            path.write_bytes(header + points)
            rows, _ = read_wrd(path)

        self.assertAlmostEqual(rows[1][1], 50.8, places=3)

    def test_wrd_discards_a_short_partial_segment_before_full_cycles(self):
        """A brief aborted pre-step must not become a false low-capacity cycle."""
        header = b"WbcsFile example DISCHARGE Q 0.0500000g "
        points = b"".join(
            [
                self._wrd_segment((0.00038,)),
                self._wrd_segment((0.00001, 0.001, 0.002, 0.003, 0.004, 0.005, 0.006, 0.007)),
                self._wrd_segment((0.00001, 0.001, 0.002, 0.003, 0.004, 0.005, 0.006, 0.0065)),
            ]
        )
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "partial-first.wrd"
            path.write_bytes(header + points)
            rows, _ = read_wrd(path)

        self.assertEqual([row[0] for row in rows[1:]], [1, 2])
        self.assertEqual([row[5] for row in rows[1:]], [8, 8])

    def test_wrd_keeps_a_complete_low_capacity_cycle(self):
        """A real capacity collapse is data, not an incomplete export segment."""
        header = b"WbcsFile example DISCHARGE Q 0.0500000g "
        points = b"".join(
            [
                self._wrd_segment((0.00001, 0.001, 0.002, 0.003, 0.004, 0.005, 0.006, 0.007)),
                self._wrd_segment((0.00001, 0.001, 0.002, 0.003, 0.004, 0.005, 0.006, 0.0065)),
                self._wrd_segment((0.00001, 0.0001, 0.0002, 0.0003, 0.0004, 0.0005, 0.0006, 0.0009)),
            ]
        )
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "complete-low-capacity.wrd"
            path.write_bytes(header + points)
            rows, _ = read_wrd(path)

        self.assertEqual([row[0] for row in rows[1:]], [1, 2, 3])
        self.assertEqual(rows[-1][5], 8)
        self.assertLess(rows[-1][1], rows[1][1] * 0.2)


if __name__ == "__main__":
    unittest.main()
