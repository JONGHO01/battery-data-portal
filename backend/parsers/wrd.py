"""Parser for WBCS WRD cycling exports."""

from __future__ import annotations

import re
import struct
from pathlib import Path


def extract_wrd_mass_g(path: Path, blob: bytes) -> float | None:
    text = path.name + "\n"
    for match in re.finditer(rb"[ -~]{8,}", blob[:200000]):
        text += "\n" + match.group().decode("ascii", errors="ignore")
    candidates = []
    for match in re.finditer(r"(\d+(?:[._]\d+)?)\s*g", text, flags=re.IGNORECASE):
        value = float(match.group(1).replace("_", "."))
        if 0.001 <= value <= 1:
            candidates.append(value)
    return candidates[-1] if candidates else None


def read_wrd(path: Path) -> tuple[list[list], str]:
    blob = path.read_bytes()
    if b"WbcsFile" not in blob or b"DISCHARGE Q" not in blob:
        raise RuntimeError("The WRD file does not contain a supported WBCS cycling structure.")
    mass_g = extract_wrd_mass_g(path, blob)
    points = []
    for match in re.compile(rb"\d+(?:\.\d+)?(?:uA|mA|A)").finditer(blob):
        position = match.end()
        if position + 48 > len(blob):
            continue
        voltage, current, charge_q, discharge_q, charge_e, discharge_e = struct.unpack_from("<6d", blob, position)
        if not (0.5 <= voltage <= 5.5 and -0.2 <= current <= 0.2):
            continue
        if not (0 <= charge_q <= 0.2 and 0 <= discharge_q <= 0.2):
            continue
        if not (0 <= abs(charge_e) <= 2 and 0 <= abs(discharge_e) <= 2):
            continue
        points.append({"offset": match.start(), "range": match.group().decode("ascii"), "voltage": voltage, "current": current, "discharge_q": discharge_q})
    points.sort(key=lambda item: item["offset"])
    segments, current_segment, previous_q = [], [], 0.0
    for point in points:
        discharge_q = point["discharge_q"]
        same_segment = current_segment and discharge_q >= previous_q - 1e-5 and point["offset"] - current_segment[-1]["offset"] < 50000
        if discharge_q > 1e-8 and point["current"] < 0 and (not current_segment or same_segment):
            current_segment.append(point)
        else:
            if current_segment:
                segments.append(current_segment)
            current_segment = []
        previous_q = discharge_q
    if current_segment:
        segments.append(current_segment)
    rows = [["cycle", "discharge capacity (mAh g-1)", "discharge Q (Ah)", "end voltage (V)", "avg current (A)", "points", "range"]]
    for segment in segments:
        max_q = max(item["discharge_q"] for item in segment)
        if max_q < 1e-4:
            continue
        end = max(segment, key=lambda item: item["discharge_q"])
        avg_current = sum(item["current"] for item in segment) / len(segment)
        rows.append([len(rows), max_q * 1000 / mass_g if mass_g else "", max_q, end["voltage"], avg_current, len(segment), end["range"]])
    if len(rows) == 1:
        raise RuntimeError("No supported discharge-capacity segments were found in the WRD file.")
    return rows, "WRD discharge summary"
