from __future__ import annotations

"""Download queued Battery Portal raw artifacts into a verified local archive.

The agent intentionally uses only the Python standard library so a Windows
scheduled task can run it without installing another SDK. It never receives B2
credentials: the portal supplies a short-lived private URL for each artifact.
"""

import argparse
import hashlib
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath


CHUNK_SIZE = 1024 * 1024


def validate_portal_url(value: str) -> str:
    """Protect the archive token from public clear-text HTTP transmission."""

    normalized = str(value or "").strip().rstrip("/")
    parsed = urllib.parse.urlsplit(normalized)
    if not parsed.hostname or parsed.username or parsed.password:
        raise ValueError("PORTAL_URL must be a normal portal origin without embedded credentials.")
    local_hosts = {"localhost", "127.0.0.1", "::1"}
    if parsed.scheme != "https" and not (parsed.scheme == "http" and parsed.hostname in local_hosts):
        raise ValueError("PORTAL_URL must use HTTPS except for localhost testing.")
    return normalized


def safe_segment(value: object, fallback: str = "unknown") -> str:
    normalized = re.sub(r"[^A-Za-z0-9._-]+", "-", str(value or "").strip().lower())
    normalized = re.sub(r"[-_.]{2,}", "-", normalized).strip("-._")
    return (normalized or fallback)[:100]


def safe_filename(value: object) -> str:
    leaf = str(value or "raw-data.bin").replace("\\", "/").rsplit("/", 1)[-1]
    suffix = Path(leaf).suffix.lower()
    suffix = f".{safe_segment(suffix[1:], '')}" if suffix else ""
    stem = safe_segment(Path(leaf).stem, "raw-data")
    return f"{stem}{suffix}"[:180]


def archive_relative_path(item: dict) -> PurePosixPath:
    """Partition backups by account, UTC date, Dataset, and safe source name."""

    created_at = str(item.get("createdAt") or "")
    try:
        created = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        created = created.astimezone(timezone.utc)
    except ValueError:
        created = datetime.now(timezone.utc)
    return PurePosixPath(
        safe_segment(item.get("ownerId"), "unknown-owner"),
        f"{created.year:04d}",
        f"{created.month:02d}",
        f"{created.day:02d}",
        safe_segment(item.get("datasetId"), "unknown-dataset"),
        safe_filename(item.get("sourceName")),
    )


def read_env_file(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    if not path.is_file():
        return values
    for raw_line in path.read_text(encoding="utf-8-sig").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def request_json(url: str, token: str, *, method: str = "GET", payload: dict | None = None) -> dict:
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    request = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers={
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Archive-Token": token,
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            document = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        try:
            detail = json.loads(exc.read().decode("utf-8")).get("detail", "")
        except Exception:
            detail = ""
        raise RuntimeError(f"Portal request failed with HTTP {exc.code}: {detail or 'no safe detail'}") from exc
    if not isinstance(document, dict):
        raise RuntimeError("Portal response was not a JSON object.")
    return document


def file_digest(path: Path) -> tuple[int, str]:
    digest = hashlib.sha256()
    size = 0
    with path.open("rb") as handle:
        while chunk := handle.read(CHUNK_SIZE):
            digest.update(chunk)
            size += len(chunk)
    return size, digest.hexdigest()


def download_verified(url: str, target: Path, expected_size: int, expected_sha256: str) -> tuple[int, str]:
    """Stream to a temporary file and atomically publish only an exact copy."""

    if target.is_file():
        current_size, current_hash = file_digest(target)
        if current_size == expected_size and current_hash == expected_sha256:
            return current_size, current_hash
        raise RuntimeError(f"Existing archive file differs from the portal copy: {target}")

    target.parent.mkdir(parents=True, exist_ok=True)
    temporary = target.with_name(f".{target.name}.part")
    temporary.unlink(missing_ok=True)
    digest = hashlib.sha256()
    size = 0
    try:
        request = urllib.request.Request(url, headers={"Accept": "application/octet-stream"})
        with urllib.request.urlopen(request, timeout=120) as response, temporary.open("xb") as handle:
            while chunk := response.read(CHUNK_SIZE):
                handle.write(chunk)
                digest.update(chunk)
                size += len(chunk)
        actual_hash = digest.hexdigest()
        if size != expected_size or actual_hash != expected_sha256:
            raise RuntimeError("Downloaded raw artifact failed its size or SHA-256 verification.")
        temporary.replace(target)
        return size, actual_hash
    except Exception:
        temporary.unlink(missing_ok=True)
        raise


def run_once(portal_url: str, token: str, archive_root: Path, device_id: str, limit: int) -> tuple[int, int]:
    queue_url = f"{portal_url.rstrip('/')}/api/archive/artifacts?state=pending&limit={max(1, min(limit, 200))}"
    queue = request_json(queue_url, token)
    archive_root = archive_root.expanduser().resolve()
    succeeded = 0
    failed = 0
    for item in queue.get("items") or []:
        if not isinstance(item, dict):
            continue
        archive_id = safe_segment(item.get("archiveId"), "unknown")
        relative = archive_relative_path(item)
        target = archive_root.joinpath(*relative.parts).resolve()
        try:
            target.relative_to(archive_root)
            size, sha256 = download_verified(
                str(item["downloadUrl"]),
                target,
                int(item["sizeBytes"]),
                str(item["sha256"]).lower(),
            )
            verify_url = f"{portal_url.rstrip('/')}/api/archive/artifacts/{item['archiveId']}/verification"
            request_json(
                verify_url,
                token,
                method="POST",
                payload={
                    "sizeBytes": size,
                    "sha256": sha256,
                    "deviceId": device_id,
                    "relativePath": relative.as_posix(),
                },
            )
            print(f"VERIFIED {archive_id} -> {relative.as_posix()}")
            succeeded += 1
        except Exception as exc:
            print(f"FAILED {archive_id}: {exc}", file=sys.stderr)
            failed += 1
    return succeeded, failed


def default_config_path() -> Path:
    base = Path(os.environ.get("LOCALAPPDATA") or Path.home())
    return base / "BatteryPortal" / "archive-agent.env"


def main() -> int:
    parser = argparse.ArgumentParser(description="Back up Battery Portal B2 raw artifacts to this computer.")
    parser.add_argument("--config", type=Path, default=default_config_path())
    parser.add_argument("--limit", type=int, default=20)
    args = parser.parse_args()

    file_values = read_env_file(args.config)
    setting = lambda name: os.environ.get(name, file_values.get(name, "")).strip()
    portal_url = setting("PORTAL_URL")
    token = setting("ARCHIVE_AGENT_TOKEN")
    archive_root_value = setting("ARCHIVE_ROOT")
    device_id = setting("ARCHIVE_DEVICE_ID") or "battery-workspace"
    missing = [
        name
        for name, value in (
            ("PORTAL_URL", portal_url),
            ("ARCHIVE_AGENT_TOKEN", token),
            ("ARCHIVE_ROOT", archive_root_value),
        )
        if not value
    ]
    if missing:
        print(f"Missing archive-agent settings: {', '.join(missing)}", file=sys.stderr)
        return 2
    try:
        portal_url = validate_portal_url(portal_url)
    except ValueError as exc:
        print(str(exc), file=sys.stderr)
        return 2
    if not re.fullmatch(r"[A-Za-z0-9._-]{1,80}", device_id):
        print("ARCHIVE_DEVICE_ID may contain only letters, numbers, dot, underscore, and dash.", file=sys.stderr)
        return 2

    succeeded, failed = run_once(portal_url, token, Path(archive_root_value), device_id, args.limit)
    print(f"Archive pass complete: verified={succeeded}, failed={failed}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
