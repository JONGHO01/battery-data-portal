"""Regression coverage for the browser-safe CYC inspection payload."""

from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from scripts.inspect_file import limit_inspection_rows


class InspectionPreviewTests(unittest.TestCase):
    def test_large_cyc_preview_keeps_every_direction_within_browser_budget(self):
        """Long WBCS traces must not leave a multi-megabyte response in the UI."""

        columns = ["cycle", "current (A)", "voltage (V)", "discharge Q (Ah)"]
        rows = []
        expected_traces = set()
        for cycle in range(1, 36):
            for current, direction in ((0.01, "charge"), (-0.01, "discharge")):
                expected_traces.add((cycle, direction))
                for point in range(100):
                    rows.append(
                        {
                            "cycle": cycle,
                            "current (A)": current,
                            "voltage (V)": 3.0 + point / 200,
                            "discharge Q (Ah)": point / 10_000,
                        }
                    )

        preview = limit_inspection_rows(rows, columns)

        self.assertLessEqual(len(preview), 1_500)
        preview_traces = {
            (int(row["cycle"]), "charge" if row["current (A)"] > 0 else "discharge")
            for row in preview
        }
        self.assertEqual(preview_traces, expected_traces)

    def test_full_parser_mode_preserves_source_rows_while_default_mode_is_compact(self):
        """The upload API must request all raw trace rows, not the UI sample."""

        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "trace.csv"
            lines = ["cycle,current (A),voltage (V),discharge Q (Ah)"]
            for point in range(2_000):
                lines.append(f"1,-0.01,{4.2 - point / 2000:.5f},{point / 1_000_000:.7f}")
            path.write_text("\n".join(lines), encoding="utf-8")

            command = [sys.executable, "scripts/inspect_file.py", str(path)]
            parser_env = {**os.environ, "PYTHONIOENCODING": "utf-8"}
            preview = subprocess.run(
                command,
                capture_output=True,
                check=True,
                text=True,
                encoding="utf-8",
                env=parser_env,
            )
            full = subprocess.run(
                [*command, "--full"],
                capture_output=True,
                check=True,
                text=True,
                encoding="utf-8",
                env=parser_env,
            )

        preview_payload = json.loads(preview.stdout)
        full_payload = json.loads(full.stdout)
        self.assertEqual(preview_payload["rowCount"], 2_000)
        self.assertEqual(full_payload["rowCount"], 2_000)
        self.assertLessEqual(len(preview_payload["rows"]), 1_500)
        self.assertEqual(len(full_payload["rows"]), 2_000)


if __name__ == "__main__":
    unittest.main()
