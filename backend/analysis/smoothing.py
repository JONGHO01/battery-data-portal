"""Small deterministic smoothing helpers for derived battery curves."""

from __future__ import annotations

from .common import finite_float


def smooth_series(values: list[object], window: int = 5) -> list[float | None]:
    """Return a centered moving average while preserving edge measurements.

    Battery plots should not silently lose points at the beginning and end of a
    measurement. Invalid values are retained as ``None`` rather than coerced.
    """

    if window < 1:
        raise ValueError("window must be at least 1")
    if window % 2 == 0:
        window -= 1
    radius = window // 2
    numbers = [finite_float(value) for value in values]
    result: list[float | None] = []
    for index, value in enumerate(numbers):
        if value is None or index < radius or index >= len(numbers) - radius:
            result.append(value)
            continue
        local = [candidate for candidate in numbers[index - radius : index + radius + 1] if candidate is not None]
        result.append(sum(local) / len(local) if local else None)
    return result
