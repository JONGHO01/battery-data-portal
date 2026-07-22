---
name: battery-portal-launcher
description: Start and verify the project-local Battery Data Portal v2 whenever the user says Battery Data Portal(v2) 실행해, asks to run/open/start the local portal, wants the localhost 4174 service checked, or resumes a Battery Portal coding session that needs the app running.
---

# Battery Portal Launcher

Use this project-local skill only for the Battery Data Portal repository.

## Trigger

Use this skill when the user asks to run, open, launch, or check Battery Data Portal v2 locally. Treat the Korean request for running Battery Data Portal v2 and the English request "run Battery Data Portal v2" as the same local-launch request.

## Procedure

1. Read `AGENTS.md` and `docs/SESSION_MEMORY.md` when the request starts a meaningful work session.
2. Run `scripts/start_battery_portal_v2.ps1` with PowerShell. Keep the default `4174` port unless the user explicitly asks for another port.
3. Treat `GET http://localhost:4174/api/health` with `ok: true` as the ready signal. Report the URL and the returned version.
4. When browser control is available, open `http://localhost:4174/` after the health check succeeds.

## Safety Rules

- Do not use port `4173` for the v2 workflow; an older portal process may still occupy it.
- Do not kill a process that is already listening on the selected port. The script must fail with an explanation if the process is not a healthy portal.
- Do not start, alter, or deploy Render/Fly/Railway services for a local-run request.
- Do not read, display, store, or change credentials, `.env` values, tokens, or browser sessions.
- If the current workspace is not this repository, ask the user to open the Battery Data Portal project folder before relying on this project-local skill.

## Expected Result

The prompt `Battery Data Portal(v2) 실행해` starts the local portal only when it is not already ready and then confirms `http://localhost:4174/`.
