# Battery Data Portal Agent Rules

This repository is the Battery Data Portal project.

## Working Context

- Before meaningful work, read `docs/SESSION_MEMORY.md`.
- Use the current user request, current code, and `docs/SESSION_MEMORY.md` as the source of truth.
- When older compressed chat memory conflicts with repository files, prefer the repository files.
- Explain actions in clear Korean for a coding beginner when communicating with the user.

## Session Memory

- Apply the project skill at `.agents/skills/battery-portal-session-memory/SKILL.md` when requirements, constraints, design decisions, modified files, remaining work, or verification status change.
- Store only durable project context that passes the Memory Gate in `docs/SESSION_MEMORY.md`.
- Do not store all user utterances, raw chat logs, temporary brainstorming, or ambiguous comments.
- Do not store secrets, API keys, tokens, passwords, cookies, credentials, or unnecessary personal information.
- Do not create hooks or automatic raw-prompt logs for session memory.

## Project-Local Skills

- Prefer the Battery Portal skills in `.agents/skills/` for Battery Portal work.
- The portal-local skill set is `battery-portal-session-memory`, `battery-portal-versioning`, `battery-portal-cellpy`, `battery-portal-impedance`, and `battery-portal-launcher`.
- The matching files in `C:\\Users\\user\\.codex\\skills\\` are personal source skills. Keep them intact; do not delete or modify them when maintaining this repository.

## Local v2 Launch

- For a request to run or open Battery Data Portal v2 locally, apply `.agents/skills/battery-portal-launcher/SKILL.md`.
- Use `scripts/start_battery_portal_v2.ps1` and the health endpoint on port `4174`.
- Do not use port `4173` for the v2 workflow and do not terminate an unknown process that already owns a port.

## Versioning And Releases

- For `VERSION`, `CHANGELOG`, release notes, upload packaging, or a version bump, use the project-local `battery-portal-versioning` skill.
- Record every meaningful delivered change in the newest `CHANGELOG.md` section before commit, push, packaging, or deployment. Use `Unreleased` until a version is explicitly released.
- Do not modify the personal `battery-portal-versioning` skill itself.

## GitHub Synchronization

- Standing user authorization (2026-09-10): after completing and verifying requested portal changes, commit and promptly push the task-scoped source, tests, and documentation to `https://github.com/JONGHO01/battery-data-portal.git` on `main`, without asking again for each normal upload. This supersedes older per-upload approval notes in session memory.
- Fetch and check the destination before pushing. Use ordinary fast-forward pushes only; stop and report conflicts, failed checks, authentication failures, or protected-branch restrictions. Never force-push or include unrelated work.
- Exclude credentials, environment secrets, databases, raw experiment files, runtime artifacts, logs, and caches. Use an explicit staging allow-list.
- Verify the remote commit after pushing and report its link. A GitHub push can trigger Render auto-deploy but does not prove deployment or database/storage connectivity. Do not change hosting settings, restart existing local servers, or run data migrations under this upload authorization.
- This is a workflow for changes made in an active task, not a background file watcher or scheduled auto-commit service.
