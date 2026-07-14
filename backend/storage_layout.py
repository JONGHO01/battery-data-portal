"""Stable storage object names for raw data and derived artifacts."""

from __future__ import annotations

import re


def safe_segment(value: str) -> str:
    text = str(value or "").strip().lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = text.strip("-")
    return text[:80] or "unassigned"


def safe_filename(value: str) -> str:
    text = str(value or "artifact").strip().lower()
    text = re.sub(r"[^a-z0-9._-]+", "-", text)
    text = re.sub(r"-+", "-", text).strip("-.")
    return text[:120] or "artifact"


def artifact_key(project_id: str, cell_id: str, dataset_id: str, kind: str, filename: str) -> str:
    return "/".join(
        (
            "projects",
            safe_segment(project_id),
            "cells",
            safe_segment(cell_id),
            "datasets",
            safe_segment(dataset_id),
            safe_segment(kind),
            safe_filename(filename),
        )
    )
