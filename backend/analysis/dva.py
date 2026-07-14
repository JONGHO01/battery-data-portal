"""Differential-voltage analysis derived from a voltage-capacity curve."""

from __future__ import annotations

from .common import finite_float


def calculate_dva(rows: list[dict]) -> dict:
    """Calculate dV/dQ from consecutive valid voltage-capacity points.

    Row order is preserved because a charge/discharge trace can revisit the
    same voltage and sorting would manufacture a physically different curve.
    """

    points = []
    for row in rows:
        voltage = finite_float(row.get("voltage_v", row.get("voltage")))
        capacity = finite_float(row.get("specific_capacity_mah_g", row.get("capacity")))
        if voltage is not None and capacity is not None:
            points.append((voltage, capacity))
    if len(points) < 3:
        return {
            "status": "unavailable",
            "reason": "Voltage-capacity curve data is required for dV/dQ analysis.",
            "points": [],
        }

    result = []
    for (v0, q0), (v1, q1) in zip(points, points[1:]):
        delta_q = q1 - q0
        if abs(delta_q) < 1e-12:
            continue
        result.append({"specific_capacity_mah_g": (q0 + q1) / 2, "dvdq_v_g_mah": (v1 - v0) / delta_q})
    if not result:
        return {"status": "unavailable", "reason": "Capacity points are not sufficiently separated.", "points": []}
    return {"status": "ok", "parameters": {"method": "consecutive-finite-difference"}, "points": result}
