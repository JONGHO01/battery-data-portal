"""Small helpers shared by analysis modules."""

from __future__ import annotations

import math
from typing import Any


ANALYSIS_VERSION = "analysis-1"


def finite_float(value: Any) -> float | None:
    if isinstance(value, bool) or value in (None, ""):
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return number if math.isfinite(number) else None


def min_max(values: list[float]) -> dict[str, float | None]:
    return {"min": min(values) if values else None, "max": max(values) if values else None}
