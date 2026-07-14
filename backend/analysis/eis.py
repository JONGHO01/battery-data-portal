"""Basic reproducible EIS summaries without circuit fitting assumptions."""

from __future__ import annotations

from .common import finite_float, min_max


def summarize_eis(rows: list[dict]) -> dict:
    frequency = []
    z_real = []
    z_imag = []
    for row in rows:
        f = finite_float(row.get("frequency_hz", row.get("frequency")))
        zr = finite_float(row.get("z_real_ohm", row.get("zreal")))
        zi = finite_float(row.get("z_imag_ohm", row.get("zimag")))
        if f is not None and zr is not None and zi is not None:
            frequency.append(f)
            z_real.append(zr)
            z_imag.append(zi)
    if not frequency:
        return {"status": "unavailable", "reason": "No complete EIS points are available."}
    return {
        "status": "ok",
        "point_count": len(frequency),
        "frequency_hz": min_max(frequency),
        "z_real_ohm": min_max(z_real),
        "z_imag_ohm": min_max(z_imag),
    }
