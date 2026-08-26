# B2 + Neon + 로컬 작업공간 저장 구조

이 포털은 대용량 배터리 파일을 PostgreSQL에 중복 저장하지 않습니다.

| 위치 | 저장 내용 | 역할 |
|---|---|---|
| Neon PostgreSQL | 사용자, 권한, Dataset/Fig 메타데이터, 행 개수, B2 객체 키, 백업 상태 | 빠른 로그인·목록·검색 |
| Backblaze B2 비공개 버킷 | 업로드 원본(`raw`)과 Fig 재생성용 정규화 데이터(`parsed/normalized.json`) | 여러 컴퓨터에서 과거 Fig 열람 |
| 관리자 Windows 작업공간 | SHA-256 검증을 마친 원본 파일 사본 | B2 용량 관리와 장기 보관 |

로컬 백업 에이전트는 원본을 업로드한 직후부터 30분마다 대기열을 확인합니다. 따라서 B2가 임계치에 도달할 때까지 기다리지 않고 원본 사본을 먼저 확보합니다. PC가 꺼져 있거나 네트워크가 끊겨 있으면 다음 실행 때 이어서 처리합니다.

중요: 포털은 B2 파일을 자동 삭제하지 않습니다. 로컬 파일의 크기와 SHA-256이 모두 일치하면 관리자 화면에 `검증 완료`와 `정리 가능` 상태만 기록합니다. B2 원본 삭제는 관리자가 백업 위치를 확인한 후 별도로 결정해야 합니다. Fig에 필요한 `parsed/normalized.json`은 B2에 계속 남겨야 과거 Fig를 어느 컴퓨터에서든 열 수 있습니다.

## 1. Backblaze B2 준비

1. Backblaze B2에서 비공개 버킷을 만듭니다.
2. 이 버킷에만 읽기·쓰기 가능한 Application Key를 만듭니다.
3. 버킷의 S3 Endpoint와 Region을 기록합니다.
4. 공개 버킷이나 공개 URL은 사용하지 않습니다.

참고: [Backblaze B2 S3-compatible API](https://www.backblaze.com/docs/cloud-storage-s3-compatible-api), [Backblaze B2 가격](https://www.backblaze.com/cloud-storage/pricing)

## 2. Render 환경 변수

Render Web Service의 Environment에서 다음 값을 설정합니다. 실제 키 값은 GitHub 파일에 쓰지 않습니다.

```text
APP_ENV=production
DATABASE_URL=<Neon PostgreSQL connection string>
STORAGE_BACKEND=s3
REQUIRE_DURABLE_STORAGE=true
S3_BUCKET=<private B2 bucket name>
S3_ENDPOINT_URL=<B2 S3 endpoint>
S3_REGION=<B2 region>
S3_ACCESS_KEY_ID=<bucket-scoped key ID>
S3_SECRET_ACCESS_KEY=<bucket-scoped application key>
S3_FORCE_PATH_STYLE=true
DATABASE_ROWS_MODE=artifact
ARCHIVE_AGENT_TOKEN=<long random secret>
```

`ARCHIVE_AGENT_TOKEN`은 B2 키와 다른 긴 무작위 값이어야 합니다. 이 값은 Render와 관리자 PC의 백업 작업에만 동일하게 입력합니다.

배포 후 `/api/health`에서 다음을 확인합니다.

```text
database: postgresql
storage: s3
storageConfigured: true
```

## 3. Windows 자동 백업 등록

포털 프로젝트 폴더에서 PowerShell을 열고 다음을 실행합니다. `ArchiveRoot`는 실제 장기 보관 드라이브나 작업공간으로 바꿉니다.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install_archive_backup_task.ps1 `
  -PortalUrl "https://battery-data-portal-v2.onrender.com" `
  -ArchiveRoot "D:\BatteryPortalArchive" `
  -DeviceId "main-workspace"
```

실행 중 `ARCHIVE_AGENT_TOKEN`을 보이지 않게 입력합니다. 설치 스크립트는 다음을 수행합니다.

- `%LOCALAPPDATA%\BatteryPortal\archive-agent.env`에 설정을 저장합니다.
- 설정 파일 권한을 현재 Windows 사용자로 제한합니다.
- 로그인 시와 30분마다 실행되는 Windows 예약 작업을 등록합니다.
- 첫 백업 실행을 즉시 시작합니다.

백업 경로는 아래처럼 계정과 날짜별로 분리됩니다.

```text
D:\BatteryPortalArchive\<사용자>\2026\08\25\<Dataset ID>\<원본 파일명>
```

## 4. 상태 확인과 용량 관리

관리자 로그인 후 `로우 데이터 열람` 화면에서 다음을 확인합니다.

- B2에 등록된 원본 총용량
- 로컬 백업 대기 건수
- SHA-256 검증 완료 건수
- Dataset별 `대기 중 / 검증 완료 / 미등록` 상태

기본 관리 기준은 8 GiB 경고, 9 GiB 상한 준비선입니다. 실제 B2 계정 용량에 맞춰 `ARCHIVE_SOFT_LIMIT_BYTES`와 `ARCHIVE_HARD_LIMIT_BYTES`를 조정할 수 있습니다. 이 값은 경고와 관리 판단용이며 자동 삭제를 실행하지 않습니다.

## 5. 장애와 복구 원칙

- Neon 장애: 계정과 객체 연결 정보가 필요하므로 Neon 백업/복구가 먼저입니다.
- B2 원본 누락: 검증 완료된 로컬 원본을 같은 객체 키로 다시 업로드할 수 있습니다.
- B2 정규화 파일 누락: 과거 Fig가 열리지 않으므로 원본에서 다시 파싱해 `parsed/normalized.json`을 복구해야 합니다.
- 관리자 PC가 꺼짐: 포털 업로드와 Fig 열람은 계속되며, PC가 다시 켜질 때 원본 백업이 이어집니다.
