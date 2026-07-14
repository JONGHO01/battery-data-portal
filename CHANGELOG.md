# Changelog

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
- Dataset 묶음, 셀 메타데이터, 프로토콜 구간, 피겨 및 AI 보고서 저장 구조를 추가했습니다.


## v0.13 - 2026-07-13
- Project -> Campaign -> Cell 계층 구조와 기존 데이터 자동 연결을 추가했습니다.


## v0.12 - 2026-07-10
- CYC XLS/WRD 컬럼 매칭과 Ah/g 단위 변환을 보정


## v0.11 - 2026-07-10
- EIS Nyquist 피겨에 자동으로 표시되던 빨간 high f -> low f 주파수 방향 화살표를 제거했습니다.


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
- CYC/CV/EIS 피겨, 검색, 전극 계산, AI 요약, 엑셀 표 수정 기능을 개발 버전으로 정리했습니다.
