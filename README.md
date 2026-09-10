# Battery Data Portal

![Version](https://img.shields.io/badge/version-0.2.0-2f80ed)
![Frontend](https://img.shields.io/badge/frontend-HTML%20%2B%20CSS%20%2B%20JS-14a3a3)
![Backend](https://img.shields.io/badge/backend-FastAPI-ef5b72)
![Database](https://img.shields.io/badge/database-SQLite%20%2F%20PostgreSQL-4b6cb7)
![Status](https://img.shields.io/badge/status-research%20prototype-f4a261)

> Source release: **v0.2.0** — EIS-only DRT analysis, signed-Im Nyquist, reconstruction and exports. Existing portal layout, authentication, CYC/CV, and Neon/B2 storage remain unchanged. GitHub source and running-server versions must be verified separately.

> B2 endpoints are restricted to the official HTTPS service and must match `S3_REGION`. No real B2 credential is stored in this repository.

배터리 실험 데이터를 업로드하고, 검토하고, 논문/보고서용 Fig와 전극 계산표로 정리하기 위한 연구용 데이터 포털입니다.

현재 소스 버전은 **v0.2.0**이며, 운영 배포 여부와는 별개입니다. EIS 통합 Fig의 오른쪽 두 패널만 DRT와 실제 Im(Z) Nyquist로 교체했습니다. 왼쪽 Nyquist, 포탈 전체 폭·사이드바·로그인·CYC/CV·원본 저장 구조는 유지합니다. 새 서버 계산은 의존성 설치와 서버 재시작 후 적용됩니다.

## EIS DRT 사용법

1. 저장된 EIS 통합 Fig를 엽니다. 표를 편집했다면 먼저 표를 저장합니다.
2. Fig 아래의 **DRT 설정**에서 M, λ, 직렬 L 포함 여부를 선택하고 **DRT 계산·저장**을 누릅니다. 기본값은 시작값이며 항상 최적은 아닙니다.
3. 왼쪽은 −Im(Z), 오른쪽 아래는 실제 Im(Z)입니다. 측정값은 마커, 재구성은 주황 점선입니다. Rs·L·오차와 중립적 P1/P2 피크를 확인합니다.
4. τ 구간을 입력해 ln(τ)에 대한 저항 적분을 계산하고 DRT CSV·재구성 CSV·메타데이터 JSON 또는 기존 SVG·PNG를 저장합니다.

계산 결과는 기존 Dataset 분석 기록에 별도로 저장되며 원본 행을 덮어쓰지 않습니다. 주파수가 없으면 Nyquist만 표시합니다. 중복 주파수는 유지하며 측정 대역 밖 결과와 불명확한 자동 λ 선택에는 경고합니다. 자세한 모델·제한·검증은 [EIS DRT 설명](docs/EIS_DRT.md)을 참고하세요.

## 이전 업데이트와 연결 점검

- **EIS Fig 복구:** 저장된 표준 컬럼 이름을 읽어 Nyquist·Bode 그래프를 표시합니다. 원본 측정값은 바꾸지 않습니다.
- **파일 분석 실패 처리:** 이전 파일의 결과를 지우고, 실패한 파일 선택은 유지하며, 중복 분석 요청을 막습니다.
- **관리자 원본 확인:** 큰 데이터 표 대신 Dataset 카드를 보여주며 추가 관리자 확인 후 원본 파일을 다운로드합니다.

2026-09-10 읽기 전용 점검 결과입니다. 아래는 당시 상태이며 운영 연결 성공을 보장하는 실시간 상태판이 아닙니다.

| 구간 | 확인 결과 |
|---|---|
| 로컬 포탈 | `http://localhost:4174/` 응답 정상. `4196`은 응답하지 않음 |
| 로컬 DB·파일 | SQLite 무결성과 연결 관계 정상. 원본·분석·Fig 참조 파일 모두 존재하며 기록된 파일 크기와 일치 |
| 실행 버전 | 정적 프론트엔드 0.1.80 / 실행 중 백엔드 0.1.78. 백엔드 적용에는 정상 재시작 필요 |
| 운영 Neon·B2 | Render 로딩 화면과 대시보드 로그인 제한으로 실제 연결·파일 읽기는 확인하지 못함 |
| Windows 자동 백업 | 로컬 큐는 대기 상태이며 표준 백업 설정 파일을 확인하지 못함 |

**로컬 SQLite·파일과 운영 Neon·B2는 별개입니다.** 로컬 파일이 운영 저장소로 자동 동기화되지는 않습니다. `/api/health`의 설정 상태만으로 DB 질의나 B2 파일 읽기 성공을 단정하지 않습니다. 운영 서비스 이름은 `battery-data-portal-v2`, GitHub 저장소 이름은 `battery-data-portal`입니다.

앞으로 요청된 수정은 검증과 변경 기록을 마친 뒤 GitHub `main`에 올립니다. 비밀키·DB 파일·로우데이터는 제외하며, 업로드와 Render 배포 성공은 별도로 확인합니다.

실제 사이트처럼 운영하려면 [PRODUCTION_RUNBOOK.md](./PRODUCTION_RUNBOOK.md)를 먼저 보면 됩니다. Render/Fly/Railway 서버, PostgreSQL DB, Supabase/S3 파일 저장소, OpenAI API, 도메인과 HTTPS까지 연결하는 순서를 한 번에 정리해두었습니다.

---

## v0.1.77 구조 변경 요약

| 구간 | 이전 | v0.1.77 |
|---|---|---|
| 관리자 로우 데이터 확인 | Dataset 선택 후 큰 원본 행 표와 페이지 이동 표시 | Dataset별 카드에서 등록자·날짜·행/열·원본 용량·백업 상태 확인 |
| 원본 파일 받기 | 관리자 화면에서 직접 다운로드 불가 | 추가 관리자 확인 후 로컬 또는 private B2 원본을 다운로드 |
| 민감 저장 정보 | 내부 경로를 API에서 다룰 수 있음 | 카드 API에는 B2 객체 키와 로컬 경로를 노출하지 않음 |
| 원본·정규화 데이터 | private B2 저장 | 변경 없음 |
| 계정·권한·Fig 인덱스 | Neon PostgreSQL 저장 | 변경 없음 |
| 관리자 장기 백업 | Windows archive agent | 변경 없음 |

즉, **저장 위치나 기존 데이터를 옮기지 않고**, 관리자에게 필요한 Dataset 정보만 간단히 표시합니다. 원본 다운로드는 기존 관리자 로그인에 더해 짧게 유지되는 추가 확인 권한이 있어야 하며, private B2 객체 키나 서버 경로는 브라우저에 전달하지 않습니다.

---

## 버전 이력

전체 변경 내역은 [CHANGELOG.md](./CHANGELOG.md)에서 관리합니다. 포털 관리자 화면의 `버전 이력`에서도 아래 최신 이력을 확인할 수 있습니다.

| 버전 | 날짜 | 핵심 변경 |
|---|---|---|
| v0.2.0 | 2026-09-10 | EIS 전용 DRT·실제 Im(Z) Nyquist, 재구성 검증, 구간 저항 적분, CSV/메타데이터 저장. |
| v0.1.80 | 2026-09-10 | Recover cleanly from upload failures and offload blocking inspection work. |
| v0.1.79 | 2026-09-10 | Explicit Korean refresh label and spelling tests for six refresh buttons. |
| v0.1.78 | 2026-09-10 | Restore persisted EIS Nyquist/Bode plots and thumbnails without rewriting measured data. |
| v0.1.77 | 2026-09-10 | Replace the large administrator raw-row table with Dataset cards and protected local/private-B2 source downloads. |
| v0.1.76 | 2026-09-10 | Repair Korean UI text and search-card layout; add lightweight authorized CYC comparison data and exact compact-card point counts. |
| v0.1.75 | 2026-09-09 | Validate official B2 endpoints and regions, report the active provider, and retain Neon/B2/Windows storage separation. |
| v0.1.74 | 2026-08-26 | Separate Neon metadata, private B2 artifacts, and SHA-256-verified Windows raw archives; remove the public administrator identifier. |
| v0.1.73 | 2026-08-20 | Repair Search labels and verify source-file experiment-date grouping across saved Figs. |
| v0.1.72 | 2026-08-20 | Prefer valid experiment dates in source filenames when grouping saved Figs and showing card dates. |
| v0.1.71 | 2026-08-18 | Infer C-rate from 1C current or electrode mass/loading metadata and show the calculation basis during upload review. |
| v0.1.70 | 2026-08-18 | Add direct member-to-saved-files access in administrator member management. |
| v0.1.69 | 2026-08-12 | Group saved Figs by date and separate CYC, EIS, CV, and other figures |
| v0.1.68 | 2026-08-12 | Add saved manual X/Y graph ranges with one-click automatic range restore |
| v0.1.67 | 2026-08-11 | Mark the EIS high-frequency start and refine Nyquist/Bode layout bounds |
| v0.1.66 | 2026-08-11 | Clarify the EIS high-frequency start and prevent clipped Nyquist/Bode labels |
| v0.1.65 | 2026-08-11 | Browse administrator raw-data records filtered to a selected member account |
| v0.1.64 | 2026-08-11 | Recover meaningful interrupted WRD traces and continue multi-file batches after invalid files |
| v0.1.63 | 2026-08-05 | Refine CYC raw-data record views and shared C-rate Figure controls, plus a balanced combined EIS layout |
| v0.1.62 | 2026-07-23 | Recover neutral WBCS WRD specific-capacity columns and legacy empty capacity rows for saved CYC Figs |
| v0.1.61 | 2026-07-23 | Page editable tables at 250 rows while preserving every raw point for CYC and dQ/dV analysis |
| v0.1.60 | 2026-07-23 | Preserve complete WRD traces; rebuild legacy 5,000-row datasets and retain the selected CYC Fig type during refresh |
| v0.1.59 | 2026-07-23 | Normalize saved raw CYC rows for performance, voltage/current, and dQ/dV rendering; show precise dQ/dV data-availability reasons |
| v0.1.58 | 2026-07-23 | Make normal CYC Fig output single-panel; legacy combined records render as performance Figs |
| v0.1.57 | 2026-07-23 | Preserve point-level WBCS WRD discharge traces for dQ/dV and refresh older saved WRD datasets from raw artifacts |
| v0.1.56 | 2026-07-23 | Block dQ/dV for cycle-summary CYC data and require genuine within-cycle voltage-capacity traces |
| v0.1.55 | 2026-07-22 | Add raw-trace-only CYC dQ/dV Fig generation and separate charge/discharge voltage-profile traces when available |
| v0.1.54 | 2026-07-22 | Require PostgreSQL for hosted account persistence, verify registrations through a fresh connection, and show actionable sign-up errors |
| v0.1.53 | 2026-07-22 | Run a separate local verification instance with an explicit port and port-specific logs without stopping an existing portal |
| v0.1.52 | 2026-07-22 | Add administrator-only temporary password reset; existing passwords remain hashed and are never displayed or returned |
| v0.1.51 | 2026-07-22 | Refresh older SDE EIS parser output from the preserved raw artifact so Nyquist and Bode axes use measured impedance |
| v0.1.50 | 2026-07-22 | Add a role-linked organization chart that automatically groups the selected organization's actual members |
| v0.1.49 | 2026-07-22 | Add an administrator-only registered-member directory with signup dates, organization memberships, and account management |
| v0.1.48 | 2026-07-22 | Export CYC comparison Figs to a PowerPoint slide with the current chart, legend, and selected colors |
| v0.1.47 | 2026-07-22 | Add CYC Fig grid, point-connection, and marker-size controls while preserving missing-cycle gaps |
| v0.1.46 | 2026-07-22 | Add a project-local launcher for safe local v2 startup and health checks on port 4174 |
| v0.1.45 | 2026-07-21 | Apply saved Fig series colors consistently to EIS Nyquist/Bode traces |
| v0.1.44 | 2026-07-21 | Use linked Dataset type and source filename for Fig names; normalize legacy EIS/CYC record labels safely |
| v0.1.43 | 2026-07-21 | Repair legacy SDE EIS rows where Z' was incorrectly saved as frequency; automatically reparse preserved raw artifacts |
| v0.1.42 | 2026-07-21 | Render EIS Nyquist data as a connected, equal-axis publication-style plot and separate Nyquist/Bode layouts |
| v0.1.41 | 2026-07-21 | Repair visible Korean UI text and guard frontend source against code-page corruption |
| v0.1.40 | 2026-07-21 | Keep Render online for safe storage diagnostics while refusing uploads without durable storage |
| v0.1.39 | 2026-07-21 | Add Render storage diagnostics, safe Dataset-save failures, and partial-artifact cleanup |
| v0.1.38 | 2026-07-21 | Restore readable saved Fig comparison labels, reuse duplicate raw-source uploads, and exclude local SQLite WAL files from Git |
| v0.1.37 | 2026-07-20 | Restore clear Korean upload guidance, selected-file labels, batch action text, and CYC/CV/EIS Fig choices |
| v0.1.36 | 2026-07-20 | Prevent a WBCS CYC cell/sample number from being displayed as a C-rate in Fig guides |
| v0.1.35 | 2026-07-20 | Restore clear Korean labels for saved Fig cards, Fig categories, and the administrator account badge |
| v0.1.34 | 2026-07-20 | Restore clear Korean empty-state guidance in the Fig workspace and editable data table |
| v0.1.33 | 2026-07-20 | Support ZIVE SmartManager `.SDE` EIS files through the validated binary EIS parser |
| v0.1.32 | 2026-07-20 | Reuse the selected hierarchy Cell when multi-file analysis starts with a blank Cell ID form input |
| v0.1.31 | 2026-07-20 | Release the multi-file picker after batch completion and block duplicate runs |
| v0.1.30 | 2026-07-20 | Correct WRD filename-mass parsing and CYC Fig axis/guide readability |
| v0.1.29 | 2026-07-20 | 여러 파일을 선택하면 기본 분석 버튼으로 순차 Dataset·Fig 생성 흐름을 바로 시작 |
| v0.1.29 | 2026-07-20 | 데스크톱 데이터 등록 패널을 넓혀 여러 파일명, 저장 상태, 버튼 문구가 잘리지 않도록 개선 |
| v0.1.27 | 2026-07-20 | 긴 WRD 원본 파일명과 실험 계층에서도 Windows 저장 경로 길이 오류 없이 Dataset 원본/분석 파일 저장 |
| v0.1.26 | 2026-07-20 | 상단 메뉴 줄바꿈 방지 및 완료된 업로드 저장 재시도 안정화 |
| v0.1.25 | 2026-07-16 | SQLite 동시 저장 대기와 WAL 모드로 대용량 Dataset 저장 안정화 |
| v0.1.24 | 2026-07-16 | CYC 전압/전류 거동 Fig와 원본 프로파일의 평균 전류 표기를 추가 |
| v0.1.23 | 2026-07-16 | CYC Fig 선택값에 따라 성능, 전압 프로파일, 통합 화면을 각각 렌더링 |
| v0.1.22 | 2026-07-16 | 만료된 로그인 토큰을 감지하면 로그인 화면으로 안전하게 복귀 |
| v0.1.21 | 2026-07-16 | 여러 파일을 순차 분석·저장하고 파일별 Fig 기록 생성 |
| v0.1.20 | 2026-07-16 | CYC 파일의 명시적 C-rate 열을 읽어 Fig cycle 구간을 자동 구분 |
| v0.1.19 | 2026-07-16 | 포털의 Fig 용어를 통일 |
| v0.1.18 | 2026-07-16 | WBCS WRD의 불완전 조각을 제외하고 CYC Fig의 유효 cycle만 표시 |
| v0.1.17 | 2026-07-16 | 파일 종류 목록에서 CYC·CV·EIS를 바로 선택 가능 |
| v0.1.16 | 2026-07-16 | Analysis Lab의 일반 메뉴 진입점은 숨기고, 기존 분석 기능과 이력은 보존 |
| v0.1.15 | 2026-07-15 | 로그인 Enter 제출과 파일 판별 선택 UI를 명확화 |
| v0.1.14 | 2026-07-15 | WBCS WRD 기본 업로드 한도를 100 MB로 확장하고 한도 초과 오류를 명확화 |
| v0.1.13 | 2026-07-15 | README와 관리자 전용 화면에 버전 이력 추가 |
| v0.1.12 | 2026-07-15 | AI 요약 UI 제거, 기존 데이터 호환성 유지 |
| v0.1.11 | 2026-07-15 | CYC 절대 용량 분석과 분석 이력 Dataset 삭제 보완 |
| v0.1.10 | 2026-07-15 | 운영 보안, 파일 저장, 업로드·삭제 수명주기 강화 |
| v0.1.9 | 2026-07-15 | 시맨틱 버전과 프로젝트 전용 스킬·변경 기록 규칙 도입 |

---

## 프로젝트 목표

배터리 실험 데이터는 파일 형식이 다양하고, 후처리 과정에서 반복 작업이 많이 생깁니다. 이 포털은 실험 데이터를 한곳에 모아 다음 작업을 빠르게 처리하기 위해 만들었습니다.

- CYC, CV, EIS 데이터를 업로드하고 확인
- 엑셀처럼 표 데이터를 직접 수정
- 전극 무게, 두께, 조성비 기반으로 1C 및 C-rate 전류 계산
- 계산된 전극 조건을 저장하고 CYC 데이터에 바로 적용
- 페이지 하단에서 누구나 수정 요청과 의견을 남길 수 있음
- 로컬 저장에서 운영 DB와 클라우드 저장소로 확장

## v0.15 연구 데이터 구조

이번 버전부터 포털은 단순 파일 목록이 아니라 다음 계층으로 데이터를 연결합니다.

```text
Organization (선택)
  Project → Campaign / experiment batch → Cell → Dataset group → CYC / EIS / CV
```

- 파일은 parser별로 읽은 뒤 BDF 표준 컬럼과 품질 검토 결과로 정규화합니다.
- Dataset마다 `raw`, `parsed`, `analysis`, `figure`, `report` 아티팩트가 별도로 저장됩니다.
- 조직 `researcher`는 공유 프로젝트에 업로드·수정·분석할 수 있고 `viewer`는 조회만 할 수 있습니다.
- `harvester/`는 장비 PC 폴더를 감시해 안정화된 파일을 안전한 API 토큰으로 자동 업로드합니다.

구현 상세와 운영 전 확인 사항은 [docs/ARCHITECTURE_V0.15.md](./docs/ARCHITECTURE_V0.15.md)에 정리했습니다.

---

## 핵심 기능

| 구분 | 기능 | 설명 |
|---|---|---|
| v0.1.29 | 2026-07-20 | 여러 파일을 선택하면 기본 분석 버튼으로 순차 Dataset·Fig 생성 흐름을 바로 시작 |
| 데이터 등록 | CYC, CV, EIS 업로드 | 실험 파일을 올리고 데이터 종류별로 정리합니다. |
| 데이터 편집 | 표 직접 수정 | 업로드된 CYC 표를 엑셀처럼 수정하고 행을 추가/삭제할 수 있습니다. |
| 전극 계산 | 1C, C-rate, loading 계산 | 전극 질량, 두께, 조성비, 이론용량을 바탕으로 전류값을 계산합니다. |
| 계산 저장소 | 전극 C-rate 저장 | 자주 쓰는 전극 계산 조건을 저장하고 다시 불러옵니다. |
| CYC 적용 | 저장 계산값 적용 | 저장된 전극 조건을 선택한 CYC 데이터에 바로 넣습니다. |
| 수정 요청 | 누구나 의견 남기기 | 페이지 하단에서 오류, 추가 기능, 계산식 수정 요청을 저장할 수 있습니다. |
| 백엔드 API | 저장, 조회, 수정, 삭제 | FastAPI 서버가 프론트 화면과 DB 사이를 연결합니다. |
| 운영 확장 | PostgreSQL, S3/Supabase | 나중에 진짜 사이트처럼 운영할 수 있도록 확장 방향을 준비했습니다. |
| 데이터 표준 | BDF + 품질 검토 | Parser별 입력을 표준 컬럼과 단위로 정규화하고, 이상 행은 삭제하지 않고 분석 포함 여부로 관리합니다. |
| 분석 이력 | Analysis Lab (UI 숨김) | retention, dQ/dV, DVA, rate, pulse, EIS 결과와 파라미터를 재현 가능한 이력으로 저장합니다. 일반 메뉴에서는 잠시 숨겼습니다. |
| 공동 연구 | 조직/역할 | 조직 프로젝트에서 owner/admin/researcher/viewer 역할로 공유 범위를 정합니다. |
| 장비 연동 | Harvester | 장비 PC의 안정화된 파일을 중복 없이 업로드하는 opt-in 수집기입니다. |

---

## 화면 구성

```mermaid
flowchart LR
    A["데이터 등록"] --> B["CYC / CV / EIS 분석"]
    B --> C["엑셀형 표 편집"]
    C --> D["전극 계산"]
    D --> E["전극 C-rate 저장소"]
    E --> F["선택 CYC에 적용"]
    F --> H["Fig / 보고서 정리"]
```

---

## 폴더 구조

```text
battery-data-portal/
├─ public/
│  ├─ index.html      # 사용자가 보는 메인 화면입니다.
│  ├─ app.js          # 업로드, 계산, 저장, 분석 화면 동작을 담당합니다.
│  └─ style.css       # 화면 색상, 여백, 카드, 표 디자인을 담당합니다.
├─ backend/
│  ├─ parsers/        # CSV, Excel, WRD, SEO 파일별 Parser입니다.
│  ├─ schemas/        # BDF 표준 컬럼과 품질 규칙입니다.
│  ├─ analysis/       # retention, dQ/dV, DVA, EIS 등의 분석 모듈입니다.
│  └─ storage_layout.py # raw/parsed/analysis/figure/report 객체 경로입니다.
├─ harvester/         # 장비 PC 자동 업로드 수집기와 설정 예시입니다.
├─ docs/
│  ├─ ARCHITECTURE_V0.15.md # 데이터 계층, 권한, 운영 구조입니다.
│  └─ HARVESTER.md          # 장비 PC 설치 방법입니다.
│
├─ scripts/
│  ├─ export_ppt.py   # PPT 내보내기 실험용 스크립트입니다.
│  ├─ inspect_file.py # 파일 구조를 확인하는 보조 스크립트입니다.
│  └─ inspect_manual.py
│
├─ python_backend.py      # FastAPI 백엔드 서버입니다.
├─ start_local_server.py  # Windows에서 로컬 서버를 쉽게 실행하기 위한 파일입니다.
├─ requirements.txt       # Python 실행에 필요한 패키지 목록입니다.
├─ package.json           # Node 기반 실행/검사용 설정입니다.
├─ render.yaml            # Render 배포 설정 예시입니다.
├─ railway.json           # Railway 배포 설정 예시입니다.
├─ fly.toml               # Fly.io 배포 설정 예시입니다.
└─ VERSION                # 현재 포털 버전입니다.
```

쉽게 말하면 **`public`은 화면**, **`python_backend.py`는 서버**, **DB는 저장 공간**입니다.

---

## 실행 방법

### 1. Python 패키지 설치

```powershell
pip install -r requirements.txt
```

### 2. FastAPI 서버 실행

```powershell
python python_backend.py
```

### 3. 브라우저에서 접속

```text
http://localhost:4173
```

---

## API 흐름

화면에서 버튼을 누르면 JavaScript가 FastAPI 백엔드로 요청을 보냅니다. 백엔드는 데이터를 DB에 저장하거나 다시 불러와 화면에 전달합니다.

```text
사용자 브라우저 (public/)
        |
        v
Render / FastAPI (python_backend.py)
        |---- Neon PostgreSQL: 계정, 권한, Dataset/Fig 메타데이터
        |---- private Backblaze B2: 원본 파일, Fig 재생성용 정규화 데이터
        `---- Windows archive agent: SHA-256 검증 원본 백업
```

| Method | Endpoint | 용도 |
|---|---|---|
| GET | `/api/health` | 서버 상태 확인 |
| GET | `/api/datasets` | 저장된 데이터 목록 조회 |
| GET | `/api/datasets/{id}/comparison-series` | 권한 확인 후 CYC 비교용 사이클·용량 점만 조회 |
| POST | `/api/datasets` | 새 데이터 저장 |
| PATCH | `/api/datasets/{id}` | 기존 데이터 수정 |
| DELETE | `/api/datasets/{id}` | 데이터 삭제 |
| POST | `/api/ai-summary` | 선택 데이터 핵심값 계산 후 AI 해석 생성 |
| POST | `/api/feedback` | 수정 요청과 의견 저장 |

---

## 저장소 운영 방향

현재 로컬 개발에서는 SQLite를 기본으로 사용합니다.

```text
data/portal.sqlite3
```

다른 컴퓨터에서도 로그인만 하면 같은 데이터를 볼 수 있게 하려면 PostgreSQL과 클라우드 저장소를 연결합니다.

운영 구조는 **Neon에는 계정·Dataset/Fig 메타데이터만**, **Backblaze B2에는 원본과 Fig용 정규화 데이터**, **관리자 Windows 작업공간에는 검증된 원본 백업**을 두는 방식입니다. 저장된 Fig를 열 때 포털은 B2의 정규화 데이터를 다시 불러오므로 다른 컴퓨터에서도 과거 Fig를 확인할 수 있습니다. 설정 순서는 [B2 + Neon + 로컬 작업공간 안내](./docs/B2_LOCAL_ARCHIVE.md)를 따릅니다.

```text
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME
JWT_SECRET=long_random_secret
ALLOW_LEGACY_USER_HEADER=false
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.5
OPENAI_REASONING_EFFORT=low
```

로컬에서는 프로젝트 폴더의 `.env` 파일에 `OPENAI_API_KEY=...` 값을 넣으면 됩니다. `.env`는 `.gitignore`에 들어가 있으므로 GitHub에는 올라가지 않습니다.
직접 입력이 불편하면 PowerShell에서 아래 명령으로 키를 안전하게 입력할 수 있습니다.

```powershell
.\scripts\set_openai_key_local.ps1
```

| 저장 계층 | 사용 기술 | 담당 데이터 |
|---|---|---|
| 로컬 개발 | SQLite + `data/uploads` | 내 컴퓨터에서만 사용하는 계정, 메타데이터, 파일 |
| 운영 메타데이터 | Neon PostgreSQL | 계정, 권한, 조직, Dataset/Fig 인덱스, `rowCount`, B2 객체 키 |
| 운영 파일 | private Backblaze B2 | 원본 파일과 과거 Fig를 다시 여는 데 필요한 정규화 데이터 |
| 장기 원본 백업 | Windows archive agent | 크기와 SHA-256을 검증한 관리자 작업공간 원본 복사본 |

---

## GitHub에 올리지 않는 파일

실험 원본 파일, DB, 로그는 개인정보나 연구 데이터가 들어갈 수 있으므로 GitHub에 올리지 않습니다.

- `data/*.sqlite3`
- `data/uploads/`
- `*.log`
- `__pycache__/`
- `.env`

---

## 개발 로드맵

| 버전 | 목표 |
|---|---|
| v0.01 | 로컬 포털, CYC 편집, 전극 계산, 저장소, AI 요약 페이지 |
| v0.02 | OpenAI API 기반 AI 요약, 수정 요청 저장, 사용자별 저장 데이터 분리 |
| v0.03 | 로컬 JWT 만료/변경 시 파일 분석이 막히지 않도록 인증 호환성 보강 |
| v0.04 | 관리자 계정 qq035786 고정 및 배포 환경변수 기반 비밀번호 반영 |
| v0.05 | 전극 C-rate 계산기 8칸 확장 및 저장소 연동 |
| v0.06 | PostgreSQL 운영 DB와 Supabase/S3 파일 저장소 연결 안정화 |
| v0.07 | PPT/보고서 자동 내보내기 고도화 |
| v0.10 | 연구실 내부 공유용 웹 배포 |

---

## 현재 개발 메모

- 전극 C-rate 저장소는 먼저 브라우저 `localStorage` 기반으로 동작합니다.
- 선택한 CYC 데이터에 전극 계산값을 넣으면 데이터 객체에 계산 정보가 함께 저장됩니다.
- AI 요약 메뉴와 전용 화면은 v0.1.12에서 제거했습니다. 기존 데이터는 보존되며, 남아 있는 백엔드 호환 API는 포털 화면에서 호출하지 않습니다.

---

## 한 줄 요약

**Battery Data Portal은 배터리 실험 데이터를 올리고, 계산하고, 정리하고, 나중에 보고서와 논문용 결과로 연결하기 위한 연구 워크플로우 포털입니다.**
