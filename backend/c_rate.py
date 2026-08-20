"""Defensible C-rate inference helpers for Battery Data Portal.

The helpers deliberately return an unavailable result when a 1C reference
cannot be established. Current alone is not enough to identify a C-rate.
"""

from __future__ import annotations

from math import isfinite
from statistics import median
from typing import Any, Mapping


STANDARD_C_RATES = (0.02, 0.05, 0.1, 0.2, 0.33, 0.5, 1.0, 2.0, 3.0, 4.0, 5.0, 10.0)

_CYCLE_KEYS = ("cycle", "cycle_index", "cycle_number", "Cycle")
_CURRENT_A_KEYS = (
    "current_a",
    "current",
    "Current",
    "avg_current_a",
    "avg current (A)",
    "current (A)",
)
_CURRENT_MA_KEYS = ("current_ma", "avg_current_ma", "current (mA)")

_NESTED_METADATA_KEYS = (
    "metadata",
    "electrode",
    "electrodeInfo",
    "electrode_info",
    "cellMetadata",
    "cell_metadata",
    "summary",
)
_SAMPLE_KEYS = ("samples", "sampleRows", "sample_rows")


def collect_c_rate_metadata(parsed: Mapping[str, Any] | None) -> dict[str, Any]:
    """Collect C-rate inputs without depending on one parser output shape."""

    source = parsed or {}
    collected: dict[str, Any] = {}

    def merge_mapping(candidate: Any) -> None:
        if not isinstance(candidate, Mapping):
            return
        for key, value in candidate.items():
            if value not in (None, "") and key not in collected:
                collected[key] = value

    merge_mapping(source)
    for key in _NESTED_METADATA_KEYS:
        merge_mapping(source.get(key))
    for key in _SAMPLE_KEYS:
        samples = source.get(key)
        if isinstance(samples, list) and samples:
            merge_mapping(samples[0])
            break
    return collected


def _positive_float(value: Any) -> float | None:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    if not isfinite(number) or number <= 0:
        return None
    return number


def _first_positive(metadata: Mapping[str, Any], keys: tuple[str, ...]) -> float | None:
    for key in keys:
        value = _positive_float(metadata.get(key))
        if value is not None:
            return value
    return None


def infer_one_c_current_ma(metadata: Mapping[str, Any] | None) -> dict[str, Any]:
    metadata = dict(metadata or {})
    metadata.setdefault("one_c_current_ma", metadata.get("oneC_mA"))
    metadata.setdefault(
        "specific_capacity_mah_g",
        metadata.get("theoreticalCapacity_mAh_g"),
    )
    metadata.setdefault("active_mass_g", metadata.get("ncmMass_g"))
    metadata.setdefault("loading_mg_cm2", metadata.get("loadingAmount"))
    metadata.setdefault(
        "area_cm2",
        metadata.get("electrodeArea_cm2") or metadata.get("areaCm2"),
    )
    """Return a 1C current in mA and the evidence used to calculate it."""

    values = metadata or {}
    explicit = _first_positive(
        values,
        (
            "one_c_current_ma",
            "oneC",
            "one_c_ma",
            "current_1c_ma",
            "one_c_current",
        ),
    )
    if explicit is not None:
        return {
            "one_c_current_ma": explicit,
            "source": "explicit_one_c_current",
            "label": f"1C = {explicit:.6g} mA",
        }

    specific_capacity = _first_positive(
        values,
        (
            "specific_capacity_mah_g",
            "theoretical_capacity_mah_g",
            "material_capacity_mah_g",
            "specific_capacity",
        ),
    )
    active_mass = _first_positive(
        values,
        (
            "active_material_mass_g",
            "active_mass_g",
            "active_material_weight_g",
        ),
    )
    if active_mass is not None and specific_capacity is not None:
        one_c = active_mass * specific_capacity
        return {
            "one_c_current_ma": one_c,
            "source": "active_mass_x_specific_capacity",
            "label": f"1C = {one_c:.6g} mA (활물질 질량 × 비용량)",
        }

    loading = _first_positive(
        values,
        (
            "active_material_loading_g_cm2",
            "loading_g_cm2",
            "active_loading_g_cm2",
        ),
    )
    area = _first_positive(values, ("electrode_area_cm2", "area_cm2", "electrode_area"))
    if loading is not None and area is not None and specific_capacity is not None:
        one_c = loading * area * specific_capacity
        return {
            "one_c_current_ma": one_c,
            "source": "loading_x_area_x_specific_capacity",
            "label": f"1C = {one_c:.6g} mA (로딩 × 면적 × 비용량)",
        }

    return {
        "one_c_current_ma": None,
        "source": None,
        "label": "1C 기준 전류 추정 불가",
    }


def _snap_standard_rate(rate: float) -> float | None:
    nearest = min(STANDARD_C_RATES, key=lambda standard: abs(rate - standard))
    tolerance = max(0.005, nearest * 0.08)
    return nearest if abs(rate - nearest) <= tolerance else None


def _format_rate(rate: float) -> str:
    if rate >= 1:
        return f"{rate:.3f}".rstrip("0").rstrip(".")
    return f"{rate:.3f}".rstrip("0").rstrip(".")


def infer_c_rate(
    *,
    current_ma: Any = None,
    current_a: Any = None,
    one_c_current_ma: Any = None,
) -> dict[str, Any]:
    """Infer C-rate from representative current and a defensible 1C current."""

    one_c = _positive_float(one_c_current_ma)
    try:
        current = _positive_float(abs(float(current_ma))) if current_ma is not None else None
    except (TypeError, ValueError):
        current = None
    if current is None and current_a is not None:
        try:
            current = _positive_float(abs(float(current_a)) * 1000.0)
        except (TypeError, ValueError):
            current = None

    if current is None or one_c is None:
        return {
            "rate": None,
            "label": "C-rate 추정 불가",
            "confidence": "unavailable",
        }

    calculated = current / one_c
    snapped = _snap_standard_rate(calculated)
    if snapped is not None:
        return {
            "rate": snapped,
            "label": f"{_format_rate(snapped)} C (자동 추정)",
            "confidence": "standard_rate_match",
        }

    return {
        "rate": calculated,
        "label": f"{_format_rate(calculated)} C (자동 추정)",
        "confidence": "calculated",
    }


def _first_number(row: Mapping[str, Any], keys: tuple[str, ...]) -> float | None:
    for key in keys:
        try:
            number = abs(float(row.get(key)))
        except (TypeError, ValueError):
            continue
        if isfinite(number):
            return number
    return None


def infer_cycle_c_rates(
    rows: list[Mapping[str, Any]],
    metadata: Mapping[str, Any] | None = None,
) -> dict[str, Any]:
    """Infer one representative C-rate per cycle and merge adjacent ranges."""
    one_c = infer_one_c_current_ma(metadata)
    one_c_current_ma = one_c.get("one_c_current_ma")
    unavailable = {
        "one_c_current_ma": None,
        "one_c_source": None,
        "one_c_label": "1C 기준 전류 정보 없음",
        "segments": [],
        "cycle_rates": [],
        "label": "C-rate 추정 불가",
    }
    if one_c_current_ma is None:
        return unavailable

    currents_by_cycle: dict[int, list[float]] = {}
    for row in rows:
        cycle_value = _first_number(row, _CYCLE_KEYS)
        if cycle_value is None:
            continue
        current_ma = _first_number(row, _CURRENT_MA_KEYS)
        if current_ma is None:
            current_a = _first_number(row, _CURRENT_A_KEYS)
            current_ma = current_a * 1000.0 if current_a is not None else None
        if current_ma is None or current_ma == 0:
            continue
        cycle = int(round(cycle_value))
        currents_by_cycle.setdefault(cycle, []).append(current_ma)

    cycle_rates: list[dict[str, Any]] = []
    for cycle in sorted(currents_by_cycle):
        representative_current_ma = median(currents_by_cycle[cycle])
        inference = infer_c_rate(
            current_ma=representative_current_ma,
            one_c_current_ma=one_c_current_ma,
        )
        if inference["rate"] is None:
            continue
        cycle_rates.append(
            {
                "cycle": cycle,
                "representative_current_ma": representative_current_ma,
                **inference,
            }
        )

    segments: list[dict[str, Any]] = []
    for item in cycle_rates:
        if (
            segments
            and segments[-1]["rate"] == item["rate"]
            and segments[-1]["end_cycle"] + 1 == item["cycle"]
        ):
            segments[-1]["end_cycle"] = item["cycle"]
            segments[-1]["_currents"].append(item["representative_current_ma"])
            segments[-1]["representative_current_ma"] = median(
                segments[-1]["_currents"]
            )
        else:
            segments.append(
                {
                    "start_cycle": item["cycle"],
                    "end_cycle": item["cycle"],
                    "rate": item["rate"],
                    "label": item["label"],
                    "confidence": item["confidence"],
                    "representative_current_ma": item["representative_current_ma"],
                    "_currents": [item["representative_current_ma"]],
                }
            )
    for segment in segments:
        segment.pop("_currents", None)

    labels = list(dict.fromkeys(item["label"] for item in cycle_rates))
    return {
        "one_c_current_ma": one_c_current_ma,
        "one_c_source": one_c.get("source"),
        "one_c_label": one_c.get("label"),
        "segments": segments,
        "cycle_rates": cycle_rates,
        "label": " | ".join(labels) if labels else "C-rate 추정 불가",
    }
