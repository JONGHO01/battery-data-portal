import math

from backend.c_rate import (
    collect_c_rate_metadata,
    infer_c_rate,
    infer_cycle_c_rates,
    infer_one_c_current_ma,
)


def test_infers_one_c_from_active_mass_and_specific_capacity():
    result = infer_one_c_current_ma(
        {
            "active_material_mass_g": 0.01475,
            "specific_capacity_mah_g": 180,
        }
    )

    assert math.isclose(result["one_c_current_ma"], 2.655, rel_tol=1e-9)
    assert result["source"] == "active_mass_x_specific_capacity"


def test_infers_one_c_from_loading_and_area():
    result = infer_one_c_current_ma(
        {
            "active_material_loading_g_cm2": 0.01443443,
            "electrode_area_cm2": 0.950332,
            "specific_capacity_mah_g": 180,
        }
    )

    expected = 0.01443443 * 0.950332 * 180
    assert math.isclose(result["one_c_current_ma"], expected, rel_tol=1e-9)
    assert result["source"] == "loading_x_area_x_specific_capacity"


def test_infers_standard_c_rate_from_current_in_amperes():
    result = infer_c_rate(current_a=0.00087615, one_c_current_ma=2.655)

    assert result["rate"] == 0.33
    assert result["label"] == "0.33 C (자동 추정)"
    assert result["confidence"] == "standard_rate_match"


def test_keeps_nonstandard_rate_as_numeric_estimate():
    result = infer_c_rate(current_ma=0.72, one_c_current_ma=2.655)

    assert math.isclose(result["rate"], 0.2711864406779661, rel_tol=1e-9)
    assert result["label"] == "0.271 C (자동 추정)"
    assert result["confidence"] == "calculated"


def test_returns_unavailable_without_defensible_one_c_reference():
    one_c = infer_one_c_current_ma({"specific_capacity_mah_g": 180})
    rate = infer_c_rate(current_ma=1.0, one_c_current_ma=None)

    assert one_c["one_c_current_ma"] is None
    assert one_c["label"] == "1C 기준 전류 추정 불가"
    assert rate["rate"] is None
    assert rate["label"] == "C-rate 추정 불가"


def test_infers_cycle_c_rates_from_raw_current_rows():
    rows = [
        {"cycle": 1, "current_a": -0.0002655},
        {"cycle": 1, "current_a": -0.0002700},
        {"cycle": 2, "current_a": -0.00087615},
        {"cycle": 2, "current_a": -0.0008800},
        {"cycle": 3, "current_a": -0.0008800},
    ]

    result = infer_cycle_c_rates(rows, {"one_c_current_ma": 2.655})

    assert result["cycle_rates"][0]["rate"] == 0.1
    assert result["cycle_rates"][1]["rate"] == 0.33
    assert result["segments"][0]["start_cycle"] == 1
    assert result["segments"][0]["end_cycle"] == 1
    assert result["segments"][1]["start_cycle"] == 2
    assert result["segments"][1]["end_cycle"] == 3


def test_cycle_c_rate_inference_is_unavailable_without_one_c_basis():
    result = infer_cycle_c_rates(
        [{"cycle_index": 1, "current (A)": -0.001}],
        {"specific_capacity_mah_g": 180},
    )

    assert result["segments"] == []
    assert result["cycle_rates"] == []
    assert result["label"] == "C-rate 추정 불가"


def test_invalid_current_returns_unavailable_instead_of_raising():
    result = infer_c_rate(current_ma="not-a-number", one_c_current_ma=2.655)

    assert result["rate"] is None
    assert result["label"] == "C-rate 추정 불가"


def test_infers_one_c_from_real_wrd_parser_aliases():
    result = infer_one_c_current_ma(
        {
            "ncmMass_g": 0.01475,
            "theoreticalCapacity_mAh_g": 180,
        }
    )

    assert math.isclose(result["one_c_current_ma"], 2.655)
    assert result["source"] == "active_mass_x_specific_capacity"


def test_collects_c_rate_metadata_from_first_manual_parser_sample():
    metadata = collect_c_rate_metadata(
        {
            "theoreticalCapacity_mAh_g": 180,
            "samples": [
                {
                    "oneC_mA": 2.655,
                    "ncmMass_g": 0.01475,
                    "loadingAmount": 0.01443,
                }
            ],
        }
    )

    assert metadata["oneC_mA"] == 2.655
    assert metadata["ncmMass_g"] == 0.01475
    assert metadata["theoreticalCapacity_mAh_g"] == 180
