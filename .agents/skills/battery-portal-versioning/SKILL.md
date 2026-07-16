---
name: battery-portal-versioning
description: Keep this Battery Data Portal repository's VERSION, README version badge, CHANGELOG, FastAPI version, frontend cache versions, release notes, and upload package synchronized whenever portal behavior, deployment, analysis, storage, login, AI summary, documentation, or project-local skills change.
---

# Battery Portal Versioning

Use this project-local skill for every Battery Data Portal release or upload-ready change.

## Version Policy

- Use semantic portal versions: `major.minor.patch` (for example, `0.1.9`).
- Increase the patch number for a delivered fix or small workflow change. Increase the minor number for a meaningful feature group. Change the major number only for a deliberate breaking release.
- Keep the FastAPI version exactly aligned with the displayed portal version.
- Before commit, push, packaging, or deployment, record every meaningful delivered change in `CHANGELOG.md`. Add it under `Unreleased` until the version is explicitly released, then move it into that version's section.

## Required Files

Update and verify all of the following:

- `VERSION`
- `README.md`
- `CHANGELOG.md`
- `python_backend.py` FastAPI version
- `public/app.js` `PORTAL_VERSION`
- `public/index.html` cache query strings for `style.css` and `app.js`
- `README.md` concise semantic-release table when the portal exposes version history
- `public/app.js` `RELEASE_HISTORY` summary when the administrator Version History view is present

Use `rg "version|v0\\.|portal=" public README.md CHANGELOG.md python_backend.py` before finalizing.

## Release Workflow

1. Read `VERSION`, `CHANGELOG.md`, `AGENTS.md`, and `docs/SESSION_MEMORY.md` first.
2. Make the requested portal or workflow change.
3. Bump every required version touchpoint together.
4. Update the newest `CHANGELOG.md` entry with a short factual note. When the Version History view is present, also update its matching `RELEASE_HISTORY` item and the README release table. Do not leave delivered changes undocumented.
5. Rebuild any GitHub upload package from an explicit allow-list. Exclude `.env`, databases, raw uploads, logs, `.venv`, cache folders, and Harvester credentials.
6. Record the release state in `docs/SESSION_MEMORY.md` without secrets.

## Boundaries

- Do not modify or delete `C:\\Users\\user\\.codex\\skills\\battery-portal-versioning\\SKILL.md`.
- Do not claim a deploy, push, or release is complete until it is verified.
- Do not include passwords, tokens, API keys, or local experiment data in a version bump or upload package.
