"""Incremental capacity calculation with explicit data sufficiency checks."""

from __future__ import annotations

from .common import finite_float


def calculate_dqdv(rows: list[dict], voltage_bin_v: float = 0.005) -> dict:
    points = []
    for row in rows:
        voltage = finite_float(row.get("voltage_v", row.get("voltage")))
        capacity = finite_float(
            row.get("specific_capacity_mah_g", row.get("capacity", row.get("charge_capacity_ah")))
        )
        if voltage is not None and capacity is not None:
            points.append((voltage, capacity))
    if len(points) < 3:
        return {
            "status": "unavailable",
            "reason": "Voltage-capacity curve data is required for dQ/dV analysis.",
            "points": [],
        }
    points.sort(key=lambda point: point[0])
    result = []
    for (v0, q0), (v1, q1) in zip(points, points[1:]):
        delta_v = v1 - v0
        if abs(delta_v) < max(voltage_bin_v / 10, 1e-9):
            continue
        result.append({"voltage_v": (v0 + v1) / 2, "dqdv_mah_g_v": (q1 - q0) / delta_v})
    if not result:
        return {"status": "unavailable", "reason": "Voltage points are not sufficiently separated.", "points": []}
    return {"status": "ok", "parameters": {"voltage_bin_v": voltage_bin_v}, "points": result}
