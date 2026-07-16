# Current Task Notice

> This file preserves the historical v0.14 handoff below. It is not the current release record.
> Use `VERSION`, `CHANGELOG.md`, `docs/SESSION_MEMORY.md`, and the current source code as the source of truth.
> Current release at this update: `v0.1.10` (2026-07-15).

# Battery Data Portal 현재 작업 인수인계 (Historical v0.14)

마지막 정리일: 2026-07-13  
현재 로컬 주소: `http://localhost:4173/`  
현재 포탈 버전: `0.14`  
현재 FastAPI 버전: `0.0.14`  
현재 작업 폴더: `C:\Users\user\Documents\Codex\2026-07-03\gks\work\battery-data-portal-deploy`

## 1. 사용자가 원하는 최종 목표

사용자는 배터리 실험 데이터를 연구실에서 실제로 쓰는 웹 포탈처럼 운영하고 싶어 한다.

최종 목표는 다음 구조다.

```text
사용자 브라우저
→ Render / Fly.io / Railway 같은 서버
→ PostgreSQL 운영 DB
→ Supabase Storage 또는 S3 파일 저장소
→ OpenAI API 기반 AI 해석
→ 도메인 + HTTPS
```

포탈은 단순 파일 뷰어가 아니라, CYC/CV/EIS 데이터를 넣으면 자동 판별하고, 논문/PPT용 Fig와 전극 계산표, AI 요약, 검색, 저장, 사용자별 데이터 관리까지 되는 연구용 도구가 되어야 한다.

사용자는 코딩 초보자다. 설명은 반드시 쉬운 한국어로 해야 하고, “뭔가 해보세요” 식으로 돌리지 말고 가능한 것은 직접 확인하고 수정해야 한다.

## 2. 현재까지 작업한 내용

### 기본 구조

- 프론트엔드는 `public/index.html`, `public/app.js`, `public/style.css` 중심의 정적 HTML/JS/CSS 구조다.
- 백엔드는 `python_backend.py`의 FastAPI 서버다.
- 로컬 기본 DB는 SQLite다.
- `DATABASE_URL`이 있으면 PostgreSQL을 사용할 수 있도록 준비되어 있다.
- 업로드 저장소는 기본 `local`이고, 환경 변수 설정 시 Supabase/S3 계열 저장소를 사용할 수 있도록 준비되어 있다.
- 로컬 실행은 `start_local_server.py`로 한다.
- 현재 로컬 서버는 `http://localhost:4173/`에서 동작한다.

### v0.14 Dataset 중심 실험 기록 구조

- 최종 구조를 `Project -> Campaign -> Cell -> Dataset -> CYC/EIS/CV/Figures/Reports`로 확장했다.
- 기존 원본 데이터 테이블 `datasets`는 유지하고, 상위 묶음 테이블 `dataset_groups`를 추가했다.
- `cell_metadata`, `protocol_segments`, `figures`, `reports` 테이블과 API를 추가했다.
- 셀 기록 화면에서 양극/음극/분리막/Spacer/셀 형식/태그를 저장하고, formation·rate test·long cycling 같은 cycle 구간을 기록할 수 있다.
- Fig 저장 시 `figures` 라이브러리에 연결되고, AI 요약은 `AI 보고서 저장` 버튼으로 `reports`에 저장된다.
- 기존 17개 데이터는 8개 기본 Dataset 묶음으로 자동 이관됐다. 원본 데이터와 업로드 파일은 삭제하지 않았다.

### v0.13 실험 계층 구조

- 데이터 저장 구조를 `Project -> Campaign / Experiment batch -> Cell -> Dataset`으로 확장했다.
- `datasets` 테이블은 원본 행과 파일을 유지한 채 `project_id`, `campaign_id`, `cell_record_id` 연결값만 추가했다.
- `projects`, `campaigns`, `cells` 테이블과 `/api/hierarchy` API를 추가했다.
- 등록 화면에서 프로젝트와 실험 배치를 만들고 선택할 수 있다. 셀은 아래의 `셀 ID` 정보를 저장할 때 자동 등록되며, 같은 셀의 CYC/EIS/CV가 같은 경로 아래로 묶인다.
- 기존 데이터셋 17개는 자동 이관되어 모두 계층 연결값을 갖는다. 기존 데이터를 삭제하거나 업로드 원본을 이동하지 않았다.
- 이번 로컬 검증: `/api/health`는 `0.0.13`, `/api/datasets`의 17개 데이터 모두 계층 ID 3종을 포함한다.

### 주요 기능

- 로그인/회원가입/JWT 기반 인증 구조를 추가했다.
- 관리자 계정은 `qq035786`을 기준으로 맞췄다. 비밀번호는 코드나 문서에 노출하지 말고 환경 변수 또는 사용자가 직접 설정하는 방식으로 유지해야 한다.
- 관리자는 사용자 목록과 의견함을 볼 수 있다.
- 일반 사용자는 자기 데이터만 보는 방향으로 분리되어 있다.
- CYC, CV, EIS 파일 자동 판별 기능을 추가했다.
- `.WRD`, `.SEO`, `.XLS`, `.XLSX`, `.XLSB`, `.CSV` 계열을 읽는 흐름을 만들었다.
- `.SEO` EIS 파일을 읽을 수 있도록 `scripts/inspect_file.py`에 바이너리 파서를 추가했다.
- CYC 파일은 `.XLS`, `.xlsx`, `.wrd` 샘플로 다시 검토했다.
- 파일 선택만으로 자동 분석하지 않게 바꾸고, 사용자가 `파일 분석` 버튼을 눌렀을 때 분석되게 했다.
- 큰 WRD 파일에서 브라우저 base64 변환 때문에 멈추는 문제를 줄이기 위해 `/api/inspect-upload` 원본 업로드 API를 사용하도록 바꿨다.
- CYC 표는 셀 편집, 행 추가, 선택 행 삭제, 저장, 되돌리기 흐름이 있다.
- Fig 비율/스타일 수정 기능이 있다.
- 전극 C-rate 계산기를 8칸으로 확장했다.
- 전극 C-rate 계산값 저장소를 만들었다. 저장한 값을 선택한 CYC 데이터에 넣을 수 있다.
- 검색 페이지, 저장 Fig 모음, AI 요약 페이지, 의견 남기기/관리자 의견함을 추가했다.
- AI 요약은 OpenAI API 키가 있으면 실제 API 기반 해석을 쓰고, 키가 없으면 로컬 계산 기반 fallback 요약을 보여준다.
- 하단 피드백 영역에서 누구나 수정 요청/의견을 남길 수 있다.
- 관리자 전용 의견함에서 의견을 볼 수 있다.
- GitHub 업로드용 정리와 Render 배포 파일을 준비했다.
- `render.yaml`, `fly.toml`, `railway.json`, `Dockerfile`, `.env.example`, `PRODUCTION_RUNBOOK.md` 등이 있다.

### 최근에 고친 중요한 문제

#### CYC 판독 재검토와 수정

최근 요청은 “CYC 데이터 제대로 읽는지 다시 한 번 검토해”였다.

검토 결과:

- 백엔드는 `.XLS`, `.xlsx`, `.wrd`를 모두 `type: cyc`, confidence `0.95`로 판정했다.
- 하지만 프론트에서 충전/방전 컬럼을 고르는 규칙이 헐거웠다.
- 특히 `discharge` 안에 `charge`가 들어 있어서 단순 포함 검색을 쓰면 충전/방전 컬럼이 섞일 수 있었다.
- 한국어 XLS의 `단위 방전 용량(Ah/g)`은 그래프용 `mAh g-1`로 쓰려면 1000배 변환이 필요했다.

수정 내용:

- `public/app.js`에 CYC 컬럼 선택 함수를 추가했다.
- 방전 전용 컬럼과 충전 전용 컬럼을 분리해서 고르게 했다.
- `Ah/g` 값은 `mAh g-1`로 1000배 변환되게 했다.
- `scripts/inspect_file.py` 검토 메시지도 `단위 방전 용량(Ah/g)` 기준으로 정확히 보이게 했다.
- WRD에서는 존재하지 않는 charge capacity를 억지로 채우지 않도록 했다.

검증 결과:

```text
XLS:
  rows 34
  cycle 1~35
  capacity column: 단위 방전 용량(Ah/g)
  capacity unit: mAh g-1
  capacity max: 168.21609

CYC XLSX:
  rows 65
  cycle 1~65
  capacity column: 단위 방전 용량(Ah/g)
  capacity unit: mAh g-1
  capacity max: 145.76999

WRD cyc_057:
  rows 10
  cycle 1~10
  capacity column: discharge capacity (mAh g-1)
  capacity range: 152~167 mAh g-1

WRD cyc_063:
  rows 12
  cycle 1~12
  capacity column: discharge capacity (mAh g-1)
  capacity range: 3.93~128 mAh g-1
```

문법 검증:

- `node --check public/app.js` 통과
- `python -m py_compile scripts/inspect_file.py python_backend.py` 통과
- `/api/health` 응답에서 `version: 0.0.13` 확인

## 3. 중요한 요구사항

- 사용자는 한국어 설명을 원한다.
- 사용자는 코딩 초보자이므로 “쉬운 말 + 바로 실행 가능한 단계”로 설명해야 한다.
- 페이지 디자인은 고급스럽고 연구실/대학원생이 만든 느낌이어야 한다.
- 색감은 파스텔톤을 좋아하지만, 한국기계연구원 느낌의 파란색/빨간색 계열도 선호한다.
- 검색창은 상단 메뉴처럼 각 기능 페이지로 갈 수 있어야 한다.
- 불필요한 검색칸은 제거하거나 줄여야 한다.
- 메뉴 드롭다운은 마우스를 아래로 내릴 때 바로 닫히면 안 된다.
- CYC 데이터가 EIS 페이지로 넘어가면 안 된다.
- 파일명 글자 수가 길어도 화면에서 잘 보여야 한다.
- 엑셀 표는 직접 수정 가능해야 하며, 되돌리기도 있어야 한다.
- 하단에 누구나 의견을 남길 수 있는 수정 요청 영역이 있어야 한다.
- 관리자는 다른 사용자의 회원가입/의견을 볼 수 있어야 한다.
- 다른 PC에서도 로그인만 하면 같은 데이터를 볼 수 있는 사이트를 최종 목표로 한다.
- OpenAI API를 이용한 실제 AI 요약 구조를 원한다.
- `OPENAI_API_KEY`가 없을 때는 앱이 깨지지 않고 fallback 요약을 보여야 한다.
- S3/Supabase 환경 변수가 없다고 파일 분석 자체가 막히면 안 된다. local fallback이 필요하다.
- 배포 사이트가 예전 포탈 화면을 보여주면 안 된다. GitHub 최신 코드와 Render 서비스가 같은 저장소/브랜치인지 확인해야 한다.
- 기능이 바뀌면 `battery-portal-versioning` 스킬에 따라 버전도 올려야 한다.

## 4. 수정한 파일 목록

주요 수정 파일:

- `public/index.html`
  - 상단 메뉴, AI 요약 페이지, 전극 계산/저장소, 의견함, 피드백 폼 등 화면 구조.

- `public/app.js`
  - 로그인 상태, 데이터 로딩, CYC/CV/EIS 판별 결과 처리.
  - 파일 분석 버튼 흐름.
  - CYC 표 편집/되돌리기.
  - Fig 생성/비율/스타일 수정.
  - 전극 C-rate 계산기 8칸.
  - 전극 C-rate 저장소.
  - AI 요약 호출/fallback.
  - 관리자 사용자 목록/의견함.
  - 최근 CYC 컬럼 매칭과 Ah/g 단위 변환 수정.

- `public/style.css`
  - 전체 포탈 디자인.
  - 메뉴/드롭다운/카드/표/피드백/관리자 화면 스타일.
  - 모바일 대응 일부.

- `python_backend.py`
  - FastAPI 서버.
  - SQLite/PostgreSQL 전환.
  - JWT 로그인.
  - 사용자별 데이터 저장.
  - 관리자 계정 bootstrap.
  - 피드백 API.
  - 파일 업로드 저장 local/S3/Supabase 구조.
  - `/api/inspect-upload`.
  - OpenAI 기반 AI 요약 API.

- `scripts/inspect_file.py`
  - CSV/XLS/XLSX/XLSB/WRD/SEO 파싱.
  - WRD CYC discharge summary 생성.
  - SEO EIS 파싱.
  - CYC validation 메시지.
  - 최근 단위 방전 용량(Ah/g)을 mAh g-1로 해석하도록 보정.

- `scripts/inspect_manual.py`
  - 매뉴얼/전극 관련 파일 검사.

- `scripts/export_ppt.py`
  - PPT export 관련 스크립트.

- `scripts/set_openai_key_local.ps1`
  - 로컬 OpenAI API 키 설정 도움 스크립트.

- `README.md`
  - 포탈 설명, 기능, 실행법, 운영 확장 방향.

- `CHANGELOG.md`
  - 버전별 변경 사항.

- `VERSION`
  - 현재 `0.14`.

- `render.yaml`
  - Render 배포 설정과 환경 변수 템플릿.

- `fly.toml`
  - Fly.io 배포 후보 설정.

- `railway.json`
  - Railway 배포 후보 설정.

- `Dockerfile`
  - 컨테이너 배포용.

- `.env.example`
  - 필요한 환경 변수 예시.

- `.gitignore`
  - `.env`, DB, 업로드 파일, 캐시, 로그 제외.

- `PRODUCTION_RUNBOOK.md`
  - 실제 사이트처럼 운영하기 위한 안내.

- `DEPLOYMENT_SITE_PLAN.md`
  - 배포 구조 계획.

- `GITHUB_UPLOAD_GUIDE.md`
  - GitHub 업로드 안내.

- `PYTHON_BACKEND.md`
  - Python 백엔드 설명.

- `WORKING_IN_VSCODE.md`
  - VS Code 작업 안내.

새로 추가한 파일:

- `docs/CURRENT_TASK.md`
  - 새 Codex 세션 인수인계 문서.

## 5. 아직 남은 작업

### 꼭 확인해야 할 것

- Render 배포 사이트가 현재 GitHub 최신 코드와 같은지 확인해야 한다.
- 배포 사이트가 예전 포탈 화면을 보여주면 Render 서비스가 잘못된 저장소/브랜치를 보고 있을 가능성이 높다.
- 배포 환경 변수에서 `STORAGE_BACKEND`, `DATA_DIR`, `JWT_SECRET`, `OPENAI_API_KEY`, `DATABASE_URL` 설정을 다시 확인해야 한다.
- 다른 PC에서 `.XLS`, `.WRD` 업로드 시 멈추는 문제가 재현되는지 확인해야 한다.
- S3/Supabase 설정이 없을 때도 local fallback으로 파일 분석이 되는지 배포 환경에서 확인해야 한다.

### 운영형 사이트로 가기 위해 남은 것

- PostgreSQL 운영 DB 연결.
- Supabase Storage 또는 S3 파일 저장소 실제 연결.
- Render/Fly/Railway 중 하나로 안정 배포.
- 도메인 연결.
- HTTPS 확인.
- 관리자 화면에서 신규 가입 사용자와 의견을 안정적으로 확인.
- 사용자별 데이터 권한 검증.
- 업로드 파일 보존 정책 설계.
- 백업/복구 정책 작성.

### 기능 개선 후보

- AI 요약 품질 개선:
  - OpenAI API에 더 좋은 prompt/context 전달.
  - 데이터 핵심값 계산을 더 풍부하게 만들기.
  - CYC/CV/EIS별로 다른 해석 템플릿 사용.
  - 비교 데이터가 여러 개일 때 변화율/성능 저하 구간 자동 설명.

- EIS 개선:
  - Nyquist/Bode 그래프의 이상치 제거 옵션.
  - 주파수 방향 화살표는 현재 제거됨. 사용자가 싫어했으므로 자동 표시하지 말 것.
  - `impedance.py` 기반 equivalent circuit fitting은 아직 본격 적용 전.

- CYC 개선:
  - C-rate 구간 추정 정확도 향상.
  - 전극 계산 저장값과 CYC 데이터 연결 UX 개선.
  - 엑셀 표 편집 후 Fig 즉시 반영 흐름 강화.

- GitHub/배포 흐름:
  - 사용자가 웹 GitHub 업로드를 어려워했다. 가능하면 zip 또는 git 명령 기반으로 안내하되, 초보자용 단계로 설명할 것.
  - `.vscode`, `__pycache__`, 로그, `.env`, `data/uploads`는 GitHub에 올리지 말 것.

## 6. 하면 안 되는 방식

- 사용자에게 빙빙 돌려 말하지 말 것.
- “아마 이럴 겁니다”만 말하고 검증 없이 끝내지 말 것.
- 파일을 수정해야 하는 요청인데 설명만 하고 끝내지 말 것.
- 사용자가 답답해할 때 같은 해결책을 반복하지 말 것.
- 비밀번호, OpenAI API 키, JWT secret을 코드나 문서나 GitHub에 쓰지 말 것.
- `.env`, 로컬 DB, 업로드된 실험 원본, 로그 파일을 GitHub에 올리지 말 것.
- `data/uploads` 전체를 무심코 삭제하지 말 것. 사용자가 명확히 요청하지 않으면 보존한다.
- 사용자가 만든 변경을 되돌리지 말 것.
- CYC 파일을 EIS로 넘기지 말 것.
- EIS 그래프에 `high f -> low f` 빨간 화살표를 자동 표시하지 말 것. 사용자가 제거를 원했다.
- 파일 선택 즉시 긴 분석을 시작하지 말 것. 사용자가 `파일 분석` 버튼을 누를 때 분석한다.
- 큰 WRD 파일을 브라우저 base64로 먼저 변환하는 방식으로 되돌리지 말 것.
- S3 환경 변수가 없다고 로컬 파일 분석이 막히게 만들지 말 것.
- GitHub 웹 업로드에서 파일을 루트에 낱개로 흩뿌리는 식으로 안내하지 말 것.
- 제품 기능 수정 후 버전 업데이트를 빼먹지 말 것.

## 7. 다음 Codex 세션에서 붙여넣을 프롬프트

아래 내용을 새 Codex 세션에 그대로 붙여넣으면 된다.

```text
한국어로 답해줘. 나는 코딩을 잘 모르는 초보자야.

작업 폴더는:
C:\Users\user\Documents\Codex\2026-07-03\gks\work\battery-data-portal-deploy

먼저 docs/CURRENT_TASK.md 파일을 읽고 현재 상태를 파악해줘.

내 최종 목표는 Battery Data Portal을 실제 사이트처럼 운영하는 거야.
구조는 사용자 브라우저 → Render/Fly/Railway 서버 → PostgreSQL DB → Supabase Storage 또는 S3 파일 저장소 → OpenAI API → 도메인 + HTTPS야.

현재 버전은 0.14이고, 로컬 주소는 http://localhost:4173/ 이야.

중요한 점:
- CYC, CV, EIS 데이터를 자동 판별하고 Fig를 만들 수 있어야 해.
- CYC 데이터가 EIS로 넘어가면 안 돼.
- XLS/XLSX/WRD CYC 파일에서 방전 용량, 충전 용량 컬럼이 섞이면 안 돼.
- Ah/g 단위는 그래프에서는 mAh g-1로 잘 보정되어야 해.
- 파일 선택만으로 분석하지 말고 파일 분석 버튼을 눌렀을 때 분석해야 해.
- S3_BUCKET 같은 환경 변수가 없어도 로컬 분석은 되어야 해.
- OpenAI API 키가 없으면 로컬 fallback 요약이 떠야 하고, 키가 있으면 실제 AI 요약이 되어야 해.
- 관리자 qq035786은 사용자 목록과 의견함을 볼 수 있어야 해. 비밀번호나 API 키는 문서/코드/GitHub에 쓰면 안 돼.
- 기능을 수정하면 battery-portal-versioning 스킬로 버전을 올려줘.

먼저 현재 서버 상태, VERSION, public/app.js, python_backend.py, scripts/inspect_file.py를 확인하고,
내가 요청하는 다음 작업을 바로 이어서 진행해줘.
```
# v0.15 Handoff Update (2026-07-13)

## What was completed in this task

- Added BDF canonical columns, parser routing for CSV/Excel/WRD/SEO, and non-destructive quality review.
- Added raw, parsed, analysis, figure-definition, and report-definition artifacts under the Project → Cell → Dataset storage layout.
- Added reproducible analysis modules: retention, dQ/dV, DVA, rate capability, pulse resistance, and EIS summary.
- Added distinct Upload, Explorer (search), Figure Builder (CYC/CV/EIS), Analysis Lab, and Organization entry points without removing the familiar existing workflow.
- Added the opt-in equipment-PC Harvester with hashed API tokens and a documented configuration template.
- Added Organization / Project / Campaign / Cell / Dataset sharing. `researcher` can upload and edit, while `viewer` can only read.
- Added the Organization UI for creating an organization, selecting it when creating a project, and managing member IDs/roles.

## Current verification

- `python -m unittest discover -s tests -v`: 25 tests passed.
- `node --check public/app.js`: passed.
- `python -m py_compile python_backend.py`: passed.

## Important operational limitation

The application code is ready for PostgreSQL and S3/Supabase-style storage, but those services are not created automatically. Production sharing across computers needs real cloud credentials and server environment variables. Do not put credentials, API tokens, `.env`, SQLite databases, upload files, or real Harvester config files in Git.

## Suggested next-session prompt

```text
Continue Battery Data Portal from docs/CURRENT_TASK.md and docs/ARCHITECTURE_V0.15.md.
Do not remove existing user data or redesign the working UI wholesale.
First verify the local server and the 25-test suite.
Then, if requested, continue with PostgreSQL/S3 production setup, SVG/PNG/PDF figure artifact export, email invitations/audit logs, or Harvester status monitoring.
Keep the Battery Portal version files synchronized whenever a visible feature changes.
```
