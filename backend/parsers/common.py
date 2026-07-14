"""Shared tabular parser helpers."""

from __future__ import annotations

from typing import Any


def normalize_header(value: Any) -> str:
    return str(value or "").strip()


def header_score(row: list[Any]) -> int:
    text = " ".join(str(value).lower() for value in row)
    keywords = (
        "freq", "frequency", "hz", "zreal", "zimag", "impedance",
        "cycle", "capacity", "charge", "discharge", "efficiency",
        "voltage", "current", "time", "step",
    )
    return sum(4 for keyword in keywords if keyword in text) + sum(1 for value in row if str(value).strip())


def choose_header_row(raw_rows: list[list[Any]]) -> int:
    candidates = raw_rows[:15]
    if not candidates:
        return 0
    return max(range(len(candidates)), key=lambda index: header_score(candidates[index]))


def read_sheet_rows(worksheet, limit: int = 5001) -> list[list[Any]]:
    rows = []
    for row in worksheet.iter_rows(values_only=True):
        rows.append(["" if cell is None else cell for cell in row])
        if len(rows) >= limit:
            break
    return rows


def sheet_score(rows: list[list[Any]]) -> int:
    if not rows:
        return -1
    header_index = choose_header_row(rows)
    score = header_score(rows[header_index] if header_index < len(rows) else []) * 10
    numeric_rows = 0
    for row in rows[header_index + 1: min(len(rows), header_index + 31)]:
        numeric_count = 0
        for cell in row:
            try:
                if str(cell).strip():
                    float(str(cell).strip())
                    numeric_count += 1
            except (TypeError, ValueError):
                pass
        if numeric_count >= 2:
            numeric_rows += 1
    return score + numeric_rows


def dataframe_to_rows(dataframe) -> list[list[Any]]:
    dataframe = dataframe.dropna(how="all").dropna(axis=1, how="all")
    rows = [list(dataframe.columns)]
    rows.extend(dataframe.where(dataframe.notna(), "").values.tolist())
    return rows
