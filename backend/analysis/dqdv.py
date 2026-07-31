"""Incremental-capacity analysis that accepts only real within-cycle traces."""

from __future__ import annotations

from collections import defaultdict
from typing import Any

from .common import finite_float


MIN_TRACE_POINTS = 8
MIN_DISTINCT_VALUES = 6


def _row_value(row: dict[str, Any], *keys: str) -> float | None:
    for key in keys:
        value = finite_float(row.get(key))
        if value is not None:
            return value
    return None


def _capacity_fields(direction: str) -> tuple[tuple[str, str, float], ...]:
    """Prefer the capacity column that matches the measured current direction."""

    specific = ("specific_capacity_mah_g", "mAh g-1", 1.0)
    reported = ("capacity", "reported capacity", 1.0)
    charge = ("charge_capacity_ah", "mAh", 1000.0)
    discharge = ("discharge_capacity_ah", "mAh", 1000.0)
    if direction == "charge":
        return specific, charge, reported, discharge
    if direction == "discharge":
        return specific, discharge, reported, charge
    return specific, reported, discharge, charge


def _ordered_trace(records: list[dict[str, Any]], direction: str) -> tuple[list[tuple[float, float]], str]:
    """Return one consistent capacity basis ordered by acquisition time."""

    ordered_records = sorted(
        records,
        key=lambda item: (
            0 if item["time"] is not None else 1,
            item["time"] if item["time"] is not None else item["index"],
            item["index"],
        ),
    )
    for field, capacity_unit, factor in _capacity_fields(direction):
        points = []
        for item in ordered_records:
            capacity = finite_float(item["row"].get(field))
            if capacity is not None:
                points.append((item["voltage"], capacity * factor))
        if len(points) < MIN_TRACE_POINTS:
            continue
        unique_voltage = {round(voltage, 7) for voltage, _ in points}
        unique_capacity = {round(capacity, 7) for _, capacity in points}
        if len(unique_voltage) >= MIN_DISTINCT_VALUES and len(unique_capacity) >= MIN_DISTINCT_VALUES:
            return points, capacity_unit
    return [], ""


def _derivative_curve(points: list[tuple[float, float]], voltage_bin_v: float, capacity_unit: str) -> list[dict[str, float]]:
    """Use central differences and average only neighbouring raw trace points."""

    unique = []
    for voltage, capacity in points:
        if not unique or abs(voltage - unique[-1][0]) > 1e-9 or abs(capacity - unique[-1][1]) > 1e-9:
            unique.append((voltage, capacity))
    if len(unique) < MIN_TRACE_POINTS:
        return []

    raw = []
    minimum_delta_v = max(voltage_bin_v / 10, 1e-9)
    for index in range(1, len(unique) - 1):
        voltage_before, capacity_before = unique[index - 1]
        voltage_after, capacity_after = unique[index + 1]
        delta_voltage = voltage_after - voltage_before
        if abs(delta_voltage) < minimum_delta_v:
            continue
        value = (capacity_after - capacity_before) / delta_voltage
        if value == value and value not in (float("inf"), float("-inf")):
            raw.append(((voltage_before + voltage_after) / 2, value))
    if len(raw) < 4:
        return []

    bins: dict[int, list[float]] = defaultdict(list)
    for voltage, value in raw:
        bins[round(voltage / voltage_bin_v)].append(value)
    result = []
    for key in sorted(bins):
        value = sum(bins[key]) / len(bins[key])
        point = {"voltage_v": key * voltage_bin_v, "dqdv_value": value}
        if capacity_unit == "mAh g-1":
            point["dqdv_mah_g_v"] = value
        result.append(point)
    return result


def calculate_dqdv(rows: list[dict], voltage_bin_v: float = 0.005) -> dict:
    """Calculate dQ/dV only when a cycle contains a genuine voltage-capacity trace.

    A cycle summary has one capacity and one end-voltage value per cycle.  Sorting
    those summaries by voltage can create a plausible-looking but invalid curve,
    so each accepted series must contain multiple distinct points from one cycle.
    """

    try:
        bin_width = float(voltage_bin_v)
    except (TypeError, ValueError):
        bin_width = 0.005
    if bin_width <= 0:
        bin_width = 0.005

    by_cycle: dict[int, list[dict[str, Any]]] = defaultdict(list)
    for index, row in enumerate(rows):
        voltage = _row_value(row, "voltage_v", "voltage")
        cycle_value = _row_value(row, "cycle_index", "cycle")
        if voltage is None or cycle_value is None:
            continue
        cycle_index = round(cycle_value)
        if cycle_index < 1 or abs(cycle_value - cycle_index) > 1e-6:
            continue
        by_cycle[cycle_index].append(
            {
                "index": index,
                "row": row,
                "voltage": voltage,
                "time": _row_value(row, "test_time_s", "unix_time_s", "time_s", "time"),
                "current": _row_value(row, "current_a", "current"),
            }
        )

    series = []
    for cycle_index in sorted(by_cycle):
        records = by_cycle[cycle_index]
        charge = [item for item in records if item["current"] is not None and item["current"] > 1e-9]
        discharge = [item for item in records if item["current"] is not None and item["current"] < -1e-9]
        directional = [("charge", charge), ("discharge", discharge)]
        groups = [(direction, group) for direction, group in directional if len(group) >= MIN_TRACE_POINTS]
        if not groups:
            groups = [("trace", records)]
        for direction, group in groups:
            points, capacity_unit = _ordered_trace(group, direction)
            curve = _derivative_curve(points, bin_width, capacity_unit) if points else []
            if curve:
                series.append(
                    {
                        "cycle_index": cycle_index,
                        "direction": direction,
                        "capacity_unit": capacity_unit,
                        "dqdv_unit": f"{capacity_unit} V-1",
                        "points": curve,
                    }
                )

    if not series:
        return {
            "status": "unavailable",
            "reason": "A raw within-cycle voltage-capacity trace with at least eight distinct points is required for dQ/dV analysis. Cycle-summary rows are not differentiated.",
            "points": [],
            "series": [],
        }

    flat_points = [
        {**point, "cycle_index": item["cycle_index"], "direction": item["direction"]}
        for item in series
        for point in item["points"]
    ]
    units = {item["capacity_unit"] for item in series}
    return {
        "status": "ok",
        "parameters": {"voltage_bin_v": bin_width},
        "capacity_unit": next(iter(units)) if len(units) == 1 else "mixed",
        "series_count": len(series),
        "point_count": len(flat_points),
        "series": series,
        "points": flat_points,
    }
