"""Parser for Solartron/Smart Manager SEO EIS exports."""

from __future__ import annotations

import math
import struct
from pathlib import Path


def _float(blob: bytes, offset: int) -> float:
    return struct.unpack_from("<f", blob, offset)[0]


def _frequency_ok(value: float) -> bool:
    return math.isfinite(value) and 0.005 <= value <= 200000


def _impedance_ok(value: float) -> bool:
    return math.isfinite(value) and abs(value) <= 1e7


def find_sweeps(blob: bytes) -> list[int]:
    stride = 112
    starts = []
    for offset in range(0, max(0, len(blob) - stride * 3)):
        try:
            f0, f1, f2 = _float(blob, offset), _float(blob, offset + stride), _float(blob, offset + stride * 2)
        except struct.error:
            continue
        if 99000 <= f0 <= 101000 and 78000 <= f1 <= 80500 and 62000 <= f2 <= 64000:
            starts.append(offset)
    return starts


def read_seo(path: Path) -> tuple[list[list], str]:
    blob = path.read_bytes()
    stride = 112
    starts = find_sweeps(blob)
    if not starts:
        raise RuntimeError("No supported EIS sweep was found in the SEO file.")
    rows = [["sweep", "point", "frequency", "zreal", "zimag", "mag", "phase"]]
    for sweep_number, start in enumerate(starts, start=1):
        for point_number in range(1, 123):
            offset = start + (point_number - 1) * stride
            if offset + 36 > len(blob):
                break
            frequency, zreal, zimag = _float(blob, offset), _float(blob, offset + 28), _float(blob, offset + 32)
            if not (_frequency_ok(frequency) and _impedance_ok(zreal) and _impedance_ok(zimag)):
                break
            rows.append([sweep_number, point_number, frequency, zreal, zimag, math.hypot(zreal, zimag), math.degrees(math.atan2(zimag, zreal))])
    if len(rows) == 1:
        raise RuntimeError("The SEO file did not yield any complete impedance points.")
    source_format = path.suffix.lstrip(".").upper() or "SEO"
    return rows, f"{source_format} EIS binary"
