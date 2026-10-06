"""Parser for WBCS WRD cycling exports."""

from __future__ import annotations

import re
import struct
import math
from statistics import median
from pathlib import Path


# A full WBCS file can contain tens of thousands of raw points for one trace.
# This keeps enough resolution for voltage profiles and dQ/dV while staying
# below the portal's parsed-row storage limit on large multi-cycle exports.
# Keep enough resolution for voltage profiles and dQ/dV, but cap the complete
# CYC payload as well.  A 35-cycle file has 70 charge/discharge traces; keeping
# 2,000 points for *each* trace produced more than 100,000 parsed rows and
# could exhaust the upload worker or renderer before the browser saw its small
# preview.  The per-trace limit remains useful for short files, while the total
# budget scales it down for long multi-cycle exports.
MAX_POINTS_PER_TRACE = 2_000
MAX_TOTAL_CYC_POINTS = 35_000
MIN_CAPACITY_AH = 1e-4
MIN_INCOMPLETE_TRACE_POINTS = 5
MIN_INCOMPLETE_CAPACITY_AH = 1e-6
MIN_INCOMPLETE_VOLTAGE_SPAN = 0.05
CONTINUATION_CAPACITY_RATIO = 0.2


def _binary_test_report_values(blob: bytes) -> dict[str, float]:
    """Read the known WBCS TestReport prefix, never deserialize .NET objects.

    CellWeight is in grams (CellCapacity remains Ah). Read NRBF member names
    and types instead of guessing a byte offset or treating a bare filename
    number/areal loading as active mass. Unknown/truncated schemas stay unknown.
    Structure: MS-NRBF 2.3.2.1 and 2.3.1.2 (ClassWithMembersAndTypes).
    """
    data = blob[:65536]
    marker = b"\x1cWbcsFile.Sequence.TestReport"
    record = re.search(rb"\x05...." + re.escape(marker), data, re.DOTALL)
    if record is None:
        return {}
    position = record.start() + 5

    def take(count: int) -> bytes:
        nonlocal position
        if count < 0 or position + count > len(data):
            raise ValueError("Truncated WBCS metadata")
        value = data[position:position + count]
        position += count
        return value

    def string() -> bytes:
        # NRBF LengthPrefixedString; cap both prefix work and string length.
        length = 0
        for shift in (0, 7):
            byte = take(1)[0]
            length |= (byte & 127) << shift
            if not byte & 128:
                if length > 1024:
                    raise ValueError("Oversized WBCS metadata string")
                return take(length)
        raise ValueError("Unsupported WBCS metadata string")

    try:
        string()  # verified TestReport class name
        count = struct.unpack("<i", take(4))[0]
        if not 5 <= count <= 128:
            return {}
        names = [string() for _ in range(count)]
        expected = [f"<{name}>k__BackingField".encode() for name in
                    ("Name", "SchMaker", "ProductInfo", "CellType", "CellWeight")]
        types = take(count)
        if names[:5] != expected or types[:5] != bytes([1, 1, 1, 1, 0]):
            return {}
        weight_type = None
        capacity_type = None
        for index, kind in enumerate(types):
            if kind in (0, 7):  # Primitive / PrimitiveArray additional type
                primitive = take(1)[0]
                if index == 4:
                    weight_type = primitive
                if index == 6:
                    capacity_type = primitive
            elif kind in (3, 4):  # SystemClass / Class type descriptor only
                string()
                if kind == 4:
                    take(4)
            elif kind not in (1, 2, 5, 6):
                return {}
        if weight_type != 6:  # CellWeight must be a Double, not guessed bytes
            return {}
        take(4)  # LibraryId
        for _ in range(4):  # four string members before the primitive weight
            record = take(1)[0]
            if record == 6:  # BinaryObjectString
                take(4)
                string()
            elif record == 9:  # MemberReference; never resolve objects
                take(4)
            elif record != 10:  # ObjectNull
                return {}
        mass = struct.unpack("<d", take(8))[0]
        result = {"mass_g": mass} if 0.001 <= mass <= 1 else {}
        # CellCapacity is the instrument's configured nominal capacity in Ah.
        # Validate the known member/type before advancing past the CRate string;
        # do not resolve arbitrary objects or guess a capacity from adjacent data.
        if (count < 7 or names[5:7] != [b"<CRate>k__BackingField", b"<CellCapacity>k__BackingField"]
                or types[5:7] != bytes([1, 0]) or capacity_type != 6):
            return result
        try:
            record = take(1)[0]
            if record == 6:
                take(4)
                string()
            elif record == 9:
                take(4)
            elif record != 10:
                return result
            capacity = struct.unpack("<d", take(8))[0]
            if math.isfinite(capacity) and 1e-9 <= capacity <= 100:
                result["nominal_capacity_ah"] = capacity
        except (ValueError, struct.error):
            pass  # Truncated optional capacity must not hide a valid CellWeight.
        return result
    except (ValueError, struct.error):
        return {}


def _binary_cell_weight_g(blob: bytes) -> float | None:
    return _binary_test_report_values(blob).get("mass_g")


def read_wrd_c_rate_reference(path: Path) -> dict | None:
    """Read only the known 64 KiB metadata prefix, without parsing measurements."""
    with path.open("rb") as handle:
        values = _binary_test_report_values(handle.read(65536))
    capacity = values.get("nominal_capacity_ah")
    if capacity is None:
        return None
    return {
        "oneC_mA": capacity * 1000,
        "source": "wrd_test_report_cell_capacity",
        "nominalCapacity_Ah": capacity,
    }


def extract_wrd_mass_g(path: Path, blob: bytes) -> float | None:
    # The filename is the most dependable place for an electrode mass.  WBCS
    # binary content can contain unrelated text such as "1g", which must not
    # override a precise filename value like ``0.0475488g``.
    filename_candidates = []
    for match in re.finditer(r"(\d+(?:[._]\d+)?)\s*g", path.name, flags=re.IGNORECASE):
        value = float(match.group(1).replace("_", "."))
        if 0.001 <= value <= 1:
            filename_candidates.append(value)
    if filename_candidates:
        return filename_candidates[-1]

    binary_mass = _binary_cell_weight_g(blob)
    if binary_mass is not None:
        return binary_mass

    text = ""
    for match in re.finditer(rb"[ -~]{8,}", blob[:200000]):
        text += "\n" + match.group().decode("ascii", errors="ignore")
    candidates = []
    for match in re.finditer(r"(\d+(?:[._]\d+)?)\s*g", text, flags=re.IGNORECASE):
        value = float(match.group(1).replace("_", "."))
        if 0.001 <= value <= 1:
            candidates.append(value)
    return candidates[-1] if candidates else None


def _point_direction(point: dict) -> str | None:
    """Classify one WBCS record by the measured current and matching capacity."""

    if point["current"] > 1e-9 and point["charge_q"] > 1e-8:
        return "charge"
    if point["current"] < -1e-9 and point["discharge_q"] > 1e-8:
        return "discharge"
    return None


def _capacity_for_direction(point: dict, direction: str) -> float:
    return point["charge_q"] if direction == "charge" else point["discharge_q"]


def _trace_point_budget(trace_count: int) -> int:
    """Return a fair per-trace point budget for one WRD export."""

    safe_trace_count = max(1, int(trace_count))
    return max(1, min(MAX_POINTS_PER_TRACE, MAX_TOTAL_CYC_POINTS // safe_trace_count))


def _downsample_trace(points: list[dict], maximum: int = MAX_POINTS_PER_TRACE) -> list[dict]:
    """Retain evenly spaced acquisition points, including both endpoints."""

    maximum = max(1, int(maximum))
    if len(points) <= maximum:
        return points
    indexes = {
        round(index * (len(points) - 1) / (maximum - 1)) if maximum > 1 else 0
        for index in range(maximum)
    }
    return [point for index, point in enumerate(points) if index in indexes]


def _merge_continuation_segments(candidates: list[dict]) -> list[dict]:
    """Join WBCS chunks that split one physical charge or discharge trace.

    Some exports reset the cumulative counter mid-trace.  Those chunks have
    the same current direction and begin well inside the preceding capacity
    range.  A new cycle instead starts close to zero and must remain separate.
    """

    merged: list[dict] = []
    for candidate in candidates:
        direction = candidate["direction"]
        segment = candidate["segment"]
        if not merged or merged[-1]["direction"] != direction:
            merged.append({"direction": direction, "segment": list(segment)})
            continue

        previous = merged[-1]["segment"]
        previous_max = _capacity_for_direction(previous[-1], direction)
        next_start = _capacity_for_direction(segment[0], direction)
        if previous_max <= 0 or next_start < previous_max * CONTINUATION_CAPACITY_RATIO:
            merged.append({"direction": direction, "segment": list(segment)})
            continue

        # Drop the overlapping counter-reset portion so each merged trace is
        # monotonic in capacity. This is essential for a valid derivative.
        continuation = [
            point
            for point in segment
            if _capacity_for_direction(point, direction) > previous_max + 1e-10
        ]
        previous.extend(continuation)
    return merged


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
        points.append(
            {
                "offset": match.start(),
                "range": match.group().decode("ascii"),
                "voltage": voltage,
                "current": current,
                "charge_q": charge_q,
                "discharge_q": discharge_q,
            }
        )
    points.sort(key=lambda item: item["offset"])
    segments, current_segment = [], []
    for point in points:
        direction = _point_direction(point)
        if direction is None:
            if current_segment:
                segments.append(current_segment)
            current_segment = []
            continue
        point["direction"] = direction
        capacity_q = _capacity_for_direction(point, direction)
        same_segment = (
            current_segment
            and direction == current_segment[-1]["direction"]
            and capacity_q >= _capacity_for_direction(current_segment[-1], direction) - 1e-5
            and point["offset"] - current_segment[-1]["offset"] < 50000
        )
        if not current_segment or same_segment:
            current_segment.append(point)
        else:
            if current_segment:
                segments.append(current_segment)
            current_segment = [point]
    if current_segment:
        segments.append(current_segment)

    segment_records = []
    for segment in segments:
        direction = segment[0]["direction"]
        max_q = max(_capacity_for_direction(item, direction) for item in segment)
        voltages = [item["voltage"] for item in segment]
        segment_records.append(
            {
                "direction": direction,
                "segment": segment,
                "max_q": max_q,
                "voltage_span": max(voltages) - min(voltages),
            }
        )

    candidates = [
        candidate for candidate in segment_records if candidate["max_q"] >= MIN_CAPACITY_AH
    ]
    if not candidates:
        # Low-mass or interrupted experiments can finish below the normal
        # 0.1 mAh threshold. Keep them only when they still contain a measured
        # trace with enough points, capacity change, and voltage movement.
        # This rejects short binary metadata fragments while preserving useful
        # partial cycling data for diagnosis and comparison.
        candidates = [
            candidate
            for candidate in segment_records
            if len(candidate["segment"]) >= MIN_INCOMPLETE_TRACE_POINTS
            and candidate["max_q"] >= MIN_INCOMPLETE_CAPACITY_AH
            and candidate["voltage_span"] >= MIN_INCOMPLETE_VOLTAGE_SPAN
        ]

    if len(candidates) >= 3:
        typical_q = median(candidate["max_q"] for candidate in candidates)
        typical_points = median(len(candidate["segment"]) for candidate in candidates)
        minimum_complete_points = max(3, typical_points * 0.2)
        candidates = [
            candidate
            for candidate in candidates
            # WBCS can include a brief interrupted start/end fragment. A complete
            # low-capacity cycle is retained because it has a normal point count.
            if not (
                candidate["max_q"] < typical_q * 0.15
                and len(candidate["segment"]) < minimum_complete_points
            )
        ]

    # Keep both current directions. Earlier versions retained only discharge
    # records, making charge profiles and charge dQ/dV impossible even when
    # the raw WRD included the required measurements.
    candidates = _merge_continuation_segments(candidates)
    trace_point_budget = _trace_point_budget(len(candidates))
    rows = [
        [
            "cycle",
            "point",
            "direction",
            "specific capacity (mAh g-1)",
            "charge Q (Ah)",
            "discharge Q (Ah)",
            "voltage (V)",
            "current (A)",
            "range",
        ]
    ]
    cycle_index = 0
    previous_direction = None
    for candidate in candidates:
        direction = candidate["direction"]
        # A charge followed by its discharge belongs to one cycle. Every other
        # new trace starts another cycle, including standalone discharge data.
        if not (previous_direction == "charge" and direction == "discharge"):
            cycle_index += 1
        for point_index, point in enumerate(
            _downsample_trace(candidate["segment"], trace_point_budget), start=1
        ):
            capacity_q = _capacity_for_direction(point, direction)
            specific_capacity = capacity_q * 1000 / mass_g if mass_g else ""
            rows.append(
                [
                    cycle_index,
                    point_index,
                    direction,
                    specific_capacity,
                    point["charge_q"] if direction == "charge" else "",
                    point["discharge_q"] if direction == "discharge" else "",
                    point["voltage"],
                    point["current"],
                    point["range"],
                ]
            )
        previous_direction = direction
    if len(rows) == 1:
        raise RuntimeError(
            "The WRD file does not contain enough measured points, capacity change, "
            "or voltage span for a cycling curve."
        )
    return rows, "WRD charge/discharge traces"
