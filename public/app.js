const PORTAL_VERSION = "0.18";
const PORTAL_VERSION_LABEL = `Battery Portal v${PORTAL_VERSION}`;

// 포탈 전체에서 공유하는 화면 상태입니다.
// 서버에 저장되는 데이터는 datasets에 들어오고, 화면 필터 결과는 filtered에 따로 둡니다.
// 이렇게 분리하면 검색 조건을 바꿔도 원본 데이터 목록을 다시 불러오지 않아도 됩니다.
const state = { datasets: [], filtered: [], selectedId: null, user: null, users: [], feedbacks: [], hierarchy: [], organizations: [], selectedOrganizationId: "", organizationMembers: [], cellWorkspace: null, cellWorkspaceRequestId: 0, lastAiSummary: null, analysis: null, analysisRuns: [], selectedAnalysisRunId: null, pendingAnalysisName: "", selectedAnnotation: null, manualInfo: null, inspectToken: 0, annotations: {}, layoutEdits: {}, figureStyles: {}, activeFigureModule: "cyc", searchType: "all", compareIds: [], comparisonColors: {}, tableSaveTimer: null, tableSelection: null, tableUndoStack: [], electrodeProfiles: [], selectedElectrodeProfileId: null, electrodeCalcSlots: [] };
let lastElectrodeCalcAt = "";
let busyUnlockTimer = null;

// 전극 C-rate 계산 저장소는 우선 브라우저 localStorage에 저장합니다.
// 선택한 CYC에 적용하면 그 계산값은 CYC 데이터의 cell.electrodeCalc로 들어가 DB에도 함께 저장됩니다.
const ELECTRODE_PROFILE_KEY = "batteryElectrodeRateProfiles";
const ELECTRODE_CALC_SLOT_KEY = "batteryElectrodeCalcSlotsV1";
const ELECTRODE_CALC_SLOT_COUNT = 8;
const ELECTRODE_INPUT_IDS = ["calcElectrodeType", "calcTotalMass", "calcCollectorMass", "calcTotalThickness", "calcCollectorThickness", "calcDiameter", "calcCapacity", "calcNcmRatio", "calcSuperRatio", "calcPtfeRatio"];
const ELECTRODE_SLOT_FIELDS = [
  { id: "calcTotalMass", label: "전극 전체 무게 (g)", step: "0.000001" },
  { id: "calcTotalThickness", label: "전극 전체 두께 (mm)", step: "0.001" },
  { id: "calcCollectorMass", label: "집전체 무게 (g)", step: "0.000001" },
  { id: "calcCollectorThickness", label: "집전체 두께 (mm)", step: "0.001" },
  { id: "calcDiameter", label: "전극 지름 (mm)", step: "0.1" },
  { id: "calcCapacity", label: "이론 용량 (mAh g-1)", step: "1" },
  { id: "calcNcmRatio", label: "활물질 (%)", step: "0.1" },
  { id: "calcSuperRatio", label: "도전재 (%)", step: "0.1" },
  { id: "calcPtfeRatio", label: "바인더 (%)", step: "0.1" },
];
let aiSummaryRequestId = 0;
const FILE_INSPECT_TIMEOUT_MS = 150000;

const $ = (id) => document.getElementById(id);
const fmt = (n, d = 4) => Number.isFinite(n) ? Number(n).toPrecision(d) : "";
const on = (id, event, fn) => {
  const el = $(id);
  if (el) el.addEventListener(event, fn);
};
const todayLocal = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
};

function setStatus(text) {
  $("saveStatus").textContent = text;
}

function setBusy(on, message = "데이터를 처리하고 있습니다.") {
  const overlay = $("busyOverlay");
  if (!overlay) return;
  if (busyUnlockTimer) {
    clearTimeout(busyUnlockTimer);
    busyUnlockTimer = null;
  }
  $("busyMessage").textContent = message;
  overlay.classList.toggle("hidden", !on);
  if (on) {
    busyUnlockTimer = window.setTimeout(() => {
      overlay.classList.add("hidden");
      setStatus("분석 지연");
      setAnalysisMessage(
        "파일 분석 응답이 오래 걸려 화면 잠금을 자동으로 풀었습니다. 새로고침하지 말고, 파일을 다시 선택한 뒤 '파일 분석'을 한 번만 눌러주세요.",
        "분석이 오래 걸립니다"
      );
    }, 45000);
  }
}

function setAnalysisMessage(text, title = "확인 필요") {
  const panel = $("analysisPanel");
  if (!panel || !text) return;
  panel.classList.remove("hidden");
  $("createFigure")?.classList.add("hidden");
  const old = panel.querySelector(".analysisMessage");
  if (old) old.remove();
  const msg = document.createElement("div");
  msg.className = "analysisMessage";
  const heading = document.createElement("strong");
  heading.textContent = title;
  const body = document.createElement("span");
  body.textContent = text;
  msg.append(heading, body);
  panel.prepend(msg);
}

function apiErrorMessage(body, fallback) {
  const message = String(body?.error || body?.detail || "").replace(/\s+/g, " ").trim();
  if (!message || message === "Internal Server Error" || message.startsWith("<")) return fallback;
  return message.slice(0, 260);
}

function authHeaders(extra = {}) {
  if (!state.user) return extra;
  if (state.user.token) return { ...extra, Authorization: `Bearer ${state.user.token}`, "X-User-Id": state.user.id };
  return { ...extra, "X-User-Id": state.user.id };
}

function setLoginError(text) {
  $("loginError").textContent = text || "";
}

function setLoginSuccess(text) {
  $("loginSuccess").textContent = text || "";
}

function applyUser(user) {
  state.user = user;
  if (user) {
    localStorage.setItem("eisUser", JSON.stringify(user));
    $("loginScreen").classList.add("hidden");
    showHome();
    document.body.classList.toggle("isAdmin", user.role === "admin");
    $("userChip").textContent = `${user.name || user.id} (${user.role === "admin" ? "관리자" : user.id})`;
    $("ownerPreview").value = `${user.name || user.id} / ${user.id}`;
    loadData().catch((err) => setStatus(err.message));
    loadHierarchy().catch((err) => setStatus(err.message));
    loadOrganizations().catch((err) => setStatus(err.message));
    if (user.role === "admin") {
      loadUsers().catch(() => {});
      loadFeedbacks().catch(() => {});
    }
  } else {
    localStorage.removeItem("eisUser");
    $("loginScreen").classList.remove("hidden");
    if ($("moduleHome")) $("moduleHome").classList.add("hidden");
    $("dataWorkspace").classList.add("hidden");
    document.body.classList.remove("isAdmin");
    $("userChip").textContent = "Not signed in";
    $("ownerPreview").value = "";
    state.datasets = [];
    state.filtered = [];
    state.users = [];
    state.feedbacks = [];
    state.analysisRuns = [];
    state.selectedAnalysisRunId = null;
    state.hierarchy = [];
    state.organizations = [];
    state.selectedOrganizationId = "";
    state.organizationMembers = [];
    state.cellWorkspace = null;
    state.selectedId = null;
    renderSelect();
    renderCurrent();
    renderUsers();
    renderFeedbackAdmin();
    renderOrganizationView();
  }
}

function showHome() {
  if ($("moduleHome")) $("moduleHome").classList.remove("hidden");
  $("dataWorkspace").classList.add("hidden");
  setStatus("메뉴");
}

function showWorkspace() {
  if ($("moduleHome")) $("moduleHome").classList.add("hidden");
  $("dataWorkspace").classList.remove("hidden");
  setStatus("Data workspace");
}

// 상단 메뉴나 탭에서 "검색", "전극 계산", "AI 요약" 같은 큰 화면으로 이동할 때 사용합니다.
// 각 화면을 열 때 필요한 렌더링도 여기서 한 번에 실행합니다.
function openWorkspaceView(viewName) {
  if ($("moduleHome")) $("moduleHome").classList.add("hidden");
  $("dataWorkspace").classList.remove("hidden");
  if (viewName === "search") {
    setSearchType(state.searchType || "all");
  }
  activateView(viewName);
  if (viewName === "search") renderSearchResults();
  if (viewName === "electrodeCalc") renderElectrodeCalc();
  if (viewName === "aiSummary") renderAISummary();
  if (viewName === "analysisLab") {
    renderAnalysisLab();
    loadAnalysisRuns().catch((err) => setStatus(err.message));
  }
  if (viewName === "organization") {
    renderOrganizationView();
    loadOrganizations().catch((err) => setStatus(err.message));
  }
  if (viewName === "feedbackAdmin") loadFeedbacks().catch((err) => setStatus(err.message));
  if (viewName === "users") loadUsers().catch((err) => setStatus(err.message));
  renderSelect();
  renderSavedList();
  renderCurrent();
  const label = { search: "검색", savedFigures: "피겨 모음", electrodeCalc: "전극 계산", aiSummary: "AI 요약", analysisLab: "Analysis Lab", feedbackAdmin: "의견함", users: "사용자 관리", figure: "피겨" }[viewName] || "작업 화면";
  setStatus(label);
  if (viewName === "electrodeCalc") setElectrodeCalcMode("calc");
}

// 상단 드롭다운 메뉴의 공통 라우터입니다.
// 버튼에 data-view, data-module, data-ai-section 같은 속성을 달아두면 이 함수가 알맞은 화면으로 보냅니다.
function navigateMenuTarget(target) {
  const module = target?.dataset?.module;
  const view = target?.dataset?.view;
  const focusSection = target?.dataset?.focusSection;
  const electrodeMode = target?.dataset?.electrodeMode;
  const aiSection = target?.dataset?.aiSection;
  const analysisName = target?.dataset?.analysisName;
  if (view === "search") return openSearchView(target.dataset.searchType || "all");
  if (module) return showModule(module);
  if (view) {
    if (view === "analysisLab" && analysisName) state.pendingAnalysisName = analysisName;
    openWorkspaceView(view);
    if (view === "electrodeCalc") {
      setElectrodeCalcMode(electrodeMode || "calc");
    }
    if (view === "aiSummary" && aiSection) {
      window.setTimeout(() => {
        document.querySelector(`[data-ai-summary-section="${aiSection}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
    if (focusSection) {
      window.setTimeout(() => {
        document.querySelector(`.${focusSection}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }
}

// 전극 계산 화면은 계산 입력 모드와 저장소 모드를 함께 씁니다.
// 저장소 메뉴를 누르면 profileMode를 켜서 저장소 박스를 더 위에 보이게 합니다.
function setElectrodeCalcMode(mode = "calc") {
  const view = $("electrodeCalcView");
  if (!view) return;
  const storeMode = mode === "store";
  view.classList.toggle("profileMode", storeMode);
  renderElectrodeProfileStore();
  setStatus(storeMode ? "전극 C-rate 저장소" : "전극 C-rate 계산");
}

function openSearchView(type = "all") {
  if ($("moduleHome")) $("moduleHome").classList.add("hidden");
  $("dataWorkspace").classList.remove("hidden");
  setSearchType(type);
  activateView("search");
  applyFilters();
  setStatus("검색");
}

function showModule(module) {
  if (["figure", "cyc", "cv", "eis"].includes(module)) {
    state.activeFigureModule = module === "figure" ? "cyc" : module;
    $("moduleHome").classList.add("hidden");
    $("dataWorkspace").classList.remove("hidden");
    ensureSelectedForModule(state.activeFigureModule);
    activateView("figure", state.activeFigureModule);
    const label = { cyc: "CYC 피겨", cv: "CV 피겨", eis: "EIS 피겨" }[state.activeFigureModule] || "피겨 만들기";
    const hint = {
      cyc: "CYC 파일을 넣으면 사이클/방전용량/C-rate를 자동 판별합니다.",
      cv: "CV 파일을 넣으면 전압-전류 곡선을 자동 판별합니다.",
      eis: "EIS 파일을 넣으면 Nyquist/Bode 피겨를 자동 판별합니다.",
    }[state.activeFigureModule];
    if ($("fileHint") && hint) $("fileHint").textContent = `${hint} CSV/XLSX/XLSB/WRD 지원.`;
    renderSelect();
    renderSavedList();
    renderCurrent();
    setStatus(label);
    return;
  }
  if (module === "electrodeCalc") {
    $("moduleHome").classList.add("hidden");
    $("dataWorkspace").classList.remove("hidden");
    activateView("electrodeCalc");
    renderElectrodeCalc();
    setElectrodeCalcMode("calc");
    return;
  }
}

function ensureSelectedForModule(module) {
  if (!["cyc", "cv", "eis"].includes(module)) return;
  const current = state.datasets.find((x) => x.id === state.selectedId);
  if (current?.dataType === module) return;
  const next = state.filtered.find((x) => x.dataType === module) || state.datasets.find((x) => x.dataType === module);
  state.selectedId = next?.id || null;
}

async function login(ev) {
  ev.preventDefault();
  setLoginError("");
  setLoginSuccess("");
  const fd = new FormData(ev.currentTarget);
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: fd.get("id"), password: fd.get("password") }),
  });
  const body = await res.json();
  if (!res.ok) return setLoginError(body.error || "로그인 실패");
  ev.currentTarget.reset();
  applyUser(body.user);
}

async function register(ev) {
  ev.preventDefault();
  setLoginError("");
  setLoginSuccess("");
  const fd = new FormData(ev.currentTarget);
  const res = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: fd.get("id"), name: fd.get("name"), password: fd.get("password") }),
  });
  const body = await res.json();
  if (!res.ok) return setLoginError(body.error || "아이디 생성 실패");
  ev.currentTarget.reset();
  setLoginSuccess(`${body.user.id} 아이디가 생성되었습니다.`);
  applyUser(body.user);
  setStatus(`${body.user.id} 아이디가 생성되었습니다.`);
}

async function safeLogin(ev) {
  if (ev) ev.preventDefault();
  setLoginError("");
  setLoginSuccess("");
  try {
    const form = $("loginForm");
    const fd = new FormData(form);
    if (!$("loginId").value || !$("loginPassword").value) {
      return setLoginError("아이디와 비밀번호를 입력하세요.");
    }
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: fd.get("id"), password: fd.get("password") }),
    });
    const body = await res.json();
    if (!res.ok) return setLoginError(body.error || "로그인 실패");
    form.reset();
    applyUser(body.user);
  } catch (error) {
    setLoginError(`로그인 처리 중 오류: ${error.message}`);
  }
}

async function safeRegister(ev) {
  if (ev) ev.preventDefault();
  setLoginError("");
  setLoginSuccess("");
  try {
    const form = $("registerForm");
    const fd = new FormData(form);
    if (!$("registerId").value || !$("registerPassword").value) {
      return setLoginError("아이디와 비밀번호를 입력하세요.");
    }
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: fd.get("id"), name: fd.get("name"), password: fd.get("password") }),
    });
    const body = await res.json();
    if (!res.ok) return setLoginError(body.error || "아이디 생성 실패");
    form.reset();
    setLoginSuccess(`${body.user.id} 아이디가 생성되었습니다.`);
    applyUser(body.user);
    setStatus(`${body.user.id} 아이디가 생성되었습니다.`);
  } catch (error) {
    setLoginError(`아이디 생성 중 오류: ${error.message}`);
  }
}

async function loadUsers() {
  if (!state.user || state.user.role !== "admin") return;
  const res = await fetch("/api/users", { headers: authHeaders() });
  if (!res.ok) return;
  state.users = await res.json();
  renderUsers();
}

function renderUsers() {
  const body = $("usersTable");
  if (!body) return;
  if (!state.user || state.user.role !== "admin") {
    body.innerHTML = "";
    return;
  }
  body.innerHTML = state.users.map((user) => {
    const isSelf = user.id === state.user.id;
    const action = isSelf
      ? `<span class="mutedText">현재 계정</span>`
      : `<button class="smallDanger" data-delete-user="${escapeAttr(user.id)}">탈퇴</button>`;
    return `<tr><td>${escapeXml(user.id)}</td><td>${escapeXml(user.name || "-")}</td><td>${user.role === "admin" ? "관리자" : "일반"}</td><td>${action}</td></tr>`;
  }).join("");
  for (const btn of body.querySelectorAll("[data-delete-user]")) {
    btn.addEventListener("click", () => deleteUser(btn.dataset.deleteUser));
  }
}

function formatFeedbackTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" });
}

async function loadFeedbacks() {
  if (!state.user || state.user.role !== "admin") {
    state.feedbacks = [];
    renderFeedbackAdmin();
    return;
  }
  const res = await fetch("/api/feedback", { headers: authHeaders() });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "의견 목록을 불러오지 못했습니다.");
  state.feedbacks = Array.isArray(body) ? body : [];
  renderFeedbackAdmin();
}

function renderFeedbackAdmin() {
  const summary = $("feedbackAdminSummary");
  const list = $("feedbackList");
  if (!summary || !list) return;
  if (!state.user || state.user.role !== "admin") {
    summary.innerHTML = "";
    list.innerHTML = `<p class="emptySaved">관리자만 의견함을 볼 수 있습니다.</p>`;
    return;
  }
  const feedbacks = state.feedbacks || [];
  const latest = feedbacks[0]?.createdAt ? formatFeedbackTime(feedbacks[0].createdAt) : "-";
  const withContact = feedbacks.filter((item) => item.email).length;
  summary.innerHTML = `
    <div><strong>${feedbacks.length}</strong><span>전체 의견</span></div>
    <div><strong>${withContact}</strong><span>연락처 있음</span></div>
    <div><strong>${escapeXml(latest)}</strong><span>최근 접수</span></div>
  `;
  if (!feedbacks.length) {
    list.innerHTML = `<p class="emptySaved">아직 접수된 의견이 없습니다.</p>`;
    return;
  }
  list.innerHTML = feedbacks.map((item) => {
    const author = item.name || item.userName || item.userId || "익명";
    const contact = item.email || "연락처 없음";
    const page = item.page || "페이지 미지정";
    const user = item.userId ? `${item.userName || item.userId} / ${item.userId}` : "비로그인 또는 사용자 정보 없음";
    return `
      <article class="feedbackCard">
        <div class="feedbackCardTop">
          <div>
            <strong>${escapeXml(author)}</strong>
            <span>${escapeXml(formatFeedbackTime(item.createdAt))}</span>
          </div>
          <em>${escapeXml(item.status || "open")}</em>
        </div>
        <div class="feedbackMeta">
          <span>연락처: ${escapeXml(contact)}</span>
          <span>관련 페이지: ${escapeXml(page)}</span>
          <span>작성 계정: ${escapeXml(user)}</span>
        </div>
        <p>${escapeXml(item.message || "")}</p>
      </article>`;
  }).join("");
}

async function deleteUser(id) {
  if (!confirm(`${id} 사용자를 탈퇴시키고 이 사용자의 데이터를 삭제할까요?`)) return;
  const res = await fetch(`/api/users/${encodeURIComponent(id)}`, { method: "DELETE", headers: authHeaders() });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    setStatus(body.error || "사용자 삭제 실패");
    return;
  }
  setStatus(`${id} deleted`);
  await Promise.all([loadUsers(), loadData()]);
}

function splitCsvLine(line) {
  const out = [];
  let cur = "";
  let q = false;
  for (const ch of line) {
    if (ch === '"') q = !q;
    else if (ch === "," && !q) { out.push(cur.trim()); cur = ""; }
    else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

function parseCsv(text) {
  const lines = text.replace(/\r/g, "").split("\n").filter((x) => x.trim());
  if (lines.length < 2) throw new Error("CSV에 데이터가 부족합니다.");
  const headers = splitCsvLine(lines[0]).map((x) => x.toLowerCase().replace(/[^a-z0-9]/g, ""));
  const find = (names) => headers.findIndex((h) => names.includes(h));
  const fi = find(["frequency", "freq", "f", "hz"]);
  const ri = find(["zreal", "real", "re", "zr", "zprime"]);
  const ii = find(["zimag", "imag", "im", "zi", "zdoubleprime"]);
  if (fi < 0 || ri < 0 || ii < 0) throw new Error("frequency, zreal, zimag 컬럼을 찾지 못했습니다.");
  return lines.slice(1).map((line) => {
    const cols = splitCsvLine(line);
    const frequency = Number(cols[fi]);
    const zreal = Number(cols[ri]);
    const zimag = Number(cols[ii]);
    const mag = Math.hypot(zreal, zimag);
    const phase = Math.atan2(zimag, zreal) * 180 / Math.PI;
    return { frequency, zreal, zimag, mag, phase };
  }).filter((r) => Number.isFinite(r.frequency) && Number.isFinite(r.zreal) && Number.isFinite(r.zimag));
}

function keyOf(name) {
  return String(name || "").toLowerCase().replace(/[^a-z0-9가-힣]/g, "");
}

function findColumn(columns, terms) {
  return columns.find((col) => terms.some((term) => keyOf(col).includes(term))) || null;
}

function hasAnyTerm(key, terms) {
  return terms.some((term) => key.includes(term));
}

function isDischargeColumn(key) {
  return hasAnyTerm(key, ["방전", "discharge", "dchg", "dch"]);
}

function isChargeOnlyColumn(key) {
  return key.includes("충전") || key.startsWith("charge") || key.startsWith("chg");
}

function isSpecificCapacityColumn(key) {
  return hasAnyTerm(key, ["specificcapacity", "단위", "mahg", "ahg"]);
}

function isCapacityColumn(key) {
  return hasAnyTerm(key, ["capacity", "cap", "용량", "mah", "ah"]);
}

function findBestCycColumn(columns, role) {
  const scored = columns.map((col) => {
    const key = keyOf(col);
    const discharge = isDischargeColumn(key);
    const chargeOnly = isChargeOnlyColumn(key);
    const specific = isSpecificCapacityColumn(key);
    const capacity = isCapacityColumn(key);
    let score = 0;

    if (role === "dischargeSpecific" && discharge && capacity && specific) score = 120;
    if (role === "chargeSpecific" && chargeOnly && capacity && specific) score = 120;
    if (role === "dischargeCapacity" && discharge && capacity) score = specific ? 70 : 100;
    if (role === "chargeCapacity" && chargeOnly && capacity) score = specific ? 70 : 100;

    if (role.startsWith("discharge") && chargeOnly) score = 0;
    if (role.startsWith("charge") && discharge) score = 0;
    if (key.includes("누적") || key.includes("energy") || key.includes("에너지")) score -= 40;
    if (key.includes("final") || key.includes("최종") || key.includes("전압")) score -= 40;

    return { col, score };
  }).filter((item) => item.score > 0);

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.col || null;
}

function findCycFallbackColumn(columns, role, terms) {
  const filteredColumns = columns.filter((col) => {
    const key = keyOf(col);
    if (role.startsWith("discharge")) return !isChargeOnlyColumn(key);
    if (role.startsWith("charge")) return !isDischargeColumn(key);
    return true;
  });
  return findColumn(filteredColumns, terms);
}

function numberValue(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function smartManagerEisColumns(columns, rows) {
  if (!columns.includes("8") || !columns.includes("11") || !columns.includes("12")) return null;
  const sample = rows.slice(0, 80);
  const matches = sample.filter((r) => {
    const frequency = numberValue(r["8"]);
    const zreal = numberValue(r["11"]);
    const zimag = numberValue(r["12"]);
    return Number.isFinite(frequency) && frequency > 0 && Number.isFinite(zreal) && Number.isFinite(zimag);
  }).length;
  return matches >= 10 ? { frequency: "8", zreal: "11", zimag: "12" } : null;
}

function canonicalRows(type, columns, rows) {
  const col = {
    frequency: findColumn(columns, ["frequency", "freq", "hz", "주파수"]),
    zreal: findColumn(columns, ["zreal", "real", "re", "zr", "zprime", "저항"]),
    zimag: findColumn(columns, ["zimag", "imag", "im", "zi", "zdoubleprime"]),
    cycle: findColumn(columns, ["cycle", "사이클"]),
    specificCapacity: findBestCycColumn(columns, "dischargeSpecific") || findCycFallbackColumn(columns, "dischargeSpecific", ["방전용량ahg", "dischargecapacityahg", "specificcapacity", "mahg"]),
    chargeSpecificCapacity: findBestCycColumn(columns, "chargeSpecific") || findCycFallbackColumn(columns, "chargeSpecific", ["충전용량ahg", "chargecapacityahg"]),
    capacity: findBestCycColumn(columns, "dischargeCapacity") || findCycFallbackColumn(columns, "dischargeCapacity", ["dischargecapacity", "dischargecap", "dchgcap", "dchcap", "방전용량", "방전"]),
    chargeCapacity: findBestCycColumn(columns, "chargeCapacity") || findCycFallbackColumn(columns, "chargeCapacity", ["chargecapacity", "chargecap", "chgcap", "충전용량", "충전"]),
    efficiency: findColumn(columns, ["coulombicefficiency", "coulombefficiency", "쿨롱효율", "효율", "efficiency", "coulomb", "ce"]),
    voltage: findColumn(columns, ["voltage", "potential", "전압"]),
    current: findColumn(columns, ["current", "전류"]),
    time: findColumn(columns, ["time", "시간"]),
  };
  if (type === "eis") {
    const smartCols = smartManagerEisColumns(columns, rows);
    if (smartCols) {
      col.frequency = smartCols.frequency;
      col.zreal = smartCols.zreal;
      col.zimag = smartCols.zimag;
    }
  }
  if (type === "eis") {
    return rows.map((r) => {
      const zreal = numberValue(r[col.zreal]);
      const zimag = numberValue(r[col.zimag]);
      const frequency = numberValue(r[col.frequency]);
      return { frequency, zreal, zimag, mag: Math.hypot(zreal || 0, zimag || 0), phase: Math.atan2(zimag || 0, zreal || 0) * 180 / Math.PI };
    }).filter((r) => Number.isFinite(r.frequency) && Number.isFinite(r.zreal) && Number.isFinite(r.zimag));
  }
  if (type === "cyc") {
    return rows.map((r, i) => {
      const dischargeCapacity = scaledCycValue(r, col.specificCapacity) ?? scaledCycValue(r, col.capacity);
      const chargeCapacity = scaledCycValue(r, col.chargeSpecificCapacity) ?? scaledCycValue(r, col.chargeCapacity);
      return {
        index: i + 1,
        cycle: numberValue(r[col.cycle]) ?? i + 1,
        capacity: dischargeCapacity,
        chargeCapacity,
        efficiency: numberValue(r[col.efficiency]),
        voltage: numberValue(r[col.voltage]),
        current: numberValue(r[col.current]),
        time: numberValue(r[col.time]),
      };
    }).filter((r) => [r.capacity, r.chargeCapacity, r.efficiency, r.voltage].some((v) => Number.isFinite(v)));
  }
  if (type === "cv") {
    return rows.map((r, i) => ({
      index: i + 1,
      voltage: numberValue(r[col.voltage]),
      current: numberValue(r[col.current]),
      cycle: numberValue(r[col.cycle]),
    })).filter((r) => Number.isFinite(r.voltage) && Number.isFinite(r.current));
  }
  return rows;
}

function scaleCycCapacity(value, columnName = "") {
  if (!Number.isFinite(value)) return value;
  const key = keyOf(columnName);
  if (key.includes("ahg") && !key.includes("mahg")) return value * 1000;
  return value;
}

function scaledCycValue(row, columnName) {
  if (!columnName) return null;
  return scaleCycCapacity(numberValue(row[columnName]), columnName);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function fetchJsonWithTimeout(url, options = {}, timeoutMs = FILE_INSPECT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    const text = await res.text();
    let body = {};
    if (text) {
      try {
        body = JSON.parse(text);
      } catch (_) {
        body = { error: text };
      }
    }
    return { res, body };
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("파일 분석 시간이 너무 오래 걸려 중단했습니다. 큰 XLS 파일이면 Excel에서 .xlsx로 다시 저장한 뒤 넣어주세요.");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function inspectFileUpload(file) {
  return fetchJsonWithTimeout("/api/inspect-upload", {
    method: "POST",
    headers: authHeaders({
      "Content-Type": "application/octet-stream",
      "X-Filename": encodeURIComponent(file.name),
    }),
    body: file,
  });
}

async function inspectSelectedFile() {
  const file = $("smartFile").files[0];
  if (!file) return setStatus("먼저 파일을 선택하세요.");
  const token = ++state.inspectToken;
  const inspectButton = $("inspectFile");
  if (inspectButton) {
    inspectButton.disabled = true;
    inspectButton.textContent = "파일 분석 중...";
  }
  setStatus("파일 분석 중...");
  setBusy(true, "엑셀/CSV 파일을 읽고 데이터 종류를 추정하고 있습니다.");
  try {
    const { res, body } = await inspectFileUpload(file);
    if (token !== state.inspectToken) return;
    if (!res.ok) {
      setStatus("파일 불러오기 실패");
      setAnalysisMessage(body.error || "파일을 불러오거나 분석하지 못했습니다.", "파일 불러오기 실패");
      return;
    }
    state.analysis = body;
    renderAnalysis();
    setStatus(`${body.detection.type.toUpperCase()} 추정`);
  } catch (error) {
    if (token !== state.inspectToken) return;
    setStatus("파일 불러오기 실패");
    setAnalysisMessage(`파일을 불러오는 중 오류가 발생했습니다: ${error.message}`, "파일 불러오기 실패");
  } finally {
    if (token === state.inspectToken) setBusy(false);
    if (inspectButton) {
      inspectButton.disabled = false;
      inspectButton.textContent = "파일 분석";
    }
  }
}

async function inspectManualFile() {
  const file = $("manualFile")?.files?.[0];
  if (!file) return setStatus("먼저 매뉴얼 엑셀 파일을 선택하세요.");
  setBusy(true, "매뉴얼 엑셀에서 전류와 로딩 정보를 읽고 있습니다.");
  try {
    const { res, body } = await fetchJsonWithTimeout("/api/inspect-manual", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ filename: file.name, contentBase64: await fileToBase64(file) }),
    });
    if (!res.ok) {
      setStatus(body.error || "매뉴얼 분석 실패");
      return;
    }
    state.manualInfo = body;
    renderExperimentInfo(state.datasets.find((x) => x.id === state.selectedId));
    setStatus("매뉴얼 실험 정보 분석 완료");
    activateView("experimentInfo");
  } catch (error) {
    setStatus(`매뉴얼 분석 실패: ${error.message}`);
  } finally {
    setBusy(false);
  }
}

function isBadText(text) {
  const s = String(text || "");
  if (!s.trim()) return true;
  return /�|ì|ë|ê|í|Ã|Â|愿|由|鄭|怨|中|먯|븘|덈|뒿|쨌|좎|놁|/.test(s);
}

function renderValidationSummary(validation, quality = {}) {
  if (!validation) return "";
  const notes = Array.isArray(validation.notes) ? validation.notes : [];
  const warnings = Array.isArray(validation.warnings) ? validation.warnings : [];
  const stats = validation.stats || {};
  const chips = [
    stats.rowCount ? `${stats.rowCount} rows` : "",
    Number.isFinite(stats.cycleMin) && Number.isFinite(stats.cycleMax) ? `cycle ${stats.cycleMin}-${stats.cycleMax}` : "",
    Number.isFinite(stats.capacityMin) && Number.isFinite(stats.capacityMax) ? `${fmt(stats.capacityMin, 3)}-${fmt(stats.capacityMax, 3)} mAh g-1` : "",
  ].filter(Boolean).map((item) => `<span>${escapeXml(item)}</span>`).join("");
  const noteHtml = notes.slice(0, 4).map((item) => `<li>${escapeXml(item)}</li>`).join("");
  const warningHtml = warnings.slice(0, 4).map((item) => `<li>${escapeXml(item)}</li>`).join("");
  const qualityCounts = quality?.counts || {};
  const qualityNote = quality?.status === "review"
    ? `<p class="qualityReview">${Number(qualityCounts.review || 0)}개 행은 검토 후 분석에 포함할 수 있습니다.</p>`
    : quality?.status === "ok"
      ? `<p class="qualityOk">표준 단위와 범위 기준의 기본 품질 검토를 통과했습니다.</p>`
      : "";
  return `
    <div class="validationSummary ${warnings.length ? "hasWarning" : "isOk"}">
      <div class="validationHead">
        <strong>${warnings.length ? "데이터 검토 필요" : "데이터 검토 완료"}</strong>
        <div class="validationChips">${chips}</div>
      </div>
      ${noteHtml ? `<ul>${noteHtml}</ul>` : ""}
      ${warningHtml ? `<ul class="validationWarnings">${warningHtml}</ul>` : ""}
      ${qualityNote}
    </div>`;
}

function displayUserName(d) {
  const name = d?.ownerName;
  return name && !isBadText(name) ? name : (d?.ownerId || "admin");
}

function activateView(viewName, moduleName = state.activeFigureModule) {
  document.querySelectorAll(".tab").forEach((x) => {
    const sameView = x.dataset.view === viewName;
    const sameModule = !x.dataset.module || x.dataset.module === moduleName;
    x.classList.toggle("active", sameView && sameModule);
  });
  document.querySelectorAll(".menuTrigger").forEach((x) => {
    const moduleActive = viewName === "figure" && x.dataset.module === moduleName;
    const viewActive = x.dataset.view === viewName;
    x.classList.toggle("active", moduleActive || viewActive);
  });
  document.querySelectorAll(".view").forEach((x) => x.classList.remove("active"));
  const view = $(`${viewName}View`);
  if (view) view.classList.add("active");
  const wideOnly = viewName === "electrodeCalc" || viewName === "savedFigures" || viewName === "search" || viewName === "aiSummary" || viewName === "analysisLab" || viewName === "organization" || viewName === "feedbackAdmin" || viewName === "users";
  $("dataWorkspace")?.classList.toggle("calcOnly", wideOnly);
  $("workspaceToolbar")?.classList.toggle("hidden", viewName !== "figure");
}

function renderAnalysis() {
  const panel = $("analysisPanel");
  const createBtn = $("createFigure");
  const a = state.analysis;
  if (!a) {
    panel.classList.add("hidden");
    createBtn.classList.add("hidden");
    return;
  }
  const typeLabel = { eis: "EIS", cyc: "CYC", cv: "CV", unknown: "알 수 없는" }[a.detection.type] || a.detection.type;
  const shortName = a.filename.length > 42 ? `${a.filename.slice(0, 22)}...${a.filename.slice(-14)}` : a.filename;
  const readableColumns = a.columns.filter((c) => !isBadText(c));
  const badCount = a.columns.length - readableColumns.length;
  const columnPreview = readableColumns.length
    ? readableColumns.slice(0, 12).map((c) => `<span>${escapeXml(c)}</span>`).join("")
    : `<span>컬럼명을 명확히 읽지 못했습니다.</span>`;
  const badNotice = badCount > 0 ? `<p>읽기 어려운 컬럼명 ${badCount}개는 숨겼습니다. 데이터 종류가 틀리면 직접 선택해 주세요.</p>` : "";
  const eisColumnGuide = a.detection.type === "eis" ? `
    <div class="eisColumnGuide">
      <strong>EIS 열 안내</strong>
      <ul>
        <li><code>sweep</code>: 반복 측정 회차, <code>point</code>: 회차 안의 측정 순서입니다.</li>
        <li><code>frequency</code>: 인가한 교류 주파수(Hz)입니다.</li>
        <li><code>zreal</code>: 임피던스의 실수부 Z'(ohm), <code>zimag</code>: 허수부 Z''(ohm)입니다. Nyquist 그래프는 관례상 <code>-Z''</code>를 세로축에 표시합니다.</li>
        <li><code>mag</code>: 임피던스 크기 |Z|(ohm), <code>phase</code>: 위상각(degree)입니다.</li>
      </ul>
      <p>피겨 생성에는 주로 frequency, zreal, zimag를 사용합니다. 나머지 열은 측정 순서 확인과 Bode 그래프에 함께 쓰입니다.</p>
    </div>` : "";
  const isUnknown = a.detection.type === "unknown" || a.detection.confidence < 0.35;
  const heading = isUnknown
    ? "데이터 종류를 자동으로 판단하지 못했습니다."
    : `${typeLabel} 데이터로 보입니다. 맞나요?`;
  const confirmChoice = isUnknown
    ? ""
    : `<label><input type="radio" name="detectedType" value="${a.detection.type}" checked /> 네, ${typeLabel} 데이터가 맞습니다.</label>`;
  panel.classList.remove("hidden");
  createBtn.classList.toggle("hidden", isUnknown);
  panel.innerHTML = `
    <h3>${heading}</h3>
    <p title="${escapeAttr(a.filename)}">${escapeXml(shortName)} · ${a.sheetName ? `sheet ${escapeXml(a.sheetName)} · ` : ""}${a.rowCount} rows · confidence ${(a.detection.confidence * 100).toFixed(0)}%</p>
    <div class="columnPreview">${columnPreview}</div>
    ${eisColumnGuide}
    ${renderValidationSummary(a.validation, a.quality)}
    ${badNotice}
    <div class="typeSelect">
      ${confirmChoice}
      <label><input type="radio" name="detectedType" value="manual" ${isUnknown ? "checked" : ""} /> ${isUnknown ? "데이터 종류를 직접 선택하겠습니다." : "아니오, 직접 선택하겠습니다."}</label>
      <select id="manualType" ${isUnknown ? "" : "disabled"}>
        <option value="">데이터 종류 선택</option>
        <option value="eis">EIS</option>
        <option value="cyc">CYC</option>
        <option value="cv">CV</option>
        <option value="unknown">목록에 없는 데이터</option>
      </select>
    </div>
    <h3 id="figureQuestion">${isUnknown ? "먼저 데이터 종류를 선택해 주세요." : "어떤 피겨를 만들어 드릴까요?"}</h3>
    <div class="choiceGrid" id="figureChoices"></div>
  `;
  for (const radio of panel.querySelectorAll("input[name='detectedType']")) {
    radio.addEventListener("change", updateFigureChoices);
  }
  $("manualType").addEventListener("change", updateFigureChoices);
  updateFigureChoices();
}

function selectedType() {
  const checked = document.querySelector("input[name='detectedType']:checked");
  if (!checked) return state.analysis?.detection.type || "unknown";
  return checked.value === "manual" ? $("manualType").value : checked.value;
}

function collectCellForm() {
  const fd = new FormData($("datasetForm"));
  const cell = Object.fromEntries(["date", "cellId", "sampleName", "material", "electrolyte", "condition", "notes"].map((k) => [k, fd.get(k) || ""]));
  if (!cell.date) {
    cell.date = todayLocal();
    const form = $("datasetForm");
    if (form?.elements.date) form.elements.date.value = cell.date;
  }
  return cell;
}

function fillCellForm(d) {
  const form = $("datasetForm");
  if (!form || !d) return;
  const cell = d.cell || {};
  for (const key of ["date", "cellId", "sampleName", "material", "electrolyte", "condition", "notes"]) {
    if (form.elements[key]) form.elements[key].value = cell[key] || "";
  }
  selectHierarchyForDataset(d);
}

function updateSelectedFileName() {
  const file = $("smartFile")?.files?.[0];
  const label = $("selectedFileName");
  if (label) label.textContent = file?.name || "선택된 파일 없음";
}

function resetAnalysisForNewFile() {
  updateSelectedFileName();
  state.inspectToken += 1;
  state.analysis = null;
  state.selectedId = null;
  state.selectedAnnotation = null;
  setBusy(false);
  renderAnalysis();
  renderSelect();
  renderCurrent();
  setStatus("파일 선택 완료 - 파일 분석을 눌러주세요.");
}

function updateFigureChoices() {
  const manual = document.querySelector("input[name='detectedType'][value='manual']")?.checked;
  $("manualType").disabled = !manual;
  const type = selectedType();
  const question = $("figureQuestion");
  const createBtn = $("createFigure");
  if (!type || type === "unknown") {
    $("figureChoices").innerHTML = `<p>현재 지원하지 않는 데이터입니다. 어떤 데이터인지 알려주시면 메뉴와 피겨를 추가하겠습니다.</p>`;
    if (question) question.textContent = type === "unknown" ? "지원 목록에 없는 데이터입니다." : "먼저 데이터 종류를 선택해 주세요.";
    if (createBtn) createBtn.classList.add("hidden");
    return;
  }
  if (question) question.textContent = "어떤 피겨를 만들어 드릴까요?";
  if (createBtn) createBtn.classList.remove("hidden");
  const options = {
    eis: [["eis-combined", "Nyquist + Bode 통합 피겨"], ["nyquist", "Nyquist plot"], ["bode", "Bode magnitude/phase"]],
    cyc: [["cycling-performance", "셀 성능 테스트: capacity/efficiency vs cycle"], ["voltage-profile", "전압 프로파일: voltage vs capacity/time"], ["cyc-combined", "성능 + 전압 프로파일 통합 피겨"]],
    cv: [["cv-curve", "CV curve: current vs voltage"], ["cv-comparison", "Scan rate 비교 피겨"]],
    unknown: [["table-preview", "표 형태로 미리보기"]],
  }[type] || [["table-preview", "표 형태로 미리보기"]];
  $("figureChoices").innerHTML = options.map(([id, label], idx) => `<label><input type="radio" name="figureKind" value="${id}" ${idx === 0 ? "checked" : ""}/> ${label}</label>`).join("");
}

async function createSmartFigure() {
  if (!state.analysis) return setStatus("먼저 파일을 분석하세요.");
  setBusy(true, "선택한 데이터로 피겨를 만들고 있습니다.");
  try {
    const dataType = selectedType();
    if (!dataType) {
      setStatus("먼저 데이터 종류를 선택하세요.");
      setAnalysisMessage("먼저 데이터 종류를 선택해 주세요.");
      return;
    }
    if (dataType === "unknown") {
      setStatus("없는 데이터 형식입니다.");
      setAnalysisMessage("아직 지원하지 않는 데이터입니다. 어떤 데이터인지 알려주시면 메뉴와 피겨를 추가하겠습니다.");
      return;
    }
    const figureKind = document.querySelector("input[name='figureKind']:checked")?.value || `${dataType}-combined`;
    const rows = canonicalRows(dataType, state.analysis.columns, state.analysis.rows);
    if (!rows.length) {
      setStatus("숫자 컬럼을 찾지 못했습니다.");
      setAnalysisMessage("선택한 데이터 타입에 맞는 숫자 컬럼을 찾지 못했습니다. 다른 데이터 종류를 선택하거나 컬럼명을 확인해 주세요.");
      return;
    }
    const cell = collectCellForm();
    const { res, body: saved } = await fetchJsonWithTimeout("/api/datasets", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        cell,
        rows,
        columns: state.analysis.columns,
        sourceName: state.analysis.filename,
        dataType,
        figureKind,
        uploadId: state.analysis.uploadId || "",
        canonicalRows: Array.isArray(state.analysis.canonicalRows) ? state.analysis.canonicalRows : [],
        columnMapping: state.analysis.columnMapping || {},
        quality: state.analysis.quality || {},
        parser: state.analysis.parser || {},
        ...hierarchySelectionPayload(),
      }),
    });
    if (!res.ok) {
      const message = apiErrorMessage(saved, "데이터셋 저장 중 서버 오류가 발생했습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요.");
      setStatus(message);
      setAnalysisMessage(message);
      return;
    }
    state.datasets.unshift(saved);
    await loadHierarchy();
    state.analysis = null;
    renderAnalysis();
    showDatasetImmediately(saved);
    showModule(["cyc", "cv", "eis"].includes(dataType) ? dataType : "figure");
    setStatus(`${dataType.toUpperCase()} 피겨 생성 완료`);
  } catch (error) {
    setStatus("피겨 생성 실패");
    setAnalysisMessage(`피겨 생성 중 오류가 발생했습니다: ${error.message}`);
  } finally {
    setBusy(false);
  }
}

async function loadData() {
  if (!state.user) return;
  const res = await fetch("/api/datasets", { headers: authHeaders() });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "데이터를 불러오지 못했습니다.");
  }
  state.datasets = await res.json();
  applyFilters();
  setStatus(`${state.datasets.length} datasets`);
}

// Project -> Campaign -> Cell is loaded separately from datasets so the same
// experiment structure can be reused when CYC, EIS, and CV files are added.
async function loadHierarchy() {
  if (!state.user) return;
  const res = await fetch("/api/hierarchy", { headers: authHeaders() });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "실험 계층을 불러오지 못했습니다.");
  }
  state.hierarchy = await res.json();
  const current = state.datasets.find((item) => item.id === state.selectedId);
  renderHierarchyControls(current ? {
    projectId: current.projectId || "",
    campaignId: current.campaignId || "",
    cellRecordId: current.cellRecordId || "",
    datasetGroupId: current.datasetGroupId || "",
  } : {});
}

function selectedHierarchyProject() {
  return state.hierarchy.find((item) => item.id === $("projectSelect")?.value) || null;
}

// Organizations are optional: an empty organizationId means a private personal project.
async function loadOrganizations() {
  if (!state.user) return;
  const res = await fetch("/api/organizations", { headers: authHeaders() });
  const body = await res.json().catch(() => ([]));
  if (!res.ok) throw new Error(body.error || "조직 목록을 불러오지 못했습니다.");
  state.organizations = Array.isArray(body) ? body : [];
  if (!state.organizations.some((item) => item.id === state.selectedOrganizationId)) {
    state.selectedOrganizationId = state.organizations[0]?.id || "";
  }
  renderOrganizationSelectors();
  renderOrganizationView();
  if (state.selectedOrganizationId) await loadOrganizationMembers();
}

function selectedOrganization() {
  return state.organizations.find((item) => item.id === state.selectedOrganizationId) || null;
}

function renderOrganizationSelectors() {
  const projectSelect = $("projectOrganizationSelect");
  const organizationSelect = $("organizationSelect");
  const optionMarkup = state.organizations
    .map((item) => `<option value="${escapeAttr(item.id)}">${escapeXml(item.name)} · ${escapeXml(item.myRole || "member")}</option>`)
    .join("");
  if (projectSelect) {
    const previous = projectSelect.value;
    projectSelect.innerHTML = `<option value="">개인 프로젝트 (나만 보기)</option>${optionMarkup}`;
    projectSelect.value = state.organizations.some((item) => item.id === previous) ? previous : "";
  }
  if (organizationSelect) {
    organizationSelect.innerHTML = state.organizations.length
      ? optionMarkup
      : `<option value="">참여 중인 조직이 없습니다</option>`;
    organizationSelect.value = state.selectedOrganizationId;
  }
}

function canManageSelectedOrganization() {
  const role = selectedOrganization()?.myRole || "";
  return state.user?.role === "admin" || role === "owner" || role === "admin";
}

function renderOrganizationView() {
  renderOrganizationSelectors();
  const hint = $("organizationRoleHint");
  const list = $("organizationMembersList");
  const addButton = $("addOrganizationMember");
  const memberId = $("organizationMemberId");
  const memberRole = $("organizationMemberRole");
  const organization = selectedOrganization();
  const canManage = canManageSelectedOrganization();
  if (hint) {
    hint.textContent = organization
      ? `${organization.name} · 내 역할: ${organization.myRole || "member"}`
      : "새 조직을 만들거나, 조직 관리자에게 초대를 요청하세요.";
  }
  for (const element of [addButton, memberId, memberRole]) {
    if (element) element.disabled = !organization || !canManage;
  }
  if (!organization && list) {
    list.innerHTML = `<p class="organizationEmpty">선택된 조직이 없습니다.</p>`;
  } else if (organization && !state.organizationMembers.length && list) {
    list.innerHTML = `<p class="organizationEmpty">멤버 정보를 불러오는 중이거나 등록된 멤버가 없습니다.</p>`;
  } else if (list) {
    list.innerHTML = state.organizationMembers.map((member) => {
      const user = member.user || {};
      const remove = canManage && member.role !== "owner"
        ? `<button type="button" class="smallDanger" data-remove-organization-member="${escapeAttr(user.id)}">제거</button>`
        : "";
      return `<div class="organizationMemberRow"><div><strong>${escapeXml(user.name || user.id)}</strong><span>${escapeXml(user.id)} · ${escapeXml(member.role || "viewer")}</span></div>${remove}</div>`;
    }).join("");
  }
}

async function loadOrganizationMembers() {
  const organization = selectedOrganization();
  if (!organization) {
    state.organizationMembers = [];
    renderOrganizationView();
    return;
  }
  const res = await fetch(`/api/organizations/${encodeURIComponent(organization.id)}/members`, { headers: authHeaders() });
  const body = await res.json().catch(() => ([]));
  if (!res.ok) throw new Error(body.error || "조직 멤버를 불러오지 못했습니다.");
  state.organizationMembers = Array.isArray(body) ? body : [];
  renderOrganizationView();
}

async function createOrganizationFromInput() {
  const input = $("newOrganizationName");
  const name = input?.value.trim() || "";
  if (!name) return setStatus("조직 이름을 입력해주세요.");
  const res = await fetch("/api/organizations", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ name }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return setStatus(body.error || "조직 생성에 실패했습니다.");
  input.value = "";
  state.selectedOrganizationId = body.id;
  await loadOrganizations();
  setStatus(`조직 '${body.name}'을 만들었습니다.`);
}

async function addOrganizationMember() {
  const organization = selectedOrganization();
  const input = $("organizationMemberId");
  const memberUserId = input?.value.trim() || "";
  const role = $("organizationMemberRole")?.value || "researcher";
  if (!organization) return setStatus("먼저 조직을 선택해주세요.");
  if (!memberUserId) return setStatus("회원가입한 사용자 아이디를 입력해주세요.");
  const res = await fetch(`/api/organizations/${encodeURIComponent(organization.id)}/members/${encodeURIComponent(memberUserId)}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ role }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return setStatus(body.error || "멤버 저장에 실패했습니다.");
  input.value = "";
  await loadOrganizationMembers();
  setStatus(`${memberUserId} 계정에 ${role} 역할을 저장했습니다.`);
}

async function removeOrganizationMember(memberUserId) {
  const organization = selectedOrganization();
  if (!organization || !memberUserId) return;
  if (!window.confirm(`${memberUserId} 계정을 조직에서 제거할까요?`)) return;
  const res = await fetch(`/api/organizations/${encodeURIComponent(organization.id)}/members/${encodeURIComponent(memberUserId)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return setStatus(body.error || "멤버 제거에 실패했습니다.");
  await loadOrganizationMembers();
  setStatus(`${memberUserId} 계정을 조직에서 제거했습니다.`);
}

function selectedHierarchyCampaign(project = selectedHierarchyProject()) {
  return project?.campaigns?.find((item) => item.id === $("campaignSelect")?.value) || null;
}

function selectedHierarchyCell(campaign = selectedHierarchyCampaign()) {
  return campaign?.cells?.find((item) => item.id === $("cellRecordSelect")?.value) || null;
}

function selectedHierarchyDatasetGroup(cell = selectedHierarchyCell()) {
  return cell?.datasetGroups?.find((item) => item.id === $("datasetGroupSelect")?.value) || null;
}

function hierarchySelectionPayload() {
  return {
    projectId: $("projectSelect")?.value || "",
    campaignId: $("campaignSelect")?.value || "",
    cellRecordId: $("cellRecordSelect")?.value || "",
    datasetGroupId: $("datasetGroupSelect")?.value || "",
    datasetGroupName: $("newDatasetGroupName")?.value.trim() || "",
  };
}

function hierarchyLabel(dataset) {
  if (!dataset) return "";
  const project = state.hierarchy.find((item) => item.id === dataset.projectId);
  const campaign = project?.campaigns?.find((item) => item.id === dataset.campaignId);
  const cell = campaign?.cells?.find((item) => item.id === dataset.cellRecordId);
  const group = cell?.datasetGroups?.find((item) => item.id === dataset.datasetGroupId);
  return [project?.name, campaign?.name, cell?.cellId || dataset.cell?.cellId, group?.name].filter(Boolean).join(" / ");
}

function renderHierarchyControls(preferred = {}) {
  const projectSelect = $("projectSelect");
  const campaignSelect = $("campaignSelect");
  const cellSelect = $("cellRecordSelect");
  const datasetGroupSelect = $("datasetGroupSelect");
  if (!projectSelect || !campaignSelect || !cellSelect || !datasetGroupSelect) return;

  const previousProject = preferred.projectId ?? projectSelect.value;
  projectSelect.innerHTML = `<option value="">프로젝트를 선택하거나 새로 만드세요</option>` + state.hierarchy
    .map((project) => `<option value="${escapeAttr(project.id)}">${escapeXml(project.name)}</option>`)
    .join("");
  const project = state.hierarchy.find((item) => item.id === previousProject) || state.hierarchy[0] || null;
  projectSelect.value = project?.id || "";

  const previousCampaign = preferred.campaignId ?? campaignSelect.value;
  const campaigns = project?.campaigns || [];
  campaignSelect.innerHTML = `<option value="">실험 배치를 선택하거나 새로 만드세요</option>` + campaigns
    .map((campaign) => `<option value="${escapeAttr(campaign.id)}">${escapeXml(campaign.name)}</option>`)
    .join("");
  const campaign = campaigns.find((item) => item.id === previousCampaign) || campaigns[0] || null;
  campaignSelect.value = campaign?.id || "";

  const previousCell = preferred.cellRecordId ?? cellSelect.value;
  const cells = campaign?.cells || [];
  cellSelect.innerHTML = `<option value="">셀 ID 입력 시 자동으로 새 셀이 등록됩니다</option>` + cells
    .map((cell) => `<option value="${escapeAttr(cell.id)}">${escapeXml(cell.cellId)}${cell.sampleName ? ` · ${escapeXml(cell.sampleName)}` : ""}</option>`)
    .join("");
  cellSelect.value = cells.some((item) => item.id === previousCell) ? previousCell : "";

  const selectedCell = selectedHierarchyCell(campaign);
  const previousDatasetGroup = preferred.datasetGroupId ?? datasetGroupSelect.value;
  const datasetGroups = selectedCell?.datasetGroups || [];
  datasetGroupSelect.innerHTML = `<option value="">새 이름을 입력하거나 기존 Dataset을 선택하세요</option>` + datasetGroups
    .map((group) => `<option value="${escapeAttr(group.id)}">${escapeXml(group.name)}</option>`)
    .join("");
  datasetGroupSelect.value = datasetGroups.some((item) => item.id === previousDatasetGroup) ? previousDatasetGroup : "";

  const path = $("hierarchyPath");
  if (path) {
    const selectedGroup = selectedHierarchyDatasetGroup(selectedCell);
    path.textContent = [project?.name, campaign?.name, selectedCell?.cellId || "새 셀", selectedGroup?.name || "새 Dataset"].filter(Boolean).join("  ›  ") || "프로젝트와 실험 배치를 먼저 만들어주세요.";
  }
}

function selectHierarchyForDataset(dataset) {
  if (!dataset || !state.hierarchy.length) return;
  renderHierarchyControls({
    projectId: dataset.projectId || "",
    campaignId: dataset.campaignId || "",
    cellRecordId: dataset.cellRecordId || "",
    datasetGroupId: dataset.datasetGroupId || "",
  });
}

async function createProjectFromInput() {
  const input = $("newProjectName");
  const name = input?.value.trim() || "";
  if (!name) return setStatus("새 프로젝트 이름을 입력해주세요.");
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ name, organizationId: $("projectOrganizationSelect")?.value || "" }),
  });
  const body = await res.json();
  if (!res.ok) return setStatus(body.error || "프로젝트 생성에 실패했습니다.");
  input.value = "";
  await loadHierarchy();
  renderHierarchyControls({ projectId: body.id });
  setStatus(`프로젝트 '${body.name}'를 만들었습니다.`);
}

async function createCampaignFromInput() {
  const project = selectedHierarchyProject();
  const input = $("newCampaignName");
  const name = input?.value.trim() || "";
  if (!project) return setStatus("먼저 프로젝트를 선택하거나 새로 만들어주세요.");
  if (!name) return setStatus("새 실험 배치 이름을 입력해주세요.");
  const res = await fetch(`/api/projects/${encodeURIComponent(project.id)}/campaigns`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ name }),
  });
  const body = await res.json();
  if (!res.ok) return setStatus(body.error || "실험 배치 생성에 실패했습니다.");
  input.value = "";
  await loadHierarchy();
  renderHierarchyControls({ projectId: project.id, campaignId: body.id });
  setStatus(`실험 배치 '${body.name}'를 만들었습니다.`);
}

async function createDatasetGroupFromInput() {
  const cell = selectedHierarchyCell();
  const input = $("newDatasetGroupName");
  const name = input?.value.trim() || "";
  if (!cell) return setStatus("먼저 기존 셀을 선택하거나, 새 셀은 데이터 저장 시 Dataset 이름과 함께 등록해주세요.");
  if (!name) return setStatus("새 Dataset 이름을 입력해주세요.");
  const res = await fetch(`/api/cells/${encodeURIComponent(cell.id)}/dataset-groups`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ name }),
  });
  const body = await res.json();
  if (!res.ok) return setStatus(body.error || "Dataset 생성에 실패했습니다.");
  input.value = "";
  await loadHierarchy();
  renderHierarchyControls({
    projectId: cell.projectId,
    campaignId: cell.campaignId,
    cellRecordId: cell.id,
    datasetGroupId: body.id,
  });
  setStatus(`Dataset '${body.name}'를 만들었습니다.`);
}

function applyFilters() {
  renderDateOptions();
  const selectedDate = $("savedDateSelect")?.value || "";
  const from = $("fromDate")?.value || "";
  const to = $("toDate")?.value || "";
  const q = ($("query")?.value || "").trim().toLowerCase();
  const type = state.searchType || "all";
  state.filtered = state.datasets.filter((d) => {
    const date = d.cell?.date || "";
    const hay = [d.cell?.cellId, d.cell?.sampleName, d.cell?.material, d.cell?.electrolyte, d.cell?.condition, d.cell?.notes, d.sourceName, d.dataType, hierarchyLabel(d)].join(" ").toLowerCase();
    return (!type || type === "all" || d.dataType === type) && (!selectedDate || date === selectedDate) && (!from || date >= from) && (!to || date <= to) && (!q || hay.includes(q));
  });
  if (!state.filtered.some((d) => d.id === state.selectedId)) state.selectedId = state.filtered[0]?.id || null;
  renderSelect();
  renderSavedList();
  renderSearchResults();
  renderCurrent();
}

function setSearchType(type = "all") {
  state.searchType = ["cyc", "cv", "eis"].includes(type) ? type : "all";
  document.querySelectorAll(".searchType").forEach((btn) => {
    btn.classList.toggle("active", (btn.dataset.searchType || "all") === state.searchType);
  });
}

function clearSearchFilters() {
  if ($("savedDateSelect")) $("savedDateSelect").value = "";
  if ($("fromDate")) $("fromDate").value = "";
  if ($("toDate")) $("toDate").value = "";
  if ($("query")) $("query").value = "";
  setSearchType("all");
  applyFilters();
}

function typeDisplay(type) {
  return { cyc: "CYC", cv: "CV", eis: "EIS", all: "전체" }[type || "all"] || "DATA";
}

function renderSearchResults() {
  const list = $("searchResultList");
  if (!list) return;
  const count = $("searchResultCount");
  const scope = $("searchScopeLabel");
  if (count) count.textContent = `${state.filtered.length}개`;
  if (scope) scope.textContent = typeDisplay(state.searchType);
  document.querySelectorAll(".searchType").forEach((btn) => {
    btn.classList.toggle("active", (btn.dataset.searchType || "all") === (state.searchType || "all"));
  });
  if (!state.filtered.length) {
    list.innerHTML = `
      <div class="searchEmpty">
        <strong>검색 결과가 없습니다.</strong>
        <span>날짜 범위를 넓히거나 소재/셀 ID 검색어를 줄여보세요.</span>
      </div>`;
    return;
  }
  list.innerHTML = state.filtered.map((d) => {
    const cell = d.cell || {};
    const active = d.id === state.selectedId ? " active" : "";
    const title = datasetDisplayName(d);
    const meta = [cell.date || "날짜 없음", typeDisplay(d.dataType), `${d.rows?.length || 0} points`, displayUserName(d)].filter(Boolean).join(" · ");
    const detail = [hierarchyLabel(d), cell.material, cell.sampleName, cell.condition, d.sourceName].filter(Boolean).join(" / ");
    return `
      <article class="searchResultCard${active}">
        <button type="button" class="searchResultOpen" data-dataset-id="${escapeAttr(d.id)}">
          <span class="resultType">${escapeXml(typeDisplay(d.dataType))}</span>
          <strong>${escapeXml(title)}</strong>
          <em>${escapeXml(meta)}</em>
          <p>${escapeXml(detail || "저장된 실험 데이터")}</p>
        </button>
        <div class="searchResultActions">
          <button type="button" data-open-figure="${escapeAttr(d.id)}">피겨 열기</button>
          <button type="button" class="secondaryAction" data-open-saved="${escapeAttr(d.id)}">모음에서 보기</button>
        </div>
      </article>`;
  }).join("");
  for (const btn of list.querySelectorAll("[data-dataset-id], [data-open-figure]")) {
    btn.addEventListener("click", () => {
      const id = btn.dataset.datasetId || btn.dataset.openFigure;
      const item = state.datasets.find((d) => d.id === id);
      state.selectedId = id;
      state.selectedAnnotation = null;
      if (item?.dataType && ["cyc", "cv", "eis"].includes(item.dataType)) state.activeFigureModule = item.dataType;
      renderSelect();
      renderSavedList();
      renderSearchResults();
      renderCurrent();
      activateView("figure", state.activeFigureModule);
      setStatus("검색 결과를 피겨로 열었습니다.");
    });
  }
  for (const btn of list.querySelectorAll("[data-open-saved]")) {
    btn.addEventListener("click", () => {
      state.selectedId = btn.dataset.openSaved;
      state.selectedAnnotation = null;
      renderSelect();
      renderSavedList();
      renderSearchResults();
      renderCurrent();
      activateView("savedFigures");
      setStatus("검색 결과를 피겨 모음에서 열었습니다.");
    });
  }
}

function renderDateOptions() {
  const sel = $("savedDateSelect");
  if (!sel) return;
  const current = sel.value;
  const dates = [...new Set(state.datasets.map((d) => d.cell?.date).filter(Boolean))].sort().reverse();
  sel.innerHTML = `<option value="">전체 날짜</option>` + dates.map((date) => `<option value="${escapeAttr(date)}">${escapeXml(date)}</option>`).join("");
  sel.value = dates.includes(current) ? current : "";
}

function showDatasetImmediately(d) {
  if (!d) return;
  if ($("fromDate")) $("fromDate").value = "";
  if ($("toDate")) $("toDate").value = "";
  if ($("savedDateSelect")) $("savedDateSelect").value = "";
  if ($("query")) $("query").value = "";
  setSearchType("all");
  state.selectedId = d.id;
  state.filtered = state.datasets;
  renderSelect();
  renderSavedList();
  renderSearchResults();
  renderCurrent();
}

function renderSelect() {
  const sel = $("datasetSelect");
  if (!sel) return;
  sel.innerHTML = "";
  if (!state.filtered.length) {
    sel.innerHTML = `<option>검색 결과 없음</option>`;
    return;
  }
  for (const d of state.filtered) {
    const opt = document.createElement("option");
    opt.value = d.id;
    const owner = state.user?.role === "admin" ? ` | ${displayUserName(d)}` : "";
    opt.textContent = `${d.cell.date || "no date"} | ${d.cell.cellId || d.id} | ${d.cell.sampleName || d.cell.material || "EIS"}${owner}`;
    opt.selected = d.id === state.selectedId;
    sel.appendChild(opt);
  }
}

function datasetDisplayName(d) {
  const cell = d.cell || {};
  return cell.cellId || cell.sampleName || cell.material || `${String(d.dataType || "DATA").toUpperCase()} ${String(d.id || "").split("-").pop()}`;
}

function renderSavedList() {
  const list = $("savedList");
  const count = $("savedCount");
  if (!list) return;
  document.querySelectorAll("#savedCount").forEach((el) => { el.textContent = `${state.filtered.length}개`; });
  document.querySelectorAll("#savedCount").forEach((el) => { el.textContent = `${state.filtered.length}개`; });
  if (count) count.textContent = `${state.filtered.length}개`;
  if (!state.filtered.length) {
    list.innerHTML = `<p class="emptySaved">저장된 데이터가 없습니다.</p>`;
    return;
  }
  list.innerHTML = state.filtered.map((d) => {
    const cell = d.cell || {};
    const active = d.id === state.selectedId ? " active" : "";
    const title = datasetDisplayName(d);
    const sub = [d.dataType?.toUpperCase(), `${d.rows?.length || 0} points`, d.ownerName || d.ownerId].filter(Boolean).join(" · ");
    return `
      <button type="button" class="savedItem${active}" data-dataset-id="${escapeAttr(d.id)}">
        <strong>${escapeXml(title)}</strong>
        <span>${escapeXml(cell.date || "날짜 없음")} · ${escapeXml(sub)}</span>
        <em>${escapeXml(d.sourceName || d.id)}</em>
      </button>`;
  }).join("");
  for (const btn of list.querySelectorAll(".savedItem")) {
    btn.addEventListener("click", () => {
      state.selectedId = btn.dataset.datasetId;
      state.selectedAnnotation = null;
      renderSelect();
      renderSavedList();
      renderCurrent();
      setStatus("저장된 데이터를 불러왔습니다.");
    });
  }
}

function figureLabel(d) {
  const labels = {
    "cycling-performance": "용량 유지율 피겨",
    "voltage-profile": "전압 프로파일",
    "cyc-combined": "CYC 통합 피겨",
    "nyquist": "Nyquist 피겨",
    "bode": "Bode 피겨",
    "eis-combined": "EIS 통합 피겨",
    "cv-curve": "CV 피겨",
    "cv-comparison": "CV 비교 피겨",
    "table-preview": "표 미리보기",
  };
  return labels[d.figureKind] || `${(d.dataType || "data").toUpperCase()} 피겨`;
}

function figureThumb(d) {
  const rows = (d.rows || []).filter(Boolean);
  const type = String(d.dataType || "").toLowerCase();
  if (!rows.length) {
    return `<svg class="savedThumb" viewBox="0 0 150 72" aria-hidden="true"><rect width="150" height="72" fill="#f8fafc"/><text x="75" y="39" text-anchor="middle" font-size="10" fill="#64748b">No data</text></svg>`;
  }
  let pts = [];
  if (type === "cyc") {
    pts = rows
      .map((r, i) => ({ x: Number.isFinite(r.cycle) ? r.cycle : i + 1, y: Number.isFinite(r.capacity) ? r.capacity : NaN }))
      .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  } else if (type === "eis") {
    pts = rows
      .map((r) => ({ x: r.zreal, y: Math.abs(r.zimag) }))
      .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  } else {
    const keys = Object.keys(rows[0] || {}).filter((k) => Number.isFinite(rows[0][k]));
    const yKey = keys.find((k) => !/index|cycle/i.test(k)) || keys[0];
    pts = rows
      .map((r, i) => ({ x: i + 1, y: Number(r[yKey]) }))
      .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  }
  if (pts.length < 2) {
    return `<svg class="savedThumb" viewBox="0 0 150 72" aria-hidden="true"><rect width="150" height="72" fill="#f8fafc"/><text x="75" y="39" text-anchor="middle" font-size="10" fill="#64748b">${escapeXml(type.toUpperCase() || "FIG")}</text></svg>`;
  }
  const sampleEvery = Math.max(1, Math.floor(pts.length / 36));
  pts = pts.filter((_, i) => i % sampleEvery === 0 || i === pts.length - 1);
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const xmin = Math.min(...xs);
  const xmax = Math.max(...xs);
  const ymin = Math.min(...ys);
  const ymax = Math.max(...ys);
  const sx = (x) => 12 + ((x - xmin) / (xmax - xmin || 1)) * 126;
  const sy = (y) => 58 - ((y - ymin) / (ymax - ymin || 1)) * 44;
  const path = pts.map((p, i) => `${i ? "L" : "M"}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(" ");
  const circles = pts.slice(0, 18).map((p) => `<circle cx="${sx(p.x).toFixed(1)}" cy="${sy(p.y).toFixed(1)}" r="1.8"/>`).join("");
  return `
    <svg class="savedThumb" viewBox="0 0 150 72" aria-hidden="true">
      <rect width="150" height="72" fill="#ffffff"/>
      <line x1="12" y1="58" x2="138" y2="58" stroke="#111827" stroke-width="1"/>
      <line x1="12" y1="14" x2="12" y2="58" stroke="#111827" stroke-width="1"/>
      <path d="${path}" fill="none" stroke="#ec7dbf" stroke-width="2"/>
      <g fill="#fff" stroke="#ec7dbf" stroke-width="1.3">${circles}</g>
    </svg>`;
}

function renderSavedList() {
  const list = $("savedList");
  const count = $("savedCount");
  if (!list) return;
  if (count) count.textContent = `${state.filtered.length}개`;
  if (!state.filtered.length) {
    list.innerHTML = `<p class="emptySaved">저장된 피겨가 없습니다.</p>`;
    return;
  }
  list.innerHTML = state.filtered.map((d) => {
    const cell = d.cell || {};
    const active = d.id === state.selectedId ? " active" : "";
    const title = datasetDisplayName(d);
    const sub = [figureLabel(d), `${d.rows?.length || 0} points`, hierarchyLabel(d), displayUserName(d)].filter(Boolean).join(" · ");
    return `
      <article class="savedItem${active}" data-dataset-id="${escapeAttr(d.id)}">
        <label class="compareCheck${String(d.dataType || "").toLowerCase() === "cyc" ? "" : " disabled"}" title="${String(d.dataType || "").toLowerCase() === "cyc" ? "CYC 비교 선택" : "CYC 피겨만 비교할 수 있습니다."}">
          <input type="checkbox" data-compare-id="${escapeAttr(d.id)}"${state.compareIds.includes(d.id) ? " checked" : ""}${String(d.dataType || "").toLowerCase() === "cyc" ? "" : " disabled"} />
          <span>비교</span>
        </label>
        <button type="button" class="savedOpen" data-dataset-id="${escapeAttr(d.id)}" title="피겨 열기">
          ${figureThumb(d)}
          <span class="savedInfo">
            <strong>${escapeXml(title)}</strong>
            <span>${escapeXml(cell.date || "날짜 없음")} · ${escapeXml(sub)}</span>
            <em>${escapeXml(d.sourceName || d.id)}</em>
          </span>
        </button>
        <button type="button" class="savedDelete" data-dataset-id="${escapeAttr(d.id)}" title="저장된 피겨 삭제">×</button>
      </article>`;
  }).join("");
  for (const btn of list.querySelectorAll(".savedOpen")) {
    btn.addEventListener("click", () => {
      state.selectedId = btn.dataset.datasetId;
      state.selectedAnnotation = null;
      renderSelect();
      renderSavedList();
      renderCurrent();
      state.activeFigureModule = state.datasets.find((d) => d.id === state.selectedId)?.dataType || state.activeFigureModule;
      activateView("figure", state.activeFigureModule);
      setStatus("저장된 피겨를 불러왔습니다.");
    });
  }
  for (const btn of list.querySelectorAll(".savedDelete")) {
    btn.addEventListener("click", (event) => deleteSavedFigure(btn.dataset.datasetId, event));
  }
  for (const input of list.querySelectorAll("input[data-compare-id]")) {
    input.addEventListener("click", (event) => event.stopPropagation());
    input.addEventListener("change", () => toggleCompareSelection(input.dataset.compareId, input.checked));
  }
}

function toggleCompareSelection(id, checked) {
  if (!id) return;
  const target = state.datasets.find((d) => d.id === id);
  if (target?.dataType !== "cyc") {
    setStatus("CYC 피겨만 비교할 수 있습니다.");
    return;
  }
  if (checked && !state.compareIds.includes(id)) state.compareIds.push(id);
  if (!checked) state.compareIds = state.compareIds.filter((x) => x !== id);
  renderAISummary();
  setStatus(`${state.compareIds.length}개 CYC 피겨 선택됨`);
}

function clearCompareSelection() {
  state.compareIds = [];
  renderSavedList();
  renderAISummary();
  const preview = $("comparisonPreview");
  if (preview) {
    preview.classList.add("hidden");
    preview.innerHTML = "";
  }
  setStatus("비교 선택을 해제했습니다.");
}

const comparisonPalette = ["#0f766e", "#ef476f", "#3b82f6", "#f59e0b", "#7c3aed", "#64748b", "#10b981", "#dc2626"];

function comparisonColor(id, idx) {
  const fallback = comparisonPalette[idx % comparisonPalette.length];
  const color = normalizeHexColor(state.comparisonColors[id] || fallback, fallback);
  state.comparisonColors[id] = color;
  return color;
}

function comparisonRowsFromSeries(series) {
  return series.flatMap((s) => s.points.map((p) => ({
    sourceId: s.d?.id || s.sourceId || s.name,
    sourceName: s.name,
    cycle: p.x,
    capacity: p.y,
  })));
}

function seriesFromComparisonDataset(d) {
  const colors = d?.figureEdits?.comparisonColors || {};
  const groups = new Map();
  for (const row of d?.rows || []) {
    const key = row.sourceId || row.sourceName || "series";
    if (!groups.has(key)) groups.set(key, { sourceId: key, name: row.sourceName || key, points: [] });
    if (Number.isFinite(row.cycle) && Number.isFinite(row.capacity)) groups.get(key).points.push({ x: row.cycle, y: row.capacity });
  }
  return [...groups.values()].map((s, idx) => ({
    ...s,
    points: s.points.sort((a, b) => a.x - b.x),
    color: normalizeHexColor(colors[s.sourceId] || comparisonPalette[idx % comparisonPalette.length]),
  }));
}

function renderComparisonSvg(series, colorMap = {}, svgId = "comparisonFigure") {
  const normalized = series.map((s, idx) => ({
    ...s,
    color: normalizeHexColor(colorMap[s.d?.id || s.sourceId || s.name] || s.color || comparisonPalette[idx % comparisonPalette.length]),
  })).filter((s) => s.points?.length);
  const allPoints = normalized.flatMap((s) => s.points);
  const maxCycle = Math.max(...allPoints.map((p) => p.x));
  const xTickMax = Math.max(5, Math.ceil(maxCycle / 5) * 5);
  const maxCap = Math.max(...allPoints.map((p) => p.y), 1);
  const yMax = maxCap <= 180 ? 180 : Math.ceil(maxCap * 1.05 / 20) * 20;
  const svgW = 840, svgH = 520;
  const plot = { x: 82, y: 64, w: 560, h: 340 };
  const sx = makeScale([0, xTickMax], [plot.x, plot.x + plot.w]);
  const sy = makeScale([0, yMax], [plot.y + plot.h, plot.y]);
  const xTicks = Array.from({ length: Math.floor(xTickMax / 5) + 1 }, (_, i) => i * 5);
  const yStep = yMax <= 200 ? 20 : Math.max(20, Math.ceil(yMax / 6 / 20) * 20);
  const yTicks = Array.from({ length: Math.floor(yMax / yStep) + 1 }, (_, i) => i * yStep);
  const paths = normalized.map((s) => {
    const path = linePath(s.points, sx, sy);
    const pts = s.points.map((p) => `<circle cx="${sx(p.x).toFixed(2)}" cy="${sy(p.y).toFixed(2)}" r="3.7"/>`).join("");
    return `<path d="${path}" fill="none" stroke="${s.color}" stroke-width="2"/><g fill="#fff" stroke="${s.color}" stroke-width="1.6">${pts}</g>`;
  }).join("");
  const legend = normalized.map((s, idx) => {
    const y = plot.y + 18 + idx * 24;
    return `<g><circle cx="${plot.x + plot.w + 38}" cy="${y}" r="4" fill="#fff" stroke="${s.color}" stroke-width="1.8"/><text x="${plot.x + plot.w + 50}" y="${y + 4}" class="cmpLegend">${escapeXml(s.name)}</text></g>`;
  }).join("");
  return `
    <svg id="${svgId}" viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .cmpAxis{stroke:#111;stroke-width:1.2;shape-rendering:crispEdges}.cmpGrid{stroke:#e8edf2;stroke-width:.7}
        .cmpTick{font:13px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111}.cmpLabel{font:15px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111}
        .cmpTitle{font:700 18px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111}.cmpLegend{font:12px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111}
      </style>
      <rect width="${svgW}" height="${svgH}" fill="#fff"/>
      <text x="${plot.x}" y="34" class="cmpTitle">Discharge capacity comparison</text>
      <rect x="${plot.x}" y="${plot.y}" width="${plot.w}" height="${plot.h}" fill="none" class="cmpAxis"/>
      ${xTicks.map((v) => `<line x1="${sx(v)}" x2="${sx(v)}" y1="${plot.y + plot.h}" y2="${plot.y + plot.h - 8}" class="cmpAxis"/><text x="${sx(v)}" y="${plot.y + plot.h + 25}" text-anchor="middle" class="cmpTick">${v}</text>`).join("")}
      ${yTicks.map((v) => `<line x1="${plot.x}" x2="${plot.x + plot.w}" y1="${sy(v)}" y2="${sy(v)}" class="cmpGrid"/><line x1="${plot.x}" x2="${plot.x + 8}" y1="${sy(v)}" y2="${sy(v)}" class="cmpAxis"/><text x="${plot.x - 12}" y="${sy(v) + 4}" text-anchor="end" class="cmpTick">${v}</text>`).join("")}
      ${paths}
      <text x="${plot.x + plot.w / 2}" y="${plot.y + plot.h + 58}" text-anchor="middle" class="cmpLabel">Cycle number</text>
      <text transform="translate(${plot.x - 56},${plot.y + plot.h / 2}) rotate(-90)" text-anchor="middle" class="cmpLabel">Specific capacity (mAh g-1)</text>
      ${legend}
    </svg>`;
}

function renderCycComparison() {
  const preview = $("comparisonPreview");
  if (!preview) return;
  const datasets = state.compareIds
    .map((id) => state.datasets.find((d) => d.id === id))
    .filter((d) => d?.dataType === "cyc")
    .slice(0, 8);
  if (datasets.length < 2) {
    preview.classList.remove("hidden");
    preview.innerHTML = `<p class="emptySaved">비교하려면 CYC 피겨를 2개 이상 선택하세요.</p>`;
    setStatus("CYC 피겨를 2개 이상 선택하세요.");
    return;
  }
  const series = datasets.map((d) => ({
    d,
    name: datasetDisplayName(d),
    points: dischargeSeries((d.rows || []).filter((r) => Number.isFinite(r.cycle)).sort((a, b) => a.cycle - b.cycle)),
  })).filter((s) => s.points.length);
  if (series.length < 2) {
    preview.classList.remove("hidden");
    preview.innerHTML = `<p class="emptySaved">선택한 CYC 피겨에서 비교 가능한 방전용량을 찾지 못했습니다.</p>`;
    setStatus("비교 가능한 CYC 데이터가 부족합니다.");
    return;
  }
  const colors = ["#0f766e", "#ef476f", "#3b82f6", "#f59e0b", "#7c3aed", "#64748b", "#10b981", "#dc2626"];
  const allPoints = series.flatMap((s) => s.points);
  const maxCycle = Math.max(...allPoints.map((p) => p.x));
  const xTickMax = Math.max(5, Math.ceil(maxCycle / 5) * 5);
  const maxCap = Math.max(...allPoints.map((p) => p.y), 1);
  const yMax = maxCap <= 180 ? 180 : Math.ceil(maxCap * 1.05 / 20) * 20;
  const svgW = 840, svgH = 520;
  const plot = { x: 82, y: 64, w: 560, h: 340 };
  const sx = makeScale([0, xTickMax], [plot.x, plot.x + plot.w]);
  const sy = makeScale([0, yMax], [plot.y + plot.h, plot.y]);
  const xTicks = Array.from({ length: Math.floor(xTickMax / 5) + 1 }, (_, i) => i * 5);
  const yStep = yMax <= 200 ? 20 : Math.max(20, Math.ceil(yMax / 6 / 20) * 20);
  const yTicks = Array.from({ length: Math.floor(yMax / yStep) + 1 }, (_, i) => i * yStep);
  const paths = series.map((s, idx) => {
    const color = colors[idx % colors.length];
    const path = linePath(s.points, sx, sy);
    const pts = markerPoints(s.points, sx, sy, `cmpPt cmpPt${idx}`, 3.7);
    return `<path d="${path}" fill="none" stroke="${color}" stroke-width="2"/><g fill="#fff" stroke="${color}" stroke-width="1.6">${pts}</g>`;
  }).join("");
  const legend = series.map((s, idx) => {
    const y = plot.y + 18 + idx * 24;
    const color = colors[idx % colors.length];
    return `<g><circle cx="${plot.x + plot.w + 38}" cy="${y}" r="4" fill="#fff" stroke="${color}" stroke-width="1.8"/><text x="${plot.x + plot.w + 50}" y="${y + 4}" class="cmpLegend">${escapeXml(s.name)}</text></g>`;
  }).join("");
  preview.classList.remove("hidden");
  preview.innerHTML = `
    <div class="comparisonTitle">
      <strong>CYC 비교 피겨</strong>
      <span>${series.length}개 피겨 비교</span>
    </div>
    <svg id="comparisonFigure" viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .cmpAxis{stroke:#111;stroke-width:1.2;shape-rendering:crispEdges}.cmpGrid{stroke:#e8edf2;stroke-width:.7}
        .cmpTick{font:13px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111}.cmpLabel{font:15px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111}
        .cmpTitle{font:700 18px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111}.cmpLegend{font:12px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111}
      </style>
      <rect width="${svgW}" height="${svgH}" fill="#fff"/>
      <text x="${plot.x}" y="34" class="cmpTitle">Discharge capacity comparison</text>
      <rect x="${plot.x}" y="${plot.y}" width="${plot.w}" height="${plot.h}" fill="none" class="cmpAxis"/>
      ${xTicks.map((v) => `<line x1="${sx(v)}" x2="${sx(v)}" y1="${plot.y + plot.h}" y2="${plot.y + plot.h - 8}" class="cmpAxis"/><text x="${sx(v)}" y="${plot.y + plot.h + 25}" text-anchor="middle" class="cmpTick">${v}</text>`).join("")}
      ${yTicks.map((v) => `<line x1="${plot.x}" x2="${plot.x + plot.w}" y1="${sy(v)}" y2="${sy(v)}" class="cmpGrid"/><line x1="${plot.x}" x2="${plot.x + 8}" y1="${sy(v)}" y2="${sy(v)}" class="cmpAxis"/><text x="${plot.x - 12}" y="${sy(v) + 4}" text-anchor="end" class="cmpTick">${v}</text>`).join("")}
      ${paths}
      <text x="${plot.x + plot.w / 2}" y="${plot.y + plot.h + 58}" text-anchor="middle" class="cmpLabel">Cycle number</text>
      <text transform="translate(${plot.x - 56},${plot.y + plot.h / 2}) rotate(-90)" text-anchor="middle" class="cmpLabel">Specific capacity (mAh g-1)</text>
      ${legend}
    </svg>`;
  setStatus("CYC 비교 피겨를 만들었습니다.");
}

async function deleteSavedFigure(id, event) {
  if (event) event.stopPropagation();
  const target = state.datasets.find((d) => d.id === id);
  const name = target ? datasetDisplayName(target) : id;
  if (!id || !confirm(`저장된 피겨 "${name}"를 삭제할까요?`)) return;
  const res = await fetch(`/api/datasets/${encodeURIComponent(id)}`, { method: "DELETE", headers: authHeaders() });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    setStatus(body.error || "피겨 삭제 실패");
    return;
  }
  state.datasets = state.datasets.filter((d) => d.id !== id);
  state.filtered = state.filtered.filter((d) => d.id !== id);
  state.compareIds = state.compareIds.filter((x) => x !== id);
  delete state.annotations[id];
  if (state.selectedId === id) state.selectedId = state.filtered[0]?.id || state.datasets[0]?.id || null;
  renderDateOptions();
  renderSelect();
  renderSavedList();
  renderCurrent();
  setStatus("저장된 피겨를 삭제했습니다.");
}

function niceBounds(values) {
  const finite = values.filter((v) => Number.isFinite(v));
  if (!finite.length) return [0, 1];
  const min = Math.min(...finite);
  const max = Math.max(...finite);
  const span = max - min || Math.abs(max) || 1;
  let lower = min - span * 0.08;
  const upper = max + span * 0.08;
  if (min >= 0 && lower < 0) lower = 0;
  return [lower, upper];
}

function makeScale(domain, range) {
  const [d0, d1] = domain, [r0, r1] = range;
  return (v) => r0 + (v - d0) * (r1 - r0) / (d1 - d0 || 1);
}

function logScale(domain, range) {
  const [d0, d1] = domain.map((v) => Math.log10(Math.max(v, 1e-12)));
  const [r0, r1] = range;
  return (v) => r0 + (Math.log10(Math.max(v, 1e-12)) - d0) * (r1 - r0) / (d1 - d0 || 1);
}

function positiveLogBounds(values) {
  const finite = values.filter((v) => Number.isFinite(v) && v > 0);
  if (!finite.length) return [1, 10];
  const min = Math.min(...finite);
  const max = Math.max(...finite);
  const lower = 10 ** Math.floor(Math.log10(min));
  const upper = 10 ** Math.ceil(Math.log10(max));
  return lower === upper ? [lower / 10, upper * 10] : [lower, upper];
}

function logTicks(domain) {
  const start = Math.ceil(Math.log10(Math.max(domain[0], 1e-12)));
  const end = Math.floor(Math.log10(Math.max(domain[1], 1e-12)));
  const ticks = [];
  for (let exp = start; exp <= end; exp += 1) ticks.push(10 ** exp);
  return ticks.length ? ticks : [domain[0], domain[1]];
}

function formatLogTick(value) {
  const exp = Math.round(Math.log10(Math.max(value, 1e-12)));
  return `1e${exp}`;
}

function ticks(min, max, count = 5) {
  const step = (max - min) / (count - 1 || 1);
  return Array.from({ length: count }, (_, i) => min + step * i);
}

function panel({ x, y, w, h, xlabel, ylabel, title, xDomain, yDomain, points, logX = false, logY = false, line = true, extra = "" }) {
  const sx = logX ? logScale(xDomain, [x, x + w]) : makeScale(xDomain, [x, x + w]);
  const sy = logY ? logScale(yDomain, [y + h, y]) : makeScale(yDomain, [y + h, y]);
  const path = points.map((p, i) => `${i ? "L" : "M"}${sx(p.x).toFixed(2)},${sy(p.y).toFixed(2)}`).join(" ");
  const circles = points.map((p) => `<circle cx="${sx(p.x).toFixed(2)}" cy="${sy(p.y).toFixed(2)}" r="3.2"/>`).join("");
  const xt = logX
    ? logTicks(xDomain)
    : ticks(xDomain[0], xDomain[1]);
  const yt = logY ? logTicks(yDomain) : ticks(yDomain[0], yDomain[1]);
  return `
    <g class="plot">
      <text x="${x}" y="${y - 18}" class="panelTitle">${title}</text>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff"/>
      ${xt.map((v) => `<line x1="${sx(v)}" x2="${sx(v)}" y1="${y}" y2="${y + h}" class="grid"/><text x="${sx(v)}" y="${y + h + 23}" class="tick" text-anchor="middle">${logX ? formatLogTick(v) : fmt(v, 3)}</text>`).join("")}
      ${yt.map((v) => `<line x1="${x}" x2="${x + w}" y1="${sy(v)}" y2="${sy(v)}" class="grid"/><text x="${x - 10}" y="${sy(v) + 4}" class="tick" text-anchor="end">${logY ? formatLogTick(v) : fmt(v, 3)}</text>`).join("")}
      <line x1="${x}" x2="${x + w}" y1="${y + h}" y2="${y + h}" class="axis"/>
      <line x1="${x}" x2="${x}" y1="${y}" y2="${y + h}" class="axis"/>
      ${line ? `<path d="${path}" class="seriesLine"/>` : ""}
      <g class="points">${circles}</g>
      ${extra}
      <text x="${x + w / 2}" y="${y + h + 54}" class="label" text-anchor="middle">${xlabel}</text>
      <text transform="translate(${x - 58},${y + h / 2}) rotate(-90)" class="label" text-anchor="middle">${ylabel}</text>
    </g>`;
}

function renderFigure(d) {
  if (!d) {
    $("figureCanvas").innerHTML = "";
    $("figureTitle").textContent = "No dataset";
    $("figureSubtitle").textContent = "데이터를 등록하거나 선택하세요.";
    $("metaGrid").innerHTML = "";
    return;
  }
  if (d.dataType === "cyc-comparison") return renderSavedCycComparison(d);
  if (d.dataType === "cyc") return renderCycFigure(d);
  if (d.dataType === "cv") return renderCvFigure(d);
  const style = currentFigureStyle();
  syncFigureControls(style);
  const svgSize = figureSvgSize(style, "paper");
  const eisPlot = {
    nyquist: {
      x: Math.max(76, Math.round(svgSize.w * 0.085)),
      y: Math.max(110, Math.round(svgSize.h * 0.16)),
      w: Math.max(300, Math.round(svgSize.w * 0.38)),
      h: Math.max(300, Math.round(svgSize.h * 0.52)),
    },
    bodeX: Math.max(430, Math.round(svgSize.w * 0.59)),
    bodeW: Math.max(260, Math.round(svgSize.w * 0.32)),
    bodeH: Math.max(150, Math.round(svgSize.h * 0.23)),
  };
  const rows = [...d.rows]
    .map((r) => {
      const frequency = Number(r.frequency);
      const zreal = Number(r.zreal);
      const zimag = Number(r.zimag);
      return {
        ...r,
        frequency,
        zreal,
        zimag,
        mag: Math.hypot(zreal, zimag),
        phase: Math.atan2(zimag, zreal) * 180 / Math.PI,
      };
    })
    .filter((r) => Number.isFinite(r.frequency) && r.frequency > 0 && Number.isFinite(r.zreal) && Number.isFinite(r.zimag))
    .sort((a, b) => b.frequency - a.frequency);
  const ny = rows.map((r) => ({ x: r.zreal, y: -r.zimag }));
  const bodeMag = rows.map((r) => ({ x: r.frequency, y: r.mag }));
  const bodePhase = rows.map((r) => ({ x: r.frequency, y: -r.phase }));
  const xNy = niceBounds(ny.map((p) => p.x));
  const yNy = niceBounds(ny.map((p) => p.y));
  const fDomain = [Math.min(...rows.map((r) => r.frequency)), Math.max(...rows.map((r) => r.frequency))];
  const magDomain = positiveLogBounds(rows.map((r) => r.mag));
  const phaseDomain = niceBounds(bodePhase.map((p) => p.y));
  const title = `${d.cell.cellId || d.id} ${d.cell.sampleName ? "· " + d.cell.sampleName : ""}`;
  $("figureTitle").textContent = title;
  $("figureSubtitle").textContent = `${d.cell.date || ""} ${d.cell.material ? "· " + d.cell.material : ""} ${d.rows.length} points`;
  $("metaGrid").innerHTML = [
    ["Material", d.cell.material],
    ["Electrolyte", d.cell.electrolyte],
    ["Condition", d.cell.condition],
    ["Owner", d.ownerName || d.ownerId],
    ["Notes", d.cell.notes],
  ].map(([k, v]) => `<div class="metaItem"><strong>${k}</strong>${isBadText(v) ? "-" : (v || "-")}</div>`).join("");
  $("figureCanvas").innerHTML = `
    <svg id="paperFigure" style="--figure-width:${svgSize.w}px" viewBox="0 0 ${svgSize.w} ${svgSize.h}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .axis{stroke:#111827;stroke-width:1.6}.grid{stroke:#e5e7eb;stroke-width:1}
        .seriesLine{fill:none;stroke:#0f766e;stroke-width:2.4}.points circle{fill:#fff;stroke:#0f766e;stroke-width:1.8}
        .label{font:18px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111827}.tick{font:13px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#374151}
        .panelTitle{font:700 20px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111827}.caption{font:15px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#4b5563}
      </style>
      <rect width="${svgSize.w}" height="${svgSize.h}" fill="#ffffff"/>
      <text x="72" y="48" class="panelTitle">${escapeXml(title)}</text>
      <text x="72" y="74" class="caption">${escapeXml(d.cell.date || "")} ${escapeXml(d.cell.condition || "")}</text>
      ${panel({ x: eisPlot.nyquist.x, y: eisPlot.nyquist.y, w: eisPlot.nyquist.w, h: eisPlot.nyquist.h, xlabel: "Z' / Ω", ylabel: "-Z'' / Ω", title: "Nyquist plot", xDomain: xNy, yDomain: yNy, points: ny, line: false })}
      ${panel({ x: eisPlot.bodeX, y: eisPlot.nyquist.y, w: eisPlot.bodeW, h: eisPlot.bodeH, xlabel: "Frequency / Hz", ylabel: "|Z| / Ω", title: "Bode magnitude", xDomain: fDomain, yDomain: magDomain, points: bodeMag, logX: true, logY: true, line: false })}
      ${panel({ x: eisPlot.bodeX, y: Math.round(svgSize.h * 0.58), w: eisPlot.bodeW, h: eisPlot.bodeH, xlabel: "Frequency / Hz", ylabel: "-Phase angle, -θ / deg", title: "Bode phase", xDomain: fDomain, yDomain: phaseDomain, points: bodePhase, logX: true, line: false })}
    </svg>`;
  applyAnnotationsToSvg();
}

function renderCycFigure(d) {
  const style = currentFigureStyle();
  syncFigureControls(style);
  const svgSize = figureSvgSize(style, "paper");
  const rows = d.rows.filter((r) => Number.isFinite(r.cycle));
  const title = `${d.cell.cellId || d.id} ${d.cell.sampleName ? "· " + d.cell.sampleName : ""}`;
  const capRows = rows.filter((r) => Number.isFinite(r.capacity));
  const effRows = rows.filter((r) => Number.isFinite(r.efficiency));
  const voltRows = rows.filter((r) => Number.isFinite(r.voltage) && (Number.isFinite(r.capacity) || Number.isFinite(r.time)));
  $("figureTitle").textContent = title;
  $("figureSubtitle").textContent = `${d.cell.date || ""} · CYC · ${d.rows.length} points`;
  $("metaGrid").innerHTML = [["Material", d.cell.material], ["Condition", d.cell.condition], ["Owner", displayUserName(d)], ["Source", d.sourceName]].map(([k, v]) => `<div class="metaItem"><strong>${k}</strong>${isBadText(v) ? "-" : (v || "-")}</div>`).join("");
  const panels = [];
  if (d.figureKind !== "voltage-profile" && capRows.length) {
    panels.push(panel({ x: 95, y: 130, w: 420, h: 390, xlabel: "Cycle number", ylabel: "Capacity (mAh g-1)", title: "Cycling performance", xDomain: niceBounds(capRows.map((r) => r.cycle)), yDomain: niceBounds(capRows.map((r) => r.capacity)), points: capRows.map((r) => ({ x: r.cycle, y: r.capacity })) }));
  }
  if (d.figureKind !== "voltage-profile" && effRows.length) {
    panels.push(panel({ x: 620, y: 130, w: 380, h: 390, xlabel: "Cycle number", ylabel: "Efficiency (%)", title: "Coulombic efficiency", xDomain: niceBounds(effRows.map((r) => r.cycle)), yDomain: niceBounds(effRows.map((r) => r.efficiency)), points: effRows.map((r) => ({ x: r.cycle, y: r.efficiency })) }));
  }
  if ((d.figureKind === "voltage-profile" || d.figureKind === "cyc-combined" || !panels.length) && voltRows.length) {
    const xKey = voltRows.some((r) => Number.isFinite(r.capacity)) ? "capacity" : "time";
    panels.push(panel({ x: 95, y: panels.length ? 530 : 130, w: panels.length ? 905 : 760, h: panels.length ? 140 : 390, xlabel: xKey === "capacity" ? "Capacity (mAh g-1)" : "Time", ylabel: "Voltage (V)", title: "Voltage profile", xDomain: niceBounds(voltRows.map((r) => r[xKey])), yDomain: niceBounds(voltRows.map((r) => r.voltage)), points: voltRows.map((r) => ({ x: r[xKey], y: r.voltage })) }));
  }
  $("figureCanvas").innerHTML = `
    <svg id="paperFigure" style="--figure-width:${svgSize.w}px" viewBox="0 0 ${svgSize.w} ${svgSize.h}" xmlns="http://www.w3.org/2000/svg">
      <style>.axis{stroke:#111827;stroke-width:1.6}.grid{stroke:#e5e7eb;stroke-width:1}.seriesLine{fill:none;stroke:#0f766e;stroke-width:2.4}.points circle{fill:#fff;stroke:#0f766e;stroke-width:1.8}.label{font:18px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111827}.tick{font:13px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#374151}.panelTitle{font:700 20px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111827}.caption{font:15px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#4b5563}</style>
      <rect width="${svgSize.w}" height="${svgSize.h}" fill="#ffffff"/>
      <text x="72" y="48" class="panelTitle">${escapeXml(title)}</text>
      <text x="72" y="74" class="caption">CYC · ${escapeXml(d.cell.condition || "")}</text>
      ${panels.join("")}
    </svg>`;
}

function cleanDomain(values, pad = 0.08) {
  const nums = values.filter(Number.isFinite);
  if (!nums.length) return [0, 1];
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const span = max - min || Math.max(Math.abs(max), 1);
  return [min - span * pad, max + span * pad];
}

function axisTicks(domain, count = 6) {
  const [a, b] = domain;
  const step = (b - a) / (count - 1 || 1);
  return Array.from({ length: count }, (_, i) => a + step * i);
}

function integerTicks(min, max, count = 6) {
  const start = Math.max(0, Math.floor(min));
  const end = Math.ceil(max);
  if (end <= start) return [start];
  const span = end - start;
  const step = span >= 15 ? 5 : Math.max(1, Math.ceil(span / (count - 1)));
  const out = [];
  for (let v = start; v <= end; v += step) out.push(v);
  if (out[out.length - 1] !== end) out.push(end);
  return out;
}

function linePath(points, sx, sy) {
  return points.map((p, i) => `${i ? "L" : "M"}${sx(p.x).toFixed(2)},${sy(p.y).toFixed(2)}`).join(" ");
}

function markerPoints(points, sx, sy, cls, r = 4) {
  return points.map((p) => `<circle class="${cls}" cx="${sx(p.x).toFixed(2)}" cy="${sy(p.y).toFixed(2)}" r="${r}"/>`).join("");
}

function median(nums) {
  const arr = nums.filter(Number.isFinite).sort((a, b) => a - b);
  if (!arr.length) return NaN;
  const mid = Math.floor(arr.length / 2);
  return arr.length % 2 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
}

function dischargeSeries(rows) {
  const raw = rows
    .filter((r) => Number.isFinite(r.cycle) && Number.isFinite(r.capacity))
    .map((r) => ({ x: r.cycle, y: r.capacity }));
  const medRaw = median(raw.map((p) => Math.abs(p.y)).filter((v) => v > 0));
  const factor = Number.isFinite(medRaw) && medRaw < 10 ? 1000 : 1;
  const scaled = raw.map((p) => ({ x: p.x, y: p.y * factor }));
  const med = median(scaled.map((p) => Math.abs(p.y)).filter((v) => v > 0));
  const upper = Number.isFinite(med) ? Math.max(250, med * 2.2) : Infinity;
  const lower = Number.isFinite(med) ? med * 0.05 : 0;
  return scaled.filter((p) => p.y >= lower && p.y <= upper);
}

function formatCRateLabel(token) {
  const clean = String(token || "")
    .trim()
    .replace(/^rate/i, "")
    .replace(/^re[\s_-]?/i, "re ")
    .replace(/_/g, ".");
  const match = clean.match(/^(re)?\s*([0-9]+(?:\.[0-9]+)?)/i);
  if (!match) return "";
  const value = Number(match[2]);
  if (!Number.isFinite(value) || value <= 0 || value > 10) return "";
  const prefix = match[1] ? "re " : "";
  return `${prefix}${value.toString()} C`;
}

function hasStandardRateLadder(text) {
  const compact = String(text || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/_/g, ".");
  const variants = [
    "0.1,0.33,1,2,3,4,re0.33",
    "0.1,0.33.1.2.3.4.re0.33",
    "0.1.0.33.1.2.3.4.re0.33",
  ];
  if (variants.some((pattern) => compact.includes(pattern))) return true;
  return /0\.1.*0\.33.*(?:^|[,.(-])1(?:[,.)-]|$).*2.*3.*4.*re0\.33/.test(compact);
}

function tokenizeCRateBlock(block) {
  let text = String(block || "").toLowerCase();
  if (hasStandardRateLadder(text)) return defaultRateLabels(7);
  text = text
    .replace(/re\s*0[_-]33/g, "re0.33")
    .replace(/0[_-]33/g, "0.33")
    .replace(/0[_-]1/g, "0.1")
    .replace(/[()[\]{}]/g, " ");
  const matches = text.match(/re\s*[0-9]+(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?/gi) || [];
  const labels = matches.map(formatCRateLabel).filter(Boolean);
  return labels.filter((label, idx) => idx === 0 || label !== labels[idx - 1]);
}

function parseCRateLabels(d) {
  const text = [d.sourceName, d.cell?.condition, d.cell?.notes].filter(Boolean).join(" ");
  if (hasStandardRateLadder(text)) return defaultRateLabels(7);
  const candidates = [];
  const parenBlocks = [...text.matchAll(/\(([^)]*(?:re|0[._-]1|0[._-]33|,\s*1\s*,)[^)]*)\)/gi)].map((m) => m[1]);
  candidates.push(...parenBlocks);

  const commonPattern = /0[._-]1[,_\s-]+0[._-]33[,_\s-]+1[,_\s-]+2[,_\s-]+3[,_\s-]+4[,_\s-]+re\s*0[._-]33/i;
  const common = text.match(commonPattern);
  if (common) candidates.push(common[0]);

  const beforeCyc = text.match(/([0-9reRE.,_\s-]{12,})[._-]*cyc/i);
  if (beforeCyc) candidates.push(beforeCyc[1]);

  for (const block of candidates) {
    let labels = tokenizeCRateBlock(block);
    const start = labels.findIndex((label, idx) => {
      const next = labels[idx + 1];
      return label === "0.1 C" && next === "0.33 C";
    });
    if (start >= 0) labels = labels.slice(start);
    if (labels.length >= 2) return labels.slice(0, 8);
  }
  return [];
}

function defaultRateLabels(count) {
  const base = ["0.1 C", "0.33 C", "1 C", "2 C", "3 C", "4 C", "re 0.33 C"];
  if (count <= base.length) return base.slice(0, count);
  return base;
}

function fiveCycleSegments(labels, minCycle, maxCycle) {
  if (!labels.length) return [];
  const startCycle = Math.max(1, Math.floor(minCycle));
  return labels.map((label, idx) => ({
    label,
    start: startCycle + idx * 5,
    end: startCycle + idx * 5 + 4,
  })).filter((s) => s.start <= maxCycle);
}

function hasRateStepPattern(capPts, segments) {
  if (segments.length < 2 || capPts.length < 8) return false;
  const means = segments.map((s) => {
    const values = capPts.filter((p) => p.x >= s.start && p.x <= s.end).map((p) => p.y);
    return average(values);
  }).filter(Number.isFinite);
  if (means.length < Math.min(3, segments.length)) return false;
  const spread = Math.max(...means) - Math.min(...means);
  const baseline = Math.max(1, Math.max(...means));
  return spread >= 25 || spread / baseline >= 0.18;
}

function inferCRateSegments(d, rows, capPts) {
  const cycles = [...new Set(capPts.map((p) => p.x).filter(Number.isFinite))].sort((a, b) => a - b);
  if (!cycles.length) return [];
  const minCycle = Math.min(...cycles);
  const maxCycle = Math.max(...cycles);
  const parsedLabels = parseCRateLabels(d);
  const parsedSegments = fiveCycleSegments(parsedLabels, minCycle, maxCycle);
  if (hasRateStepPattern(capPts, parsedSegments)) return parsedSegments;

  const currentRows = rows.filter((r) => Number.isFinite(r.cycle) && Number.isFinite(r.current) && r.current !== 0);
  if (currentRows.length >= 2) {
    const sorted = currentRows.sort((a, b) => a.cycle - b.cycle);
    const ref = Math.min(...sorted.map((r) => Math.abs(r.current)).filter((v) => v > 0));
    const groups = [];
    for (const r of sorted) {
      const c = Math.abs(r.current);
      const last = groups[groups.length - 1];
      if (!last || Math.abs(c - last.current) / Math.max(last.current, 1e-12) > 0.08) {
        groups.push({ start: r.cycle, end: r.cycle, current: c });
      } else {
        last.end = r.cycle;
        last.current = (last.current + c) / 2;
      }
    }
    const currents = groups.map((g) => g.current).filter((v) => v > 0);
    const ratio = currents.length ? Math.max(...currents) / Math.min(...currents) : 1;
    const currentSegments = groups
      .filter((g) => g.end >= g.start)
      .map((g, idx) => ({ ...g, label: parsedLabels[idx] || `${fmt(g.current / ref, 2)} C` }));
    if (currentSegments.length >= 2 && currentSegments.length <= 8 && ratio >= 1.3 && hasRateStepPattern(capPts, currentSegments)) {
      return currentSegments;
    }
  }

  return [];
}

function rateAnnotations(segments, ax, xDomain, opts = {}) {
  const [plotMin, plotMax] = xDomain;
  const plotY = opts.plotY ?? 130;
  const plotBottom = opts.plotBottom ?? 520;
  const bandY = opts.bandY ?? 102;
  const bandHeight = opts.bandHeight ?? 24;
  const labelY = opts.labelY ?? 119;
  return segments.map((s, idx) => {
    const leftBoundary = idx ? segments[idx - 1].end : plotMin;
    const rightBoundary = s.end;
    const x1 = ax.sx(Math.max(plotMin, leftBoundary));
    const x2 = ax.sx(Math.min(plotMax, rightBoundary));
    const cx = (x1 + x2) / 2;
    const line = idx ? `<line x1="${x1.toFixed(2)}" x2="${x1.toFixed(2)}" y1="${plotY + 1}" y2="${plotBottom - 10}" class="rateLine"/>` : "";
    return `
      <rect x="${x1.toFixed(2)}" y="${bandY}" width="${Math.max(0, x2 - x1).toFixed(2)}" height="${bandHeight}" class="${idx % 2 ? "rateBandAlt" : "rateBand"}"/>
      ${line}
      <text x="${cx.toFixed(2)}" y="${labelY}" class="rateLabel" text-anchor="middle">${escapeXml(s.label)}</text>`;
  }).join("");
}

function currentAnnotations() {
  if (!state.selectedId) return [];
  if (!state.annotations[state.selectedId]) {
    const d = state.datasets.find((x) => x.id === state.selectedId);
    const saved = d?.figureEdits?.annotations;
    state.annotations[state.selectedId] = Array.isArray(saved)
      ? saved.map((a) => ({ text: String(a.text || ""), x: Number(a.x) || 0, y: Number(a.y) || 0, size: clampFontSize(a.size) }))
      : [];
  }
  return state.annotations[state.selectedId];
}

function currentLayoutEdits() {
  if (!state.selectedId) return {};
  const d = state.datasets.find((x) => x.id === state.selectedId);
  const saved = d?.figureEdits?.layout;
  if (!state.layoutEdits) state.layoutEdits = {};
  if (!state.layoutEdits[state.selectedId]) {
    state.layoutEdits[state.selectedId] = saved && typeof saved === "object" ? { ...saved } : {};
  }
  return state.layoutEdits[state.selectedId];
}

function normalizeHexColor(value, fallback = "#0f766e") {
  const text = String(value || "").trim();
  return /^#[0-9a-f]{6}$/i.test(text) ? text.toLowerCase() : fallback;
}

function lightenHexColor(hex, amount = 0.72) {
  const color = normalizeHexColor(hex).slice(1);
  const r = parseInt(color.slice(0, 2), 16);
  const g = parseInt(color.slice(2, 4), 16);
  const b = parseInt(color.slice(4, 6), 16);
  const mix = (v) => Math.round(v + (255 - v) * amount).toString(16).padStart(2, "0");
  return `#${mix(r)}${mix(g)}${mix(b)}`;
}

function normalizeFigureAspectRatio(value) {
  return ["journal", "wide", "square", "portrait"].includes(value) ? value : "journal";
}

function figureSvgSize(style, kind = "paper") {
  const ratio = normalizeFigureAspectRatio(style?.aspectRatio);
  const presets = kind === "rate"
    ? {
      journal: { w: 640, h: 480 },
      wide: { w: 760, h: 428 },
      square: { w: 560, h: 560 },
      portrait: { w: 520, h: 650 },
    }
    : {
      journal: { w: 1120, h: 840 },
      wide: { w: 1280, h: 720 },
      square: { w: 900, h: 900 },
      portrait: { w: 760, h: 950 },
    };
  return presets[ratio] || presets.journal;
}

function syncFigureControls(style = currentFigureStyle()) {
  const colorInput = $("figureSeriesColor");
  const ratioInput = $("figureAspectRatio");
  if (colorInput) colorInput.value = normalizeHexColor(style.seriesColor || "#0f766e");
  if (ratioInput) ratioInput.value = normalizeFigureAspectRatio(style.aspectRatio);
}

function currentFigureStyle() {
  if (!state.selectedId) return { seriesColor: "#0f766e", aspectRatio: "journal" };
  const d = state.datasets.find((x) => x.id === state.selectedId);
  const saved = d?.figureEdits?.style;
  if (!state.figureStyles[state.selectedId]) {
    state.figureStyles[state.selectedId] = {
      seriesColor: normalizeHexColor(saved?.seriesColor || "#0f766e"),
      aspectRatio: normalizeFigureAspectRatio(saved?.aspectRatio),
    };
  }
  return state.figureStyles[state.selectedId];
}

function movableWrap(key, x, y, inner, extra = "") {
  return `<g class="figureMovable" data-layout-key="${escapeAttr(key)}" data-base-x="${x}" data-base-y="${y}" transform="translate(${x.toFixed(2)} ${y.toFixed(2)})" ${extra}>${inner}</g>`;
}

function clampFontSize(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 13;
  return Math.max(8, Math.min(40, Math.round(n)));
}

async function saveFigureEdits(silent = true) {
  const d = state.datasets.find((x) => x.id === state.selectedId);
  if (!d) return;
  const figureEdits = { ...(d.figureEdits || {}), annotations: currentAnnotations(), layout: currentLayoutEdits(), style: currentFigureStyle() };
  try {
    const res = await fetch(`/api/datasets/${encodeURIComponent(d.id)}`, {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ figureEdits }),
    });
    const saved = await res.json();
    if (!res.ok) throw new Error(saved.error || "피겨 수정 저장 실패");
    state.datasets = state.datasets.map((item) => item.id === saved.id ? saved : item);
    state.filtered = state.filtered.map((item) => item.id === saved.id ? saved : item);
    state.annotations[saved.id] = Array.isArray(saved.figureEdits?.annotations) ? saved.figureEdits.annotations : [];
    state.figureStyles[saved.id] = {
      seriesColor: normalizeHexColor(saved.figureEdits?.style?.seriesColor),
      aspectRatio: normalizeFigureAspectRatio(saved.figureEdits?.style?.aspectRatio),
    };
    const figureRes = await fetch("/api/figures", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ datasetId: saved.id, name: `${sampleLabel(saved)} figure`, figureKind: saved.figureKind, edits: saved.figureEdits }),
    });
    const figureBody = await figureRes.json().catch(() => ({}));
    if (!figureRes.ok) throw new Error(figureBody.error || "피겨 라이브러리 저장에 실패했습니다.");
    if (state.cellWorkspace?.cell?.id === saved.cellRecordId) loadCellWorkspace(saved);
    if (!silent) setStatus("피겨 수정 내용이 저장되었습니다.");
  } catch (error) {
    setStatus(`피겨 수정 저장 실패: ${error.message}`);
  }
}

function annotationSvg() {
  return currentAnnotations().map((a, idx) => `<text class="userAnnotation${idx === state.selectedAnnotation ? " selected" : ""}" data-annotation-index="${idx}" x="${a.x}" y="${a.y}" style="font:700 ${clampFontSize(a.size)}px 'Segoe UI','Noto Sans KR',Arial,sans-serif">${escapeXml(a.text)}</text>`).join("");
}

function applyAnnotationsToSvg() {
  const svg = document.getElementById("paperFigure");
  if (!svg) return;
  applyLayoutEditsToSvg(svg);
  for (const old of svg.querySelectorAll(".userAnnotation")) old.remove();
  const ns = "http://www.w3.org/2000/svg";
  currentAnnotations().forEach((a, idx) => {
    const el = document.createElementNS(ns, "text");
    el.textContent = a.text;
    el.setAttribute("class", `userAnnotation${idx === state.selectedAnnotation ? " selected" : ""}`);
    el.setAttribute("data-annotation-index", String(idx));
    el.setAttribute("x", String(a.x));
    el.setAttribute("y", String(a.y));
    el.setAttribute("style", `font:700 ${clampFontSize(a.size)}px 'Segoe UI','Noto Sans KR',Arial,sans-serif;fill:${idx === state.selectedAnnotation ? "#0f766e" : "#111"};cursor:move;user-select:none`);
    svg.appendChild(el);
  });
  attachAnnotationDrag();
}

function applyLayoutEditsToSvg(svg) {
  const edits = currentLayoutEdits();
  for (const el of svg.querySelectorAll(".figureMovable")) {
    const key = el.dataset.layoutKey;
    const baseX = Number(el.dataset.baseX) || 0;
    const baseY = Number(el.dataset.baseY) || 0;
    const edit = edits[key] || {};
    const dx = Number(edit.dx) || 0;
    const dy = Number(edit.dy) || 0;
    el.setAttribute("transform", `translate(${baseX + dx} ${baseY + dy})`);
  }
  attachLayoutDrag(svg);
}

function attachLayoutDrag(svg) {
  const edits = currentLayoutEdits();
  for (const el of svg.querySelectorAll(".figureMovable")) {
    el.style.cursor = "move";
    el.style.userSelect = "none";
    el.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      el.setPointerCapture(event.pointerId);
      const key = el.dataset.layoutKey;
      const baseX = Number(el.dataset.baseX) || 0;
      const baseY = Number(el.dataset.baseY) || 0;
      const current = edits[key] || { dx: 0, dy: 0 };
      const startDx = Number(current.dx) || 0;
      const startDy = Number(current.dy) || 0;
      const rect = svg.getBoundingClientRect();
      const view = svg.viewBox.baseVal;
      const px = event.clientX;
      const py = event.clientY;
      const move = (ev) => {
        const dx = startDx + (ev.clientX - px) * view.width / rect.width;
        const dy = startDy + (ev.clientY - py) * view.height / rect.height;
        edits[key] = { dx, dy };
        el.setAttribute("transform", `translate(${baseX + dx} ${baseY + dy})`);
      };
      const up = () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerup", up);
        saveFigureEdits(true);
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", up);
    });
  }
}

function selectAnnotation(idx) {
  state.selectedAnnotation = Number.isFinite(idx) ? idx : null;
  const input = $("annotationText");
  const sizeInput = $("annotationSize");
  const button = $("addAnnotation");
  const ann = state.selectedAnnotation === null ? null : currentAnnotations()[state.selectedAnnotation];
  if (input && ann) input.value = ann.text;
  if (sizeInput) sizeInput.value = ann ? clampFontSize(ann.size) : clampFontSize(sizeInput.value);
  if (button) button.textContent = ann ? "글 수정" : "글 추가";
  for (const el of document.querySelectorAll(".userAnnotation")) {
    const selected = Number(el.dataset.annotationIndex) === state.selectedAnnotation;
    el.classList.toggle("selected", selected);
    el.setAttribute("fill", selected ? "#0f766e" : "#111");
    el.style.fill = selected ? "#0f766e" : "#111";
  }
}

function addOrUpdateAnnotation() {
  const input = $("annotationText");
  const text = input?.value.trim();
  const size = clampFontSize($("annotationSize")?.value);
  if (!state.selectedId) return setStatus("먼저 파일 분석 후 피겨를 생성하거나, 기존 피겨를 선택하세요.");
  if (!text) return setStatus("추가할 글을 입력하세요.");
  const annotations = currentAnnotations();
  if (state.selectedAnnotation !== null && annotations[state.selectedAnnotation]) {
    annotations[state.selectedAnnotation].text = text;
    annotations[state.selectedAnnotation].size = size;
  } else {
    const svg = document.getElementById("paperFigure");
    const view = svg?.viewBox?.baseVal;
    annotations.push({ text, x: view ? view.width * 0.62 : 355, y: view ? view.height * 0.22 : 82, size });
    state.selectedAnnotation = annotations.length - 1;
  }
  renderCurrent();
  saveFigureEdits(false);
}

function clearAnnotations() {
  if (!state.selectedId) return;
  state.annotations[state.selectedId] = [];
  state.selectedAnnotation = null;
  const input = $("annotationText");
  if (input) input.value = "";
  const sizeInput = $("annotationSize");
  if (sizeInput) sizeInput.value = 13;
  const button = $("addAnnotation");
  if (button) button.textContent = "글 추가";
  renderCurrent();
  saveFigureEdits(false);
}

function changeAnnotationSize(delta) {
  const input = $("annotationSize");
  const next = clampFontSize((Number(input?.value) || 13) + delta);
  if (input) input.value = next;
  const annotations = currentAnnotations();
  if (state.selectedAnnotation !== null && annotations[state.selectedAnnotation]) {
    annotations[state.selectedAnnotation].size = next;
    renderCurrent();
    saveFigureEdits(false);
  }
}

function changeFigureSeriesColor() {
  if (!state.selectedId) return setStatus("먼저 파일 분석 후 피겨를 생성하거나, 기존 피겨를 선택하세요.");
  const input = $("figureSeriesColor");
  const style = currentFigureStyle();
  style.seriesColor = normalizeHexColor(input?.value, style.seriesColor);
  if (input) input.value = style.seriesColor;
  renderCurrent();
  saveFigureEdits(false);
}

function changeFigureAspectRatio() {
  if (!state.selectedId) return setStatus("먼저 피겨를 선택하세요.");
  const input = $("figureAspectRatio");
  const style = currentFigureStyle();
  style.aspectRatio = normalizeFigureAspectRatio(input?.value);
  if (input) input.value = style.aspectRatio;
  renderCurrent();
  saveFigureEdits(false);
}

function attachAnnotationDrag() {
  const svg = document.getElementById("paperFigure");
  if (!svg) return;
  for (const el of svg.querySelectorAll(".userAnnotation")) {
    el.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      el.setPointerCapture(event.pointerId);
      const idx = Number(el.dataset.annotationIndex);
      selectAnnotation(idx);
      const rect = svg.getBoundingClientRect();
      const view = svg.viewBox.baseVal;
      const start = currentAnnotations()[idx];
      const sx = Number(el.getAttribute("x"));
      const sy = Number(el.getAttribute("y"));
      const px = event.clientX;
      const py = event.clientY;
      const move = (ev) => {
        const dx = (ev.clientX - px) * view.width / rect.width;
        const dy = (ev.clientY - py) * view.height / rect.height;
        el.setAttribute("x", sx + dx);
        el.setAttribute("y", sy + dy);
      };
      const up = () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerup", up);
        if (start) {
          start.x = Number(el.getAttribute("x"));
          start.y = Number(el.getAttribute("y"));
        }
        saveFigureEdits(true);
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", up);
    });
  }
  selectAnnotation(state.selectedAnnotation);
}

function cycStyle(seriesColor = "#0f766e") {
  const stroke = normalizeHexColor(seriesColor);
  const fill = lightenHexColor(stroke, 0.72);
  return `
    <style>
      .axis{stroke:#111;stroke-width:1;shape-rendering:crispEdges}.grid{stroke:#e5e9ee;stroke-width:.5}
      .capLine{fill:none;stroke:${stroke};stroke-width:1.35}.capPt{fill:${fill};stroke:${stroke};stroke-width:1.45}
      .tick{font:12px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111}.label{font:13px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111}.panelTitle{font:700 14px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111}
      .legend{font:9px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111}.caption{font:8px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111}.panelLetter{font:700 20px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111}
      .rateBand,.rateBandAlt{fill:transparent}.rateLine{stroke:#777;stroke-width:.75;stroke-dasharray:1.6 1.6}.rateLabel{font:10px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111}
      .frame{fill:none;stroke:#111;stroke-width:1;shape-rendering:crispEdges}
      .figureMovable{cursor:move;user-select:none}.figureMovable:hover text{fill:#0f766e}
      .userAnnotation{font:700 13px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111;cursor:move;user-select:none}
      .userAnnotation.selected{fill:#0f766e;text-decoration:underline}
    </style>`;
}

function drawPaperAxes({ x, y, w, h, xDomain, yDomain, y2Domain, xlabel, ylabel, y2label, integerX = false, xTicks = null, yTicks = null, xlabelOffset = 54, ylabelOffset = 72 }) {
  const sx = makeScale(xDomain, [x, x + w]);
  const sy = makeScale(yDomain, [y + h, y]);
  const sy2 = y2Domain ? makeScale(y2Domain, [y + h, y]) : null;
  const parts = [];
  parts.push(`<line x1="${x}" x2="${x + w}" y1="${y + h}" y2="${y + h}" class="axis"/><line x1="${x}" x2="${x}" y1="${y}" y2="${y + h}" class="axis"/>`);
  if (y2Domain) parts.push(`<line x1="${x + w}" x2="${x + w}" y1="${y}" y2="${y + h}" class="axis"/>`);
  const xTickValues = xTicks || (integerX ? integerTicks(xDomain[0], xDomain[1], 6) : axisTicks(xDomain, 6));
  const yTickValues = yTicks || axisTicks(yDomain, 6);
  parts.push(xTickValues.map((v) => `<line x1="${sx(v)}" x2="${sx(v)}" y1="${y + h}" y2="${y + h + 8}" class="axis"/><text x="${sx(v)}" y="${y + h + 35}" class="tick" text-anchor="middle">${integerX ? Math.round(v) : fmt(v, 3)}</text>`).join(""));
  parts.push(yTickValues.map((v) => {
    const isBoundary = Math.abs(v - yDomain[0]) < 1e-9 || Math.abs(v - yDomain[1]) < 1e-9;
    const grid = isBoundary ? "" : `<line x1="${x}" x2="${x + w}" y1="${sy(v)}" y2="${sy(v)}" class="grid"/>`;
    return `<line x1="${x - 8}" x2="${x}" y1="${sy(v)}" y2="${sy(v)}" class="axis"/>${grid}<text x="${x - 15}" y="${sy(v) + 5}" class="tick" text-anchor="end">${fmt(v, 3)}</text>`;
  }).join(""));
  if (y2Domain) parts.push(axisTicks(y2Domain, 6).map((v) => `<line x1="${x + w}" x2="${x + w + 7}" y1="${sy2(v)}" y2="${sy2(v)}" class="axis"/><text x="${x + w + 13}" y="${sy2(v) + 5}" class="tick">${fmt(v, 3)}</text>`).join(""));
  parts.push(`<text x="${x + w / 2}" y="${y + h + xlabelOffset}" class="label" text-anchor="middle">${xlabel}</text>`);
  parts.push(`<text transform="translate(${x - ylabelOffset},${y + h / 2}) rotate(-90)" class="label" text-anchor="middle">${ylabel}</text>`);
  if (y2label) parts.push(`<text transform="translate(${x + w + 86},${y + h / 2}) rotate(90)" class="label" text-anchor="middle">${y2label}</text>`);
  return { sx, sy, sy2, svg: parts.join("") };
}

function loadingCaption(d) {
  const savedLoading = Number(d.cell?.electrodeCalc?.activeLoading_g_cm2);
  if (Number.isFinite(savedLoading) && savedLoading > 0) {
    return `${fixed(savedLoading * 1000, 4)} mg cm-2`;
  }
  const text = [d.sourceName, d.cell?.sampleName, d.cell?.condition, d.cell?.notes].filter(Boolean).join(" ");
  const match = text.match(/(\d+(?:\.\d+)?)\s*mg/i);
  return match ? `${Number(match[1]).toString()} mg cm-2` : "";
}

function renderCycFigure(d) {
  const style = currentFigureStyle();
  syncFigureControls(style);
  const rows = d.rows.filter((r) => Number.isFinite(r.cycle)).sort((a, b) => a.cycle - b.cycle);
  const title = `${d.cell.cellId || d.id}${d.cell.sampleName ? " - " + d.cell.sampleName : ""}`;
  const capPts = dischargeSeries(rows);
  const rateSegments = inferCRateSegments(d, rows, capPts);
  const isRateFigure = rateSegments.length >= 2;
  $("figureTitle").textContent = title;
  $("figureSubtitle").textContent = `${d.cell.date || ""} - CYC - ${d.rows.length} points`;
  const metaRows = [["Material", d.cell.material], ["Condition", d.cell.condition], [isRateFigure ? "C-rate" : "Mode", isRateFigure ? rateSegments.map((s) => s.label).join(" | ") : "Long cycle"], ["Owner", displayUserName(d)], ["Source", d.sourceName]];
  $("metaGrid").innerHTML = metaRows.map(([k, v]) => `<div class="metaItem"><strong>${k}</strong>${isBadText(v) ? "-" : (v || "-")}</div>`).join("");
  const cycleValues = capPts.length ? capPts.map((r) => r.x) : rows.map((r) => r.cycle);
  const maxRateCycle = Math.max(...rateSegments.map((s) => s.end).filter(Number.isFinite), Math.max(...cycleValues));
  const xTickMax = Math.max(5, Math.ceil(maxRateCycle / 5) * 5);
  const xMax = xTickMax + Math.max(1, xTickMax * 0.025);
  const xDomain = [0, xMax];
  const maxCap = Math.max(...capPts.map((p) => p.y).filter(Number.isFinite), 1);
  const capDomain = [0, maxCap <= 180 ? 180 : Math.ceil(maxCap * 1.05 / 20) * 20];
  const svgSize = figureSvgSize(style, "rate");
  const margin = {
    left: Math.max(58, Math.round(svgSize.w * 0.14)),
    right: Math.max(28, Math.round(svgSize.w * 0.08)),
    top: Math.max(44, Math.round(svgSize.h * 0.13)),
    bottom: Math.max(58, Math.round(svgSize.h * 0.14)),
  };
  const plot = {
    x: margin.left,
    y: margin.top,
    w: Math.max(220, svgSize.w - margin.left - margin.right),
    h: Math.max(180, svgSize.h - margin.top - margin.bottom),
  };
  const sx = makeScale(xDomain, [plot.x, plot.x + plot.w]);
  const sy = makeScale(capDomain, [plot.y + plot.h, plot.y]);
  const xTickStep = xTickMax <= 18 ? 3 : 5;
  const xTicks = Array.from({ length: Math.floor(xTickMax / xTickStep) + 1 }, (_, i) => i * xTickStep);
  const yTickStep = 20;
  const yTicks = Array.from({ length: Math.floor(capDomain[1] / yTickStep) + 1 }, (_, i) => i * yTickStep);
  const rateSvg = isRateFigure ? rateSegments.map((s, idx) => {
    const left = s.start;
    const right = s.end;
    const boundary = idx ? s.start - 0.5 : null;
    const x1 = sx(Math.max(xDomain[0], left - 0.5));
    const x2 = sx(Math.min(xDomain[1], right + 0.5));
    const cx = (x1 + x2) / 2;
    const bx = boundary === null ? null : sx(boundary);
    const line = bx === null ? "" : `<line x1="${bx.toFixed(2)}" x2="${bx.toFixed(2)}" y1="${plot.y}" y2="${plot.y + plot.h}" class="rateLine"/>`;
    return `${line}${movableWrap(`rate-${idx}`, cx, plot.y - 10, `<text class="rateLabel" text-anchor="middle">${escapeXml(s.label)}</text>`)}`;
  }).join("") : "";
  const capPath = capPts.map((p, idx) => {
    const prev = capPts[idx - 1];
    const command = !prev || Math.abs(p.x - prev.x) > 1.5 ? "M" : "L";
    return `${command}${sx(p.x).toFixed(2)} ${sy(p.y).toFixed(2)}`;
  }).join(" ");
  const axesSvg = `
    <rect x="${plot.x}" y="${plot.y}" width="${plot.w}" height="${plot.h}" class="frame"/>
    ${xTicks.map((v) => `<line x1="${sx(v)}" x2="${sx(v)}" y1="${plot.y + plot.h}" y2="${plot.y + plot.h - 7}" class="axis"/><text x="${sx(v)}" y="${plot.y + plot.h + 18}" class="tick" text-anchor="middle">${v}</text>`).join("")}
    ${yTicks.map((v) => `<line x1="${plot.x}" x2="${plot.x + 7}" y1="${sy(v)}" y2="${sy(v)}" class="axis"/><text x="${plot.x - 9}" y="${sy(v) + 4}" class="tick" text-anchor="end">${v}</text>`).join("")}
    <text x="${plot.x + plot.w / 2}" y="${plot.y + plot.h + 40}" class="label" text-anchor="middle">Cycle number</text>
    <text transform="translate(${plot.x - 48},${plot.y + plot.h / 2}) rotate(-90)" class="label" text-anchor="middle">Specific capacity (mAh g-1)</text>`;
  const loading = loadingCaption(d);
  $("figureCanvas").innerHTML = `
    <svg id="paperFigure" class="rateFigure" style="--figure-width:${svgSize.w}px" viewBox="0 0 ${svgSize.w} ${svgSize.h}" xmlns="http://www.w3.org/2000/svg">
      ${cycStyle(style.seriesColor)}<rect width="${svgSize.w}" height="${svgSize.h}" fill="#fff"/>
      ${rateSvg}
      ${axesSvg}
      ${!isRateFigure && capPath ? `<path d="${capPath}" class="capLine"/>` : ""}
      ${markerPoints(capPts, sx, sy, "capPt", 4)}
      ${movableWrap("legend", plot.x + 24, plot.y + plot.h - 44, `
        <circle class="capPt" cx="0" cy="0" r="3.4"/><text class="legend" x="10" y="3.4">Discharge capacity</text>
      `)}
      ${loading ? movableWrap("loading-caption", plot.x + plot.w - 10, plot.y + plot.h - 22, `<text class="caption" text-anchor="end">${escapeXml(loading)}</text>`) : ""}
    </svg>`;
  applyAnnotationsToSvg();
}

function renderCvFigure(d) {
  const style = currentFigureStyle();
  syncFigureControls(style);
  const svgSize = figureSvgSize(style, "paper");
  const cvPlot = {
    x: Math.max(110, Math.round(svgSize.w * 0.12)),
    y: Math.max(120, Math.round(svgSize.h * 0.18)),
    w: Math.max(420, Math.round(svgSize.w * 0.72)),
    h: Math.max(300, Math.round(svgSize.h * 0.58)),
  };
  const rows = d.rows.filter((r) => Number.isFinite(r.voltage) && Number.isFinite(r.current));
  const title = `${d.cell.cellId || d.id} ${d.cell.sampleName ? "· " + d.cell.sampleName : ""}`;
  $("figureTitle").textContent = title;
  $("figureSubtitle").textContent = `${d.cell.date || ""} · CV · ${d.rows.length} points`;
  $("metaGrid").innerHTML = [["Material", d.cell.material], ["Condition", d.cell.condition], ["Owner", displayUserName(d)], ["Source", d.sourceName]].map(([k, v]) => `<div class="metaItem"><strong>${k}</strong>${isBadText(v) ? "-" : (v || "-")}</div>`).join("");
  $("figureCanvas").innerHTML = `
    <svg id="paperFigure" style="--figure-width:${svgSize.w}px" viewBox="0 0 ${svgSize.w} ${svgSize.h}" xmlns="http://www.w3.org/2000/svg">
      <style>.axis{stroke:#111827;stroke-width:1.6}.grid{stroke:#e5e7eb;stroke-width:1}.seriesLine{fill:none;stroke:#0f766e;stroke-width:2.4}.points circle{fill:#fff;stroke:#0f766e;stroke-width:1.8}.label{font:18px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111827}.tick{font:13px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#374151}.panelTitle{font:700 20px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111827}.caption{font:15px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#4b5563}</style>
      <rect width="${svgSize.w}" height="${svgSize.h}" fill="#ffffff"/>
      <text x="72" y="48" class="panelTitle">${escapeXml(title)}</text>
      <text x="72" y="74" class="caption">CV · ${escapeXml(d.cell.condition || "")}</text>
      ${panel({ x: cvPlot.x, y: cvPlot.y, w: cvPlot.w, h: cvPlot.h, xlabel: "Voltage (V)", ylabel: "Current", title: "Cyclic voltammetry", xDomain: niceBounds(rows.map((r) => r.voltage)), yDomain: niceBounds(rows.map((r) => r.current)), points: rows.map((r) => ({ x: r.voltage, y: r.current })) })}
    </svg>`;
  applyAnnotationsToSvg();
}

function escapeXml(s) {
  return String(s || "").replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));
}

function escapeAttr(s) {
  return escapeXml(s).replace(/'/g, "&#39;");
}

function rateNumber(label) {
  const match = String(label || "").match(/([0-9]+(?:\.[0-9]+)?)/);
  return match ? Number(match[1]) : null;
}

function average(nums) {
  const arr = nums.filter(Number.isFinite);
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
}

function bestManualSample() {
  const sheets = state.manualInfo?.sheets || [];
  for (const sheet of sheets) {
    const sample = (sheet.samples || []).find((s) => Number.isFinite(Number(s.oneC_mA)) && Number(s.oneC_mA) > 0);
    if (sample) return { sheet, sample };
  }
  return null;
}

function renderExperimentInfo(d) {
  const panel = $("experimentInfoPanel");
  if (!panel) return;
  const manual = bestManualSample();
  const savedCalc = d?.cell?.electrodeCalc || null;
  const blocks = [];

  if (d?.dataType === "cyc") {
    const rows = d.rows.filter((r) => Number.isFinite(r.cycle)).sort((a, b) => a.cycle - b.cycle);
    const capPts = dischargeSeries(rows);
    const segments = inferCRateSegments(d, rows, capPts);
    const oneC = Number(savedCalc?.oneC_mA ?? manual?.sample?.oneC_mA);
    const segmentRows = segments.map((seg) => {
      const inSeg = rows.filter((r) => r.cycle >= seg.start && r.cycle <= seg.end);
      const avgCap = average(inSeg.map((r) => r.capacity).filter(Number.isFinite).map((v) => Math.abs(v) < 10 ? v * 1000 : v));
      const avgCurrent = average(inSeg.map((r) => r.current).filter(Number.isFinite).map(Math.abs));
      const rate = rateNumber(seg.label);
      const estimated = Number.isFinite(oneC) && Number.isFinite(rate) ? oneC * rate : null;
      return [seg.label, `${seg.start}-${seg.end}`, avgCap, avgCurrent, estimated];
    });
    blocks.push(`
      <section class="infoBlock">
        <h3>현재 CYC 데이터 요약</h3>
        <div class="infoCards">
          <div><strong>데이터</strong><span>${escapeXml(d.sourceName || d.id)}</span></div>
          <div><strong>포인트</strong><span>${d.rows.length} rows</span></div>
          <div><strong>C-rate</strong><span>${segments.map((s) => s.label).join(" | ") || "-"}</span></div>
          <div><strong>전극 계산</strong><span>${savedCalc ? `${escapeXml(savedCalc.profileName || "저장값")} · 1C ${fixed(oneC, 4)} mA` : (manual ? "매뉴얼 기준" : "-")}</span></div>
        </div>
        <table>
          <thead><tr><th>C-rate</th><th>Cycle</th><th>평균 방전용량 (mAh g-1)</th><th>데이터 전류</th><th>저장/매뉴얼 기준 전류 (mA)</th></tr></thead>
          <tbody>${segmentRows.map(([label, range, cap, current, estimated]) => `
            <tr>
              <td>${escapeXml(label)}</td>
              <td>${escapeXml(range)}</td>
              <td>${cap == null ? "-" : fmt(cap, 5)}</td>
              <td>${current == null ? "-" : fmt(current, 5)}</td>
              <td>${estimated == null ? "-" : fmt(estimated, 5)}</td>
            </tr>`).join("")}</tbody>
        </table>
      </section>`);
  }

  if (state.manualInfo) {
    const sheets = state.manualInfo.sheets || [];
    const sheetCards = sheets.slice(0, 8).map((sheet) => {
      const samples = (sheet.samples || []).slice(0, 8);
      return `
        <section class="infoBlock">
          <h3>${escapeXml(sheet.sheet)}</h3>
          <div class="infoCards">
            <div><strong>활물질 이론용량</strong><span>${sheet.theoreticalCapacity_mAh_g || "-"} mAh g-1</span></div>
            <div><strong>샘플 수</strong><span>${sheet.sampleCount || 0}</span></div>
            <div><strong>조성</strong><span>${Object.entries(sheet.composition || {}).map(([k, v]) => `${k} ${v}`).join(" / ") || "-"}</span></div>
          </div>
          <table>
            <thead><tr><th>샘플</th><th>1C 전류 (mA)</th><th>전극 무게 (g)</th><th>두께 (mm)</th><th>NCM mass (g)</th><th>C-rate별 전류</th></tr></thead>
            <tbody>${samples.map((s) => `
              <tr>
                <td>${escapeXml(s.sample)}</td>
                <td>${escapeXml(s.oneC_mA)}</td>
                <td>${escapeXml(s.electrodeWeight_g)}</td>
                <td>${escapeXml(s.thickness_mm)}</td>
                <td>${escapeXml(s.ncmMass_g)}</td>
                <td>${(s.rateCurrents || []).map((r) => `${escapeXml(r.rate)} ${escapeXml(r.current_mA)} mA`).join(" / ") || "-"}</td>
              </tr>`).join("")}</tbody>
          </table>
        </section>`;
    }).join("");
    blocks.push(`
      <section class="infoBlock">
        <h3>매뉴얼 파일</h3>
        <p>${escapeXml(state.manualInfo.filename)} · ${state.manualInfo.sheetCount} sheets</p>
      </section>
      ${sheetCards}`);
  }

  if (!blocks.length) {
    blocks.push(`<section class="infoBlock emptyInfo"><h3>실험 정보 없음</h3><p>CYC 피겨를 선택하거나 매뉴얼 엑셀을 넣으면 C-rate와 전류 정보가 여기에 정리됩니다.</p></section>`);
  }
  panel.innerHTML = blocks.join("");
}

function renderCellWorkspace(d) {
  const title = $("cellRecordTitle");
  const path = $("cellRecordPath");
  const tags = $("cellRecordTags");
  const groupList = $("datasetGroupLibrary");
  const segmentList = $("protocolSegmentList");
  const figureList = $("cellFigureLibrary");
  const reportList = $("cellReportLibrary");
  const form = $("cellMetadataForm");
  if (!title || !path || !tags || !groupList || !segmentList || !figureList || !reportList || !form) return;

  if (!d) {
    title.textContent = "셀을 선택해주세요";
    path.textContent = "Project → Campaign → Cell → Dataset";
    tags.innerHTML = "";
    groupList.innerHTML = segmentList.innerHTML = figureList.innerHTML = reportList.innerHTML = `<span class="recordEmpty">선택한 셀의 기록이 여기에 표시됩니다.</span>`;
    form.reset();
    return;
  }

  const workspace = state.cellWorkspace?.cell?.id === d.cellRecordId ? state.cellWorkspace : null;
  const metadata = workspace?.metadata?.metadata || {};
  const savedTags = Array.isArray(workspace?.metadata?.tags) ? workspace.metadata.tags : [];
  title.textContent = workspace?.cell?.cellId || d.cell?.cellId || "Cell record";
  path.textContent = hierarchyLabel(d) || "Project → Campaign → Cell → Dataset";
  tags.innerHTML = savedTags.map((tag) => `<span>${escapeXml(tag)}</span>`).join("") || `<span class="recordChip">태그 없음</span>`;
  for (const key of ["cathode", "anode", "separator", "spacer", "cellFormat"]) {
    if (form.elements[key]) form.elements[key].value = metadata[key] || "";
  }
  if (form.elements.tags) form.elements.tags.value = savedTags.join(", ");

  const groups = workspace?.datasetGroups || [];
  groupList.innerHTML = groups.length ? groups.map((group) => {
    const typeText = Object.entries(group.dataTypes || {}).map(([type, count]) => `${String(type).toUpperCase()} ${count}`).join(" · ") || "아직 데이터 없음";
    const current = group.id === d.datasetGroupId ? "현재 선택" : "선택";
    return `<div class="recordListItem"><span><strong>${escapeXml(group.name)}</strong><br/><em>${escapeXml(typeText)}</em></span><button type="button" data-select-dataset-group="${escapeAttr(group.id)}">${current}</button></div>`;
  }).join("") : `<span class="recordEmpty">Dataset 묶음이 없습니다.</span>`;

  const segments = workspace?.protocolSegments || [];
  segmentList.innerHTML = segments.length ? segments.map((segment) => {
    const rate = Number.isFinite(Number(segment.cRate)) ? `${segment.cRate} C` : "C-rate 미입력";
    return `<div class="recordListItem"><span><strong>${escapeXml(segment.label)}</strong><br/><em>${segment.startCycle}-${segment.endCycle} cycle · ${escapeXml(rate)} · ${escapeXml(segment.mode || "other")}</em></span><button type="button" class="smallDanger" data-delete-segment="${escapeAttr(segment.id)}">삭제</button></div>`;
  }).join("") : `<span class="recordEmpty">등록한 프로토콜 구간이 없습니다.</span>`;

  const figures = workspace?.figures || [];
  figureList.innerHTML = figures.length ? figures.map((figure) => `<div class="recordListItem"><span><strong>${escapeXml(figure.name)}</strong><br/><em>${escapeXml(figure.figureKind || "figure")}</em></span><button type="button" data-open-figure-record="${escapeAttr(figure.datasetId)}">열기</button></div>`).join("") : `<span class="recordEmpty">저장한 피겨가 없습니다.</span>`;

  const reports = workspace?.reports || [];
  reportList.innerHTML = reports.length ? reports.map((report) => {
    const lead = String(report.content?.main || report.content?.sections?.main || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").slice(0, 90);
    return `<div class="recordListItem"><span><strong>${escapeXml(report.title)}</strong><br/><em>${escapeXml(lead || report.reportType || "report")}</em></span><button type="button" data-open-report-record="${escapeAttr(report.id)}">보기</button></div>`;
  }).join("") : `<span class="recordEmpty">저장한 AI 보고서가 없습니다.</span>`;

  for (const button of groupList.querySelectorAll("[data-select-dataset-group]")) {
    button.addEventListener("click", () => {
      const select = $("datasetGroupSelect");
      if (select) select.value = button.dataset.selectDatasetGroup;
      renderHierarchyControls({ ...hierarchySelectionPayload(), datasetGroupId: button.dataset.selectDatasetGroup });
      setStatus("선택한 Dataset 묶음을 다음 저장 위치로 설정했습니다.");
    });
  }
  for (const button of segmentList.querySelectorAll("[data-delete-segment]")) {
    button.addEventListener("click", () => deleteProtocolSegment(button.dataset.deleteSegment));
  }
  for (const button of figureList.querySelectorAll("[data-open-figure-record]")) {
    button.addEventListener("click", () => openCellRecordDataset(button.dataset.openFigureRecord));
  }
  for (const button of reportList.querySelectorAll("[data-open-report-record]")) {
    button.addEventListener("click", () => openCellReport(button.dataset.openReportRecord));
  }
}

async function loadCellWorkspace(d = currentDataset()) {
  if (!d?.cellRecordId) {
    state.cellWorkspace = null;
    renderCellWorkspace(d);
    return;
  }
  const requestId = ++state.cellWorkspaceRequestId;
  try {
    const res = await fetch(`/api/cells/${encodeURIComponent(d.cellRecordId)}/workspace`, { headers: authHeaders() });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || "셀 기록을 불러오지 못했습니다.");
    if (requestId !== state.cellWorkspaceRequestId || currentDataset()?.cellRecordId !== d.cellRecordId) return;
    state.cellWorkspace = body;
    renderCellWorkspace(d);
  } catch (error) {
    if (requestId !== state.cellWorkspaceRequestId) return;
    setStatus(error.message || "셀 기록을 불러오지 못했습니다.");
  }
}

async function saveCellMetadata(event) {
  event.preventDefault();
  const d = currentDataset();
  if (!d?.cellRecordId) return setStatus("먼저 저장된 셀 데이터를 선택해주세요.");
  const form = event.currentTarget;
  const values = Object.fromEntries(new FormData(form));
  const tags = String(values.tags || "").split(",").map((item) => item.trim()).filter(Boolean);
  delete values.tags;
  try {
    const res = await fetch(`/api/cells/${encodeURIComponent(d.cellRecordId)}/metadata`, {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ metadata: values, tags }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || "셀 메타데이터 저장에 실패했습니다.");
    state.cellWorkspace = { ...(state.cellWorkspace || {}), cell: state.cellWorkspace?.cell || { id: d.cellRecordId }, metadata: body };
    renderCellWorkspace(d);
    setStatus("셀 메타데이터와 태그를 저장했습니다.");
  } catch (error) {
    setStatus(error.message || "셀 메타데이터 저장에 실패했습니다.");
  }
}

async function saveProtocolSegment(event) {
  event.preventDefault();
  const d = currentDataset();
  if (!d?.cellRecordId) return setStatus("먼저 저장된 셀 데이터를 선택해주세요.");
  const values = Object.fromEntries(new FormData(event.currentTarget));
  try {
    const res = await fetch(`/api/cells/${encodeURIComponent(d.cellRecordId)}/protocol-segments`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ ...values, datasetGroupId: d.datasetGroupId || "" }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || "프로토콜 구간 저장에 실패했습니다.");
    event.currentTarget.reset();
    await loadCellWorkspace(d);
    setStatus(`${body.label} 구간을 저장했습니다.`);
  } catch (error) {
    setStatus(error.message || "프로토콜 구간 저장에 실패했습니다.");
  }
}

async function deleteProtocolSegment(segmentId) {
  if (!segmentId) return;
  if (!window.confirm("이 프로토콜 구간을 삭제할까요?")) return;
  try {
    const res = await fetch(`/api/protocol-segments/${encodeURIComponent(segmentId)}`, { method: "DELETE", headers: authHeaders() });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || "프로토콜 구간 삭제에 실패했습니다.");
    await loadCellWorkspace();
    setStatus("프로토콜 구간을 삭제했습니다.");
  } catch (error) {
    setStatus(error.message || "프로토콜 구간 삭제에 실패했습니다.");
  }
}

function openCellRecordDataset(datasetId) {
  const target = state.datasets.find((item) => item.id === datasetId);
  if (!target) return setStatus("현재 목록에서 피겨 데이터셋을 찾을 수 없습니다.");
  state.selectedId = target.id;
  state.activeFigureModule = target.dataType || state.activeFigureModule;
  renderSelect();
  renderSavedList();
  renderCurrent();
  activateView("figure", state.activeFigureModule);
}

function openCellReport(reportId) {
  const report = state.cellWorkspace?.reports?.find((item) => item.id === reportId);
  if (!report) return;
  const message = Object.values(report.content || {}).map((value) => String(value).replace(/<[^>]*>/g, " ")).join("\n\n").slice(0, 4000);
  window.alert(`${report.title}\n\n${message || "저장된 내용이 없습니다."}`);
}

function currentDataset() {
  return state.datasets.find((x) => x.id === state.selectedId) || null;
}

function analysisLabel(name) {
  return {
    retention: "Retention / SOH",
    dqdv: "dQ/dV",
    dva: "DVA (dV/dQ)",
    eis: "EIS summary",
    "pulse-resistance": "Pulse resistance",
    "rate-capability": "Rate capability",
  }[name] || name || "분석";
}

function analysisMetricLabel(key) {
  return {
    cycle_count: "분석 cycle 수",
    initial_capacity_mah_g: "초기 용량 (mAh g-1)",
    final_capacity_mah_g: "마지막 용량 (mAh g-1)",
    final_retention_pct: "용량 유지율 (%)",
    point_count: "분석 점 수",
    pulse_count: "pulse 수",
    group_count: "C-rate 그룹 수",
  }[key] || key.replaceAll("_", " ");
}

function formatAnalysisMetric(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value.toPrecision(6) : "-";
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function renderAnalysisResult(run) {
  const resultNode = $("analysisRunResult");
  const statusNode = $("analysisRunStatus");
  if (!resultNode || !statusNode) return;
  const dataset = currentDataset();
  if (!dataset) {
    statusNode.innerHTML = "<strong>분석할 데이터셋을 먼저 저장하거나 선택하세요.</strong>";
    resultNode.innerHTML = "";
    return;
  }
  const provenance = run?.provenance || {};
  statusNode.innerHTML = `
    <strong>${escapeXml(datasetDisplayName(dataset))}</strong>
    <span>${escapeXml((dataset.dataType || "data").toUpperCase())} · ${dataset.parsedArtifact?.objectKey ? "BDF 정규화 데이터 우선" : "기존 표 데이터"}</span>
    ${run ? `<span>${escapeXml(analysisLabel(run.analysisName))} · ${escapeXml(run.createdAt || "")}</span>` : "<span>분석 방법을 선택하고 실행하세요.</span>"}
    ${run?.provenance ? `<small>행 출처: ${escapeXml(provenance.rowSource || "dataset-rows")} · 품질 제외: ${Number(provenance.excludedQualityRowCount || 0)}행</small>` : ""}
  `;
  if (!run) {
    resultNode.innerHTML = "<p class=\"analysisEmpty\">아직 선택한 데이터셋의 저장된 분석 결과가 없습니다.</p>";
    return;
  }
  const result = run.result || {};
  if (run.status !== "ok") {
    resultNode.innerHTML = `<div class="analysisUnavailable"><strong>분석 결과를 만들 수 없습니다.</strong><span>${escapeXml(result.reason || "데이터 형식과 필요한 컬럼을 확인하세요.")}</span></div>`;
    return;
  }
  const metrics = Object.entries(result)
    .filter(([key, value]) => !["status", "reason", "parameters", "points", "groups", "pulses", "frequency_hz", "z_real_ohm", "z_imag_ohm"].includes(key) && (typeof value !== "object" || value === null));
  const metricHtml = metrics.length
    ? `<dl class="analysisMetricGrid">${metrics.map(([key, value]) => `<div><dt>${escapeXml(analysisMetricLabel(key))}</dt><dd>${escapeXml(formatAnalysisMetric(value))}</dd></div>`).join("")}</dl>`
    : "";
  const rangeHtml = ["frequency_hz", "z_real_ohm", "z_imag_ohm"].filter((key) => result[key]).map((key) => {
    const range = result[key] || {};
    return `<div><dt>${escapeXml(analysisMetricLabel(key))}</dt><dd>${escapeXml(formatAnalysisMetric(range.min))} to ${escapeXml(formatAnalysisMetric(range.max))}</dd></div>`;
  }).join("");
  const groupHtml = Array.isArray(result.groups) && result.groups.length
    ? `<div class="analysisDataTable"><h4>C-rate capacity</h4><table><thead><tr><th>C-rate</th><th>cycles</th><th>mean capacity</th></tr></thead><tbody>${result.groups.map((group) => `<tr><td>${escapeXml(formatAnalysisMetric(group.c_rate))}</td><td>${escapeXml(formatAnalysisMetric(group.cycle_count))}</td><td>${escapeXml(formatAnalysisMetric(group.mean_specific_capacity_mah_g))}</td></tr>`).join("")}</tbody></table></div>`
    : "";
  const pulseHtml = Array.isArray(result.pulses) && result.pulses.length
    ? `<div class="analysisDataTable"><h4>Pulse resistance</h4><table><thead><tr><th>time (s)</th><th>delta I (A)</th><th>R (ohm)</th></tr></thead><tbody>${result.pulses.slice(0, 12).map((pulse) => `<tr><td>${escapeXml(formatAnalysisMetric(pulse.time_s))}</td><td>${escapeXml(formatAnalysisMetric(pulse.delta_current_a))}</td><td>${escapeXml(formatAnalysisMetric(pulse.resistance_ohm))}</td></tr>`).join("")}</tbody></table></div>`
    : "";
  const pointNote = Array.isArray(result.points) ? `<p class="analysisPointNote">곡선 산출 점: ${result.points.length}개. 결과 JSON 아티팩트에 전체 점이 보존됩니다.</p>` : "";
  resultNode.innerHTML = `<div class="analysisResultTitle"><span class="analysisState ok">완료</span><h3>${escapeXml(analysisLabel(run.analysisName))}</h3></div>${metricHtml}${rangeHtml ? `<dl class="analysisMetricGrid">${rangeHtml}</dl>` : ""}${groupHtml}${pulseHtml}${pointNote}`;
}

function renderAnalysisLab() {
  const select = $("analysisLabDatasetSelect");
  const typeSelect = $("analysisType");
  const binField = $("dqdvBinField");
  if (!select || !typeSelect) return;
  const selectedId = state.selectedId || state.datasets[0]?.id || "";
  if (selectedId && selectedId !== state.selectedId) state.selectedId = selectedId;
  select.innerHTML = state.datasets.length
    ? state.datasets.map((dataset) => `<option value="${escapeAttr(dataset.id)}" ${dataset.id === state.selectedId ? "selected" : ""}>${escapeXml(datasetDisplayName(dataset))} · ${escapeXml((dataset.dataType || "data").toUpperCase())}</option>`).join("")
    : "<option value=\"\">저장된 데이터셋이 없습니다.</option>";
  if (state.pendingAnalysisName) {
    typeSelect.value = state.pendingAnalysisName;
    state.pendingAnalysisName = "";
  } else if (!typeSelect.value && currentDataset()?.dataType === "eis") {
    typeSelect.value = "eis";
  }
  binField?.classList.toggle("hidden", typeSelect.value !== "dqdv");
  const selectedRun = state.analysisRuns.find((run) => run.id === state.selectedAnalysisRunId) || state.analysisRuns[0] || null;
  if (selectedRun && selectedRun.id !== state.selectedAnalysisRunId) state.selectedAnalysisRunId = selectedRun.id;
  renderAnalysisResult(selectedRun);
  const list = $("analysisRunList");
  if (!list) return;
  list.innerHTML = state.analysisRuns.length
    ? state.analysisRuns.map((run) => `<button type="button" class="analysisRunItem${run.id === state.selectedAnalysisRunId ? " active" : ""}" data-analysis-run-id="${escapeAttr(run.id)}"><strong>${escapeXml(analysisLabel(run.analysisName))}</strong><span>${escapeXml(run.status)} · ${escapeXml(run.createdAt || "")}</span></button>`).join("")
    : "<p class=\"analysisEmpty\">이 데이터셋의 분석 이력이 없습니다.</p>";
  for (const button of list.querySelectorAll("[data-analysis-run-id]")) {
    button.addEventListener("click", () => {
      state.selectedAnalysisRunId = button.dataset.analysisRunId;
      renderAnalysisLab();
    });
  }
}

async function loadAnalysisRuns() {
  const dataset = currentDataset();
  if (!dataset) {
    state.analysisRuns = [];
    state.selectedAnalysisRunId = null;
    renderAnalysisLab();
    return;
  }
  const res = await fetch(`/api/datasets/${encodeURIComponent(dataset.id)}/analyses`, { headers: authHeaders() });
  const body = await res.json().catch(() => []);
  if (!res.ok) throw new Error(body.detail || body.error || "분석 이력을 불러오지 못했습니다.");
  state.analysisRuns = Array.isArray(body) ? body : [];
  if (!state.analysisRuns.some((run) => run.id === state.selectedAnalysisRunId)) state.selectedAnalysisRunId = state.analysisRuns[0]?.id || null;
  renderAnalysisLab();
}

async function runSelectedDatasetAnalysis() {
  const datasetId = $("analysisLabDatasetSelect")?.value || state.selectedId;
  const analysisName = $("analysisType")?.value || "retention";
  if (!datasetId) return setStatus("분석할 데이터셋이 없습니다.");
  state.selectedId = datasetId;
  const parameters = { includeReviewRows: Boolean($("includeReviewRows")?.checked) };
  if (analysisName === "dqdv") parameters.voltageBinV = Number($("dqdvVoltageBin")?.value || 0.005);
  const button = $("runDatasetAnalysis");
  if (button) {
    button.disabled = true;
    button.textContent = "분석 실행 중...";
  }
  try {
    const res = await fetch(`/api/datasets/${encodeURIComponent(datasetId)}/analyses`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ analysisName, parameters }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.detail || body.error || "분석 실행에 실패했습니다.");
    state.analysisRuns = [body, ...state.analysisRuns.filter((run) => run.id !== body.id)];
    state.selectedAnalysisRunId = body.id;
    renderAnalysisLab();
    setStatus(`${analysisLabel(analysisName)} 분석을 저장했습니다.`);
  } catch (error) {
    setStatus(error.message || "분석 실행에 실패했습니다.");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "선택 분석 실행";
    }
  }
}

function sampleLabel(d) {
  if (!d) return "선택 없음";
  const cell = d.cell || {};
  return cell.cellId || cell.sampleName || cell.material || d.sourceName || d.id || "데이터";
}

// 숫자 배열에서 최소/최대 범위를 구합니다.
// CV 전압 범위, EIS 주파수 범위처럼 "요약 문장에 쓸 범위"를 만들 때 재사용합니다.
function rangeOf(nums) {
  const arr = nums.filter(Number.isFinite);
  return arr.length ? [Math.min(...arr), Math.max(...arr)] : [null, null];
}

// CYC 데이터 요약에 필요한 핵심 지표를 한 번에 계산합니다.
// 초기/마지막 용량은 노이즈를 줄이려고 앞 3개, 뒤 3개의 평균을 사용합니다.
function cycStats(d) {
  const rows = (d?.rows || []).filter((r) => Number.isFinite(r.cycle)).sort((a, b) => a.cycle - b.cycle);
  const capPts = dischargeSeries(rows).sort((a, b) => a.x - b.x);
  const firstWindow = capPts.slice(0, Math.min(3, capPts.length));
  const lastWindow = capPts.slice(Math.max(0, capPts.length - 3));
  const firstCap = average(firstWindow.map((p) => p.y));
  const lastCap = average(lastWindow.map((p) => p.y));
  const maxCap = Math.max(...capPts.map((p) => p.y).filter(Number.isFinite), NaN);
  const minCap = Math.min(...capPts.map((p) => p.y).filter(Number.isFinite), NaN);
  const retention = Number.isFinite(firstCap) && firstCap > 0 && Number.isFinite(lastCap) ? lastCap / firstCap * 100 : null;
  const fromBest = Number.isFinite(maxCap) && maxCap > 0 && Number.isFinite(lastCap) ? lastCap / maxCap * 100 : null;
  const efficiencyVals = rows.map((r) => Number(r.efficiency)).filter(Number.isFinite);
  const avgEfficiency = average(efficiencyVals);
  const [cycleMin, cycleMax] = rangeOf(rows.map((r) => Number(r.cycle)));
  const segments = inferCRateSegments(d, rows, capPts);
  return { rows, capPts, firstCap, lastCap, maxCap, minCap, retention, fromBest, avgEfficiency, cycleMin, cycleMax, segments };
}

// cycle 사이에서 용량이 급격히 줄어든 구간을 찾습니다.
// 기준은 2% 이상 감소 또는 5 mAh g-1 이상 감소이며, 큰 감소 순서대로 최대 5개만 보여줍니다.
function degradationSegments(stats) {
  const pts = stats.capPts || [];
  if (pts.length < 4) return [];
  const drops = [];
  for (let i = 1; i < pts.length; i += 1) {
    const prev = pts[i - 1];
    const curr = pts[i];
    if (!prev || !curr || !Number.isFinite(prev.y) || prev.y <= 0) continue;
    const loss = prev.y - curr.y;
    const lossPct = loss / prev.y * 100;
    if (lossPct >= 2 || loss >= 5) {
      drops.push({ start: prev.x, end: curr.x, loss, lossPct, from: prev.y, to: curr.y });
    }
  }
  return drops.sort((a, b) => b.lossPct - a.lossPct).slice(0, 5);
}

// "이 데이터의 주요 결과 요약" 카드에 들어갈 HTML을 만듭니다.
// 실제 외부 AI API를 호출하지 않고, 포탈에 있는 실험 데이터를 계산해서 설명형 문장으로 변환합니다.
function aiMainSummaryHtml(d) {
  if (!d) return `<p class="aiEmpty">요약할 데이터를 먼저 선택하세요. 왼쪽 데이터 목록이나 검색 결과에서 CYC/CV/EIS 데이터를 선택하면 여기에 자동 요약이 표시됩니다.</p>`;
  const type = String(d.dataType || "").toLowerCase();
  if (type === "cyc") {
    const s = cycStats(d);
    const rateText = s.segments?.length ? s.segments.map((seg) => seg.label).join(" | ") : "자동 구간 없음";
    const quality = s.retention == null ? "용량 유지율을 계산하기에는 데이터가 부족합니다." : (s.retention >= 95 ? "용량 유지가 매우 안정적입니다." : s.retention >= 85 ? "중간 수준의 용량 감소가 관찰됩니다." : "뚜렷한 성능 저하가 관찰됩니다.");
    return `
      <p class="aiSummaryLead">${escapeXml(sampleLabel(d))}는 ${s.cycleMin ?? "-"}-${s.cycleMax ?? "-"} cycle 범위의 CYC 데이터이며, ${quality}</p>
      <div class="aiMetricGrid">
        <div class="aiMetric"><strong>초기 용량</strong><span>${s.firstCap == null ? "-" : `${fmt(s.firstCap, 5)} mAh g-1`}</span></div>
        <div class="aiMetric"><strong>마지막 용량</strong><span>${s.lastCap == null ? "-" : `${fmt(s.lastCap, 5)} mAh g-1`}</span></div>
        <div class="aiMetric"><strong>유지율</strong><span>${s.retention == null ? "-" : `${fmt(s.retention, 4)} %`}</span></div>
        <div class="aiMetric"><strong>평균 효율</strong><span>${s.avgEfficiency == null ? "-" : `${fmt(s.avgEfficiency, 5)} %`}</span></div>
      </div>
      <ul class="aiBulletList">
        <li>가장 높은 방전 용량은 ${Number.isFinite(s.maxCap) ? `${fmt(s.maxCap, 5)} mAh g-1` : "-"} 수준입니다.</li>
        <li>C-rate 추정 구간은 ${escapeXml(rateText)}입니다.</li>
        <li>전극 계산값이 연결된 경우 loading caption과 기준 전류 설명에 함께 반영됩니다.</li>
      </ul>`;
  }
  if (type === "eis") {
    const rows = d.rows || [];
    const [fMin, fMax] = rangeOf(rows.map((r) => Number(r.frequency)));
    const [zrMin, zrMax] = rangeOf(rows.map((r) => Number(r.zreal)));
    return `
      <p class="aiSummaryLead">${escapeXml(sampleLabel(d))}는 ${rows.length}개 포인트의 EIS 데이터입니다. 주파수와 임피던스 범위를 중심으로 Nyquist/Bode 해석에 사용할 수 있습니다.</p>
      <div class="aiMetricGrid">
        <div class="aiMetric"><strong>포인트 수</strong><span>${rows.length}</span></div>
        <div class="aiMetric"><strong>주파수 범위</strong><span>${fMin == null ? "-" : `${fmt(fMin, 3)}-${fmt(fMax, 3)}`}</span></div>
        <div class="aiMetric"><strong>Z' 범위</strong><span>${zrMin == null ? "-" : `${fmt(zrMin, 4)}-${fmt(zrMax, 4)}`}</span></div>
        <div class="aiMetric"><strong>데이터 타입</strong><span>EIS</span></div>
      </div>`;
  }
  if (type === "cv") {
    const rows = d.rows || [];
    const [vMin, vMax] = rangeOf(rows.map((r) => Number(r.voltage)));
    const [iMin, iMax] = rangeOf(rows.map((r) => Number(r.current)));
    return `
      <p class="aiSummaryLead">${escapeXml(sampleLabel(d))}는 ${rows.length}개 포인트의 CV 데이터입니다. 전압-전류 범위와 peak 변화 비교에 사용할 수 있습니다.</p>
      <div class="aiMetricGrid">
        <div class="aiMetric"><strong>포인트 수</strong><span>${rows.length}</span></div>
        <div class="aiMetric"><strong>전압 범위</strong><span>${vMin == null ? "-" : `${fmt(vMin, 4)}-${fmt(vMax, 4)} V`}</span></div>
        <div class="aiMetric"><strong>전류 범위</strong><span>${iMin == null ? "-" : `${fmt(iMin, 4)}-${fmt(iMax, 4)}`}</span></div>
        <div class="aiMetric"><strong>데이터 타입</strong><span>CV</span></div>
      </div>`;
  }
  return `<p class="aiEmpty">${escapeXml(typeDisplay(type))} 데이터는 현재 기본 요약만 지원합니다. CYC 데이터를 선택하면 성능 저하와 비교 설명까지 자동 계산됩니다.</p>`;
}

// "성능 저하 구간 표시" 카드입니다.
// CYC가 아닌 데이터는 아직 저하 구간 개념이 명확하지 않아 안내 문구만 보여줍니다.
function aiDegradationHtml(d) {
  if (!d) return `<p class="aiEmpty">데이터를 선택하면 성능 저하 구간을 계산합니다.</p>`;
  if (String(d.dataType || "").toLowerCase() !== "cyc") return `<p class="aiEmpty">성능 저하 구간 표시는 CYC 데이터에서 우선 지원됩니다.</p>`;
  const stats = cycStats(d);
  const drops = degradationSegments(stats);
  if (!drops.length) {
    return `<p class="aiSummaryLead">2% 이상 급격한 cycle-to-cycle 용량 저하는 뚜렷하게 보이지 않습니다.</p>
      <ul class="aiBulletList">
        <li>전체 유지율: ${stats.retention == null ? "-" : `${fmt(stats.retention, 4)} %`}</li>
        <li>최고 용량 대비 마지막 용량: ${stats.fromBest == null ? "-" : `${fmt(stats.fromBest, 4)} %`}</li>
      </ul>`;
  }
  return `<div class="aiDegradeList">${drops.map((drop) => `
    <div class="aiSegment">
      <strong>Cycle ${escapeXml(drop.start)} -> ${escapeXml(drop.end)}</strong>
      <span>용량이 ${fmt(drop.from, 5)}에서 ${fmt(drop.to, 5)} mAh g-1로 감소했습니다. 감소폭은 ${fmt(drop.loss, 4)} mAh g-1, 약 ${fmt(drop.lossPct, 4)}%입니다.</span>
    </div>`).join("")}</div>`;
}

// "비교 결과 설명" 카드입니다.
// 피겨 모음에서 체크한 CYC 데이터들을 비교 대상으로 사용합니다.
function comparisonSummaryHtml() {
  const selected = state.compareIds
    .map((id) => state.datasets.find((d) => d.id === id))
    .filter((d) => d && d.dataType === "cyc");
  if (selected.length < 2) {
    return `<p class="aiEmpty">비교 결과 설명을 보려면 피겨 모음에서 CYC 데이터를 2개 이상 체크한 뒤 이 페이지로 돌아오세요. 현재 선택된 비교 대상은 ${selected.length}개입니다.</p>`;
  }
  const rows = selected.map((d) => ({ d, stats: cycStats(d) }));
  const ranked = [...rows].sort((a, b) => (b.stats.lastCap || 0) - (a.stats.lastCap || 0));
  const best = ranked[0];
  const stable = [...rows].filter((item) => item.stats.retention != null).sort((a, b) => b.stats.retention - a.stats.retention)[0];
  return `
    <p class="aiSummaryLead">${selected.length}개 CYC 데이터를 비교했습니다. 마지막 용량 기준으로는 ${escapeXml(sampleLabel(best.d))}가 가장 높습니다.</p>
    <div class="aiCompareList">
      ${ranked.map((item, idx) => `
        <div class="aiCompareItem">
          <strong>${idx + 1}. ${escapeXml(sampleLabel(item.d))}</strong>
          <span>마지막 용량 ${item.stats.lastCap == null ? "-" : `${fmt(item.stats.lastCap, 5)} mAh g-1`} · 유지율 ${item.stats.retention == null ? "-" : `${fmt(item.stats.retention, 4)} %`} · ${item.stats.cycleMin ?? "-"}-${item.stats.cycleMax ?? "-"} cycle</span>
        </div>`).join("")}
    </div>
    <ul class="aiBulletList">
      <li>용량 유지율 기준으로는 ${stable ? escapeXml(sampleLabel(stable.d)) : "-"}가 가장 안정적으로 보입니다.</li>
      <li>논문용 비교 설명에서는 마지막 용량, 유지율, cycle 범위를 함께 제시하는 것이 좋습니다.</li>
    </ul>`;
}

// AI 요약 페이지 전체를 다시 그립니다.
// 데이터 선택, 비교 체크, 새로고침 버튼이 눌릴 때 이 함수를 호출하면 최신 상태가 반영됩니다.
function aiValue(value, unit = "", digits = 5) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return `${fmt(n, digits)}${unit ? ` ${unit}` : ""}`;
}

function aiPercent(value, digits = 4) {
  const n = Number(value);
  return Number.isFinite(n) ? `${fmt(n, digits)} %` : "-";
}

function aiStatusFromCyc(stats) {
  const retention = Number(stats?.retention);
  const efficiency = Number(stats?.avgEfficiency);
  const drops = degradationSegments(stats || {});
  if (!Number.isFinite(retention)) return { label: "데이터 부족", tone: "neutral", text: "용량 유지율을 안정적으로 계산하기에는 데이터가 부족합니다." };
  if (retention < 80 || drops.length >= 3) return { label: "강한 열화", tone: "danger", text: "용량 감소가 뚜렷해 원인 확인이 필요합니다." };
  if (retention < 90 || (Number.isFinite(efficiency) && (efficiency < 97 || efficiency > 103))) return { label: "점검 필요", tone: "warning", text: "일부 구간에서 성능 변화가 관찰됩니다." };
  if (retention >= 95) return { label: "안정", tone: "good", text: "현재 cycle 범위에서는 용량 유지가 비교적 안정적입니다." };
  return { label: "보통", tone: "neutral", text: "완만한 용량 감소가 관찰됩니다." };
}

function aiMainSummaryV2Html(d) {
  if (!d) return `<p class="aiEmpty">요약할 데이터를 먼저 선택하세요. CYC/CV/EIS 데이터를 선택하면 핵심 지표와 해석을 자동으로 정리합니다.</p>`;
  const type = String(d.dataType || "").toLowerCase();
  if (type === "cyc") {
    const s = cycStats(d);
    const status = aiStatusFromCyc(s);
    const capLoss = Number.isFinite(s.firstCap) && Number.isFinite(s.lastCap) ? s.firstCap - s.lastCap : null;
    const rateText = s.segments?.length ? s.segments.slice(0, 5).map((seg) => seg.label).join(" / ") : "자동 C-rate 구간 없음";
    return `
      <div class="aiStatus ${status.tone}"><strong>${escapeXml(status.label)}</strong><span>${escapeXml(status.text)}</span></div>
      <p class="aiSummaryLead">${escapeXml(sampleLabel(d))}는 ${s.cycleMin ?? "-"}-${s.cycleMax ?? "-"} cycle 범위의 CYC 데이터입니다. 초기 평균 용량 대비 마지막 평균 용량 변화를 기준으로 성능 유지 특성을 평가했습니다.</p>
      <div class="aiMetricGrid">
        <div class="aiMetric"><strong>초기 평균 용량</strong><span>${aiValue(s.firstCap, "mAh g-1")}</span></div>
        <div class="aiMetric"><strong>마지막 평균 용량</strong><span>${aiValue(s.lastCap, "mAh g-1")}</span></div>
        <div class="aiMetric"><strong>용량 유지율</strong><span>${aiPercent(s.retention)}</span></div>
        <div class="aiMetric"><strong>용량 감소량</strong><span>${aiValue(capLoss, "mAh g-1")}</span></div>
        <div class="aiMetric"><strong>최고 방전용량</strong><span>${aiValue(s.maxCap, "mAh g-1")}</span></div>
        <div class="aiMetric"><strong>최고 대비 마지막</strong><span>${aiPercent(s.fromBest)}</span></div>
        <div class="aiMetric"><strong>평균 효율</strong><span>${aiPercent(s.avgEfficiency, 5)}</span></div>
        <div class="aiMetric"><strong>C-rate 추정</strong><span>${escapeXml(rateText)}</span></div>
      </div>`;
  }
  if (type === "eis") {
    const rows = d.rows || [];
    const [fMin, fMax] = rangeOf(rows.map((r) => Number(r.frequency)));
    const [zrMin, zrMax] = rangeOf(rows.map((r) => Number(r.zreal)));
    const [ziMin, ziMax] = rangeOf(rows.map((r) => Number(r.zimag)));
    const rsGuess = rows.map((r) => Number(r.zreal)).filter(Number.isFinite).sort((a, b) => a - b)[0];
    return `
      <p class="aiSummaryLead">${escapeXml(sampleLabel(d))}는 ${rows.length}개 포인트의 EIS 데이터입니다. Nyquist/Bode 해석 전 주파수 범위와 임피던스 범위를 먼저 점검합니다.</p>
      <div class="aiMetricGrid">
        <div class="aiMetric"><strong>포인트 수</strong><span>${rows.length}</span></div>
        <div class="aiMetric"><strong>주파수 범위</strong><span>${fMin == null ? "-" : `${fmt(fMin, 3)}-${fmt(fMax, 3)}`}</span></div>
        <div class="aiMetric"><strong>Z' 범위</strong><span>${zrMin == null ? "-" : `${fmt(zrMin, 4)}-${fmt(zrMax, 4)}`}</span></div>
        <div class="aiMetric"><strong>Z'' 범위</strong><span>${ziMin == null ? "-" : `${fmt(ziMin, 4)}-${fmt(ziMax, 4)}`}</span></div>
        <div class="aiMetric"><strong>Rs 후보</strong><span>${aiValue(rsGuess, "ohm", 4)}</span></div>
        <div class="aiMetric"><strong>추천 해석</strong><span>Nyquist + Bode</span></div>
      </div>`;
  }
  if (type === "cv") {
    const rows = d.rows || [];
    const [vMin, vMax] = rangeOf(rows.map((r) => Number(r.voltage)));
    const [iMin, iMax] = rangeOf(rows.map((r) => Number(r.current)));
    const peak = rows.map((r) => Math.abs(Number(r.current))).filter(Number.isFinite).sort((a, b) => b - a)[0];
    return `
      <p class="aiSummaryLead">${escapeXml(sampleLabel(d))}는 ${rows.length}개 포인트의 CV 데이터입니다. 전압 창, 전류 범위, peak 크기를 중심으로 비교 해석할 수 있습니다.</p>
      <div class="aiMetricGrid">
        <div class="aiMetric"><strong>포인트 수</strong><span>${rows.length}</span></div>
        <div class="aiMetric"><strong>전압 범위</strong><span>${vMin == null ? "-" : `${fmt(vMin, 4)}-${fmt(vMax, 4)} V`}</span></div>
        <div class="aiMetric"><strong>전류 범위</strong><span>${iMin == null ? "-" : `${fmt(iMin, 4)}-${fmt(iMax, 4)}`}</span></div>
        <div class="aiMetric"><strong>최대 |전류|</strong><span>${aiValue(peak, "", 4)}</span></div>
      </div>`;
  }
  return `<p class="aiEmpty">${escapeXml(typeDisplay(type))} 데이터는 현재 기본 요약만 지원합니다.</p>`;
}

function aiDegradationV2Html(d) {
  if (!d) return `<p class="aiEmpty">데이터를 선택하면 급격한 성능 저하 구간을 자동으로 찾습니다.</p>`;
  if (String(d.dataType || "").toLowerCase() !== "cyc") return `<p class="aiEmpty">성능 저하 구간 분석은 CYC 데이터에서 우선 지원됩니다.</p>`;
  const stats = cycStats(d);
  const drops = degradationSegments(stats);
  if (!drops.length) {
    return `<p class="aiSummaryLead">2% 이상 급격한 cycle-to-cycle 용량 저하는 뚜렷하게 보이지 않습니다.</p>
      <div class="aiSignalGrid">
        <div class="aiSignal good"><strong>전체 유지율</strong><span>${aiPercent(stats.retention)}</span></div>
        <div class="aiSignal neutral"><strong>최고 대비 마지막</strong><span>${aiPercent(stats.fromBest)}</span></div>
      </div>`;
  }
  return `<div class="aiDegradeList">${drops.map((drop, idx) => `
    <div class="aiSegment ${idx === 0 ? "critical" : ""}">
      <strong>Cycle ${escapeXml(drop.start)} -> ${escapeXml(drop.end)}</strong>
      <span>방전용량이 ${fmt(drop.from, 5)}에서 ${fmt(drop.to, 5)} mAh g-1로 감소했습니다. 감소량은 ${fmt(drop.loss, 4)} mAh g-1, 비율은 ${fmt(drop.lossPct, 4)}%입니다.</span>
    </div>`).join("")}</div>`;
}

function aiInsightSummaryHtml(d) {
  if (!d) return `<p class="aiEmpty">데이터를 선택하면 실험 해석과 확인 포인트를 제안합니다.</p>`;
  const type = String(d.dataType || "").toLowerCase();
  if (type === "cyc") {
    const stats = cycStats(d);
    const drops = degradationSegments(stats);
    const checks = [];
    if (stats.retention != null && stats.retention < 85) checks.push("용량 유지율이 낮으므로 전극 loading, cutoff voltage, 전류 조건을 우선 확인하세요.");
    if (drops.length) checks.push(`가장 큰 감소는 cycle ${drops[0].start}->${drops[0].end} 구간입니다. 해당 구간 전후의 전압 프로파일을 같이 확인하는 것이 좋습니다.`);
    if (stats.avgEfficiency != null && (stats.avgEfficiency < 97 || stats.avgEfficiency > 103)) checks.push("평균 coulombic efficiency가 일반적인 안정 범위를 벗어날 수 있어 원 데이터의 charge/discharge capacity 열을 확인하세요.");
    if (stats.segments?.length) checks.push(`C-rate 구간이 ${stats.segments.length}개로 추정됩니다. rate test라면 cycle 구간별 전류 조건을 피겨 caption에 같이 적는 것이 좋습니다.`);
    if (d.cell?.electrodeCalc) checks.push("전극 계산 저장값이 연결되어 있으므로 loading, 1C 전류, C-rate별 전류를 함께 보고서에 넣을 수 있습니다.");
    if (!checks.length) checks.push("현재 데이터에서는 큰 이상 신호가 뚜렷하지 않습니다. 반복 셀 데이터와 비교하면 신뢰도가 올라갑니다.");
    return `<ul class="aiBulletList aiInsightList">${checks.map((text) => `<li>${escapeXml(text)}</li>`).join("")}</ul>`;
  }
  if (type === "eis") {
    return `<ul class="aiBulletList aiInsightList">
      <li>Nyquist 반원의 시작점은 Rs 후보로 보고, 반원 직경은 charge-transfer resistance 변화와 함께 비교하세요.</li>
      <li>저주파 tail이 길게 나타나면 확산 지배 성분이 커졌을 가능성이 있으므로 Bode plot도 함께 확인하는 것이 좋습니다.</li>
      <li>같은 셀의 cycling 전후 EIS를 비교하면 계면 저항 증가 여부를 더 명확히 설명할 수 있습니다.</li>
    </ul>`;
  }
  if (type === "cv") {
    return `<ul class="aiBulletList aiInsightList">
      <li>산화/환원 peak 위치 이동은 분극 증가 또는 반응 속도 변화의 신호일 수 있습니다.</li>
      <li>scan rate별 CV라면 peak current와 scan rate의 관계를 비교하면 확산 지배 여부를 설명하기 좋습니다.</li>
      <li>전압 창이 실험 조건과 맞는지 먼저 확인한 뒤 peak 면적과 전류 응답을 비교하세요.</li>
    </ul>`;
  }
  return `<p class="aiEmpty">이 데이터 타입은 아직 해석 포인트가 준비되지 않았습니다.</p>`;
}

function aiWritingSummaryHtml(d) {
  if (!d) return `<p class="aiEmpty">데이터를 선택하면 논문/발표자료에 바로 옮길 수 있는 문장을 생성합니다.</p>`;
  const label = sampleLabel(d);
  const type = String(d.dataType || "").toLowerCase();
  if (type === "cyc") {
    const s = cycStats(d);
    const ko = `${label} 시료는 ${s.cycleMin ?? "-"}-${s.cycleMax ?? "-"} cycle 동안 초기 평균 방전용량 ${aiValue(s.firstCap, "mAh g-1")}에서 마지막 평균 방전용량 ${aiValue(s.lastCap, "mAh g-1")}로 변화했으며, 용량 유지율은 ${aiPercent(s.retention)}로 계산되었다.`;
    const en = `The ${label} cell delivered an initial average discharge capacity of ${aiValue(s.firstCap, "mAh g-1")} and retained ${aiPercent(s.retention)} after ${s.cycleMax ?? "-"} cycles.`;
    return `
      <div class="aiWritingBlock"><strong>한국어 요약</strong><p>${escapeXml(ko)}</p></div>
      <div class="aiWritingBlock"><strong>English draft</strong><p>${escapeXml(en)}</p></div>
      <div class="aiWritingBlock"><strong>PPT 한 줄</strong><p>${escapeXml(`${label}: ${s.cycleMin ?? "-"}-${s.cycleMax ?? "-"} cycle, retention ${aiPercent(s.retention)}, final capacity ${aiValue(s.lastCap, "mAh g-1")}.`)}</p></div>`;
  }
  if (type === "eis") {
    const rows = d.rows || [];
    const [fMin, fMax] = rangeOf(rows.map((r) => Number(r.frequency)));
    return `<div class="aiWritingBlock"><strong>한국어 요약</strong><p>${escapeXml(`${label}의 EIS 데이터는 ${rows.length}개 포인트로 구성되며, ${fMin == null ? "주파수 범위 확인이 필요" : `${fmt(fMin, 3)}-${fmt(fMax, 3)} 범위`}에서 임피던스 응답을 비교할 수 있다.`)}</p></div>`;
  }
  if (type === "cv") {
    const rows = d.rows || [];
    const [vMin, vMax] = rangeOf(rows.map((r) => Number(r.voltage)));
    return `<div class="aiWritingBlock"><strong>한국어 요약</strong><p>${escapeXml(`${label}의 CV 데이터는 ${rows.length}개 포인트로 구성되며, ${vMin == null ? "전압 범위 확인이 필요" : `${fmt(vMin, 4)}-${fmt(vMax, 4)} V 전압 창`}에서 전류 응답과 peak 변화를 비교할 수 있다.`)}</p></div>`;
  }
  return `<p class="aiEmpty">논문/PPT 문장은 CYC, CV, EIS 데이터에서 우선 지원됩니다.</p>`;
}

function comparisonSummaryV2Html() {
  const selected = state.compareIds
    .map((id) => state.datasets.find((d) => d.id === id))
    .filter((d) => d && d.dataType === "cyc");
  if (selected.length < 2) {
    return `<p class="aiEmpty">비교 설명을 만들려면 피겨 모음에서 CYC 데이터를 2개 이상 체크하세요. 현재 선택된 비교 대상은 ${selected.length}개입니다.</p>`;
  }
  const rows = selected.map((d) => ({ d, stats: cycStats(d) }));
  const byCapacity = [...rows].sort((a, b) => (b.stats.lastCap || 0) - (a.stats.lastCap || 0));
  const byRetention = [...rows].filter((item) => item.stats.retention != null).sort((a, b) => b.stats.retention - a.stats.retention);
  const bestCap = byCapacity[0];
  const bestStable = byRetention[0];
  return `
    <p class="aiSummaryLead">${selected.length}개 CYC 데이터를 비교했습니다. 마지막 용량 기준 최고 샘플은 ${escapeXml(sampleLabel(bestCap.d))}${bestStable ? `, 유지율 기준 최고 샘플은 ${escapeXml(sampleLabel(bestStable.d))}` : ""}입니다.</p>
    <div class="aiCompareList">
      ${byCapacity.map((item, idx) => `
        <div class="aiCompareItem">
          <strong>${idx + 1}. ${escapeXml(sampleLabel(item.d))}</strong>
          <span>마지막 용량 ${aiValue(item.stats.lastCap, "mAh g-1")} / 유지율 ${aiPercent(item.stats.retention)} / ${item.stats.cycleMin ?? "-"}-${item.stats.cycleMax ?? "-"} cycle</span>
        </div>`).join("")}
    </div>
    <ul class="aiBulletList">
      <li>절대 용량이 중요한 비교에서는 마지막 방전용량 순위를 우선 제시하세요.</li>
      <li>장기 안정성이 중요한 비교에서는 retention과 급락 구간 유무를 함께 설명하는 것이 좋습니다.</li>
    </ul>`;
}

function aiLoadingHtml() {
  return `<div class="aiLoading"><strong>AI 해석 생성 중</strong><span>Python 백엔드가 핵심값을 계산하고 모델 응답을 기다리고 있습니다.</span></div>`;
}

function aiApiNoticeHtml(mode, model, reason = "") {
  if (mode === "openai") {
    return `<div class="aiApiNotice live"><strong>실제 AI 해석</strong><span>Python 백엔드 → 핵심값 계산 → OpenAI ${escapeXml(model || "")} 응답으로 생성했습니다.</span></div>`;
  }
  return `<div class="aiApiNotice fallback"><strong>로컬 fallback</strong><span>${escapeXml(reason || "OPENAI_API_KEY가 없어서 기존 계산 기반 요약으로 표시합니다.")}</span></div>`;
}

function aiSectionFromApiHtml(section, fallbackHtml) {
  if (!section || typeof section !== "object") return fallbackHtml;
  const lead = String(section.lead || "").trim();
  const bullets = Array.isArray(section.bullets) ? section.bullets.filter(Boolean) : [];
  if (!lead && !bullets.length) return fallbackHtml;
  return `
    ${lead ? `<p class="aiSummaryLead">${escapeXml(lead)}</p>` : ""}
    ${bullets.length ? `<ul class="aiBulletList">${bullets.map((item) => `<li>${escapeXml(item)}</li>`).join("")}</ul>` : ""}`;
}

function renderLocalAISummary(d, reason = "") {
  const dataset = d || currentDataset();
  const main = $("aiMainSummary");
  const degrade = $("aiDegradationSummary");
  const compare = $("aiCompareSummary");
  const insight = $("aiInsightSummary");
  const writing = $("aiWritingSummary");
  if (main) main.innerHTML = `${reason ? aiApiNoticeHtml("local", "local", reason) : ""}${aiMainSummaryV2Html(dataset)}`;
  if (degrade) degrade.innerHTML = aiDegradationV2Html(dataset);
  if (compare) compare.innerHTML = comparisonSummaryV2Html();
  if (insight) insight.innerHTML = aiInsightSummaryHtml(dataset);
  if (writing) writing.innerHTML = aiWritingSummaryHtml(dataset);
  state.lastAiSummary = dataset ? {
    datasetId: dataset.id,
    mode: "local",
    content: {
      main: main?.textContent || "",
      degradation: degrade?.textContent || "",
      comparison: compare?.textContent || "",
      insight: insight?.textContent || "",
      writing: writing?.textContent || "",
    },
  } : null;
}

async function renderAISummary() {
  const d = currentDataset();
  if (!d) {
    renderLocalAISummary(d);
    return;
  }
  const requestId = ++aiSummaryRequestId;
  const main = $("aiMainSummary");
  const degrade = $("aiDegradationSummary");
  const compare = $("aiCompareSummary");
  const insight = $("aiInsightSummary");
  const writing = $("aiWritingSummary");
  const loading = aiLoadingHtml();
  if (main) main.innerHTML = loading;
  if (degrade) degrade.innerHTML = loading;
  if (compare) compare.innerHTML = loading;
  if (insight) insight.innerHTML = loading;
  if (writing) writing.innerHTML = loading;
  setStatus("AI 요약 생성 중...");

  try {
    const res = await fetch("/api/ai-summary", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ datasetId: d.id, compareIds: state.compareIds }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || "AI 요약 생성 실패");
    if (requestId !== aiSummaryRequestId) return;
    const sections = body.sections || {};
    const notice = aiApiNoticeHtml(body.mode, body.model, body.reason);
    if (main) main.innerHTML = `${notice}${aiSectionFromApiHtml(sections.main, aiMainSummaryV2Html(d))}`;
    if (degrade) degrade.innerHTML = aiSectionFromApiHtml(sections.degradation, aiDegradationV2Html(d));
    if (compare) compare.innerHTML = aiSectionFromApiHtml(sections.comparison, comparisonSummaryV2Html());
    if (insight) insight.innerHTML = aiSectionFromApiHtml(sections.insight, aiInsightSummaryHtml(d));
    if (writing) writing.innerHTML = aiSectionFromApiHtml(sections.writing, aiWritingSummaryHtml(d));
    state.lastAiSummary = { datasetId: d.id, mode: body.mode || "local", content: sections };
    setStatus(body.mode === "openai" ? "OpenAI AI 요약 완료" : "로컬 요약 표시");
  } catch (err) {
    if (requestId !== aiSummaryRequestId) return;
    renderLocalAISummary(d, err.message || "AI 요약 API 호출 실패");
    setStatus("로컬 요약 표시");
  }
}

async function saveAiReport() {
  const d = currentDataset();
  if (!d) return setStatus("먼저 보고서로 저장할 데이터를 선택해주세요.");
  const fallback = {
    main: $("aiMainSummary")?.textContent || "",
    degradation: $("aiDegradationSummary")?.textContent || "",
    comparison: $("aiCompareSummary")?.textContent || "",
    insight: $("aiInsightSummary")?.textContent || "",
    writing: $("aiWritingSummary")?.textContent || "",
  };
  const summary = state.lastAiSummary?.datasetId === d.id ? state.lastAiSummary : { datasetId: d.id, mode: "local", content: fallback };
  try {
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        datasetId: d.id,
        reportType: "ai-summary",
        title: `${sampleLabel(d)} AI 분석 보고서`,
        content: { mode: summary.mode, ...summary.content },
      }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || "AI 보고서 저장에 실패했습니다.");
    await loadCellWorkspace(d);
    setStatus("AI 요약을 보고서로 저장했습니다.");
  } catch (error) {
    setStatus(error.message || "AI 보고서 저장에 실패했습니다.");
  }
}

function renderTable(d) {
  const body = $("dataTable");
  const head = $("excelTableHead");
  const summary = $("excelSummary");
  if (!body || !head) return;
  if (!d || !Array.isArray(d.rows) || !d.rows.length) {
    head.innerHTML = "";
    body.innerHTML = `<tr><td>표시할 데이터가 없습니다.</td></tr>`;
    if (summary) summary.textContent = "0 rows";
    updateExcelUndoButton();
    return;
  }
  const preferred = {
    cyc: [
      ["cycle", "Cycle"],
      ["capacity", "Discharge capacity"],
      ["chargeCapacity", "Charge capacity"],
      ["efficiency", "Efficiency"],
      ["voltage", "Voltage"],
      ["current", "Current"],
      ["time", "Time"],
    ],
    eis: [
      ["frequency", "Frequency"],
      ["zreal", "Z'"],
      ["zimag", "Z''"],
      ["mag", "|Z|"],
      ["phase", "θ"],
    ],
    cv: [
      ["voltage", "Voltage"],
      ["current", "Current"],
      ["cycle", "Cycle"],
    ],
  };
  const keys = preferred[d.dataType] || Object.keys(d.rows[0]).map((key) => [key, key]);
  const columns = [["__index", "#"], ...keys.filter(([key]) => d.rows.some((row) => row[key] !== undefined && row[key] !== null && row[key] !== ""))];
  head.innerHTML = `<tr>${columns.map(([, label]) => `<th>${escapeXml(label)}</th>`).join("")}</tr>`;
  body.innerHTML = d.rows.map((r, i) => `<tr>${columns.map(([key]) => {
    const value = key === "__index" ? i + 1 : r[key];
    if (key === "__index") return `<td class="rowIndex">${escapeXml(value)}</td>`;
    return `<td class="editableCell" contenteditable="true" data-row-index="${i}" data-key="${escapeAttr(key)}" title="클릭해서 수정">${typeof value === "number" ? escapeXml(fmt(value, 6)) : escapeXml(value ?? "")}</td>`;
  }).join("")}</tr>`).join("");
  if (summary) summary.textContent = `${d.rows.length} rows`;
  updateExcelUndoButton();
  bindEditableTable();
}

function bindEditableTable() {
  const body = $("dataTable");
  if (!body) return;
  for (const cell of body.querySelectorAll(".editableCell")) {
    cell.addEventListener("focus", () => {
      cell.dataset.originalValue = cell.textContent || "";
      cell.classList.add("editing");
      setStatus("표 수정 중...");
    });
    cell.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        cell.blur();
      }
      if (event.key === "Escape") {
        event.preventDefault();
        cell.textContent = cell.dataset.originalValue || "";
        cell.blur();
      }
    });
    cell.addEventListener("blur", () => {
      cell.classList.remove("editing");
      applyTableCellEdit(cell);
    });
  }
}

function coerceTableValue(text, previous) {
  const trimmed = String(text ?? "").trim();
  if (trimmed === "") return "";
  const numeric = Number(trimmed.replace(/,/g, ""));
  if (Number.isFinite(numeric) && (typeof previous === "number" || /^[-+]?\d*\.?\d+(?:e[-+]?\d+)?$/i.test(trimmed.replace(/,/g, "")))) {
    return numeric;
  }
  return trimmed;
}

function applyTableCellEdit(cell) {
  const d = state.datasets.find((x) => x.id === state.selectedId);
  if (!d) return;
  const rowIndex = Number(cell.dataset.rowIndex);
  const key = cell.dataset.key;
  if (!Number.isInteger(rowIndex) || !key || !d.rows[rowIndex]) return;
  const previous = d.rows[rowIndex][key];
  const next = coerceTableValue(cell.textContent, previous);
  if (next === previous || String(next) === String(previous ?? "")) return;
  d.rows[rowIndex][key] = next;
  state.datasets = state.datasets.map((item) => item.id === d.id ? d : item);
  state.filtered = state.filtered.map((item) => item.id === d.id ? d : item);
  renderFigure(d);
  renderExperimentInfo(d);
  scheduleRowsSave(d);
}

function scheduleRowsSave(d) {
  clearTimeout(state.tableSaveTimer);
  setStatus("표 수정 반영 중...");
  state.tableSaveTimer = setTimeout(() => saveRowsEdit(d), 650);
}

async function saveRowsEdit(d) {
  try {
    const res = await fetch(`/api/datasets/${encodeURIComponent(d.id)}`, {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ rows: d.rows }),
    });
    const saved = await res.json();
    if (!res.ok) throw new Error(saved.error || "표 저장 실패");
    state.datasets = state.datasets.map((item) => item.id === saved.id ? saved : item);
    state.filtered = state.filtered.map((item) => item.id === saved.id ? saved : item);
    setStatus("표 수정이 피겨에 반영되고 저장됐습니다.");
  } catch (error) {
    setStatus(`표 저장 실패: ${error.message}`);
  }
}

// 하단 "엑셀 데이터" 표를 작은 스프레드시트처럼 다루는 기능입니다.
// 셀 직접 수정, Tab/Enter 이동, 여러 칸 붙여넣기, 행 추가/삭제, 자동 저장을 이 묶음에서 처리합니다.
function tableColumnDefs(d) {
  const preferred = {
    cyc: [
      ["cycle", "Cycle"],
      ["capacity", "Discharge capacity"],
      ["chargeCapacity", "Charge capacity"],
      ["efficiency", "Efficiency"],
      ["voltage", "Voltage"],
      ["current", "Current"],
      ["time", "Time"],
    ],
    eis: [
      ["frequency", "Frequency"],
      ["zreal", "Z'"],
      ["zimag", "Z''"],
      ["mag", "|Z|"],
      ["phase", "θ"],
    ],
    cv: [
      ["voltage", "Voltage"],
      ["current", "Current"],
      ["cycle", "Cycle"],
    ],
  };
  const rows = Array.isArray(d?.rows) ? d.rows : [];
  const rowKeys = [...new Set(rows.flatMap((row) => Object.keys(row || {})))];
  const base = preferred[d?.dataType] || rowKeys.map((key) => [key, key]);
  const baseKeys = new Set(base.map(([key]) => key));
  const visibleBase = base.filter(([key]) => rows.some((row) => row[key] !== undefined && row[key] !== null && row[key] !== ""));
  const extras = rowKeys
    .filter((key) => !baseKeys.has(key))
    .filter((key) => rows.some((row) => row[key] !== undefined && row[key] !== null && row[key] !== ""))
    .map((key) => [key, key]);
  const columns = [...visibleBase, ...extras];
  return columns.length ? columns : base.slice(0, Math.min(base.length, 5));
}

// 숫자는 보기 좋게 줄이고, 문자열은 그대로 보여주는 표 표시용 포맷터입니다.
function formatTableValue(value) {
  return typeof value === "number" ? fmt(value, 6) : (value ?? "");
}

// 선택된 데이터셋의 rows를 화면 표로 변환합니다.
// contenteditable 셀을 만들어서 사용자가 바로 값을 고칠 수 있게 합니다.
function renderTable(d) {
  const body = $("dataTable");
  const head = $("excelTableHead");
  const summary = $("excelSummary");
  if (!body || !head) return;
  state.tableSelection = null;
  if (!d || !Array.isArray(d.rows) || !d.rows.length) {
    head.innerHTML = "";
    body.innerHTML = `<tr><td class="emptyCell" colspan="99">표시할 데이터가 없습니다.</td></tr>`;
    if (summary) summary.textContent = "0 rows";
    updateExcelUndoButton();
    return;
  }
  const columns = [["__index", "#"], ...tableColumnDefs(d)];
  head.innerHTML = `<tr>${columns.map(([, label]) => `<th>${escapeXml(label)}</th>`).join("")}</tr>`;
  body.innerHTML = d.rows.map((row, i) => `<tr data-row-index="${i}">${columns.map(([key]) => {
    const value = key === "__index" ? i + 1 : row[key];
    if (key === "__index") return `<td class="rowIndex" data-row-index="${i}" title="행 선택">${escapeXml(value)}</td>`;
    return `<td class="editableCell" contenteditable="true" spellcheck="false" data-row-index="${i}" data-key="${escapeAttr(key)}" title="클릭해서 수정">${escapeXml(formatTableValue(value))}</td>`;
  }).join("")}</tr>`).join("");
  if (summary) summary.textContent = `${d.rows.length} rows · editable`;
  updateExcelUndoButton();
  bindEditableTable();
}

// 표 안의 각 셀에 클릭/키보드/붙여넣기 이벤트를 연결합니다.
// 이 함수는 renderTable이 표를 새로 그린 직후마다 다시 호출되어야 합니다.
function bindEditableTable() {
  const body = $("dataTable");
  if (!body) return;
  for (const indexCell of body.querySelectorAll(".rowIndex")) {
    indexCell.addEventListener("click", () => selectTableRow(Number(indexCell.dataset.rowIndex)));
  }
  for (const cell of body.querySelectorAll(".editableCell")) {
    cell.addEventListener("focus", () => {
      cell.dataset.originalValue = cell.textContent || "";
      cell.classList.add("editing");
      selectTableCell(cell);
      setStatus("표 수정 중...");
    });
    cell.addEventListener("click", () => selectTableCell(cell));
    cell.addEventListener("paste", (event) => handleTablePaste(event, cell));
    cell.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        undoExcelEdit();
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        cell.textContent = cell.dataset.originalValue || "";
        cell.blur();
        return;
      }
      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        const direction = event.shiftKey ? -1 : 1;
        const rowStep = event.key === "Enter" ? direction : 0;
        const colStep = event.key === "Tab" ? direction : 0;
        applyTableCellEdit(cell);
        moveTableFocus(cell, rowStep, colStep);
      }
    });
    cell.addEventListener("blur", () => {
      cell.classList.remove("editing");
      applyTableCellEdit(cell);
    });
  }
}

// 행 번호를 누르면 해당 행을 선택합니다.
// 선택 행 삭제 버튼이 이 선택 정보를 사용합니다.
function selectTableRow(rowIndex) {
  const body = $("dataTable");
  if (!body || !Number.isInteger(rowIndex)) return;
  body.querySelectorAll("tr").forEach((row) => row.classList.toggle("selectedRow", Number(row.dataset.rowIndex) === rowIndex));
  body.querySelectorAll(".selectedCell").forEach((cell) => cell.classList.remove("selectedCell"));
  const firstCell = body.querySelector(`.editableCell[data-row-index="${rowIndex}"]`);
  if (firstCell) {
    firstCell.classList.add("selectedCell");
    state.tableSelection = { rowIndex, key: firstCell.dataset.key };
  } else {
    state.tableSelection = { rowIndex, key: null };
  }
}

// 사용자가 클릭한 셀을 현재 선택 셀로 표시합니다.
// 파란 테두리와 행 강조는 이 함수에서 붙는 CSS 클래스가 담당합니다.
function selectTableCell(cell) {
  const body = $("dataTable");
  if (!body || !cell) return;
  const rowIndex = Number(cell.dataset.rowIndex);
  body.querySelectorAll("tr").forEach((row) => row.classList.toggle("selectedRow", Number(row.dataset.rowIndex) === rowIndex));
  body.querySelectorAll(".selectedCell").forEach((el) => el.classList.remove("selectedCell"));
  cell.classList.add("selectedCell");
  state.tableSelection = { rowIndex, key: cell.dataset.key };
}

// Enter는 아래 행, Tab은 옆 셀로 이동합니다.
// 일반 엑셀 조작 감각에 가깝게 만들기 위한 보조 함수입니다.
function moveTableFocus(cell, rowStep, colStep) {
  const rowIndex = Number(cell.dataset.rowIndex);
  const cells = [...document.querySelectorAll("#dataTable .editableCell")];
  const index = cells.indexOf(cell);
  if (index < 0) return;
  const rowCells = [...document.querySelectorAll(`#dataTable .editableCell[data-row-index="${rowIndex}"]`)];
  const colIndex = rowCells.indexOf(cell);
  const key = cell.dataset.key || "";
  const escapedKey = window.CSS?.escape ? CSS.escape(key) : key.replace(/"/g, '\\"');
  const next = rowStep
    ? document.querySelector(`#dataTable .editableCell[data-row-index="${rowIndex + rowStep}"][data-key="${escapedKey}"]`)
    : rowCells[colIndex + colStep] || cells[index + colStep];
  if (next) {
    next.focus();
    selectTableCell(next);
  } else {
    cell.blur();
  }
}

// 사용자가 입력한 텍스트를 저장하기 전에 숫자인지 판단합니다.
// "0.123"처럼 숫자로 해석 가능한 값은 number로 저장해야 그래프 계산에 바로 쓸 수 있습니다.
function coerceTableValue(text, previous) {
  const trimmed = String(text ?? "").trim();
  if (trimmed === "") return "";
  const numericText = trimmed.replace(/,/g, "");
  const numeric = Number(numericText);
  if (Number.isFinite(numeric) && (typeof previous === "number" || /^[-+]?\d*\.?\d+(?:e[-+]?\d+)?$/i.test(numericText))) {
    return numeric;
  }
  return trimmed;
}

// 표의 rows가 바뀌면 화면 상태, 피겨, 실험 정보, 자동 저장 예약을 한 번에 갱신합니다.
function cloneTableRows(rows) {
  return JSON.parse(JSON.stringify(Array.isArray(rows) ? rows : []));
}

function updateExcelUndoButton() {
  const btn = $("undoExcelEdit");
  if (btn) btn.disabled = !state.tableUndoStack.length;
}

function pushTableUndo(d) {
  if (!d?.id) return;
  state.tableUndoStack.push({ datasetId: d.id, rows: cloneTableRows(d.rows) });
  if (state.tableUndoStack.length > 30) state.tableUndoStack.shift();
  updateExcelUndoButton();
}

function undoExcelEdit() {
  const d = state.datasets.find((x) => x.id === state.selectedId);
  if (!d) return setStatus("되돌릴 데이터가 없습니다.");
  let snapshot = null;
  while (state.tableUndoStack.length) {
    const candidate = state.tableUndoStack.pop();
    if (candidate.datasetId === d.id) {
      snapshot = candidate;
      break;
    }
  }
  updateExcelUndoButton();
  if (!snapshot) return setStatus("되돌릴 수정 내역이 없습니다.");
  d.rows = cloneTableRows(snapshot.rows);
  updateDatasetRows(d);
  renderTable(d);
  setStatus("표 수정을 이전 상태로 되돌렸습니다.");
}

function updateDatasetRows(d) {
  state.datasets = state.datasets.map((item) => item.id === d.id ? d : item);
  state.filtered = state.filtered.map((item) => item.id === d.id ? d : item);
  renderFigure(d);
  renderExperimentInfo(d);
  scheduleRowsSave(d);
}

// 셀 하나를 수정한 뒤 실제 데이터셋 rows에 반영합니다.
// 이후 updateDatasetRows가 피겨 갱신과 서버 저장까지 이어줍니다.
function applyTableCellEdit(cell) {
  const d = state.datasets.find((x) => x.id === state.selectedId);
  if (!d) return false;
  const rowIndex = Number(cell.dataset.rowIndex);
  const key = cell.dataset.key;
  if (!Number.isInteger(rowIndex) || !key || !d.rows[rowIndex]) return false;
  const previous = d.rows[rowIndex][key];
  const next = coerceTableValue(cell.textContent, previous);
  if (next === previous || String(next) === String(previous ?? "")) return false;
  pushTableUndo(d);
  d.rows[rowIndex][key] = next;
  updateDatasetRows(d);
  return true;
}

// 엑셀에서 복사한 여러 칸을 그대로 붙여넣을 수 있게 합니다.
// 탭은 열, 줄바꿈은 행으로 해석해서 필요한 경우 행을 자동으로 늘립니다.
function handleTablePaste(event, cell) {
  const text = event.clipboardData?.getData("text/plain") || "";
  if (!text) return;
  event.preventDefault();
  const d = state.datasets.find((x) => x.id === state.selectedId);
  if (!d) return;
  const columns = tableColumnDefs(d).map(([key]) => key);
  const startRow = Number(cell.dataset.rowIndex);
  const startCol = Math.max(0, columns.indexOf(cell.dataset.key));
  const pastedRows = text.replace(/\r/g, "").split("\n").filter((line, i, arr) => line || i < arr.length - 1).map((line) => line.split("\t"));
  pushTableUndo(d);
  for (let r = 0; r < pastedRows.length; r += 1) {
    const targetRow = startRow + r;
    while (d.rows.length <= targetRow) d.rows.push(makeEmptyTableRow(d));
    for (let c = 0; c < pastedRows[r].length; c += 1) {
      const key = columns[startCol + c];
      if (!key) continue;
      d.rows[targetRow][key] = coerceTableValue(pastedRows[r][c], d.rows[targetRow][key]);
    }
  }
  updateDatasetRows(d);
  renderTable(d);
}

function makeEmptyTableRow(d) {
  const row = {};
  for (const [key] of tableColumnDefs(d)) row[key] = "";
  if (Object.prototype.hasOwnProperty.call(row, "cycle")) {
    const lastCycle = [...(d.rows || [])].reverse().map((item) => Number(item.cycle)).find(Number.isFinite);
    row.cycle = Number.isFinite(lastCycle) ? lastCycle + 1 : (d.rows?.length || 0) + 1;
  }
  return row;
}

function addExcelRow() {
  const d = state.datasets.find((x) => x.id === state.selectedId);
  if (!d) return setStatus("먼저 데이터를 선택하세요.");
  d.rows = Array.isArray(d.rows) ? d.rows : [];
  pushTableUndo(d);
  d.rows.push(makeEmptyTableRow(d));
  updateDatasetRows(d);
  renderTable(d);
  const rowIndex = d.rows.length - 1;
  const firstCell = document.querySelector(`#dataTable .editableCell[data-row-index="${rowIndex}"]`);
  if (firstCell) firstCell.focus();
}

function deleteSelectedExcelRow() {
  const d = state.datasets.find((x) => x.id === state.selectedId);
  if (!d || !Array.isArray(d.rows) || !d.rows.length) return setStatus("삭제할 행이 없습니다.");
  const rowIndex = Number(state.tableSelection?.rowIndex);
  if (!Number.isInteger(rowIndex) || rowIndex < 0 || rowIndex >= d.rows.length) return setStatus("삭제할 행을 먼저 선택하세요.");
  pushTableUndo(d);
  d.rows.splice(rowIndex, 1);
  updateDatasetRows(d);
  renderTable(d);
  setStatus("선택한 행을 삭제했습니다.");
}

function saveCurrentExcelRows() {
  const d = state.datasets.find((x) => x.id === state.selectedId);
  if (!d) return setStatus("저장할 데이터가 없습니다.");
  clearTimeout(state.tableSaveTimer);
  return saveRowsEdit(d);
}

function scheduleRowsSave(d) {
  clearTimeout(state.tableSaveTimer);
  setStatus("표 수정 내용을 저장 중...");
  state.tableSaveTimer = setTimeout(() => saveRowsEdit(d), 650);
}

async function saveRowsEdit(d) {
  try {
    const res = await fetch(`/api/datasets/${encodeURIComponent(d.id)}`, {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ rows: d.rows }),
    });
    const saved = await res.json();
    if (!res.ok) throw new Error(saved.error || "표 저장 실패");
    state.datasets = state.datasets.map((item) => item.id === saved.id ? saved : item);
    state.filtered = state.filtered.map((item) => item.id === saved.id ? saved : item);
    setStatus("표 수정 내용이 피겨와 DB에 저장되었습니다.");
  } catch (error) {
    setStatus(`표 저장 실패: ${error.message}`);
  }
}

function renderCurrent() {
  const d = state.datasets.find((x) => x.id === state.selectedId);
  state.selectedAnnotation = null;
  fillCellForm(d);
  renderFigure(d);
  renderTable(d);
  renderExperimentInfo(d);
  renderCellWorkspace(d);
  loadCellWorkspace(d);
  renderAISummary();
}

async function applyCellInfo() {
  const d = state.datasets.find((x) => x.id === state.selectedId);
  if (!d) return setStatus("먼저 데이터를 선택하세요.");
  setBusy(true, "입력한 정보를 현재 데이터에 적용하고 있습니다.");
  try {
    const hierarchy = hierarchySelectionPayload();
    delete hierarchy.datasetGroupName;
    const res = await fetch(`/api/datasets/${encodeURIComponent(d.id)}`, {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ cell: collectCellForm(), ...hierarchy }),
    });
    const saved = await res.json();
    if (!res.ok) {
      setStatus(saved.error || "정보 저장 실패");
      return;
    }
    state.datasets = state.datasets.map((item) => item.id === saved.id ? saved : item);
    state.filtered = state.filtered.map((item) => item.id === saved.id ? saved : item);
    state.selectedId = saved.id;
    await loadHierarchy();
    renderSelect();
    renderSavedList();
    renderCurrent();
    setStatus("입력 정보가 현재 피겨에 적용되었습니다.");
  } catch (error) {
    setStatus(`정보 저장 실패: ${error.message}`);
  } finally {
    setBusy(false);
  }
}

async function saveDataset(ev) {
  ev.preventDefault();
  const form = ev.currentTarget;
  const fd = new FormData(form);
  const file = fd.get("csv");
  if (!file || !file.size) return;
  setStatus("Parsing...");
  const rows = parseCsv(await file.text());
  const cell = Object.fromEntries(["date", "cellId", "sampleName", "material", "electrolyte", "condition", "notes"].map((k) => [k, fd.get(k)]));
  const res = await fetch("/api/datasets", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ cell, rows, ...hierarchySelectionPayload() }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "저장 실패");
  }
  const saved = await res.json();
  state.datasets.unshift(saved);
  await loadHierarchy();
  form.reset();
  showDatasetImmediately(saved);
  setStatus("Saved");
}

function download(name, text, type) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

function exportSvg() {
  const svg = $("paperFigure");
  if (!svg) return;
  download("battery-figure.svg", new XMLSerializer().serializeToString(svg), "image/svg+xml");
}

function exportPng() {
  const svg = $("paperFigure");
  if (!svg) return;
  svgToPngBlob(svg).then((blob) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "battery-figure.png";
    a.click();
    URL.revokeObjectURL(a.href);
  }).catch((err) => setStatus(err.message || "PNG 변환 실패"));
}

function svgToPngBlob(svg) {
  const text = new XMLSerializer().serializeToString(svg);
  const url = URL.createObjectURL(new Blob([text], { type: "image/svg+xml;charset=utf-8" }));
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 2240;
        canvas.height = 1440;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          blob ? resolve(blob) : reject(new Error("PNG 변환 실패"));
        }, "image/png");
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("피겨 이미지를 변환하지 못했습니다."));
    };
    img.src = url;
  });
}

function selectedComparisonSeries() {
  return state.compareIds
    .map((id) => state.datasets.find((d) => d.id === id))
    .filter((d) => d?.dataType === "cyc")
    .slice(0, 8)
    .map((d) => ({
      d,
      name: datasetDisplayName(d),
      points: dischargeSeries((d.rows || []).filter((r) => Number.isFinite(r.cycle)).sort((a, b) => a.cycle - b.cycle)),
    }))
    .filter((s) => s.points.length);
}

function renderCycComparison() {
  const preview = $("comparisonPreview");
  if (!preview) return;
  const series = selectedComparisonSeries();
  preview.classList.remove("hidden");
  if (series.length < 2) {
    preview.innerHTML = `<p class="emptySaved">CYC 피겨를 2개 이상 선택하면 비교 그래프를 만들 수 있습니다.</p>`;
    setStatus("CYC 피겨를 2개 이상 선택하세요.");
    return;
  }
  const colorMap = Object.fromEntries(series.map((s, idx) => [s.d.id, comparisonColor(s.d.id, idx)]));
  preview.innerHTML = `
    <div class="comparisonTitle">
      <div>
        <strong>CYC 비교 피겨</strong>
        <span>${series.length}개 피겨 비교</span>
      </div>
      <div class="comparisonActions">
        <button type="button" id="saveComparisonFigure">비교 피겨 저장</button>
        <button type="button" id="exportComparisonSvg" class="secondaryAction">SVG</button>
        <button type="button" id="exportComparisonPng" class="secondaryAction">PNG</button>
      </div>
    </div>
    <div class="comparisonControls">
      ${series.map((s, idx) => `
        <label class="comparisonColorItem">
          <input type="color" data-comparison-color="${escapeAttr(s.d.id)}" value="${comparisonColor(s.d.id, idx)}" />
          <span>${escapeXml(s.name)}</span>
        </label>
      `).join("")}
    </div>
    ${renderComparisonSvg(series, colorMap)}`;
  preview.querySelectorAll("[data-comparison-color]").forEach((input) => {
    input.addEventListener("input", () => {
      state.comparisonColors[input.dataset.comparisonColor] = normalizeHexColor(input.value, "#0f766e");
      renderCycComparison();
    });
  });
  $("saveComparisonFigure")?.addEventListener("click", saveComparisonFigure);
  $("exportComparisonSvg")?.addEventListener("click", exportComparisonSvg);
  $("exportComparisonPng")?.addEventListener("click", exportComparisonPng);
  setStatus("CYC 비교 피겨를 만들었습니다.");
}

async function saveComparisonFigure() {
  const series = selectedComparisonSeries();
  if (series.length < 2) return setStatus("저장하려면 CYC 피겨를 2개 이상 선택하세요.");
  const comparisonColors = Object.fromEntries(series.map((s, idx) => [s.d.id, comparisonColor(s.d.id, idx)]));
  const payload = {
    dataType: "cyc-comparison",
    figureKind: "cyc-comparison",
    cell: {
      date: todayLocal(),
      cellId: "CYC comparison",
      sampleName: `${series.length} CYC figures`,
      material: "CYC",
      condition: "comparison",
      notes: series.map((s) => s.name).join(" / "),
    },
    rows: comparisonRowsFromSeries(series),
    columns: ["sourceId", "sourceName", "cycle", "capacity"],
    sourceName: series.map((s) => s.name).join(" + "),
    figureEdits: { comparisonColors },
  };
  const res = await fetch("/api/datasets", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return setStatus(body.error || "비교 피겨 저장 실패");
  }
  const saved = await res.json();
  state.datasets.unshift(saved);
  showDatasetImmediately(saved);
  activateView("figure", "cyc");
  setStatus("비교 C-rate 피겨를 저장했습니다.");
}

function exportComparisonSvg() {
  const svg = $("comparisonFigure");
  if (!svg) return setStatus("먼저 비교 피겨를 만들어주세요.");
  download("cyc-comparison.svg", new XMLSerializer().serializeToString(svg), "image/svg+xml");
}

function exportComparisonPng() {
  const svg = $("comparisonFigure");
  if (!svg) return setStatus("먼저 비교 피겨를 만들어주세요.");
  svgToPngBlob(svg).then((blob) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "cyc-comparison.png";
    a.click();
    URL.revokeObjectURL(a.href);
  }).catch((err) => setStatus(err.message || "PNG 변환 실패"));
}

function renderSavedCycComparison(d) {
  const series = seriesFromComparisonDataset(d);
  $("figureTitle").textContent = d.cell?.cellId || "CYC comparison";
  $("figureSubtitle").textContent = `${d.cell?.date || ""} - CYC comparison - ${d.rows?.length || 0} points`;
  $("metaGrid").innerHTML = [
    ["Type", "CYC comparison"],
    ["Figures", `${series.length}`],
    ["Owner", displayUserName(d)],
    ["Source", d.sourceName],
  ].map(([k, v]) => `<div class="metaItem"><strong>${k}</strong>${isBadText(v) ? "-" : (v || "-")}</div>`).join("");
  if (series.length < 1) {
    $("figureCanvas").innerHTML = `<p class="emptySaved">저장된 비교 피겨 데이터가 없습니다.</p>`;
    return;
  }
  const colorMap = Object.fromEntries(series.map((s) => [s.sourceId, s.color]));
  $("figureCanvas").innerHTML = renderComparisonSvg(series, colorMap, "paperFigure");
}

function crc32(bytes) {
  if (!crc32.table) {
    crc32.table = Array.from({ length: 256 }, (_, n) => {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      return c >>> 0;
    });
  }
  let c = 0xffffffff;
  for (const b of bytes) c = crc32.table[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function u16(n) { return [n & 255, (n >>> 8) & 255]; }
function u32(n) { return [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255]; }

function makeZip(files) {
  const encoder = new TextEncoder();
  const chunks = [];
  const central = [];
  let offset = 0;
  for (const file of files) {
    const name = encoder.encode(file.name);
    const data = file.bytes || encoder.encode(file.text || "");
    const crc = crc32(data);
    const local = new Uint8Array([
      ...u32(0x04034b50), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0),
      ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(name.length), ...u16(0),
    ]);
    chunks.push(local, name, data);
    central.push({ name, crc, size: data.length, offset });
    offset += local.length + name.length + data.length;
  }
  const centralStart = offset;
  for (const file of central) {
    const header = new Uint8Array([
      ...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0),
      ...u32(file.crc), ...u32(file.size), ...u32(file.size), ...u16(file.name.length), ...u16(0), ...u16(0),
      ...u16(0), ...u16(0), ...u32(0), ...u32(file.offset),
    ]);
    chunks.push(header, file.name);
    offset += header.length + file.name.length;
  }
  const end = new Uint8Array([
    ...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(central.length), ...u16(central.length),
    ...u32(offset - centralStart), ...u32(centralStart), ...u16(0),
  ]);
  chunks.push(end);
  return new Blob(chunks, { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" });
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function exportPpt() {
  const svg = $("paperFigure");
  if (!svg) return setStatus("먼저 피겨를 생성하거나 선택하세요.");
  let pngBytes;
  try {
    const pngBlob = await svgToPngBlob(svg);
    pngBytes = new Uint8Array(await pngBlob.arrayBuffer());
  } catch (err) {
    return setStatus(err.message || "PPT 변환 실패");
  }
  try {
    const res = await fetch("/api/export-ppt", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        imageBase64: bytesToBase64(pngBytes),
        svgText: new XMLSerializer().serializeToString(svg),
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "PPT 파일을 만들지 못했습니다.");
    }
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "battery-figure.pptx";
    a.click();
    URL.revokeObjectURL(a.href);
    return setStatus("PPT 다운로드 완료");
  } catch (err) {
    return setStatus(err.message || "PPT 다운로드 실패");
  }
  const files = [
    { name: "[Content_Types].xml", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Default Extension="png" ContentType="image/png"/>
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
<Override PartName="/ppt/presProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presProps+xml"/>
<Override PartName="/ppt/viewProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.viewProps+xml"/>
<Override PartName="/ppt/tableStyles.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.tableStyles+xml"/>
<Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
</Types>` },
    { name: "_rels/.rels", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>` },
    { name: "docProps/core.xml", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<dc:title>Battery figure</dc:title><dc:creator>Battery Data Portal</dc:creator><cp:lastModifiedBy>Battery Data Portal</cp:lastModifiedBy>
<dcterms:created xsi:type="dcterms:W3CDTF">2026-06-30T00:00:00Z</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">2026-06-30T00:00:00Z</dcterms:modified>
</cp:coreProperties>` },
    { name: "docProps/app.xml", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
<Application>Microsoft PowerPoint</Application><PresentationFormat>On-screen Show (16:9)</PresentationFormat><Slides>1</Slides><Notes>0</Notes><HiddenSlides>0</HiddenSlides><MMClips>0</MMClips><ScaleCrop>false</ScaleCrop>
</Properties>` },
    { name: "ppt/presentation.xml", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>
<p:sldIdLst><p:sldId id="256" r:id="rId2"/></p:sldIdLst>
<p:sldSz cx="12192000" cy="6858000" type="wide"/><p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>` },
    { name: "ppt/_rels/presentation.xml.rels", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/presProps" Target="presProps.xml"/>
<Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/viewProps" Target="viewProps.xml"/>
<Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/tableStyles" Target="tableStyles.xml"/>
</Relationships>` },
    { name: "ppt/presProps.xml", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentationPr xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"/>` },
    { name: "ppt/viewProps.xml", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:viewPr xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:normalViewPr><p:restoredLeft sz="15620"/><p:restoredTop sz="94660"/></p:normalViewPr></p:viewPr>` },
    { name: "ppt/tableStyles.xml", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:tblStyleLst xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" def="{5C22544A-7EE6-4342-B048-85BDC9FD1C3A}"/>` },
    { name: "ppt/slides/slide1.xml", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
<p:pic><p:nvPicPr><p:cNvPr id="2" name="battery-figure.png"/><p:cNvPicPr/><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="914400" y="685800"/><a:ext cx="10363200" cy="5486400"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>
</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>` },
    { name: "ppt/slides/_rels/slide1.xml.rels", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/battery-figure.png"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>` },
    { name: "ppt/slideMasters/slideMaster1.xml", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:effectLst/></p:bgPr></p:bg><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld>
<p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst><p:txStyles><p:titleStyle/><p:bodyStyle/><p:otherStyle/></p:txStyles>
</p:sldMaster>` },
    { name: "ppt/slideMasters/_rels/slideMaster1.xml.rels", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>` },
    { name: "ppt/slideLayouts/slideLayout1.xml", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" type="blank" preserve="1">
<p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sldLayout>` },
    { name: "ppt/slideLayouts/_rels/slideLayout1.xml.rels", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>` },
    { name: "ppt/theme/theme1.xml", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Battery Data Portal">
<a:themeElements><a:clrScheme name="Office"><a:dk1><a:srgbClr val="000000"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="1F2937"/></a:dk2><a:lt2><a:srgbClr val="F8FAFC"/></a:lt2><a:accent1><a:srgbClr val="0F766E"/></a:accent1><a:accent2><a:srgbClr val="EC4899"/></a:accent2><a:accent3><a:srgbClr val="64748B"/></a:accent3><a:accent4><a:srgbClr val="A78BFA"/></a:accent4><a:accent5><a:srgbClr val="14B8A6"/></a:accent5><a:accent6><a:srgbClr val="F59E0B"/></a:accent6><a:hlink><a:srgbClr val="2563EB"/></a:hlink><a:folHlink><a:srgbClr val="7C3AED"/></a:folHlink></a:clrScheme><a:fontScheme name="Office"><a:majorFont><a:latin typeface="Segoe UI"/><a:ea typeface="맑은 고딕"/><a:cs typeface="Segoe UI"/></a:majorFont><a:minorFont><a:latin typeface="Segoe UI"/><a:ea typeface="맑은 고딕"/><a:cs typeface="Segoe UI"/></a:minorFont></a:fontScheme><a:fmtScheme name="Office"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements>
</a:theme>` },
    { name: "ppt/media/battery-figure.png", bytes: pngBytes },
  ];
  const a = document.createElement("a");
  a.href = URL.createObjectURL(makeZip(files));
  a.download = "battery-figure.pptx";
  a.click();
  URL.revokeObjectURL(a.href);
  setStatus("PPT 다운로드 완료");
}

async function deleteCurrent() {
  if (!state.selectedId || !confirm("선택한 데이터를 삭제할까요?")) return;
  await fetch(`/api/datasets/${encodeURIComponent(state.selectedId)}`, { method: "DELETE", headers: authHeaders() });
  state.datasets = state.datasets.filter((d) => d.id !== state.selectedId);
  state.selectedId = null;
  applyFilters();
}

function calcValue(id) {
  const n = Number($(id)?.value);
  return Number.isFinite(n) ? n : 0;
}

function calcNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

const electrodePresets = {
  ncm: {
    active: "NCM",
    conductor: "Super P",
    binder: "PTFE",
    collector: "C-coated Al",
    capacity: 180,
    totalMass: 0.01861,
    collectorMass: 0.00386,
    totalThickness: 0.076,
    collectorThickness: 0.017,
    diameter: 11,
    activeRatio: 93,
    conductorRatio: 5,
    binderRatio: 2,
  },
  lfp: {
    active: "LFP",
    conductor: "Super P",
    binder: "PTFE",
    collector: "C-coated Al",
    capacity: 170,
    totalMass: 0.03608,
    collectorMass: 0.00386,
    totalThickness: 0.223,
    collectorThickness: 0.015,
    diameter: 11,
    activeRatio: 95,
    conductorRatio: 3,
    binderRatio: 2,
  },
  graphite: {
    active: "Graphite",
    conductor: "Super P",
    binder: "PTFE",
    collector: "Cu",
    capacity: 372,
    totalMass: 0.03645,
    collectorMass: 0.011387,
    totalThickness: 0.143,
    collectorThickness: 0.011,
    diameter: 11,
    activeRatio: 92,
    conductorRatio: 4,
    binderRatio: 4,
  },
};

const ELECTRODE_PRESET_OPTIONS = [
  { value: "ncm", label: "양극 / NCM" },
  { value: "lfp", label: "양극 / LFP" },
  { value: "graphite", label: "음극 / Graphite" },
];

function electrodePresetByKey(key) {
  return electrodePresets[key] || electrodePresets.ncm;
}

function defaultElectrodeInputs(presetKey = "ncm") {
  const p = electrodePresetByKey(presetKey);
  return {
    calcElectrodeType: presetKey,
    calcTotalMass: p.totalMass,
    calcCollectorMass: p.collectorMass,
    calcTotalThickness: p.totalThickness,
    calcCollectorThickness: p.collectorThickness,
    calcDiameter: p.diameter,
    calcCapacity: p.capacity,
    calcNcmRatio: p.activeRatio,
    calcSuperRatio: p.conductorRatio,
    calcPtfeRatio: p.binderRatio,
  };
}

function currentElectrodePreset() {
  return electrodePresetByKey($("calcElectrodeType")?.value);
}

function applyElectrodePreset() {
  const values = defaultElectrodeInputs($("calcElectrodeType")?.value || "ncm");
  for (const [id, value] of Object.entries(values)) {
    if (id !== "calcElectrodeType" && $(id)) $(id).value = value;
  }
  updateElectrodeLabels();
  renderElectrodeCalc();
}

function updateElectrodeLabels() {
  const p = currentElectrodePreset();
  const labels = {
    calcCollectorMass: `${p.collector} 무게 (g)`,
    calcCollectorThickness: `${p.collector} 두께 (mm)`,
    calcNcmRatio: `${p.active} (%)`,
    calcSuperRatio: `${p.conductor} (%)`,
    calcPtfeRatio: `${p.binder} (%)`,
  };
  for (const [id, text] of Object.entries(labels)) {
    const label = $(id)?.closest("label");
    if (label && label.firstChild) label.firstChild.textContent = text;
  }
}

function fixed(n, d = 6) {
  if (!Number.isFinite(n)) return "";
  return Number(n.toFixed(d)).toString();
}

function calcHelp(text) {
  return `<button class="calcHelpButton" type="button" data-calc-help="${escapeAttr(text)}" aria-label="계산 설명 보기">?</button>`;
}

function calcHelpLabel(label, text) {
  return `<span class="calcHelpLabel">${escapeXml(label)} ${calcHelp(text)}</span>`;
}

function electrodeCalcFromInputs(inputs = {}, presetKey = inputs.calcElectrodeType || "ncm") {
  const preset = electrodePresetByKey(presetKey);
  const totalMass = calcNumber(inputs.calcTotalMass);
  const collectorMass = calcNumber(inputs.calcCollectorMass);
  const totalThickness = calcNumber(inputs.calcTotalThickness);
  const collectorThickness = calcNumber(inputs.calcCollectorThickness);
  const diameter = calcNumber(inputs.calcDiameter);
  const capacity = calcNumber(inputs.calcCapacity);
  const ncmRatio = calcNumber(inputs.calcNcmRatio) / 100;
  const superRatio = calcNumber(inputs.calcSuperRatio) / 100;
  const ptfeRatio = calcNumber(inputs.calcPtfeRatio) / 100;
  const electrodeMass = Math.max(totalMass - collectorMass, 0);
  const electrodeThickness = Math.max(totalThickness - collectorThickness, 0);
  const area = Math.PI * Math.pow(diameter / 20, 2);
  const volume = area * (electrodeThickness / 10);
  const ncmMass = electrodeMass * ncmRatio;
  const superMass = electrodeMass * superRatio;
  const ptfeMass = electrodeMass * ptfeRatio;
  const oneC = ncmMass * capacity;
  const rates = [0.05, 0.1, 0.2, 0.33, 0.5, 1, 2, 3, 4, 5].map((rate) => ({ rate, current: oneC * rate }));
  return {
    preset,
    totalMass, collectorMass, totalThickness, collectorThickness, diameter, capacity,
    ncmRatio, superRatio, ptfeRatio,
    electrodeMass, electrodeThickness, area, volume, ncmMass, superMass, ptfeMass, oneC,
    loading: area ? electrodeMass / area : 0,
    ncmLoadingArea: area ? ncmMass / area : 0,
    totalDensity: volume ? electrodeMass / volume : 0,
    ncmLoadingVolume: volume ? ncmMass / volume : 0,
    rates,
  };
}

function electrodeCalcData() {
  return electrodeCalcFromInputs(electrodeInputSnapshot(), $("calcElectrodeType")?.value || "ncm");
}

function electrodeInputSnapshot() {
  return Object.fromEntries(ELECTRODE_INPUT_IDS.map((id) => [id, $(id)?.value ?? ""]));
}

// 브라우저 localStorage에서 저장된 전극 C-rate 계산값 목록을 불러옵니다.
// 서버 DB에 저장하기 전의 개인 작업 보관함 역할입니다.
function loadElectrodeProfiles() {
  try {
    const parsed = JSON.parse(localStorage.getItem(ELECTRODE_PROFILE_KEY) || "[]");
    state.electrodeProfiles = Array.isArray(parsed) ? parsed : [];
  } catch {
    state.electrodeProfiles = [];
  }
  if (!state.selectedElectrodeProfileId && state.electrodeProfiles[0]) {
    state.selectedElectrodeProfileId = state.electrodeProfiles[0].id;
  }
}

// 전극 저장소 목록을 localStorage에 저장하고 화면 목록도 다시 그립니다.
function persistElectrodeProfiles() {
  localStorage.setItem(ELECTRODE_PROFILE_KEY, JSON.stringify(state.electrodeProfiles));
  renderElectrodeProfileStore();
  renderElectrodeCalcSlots();
}

// 이름을 비워두고 저장할 때 자동으로 붙는 이름입니다.
// 날짜, active material, 1C 전류가 들어가면 나중에 찾기가 쉽습니다.
function defaultElectrodeProfileName(c) {
  const date = todayLocal().slice(5);
  return `${date} ${c.preset.active} 1C ${fixed(c.oneC, 3)} mA`;
}

// 현재 전극 계산 입력값과 계산 결과를 하나의 저장 객체로 묶습니다.
// 이 객체가 저장소 카드가 되고, 나중에 CYC 데이터에 넣을 payload의 원본이 됩니다.
function buildElectrodeProfileFromCalc(c, name, inputs, presetKey) {
  return {
    id: `electrode-${Date.now()}`,
    name,
    ownerId: state.user?.id || "",
    createdAt: new Date().toISOString(),
    presetKey,
    preset: c.preset,
    inputs,
    oneC_mA: c.oneC,
    activeLoading_g_cm2: c.ncmLoadingArea,
    totalLoading_g_cm2: c.loading,
    electrodeMass_g: c.electrodeMass,
    electrodeThickness_mm: c.electrodeThickness,
    area_cm2: c.area,
    activeMass_g: c.ncmMass,
    capacity_mAh_g: c.capacity,
    rates: c.rates.map((r) => ({ rate: r.rate, current_mA: r.current })),
  };
}

function buildElectrodeProfile() {
  const inputs = electrodeInputSnapshot();
  const presetKey = $("calcElectrodeType")?.value || "ncm";
  const c = electrodeCalcFromInputs(inputs, presetKey);
  const nameInput = $("electrodeProfileName");
  const name = String(nameInput?.value || "").trim() || defaultElectrodeProfileName(c);
  return buildElectrodeProfileFromCalc(c, name, inputs, presetKey);
}

// 현재 계산 결과를 저장소에 추가합니다.
// 최근 저장값이 위에 오도록 unshift 형태로 넣고, 너무 커지지 않게 40개까지만 유지합니다.
function saveElectrodeProfile() {
  const profile = buildElectrodeProfile();
  state.electrodeProfiles = [profile, ...state.electrodeProfiles.filter((item) => item.id !== profile.id)].slice(0, 40);
  state.selectedElectrodeProfileId = profile.id;
  persistElectrodeProfiles();
  if ($("electrodeProfileName")) $("electrodeProfileName").value = "";
  setStatus(`전극 C-rate 계산값을 저장했습니다: ${profile.name}`);
}

// 저장소에서 현재 선택된 계산 프로필을 찾습니다.
function normalizedSlotInputs(inputs = {}, presetKey = "ncm") {
  return { ...defaultElectrodeInputs(presetKey), ...inputs, calcElectrodeType: presetKey };
}

function defaultElectrodeSlot(index, presetKey = "ncm") {
  return {
    id: `electrode-slot-${index + 1}`,
    name: `계산기 ${index + 1}`,
    presetKey,
    inputs: defaultElectrodeInputs(presetKey),
  };
}

function normalizeElectrodeSlot(slot, index) {
  const presetKey = slot?.presetKey || slot?.inputs?.calcElectrodeType || "ncm";
  return {
    id: slot?.id || `electrode-slot-${index + 1}`,
    name: slot?.name || `계산기 ${index + 1}`,
    presetKey,
    inputs: normalizedSlotInputs(slot?.inputs || {}, presetKey),
  };
}

function loadElectrodeCalcSlots() {
  let parsed = [];
  try {
    parsed = JSON.parse(localStorage.getItem(ELECTRODE_CALC_SLOT_KEY) || "[]");
  } catch {
    parsed = [];
  }
  const slots = Array.isArray(parsed) ? parsed.map((slot, index) => normalizeElectrodeSlot(slot, index)) : [];
  while (slots.length < ELECTRODE_CALC_SLOT_COUNT) {
    slots.push(defaultElectrodeSlot(slots.length));
  }
  state.electrodeCalcSlots = slots.slice(0, ELECTRODE_CALC_SLOT_COUNT);
}

function persistElectrodeCalcSlots() {
  localStorage.setItem(ELECTRODE_CALC_SLOT_KEY, JSON.stringify(state.electrodeCalcSlots));
}

function electrodeSlotCalc(slot) {
  const presetKey = slot?.presetKey || slot?.inputs?.calcElectrodeType || "ncm";
  const inputs = normalizedSlotInputs(slot?.inputs || {}, presetKey);
  return electrodeCalcFromInputs(inputs, presetKey);
}

function electrodeSlotFieldLabel(field, preset) {
  if (field.id === "calcCollectorMass") return `${preset.collector} 무게 (g)`;
  if (field.id === "calcCollectorThickness") return `${preset.collector} 두께 (mm)`;
  if (field.id === "calcNcmRatio") return `${preset.active} (%)`;
  if (field.id === "calcSuperRatio") return `${preset.conductor} (%)`;
  if (field.id === "calcPtfeRatio") return `${preset.binder} (%)`;
  return field.label;
}

function renderElectrodeCalcSlots() {
  const box = $("electrodeCalcSlots");
  if (!box) return;
  if (!state.electrodeCalcSlots.length) loadElectrodeCalcSlots();
  box.innerHTML = `
    <div class="calcSlotHeader">
      <div>
        <h3>전극 C-rate 계산기 8칸</h3>
        <p>샘플별로 값을 따로 계산하고, 필요한 계산값은 메인 계산기나 C-rate 저장소로 바로 보낼 수 있습니다.</p>
      </div>
      <span>아래로 스크롤해서 8개 계산기를 사용하세요</span>
    </div>
    <div class="calcSlotList">
      ${state.electrodeCalcSlots.map((slot, index) => {
        const c = electrodeSlotCalc(slot);
        const preset = c.preset;
        const options = ELECTRODE_PRESET_OPTIONS.map((option) => `<option value="${escapeAttr(option.value)}"${option.value === slot.presetKey ? " selected" : ""}>${escapeXml(option.label)}</option>`).join("");
        const fields = ELECTRODE_SLOT_FIELDS.map((field) => `
          <label>
            ${escapeXml(electrodeSlotFieldLabel(field, preset))}
            <input type="number" step="${escapeAttr(field.step)}" value="${escapeAttr(slot.inputs[field.id] ?? "")}" data-slot-field="${escapeAttr(field.id)}" />
          </label>`).join("");
        return `
          <article class="calcSlotCard" data-slot-index="${index}">
            <div class="calcSlotTop">
              <label>
                계산 이름
                <input type="text" value="${escapeAttr(slot.name)}" data-slot-field="name" />
              </label>
              <label>
                전극
                <select data-slot-field="calcElectrodeType">${options}</select>
              </label>
            </div>
            <div class="calcSlotGrid">${fields}</div>
            <div class="calcSlotSummary">
              <div><small>1C 전류</small><b>${fixed(c.oneC, 4)} mA</b></div>
              <div><small>${escapeXml(preset.active)} loading</small><b>${fixed(c.ncmLoadingArea, 8)} g cm-2</b></div>
              <div><small>${escapeXml(preset.collector)} 제외 질량</small><b>${fixed(c.electrodeMass, 6)} g</b></div>
              <div><small>${escapeXml(preset.collector)} 제외 두께</small><b>${fixed(c.electrodeThickness, 4)} mm</b></div>
            </div>
            <div class="calcSlotRateGrid">
              ${c.rates.map((rate) => `<span><strong>${rate.rate} C</strong>${fixed(rate.current, 4)} mA</span>`).join("")}
            </div>
            <div class="calcSlotActions">
              <button type="button" data-slot-action="calc">계산 새로고침</button>
              <button type="button" data-slot-action="load" class="secondaryAction">메인에 불러오기</button>
              <button type="button" data-slot-action="save" class="saveAction">저장소 저장</button>
            </div>
          </article>`;
      }).join("")}
    </div>`;
}

function updateElectrodeSlotField(target) {
  const card = target.closest(".calcSlotCard");
  const index = Number(card?.dataset.slotIndex);
  const field = target.dataset.slotField;
  const slot = state.electrodeCalcSlots[index];
  if (!slot || !field) return null;
  if (field === "name") {
    slot.name = target.value;
  } else if (field === "calcElectrodeType") {
    slot.presetKey = target.value || "ncm";
    slot.inputs = defaultElectrodeInputs(slot.presetKey);
  } else {
    slot.inputs[field] = target.value;
  }
  persistElectrodeCalcSlots();
  return slot;
}

function handleElectrodeSlotInput(event) {
  const target = event.target.closest?.("[data-slot-field]");
  if (!target || target.dataset.slotField === "calcElectrodeType") return;
  updateElectrodeSlotField(target);
}

function handleElectrodeSlotChange(event) {
  const target = event.target.closest?.("[data-slot-field]");
  if (!target) return;
  updateElectrodeSlotField(target);
  if (target.dataset.slotField === "calcElectrodeType") renderElectrodeCalcSlots();
}

function applyElectrodeSlotToMain(slot) {
  const inputs = normalizedSlotInputs(slot.inputs, slot.presetKey);
  for (const id of ELECTRODE_INPUT_IDS) {
    if ($(id)) $(id).value = inputs[id] ?? "";
  }
  updateElectrodeLabels();
  renderElectrodeCalc();
  $("electrodeCalcResult")?.scrollIntoView({ behavior: "smooth", block: "start" });
  setStatus(`${slot.name || "계산기"} 값을 메인 전극 계산기에 불러왔습니다.`);
}

function saveElectrodeSlotProfile(slot) {
  const inputs = normalizedSlotInputs(slot.inputs, slot.presetKey);
  const c = electrodeCalcFromInputs(inputs, slot.presetKey);
  const customName = String(slot.name || "").trim();
  const genericName = /^계산기\s*\d+$/i.test(customName);
  const name = customName && !genericName ? customName : `${customName || "계산기"} · ${defaultElectrodeProfileName(c)}`;
  const profile = buildElectrodeProfileFromCalc(c, name, inputs, slot.presetKey);
  state.electrodeProfiles = [profile, ...state.electrodeProfiles.filter((item) => item.id !== profile.id)].slice(0, 40);
  state.selectedElectrodeProfileId = profile.id;
  persistElectrodeProfiles();
  renderElectrodeCalcSlots();
  setStatus(`계산기 값을 전극 C-rate 저장소에 저장했습니다: ${profile.name}`);
}

function handleElectrodeSlotClick(event) {
  const button = event.target.closest?.("button[data-slot-action]");
  if (!button) return;
  const card = button.closest(".calcSlotCard");
  const index = Number(card?.dataset.slotIndex);
  const slot = state.electrodeCalcSlots[index];
  if (!slot) return;
  const action = button.dataset.slotAction;
  if (action === "calc") {
    renderElectrodeCalcSlots();
    return setStatus(`${slot.name || "계산기"} C-rate 계산을 새로고침했습니다.`);
  }
  if (action === "load") return applyElectrodeSlotToMain(slot);
  if (action === "save") return saveElectrodeSlotProfile(slot);
}

function selectedElectrodeProfile(id = state.selectedElectrodeProfileId) {
  return state.electrodeProfiles.find((profile) => profile.id === id) || null;
}

function selectElectrodeProfile(id) {
  state.selectedElectrodeProfileId = id;
  renderElectrodeProfileStore();
}

// 저장소 카드의 "불러오기" 버튼이 누르면 입력칸을 저장 당시 값으로 되돌립니다.
function applyElectrodeProfileToInputs(id = state.selectedElectrodeProfileId) {
  const profile = selectedElectrodeProfile(id);
  if (!profile) return setStatus("불러올 전극 계산값을 먼저 선택하세요.");
  for (const [inputId, value] of Object.entries(profile.inputs || {})) {
    if ($(inputId)) $(inputId).value = value;
  }
  updateElectrodeLabels();
  renderElectrodeCalc();
  setStatus(`전극 계산값을 불러왔습니다: ${profile.name}`);
}

function deleteElectrodeProfile(id) {
  state.electrodeProfiles = state.electrodeProfiles.filter((profile) => profile.id !== id);
  if (state.selectedElectrodeProfileId === id) {
    state.selectedElectrodeProfileId = state.electrodeProfiles[0]?.id || null;
  }
  persistElectrodeProfiles();
  setStatus("저장된 전극 계산값을 삭제했습니다.");
}

// 저장소 카드의 내용을 CYC 데이터 cell.electrodeCalc에 넣기 위한 형태로 정리합니다.
// 이렇게 넣어두면 CYC 피겨와 AI 요약에서 같은 계산값을 다시 사용할 수 있습니다.
function electrodeProfileCellPayload(profile) {
  return {
    profileId: profile.id,
    profileName: profile.name,
    active: profile.preset?.active || "",
    collector: profile.preset?.collector || "",
    conductor: profile.preset?.conductor || "",
    binder: profile.preset?.binder || "",
    oneC_mA: profile.oneC_mA,
    activeLoading_g_cm2: profile.activeLoading_g_cm2,
    totalLoading_g_cm2: profile.totalLoading_g_cm2,
    electrodeMass_g: profile.electrodeMass_g,
    electrodeThickness_mm: profile.electrodeThickness_mm,
    area_cm2: profile.area_cm2,
    activeMass_g: profile.activeMass_g,
    capacity_mAh_g: profile.capacity_mAh_g,
    rates: profile.rates || [],
    appliedAt: new Date().toISOString(),
  };
}

// 선택한 CYC 데이터에 저장된 전극 계산값을 적용합니다.
// PATCH API를 호출하기 때문에 적용 후에는 SQLite DB에도 함께 저장됩니다.
async function applyElectrodeProfileToSelectedCyc(id = state.selectedElectrodeProfileId) {
  const profile = selectedElectrodeProfile(id);
  if (!profile) return setStatus("CYC에 넣을 전극 계산값을 먼저 선택하세요.");
  const d = state.datasets.find((x) => x.id === state.selectedId);
  if (!d) return setStatus("먼저 CYC 데이터를 선택하세요.");
  if (d.dataType !== "cyc") return setStatus("선택한 데이터가 CYC가 아닙니다. CYC 데이터를 선택한 뒤 적용하세요.");
  try {
    const nextCell = {
      ...(d.cell || {}),
      material: d.cell?.material || profile.preset?.active || "",
      electrodeCalc: electrodeProfileCellPayload(profile),
    };
    const res = await fetch(`/api/datasets/${encodeURIComponent(d.id)}`, {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ cell: nextCell }),
    });
    const saved = await res.json();
    if (!res.ok) throw new Error(saved.error || "CYC 데이터 적용 실패");
    state.datasets = state.datasets.map((item) => item.id === saved.id ? saved : item);
    state.filtered = state.filtered.map((item) => item.id === saved.id ? saved : item);
    renderCurrent();
    renderSearchResults();
    renderSavedList();
    setStatus(`전극 계산값을 CYC 데이터에 넣었습니다: ${profile.name}`);
  } catch (error) {
    setStatus(`CYC 적용 실패: ${error.message}`);
  }
}

// 저장소 카드 내부 버튼들을 한 곳에서 처리하는 이벤트 위임 함수입니다.
// 카드가 새로 그려져도 부모 목록 하나에만 이벤트를 걸면 계속 작동합니다.
function handleElectrodeProfileListClick(event) {
  const button = event.target.closest("button[data-profile-action]");
  if (!button) return;
  const id = button.dataset.profileId;
  const action = button.dataset.profileAction;
  if (action === "select") return selectElectrodeProfile(id);
  if (action === "load") return applyElectrodeProfileToInputs(id);
  if (action === "apply") return applyElectrodeProfileToSelectedCyc(id);
  if (action === "delete") return deleteElectrodeProfile(id);
}

// 전극 C-rate 저장소 카드 목록을 화면에 그립니다.
// 선택된 카드에는 active 클래스를 붙여 사용자가 현재 선택값을 알아보기 쉽게 합니다.
function renderElectrodeProfileStore() {
  const list = $("electrodeProfileList");
  const count = $("electrodeProfileCount");
  if (!list) return;
  const profiles = state.electrodeProfiles || [];
  if (count) count.textContent = `${profiles.length}개 저장됨`;
  if (!profiles.length) {
    list.innerHTML = `<p class="emptyProfileList">아직 저장된 전극 C-rate 계산값이 없습니다. 위 값을 계산한 뒤 "현재 계산 저장"을 누르세요.</p>`;
    return;
  }
  list.innerHTML = profiles.map((profile) => {
    const isActive = profile.id === state.selectedElectrodeProfileId;
    const created = profile.createdAt ? new Date(profile.createdAt).toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "";
    return `
      <article class="electrodeProfileItem ${isActive ? "active" : ""}">
        <div class="electrodeProfileTitle">
          <strong>${escapeXml(profile.name)}</strong>
          <span>${escapeXml(created)}</span>
        </div>
        <div class="electrodeProfileMeta">
          <div><small>전극</small><b>${escapeXml(profile.preset?.active || "-")}</b></div>
          <div><small>1C</small><b>${fixed(Number(profile.oneC_mA), 4)} mA</b></div>
          <div><small>loading</small><b>${fixed(Number(profile.activeLoading_g_cm2), 8)} g cm-2</b></div>
          <div><small>질량</small><b>${fixed(Number(profile.electrodeMass_g), 6)} g</b></div>
        </div>
        <div class="electrodeProfileButtons">
          <button type="button" data-profile-action="select" data-profile-id="${escapeAttr(profile.id)}">선택</button>
          <button type="button" data-profile-action="load" data-profile-id="${escapeAttr(profile.id)}">불러오기</button>
          <button type="button" data-profile-action="apply" data-profile-id="${escapeAttr(profile.id)}" class="saveAction">CYC에 넣기</button>
          <button type="button" data-profile-action="delete" data-profile-id="${escapeAttr(profile.id)}" class="secondaryAction">삭제</button>
        </div>
      </article>`;
  }).join("");
}

function renderElectrodeCalc() {
  const box = $("electrodeCalcResult");
  if (!box) return;
  const c = electrodeCalcData();
  const activeName = c.preset.active;
  const collectorName = c.preset.collector;
  const conductorName = c.preset.conductor;
  const binderName = c.preset.binder;
  box.innerHTML = `
    <div class="calcCards">
      <div class="calcCard"><strong>1C 전류 ${calcHelp(`1C 전류 = ${activeName} 질량 × 이론용량입니다. 지금은 ${fixed(c.ncmMass, 9)} g × ${fixed(c.capacity, 4)} mAh g-1 = ${fixed(c.oneC, 4)} mA로 계산했습니다.`)}</strong><span>${fixed(c.oneC, 4)} mA</span></div>
      <div class="calcCard"><strong>${collectorName} 제외 전극 무게 ${calcHelp(`${collectorName} 제외 전극 무게 = 전극 전체 무게 - ${collectorName} 무게입니다. ${fixed(c.totalMass, 6)} g - ${fixed(c.collectorMass, 6)} g = ${fixed(c.electrodeMass, 6)} g입니다.`)}</strong><span>${fixed(c.electrodeMass, 6)} g</span></div>
      <div class="calcCard"><strong>${collectorName} 제외 전극 두께 ${calcHelp(`${collectorName} 제외 전극 두께 = 전극 전체 두께 - ${collectorName} 두께입니다. ${fixed(c.totalThickness, 4)} mm - ${fixed(c.collectorThickness, 4)} mm = ${fixed(c.electrodeThickness, 4)} mm입니다.`)}</strong><span>${fixed(c.electrodeThickness, 4)} mm</span></div>
      <div class="calcCard"><strong>${activeName} loading ${calcHelp(`${activeName} loading = ${activeName} 질량 / 전극 면적입니다. 전극 면적은 지름 ${fixed(c.diameter, 4)} mm 기준 π × (지름/20)^2 = ${fixed(c.area, 6)} cm2이고, ${fixed(c.ncmMass, 9)} g / ${fixed(c.area, 6)} cm2 = ${fixed(c.ncmLoadingArea, 8)} g cm-2입니다.`)}</strong><span>${fixed(c.ncmLoadingArea, 8)} g cm-2</span></div>
    </div>
    <section class="calcFormulaBox">
      <div>
        <strong>무게 계산</strong>
        <span>${fixed(c.totalMass, 6)} g - ${fixed(c.collectorMass, 6)} g = ${fixed(c.electrodeMass, 6)} g</span>
      </div>
      <div>
        <strong>두께 계산</strong>
        <span>${fixed(c.totalThickness, 4)} mm - ${fixed(c.collectorThickness, 4)} mm = ${fixed(c.electrodeThickness, 4)} mm</span>
      </div>
    </section>
    <section class="rateCurrentBox">
      <div class="rateCurrentHeader">
        <h3>C-rate별 전류 ${calcHelp(`각 C-rate 전류 = 1C 전류 × C-rate입니다. 예를 들어 0.33C는 ${fixed(c.oneC, 4)} mA × 0.33 = ${fixed(c.oneC * 0.33, 4)} mA입니다.`)}</h3>
        <span>1C = ${fixed(c.oneC, 4)} mA 기준</span>
      </div>
      <div class="rateCurrentGrid">
        ${c.rates.map((r) => `
          <div class="rateCurrentItem">
            <strong>${r.rate} C</strong>
            <span>${fixed(r.current, 4)} mA</span>
          </div>`).join("")}
      </div>
    </section>
    <div class="calcTableWrap">
      <table class="calcTable">
        <thead>
          <tr>
            <th colspan="2">로딩 ${calcHelp(`로딩 계산에 필요한 기준값입니다. C-Al은 집전체 무게, 1C는 NCM 질량과 이론용량으로 계산한 기준 전류입니다.`)}</th>
            <th colspan="3">전극 입력값 ${calcHelp(`전극 전체 입력값에서 C-coated Al 값을 빼고, 전극 지름으로 면적을 계산합니다.`)}</th>
            <th colspan="3" class="sectionBlue">loading amount ${calcHelp(`각 성분 질량 = Al 제외 전극 무게 × 조성비입니다. NCM은 ${fixed(c.electrodeMass, 6)} g × ${fixed(c.ncmRatio * 100, 2)}% = ${fixed(c.ncmMass, 9)} g입니다.`)}</th>
            <th colspan="2" class="sectionGreen">밀도 계산 ${calcHelp(`전체 밀도 = Al 제외 전극 무게 / 전극 부피입니다. 전극 부피 = 면적 × 두께(cm) = ${fixed(c.area, 6)} × ${fixed(c.electrodeThickness / 10, 6)} = ${fixed(c.volume, 8)} cm3입니다.`)}</th>
          </tr>
          <tr>
            <th>${calcHelpLabel(collectorName, `${collectorName} 집전체의 무게입니다. 전극 전체 무게에서 이 값을 빼서 활물질층 무게를 구합니다.`)}</th>
            <th class="rateHead">${calcHelpLabel("1C", `1C 전류는 ${activeName} 질량 × 이론용량으로 계산한 기준 전류입니다.`)}</th>
            <th>${calcHelpLabel(`${collectorName} 제외 전극 무게 (g)`, `전극 전체 무게에서 ${collectorName} 무게를 뺀 값입니다.`)}</th>
            <th>${calcHelpLabel(`${collectorName} 제외 전극 두께 (mm)`, `전극 전체 두께에서 ${collectorName} 두께를 뺀 값입니다.`)}</th>
            <th>${calcHelpLabel("Area (cm2)", "전극 지름으로 계산한 원형 전극 면적입니다. π × (지름/20)^2 입니다.")}</th>
            <th>${calcHelpLabel(activeName, `${collectorName} 제외 전극 무게에 ${activeName} 조성비를 곱한 질량입니다.`)}</th>
            <th>${calcHelpLabel(conductorName, `${collectorName} 제외 전극 무게에 ${conductorName} 조성비를 곱한 도전재 질량입니다.`)}</th>
            <th>${calcHelpLabel(binderName, `${collectorName} 제외 전극 무게에 ${binderName} 조성비를 곱한 바인더 질량입니다.`)}</th>
            <th>${calcHelpLabel("전체 밀도", "Al 제외 전극 무게를 전극 부피로 나눈 값입니다.")}</th>
            <th>${calcHelpLabel(`${activeName} density`, `${activeName} 질량을 전극 부피로 나눈 값입니다.`)}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${fixed(c.collectorMass, 6)} ${calcHelp(`C-coated Al 무게 입력값입니다.`)}</td>
            <td class="rateHead">${fixed(c.oneC, 4)} ${calcHelp(`${fixed(c.ncmMass, 9)} g × ${fixed(c.capacity, 4)} mAh g-1 = ${fixed(c.oneC, 4)} mA`)}</td>
            <td>${fixed(c.electrodeMass, 6)} ${calcHelp(`${fixed(c.totalMass, 6)} g - ${fixed(c.collectorMass, 6)} g = ${fixed(c.electrodeMass, 6)} g`)}</td>
            <td>${fixed(c.electrodeThickness, 4)} ${calcHelp(`${fixed(c.totalThickness, 4)} mm - ${fixed(c.collectorThickness, 4)} mm = ${fixed(c.electrodeThickness, 4)} mm`)}</td>
            <td>${fixed(c.area, 6)} ${calcHelp(`지름 ${fixed(c.diameter, 4)} mm 기준 면적입니다.`)}</td>
            <td>${fixed(c.ncmMass, 9)} ${calcHelp(`${fixed(c.electrodeMass, 6)} g × ${fixed(c.ncmRatio * 100, 2)}%`)}</td>
            <td>${fixed(c.superMass, 9)} ${calcHelp(`${fixed(c.electrodeMass, 6)} g × ${fixed(c.superRatio * 100, 2)}%`)}</td>
            <td>${fixed(c.ptfeMass, 9)} ${calcHelp(`${fixed(c.electrodeMass, 6)} g × ${fixed(c.ptfeRatio * 100, 2)}%`)}</td>
            <td>${fixed(c.totalDensity, 8)} ${calcHelp(`${fixed(c.electrodeMass, 6)} g / ${fixed(c.volume, 8)} cm3`)}</td>
            <td>${fixed(c.ncmLoadingVolume, 8)} ${calcHelp(`${fixed(c.ncmMass, 9)} g / ${fixed(c.volume, 8)} cm3`)}</td>
          </tr>
          <tr>
            <th>${calcHelpLabel(collectorName, `${collectorName} 집전체 두께입니다.`)}</th>
            <th>${calcHelpLabel(`${collectorName} 무게`, `${collectorName} 집전체 무게입니다.`)}</th>
            <th>${calcHelpLabel("loading (g cm-2)", "Al 제외 전극 무게를 전극 면적으로 나눈 값입니다.")}</th>
            ${c.rates.map((r) => `<th>${calcHelpLabel(`${r.rate} C 전류`, `1C 전류 ${fixed(c.oneC, 4)} mA × ${r.rate} = ${fixed(r.current, 4)} mA입니다.`)}</th>`).join("")}
            <th colspan="2">${calcHelpLabel(`${activeName} loading (g cm-2)`, `${activeName} 질량을 전극 면적으로 나눈 값입니다.`)}</th>
          </tr>
          <tr>
            <td>${fixed(c.collectorThickness, 4)} ${calcHelp(`C-coated Al 두께 입력값입니다.`)}</td>
            <td>${fixed(c.collectorMass, 6)} ${calcHelp(`C-coated Al 무게 입력값입니다.`)}</td>
            <td>${fixed(c.loading, 8)} ${calcHelp(`${fixed(c.electrodeMass, 6)} g / ${fixed(c.area, 6)} cm2`)}</td>
            ${c.rates.map((r) => `<td>${fixed(r.current, 4)} ${calcHelp(`${fixed(c.oneC, 4)} mA × ${r.rate}`)}</td>`).join("")}
            <td colspan="2">${fixed(c.ncmLoadingArea, 8)} ${calcHelp(`${fixed(c.ncmMass, 9)} g / ${fixed(c.area, 6)} cm2`)}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="copyNote">Al 제외 전극 무게/두께는 입력한 전극 전체값에서 C-coated Al 값을 뺀 값입니다. 전극 지름 기준 면적을 사용하므로 지름을 바꾸면 loading과 밀도가 같이 바뀝니다.</p>`;
  renderElectrodeProfileStore();
  renderElectrodeCalcSlots();
}

function runElectrodeCalc() {
  lastElectrodeCalcAt = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  renderElectrodeCalc();
  const box = $("electrodeCalcResult");
  box?.insertAdjacentHTML("beforeend", `<p class="calcUpdated">계산 완료: ${escapeXml(lastElectrodeCalcAt)}</p>`);
  box?.classList.remove("calcFlash");
  void box?.offsetWidth;
  box?.classList.add("calcFlash");
  setStatus("전극 계산 완료");
}

function toggleCalcHelp(event) {
  const button = event.target.closest?.(".calcHelpButton");
  if (!button) return;
  event.preventDefault();
  event.stopPropagation();
  const old = button.parentElement?.querySelector(".calcHelpText");
  if (old) {
    old.remove();
    button.setAttribute("aria-expanded", "false");
    return;
  }
  document.querySelectorAll(".calcHelpText").forEach((el) => el.remove());
  document.querySelectorAll(".calcHelpButton[aria-expanded='true']").forEach((el) => el.setAttribute("aria-expanded", "false"));
  const text = button.dataset.calcHelp || "";
  const note = document.createElement("span");
  note.className = "calcHelpText";
  note.textContent = text;
  button.insertAdjacentElement("afterend", note);
  button.setAttribute("aria-expanded", "true");
}

function copyElectrodeCalc() {
  const c = electrodeCalcData();
  const rows = [
    ["항목", "값", "단위"],
    ["1C 전류", fixed(c.oneC, 6), "mA"],
    ["전극 무게 except Al", fixed(c.electrodeMass, 9), "g"],
    ["전극 두께 except Al", fixed(c.electrodeThickness, 6), "mm"],
    ["면적", fixed(c.area, 9), "cm2"],
    ["loading", fixed(c.loading, 9), "g cm-2"],
    ["NCM 질량", fixed(c.ncmMass, 9), "g"],
    ["Super P 질량", fixed(c.superMass, 9), "g"],
    ["PTFE 질량", fixed(c.ptfeMass, 9), "g"],
    ["전체 밀도", fixed(c.totalDensity, 9), "g cm-3"],
    ["NCM loading", fixed(c.ncmLoadingArea, 9), "g cm-2"],
    ["NCM density", fixed(c.ncmLoadingVolume, 9), "g cm-3"],
    ...c.rates.map((r) => [`${r.rate} C 전류`, fixed(r.current, 6), "mA"]),
  ];
  const text = rows.map((row) => row.join("\t")).join("\n");
  navigator.clipboard?.writeText(text).then(
    () => setStatus("전극 계산표를 복사했습니다."),
    () => setStatus("복사 권한이 없어 표를 선택해서 복사해 주세요.")
  );
}

async function submitFeedback(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const status = $("feedbackStatus");
  const fd = new FormData(form);
  const message = String(fd.get("message") || "").trim();
  if (!message) {
    if (status) {
      status.textContent = "수정 요청 내용을 먼저 적어주세요.";
      status.className = "error";
    }
    return;
  }
  const selected = currentDataset();
  const activeTab = document.querySelector(".tab.active")?.textContent?.trim() || "";
  const payload = {
    name: fd.get("name"),
    email: fd.get("email"),
    page: fd.get("page") || activeTab,
    message,
    selectedDatasetId: selected?.id || "",
    selectedDatasetName: selected ? sampleLabel(selected) : "",
  };
  if (status) {
    status.textContent = "의견을 저장하는 중입니다...";
    status.className = "";
  }
  try {
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || "의견 저장 실패");
    form.reset();
    if (status) {
      const when = new Date(body.createdAt || Date.now()).toLocaleString("ko-KR");
      status.textContent = `저장됐습니다. 접수 시간: ${when}`;
      status.className = "success";
    }
    setStatus("수정 요청 저장 완료");
    if (state.user?.role === "admin") loadFeedbacks().catch(() => {});
  } catch (err) {
    if (status) {
      status.textContent = err.message || "의견을 저장하지 못했습니다.";
      status.className = "error";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setBusy(false);
  if ($("appVersion")) $("appVersion").textContent = PORTAL_VERSION_LABEL;
  on("loginForm", "submit", safeLogin);
  on("registerForm", "submit", safeRegister);
  on("loginButton", "click", safeLogin);
  on("registerButton", "click", safeRegister);
  on("logoutBtn", "click", () => applyUser(null));
  on("createOrganization", "click", () => createOrganizationFromInput().catch((err) => setStatus(err.message)));
  on("addOrganizationMember", "click", () => addOrganizationMember().catch((err) => setStatus(err.message)));
  on("refreshOrganizationMembers", "click", () => loadOrganizationMembers().catch((err) => setStatus(err.message)));
  on("organizationSelect", "change", () => {
    state.selectedOrganizationId = $("organizationSelect")?.value || "";
    state.organizationMembers = [];
    renderOrganizationView();
    loadOrganizationMembers().catch((err) => setStatus(err.message));
  });
  on("createProject", "click", () => createProjectFromInput().catch((err) => setStatus(err.message)));
  on("createCampaign", "click", () => createCampaignFromInput().catch((err) => setStatus(err.message)));
  on("createDatasetGroup", "click", () => createDatasetGroupFromInput().catch((err) => setStatus(err.message)));
  on("openUploadFilePicker", "click", () => $("smartFile")?.click());
  on("projectSelect", "change", () => renderHierarchyControls({ projectId: $("projectSelect")?.value || "", campaignId: "", cellRecordId: "" }));
  on("campaignSelect", "change", () => renderHierarchyControls({ projectId: $("projectSelect")?.value || "", campaignId: $("campaignSelect")?.value || "", cellRecordId: "" }));
  on("cellRecordSelect", "change", () => renderHierarchyControls(hierarchySelectionPayload()));
  on("datasetGroupSelect", "change", () => renderHierarchyControls(hierarchySelectionPayload()));
  on("reloadUsers", "click", () => loadUsers());
  on("reloadFeedback", "click", () => loadFeedbacks().catch((err) => setStatus(err.message)));
  on("backHome", "click", showHome);
  on("brandHome", "click", showHome);
  on("brandHome", "keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      showHome();
    }
  });
  for (const card of document.querySelectorAll(".moduleCard")) {
    card.addEventListener("click", () => {
      if (card.dataset.view === "search") return openSearchView(card.dataset.searchType || "all");
      if (card.dataset.view) return openWorkspaceView(card.dataset.view);
      showModule(card.dataset.module);
    });
  }
  for (const item of document.querySelectorAll(".menuTrigger, .menuItem, .searchShortcutPanel [data-view]")) {
    item.addEventListener("click", () => navigateMenuTarget(item));
  }
  on("datasetForm", "submit", saveDataset);
  on("datasetSelect", "change", (e) => { state.selectedId = e.target.value; renderSavedList(); renderCurrent(); });
  on("analysisLabDatasetSelect", "change", (e) => {
    state.selectedId = e.target.value;
    state.analysisRuns = [];
    state.selectedAnalysisRunId = null;
    renderSelect();
    renderSavedList();
    renderCurrent();
    loadAnalysisRuns().catch((err) => setStatus(err.message));
  });
  on("analysisType", "change", () => renderAnalysisLab());
  on("runDatasetAnalysis", "click", runSelectedDatasetAnalysis);
  on("refreshAnalysisRuns", "click", () => loadAnalysisRuns().catch((err) => setStatus(err.message)));
  on("savedDateSelect", "change", applyFilters);
  on("fromDate", "input", applyFilters);
  on("toDate", "input", applyFilters);
  on("query", "input", applyFilters);
  on("clearFilters", "click", clearSearchFilters);
  on("reloadData", "click", loadData);
  on("refreshAiSummary", "click", renderAISummary);
  on("saveAiReport", "click", saveAiReport);
  on("cellMetadataForm", "submit", saveCellMetadata);
  on("protocolSegmentForm", "submit", saveProtocolSegment);
  for (const btn of document.querySelectorAll(".searchType")) {
    btn.addEventListener("click", () => {
      setSearchType(btn.dataset.searchType || "all");
      applyFilters();
    });
  }
  on("exportSvg", "click", exportSvg);
  on("exportPng", "click", exportPng);
  on("exportPpt", "click", exportPpt);
  on("deleteDataset", "click", deleteCurrent);
  on("applyCellInfo", "click", applyCellInfo);
  on("saveCellInfoTop", "click", applyCellInfo);
  on("undoExcelEdit", "click", undoExcelEdit);
  on("addExcelRow", "click", addExcelRow);
  on("deleteExcelRow", "click", deleteSelectedExcelRow);
  on("saveExcelRows", "click", saveCurrentExcelRows);
  on("saveFigureEdits", "click", () => saveFigureEdits(false));
  on("compareCycFigures", "click", renderCycComparison);
  on("clearCompareSelection", "click", clearCompareSelection);
  on("addAnnotation", "click", addOrUpdateAnnotation);
  on("decreaseAnnotationSize", "click", () => changeAnnotationSize(-1));
  on("increaseAnnotationSize", "click", () => changeAnnotationSize(1));
  on("annotationSize", "change", () => changeAnnotationSize(0));
  on("figureSeriesColor", "input", changeFigureSeriesColor);
  on("figureAspectRatio", "change", changeFigureAspectRatio);
  on("clearAnnotations", "click", clearAnnotations);
  on("annotationText", "keydown", (event) => { if (event.key === "Enter") addOrUpdateAnnotation(); });
  on("smartFile", "change", () => resetAnalysisForNewFile());
  on("inspectFile", "click", () => inspectSelectedFile());
  on("inspectManual", "click", inspectManualFile);
  on("runElectrodeCalc", "click", runElectrodeCalc);
  on("copyElectrodeCalc", "click", copyElectrodeCalc);
  on("saveElectrodeProfile", "click", saveElectrodeProfile);
  on("applyElectrodeProfileToCyc", "click", () => applyElectrodeProfileToSelectedCyc());
  on("feedbackForm", "submit", submitFeedback);
  $("organizationMembersList")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-organization-member]");
    if (button) removeOrganizationMember(button.dataset.removeOrganizationMember).catch((err) => setStatus(err.message));
  });
  $("electrodeProfileList")?.addEventListener("click", handleElectrodeProfileListClick);
  $("electrodeCalcResult")?.addEventListener("click", toggleCalcHelp);
  $("electrodeCalcSlots")?.addEventListener("input", handleElectrodeSlotInput);
  $("electrodeCalcSlots")?.addEventListener("change", handleElectrodeSlotChange);
  $("electrodeCalcSlots")?.addEventListener("click", handleElectrodeSlotClick);
  on("calcElectrodeType", "change", applyElectrodePreset);
  for (const id of ["calcTotalMass", "calcCollectorMass", "calcTotalThickness", "calcCollectorThickness", "calcDiameter", "calcCapacity", "calcNcmRatio", "calcSuperRatio", "calcPtfeRatio"]) {
    on(id, "input", renderElectrodeCalc);
  }
  on("createFigure", "click", createSmartFigure);
  for (const tab of document.querySelectorAll(".tab")) {
    tab.addEventListener("click", () => {
      if (tab.dataset.module) {
        showModule(tab.dataset.module);
        return;
      }
      openWorkspaceView(tab.dataset.view);
    });
  }
  const cached = localStorage.getItem("eisUser");
  if (cached) {
    try { applyUser(JSON.parse(cached)); }
    catch { applyUser(null); }
  } else {
    applyUser(null);
  }
  loadElectrodeProfiles();
  loadElectrodeCalcSlots();
  updateElectrodeLabels();
  renderElectrodeCalc();
});
