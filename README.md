# Battery Data Portal

![Version](https://img.shields.io/badge/version-0.1.25-2f80ed)
![Frontend](https://img.shields.io/badge/frontend-HTML%20%2B%20CSS%20%2B%20JS-14a3a3)
![Backend](https://img.shields.io/badge/backend-FastAPI-ef5b72)
![Database](https://img.shields.io/badge/database-SQLite%20%2F%20PostgreSQL-4b6cb7)
![Status](https://img.shields.io/badge/status-research%20prototype-f4a261)

배터리 실험 데이터를 업로드하고, 검토하고, 논문/보고서용 Fig와 전극 계산표로 정리하기 위한 연구용 데이터 포털입니다.

현재 버전은 **v0.1.25**입니다. 처음에는 로컬 연구 보조 도구로 시작하고, 이후에는 로그인 기반 웹 서비스처럼 여러 컴퓨터에서 같은 데이터를 확인할 수 있는 구조로 확장하는 것을 목표로 합니다.

실제 사이트처럼 운영하려면 [PRODUCTION_RUNBOOK.md](./PRODUCTION_RUNBOOK.md)를 먼저 보면 됩니다. Render/Fly/Railway 서버, PostgreSQL DB, Supabase/S3 파일 저장소, OpenAI API, 도메인과 HTTPS까지 연결하는 순서를 한 번에 정리해두었습니다.

---

## 버전 이력

전체 변경 내역은 [CHANGELOG.md](./CHANGELOG.md)에서 관리합니다. 포털 관리자 화면의 `버전 이력`에서도 아래 최신 이력을 확인할 수 있습니다.

| 버전 | 날짜 | 핵심 변경 |
|---|---|---|
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
사용자 화면(public)
        ↓
JavaScript fetch 요청
        ↓
FastAPI 백엔드(python_backend.py)
        ↓
SQLite 또는 PostgreSQL DB
```

| Method | Endpoint | 용도 |
|---|---|---|
| GET | `/api/health` | 서버 상태 확인 |
| GET | `/api/datasets` | 저장된 데이터 목록 조회 |
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

| 단계 | 저장 방식 | 설명 |
|---|---|---|
| 로컬 개발 | `data/uploads` | 내 컴퓨터에서만 사용합니다. |
| 연구실 공유 | Supabase Storage | 로그인 기반 포털로 확장하기 좋습니다. |
| 운영 배포 | S3 계열 Storage | 장기 운영과 백업에 유리합니다. |

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
