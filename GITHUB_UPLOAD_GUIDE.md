# GitHub 업로드 가이드

이 문서는 코딩을 잘 모르는 상태에서도 현재 배터리 포탈 수정본을 GitHub에 올릴 수 있게 만든 간단한 안내입니다.

## 지금 준비된 것

- 소스 코드 주석 보강
- 깨진 README 한글 복구
- GitHub에 올리면 안 되는 DB/업로드 파일 제외 설정
- 업로드용 압축 파일 생성

압축 파일 위치:

```text
C:\Users\user\Documents\Codex\2026-07-03\gks\outputs\battery-data-portal-github-ready.zip
```

## 가장 쉬운 업로드 방법

1. GitHub에서 새 저장소를 만듭니다.
2. 저장소 이름은 예를 들어 `battery-data-portal`처럼 정합니다.
3. 위 압축 파일을 풉니다.
4. GitHub 저장소 화면에서 `Add file` → `Upload files`를 누릅니다.
5. 압축을 푼 파일들을 끌어다 놓습니다.
6. commit message는 `Update battery data portal v0.01`처럼 적습니다.
7. `Commit changes`를 누릅니다.

## Git 명령어로 올리는 방법

아래 방식은 GitHub 저장소 주소가 있을 때 사용합니다.

```powershell
git init
git add .
git commit -m "Update battery data portal v0.01"
git branch -M main
git remote add origin https://github.com/사용자이름/battery-data-portal.git
git push -u origin main
```

## 주의

`data/uploads/`와 `data/*.sqlite3`는 연구 원본 데이터가 들어갈 수 있어서 GitHub에 올리지 않는 쪽이 안전합니다.
