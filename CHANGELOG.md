# Changelog

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

## Unreleased
- Record every delivered meaningful portal change here before commit, push, packaging, or deployment. Move these entries into the next version section when the version is released.
- Restore the EIS inspection panel's Korean labels and column guide directly in the renderer, so sweep, point, frequency, zreal, zimag, mag, phase, quality review, and Fig choices remain readable.
- Verify that saving the same raw source reuses one Dataset and one Fig record instead of adding a duplicate Fig card.

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
