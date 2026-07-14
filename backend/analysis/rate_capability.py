"""Rate-capability summaries grouped from explicit C-rate labels."""

from __future__ import annotations

from .common import finite_float


def summarize_rate_capability(rows: list[dict]) -> dict:
    """Group valid specific-capacity points by an explicit C-rate value."""

    grouped: dict[float, list[float]] = {}
    for row in rows:
        c_rate = finite_float(row.get("c_rate"))
        capacity = finite_float(row.get("specific_capacity_mah_g", row.get("capacity")))
        if c_rate is None or c_rate <= 0 or capacity is None:
            continue
        grouped.setdefault(c_rate, []).append(capacity)
    if not grouped:
        return {"status": "unavailable", "reason": "Explicit C-rate and specific-capacity values are required.", "groups": []}
    groups = [
        {
            "c_rate": c_rate,
            "cycle_count": len(capacities),
            "mean_specific_capacity_mah_g": sum(capacities) / len(capacities),
            "min_specific_capacity_mah_g": min(capacities),
            "max_specific_capacity_mah_g": max(capacities),
        }
        for c_rate, capacities in sorted(grouped.items())
    ]
    return {"status": "ok", "group_count": len(groups), "groups": groups}
