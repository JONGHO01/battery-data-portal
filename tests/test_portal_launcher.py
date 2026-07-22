from __future__ import annotations

import unittest
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class PortalLauncherContractTests(unittest.TestCase):
    def test_launcher_contract_uses_v2_port_health_check_and_non_destructive_guard(self) -> None:
        script = (ROOT / "scripts" / "start_battery_portal_v2.ps1").read_text(encoding="utf-8")

        self.assertIn("[int]$Port = 4174", script)
        self.assertIn("/api/health", script)
        self.assertIn("-TimeoutSec 10", script)
        self.assertIn("Get-NetTCPConnection", script)
        self.assertNotIn("Stop-Process", script)

    def test_launcher_skill_is_project_local_and_has_the_direct_trigger(self) -> None:
        skill = (
            ROOT
            / ".agents"
            / "skills"
            / "battery-portal-launcher"
            / "SKILL.md"
        ).read_text(encoding="utf-8")

        self.assertIn("name: battery-portal-launcher", skill)
        self.assertIn("Battery Data Portal(v2)", skill)
        self.assertIn("http://localhost:4174", skill)

    def test_vscode_task_and_start_guide_use_the_same_v2_entrypoint(self) -> None:
        tasks = json.loads((ROOT / ".vscode" / "tasks.json").read_text(encoding="utf-8"))
        task = next(task for task in tasks["tasks"] if task["label"] == "Start Battery Data Portal v2 (4174)")
        self.assertEqual(task["command"], "powershell.exe")
        self.assertIn("scripts\\start_battery_portal_v2.ps1", task["args"])

        guide = (ROOT / "docs" / "START_PORTAL_V2.md").read_text(encoding="utf-8")
        self.assertIn("http://localhost:4174/", guide)
        self.assertIn("does not deploy", guide)
