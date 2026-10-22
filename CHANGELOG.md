# Changelog

## Unreleased

- Document same-task publication of every verified change: relevant tests, synchronized release metadata when needed, explicit public staging allow-list, commit, fast-forward push and remote verification. Report concrete blockers and local-only delivery instead of silently deferring. Exclude private operational handoffs and research artifacts. Documentation only; no pending application-code upload, runtime version bump or deployment claim.

- Rebuild the Korean README around the current research workflow, with a capability/status matrix, process-to-sample/file relationships, loopback-first Windows startup, storage/runtime explanation and privacy boundaries. Add public portal and running guides. Explicitly distinguish repository source v0.3.13 from local v0.3.20 Unreleased; this documentation-only update does not publish pending application code, bump runtime versions, migrate data or establish deployment success.

## v0.3.13 - 2026-10-12

- Correct the signed-curvature direction for the noisy Hansen L-knee. Replace the misleading noise-free scalar-success tests with known-truth noisy inverse and analytical two-CPE regressions. Retain lambda-squared manual fitting, numerical guards and explicit fallback; no universal optimal-lambda claim.
- Use a default 0.2 log10-decade half-prominence width, converted to samples for each grid. Reference in-band prominence to the measured-band density maximum and prioritize measured-band candidates during close-peak suppression. Preserve original density, all qualifying candidates and ln(tau) integrals; explicit legacy sample widths remain supported.
- Add an independent bounded signed-RC Lin-KK numerical diagnostic using scaled SVD least squares, R0/L/series-C nuisance columns and order 3-30 search. Retain the order curve and residuals; uncertain order/rank/range/time cases are inconclusive, never physical pass/fail. No new dependencies, smoothing, source rewrite or chemical assignment.
- Use rc-drt-4 in result/provenance and advertise the analysis contract in health. EIS UI blocks calculation on an old backend, marks old histories for recalculation and shows KK residual/order uncertainty separately from physical validation. Portal shell, routing, global CSS and other analyses remain unchanged apart from release metadata.
- Verification: all 501 unittest cases and 10 existing inference pytest cases pass, plus JavaScript/Python syntax, ASCII/version/whitespace checks and pip check. No build/lint scripts or new dependencies; pip_audit is unavailable, so no vulnerability-audit claim. Synthetic-only browser confirms the corrected noisy knee, two neutral peaks and separate KK/physical-validation-incomplete display with no console errors. Approved official local restart and independent health/browser confirm v0.3.13/rc-drt-4. All 61 Dataset fields, four AnalysisRun fields and 122 raw/parsed hashes/sizes are unchanged. Actual reported SEO copy still has 19.16% DRT error and inconclusive KK; auto selection is rejected, not forced successful. This release supersedes v0.3.12's incorrect clockwise claim; no real reanalysis, source rewrite or cloud-deployment assertion.

## v0.3.12 - 2026-10-06

- Review RC-DRT against Hansen's original Tikhonov/L-curve treatment and official pyDRTtools sources. Retain the valid Hansen lambda-squared convention, complex RC kernel, relative weighting, log-grid quadrature and second derivative; document the convention rather than silently changing manual lambda values.
- Add monotonicity, interior, tangent, local-corner and 5% numerical fit guards. The clockwise corner-selection claim was incorrect for the noisy L-knee and is superseded by v0.3.13. Project only machine-scale BVLS lower-bound roundoff; reject material negative solutions.
- Retain/export every qualifying peak and all density/measurement samples. Exclude outside-measured-band peak locations from major labels, flag extrapolation-dependent region integrals, surface high fit error and old-analysis recalculation notices. No automatic resistance identity, post-smoothing, acquisition averaging or source rewriting.
- Use rc-drt-3 consistently in result and existing analysis provenance. Portal shell, global styles, routing, parsers and other analyses are unchanged apart from required release metadata.
- Verification: all 467 unittest cases and 10 existing inference pytest cases passed; JavaScript/Python syntax, ASCII source, version and whitespace checks passed. Isolated browser on an unsaved original-data copy verifies three default-lambda major candidates, visible 19.16% caution, rejected high-error automatic selection and cleared stale curves, without console errors. No new dependencies or build/lint scripts. Existing localhost:4174 remains v0.3.11; a new restart approval was requested but not received. No real analysis write, raw-data rewrite or cloud-deployment claim.

## v0.3.11 - 2026-10-06

- Restore CYC header and integrated-record electrode information. Separate original WRD CellWeight/nominal-capacity settings, unconfirmed filename material/mass labels, and saved linked-electrode calculations; keep missing values explicit and output escaped/text-only.
- Expose optional, typed original CellWeight evidence from a bounded TestReport header in new-upload parser/provenance and authorized legacy local-WRD detail responses. No filename fallback, inferred active mass, measurement reparse, DB migration or live data write; parser-8 and C-rate calculations are unchanged.
- Display linked active mass/thickness when present. Require actual areal units or a saved calculation for loading; do not convert a bare or unrelated sample mass into mg/cm2. Reject invalid/overflowing numbers and distinguish filename areal loading from total mass.
- Verification: all 445 unittest cases passed (62.141s), plus 10 existing inference pytest cases; JavaScript/Python syntax, ASCII integrity, version synchronization and whitespace checks passed. Approved official local restart and independent health confirm v0.3.11. Live CYC displays original mass/nominal setting, unconfirmed filename material and unchanged calibrated stages, without console errors or a bogus loading caption. All 61 Dataset stored-field fingerprints and target raw/normalized hashes match the baseline. No new dependencies, build/lint scripts, portal-shell/global-CSS/other-analysis changes or cloud deployment claim.

## v0.3.10 - 2026-10-06

- Read a bounded, typed WBCS TestReport prefix to expose original nominal CellCapacity (Ah) as an optional C-rate reference. Keep CellWeight handling, raw rows, parser version and existing storage contracts unchanged; do not deserialize .NET objects.
- Preserve the server-produced reference in new upload parser metadata. Recover it in authorized legacy local-WRD detail responses without updating DB rows, normalized artifacts or original files. Unavailable references remain unknown.
- Prefer explicit row C-rates, then the selected Dataset's linked electrode reference, then the original report reference. Summarize only discharge currents per integer cycle using medians, preserve recovery stages, and support constant-rate experiments without requiring capacity loss. Keep actual mA labels when no reference exists.
- Identify original-vs-linked reference provenance in the existing experiment summary and correct its measured-current units to mA. Do not use an unrelated global manual sample for current calibration. Qualify calibrated discharge-stage labels on charge traces rather than claiming a charge C-rate.
- Verification: all 407 unittest cases passed (51.984s), plus 10 existing C-rate inference pytest cases. JavaScript/Python syntax, ASCII integrity, version synchronization and whitespace checks pass. Live 44-cycle WRD shows six calibrated discharge stages and twelve paired voltage curves without console errors. The explicitly approved local restart activated v0.3.10; 61 Dataset field fingerprints and the target raw/normalized artifact hashes are unchanged. Update an obsolete structural assertion to pass segment provenance; no new dependencies, build/lint scripts or cloud-deployment claim.

## v0.3.9 - 2026-10-06

- Restore charge-capacity profiles when discharge-capacity cells are null or zero placeholders. Reject missing voltage/time/current values rather than inventing zeros; reuse direction-aware capacity selection. Preserve input rows and units.
- Keep every valid current/rate segment instead of silently sampling a maximum of five. Label representative cycles to distinguish initial and recovery segments at the same current. Existing explicit C-rate/filename labels are retained; uncalibrated current ratios now show actual measured mA, never an assumed absolute C-rate.
- Move voltage-profile legends clear of X-axis titles, use width-aware columns and enough SVG height, and give six unique current levels distinct default colors. Portal shell, global CSS, parsers, API contracts and raw files are unchanged; backend diff is version metadata only.
- Add ten behavioral regression tests for nullable charge capacity, missing measurements, all seven segments, source immutability, honest current/explicit-rate labels, and wide/narrow legend geometry. Update only obsolete legacy legend-spacing expectations.
- Verification: all 376 unittest cases passed (43.245s); JavaScript/Python syntax, ASCII integrity, version synchronization and whitespace checks passed. Live stored-data browser check confirms all 14 representative curves, six distinct current colors and separate X-axis/legend geometry with no console errors. The first full run caught a literal non-ASCII separator; it was converted to the required Unicode escape and the complete suite rerun successfully. No real experiment writes, server restart, new dependencies or cloud deployment. Build/lint scripts are absent.

## v0.3.8 - 2026-09-21

- Verification: 366 unittest cases passed (92.839s), JavaScript syntax and whitespace checks passed. Isolated browser verified cancellation (one request, old record retained) and confirmed replacement (two requests), with no console errors. Live localhost serves the fixed v0.3.8 static files; existing tab/backend remain untouched. No real experiment writes/deletes, new dependencies or dependency audit. Build/lint scripts and a dependency lockfile are absent.
- Read duplicate-import conflict objects from the portal's `error` envelope as well as FastAPI's standard `detail`. Restore cancel/confirm behavior without changing server authorization, storage, deletion rules or API responses. Reject malformed conflict lists and stop on a second conflict instead of retrying deletion.
- Format structured errors using a string message or safe fallback rather than `[object Object]`.
- Use the actual server exception serializer in frontend regression and disposable browser tests; the previous mock incorrectly assumed a `detail` envelope. Five reproduced failures now pass, with cancel, confirmed replacement, stale conflicts, malformed payloads and both envelope shapes covered. Real user data is not used or deleted in verification.

## v0.3.7 - 2026-09-16

- Connect CYC performance and raw voltage-profile renderers to saved axis limits. Applying a CYC target now displays that graph; other ranges and raw measurements remain unchanged. Clip zoomed traces to the plot frame and keep automatic tick behavior when no manual limits are set.
- Honor single-sided limits outside the automatic extent by extending only the unspecified side. Preserve validation, per-graph auto reset and existing Fig persistence/export paths.
- Add seven behavioral regression tests and a disposable browser harness with synthetic data and memory-only saves. Browser confirmed exact voltage/performance limits, automatic reset and restored saved values with no console errors.
- Verification: 362 unittest cases passed (121.405s), JavaScript syntax and whitespace checks passed. Local static HTML/JS serve v0.3.7; existing user tab and backend process remain untouched. Temporary QA tab/server closed. No build/lint scripts, dependency additions or dependency audit; no raw file or real database writes.

## v0.3.6 - 2026-09-16

- Keep Add text and Enter as append actions, with a separate selected-text update button. Offset new annotations, retain individual dragging, font sizing, existing storage shape and SVG/export rendering. Ignore Enter during IME composition.
- Snapshot and serialize per-Dataset Fig saves. Do not let an older response discard newer annotation/style edits. Existing authorization and API endpoints remain unchanged.
- Add regression coverage for repeated additions, selection-only edits, empty/escaped input, clearing, event bindings and rapid-save persistence; isolated browser checks use no experimental data.
- Verification: 355 unittest cases, JavaScript syntax and whitespace checks passed. Isolated browser verified three labels via button/Enter, selected-only edit, drag and reopen, without console errors. Live static HTML/JS serve the new controls/version; existing tab is not refreshed to avoid disrupting work. No backend restart or real data writes. No build/lint scripts or dependency lockfile; no dependencies added or audit claimed.

## v0.3.5 - 2026-09-16

- Add owner-scoped duplicate-filename confirmation for single/batch/legacy CSV imports. Cancel preserves originals; confirmation names exact Dataset targets and warns of permanent removal.
- Commit a fresh source before purging approved old raw/parsed/analysis/Fig/report records and artifacts. Preserve existing datasets API behavior; reject stale/forged confirmations and consumed import sessions. Report partial deletion explicitly, with strict cloud deletion errors.
- Use a compact portal HTML dialog with cancel focused by default. Preserve other-user files, PC originals, analysis, portal layout and other pages. Local activation requires an approved backend restart; old servers show an explicit update message, not an unsafe fallback.
- Verification: final full suite 349 tests passed, app.js syntax and diff whitespace checks passed. Isolated browser harness verified cancel (one request, old record retained) and confirm (two requests, new record returned), with a 560px dialog and no console errors. Temporary test tabs/servers closed; real portal files and DB unchanged. No build/lint scripts or committed dependency lockfile; no packages added or dependency audit claimed.

## v0.3.4 - 2026-09-16

- Add previous/next graph buttons and current CYC record position to the integrated view. Follow filtered authorized gallery order across dates, skipping other types, without wrapping at either endpoint.
- Keep gallery return, compact graph sizes, raw data, analysis and portal shell unchanged. Guard asynchronous row loading against a changed selection or closed view.
- Verification: 334 unittest cases passed, JavaScript syntax and diff whitespace checks passed. Browser confirmed saved CYC 085 (2/65) to 088 (1/65, previous disabled) and back, with all three graphs and no console errors. No build/lint scripts configured; no server restart or raw-data writes.

## v0.3.3 - 2026-09-16

- Limit only integrated CYC record SVG previews to clamp(260px, 38vh, 400px), instead of unbounded full-card-width scaling. Preserve aspect ratio, existing two-column/narrow-screen layout, and all three graphs.
- Preserve individual CYC figures, EIS/CV, SVG viewBox/export geometry, raw data, calculations, and portal shell. Backend version metadata only; no server restart.
- Verification: 331 unittest cases passed; app.js syntax and diff whitespace checks passed. Browser verified the saved 085 integrated record with all three previews at 380px in a 2000x1000 viewport and 342px at 780x900, without console errors; temporary viewport override reset. No build/lint scripts configured.

## v0.3.2 - 2026-09-16

- Replace averages of tiny-voltage pointwise derivatives with capacity-conserving finite-volume 5 mV dQ/dV bins. Consecutive measured increments are distributed by voltage overlap; exact plateaus retain their capacity in one bin. No smoothing or peak clipping is applied.
- Preserve acquisition-index order rather than sorting resettable step times; do not bridge missing measurements or cumulative-capacity resets.
- Treat empty charge/discharge capacity cells as missing, not zero, restoring charge curves. Preserve signed discharge and measured capacity units.
- Reserve left margin for the dQ/dV unit title and move the legend below the voltage axis label. Keep portal shell, EIS/CV, storage and original files unchanged; backend change is version metadata only.
- Independent analytic regression tests reproduce sampling-density sensitivity, lost capacity, reset spikes and missing charge curves. Read-only 082 WRD verification: first-discharge delta-Q 161.62095685 mAh/g, old bin integral magnitude 142.97084404, corrected 161.62095685. Existing local server is not restarted.
- Verification: 330 unittest cases passed; JavaScript syntax and git diff whitespace checks passed. All eight supplied WRD first-discharge integrals match measured delta-Q within 1e-6 and source SHA-256 hashes are unchanged. Browser confirmed both charge/discharge traces on saved 082 and 088, with visible unit/voltage labels and separate legends. No build/lint scripts are configured.

## v0.3.1 - 2026-09-16

- Preserve a single explicit C-rate segment and render it above CYC performance plots. Previously both inference and rendering required multiple rates.
- Display an explicitly declared constant condition (for example C-rate: 0.1 C) when no rate is available from plotted rows. Missing rate information produces C-rate: not specified, never a fabricated number. Temperature conditions and filename digits do not provide this fallback.
- Preserve capacity values, raw artifacts, portal shell and EIS/CV. Backend change is version metadata only; existing server was not restarted.
- Verification: 321 unittest cases passed after behavior changes; app.js syntax check passed. Browser confirmed the missing-rate notice above the unchanged saved WRD graph with no console errors. The screenshot's exact rate still requires user confirmation. No build/lint scripts are configured.

## v0.3.0 - 2026-09-15

- Restrict Dataset and hierarchy access to the owner and global administrators. Remove organization-based research-data sharing and reject Dataset ID takeover, including concurrent upserts.
- Add a scoped file workspace: authorized search, metadata classification with revision checks, protected source downloads, local keyword chat helper, preprocessing preview and explicitly approved recipe versions.
- Preserve source rows/artifacts. Recipe exports verify the complete input fingerprint and reject changed inputs instead of silently exporting different results. This is not independent processed-artifact archival.
- Add workspace_profiles and workspace_versions tables without rewriting existing research data. No external LLM connection, chat-history persistence, training consent or training-dataset creation is included.
- Add ownership, input-validation, source-integrity and workspace API regression tests. Runtime restart and production deployment are separate from source publication.
- Verification: 318 tests passed; app/workspace JavaScript syntax and diff checks passed. Browser confirms the new menu and explicit restart-required state on the older local backend. Build/lint scripts and dependency lockfile are not configured; no dependency was added. Live new-API UI verification awaits restart approval.

## v0.2.9 - 2026-09-15

- Remove the 480px EIS preview cap. Use the analysis width with 55:45 panels on desktop, readable stacked plots in narrow panes, compact controls and a five-column peak table. Fold the original raw editor by default; preserve its DOM/listeners and restore it when leaving EIS.
- Detect directly on unchanged gamma using scipy.signal.find_peaks with 5% maximum-density prominence and 2.5-sample half-prominence width. Suppress candidates within 0.25 log10 decade by prominence, not height. These are conservative defaults, not physical identities or universal optima.
- Label at most five major peaks; retain all qualifying minor peaks in a disclosure and exports. Integrate original gamma in ln(tau) between nearest minima, with log-midpoint/outer-grid fallbacks. Record detection criteria in rc-drt-2 metadata; do not modify fitting, source rows or existing saved analyses.
- Keep old saved results explicitly marked as previous detection criteria until recalculated. Existing API, manual assignments and data storage stay intact; non-EIS application-file edits are release metadata only.
- Verification: final full suite passed 296 tests / 24 subtests; JavaScript syntax and git diff checks passed. Desktop analysis canvas measured about 660px high in a 1200px viewport (55%), with 55:45 panels. Browser verified compact controls, raw Show/Hide and CYC editor restoration; no console errors. No build/lint scripts or dependency lockfile are configured; no dependencies added. Local 0.2.5 backend restart/recalculation is pending separate user approval.

## v0.2.8 - 2026-09-14

- Add EIS-only HF/MF/LF interpretation-candidate bands under the DRT axis with Korean/English explanations. Boundaries follow measured log-time limits and in-band peak anchors, never universal physical cutoffs.
- Keep P1/P2/P3 neutral by default. Explicit user-only Assignment supports Unassigned, R_SEI, R_ct, R_ion, Diffusion and Other; the solver and raw data are unchanged.
- Show a five-column peak table, save assignments through the existing authorized Dataset figure-edits endpoint, and include choices in SVG/enlargement, peak CSV and metadata JSON. Bind labels to Dataset, analysis run, segment and peak values; reject unknown labels and stale assignments.
- Preserve the compact preview, global layout, other analysis pages and storage schema. Other application-file edits are release metadata only.
- Verification: 285 tests and 18 subtests passed; JS syntax and diff checks passed. Browser confirmed guide/peak controls, manual label removal and neutral assignment save, without altering raw measurements or assigning experimental mechanisms. Build/lint scripts are not configured; npm is unavailable and no dependency was added.

## v0.2.7 - 2026-09-14

- Read WBCS TestReport binary CellWeight with bounded, non-executing NRBF metadata inspection. Keep explicit filename-mass precedence and preserve raw Ah measurements and raw-file bytes; unknown/invalid mass is not guessed.
- Route CYC neutral specific-capacity values by measured charge/discharge direction so charge points cannot become discharge maxima.
- Advance to parser-8 for existing WRD raw-artifact/re-upload refresh paths. Keep valid parser-7 SDE results compatible; malformed-SDE checks remain active.
- Direct read-only verification of eight supplied WRDs found valid binary weights and approximately 161–163 mAh/g for cycles 1–2. The reported sample yields 161.304 and 162.402 mAh/g through WRD, BDF and the shipped CYC display adapter. No value was fitted to a target of 160.
- Local backend restart, real saved-artifact refresh and production deployment remain separate from source publication.
- Verification: 282 tests and 18 subtests passed, JavaScript syntax checks and git diff checks passed. An initial Windows file-lock test-launch failure cleared on the final full run. The current saved Ah Fig opens without console errors; corrected saved-Fig browser verification awaits backend restart/reparse. Build/lint scripts are not configured; npm audit could not run because npm is unavailable (no npm dependencies were added).

## v0.2.6 - 2026-09-14

- Constrain only the EIS on-screen plot wrapper to approximately 480px high and center it, matching the compact CYC preview rather than stretching with a wide monitor.
- Preserve the full-resolution SVG/viewBox, internal 55:45 panel geometry, DRT controls, calculation, axes, data and export handlers. No global CSS or CYC/CV behavior change; other application-file changes are release metadata only.
- Add regression assertions for preview bounds and unchanged exported SVG dimensions. Browser verification at 2000px viewport width: height reduced from about 1087px to 480px; all three plots and the restored DRT result retained.

## v0.2.5 - 2026-09-14

- EIS-only 55:45 analysis panels with larger right DRT/signed-Im plots, compact DRT Controls, compact status and collapsible detailed results/exports. No global CSS, header/sidebar, routing, login or CYC/CV behavior changes.
- Deduplicate range options by actual minimum/maximum frequency, always high to low. Keep acquisition direction as metadata; use the first complete acquisition for each range without averaging or deleting raw points.
- Use frequency-derived tau bounds even before fitting, scale gamma from zero to its measured maximum plus padding, retain the same highest-frequency marker in both sign conventions.
- Restore a matching saved result first; otherwise attempt automatic lambda once for complete bounded input. Unreliable automatic selection is not displayed as success; clear stale/failed results and synchronize the current lambda field after calculation.
- Verification: 268 tests and 18 subtests passed; browser synthetic repeated-range automatic/manual calculation, initial tau axis, gamma scaling and compact controls passed. Build/lint scripts are not configured; separate JavaScript syntax checks are used. Only release metadata changes outside the EIS module/tests/docs.

## v0.2.4 - 2026-09-14

- Follow-up runtime verification: the stopped local server was started with the official launcher; health confirms v0.2.4 and segment selection support. Actual SEO upload inspection, Fig generation/reopening and a selected 61-point DRT calculation completed. Original rows were not edited; the 19.16% reconstruction warning remains. No additional behavior change was needed.

- Split repeated EIS acquisition data at sweep changes, repeated frequencies and direction reversals. Break cross-segment lines and require one selected segment before DRT fitting; do not sort, average or delete source points.
- Add optional validated spectrumIndex to the existing protected analysis operation and preserve original row indices. Check the health capability before selected-segment submission; an older running server requires an approved restart.
- Restore only matching selected-segment analyses, keep uncertainty warnings, and correct combined EIS labels to Nyquist + DRT. No CYC/CV, shared parser, login, storage configuration or schema changes.
- Verification: 266 tests and 18 subtests passed. Synthetic selected-segment fitting/restoration passed in an isolated browser/server; a real 366-row SEO file separated into six 61-point segments and parsed through the local file chooser. The unspecified upload failure was not reproduced. Real segment reconstruction errors remain about 5.8–19.2%; no physical-validity claim.
- JavaScript syntax checks passed. Package audit could not run because this dependency-free frontend has no pnpm lockfile; no security-audit success is claimed. Existing localhost backend and production deployment are separate from this source release.

## v0.2.3 - 2026-09-14

- Extend round Y-axis ticks to CYC voltage profiles, voltage/current trends, dQ/dV and combined performance views. Keep custom axis limits and plotted values unchanged, include zero when in range, and preserve small signed readings without duplicate labels.
- Keep CYC capacity units unchanged; no guessed mass conversion, parser change, database write or cloud configuration change. Eight local WRD files were parsed read-only; their matching saved Fig was checked in the browser without re-uploading.

## v0.2.2 - 2026-09-14

- Round CYC performance axes to readable 1/2/5 power-of-ten steps instead of dividing an arbitrary maximum into five intervals. The reported Ah figure now displays 0, 0.002, 0.004, 0.006, 0.008.
- Remove floating-point label tails and reserve SVG space based on tick-label length so the Y-axis title does not overlap the numbers. Preserve specific-capacity scaling, measured values and units.
- Verify the reported saved WRD Fig in the browser: three points retained, roughly 19 px between title and tick labels, no console warnings/errors. Full tests: 256 passed and 6 subtests passed. No original-file, DB, parser, login, EIS/CV or cloud change.

## v0.2.1 - 2026-09-14

- Restore CYC graphs from canonical artifact rows even when saved metadata lists vendor headers. Ignore empty optional specific-capacity columns so measured Ah discharge data reaches the renderer.
- Keep blank/null/boolean capacities out of discharge summaries; scale small Ah values to their measured range instead of forcing a 1 Ah maximum.
- Add five executable JavaScript regression cases via pytest, covering raw/canonical/legacy shapes, units, non-mutation, repeated rendering and small-capacity axes.
- Verify the reported 7,180-row WRD Dataset in the local browser: three discharge cycles, voltage profiles and dQ/dV render without re-uploading or rewriting source files. No database migration, cloud configuration, login, global layout or EIS/CV change.

## v0.2.0 - 2026-09-10

- Preserve the existing EIS grid, point-connection and marker-size controls in the new renderer; add an executable regression and browser toggle check.
- Replace the right-hand Bode panels of the combined EIS result with nonnegative RC-DRT and signed Im(Z) Nyquist. Preserve left-plot size, saved axes, HF marker, raw sweep order and image exports. Standalone Bode remains available.
- Normalize signed and negative-imaginary headers in an EIS-only adapter without rewriting artifacts or shared parsers.
- Fit real/imaginary data jointly with trapezoidal log-time kernels, bounded least squares, gamma-only smoothing, optional exact-zero L, and guarded 41-point L-curve selection. Add only pinned SciPy.
- Add neutral peaks, log-time resistance integration, reconstruction/error, quality warnings, CSV/metadata exports and saved-analysis restoration through the existing authorized API.
- Invalidate fits after file/settings/data changes; keep Nyquist without frequency and clear failed calculations.
- No new routes, migration, global CSS/layout/state changes, or changes to CYC/CV, login, sidebar, header or storage providers. See docs/EIS_DRT.md for verification and limits.

## v0.1.80 - 2026-09-10

- Publish the accumulated v0.1.77-v0.1.80 source changes with the local/runtime versus production verification boundaries documented in README.
- Record the standing user instruction to commit and push verified future portal changes promptly, excluding credentials and experiment data.

- Clear stale inspection state and markup before a new upload so an old EIS preview cannot appear below a failed WRD request.
- Retain single-file selections after failure, disable concurrent selection/duplicate clicks during inspection, and use the bounded request timeout instead of inviting another upload while one is pending.
- Explain disconnected uploads in Korean with a default-portal hint only for nonstandard loopback ports; never automatically replay POSTs or redirect files/authentication to another origin.
- Offload synchronous parsing/storage work from the async upload handler to the framework thread pool; retain existing authentication, byte limits, and parser timeout.
- Add executable failure/recovery and thread-isolation tests. Update the earlier refresh test to assert rendered spelling, not HTML entity syntax.

## v0.1.79 - 2026-09-10

- Write the administrator raw-data refresh label explicitly as `새로고침` instead of equivalent numeric HTML entities, and add exact rendered-label checks for all six refresh buttons.
- The current local source already decoded to the correct spelling; the reported older screen was not reproduced. No refresh handler, permissions, data, or storage changes are included.

## v0.1.78 - 2026-09-10

- Fix blank Nyquist/Bode figures when persisted EIS rows use `frequency_hz`, `z_real_ohm`, and `z_imag_ohm` instead of legacy frontend names.
- Reuse a non-mutating display adapter for EIS plots, saved-Fig thumbnails, and local summaries; preserve original rows, units, and storage.
- Reject missing/non-finite measurements without treating them as zero and show an explicit message when no usable points exist.
- Add executable JavaScript regression coverage for persisted and legacy measurements, all three plot inputs, thumbnails, and empty states. No production deployment is included.

## v0.1.77 - 2026-09-10

- Replace the protected administrator raw-row table and pager with a readable card for each Dataset.
- Show owner, registration time, data type, exact row/column counts, original-file size, and local-backup state on each card.
- Add an administrator-only original-file download endpoint protected by the existing short-lived second confirmation.
- Stream private Backblaze B2 objects through the application or return the validated local artifact without exposing an object key or filesystem path.
- Keep Neon metadata, private B2 artifacts, verified Windows archives, existing Dataset rows, and the compatibility raw-preview API unchanged.

## v0.1.76 - 2026-09-10

- Render editable-table pagination buttons and the home-screen status as readable Korean instead of literal or corrupted Unicode text.
- Keep both search-result actions inside each card so `Fig 열기` and `모음에서 보기` remain separately visible and clickable.
- Load an authenticated, cycle-level capacity projection for saved CYC comparisons instead of transferring full trace rows, so two metadata-only Figs compare promptly without being opened first.
- Show each compact search and saved-Fig card's exact stored point count before its full normalized rows are hydrated.
- Preserve the existing Neon metadata, private B2 artifact, and verified Windows archive boundaries; this release adds no database migration or raw-data rewrite.
- Complete five fresh-browser verification passes after the final fix, covering 425 active non-destructive interactions with no UI, text, layout, comparison, or console failure.
- Clarify the GitHub README architecture and remove obsolete version rows that had been misplaced inside API and storage tables.

## v0.1.75 - 2026-09-09

- Confirm Backblaze B2 as the private S3-compatible object store while preserving Neon metadata and verified Windows raw-file archives.
- Require an official HTTPS B2 S3 endpoint whose embedded region matches `S3_REGION` before production storage is reported as configured or any upload, read, signed-download, or delete operation can use it.
- Add a B2-specific Render template, operator guide, administrator storage label, and provider-neutral archive implementation without storing any credentials.

## v0.1.74 - 2026-08-26

- Keep production PostgreSQL rows slim by storing uploaded normalized tables in private S3-compatible object storage and hydrating old Figs on demand.
- Add an authenticated raw-artifact archive queue with short-lived private download URLs, exact size/SHA-256 verification, and no automatic cloud deletion.
- Add a standard-library Windows backup agent and scheduled-task installer for account/date/Dataset-partitioned local raw-data archives.
- Show B2 raw-data usage plus pending and verified local-backup counts in the protected administrator raw-data browser.
- Preserve exact point counts in compact Dataset/Fig lists without loading the full normalized table into PostgreSQL or the browser.
- Document the Neon metadata, Backblaze B2 artifact, and local workspace archive operating model.
- Remove the public administrator account identifier from the login screen.
- Add a regression test that prevents the administrator identifier from being advertised again.

## v0.1.73 - 2026-08-20

- Repair the Search scope and saved-date labels so they display `전체` and `전체 날짜` correctly.
- Verify saved Figs are separated by valid experiment dates embedded in source filenames, with saved timestamps used only as a fallback.

## v0.1.72 - 2026-08-20

- Prefer valid experiment dates embedded in source filenames when grouping saved Figs.
- Keep the date displayed on each saved Fig card aligned with its date group.

## v0.1.71 - 2026-08-18

- Calculate C-rate automatically when a CYC file does not contain an explicit C-rate.
- Prefer an explicit 1C current, then active-material mass and specific capacity, then loading, electrode area, and specific capacity.
- Show the inferred C-rate segments and calculation basis in the upload review card; explain why calculation is unavailable instead of guessing.
- Add focused backend and frontend contract tests for C-rate inference.

## v0.1.70 - 2026-08-18

- Add a dedicated saved-files column to the administrator member table.
- Open the raw-data archive prefiltered to the selected member from member management.
- Keep account actions visually separate from saved-file access.

## v0.1.69 - 2026-08-12

- Group saved Figs by date with the newest date expanded first.
- Separate CYC, EIS, CV, and other Figs inside each date group.
- Preserve existing open, compare, and delete actions in the grouped gallery.

## v0.1.68 - 2026-08-12
- Add editable X/Y minimum and maximum ranges to the Fig editor.
- Save axis ranges independently for CYC performance, voltage/current, dQ/dV, EIS Nyquist, and CV figures.
- Let users restore any selected graph to its automatic axis range.

## v0.1.66 - 2026-08-11
- Mark the actual highest-frequency Nyquist point as the EIS start point instead of assuming source row order.
- Fit Nyquist axes closely to the measured impedance range with meaningful zero origins.
- Increase the Nyquist/Bode panel spacing so magnitude and phase labels remain readable.

## v0.1.65 - 2026-08-11
- Add an `업로드 데이터 보기` action to each administrator member row.
- Open the administrator raw-data browser filtered to the selected account, with a one-click return to all-member data.
- Keep the existing administrator-only second-confirmation gate for raw dataset rows.

## v0.1.64 - 2026-08-11
- Accept meaningful interrupted low-capacity WRD traces when measured point count, capacity change, and voltage span provide enough evidence for a cycling curve.
- Reject scientifically unusable tiny WRD fragments instead of turning them into misleading CYC Figs.
- Process multi-file uploads one file at a time with visible analysis, Dataset-save, and Fig-save progress.
- Continue the remaining batch after an invalid file and summarize successful and excluded filenames when processing finishes.

## v0.1.63 - 2026-08-05
- Refine the combined EIS Fig layout with a compact EIS-specific canvas, tighter three-panel spacing, lighter axes and grids, and a single shared Bode frequency axis to prevent overlapping labels.
- Unify CYC voltage-profile and dQ/dV color selection by C-rate: a saved rate color applies to the matching charge and discharge traces in either view, while legacy per-trace overrides remain compatible as a fallback.
- Make custom Fig annotations use the same regular Segoe UI / Noto Sans KR typography as figure captions and labels.
- Add a compact CYC Fig electrode summary that separates raw filename mass labels from linked saved electrode-calculation values when available.
- Normalize CYC performance-plot C-rate segment labels to the same typography and neutral text color as axis ticks.
- Move the CYC voltage-capacity C-rate legend into a dedicated panel below the plot so charge/discharge labels do not cover measured curves; add a concise legend note for solid/dashed direction, C-rate time basis, and average-current labels.
- Add a saved CYC integrated-record workspace that reads the existing raw WRD-backed Dataset to show performance, voltage/current, dQ/dV, a compact raw-data preview, and the linked electrode calculation profile without modifying the saved Fig or rows.
- Hide the electrode C-rate calculator navigation while preserving stored C-rate profiles; the integrated CYC record can link an existing profile on demand.
- Add static and browser smoke checks for opening a saved CYC integrated record and confirming its three CYC charts, linked-electrode panel, and raw-data preview render.
- Let saved CYC Fig records switch between performance, voltage/current, and dQ/dV views by reusing their hydrated raw Dataset rows without overwriting the saved Fig record or editable table.
- Hide the experiment-storage hierarchy panel from the standard data-registration sidebar while preserving its existing default project, batch, cell, and Dataset saving behavior.
- Select representative raw CYC traces by detected C-rate segment while retaining the matching charge and discharge pair from the same cycle.
- Render voltage-capacity and dQ/dV Figs with a shared color per C-rate, a dashed discharge trace, and direction-normalized dQ/dV signs so charge is positive and discharge is negative.
- Preserve matched WRD charge/discharge traces and distribute the 5,000-row browser preview across every available cycle and direction, so long CYC files retain data for voltage profiles and dQ/dV.
- Refresh legacy WRD datasets by parser version rather than their display-row count, preventing current representative previews from being reparsed on every startup.

## v0.1.62 - 2026-07-23
- Recognize the neutral WBCS WRD header `specific capacity (mAh g-1)` as discharge capacity when it is not a charge-only field.
- Restore saved CYC performance, voltage/current, and dQ/dV rendering for full raw WRD traces that use this standard header.
- Treat legacy `capacity: null` rows as unresolved instead of coercing them to zero, then rebuild their CYC render data from preserved raw/parser rows.

## v0.1.61 - 2026-07-23
- Render editable Dataset tables in 250-row pages while retaining every raw CYC point in memory and storage for performance, voltage/current, and dQ/dV analysis.
- Keep page controls aligned to original global row indexes so edits, row selection, undo, paste, and saved row updates continue to address the correct raw rows.

## v0.1.60 - 2026-07-23
- Keep complete WBCS WRD point-level traces up to the bounded `MAX_PARSED_ROWS` limit instead of silently retaining only the first 5,000 rows.
- Detect previously saved WRD datasets with exactly the former 5,000-row cap and rebuild their Dataset rows and normalized artifact from the immutable raw source during startup.
- Keep an explicitly selected CYC Fig type, including dQ/dV, when inspection UI state refreshes instead of resetting it to the performance Fig.

## v0.1.59 - 2026-07-23
- Normalize stored raw CYC rows when a Dataset is reopened so source columns such as `specific capacity (mAh g-1)` and `voltage (V)` are restored to the rendering fields.
- Restore valid WBCS WRD voltage-capacity traces for saved performance, voltage/current, and dQ/dV Figs instead of showing a blank chart after reload.
- Explain whether dQ/dV is unavailable because voltage-capacity source points are missing, too few distinct points exist within one cycle, or no valid derivative segment remains.

## v0.1.58 - 2026-07-23
- Make normal CYC Fig generation single-panel only: capacity performance, voltage/current behavior, and dQ/dV remain separate Fig choices.
- Keep legacy `cyc-combined` records intact, but render them as one CYC performance Fig instead of a two-panel output.

## v0.1.57 - 2026-07-23
- Preserve all supported WBCS WRD discharge points instead of reducing each cycle to a single end-capacity row, so valid within-cycle voltage-capacity traces can be used for dQ/dV.
- Refresh older saved `.wrd` CYC datasets from their preserved raw artifacts during startup when they were parsed by an earlier parser version.
- Keep retention analysis one point per cycle by selecting the largest recorded discharge capacity within each raw cycle trace.

## v0.1.56 - 2026-07-23
- Prevent dQ/dV analysis from differentiating CYC cycle-summary rows that contain only one capacity/end-voltage value per cycle.
- Require a real within-cycle voltage-capacity trace for Analysis Lab and dQ/dV Fig creation; unavailable data is explained and cannot create a blank Fig record.

## v0.1.55 - 2026-07-22
- Add a CYC `dQ/dV` Fig option that derives curves only from raw within-cycle voltage-capacity traces; summary-only tables now show a clear unavailable state instead of an invented electrochemical curve.
- Require six distinct raw points for CYC voltage profiles and keep charge and discharge traces separate when current direction is available.

## v0.1.54 - 2026-07-22
- Prevent a hosted portal from creating accounts in an ephemeral SQLite database; require PostgreSQL for a persistent hosted account store and verify new registrations through a fresh database connection.
- Show the server's specific registration error in the login screen so missing production configuration is actionable.

## v0.1.53 - 2026-07-22
- Support a separate local verification instance through an explicit port and port-specific log files, without terminating an existing portal process.

## v0.1.52 - 2026-07-22
- Add administrator-only temporary password reset; existing passwords remain hashed and are never displayed or returned.

## v0.1.51 - 2026-07-22
- Refresh every `.SDE` EIS dataset saved by an older instrument-parser version from its preserved raw artifact during startup.
- Keep the exact legacy `Z' = frequency` detector, and also refresh older parser output that is wrong without that exact signature so Nyquist and Bode Figs use the measured impedance columns.

## v0.1.50 - 2026-07-22
- Add a role-linked organization chart that automatically groups the selected organization's actual members as owner, admin, researcher, and viewer.
- Keep the chart synchronized with the existing organization member list, member role assignments, and member removal without introducing duplicate organization data.

## v0.1.49 - 2026-07-22
- Add an administrator-only registered-member directory with account ID, display name, signup date, organization memberships, role, refresh action, and the existing account-removal control.

## v0.1.48 - 2026-07-22
- Add PowerPoint export for CYC comparison Figs, including the current comparison chart, legend, and selected series colors on one slide.

## v0.1.47 - 2026-07-22
- Add CYC performance Fig controls for aligned grid visibility, point-connection visibility, and marker size.
- Preserve visual gaps between missing cycle numbers even when point connections are enabled.

## v0.1.46 - 2026-07-22
- Add a project-local Battery Data Portal v2 launcher that reuses a healthy local portal or starts it safely on port 4174.
- Add a Codex/PowerShell startup guide and a VS Code task without changing the legacy port-4173 task.

## v0.1.45 - 2026-07-21
- Apply the saved Fig series color to EIS Nyquist and Bode traces as well as CYC and CV traces.

## v0.1.44 - 2026-07-21
- Label Fig cards, headers, and newly saved records from the linked Dataset type and actual source filename, so EIS data cannot be presented as CYC when both share Cell metadata.
- Normalize legacy saved Fig record names and kinds at startup without changing raw experimental files or parsed data.

## v0.1.43 - 2026-07-21
- Repair legacy ZIVE SmartManager `.SDE` EIS datasets where `Z'` was incorrectly stored as the frequency value, causing a flat or unreadable Nyquist Fig.
- Reparse the preserved raw SDE artifact during startup when that exact legacy signature is detected, and refresh the normalized artifact and parser provenance.
- Reimporting a duplicate SDE source now replaces the stale normalized rows instead of reusing the broken result.

## v0.1.42 - 2026-07-21
- Redesign the EIS Nyquist Fig as a connected measured-data curve with equal real/imaginary axis scaling, dotted publication-style grid lines, and bounded point markers.
- Render the Nyquist-only, Nyquist + Bode, and Bode-only selections as distinct Fig layouts.

## v0.1.41 - 2026-07-21
- Repair visible Korean text in hierarchy selectors, upload and Dataset messages, Fig labels, and Analysis Lab fallback states.
- Keep `public/app.js` ASCII-only with Unicode escapes and add a regression check so Windows code-page handling cannot silently ship mojibake.

## v0.1.40 - 2026-07-21
- Keep the Render web service online when durable object storage is incomplete, so `/api/health` and the portal can show the missing configuration instead of Render exiting with status 3.
- Continue refusing Dataset artifact writes with a 503 until durable object storage is configured; production never falls back to temporary local persistence.

## v0.1.39 - 2026-07-21
- Report missing Render durable-storage variable names through `/api/health` and dataset-save errors without exposing credential values.
- Log object-storage upload failures with a safe server-side cause and return a retryable diagnostic instead of an opaque Dataset-save 500.
- Clean a stored raw artifact when its parsed companion fails during Dataset finalization.

## v0.1.38 - 2026-07-21
- Restore readable saved Fig comparison labels and controls through one authoritative browser renderer.
- Reuse duplicate raw-source uploads without creating duplicate Dataset and Fig records.
- Ignore local SQLite WAL and SHM files so runtime data is not included in Git uploads.

## v0.1.37 - 2026-07-20
- Restore clear Korean upload guidance, selected-file labels, batch action text, failure messages, and CYC/CV/EIS Fig choices after dynamic JavaScript text encoding damage.

## v0.1.36 - 2026-07-20
- Ignore the cell/sample number before the first fractional C-rate in WBCS-style CYC filenames, preventing incorrect Fig labels such as `4 C` for a `0.33 C -> 1 C -> re 0.33 C` sequence.

## v0.1.35 - 2026-07-20
- Restore clear Korean labels for saved Fig cards, Fig categories, and the administrator account badge after dynamic JavaScript text encoding damage.

## v0.1.34 - 2026-07-20
- Restore clear Korean empty-state guidance in the Fig workspace and editable data table.
- Replace the English `No dataset` title with a direct Dataset-selection instruction.

## v0.1.33 - 2026-07-20
- Add ZIVE SmartManager `.SDE` binary file support through the validated EIS parser used for compatible `.SEO` records.
- Expose `.SDE` in the file picker and upload guidance, and label inspection output as `SDE EIS binary`.

## v0.1.32 - 2026-07-20
- Start multi-file analysis with the already selected hierarchy Cell when the separate Cell ID input is blank, so users do not have to re-enter the same Cell before processing.
- Restore the browser batch-analysis script and its Korean progress/result messages after encoding corruption stopped the file-analysis action from running.

## v0.1.31 - 2026-07-20
- Clear and re-enable the multi-file picker after every batch outcome, so the next file selection always starts a new workflow.
- Prevent overlapping multi-file batch runs while a current batch is being processed.

## v0.1.30 - 2026-07-20
- Prefer the precise electrode mass encoded in a WRD filename over unrelated binary text, producing correct specific-capacity values for WBCS CYC files.
- Render C-rate guide lines only for complete positive displayed-cycle segments and cap y-axis tick density, preventing overlapping left-axis artifacts in CYC Figs.

## v0.1.29 - 2026-07-20
- Make the primary file-analysis button start the sequential batch Dataset and Fig workflow when two or more files are selected, instead of stopping with a separate-button instruction.

## v0.1.28 - 2026-07-20
- Widen the desktop data-registration sidebar to 420-450px so multi-file names, upload status, and action labels remain readable without clipping.

## v0.1.27 - 2026-07-20
- Compact long project, Cell, Dataset, and source-file path segments with stable hashes before local artifact storage, preventing Windows path-length failures after successful WRD/CYC inspection.

## v0.1.26 - 2026-07-20
- Keep desktop navigation buttons at their natural width and use horizontal scrolling only when the viewport cannot fit every menu, preventing vertically split menu labels.
- Make Dataset creation idempotent for a completed upload session: a browser retry now returns the original Dataset instead of failing because the upload was already consumed.

## v0.1.25 - 2026-07-16
- Use SQLite WAL mode and a 30-second busy timeout for local Dataset persistence so an artifact finalization does not immediately fail with a transient server error when the browser is reading portal data at the same time.

## v0.1.24 - 2026-07-16
- Show a cycle-summary fallback for CYC voltage/profile selections: mean voltage and signed current are plotted together by cycle instead of leaving the electrical behavior unavailable.
- Keep true voltage-versus-capacity/time profiles for raw curve data and label each selected curve with its average current.

## v0.1.23 - 2026-07-16
- Make the saved CYC Fig choice control the renderer: cycling performance, voltage profile, and combined Fig now use distinct rendering paths.
- Require multiple within-cycle voltage/capacity or voltage/time points for a voltage profile, and show an explicit Fig message instead of fabricating a curve from cycle-summary rows.

## v0.1.22 - 2026-07-16
- Detect expired or server-invalidated browser login tokens on protected requests and return users to the login screen with a clear retry message instead of showing a file-analysis failure.

## v0.1.21 - 2026-07-16
- Allow selecting multiple supported upload files and process up to 10 sequentially with the same Cell metadata and hierarchy destination.
- Save a Dataset and a corresponding Fig record for every successfully detected CYC, CV, or EIS file, while retaining per-file results and retryable error messages.

## v0.1.20 - 2026-07-16
- Recognize explicit CYC C-rate columns in BDF canonical rows, accepting numeric values, `0.33 C`, and `C/10` notation.
- Prefer the uploaded C-rate column over filename or current-based inference when labeling CYC Fig cycle segments, and show detected C-rate values during file inspection.

## v0.1.19 - 2026-07-16
- Rename the user-facing figure terminology to `Fig` across portal navigation, actions, status messages, data-type guidance, saved-comparison UI, and current README wording.

## v0.1.18 - 2026-07-16
- Filter short, low-capacity interrupted start/end fragments from WBCS WRD CYC summaries while preserving complete low-capacity cycles.
- Ignore zero or negative cycle numbers when drawing CYC capacity figures and retain a single authoritative CYC figure renderer.

## v0.1.17 - 2026-07-16
- Keep the file-type dropdown enabled after automatic detection; choosing a value immediately switches to manual selection so CYC, CV, and EIS can be selected without a separate radio-button step.

## v0.1.16 - 2026-07-16
- Hide the Analysis Lab menu, home card, and workspace tab from normal navigation while preserving the implementation and saved analysis history for a later restore.

## v0.1.15 - 2026-07-15
- Make the login button a form submit control so Enter in the ID or password field logs in once through the existing validation path.
- Put the automatically detected CYC/CV/EIS type choice above the read-only column-name chips, make the selected type visually clear, and explain that column names do not need to be selected.

## v0.1.14 - 2026-07-15
- Raise the bounded default upload limit from 50 MiB to 100 MiB so common WBCS CYC WRD exports can be inspected without overriding local or Render settings.
- Return the configured upload limit in Korean when an upload is rejected, and show FastAPI `detail` messages in the browser instead of a generic load failure.
- Add a WBCS WRD regression fixture that verifies a binary discharge record becomes a CYC summary row.

## v0.1.13 - 2026-07-15
- Add a concise version-history table to README and an administrator-only Version History view in the portal, showing the current semantic releases and their key delivered changes.

## v0.1.12 - 2026-07-15
- Remove the AI Summary menu, home entry card, workspace tab, dedicated frontend view, automatic refresh calls, and report-save controls from the portal UI. Existing datasets and the non-exposed backend compatibility endpoint remain intact.

## v0.1.11 - 2026-07-15
- Interpret BDF `discharge_capacity_ah` and displayed `discharge_capacity_mAh` CYC columns as valid absolute-capacity series, convert Ah to mAh, and preserve the capacity unit in Retention and AI CYC metrics.
- Migrate older `analysis_runs` tables with no `artifact_json` column at startup and make Dataset deletion tolerant of legacy analysis records so linked EIS/CYC analyses do not cause a server error.

## v0.1.10 - 2026-07-15
- Disable legacy header-based authentication and wildcard CORS by default; production now refuses insecure authentication, CORS, and non-durable storage settings.
- Require configured S3/Supabase-compatible object storage for the Render production blueprint so raw and generated research files are not silently kept in `/tmp` only.
- Limit browser and Harvester uploads to a configurable 50 MiB default before Base64 decoding, with streamed raw-upload enforcement.
- Remove temporary uploads after immutable raw/parsed artifacts are stored, reuse figure/report artifact paths on re-save, and delete dependent records and artifacts when a dataset is deleted.
- Pin Python dependencies to the locally verified versions and synchronize `package.json` with the portal release version.

## v0.1.9 - 2026-07-15
- Adopt semantic portal version numbering (`major.minor.patch`).
- Add the project rule that every meaningful portal change must be recorded in this changelog.
- Include project-local skills for versioning, CYC/cellpy, EIS/impedance.py, and session memory.


## v0.18 - 2026-07-13
- Move the organization menu to the second position from the right.


## v0.17 - 2026-07-13
- Explain EIS columns and make dataset-save errors readable in the figure workflow.


## v0.16 - 2026-07-13
- Fix SQLite Row permission handling for dataset and figure saving.


## v0.15 - 2026-07-13
- BDF 표준 컬럼, CSV/Excel/WRD/SEO Parser 분리, 행 단위 품질 검토를 추가했습니다.
- Dataset별 `raw / parsed / analysis / figure / report` 아티팩트 저장 구조를 추가했습니다.
- Analysis Lab에 retention, dQ/dV, DVA, rate capability, pulse resistance, EIS summary의 재현 가능한 분석 이력을 추가했습니다.
- Upload, Explorer, Figure Builder, Analysis Lab, Organization 진입 화면을 정리했습니다.
- 장비 PC 자동 업로드 Harvester와 해시 기반 API 토큰을 추가했습니다.
- Organization → Project → Campaign → Cell → Dataset 공유 구조와 owner/admin/researcher/viewer 권한을 추가했습니다.


## v0.14 - 2026-07-13
- Dataset 묶음, 셀 메타데이터, 프로토콜 구간, Fig 및 AI 보고서 저장 구조를 추가했습니다.


## v0.13 - 2026-07-13
- Project -> Campaign -> Cell 계층 구조와 기존 데이터 자동 연결을 추가했습니다.


## v0.12 - 2026-07-10
- CYC XLS/WRD 컬럼 매칭과 Ah/g 단위 변환을 보정


## v0.11 - 2026-07-10
- EIS Nyquist Fig에 자동으로 표시되던 빨간 high f -> low f 주파수 방향 화살표를 제거했습니다.


## v0.10 - 2026-07-10
- 파일 선택 시 자동 분석을 멈추고, 파일 분석 버튼으로만 실행되게 바꿨습니다. 중복 분석 클릭을 막고, 로딩이 오래 걸릴 때 자동으로 화면 잠금을 해제하도록 개선했습니다. HTML/JS/CSS 캐시 방지도 추가했습니다.


## v0.09 - 2026-07-10
- 파일 분석을 base64 변환 대신 원본 업로드 API로 처리해 큰 WRD/CYC 파일에서 로딩이 멈추는 문제를 줄였습니다.


## v0.08 - 2026-07-09
- Add admin-only feedback inbox page


## v0.07 - 2026-07-09
- Object storage fallback so CYC/WRD analysis works without S3_BUCKET


## v0.06 - 2026-07-09
- Excel/XLS upload dependency and file-analysis timeout handling


## v0.05 - 2026-07-08
- 전극 C-rate 계산기를 8개 슬롯으로 확장하고 각 슬롯에서 계산 새로고침, 메인 불러오기, 저장소 저장을 할 수 있게 개선.


## v0.04 - 2026-07-08
- 관리자 계정을 qq035786으로 고정하고 로컬/배포 환경에서 BOOTSTRAP_ADMIN_PASSWORD로 비밀번호를 반영하도록 개선.


## v0.03 - 2026-07-08
- 로컬에서 오래된 로그인 토큰이 남아 있어도 파일 분석과 API 요청이 막히지 않도록 인증 호환 처리를 보강.


## v0.01 - 2026-07-07

- FastAPI 백엔드로 전환했습니다.
- JWT 기반 로그인 토큰을 추가했습니다.
- SQLite 기본 저장과 PostgreSQL 운영 저장을 함께 지원하도록 정리했습니다.
- local/S3/Supabase Storage 업로드 저장 옵션을 추가했습니다.
- Render, Railway, Fly.io 배포 설정 파일을 추가했습니다.
- VS Code 실행 작업과 운영 문서를 FastAPI 기준으로 갱신했습니다.

## v0.00 - 2026-07-07

- 배터리 데이터 포탈 버전 표기를 시작했습니다.
- CYC/CV/EIS Fig, 검색, 전극 계산, AI 요약, 엑셀 표 수정 기능을 개발 버전으로 정리했습니다.
