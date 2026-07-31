import struct
import tempfile
import unittest
from pathlib import Path


from backend.analysis.dqdv import calculate_dqdv
from backend.parsers.router import inspect_path, parser_key_for_path
from backend.parsers.wrd import (
    MAX_POINTS_PER_TRACE,
    MAX_TOTAL_CYC_POINTS,
    _trace_point_budget,
    read_wrd,
)
from backend.schemas.bdf import canonicalize_rows
from scripts.inspect_file import limit_inspection_rows


class ParserRoutingTests(unittest.TestCase):
    @staticmethod
    def _wrd_segment(capacities: tuple[float, ...], voltages: tuple[float, ...] | None = None) -> bytes:
        voltages = voltages or tuple(2.5 for _ in capacities)
        return b"".join(
            b"10mA" + struct.pack("<6d", voltage, -0.003, 0.0, capacity, 0.0, 0.0)
            for capacity, voltage in zip(capacities, voltages)
        )

    @staticmethod
    def _wrd_charge_segment(capacities: tuple[float, ...], voltages: tuple[float, ...] | None = None) -> bytes:
        """Build the positive-current half of a small WBCS cycling trace."""

        voltages = voltages or tuple(2.5 for _ in capacities)
        return b"".join(
            b"10mA" + struct.pack("<6d", voltage, 0.003, capacity, 0.0, 0.0, 0.0)
            for capacity, voltage in zip(capacities, voltages)
        )

    def test_routes_supported_extensions_to_dedicated_parsers(self):
        self.assertEqual(parser_key_for_path(Path("sample.wrd")), "wrd")
        self.assertEqual(parser_key_for_path(Path("sample.SEO")), "seo")
        self.assertEqual(parser_key_for_path(Path("sample.SDE")), "seo")
        self.assertEqual(parser_key_for_path(Path("sample.xlsx")), "excel")
        self.assertEqual(parser_key_for_path(Path("sample.csv")), "csv")

    def test_wrd_scales_per_trace_sampling_for_a_long_multicycle_export(self):
        """Long exports stay bounded without reducing a short trace below its limit."""

        self.assertEqual(_trace_point_budget(1), MAX_POINTS_PER_TRACE)
        self.assertEqual(_trace_point_budget(70), MAX_TOTAL_CYC_POINTS // 70)
        self.assertLessEqual(_trace_point_budget(70) * 70, MAX_TOTAL_CYC_POINTS)

    def test_wrd_bounds_large_multicycle_traces_without_losing_dqdv_readiness(self):
        """Sampling a long export must retain each cycle and both current directions."""

        header = b"WbcsFile example DISCHARGE Q 0.0500000g "
        trace_points = tuple((point + 1) * 0.000008 for point in range(1_200))
        charge_voltages = tuple(3.0 + point * 0.0007 for point in range(1_200))
        discharge_voltages = tuple(4.2 - point * 0.0007 for point in range(1_200))
        traces = []
        for _cycle in range(20):
            traces.append(self._wrd_charge_segment(trace_points, charge_voltages))
            traces.append(self._wrd_segment(trace_points, discharge_voltages))

        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "large-multicycle.wrd"
            path.write_bytes(header + b"".join(traces))
            rows, _ = read_wrd(path)

        columns = rows[0]
        raw_rows = [dict(zip(columns, row)) for row in rows[1:]]
        self.assertLessEqual(len(raw_rows), MAX_TOTAL_CYC_POINTS)
        self.assertEqual({row["cycle"] for row in raw_rows}, set(range(1, 21)))
        self.assertEqual({row["direction"] for row in raw_rows}, {"charge", "discharge"})
        self.assertLessEqual(
            max(sum(row["cycle"] == cycle and row["direction"] == direction for row in raw_rows)
                for cycle in range(1, 21)
                for direction in ("charge", "discharge")),
            _trace_point_budget(40),
        )

        analysis = calculate_dqdv(canonicalize_rows("cyc", columns, raw_rows))
        self.assertEqual(analysis["status"], "ok")
        self.assertEqual({item["direction"] for item in analysis["series"]}, {"charge", "discharge"})

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
        self.assertAlmostEqual(rows[1][2], 100000.0)
        self.assertAlmostEqual(rows[1][3], 2.8)
        self.assertAlmostEqual(rows[1][4], -0.4)
        self.assertNotAlmostEqual(rows[1][2], rows[1][3])

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

        self.assertEqual(sheet, "WRD charge/discharge traces")
        self.assertEqual(
            rows[0],
            [
                "cycle",
                "point",
                "direction",
                "specific capacity (mAh g-1)",
                "charge Q (Ah)",
                "discharge Q (Ah)",
                "voltage (V)",
                "current (A)",
                "range",
            ],
        )
        self.assertEqual([row[0] for row in rows[1:]], [1, 1, 1])
        self.assertEqual([row[1] for row in rows[1:]], [1, 2, 3])
        self.assertGreater(rows[-1][3], 0)
        self.assertAlmostEqual(rows[-1][5], 0.00254)

    def test_wrd_prefers_precise_filename_mass_over_binary_text_noise(self):
        """A filename mass must win over an unrelated binary ``1g`` marker."""
        header = b"WbcsFile example DISCHARGE Q metadata 1g "
        points = self._wrd_segment((0.00250, 0.00252, 0.00254))
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "NCM622_0.0500000g.cyc_001.wrd"
            path.write_bytes(header + points)
            rows, _ = read_wrd(path)

        self.assertAlmostEqual(rows[-1][3], 50.8, places=3)

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

        self.assertEqual(sorted({row[0] for row in rows[1:]}), [1, 2])
        self.assertEqual([sum(row[0] == cycle for row in rows[1:]) for cycle in (1, 2)], [8, 8])

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

        self.assertEqual(sorted({row[0] for row in rows[1:]}), [1, 2, 3])
        self.assertEqual(sum(row[0] == 3 for row in rows[1:]), 8)
        third_cycle_capacity = max(row[3] for row in rows[1:] if row[0] == 3)
        first_cycle_capacity = max(row[3] for row in rows[1:] if row[0] == 1)
        self.assertLess(third_cycle_capacity, first_cycle_capacity * 0.2)

    def test_wrd_preserves_an_ordered_voltage_capacity_trace_for_dqdv(self):
        header = b"WbcsFile example DISCHARGE Q 0.0500000g "
        capacities = tuple(point * 0.0004 for point in range(1, 11))
        voltages = tuple(4.1 - point * 0.06 for point in range(10))
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "raw-trace.wrd"
            path.write_bytes(header + self._wrd_segment(capacities, voltages))
            rows, _ = read_wrd(path)

        self.assertEqual(len(rows) - 1, 10)
        self.assertEqual([row[0] for row in rows[1:]], [1] * 10)
        self.assertEqual([row[1] for row in rows[1:]], list(range(1, 11)))
        self.assertGreaterEqual(len({row[6] for row in rows[1:]}), 8)
        self.assertGreaterEqual(len({row[3] for row in rows[1:]}), 8)

        columns = rows[0]
        raw_rows = [dict(zip(columns, row)) for row in rows[1:]]
        analysis = calculate_dqdv(canonicalize_rows("cyc", columns, raw_rows))
        self.assertEqual(analysis["status"], "ok")
        self.assertGreaterEqual(analysis["point_count"], 4)

    def test_wrd_preserves_matched_charge_and_discharge_traces_for_profiles_and_dqdv(self):
        """A cycling WRD must retain both current directions, not only discharge."""

        header = b"WbcsFile example DISCHARGE Q 0.0500000g "
        capacities = tuple(point * 0.0004 for point in range(1, 13))
        charge_voltages = tuple(3.0 + point * 0.08 for point in range(12))
        discharge_voltages = tuple(4.1 - point * 0.08 for point in range(12))
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "charge-discharge.wrd"
            path.write_bytes(
                header
                + self._wrd_charge_segment(capacities, charge_voltages)
                + self._wrd_segment(capacities, discharge_voltages)
            )
            rows, _ = read_wrd(path)

        columns = rows[0]
        raw_rows = [dict(zip(columns, row)) for row in rows[1:]]
        self.assertEqual({row["cycle"] for row in raw_rows}, {1})
        self.assertEqual({row["direction"] for row in raw_rows}, {"charge", "discharge"})
        self.assertEqual(sum(float(row["current (A)"]) > 0 for row in raw_rows), 12)
        self.assertEqual(sum(float(row["current (A)"]) < 0 for row in raw_rows), 12)

        analysis = calculate_dqdv(canonicalize_rows("cyc", columns, raw_rows))
        self.assertEqual(analysis["status"], "ok")
        self.assertEqual({item["direction"] for item in analysis["series"]}, {"charge", "discharge"})

    def test_inspection_sampling_keeps_every_cycle_and_current_direction(self):
        """The browser payload must not lose later CYC traces at the 5,000-row cap."""

        columns = ["cycle", "direction", "point", "voltage (V)", "specific capacity (mAh g-1)", "current (A)"]
        rows = []
        for cycle in range(1, 8):
            for direction, current in (("charge", 0.01), ("discharge", -0.01)):
                for point in range(1, 71):
                    rows.append(
                        {
                            "cycle": cycle,
                            "direction": direction,
                            "point": point,
                            "voltage (V)": 3.0 + point / 100,
                            "specific capacity (mAh g-1)": point,
                            "current (A)": current,
                        }
                    )

        sampled = limit_inspection_rows(rows, columns, maximum=100)

        self.assertEqual(len(sampled), 100)
        self.assertEqual(
            {(row["cycle"], row["direction"]) for row in sampled},
            {(cycle, direction) for cycle in range(1, 8) for direction in ("charge", "discharge")},
        )
        for cycle in range(1, 8):
            for direction in ("charge", "discharge"):
                trace = [row for row in sampled if row["cycle"] == cycle and row["direction"] == direction]
                self.assertGreaterEqual(len(trace), 7)
                self.assertEqual(trace[0]["point"], 1)
                self.assertEqual(trace[-1]["point"], 70)


if __name__ == "__main__":
    unittest.main()
