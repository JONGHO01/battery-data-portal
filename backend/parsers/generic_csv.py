"""Delimited text parser with conservative encoding and delimiter detection."""

from __future__ import annotations

import csv
from pathlib import Path


def read_csv(path: Path) -> tuple[list[list], str]:
    raw = path.read_bytes()
    for encoding in ("utf-8-sig", "utf-8", "cp949"):
        try:
            text = raw.decode(encoding)
            break
        except UnicodeDecodeError:
            continue
    else:
        text = raw.decode("utf-8", errors="replace")
    sample = text.splitlines()[:5]
    try:
        dialect = csv.Sniffer().sniff("\n".join(sample), delimiters=",\t;")
    except csv.Error:
        dialect = csv.excel
    return list(csv.reader(text.splitlines(), dialect)), "CSV"
