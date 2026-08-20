from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_upload_review_renders_automatic_c_rate_inference():
    app = (ROOT / "public" / "app.js").read_text(encoding="utf-8")
    css = (ROOT / "public" / "style.css").read_text(encoding="utf-8")

    assert "a.cRateInference" in app
    assert "one_c_label" in app
    assert r"C-rate \uc790\ub3d9 \uacc4\uc0b0" in app
    assert ".cRateInference" in css
