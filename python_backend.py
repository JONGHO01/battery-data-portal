from __future__ import annotations

"""Battery Data Portal FastAPI backend.

이 파일은 기존 public/index.html, public/app.js 화면은 그대로 두고
백엔드만 실제 사이트 운영에 가까운 구조로 정리한 FastAPI 서버입니다.

운영 방향은 다음과 같습니다.

1. 브라우저는 계속 public/index.html을 엽니다.
2. public/app.js는 기존처럼 /api/datasets 같은 API를 호출합니다.
3. 로그인 성공 시 서버가 JWT 토큰을 발급합니다.
4. 서버는 JWT를 확인해서 사용자별 데이터 접근을 제한합니다.
5. DATABASE_URL이 있으면 PostgreSQL, 없으면 기존 SQLite를 사용합니다.
6. 업로드 원본은 기본적으로 로컬에 저장하고, 환경 변수를 설정하면 S3/Supabase Storage로도 보냅니다.
"""

import base64
import hashlib
import hmac
import json
import math
import mimetypes
import os
import re
import secrets
import subprocess
import sys
import time
import urllib.parse
import urllib.error
import urllib.request
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath
from typing import Any

from fastapi import Body, Depends, FastAPI, Header, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from starlette.concurrency import run_in_threadpool

from backend.c_rate import collect_c_rate_metadata, infer_cycle_c_rates
from backend.schemas.bdf import PARSER_VERSION as BDF_MAPPING_VERSION
from backend.schemas.bdf import build_column_mapping, canonicalize_rows, evaluate_quality
from backend.parsers import PARSER_VERSION as INSTRUMENT_PARSER_VERSION, inspect_path
from backend.storage_layout import artifact_key
from backend.analysis.common import ANALYSIS_VERSION
from backend.analysis.dqdv import calculate_dqdv
from backend.analysis.dva import calculate_dva
from backend.analysis.eis import summarize_eis
from backend.analysis.pulse_resistance import summarize_pulse_resistance
from backend.analysis.rate_capability import summarize_rate_capability
from backend.analysis.retention import capacity_series, summarize_retention
from scripts.inspect_file import limit_inspection_rows


ORGANIZATION_ROLES = {"owner", "admin", "researcher", "viewer"}
ORGANIZATION_EDIT_ROLES = {"owner", "admin", "researcher"}


ROOT = Path(__file__).resolve().parent
PUBLIC_DIR = ROOT / "public"
DATA_DIR = Path(os.environ.get("DATA_DIR", ROOT / "data")).resolve()
UPLOAD_DIR = DATA_DIR / "uploads"
ARTIFACT_DIR = DATA_DIR / "storage"
USERS_JSON = DATA_DIR / "users.json"
DATASETS_JSON = DATA_DIR / "datasets.json"

DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()
SQLITE_DB = Path(os.environ.get("SQLITE_DB", DATA_DIR / "portal.sqlite3")).resolve()
USE_POSTGRES = DATABASE_URL.startswith(("postgres://", "postgresql://"))
SQLITE_BUSY_TIMEOUT_MS = 30_000

PORT = int(os.environ.get("PORT", "4173"))
# Keep browser uploads within a bounded process-memory budget. Larger research
# files can still be accepted by deliberately raising this environment value.
# Common WBCS CYC WRD exports exceed 50 MiB, so the bounded default is 100 MiB.
DEFAULT_MAX_UPLOAD_BYTES = 100 * 1024 * 1024
MAX_BODY = int(os.environ.get("MAX_UPLOAD_BYTES", str(DEFAULT_MAX_UPLOAD_BYTES)))
MAX_BASE64_CHARS = ((MAX_BODY + 2) // 3) * 4
# Keep complete WBCS point-level traces for CYC and dQ/dV. This is bounded to
# prevent a malformed file from turning a single Dataset into an unbounded DB
# record, but it is intentionally far above the old 5,000-row display-era cap.
MAX_PARSED_ROWS = int(os.environ.get("MAX_PARSED_ROWS", "250000"))
# The browser needs complete-looking traces, but it does not need every raw
# instrument point.  Keep a bounded, cycle-aware detail payload so opening a
# 40,000+ point WRD cannot exhaust the Chrome renderer.
MAX_BROWSER_DATASET_ROWS = int(os.environ.get("MAX_BROWSER_DATASET_ROWS", "7000"))
DEFAULT_JWT_SECRET = "dev-change-this-secret-before-deploy"
APP_ENV = os.environ.get("APP_ENV", "local").strip().lower()
JWT_SECRET = os.environ.get("JWT_SECRET", DEFAULT_JWT_SECRET)
JWT_TTL_SECONDS = int(os.environ.get("JWT_TTL_SECONDS", str(60 * 60 * 24 * 7)))
ALLOW_LEGACY_USER_HEADER = os.environ.get("ALLOW_LEGACY_USER_HEADER", "false").lower() == "true"
BOOTSTRAP_ADMIN_ID = os.environ.get("BOOTSTRAP_ADMIN_ID", "qq035786").strip()
BOOTSTRAP_ADMIN_NAME = os.environ.get("BOOTSTRAP_ADMIN_NAME", "원종호").strip()
BOOTSTRAP_ADMIN_PASSWORD = os.environ.get("BOOTSTRAP_ADMIN_PASSWORD", "").strip()
# A second, short-lived scope protects raw Dataset rows even after a normal
# administrator login. The confirmation value must only exist in the local
# .env file or the hosting provider's secret environment variables.
ADMIN_RAW_DATA_PASSWORD = os.environ.get("ADMIN_RAW_DATA_PASSWORD", "").strip()
try:
    ADMIN_RAW_DATA_TTL_SECONDS = max(60, min(int(os.environ.get("ADMIN_RAW_DATA_TTL_SECONDS", "600")), 3600))
except ValueError:
    ADMIN_RAW_DATA_TTL_SECONDS = 600

STORAGE_BACKEND = os.environ.get("STORAGE_BACKEND", "local").lower()
REQUIRE_DURABLE_STORAGE = os.environ.get("REQUIRE_DURABLE_STORAGE", "true" if APP_ENV == "production" else "false").lower() == "true"
S3_PROVIDER = os.environ.get("S3_PROVIDER", "").strip().lower()
S3_BUCKET = os.environ.get("S3_BUCKET", "")
S3_ENDPOINT_URL = os.environ.get("S3_ENDPOINT_URL", "")
S3_REGION = os.environ.get("S3_REGION", "auto")
S3_ACCESS_KEY_ID = os.environ.get("S3_ACCESS_KEY_ID", "")
S3_SECRET_ACCESS_KEY = os.environ.get("S3_SECRET_ACCESS_KEY", "")
S3_PUBLIC_BASE_URL = os.environ.get("S3_PUBLIC_BASE_URL", "").rstrip("/")
S3_FORCE_PATH_STYLE = os.environ.get("S3_FORCE_PATH_STYLE", "true").lower() == "true"
DATABASE_ROWS_MODE = os.environ.get(
    "DATABASE_ROWS_MODE",
    "artifact" if APP_ENV == "production" and USE_POSTGRES else "full",
).strip().lower()
MAX_OBJECT_ARTIFACT_BYTES = int(os.environ.get("MAX_OBJECT_ARTIFACT_BYTES", str(256 * 1024 * 1024)))
ARCHIVE_AGENT_TOKEN = os.environ.get("ARCHIVE_AGENT_TOKEN", "").strip()
try:
    ARCHIVE_DOWNLOAD_TTL_SECONDS = max(300, min(int(os.environ.get("ARCHIVE_DOWNLOAD_TTL_SECONDS", "900")), 3600))
except ValueError:
    ARCHIVE_DOWNLOAD_TTL_SECONDS = 900
try:
    ARCHIVE_SOFT_LIMIT_BYTES = max(0, int(os.environ.get("ARCHIVE_SOFT_LIMIT_BYTES", str(8 * 1024**3))))
except ValueError:
    ARCHIVE_SOFT_LIMIT_BYTES = 8 * 1024**3
try:
    ARCHIVE_HARD_LIMIT_BYTES = max(
        ARCHIVE_SOFT_LIMIT_BYTES,
        int(os.environ.get("ARCHIVE_HARD_LIMIT_BYTES", str(9 * 1024**3))),
    )
except ValueError:
    ARCHIVE_HARD_LIMIT_BYTES = max(ARCHIVE_SOFT_LIMIT_BYTES, 9 * 1024**3)
HARVESTER_ENABLED = os.environ.get("HARVESTER_ENABLED", "false").lower() == "true"


def parse_cors_allow_origins(value: str) -> list[str]:
    """Return a conservative comma-separated CORS allow-list without blanks."""

    return [origin.strip() for origin in value.split(",") if origin.strip()]


CORS_ALLOW_ORIGINS = parse_cors_allow_origins(os.environ.get("CORS_ALLOW_ORIGINS", ""))
CORS_ALLOW_HEADERS = [
    "Authorization",
    "Content-Type",
    "X-Filename",
    "X-Portal-Token",
    "X-Admin-Raw-Access",
    "X-Archive-Token",
]
if ALLOW_LEGACY_USER_HEADER:
    CORS_ALLOW_HEADERS.append("X-User-Id")

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "").strip()
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-5.5").strip()
OPENAI_REASONING_EFFORT = os.environ.get("OPENAI_REASONING_EFFORT", "low").strip()
OPENAI_API_URL = os.environ.get("OPENAI_API_URL", "https://api.openai.com/v1/responses").strip()


def upload_size_limit_detail() -> str:
    limit_mib = MAX_BODY / (1024 * 1024)
    return f"업로드 파일이 현재 허용 한도({limit_mib:g} MB)를 초과했습니다. 더 작은 파일을 선택하거나 MAX_UPLOAD_BYTES 설정을 늘려주세요."


@asynccontextmanager
async def lifespan(_: FastAPI):
    validate_runtime_configuration()
    init_db()
    yield


app = FastAPI(title="Battery Data Portal", version="0.2.8", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=CORS_ALLOW_HEADERS,
)


@app.middleware("http")
async def no_cache_static_assets(request: Request, call_next):
    # Reject normal browser/Harvester uploads before FastAPI parses a large JSON
    # body. The raw upload endpoint has a second streaming limit below for
    # requests that omit Content-Length.
    if request.method == "POST":
        path = request.url.path
        raw_upload = path == "/api/inspect-upload"
        json_upload = path in {"/api/inspect-file", "/api/inspect-manual", "/api/harvester/uploads"}
        if raw_upload or json_upload:
            try:
                content_length = int(request.headers.get("content-length", "0"))
            except ValueError:
                content_length = 0
            limit = MAX_BODY if raw_upload else MAX_BASE64_CHARS + 1024 * 1024
            if content_length > limit:
                return JSONResponse(status_code=413, content={"detail": upload_size_limit_detail()})
    response = await call_next(request)
    if request.url.path in {"/", "/index.html", "/app.js", "/style.css"}:
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
    return response


@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"error": exc.detail})


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def sha256(text: str) -> str:
    return hashlib.sha256(str(text).encode("utf-8")).hexdigest()


def hash_password(password: str) -> str:
    """운영용 신규 비밀번호는 PBKDF2로 저장합니다.

    기존 data/users.json 또는 SQLite에 남아 있는 단순 sha256 해시는
    verify_password에서 계속 읽을 수 있게 유지했습니다.
    """

    salt = secrets.token_hex(16)
    iterations = 260_000
    digest = hashlib.pbkdf2_hmac("sha256", str(password).encode("utf-8"), salt.encode("utf-8"), iterations)
    return f"pbkdf2_sha256${iterations}${salt}${digest.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    stored_hash = str(stored_hash or "")
    if stored_hash.startswith("pbkdf2_sha256$"):
        try:
            _, iter_text, salt, digest = stored_hash.split("$", 3)
            calc = hashlib.pbkdf2_hmac("sha256", str(password).encode("utf-8"), salt.encode("utf-8"), int(iter_text))
            return hmac.compare_digest(calc.hex(), digest)
        except Exception:
            return False
    return hmac.compare_digest(sha256(password), stored_hash)


def clean_name(name: str) -> str:
    value = re.sub(r"[^a-zA-Z0-9_.-]", "_", str(name or "upload"))
    return value[:120] or "upload"


def key_of(name: str) -> str:
    return re.sub(r"[^a-z0-9가-힣]", "", str(name or "").lower())


def user_field(user, name: str, default=None):
    """Read a user field from either an API dict or a SQLite row."""

    if not user:
        return default
    if isinstance(user, dict):
        return user.get(name, default)
    keys = user.keys() if hasattr(user, "keys") else ()
    return user[name] if name in keys else default


def b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def b64url_decode(text: str) -> bytes:
    padded = text + "=" * (-len(text) % 4)
    return base64.urlsafe_b64decode(padded.encode("ascii"))


def create_token(user: dict[str, Any]) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": user["id"],
        "name": user_field(user, "name") or user["id"],
        "role": user_field(user, "role") or "user",
        "iat": int(time.time()),
        "exp": int(time.time()) + JWT_TTL_SECONDS,
    }
    signing_input = ".".join(
        [
            b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8")),
            b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8")),
        ]
    )
    signature = hmac.new(JWT_SECRET.encode("utf-8"), signing_input.encode("ascii"), hashlib.sha256).digest()
    return f"{signing_input}.{b64url_encode(signature)}"


def create_admin_raw_access_token(user: dict[str, Any]) -> str:
    """Issue a deliberately short-lived token for raw Dataset row browsing."""

    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": user["id"],
        "role": "admin",
        "scope": "admin_raw_data",
        "iat": int(time.time()),
        "exp": int(time.time()) + ADMIN_RAW_DATA_TTL_SECONDS,
    }
    signing_input = ".".join(
        [
            b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8")),
            b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8")),
        ]
    )
    signature = hmac.new(JWT_SECRET.encode("utf-8"), signing_input.encode("ascii"), hashlib.sha256).digest()
    return f"{signing_input}.{b64url_encode(signature)}"


def decode_token(token: str) -> dict[str, Any]:
    try:
        header_text, payload_text, signature_text = token.split(".", 2)
        signing_input = f"{header_text}.{payload_text}"
        expected = hmac.new(JWT_SECRET.encode("utf-8"), signing_input.encode("ascii"), hashlib.sha256).digest()
        if not hmac.compare_digest(b64url_encode(expected), signature_text):
            raise ValueError("bad signature")
        header = json.loads(b64url_decode(header_text))
        payload = json.loads(b64url_decode(payload_text))
        if header.get("alg") != "HS256":
            raise ValueError("unsupported alg")
        if int(payload.get("exp") or 0) < int(time.time()):
            raise ValueError("expired")
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="로그인 토큰이 유효하지 않습니다.")


def db_sql(sql: str) -> str:
    return sql.replace("?", "%s") if USE_POSTGRES else sql


def connect():
    if USE_POSTGRES:
        try:
            import psycopg
            from psycopg.rows import dict_row
        except ImportError as exc:
            raise RuntimeError("PostgreSQL을 쓰려면 requirements.txt의 psycopg[binary]를 설치해야 합니다.") from exc
        return psycopg.connect(DATABASE_URL, row_factory=dict_row)

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    import sqlite3

    # Artifact persistence can overlap normal browser reads. Wait for a short
    # SQLite write lock instead of turning a transient collision into a 500.
    conn = sqlite3.connect(SQLITE_DB, timeout=SQLITE_BUSY_TIMEOUT_MS / 1000)
    conn.row_factory = sqlite3.Row
    conn.execute(f"PRAGMA busy_timeout = {SQLITE_BUSY_TIMEOUT_MS}")
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def execute(conn, sql: str, params: tuple | list = ()):
    return conn.execute(db_sql(sql), params)


def scalar(row) -> Any:
    if row is None:
        return None
    if isinstance(row, dict):
        return next(iter(row.values()))
    return row[0]


def json_loads(value, fallback):
    if value in (None, ""):
        return fallback
    try:
        return json.loads(value)
    except Exception:
        return fallback


def json_column(row, column_name: str, fallback):
    """Read JSON from current and pre-migration database rows safely."""

    if not row:
        return fallback
    keys = row.keys() if hasattr(row, "keys") else ()
    return json_loads(row[column_name], fallback) if column_name in keys else fallback


def json_dumps(value) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def read_json_file(path: Path, fallback):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return fallback


def public_user(row, token: str | None = None) -> dict | None:
    if not row:
        return None
    user = {"id": row["id"], "name": row["name"], "role": row["role"]}
    keys = row.keys() if hasattr(row, "keys") else ()
    if "created_at" in keys and row["created_at"]:
        user["createdAt"] = row["created_at"]
    if token:
        user["token"] = token
    return user


def get_user_by_id(user_id: str, conn=None):
    if not user_id:
        return None
    if conn is not None:
        return execute(conn, "SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    with connect() as owned:
        return execute(owned, "SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()


def api_token_from_row(row, include_token: str | None = None) -> dict:
    item = {
        "id": row["id"],
        "name": row["name"],
        "createdAt": row["created_at"],
        "lastUsedAt": row["last_used_at"],
        "revokedAt": row["revoked_at"],
    }
    if include_token:
        item["token"] = include_token
    return item


def create_api_token(conn, user: dict, name: str) -> dict:
    """Create a machine token and return its plaintext only for this response."""

    clean_label = str(name or "").strip()
    if not re.match(r"^[a-zA-Z0-9 _.-]{1,64}$", clean_label):
        raise HTTPException(status_code=400, detail="Token name must be 1 to 64 safe characters.")
    plaintext = f"bdp_{secrets.token_urlsafe(32)}"
    token_id = make_id("token")
    execute(
        conn,
        """
        INSERT INTO api_tokens(id, owner_id, name, token_hash, created_at, last_used_at, revoked_at)
        VALUES (?, ?, ?, ?, ?, '', '')
        """,
        (token_id, user["id"], clean_label, sha256(plaintext), now_iso()),
    )
    row = execute(conn, "SELECT * FROM api_tokens WHERE id = ?", (token_id,)).fetchone()
    return api_token_from_row(row, plaintext)


def list_api_tokens(conn, user: dict) -> list[dict]:
    rows = execute(
        conn,
        "SELECT * FROM api_tokens WHERE owner_id = ? ORDER BY created_at DESC",
        (user["id"],),
    ).fetchall()
    return [api_token_from_row(row) for row in rows]


def revoke_api_token(conn, token_id: str, user: dict) -> None:
    row = execute(conn, "SELECT * FROM api_tokens WHERE id = ?", (token_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="API token not found.")
    if user["role"] != "admin" and row["owner_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Token management permission is required.")
    execute(conn, "UPDATE api_tokens SET revoked_at = ? WHERE id = ?", (now_iso(), token_id))


def get_user_from_api_token(token: str | None, conn=None):
    """Resolve a non-revoked machine token without exposing its stored hash."""

    value = str(token or "").strip()
    if not value.startswith("bdp_") or len(value) > 255:
        return None
    if conn is None:
        with connect() as owned:
            return get_user_from_api_token(value, owned)
    row = execute(
        conn,
        """
        SELECT users.* , api_tokens.id AS api_token_id
        FROM api_tokens JOIN users ON users.id = api_tokens.owner_id
        WHERE api_tokens.token_hash = ? AND api_tokens.revoked_at = ''
        """,
        (sha256(value),),
    ).fetchone()
    if not row:
        return None
    execute(conn, "UPDATE api_tokens SET last_used_at = ? WHERE id = ?", (now_iso(), row["api_token_id"]))
    return row


def get_current_user(
    authorization: str | None = Header(None),
    legacy_user_id: str | None = Header(None, alias="X-User-Id"),
    x_portal_token: str | None = Header(None, alias="X-Portal-Token"),
):
    token_user = get_user_from_api_token(x_portal_token)
    if token_user:
        return token_user
    user_id = ""
    if authorization and authorization.lower().startswith("bearer "):
        try:
            payload = decode_token(authorization.split(" ", 1)[1].strip())
            user_id = str(payload.get("sub") or "")
        except HTTPException:
            if not ALLOW_LEGACY_USER_HEADER:
                raise
            user_id = str(legacy_user_id or "")
    elif ALLOW_LEGACY_USER_HEADER:
        # 이전 프론트엔드나 로컬 디버깅을 위한 호환 모드입니다.
        # 운영 배포에서는 ALLOW_LEGACY_USER_HEADER=false를 권장합니다.
        user_id = str(legacy_user_id or "")

    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="로그인이 필요합니다.")
    return user


def ensure_admin(user):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="관리자만 접근할 수 있습니다.")


def require_admin_raw_access(
    x_admin_raw_access: str | None = Header(None, alias="X-Admin-Raw-Access"),
    user=Depends(get_current_user),
):
    """Require an admin plus a short-lived, separately confirmed scope."""

    ensure_admin(user)
    token = str(x_admin_raw_access or "").strip()
    if not token:
        raise HTTPException(status_code=403, detail="Separate administrator confirmation is required.")
    try:
        payload = decode_token(token)
    except HTTPException as exc:
        raise HTTPException(status_code=403, detail="Administrator raw-data access has expired.") from exc
    if (
        payload.get("scope") != "admin_raw_data"
        or payload.get("role") != "admin"
        or not hmac.compare_digest(str(payload.get("sub") or ""), str(user["id"]))
    ):
        raise HTTPException(status_code=403, detail="Administrator raw-data access is invalid.")
    return user


def organization_role(conn, user: dict, organization_id: str) -> str:
    """Return the caller's organization role, with system admins above it."""

    if not organization_id:
        return ""
    if user and user_field(user, "role") == "admin":
        return "owner"
    if not user:
        return ""
    row = execute(
        conn,
        "SELECT role FROM organization_members WHERE organization_id = ? AND user_id = ?",
        (organization_id, user["id"]),
    ).fetchone()
    return str(row["role"]) if row and row["role"] in ORGANIZATION_ROLES else ""


def organization_can_view(conn, user: dict, organization_id: str) -> bool:
    return bool(organization_role(conn, user, organization_id))


def organization_can_edit(conn, user: dict, organization_id: str) -> bool:
    return organization_role(conn, user, organization_id) in ORGANIZATION_EDIT_ROLES


def organization_can_admin(conn, user: dict, organization_id: str) -> bool:
    return organization_role(conn, user, organization_id) in {"owner", "admin"}


def create_organization_record(conn, user: dict, payload: dict) -> dict:
    name = str(payload.get("name") or "").strip()
    if not name or len(name) > 120:
        raise HTTPException(status_code=400, detail="Organization name must be 1 to 120 characters.")
    base = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-") or "organization"
    current = now_iso()
    item = {
        "id": make_id("org"),
        "name": name,
        "slug": f"{base[:50]}-{secrets.token_hex(3)}",
        "createdBy": user["id"],
        "createdAt": current,
        "updatedAt": current,
    }
    execute(
        conn,
        "INSERT INTO organizations(id, name, slug, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
        (item["id"], item["name"], item["slug"], item["createdBy"], item["createdAt"], item["updatedAt"]),
    )
    execute(
        conn,
        "INSERT INTO organization_members(organization_id, user_id, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
        (item["id"], user["id"], "owner", current, current),
    )
    return {**item, "myRole": "owner"}


def upsert_organization_member(conn, organization_id: str, user_id: str, role: str, actor: dict) -> dict:
    if role not in ORGANIZATION_ROLES:
        raise HTTPException(status_code=400, detail="Organization role is invalid.")
    if not organization_can_admin(conn, actor, organization_id):
        raise HTTPException(status_code=403, detail="Organization admin permission is required.")
    if not get_user_by_id(user_id, conn):
        raise HTTPException(status_code=404, detail="User not found.")
    current = now_iso()
    execute(
        conn,
        """
        INSERT INTO organization_members(organization_id, user_id, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(organization_id, user_id) DO UPDATE SET role = excluded.role, updated_at = excluded.updated_at
        """,
        (organization_id, user_id, role, current, current),
    )
    return {"organizationId": organization_id, "userId": user_id, "role": role, "updatedAt": current}


def list_organizations_for_user(conn, user: dict) -> list[dict]:
    if user["role"] == "admin":
        rows = execute(conn, "SELECT * FROM organizations ORDER BY updated_at DESC, name").fetchall()
        return [organization_from_row(row, "owner") for row in rows]
    rows = execute(
        conn,
        """
        SELECT organizations.*, organization_members.role AS member_role
        FROM organizations JOIN organization_members ON organizations.id = organization_members.organization_id
        WHERE organization_members.user_id = ?
        ORDER BY organizations.updated_at DESC, organizations.name
        """,
        (user["id"],),
    ).fetchall()
    return [organization_from_row(row, str(row["member_role"])) for row in rows]


def row_organization_id(row) -> str:
    keys = row.keys() if hasattr(row, "keys") else []
    return str(row["organization_id"] or "") if "organization_id" in keys else ""


def can_view_row(conn, user: dict, row) -> bool:
    if not user or not row:
        return False
    if user_field(user, "role") == "admin" or row["owner_id"] == user["id"]:
        return True
    organization_id = row_organization_id(row)
    return bool(organization_id and organization_can_view(conn, user, organization_id))


def can_edit_row(conn, user: dict, row) -> bool:
    if not user or not row:
        return False
    if user_field(user, "role") == "admin" or row["owner_id"] == user["id"]:
        return True
    organization_id = row_organization_id(row)
    return bool(organization_id and organization_can_edit(conn, user, organization_id))


def can_see(user, dataset_row, conn=None) -> bool:
    if conn is not None:
        return can_view_row(conn, user, dataset_row)
    with connect() as owned:
        return can_view_row(owned, user, dataset_row)


def _spread_sample(rows: list[dict], limit: int) -> list[dict]:
    """Return evenly spaced rows while retaining the first and last row."""

    if limit <= 0 or not rows:
        return []
    if len(rows) <= limit:
        return rows
    if limit == 1:
        return [rows[0]]
    positions = {
        round(index * (len(rows) - 1) / (limit - 1))
        for index in range(limit)
    }
    return [row for index, row in enumerate(rows) if index in positions]


def browser_safe_dataset_rows(rows: list[dict], data_type: str, limit: int = MAX_BROWSER_DATASET_ROWS) -> tuple[list[dict], bool]:
    """Downsample a detail response without deleting the stored experiment data.

    Cycling data is sampled per cycle and charge/discharge direction.  A global
    first-N slice made later C-rate steps vanish and made dQ/dV look as though
    the source did not contain a usable voltage trace.
    """

    clean_rows = [row for row in rows if isinstance(row, dict)]
    if len(clean_rows) <= limit:
        return clean_rows, False
    if str(data_type or "").lower() != "cyc":
        return _spread_sample(clean_rows, limit), True

    traces: dict[tuple[str, str], list[tuple[int, dict]]] = {}
    for index, row in enumerate(clean_rows):
        cycle = str(row.get("cycle") if row.get("cycle") is not None else "unknown")
        direction = str(row.get("direction") or "").strip().lower()
        if direction not in {"charge", "discharge"}:
            try:
                current = float(row.get("current"))
            except (TypeError, ValueError):
                current = 0.0
            direction = "charge" if current > 0 else "discharge" if current < 0 else "unknown"
        traces.setdefault((cycle, direction), []).append((index, row))

    # A small minimum preserves derivatives for every trace.  If a malformed
    # file has more traces than the budget permits, the final global sampling
    # below still enforces the hard response limit.
    per_trace = max(8, limit // max(len(traces), 1))
    sampled: list[tuple[int, dict]] = []
    for trace_rows in traces.values():
        kept = _spread_sample([row for _, row in trace_rows], per_trace)
        wanted = {id(row) for row in kept}
        sampled.extend((index, row) for index, row in trace_rows if id(row) in wanted)
    sampled.sort(key=lambda item: item[0])
    if len(sampled) > limit:
        sampled = list(enumerate(_spread_sample([row for _, row in sampled], limit)))
    return [row for _, row in sampled], True


def database_rows_payload(item: dict) -> tuple[list, int, str]:
    """Return the database row payload without duplicating durable artifacts."""

    rows = item.get("rows") if isinstance(item.get("rows"), list) else []
    try:
        row_count = max(len(rows), int(item.get("rowCount") or 0))
    except (TypeError, ValueError):
        row_count = len(rows)
    parsed_artifact = item.get("parsedArtifact") if isinstance(item.get("parsedArtifact"), dict) else {}
    can_use_artifact = bool(parsed_artifact.get("objectKey"))
    if USE_POSTGRES and DATABASE_ROWS_MODE == "artifact" and can_use_artifact:
        return [], row_count, "artifact"
    return rows, row_count, "database"


def dataset_from_row(row, include_rows: bool = True, browser_safe: bool = False) -> dict:
    """Return the browser dataset shape without always serializing raw points.

    A single WBCS cycling file can contain tens of thousands of points.  Sending
    every saved dataset's raw table in ``GET /api/datasets`` made the first page
    load consume excessive browser memory and could close the renderer.  The
    list endpoint therefore returns metadata only; the selected dataset is
    hydrated through ``GET /api/datasets/{dataset_id}``.
    """

    keys = row.keys()
    stored_rows = json_loads(row["rows_json"], []) if include_rows else []
    if not isinstance(stored_rows, list):
        stored_rows = []
    try:
        all_row_count = int(row["row_count"]) if "row_count" in keys else len(stored_rows)
    except (TypeError, ValueError):
        all_row_count = len(stored_rows)
    all_row_count = max(all_row_count, len(stored_rows))
    rows_truncated = False
    if include_rows and browser_safe:
        stored_rows, rows_truncated = browser_safe_dataset_rows(stored_rows, row["data_type"])
    return {
        "id": row["id"],
        "ownerId": row["owner_id"],
        "ownerName": row["owner_name"],
        "dataType": row["data_type"],
        "figureKind": row["figure_kind"],
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
        "cell": json_loads(row["cell_json"], {}),
        "rows": stored_rows,
        "rowsLoaded": include_rows,
        # The migration stores this count separately, so compact Dataset/Fig
        # lists can show an exact point count without parsing rows_json.
        "rowCount": all_row_count,
        "loadedRowCount": len(stored_rows) if include_rows else 0,
        "rowsTruncated": rows_truncated,
        "rowsStorage": row["rows_storage"] if "rows_storage" in keys else "database",
        "columns": json_loads(row["columns_json"], []),
        "sourceName": row["source_name"],
        "figureEdits": json_loads(row["figure_edits_json"], {}),
        # These links keep one cell's CYC, EIS, CV, and reports together.
        # Empty values are only possible before the one-time legacy migration runs.
        "projectId": row["project_id"] if "project_id" in row.keys() else "",
        "campaignId": row["campaign_id"] if "campaign_id" in row.keys() else "",
        "cellRecordId": row["cell_record_id"] if "cell_record_id" in row.keys() else "",
        "datasetGroupId": row["dataset_group_id"] if "dataset_group_id" in row.keys() else "",
        "organizationId": row["organization_id"] if "organization_id" in keys else "",
        "rawArtifact": json_loads(row["raw_artifact_json"], {}) if "raw_artifact_json" in keys else {},
        "parsedArtifact": json_loads(row["parsed_artifact_json"], {}) if "parsed_artifact_json" in keys else {},
        "columnMapping": json_loads(row["column_mapping_json"], {}) if "column_mapping_json" in keys else {},
        "quality": json_loads(row["quality_json"], {}) if "quality_json" in keys else {},
        "parser": json_loads(row["parser_json"], {}) if "parser_json" in keys else {},
        "analysisProvenance": json_loads(row["analysis_provenance_json"], {}) if "analysis_provenance_json" in keys else {},
    }


def dataset_detail_from_row(row) -> dict:
    """Build one browser-safe Dataset hydrated from its normalized artifact.

    Production PostgreSQL stores only metadata for uploaded instrument files.
    The complete normalized table lives beside the immutable raw file in the
    configured S3-compatible object store, so opening an old Fig must
    rehydrate that table before applying the browser sampling limit.
    """

    full_item = dataset_from_row(row, include_rows=True)
    render_rows, provenance = load_analysis_rows(full_item, include_review_rows=True)
    item = dataset_from_row(row, include_rows=False)
    display_rows, truncated = browser_safe_dataset_rows(render_rows, item["dataType"])
    item["rows"] = display_rows
    item["rowsLoaded"] = True
    item["rowCount"] = max(int(full_item.get("rowCount") or 0), len(render_rows))
    item["loadedRowCount"] = len(display_rows)
    item["rowsTruncated"] = truncated
    if provenance["rowSource"] == "parsed-artifact":
        item["rowsStorage"] = "artifact"
    return item


def cyc_comparison_series_from_row(row) -> dict:
    """Return the smallest authenticated payload needed for CYC comparison."""

    item = dataset_from_row(row, include_rows=True)
    if str(item.get("dataType") or "").lower() != "cyc":
        raise HTTPException(status_code=422, detail="Only CYC datasets have a comparison series.")
    rows, _ = load_analysis_rows(item, include_review_rows=True)
    points, capacity_info = capacity_series(rows)
    return {
        "datasetId": item["id"],
        "dataType": "cyc",
        "capacityUnit": str(capacity_info.get("unit") or ""),
        "pointCount": len(points),
        "points": [
            {"cycle": float(cycle), "capacity": float(capacity)}
            for cycle, capacity in points
        ],
    }


def browser_dataset_detail(conn, dataset_id: str) -> dict:
    """Return one saved Dataset without sending every raw instrument point.

    The database and parsed artifact retain the full normalized source.  This
    helper is intentionally used after create/update operations as well as the
    detail endpoint so a successful save cannot immediately send a 30k+ row
    JSON response back to the browser and freeze the tab.
    """

    row = execute(conn, "SELECT * FROM datasets WHERE id = ?", (dataset_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Dataset not found after save.")
    return dataset_detail_from_row(row)


def feedback_from_row(row) -> dict:
    """Convert a feedback DB row to the camelCase shape used by app.js."""

    return {
        "id": row["id"],
        "name": row["name"],
        "email": row["email"],
        "page": row["page"],
        "message": row["message"],
        "status": row["status"],
        "createdAt": row["created_at"],
        "userId": row["user_id"],
        "userName": row["user_name"],
    }


def make_id(prefix: str) -> str:
    """Create readable IDs without exposing database-specific integer IDs."""

    return f"{prefix}-{int(time.time() * 1000)}-{secrets.token_hex(3)}"


def table_columns(conn, table_name: str) -> set[str]:
    """Return column names for SQLite and PostgreSQL during safe schema upgrades."""

    if USE_POSTGRES:
        rows = execute(
            conn,
            """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = current_schema() AND table_name = ?
            """,
            (table_name,),
        ).fetchall()
        return {str(row["column_name"]) for row in rows}
    rows = execute(conn, f"PRAGMA table_info({table_name})").fetchall()
    return {str(row["name"]) for row in rows}


def ensure_dataset_hierarchy_columns(conn) -> None:
    """Add hierarchy and Dataset-group links without changing existing raw data."""

    columns = table_columns(conn, "datasets")
    for column_name in ("project_id", "campaign_id", "cell_record_id", "dataset_group_id"):
        if column_name not in columns:
            execute(conn, f"ALTER TABLE datasets ADD COLUMN {column_name} TEXT NOT NULL DEFAULT ''")


def ensure_dataset_provenance_columns(conn) -> None:
    """Add artifact and provenance columns without rewriting legacy dataset rows."""

    columns = table_columns(conn, "datasets")
    for column_name in (
        "raw_artifact_json",
        "parsed_artifact_json",
        "column_mapping_json",
        "quality_json",
        "parser_json",
        "analysis_provenance_json",
    ):
        if column_name not in columns:
            execute(conn, f"ALTER TABLE datasets ADD COLUMN {column_name} TEXT NOT NULL DEFAULT '{{}}'")
    if "organization_id" not in columns:
        execute(conn, "ALTER TABLE datasets ADD COLUMN organization_id TEXT NOT NULL DEFAULT ''")
    execute(conn, "UPDATE datasets SET organization_id = '' WHERE organization_id = '{}' ")


def ensure_dataset_row_storage_columns(conn) -> None:
    """Track full row counts while PostgreSQL keeps large rows in object storage."""

    columns = table_columns(conn, "datasets")
    if "row_count" not in columns:
        execute(conn, "ALTER TABLE datasets ADD COLUMN row_count INTEGER NOT NULL DEFAULT 0")
    if "rows_storage" not in columns:
        execute(conn, "ALTER TABLE datasets ADD COLUMN rows_storage TEXT NOT NULL DEFAULT 'database'")

    rows = execute(conn, "SELECT id, rows_json, row_count FROM datasets WHERE row_count = 0").fetchall()
    for row in rows:
        stored_rows = json_loads(row["rows_json"], [])
        if isinstance(stored_rows, list) and stored_rows:
            execute(conn, "UPDATE datasets SET row_count = ? WHERE id = ?", (len(stored_rows), row["id"]))


def ensure_hierarchy_organization_columns(conn) -> None:
    """Add optional organization links without changing personal projects."""

    for table_name in ("projects", "campaigns", "cells", "dataset_groups"):
        columns = table_columns(conn, table_name)
        if "organization_id" not in columns:
            execute(conn, f"ALTER TABLE {table_name} ADD COLUMN organization_id TEXT NOT NULL DEFAULT ''")


def ensure_derived_artifact_columns(conn) -> None:
    """Keep generated figure/report provenance alongside the saved record."""

    for table_name in ("figures", "reports"):
        columns = table_columns(conn, table_name)
        if "artifact_json" not in columns:
            execute(conn, f"ALTER TABLE {table_name} ADD COLUMN artifact_json TEXT NOT NULL DEFAULT '{{}}'")


def ensure_analysis_run_columns(conn) -> None:
    """Upgrade pre-artifact analysis history so it remains readable and deletable."""

    columns = table_columns(conn, "analysis_runs")
    if "artifact_json" not in columns:
        execute(conn, "ALTER TABLE analysis_runs ADD COLUMN artifact_json TEXT NOT NULL DEFAULT '{}'")


def project_from_row(row) -> dict:
    return {
        "id": row["id"],
        "ownerId": row["owner_id"],
        "name": row["name"],
        "description": row["description"],
        "organizationId": row["organization_id"] if "organization_id" in row.keys() else "",
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
    }


def campaign_from_row(row) -> dict:
    return {
        "id": row["id"],
        "projectId": row["project_id"],
        "ownerId": row["owner_id"],
        "name": row["name"],
        "description": row["description"],
        "organizationId": row["organization_id"] if "organization_id" in row.keys() else "",
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
    }


def cell_record_from_row(row) -> dict:
    return {
        "id": row["id"],
        "projectId": row["project_id"],
        "campaignId": row["campaign_id"],
        "ownerId": row["owner_id"],
        "cellId": row["cell_id"],
        "sampleName": row["sample_name"],
        "material": row["material"],
        "electrolyte": row["electrolyte"],
        "condition": row["condition"],
        "notes": row["notes"],
        "organizationId": row["organization_id"] if "organization_id" in row.keys() else "",
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
    }


def dataset_group_from_row(row) -> dict:
    return {
        "id": row["id"],
        "projectId": row["project_id"],
        "campaignId": row["campaign_id"],
        "cellRecordId": row["cell_record_id"],
        "ownerId": row["owner_id"],
        "name": row["name"],
        "description": row["description"],
        "organizationId": row["organization_id"] if "organization_id" in row.keys() else "",
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
    }


def cell_metadata_from_row(row) -> dict:
    return {
        "id": row["id"],
        "cellRecordId": row["cell_record_id"],
        "ownerId": row["owner_id"],
        "metadata": json_loads(row["metadata_json"], {}),
        "tags": json_loads(row["tags_json"], []),
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
    }


def protocol_segment_from_row(row) -> dict:
    return {
        "id": row["id"],
        "datasetGroupId": row["dataset_group_id"],
        "cellRecordId": row["cell_record_id"],
        "ownerId": row["owner_id"],
        "label": row["label"],
        "startCycle": row["start_cycle"],
        "endCycle": row["end_cycle"],
        "cRate": row["c_rate"],
        "mode": row["mode"],
        "notes": row["notes"],
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
    }


def figure_record_from_row(row) -> dict:
    return {
        "id": row["id"],
        "datasetId": row["dataset_id"],
        "datasetGroupId": row["dataset_group_id"],
        "cellRecordId": row["cell_record_id"],
        "ownerId": row["owner_id"],
        "name": row["name"],
        "figureKind": row["figure_kind"],
        "edits": json_loads(row["edits_json"], {}),
        "artifact": json_loads(row["artifact_json"], {}) if "artifact_json" in row.keys() else {},
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
    }


def report_from_row(row) -> dict:
    return {
        "id": row["id"],
        "datasetId": row["dataset_id"],
        "datasetGroupId": row["dataset_group_id"],
        "cellRecordId": row["cell_record_id"],
        "ownerId": row["owner_id"],
        "title": row["title"],
        "reportType": row["report_type"],
        "content": json_loads(row["content_json"], {}),
        "artifact": json_loads(row["artifact_json"], {}) if "artifact_json" in row.keys() else {},
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
    }


def ensure_default_project(conn, owner_id: str) -> dict:
    row = execute(
        conn,
        "SELECT * FROM projects WHERE owner_id = ? AND name = ? ORDER BY created_at LIMIT 1",
        (owner_id, "나의 배터리 연구"),
    ).fetchone()
    if row:
        return project_from_row(row)
    current = now_iso()
    item = {
        "id": make_id("PRJ"),
        "ownerId": owner_id,
        "name": "나의 배터리 연구",
        "description": "기존 데이터와 새 실험을 정리하는 기본 프로젝트",
        "createdAt": current,
        "updatedAt": current,
    }
    execute(
        conn,
        "INSERT INTO projects(id, owner_id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
        (item["id"], item["ownerId"], item["name"], item["description"], item["createdAt"], item["updatedAt"]),
    )
    item["organizationId"] = ""
    return item


def ensure_default_campaign(conn, project: dict, owner_id: str) -> dict:
    row = execute(
        conn,
        "SELECT * FROM campaigns WHERE project_id = ? AND owner_id = ? AND name = ? ORDER BY created_at LIMIT 1",
        (project["id"], owner_id, "미분류 실험 배치"),
    ).fetchone()
    # A shared project's default campaign belongs to the project, not only its creator.
    if row is None and project.get("organizationId"):
        row = execute(
            conn,
            "SELECT * FROM campaigns WHERE project_id = ? ORDER BY created_at LIMIT 1",
            (project["id"],),
        ).fetchone()
    if row:
        return campaign_from_row(row)
    current = now_iso()
    item = {
        "id": make_id("CMP"),
        "projectId": project["id"],
        "ownerId": owner_id,
        "name": "미분류 실험 배치",
        "description": "기존 저장 데이터를 보존하기 위한 기본 묶음",
        "createdAt": current,
        "updatedAt": current,
    }
    execute(
        conn,
        "INSERT INTO campaigns(id, project_id, owner_id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (item["id"], item["projectId"], item["ownerId"], item["name"], item["description"], item["createdAt"], item["updatedAt"]),
    )
    item["organizationId"] = project.get("organizationId", "")
    execute(
        conn,
        "UPDATE campaigns SET organization_id = ? WHERE id = ?",
        (item["organizationId"], item["id"]),
    )
    return item


def merge_cell_record(conn, campaign: dict, owner_id: str, cell: dict, source_name: str, requested_id: str = "") -> dict:
    """Reuse the same cell record in a campaign so CYC/EIS/CV become siblings."""

    row = None
    if requested_id:
        row = execute(
            conn,
            "SELECT * FROM cells WHERE id = ? AND campaign_id = ? AND owner_id = ?",
            (requested_id, campaign["id"], owner_id),
        ).fetchone()
        if row is None and campaign.get("organizationId"):
            row = execute(
                conn,
                "SELECT * FROM cells WHERE id = ? AND campaign_id = ?",
                (requested_id, campaign["id"]),
            ).fetchone()

    cell_id = str(cell.get("cellId") or "").strip()
    if row is None and cell_id:
        row = execute(
            conn,
            "SELECT * FROM cells WHERE campaign_id = ? AND owner_id = ? AND lower(cell_id) = lower(?) ORDER BY created_at LIMIT 1",
            (campaign["id"], owner_id, cell_id),
        ).fetchone()
        if row is None and campaign.get("organizationId"):
            row = execute(
                conn,
                "SELECT * FROM cells WHERE campaign_id = ? AND lower(cell_id) = lower(?) ORDER BY created_at LIMIT 1",
                (campaign["id"], cell_id),
            ).fetchone()

    current = now_iso()
    if row is None:
        item = {
            "id": make_id("CELL"),
            "projectId": campaign["projectId"],
            "campaignId": campaign["id"],
            "ownerId": owner_id,
            "cellId": cell_id or str(cell.get("sampleName") or source_name or "새 셀")[:120],
            "sampleName": str(cell.get("sampleName") or ""),
            "material": str(cell.get("material") or ""),
            "electrolyte": str(cell.get("electrolyte") or ""),
            "condition": str(cell.get("condition") or ""),
            "notes": str(cell.get("notes") or ""),
            "createdAt": current,
            "updatedAt": current,
        }
        execute(
            conn,
            """
            INSERT INTO cells(
              id, project_id, campaign_id, owner_id, cell_id, sample_name,
              material, electrolyte, condition, notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                item["id"], item["projectId"], item["campaignId"], item["ownerId"], item["cellId"],
                item["sampleName"], item["material"], item["electrolyte"], item["condition"],
                item["notes"], item["createdAt"], item["updatedAt"],
            ),
        )
        item["organizationId"] = campaign.get("organizationId", "")
        execute(
            conn,
            "UPDATE cells SET organization_id = ? WHERE id = ?",
            (item["organizationId"], item["id"]),
        )
        return item

    # Fill missing details only. A short follow-up upload must not erase richer cell metadata.
    existing = cell_record_from_row(row)
    updates = {
        "sampleName": str(cell.get("sampleName") or existing["sampleName"]),
        "material": str(cell.get("material") or existing["material"]),
        "electrolyte": str(cell.get("electrolyte") or existing["electrolyte"]),
        "condition": str(cell.get("condition") or existing["condition"]),
        "notes": str(cell.get("notes") or existing["notes"]),
    }
    execute(
        conn,
        """
        UPDATE cells SET sample_name = ?, material = ?, electrolyte = ?, condition = ?, notes = ?, updated_at = ?
        WHERE id = ?
        """,
        (updates["sampleName"], updates["material"], updates["electrolyte"], updates["condition"], updates["notes"], current, existing["id"]),
    )
    return {**existing, **updates, "updatedAt": current}


def ensure_dataset_group(
    conn,
    cell_record: dict,
    owner_id: str,
    requested_id: str = "",
    requested_name: str = "",
) -> dict:
    """Find or create the Dataset container that holds CYC/EIS/CV siblings."""

    row = None
    if requested_id:
        row = execute(
            conn,
            "SELECT * FROM dataset_groups WHERE id = ? AND cell_record_id = ? AND owner_id = ?",
            (requested_id, cell_record["id"], owner_id),
        ).fetchone()
        if row is None and cell_record.get("organizationId"):
            row = execute(
                conn,
                "SELECT * FROM dataset_groups WHERE id = ? AND cell_record_id = ?",
                (requested_id, cell_record["id"]),
            ).fetchone()
    name = str(requested_name or "").strip()[:120]
    if row is None and name:
        row = execute(
            conn,
            "SELECT * FROM dataset_groups WHERE cell_record_id = ? AND owner_id = ? AND lower(name) = lower(?) ORDER BY created_at LIMIT 1",
            (cell_record["id"], owner_id, name),
        ).fetchone()
        if row is None and cell_record.get("organizationId"):
            row = execute(
                conn,
                "SELECT * FROM dataset_groups WHERE cell_record_id = ? AND lower(name) = lower(?) ORDER BY created_at LIMIT 1",
                (cell_record["id"], name),
            ).fetchone()
    if row is None and not name:
        row = execute(
            conn,
            "SELECT * FROM dataset_groups WHERE cell_record_id = ? AND owner_id = ? ORDER BY created_at LIMIT 1",
            (cell_record["id"], owner_id),
        ).fetchone()
        if row is None and cell_record.get("organizationId"):
            row = execute(
                conn,
                "SELECT * FROM dataset_groups WHERE cell_record_id = ? ORDER BY created_at LIMIT 1",
                (cell_record["id"],),
            ).fetchone()
    if row:
        return dataset_group_from_row(row)

    current = now_iso()
    item = {
        "id": make_id("DSG"),
        "projectId": cell_record["projectId"],
        "campaignId": cell_record["campaignId"],
        "cellRecordId": cell_record["id"],
        "ownerId": owner_id,
        "name": name or "기본 Dataset",
        "description": "CYC, EIS, CV, Fig와 보고서를 함께 묶는 분석 단위",
        "createdAt": current,
        "updatedAt": current,
    }
    execute(
        conn,
        """
        INSERT INTO dataset_groups(
          id, project_id, campaign_id, cell_record_id, owner_id, name, description, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            item["id"], item["projectId"], item["campaignId"], item["cellRecordId"], item["ownerId"],
            item["name"], item["description"], item["createdAt"], item["updatedAt"],
        ),
    )
    item["organizationId"] = cell_record.get("organizationId", "")
    execute(
        conn,
        "UPDATE dataset_groups SET organization_id = ? WHERE id = ?",
        (item["organizationId"], item["id"]),
    )
    return item


def resolve_dataset_hierarchy(conn, item: dict, actor_user: dict | None = None) -> dict:
    """Resolve a dataset into a personal or shared organization hierarchy safely."""

    owner_id = item["ownerId"]
    actor = actor_user or {"id": owner_id, "name": item.get("ownerName") or owner_id, "role": "user"}
    project_id = str(item.get("projectId") or "").strip()
    campaign_id = str(item.get("campaignId") or "").strip()
    cell_record_id = str(item.get("cellRecordId") or "").strip()
    dataset_group_id = str(item.get("datasetGroupId") or "").strip()
    dataset_group_name = str(item.get("datasetGroupName") or "").strip()

    project_row = execute(conn, "SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone() if project_id else None
    if project_id and not project_row:
        raise HTTPException(status_code=404, detail="Project not found.")
    if project_row and not can_edit_row(conn, actor, project_row):
        raise HTTPException(status_code=403, detail="Project edit permission is required.")
    project = project_from_row(project_row) if project_row else ensure_default_project(conn, owner_id)

    campaign_row = execute(
        conn,
        "SELECT * FROM campaigns WHERE id = ? AND project_id = ?",
        (campaign_id, project["id"]),
    ).fetchone() if campaign_id else None
    if campaign_id and not campaign_row:
        raise HTTPException(status_code=404, detail="Campaign not found in this project.")
    if campaign_row and not can_edit_row(conn, actor, campaign_row):
        raise HTTPException(status_code=403, detail="Campaign edit permission is required.")
    campaign = campaign_from_row(campaign_row) if campaign_row else ensure_default_campaign(conn, project, actor["id"])

    cell_record = merge_cell_record(conn, campaign, actor["id"], item.get("cell") or {}, item.get("sourceName") or "", cell_record_id)
    dataset_group = ensure_dataset_group(conn, cell_record, actor["id"], dataset_group_id, dataset_group_name)
    return {
        "projectId": project["id"],
        "campaignId": campaign["id"],
        "cellRecordId": cell_record["id"],
        "datasetGroupId": dataset_group["id"],
        "organizationId": project.get("organizationId", ""),
    }


def migrate_existing_dataset_hierarchy(conn) -> None:
    """Link legacy datasets to the new hierarchy without modifying their raw rows or files."""

    rows = execute(
        conn,
        "SELECT * FROM datasets WHERE project_id = '' OR campaign_id = '' OR cell_record_id = '' OR dataset_group_id = ''",
    ).fetchall()
    for row in rows:
        item = dataset_from_row(row)
        links = resolve_dataset_hierarchy(conn, item)
        execute(
            conn,
            "UPDATE datasets SET project_id = ?, campaign_id = ?, cell_record_id = ?, dataset_group_id = ? WHERE id = ?",
            (links["projectId"], links["campaignId"], links["cellRecordId"], links["datasetGroupId"], item["id"]),
        )


def hierarchy_for_user(conn, user: dict) -> list[dict]:
    """Return Project -> Campaign -> Cell tree visible to the signed-in user."""

    # Filter every level, rather than only projects, so personal and shared records
    # follow the same role checks even after a project changes organization membership.
    projects = [
        row for row in execute(conn, "SELECT * FROM projects ORDER BY updated_at DESC, name").fetchall()
        if can_view_row(conn, user, row)
    ]
    project_ids = {row["id"] for row in projects}
    campaigns = [
        row for row in execute(conn, "SELECT * FROM campaigns ORDER BY created_at, name").fetchall()
        if row["project_id"] in project_ids and can_view_row(conn, user, row)
    ]
    campaign_ids = {row["id"] for row in campaigns}
    cells = [
        row for row in execute(conn, "SELECT * FROM cells ORDER BY created_at, cell_id").fetchall()
        if row["campaign_id"] in campaign_ids and can_view_row(conn, user, row)
    ]
    cell_ids = {row["id"] for row in cells}
    dataset_groups = [
        row for row in execute(conn, "SELECT * FROM dataset_groups ORDER BY created_at, name").fetchall()
        if row["cell_record_id"] in cell_ids and can_view_row(conn, user, row)
    ]

    campaign_map: dict[str, list[dict]] = {}
    for row in campaigns:
        item = campaign_from_row(row)
        item["cells"] = []
        campaign_map.setdefault(item["projectId"], []).append(item)
    cell_map = {item["id"]: item for items in campaign_map.values() for item in items}
    for row in cells:
        item = cell_record_from_row(row)
        item["datasetGroups"] = []
        campaign = cell_map.get(item["campaignId"])
        if campaign is not None:
            campaign["cells"].append(item)
    cells_by_id = {item["id"]: item for items in campaign_map.values() for campaign in items for item in campaign["cells"]}
    for row in dataset_groups:
        item = dataset_group_from_row(row)
        cell = cells_by_id.get(item["cellRecordId"])
        if cell is not None:
            cell["datasetGroups"].append(item)
    result = []
    for row in projects:
        item = project_from_row(row)
        item["campaigns"] = campaign_map.get(item["id"], [])
        result.append(item)
    return result


def init_db() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)

    # WAL lets inspection reads proceed while an uploaded raw/parsed artifact
    # is being finalized into its Dataset record.
    if not USE_POSTGRES:
        with connect() as sqlite_conn:
            sqlite_conn.execute("PRAGMA journal_mode = WAL")

    schema = [
        """
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'user',
          created_at TEXT NOT NULL
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS datasets (
          id TEXT PRIMARY KEY,
          owner_id TEXT NOT NULL,
          owner_name TEXT NOT NULL,
          data_type TEXT NOT NULL,
          figure_kind TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          cell_json TEXT NOT NULL DEFAULT '{}',
          rows_json TEXT NOT NULL DEFAULT '[]',
          row_count INTEGER NOT NULL DEFAULT 0,
          rows_storage TEXT NOT NULL DEFAULT 'database',
          columns_json TEXT NOT NULL DEFAULT '[]',
          source_name TEXT NOT NULL DEFAULT '',
          figure_edits_json TEXT NOT NULL DEFAULT '{}',
          FOREIGN KEY(owner_id) REFERENCES users(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS projects (
          id TEXT PRIMARY KEY,
          owner_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY(owner_id) REFERENCES users(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS campaigns (
          id TEXT PRIMARY KEY,
          project_id TEXT NOT NULL,
          owner_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY(project_id) REFERENCES projects(id),
          FOREIGN KEY(owner_id) REFERENCES users(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS cells (
          id TEXT PRIMARY KEY,
          project_id TEXT NOT NULL,
          campaign_id TEXT NOT NULL,
          owner_id TEXT NOT NULL,
          cell_id TEXT NOT NULL,
          sample_name TEXT NOT NULL DEFAULT '',
          material TEXT NOT NULL DEFAULT '',
          electrolyte TEXT NOT NULL DEFAULT '',
          condition TEXT NOT NULL DEFAULT '',
          notes TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY(project_id) REFERENCES projects(id),
          FOREIGN KEY(campaign_id) REFERENCES campaigns(id),
          FOREIGN KEY(owner_id) REFERENCES users(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS dataset_groups (
          id TEXT PRIMARY KEY,
          project_id TEXT NOT NULL,
          campaign_id TEXT NOT NULL,
          cell_record_id TEXT NOT NULL,
          owner_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY(project_id) REFERENCES projects(id),
          FOREIGN KEY(campaign_id) REFERENCES campaigns(id),
          FOREIGN KEY(cell_record_id) REFERENCES cells(id),
          FOREIGN KEY(owner_id) REFERENCES users(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS cell_metadata (
          id TEXT PRIMARY KEY,
          cell_record_id TEXT NOT NULL UNIQUE,
          owner_id TEXT NOT NULL,
          metadata_json TEXT NOT NULL DEFAULT '{}',
          tags_json TEXT NOT NULL DEFAULT '[]',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY(cell_record_id) REFERENCES cells(id),
          FOREIGN KEY(owner_id) REFERENCES users(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS protocol_segments (
          id TEXT PRIMARY KEY,
          dataset_group_id TEXT NOT NULL DEFAULT '',
          cell_record_id TEXT NOT NULL,
          owner_id TEXT NOT NULL,
          label TEXT NOT NULL,
          start_cycle INTEGER NOT NULL,
          end_cycle INTEGER NOT NULL,
          c_rate REAL,
          mode TEXT NOT NULL DEFAULT '',
          notes TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY(dataset_group_id) REFERENCES dataset_groups(id),
          FOREIGN KEY(cell_record_id) REFERENCES cells(id),
          FOREIGN KEY(owner_id) REFERENCES users(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS figures (
          id TEXT PRIMARY KEY,
          dataset_id TEXT NOT NULL UNIQUE,
          dataset_group_id TEXT NOT NULL,
          cell_record_id TEXT NOT NULL,
          owner_id TEXT NOT NULL,
          name TEXT NOT NULL,
          figure_kind TEXT NOT NULL,
          edits_json TEXT NOT NULL DEFAULT '{}',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY(dataset_id) REFERENCES datasets(id),
          FOREIGN KEY(dataset_group_id) REFERENCES dataset_groups(id),
          FOREIGN KEY(cell_record_id) REFERENCES cells(id),
          FOREIGN KEY(owner_id) REFERENCES users(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS reports (
          id TEXT PRIMARY KEY,
          dataset_id TEXT NOT NULL,
          dataset_group_id TEXT NOT NULL,
          cell_record_id TEXT NOT NULL,
          owner_id TEXT NOT NULL,
          title TEXT NOT NULL,
          report_type TEXT NOT NULL,
          content_json TEXT NOT NULL DEFAULT '{}',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          UNIQUE(dataset_id, report_type),
          FOREIGN KEY(dataset_id) REFERENCES datasets(id),
          FOREIGN KEY(dataset_group_id) REFERENCES dataset_groups(id),
          FOREIGN KEY(cell_record_id) REFERENCES cells(id),
          FOREIGN KEY(owner_id) REFERENCES users(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS feedback (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL DEFAULT '',
          email TEXT NOT NULL DEFAULT '',
          page TEXT NOT NULL DEFAULT '',
          message TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'open',
          created_at TEXT NOT NULL,
          user_id TEXT NOT NULL DEFAULT '',
          user_name TEXT NOT NULL DEFAULT ''
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS organizations (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          created_by TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY(created_by) REFERENCES users(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS organization_members (
          organization_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          role TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          PRIMARY KEY(organization_id, user_id),
          FOREIGN KEY(organization_id) REFERENCES organizations(id),
          FOREIGN KEY(user_id) REFERENCES users(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS api_tokens (
          id TEXT PRIMARY KEY,
          owner_id TEXT NOT NULL,
          name TEXT NOT NULL,
          token_hash TEXT NOT NULL UNIQUE,
          created_at TEXT NOT NULL,
          last_used_at TEXT NOT NULL DEFAULT '',
          revoked_at TEXT NOT NULL DEFAULT '',
          FOREIGN KEY(owner_id) REFERENCES users(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS analysis_runs (
          id TEXT PRIMARY KEY,
          dataset_id TEXT NOT NULL,
          owner_id TEXT NOT NULL,
          analysis_name TEXT NOT NULL,
          analysis_version TEXT NOT NULL,
          parameters_json TEXT NOT NULL DEFAULT '{}',
          result_json TEXT NOT NULL DEFAULT '{}',
          provenance_json TEXT NOT NULL DEFAULT '{}',
          artifact_json TEXT NOT NULL DEFAULT '{}',
          created_at TEXT NOT NULL,
          FOREIGN KEY(dataset_id) REFERENCES datasets(id),
          FOREIGN KEY(owner_id) REFERENCES users(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS upload_sessions (
          id TEXT PRIMARY KEY,
          owner_id TEXT NOT NULL,
          filename TEXT NOT NULL,
          local_path TEXT NOT NULL,
          storage_url TEXT NOT NULL DEFAULT '',
          sha256 TEXT NOT NULL,
          size_bytes INTEGER NOT NULL,
          parser_json TEXT NOT NULL DEFAULT '{}',
          column_mapping_json TEXT NOT NULL DEFAULT '{}',
          quality_json TEXT NOT NULL DEFAULT '{}',
          canonical_rows_json TEXT NOT NULL DEFAULT '[]',
          created_at TEXT NOT NULL,
          consumed_dataset_id TEXT NOT NULL DEFAULT '',
          consumed_at TEXT NOT NULL DEFAULT '',
          FOREIGN KEY(owner_id) REFERENCES users(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS artifact_archives (
          id TEXT PRIMARY KEY,
          dataset_id TEXT NOT NULL,
          owner_id TEXT NOT NULL,
          owner_name TEXT NOT NULL DEFAULT '',
          artifact_kind TEXT NOT NULL,
          object_key TEXT NOT NULL UNIQUE,
          source_name TEXT NOT NULL,
          size_bytes INTEGER NOT NULL,
          sha256 TEXT NOT NULL,
          content_type TEXT NOT NULL DEFAULT 'application/octet-stream',
          created_at TEXT NOT NULL,
          backup_state TEXT NOT NULL DEFAULT 'pending',
          backup_device_id TEXT NOT NULL DEFAULT '',
          backup_relative_path TEXT NOT NULL DEFAULT '',
          verified_at TEXT NOT NULL DEFAULT '',
          cleanup_eligible INTEGER NOT NULL DEFAULT 0
        )
        """,
        "CREATE INDEX IF NOT EXISTS idx_datasets_owner ON datasets(owner_id)",
        "CREATE INDEX IF NOT EXISTS idx_organization_members_user ON organization_members(user_id, organization_id)",
        "CREATE INDEX IF NOT EXISTS idx_api_tokens_owner ON api_tokens(owner_id, created_at)",
        "CREATE INDEX IF NOT EXISTS idx_datasets_type ON datasets(data_type)",
        "CREATE INDEX IF NOT EXISTS idx_datasets_updated ON datasets(updated_at)",
        "CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id)",
        "CREATE INDEX IF NOT EXISTS idx_campaigns_project ON campaigns(project_id)",
        "CREATE INDEX IF NOT EXISTS idx_campaigns_owner ON campaigns(owner_id)",
        "CREATE INDEX IF NOT EXISTS idx_cells_campaign ON cells(campaign_id)",
        "CREATE INDEX IF NOT EXISTS idx_cells_owner ON cells(owner_id)",
        "CREATE INDEX IF NOT EXISTS idx_dataset_groups_cell ON dataset_groups(cell_record_id)",
        "CREATE INDEX IF NOT EXISTS idx_dataset_groups_owner ON dataset_groups(owner_id)",
        "CREATE INDEX IF NOT EXISTS idx_protocol_segments_cell ON protocol_segments(cell_record_id)",
        "CREATE INDEX IF NOT EXISTS idx_protocol_segments_group ON protocol_segments(dataset_group_id)",
        "CREATE INDEX IF NOT EXISTS idx_figures_group ON figures(dataset_group_id)",
        "CREATE INDEX IF NOT EXISTS idx_reports_group ON reports(dataset_group_id)",
        "CREATE INDEX IF NOT EXISTS idx_analysis_runs_dataset ON analysis_runs(dataset_id, created_at)",
        "CREATE INDEX IF NOT EXISTS idx_analysis_runs_owner ON analysis_runs(owner_id, created_at)",
        "CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at)",
        "CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status)",
        "CREATE INDEX IF NOT EXISTS idx_upload_sessions_owner ON upload_sessions(owner_id)",
        "CREATE INDEX IF NOT EXISTS idx_upload_sessions_created ON upload_sessions(created_at)",
        "CREATE INDEX IF NOT EXISTS idx_artifact_archives_state ON artifact_archives(backup_state, created_at)",
        "CREATE INDEX IF NOT EXISTS idx_artifact_archives_dataset ON artifact_archives(dataset_id, artifact_kind)",
    ]

    with connect() as conn:
        for statement in schema:
            execute(conn, statement)
        ensure_dataset_hierarchy_columns(conn)
        ensure_dataset_provenance_columns(conn)
        ensure_dataset_row_storage_columns(conn)
        ensure_hierarchy_organization_columns(conn)
        ensure_derived_artifact_columns(conn)
        ensure_analysis_run_columns(conn)

        user_count = scalar(execute(conn, "SELECT COUNT(*) AS count FROM users").fetchone()) or 0
        if user_count == 0:
            users = read_json_file(USERS_JSON, [])
            if not users:
                fallback_password = BOOTSTRAP_ADMIN_PASSWORD or secrets.token_urlsafe(24)
                users = [
                    {
                        "id": BOOTSTRAP_ADMIN_ID or "admin",
                        "name": BOOTSTRAP_ADMIN_NAME or BOOTSTRAP_ADMIN_ID or "Admin",
                        "passwordHash": hash_password(fallback_password),
                        "role": "admin",
                        "createdAt": now_iso(),
                    }
                ]
            for user in users:
                execute(
                    conn,
                    """
                    INSERT INTO users(id, name, password_hash, role, created_at)
                    VALUES (?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO NOTHING
                    """,
                    (
                        str(user.get("id") or "").strip(),
                        str(user.get("name") or user.get("id") or "").strip(),
                        str(user.get("passwordHash") or user.get("password_hash") or hash_password("1234")),
                        str(user.get("role") or "user"),
                        str(user.get("createdAt") or user.get("created_at") or now_iso()),
                    ),
                )

        ensure_bootstrap_admin(conn)

        dataset_count = scalar(execute(conn, "SELECT COUNT(*) AS count FROM datasets").fetchone()) or 0
        if dataset_count == 0 and DATASETS_JSON.exists():
            for item in read_json_file(DATASETS_JSON, []):
                save_dataset(conn, item, migrate=True)

        # Existing datasets remain intact and gain only hierarchy references.
        migrate_existing_dataset_hierarchy(conn)
        # A former SDE import mapped Z' to frequency. Rebuild only the clearly
        # affected EIS datasets when their immutable local raw artifact exists.
        repair_stale_sde_datasets(conn)
        # WRD parser v5 retains point-level voltage-capacity traces so a real
        # dQ/dV can be calculated. Refresh older summary-only WRD datasets
        # only when their immutable raw artifact is available.
        repair_stale_wrd_datasets(conn)
        # Figure records created before source-first labels could inherit a
        # cell ID from a different data type in the same experiment. Keep the
        # stored record aligned with its actual Dataset before the UI reads it.
        normalize_figure_record_identity(conn)
        # Raw artifacts created before the local backup agent existed are also
        # queued. Backfill stores metadata only and never reads or deletes cloud objects.
        backfill_archive_registry(conn)


def ensure_bootstrap_admin(conn) -> None:
    """Create or update the configured owner/admin account.

    The password comes from an environment variable, not from GitHub files.
    This keeps local, Render, Railway, and Fly deployments consistent without
    hard-coding a real password into the repository.
    """

    if not BOOTSTRAP_ADMIN_ID:
        return

    current = now_iso()
    admin_name = BOOTSTRAP_ADMIN_NAME or BOOTSTRAP_ADMIN_ID
    existing = get_user_by_id(BOOTSTRAP_ADMIN_ID, conn)
    if BOOTSTRAP_ADMIN_PASSWORD:
        password_hash = hash_password(BOOTSTRAP_ADMIN_PASSWORD)
        if existing:
            execute(
                conn,
                "UPDATE users SET name = ?, password_hash = ?, role = ? WHERE id = ?",
                (admin_name, password_hash, "admin", BOOTSTRAP_ADMIN_ID),
            )
        else:
            execute(
                conn,
                "INSERT INTO users(id, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)",
                (BOOTSTRAP_ADMIN_ID, admin_name, password_hash, "admin", current),
            )
        return

    if existing and existing["role"] != "admin":
        execute(conn, "UPDATE users SET name = ?, role = ? WHERE id = ?", (admin_name, "admin", BOOTSTRAP_ADMIN_ID))


def save_dataset(conn, payload: dict, migrate: bool = False, actor_user: dict | None = None) -> dict:
    current = now_iso()
    item_id = str(payload.get("id") or f"{str(payload.get('dataType') or 'data').upper()}-{int(time.time() * 1000)}")
    owner_id = str(payload.get("ownerId") or payload.get("owner_id") or "admin")
    owner_name = str(payload.get("ownerName") or payload.get("owner_name") or owner_id)
    created_at = str(payload.get("createdAt") or payload.get("created_at") or current)
    updated_at = str(payload.get("updatedAt") or payload.get("updated_at") or current)
    item = {
        "id": item_id,
        "ownerId": owner_id,
        "ownerName": owner_name,
        "dataType": str(payload.get("dataType") or payload.get("data_type") or "eis"),
        "figureKind": str(payload.get("figureKind") or payload.get("figure_kind") or "eis-combined"),
        "createdAt": created_at,
        "updatedAt": updated_at,
        "cell": payload.get("cell") if isinstance(payload.get("cell"), dict) else {},
        "rows": payload.get("rows") if isinstance(payload.get("rows"), list) else [],
        "rowCount": payload.get("rowCount") or payload.get("row_count") or 0,
        "columns": payload.get("columns") if isinstance(payload.get("columns"), list) else [],
        "sourceName": str(payload.get("sourceName") or payload.get("source_name") or ""),
        "figureEdits": payload.get("figureEdits") if isinstance(payload.get("figureEdits"), dict) else {},
        "projectId": str(payload.get("projectId") or payload.get("project_id") or ""),
        "campaignId": str(payload.get("campaignId") or payload.get("campaign_id") or ""),
        "cellRecordId": str(payload.get("cellRecordId") or payload.get("cell_record_id") or ""),
        "datasetGroupId": str(payload.get("datasetGroupId") or payload.get("dataset_group_id") or ""),
        "datasetGroupName": str(payload.get("datasetGroupName") or payload.get("dataset_group_name") or ""),
        "organizationId": str(payload.get("organizationId") or payload.get("organization_id") or ""),
        "rawArtifact": payload.get("rawArtifact") if isinstance(payload.get("rawArtifact"), dict) else {},
        "parsedArtifact": payload.get("parsedArtifact") if isinstance(payload.get("parsedArtifact"), dict) else {},
        "columnMapping": payload.get("columnMapping") if isinstance(payload.get("columnMapping"), dict) else {},
        "quality": payload.get("quality") if isinstance(payload.get("quality"), dict) else {},
        "parser": payload.get("parser") if isinstance(payload.get("parser"), dict) else {},
        "analysisProvenance": payload.get("analysisProvenance") if isinstance(payload.get("analysisProvenance"), dict) else {},
    }
    if migrate and not get_user_by_id(owner_id, conn):
        execute(
            conn,
            "INSERT INTO users(id, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING",
            (owner_id, owner_name, hash_password("1234"), "user", current),
        )

    item.update(resolve_dataset_hierarchy(conn, item, actor_user))
    database_rows, row_count, rows_storage = database_rows_payload(item)

    execute(
        conn,
        """
        INSERT INTO datasets(
          id, owner_id, owner_name, data_type, figure_kind, created_at, updated_at,
          cell_json, rows_json, row_count, rows_storage, columns_json, source_name, figure_edits_json,
          project_id, campaign_id, cell_record_id, dataset_group_id,
          raw_artifact_json, parsed_artifact_json, column_mapping_json, quality_json,
          parser_json, analysis_provenance_json, organization_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          owner_id = excluded.owner_id,
          owner_name = excluded.owner_name,
          data_type = excluded.data_type,
          figure_kind = excluded.figure_kind,
          created_at = excluded.created_at,
          updated_at = excluded.updated_at,
          cell_json = excluded.cell_json,
          rows_json = excluded.rows_json,
          row_count = excluded.row_count,
          rows_storage = excluded.rows_storage,
          columns_json = excluded.columns_json,
          source_name = excluded.source_name,
          figure_edits_json = excluded.figure_edits_json,
          project_id = excluded.project_id,
          campaign_id = excluded.campaign_id,
          cell_record_id = excluded.cell_record_id,
          dataset_group_id = excluded.dataset_group_id,
          raw_artifact_json = excluded.raw_artifact_json,
          parsed_artifact_json = excluded.parsed_artifact_json,
          column_mapping_json = excluded.column_mapping_json,
          quality_json = excluded.quality_json,
          parser_json = excluded.parser_json,
          analysis_provenance_json = excluded.analysis_provenance_json,
          organization_id = excluded.organization_id
        """,
        (
            item["id"],
            item["ownerId"],
            item["ownerName"],
            item["dataType"],
            item["figureKind"],
            item["createdAt"],
            item["updatedAt"],
            json_dumps(item["cell"]),
            json_dumps(database_rows),
            row_count,
            rows_storage,
            json_dumps(item["columns"]),
            item["sourceName"],
            json_dumps(item["figureEdits"]),
            item["projectId"],
            item["campaignId"],
            item["cellRecordId"],
            item["datasetGroupId"],
            json_dumps(item["rawArtifact"]),
            json_dumps(item["parsedArtifact"]),
            json_dumps(item["columnMapping"]),
            json_dumps(item["quality"]),
            json_dumps(item["parser"]),
            json_dumps(item["analysisProvenance"]),
            item["organizationId"],
        ),
    )
    item["rowCount"] = row_count
    item["rowsStorage"] = rows_storage
    return item


def looks_like_smart_manager_eis(columns: list, rows: list) -> bool:
    if "8" not in columns or "11" not in columns or "12" not in columns:
        return False
    matches = 0
    for row in rows[:80]:
        try:
            frequency = float(row.get("8"))
            z_real = float(row.get("11"))
            z_imag = float(row.get("12"))
        except Exception:
            continue
        if frequency > 0 and all(map(lambda x: x == x, [z_real, z_imag])):
            matches += 1
    return matches >= 10


def detect_data_type(columns: list, rows: list, filename: str = "") -> dict:
    keys = [key_of(col) for col in columns]

    def has(terms: list[str]) -> bool:
        return any(any(term in key for term in terms) for key in keys)

    score = {"eis": 0, "cyc": 0, "cv": 0}
    file_key = key_of(filename)
    if "eis" in file_key or "impedance" in file_key:
        score["eis"] += 2
    if "cyc" in file_key or "cycle" in file_key:
        score["cyc"] += 2
    if "cv" in file_key:
        score["cv"] += 2
    if has(["freq", "frequency", "hz", "주파수"]):
        score["eis"] += 2
    if has(["zreal", "real", "re", "zprime"]):
        score["eis"] += 2
    if has(["zimag", "imag", "im", "zdoubleprime"]):
        score["eis"] += 2
    if has(["cycle", "cycleindex", "사이클"]):
        score["cyc"] += 2
    if has(["capacity", "cap", "용량", "mah", "mahg"]):
        score["cyc"] += 2
    if has(["charge", "discharge", "efficiency", "충전", "방전", "효율"]):
        score["cyc"] += 2
    if has(["voltage", "potential", "전압"]):
        score["cyc"] += 1
        score["cv"] += 1
    if has(["current", "currentdensity", "전류"]):
        score["cv"] += 2
    if has(["scan", "scanrate", "sweep"]):
        score["cv"] += 2
    if looks_like_smart_manager_eis(columns, rows):
        score["eis"] += 5

    data_type, top_score = max(score.items(), key=lambda item: item[1])
    if top_score <= 0:
        data_type = "unknown"
    confidence = 0 if top_score <= 0 else min(0.95, 0.45 + top_score * 0.1)
    options = {
        "eis": [
            {"id": "eis-combined", "label": "Nyquist + Bode 통합 Fig"},
            {"id": "nyquist", "label": "Nyquist plot"},
            {"id": "bode", "label": "Bode magnitude/phase"},
        ],
        "cyc": [
            {"id": "cycling-performance", "label": "셀 성능 테스트: capacity/efficiency vs cycle"},
            {"id": "voltage-profile", "label": "전압 프로파일: voltage vs capacity/time"},
            {"id": "cyc-combined", "label": "성능 + 전압 프로파일 통합 Fig"},
        ],
        "cv": [
            {"id": "cv-curve", "label": "CV curve: current vs voltage"},
            {"id": "cv-comparison", "label": "Scan rate 비교 Fig"},
        ],
        "unknown": [{"id": "table-preview", "label": "표 형태로 미리보기"}],
    }
    return {"type": data_type, "confidence": confidence, "scores": score, "options": options.get(data_type, options["unknown"])}


def _artifact_local_path(artifact: dict) -> Path | None:
    """Return one validated local artifact path without trusting DB text."""

    if not isinstance(artifact, dict):
        return None
    local_path = str(artifact.get("localPath") or "")
    if not local_path:
        return None
    try:
        candidate = (DATA_DIR / local_path).resolve()
        candidate.relative_to(DATA_DIR.resolve())
    except (OSError, ValueError):
        return None
    return candidate if candidate.is_file() else None


def has_stale_sde_zreal_mapping(rows: list[dict]) -> bool:
    """Detect the legacy defect where every Z' value was copied from frequency."""

    comparable = []
    for row in rows:
        if not isinstance(row, dict):
            continue
        try:
            frequency = float(row.get("frequency"))
            zreal = float(row.get("zreal"))
        except (TypeError, ValueError):
            continue
        if math.isfinite(frequency) and math.isfinite(zreal) and frequency > 0:
            comparable.append((frequency, zreal))
    if len(comparable) < 3:
        return False
    copied = sum(math.isclose(frequency, zreal, rel_tol=1e-12, abs_tol=1e-9) for frequency, zreal in comparable)
    return copied / len(comparable) >= 0.95


def needs_sde_parser_refresh(dataset: dict) -> bool:
    """Reparse an SDE when it was saved by an older interpretation version."""

    if Path(str(dataset.get("sourceName") or "")).suffix.lower() != ".sde":
        return False
    parser = dataset.get("parser") if isinstance(dataset.get("parser"), dict) else {}
    saved_version = str(parser.get("version") or "").strip()
    # Parser versions identify the binary-offset interpretation used for SDE.
    # Rebuilding from the immutable raw artifact is safer than reusing any
    # earlier decoded columns, including malformed rows that are not an exact
    # frequency-to-Z' copy.
    # parser-8 only adds WRD CellWeight metadata; do not rebuild unaffected EIS.
    compatible = {INSTRUMENT_PARSER_VERSION}
    if INSTRUMENT_PARSER_VERSION == "parser-8":
        compatible.add("parser-7")
    return saved_version not in compatible or has_stale_sde_zreal_mapping(dataset.get("rows") or [])


def needs_wrd_parser_refresh(dataset: dict) -> bool:
    """Reparse only WRD datasets decoded by an older instrument parser."""

    if Path(str(dataset.get("sourceName") or "")).suffix.lower() != ".wrd":
        return False
    parser = dataset.get("parser") if isinstance(dataset.get("parser"), dict) else {}
    # parser-8 also reads binary CellWeight for specific capacity. Uploads may
    # deliberately contain exactly 5,000 *display* rows, sampled across every
    # cycle and direction for the browser. Row count is therefore not a legacy
    # signal; only an older parser version should trigger a raw-artifact rebuild.
    return str(parser.get("version") or "").strip() != INSTRUMENT_PARSER_VERSION


def parse_instrument_rows(path: Path, expected_type: str = "eis") -> dict:
    """Apply the same parser, BDF mapping, and quality checks used by uploads."""

    raw_rows, _sheet_name, parser_name = inspect_path(path)
    raw_rows = [row for row in raw_rows if any(str(cell).strip() for cell in row)]
    if len(raw_rows) < 2:
        raise RuntimeError("The raw instrument file does not contain a table.")
    columns = [str(cell).strip() or f"col_{index + 1}" for index, cell in enumerate(raw_rows[0])]
    data_rows = raw_rows[1:]
    if len(data_rows) > MAX_PARSED_ROWS:
        raise RuntimeError(
            f"The raw instrument file contains {len(data_rows):,} rows, which exceeds "
            f"the configured parsed-row limit of {MAX_PARSED_ROWS:,}."
        )
    rows = []
    for raw in data_rows:
        rows.append({column: raw[index] if index < len(raw) else "" for index, column in enumerate(columns)})
    detection = detect_data_type(columns, rows, path.name)
    if detection["type"] != expected_type:
        raise RuntimeError(f"The raw artifact no longer parses as {expected_type.upper()} data.")
    canonical_rows = canonicalize_rows(expected_type, columns, rows)
    quality = evaluate_quality(expected_type, canonical_rows)
    return {
        "columns": columns,
        "rows": rows,
        "columnMapping": build_column_mapping(expected_type, columns),
        "quality": quality["summary"],
        "canonicalRows": quality["rows"],
        "parser": {
            "name": parser_name,
            "version": INSTRUMENT_PARSER_VERSION,
            "mappingVersion": BDF_MAPPING_VERSION,
        },
    }


def _repair_stale_instrument_datasets(conn, data_type: str, label: str, refresh_reason: str, needs_refresh) -> int:
    """Refresh parser output from an immutable raw artifact without changing identity."""

    repaired = 0
    rows = execute(conn, "SELECT * FROM datasets WHERE data_type = ?", (data_type,)).fetchall()
    for row in rows:
        dataset = dataset_from_row(row)
        if not needs_refresh(dataset):
            continue
        raw_path = _artifact_local_path(dataset.get("rawArtifact") or {})
        if raw_path is None:
            print(f"{label} parser repair skipped for {dataset['id']}: raw artifact is unavailable.", file=sys.stderr)
            continue
        owner = public_user(get_user_by_id(str(dataset.get("ownerId") or ""), conn))
        if owner is None:
            print(f"{label} parser repair skipped for {dataset['id']}: dataset owner is unavailable.", file=sys.stderr)
            continue
        try:
            parsed = parse_instrument_rows(raw_path, expected_type=data_type)
            dataset.update({key: parsed[key] for key in ("columns", "rows", "columnMapping", "quality", "parser")})
            cell_key = dataset.get("cellRecordId") or dataset.get("cell", {}).get("cellId") or "unassigned"
            parsed_key = artifact_key(dataset.get("projectId", ""), cell_key, dataset["id"], "parsed", "normalized.json")
            parsed_document = {
                "schemaVersion": BDF_MAPPING_VERSION,
                "datasetId": dataset["id"],
                "sourceColumns": parsed["columns"],
                "columnMapping": parsed["columnMapping"],
                "quality": parsed["quality"],
                "parser": parsed["parser"],
                "canonicalRows": parsed["canonicalRows"],
            }
            dataset["parsedArtifact"] = write_dataset_artifact(
                json_dumps(parsed_document).encode("utf-8"), parsed_key, "application/json"
            )
            provenance = dict(dataset.get("analysisProvenance") or {})
            provenance["parserRefresh"] = {
                "reason": refresh_reason,
                "parserVersion": INSTRUMENT_PARSER_VERSION,
                "reparsedAt": now_iso(),
            }
            dataset["analysisProvenance"] = provenance
            dataset["updatedAt"] = now_iso()
            save_dataset(conn, dataset, actor_user=owner)
            repaired += 1
        except Exception as exc:
            print(f"{label} parser repair skipped for {dataset['id']}: {type(exc).__name__}: {exc}", file=sys.stderr)
    return repaired


def repair_stale_sde_datasets(conn) -> int:
    """Refresh older SDE parser output while preserving source identity."""

    return _repair_stale_instrument_datasets(
        conn,
        data_type="eis",
        label="SDE",
        refresh_reason="sde_parser_version_refresh",
        needs_refresh=needs_sde_parser_refresh,
    )


def repair_stale_wrd_datasets(conn) -> int:
    """Refresh summary-only WRD datasets into point-level CYC traces."""

    return _repair_stale_instrument_datasets(
        conn,
        data_type="cyc",
        label="WRD",
        refresh_reason="wrd_parser_trace_refresh",
        needs_refresh=needs_wrd_parser_refresh,
    )


def upload_to_object_storage(data: bytes | Path, object_name: str, content_type: str = "application/octet-stream") -> str | None:
    configuration_issues = storage_configuration_issues()
    if configuration_issues:
        if REQUIRE_DURABLE_STORAGE:
            missing = ", ".join(configuration_issues)
            raise HTTPException(
                status_code=503,
                detail=f"Object storage is not configured. Missing Render environment variables: {missing}.",
            )
        print(
            f"Storage warning: object storage is not configured ({', '.join(configuration_issues)}). "
            "Keeping upload only in local temporary storage.",
            file=sys.stderr,
        )
        return None
    if STORAGE_BACKEND not in {"s3", "supabase"}:
        return None
    if not S3_BUCKET:
        if REQUIRE_DURABLE_STORAGE:
            raise HTTPException(status_code=503, detail="영구 객체 저장소 설정이 없어 파일을 저장하지 않았습니다.")
        print("Storage warning: S3_BUCKET is missing. Keeping upload only in local temporary storage.", file=sys.stderr)
        return None
    try:
        import boto3
        from botocore.config import Config
    except ImportError as exc:
        if REQUIRE_DURABLE_STORAGE:
            raise HTTPException(status_code=503, detail="영구 객체 저장소 모듈을 불러오지 못해 파일을 저장하지 않았습니다.") from exc
        print(f"Storage warning: boto3 is not installed, so object storage upload was skipped: {exc}", file=sys.stderr)
        return None

    # B2 and Supabase both speak the S3 API. Path-style addressing is the
    # conservative default for these custom endpoints.
    client_config = Config(
        signature_version="s3v4",
        s3={"addressing_style": "path" if S3_FORCE_PATH_STYLE else "auto"},
    )
    client = boto3.client(
        "s3",
        endpoint_url=S3_ENDPOINT_URL or None,
        region_name=S3_REGION,
        aws_access_key_id=S3_ACCESS_KEY_ID or None,
        aws_secret_access_key=S3_SECRET_ACCESS_KEY or None,
        config=client_config,
    )
    try:
        if isinstance(data, Path):
            # boto3 streams from disk here. Do not turn a large WBCS export
            # back into a second process-memory copy during finalization.
            client.upload_file(
                str(data),
                S3_BUCKET,
                object_name,
                ExtraArgs={"ContentType": content_type},
            )
        else:
            client.put_object(Bucket=S3_BUCKET, Key=object_name, Body=data, ContentType=content_type)
    except Exception as exc:
        if REQUIRE_DURABLE_STORAGE:
            print(
                f"Object storage upload failed for {object_name}: {type(exc).__name__}: {exc}",
                file=sys.stderr,
            )
            raise HTTPException(
                status_code=503,
                detail=(
                    "Object storage rejected the upload. Check the Render logs and the bucket endpoint, "
                    "region, and write permission."
                ),
            ) from exc
        print(f"Storage warning: object storage upload failed and local analysis will continue: {exc}", file=sys.stderr)
        return None
    if S3_PUBLIC_BASE_URL:
        return f"{S3_PUBLIC_BASE_URL}/{object_name}"
    return f"s3://{S3_BUCKET}/{object_name}"


def validated_object_key(object_name: str) -> str:
    """Accept only portal-owned relative object keys."""

    value = str(object_name or "").strip().replace("\\", "/")
    parts = [part for part in value.split("/") if part]
    if not value or value.startswith("/") or any(part in {".", ".."} for part in parts):
        raise HTTPException(status_code=400, detail="Invalid object-storage key.")
    if not value.startswith("projects/"):
        raise HTTPException(status_code=400, detail="Object key is outside the portal artifact namespace.")
    return value


def read_object_storage_bytes(object_name: str) -> bytes | None:
    """Read one bounded private portal artifact from S3-compatible storage."""

    object_key = validated_object_key(object_name)
    if STORAGE_BACKEND not in {"s3", "supabase"} or storage_configuration_issues():
        if REQUIRE_DURABLE_STORAGE:
            raise HTTPException(status_code=503, detail="Durable object storage is not available.")
        return None
    try:
        import boto3
        from botocore.config import Config
    except ImportError as exc:
        raise HTTPException(status_code=503, detail="The object-storage client is unavailable.") from exc

    client = boto3.client(
        "s3",
        endpoint_url=S3_ENDPOINT_URL or None,
        region_name=S3_REGION,
        aws_access_key_id=S3_ACCESS_KEY_ID or None,
        aws_secret_access_key=S3_SECRET_ACCESS_KEY or None,
        config=Config(
            signature_version="s3v4",
            s3={"addressing_style": "path" if S3_FORCE_PATH_STYLE else "auto"},
        ),
    )
    body = None
    try:
        response = client.get_object(Bucket=S3_BUCKET, Key=object_key)
        content_length = int(response.get("ContentLength") or 0)
        if content_length > MAX_OBJECT_ARTIFACT_BYTES:
            raise HTTPException(status_code=413, detail="The normalized artifact exceeds the configured read limit.")
        body = response["Body"]
        data = body.read(MAX_OBJECT_ARTIFACT_BYTES + 1)
        if len(data) > MAX_OBJECT_ARTIFACT_BYTES:
            raise HTTPException(status_code=413, detail="The normalized artifact exceeds the configured read limit.")
        return data
    except HTTPException:
        raise
    except Exception as exc:
        print(f"Object storage read failed for {object_key}: {type(exc).__name__}", file=sys.stderr)
        raise HTTPException(status_code=503, detail="The saved artifact could not be read from durable storage.") from exc
    finally:
        if body is not None:
            try:
                body.close()
            except Exception:
                pass


def delete_from_object_storage(object_name: str) -> None:
    """Remove one durable artifact when object storage is configured.

    A missing object is treated as already cleaned up. In durable production mode
    a storage outage stops the database deletion so users do not lose the only
    record that points to their experimental file.
    """

    if not object_name or STORAGE_BACKEND not in {"s3", "supabase"}:
        return
    configuration_issues = storage_configuration_issues()
    if configuration_issues:
        if REQUIRE_DURABLE_STORAGE:
            raise HTTPException(status_code=503, detail="Durable object storage is not configured; file deletion was not completed.")
        print(
            f"Storage warning: object storage delete was skipped because configuration is invalid "
            f"({', '.join(configuration_issues)}).",
            file=sys.stderr,
        )
        return
    try:
        import boto3
        from botocore.config import Config

        client = boto3.client(
            "s3",
            endpoint_url=S3_ENDPOINT_URL or None,
            region_name=S3_REGION,
            aws_access_key_id=S3_ACCESS_KEY_ID or None,
            aws_secret_access_key=S3_SECRET_ACCESS_KEY or None,
            config=Config(signature_version="s3v4", s3={"addressing_style": "path" if S3_FORCE_PATH_STYLE else "auto"}),
        )
        client.delete_object(Bucket=S3_BUCKET, Key=object_name)
    except Exception as exc:
        if REQUIRE_DURABLE_STORAGE:
            raise HTTPException(status_code=503, detail="Could not delete the file from durable object storage. Please try again.") from exc
        print(f"Storage warning: object storage delete failed and local cleanup will continue: {exc}", file=sys.stderr)


def object_key_from_storage_url(storage_url: str) -> str:
    """Recover a known object key without accepting arbitrary external URLs."""

    value = str(storage_url or "")
    s3_prefix = f"s3://{S3_BUCKET}/" if S3_BUCKET else ""
    if s3_prefix and value.startswith(s3_prefix):
        return value[len(s3_prefix):]
    public_prefix = f"{S3_PUBLIC_BASE_URL}/" if S3_PUBLIC_BASE_URL else ""
    if public_prefix and value.startswith(public_prefix):
        return value[len(public_prefix):]
    return ""


def save_upload_bytes(data: bytes, filename: str, prefix: str = "uploads") -> tuple[Path, str | None]:
    """Stage an inspected upload locally until it becomes a saved dataset.

    The final immutable raw artifact is written by
    ``persist_upload_session_artifacts``. Mirroring this short-lived staging
    copy to object storage would leave an unnecessary second copy behind.
    """

    if len(data) > MAX_BODY:
        raise HTTPException(status_code=413, detail=upload_size_limit_detail())
    safe_name = clean_name(filename)
    stamp = int(time.time() * 1000)
    local_path = UPLOAD_DIR / f"{stamp}-{safe_name}"
    local_path.write_bytes(data)
    return local_path, None


def create_upload_session(
    conn,
    user: dict,
    filename: str,
    local_path: Path,
    storage_url: str | None,
    content: bytes | None,
    parsed: dict,
    *,
    content_size: int | None = None,
    content_sha256: str | None = None,
) -> str:
    """Keep upload details on the server until the user saves the dataset."""

    upload_id = make_id("upload")
    execute(
        conn,
        """
        INSERT INTO upload_sessions(
          id, owner_id, filename, local_path, storage_url, sha256, size_bytes,
          parser_json, column_mapping_json, quality_json, canonical_rows_json,
          created_at, consumed_dataset_id, consumed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', '')
        """,
        (
            upload_id,
            user["id"],
            filename,
            str(local_path),
            storage_url or "",
            content_sha256 or hashlib.sha256(content or b"").hexdigest(),
            content_size if content_size is not None else len(content or b""),
            json_dumps(parsed.get("parser") or {}),
            json_dumps(parsed.get("columnMapping") or {}),
            json_dumps(parsed.get("quality") or {}),
            json_dumps(parsed.get("canonicalRows") or []),
            now_iso(),
        ),
    )
    return upload_id


def write_dataset_artifact(data: bytes, object_name: str, content_type: str) -> dict:
    """Write an artifact locally and mirror it to object storage when configured."""

    local_path = (ARTIFACT_DIR / Path(object_name)).resolve()
    if not str(local_path).startswith(str(ARTIFACT_DIR.resolve())):
        raise HTTPException(status_code=400, detail="Invalid artifact storage path.")
    local_path.parent.mkdir(parents=True, exist_ok=True)
    local_path.write_bytes(data)
    try:
        storage_url = upload_to_object_storage(data, object_name, content_type)
    except Exception:
        local_path.unlink(missing_ok=True)
        raise
    return {
        "objectKey": object_name,
        "localPath": str(local_path.relative_to(DATA_DIR)),
        "storageUrl": storage_url,
        "sha256": hashlib.sha256(data).hexdigest(),
        "sizeBytes": len(data),
        "contentType": content_type,
    }


def write_dataset_artifact_from_path(
    source_path: Path,
    object_name: str,
    content_type: str,
    *,
    sha256: str = "",
    size_bytes: int | None = None,
) -> dict:
    """Finalize a staged source file without loading the whole file into RAM.

    CYC WRD exports can contain more than one hundred thousand point-level
    records. The upload endpoint already streams these files into ``UPLOAD_DIR``;
    this companion writer keeps that guarantee while moving the raw file into the
    immutable artifact layout and while mirroring it to S3/Supabase.
    """

    source_path = Path(source_path).resolve()
    if not source_path.is_file():
        raise HTTPException(status_code=410, detail="The temporary uploaded file is no longer available. Please inspect it again.")

    local_path = (ARTIFACT_DIR / Path(object_name)).resolve()
    try:
        local_path.relative_to(ARTIFACT_DIR.resolve())
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid artifact storage path.") from exc
    local_path.parent.mkdir(parents=True, exist_ok=True)

    digest = hashlib.sha256()
    copied_size = 0
    try:
        with source_path.open("rb") as source_handle, local_path.open("wb") as target_handle:
            # A 1 MiB buffer limits the peak memory used for a 46 MiB WRD file
            # to one small chunk instead of a complete duplicate of the upload.
            while chunk := source_handle.read(1024 * 1024):
                target_handle.write(chunk)
                digest.update(chunk)
                copied_size += len(chunk)
        storage_url = upload_to_object_storage(local_path, object_name, content_type)
    except Exception:
        local_path.unlink(missing_ok=True)
        raise

    return {
        "objectKey": object_name,
        "localPath": str(local_path.relative_to(DATA_DIR)),
        "storageUrl": storage_url,
        "sha256": sha256 or digest.hexdigest(),
        "sizeBytes": int(size_bytes) if size_bytes is not None else copied_size,
        "contentType": content_type,
    }


def write_derived_artifact(dataset: dict, record_id: str, kind: str, document: dict) -> dict:
    """Persist a reproducible figure/report definition beside its normalized dataset."""

    cell_key = dataset.get("cellRecordId") or dataset.get("cell", {}).get("cellId") or "unassigned"
    object_key = artifact_key(dataset.get("projectId", ""), cell_key, dataset["id"], kind, f"{record_id}.json")
    return write_dataset_artifact(json_dumps(document).encode("utf-8"), object_key, "application/json")


def rewrite_normalized_artifact_rows(item: dict, rows: list[dict]) -> dict:
    """Persist an intentional full-table edit back to the canonical artifact."""

    parsed_artifact = item.get("parsedArtifact") if isinstance(item.get("parsedArtifact"), dict) else {}
    object_key = str(parsed_artifact.get("objectKey") or "")
    if not object_key:
        raise HTTPException(status_code=409, detail="This Dataset has no normalized artifact to update.")
    document = {
        "schemaVersion": BDF_MAPPING_VERSION,
        "datasetId": str(item.get("id") or ""),
        "sourceColumns": item.get("columns") if isinstance(item.get("columns"), list) else [],
        "columnMapping": item.get("columnMapping") if isinstance(item.get("columnMapping"), dict) else {},
        "quality": item.get("quality") if isinstance(item.get("quality"), dict) else {},
        "parser": item.get("parser") if isinstance(item.get("parser"), dict) else {},
        "canonicalRows": rows,
    }
    return write_dataset_artifact(json_dumps(document).encode("utf-8"), object_key, "application/json")


def delete_local_data_path(local_path_value: str) -> None:
    """Delete a local runtime artifact only when it remains below DATA_DIR."""

    if not local_path_value:
        return
    try:
        candidate = (DATA_DIR / str(local_path_value)).resolve()
        candidate.relative_to(DATA_DIR.resolve())
    except (OSError, ValueError):
        return
    if candidate.is_file():
        candidate.unlink(missing_ok=True)


def delete_local_upload_path(local_path_value: str) -> None:
    """Delete an upload staging file only when it remains below UPLOAD_DIR."""

    if not local_path_value:
        return
    try:
        candidate = Path(str(local_path_value)).resolve()
        candidate.relative_to(UPLOAD_DIR.resolve())
    except (OSError, ValueError):
        return
    if candidate.is_file():
        candidate.unlink(missing_ok=True)


def delete_artifact(artifact: dict) -> None:
    """Delete both durable and local copies of one known artifact."""

    if not isinstance(artifact, dict):
        return
    delete_from_object_storage(str(artifact.get("objectKey") or ""))
    delete_local_data_path(str(artifact.get("localPath") or ""))


def organization_from_row(row, member_role: str = "") -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "slug": row["slug"],
        "createdBy": row["created_by"],
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
        "myRole": member_role,
    }


def analysis_run_from_row(row) -> dict:
    """Return a stable API shape for a reproducible derived-data run."""

    result = json_loads(row["result_json"], {})
    return {
        "id": row["id"],
        "datasetId": row["dataset_id"],
        "ownerId": row["owner_id"],
        "analysisName": row["analysis_name"],
        "analysisVersion": row["analysis_version"],
        "parameters": json_loads(row["parameters_json"], {}),
        "result": result,
        "status": str(result.get("status") or "unknown"),
        "provenance": json_loads(row["provenance_json"], {}),
        "artifact": json_column(row, "artifact_json", {}),
        "createdAt": row["created_at"],
    }


def require_archive_agent(
    x_archive_token: str | None = Header(None, alias="X-Archive-Token"),
) -> bool:
    """Authenticate the single-purpose local backup agent."""

    if not ARCHIVE_AGENT_TOKEN:
        raise HTTPException(status_code=503, detail="The local archive agent is not configured.")
    supplied = str(x_archive_token or "").strip()
    if not supplied or not hmac.compare_digest(supplied, ARCHIVE_AGENT_TOKEN):
        raise HTTPException(status_code=401, detail="A valid X-Archive-Token is required.")
    return True


def archive_artifact_from_row(row, *, include_object_key: bool = False) -> dict:
    """Return the bounded backup-agent contract for one immutable artifact."""

    item = {
        "archiveId": str(row["id"]),
        "datasetId": str(row["dataset_id"]),
        "ownerId": str(row["owner_id"]),
        "ownerName": str(row["owner_name"] or ""),
        "artifactKind": str(row["artifact_kind"]),
        "sourceName": str(row["source_name"]),
        "sizeBytes": int(row["size_bytes"] or 0),
        "sha256": str(row["sha256"] or ""),
        "contentType": str(row["content_type"] or "application/octet-stream"),
        "createdAt": str(row["created_at"]),
        "backupState": str(row["backup_state"]),
        "backupDeviceId": str(row["backup_device_id"] or ""),
        "backupRelativePath": str(row["backup_relative_path"] or ""),
        "verifiedAt": str(row["verified_at"] or ""),
        "isCleanupEligible": bool(int(row["cleanup_eligible"] or 0)),
    }
    if include_object_key:
        item["objectKey"] = str(row["object_key"])
    return item


def register_archive_artifact(conn, dataset: dict, artifact: dict, artifact_kind: str = "raw") -> str:
    """Queue an immutable raw artifact for a verified local copy."""

    kind = str(artifact_kind or "").strip().lower()
    if kind != "raw":
        raise HTTPException(status_code=400, detail="Only immutable raw artifacts can enter the local archive queue.")
    object_key = validated_object_key(str((artifact or {}).get("objectKey") or ""))
    sha256 = str((artifact or {}).get("sha256") or "").strip().lower()
    try:
        size_bytes = int((artifact or {}).get("sizeBytes") or 0)
    except (TypeError, ValueError) as exc:
        raise HTTPException(status_code=400, detail="Archive artifact size is invalid.") from exc
    if not re.fullmatch(r"[0-9a-f]{64}", sha256) or size_bytes <= 0:
        raise HTTPException(status_code=400, detail="Archive artifact requires a positive size and SHA-256 digest.")

    archive_id = make_id("archive")
    source_name = clean_name(str(dataset.get("sourceName") or Path(object_key).name))
    execute(
        conn,
        """
        INSERT INTO artifact_archives(
          id, dataset_id, owner_id, owner_name, artifact_kind, object_key,
          source_name, size_bytes, sha256, content_type, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(object_key) DO UPDATE SET
          dataset_id = excluded.dataset_id,
          owner_id = excluded.owner_id,
          owner_name = excluded.owner_name,
          artifact_kind = excluded.artifact_kind,
          source_name = excluded.source_name,
          size_bytes = excluded.size_bytes,
          sha256 = excluded.sha256,
          content_type = excluded.content_type
        """,
        (
            archive_id,
            str(dataset.get("id") or ""),
            str(dataset.get("ownerId") or ""),
            str(dataset.get("ownerName") or ""),
            kind,
            object_key,
            source_name,
            size_bytes,
            sha256,
            str(artifact.get("contentType") or "application/octet-stream")[:160],
            str(dataset.get("createdAt") or now_iso()),
        ),
    )
    row = execute(conn, "SELECT id FROM artifact_archives WHERE object_key = ?", (object_key,)).fetchone()
    return str(row["id"])


def backfill_archive_registry(conn) -> int:
    """Queue valid historical raw artifacts without touching their bytes."""

    created = 0
    rows = execute(conn, "SELECT * FROM datasets ORDER BY created_at").fetchall()
    for row in rows:
        dataset = dataset_from_row(row, include_rows=False)
        artifact = dataset.get("rawArtifact") if isinstance(dataset.get("rawArtifact"), dict) else {}
        if not artifact.get("objectKey") or not artifact.get("sha256") or not artifact.get("sizeBytes"):
            continue
        existed = execute(
            conn,
            "SELECT id FROM artifact_archives WHERE object_key = ?",
            (str(artifact["objectKey"]),),
        ).fetchone()
        try:
            register_archive_artifact(conn, dataset, artifact, "raw")
        except HTTPException as exc:
            print(f"Archive registry skipped Dataset {dataset['id']}: {exc.detail}", file=sys.stderr)
            continue
        if not existed:
            created += 1
    return created


def list_archive_artifacts(conn, state: str = "pending", limit: int = 100) -> list[dict]:
    """List a bounded archive queue without exposing object-store credentials."""

    normalized_state = str(state or "pending").strip().lower()
    if normalized_state not in {"pending", "verified"}:
        raise HTTPException(status_code=400, detail="Archive state must be pending or verified.")
    bounded_limit = max(1, min(int(limit), 200))
    rows = execute(
        conn,
        "SELECT * FROM artifact_archives WHERE backup_state = ? ORDER BY created_at, id LIMIT ?",
        (normalized_state, bounded_limit),
    ).fetchall()
    return [archive_artifact_from_row(row, include_object_key=True) for row in rows]


def validate_archive_relative_path(relative_path: str) -> str:
    """Reject absolute or traversal paths reported by a backup device."""

    value = str(relative_path or "").strip().replace("\\", "/")
    path = PurePosixPath(value)
    if not value or len(value) > 600 or path.is_absolute() or any(part in {"", ".", ".."} for part in path.parts):
        raise HTTPException(status_code=400, detail="The archive relative path is invalid.")
    return path.as_posix()


def verify_archive_artifact(
    conn,
    archive_id: str,
    *,
    size_bytes: int,
    sha256: str,
    device_id: str,
    relative_path: str,
) -> dict:
    """Mark a local copy verified only after exact size and digest matching."""

    row = execute(conn, "SELECT * FROM artifact_archives WHERE id = ?", (str(archive_id),)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Archive item was not found.")
    supplied_hash = str(sha256 or "").strip().lower()
    if not re.fullmatch(r"[0-9a-f]{64}", supplied_hash):
        raise HTTPException(status_code=400, detail="A valid SHA-256 digest is required.")
    try:
        supplied_size = int(size_bytes)
    except (TypeError, ValueError) as exc:
        raise HTTPException(status_code=400, detail="Archive size is invalid.") from exc
    if supplied_size != int(row["size_bytes"]) or not hmac.compare_digest(supplied_hash, str(row["sha256"])):
        raise HTTPException(status_code=409, detail="The local backup does not match the stored raw artifact.")
    normalized_device = str(device_id or "").strip()
    if not re.fullmatch(r"[A-Za-z0-9._-]{1,80}", normalized_device):
        raise HTTPException(status_code=400, detail="Archive device ID is invalid.")
    normalized_path = validate_archive_relative_path(relative_path)
    verified_at = now_iso()
    execute(
        conn,
        """
        UPDATE artifact_archives
        SET backup_state = 'verified', backup_device_id = ?, backup_relative_path = ?,
            verified_at = ?, cleanup_eligible = 1
        WHERE id = ?
        """,
        (normalized_device, normalized_path, verified_at, str(archive_id)),
    )
    verified = execute(conn, "SELECT * FROM artifact_archives WHERE id = ?", (str(archive_id),)).fetchone()
    return archive_artifact_from_row(verified)


def create_object_download_url(object_name: str, expires_in: int = ARCHIVE_DOWNLOAD_TTL_SECONDS) -> str:
    """Create a short-lived private download URL for the authenticated agent."""

    object_key = validated_object_key(object_name)
    if STORAGE_BACKEND not in {"s3", "supabase"} or storage_configuration_issues():
        raise HTTPException(status_code=503, detail="Durable object storage is not available for archive download.")
    try:
        import boto3
        from botocore.config import Config

        client = boto3.client(
            "s3",
            endpoint_url=S3_ENDPOINT_URL or None,
            region_name=S3_REGION,
            aws_access_key_id=S3_ACCESS_KEY_ID or None,
            aws_secret_access_key=S3_SECRET_ACCESS_KEY or None,
            config=Config(
                signature_version="s3v4",
                s3={"addressing_style": "path" if S3_FORCE_PATH_STYLE else "auto"},
            ),
        )
        return str(
            client.generate_presigned_url(
                "get_object",
                Params={"Bucket": S3_BUCKET, "Key": object_key},
                ExpiresIn=max(300, min(int(expires_in), 3600)),
            )
        )
    except HTTPException:
        raise
    except Exception as exc:
        print(f"Archive download signing failed for {object_key}: {type(exc).__name__}", file=sys.stderr)
        raise HTTPException(status_code=503, detail="A private archive download URL could not be created.") from exc


def persist_upload_session_artifacts(conn, item: dict, upload_id: str, user: dict) -> dict:
    """Finalize a verified upload into raw and parsed artifact locations."""

    session = execute(conn, "SELECT * FROM upload_sessions WHERE id = ?", (upload_id,)).fetchone()
    if not session or session["owner_id"] != user["id"]:
        raise HTTPException(status_code=404, detail="The upload session was not found for this user.")
    if session["consumed_dataset_id"] and session["consumed_dataset_id"] != item["id"]:
        raise HTTPException(status_code=409, detail="This uploaded file has already been saved to another dataset.")
    source_path = Path(session["local_path"])
    if not source_path.exists():
        raise HTTPException(status_code=410, detail="The temporary uploaded file is no longer available. Please inspect it again.")

    cell_key = item["cellRecordId"] or item.get("cell", {}).get("cellId") or "unassigned"
    raw_key = artifact_key(item["projectId"], cell_key, item["id"], "raw", session["filename"])
    stored_artifacts: list[dict] = []
    try:
        raw_artifact = write_dataset_artifact_from_path(
            source_path,
            raw_key,
            mimetypes.guess_type(session["filename"])[0] or "application/octet-stream",
            sha256=str(session["sha256"] or ""),
            size_bytes=int(session["size_bytes"] or 0) or None,
        )
        stored_artifacts.append(raw_artifact)
        canonical_rows = json_loads(session["canonical_rows_json"], [])
        parsed_document = {
            "schemaVersion": BDF_MAPPING_VERSION,
            "datasetId": item["id"],
            "sourceColumns": item["columns"],
            "columnMapping": json_loads(session["column_mapping_json"], {}),
            "quality": json_loads(session["quality_json"], {}),
            "parser": json_loads(session["parser_json"], {}),
            "canonicalRows": canonical_rows,
        }
        parsed_key = artifact_key(item["projectId"], cell_key, item["id"], "parsed", "normalized.json")
        parsed_artifact = write_dataset_artifact(
            json_dumps(parsed_document).encode("utf-8"),
            parsed_key,
            "application/json",
        )
        stored_artifacts.append(parsed_artifact)
        register_archive_artifact(conn, item, raw_artifact, "raw")
    except Exception:
        # A failed finalization must not leave a raw artifact without its
        # normalized companion. Preserve the original exception for diagnosis.
        for artifact in stored_artifacts:
            delete_local_data_path(str(artifact.get("localPath") or ""))
            try:
                delete_from_object_storage(str(artifact.get("objectKey") or ""))
            except Exception as cleanup_error:
                print(
                    f"Artifact cleanup failed for {artifact.get('objectKey')}: {type(cleanup_error).__name__}: {cleanup_error}",
                    file=sys.stderr,
                )
        raise
    # The immutable raw artifact is now stored. Remove the temporary inspection
    # copy so every uploaded source exists only once after dataset creation.
    source_path.unlink(missing_ok=True)
    execute(
        conn,
        "UPDATE upload_sessions SET local_path = '', consumed_dataset_id = ?, consumed_at = ? WHERE id = ?",
        (item["id"], now_iso(), upload_id),
    )
    return {
        "rawArtifact": raw_artifact,
        "parsedArtifact": parsed_artifact,
        "columnMapping": parsed_document["columnMapping"],
        "quality": parsed_document["quality"],
        "parser": parsed_document["parser"],
        "analysisProvenance": {
            "schemaVersion": BDF_MAPPING_VERSION,
            "sourceUploadId": upload_id,
            "sourceSha256": session["sha256"],
            "createdAt": now_iso(),
        },
    }


def find_dataset_by_source_hash(conn, owner_id: str, data_type: str, source_sha256: str) -> dict | None:
    """Find one saved Dataset created from the same raw file for this owner.

    Upload sessions are intentionally short-lived, so retrying a freshly
    inspected copy of the same file used to create another Dataset and another
    Fig card. The immutable raw-file SHA-256 stored in provenance is the
    durable identity for this check. The data type remains part of the match
    so an intentionally reclassified file is not silently changed.
    """

    if not source_sha256:
        return None
    rows = execute(
        conn,
        "SELECT * FROM datasets WHERE owner_id = ? AND data_type = ? ORDER BY created_at DESC",
        (owner_id, data_type),
    ).fetchall()
    for row in rows:
        dataset = dataset_from_row(row)
        provenance = dataset.get("analysisProvenance") if isinstance(dataset.get("analysisProvenance"), dict) else {}
        if str(provenance.get("sourceSha256") or "") == source_sha256:
            return dataset
    return None


def consume_duplicate_upload_session(conn, session, dataset_id: str) -> None:
    """Remove a duplicate staging copy after linking it to the saved Dataset."""

    delete_local_upload_path(str(session["local_path"] or ""))
    staging_key = object_key_from_storage_url(str(session["storage_url"] or ""))
    if staging_key:
        delete_from_object_storage(staging_key)
    execute(
        conn,
        "UPDATE upload_sessions SET local_path = '', storage_url = '', consumed_dataset_id = ?, consumed_at = ? WHERE id = ?",
        (dataset_id, now_iso(), session["id"]),
    )


def reuse_dataset_for_requested_figure(conn, dataset: dict, payload: dict, user: dict) -> dict:
    """Reuse one raw-source Dataset while honoring a newly selected Fig kind.

    A raw upload is the durable identity of a Dataset, so a retry must not add
    duplicate Dataset/Fig cards.  It must still be possible to inspect the
    same source as a performance, voltage-profile, or dQ/dV Fig.  In that
    case the single Dataset is reused and its active Fig selection is updated.
    """

    requested_kind = str(payload.get("figureKind") or "").strip()
    if requested_kind and requested_kind != str(dataset.get("figureKind") or ""):
        dataset["figureKind"] = requested_kind
        dataset["updatedAt"] = now_iso()
        save_dataset(conn, dataset, actor_user=user)

        # A user may already have saved this Dataset to the Fig collection.
        # Keep that one card in sync instead of leaving an outdated label/kind.
        figure = execute(conn, "SELECT id FROM figures WHERE dataset_id = ?", (dataset["id"],)).fetchone()
        if figure:
            execute(
                conn,
                "UPDATE figures SET name = ?, figure_kind = ?, updated_at = ? WHERE id = ?",
                (figure_record_label(dataset)[:160], requested_kind, dataset["updatedAt"], figure["id"]),
            )

    return browser_dataset_detail(conn, dataset["id"])


def load_analysis_rows(item: dict, include_review_rows: bool = False) -> tuple[list[dict], dict]:
    """Prefer the immutable normalized artifact over legacy editable table rows."""

    rows = item.get("rows") if isinstance(item.get("rows"), list) else []
    source = "dataset-rows"
    parsed_artifact = item.get("parsedArtifact") if isinstance(item.get("parsedArtifact"), dict) else {}
    artifact_bytes = None
    candidate = _artifact_local_path(parsed_artifact)
    if candidate is not None:
        artifact_bytes = candidate.read_bytes()
    elif parsed_artifact.get("objectKey"):
        artifact_bytes = read_object_storage_bytes(str(parsed_artifact["objectKey"]))
    if artifact_bytes is not None:
        if len(artifact_bytes) > MAX_OBJECT_ARTIFACT_BYTES:
            raise HTTPException(status_code=413, detail="The normalized artifact exceeds the configured read limit.")
        try:
            document = json.loads(artifact_bytes.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            if rows:
                # Some legacy/local tests attached an arbitrary placeholder as
                # parsedArtifact while retaining a complete database table.
                # Preserve that safe fallback, but never hide corruption when
                # artifact mode is the Dataset's only row source.
                print(
                    f"Normalized artifact fallback for Dataset {item.get('id', '')}: invalid JSON",
                    file=sys.stderr,
                )
                document = {}
            else:
                raise HTTPException(status_code=502, detail="The normalized artifact is not valid JSON.") from exc
        canonical_rows = document.get("canonicalRows") if isinstance(document, dict) else None
        if isinstance(canonical_rows, list):
            rows = canonical_rows
            source = "parsed-artifact"

    valid_rows = []
    excluded_count = 0
    for row in rows:
        if not isinstance(row, dict):
            continue
        if row.get("analysis_include") is False and not include_review_rows:
            excluded_count += 1
            continue
        valid_rows.append(row)
    return valid_rows, {"rowSource": source, "inputRowCount": len(rows), "excludedQualityRowCount": excluded_count}


def run_dataset_analysis(item: dict, analysis_name: str, parameters: dict | None = None) -> tuple[dict, dict]:
    """Run one named calculation against the dataset's normalized rows."""

    normalized_name = str(analysis_name or "").strip().lower()
    supplied_parameters = parameters if isinstance(parameters, dict) else {}
    if normalized_name == "eis-drt":
        if item.get("dataType") != "eis":
            raise HTTPException(status_code=400, detail="DRT is available only for EIS Datasets.")
        from backend.analysis.eis_drt import fit_drt

        # EIS-only branch: quality review flags must not silently remove points.
        rows, provenance = load_analysis_rows(item, True)
        try:
            result = fit_drt(rows, supplied_parameters)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        provenance.update({"analysisVersion":"rc-drt-1", "schemaVersion":BDF_MAPPING_VERSION,
                           "sourceDatasetId":item["id"],
                           "sourceSha256":(item.get("analysisProvenance") or {}).get("sourceSha256", "")})
        return result, provenance
    rows, provenance = load_analysis_rows(item, bool(supplied_parameters.get("includeReviewRows")))
    handlers = {
        "retention": lambda: summarize_retention(rows),
        "dqdv": lambda: calculate_dqdv(rows, float(supplied_parameters.get("voltageBinV", 0.005))),
        "dva": lambda: calculate_dva(rows),
        "eis": lambda: summarize_eis(rows),
        "pulse-resistance": lambda: summarize_pulse_resistance(rows),
        "rate-capability": lambda: summarize_rate_capability(rows),
    }
    if normalized_name not in handlers:
        raise HTTPException(status_code=400, detail="Unsupported analysis name.")
    result = handlers[normalized_name]()
    provenance.update(
        {
            "analysisVersion": ANALYSIS_VERSION,
            "schemaVersion": BDF_MAPPING_VERSION,
            "sourceDatasetId": item["id"],
            "sourceSha256": (item.get("analysisProvenance") or {}).get("sourceSha256", ""),
        }
    )
    return result, provenance


def create_analysis_run(conn, item: dict, user: dict, analysis_name: str, parameters: dict | None = None) -> dict:
    """Persist a derived result independently from raw, parsed, and UI table data."""

    result, provenance = run_dataset_analysis(item, analysis_name, parameters)
    run_id = make_id("analysis")
    document = {
        "id": run_id,
        "datasetId": item["id"],
        "analysisName": analysis_name,
        "analysisVersion": ANALYSIS_VERSION,
        "parameters": parameters or {},
        "result": result,
        "provenance": provenance,
        "createdAt": now_iso(),
    }
    cell_key = item.get("cellRecordId") or item.get("cell", {}).get("cellId") or "unassigned"
    object_key = artifact_key(item.get("projectId", ""), cell_key, item["id"], "analysis", f"{run_id}.json")
    artifact = write_dataset_artifact(json_dumps(document).encode("utf-8"), object_key, "application/json")
    created_at = document["createdAt"]
    execute(
        conn,
        """
        INSERT INTO analysis_runs(
          id, dataset_id, owner_id, analysis_name, analysis_version,
          parameters_json, result_json, provenance_json, artifact_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            run_id,
            item["id"],
            user["id"],
            analysis_name,
            ANALYSIS_VERSION,
            json_dumps(parameters or {}),
            json_dumps(result),
            json_dumps(provenance),
            json_dumps(artifact),
            created_at,
        ),
    )
    row = execute(conn, "SELECT * FROM analysis_runs WHERE id = ?", (run_id,)).fetchone()
    return analysis_run_from_row(row)


def list_analysis_runs(conn, dataset_id: str) -> list[dict]:
    rows = execute(conn, "SELECT * FROM analysis_runs WHERE dataset_id = ? ORDER BY created_at DESC", (dataset_id,)).fetchall()
    return [analysis_run_from_row(row) for row in rows]


def run_script(script_name: str, args: list[str]) -> subprocess.CompletedProcess:
    env = dict(os.environ)
    env["PYTHONIOENCODING"] = "utf-8"
    return subprocess.run(
        [sys.executable, str(ROOT / "scripts" / script_name), *args],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        env=env,
        timeout=120,
    )


def storage_configuration_issues() -> list[str]:
    """Return missing durable-storage variable names without exposing values."""

    if STORAGE_BACKEND == "local":
        return ["STORAGE_BACKEND"] if APP_ENV == "production" and REQUIRE_DURABLE_STORAGE else []
    if STORAGE_BACKEND not in {"s3", "supabase"}:
        return ["STORAGE_BACKEND"]

    missing = []
    if S3_PROVIDER not in {"", "b2"}:
        missing.append("S3_PROVIDER")
    if not S3_BUCKET:
        missing.append("S3_BUCKET")
    if not S3_ACCESS_KEY_ID:
        missing.append("S3_ACCESS_KEY_ID")
    if not S3_SECRET_ACCESS_KEY:
        missing.append("S3_SECRET_ACCESS_KEY")
    if STORAGE_BACKEND == "supabase" and not S3_ENDPOINT_URL:
        missing.append("S3_ENDPOINT_URL")
    if S3_PROVIDER == "b2":
        endpoint = urllib.parse.urlsplit(S3_ENDPOINT_URL.strip())
        endpoint_host = str(endpoint.hostname or "").lower()
        endpoint_suffix = ".backblazeb2.com"
        endpoint_region = (
            endpoint_host[len("s3.") : -len(endpoint_suffix)]
            if endpoint_host.startswith("s3.") and endpoint_host.endswith(endpoint_suffix)
            else ""
        )
        valid_region_name = bool(endpoint_region) and all(
            character in "abcdefghijklmnopqrstuvwxyz0123456789-" for character in endpoint_region
        )
        valid_endpoint = (
            endpoint.scheme == "https"
            and valid_region_name
            and endpoint.username is None
            and endpoint.password is None
            and endpoint.path in {"", "/"}
            and not endpoint.query
            and not endpoint.fragment
        )
        if not valid_endpoint and "S3_ENDPOINT_URL" not in missing:
            missing.append("S3_ENDPOINT_URL")
        elif S3_REGION.strip().lower() != endpoint_region:
            missing.append("S3_REGION")
    return missing


def storage_ready() -> bool:
    return not storage_configuration_issues()


def active_storage_provider() -> str:
    """Name only the provider used by the active storage backend."""

    if STORAGE_BACKEND == "s3":
        return S3_PROVIDER or "s3"
    return STORAGE_BACKEND


def is_hosted_runtime() -> bool:
    """Detect a deployed service without treating a local laptop as production."""

    if APP_ENV in {"production", "staging"}:
        return True
    return any(
        bool(os.environ.get(name))
        for name in ("RENDER", "RENDER_SERVICE_ID", "RAILWAY_ENVIRONMENT", "FLY_APP_NAME")
    )


def account_store_is_persistent() -> bool:
    """Return whether registered accounts survive a hosted-service restart.

    SQLite remains useful for a local laptop workflow. A hosted portal must use
    PostgreSQL because a container's local filesystem, including /tmp, can be
    replaced whenever the provider restarts or redeploys the service.
    """

    return USE_POSTGRES or not is_hosted_runtime()


def require_persistent_account_store() -> None:
    """Reject hosted sign-up when the durable account database is missing."""

    if not account_store_is_persistent():
        raise HTTPException(
            status_code=503,
            detail=(
                "\uc6b4\uc601 \uc0ac\uc774\ud2b8\uc758 \uacc4\uc815 \ub370\uc774\ud130\ubca0\uc774\uc2a4\uac00 \uc544\uc9c1 \uc5f0\uacb0\ub418\uc9c0 \uc54a\uc558\uc2b5\ub2c8\ub2e4. "
                "\uad00\ub9ac\uc790\uac00 PostgreSQL DATABASE_URL\uc744 \uc124\uc815\ud55c \ub4a4 \ub2e4\uc2dc \uc2dc\ub3c4\ud558\uc138\uc694."
            ),
        )


def validate_runtime_configuration() -> None:
    """Fail closed for production authentication and artifact persistence settings."""

    if APP_ENV != "production":
        return
    if ALLOW_LEGACY_USER_HEADER:
        raise RuntimeError("ALLOW_LEGACY_USER_HEADER must be false in production.")
    if JWT_SECRET == DEFAULT_JWT_SECRET or len(JWT_SECRET) < 24:
        raise RuntimeError("JWT_SECRET must be a non-default value of at least 24 characters in production.")
    if "*" in CORS_ALLOW_ORIGINS:
        raise RuntimeError("CORS_ALLOW_ORIGINS must not use '*' in production.")
    if not USE_POSTGRES:
        raise RuntimeError("DATABASE_URL must point to PostgreSQL in production so portal accounts persist.")
    if REQUIRE_DURABLE_STORAGE and not storage_ready():
        missing = ", ".join(storage_configuration_issues())
        print(
            "Startup warning: durable object storage is not configured. "
            f"Dataset uploads will be refused until this is fixed. Missing or invalid setting: {missing}.",
            file=sys.stderr,
        )


@app.get("/api/health")
def health():
    return {
        "ok": True,
        "eisDrtSpectrumSelection": True,
        "environment": os.environ.get("APP_ENV", "local"),
        "database": "postgresql" if USE_POSTGRES else "sqlite",
        "accountStorePersistent": account_store_is_persistent(),
        "storage": STORAGE_BACKEND,
        "storageProvider": active_storage_provider(),
        "storageConfigured": storage_ready(),
        "storageMissingVariables": storage_configuration_issues(),
        "databaseRowsMode": DATABASE_ROWS_MODE,
        "archiveAgentConfigured": bool(ARCHIVE_AGENT_TOKEN),
        "archiveSoftLimitBytes": ARCHIVE_SOFT_LIMIT_BYTES,
        "archiveHardLimitBytes": ARCHIVE_HARD_LIMIT_BYTES,
        "openai": "configured" if OPENAI_API_KEY else "missing",
        "version": app.version,
    }


@app.post("/api/login")
def login(payload: dict = Body(default_factory=dict)):
    user_id = str(payload.get("id") or "").strip()
    password = str(payload.get("password") or "")
    with connect() as conn:
        user = execute(conn, "SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if not user or not verify_password(password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="아이디 또는 비밀번호가 맞지 않습니다.")
    clean_user = public_user(user)
    token = create_token(clean_user)
    return {"user": public_user(user, token), "token": token}


@app.get("/api/api-tokens")
def list_current_user_api_tokens(user=Depends(get_current_user)):
    with connect() as conn:
        return list_api_tokens(conn, user)


@app.post("/api/api-tokens", status_code=201)
def create_current_user_api_token(payload: dict = Body(default_factory=dict), user=Depends(get_current_user)):
    with connect() as conn:
        return create_api_token(conn, user, str(payload.get("name") or ""))


@app.delete("/api/api-tokens/{token_id}")
def delete_current_user_api_token(token_id: str, user=Depends(get_current_user)):
    with connect() as conn:
        revoke_api_token(conn, token_id, user)
    return {"ok": True}


@app.post("/api/register", status_code=201)
def register(payload: dict = Body(default_factory=dict)):
    user_id = str(payload.get("id") or "").strip()
    password = str(payload.get("password") or "")
    name = str(payload.get("name") or user_id).strip()
    if not re.match(r"^[a-zA-Z0-9_-]{3,32}$", user_id):
        raise HTTPException(status_code=400, detail="아이디는 영문/숫자/_/- 조합 3~32자로 입력하세요.")
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="비밀번호는 운영용 기준으로 8자 이상 입력하세요.")
    require_persistent_account_store()

    with connect() as conn:
        exists = execute(conn, "SELECT id FROM users WHERE id = ?", (user_id,)).fetchone()
        if exists:
            raise HTTPException(status_code=409, detail="이미 있는 아이디입니다.")
        execute(
            conn,
            "INSERT INTO users(id, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)",
            (user_id, name, hash_password(password), "user", now_iso()),
        )

    # Read through a fresh connection before issuing a token. This proves the
    # signup commit is durable enough for the next login request, instead of
    # treating an uncommitted in-memory row as a successful registration.
    with connect() as conn:
        user = execute(conn, "SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if not user or not verify_password(password, user["password_hash"]):
        raise HTTPException(status_code=503, detail="계정 저장을 확인하지 못했습니다. 잠시 후 다시 시도하세요.")
    token = create_token(public_user(user))
    return {"user": public_user(user, token), "token": token}


def raw_archive_status(conn, dataset_id: str) -> dict:
    row = execute(
        conn,
        "SELECT * FROM artifact_archives WHERE dataset_id = ? AND artifact_kind = 'raw' ORDER BY created_at DESC LIMIT 1",
        (str(dataset_id),),
    ).fetchone()
    if not row:
        return {
            "rawBackupState": "unregistered",
            "rawBackupVerifiedAt": "",
            "rawSizeBytes": 0,
            "rawCleanupEligible": False,
        }
    return {
        "rawBackupState": str(row["backup_state"]),
        "rawBackupVerifiedAt": str(row["verified_at"] or ""),
        "rawSizeBytes": int(row["size_bytes"] or 0),
        "rawCleanupEligible": bool(int(row["cleanup_eligible"] or 0)),
    }


def admin_raw_dataset_summary(row, row_count: int | None = None, archive_status: dict | None = None) -> dict:
    """Return bounded Dataset-card metadata without exposing artifact paths."""

    columns = json_loads(row["columns_json"], [])
    if not isinstance(columns, list):
        columns = []
    raw_artifact = json_loads(row["raw_artifact_json"], {}) if "raw_artifact_json" in row.keys() else {}
    if not isinstance(raw_artifact, dict):
        raw_artifact = {}
    if row_count is None:
        try:
            row_count = int(row["row_count"])
        except (KeyError, TypeError, ValueError):
            row_count = None
    source_name = str(row["source_name"] or "").replace(chr(92), "/").rsplit("/", 1)[-1]
    item = {
        "id": str(row["id"]),
        "sourceName": source_name,
        "dataType": str(row["data_type"] or ""),
        "ownerId": str(row["owner_id"] or ""),
        "ownerName": str(row["owner_name"] or ""),
        "createdAt": str(row["created_at"] or ""),
        "columnCount": len(columns),
        "rowCount": row_count,
        "rowsStorage": str(row["rows_storage"] if "rows_storage" in row.keys() else "database"),
        "hasRawDownload": bool(raw_artifact.get("objectKey") or raw_artifact.get("localPath")),
    }
    item.update(archive_status or {})
    item["rawSizeBytes"] = max(
        int(item.get("rawSizeBytes") or 0),
        int(raw_artifact.get("sizeBytes") or 0),
    )
    return item


@app.post("/api/admin/raw-data/access")
def unlock_admin_raw_data(payload: dict = Body(default_factory=dict), user=Depends(get_current_user)):
    """Confirm a separate administrator secret before browsing raw rows."""

    ensure_admin(user)
    if not ADMIN_RAW_DATA_PASSWORD:
        raise HTTPException(status_code=503, detail="Administrator raw-data confirmation is not configured.")
    supplied = str(payload.get("password") or "")
    if not supplied or not hmac.compare_digest(supplied, ADMIN_RAW_DATA_PASSWORD):
        raise HTTPException(status_code=401, detail="Administrator confirmation was not accepted.")
    return {
        "accessToken": create_admin_raw_access_token(user),
        "expiresInSeconds": ADMIN_RAW_DATA_TTL_SECONDS,
    }


@app.get("/api/admin/raw-data/datasets")
def list_admin_raw_datasets(
    limit: int = 100,
    owner_id: str | None = None,
    user=Depends(require_admin_raw_access),
):
    """List Dataset tables for the protected administrator raw-data view."""

    bounded_limit = max(1, min(int(limit), 200))
    with connect() as conn:
        if owner_id:
            rows = execute(
                conn,
                "SELECT * FROM datasets WHERE owner_id = ? ORDER BY created_at DESC LIMIT ?",
                (owner_id, bounded_limit),
            ).fetchall()
        else:
            rows = execute(
                conn,
                "SELECT * FROM datasets ORDER BY created_at DESC LIMIT ?",
                (bounded_limit,),
            ).fetchall()
        items = [
            admin_raw_dataset_summary(row, archive_status=raw_archive_status(conn, str(row["id"])))
            for row in rows
        ]
        archive_rows = execute(
            conn,
            "SELECT backup_state, COUNT(*) AS item_count, COALESCE(SUM(size_bytes), 0) AS total_bytes FROM artifact_archives GROUP BY backup_state",
        ).fetchall()
    archive_summary = {
        str(entry["backup_state"]): {
            "count": int(entry["item_count"] or 0),
            "bytes": int(entry["total_bytes"] or 0),
        }
        for entry in archive_rows
    }
    return {
        "items": items,
        "storage": {
            "provider": active_storage_provider(),
            "pending": archive_summary.get("pending", {"count": 0, "bytes": 0}),
            "verified": archive_summary.get("verified", {"count": 0, "bytes": 0}),
            "totalBytes": sum(value["bytes"] for value in archive_summary.values()),
            "softLimitBytes": ARCHIVE_SOFT_LIMIT_BYTES,
            "hardLimitBytes": ARCHIVE_HARD_LIMIT_BYTES,
        },
    }


@app.get("/api/admin/raw-data/datasets/{dataset_id}")
def get_admin_raw_dataset(
    dataset_id: str,
    offset: int = 0,
    limit: int = 250,
    user=Depends(require_admin_raw_access),
):
    """Return one bounded page of stored raw rows for a confirmed admin."""

    bounded_offset = max(0, int(offset))
    bounded_limit = max(1, min(int(limit), 250))
    with connect() as conn:
        row = execute(conn, "SELECT * FROM datasets WHERE id = ?", (dataset_id,)).fetchone()
        archive_status = raw_archive_status(conn, dataset_id) if row else {}
    if not row:
        raise HTTPException(status_code=404, detail="Dataset not found.")
    stored_rows, _ = load_analysis_rows(dataset_from_row(row), include_review_rows=True)
    columns = json_loads(row["columns_json"], [])
    if not isinstance(columns, list):
        columns = []
    if stored_rows:
        row_columns = list(dict.fromkeys(key for item in stored_rows if isinstance(item, dict) for key in item.keys()))
        if not columns or not any(column in row_columns for column in columns):
            columns = row_columns
    raw_rows = [item for item in stored_rows[bounded_offset : bounded_offset + bounded_limit] if isinstance(item, dict)]
    return {
        "dataset": admin_raw_dataset_summary(row, len(stored_rows), archive_status),
        "columns": [str(column) for column in columns],
        "offset": bounded_offset,
        "limit": bounded_limit,
        "totalRows": len(stored_rows),
        "rows": raw_rows,
    }


def raw_artifact_download_response(row):
    """Stream one immutable upload without exposing its B2 key or local path."""

    dataset = dataset_from_row(row, include_rows=False)
    artifact = dataset.get("rawArtifact") if isinstance(dataset.get("rawArtifact"), dict) else {}
    source_name = PurePosixPath(str(dataset.get("sourceName") or "").replace("\\", "/")).name
    filename = clean_name(source_name or f"{dataset['id']}.bin")
    media_type = str(artifact.get("contentType") or mimetypes.guess_type(filename)[0] or "application/octet-stream")
    object_key = str(artifact.get("objectKey") or "")

    if object_key and STORAGE_BACKEND in {"s3", "supabase"}:
        if storage_configuration_issues():
            raise HTTPException(status_code=503, detail="Durable object storage is not available for download.")
        try:
            import boto3
            from botocore.config import Config

            client = boto3.client(
                "s3",
                endpoint_url=S3_ENDPOINT_URL or None,
                region_name=S3_REGION,
                aws_access_key_id=S3_ACCESS_KEY_ID or None,
                aws_secret_access_key=S3_SECRET_ACCESS_KEY or None,
                config=Config(
                    signature_version="s3v4",
                    s3={"addressing_style": "path" if S3_FORCE_PATH_STYLE else "auto"},
                ),
            )
            storage_response = client.get_object(Bucket=S3_BUCKET, Key=validated_object_key(object_key))
            body = storage_response["Body"]
        except HTTPException:
            raise
        except Exception as exc:
            print(f"Raw Dataset download failed for {dataset['id']}: {type(exc).__name__}", file=sys.stderr)
            raise HTTPException(status_code=503, detail="The original uploaded file could not be read from durable storage.") from exc

        def iter_download():
            try:
                while chunk := body.read(1024 * 1024):
                    yield chunk
            finally:
                try:
                    body.close()
                except Exception:
                    pass

        headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
        content_length = int(storage_response.get("ContentLength") or 0)
        if content_length > 0:
            headers["Content-Length"] = str(content_length)
        return StreamingResponse(iter_download(), media_type=media_type, headers=headers)

    local_path = _artifact_local_path(artifact)
    if local_path is not None:
        return FileResponse(local_path, media_type=media_type, filename=filename)
    raise HTTPException(status_code=404, detail="The original uploaded file is not available for download.")


@app.get("/api/admin/raw-data/datasets/{dataset_id}/download")
def download_admin_raw_dataset(dataset_id: str, user=Depends(require_admin_raw_access)):
    """Download one Dataset's immutable source after the second admin check."""

    with connect() as conn:
        row = execute(conn, "SELECT * FROM datasets WHERE id = ?", (str(dataset_id),)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Dataset not found.")
    return raw_artifact_download_response(row)


@app.get("/api/archive/artifacts")
def get_archive_artifacts(
    state: str = "pending",
    limit: int = 100,
    archive_agent=Depends(require_archive_agent),
):
    """Return authenticated backup work with short-lived private URLs."""

    with connect() as conn:
        items = list_archive_artifacts(conn, state=state, limit=limit)
        total_bytes = int(scalar(execute(conn, "SELECT COALESCE(SUM(size_bytes), 0) AS total FROM artifact_archives").fetchone()) or 0)
    public_items = []
    for item in items:
        object_key = str(item.pop("objectKey"))
        item["downloadUrl"] = create_object_download_url(object_key)
        item["downloadExpiresInSeconds"] = ARCHIVE_DOWNLOAD_TTL_SECONDS
        public_items.append(item)
    return {
        "items": public_items,
        "totalBytes": total_bytes,
        "softLimitBytes": ARCHIVE_SOFT_LIMIT_BYTES,
        "hardLimitBytes": ARCHIVE_HARD_LIMIT_BYTES,
        "usageRatio": (total_bytes / ARCHIVE_HARD_LIMIT_BYTES) if ARCHIVE_HARD_LIMIT_BYTES else 0,
    }


@app.post("/api/archive/artifacts/{archive_id}/verification")
def confirm_archive_artifact(
    archive_id: str,
    payload: dict = Body(default_factory=dict),
    archive_agent=Depends(require_archive_agent),
):
    """Record a local copy only after the agent reports an exact digest."""

    with connect() as conn:
        return verify_archive_artifact(
            conn,
            archive_id,
            size_bytes=payload.get("sizeBytes"),
            sha256=str(payload.get("sha256") or ""),
            device_id=str(payload.get("deviceId") or ""),
            relative_path=str(payload.get("relativePath") or ""),
        )


@app.get("/api/users")
def list_users(user=Depends(get_current_user)):
    ensure_admin(user)
    with connect() as conn:
        rows = execute(conn, "SELECT * FROM users ORDER BY created_at DESC").fetchall()
        membership_rows = execute(
            conn,
            """
            SELECT organization_members.user_id, organization_members.role, organizations.id, organizations.name
            FROM organization_members JOIN organizations ON organizations.id = organization_members.organization_id
            ORDER BY organization_members.user_id, organizations.name
            """,
        ).fetchall()
    organizations_by_user: dict[str, list[dict]] = {}
    for membership in membership_rows:
        organizations_by_user.setdefault(str(membership["user_id"]), []).append(
            {"id": membership["id"], "name": membership["name"], "role": membership["role"]}
        )
    items = []
    for row in rows:
        item = public_user(row)
        item["organizations"] = organizations_by_user.get(str(row["id"]), [])
        items.append(item)
    return items


def reset_user_password(user_id: str, password: str, actor: dict) -> dict:
    """Replace a password for an administrator without exposing its old value."""

    ensure_admin(actor)
    target_id = str(user_id or "").strip()
    new_password = str(password or "")
    if not target_id:
        raise HTTPException(status_code=400, detail="User id is required.")
    if len(new_password) < 8 or len(new_password) > 128:
        raise HTTPException(status_code=400, detail="Password must contain 8 to 128 characters.")

    with connect() as conn:
        existing = get_user_by_id(target_id, conn)
        if not existing:
            raise HTTPException(status_code=404, detail="User not found.")
        execute(conn, "UPDATE users SET password_hash = ? WHERE id = ?", (hash_password(new_password), target_id))
    return {"ok": True, "userId": target_id}


@app.post("/api/users/{user_id}/password")
def reset_user_password_api(user_id: str, payload: dict = Body(default_factory=dict), user=Depends(get_current_user)):
    """Allow an administrator to issue a new password without reading the old one."""

    return reset_user_password(user_id, str(payload.get("password") or ""), user)


@app.delete("/api/users/{user_id}")
def delete_user(user_id: str, user=Depends(get_current_user)):
    ensure_admin(user)
    if user_id == user["id"]:
        raise HTTPException(status_code=400, detail="현재 로그인한 관리자 계정은 삭제할 수 없습니다.")
    with connect() as conn:
        execute(conn, "DELETE FROM reports WHERE owner_id = ?", (user_id,))
        execute(conn, "DELETE FROM figures WHERE owner_id = ?", (user_id,))
        execute(conn, "DELETE FROM protocol_segments WHERE owner_id = ?", (user_id,))
        execute(conn, "DELETE FROM cell_metadata WHERE owner_id = ?", (user_id,))
        execute(conn, "DELETE FROM datasets WHERE owner_id = ?", (user_id,))
        execute(conn, "DELETE FROM dataset_groups WHERE owner_id = ?", (user_id,))
        execute(conn, "DELETE FROM cells WHERE owner_id = ?", (user_id,))
        execute(conn, "DELETE FROM campaigns WHERE owner_id = ?", (user_id,))
        execute(conn, "DELETE FROM projects WHERE owner_id = ?", (user_id,))
        result = execute(conn, "DELETE FROM users WHERE id = ?", (user_id,))
        deleted = getattr(result, "rowcount", 0)
    if not deleted:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    return {"ok": True}


def hierarchy_name(payload: dict, field: str = "name") -> str:
    value = str(payload.get(field) or "").strip()
    if not value:
        raise HTTPException(status_code=400, detail="이름을 입력해주세요.")
    if len(value) > 120:
        raise HTTPException(status_code=400, detail="이름은 120자 이하로 입력해주세요.")
    return value


@app.get("/api/hierarchy")
def get_hierarchy(user=Depends(get_current_user)):
    with connect() as conn:
        return hierarchy_for_user(conn, user)


@app.get("/api/organizations")
def list_organizations(user=Depends(get_current_user)):
    with connect() as conn:
        return list_organizations_for_user(conn, user)


@app.post("/api/organizations", status_code=201)
def create_organization(payload: dict = Body(default_factory=dict), user=Depends(get_current_user)):
    with connect() as conn:
        return create_organization_record(conn, user, payload)


@app.get("/api/organizations/{organization_id}/members")
def list_organization_members(organization_id: str, user=Depends(get_current_user)):
    with connect() as conn:
        organization = execute(conn, "SELECT * FROM organizations WHERE id = ?", (organization_id,)).fetchone()
        if not organization:
            raise HTTPException(status_code=404, detail="Organization not found.")
        if not organization_can_view(conn, user, organization_id):
            raise HTTPException(status_code=403, detail="Organization view permission is required.")
        rows = execute(
            conn,
            """
            SELECT users.id, users.name, users.role AS system_role, organization_members.role,
                   organization_members.created_at, organization_members.updated_at
            FROM organization_members JOIN users ON users.id = organization_members.user_id
            WHERE organization_members.organization_id = ?
            ORDER BY CASE organization_members.role WHEN 'owner' THEN 0 WHEN 'admin' THEN 1 WHEN 'researcher' THEN 2 ELSE 3 END, users.name
            """,
            (organization_id,),
        ).fetchall()
        return [
            {
                "user": {"id": row["id"], "name": row["name"], "role": row["system_role"]},
                "role": row["role"],
                "createdAt": row["created_at"],
                "updatedAt": row["updated_at"],
            }
            for row in rows
        ]


@app.put("/api/organizations/{organization_id}/members/{member_user_id}")
def set_organization_member_role(organization_id: str, member_user_id: str, payload: dict = Body(default_factory=dict), user=Depends(get_current_user)):
    role = str(payload.get("role") or "").strip().lower()
    with connect() as conn:
        organization = execute(conn, "SELECT * FROM organizations WHERE id = ?", (organization_id,)).fetchone()
        if not organization:
            raise HTTPException(status_code=404, detail="Organization not found.")
        return upsert_organization_member(conn, organization_id, member_user_id, role, user)


@app.delete("/api/organizations/{organization_id}/members/{member_user_id}")
def remove_organization_member(organization_id: str, member_user_id: str, user=Depends(get_current_user)):
    with connect() as conn:
        if not organization_can_admin(conn, user, organization_id):
            raise HTTPException(status_code=403, detail="Organization admin permission is required.")
        member = execute(
            conn,
            "SELECT role FROM organization_members WHERE organization_id = ? AND user_id = ?",
            (organization_id, member_user_id),
        ).fetchone()
        if not member:
            raise HTTPException(status_code=404, detail="Organization member not found.")
        if member["role"] == "owner":
            owner_count = scalar(
                execute(
                    conn,
                    "SELECT COUNT(*) AS count FROM organization_members WHERE organization_id = ? AND role = 'owner'",
                    (organization_id,),
                ).fetchone()
            ) or 0
            if int(owner_count) <= 1:
                raise HTTPException(status_code=400, detail="The last organization owner cannot be removed.")
        execute(
            conn,
            "DELETE FROM organization_members WHERE organization_id = ? AND user_id = ?",
            (organization_id, member_user_id),
        )
    return {"ok": True}


@app.post("/api/projects", status_code=201)
def create_project(payload: dict = Body(default_factory=dict), user=Depends(get_current_user)):
    current = now_iso()
    organization_id = str(payload.get("organizationId") or "").strip()
    with connect() as conn:
        if organization_id:
            organization = execute(conn, "SELECT * FROM organizations WHERE id = ?", (organization_id,)).fetchone()
            if not organization:
                raise HTTPException(status_code=404, detail="Organization not found.")
            if not organization_can_edit(conn, user, organization_id):
                raise HTTPException(status_code=403, detail="Organization researcher permission is required.")
        item = {
            "id": make_id("PRJ"),
            "ownerId": user["id"],
            "name": hierarchy_name(payload),
            "description": str(payload.get("description") or "").strip()[:500],
            "organizationId": organization_id,
            "createdAt": current,
            "updatedAt": current,
        }
        execute(
            conn,
            "INSERT INTO projects(id, owner_id, name, description, organization_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (item["id"], item["ownerId"], item["name"], item["description"], item["organizationId"], item["createdAt"], item["updatedAt"]),
        )
    return item


@app.post("/api/projects/{project_id}/campaigns", status_code=201)
def create_campaign(project_id: str, payload: dict = Body(default_factory=dict), user=Depends(get_current_user)):
    with connect() as conn:
        project = execute(conn, "SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone()
        if not project:
            raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다.")
        if not can_edit_row(conn, user, project):
            raise HTTPException(status_code=403, detail="이 프로젝트에 실험 배치를 추가할 권한이 없습니다.")
        current = now_iso()
        item = {
            "id": make_id("CMP"),
            "projectId": project_id,
            "ownerId": user["id"],
            "name": hierarchy_name(payload),
            "description": str(payload.get("description") or "").strip()[:500],
            "createdAt": current,
            "updatedAt": current,
        }
        execute(
            conn,
            "INSERT INTO campaigns(id, project_id, owner_id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (item["id"], item["projectId"], item["ownerId"], item["name"], item["description"], item["createdAt"], item["updatedAt"]),
        )
        item["organizationId"] = row_organization_id(project)
        execute(
            conn,
            "UPDATE campaigns SET organization_id = ? WHERE id = ?",
            (item["organizationId"], item["id"]),
        )
    return item


@app.post("/api/campaigns/{campaign_id}/cells", status_code=201)
def create_cell_record(campaign_id: str, payload: dict = Body(default_factory=dict), user=Depends(get_current_user)):
    with connect() as conn:
        campaign_row = execute(conn, "SELECT * FROM campaigns WHERE id = ?", (campaign_id,)).fetchone()
        if not campaign_row:
            raise HTTPException(status_code=404, detail="실험 배치를 찾을 수 없습니다.")
        if not can_edit_row(conn, user, campaign_row):
            raise HTTPException(status_code=403, detail="이 실험 배치에 셀을 추가할 권한이 없습니다.")
        campaign = campaign_from_row(campaign_row)
        cell = {
            "cellId": hierarchy_name(payload, "cellId"),
            "sampleName": str(payload.get("sampleName") or ""),
            "material": str(payload.get("material") or ""),
            "electrolyte": str(payload.get("electrolyte") or ""),
            "condition": str(payload.get("condition") or ""),
            "notes": str(payload.get("notes") or ""),
        }
        return merge_cell_record(conn, campaign, user["id"], cell, "")


def get_cell_for_user(conn, cell_record_id: str, user: dict, require_edit: bool = False):
    row = execute(conn, "SELECT * FROM cells WHERE id = ?", (cell_record_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="셀을 찾을 수 없습니다.")
    allowed = can_edit_row(conn, user, row) if require_edit else can_view_row(conn, user, row)
    if not allowed:
        raise HTTPException(status_code=403, detail="이 셀을 관리할 권한이 없습니다.")
    return row


@app.post("/api/cells/{cell_record_id}/dataset-groups", status_code=201)
def create_dataset_group(cell_record_id: str, payload: dict = Body(default_factory=dict), user=Depends(get_current_user)):
    name = hierarchy_name(payload)
    with connect() as conn:
        cell = cell_record_from_row(get_cell_for_user(conn, cell_record_id, user, require_edit=True))
        item = ensure_dataset_group(conn, cell, user["id"], "", name)
    return item


@app.get("/api/cells/{cell_record_id}/workspace")
def get_cell_workspace(cell_record_id: str, user=Depends(get_current_user)):
    with connect() as conn:
        cell = cell_record_from_row(get_cell_for_user(conn, cell_record_id, user))
        metadata_row = execute(conn, "SELECT * FROM cell_metadata WHERE cell_record_id = ?", (cell_record_id,)).fetchone()
        groups = execute(conn, "SELECT * FROM dataset_groups WHERE cell_record_id = ? ORDER BY created_at, name", (cell_record_id,)).fetchall()
        segments = execute(conn, "SELECT * FROM protocol_segments WHERE cell_record_id = ? ORDER BY start_cycle, end_cycle", (cell_record_id,)).fetchall()
        figures = execute(conn, "SELECT * FROM figures WHERE cell_record_id = ? ORDER BY updated_at DESC", (cell_record_id,)).fetchall()
        reports = execute(conn, "SELECT * FROM reports WHERE cell_record_id = ? ORDER BY updated_at DESC", (cell_record_id,)).fetchall()
        count_rows = execute(
            conn,
            "SELECT dataset_group_id, data_type, COUNT(*) AS count FROM datasets WHERE cell_record_id = ? GROUP BY dataset_group_id, data_type",
            (cell_record_id,),
        ).fetchall()

    group_types: dict[str, dict[str, int]] = {}
    for row in count_rows:
        group_types.setdefault(row["dataset_group_id"], {})[row["data_type"]] = int(row["count"])
    dataset_groups = []
    for row in groups:
        item = dataset_group_from_row(row)
        item["dataTypes"] = group_types.get(item["id"], {})
        dataset_groups.append(item)
    return {
        "cell": cell,
        "metadata": cell_metadata_from_row(metadata_row) if metadata_row else {"cellRecordId": cell_record_id, "metadata": {}, "tags": []},
        "datasetGroups": dataset_groups,
        "protocolSegments": [protocol_segment_from_row(row) for row in segments],
        "figures": [figure_record_from_row(row) for row in figures],
        "reports": [report_from_row(row) for row in reports],
    }


@app.patch("/api/cells/{cell_record_id}/metadata")
def save_cell_metadata(cell_record_id: str, payload: dict = Body(default_factory=dict), user=Depends(get_current_user)):
    raw_metadata = payload.get("metadata") if isinstance(payload.get("metadata"), dict) else {}
    metadata = {str(key)[:80]: str(value)[:500] for key, value in raw_metadata.items() if str(value).strip()}
    raw_tags = payload.get("tags")
    if isinstance(raw_tags, str):
        raw_tags = raw_tags.split(",")
    tags = []
    for tag in raw_tags if isinstance(raw_tags, list) else []:
        value = str(tag).strip()
        if value and value not in tags:
            tags.append(value[:60])
    current = now_iso()
    with connect() as conn:
        cell = cell_record_from_row(get_cell_for_user(conn, cell_record_id, user, require_edit=True))
        existing = execute(conn, "SELECT * FROM cell_metadata WHERE cell_record_id = ?", (cell_record_id,)).fetchone()
        if existing:
            execute(
                conn,
                "UPDATE cell_metadata SET metadata_json = ?, tags_json = ?, updated_at = ? WHERE cell_record_id = ?",
                (json_dumps(metadata), json_dumps(tags), current, cell_record_id),
            )
            row = execute(conn, "SELECT * FROM cell_metadata WHERE cell_record_id = ?", (cell_record_id,)).fetchone()
        else:
            item_id = make_id("META")
            execute(
                conn,
                "INSERT INTO cell_metadata(id, cell_record_id, owner_id, metadata_json, tags_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (item_id, cell_record_id, user["id"], json_dumps(metadata), json_dumps(tags), current, current),
            )
            row = execute(conn, "SELECT * FROM cell_metadata WHERE id = ?", (item_id,)).fetchone()
    return cell_metadata_from_row(row)


@app.post("/api/cells/{cell_record_id}/protocol-segments", status_code=201)
def create_protocol_segment(cell_record_id: str, payload: dict = Body(default_factory=dict), user=Depends(get_current_user)):
    try:
        start_cycle = int(payload.get("startCycle"))
        end_cycle = int(payload.get("endCycle"))
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="시작과 종료 cycle은 정수로 입력해주세요.")
    if start_cycle < 1 or end_cycle < start_cycle:
        raise HTTPException(status_code=400, detail="cycle 구간을 다시 확인해주세요.")
    c_rate_raw = str(payload.get("cRate") or "").strip()
    try:
        c_rate = float(c_rate_raw) if c_rate_raw else None
    except ValueError:
        raise HTTPException(status_code=400, detail="C-rate는 숫자로 입력해주세요.")
    label = str(payload.get("label") or "").strip()[:120] or f"{start_cycle}-{end_cycle} cycle"
    current = now_iso()
    with connect() as conn:
        cell = cell_record_from_row(get_cell_for_user(conn, cell_record_id, user, require_edit=True))
        group_id = str(payload.get("datasetGroupId") or "").strip()
        if group_id:
            group = execute(
                conn,
                "SELECT * FROM dataset_groups WHERE id = ? AND cell_record_id = ?",
                (group_id, cell_record_id),
            ).fetchone()
            if not group:
                raise HTTPException(status_code=400, detail="선택한 Dataset 묶음을 찾을 수 없습니다.")
        item = {
            "id": make_id("SEG"),
            "datasetGroupId": group_id,
            "cellRecordId": cell_record_id,
            "ownerId": user["id"],
            "label": label,
            "startCycle": start_cycle,
            "endCycle": end_cycle,
            "cRate": c_rate,
            "mode": str(payload.get("mode") or "")[:60],
            "notes": str(payload.get("notes") or "")[:500],
            "createdAt": current,
            "updatedAt": current,
        }
        execute(
            conn,
            """
            INSERT INTO protocol_segments(
              id, dataset_group_id, cell_record_id, owner_id, label, start_cycle, end_cycle,
              c_rate, mode, notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                item["id"], item["datasetGroupId"], item["cellRecordId"], item["ownerId"], item["label"],
                item["startCycle"], item["endCycle"], item["cRate"], item["mode"], item["notes"],
                item["createdAt"], item["updatedAt"],
            ),
        )
    return item


@app.delete("/api/protocol-segments/{segment_id}")
def delete_protocol_segment(segment_id: str, user=Depends(get_current_user)):
    with connect() as conn:
        row = execute(conn, "SELECT * FROM protocol_segments WHERE id = ?", (segment_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="프로토콜 구간을 찾을 수 없습니다.")
        cell = execute(conn, "SELECT * FROM cells WHERE id = ?", (row["cell_record_id"],)).fetchone()
        if not cell or not can_edit_row(conn, user, cell):
            raise HTTPException(status_code=403, detail="이 프로토콜 구간을 삭제할 권한이 없습니다.")
        execute(conn, "DELETE FROM protocol_segments WHERE id = ?", (segment_id,))
    return {"ok": True}


@app.post("/api/figures", status_code=201)
def save_figure_record(payload: dict = Body(default_factory=dict), user=Depends(get_current_user)):
    dataset_id = str(payload.get("datasetId") or "").strip()
    if not dataset_id:
        raise HTTPException(status_code=400, detail="저장할 데이터셋을 선택해주세요.")
    current = now_iso()
    with connect() as conn:
        dataset_row = execute(conn, "SELECT * FROM datasets WHERE id = ?", (dataset_id,)).fetchone()
        if not dataset_row:
            raise HTTPException(status_code=404, detail="데이터셋을 찾을 수 없습니다.")
        if not can_edit_row(conn, user, dataset_row):
            raise HTTPException(status_code=403, detail="이 Fig를 저장할 권한이 없습니다.")
        dataset = dataset_from_row(dataset_row)
        existing = execute(conn, "SELECT * FROM figures WHERE dataset_id = ?", (dataset_id,)).fetchone()
        item = {
            # Keep one stable artifact path per dataset. Re-saving changes the
            # document in place instead of leaking the previous JSON file.
            "id": existing["id"] if existing else make_id("FIG"),
            "datasetId": dataset_id,
            "datasetGroupId": dataset["datasetGroupId"],
            "cellRecordId": dataset["cellRecordId"],
            "ownerId": dataset["ownerId"],
            # A Fig must keep the source/type of the Dataset it represents.
            # Client-side labels can be stale after switching CYC/EIS files,
            # so never persist a caller-provided name or Figure kind here.
            "name": figure_record_label(dataset)[:160],
            "figureKind": str(dataset["figureKind"]),
            "edits": payload.get("edits") if isinstance(payload.get("edits"), dict) else dataset["figureEdits"],
            "createdAt": existing["created_at"] if existing else current,
            "updatedAt": current,
        }
        item["artifact"] = write_derived_artifact(
            dataset,
            item["id"],
            "figure",
            {
                "recordType": "figure",
                "datasetId": dataset_id,
                "figureKind": item["figureKind"],
                "name": item["name"],
                "edits": item["edits"],
                "savedBy": user["id"],
                "savedAt": current,
            },
        )
        execute(
            conn,
            """
            INSERT INTO figures(
              id, dataset_id, dataset_group_id, cell_record_id, owner_id, name, figure_kind, edits_json, artifact_json, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(dataset_id) DO UPDATE SET
              dataset_group_id = excluded.dataset_group_id,
              cell_record_id = excluded.cell_record_id,
              name = excluded.name,
              figure_kind = excluded.figure_kind,
              edits_json = excluded.edits_json,
              artifact_json = excluded.artifact_json,
              updated_at = excluded.updated_at
            """,
            (
                item["id"], item["datasetId"], item["datasetGroupId"], item["cellRecordId"], item["ownerId"],
                item["name"], item["figureKind"], json_dumps(item["edits"]), json_dumps(item["artifact"]), item["createdAt"], item["updatedAt"],
            ),
        )
        row = execute(conn, "SELECT * FROM figures WHERE dataset_id = ?", (dataset_id,)).fetchone()
    return figure_record_from_row(row)


@app.post("/api/reports", status_code=201)
def save_report(payload: dict = Body(default_factory=dict), user=Depends(get_current_user)):
    dataset_id = str(payload.get("datasetId") or "").strip()
    if not dataset_id:
        raise HTTPException(status_code=400, detail="보고서로 저장할 데이터셋을 선택해주세요.")
    report_type = str(payload.get("reportType") or "analysis")[:80]
    current = now_iso()
    with connect() as conn:
        dataset_row = execute(conn, "SELECT * FROM datasets WHERE id = ?", (dataset_id,)).fetchone()
        if not dataset_row:
            raise HTTPException(status_code=404, detail="데이터셋을 찾을 수 없습니다.")
        if not can_edit_row(conn, user, dataset_row):
            raise HTTPException(status_code=403, detail="이 보고서를 저장할 권한이 없습니다.")
        dataset = dataset_from_row(dataset_row)
        existing = execute(
            conn,
            "SELECT * FROM reports WHERE dataset_id = ? AND report_type = ?",
            (dataset_id, report_type),
        ).fetchone()
        item = {
            # One report type per dataset uses a stable artifact path on updates.
            "id": existing["id"] if existing else make_id("RPT"),
            "datasetId": dataset_id,
            "datasetGroupId": dataset["datasetGroupId"],
            "cellRecordId": dataset["cellRecordId"],
            "ownerId": dataset["ownerId"],
            "title": str(payload.get("title") or f"{dataset_label(dataset)} AI 요약")[:160],
            "reportType": report_type,
            "content": payload.get("content") if isinstance(payload.get("content"), dict) else {},
            "createdAt": existing["created_at"] if existing else current,
            "updatedAt": current,
        }
        item["artifact"] = write_derived_artifact(
            dataset,
            item["id"],
            "report",
            {
                "recordType": "report",
                "datasetId": dataset_id,
                "reportType": item["reportType"],
                "title": item["title"],
                "content": item["content"],
                "savedBy": user["id"],
                "savedAt": current,
            },
        )
        execute(
            conn,
            """
            INSERT INTO reports(
              id, dataset_id, dataset_group_id, cell_record_id, owner_id, title, report_type, content_json, artifact_json, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(dataset_id, report_type) DO UPDATE SET
              dataset_group_id = excluded.dataset_group_id,
              cell_record_id = excluded.cell_record_id,
              title = excluded.title,
              content_json = excluded.content_json,
              artifact_json = excluded.artifact_json,
              updated_at = excluded.updated_at
            """,
            (
                item["id"], item["datasetId"], item["datasetGroupId"], item["cellRecordId"], item["ownerId"],
                item["title"], item["reportType"], json_dumps(item["content"]), json_dumps(item["artifact"]), item["createdAt"], item["updatedAt"],
            ),
        )
        row = execute(conn, "SELECT * FROM reports WHERE dataset_id = ? AND report_type = ?", (dataset_id, report_type)).fetchone()
    return report_from_row(row)


@app.get("/api/datasets")
def list_datasets(user=Depends(get_current_user)):
    with connect() as conn:
        rows = [
            row for row in execute(conn, "SELECT * FROM datasets ORDER BY created_at DESC").fetchall()
            if can_view_row(conn, user, row)
        ]
    # Do not send every raw CYC/EIS/CV table to the browser just to draw the
    # saved-dataset list.  The client fetches one selected dataset on demand.
    return [dataset_from_row(row, include_rows=False) for row in rows]


@app.get("/api/datasets/{dataset_id}")
def get_dataset(dataset_id: str, user=Depends(get_current_user)):
    with connect() as conn:
        row = execute(conn, "SELECT * FROM datasets WHERE id = ?", (dataset_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="데이터를 찾을 수 없습니다.")
    if not can_see(user, row):
        raise HTTPException(status_code=403, detail="조회 권한이 없습니다.")
    return dataset_detail_from_row(row)


@app.get("/api/datasets/{dataset_id}/comparison-series")
def get_dataset_comparison_series(dataset_id: str, user=Depends(get_current_user)):
    """Return an authorized cycle-capacity projection without raw trace rows."""

    with connect() as conn:
        row = execute(conn, "SELECT * FROM datasets WHERE id = ?", (dataset_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="데이터를 찾을 수 없습니다.")
    if not can_see(user, row):
        raise HTTPException(status_code=403, detail="조회 권한이 없습니다.")
    return cyc_comparison_series_from_row(row)


@app.get("/api/datasets/{dataset_id}/analyses")
def list_dataset_analyses(dataset_id: str, user=Depends(get_current_user)):
    with connect() as conn:
        row = execute(conn, "SELECT * FROM datasets WHERE id = ?", (dataset_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Dataset not found.")
        if not can_view_row(conn, user, row):
            raise HTTPException(status_code=403, detail="View permission is required.")
        return list_analysis_runs(conn, dataset_id)


@app.post("/api/datasets/{dataset_id}/analyses", status_code=201)
def create_dataset_analysis(dataset_id: str, payload: dict = Body(default_factory=dict), user=Depends(get_current_user)):
    analysis_name = str(payload.get("analysisName") or "").strip()
    parameters = payload.get("parameters") if isinstance(payload.get("parameters"), dict) else {}
    if not analysis_name:
        raise HTTPException(status_code=400, detail="analysisName is required.")
    with connect() as conn:
        row = execute(conn, "SELECT * FROM datasets WHERE id = ?", (dataset_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Dataset not found.")
        if not can_edit_row(conn, user, row):
            raise HTTPException(status_code=403, detail="Analysis permission is required.")
        return create_analysis_run(conn, dataset_from_row(row), user, analysis_name, parameters)


@app.post("/api/datasets", status_code=201)
def create_dataset(payload: dict = Body(default_factory=dict), user=Depends(get_current_user)):
    current = now_iso()
    upload_id = str(payload.pop("uploadId", "") or "").strip()
    payload["ownerId"] = user["id"]
    payload["ownerName"] = user["name"]
    payload["createdAt"] = current
    payload["updatedAt"] = current
    try:
        with connect() as conn:
            if upload_id:
                session = execute(conn, "SELECT * FROM upload_sessions WHERE id = ?", (upload_id,)).fetchone()
                if not session or session["owner_id"] != user["id"]:
                    raise HTTPException(status_code=404, detail="The upload session was not found for this user.")

                # The browser receives only a small inspection preview.  The
                # verified upload session owns the complete normalized rows,
                # which must win over the preview when the Dataset is saved.
                # Otherwise a 30k-point CYC trace is silently replaced by a
                # 1,500-point preview and voltage-profile/dQdV figures lose
                # most of their charge/discharge data.
                session_rows = json_loads(session["canonical_rows_json"], [])
                if isinstance(session_rows, list) and session_rows:
                    payload["rows"] = session_rows
                if session["consumed_dataset_id"]:
                    existing = execute(
                        conn,
                        "SELECT * FROM datasets WHERE id = ?",
                        (session["consumed_dataset_id"],),
                    ).fetchone()
                    if existing and can_view_row(conn, user, existing):
                        reused = reuse_dataset_for_requested_figure(
                            conn, dataset_from_row(existing), payload, user
                        )
                        reused["reusedExistingSource"] = True
                        return reused

                existing_source = find_dataset_by_source_hash(
                    conn,
                    user["id"],
                    str(payload.get("dataType") or "").strip().lower(),
                    str(session["sha256"] or ""),
                )
                # The lookup already restricts the match to this authenticated owner.
                if existing_source:
                    if needs_sde_parser_refresh(existing_source) or needs_wrd_parser_refresh(existing_source):
                        # A retry after an instrument-parser refresh must replace
                        # stale normalized rows instead of silently reusing a Fig.
                        for key in ("rows", "columns", "columnMapping", "quality", "parser"):
                            if isinstance(payload.get(key), type(existing_source.get(key))):
                                existing_source[key] = payload[key]
                        existing_source.update(persist_upload_session_artifacts(conn, existing_source, upload_id, user))
                        existing_source["updatedAt"] = now_iso()
                        save_dataset(conn, existing_source, actor_user=user)
                        refreshed = browser_dataset_detail(conn, existing_source["id"])
                        refreshed["reparsedExistingSource"] = True
                        return refreshed
                    consume_duplicate_upload_session(conn, session, existing_source["id"])
                    reused = reuse_dataset_for_requested_figure(conn, existing_source, payload, user)
                    reused["reusedExistingSource"] = True
                    return reused
            item = save_dataset(conn, payload, actor_user=user)
            if upload_id:
                item.update(persist_upload_session_artifacts(conn, item, upload_id, user))
                item["updatedAt"] = now_iso()
                save_dataset(conn, item, actor_user=user)
            item = browser_dataset_detail(conn, item["id"])
    except HTTPException:
        raise
    except Exception as exc:
        print(
            f"Dataset finalization failed (upload={bool(upload_id)}): {type(exc).__name__}: {exc}",
            file=sys.stderr,
        )
        raise HTTPException(
            status_code=503,
            detail=(
                "Dataset save failed. Check /api/health plus Render PostgreSQL and object-storage settings, then retry."
            ),
        ) from exc
    return item


@app.patch("/api/datasets/{dataset_id}")
def update_dataset(dataset_id: str, payload: dict = Body(default_factory=dict), user=Depends(get_current_user)):
    with connect() as conn:
        row = execute(conn, "SELECT * FROM datasets WHERE id = ?", (dataset_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="데이터를 찾을 수 없습니다.")
        if not can_edit_row(conn, user, row):
            raise HTTPException(status_code=403, detail="수정 권한이 없습니다.")
        item = dataset_from_row(row)
        if isinstance(payload.get("cell"), dict):
            item["cell"] = {**item.get("cell", {}), **payload["cell"]}
        if isinstance(payload.get("rows"), list):
            # A browser detail response can be a deliberately sampled preview.
            # Reject a preview-sized write rather than letting an ordinary table
            # edit erase the immutable large raw trace from the Dataset record.
            current_rows, _ = load_analysis_rows(item, include_review_rows=True)
            if (
                len(current_rows) > MAX_BROWSER_DATASET_ROWS
                and len(payload["rows"]) < len(current_rows)
                and not bool(payload.get("replaceFullRows"))
            ):
                raise HTTPException(
                    status_code=409,
                    detail="This large Dataset is displayed as a preview and cannot be saved as a partial table. Re-import the source file to replace all rows.",
                )
            item["rows"] = payload["rows"]
            item["rowCount"] = len(payload["rows"])
            if str(item.get("rowsStorage") or "") == "artifact":
                item["parsedArtifact"] = rewrite_normalized_artifact_rows(item, payload["rows"])
        if isinstance(payload.get("columns"), list):
            item["columns"] = payload["columns"]
        if isinstance(payload.get("figureEdits"), dict):
            item["figureEdits"] = {**item.get("figureEdits", {}), **payload["figureEdits"]}
        for key in ("projectId", "campaignId", "cellRecordId", "datasetGroupId", "datasetGroupName"):
            if key in payload:
                item[key] = str(payload.get(key) or "")
        if payload.get("figureKind"):
            item["figureKind"] = str(payload["figureKind"])
        item["updatedAt"] = now_iso()
        save_dataset(conn, item, actor_user=user)
        return browser_dataset_detail(conn, dataset_id)


@app.delete("/api/datasets/{dataset_id}")
def delete_dataset(dataset_id: str, user=Depends(get_current_user)):
    with connect() as conn:
        row = execute(conn, "SELECT * FROM datasets WHERE id = ?", (dataset_id,)).fetchone()
        if row and not can_edit_row(conn, user, row):
            raise HTTPException(status_code=403, detail="삭제 권한이 없습니다.")
        if not row:
            return {"ok": True}

        dataset = dataset_from_row(row)
        analysis_rows = execute(conn, "SELECT * FROM analysis_runs WHERE dataset_id = ?", (dataset_id,)).fetchall()
        figure_rows = execute(conn, "SELECT * FROM figures WHERE dataset_id = ?", (dataset_id,)).fetchall()
        report_rows = execute(conn, "SELECT * FROM reports WHERE dataset_id = ?", (dataset_id,)).fetchall()
        upload_rows = execute(conn, "SELECT * FROM upload_sessions WHERE consumed_dataset_id = ?", (dataset_id,)).fetchall()

        artifacts = [dataset.get("rawArtifact") or {}, dataset.get("parsedArtifact") or {}]
        artifacts.extend(json_column(entry, "artifact_json", {}) for entry in analysis_rows)
        artifacts.extend(json_column(entry, "artifact_json", {}) for entry in figure_rows)
        artifacts.extend(json_column(entry, "artifact_json", {}) for entry in report_rows)

        # Object-storage failures in durable mode raise before database rows are
        # removed, so a dataset is never silently detached from its source data.
        for artifact in artifacts:
            delete_artifact(artifact)
        for upload in upload_rows:
            delete_from_object_storage(object_key_from_storage_url(str(upload["storage_url"] or "")))
            delete_local_upload_path(str(upload["local_path"] or ""))

        execute(conn, "DELETE FROM analysis_runs WHERE dataset_id = ?", (dataset_id,))
        execute(conn, "DELETE FROM figures WHERE dataset_id = ?", (dataset_id,))
        execute(conn, "DELETE FROM reports WHERE dataset_id = ?", (dataset_id,))
        execute(conn, "DELETE FROM upload_sessions WHERE consumed_dataset_id = ?", (dataset_id,))
        execute(conn, "DELETE FROM artifact_archives WHERE dataset_id = ?", (dataset_id,))
        execute(conn, "DELETE FROM datasets WHERE id = ?", (dataset_id,))
    return {"ok": True}


def optional_user_from_headers(authorization: str | None, legacy_user_id: str | None) -> dict | None:
    """Best-effort user lookup for public endpoints such as feedback."""

    user_id = ""
    try:
        if authorization and authorization.lower().startswith("bearer "):
            try:
                payload = decode_token(authorization.split(" ", 1)[1].strip())
                user_id = str(payload.get("sub") or "")
            except HTTPException:
                if not ALLOW_LEGACY_USER_HEADER:
                    raise
                user_id = str(legacy_user_id or "")
        elif ALLOW_LEGACY_USER_HEADER:
            user_id = str(legacy_user_id or "")
        user = get_user_by_id(user_id)
        return public_user(user) if user else None
    except Exception:
        return None


@app.post("/api/feedback", status_code=201)
def create_feedback(
    payload: dict = Body(default_factory=dict),
    authorization: str | None = Header(None),
    legacy_user_id: str | None = Header(None, alias="X-User-Id"),
):
    message = str(payload.get("message") or "").strip()
    if len(message) < 3:
        raise HTTPException(status_code=400, detail="수정 요청 내용을 3자 이상 입력해 주세요.")
    if len(message) > 4000:
        raise HTTPException(status_code=400, detail="수정 요청 내용은 4000자 이하로 입력해 주세요.")

    current_user = optional_user_from_headers(authorization, legacy_user_id)
    item = {
        "id": f"FB-{int(time.time() * 1000)}-{secrets.token_hex(3)}",
        "name": str(payload.get("name") or "").strip()[:80],
        "email": str(payload.get("email") or "").strip()[:160],
        "page": str(payload.get("page") or "").strip()[:160],
        "message": message,
        "status": "open",
        "createdAt": now_iso(),
        "userId": current_user["id"] if current_user else "",
        "userName": current_user["name"] if current_user else "",
    }
    with connect() as conn:
        execute(
            conn,
            """
            INSERT INTO feedback(id, name, email, page, message, status, created_at, user_id, user_name)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                item["id"],
                item["name"],
                item["email"],
                item["page"],
                item["message"],
                item["status"],
                item["createdAt"],
                item["userId"],
                item["userName"],
            ),
        )
    return item


@app.get("/api/feedback")
def list_feedback(user=Depends(get_current_user)):
    ensure_admin(user)
    with connect() as conn:
        rows = execute(conn, "SELECT * FROM feedback ORDER BY created_at DESC").fetchall()
    return [feedback_from_row(row) for row in rows]


def to_float(value) -> float | None:
    try:
        if value in (None, ""):
            return None
        n = float(str(value).replace(",", "").strip())
        return n if n == n else None
    except Exception:
        return None


def avg(values: list[float]) -> float | None:
    clean = [v for v in values if isinstance(v, (int, float)) and v == v]
    return sum(clean) / len(clean) if clean else None


def row_value(row: dict, names: list[str]) -> float | None:
    """Read a number from common normalized and raw column names."""

    lookup = {key_of(k): v for k, v in row.items()}
    for name in names:
        if name in row:
            value = to_float(row.get(name))
            if value is not None:
                return value
        value = to_float(lookup.get(key_of(name)))
        if value is not None:
            return value
    return None


def min_max(values: list[float]) -> dict:
    clean = [v for v in values if isinstance(v, (int, float)) and v == v]
    return {"min": min(clean), "max": max(clean)} if clean else {"min": None, "max": None}


def dataset_label(dataset: dict) -> str:
    cell = dataset.get("cell") if isinstance(dataset.get("cell"), dict) else {}
    return str(cell.get("cellId") or cell.get("sampleName") or cell.get("material") or dataset.get("sourceName") or dataset.get("id") or "데이터")


def figure_record_label(dataset: dict) -> str:
    """Return a Fig name that cannot confuse an EIS record with a CYC record."""
    data_type = str(dataset.get("dataType") or "data").upper()
    source_name = str(dataset.get("sourceName") or "").replace("\\", "/").rsplit("/", 1)[-1]
    if source_name:
        return f"{data_type} - {source_name}"
    return f"{data_type} - {dataset_label(dataset)}"


def normalize_figure_record_identity(conn) -> None:
    """Repair legacy Fig labels/kinds from their linked Dataset without changing data."""
    for figure in execute(conn, "SELECT * FROM figures").fetchall():
        dataset_row = execute(conn, "SELECT * FROM datasets WHERE id = ?", (figure["dataset_id"],)).fetchone()
        if not dataset_row:
            continue
        dataset = dataset_from_row(dataset_row)
        expected_name = figure_record_label(dataset)[:160]
        expected_kind = str(dataset.get("figureKind") or "")
        if figure["name"] == expected_name and figure["figure_kind"] == expected_kind:
            continue
        execute(
            conn,
            "UPDATE figures SET name = ?, figure_kind = ?, updated_at = ? WHERE id = ?",
            (expected_name, expected_kind, now_iso(), figure["id"]),
        )


def cyc_metrics(dataset: dict) -> dict:
    rows, analysis_provenance = load_analysis_rows(dataset)
    capacity_points, capacity_info = capacity_series(rows)
    points = [{"cycle": cycle, "capacity": capacity} for cycle, capacity in capacity_points]
    efficiencies = []
    for row in rows:
        efficiency = row_value(row, ["coulombic_efficiency_pct", "efficiency", "coulombic efficiency", "Efficiency"])
        if efficiency is not None:
            efficiencies.append(efficiency)
    points.sort(key=lambda item: item["cycle"])
    first_window = points[: min(3, len(points))]
    last_window = points[max(0, len(points) - 3) :]
    first_capacity = avg([p["capacity"] for p in first_window])
    last_capacity = avg([p["capacity"] for p in last_window])
    capacities = [p["capacity"] for p in points]
    max_capacity = max(capacities) if capacities else None
    retention = last_capacity / first_capacity * 100 if first_capacity and last_capacity is not None else None
    retention_from_max = last_capacity / max_capacity * 100 if max_capacity and last_capacity is not None else None
    drops = []
    for prev, curr in zip(points, points[1:]):
        if prev["capacity"] <= 0:
            continue
        loss = prev["capacity"] - curr["capacity"]
        loss_pct = loss / prev["capacity"] * 100
        if loss >= 5 or loss_pct >= 2:
            drops.append(
                {
                    "fromCycle": prev["cycle"],
                    "toCycle": curr["cycle"],
                    "fromCapacity": prev["capacity"],
                    "toCapacity": curr["capacity"],
                    "loss": loss,
                    "lossPct": loss_pct,
                }
            )
    drops.sort(key=lambda item: item["lossPct"], reverse=True)
    return {
        "kind": "cyc",
        "pointCount": len(points),
        "cycleRange": min_max([p["cycle"] for p in points]),
        "firstCapacityAvg": first_capacity,
        "lastCapacityAvg": last_capacity,
        "maxCapacity": max_capacity,
        "retentionPct": retention,
        "retentionFromMaxPct": retention_from_max,
        "capacityField": capacity_info["field"],
        "capacityUnit": capacity_info["unit"],
        "analysisProvenance": analysis_provenance,
        "avgEfficiency": avg(efficiencies),
        "largestDrops": drops[:6],
        "electrodeCalc": (dataset.get("cell") or {}).get("electrodeCalc") if isinstance(dataset.get("cell"), dict) else None,
    }


def eis_metrics(dataset: dict) -> dict:
    rows = dataset.get("rows") or []
    frequencies, zreal, zimag, magnitudes, phases = [], [], [], [], []
    for row in rows:
        f = row_value(row, ["frequency", "freq", "Frequency", "Hz"])
        zr = row_value(row, ["zreal", "Z'", "Z real", "real", "re"])
        zi = row_value(row, ["zimag", "Z''", "Z imag", "imag", "im"])
        if f is not None:
            frequencies.append(f)
        if zr is not None:
            zreal.append(zr)
        if zi is not None:
            zimag.append(zi)
        if zr is not None and zi is not None:
            magnitudes.append((zr * zr + zi * zi) ** 0.5)
            phases.append(math.degrees(math.atan2(zi, zr)))
    rs_guess = min(zreal) if zreal else None
    return {
        "kind": "eis",
        "pointCount": len(rows),
        "frequencyRange": min_max(frequencies),
        "zRealRange": min_max(zreal),
        "zImagRange": min_max(zimag),
        "magnitudeRange": min_max(magnitudes),
        "phaseRange": min_max(phases),
        "rsCandidate": rs_guess,
    }


def cv_metrics(dataset: dict) -> dict:
    rows = dataset.get("rows") or []
    voltages, currents = [], []
    for row in rows:
        v = row_value(row, ["voltage", "Voltage", "potential"])
        i = row_value(row, ["current", "Current", "current density"])
        if v is not None:
            voltages.append(v)
        if i is not None:
            currents.append(i)
    return {
        "kind": "cv",
        "pointCount": len(rows),
        "voltageRange": min_max(voltages),
        "currentRange": min_max(currents),
        "maxAbsCurrent": max([abs(i) for i in currents], default=None),
    }


def battery_metrics(dataset: dict) -> dict:
    data_type = str(dataset.get("dataType") or "").lower()
    if data_type == "cyc":
        metrics = cyc_metrics(dataset)
    elif data_type == "eis":
        metrics = eis_metrics(dataset)
    elif data_type == "cv":
        metrics = cv_metrics(dataset)
    else:
        metrics = {"kind": data_type or "unknown", "pointCount": len(dataset.get("rows") or [])}
    metrics.update(
        {
            "datasetId": dataset.get("id"),
            "label": dataset_label(dataset),
            "dataType": data_type,
            "sourceName": dataset.get("sourceName") or "",
            "cell": dataset.get("cell") or {},
        }
    )
    return metrics


def local_ai_sections(metrics: dict, comparisons: list[dict], reason: str = "") -> dict:
    label = metrics.get("label") or "선택 데이터"
    kind = metrics.get("kind")
    if kind == "cyc":
        retention = metrics.get("retentionPct")
        drops = metrics.get("largestDrops") or []
        main_lead = f"{label}는 {metrics.get('cycleRange', {}).get('min')}-{metrics.get('cycleRange', {}).get('max')} cycle 범위의 CYC 데이터입니다."
        if isinstance(retention, (int, float)):
            main_lead += f" 초기 평균 대비 마지막 평균 용량 유지율은 {retention:.2f}%입니다."
        degradation = "급격한 용량 저하 구간은 크게 보이지 않습니다."
        if drops:
            top = drops[0]
            degradation = f"가장 큰 저하 구간은 cycle {top['fromCycle']}→{top['toCycle']}이며 약 {top['lossPct']:.2f}% 감소했습니다."
        capacity_unit = metrics.get("capacityUnit") or "mAh g-1"
        writing = f"{label} 셀은 마지막 평균 방전용량 {metrics.get('lastCapacityAvg')} {capacity_unit} 수준을 보였으며, 용량 유지율은 {retention} %로 계산되었다."
    elif kind == "eis":
        main_lead = f"{label}는 {metrics.get('pointCount')}개 포인트의 EIS 데이터입니다. Nyquist/Bode 해석에 사용할 수 있습니다."
        degradation = "EIS 데이터는 cycle별 성능 저하 대신 Rs/Rct 후보와 저주파 tail 변화를 중심으로 비교하는 것이 좋습니다."
        writing = f"{label}의 EIS 결과는 주파수 범위와 임피던스 응답을 바탕으로 계면 저항 변화를 비교하는 데 사용될 수 있다."
    elif kind == "cv":
        main_lead = f"{label}는 {metrics.get('pointCount')}개 포인트의 CV 데이터입니다. 전압 창과 전류 응답을 중심으로 해석할 수 있습니다."
        degradation = "CV 데이터는 성능 저하 구간보다 peak 위치, peak 전류, 전압 창 변화를 중심으로 비교하는 것이 좋습니다."
        writing = f"{label}의 CV 결과는 전압 범위 내 산화/환원 peak와 전류 응답 변화를 비교하는 데 사용될 수 있다."
    else:
        main_lead = f"{label} 데이터의 행 수는 {metrics.get('pointCount')}개입니다."
        degradation = "데이터 타입을 먼저 확정해야 성능 저하 구간을 판단할 수 있습니다."
        writing = f"{label} 데이터는 추가적인 컬럼 확인 후 해석할 수 있다."

    compare_text = "비교 설명을 만들려면 CYC 데이터를 2개 이상 비교 대상으로 선택하세요."
    if len(comparisons) >= 2:
        ranked = sorted(comparisons, key=lambda item: item.get("lastCapacityAvg") or 0, reverse=True)
        compare_text = f"비교 대상 {len(comparisons)}개 중 마지막 평균 용량은 {ranked[0].get('label')}가 가장 높습니다."

    return {
        "main": {"lead": main_lead, "bullets": ["핵심값은 Python 백엔드에서 먼저 계산했습니다.", reason or "OpenAI API 키가 있으면 실제 AI 해석으로 교체됩니다."]},
        "degradation": {"lead": degradation, "bullets": ["CYC는 용량 유지율과 cycle-to-cycle 감소폭을 기준으로 판단합니다."]},
        "comparison": {"lead": compare_text, "bullets": ["동일 조건의 반복 셀을 함께 비교하면 해석 신뢰도가 올라갑니다."]},
        "insight": {"lead": "확인 포인트", "bullets": ["원 데이터 컬럼명, 전극 loading, C-rate 조건을 함께 확인하세요.", "논문/PPT에는 수치와 조건을 같이 쓰는 것이 좋습니다."]},
        "writing": {"lead": writing, "bullets": ["API 키가 연결되면 더 자연스러운 한국어/영어 문장으로 확장됩니다."]},
    }


def extract_response_text(body: dict) -> str:
    if body.get("output_text"):
        return str(body["output_text"])
    chunks = []
    for item in body.get("output") or []:
        for content in item.get("content") or []:
            if content.get("type") in {"output_text", "text"} and content.get("text"):
                chunks.append(str(content["text"]))
    return "\n".join(chunks).strip()


def parse_ai_json(text: str) -> dict:
    cleaned = str(text or "").strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    return json.loads(cleaned)


def request_openai_summary(metrics: dict, comparisons: list[dict]) -> dict:
    if not OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY가 설정되지 않았습니다.")

    prompt_data = {"selected": metrics, "comparisons": comparisons}
    api_payload = {
        "model": OPENAI_MODEL,
        "reasoning": {"effort": OPENAI_REASONING_EFFORT},
        "instructions": (
            "You are a Korean battery research assistant for a Battery Data Portal. "
            "Interpret CYC, EIS, and CV metrics for graduate-level battery reports. "
            "Do not invent values beyond the provided JSON. "
            "Return only valid JSON with keys: main, degradation, comparison, insight, writing. "
            "Each key must contain {lead: string, bullets: string[]} in Korean. "
            "The writing section should include publication/PPT-ready Korean wording and, when useful, one English draft bullet."
        ),
        "input": json.dumps(prompt_data, ensure_ascii=False),
        "max_output_tokens": 1800,
    }
    request = urllib.request.Request(
        OPENAI_API_URL,
        data=json.dumps(api_payload).encode("utf-8"),
        headers={"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            body = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"OpenAI API 오류: {detail[:500]}") from exc
    text = extract_response_text(body)
    return parse_ai_json(text)


@app.post("/api/ai-summary")
def create_ai_summary(payload: dict = Body(default_factory=dict), user=Depends(get_current_user)):
    dataset_id = str(payload.get("datasetId") or "").strip()
    compare_ids = [str(item) for item in payload.get("compareIds") or [] if item]
    if not dataset_id:
        raise HTTPException(status_code=400, detail="AI 요약을 만들 데이터가 선택되지 않았습니다.")

    with connect() as conn:
        row = execute(conn, "SELECT * FROM datasets WHERE id = ?", (dataset_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="데이터를 찾을 수 없습니다.")
        if not can_see(user, row):
            raise HTTPException(status_code=403, detail="조회 권한이 없습니다.")
        dataset = dataset_from_row(row)

        comparisons = []
        for compare_id in compare_ids[:8]:
            compare_row = execute(conn, "SELECT * FROM datasets WHERE id = ?", (compare_id,)).fetchone()
            if compare_row and can_see(user, compare_row):
                compare_dataset = dataset_from_row(compare_row)
                if str(compare_dataset.get("dataType") or "").lower() == "cyc":
                    comparisons.append(battery_metrics(compare_dataset))

    metrics = battery_metrics(dataset)
    try:
        sections = request_openai_summary(metrics, comparisons)
        return {"mode": "openai", "model": OPENAI_MODEL, "metrics": metrics, "comparisons": comparisons, "sections": sections}
    except Exception as exc:
        reason = str(exc)
        return {
            "mode": "local",
            "model": "local-rule-fallback",
            "reason": reason,
            "metrics": metrics,
            "comparisons": comparisons,
            "sections": local_ai_sections(metrics, comparisons, reason),
        }


def public_inspection_response(
    parsed: dict,
    *,
    upload_id: str,
    filename: str,
    content: bytes | None,
    storage_url: str | None,
    content_size: int | None = None,
    content_sha256: str | None = None,
) -> dict:
    """Return a compact inspection payload without duplicating canonical rows.

    The upload session already persists canonicalRows for the eventual Dataset
    save. Sending that second full copy back to the browser is unnecessary and
    can make large WRD inspections exhaust the browser tab.
    """

    response = {key: value for key, value in parsed.items() if key != "canonicalRows"}
    response["uploadId"] = upload_id
    response["rawArtifact"] = {
        "filename": filename,
        "sha256": content_sha256 or hashlib.sha256(content or b"").hexdigest(),
        "sizeBytes": content_size if content_size is not None else len(content or b""),
        "storageUrl": storage_url,
    }
    return response


def inspection_script_arguments(script_name: str, target: Path) -> list[str]:
    """Request complete CYC traces for server analysis, never for the browser."""

    if script_name == "inspect_file.py":
        return [str(target), "--full"]
    return [str(target)]


def finalize_instrument_inspection(parsed: dict, filename: str) -> dict:
    """Persist complete canonical rows while returning a compact inspection preview.

    Large WBCS WRD exports contain many points for every charge/discharge trace.
    Truncating those points before canonicalization makes a CYC summary look
    plausible while invalidating voltage profiles and dQ/dV.  This boundary
    keeps all bounded source rows for analysis and only samples the display copy.
    """

    columns = parsed.get("columns") or []
    source_rows = parsed.get("rows") or []
    if not isinstance(source_rows, list):
        raise HTTPException(status_code=400, detail="The instrument parser did not return tabular rows.")
    if len(source_rows) > MAX_PARSED_ROWS:
        raise HTTPException(
            status_code=413,
            detail=(
                f"The file contains {len(source_rows):,} parsed rows, exceeding the "
                f"configured analysis limit of {MAX_PARSED_ROWS:,}."
            ),
        )

    parsed["filename"] = filename
    parsed["columns"] = columns
    parsed["rowCount"] = len(source_rows)
    parsed["previewRowCount"] = min(len(source_rows), 1_500)
    detection = detect_data_type(columns, source_rows, filename)
    canonical_rows = canonicalize_rows(detection["type"], columns, source_rows)
    quality = evaluate_quality(detection["type"], canonical_rows)
    parsed["detection"] = detection
    parsed["columnMapping"] = build_column_mapping(detection["type"], columns)
    parsed["canonicalRows"] = quality["rows"]
    parsed["quality"] = quality["summary"]
    if detection["type"] == "cyc":
        parsed["cRateInference"] = infer_cycle_c_rates(
            quality["rows"],
            collect_c_rate_metadata(parsed),
        )
    parsed["parser"] = {**(parsed.get("parser") or {}), "mappingVersion": BDF_MAPPING_VERSION}
    parsed["rows"] = limit_inspection_rows(source_rows, columns)
    return parsed


def inspect_file_common(payload: dict, script_name: str, user: dict):
    filename = clean_name(payload.get("filename"))
    encoded = str(payload.get("contentBase64") or "")
    if len(encoded) > MAX_BASE64_CHARS:
        raise HTTPException(status_code=413, detail=upload_size_limit_detail())
    try:
        content = base64.b64decode(encoded, validate=True)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="업로드 파일 내용을 읽지 못했습니다. 파일을 다시 선택해 주세요.") from exc
    target, storage_url = save_upload_bytes(content, filename, "raw")
    try:
        result = run_script(script_name, inspection_script_arguments(script_name, target))
    except subprocess.TimeoutExpired as exc:
        target.unlink(missing_ok=True)
        # Parsing did not complete, so this staged upload must not remain on disk.
        raise HTTPException(
            status_code=408,
            detail="파일 분석이 120초를 넘었습니다. 큰 XLS 파일이면 Excel에서 .xlsx로 다시 저장하거나 파일을 나눠서 넣어주세요.",
        ) from exc
    if result.returncode != 0:
        target.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=result.stderr or "파일을 읽지 못했습니다.")
    try:
        parsed = json.loads(result.stdout)
    except Exception:
        target.unlink(missing_ok=True)
        return result.stdout
    parsed["storageUrl"] = storage_url
    if script_name == "inspect_file.py":
        parsed = finalize_instrument_inspection(parsed, filename)
        with connect() as conn:
            upload_id = create_upload_session(conn, user, filename, target, storage_url, content, parsed)
        return public_inspection_response(
            parsed,
            upload_id=upload_id,
            filename=filename,
            content=content,
            storage_url=storage_url,
        )
    return parsed


async def read_request_body_limited(request: Request) -> bytes:
    """Read a raw browser upload without allowing an unbounded request body."""

    try:
        declared_length = int(request.headers.get("content-length", "0"))
    except ValueError:
        declared_length = 0
    if declared_length > MAX_BODY:
        raise HTTPException(status_code=413, detail=upload_size_limit_detail())

    chunks: list[bytes] = []
    received = 0
    async for chunk in request.stream():
        received += len(chunk)
        if received > MAX_BODY:
            raise HTTPException(status_code=413, detail=upload_size_limit_detail())
        chunks.append(chunk)
    return b"".join(chunks)


async def stage_request_upload(request: Request, filename: str, prefix: str = "raw") -> tuple[Path, str | None, int, str]:
    """Stream one browser upload to disk without duplicating a large file in RAM.

    ``Request.stream`` yields the HTTP body in chunks. Keeping those chunks in a
    list before parsing caused a 40-100 MiB WRD file to exist several times in
    the web process at once (request body, joined body, staged file and parser
    payload). The inspection parser already reads from a path, so a staged file
    is the natural hand-off point and keeps the API memory usage bounded.
    """

    try:
        declared_length = int(request.headers.get("content-length", "0"))
    except ValueError:
        declared_length = 0
    if declared_length > MAX_BODY:
        raise HTTPException(status_code=413, detail=upload_size_limit_detail())

    safe_name = clean_name(filename)
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    target = UPLOAD_DIR / f"{int(time.time() * 1000)}-{safe_name}"
    received = 0
    digest = hashlib.sha256()
    try:
        with target.open("wb") as handle:
            async for chunk in request.stream():
                if not chunk:
                    continue
                received += len(chunk)
                if received > MAX_BODY:
                    raise HTTPException(status_code=413, detail=upload_size_limit_detail())
                handle.write(chunk)
                digest.update(chunk)
    except Exception:
        target.unlink(missing_ok=True)
        raise

    return target, None, received, digest.hexdigest()


def inspect_staged_file(
    filename: str,
    target: Path,
    storage_url: str | None,
    *,
    size_bytes: int,
    sha256: str,
    script_name: str,
    user: dict,
):
    """Parse a previously staged upload and keep only one raw copy in memory."""

    try:
        result = run_script(script_name, inspection_script_arguments(script_name, target))
    except subprocess.TimeoutExpired as exc:
        target.unlink(missing_ok=True)
        raise HTTPException(
            status_code=408,
            detail="파일 분석이 120초를 넘었습니다. 큰 파일은 다시 저장하거나 파일을 나눠서 넣어주세요.",
        ) from exc
    if result.returncode != 0:
        target.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=result.stderr or "파일을 읽지 못했습니다.")
    try:
        parsed = json.loads(result.stdout)
    except Exception:
        target.unlink(missing_ok=True)
        return result.stdout

    parsed["storageUrl"] = storage_url
    if script_name != "inspect_file.py":
        return parsed

    parsed = finalize_instrument_inspection(parsed, filename)
    with connect() as conn:
        upload_id = create_upload_session(
            conn,
            user,
            filename,
            target,
            storage_url,
            None,
            parsed,
            content_size=size_bytes,
            content_sha256=sha256,
        )
    return public_inspection_response(
        parsed,
        upload_id=upload_id,
        filename=filename,
        content=None,
        storage_url=storage_url,
        content_size=size_bytes,
        content_sha256=sha256,
    )


def inspect_file_bytes(filename: str, content: bytes, script_name: str, user: dict):
    """Inspect an already size-limited raw upload without Base64 expansion."""

    if len(content) > MAX_BODY:
        raise HTTPException(status_code=413, detail=upload_size_limit_detail())
    target, storage_url = save_upload_bytes(content, filename, "raw")
    try:
        result = run_script(script_name, inspection_script_arguments(script_name, target))
    except subprocess.TimeoutExpired as exc:
        target.unlink(missing_ok=True)
        raise HTTPException(status_code=408, detail="File analysis exceeded 120 seconds. Please export a smaller file and try again.") from exc
    if result.returncode != 0:
        target.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=result.stderr or "The selected file could not be read.")
    try:
        parsed = json.loads(result.stdout)
    except Exception:
        target.unlink(missing_ok=True)
        return result.stdout

    parsed["storageUrl"] = storage_url
    if script_name != "inspect_file.py":
        return parsed

    parsed = finalize_instrument_inspection(parsed, filename)
    with connect() as conn:
        upload_id = create_upload_session(conn, user, filename, target, storage_url, content, parsed)
    return public_inspection_response(
        parsed,
        upload_id=upload_id,
        filename=filename,
        content=content,
        storage_url=storage_url,
    )


def harvester_cell_payload(value) -> dict:
    """Accept a narrow, bounded metadata subset from a trusted lab watcher."""

    if value is None:
        return {}
    if not isinstance(value, dict):
        raise HTTPException(status_code=400, detail="Harvester dataset.cell must be an object.")
    limits = {"date": 32, "cellId": 120, "sampleName": 240, "material": 240, "electrolyte": 240, "condition": 240, "notes": 4000}
    cell = {}
    for key, limit in limits.items():
        if key not in value:
            continue
        text = str(value.get(key) or "").strip()
        if len(text) > limit:
            raise HTTPException(status_code=400, detail=f"Harvester cell.{key} is too long.")
        cell[key] = text
    return cell


def ingest_harvester_upload(payload: dict, user: dict) -> dict:
    """Inspect and save one watched file through the normal immutable upload path."""

    if not HARVESTER_ENABLED:
        raise HTTPException(status_code=503, detail="Harvester uploads are disabled on this server.")
    filename = str(payload.get("filename") or "").strip()
    encoded = str(payload.get("contentBase64") or "")
    if not filename or not encoded:
        raise HTTPException(status_code=400, detail="filename and contentBase64 are required.")
    if len(encoded) > int(MAX_BODY * 1.5) + 8:
        raise HTTPException(status_code=413, detail=upload_size_limit_detail())
    inspection = inspect_file_common({"filename": filename, "contentBase64": encoded}, "inspect_file.py", user)
    if not isinstance(inspection, dict):
        raise HTTPException(status_code=400, detail="The uploaded file did not return a structured inspection result.")
    detected_type = str((inspection.get("detection") or {}).get("type") or "").lower()
    requested = str((payload.get("dataset") or {}).get("dataType") or "").lower()
    allowed_types = {"cyc", "cv", "eis"}
    if requested and requested not in allowed_types:
        raise HTTPException(status_code=400, detail="Harvester dataType must be cyc, cv, or eis.")
    if detected_type not in allowed_types and not requested:
        raise HTTPException(status_code=422, detail="The Harvester could not identify the file type. Set an allowed dataType in its configuration.")
    if requested and detected_type in allowed_types and requested != detected_type:
        raise HTTPException(status_code=409, detail="Configured dataType conflicts with the detected file type.")
    data_type = detected_type if detected_type in allowed_types else requested
    dataset_config = payload.get("dataset") if isinstance(payload.get("dataset"), dict) else {}
    figure_defaults = {"cyc": "cycling-performance", "cv": "cv-curve", "eis": "eis-combined"}
    dataset_payload = {
        "uploadId": inspection["uploadId"],
        "dataType": data_type,
        "figureKind": figure_defaults[data_type],
        "cell": harvester_cell_payload(dataset_config.get("cell")),
        "columns": inspection.get("columns") or [],
        "rows": inspection.get("rows") or [],
        "sourceName": clean_name(filename),
    }
    for key in ("projectId", "campaignId", "cellRecordId", "datasetGroupId", "datasetGroupName"):
        if key in dataset_config:
            dataset_payload[key] = str(dataset_config.get(key) or "")[:160]
    dataset = create_dataset(dataset_payload, user)
    return {
        "dataset": dataset,
        "inspection": {
            "uploadId": inspection["uploadId"],
            "detection": inspection.get("detection") or {},
            "parser": inspection.get("parser") or {},
            "quality": inspection.get("quality") or {},
        },
    }


@app.post("/api/inspect-file")
def inspect_file(payload: dict = Body(default_factory=dict), user=Depends(get_current_user)):
    return inspect_file_common(payload, "inspect_file.py", user)


@app.post("/api/inspect-upload")
async def inspect_upload(
    request: Request,
    x_filename: str | None = Header(None, alias="X-Filename"),
    user=Depends(get_current_user),
):
    filename = urllib.parse.unquote(x_filename or "upload")
    clean_filename = clean_name(filename)
    target, storage_url, size_bytes, sha256 = await stage_request_upload(request, clean_filename, "raw")
    return await run_in_threadpool(
        inspect_staged_file,
        clean_filename,
        target,
        storage_url,
        size_bytes=size_bytes,
        sha256=sha256,
        script_name="inspect_file.py",
        user=user,
    )


@app.post("/api/inspect-manual")
def inspect_manual(payload: dict = Body(default_factory=dict), user=Depends(get_current_user)):
    return inspect_file_common(payload, "inspect_manual.py", user)


@app.post("/api/harvester/uploads", status_code=201)
def create_harvester_upload(
    payload: dict = Body(default_factory=dict),
    x_portal_token: str | None = Header(None, alias="X-Portal-Token"),
):
    machine_user = get_user_from_api_token(x_portal_token)
    if not machine_user:
        raise HTTPException(status_code=401, detail="A valid X-Portal-Token is required for Harvester uploads.")
    return ingest_harvester_upload(payload, machine_user)


@app.post("/api/export-ppt")
def export_ppt(payload: dict = Body(default_factory=dict), user=Depends(get_current_user)):
    stamp = str(int(time.time() * 1000))
    image_path = UPLOAD_DIR / f"{stamp}-figure.png"
    svg_path = UPLOAD_DIR / f"{stamp}-figure.svg"
    ppt_path = UPLOAD_DIR / f"{stamp}-figure.pptx"
    image_path.write_bytes(base64.b64decode(str(payload.get("imageBase64") or "")))
    svg_path.write_text(str(payload.get("svgText") or ""), encoding="utf-8")
    result = run_script("export_ppt.py", [str(image_path), str(ppt_path), str(svg_path)])
    if result.returncode != 0 or not ppt_path.exists():
        raise HTTPException(status_code=400, detail=result.stderr or "PPT 파일을 만들지 못했습니다.")
    body = ppt_path.read_bytes()
    for file in (image_path, svg_path, ppt_path):
        try:
            file.unlink()
        except FileNotFoundError:
            pass
    return Response(
        content=body,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
    )


@app.get("/{file_path:path}")
def static_files(file_path: str):
    target = (PUBLIC_DIR / (file_path or "index.html")).resolve()
    public_root = PUBLIC_DIR.resolve()
    if not str(target).startswith(str(public_root)):
        raise HTTPException(status_code=403, detail="Forbidden")
    if target.is_dir():
        target = target / "index.html"
    if not target.exists():
        target = PUBLIC_DIR / "index.html"
    return FileResponse(target)


def main() -> None:
    import uvicorn

    validate_runtime_configuration()
    init_db()
    print(f"Battery data portal FastAPI backend: http://localhost:{PORT}")
    print(f"Database: {'PostgreSQL' if USE_POSTGRES else SQLITE_DB}")
    print(f"Storage: {STORAGE_BACKEND}")
    uvicorn.run(app, host="0.0.0.0", port=PORT)


if __name__ == "__main__":
    main()
