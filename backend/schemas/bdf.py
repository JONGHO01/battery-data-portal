"""Portable canonical fields and conservative unit conversion for battery data."""

from __future__ import annotations

import math
import re
from typing import Any


PARSER_VERSION = "bdf-map-2"

CANONICAL_COLUMNS = (
    "record_index",
    "cycle_index",
    "step_index",
    "test_time_s",
    "unix_time_s",
    "voltage_v",
    "current_a",
    "ambient_temperature_c",
    "charge_capacity_ah",
    "discharge_capacity_ah",
    "specific_capacity_mah_g",
    "c_rate",
    "coulombic_efficiency_pct",
    "frequency_hz",
    "z_real_ohm",
    "z_imag_ohm",
    "magnitude_ohm",
    "phase_deg",
    "quality_flag",
    "exclude_reason",
    "analysis_include",
    "protocol_segment",
)


def normalized_name(value: Any) -> str:
    return re.sub(r"[^a-z0-9\uac00-\ud7a3]+", "", str(value or "").lower())


def finite_float(value: Any) -> float | None:
    if isinstance(value, bool) or value in (None, ""):
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return number if math.isfinite(number) else None


def _has(name: str, terms: tuple[str, ...]) -> bool:
    return any(term in name for term in terms)


def _capacity_field(name: str) -> str | None:
    is_specific = _has(name, ("specific", "ahg", "mahg", "\ub2e8\uc704"))
    if _has(name, ("discharge", "dchg", "dch", "\ubc29\uc804")):
        return "specific_capacity_mah_g" if is_specific else "discharge_capacity_ah"
    if _has(name, ("charge", "chg", "\ucda9\uc804")):
        return "specific_capacity_mah_g" if is_specific else "charge_capacity_ah"
    if _has(name, ("capacity", "\uc6a9\ub7c9")) and is_specific:
        return "specific_capacity_mah_g"
    return None


def _candidate_field(column: str, data_type: str = "") -> str | None:
    name = normalized_name(column)
    # C-rate is meaningful for cycling files. Keep the header match narrow so
    # CV scan-rate columns and unrelated generic "rate" labels stay untouched.
    if data_type == "cyc" and (
        name.startswith("crate")
        or name in {"ratec", "씨레이트", "c레이트"}
    ):
        return "c_rate"
    capacity = _capacity_field(name)
    if capacity:
        return capacity
    if _has(name, ("coulombicefficiency", "efficiency", "ce", "\ud6a8\uc728")):
        return "coulombic_efficiency_pct"
    if _has(name, ("frequency", "freq", "\uc8fc\ud30c\uc218")):
        return "frequency_hz"
    if _has(name, ("zimag", "imaginary", "zdoubleprime", "imz", "\ud5c8\uc218")):
        return "z_imag_ohm"
    if _has(name, ("zreal", "realimpedance", "zprime", "rez", "\uc2e4\uc218")):
        return "z_real_ohm"
    if _has(name, ("magnitude", "modz", "zmod", "absz")):
        return "magnitude_ohm"
    if _has(name, ("phase", "angle")):
        return "phase_deg"
    if _has(name, ("temperature", "temp", "\uc628\ub3c4")):
        return "ambient_temperature_c"
    if _has(name, ("unix", "timestamp", "epochtime")):
        return "unix_time_s"
    if _has(name, ("testtime", "elapsedtime", "duration", "runtime", "\uc2dc\uac04")):
        return "test_time_s"
    if _has(name, ("step", "\uc2a4\ud15d")):
        return "step_index"
    if _has(name, ("cycle", "\uc0ac\uc774\ud074")):
        return "cycle_index"
    if _has(name, ("voltage", "potential", "\uc804\uc555")):
        return "voltage_v"
    if _has(name, ("current", "\uc804\ub958")):
        return "current_a"
    return None


def _target_unit(field: str) -> str:
    return {
        "test_time_s": "s",
        "unix_time_s": "s",
        "voltage_v": "V",
        "current_a": "A",
        "ambient_temperature_c": "degC",
        "charge_capacity_ah": "Ah",
        "discharge_capacity_ah": "Ah",
        "specific_capacity_mah_g": "mAh g-1",
        "c_rate": "C",
        "coulombic_efficiency_pct": "%",
        "frequency_hz": "Hz",
        "z_real_ohm": "ohm",
        "z_imag_ohm": "ohm",
        "magnitude_ohm": "ohm",
        "phase_deg": "deg",
    }.get(field, "")


def _source_unit(column: str, field: str) -> str:
    name = normalized_name(column)
    if field == "c_rate":
        return "C"
    if field == "specific_capacity_mah_g":
        return "Ah g-1" if "ahg" in name and "mahg" not in name else "mAh g-1"
    if field in {"charge_capacity_ah", "discharge_capacity_ah"}:
        return "mAh" if "mah" in name and "mahg" not in name else "Ah"
    if field == "current_a":
        if "ua" in name:
            return "uA"
        if "ma" in name:
            return "mA"
        return "A"
    if field == "voltage_v":
        return "mV" if "mv" in name else "V"
    if field == "test_time_s":
        if "ms" in name:
            return "ms"
        if "min" in name:
            return "min"
        if "hour" in name or "hr" in name:
            return "h"
        return "s"
    return _target_unit(field)


def build_column_mapping(data_type: str, columns: list[str]) -> dict[str, dict[str, str]]:
    """Map source headers to conservative BDF-aligned internal field names."""

    mapping: dict[str, dict[str, str]] = {}
    for column in columns:
        field = _candidate_field(column, data_type)
        if not field or field in mapping:
            continue
        source_unit = _source_unit(column, field)
        mapping[field] = {
            "source": str(column),
            "sourceUnit": source_unit,
            "targetUnit": _target_unit(field),
            "confidence": "high" if data_type in {"cyc", "cv", "eis"} else "review",
        }
    return mapping


def _parse_c_rate(value: Any) -> float | None:
    """Accept numeric C-rate values plus common C/10 and 0.33 C notation."""

    direct = finite_float(value)
    if direct is not None:
        return direct if 0 < direct <= 20 else None

    text = str(value or "").strip().lower().replace(" ", "")
    fraction = re.fullmatch(r"c/([0-9]+(?:\.[0-9]+)?)", text)
    if fraction:
        denominator = finite_float(fraction.group(1))
        if denominator is None or denominator <= 0:
            return None
        rate = 1 / denominator
    else:
        decimal = re.fullmatch(r"(?:re)?([0-9]+(?:\.[0-9]+)?)c?", text)
        if not decimal:
            return None
        rate = finite_float(decimal.group(1))

    return rate if rate is not None and 0 < rate <= 20 else None


def _convert(value: float, field: str, source_unit: str) -> float:
    if field == "specific_capacity_mah_g" and source_unit == "Ah g-1":
        return value * 1000
    if field in {"charge_capacity_ah", "discharge_capacity_ah"} and source_unit == "mAh":
        return value / 1000
    if field == "current_a":
        if source_unit == "mA":
            return value / 1000
        if source_unit == "uA":
            return value / 1_000_000
    if field == "voltage_v" and source_unit == "mV":
        return value / 1000
    if field == "test_time_s":
        if source_unit == "ms":
            return value / 1000
        if source_unit == "min":
            return value * 60
        if source_unit == "h":
            return value * 3600
    return value


def canonicalize_rows(data_type: str, columns: list[str], rows: list[dict]) -> list[dict]:
    """Keep input values under _raw while adding mapped canonical values."""

    mapping = build_column_mapping(data_type, columns)
    result: list[dict] = []
    for index, source_row in enumerate(rows):
        row: dict[str, Any] = {"record_index": index + 1, "_raw": dict(source_row)}
        for field, details in mapping.items():
            source_value = source_row.get(details["source"])
            raw_value = _parse_c_rate(source_value) if field == "c_rate" else finite_float(source_value)
            if raw_value is not None:
                row[field] = _convert(raw_value, field, details["sourceUnit"])
        result.append(row)
    return result


def evaluate_quality(data_type: str, rows: list[dict]) -> dict:
    """Flag suspicious values without dropping source records."""

    checked_rows: list[dict] = []
    flag_counts = {"ok": 0, "review": 0, "exclude": 0}
    for source in rows:
        row = dict(source)
        reasons: list[str] = []
        voltage = finite_float(row.get("voltage_v"))
        frequency = finite_float(row.get("frequency_hz"))
        z_real = finite_float(row.get("z_real_ohm"))
        z_imag = finite_float(row.get("z_imag_ohm"))
        if voltage is not None and not (0 < voltage <= 10):
            reasons.append("voltage_out_of_range")
        if data_type == "eis":
            if frequency is not None and frequency <= 0:
                reasons.append("frequency_not_positive")
            if z_real is None or z_imag is None:
                reasons.append("incomplete_impedance")
        if reasons:
            flag = "review"
        else:
            flag = "ok"
        row["quality_flag"] = flag
        row["exclude_reason"] = reasons
        row["analysis_include"] = flag == "ok"
        flag_counts[flag] += 1
        checked_rows.append(row)
    status = "review" if flag_counts["review"] or flag_counts["exclude"] else "ok"
    return {"rows": checked_rows, "summary": {"status": status, "counts": flag_counts, "parserVersion": PARSER_VERSION}}
