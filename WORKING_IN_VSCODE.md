# VS Code 작업 안내

## 열기

VS Code에서 이 폴더를 열면 됩니다.

```text
C:\Users\user\Documents\Codex\2026-07-03\gks\work\battery-data-portal-deploy
```

## 실행

VS Code 상단 메뉴에서 `Terminal > Run Task...`를 누른 뒤 `Start Battery Data Portal`을 선택합니다.

서버가 켜지면 브라우저에서 아래 주소로 접속합니다.

```text
http://localhost:4173
```

로그인 기본값:

```text
ID: admin
PW: admin
```

## 백그라운드 실행

Windows에서 콘솔 없이 켜고 싶으면 아래 파일을 실행합니다.

```powershell
& "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\pythonw.exe" start_local_server.py
```

로그는 아래 파일에 남습니다.

```text
fastapi.out.log
fastapi.err.log
```

## 주요 파일

- `python_backend.py`: FastAPI 백엔드, JWT 로그인, SQLite/PostgreSQL 저장
- `start_local_server.py`: Windows 백그라운드 로컬 실행용 런처
- `public/index.html`: 화면 구조
- `public/style.css`: 디자인
- `public/app.js`: 프론트엔드 동작
- `data/portal.sqlite3`: 로컬 SQLite DB
- `data/uploads/`: 로컬 업로드 파일
- `render.yaml`: Render 배포용 기본 설정
- `DEPLOYMENT_SITE_PLAN.md`: 실제 사이트 운영 전환 설명

## 점검

VS Code에서 아래 작업을 실행할 수 있습니다.

- `Check JavaScript Syntax`
- `Check Python Syntax`

터미널에서 직접 실행할 때는 아래 명령도 사용할 수 있습니다.

```powershell
npm run check
npm run py:check
python python_backend.py
```
