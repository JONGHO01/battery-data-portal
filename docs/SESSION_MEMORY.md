# Session Memory

## Project Goal

Battery Data Portal is a Korean research workflow portal for battery experiment data. It should connect CYC, CV, and EIS files to experimental metadata; support reproducible analysis, figures, reports, and electrode C-rate calculations; and grow from a local tool into a shared, login-based web service.

The intended operating architecture is:

```text
Browser -> application server -> PostgreSQL -> object storage -> OpenAI API -> domain with HTTPS
```

## Current Task

Maintain the Battery Portal with project-local skills, semantic version `v0.1.25`, and a factual `CHANGELOG.md` record for every meaningful delivered change. All current portal UI terminology uses `Fig`; CYC figures ignore nonpositive cycle numbers and prioritize an explicit C-rate source column when one is present. The CYC Fig choice now renders separate performance, voltage/current behavior, and combined views. Raw CYC data uses real within-cycle voltage versus capacity/time curves with average-current labels; summary-only CYC data uses average voltage and signed current by cycle. Multiple CYC/CV/EIS files can now be selected together for a sequential batch Dataset and Fig-record workflow.

## Current Status

- The repository release state is `v0.1.25` in `VERSION`, `README.md`, `package.json`, FastAPI, and `public/app.js`.
- GitHub remote `origin` is `https://github.com/JONGHO01/battery-data-portal.git`; local `main` tracks `origin/main`, and the working tree contains uncommitted portal changes through v0.1.25 that must be reviewed before a future commit or push.
- Frontend: static HTML, CSS, and JavaScript in `public/`.
- Backend: FastAPI in `python_backend.py`.
- Local runtime: SQLite and local file storage are the current defaults. PostgreSQL and S3/Supabase-compatible storage are configuration targets, not confirmed active services.
- The portal supports login, datasets, hierarchy, organization roles, feedback, reproducible analysis, and deployment configuration files.
- The AI Summary menu, home card, tab, dedicated view, automatic refresh, and AI-report save control have been removed from the frontend. Existing data and the non-exposed backend compatibility endpoint were retained to avoid breaking historical records.
- README now contains a concise semantic version table, and the portal has an administrator-only `버전 이력` screen. Both summarize the current semantic releases; `CHANGELOG.md` remains the complete release record.
- The bounded default upload limit is 100 MiB. This supports common WBCS CYC WRD exports larger than 50 MiB while still rejecting unbounded uploads. The browser now displays the server's specific upload-limit detail.
- On 2026-07-15, `http://localhost:4173` was still serving an older `v0.0.18` process, while the current fixed portal is served at `http://localhost:4174` as `v0.1.18`. Use port 4174 for local verification until the older process is deliberately retired in a separate task.
- Production now fails closed: legacy `X-User-Id` authentication is disabled by default, wildcard CORS is rejected, and durable S3/Supabase-compatible object storage is required when production durable storage is enabled.
- Uploads use a configurable 100 MiB default maximum. Raw browser uploads are stream-limited, Base64 inputs are checked before decoding, temporary source files are removed after successful artifact persistence, and dataset deletion removes dependent analysis, figure, report, and known artifact records.
- CYC retention and AI metrics recognize both specific capacity and absolute discharge capacity. BDF `discharge_capacity_ah` is converted to mAh; direct table `discharge_capacity_mAh` values are also valid. Result payloads expose the selected capacity field and unit.
- CYC uploads now recognize an explicit C-rate source column as canonical `c_rate`. Numeric, `0.33 C`, and `C/10` values are normalized to C, shown during inspection, and used before filename/current inference for CYC Fig cycle segments.
- The upload control accepts multiple supported files. The batch action processes at most 10 files sequentially (not in parallel), applies the same entered Cell metadata and selected hierarchy destination to every file, saves each detected CYC/CV/EIS Dataset, and creates its Fig record. It keeps a per-file success/failure list with a direct `Fig 열기` action, so one bad file does not stop the rest.
- Startup upgrades legacy `analysis_runs` tables by adding the missing `artifact_json` column. Dataset deletion safely handles legacy analysis rows and removes their records before deleting the parent dataset.
- Dataset creation and figure saving accept both FastAPI's SQLite user rows and plain user dictionaries in permission checks. This prevents the earlier server-side 500 response in the figure-generation panel.
- The EIS inspection panel explains `sweep`, `point`, `frequency`, `zreal`, `zimag`, `mag`, and `phase`, including the units and how they are used in Nyquist/Bode figures.
- The dataset-creation client now reads non-JSON server responses safely. It shows a clear Korean retry message instead of the raw `Unexpected token '<'` JSON error.
- The login button is a native form-submit control, so pressing Enter in the ID or password field follows the same single login validation path as a click.
- When a protected request returns 401 for a cached browser token, the frontend clears that invalid session and returns to the login screen with a clear re-login message instead of mislabeling it as a file-analysis failure.
- File inspection places the clearly marked automatic CYC/CV/EIS type choice above the read-only column-name chips. The user can switch to manual type selection, and the UI explicitly says column names do not need to be selected.
- The CYC/CV/EIS dropdown remains enabled after automatic detection. Choosing a value immediately changes the mode to manual selection, so users do not have to click a separate radio button first.
- CYC Fig rendering now honors the saved `figureKind`: performance keeps the C-rate-aware capacity/efficiency chart; raw data uses actual per-cycle voltage versus capacity/time curves with an average-current legend; summary-only CYC data uses an average voltage and signed-current-by-cycle panel; combined renders performance and the appropriate electrical-behavior panel. It never fabricates a voltage-capacity curve from one summary row per cycle.
- Local SQLite Dataset finalization uses WAL journal mode and a 30-second busy timeout. This reduces transient 500 save errors when a large raw/parsed artifact is being finalized while the browser is also reading portal data.
- Analysis Lab remains implemented and its stored analysis runs remain intact, but its menu, home-card, and workspace-tab entry points are hidden from the normal portal UI until the user explicitly asks to restore them.
- `docs/CURRENT_TASK.md` contains older handoff material that still states v0.14 and has encoding damage. Do not use it as the release-version source of truth; use `VERSION`, `CHANGELOG.md`, current code, and this file.
- This file, `AGENTS.md`, and the project-local skill were added to make future handoffs durable. No hook or raw-prompt log exists.
- The project-local skill set now covers session memory, release versioning, CYC/cellpy analysis, and EIS/impedance.py analysis. Matching personal skills remain unchanged in `C:\\Users\\user\\.codex\\skills`.
- A clean GitHub upload package for v0.18 is available at `C:\\Users\\user\\Documents\\Codex\\2026-07-03\\gks\\outputs\\battery-data-portal-github-upload-v0.18` and as a ZIP beside it. It contains source, deployment configuration, tests, documentation, and the project-local session-memory skill, but excludes local runtime data and secrets.

## Important User Requirements

- Keep explanations direct and understandable for a coding beginner; inspect and implement where possible instead of giving circular guidance.
- Keep the portal data hierarchy as `Organization (optional) -> Project -> Campaign / experiment batch -> Cell -> Dataset group -> CYC / EIS / CV`, with figures and reports attached as derived artifacts.
- Preserve original files and analysis provenance. Do not replace raw experimental files with normalized output.
- Support shared, login-based use across computers eventually, with permission-aware data access.
- File analysis may retain a local-storage fallback for local development. Production must use configured durable object storage and fail rather than silently persist research files only in `/tmp`.
- Keep the normal raw browser-upload limit at 100 MiB unless a deliberate capacity and deployment review changes `MAX_UPLOAD_BYTES`; larger files must still be rejected before unbounded processing.
- Keep AI Summary absent from the portal UI unless the user explicitly asks to restore it. Do not show an OpenAI-key-dependent workflow in the normal research portal.
- Keep Analysis Lab hidden from the normal menu, home, and workspace navigation until the user explicitly requests restoration. Preserve its implementation and saved analysis history.
- Let administrators view the semantic version history in the portal, and keep the README version table aligned with `CHANGELOG.md` whenever a release is made.
- Store only durable project context in this memory. Never store every user statement, raw conversations, temporary ideas, or secrets.
- Keep the existing personal `battery-portal-versioning` skill separate and never modify it.
- Keep portal-specific skills inside `.agents/skills/` so a GitHub clone has the same project workflow guidance.
- Record every meaningful delivered code, UI, analysis, deployment, documentation, or workflow change in `CHANGELOG.md`; use `Unreleased` until the user requests the next released version.
- CYC electrical behavior must remain visible: raw data should show voltage curves and current context, while summary data should show voltage/current trends by cycle instead of an empty or misleading profile.

## Design Decisions

- Normalize supported battery files through dedicated parsers in `backend/parsers/` and BDF canonical columns in `backend/schemas/bdf.py`.
- Keep quality issues as review metadata instead of silently deleting questionable rows.
- Store upload and derived artifacts by stable hierarchy: `projects/{project}/cells/{cell}/datasets/{dataset}/{kind}/...`, where `kind` includes `raw`, `parsed`, `analysis`, `figure`, and `report`.
- Keep reproducible analyses as separate dataset analysis runs, including parameters and artifacts.
- Use organization roles `owner`, `admin`, `researcher`, and `viewer`; viewers are read-only and researchers can work in shared projects.
- Treat the historical AI-summary backend route as a non-exposed compatibility path; it must not be a menu, tab, home-card, automatic-render, or report-save workflow without a new explicit requirement.
- Use `CHANGELOG.md` as the complete release source, with a concise current semantic-release summary duplicated in README and the administrator-only Version History view for discoverability.
- Keep the Harvester opt-in. It uses a project API token and watches a laboratory-PC folder; its local credentials and state must remain ignored by Git.
- Use `docs/SESSION_MEMORY.md` as durable handoff context. When it conflicts with an older compressed chat summary, prefer current repository files and update the memory.
- Treat BDF `current_a` as amperes internally. Convert it to signed mA only for the CYC summary electrical-trend display so charge and discharge direction remain visible.

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
- `python_backend.py`, `.env.example`, `render.yaml`, `requirements.txt`, `package.json`, `tests/test_runtime_security.py`, `tests/test_dataset_artifacts.py`, `docs/CURRENT_TASK.md`, and version touchpoints: v0.1.10 production hardening, durable-artifact cleanup, upload bounds, dependency pins, and current-version notice for historical handoff material.
- `backend/analysis/retention.py`, `python_backend.py`, `public/app.js`, `tests/test_analysis.py`, `tests/test_analysis_runs.py`, `tests/test_dataset_artifacts.py`, and version touchpoints: v0.1.11 CYC absolute-capacity analysis/AI support and safe deletion of legacy analysis history.
- `public/index.html`, `public/app.js`, `README.md`, and version touchpoints: v0.1.12 removes the AI Summary UI and all frontend entry points while preserving existing datasets and backend compatibility behavior.
- `public/index.html`, `public/app.js`, `public/style.css`, `README.md`, `CHANGELOG.md`, `.agents/skills/battery-portal-versioning/SKILL.md`, and version touchpoints: v0.1.13 adds administrator-only Version History navigation and view, a README release summary table, and a rule to keep both in sync with future releases.
- `python_backend.py`, `public/app.js`, `.env.example`, `render.yaml`, `tests/test_runtime_security.py`, `tests/test_parser_routing.py`, and version touchpoints: v0.1.14 raises the bounded default raw upload limit to 100 MiB, makes rejected-upload detail visible in the browser, and adds binary WBCS WRD CYC parsing coverage.
- `public/index.html`, `public/app.js`, `public/style.css`, `tests/test_upload_selection_ui.py`, `tests/test_release_history_ui.py`, and version touchpoints: v0.1.15 supports Enter login submission, clearly separates automatic data-type selection from read-only column names, and adds regression coverage for both behaviors.
- `public/index.html`, `public/app.js`, `tests/test_analysis_lab_visibility.py`, and version touchpoints: v0.1.16 hides Analysis Lab from normal navigation while retaining its view implementation and analysis-run behavior for later restoration.
- `public/app.js`, `public/style.css`, `tests/test_upload_selection_ui.py`, and version touchpoints: v0.1.17 keeps manual CYC/CV/EIS selection enabled and switches modes on dropdown selection.
- `backend/parsers/wrd.py`, `public/app.js`, `tests/test_parser_routing.py`, `tests/test_cyc_figure_ui.py`, and version touchpoints: v0.1.18 excludes short interrupted WBCS WRD fragments, keeps complete low-capacity cycles, and prevents nonpositive cycles or a duplicate renderer from corrupting CYC figures.
- `public/index.html`, `public/app.js`, `python_backend.py`, `server.js`, `README.md`, `CHANGELOG.md`, `docs/CURRENT_TASK.md`, `tests/test_fig_terminology_ui.py`, and version touchpoints: v0.1.19 changes the current user-facing figure terminology to `Fig` across navigation, actions, messages, data-type guidance, saved comparisons, legacy fallback source, and documentation.
- `backend/schemas/bdf.py`, `public/app.js`, `tests/test_bdf_schema.py`, `tests/test_cyc_figure_ui.py`, and version touchpoints: v0.1.20 maps explicit CYC C-rate columns, accepts numeric, `0.33 C`, and `C/10` values, displays detected rates during inspection, and uses those values before filename/current inference for CYC Fig cycle segments.
- `public/index.html`, `public/app.js`, `public/style.css`, `tests/test_batch_figure_upload_ui.py`, `tests/test_release_history_ui.py`, and version touchpoints: v0.1.21 adds sequential multi-file CYC/CV/EIS Dataset and Fig-record creation with per-file results and direct opening; the release-history check now reads `VERSION` instead of hard-coding an older release.
- `public/app.js`, `tests/test_upload_selection_ui.py`, `tests/test_cyc_figure_ui.py`, and version touchpoints: v0.1.22 detects an expired or server-invalidated cached login token on protected requests and returns the browser to the login screen instead of reporting a file load failure; CYC Fig regression coverage now matches the one-valid-integer-cycle-one-point rule.
- `public/app.js`, `tests/test_cyc_figure_ui.py`, and version touchpoints: v0.1.23 makes each CYC Fig choice render its own performance, voltage-profile, or combined view and refuses to invent a voltage curve from cycle-summary-only rows.
- `public/app.js`, `tests/test_cyc_figure_ui.py`, and version touchpoints: v0.1.24 adds raw-profile average-current legends and a summary-only voltage/current-by-cycle fallback, including a right-side signed-current mA axis.
- `python_backend.py`, `tests/test_runtime_security.py`, and version touchpoints: v0.1.25 enables WAL-backed local SQLite connections with a 30-second busy timeout for Dataset persistence.
- `C:\\Users\\user\\Documents\\Codex\\2026-07-03\\gks\\outputs\\battery-data-portal-clean-v0.01`: synced through v0.18 with the navigation move and release files. It contains no copied local data, logs, or secrets.
- `C:\\Users\\user\\Documents\\Codex\\2026-07-03\\gks\\outputs\\battery-data-portal-github-upload-v0.18` and `.zip`: current GitHub upload package for v0.18. It intentionally includes only code, tests, settings templates, and documentation.
- `C:\\Users\\user\\Documents\\Codex\\2026-07-03\\gks\\outputs\\battery-portal-saved-skills-guide-v0.18.pptx`: 10-slide Korean presentation explaining the eight saved portal-related skills, their current status, and the recommended operating workflow.

### Important Existing Implementation Paths

- `public/index.html`, `public/app.js`, `public/style.css`: portal UI, upload flow, module navigation, editable tables, figures, analysis, and organization UI.
- `python_backend.py`: FastAPI routes, auth, hierarchy, storage, analysis, feedback, organization roles, and Harvester API.
- `backend/parsers/`: CSV, Excel, WRD, and SEO parser routing.
- `backend/schemas/bdf.py`: BDF mapping, unit normalization, and quality review.
- `backend/analysis/`: retention, dQ/dV, DVA, EIS, rate capability, pulse resistance, and smoothing modules.
- `backend/storage_layout.py`: stable raw/parsed/analysis/figure/report artifact paths.
- `harvester/portal_harvester.py` and `docs/HARVESTER.md`: opt-in laboratory-PC ingestion workflow.
- `tests/`: automated backend, parser, artifact, analysis, Harvester, and organization-role tests, including SQLite-row permission regression coverage.
- `docs/ARCHITECTURE_V0.15.md`, `PRODUCTION_RUNBOOK.md`, `.env.example`, `render.yaml`, `railway.json`, `fly.toml`: architecture and deployment preparation.

## Remaining Work

- Provision and configure actual PostgreSQL, object storage, a deployment provider, domain, HTTPS, and required environment variables when the user chooses accounts and providers. For the Render blueprint, set S3/Supabase-compatible storage credentials and `CORS_ALLOW_ORIGINS` before deployment; startup now intentionally fails without them.
- Do not configure or validate an OpenAI workflow while the AI Summary UI remains intentionally removed. Reassess only if the user explicitly requests restoration.
- Test shared organization workflows with separate real user accounts on a deployed environment.
- Review and repair or replace stale/garbled historical handoff documentation, especially `docs/CURRENT_TASK.md`, in a dedicated documentation task.
- Add deployment-layer rate limits for login attempts and upload requests (for example Render proxy, Cloudflare, or an application rate-limit store). The backend now bounds upload size but does not yet provide distributed request-rate limiting.
- Run a one-time object-storage inventory after production is configured. Artifact keys that were already overwritten in old database rows cannot be inferred automatically, although all currently referenced artifacts and recognized legacy temporary URLs are deleted with a dataset.
- Manually refresh the portal and retry the same SEO/EIS upload once. If the backend returns an error, record the user-visible Korean message and the new server-log trace before making another change.
- Existing datasets parsed before v0.1.18 keep their stored rows. Reinspect and save a source file to apply the corrected WBCS WRD summary; add a deliberate migration only if the user requests bulk repair of historical datasets.
- Review, commit, and push the combined v0.1.10 hardening and v0.1.11 CYC/deletion changes to `https://github.com/JONGHO01/battery-data-portal.git` only when the user requests GitHub upload. Do not upload local runtime data or a ZIP itself as source files.
- Continue using ordinary commits and pushes for future changes; the earlier remote-history replacement is complete.

## Do Not Repeat

- Do not store raw chats, passwords, API keys, tokens, cookies, credentials, or unnecessary personal information in repository memory files.
- Do not create hooks, automatic prompt logs, or background conversation archives.
- Do not treat `docs/CURRENT_TASK.md` as the authoritative release state while it reports v0.14; prefer `VERSION`, `CHANGELOG.md`, and current source files.
- Do not remove the local storage fallback just because S3/Supabase is not configured.
- Do not re-enable `ALLOW_LEGACY_USER_HEADER` or wildcard CORS in production, and do not deploy production with local-only storage.
- Do not reintroduce AI Summary as a visible menu, home card, tab, automatic renderer, or report action without a new explicit user request.
- Do not delete stored analysis runs or Analysis Lab implementation merely because the ordinary UI entry points are hidden.
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
- 2026-07-15: Configured this repository's Git author as `JONGHO01`, committed the v0.1.9 release, fetched the six old remote commits, and used `git push --force-with-lease -u origin main` to replace the prior GitHub `main` history with the current portal. The release and synchronization record were then pushed normally; local `main` and `origin/main` match.
- 2026-07-15: v0.1.10 security and data-lifecycle verification passed: 37 backend tests, Python compilation, `package.json` parsing, Render YAML parsing, JavaScript syntax checking with the bundled Node runtime, and `git diff --check`.
- 2026-07-15: v0.1.11 CYC/deletion verification passed: 42 backend tests, including absolute `discharge_capacity_ah` Retention, direct `discharge_capacity_mAh` AI metrics, and a legacy `analysis_runs` schema migration followed by Dataset deletion. Python compilation, JavaScript syntax, `package.json` parsing, and `git diff --check` passed.
- 2026-07-15: v0.1.12 AI Summary UI removal verification passed: 42 backend tests, Python compilation, JavaScript syntax, version-touchpoint checks, and `git diff --check` passed. The restarted local server at `http://localhost:4174` reports `0.1.12`, serves the `0.1.12` cache references, and exposes no AI Summary menu, tab, home card, or view in the root HTML.
- 2026-07-15: v0.1.13 Version History verification passed: the two new static UI checks and the complete 44-test suite passed; Python compilation, JavaScript syntax, `package.json` parsing, version-touchpoint checks, and `git diff --check` passed. The restarted server at `http://localhost:4174` reports `0.1.13` and serves the administrator-only release-history navigation, view markup, and `0.1.13` cache references.
- 2026-07-15: v0.1.14 WBCS WRD verification passed: the supplied approximately 63 MB CYC WRD parsed as `WRD discharge summary` with 35 cycle rows. The complete suite passed 46 tests, including the binary WBCS WRD regression test and the 100 MiB upload-limit regression. Python compilation, JavaScript syntax, `package.json`/Render YAML parsing, version-touchpoint checks, and `git diff --check` passed. Restarted local `http://localhost:4174` reports `0.1.14`, HTTP 200 root, current cache references, SQLite/local development storage, and no visible AI Summary menu.
- 2026-07-15: Reproduced the current CYC upload-session save path in an isolated copy of the local SQLite database. The 35-cycle WBCS CYC data saved successfully with raw and parsed artifacts, confirming that the reported save failure came from the old `localhost:4173` v0.0.18 server rather than the v0.1.14 save path.
- 2026-07-15: v0.1.15 login and data-type-selection verification passed: the new UI tests and administrator release-history tests passed, followed by the complete 48-test suite. Python compilation, JavaScript syntax, `package.json`/Render YAML parsing, version-touchpoint checks, and `git diff --check` passed. Restarted local `http://localhost:4174` reports `0.1.15` and serves the current cache references. Browser-driven visual interaction could not run because the in-app browser tab did not attach; do not claim a direct click-through pass until that surface is available.
- 2026-07-16: v0.1.16 Analysis Lab visibility verification passed: the two hide/preserve regression tests, release-history tests, and complete 50-test suite passed. Python compilation, JavaScript syntax, `package.json`/Render YAML parsing, version-touchpoint checks, and `git diff --check` passed. Restarted local `http://localhost:4174` reports `0.1.16` and serves the Analysis Lab view implementation without any normal menu, home-card, or workspace-tab entry point.
- 2026-07-16: v0.1.17 direct data-type selection verification passed: the updated upload-selection and release-history tests, plus the complete 51-test suite, passed. Python compilation, JavaScript syntax, `package.json`/Render YAML parsing, version-touchpoint checks, and `git diff --check` passed. Restarted local `http://localhost:4174` reports `0.1.17` and serves the current cache references.
- 2026-07-16: v0.1.18 WBCS CYC summary and figure verification passed: 55 automated tests passed, including short-partial WRD rejection, complete low-capacity cycle retention, valid CYC-cycle filtering, and a single authoritative renderer. Python compilation, JavaScript syntax, `package.json` parsing, version-touchpoint checks, and `git diff --check` passed. Seven supplied WBCS files were re-parsed directly; short interrupted fragments were removed while normal low-capacity terminal cycles remained. Restarted local `http://localhost:4174` reports `0.1.18`.
- 2026-07-16: v0.1.19 Fig terminology verification passed: 56 automated tests passed, including a static check that current `public/index.html` and `public/app.js` contain `Fig` and no prior Korean loanword. Python compilation, JavaScript syntax, `package.json` parsing, version-touchpoint checks, and `git diff --check` passed. Restarted local `http://localhost:4174` reports `0.1.19`, serves the current cache references, and has no prior figure terminology in the served app JavaScript.
- 2026-07-16: v0.1.20 explicit C-rate verification passed: 58 automated tests passed, including BDF parsing of `C/10`, `0.33 C`, and numeric C-rate values, plus the CYC Fig explicit-rate priority check. Python compilation, bundled-Node JavaScript syntax, `package.json` parsing, version-touchpoint checks, and `git diff --check` passed. Restarted local `http://localhost:4174` reports `0.1.20`; root HTML and served app JavaScript both use the current cache/version and include the explicit C-rate logic.
- 2026-07-16: v0.1.21 batch Fig verification passed: 60 automated tests passed, including multi-file picker, sequential processing, Dataset persistence, per-file results, and Fig-record workflow checks. Python compilation, bundled-Node JavaScript syntax, `package.json` parsing, version-touchpoint checks, and `git diff --check` passed. Restarted local `http://localhost:4174` reports `0.1.21` and root HTML serves the `0.1.21` cache references.
- 2026-07-16: v0.1.22 login-expiry verification passed: 62 automated tests passed, including stale-login recovery and CYC Fig cycle filtering/deduplication. Python compilation, JavaScript syntax, package parsing, version-touchpoint checks, and `git diff --check` passed. Restarted `http://localhost:4174` reports `0.1.22`, serves the `0.1.22` cache references, and returns 401 with the expected token-invalid message for an invalid protected request.
- 2026-07-16: v0.1.23 CYC Fig-choice verification passed: 64 automated tests passed, including distinct performance/voltage/combined render paths and the requirement for real within-cycle voltage-profile points. Python compilation, JavaScript syntax, package parsing, and `git diff --check` passed. Restarted `http://localhost:4174` reports `0.1.23`, serves the `0.1.23` cache references, and its open saved voltage-profile record now displays the explicit insufficient-within-cycle-points guidance instead of the incorrect performance chart.
- 2026-07-16: v0.1.24 CYC electrical-behavior verification passed: 66 automated tests passed, including summary-only voltage/current trend and raw-profile current-legend coverage. Python compilation, bundled-Node JavaScript syntax, package parsing, and `git diff --check` passed. Local health reports `0.1.24`; direct root and app-script requests confirm the v0.1.24 cache references plus the voltage/current and current-legend rendering paths.
- 2026-07-16: v0.1.25 local Dataset-save concurrency verification passed: the new SQLite wait regression and immutable raw/parsed artifact persistence test passed. A copied database reproduced the reported 63 MB WBCS WRD CYC upload with the normal browser-style summary payload and saved its Dataset/artifacts successfully without touching the user's live record. The complete 67-test suite, Python compilation, JavaScript syntax check, package parsing, and `git diff --check` passed. After restart, `http://localhost:4174/api/health` reports v0.1.25; the live SQLite database reports `journal_mode=wal` and `busy_timeout=30000`, and the root page serves v0.1.25 cache references.

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
