# 실제 사이트 운영 전환 계획

배터리 데이터 포탈은 로컬 연구 보조 도구에서 시작했지만, 이제는 여러 컴퓨터에서 로그인만 하면 같은 데이터를 볼 수 있는 사이트 구조로 확장할 수 있습니다.

## 목표 구조

```text
사용자 브라우저
→ Render / Fly.io / Railway 서버
→ FastAPI 백엔드
→ PostgreSQL DB
→ Supabase Storage 또는 S3 파일 저장소
→ OpenAI API
→ 도메인 + HTTPS
```

## 각 역할

| 구성 | 역할 |
|---|---|
| 사용자 브라우저 | 사용자가 보는 화면입니다. `public/index.html`, `public/app.js`, `public/style.css`가 담당합니다. |
| FastAPI 서버 | 로그인, 저장, 조회, 수정, 삭제, 파일 분석, AI 요약을 처리합니다. |
| PostgreSQL | 사용자 계정과 실험 데이터 정보를 저장합니다. |
| Supabase/S3 Storage | 업로드한 원본 파일을 서버 밖에 안전하게 저장합니다. |
| OpenAI API | 데이터 핵심값을 바탕으로 논문/PPT용 해석 문장을 생성합니다. |
| 도메인 + HTTPS | 사용자가 `https://내도메인.com`처럼 접속할 수 있게 합니다. |

## 현재 준비 상태

- FastAPI 백엔드 준비 완료
- PostgreSQL 연결 코드 준비 완료
- Supabase/S3 업로드 코드 준비 완료
- OpenAI API 기반 AI 요약 준비 완료
- Render Blueprint 설정 준비 완료. 기본값은 비용을 피하기 위해 무료 테스트용입니다.
- Fly.io, Railway 배포 파일 준비 완료

## Render 기준 운영 환경변수

자동 생성 또는 기본값:

```text
APP_ENV=production
DATABASE_URL=Render PostgreSQL에서 자동 연결
JWT_SECRET=Render가 자동 생성
ALLOW_LEGACY_USER_HEADER=false
BOOTSTRAP_ADMIN_ID=qq035786
BOOTSTRAP_ADMIN_NAME=원종호
STORAGE_BACKEND=supabase
S3_FORCE_PATH_STYLE=true
OPENAI_MODEL=gpt-5.5
OPENAI_REASONING_EFFORT=low
```

직접 입력해야 하는 값:

```text
BOOTSTRAP_ADMIN_PASSWORD=
OPENAI_API_KEY=
S3_BUCKET=
S3_ENDPOINT_URL=
S3_REGION=auto
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_PUBLIC_BASE_URL=
```

## 배포 후 확인

배포가 끝나면 아래 주소를 먼저 확인합니다.

```text
https://배포주소/api/health
```

기대 결과:

```json
{
  "ok": true,
  "environment": "production",
  "database": "postgresql",
  "storage": "supabase",
  "storageConfigured": true,
  "openai": "configured",
  "version": "0.0.2"
}
```

## 운영 우선순위

1. Render Blueprint로 서버와 PostgreSQL을 배포합니다.
2. Supabase Storage 버킷과 S3 키를 연결합니다.
3. OpenAI API 키를 넣어 실제 AI 요약을 켭니다.
4. `BOOTSTRAP_ADMIN_PASSWORD`를 Render 환경변수에 넣어 관리자 계정을 활성화합니다.
5. 도메인을 연결하고 HTTPS를 확인합니다.
6. 백업 정책과 사용자 가입 정책을 정합니다.

무료 배포가 안정적으로 확인되면 Web Service는 `starter`, PostgreSQL은 `basic-256mb` 이상으로 올리는 것을 검토합니다. 무료 DB는 장기 운영 전에 제한과 만료 정책을 반드시 확인해야 합니다.

상세한 클릭 순서와 값 입력 방법은 [PRODUCTION_RUNBOOK.md](./PRODUCTION_RUNBOOK.md)에 정리되어 있습니다.
