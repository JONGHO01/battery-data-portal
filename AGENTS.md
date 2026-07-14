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

## Versioning And Releases

- For `VERSION`, `CHANGELOG`, release notes, upload packaging, or a version bump, use the existing personal `battery-portal-versioning` skill when available.
- Do not modify the personal `battery-portal-versioning` skill itself.
