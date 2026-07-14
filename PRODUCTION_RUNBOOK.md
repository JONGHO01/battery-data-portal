# Battery Data Portal 실제 사이트 운영 안내

이 문서는 배터리 데이터 포탈을 연구실 내부용 또는 실제 사이트처럼 운영하기 위한 실행 순서입니다.

목표 구조는 아래와 같습니다.

```text
사용자 브라우저
→ Render / Fly.io / Railway 같은 서버
→ PostgreSQL DB
→ Supabase Storage 또는 S3 파일 저장소
→ OpenAI API
→ 도메인 + HTTPS
```

## 1. 현재 프로젝트에서 준비된 것

- `python_backend.py`: FastAPI 백엔드입니다. 로그인, 저장, 조회, 수정, 삭제, 파일 분석, AI 요약 API가 들어 있습니다.
- `public/`: 사용자가 보는 HTML/CSS/JavaScript 화면입니다.
- `render.yaml`: Render에서 Web Service와 PostgreSQL을 같이 만들기 위한 Blueprint 설정입니다.
- `Dockerfile`: Render, Fly.io, Railway에서 서버를 실행하기 위한 포장 파일입니다.
- `requirements.txt`: FastAPI, PostgreSQL 드라이버, Supabase/S3 업로드용 `boto3`가 들어 있습니다.
- `.env.example`: 로컬 또는 배포 환경에 넣어야 하는 환경변수 예시입니다.

## 2. Render로 배포하는 가장 빠른 방법

1. GitHub에 현재 폴더를 올립니다.
2. Render에서 `New +` → `Blueprint`를 선택합니다.
3. GitHub 저장소 `battery-data-portal`을 연결합니다.
4. `render.yaml`을 감지하면 그대로 진행합니다.
5. Render가 Web Service와 PostgreSQL DB를 같이 만듭니다.
6. 배포 후 서비스의 `Environment` 메뉴에서 아래 비밀값을 채웁니다.

현재 `render.yaml`은 비용이 바로 생기지 않도록 Web Service와 PostgreSQL을 `free`로 시작합니다. 장기 운영을 하려면 Render 무료 DB의 제한을 확인한 뒤 DB를 `basic-256mb` 이상으로 올리는 것이 좋습니다.

## 3. Render 환경변수

`render.yaml`이 자동으로 만드는 값:

```text
DATABASE_URL
JWT_SECRET
APP_ENV=production
BOOTSTRAP_ADMIN_ID=qq035786
BOOTSTRAP_ADMIN_NAME=원종호
STORAGE_BACKEND=supabase
S3_FORCE_PATH_STYLE=true
ALLOW_LEGACY_USER_HEADER=false
OPENAI_MODEL=gpt-5.5
OPENAI_REASONING_EFFORT=low
```

직접 넣어야 하는 값:

```text
BOOTSTRAP_ADMIN_PASSWORD=관리자 비밀번호
OPENAI_API_KEY=OpenAI에서 발급받은 API 키

S3_BUCKET=Supabase Storage 버킷 이름
S3_ENDPOINT_URL=https://프로젝트REF.storage.supabase.co/storage/v1/s3
S3_REGION=auto
S3_ACCESS_KEY_ID=Supabase S3 Access Key
S3_SECRET_ACCESS_KEY=Supabase S3 Secret Key
S3_PUBLIC_BASE_URL=선택값. 공개 파일 주소를 따로 쓰고 싶을 때만 입력
```

중요합니다. `OPENAI_API_KEY`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`는 GitHub 파일에 적으면 안 됩니다. Render 환경변수에만 넣어야 합니다.
`BOOTSTRAP_ADMIN_PASSWORD`도 GitHub 파일에 적지 말고 Render 환경변수에만 넣습니다.

## 4. Supabase Storage 준비

1. Supabase에서 새 프로젝트를 만듭니다.
2. `Storage` 메뉴로 들어갑니다.
3. 버킷을 만듭니다. 예: `battery-uploads`
4. S3 Access Key를 생성합니다.
5. Render 환경변수에 아래처럼 연결합니다.

```text
S3_BUCKET=battery-uploads
S3_ENDPOINT_URL=https://프로젝트REF.storage.supabase.co/storage/v1/s3
S3_REGION=auto
S3_ACCESS_KEY_ID=생성한 access key
S3_SECRET_ACCESS_KEY=생성한 secret key
```

## 5. OpenAI API 연결

OpenAI API 키를 Render 환경변수에 넣으면 AI 요약이 실제 AI 모델을 호출합니다.

```text
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.5
OPENAI_REASONING_EFFORT=low
```

API 키가 비어 있으면 사이트는 멈추지 않고 로컬 계산 기반 요약으로 fallback됩니다.

## 6. 도메인 + HTTPS

Render에서:

1. 서비스 상세 페이지로 갑니다.
2. `Settings` → `Custom Domains`로 갑니다.
3. 사용할 도메인을 추가합니다.
4. Render가 보여주는 DNS 값을 도메인 업체에 입력합니다.
5. DNS가 전파되면 Render가 HTTPS 인증서를 자동으로 붙입니다.

## 7. 배포 후 확인 순서

배포 주소가 `https://battery-data-portal.onrender.com`이라면 아래를 확인합니다.

```text
https://battery-data-portal.onrender.com/api/health
```

정상 예시는 이런 느낌입니다.

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

확인할 것:

- `database`가 `postgresql`이면 운영 DB 연결 성공입니다.
- `storageConfigured`가 `true`이면 Supabase/S3 설정이 들어간 상태입니다.
- `openai`가 `configured`이면 실제 AI 요약을 쓸 수 있습니다.

## 8. 운영 전 필수 점검

- 관리자 비밀번호를 바꿉니다.
- Render 환경변수 `BOOTSTRAP_ADMIN_PASSWORD`가 들어갔는지 확인합니다.
- `ALLOW_LEGACY_USER_HEADER=false` 상태를 유지합니다.
- 무료 Render PostgreSQL은 장기 보존용으로 쓰기 전에 제한과 만료 정책을 확인합니다.
- PostgreSQL 백업 정책을 확인합니다.
- Supabase Storage 버킷 권한을 확인합니다.
- 공개 사이트라면 사용자 가입을 제한할지 정합니다.
- 연구 데이터가 민감하면 저장 파일 공개 URL을 쓰지 말고 비공개 버킷으로 운영합니다.

## 9. Railway 또는 Fly.io로 갈 때

Railway:

- GitHub 저장소 연결
- PostgreSQL 서비스 추가
- `DATABASE_URL`, `OPENAI_API_KEY`, `S3_*` 환경변수 설정
- Dockerfile 배포

Fly.io:

- `fly.toml` 사용
- Fly Postgres 또는 외부 PostgreSQL 연결
- `fly secrets set OPENAI_API_KEY=...` 방식으로 비밀값 설정
- `fly deploy`

처음 운영은 Render Blueprint가 가장 단순합니다. 서비스와 PostgreSQL을 한 번에 만들 수 있기 때문입니다.

## 10. 장기 운영으로 올릴 때

무료 배포가 성공한 뒤 실제 연구실 서비스로 오래 운영하려면 `render.yaml`의 값을 이렇게 바꿉니다.

```yaml
services:
  - type: web
    plan: starter

databases:
  - name: battery-data-portal-db
    plan: basic-256mb
    connectionPool: pgbouncer
```

이렇게 하면 무료 테스트보다 안정적이지만 비용이 생길 수 있습니다. 결제 전에는 Render 가격표를 확인하세요.
