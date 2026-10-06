import csv
import argparse
import json
import math
import re
import struct
import sys
from pathlib import Path

APP_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(APP_ROOT))
for dep_dir in (APP_ROOT / "wheeldeps", APP_ROOT / "xlsbdeps", APP_ROOT / "pydeps"):
    if dep_dir.exists():
        sys.path.insert(0, str(dep_dir))

from backend.parsers import PARSER_VERSION, inspect_path
from backend.parsers.wrd import read_wrd_c_rate_reference, read_wrd_electrode_info


# This response is parsed and rendered by the browser before a Dataset is saved.
# Keep it small enough for large WBCS WRD files while the upload session retains
# the full canonical source for durable storage and later server-side analysis.
MAX_INSPECTION_ROWS = 1_500


def _evenly_sample(items, maximum):
    """Keep ordered endpoints while reducing one continuous trace."""

    if len(items) <= maximum:
        return list(items)
    if maximum <= 1:
        return [items[0]]
    indexes = {
        round(index * (len(items) - 1) / (maximum - 1))
        for index in range(maximum)
    }
    return [item for index, item in enumerate(items) if index in indexes]


def _inspection_trace_key(row, cycle_column, direction_column, current_column):
    """Return a stable CYC trace key, or ``None`` for non-CYC tables."""

    try:
        cycle_value = float(row.get(cycle_column, ""))
    except (TypeError, ValueError):
        return None
    if not math.isfinite(cycle_value) or cycle_value < 1:
        return None
    cycle = int(round(cycle_value)) if abs(cycle_value - round(cycle_value)) < 1e-6 else round(cycle_value, 6)

    direction = str(row.get(direction_column, "")).strip().lower() if direction_column else ""
    if "discharge" in direction or "방전" in direction:
        direction = "discharge"
    elif "charge" in direction or "충전" in direction:
        direction = "charge"
    else:
        try:
            current = float(row.get(current_column, "")) if current_column else 0.0
        except (TypeError, ValueError):
            current = 0.0
        direction = "charge" if current > 0 else "discharge" if current < 0 else "trace"
    return cycle, direction


def limit_inspection_rows(rows, columns, maximum=MAX_INSPECTION_ROWS):
    """Limit browser output without dropping later CYC charge/discharge traces.

    A plain ``rows[:5000]`` can contain only the start of a long WBCS file.
    For CYC tables, split the payload into ordered cycle/direction traces and
    give every trace an equal share of the response budget. Other formats use
    an endpoint-preserving global sample.
    """

    if len(rows) <= maximum:
        return rows

    cycle_column = find_column(columns, ["cycle", "cycle number", "cycle index", "cycle no", "cycle #"])
    if not cycle_column:
        return _evenly_sample(rows, maximum)
    direction_column = find_column(columns, ["direction", "mode", "step type"])
    current_column = find_column(columns, ["current (a)", "current", "avg current", "i (a)"])
    traces = {}
    for row in rows:
        key = _inspection_trace_key(row, cycle_column, direction_column, current_column)
        if key is None:
            return _evenly_sample(rows, maximum)
        traces.setdefault(key, []).append(row)

    if len(traces) <= 1:
        return _evenly_sample(rows, maximum)

    base, remainder = divmod(maximum, len(traces))
    sampled = []
    for trace_index, trace in enumerate(traces.values()):
        budget = base + (1 if trace_index < remainder else 0)
        sampled.extend(_evenly_sample(trace, max(1, budget)))
    return sampled


def read_csv(path: Path):
    raw = path.read_bytes()
    for enc in ("utf-8-sig", "utf-8", "cp949"):
        try:
            text = raw.decode(enc)
            break
        except UnicodeDecodeError:
            continue
    else:
        text = raw.decode("utf-8", errors="replace")
    sample = text.splitlines()[:5]
    dialect = csv.Sniffer().sniff("\n".join(sample), delimiters=",\t;")
    rows = list(csv.reader(text.splitlines(), dialect))
    return rows


def read_sheet_rows(ws):
    rows = []
    for row in ws.iter_rows(values_only=True):
        rows.append(["" if cell is None else cell for cell in row])
        if len(rows) >= 5001:
            break
    return rows


def sheet_score(rows):
    if not rows:
        return -1
    idx = choose_header_row(rows)
    cols = rows[idx] if idx < len(rows) else []
    score = header_score(cols) * 10
    numeric_rows = 0
    for row in rows[idx + 1: min(len(rows), idx + 31)]:
        numeric_count = 0
        for cell in row:
            if isinstance(cell, (int, float)):
                numeric_count += 1
            else:
                try:
                    if str(cell).strip():
                        float(str(cell).strip())
                        numeric_count += 1
                except ValueError:
                    pass
        if numeric_count >= 2:
            numeric_rows += 1
    return score + numeric_rows


def read_xlsx(path: Path):
    with open(path, "rb") as handle:
        wb = openpyxl.load_workbook(handle, read_only=True, data_only=True)
        best_rows = []
        best_name = ""
        best_score = -1
        for ws in wb.worksheets:
            rows = read_sheet_rows(ws)
            score = sheet_score(rows)
            if score > best_score:
                best_rows = rows
                best_name = ws.title
                best_score = score
        return best_rows, best_name


def dataframe_to_rows(df):
    df = df.dropna(how="all")
    df = df.dropna(axis=1, how="all")
    rows = [list(df.columns)]
    rows.extend(df.where(df.notna(), "").values.tolist())
    return rows


def read_excel_with_pandas(path: Path, engine: str):
    if pd is None:
        raise RuntimeError("pandas가 없어 이 Excel 형식을 읽을 수 없습니다.")
    try:
        sheets = pd.read_excel(path, sheet_name=None, header=None, engine=engine)
    except ImportError as exc:
        if engine == "pyxlsb":
            raise RuntimeError(".xlsb 파일을 읽으려면 pyxlsb 라이브러리가 필요합니다. Excel에서 '다른 이름으로 저장'으로 .xlsx로 변환해서 넣어주세요.") from exc
        if engine == "xlrd":
            raise RuntimeError(".xls 파일을 읽으려면 xlrd 라이브러리가 필요합니다. Excel에서 '다른 이름으로 저장'으로 .xlsx로 변환해서 넣어주세요.") from exc
        raise
    best_rows = []
    best_name = ""
    best_score = -1
    for name, df in sheets.items():
        rows = dataframe_to_rows(df)
        score = sheet_score(rows)
        if score > best_score:
            best_rows = rows
            best_name = str(name)
            best_score = score
    return best_rows, best_name


def extract_wrd_mass_g(path: Path, blob: bytes):
    text = path.name + "\n"
    for match in re.finditer(rb"[ -~]{8,}", blob[:200000]):
        text += "\n" + match.group().decode("ascii", errors="ignore")
    candidates = []
    for match in re.finditer(r"(\d+(?:[._]\d+)?)\s*g", text, flags=re.IGNORECASE):
        value = float(match.group(1).replace("_", "."))
        if 0.001 <= value <= 1:
            candidates.append(value)
    return candidates[-1] if candidates else None


def read_wrd(path: Path):
    blob = path.read_bytes()
    if b"WbcsFile" not in blob or b"DISCHARGE Q" not in blob:
        raise RuntimeError("WRD 파일에서 WBCS CYC 데이터 구조를 찾지 못했습니다.")

    mass_g = extract_wrd_mass_g(path, blob)
    unit_re = re.compile(rb"\d+(?:\.\d+)?(?:uA|mA|A)")
    points = []
    for match in unit_re.finditer(blob):
        pos = match.end()
        if pos + 48 > len(blob):
            continue
        voltage, current, charge_q, discharge_q, charge_e, discharge_e = struct.unpack_from("<6d", blob, pos)
        if not (0.5 <= voltage <= 5.5):
            continue
        if not (-0.2 <= current <= 0.2):
            continue
        if not (0 <= charge_q <= 0.2 and 0 <= discharge_q <= 0.2):
            continue
        if not (0 <= abs(charge_e) <= 2 and 0 <= abs(discharge_e) <= 2):
            continue
        points.append({
            "offset": match.start(),
            "range": match.group().decode("ascii", errors="ignore"),
            "voltage": voltage,
            "current": current,
            "charge_q": charge_q,
            "discharge_q": discharge_q,
        })

    points.sort(key=lambda item: item["offset"])
    segments = []
    current_segment = []
    previous_q = 0
    for point in points:
        discharge_q = point["discharge_q"]
        if discharge_q > 1e-8 and point["current"] < 0:
            same_segment = (
                current_segment
                and discharge_q >= previous_q - 1e-5
                and point["offset"] - current_segment[-1]["offset"] < 50000
            )
            if not current_segment or same_segment:
                current_segment.append(point)
            else:
                segments.append(current_segment)
                current_segment = [point]
        else:
            if current_segment:
                segments.append(current_segment)
                current_segment = []
        previous_q = discharge_q
    if current_segment:
        segments.append(current_segment)

    rows = [[
        "cycle",
        "discharge capacity (mAh g-1)",
        "discharge Q (Ah)",
        "end voltage (V)",
        "avg current (A)",
        "points",
        "range",
    ]]
    for segment in segments:
        max_q = max(item["discharge_q"] for item in segment)
        if max_q < 1e-4:
            continue
        end = max(segment, key=lambda item: item["discharge_q"])
        avg_current = sum(item["current"] for item in segment) / len(segment)
        specific_capacity = max_q * 1000 / mass_g if mass_g else ""
        rows.append([
            len(rows),
            specific_capacity,
            max_q,
            end["voltage"],
            avg_current,
            len(segment),
            end["range"],
        ])

    if len(rows) == 1:
        raise RuntimeError("WRD 파일에서 방전용량 구간을 찾지 못했습니다.")
    return rows, "WRD discharge summary"


def seo_float(blob: bytes, offset: int) -> float:
    return struct.unpack_from("<f", blob, offset)[0]


def is_plausible_seo_frequency(value: float) -> bool:
    return math.isfinite(value) and 0.005 <= value <= 200000


def is_plausible_seo_impedance(value: float) -> bool:
    return math.isfinite(value) and abs(value) <= 1e7


def find_seo_sweeps(blob: bytes):
    """Find Solartron/Smart Manager .SEO EIS sweeps.

    The .SEO files from this instrument store each EIS point in a compact
    binary record. In the sample files, a sweep starts at 100 kHz and each
    record is 112 bytes. Offsets inside each record are:
      +0  frequency (Hz), +28 Z real (ohm), +32 Z imag (ohm)
    The same file can contain repeated sweeps, so this returns every valid
    sweep start rather than only the first one.
    """
    stride = 112
    starts = []
    for offset in range(0, max(0, len(blob) - stride * 3)):
        try:
            f0 = seo_float(blob, offset)
            f1 = seo_float(blob, offset + stride)
            f2 = seo_float(blob, offset + stride * 2)
        except struct.error:
            continue
        if 99000 <= f0 <= 101000 and 78000 <= f1 <= 80500 and 62000 <= f2 <= 64000:
            starts.append(offset)
    return starts


def read_seo(path: Path):
    blob = path.read_bytes()
    stride = 112
    max_points_per_sweep = 122
    starts = find_seo_sweeps(blob)
    if not starts:
        raise RuntimeError("SEO 파일에서 EIS sweep 구조를 찾지 못했습니다. CSV/XLSX로 변환한 파일이 있으면 함께 확인해 주세요.")

    rows = [["sweep", "point", "frequency", "zreal", "zimag", "mag", "phase"]]
    for sweep_no, start in enumerate(starts, start=1):
        for point_no in range(1, max_points_per_sweep + 1):
            offset = start + (point_no - 1) * stride
            if offset + 36 > len(blob):
                break
            frequency = seo_float(blob, offset)
            zreal = seo_float(blob, offset + 28)
            zimag = seo_float(blob, offset + 32)
            if not (
                is_plausible_seo_frequency(frequency)
                and is_plausible_seo_impedance(zreal)
                and is_plausible_seo_impedance(zimag)
            ):
                break
            mag = math.hypot(zreal, zimag)
            phase = math.degrees(math.atan2(zimag, zreal))
            rows.append([sweep_no, point_no, frequency, zreal, zimag, mag, phase])

    if len(rows) == 1:
        raise RuntimeError("SEO 파일에서 frequency, zreal, zimag 값을 읽지 못했습니다.")
    return rows, "SEO EIS binary"


def normalize_header(value):
    return str(value or "").strip()


def header_score(row):
    text = " ".join(str(x).lower() for x in row)
    keywords = [
        "freq", "frequency", "hz", "zreal", "zimag", "impedance",
        "cycle", "capacity", "charge", "discharge", "efficiency",
        "voltage", "potential", "current", "scan", "time",
        "주파수", "전압", "전류", "용량", "사이클", "효율",
    ]
    score = sum(1 for key in keywords if key in text)
    score += sum(1 for x in row if isinstance(x, str) and x.strip())
    return score


def choose_header_row(raw_rows):
    candidates = raw_rows[:15]
    best_idx = 0
    best_score = -1
    for idx, row in enumerate(candidates):
        score = header_score(row)
        if score > best_score:
            best_score = score
            best_idx = idx
    return best_idx


def to_float(value):
    if isinstance(value, (int, float)):
        return float(value)
    try:
        text = str(value).strip()
        return float(text) if text else None
    except ValueError:
        return None


def key_of(name):
    return re.sub(r"[^a-z0-9가-힣]+", "", str(name or "").lower())


def find_column(columns, needles):
    normalized = []
    for col in columns:
        normalized.append(key_of(col))
    for needle in needles:
        n = key_of(needle)
        for idx, col in enumerate(normalized):
            if n and n in col:
                return columns[idx]
    return None


def has_any_term(key, terms):
    return any(term in key for term in terms)


def is_discharge_column(key):
    return has_any_term(key, ["방전", "discharge", "dchg", "dch"])


def is_charge_only_column(key):
    return key.startswith("charge") or key.startswith("chg") or "충전" in key


def is_specific_capacity_column(key):
    return has_any_term(key, ["specificcapacity", "단위", "mahg", "ahg"])


def is_capacity_column(key):
    return has_any_term(key, ["capacity", "cap", "용량", "mah", "ah"])


def find_best_cyc_column(columns, role):
    scored = []
    for col in columns:
        key = key_of(col)
        discharge = is_discharge_column(key)
        charge_only = is_charge_only_column(key)
        specific = is_specific_capacity_column(key)
        capacity = is_capacity_column(key)
        score = 0
        if role == "discharge_specific" and discharge and capacity and specific:
            score = 120
        elif role == "charge_specific" and charge_only and capacity and specific:
            score = 120
        elif role == "discharge_capacity" and discharge and capacity:
            score = 70 if specific else 100
        elif role == "charge_capacity" and charge_only and capacity:
            score = 70 if specific else 100

        if role.startswith("discharge") and charge_only:
            score = 0
        if role.startswith("charge") and discharge:
            score = 0
        if has_any_term(key, ["누적", "energy", "에너지"]):
            score -= 40
        if has_any_term(key, ["final", "최종", "전압"]):
            score -= 40
        if score > 0:
            scored.append((score, col))
    scored.sort(key=lambda item: item[0], reverse=True)
    return scored[0][1] if scored else None


def scale_capacity_for_report(value, column):
    if value is None:
        return None
    key = key_of(column)
    if "ahg" in key and "mahg" not in key:
        return value * 1000
    return value


def capacity_unit_for_column(column):
    key = key_of(column)
    if "ahg" in key or "mahg" in key or "specificcapacity" in key:
        return "mAh g-1"
    if "ah" in key:
        return "Ah"
    return "mAh g-1"


def build_validation(columns, rows, sheet_name):
    notes = []
    warnings = []
    stats = {
        "rowCount": len(rows),
        "sheetName": sheet_name,
    }
    freq_col = find_column(columns, ["frequency", "freq", "hz", "주파수"])
    zreal_col = find_column(columns, ["zreal", "real", "re", "zprime"])
    zimag_col = find_column(columns, ["zimag", "imag", "im", "zdoubleprime"])
    if freq_col and zreal_col and zimag_col:
        frequencies = [to_float(row.get(freq_col)) for row in rows]
        zreals = [to_float(row.get(zreal_col)) for row in rows]
        zimags = [to_float(row.get(zimag_col)) for row in rows]
        frequencies = [v for v in frequencies if v is not None and v > 0]
        zreals = [v for v in zreals if v is not None]
        zimags = [v for v in zimags if v is not None]
        if frequencies:
            stats["frequencyColumn"] = freq_col
            stats["frequencyMinHz"] = min(frequencies)
            stats["frequencyMaxHz"] = max(frequencies)
            notes.append(f"EIS frequency {min(frequencies):.4g}~{max(frequencies):.4g} Hz 범위로 읽었습니다.")
        if zreals:
            stats["zRealColumn"] = zreal_col
            stats["zRealMinOhm"] = min(zreals)
            stats["zRealMaxOhm"] = max(zreals)
            notes.append(f"Z real {min(zreals):.4g}~{max(zreals):.4g} ohm 범위입니다.")
        if zimags:
            stats["zImagColumn"] = zimag_col
            stats["zImagMinOhm"] = min(zimags)
            stats["zImagMaxOhm"] = max(zimags)
        if len(rows) < 10:
            warnings.append("EIS 포인트 수가 적습니다. 파일이 일부만 저장된 것은 아닌지 확인해 주세요.")
        if not frequencies or not zreals or not zimags:
            warnings.append("frequency, zreal, zimag 중 일부 숫자값을 충분히 읽지 못했습니다.")
        if not warnings:
            notes.append("기본 EIS 검토에서 큰 오류 신호는 보이지 않습니다.")
        return {"stats": stats, "notes": notes, "warnings": warnings}

    cycle_col = find_column(columns, ["cycle", "사이클"])
    cap_col = (
        find_best_cyc_column(columns, "discharge_specific")
        or find_best_cyc_column(columns, "discharge_capacity")
        or find_column(columns, ["discharge capacity", "specific capacity", "방전용량"])
    )
    q_col = find_column(columns, ["discharge q", "방전 q"])
    point_col = find_column(columns, ["points"])
    current_col = find_column(columns, ["avg current", "current", "전류"])
    range_col = find_column(columns, ["range", "current range"])

    if len(rows) == 0:
        warnings.append("읽힌 데이터 행이 없습니다.")
    elif len(rows) < 3:
        warnings.append("데이터 행이 매우 적습니다. 헤더 행이 잘못 잡혔을 수 있습니다.")

    if cap_col:
        values = [scale_capacity_for_report(to_float(row.get(cap_col)), cap_col) for row in rows]
        values = [v for v in values if v is not None]
        if values:
            unit = capacity_unit_for_column(cap_col)
            stats["capacityColumn"] = cap_col
            stats["capacityUnit"] = unit
            stats["capacityMin"] = min(values)
            stats["capacityMax"] = max(values)
            stats["capacityMedian"] = sorted(values)[len(values) // 2]
            notes.append(f"방전용량 {stats['capacityMin']:.3g}~{stats['capacityMax']:.3g} {unit} 범위로 읽었습니다.")
            if unit == "mAh g-1" and stats["capacityMax"] > 350:
                warnings.append("방전용량 최대값이 350 mAh g-1을 넘습니다. 단위가 mAh/g인지 확인하세요.")
            if stats["capacityMin"] <= 0:
                warnings.append("0 이하의 방전용량 값이 있습니다.")
        else:
            warnings.append("방전용량 컬럼은 찾았지만 숫자 값을 읽지 못했습니다.")
    else:
        warnings.append("방전용량으로 보이는 컬럼을 찾지 못했습니다.")

    if cycle_col:
        cycles = [to_float(row.get(cycle_col)) for row in rows]
        cycles = [v for v in cycles if v is not None]
        if cycles:
            stats["cycleColumn"] = cycle_col
            stats["cycleMin"] = min(cycles)
            stats["cycleMax"] = max(cycles)
            notes.append(f"cycle {stats['cycleMin']:.0f}~{stats['cycleMax']:.0f}까지 읽었습니다.")
            if len(set(cycles)) != len(cycles):
                warnings.append("중복 cycle 번호가 있습니다.")
    else:
        warnings.append("cycle 번호 컬럼을 찾지 못했습니다.")

    if q_col:
        qs = [to_float(row.get(q_col)) for row in rows]
        qs = [v for v in qs if v is not None]
        if qs:
            stats["dischargeQMaxAh"] = max(qs)

    if current_col:
        currents = [to_float(row.get(current_col)) for row in rows]
        currents = [v for v in currents if v is not None]
        if currents:
            stats["avgCurrentMinA"] = min(currents)
            stats["avgCurrentMaxA"] = max(currents)

    if point_col and cycle_col:
        low_point_cycles = []
        for row in rows:
            points = to_float(row.get(point_col))
            cycle = to_float(row.get(cycle_col))
            if points is not None and cycle is not None and points < 20:
                low_point_cycles.append(int(cycle))
        if low_point_cycles:
            stats["lowPointCycles"] = low_point_cycles[:12]
            warnings.append("일부 cycle의 데이터 포인트 수가 적습니다: " + ", ".join(map(str, low_point_cycles[:12])))

    if range_col:
        ranges = []
        for row in rows:
            value = str(row.get(range_col, "")).strip()
            if value and value not in ranges:
                ranges.append(value)
        if ranges:
            stats["ranges"] = ranges[:12]
            notes.append("전류 range: " + ", ".join(ranges[:12]))

    if not warnings:
        notes.append("기본 검토에서 큰 오류 신호는 보이지 않습니다.")
    return {"stats": stats, "notes": notes, "warnings": warnings}


def main():
    argument_parser = argparse.ArgumentParser(
        description="Inspect an instrument file and return normalized rows."
    )
    argument_parser.add_argument("path", help="Path to the instrument export")
    argument_parser.add_argument(
        "--full",
        action="store_true",
        help="Return every parsed row for server-side analysis instead of a browser preview.",
    )
    args = argument_parser.parse_args()
    path = Path(args.path)
    try:
        raw_rows, sheet_name, parser_name = inspect_path(path)
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        raise SystemExit(2)

    raw_rows = [row for row in raw_rows if any(str(cell).strip() for cell in row)]
    if not raw_rows:
        print(json.dumps({"columns": [], "rows": []}, ensure_ascii=False))
        return

    header_idx = choose_header_row(raw_rows)
    columns = [normalize_header(x) or f"col_{idx + 1}" for idx, x in enumerate(raw_rows[header_idx])]
    parsed_rows = []
    for raw in raw_rows[header_idx + 1:]:
        item = {}
        for idx, col in enumerate(columns):
            value = raw[idx] if idx < len(raw) else ""
            if isinstance(value, (int, float)):
                item[col] = value
            else:
                text = str(value).strip()
                try:
                    item[col] = float(text) if text else ""
                except ValueError:
                    item[col] = text
        parsed_rows.append(item)
    # The browser must receive a compact preview, but the API needs the complete
    # within-cycle trace for capacity/voltage and dQ/dV calculations.  The
    # backend explicitly requests --full and trims only its outgoing response.
    rows = parsed_rows if args.full else limit_inspection_rows(parsed_rows, columns)
    validation = build_validation(columns, parsed_rows, sheet_name)
    parser = {"name": parser_name, "version": PARSER_VERSION}
    if parser_name == "wrd":
        reference = read_wrd_c_rate_reference(path)
        if reference is not None:
            parser["cRateReference"] = reference
        electrode_info = read_wrd_electrode_info(path)
        if electrode_info is not None:
            parser["electrodeInfo"] = electrode_info
    print(json.dumps({
        "columns": columns,
        "rows": rows,
        "rowCount": len(parsed_rows),
        "headerRow": header_idx + 1,
        "sheetName": sheet_name,
        "validation": validation,
        "parser": parser,
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
