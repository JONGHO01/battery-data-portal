# 장비 카탈로그 구성 요소

`main`에는 독립적으로 검증한 카탈로그와 상세창 구성 요소가 포함되어 있습니다. 기존 실행 화면에 자동 연결되지는 않습니다. 최신 로컬 실험 관리 화면의 통합은 별도 미반영 코드에 의존하며, 이 문서나 모듈 추가를 전체 기능 배포 완료로 해석하지 않습니다.

- `public/equipment-catalog.json`: 지정 장비, 모델 확인 상태, 대표사진, 주요 제품군 정보와 출처.
- `backend/equipment_catalog.py`: 공정 종류별 카탈로그 조회. 반환값은 독립 복사본이며 DB를 수정하지 않습니다.
- `public/equipment-catalog.js`: `BatteryEquipment.forType(type)`와 `BatteryEquipment.button(info, recordedEquipment)`. 동일 출처 JSON과 로컬 대표사진만 읽습니다. 상세창에서 제조사 페이지를 누르기 전에는 외부 요청을 보내지 않습니다.
- `tests/test_equipment_catalog.py`, `tests/equipment_catalog_browser.cjs`: 지정 공정 범위, 모델 미확정, 자산, 읽기 전용 동작, 안전한 텍스트 렌더링, 닫기와 초점 복귀 검증.

검증 명령: `python -m unittest discover -s tests -p test_equipment_catalog.py -v` (브라우저 합성 테스트에는 Node.js 필요).

기존 공정 이력의 장비명과 실제 rpm·온도·용량을 이 제품군 정보로 덮어쓰지 않습니다. Mixing 모델은 미확정이며 Kneading 모델은 NEP-0.5K로 지정되어 있습니다. 공개 제원표의 NEP-500p 등을 같은 모델로 가정하지 않습니다.

사진은 케이엠텍 제조사 제품군 대표사진이며 실제 설치 장비 촬영본이 아닙니다. 사진과 제품 정보 출처: [Powder Mixer (PLS)](https://kmtech.kr/bsr/board.php?bo_table=battery&wr_id=13), [Kneader-p (NEP)](https://kmtech.kr/bsr/board.php?bo_table=battery&wr_id=10). 사진의 권리는 제조사에 있습니다.
