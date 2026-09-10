# FastAPI Backend

배터리 데이터 포탈의 현재 기본 백엔드는 `python_backend.py`입니다.

```text
브라우저
→ public/app.js
→ FastAPI /api/*
→ SQLite 또는 PostgreSQL
→ local uploads 또는 Supabase/S3 Storage
```

## 로컬 실행

```powershell
cd C:\Users\user\Documents\Codex\2026-07-03\gks\work\battery-data-portal-deploy
python python_backend.py
```

브라우저 주소:

```text
http://localhost:4173
```

## 관리자 계정

관리자 아이디는 아래 값으로 맞춥니다.

```text
qq035786
```

로컬에서는 `.env`에 `BOOTSTRAP_ADMIN_PASSWORD`를 넣으면 서버 시작 시 해당 비밀번호가 관리자 계정에 반영됩니다.

배포 환경에서는 GitHub 파일에 비밀번호를 적지 말고 Render, Railway, Fly.io의 환경변수 또는 Secrets 메뉴에 넣습니다.

```text
BOOTSTRAP_ADMIN_ID=qq035786
BOOTSTRAP_ADMIN_NAME=원종호
BOOTSTRAP_ADMIN_PASSWORD=관리자 비밀번호
```

## DB 선택

`DATABASE_URL`이 없으면 로컬 SQLite를 사용합니다.

```text
data/portal.sqlite3
```

`DATABASE_URL`을 설정하면 PostgreSQL을 사용합니다.

```text
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME
```

## 주요 API

```http
POST /api/login
POST /api/register
GET /api/datasets
GET /api/datasets/{id}/comparison-series
POST /api/datasets
PATCH /api/datasets/{id}
DELETE /api/datasets/{id}
POST /api/inspect-file
POST /api/ai-summary
POST /api/feedback
GET /api/health
```

로그인 성공 후 프론트는 다음 헤더를 붙여 API를 호출합니다.

`GET /api/datasets/{id}/comparison-series`는 권한이 있는 CYC Dataset의 사이클·방전용량 점만 반환하며 원본 측정 행은 포함하지 않습니다.

```http
Authorization: Bearer <token>
```

로컬 개발 중 오래된 토큰이 남아 있는 경우를 대비해 `ALLOW_LEGACY_USER_HEADER=true`에서는 `X-User-Id`도 보조로 허용합니다. 운영 배포에서는 `ALLOW_LEGACY_USER_HEADER=false`를 유지합니다.
