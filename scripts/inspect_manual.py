import json
import sys
from pathlib import Path

import openpyxl


RATE_LABELS = ["0.1 C", "0.33 C", "1 C", "2 C", "3 C", "4 C"]


def num(value):
    try:
        if value is None or value == "":
            return None
        return float(value)
    except (TypeError, ValueError):
        return None


def first_number(values):
    for value in values:
        n = num(value)
        if n is not None:
            return n
    return None


def fmt(value, digits=4):
    if value is None:
        return ""
    return round(float(value), digits)


def parse_sheet(ws):
    rows = list(ws.iter_rows(values_only=True))
    theoretical = None
    composition = {}
    sample_rows = []

    for row in rows[:12]:
        cells = list(row)
        key = str(cells[0] or "").strip().lower() if cells else ""
        if "ncm(mah/g)" in key or "lfp(mah/g)" in key:
            theoretical = first_number(cells[1:4])
        if key in {"ncm", "super p", "ptfe"}:
            composition[key.upper() if key == "ncm" else key] = first_number(cells[1:4])

    for idx, row in enumerate(rows):
        cells = list(row)
        label = str(cells[0] or "").strip()
        if not label.endswith("번"):
            continue
        next_row = list(rows[idx + 1]) if idx + 1 < len(rows) else []
        current_row = list(rows[idx + 4]) if idx + 4 < len(rows) else []
        one_c_ma = num(next_row[1] if len(next_row) > 1 else None)
        electrode_weight = num(next_row[2] if len(next_row) > 2 else None)
        thickness = num(next_row[3] if len(next_row) > 3 else None)
        ncm_mass = num(next_row[5] if len(next_row) > 5 else None)
        loading = num(next_row[12] if len(next_row) > 12 else None)
        rate_currents = []
        for ridx, rate in enumerate(RATE_LABELS, start=1):
            raw = num(current_row[ridx] if len(current_row) > ridx else None)
            current_ma = raw * 1000 if raw is not None and abs(raw) < 1 else raw
            if current_ma is not None:
                rate_currents.append({"rate": rate, "current_mA": fmt(current_ma)})
        if one_c_ma is None and ncm_mass is not None and theoretical is not None:
            one_c_ma = ncm_mass * theoretical
        if one_c_ma is None or one_c_ma <= 0:
            continue
        sample_rows.append({
            "sample": label,
            "oneC_mA": fmt(one_c_ma),
            "electrodeWeight_g": fmt(electrode_weight, 6),
            "thickness_mm": fmt(thickness, 4),
            "ncmMass_g": fmt(ncm_mass, 6),
            "loadingAmount": fmt(loading, 6),
            "rateCurrents": rate_currents,
        })

    return {
        "sheet": ws.title,
        "theoreticalCapacity_mAh_g": fmt(theoretical, 3),
        "composition": composition,
        "samples": sample_rows[:30],
        "sampleCount": len(sample_rows),
    }


def main():
    path = Path(sys.argv[1])
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    sheets = [parse_sheet(ws) for ws in wb.worksheets]
    sheets = [s for s in sheets if s["sampleCount"]]
    print(json.dumps({
        "filename": path.name,
        "sheetCount": len(wb.worksheets),
        "sheets": sheets[:25],
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
