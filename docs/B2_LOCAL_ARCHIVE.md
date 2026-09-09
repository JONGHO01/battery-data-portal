# B2 + Neon + 로컬 작업공간 저장 구조

이 포털은 대용량 배터리 파일을 PostgreSQL에 중복 저장하지 않습니다.

| 위치 | 저장 내용 | 역할 |
|---|---|---|
| Neon PostgreSQL | 사용자, 권한, Dataset/Fig 메타데이터, 행 개수, B2 객체 키, 백업 상태 | 빠른 로그인·목록·검색 |
| Backblaze B2 비공개 버킷 | 업로드 원본(`raw`)과 Fig 재생성용 정규화 데이터(`parsed/normalized.json`) | 여러 컴퓨터에서 과거 Fig 열람 |
| 관리자 Windows 작업공간 | SHA-256 검증을 마친 원본 파일 사본 | 장기 보관과 B2 용량 관리 |

```text
사용자 브라우저 -> Render 포탈 -> Neon PostgreSQL
                              -> private Backblaze B2
private Backblaze B2 -> 짧은 유효기간의 다운로드 URL -> 관리자 Windows 백업
```

로컬 백업 에이전트는 B2 용량이 임계치에 도달할 때까지 기다리지 않습니다. 새 원본이 대기열에 들어오면 로그인 시와 30분마다 순차적으로 복사하며, 크기와 SHA-256이 일치한 파일만 `검증 완료`로 기록합니다. 관리자 PC가 꺼져 있거나 네트워크가 끊기면 다음 실행에서 이어서 처리합니다.

중요: 포털은 B2 파일을 자동 삭제하지 않습니다. 검증 완료 후에도 관리자 화면에는 `정리 가능` 상태만 표시합니다. Fig에 필요한 `parsed/normalized.json`은 B2에 계속 남겨야 어느 컴퓨터에서든 과거 Fig를 열 수 있습니다.

## 1. 노트북에서 Backblaze B2 준비

관리자 컴퓨터에서 Backblaze 관리 사이트가 차단되어도 괜찮습니다. 계정·버킷·키 생성과 Render 설정은 접속 가능한 노트북에서 하고, 실제 업로드는 노트북이 아니라 Render 서버가 수행합니다.

1. Backblaze 계정을 만들고 B2 Cloud Storage를 활성화합니다.
2. 비공개 버킷을 하나 만듭니다. 권장 이름은 `battery-data-portal-private`입니다.
3. 버킷 상세 화면에서 S3 Endpoint와 Region을 정확히 기록합니다.
4. `Application Keys`에서 새 키를 만들고 이 버킷 하나만 선택합니다.
5. 권한은 `Read and Write`로 지정합니다. master application key는 사용하지 않습니다.
6. 생성 직후 한 번만 표시되는 `keyID`와 `applicationKey`를 암호 관리자 등에 안전하게 보관합니다.

S3 연결 값은 다음처럼 대응합니다.

```text
keyID          -> S3_ACCESS_KEY_ID
applicationKey -> S3_SECRET_ACCESS_KEY
Endpoint       -> https://s3.<B2_REGION>.backblazeb2.com
Region         -> <B2_REGION>
```

키나 키가 보이는 화면을 채팅, 스크린샷, GitHub, 문서에 올리지 않습니다. 버킷의 Public 설정도 켜지 않습니다.

공식 자료: [B2 S3-compatible API](https://www.backblaze.com/docs/en/cloud-storage-call-the-s3-compatible-api), [B2 연동용 키 생성](https://www.backblaze.com/docs/en/cloud-storage-get-started-with-a-backblaze-integration), [B2 가격](https://www.backblaze.com/cloud-storage/pricing)

## 2. 관리자 컴퓨터의 B2 파일 서버 연결 확인

관리자 컴퓨터에서 `https://s3.us-west-004.backblazeb2.com` 같은 B2 S3 주소를 열었을 때 XML `AccessDenied` 또는 `Unauthenticated requests are not allowed`가 나오면 네트워크 연결은 정상입니다. 인증정보 없이 접속했기 때문에 B2가 요청을 거절한 정상 응답입니다.

한국기계연구원 차단 페이지가 나오면 실제 B2 파일 주소도 차단된 것이므로, 자동 백업을 노트북에서 실행하거나 포탈의 백업 다운로드 경로를 Render 프록시 방식으로 별도 변경해야 합니다.

## 3. 노트북에서 Render 환경 변수 등록

Render Web Service의 `Environment`에 다음 값을 직접 입력합니다. 실제 키 값은 GitHub 파일에 쓰지 않습니다.

```text
APP_ENV=production
DATABASE_URL=<Neon PostgreSQL connection string>
STORAGE_BACKEND=s3
REQUIRE_DURABLE_STORAGE=true
S3_PROVIDER=b2
S3_BUCKET=<private B2 bucket name>
S3_ENDPOINT_URL=https://s3.<B2_REGION>.backblazeb2.com
S3_REGION=<B2_REGION>
S3_ACCESS_KEY_ID=<bucket-scoped keyID>
S3_SECRET_ACCESS_KEY=<bucket-scoped applicationKey>
S3_FORCE_PATH_STYLE=true
S3_PUBLIC_BASE_URL=
DATABASE_ROWS_MODE=artifact
ARCHIVE_AGENT_TOKEN=<B2 키와 다른 긴 무작위 값>
```

`S3_PUBLIC_BASE_URL`은 비워서 버킷을 비공개로 유지합니다. `ARCHIVE_AGENT_TOKEN`은 B2 키와 다른 긴 무작위 값이어야 하며 Render와 관리자 PC의 백업 작업에만 동일하게 입력합니다.

배포 후 `/api/health`에서 다음을 확인합니다.

```text
environment: production
database: postgresql
storage: s3
storageProvider: b2
storageConfigured: true
storageMissingVariables: []
databaseRowsMode: artifact
archiveAgentConfigured: true
```

## 4. Windows 자동 백업 등록

포털 프로젝트 폴더에서 PowerShell을 열고 다음을 실행합니다. `ArchiveRoot`는 실제 장기 보관 드라이브나 작업공간으로 바꿉니다.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install_archive_backup_task.ps1 `
  -PortalUrl "https://battery-data-portal-v2.onrender.com" `
  -ArchiveRoot "D:\BatteryPortalArchive" `
  -DeviceId "main-workspace"
```

실행 중 `ARCHIVE_AGENT_TOKEN`을 보이지 않게 입력합니다. 로컬 에이전트는 B2 키를 받지 않고 포털이 발급한 짧은 유효기간의 다운로드 URL만 사용합니다.

설치 스크립트는 다음을 수행합니다.

- `%LOCALAPPDATA%\BatteryPortal\archive-agent.env`에 설정을 저장합니다.
- 설정 파일 권한을 현재 Windows 사용자로 제한합니다.
- 로그인 시와 30분마다 실행되는 Windows 예약 작업을 등록합니다.
- 첫 백업 실행을 즉시 시작합니다.

백업 경로는 아래처럼 계정과 날짜별로 분리됩니다.

```text
D:\BatteryPortalArchive\<사용자>\2026\09\02\<Dataset ID>\<원본 파일명>
```

## 5. Fig 열람과 용량 관리

- 다른 사용자가 다른 컴퓨터에서 올린 원본과 정규화 데이터는 Render를 통해 B2에 저장됩니다.
- 포털의 Dataset/Fig 화면은 Render가 B2의 `parsed/normalized.json`을 읽어 제공하므로 관리자 컴퓨터가 Backblaze 관리 화면에 로그인할 필요가 없습니다.
- 관리자 원본 백업만 B2의 짧은 유효기간 다운로드 주소를 직접 사용합니다.
- 이미 SHA-256 검증이 끝난 파일은 다시 내려받지 않으므로 백업은 누적 전체 다운로드가 아니라 새 대기 항목 중심으로 동작합니다.

기본 관리 기준은 8 GiB 경고, 9 GiB 상한 준비선입니다. 이는 무료 10GB를 넘기기 전에 로컬 사본과 상태를 확인하기 위한 기준이며 자동 이동·삭제 기준이 아닙니다. 유료 용량을 사용하기로 하면 `ARCHIVE_SOFT_LIMIT_BYTES`와 `ARCHIVE_HARD_LIMIT_BYTES`를 실제 운영 한도에 맞게 올릴 수 있습니다.

Backblaze의 현재 공개 요금표상 첫 10GB 저장은 무료이고, 무료 범위를 넘는 저장량은 종량 과금됩니다. 월평균 저장량의 3배까지 인터넷 송신이 무료이므로, 전체 원본을 매번 다시 받지 않는 증분 백업 원칙을 유지합니다.

## 6. 장애와 복구 원칙

- Neon 장애: 계정과 객체 연결 정보가 필요하므로 Neon 백업/복구가 먼저입니다.
- B2 원본 누락: 검증 완료된 로컬 원본을 같은 객체 키로 다시 업로드할 수 있습니다.
- B2 정규화 파일 누락: 과거 Fig가 열리지 않으므로 원본에서 다시 파싱해 `parsed/normalized.json`을 복구해야 합니다.
- 관리자 PC가 꺼짐: 포털 업로드와 Fig 열람은 계속되며, PC가 다시 켜질 때 원본 백업이 이어집니다.
- Render 재배포: Neon과 B2가 정상이라면 계정, Dataset/Fig 목록, 원본과 정규화 데이터는 유지됩니다.

실서비스 연결이 끝나면 작은 시험 파일 하나로 `업로드 -> Dataset/Fig 저장 -> 다른 브라우저에서 다시 열기 -> 관리자 PC 백업 -> SHA-256 검증 완료`를 순서대로 확인합니다.
