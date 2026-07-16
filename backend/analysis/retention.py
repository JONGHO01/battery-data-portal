"""Cycle retention metrics and unit-aware CYC capacity selection."""

from __future__ import annotations

import re

from .common import finite_float


def _normalized_key(value: object) -> str:
    """Compare legacy and BDF column spellings without changing raw data."""

    return re.sub(r"[^a-z0-9]+", "", str(value or "").lower())


def _row_number(row: dict, names: tuple[str, ...]) -> float | None:
    """Read one numeric field from either a BDF or legacy CYC row."""

    lookup = {_normalized_key(key): value for key, value in row.items()}
    for name in names:
        value = finite_float(lookup.get(_normalized_key(name)))
        if value is not None:
            return value
    return None


_CAPACITY_SERIES = (
    # Specific capacity takes precedence because it is the preferred comparison
    # unit when electrode mass is known.
    (
        "specific_capacity_mah_g",
        "mAh g-1",
        1.0,
        (
            "specific_capacity_mah_g",
            "specific capacity (mAh g-1)",
            "discharge capacity (mAh g-1)",
            "capacity",
            "dischargeCapacity",
        ),
    ),
    # BDF converts an incoming mAh column to this canonical Ah field.
    (
        "discharge_capacity_ah",
        "mAh",
        1000.0,
        ("discharge_capacity_ah", "discharge Q (Ah)", "discharge capacity (Ah)"),
    ),
    (
        "discharge_capacity_mah",
        "mAh",
        1.0,
        (
            "discharge_capacity_mAh",
            "discharge_capacity_mah",
            "discharge capacity (mAh)",
            "discharge capacity",
        ),
    ),
)


def capacity_series(rows: list[dict]) -> tuple[list[tuple[float, float]], dict]:
    """Return one consistent CYC capacity series in a clearly stated unit.

    The portal accepts both specific capacity and absolute discharge capacity.
    Absolute BDF values are normalized to mAh, so
    ``discharge_capacity_ah`` is never treated as an unavailable series.
    """

    for field, unit, scale, names in _CAPACITY_SERIES:
        points = []
        for row in rows:
            cycle = _row_number(row, ("cycle_index", "cycle", "cycle number", "index"))
            capacity = _row_number(row, names)
            if cycle is not None and capacity is not None:
                points.append((cycle, capacity * scale))
        if points:
            points.sort(key=lambda point: point[0])
            return points, {"field": field, "unit": unit}
    return [], {"field": "", "unit": ""}


def summarize_retention(rows: list[dict]) -> dict:
    points, capacity_info = capacity_series(rows)
    if not points:
        return {"status": "unavailable", "reason": "No cycle capacity values are available."}

    initial = points[0][1]
    final = points[-1][1]
    result = {
        "status": "ok",
        "cycle_count": len(points),
        "capacity_field": capacity_info["field"],
        "capacity_unit": capacity_info["unit"],
        "initial_capacity": initial,
        "final_capacity": final,
        "final_retention_pct": (final / initial * 100) if initial else None,
    }
    if capacity_info["unit"] == "mAh g-1":
        result["initial_capacity_mah_g"] = initial
        result["final_capacity_mah_g"] = final
    else:
        result["initial_capacity_mah"] = initial
        result["final_capacity_mah"] = final
    return result
