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


def _row_direction(row: dict) -> str:
    """Return a normalized trace direction without changing stored source rows."""

    values = [row.get("direction"), row.get("step_type"), row.get("state")]
    raw = row.get("_raw")
    if isinstance(raw, dict):
        values.extend([raw.get("direction"), raw.get("step_type"), raw.get("state")])
    for value in values:
        normalized = str(value or "").strip().lower()
        if "discharge" in normalized or normalized in {"d", "dis"}:
            return "discharge"
        if "charge" in normalized or normalized in {"c", "chg"}:
            return "charge"
    return ""


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
        # Point-level CYC exports repeat a cycle for every acquired data point.
        # Retention must use the final/largest discharge capacity once per
        # cycle, while preserving ordinary one-row-per-cycle summary tables.
        per_cycle: dict[int, tuple[float, float]] = {}
        discharge_per_cycle: dict[int, tuple[float, float]] = {}
        for row in rows:
            cycle = _row_number(row, ("cycle_index", "cycle", "cycle number", "index"))
            capacity = _row_number(row, names)
            if cycle is not None and capacity is not None:
                cycle_index = round(cycle)
                if cycle_index < 1 or abs(cycle - cycle_index) > 1e-6:
                    continue
                normalized_capacity = capacity * scale
                previous = per_cycle.get(cycle_index)
                if previous is None or normalized_capacity >= previous[1]:
                    per_cycle[cycle_index] = (cycle, normalized_capacity)
                if _row_direction(row) == "discharge":
                    discharge_previous = discharge_per_cycle.get(cycle_index)
                    if discharge_previous is None or normalized_capacity >= discharge_previous[1]:
                        discharge_per_cycle[cycle_index] = (cycle, normalized_capacity)

        # Raw CYC traces contain a charge and a discharge curve for a cycle.
        # A retention plot conventionally represents the discharge capacity,
        # while ordinary one-row summary tables have no direction and keep the
        # original largest-value behavior.
        selected_cycles = discharge_per_cycle or per_cycle
        points = list(selected_cycles.values())
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
