# Changelog

## Unreleased

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
