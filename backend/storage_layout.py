"""Stable storage object names for raw data and derived artifacts."""

from __future__ import annotations

import hashlib
import re


MAX_ARTIFACT_SEGMENT_LENGTH = 20
MAX_ARTIFACT_FILENAME_LENGTH = 40


def compact_name(text: str, max_length: int, suffix: str = "") -> str:
    """Keep object keys short enough for Windows filesystem paths."""

    if len(text) + len(suffix) <= max_length:
        return f"{text}{suffix}"
    digest = hashlib.sha256(text.encode("utf-8")).hexdigest()[:8]
    prefix_length = max(1, max_length - len(suffix) - len(digest) - 1)
    prefix = text[:prefix_length].rstrip("-._") or "artifact"
    return f"{prefix}-{digest}{suffix}"


def safe_segment(value: str) -> str:
    text = str(value or "").strip().lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = text.strip("-")
    return compact_name(text or "unassigned", MAX_ARTIFACT_SEGMENT_LENGTH)


def safe_filename(value: str) -> str:
    text = str(value or "artifact").strip().lower()
    text = re.sub(r"[^a-z0-9._-]+", "-", text)
    text = re.sub(r"-+", "-", text).strip("-.")
    text = text or "artifact"
    stem, dot, extension = text.rpartition(".")
    suffix = f".{extension[:12]}" if dot and stem and extension else ""
    return compact_name(stem if suffix else text, MAX_ARTIFACT_FILENAME_LENGTH, suffix)


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
