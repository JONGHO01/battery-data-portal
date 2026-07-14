"""Excel parsers used for modern, legacy, and binary workbook files."""

from __future__ import annotations

from pathlib import Path

from .common import dataframe_to_rows, read_sheet_rows, sheet_score


def read_xlsx(path: Path) -> tuple[list[list], str]:
    import openpyxl

    with path.open("rb") as handle:
        workbook = openpyxl.load_workbook(handle, read_only=True, data_only=True)
        best_rows: list[list] = []
        best_name = ""
        best_score = -1
        for worksheet in workbook.worksheets:
            rows = read_sheet_rows(worksheet)
            score = sheet_score(rows)
            if score > best_score:
                best_rows, best_name, best_score = rows, worksheet.title, score
        return best_rows, best_name


def read_excel_with_pandas(path: Path, engine: str) -> tuple[list[list], str]:
    try:
        import pandas as pandas
    except ImportError as exc:
        raise RuntimeError("This Excel format requires pandas and its reader dependency.") from exc
    try:
        sheets = pandas.read_excel(path, sheet_name=None, header=None, engine=engine)
    except ImportError as exc:
        raise RuntimeError(f"This Excel format requires the {engine} reader dependency.") from exc
    best_rows: list[list] = []
    best_name = ""
    best_score = -1
    for name, dataframe in sheets.items():
        rows = dataframe_to_rows(dataframe)
        score = sheet_score(rows)
        if score > best_score:
            best_rows, best_name, best_score = rows, str(name), score
    return best_rows, best_name
