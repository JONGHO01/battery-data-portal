# Start Battery Portal v2

## In Codex

Open this repository as the current workspace, then ask Codex to run Battery Data Portal v2. The project-local launcher skill checks or starts the local portal and confirms its health.

## In PowerShell

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\start_battery_portal_v2.ps1
```

The ready address is `http://localhost:4174/`.

## Safety

- The v2 workflow uses port `4174` only.
- A healthy portal already using the port is reused.
- A non-portal process using the port is not terminated.
- This local command does not deploy or modify Render, Fly, Railway, or GitHub.
