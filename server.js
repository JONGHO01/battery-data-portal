// Node.js 백업 서버입니다.
// 현재 포탈의 기본 흐름은 python_backend.py + SQLite이지만,
// 예전 JSON 저장 방식이나 Node 실행 환경을 다시 확인할 때 참고할 수 있도록 남겨둔 파일입니다.
const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const { spawnSync } = require("child_process");

// ROOT는 이 프로젝트 폴더 자체를 뜻합니다.
// public 폴더는 사용자가 브라우저에서 보는 HTML/CSS/JS 파일이 들어 있습니다.
const ROOT = __dirname;
const PUBLIC = path.join(ROOT, "public");

// DATA_DIR은 업로드 파일과 JSON 저장 파일이 생기는 위치입니다.
// 환경 변수 DATA_DIR을 지정하면 다른 폴더를 저장소로 쓸 수 있습니다.
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(ROOT, "data");
const DATA_FILE = path.join(DATA_DIR, "datasets.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

// 로컬 Python 경로가 있으면 그 Python을 쓰고, 없으면 시스템 PATH의 python을 사용합니다.
// 배포나 다른 PC에서는 PYTHON 환경 변수를 지정하는 방식이 가장 안전합니다.
const LOCAL_PYTHON = "C:\\Users\\ww035\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe";
const PYTHON = process.env.PYTHON || (fs.existsSync(LOCAL_PYTHON) ? LOCAL_PYTHON : "python");
const PORT = Number(process.env.PORT || 4173);
const MAX_UPLOAD_BODY = 220 * 1024 * 1024;
const BOOTSTRAP_ADMIN_ID = process.env.BOOTSTRAP_ADMIN_ID || "qq035786";
const BOOTSTRAP_ADMIN_NAME = process.env.BOOTSTRAP_ADMIN_NAME || "원종호";
const BOOTSTRAP_ADMIN_PASSWORD = process.env.BOOTSTRAP_ADMIN_PASSWORD || crypto.randomBytes(24).toString("hex");

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// 처음 실행할 때 저장 파일이 없으면 기본 파일을 만들어줍니다.
// 그래서 초보자가 빈 폴더에서 실행해도 서버가 바로 켜질 수 있습니다.
function seedDataFile(target, fallback) {
  if (fs.existsSync(target)) return;
  const bundled = path.join(ROOT, "data", path.basename(target));
  if (bundled !== target && fs.existsSync(bundled)) {
    fs.copyFileSync(bundled, target);
  } else {
    fs.writeFileSync(target, fallback, "utf8");
  }
}

seedDataFile(DATA_FILE, "[]");
if (!fs.existsSync(USERS_FILE)) {
  seedDataFile(USERS_FILE, JSON.stringify([
    {
      id: BOOTSTRAP_ADMIN_ID,
      name: BOOTSTRAP_ADMIN_NAME,
      passwordHash: crypto.createHash("sha256").update(String(BOOTSTRAP_ADMIN_PASSWORD)).digest("hex"),
      role: "admin",
      createdAt: new Date().toISOString()
    }
  ], null, 2));
}

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
};

// datasets.json을 읽는 작은 helper입니다.
// 파일이 깨졌거나 아직 없으면 앱이 멈추지 않도록 빈 배열을 돌려줍니다.
function readJson() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return [];
  }
}

function readFileJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

// JSON 파일 저장은 항상 보기 좋게 들여쓰기해서 저장합니다.
// GitHub diff를 볼 때 어떤 데이터가 바뀌었는지 확인하기 쉽습니다.
function writeFileJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

function writeJson(data) {
  writeFileJson(DATA_FILE, data);
}

// 비밀번호를 그대로 저장하지 않고 SHA-256 해시로 저장합니다.
// 연구용 간이 로그인이라 운영 서비스 수준의 인증 시스템은 아닙니다.
async function sha256(text) {
  return crypto.createHash("sha256").update(String(text)).digest("hex");
}

function publicUser(user) {
  return user ? { id: user.id, name: user.name, role: user.role } : null;
}

function getUser(req) {
  const id = req.headers["x-user-id"];
  if (!id) return null;
  return readFileJson(USERS_FILE, []).find((user) => user.id === id) || null;
}

function canSee(user, item) {
  return user && (user.role === "admin" || item.ownerId === user.id);
}

function cleanName(name) {
  return String(name || "upload").replace(/[^a-zA-Z0-9_.-]/g, "_").slice(0, 120);
}

function keyOf(name) {
  return String(name || "").toLowerCase().replace(/[^a-z0-9가-힣]/g, "");
}

// 업로드한 파일의 열 이름과 일부 행을 보고 CYC/CV/EIS 중 무엇인지 추정합니다.
// 사용자가 매번 데이터 종류를 고르지 않아도 되도록 만든 자동 분류 단계입니다.
function detectDataType(columns, rows, filename = "") {
  const keys = columns.map(keyOf);
  const has = (terms) => keys.some((k) => terms.some((t) => k.includes(t)));
  const score = { eis: 0, cyc: 0, cv: 0 };
  const fileKey = keyOf(filename);
  if (fileKey.includes("eis") || fileKey.includes("impedance")) score.eis += 2;
  if (fileKey.includes("cyc") || fileKey.includes("cycle")) score.cyc += 2;
  if (fileKey.includes("cv")) score.cv += 2;
  if (has(["freq", "frequency", "hz", "주파수"])) score.eis += 2;
  if (has(["zreal", "real", "re", "z'", "zprime", "저항"])) score.eis += 2;
  if (has(["zimag", "imag", "im", "z''", "zdoubleprime"])) score.eis += 2;
  if (has(["cycle", "cycleindex", "사이클"])) score.cyc += 2;
  if (has(["capacity", "cap", "용량", "mah", "mahg"])) score.cyc += 2;
  if (has(["charge", "discharge", "충전", "방전", "efficiency", "효율"])) score.cyc += 2;
  if (has(["voltage", "potential", "전압"])) { score.cyc += 1; score.cv += 1; }
  if (has(["current", "currentdensity", "전류"])) score.cv += 2;
  if (has(["scan", "scanrate", "sweep"])) score.cv += 2;
  if (looksLikeSmartManagerEis(columns, rows)) score.eis += 5;
  const sorted = Object.entries(score).sort((a, b) => b[1] - a[1]);
  const type = sorted[0][1] > 0 ? sorted[0][0] : "unknown";
  const confidence = sorted[0][1] === 0 ? 0 : Math.min(0.95, 0.45 + sorted[0][1] * 0.1);
  const options = {
    eis: [
      { id: "eis-combined", label: "Nyquist + Bode 통합 Fig" },
      { id: "nyquist", label: "Nyquist plot" },
      { id: "bode", label: "Bode magnitude/phase" },
    ],
    cyc: [
      { id: "cycling-performance", label: "셀 성능 테스트: capacity/efficiency vs cycle" },
      { id: "voltage-profile", label: "전압 프로파일: voltage vs capacity/time" },
      { id: "cyc-combined", label: "성능 + 전압 프로파일 통합 Fig" },
    ],
    cv: [
      { id: "cv-curve", label: "CV curve: current vs voltage" },
      { id: "cv-comparison", label: "Scan rate 비교 Fig" },
    ],
    unknown: [
      { id: "table-preview", label: "표 형태로 미리보기" },
    ],
  };
  return { type, confidence, scores: score, options: options[type] || options.unknown };
}

function looksLikeSmartManagerEis(columns, rows) {
  if (!columns.includes("8") || !columns.includes("11") || !columns.includes("12")) return false;
  if (!Array.isArray(rows) || rows.length < 10) return false;
  let matches = 0;
  for (const row of rows.slice(0, 80)) {
    const frequency = Number(row["8"]);
    const zreal = Number(row["11"]);
    const zimag = Number(row["12"]);
    if (Number.isFinite(frequency) && frequency > 0 && Number.isFinite(zreal) && Number.isFinite(zimag)) {
      matches += 1;
    }
  }
  return matches >= 10;
}

// API 응답을 한 곳에서 처리하는 함수입니다.
// 객체를 넘기면 JSON 문자열로 바꿔 보내고, 문자열이면 그대로 보냅니다.
function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(body);
}

// POST/PATCH 요청의 본문을 끝까지 읽습니다.
// 큰 엑셀 파일 업로드가 들어올 수 있어서 최대 용량을 함께 확인합니다.
function getBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    let tooLarge = false;
    req.on("data", (chunk) => {
      if (tooLarge) return;
      body += chunk;
      if (body.length > MAX_UPLOAD_BODY) {
        tooLarge = true;
        reject(Object.assign(new Error("파일이 너무 큽니다. 160MB 이하 파일로 나누거나 압축을 줄여 주세요."), { statusCode: 413 }));
        req.resume();
      }
    });
    req.on("end", () => {
      if (!tooLarge) resolve(body);
    });
    req.on("error", reject);
  });
}

function listIps() {
  const ips = [];
  for (const entries of Object.values(os.networkInterfaces())) {
    for (const item of entries || []) {
      if (item.family === "IPv4" && !item.internal) ips.push(item.address);
    }
  }
  return ips;
}

// 모든 API와 정적 파일 요청은 이 서버 함수로 들어옵니다.
// 위에서부터 URL을 하나씩 비교하면서 맞는 기능으로 보내는 방식입니다.
const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") return send(res, 204, "");

    const url = new URL(req.url, `http://${req.headers.host}`);
    // 로그인: id/password를 받아 users.json의 해시값과 비교합니다.
    if (url.pathname === "/api/login" && req.method === "POST") {
      const { id, password } = JSON.parse(await getBody(req));
      const users = readFileJson(USERS_FILE, []);
      const user = users.find((item) => item.id === String(id || "").trim());
      if (!user || user.passwordHash !== await sha256(password || "")) {
        return send(res, 401, JSON.stringify({ error: "아이디 또는 비밀번호가 맞지 않습니다." }));
      }
      return send(res, 200, JSON.stringify({ user: publicUser(user) }));
    }

    // 회원가입: 이미 있는 id인지 확인한 뒤 새 사용자를 추가합니다.
    if (url.pathname === "/api/register" && req.method === "POST") {
      const { id, name, password } = JSON.parse(await getBody(req));
      const cleanId = String(id || "").trim();
      if (!/^[a-zA-Z0-9_-]{3,32}$/.test(cleanId)) {
        return send(res, 400, JSON.stringify({ error: "아이디는 영문/숫자/_/- 조합 3~32자로 입력하세요." }));
      }
      if (String(password || "").length < 4) {
        return send(res, 400, JSON.stringify({ error: "비밀번호는 4자 이상 입력하세요." }));
      }
      const users = readFileJson(USERS_FILE, []);
      if (users.some((user) => user.id === cleanId)) {
        return send(res, 409, JSON.stringify({ error: "이미 있는 아이디입니다." }));
      }
      const user = {
        id: cleanId,
        name: String(name || cleanId).trim(),
        passwordHash: await sha256(password),
        role: "user",
        createdAt: new Date().toISOString(),
      };
      users.push(user);
      writeFileJson(USERS_FILE, users);
      return send(res, 201, JSON.stringify({ user: publicUser(user) }));
    }

    if (url.pathname === "/api/users" && req.method === "GET") {
      const user = getUser(req);
      if (!user || user.role !== "admin") return send(res, 403, JSON.stringify({ error: "관리자만 접근할 수 있습니다." }));
      return send(res, 200, JSON.stringify(readFileJson(USERS_FILE, []).map(publicUser)));
    }

    if (url.pathname.startsWith("/api/users/") && req.method === "DELETE") {
      const user = getUser(req);
      if (!user || user.role !== "admin") return send(res, 403, JSON.stringify({ error: "관리자만 접근할 수 있습니다." }));
      const id = decodeURIComponent(url.pathname.split("/").pop());
      if (id === user.id) return send(res, 400, JSON.stringify({ error: "현재 로그인한 관리자 계정은 삭제할 수 없습니다." }));
      const users = readFileJson(USERS_FILE, []);
      const target = users.find((item) => item.id === id);
      if (!target) return send(res, 404, JSON.stringify({ error: "사용자를 찾을 수 없습니다." }));
      const nextUsers = users.filter((item) => item.id !== id);
      writeFileJson(USERS_FILE, nextUsers);
      const datasets = readJson().filter((item) => item.ownerId !== id);
      writeJson(datasets);
      return send(res, 200, JSON.stringify({ ok: true }));
    }

    // 데이터 목록 조회: 관리자는 전체, 일반 사용자는 본인 데이터만 봅니다.
    if (url.pathname === "/api/datasets" && req.method === "GET") {
      const user = getUser(req);
      if (!user) return send(res, 401, JSON.stringify({ error: "로그인이 필요합니다." }));
      return send(res, 200, JSON.stringify(readJson().filter((item) => canSee(user, item))));
    }

    // 새 데이터 저장: 화면에서 정리한 rows, cell 정보, Fig 정보를 JSON에 저장합니다.
    if (url.pathname === "/api/datasets" && req.method === "POST") {
      const user = getUser(req);
      if (!user) return send(res, 401, JSON.stringify({ error: "로그인이 필요합니다." }));
      const payload = JSON.parse(await getBody(req));
      const now = new Date().toISOString();
      const data = readJson();
      const item = {
        id: payload.id || `${String(payload.dataType || "data").toUpperCase()}-${Date.now()}`,
        ownerId: user.id,
        ownerName: user.name,
        dataType: payload.dataType || "eis",
        figureKind: payload.figureKind || "eis-combined",
        createdAt: now,
        updatedAt: now,
        cell: payload.cell || {},
        rows: Array.isArray(payload.rows) ? payload.rows : [],
        columns: Array.isArray(payload.columns) ? payload.columns : [],
        sourceName: payload.sourceName || "",
        figureEdits: payload.figureEdits && typeof payload.figureEdits === "object" ? payload.figureEdits : {},
      };
      data.unshift(item);
      writeJson(data);
      return send(res, 201, JSON.stringify(item));
    }

    // 파일 검사: 업로드된 CSV/XLSX를 Python helper로 읽어서 열 이름과 샘플 행을 돌려줍니다.
    if (url.pathname === "/api/inspect-file" && req.method === "POST") {
      const user = getUser(req);
      if (!user) return send(res, 401, JSON.stringify({ error: "로그인이 필요합니다." }));
      const payload = JSON.parse(await getBody(req));
      const filename = cleanName(payload.filename);
      const target = path.join(UPLOAD_DIR, `${Date.now()}-${filename}`);
      fs.writeFileSync(target, Buffer.from(String(payload.contentBase64 || ""), "base64"));
      const script = path.join(ROOT, "scripts", "inspect_file.py");
      const result = spawnSync(PYTHON, [script, target], {
        encoding: "utf8",
        maxBuffer: 20 * 1024 * 1024,
        env: { ...process.env, PYTHONIOENCODING: "utf-8" },
      });
      if (result.status !== 0) {
        return send(res, 400, JSON.stringify({ error: result.stderr || "파일을 읽지 못했습니다." }));
      }
      const parsed = JSON.parse(result.stdout);
      const detection = detectDataType(parsed.columns || [], parsed.rows || [], filename);
      return send(res, 200, JSON.stringify({
        filename,
        columns: parsed.columns || [],
        rows: parsed.rows || [],
        headerRow: parsed.headerRow || 1,
        sheetName: parsed.sheetName || "",
        validation: parsed.validation || null,
        rowCount: (parsed.rows || []).length,
        detection,
      }));
    }

    if (url.pathname === "/api/inspect-manual" && req.method === "POST") {
      const user = getUser(req);
      if (!user) return send(res, 401, JSON.stringify({ error: "로그인이 필요합니다." }));
      const payload = JSON.parse(await getBody(req));
      const filename = cleanName(payload.filename);
      const target = path.join(UPLOAD_DIR, `${Date.now()}-${filename}`);
      fs.writeFileSync(target, Buffer.from(String(payload.contentBase64 || ""), "base64"));
      const script = path.join(ROOT, "scripts", "inspect_manual.py");
      const result = spawnSync(PYTHON, [script, target], {
        encoding: "utf8",
        maxBuffer: 20 * 1024 * 1024,
        env: { ...process.env, PYTHONIOENCODING: "utf-8" },
      });
      if (result.status !== 0) {
        return send(res, 400, JSON.stringify({ error: result.stderr || "매뉴얼 파일을 읽지 못했습니다." }));
      }
      return send(res, 200, result.stdout);
    }

    // PPT 내보내기: 선택한 Fig/표를 Python 스크립트로 넘겨 pptx 파일을 만듭니다.
    if (url.pathname === "/api/export-ppt" && req.method === "POST") {
      const user = getUser(req);
      if (!user) return send(res, 401, JSON.stringify({ error: "로그인이 필요합니다." }));
      const payload = JSON.parse(await getBody(req));
      const input = path.join(UPLOAD_DIR, `${Date.now()}-figure.png`);
      const svgInput = path.join(UPLOAD_DIR, `${Date.now()}-figure.svg`);
      const output = path.join(UPLOAD_DIR, `${Date.now()}-figure.pptx`);
      fs.writeFileSync(input, Buffer.from(String(payload.imageBase64 || ""), "base64"));
      fs.writeFileSync(svgInput, String(payload.svgText || ""), "utf8");
      const script = path.join(ROOT, "scripts", "export_ppt.py");
      const result = spawnSync(PYTHON, [script, input, output, svgInput], {
        encoding: "utf8",
        maxBuffer: 5 * 1024 * 1024,
        env: { ...process.env, PYTHONIOENCODING: "utf-8" },
      });
      if (result.status !== 0 || !fs.existsSync(output)) {
        return send(res, 400, JSON.stringify({ error: result.stderr || "PPT 파일을 만들지 못했습니다." }));
      }
      const ppt = fs.readFileSync(output);
      fs.rmSync(input, { force: true });
      fs.rmSync(svgInput, { force: true });
      fs.rmSync(output, { force: true });
      return send(res, 200, ppt, "application/vnd.openxmlformats-officedocument.presentationml.presentation");
    }

    // 데이터 수정: 하단 엑셀 표 수정, 전극 계산값 적용 같은 변경을 저장합니다.
    if (url.pathname.startsWith("/api/datasets/") && req.method === "PATCH") {
      const user = getUser(req);
      if (!user) return send(res, 401, JSON.stringify({ error: "로그인이 필요합니다." }));
      const id = decodeURIComponent(url.pathname.split("/").pop());
      const payload = JSON.parse(await getBody(req));
      const data = readJson();
      const idx = data.findIndex((item) => item.id === id);
      if (idx < 0) return send(res, 404, JSON.stringify({ error: "데이터를 찾지 못했습니다." }));
      if (!canSee(user, data[idx])) return send(res, 403, JSON.stringify({ error: "수정 권한이 없습니다." }));
      data[idx] = {
        ...data[idx],
        cell: { ...(data[idx].cell || {}), ...(payload.cell || {}) },
        rows: Array.isArray(payload.rows) ? payload.rows : data[idx].rows,
        figureKind: payload.figureKind || data[idx].figureKind,
        figureEdits: payload.figureEdits && typeof payload.figureEdits === "object"
          ? { ...(data[idx].figureEdits || {}), ...payload.figureEdits }
          : (data[idx].figureEdits || {}),
        updatedAt: new Date().toISOString(),
      };
      writeJson(data);
      return send(res, 200, JSON.stringify(data[idx]));
    }

    // 데이터 삭제: 현재 사용자에게 권한이 있는 데이터만 삭제합니다.
    if (url.pathname.startsWith("/api/datasets/") && req.method === "DELETE") {
      const user = getUser(req);
      if (!user) return send(res, 401, JSON.stringify({ error: "로그인이 필요합니다." }));
      const id = decodeURIComponent(url.pathname.split("/").pop());
      const data = readJson();
      const target = data.find((item) => item.id === id);
      if (target && !canSee(user, target)) return send(res, 403, JSON.stringify({ error: "삭제 권한이 없습니다." }));
      const next = data.filter((item) => item.id !== id);
      writeJson(next);
      return send(res, 200, JSON.stringify({ ok: true }));
    }

    let filePath = url.pathname === "/" ? path.join(PUBLIC, "index.html") : path.join(PUBLIC, url.pathname);
    filePath = path.normalize(filePath);
    if (!filePath.startsWith(PUBLIC)) return send(res, 403, "Forbidden", "text/plain; charset=utf-8");
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      return send(res, 404, "Not found", "text/plain; charset=utf-8");
    }
    send(res, 200, fs.readFileSync(filePath), mime[path.extname(filePath)] || "application/octet-stream");
  } catch (error) {
    send(res, error.statusCode || 500, JSON.stringify({ error: error.message }));
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`EIS data portal: http://localhost:${PORT}`);
  for (const ip of listIps()) console.log(`LAN link: http://${ip}:${PORT}`);
});
