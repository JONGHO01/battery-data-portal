# Session Memory

## Project Goal

Battery Data Portal is a Korean research workflow portal for battery experiment data. It should connect CYC, CV, and EIS files to experimental metadata; support reproducible analysis, figures, reports, and electrode C-rate calculations; and grow from a local tool into a shared, login-based web service.

The intended operating architecture is:

```text
Browser -> application server -> PostgreSQL -> object storage -> OpenAI API -> domain with HTTPS
```

## Current Task

Maintain the Battery Portal with project-local skills, semantic version `v0.1.9`, and a factual `CHANGELOG.md` record for every meaningful delivered change. The current local `main` branch is synchronized with the GitHub `main` branch.

## Current Status

- The repository release state is `v0.1.9` in `VERSION` and `README.md`; the FastAPI app and `public/app.js` use version `0.1.9`.
- GitHub remote `origin` is `https://github.com/JONGHO01/battery-data-portal.git`; `main` tracks `origin/main` at commit `9b13654` (`Release Battery Portal v0.1.9`).
- Frontend: static HTML, CSS, and JavaScript in `public/`.
- Backend: FastAPI in `python_backend.py`.
- Local runtime: SQLite and local file storage are the current defaults. PostgreSQL and S3/Supabase-compatible storage are configuration targets, not confirmed active services.
- The portal supports login, datasets, hierarchy, organization roles, feedback, AI-summary fallback, and deployment configuration files.
- Dataset creation and figure saving accept both FastAPI's SQLite user rows and plain user dictionaries in permission checks. This prevents the earlier server-side 500 response in the figure-generation panel.
- The EIS inspection panel explains `sweep`, `point`, `frequency`, `zreal`, `zimag`, `mag`, and `phase`, including the units and how they are used in Nyquist/Bode figures.
- The dataset-creation client now reads non-JSON server responses safely. It shows a clear Korean retry message instead of the raw `Unexpected token '<'` JSON error.
- `docs/CURRENT_TASK.md` contains older handoff material that still states v0.14 and has encoding damage. Do not use it as the release-version source of truth; use `VERSION`, `CHANGELOG.md`, current code, and this file.
- This file, `AGENTS.md`, and the project-local skill were added to make future handoffs durable. No hook or raw-prompt log exists.
- The project-local skill set now covers session memory, release versioning, CYC/cellpy analysis, and EIS/impedance.py analysis. Matching personal skills remain unchanged in `C:\\Users\\user\\.codex\\skills`.
- A clean GitHub upload package for v0.18 is available at `C:\\Users\\user\\Documents\\Codex\\2026-07-03\\gks\\outputs\\battery-data-portal-github-upload-v0.18` and as a ZIP beside it. It contains source, deployment configuration, tests, documentation, and the project-local session-memory skill, but excludes local runtime data and secrets.

## Important User Requirements

- Keep explanations direct and understandable for a coding beginner; inspect and implement where possible instead of giving circular guidance.
- Keep the portal data hierarchy as `Organization (optional) -> Project -> Campaign / experiment batch -> Cell -> Dataset group -> CYC / EIS / CV`, with figures and reports attached as derived artifacts.
- Preserve original files and analysis provenance. Do not replace raw experimental files with normalized output.
- Support shared, login-based use across computers eventually, with permission-aware data access.
- File analysis must retain a local-storage fallback when cloud object-storage settings are absent.
- AI summary should use a real API only when configured and otherwise return a local, calculation-based fallback instead of failing.
- Store only durable project context in this memory. Never store every user statement, raw conversations, temporary ideas, or secrets.
- Keep the existing personal `battery-portal-versioning` skill separate and never modify it.
- Keep portal-specific skills inside `.agents/skills/` so a GitHub clone has the same project workflow guidance.
- Record every meaningful delivered code, UI, analysis, deployment, documentation, or workflow change in `CHANGELOG.md`; use `Unreleased` until the user requests the next released version.

## Design Decisions

- Normalize supported battery files through dedicated parsers in `backend/parsers/` and BDF canonical columns in `backend/schemas/bdf.py`.
- Keep quality issues as review metadata instead of silently deleting questionable rows.
- Store upload and derived artifacts by stable hierarchy: `projects/{project}/cells/{cell}/datasets/{dataset}/{kind}/...`, where `kind` includes `raw`, `parsed`, `analysis`, `figure`, and `report`.
- Keep reproducible analyses as separate dataset analysis runs, including parameters and artifacts.
- Use organization roles `owner`, `admin`, `researcher`, and `viewer`; viewers are read-only and researchers can work in shared projects.
- Keep the Harvester opt-in. It uses a project API token and watches a laboratory-PC folder; its local credentials and state must remain ignored by Git.
- Use `docs/SESSION_MEMORY.md` as durable handoff context. When it conflicts with an older compressed chat summary, prefer current repository files and update the memory.

## Files Changed

### Current Session-Memory Setup

- `AGENTS.md`: repository rules, Memory Gate use, and versioning-skill boundary.
- `docs/SESSION_MEMORY.md`: durable project state for context-reset handoff.
- `.agents/skills/battery-portal-session-memory/SKILL.md`: project-local memory workflow.
- `.agents/skills/battery-portal-versioning/SKILL.md`: project-local version and release workflow.
- `.agents/skills/battery-portal-cellpy/SKILL.md`: project-local CYC analysis workflow using cellpy when appropriate.
- `.agents/skills/battery-portal-impedance/SKILL.md`: project-local EIS workflow using impedance.py when appropriate.
- `python_backend.py`: SQLite-row-safe user-field access for token and organization permission checks.
- `tests/test_organizations.py`: regression coverage for authenticated SQLite rows in personal and shared projects.
- `public/app.js`: EIS column glossary and safe parsing of dataset-save API responses.
- `public/style.css`: compact EIS column glossary styling.
- `tests/test_organizations.py`: EIS dataset and figure persistence regression coverage using a SQLite user row.
- `public/index.html`: moved the Organization menu to directly before the Feedback Inbox, making it the second menu from the right.
- `VERSION`, `README.md`, `CHANGELOG.md`, `python_backend.py`, `public/app.js`, `public/index.html`: v0.18 release and cache references.
- `VERSION`, `README.md`, `CHANGELOG.md`, `python_backend.py`, `public/app.js`, `public/index.html`: v0.19 project-local skill release and cache references.
- `VERSION`, `README.md`, `CHANGELOG.md`, `python_backend.py`, `public/app.js`, `public/index.html`, `AGENTS.md`, `.agents/skills/battery-portal-versioning/SKILL.md`: v0.1.9 semantic-version release and mandatory change-recording policy.
- `C:\\Users\\user\\Documents\\Codex\\2026-07-03\\gks\\outputs\\battery-data-portal-clean-v0.01`: synced through v0.18 with the navigation move and release files. It contains no copied local data, logs, or secrets.
- `C:\\Users\\user\\Documents\\Codex\\2026-07-03\\gks\\outputs\\battery-data-portal-github-upload-v0.18` and `.zip`: current GitHub upload package for v0.18. It intentionally includes only code, tests, settings templates, and documentation.
- `C:\\Users\\user\\Documents\\Codex\\2026-07-03\\gks\\outputs\\battery-portal-saved-skills-guide-v0.18.pptx`: 10-slide Korean presentation explaining the eight saved portal-related skills, their current status, and the recommended operating workflow.

### Important Existing Implementation Paths

- `public/index.html`, `public/app.js`, `public/style.css`: portal UI, upload flow, module navigation, editable tables, figures, AI summary, organization UI.
- `python_backend.py`: FastAPI routes, auth, hierarchy, storage, analysis, feedback, organization roles, and Harvester API.
- `backend/parsers/`: CSV, Excel, WRD, and SEO parser routing.
- `backend/schemas/bdf.py`: BDF mapping, unit normalization, and quality review.
- `backend/analysis/`: retention, dQ/dV, DVA, EIS, rate capability, pulse resistance, and smoothing modules.
- `backend/storage_layout.py`: stable raw/parsed/analysis/figure/report artifact paths.
- `harvester/portal_harvester.py` and `docs/HARVESTER.md`: opt-in laboratory-PC ingestion workflow.
- `tests/`: automated backend, parser, artifact, analysis, Harvester, and organization-role tests, including SQLite-row permission regression coverage.
- `docs/ARCHITECTURE_V0.15.md`, `PRODUCTION_RUNBOOK.md`, `.env.example`, `render.yaml`, `railway.json`, `fly.toml`: architecture and deployment preparation.

## Remaining Work

- Provision and configure actual PostgreSQL, object storage, a deployment provider, domain, HTTPS, and required environment variables when the user chooses accounts and providers.
- Add the real OpenAI API key only through secure environment variables; validate the deployed AI-summary path without recording the key.
- Test shared organization workflows with separate real user accounts on a deployed environment.
- Review and repair or replace stale/garbled historical handoff documentation, especially `docs/CURRENT_TASK.md`, in a dedicated documentation task.
- Manually refresh the portal and retry the same SEO/EIS upload once. If the backend returns an error, record the user-visible Korean message and the new server-log trace before making another change.
- Push the existing local `main` branch to the corrected GitHub remote `https://github.com/JONGHO01/battery-data-portal.git`. The account login is `JONGHO01` (with zero before the final `1`), not `JONGHOO1`. Do not upload local runtime data or the ZIP itself as source files.
- Commit the project-local skill set before the next GitHub push.
- Continue using ordinary commits and pushes for future changes; the earlier remote-history replacement is complete.

## Do Not Repeat

- Do not store raw chats, passwords, API keys, tokens, cookies, credentials, or unnecessary personal information in repository memory files.
- Do not create hooks, automatic prompt logs, or background conversation archives.
- Do not treat `docs/CURRENT_TASK.md` as the authoritative release state while it reports v0.14; prefer `VERSION`, `CHANGELOG.md`, and current source files.
- Do not remove the local storage fallback just because S3/Supabase is not configured.
- Do not claim PostgreSQL, S3/Supabase, OpenAI, a custom domain, or HTTPS is live until the related environment and deployment have been verified.
- Do not modify the personal `battery-portal-versioning` skill. Use it only for version, changelog, release-note, or upload-packaging work.
- Do not delete or alter the personal `cellpy`, `impedance-py`, or `battery-portal-versioning` skills while keeping project-local copies in `.agents/skills/`.
- Do not ship a meaningful portal change without adding a short factual `CHANGELOG.md` entry.

## Open Questions

- Which production provider should be used for the application, PostgreSQL, and object storage: Render, Railway, Fly.io, Supabase, S3-compatible storage, or another approved service?
- Should the next deployment package replace the existing clean upload copy or be created as a new versioned package?
- Which real user roles and organization membership workflow should be tested first after deployment?

## Verification

- 2026-07-14: Three non-destructive local checks passed: health/root/app/style endpoints returned HTTP 200, every menu `data-view` target matched a supported portal view with Organization immediately before Feedback Inbox, and all 28 backend tests passed.
- 2026-07-14: Direct browser click-through was not completed because the in-app browser automation surface had no attached tab. Do not claim an interactive click-through pass until a browser tab is available to the automation surface.
- 2026-07-13: `& .\\.venv\\Scripts\\python.exe -m unittest discover -s tests -v` passed 28 tests, including SQLite-row permission regressions for CYC and EIS dataset/figure creation plus shared-project access.
- 2026-07-13: `& .\\.venv\\Scripts\\python.exe -m py_compile python_backend.py` passed.
- 2026-07-13: after the v0.18 restart, `curl.exe -s http://localhost:4173/api/health` returned `ok: true`, FastAPI version `0.0.18`, SQLite database, and local storage. The served root HTML references `style.css?portal=0.18` and `app.js?portal=0.18`.
- 2026-07-14: `battery-data-portal-github-upload-v0.18` and its ZIP were rebuilt from an explicit allow-list. The package contains the required portal files and excludes `.env`, local `data`, uploads, logs, `.venv`, temporary test folders, Harvester credentials, and Python cache files.
- 2026-07-14: `battery-portal-saved-skills-guide-v0.18.pptx` was created, rendered across all 10 slides, and visually reviewed. The TDD workflow slide was corrected after initial QA so RED/GREEN/REFACTOR/RELEASE labels remain horizontal.
- Refresh the browser once before manually retrying EIS dataset/figure creation.
- Current session setup must verify the three required files, skill frontmatter, Memory Gate wording, absence of hooks/raw-prompt logs, and that the personal versioning skill was not modified.
- 2026-07-14: Git for Windows was installed for the current user. The project was initialized locally on the `main` branch with the commit message `Add Battery Portal session memory skill`. `.gitignore` excludes local secrets, runtime databases, logs, uploads, Harvester state, and `data/storage/` artifacts.
- 2026-07-14: GitHub Desktop login diagnostics confirmed the account is `JONGHO01`, not `JONGHOO1`. The previous remote contained a letter `O` where the account has the digit `0`, causing `Repository not found` for the private repository.
- 2026-07-14: The local Git remote `origin` was corrected to `https://github.com/JONGHO01/battery-data-portal.git`. Local `main` is clean at `813b344 Add Battery Portal session memory skill`; push is the next action. No remote files have been changed yet.
- 2026-07-14: Added portal-local skills for versioning, CYC/cellpy, and EIS/impedance.py without changing or deleting the matching personal skills. Version touchpoints were synchronized to v0.19, including the browser cache query strings.
- 2026-07-15: Changed the portal to semantic version `v0.1.9`; `CHANGELOG.md`, `AGENTS.md`, and the project-local versioning skill now require a factual change record for every meaningful delivered change.
- 2026-07-15: Configured this repository's Git author as `JONGHO01`, committed `Release Battery Portal v0.1.9` (`9b13654`), fetched the six old remote commits, and used `git push --force-with-lease -u origin main` to replace the prior GitHub `main` history with the current portal. Local `main` and `origin/main` now match.

## Next Session Prompt

```text
Use the battery-portal-session-memory skill.

This is a context-reset session.
Do not rely on previous chat memory.

First read:

* AGENTS.md
* docs/SESSION_MEMORY.md
* README.md if needed
* current code

Then summarize:

* project goal
* current task
* important requirements
* current status
* remaining work

If this task involves VERSION, CHANGELOG, release notes, upload packaging, or version bump, use the existing personal battery-portal-versioning skill if available.

After summarizing, continue from docs/SESSION_MEMORY.md.
```
