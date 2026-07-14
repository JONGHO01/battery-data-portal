# 장비 PC 자동 업로드 Harvester

`harvester/portal_harvester.py`는 지정한 cycler export 폴더를 주기적으로 확인하고, 완전히 저장된 CYC/CV/EIS 파일만 Battery Data Portal로 보냅니다.

## 서버 준비

1. 배포 서버 환경 변수에 `HARVESTER_ENABLED=true`를 넣습니다.
2. 포털에서 로그인한 뒤 `POST /api/api-tokens`로 장비 PC 전용 토큰을 발급합니다. 토큰 원문은 발급 순간에만 표시됩니다.
3. 장비 PC에 Python 3.10 이상과 포털 저장소의 `harvester` 폴더를 둡니다.

## 장비 PC 설정

1. `harvester/config.example.json`을 복사해 `harvester/config.json`으로 만듭니다.
2. `serverUrl`과 `watchPaths`를 실제 값으로 바꿉니다.
3. PowerShell에서 토큰을 현재 창에만 설정합니다.

```powershell
$env:BATTERY_PORTAL_TOKEN = "발급받은_bdp_토큰"
python harvester/portal_harvester.py --config harvester/config.json
```

한 번만 점검하려면 다음처럼 실행합니다.

```powershell
python harvester/portal_harvester.py --config harvester/config.json --once
```

## 동작 원칙

- 파일 크기와 수정 시각이 `stableSeconds` 동안 변하지 않은 경우에만 전송합니다.
- 같은 파일 내용은 SHA-256 해시로 기록하여 다시 올리지 않습니다.
- 서버 오류나 네트워크 오류가 나면 점점 긴 간격으로 재시도합니다.
- 설정 파일과 GitHub에는 토큰을 저장하지 않습니다. `BATTERY_PORTAL_TOKEN` 환경 변수만 사용합니다.
- 서버는 일반 업로드와 동일하게 raw 파일, BDF 정규화 JSON, 데이터셋 메타데이터를 분리 저장합니다.
