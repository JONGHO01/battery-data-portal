from __future__ import annotations

"""Start Battery Data Portal locally as a background-friendly Windows process.

pythonw.exe로 실행하면 콘솔이 없어서 오류가 안 보일 수 있습니다.
그래서 이 런처는 stdout/stderr를 fastapi.out.log, fastapi.err.log에 연결한 뒤
FastAPI 백엔드를 시작합니다.
"""

import os
import sys
import traceback
from argparse import ArgumentParser
from pathlib import Path


ROOT = Path(__file__).resolve().parent

parser = ArgumentParser(description="Start the Battery Data Portal locally.")
parser.add_argument("--port", type=int, help="Local HTTP port to listen on.")
args = parser.parse_args()


def load_dotenv(path: Path) -> None:
    """Load local secrets from .env without requiring an extra package."""

    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        raw = line.strip()
        if not raw or raw.startswith("#") or "=" not in raw:
            continue
        key, value = raw.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


load_dotenv(ROOT / ".env")
if args.port is not None:
    # Command-line selection must win so a verification server can run beside
    # an already-open portal without touching that existing process.
    os.environ["PORT"] = str(args.port)
else:
    os.environ.setdefault("PORT", "4173")
os.environ.setdefault("DATA_DIR", str(ROOT / "data"))
os.environ.setdefault("JWT_SECRET", "local-dev-change-before-deploy")
os.environ.setdefault("ALLOW_LEGACY_USER_HEADER", "true")

# A running local portal may already own its log handles. Keep each port's
# output separate so a verification instance can start without stopping it.
port = os.environ["PORT"]
out_log = open(ROOT / f"fastapi-{port}.out.log", "a", encoding="utf-8", buffering=1)
err_log = open(ROOT / f"fastapi-{port}.err.log", "a", encoding="utf-8", buffering=1)
sys.stdout = out_log
sys.stderr = err_log

try:
    from python_backend import main

    main()
except Exception:
    traceback.print_exc()
    raise
