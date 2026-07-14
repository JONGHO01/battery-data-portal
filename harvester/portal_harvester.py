"""Poll approved cycler export folders and upload stable files to the portal."""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


SUPPORTED_SUFFIXES = {".csv", ".txt", ".xlsx", ".xlsm", ".xls", ".xlsb", ".wrd", ".seo"}
MAX_RETRY_SECONDS = 300


def validate_config(raw: dict[str, Any], config_path: Path) -> dict[str, Any]:
    """Validate the non-secret watcher configuration before using the network."""

    if not isinstance(raw, dict):
        raise ValueError("Configuration must be a JSON object.")
    server_url = str(raw.get("serverUrl") or "").strip().rstrip("/")
    parsed_url = urllib.parse.urlparse(server_url)
    if parsed_url.scheme not in {"http", "https"} or not parsed_url.netloc:
        raise ValueError("serverUrl must be a full http:// or https:// URL.")
    watch_paths = raw.get("watchPaths")
    if not isinstance(watch_paths, list) or not watch_paths:
        raise ValueError("watchPaths must contain at least one approved folder.")
    resolved_paths = [str(Path(str(value)).expanduser().resolve()) for value in watch_paths if str(value).strip()]
    if not resolved_paths:
        raise ValueError("watchPaths does not contain a usable folder.")
    dataset = raw.get("dataset") if isinstance(raw.get("dataset"), dict) else {}
    data_type = str(dataset.get("dataType") or "").lower()
    if data_type and data_type not in {"cyc", "cv", "eis"}:
        raise ValueError("dataset.dataType must be cyc, cv, or eis when supplied.")
    max_size_mb = int(raw.get("maxFileSizeMb", 200))
    if not 1 <= max_size_mb <= 220:
        raise ValueError("maxFileSizeMb must be between 1 and 220.")
    poll_seconds = int(raw.get("pollSeconds", 20))
    stable_seconds = int(raw.get("stableSeconds", 10))
    state_path = Path(str(raw.get("statePath") or (config_path.parent / ".harvester-state.json"))).expanduser()
    if not state_path.is_absolute():
        state_path = (config_path.parent / state_path).resolve()
    return {
        "serverUrl": server_url,
        "watchPaths": resolved_paths,
        "dataset": dataset,
        "recursive": bool(raw.get("recursive", True)),
        "pollSeconds": max(5, min(poll_seconds, 3600)),
        "stableSeconds": max(0, min(stable_seconds, 600)),
        "maxFileSizeBytes": max_size_mb * 1024 * 1024,
        "statePath": state_path,
    }


def build_upload_payload(path: Path, config: dict[str, Any]) -> dict[str, Any]:
    """Build the server payload without ever copying the portal token into it."""

    if path.suffix.lower() not in SUPPORTED_SUFFIXES:
        raise ValueError(f"Unsupported suffix: {path.suffix}")
    content = path.read_bytes()
    if len(content) > config["maxFileSizeBytes"]:
        raise ValueError(f"File exceeds configured limit: {path.name}")
    return {
        "filename": path.name,
        "contentBase64": base64.b64encode(content).decode("ascii"),
        "dataset": config["dataset"],
    }


def file_hash(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        while chunk := stream.read(1024 * 1024):
            digest.update(chunk)
    return digest.hexdigest()


class HarvesterState:
    """Tracks only local file hashes so the same export is not sent twice."""

    def __init__(self, path: Path):
        self.path = path
        try:
            loaded = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, ValueError, json.JSONDecodeError):
            loaded = {}
        self.files = loaded.get("files") if isinstance(loaded.get("files"), dict) else {}

    def save(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        temporary = self.path.with_suffix(f"{self.path.suffix}.tmp")
        temporary.write_text(json.dumps({"files": self.files}, ensure_ascii=False, indent=2), encoding="utf-8")
        temporary.replace(self.path)


class PortalHarvester:
    def __init__(self, config: dict[str, Any], token: str):
        self.config = config
        self.token = token
        self.state = HarvesterState(config["statePath"])
        self.observed: dict[str, tuple[int, int, float]] = {}
        self.retry_at: dict[str, tuple[int, float]] = {}

    def candidate_files(self) -> list[Path]:
        candidates = []
        for root_text in self.config["watchPaths"]:
            root = Path(root_text)
            if not root.exists() or not root.is_dir():
                continue
            iterator = root.rglob("*") if self.config["recursive"] else root.glob("*")
            for path in iterator:
                if path.is_file() and path.suffix.lower() in SUPPORTED_SUFFIXES:
                    candidates.append(path)
        return sorted(candidates, key=lambda path: (path.stat().st_mtime, str(path)))

    def is_stable(self, path: Path, now: float) -> bool:
        stat = path.stat()
        key = str(path.resolve())
        signature = (stat.st_size, stat.st_mtime_ns)
        previous = self.observed.get(key)
        if previous is None or previous[:2] != signature:
            self.observed[key] = (signature[0], signature[1], now)
            return self.config["stableSeconds"] == 0
        return now - previous[2] >= self.config["stableSeconds"]

    def upload(self, path: Path) -> dict[str, Any]:
        data = json.dumps(build_upload_payload(path, self.config)).encode("utf-8")
        request = urllib.request.Request(
            f"{self.config['serverUrl']}/api/harvester/uploads",
            data=data,
            headers={"Content-Type": "application/json", "X-Portal-Token": self.token},
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=120) as response:
                body = response.read().decode("utf-8")
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", errors="replace")[:500]
            raise RuntimeError(f"Server rejected {path.name}: HTTP {exc.code} {body}") from exc
        except urllib.error.URLError as exc:
            raise RuntimeError(f"Could not reach portal for {path.name}: {exc.reason}") from exc
        try:
            return json.loads(body)
        except json.JSONDecodeError as exc:
            raise RuntimeError(f"Portal returned invalid JSON for {path.name}.") from exc

    def scan_once(self) -> int:
        uploaded = 0
        now = time.time()
        for path in self.candidate_files():
            key = str(path.resolve())
            if not self.is_stable(path, now):
                continue
            attempts, retry_time = self.retry_at.get(key, (0, 0.0))
            if now < retry_time:
                continue
            try:
                digest = file_hash(path)
                if self.state.files.get(key) == digest:
                    continue
                response = self.upload(path)
                self.state.files[key] = digest
                self.state.save()
                self.retry_at.pop(key, None)
                dataset_id = str((response.get("dataset") or {}).get("id") or "")
                print(f"Uploaded {path.name} -> {dataset_id}")
                uploaded += 1
            except Exception as exc:
                next_attempt = attempts + 1
                delay = min(MAX_RETRY_SECONDS, 5 * (2 ** min(next_attempt, 6)))
                self.retry_at[key] = (next_attempt, now + delay)
                print(f"Will retry {path.name} in {delay}s: {exc}")
        return uploaded

    def run_forever(self) -> None:
        print("Battery Portal Harvester started. Press Ctrl+C to stop.")
        while True:
            self.scan_once()
            time.sleep(self.config["pollSeconds"])


def main() -> None:
    parser = argparse.ArgumentParser(description="Watch approved cycler folders and upload files to Battery Data Portal.")
    parser.add_argument("--config", default="harvester/config.json", help="Path to the non-secret JSON configuration file.")
    parser.add_argument("--once", action="store_true", help="Scan once and exit.")
    args = parser.parse_args()
    config_path = Path(args.config).expanduser().resolve()
    config = validate_config(json.loads(config_path.read_text(encoding="utf-8")), config_path)
    token = os.environ.get("BATTERY_PORTAL_TOKEN", "").strip()
    if not token.startswith("bdp_"):
        raise SystemExit("BATTERY_PORTAL_TOKEN must contain an active bdp_ token.")
    harvester = PortalHarvester(config, token)
    if args.once:
        harvester.scan_once()
        return
    harvester.run_forever()


if __name__ == "__main__":
    main()
