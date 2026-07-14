"""Cycle retention metrics."""

from __future__ import annotations

from .common import finite_float


def summarize_retention(rows: list[dict]) -> dict:
    points = []
    for row in rows:
        cycle = finite_float(row.get("cycle_index", row.get("cycle")))
        capacity = finite_float(row.get("specific_capacity_mah_g", row.get("capacity")))
        if cycle is not None and capacity is not None:
            points.append((cycle, capacity))
    points.sort(key=lambda point: point[0])
    if not points:
        return {"status": "unavailable", "reason": "No cycle capacity values are available."}
    initial = points[0][1]
    final = points[-1][1]
    return {
        "status": "ok",
        "cycle_count": len(points),
        "initial_capacity_mah_g": initial,
        "final_capacity_mah_g": final,
        "final_retention_pct": (final / initial * 100) if initial else None,
    }
