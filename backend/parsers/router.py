"""Select the narrowest parser that can safely read an uploaded file."""

from __future__ import annotations

import zipfile
from pathlib import Path

from .generic_csv import read_csv
from .generic_excel import read_excel_with_pandas, read_xlsx
from .seo import read_seo
from .wrd import read_wrd


# Bump this whenever an instrument parser changes its interpreted values. The
# portal uses it to distinguish data imported with older parser behavior.
PARSER_VERSION = "parser-6"


def parser_key_for_path(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix == ".wrd":
        return "wrd"
    if suffix in {".seo", ".sde"}:
        return "seo"
    if suffix in {".xlsx", ".xlsm", ".xls", ".xlsb"}:
        return "excel"
    if suffix in {".csv", ".tsv", ".txt"}:
        return "csv"
    raise ValueError(f"Unsupported file extension: {suffix or '(none)'}")


def inspect_path(path: Path) -> tuple[list[list], str, str]:
    key = parser_key_for_path(path)
    head = path.read_bytes()[:8]
    is_ole_excel = head.startswith(b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1")
    if key == "wrd":
        rows, sheet = read_wrd(path)
    elif key == "seo":
        rows, sheet = read_seo(path)
    elif key == "csv":
        rows, sheet = read_csv(path)
    elif path.suffix.lower() in {".xlsx", ".xlsm"} or zipfile.is_zipfile(path):
        rows, sheet = read_xlsx(path)
    elif path.suffix.lower() == ".xlsb":
        rows, sheet = read_excel_with_pandas(path, "pyxlsb")
    elif path.suffix.lower() == ".xls" and is_ole_excel:
        rows, sheet = read_excel_with_pandas(path, "xlrd")
    else:
        rows, sheet = read_csv(path)
    return rows, sheet, key
