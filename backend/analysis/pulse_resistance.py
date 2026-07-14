"""Conservative pulse-resistance summaries from current transitions."""

from __future__ import annotations

from .common import finite_float


def summarize_pulse_resistance(rows: list[dict]) -> dict:
    """Estimate instantaneous resistance only at rest-to-pulse transitions."""

    points = []
    for row in rows:
        voltage = finite_float(row.get("voltage_v", row.get("voltage")))
        current = finite_float(row.get("current_a", row.get("current")))
        time_s = finite_float(row.get("test_time_s", row.get("time")))
        if voltage is not None and current is not None:
            points.append({"time_s": time_s, "voltage_v": voltage, "current_a": current})
    if len(points) < 2:
        return {"status": "unavailable", "reason": "Voltage and current trace data is required.", "pulses": []}

    largest_current = max(abs(point["current_a"]) for point in points)
    rest_threshold_a = max(largest_current * 0.02, 1e-9)
    pulses = []
    for before, after in zip(points, points[1:]):
        if abs(before["current_a"]) > rest_threshold_a or abs(after["current_a"]) <= rest_threshold_a:
            continue
        delta_current = after["current_a"] - before["current_a"]
        if abs(delta_current) <= rest_threshold_a:
            continue
        pulses.append(
            {
                "time_s": after["time_s"],
                "delta_current_a": delta_current,
                "delta_voltage_v": after["voltage_v"] - before["voltage_v"],
                "resistance_ohm": abs((after["voltage_v"] - before["voltage_v"]) / delta_current),
            }
        )
    if not pulses:
        return {"status": "unavailable", "reason": "No rest-to-pulse current transitions were found.", "pulses": []}
    return {
        "status": "ok",
        "parameters": {"rest_threshold_a": rest_threshold_a},
        "pulse_count": len(pulses),
        "pulses": pulses,
    }
