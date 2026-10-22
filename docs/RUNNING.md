# 실행·저장 구조

> 문서 갱신: 2026-10-22. 저장소 코드 v0.3.13 / 최신 로컬 개발본 v0.3.20 Unreleased. 소스 동기화는 이번 문서 정리에 포함되지 않습니다.

## 두 실행 환경을 구분하세요

| 환경 | 처음 실행하는 GitHub 코드 | 이미 구성된 최신 연구실 포탈 |
|---|---|---|
| 시작점 | 새 clone, Python 3.12 가상환경 | 기존 소스·데이터·런처 설정 |
| 화면 | 계정 로그인형 Dataset·분석·Fig | 연구자·프로젝트·실험 관리와 연결 분석 |
| DB | 첫 실행에서 새 SQLite 생성 | 이미 검증·준비된 실험 관리 스키마 |
| 연구자료 | 포함되지 않음 | 해당 PC에서 별도 등록·보관 |
| 이름 선택·도우미 | 현재 main에는 없음 | 명시한 로컬 실행 옵션 필요 |

버전 파일이나 프론트엔드만 바꿔 최신 포탈로 만드는 방식은 지원하지 않습니다. 소스·스키마·권한·설정 호환성을 별도로 검증해야 합니다.

## 새 개발 환경

[README의 빠른 시작](../README.md#빠른-시작)을 새 폴더에서 따릅니다. 필수 실행 요소는 Python 서버·의존 패키지·브라우저입니다. 별도 React/Next.js 빌드나 Node 서버가 아닙니다.

README 명령은 `127.0.0.1:4174`에 바인딩합니다. `start_local_server.py`는 `.env`를 읽고 포트별 로그를 남기는 별도 런처입니다. 저장소 v0.3.13 백엔드의 기본 바인딩은 `0.0.0.0`이므로 처음 시험할 때는 README의 loopback 명령을 사용하고 네트워크에 공개하지 마세요.

운영 `SQLITE_DB`·`DATA_DIR`·클라우드 자격 설정이 있는 셸을 재사용하지 않습니다. 새 빈 개발 DB를 만드는 절차는 기존 연구 데이터 초기화·이관 절차가 아닙니다.

서버를 켠 뒤 별도 PowerShell에서 상태를 확인합니다:

```powershell
Invoke-RestMethod -Uri 'http://localhost:4174/api/health'
```

`ok`, `version`, 실제 DB·파일 저장 방식의 상태를 확인합니다. 응답이 온다는 것만으로 연구자료 복구나 클라우드 연결이 입증되지는 않습니다. 새 개발용 JWT 서명값을 만들었다면 이전 토큰은 다시 사용할 수 없습니다.

## 기존 연구실 포탈

구성된 연구실 PC에서는 기존 프로젝트의 런처를 사용합니다:

```powershell
.\scripts\start_battery_portal_v2.ps1 -Port 4174
```

최신 로컬 소스의 연구자 선택 옵션은 다음 형태입니다. `<existing-account-id>`는 검증된 기존 저장 계정 ID로 바꾸어야 하며 새 계정을 만드는 옵션이 아닙니다. **GitHub v0.3.13 런처에는 이 옵션이 없습니다.**

```powershell
.\scripts\start_battery_portal_v2.ps1 -Port 4174 -LocalResearcherOwnerId '<existing-account-id>'
```

별도 준비된 실험 관리 스키마·로컬 SQLite·파일 저장소·loopback 환경이 필요합니다. 전체 조회자·도우미의 기존 프로세스 옵션도 보존해야 합니다. 이 문서는 새 환경에서 스키마를 임의 적용하는 명령을 제공하지 않습니다.

런처는 건강한 기존 서버를 재사용하고 알 수 없는 포트 점유 프로세스를 종료하지 않습니다. 기존 서버 재시작은 최신 백업·검증과 별도 승인을 거칩니다. 실행 정책에 막히면 전역 정책을 변경·우회하지 말고 승인된 실행 경로를 확인하세요.

## 저장 위치와 호스팅

```text
로컬
  SQLite: 계정·메타데이터·연결·이력
  로컬 파일: 원본·파싱 결과·첨부

호스팅 구성
  PostgreSQL: 계정·권한·Dataset/Fig 메타데이터
  비공개 객체 저장소: 원본·정규화 데이터·지원 아티팩트
  선택적 Windows 백업 에이전트: 검증된 원본 사본
```

경로는 `SQLITE_DB`, `DATA_DIR` 등 설정에 따라 다릅니다. `.env.example`은 변수 예시이지 실제 값이나 운영 안전 설정의 증명이 아닙니다.

호스팅은 [B2 + PostgreSQL 안내](B2_LOCAL_ARCHIVE.md)와 [저장소 점검표](RENDER_STORAGE_CHECKLIST.md)를 함께 확인합니다. 연결 문자열·비공개 키·강한 고정 서명값은 호스팅 비밀 설정으로 관리합니다. 휘발성 컨테이너를 연구 원본의 유일한 저장소로 사용하지 않습니다.

Render의 commit 자동 배포 설정이 켜져 있으면 문서 commit도 빌드를 유발할 수 있습니다. GitHub 반영과 배포·DB/파일 연결 확인은 별개입니다. 이번 문서 작업은 호스팅 설정이나 로컬 포탈을 바꾸지 않습니다.

## 개발과 검증

| 경로 | 역할 | 현재 GitHub 코드 |
|---|---|---|
| `public/index.html`, `app.js`, `style.css` | 화면·라우팅·그래프·편집 | 포함 |
| `python_backend.py` | FastAPI, 인증, 저장·분석 API, 화면 제공 | 포함 |
| `backend/parsers/`, `schemas/` | 파싱·표준 컬럼·검토 | 포함 |
| `backend/analysis/` | CYC·EIS 등 수치 분석 | 포함 |
| `backend/data_workspace*.py` | 기존 Dataset 관리·전처리 | 포함 |
| `public/experiment-workspace.js`, `backend/experiment_*.py` | 최신 실험 관리 | 로컬 개발본만 |
| `public/portal-assistant.js`, `backend/*assistant*.py` | 최신 전역 도우미·연결 경계 | 로컬 개발본만 |
| `scripts/`, `tests/`, `harvester/` | 실행 보조·검사·선택적 수집기 | 버전별 구성 다름 |

기본 문법 검사 예시:

```powershell
node --check public/app.js
& .\.venv\Scripts\python.exe -m py_compile python_backend.py
```

수치·권한·파일 생명주기 변경은 관련 합성 검사를 함께 수행합니다. 운영 DB·실제 연구 원본을 시험 자료로 연결하지 않습니다. 최신 로컬 전체 소스 업로드에는 기존 회귀 실패 해소가 남아 있습니다. 이번 문서의 링크·경로 검사만으로 전체 테스트 통과를 주장하지 않습니다.

## 자주 생기는 혼동

| 증상 | 확인할 것 |
|---|---|
| HTML만 열었는데 저장·목록이 안 됨 | 파일 직접 열기 대신 Python 서버의 HTTP 주소 사용 |
| clone에 실험 관리·SEM·도우미가 없음 | 코드 버전 차이; README 제공 기준 확인 |
| `LocalResearcherOwnerId`가 인식되지 않음 | v0.3.13 런처에는 없는 최신 옵션 |
| 연구실과 새 clone의 목록이 다름 | 소스만 복제되며 DB·파일·계정은 자동 동기화되지 않음 |
| 이전/새 버전 화면이 섞임 | 작업 저장 후 health 버전·브라우저 정적 파일 확인 |
| 외부 AI가 연구자료를 모른다고 함 | 로컬 자료 조회와 동의 기반 일반 질문은 별도 경로 |
| 포트 사용 중·기동 실패 | 기존 서비스·포트별 오류 로그 확인; 임의 종료 금지 |

## 저장소에 넣지 않는 것

실제 `.env`·키·토큰·DB와 WAL/SHM, 장비 원본·연구 사진, 업로드 저장소, 백업·삭제 격리본·작업 영수증, 개인별 등록 규칙·세션 메모를 새 배포물에 포함하지 않습니다. `.gitignore`만 믿지 말고 파일별 목록과 내용을 확인하세요.
