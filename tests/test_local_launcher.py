from __future__ import annotations

import subprocess
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
STARTER = ROOT / "start_local_server.py"


class LocalLauncherTests(unittest.TestCase):
    def test_help_exposes_explicit_port_option(self):
        result = subprocess.run(
            [sys.executable, str(STARTER), "--help"],
            cwd=ROOT,
            capture_output=True,
            text=True,
            check=False,
        )

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("--port", result.stdout)

    def test_powershell_launcher_uses_a_non_blocking_port_check(self):
        launcher = (ROOT / "scripts" / "start_battery_portal_v2.ps1").read_text(encoding="utf-8")

        self.assertIn("netstat -ano", launcher)
        self.assertNotRegex(launcher, r"(?m)^\s*\$listener\s*=\s*Get-NetTCPConnection")

    def test_local_server_uses_port_specific_logs_for_parallel_runs(self):
        server = STARTER.read_text(encoding="utf-8")

        self.assertIn('f"fastapi-{port}.out.log"', server)
        self.assertIn('f"fastapi-{port}.err.log"', server)


if __name__ == "__main__":
    unittest.main()
