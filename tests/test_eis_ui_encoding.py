from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]


def test_eis_inspection_panel_uses_readable_korean_labels():
    source = (PROJECT_ROOT / "public" / "app.js").read_text(encoding="utf-8")

    expected_labels = [
        "EIS 열 안내",
        "sweep</code>: 반복 측정 회차",
        "frequency</code>: 인가한 교류 주파수(Hz)입니다.",
        "zreal</code>: 임피던스의 실수부",
        "zimag</code>: 허수부",
        "mag</code>: 임피던스 크기",
        "phase</code>: 위상각(degree)입니다.",
        "어떤 Fig를 만들어 드릴까요?",
        "Nyquist + Bode 통합 Fig",
    ]

    for label in expected_labels:
        assert label in source
