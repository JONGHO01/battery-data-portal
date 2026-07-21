const PORTAL_VERSION = "0.1.38";
const PORTAL_VERSION_LABEL = `Battery Portal v${PORTAL_VERSION}`;

// README? CHANGELOG??理쒖떊 ?섎? ?덈뒗 蹂寃쎌쓣 愿由ъ옄 ?붾㈃?먯꽌??鍮좊Ⅴ寃??뺤씤?⑸땲??
// ?꾩껜 怨쇨굅 ?대젰? ??μ냼??CHANGELOG.md媛 湲곗??대ŉ, ??紐⑸줉? ?댁쁺?먭? 蹂대뒗 ?붿빟?낅땲??
const RELEASE_HISTORY = [
  {
    version: "0.1.38",
    date: "2026-07-21",
    changes: ["Restore readable saved Fig comparison labels and controls, reuse duplicate raw-source uploads, and keep local SQLite WAL files out of Git uploads."],
  },
  {
    version: "0.1.37",
    date: "2026-07-20",
    changes: ["Restore clear Korean upload guidance, selected-file labels, batch action text, error messages, and CYC/CV/EIS Fig choices after dynamic text encoding damage."],
  },
  {
    version: "0.1.36",
    date: "2026-07-20",
    changes: ["CYC Fig filename parsing now ignores a cell/sample number before the first fractional C-rate, preventing labels such as 4 C for 0.33 C -> 1 C -> re 0.33 C runs."],
  },
  {
    version: "0.1.35",
    date: "2026-07-20",
    changes: ["Restore clear Korean labels for saved Fig cards, Fig categories, and the administrator account badge."],
  },
  {
    version: "0.1.34",
    date: "2026-07-20",
    changes: ["Restore clear Korean empty-state guidance in the Fig workspace and editable data table."],
  },
  {
    version: "0.1.33",
    date: "2026-07-20",
    changes: ["Support ZIVE SmartManager .SDE files through the validated EIS binary parser, including file-picker guidance and SDE-specific inspection labels."],
  },
  {
    version: "0.1.32",
    date: "2026-07-20",
    changes: ["Batch analysis now uses the already selected hierarchy Cell when the separate Cell ID field is empty, so multi-file analysis starts without re-entering the same Cell."],
  },  {
    version: "0.1.31",
    date: "2026-07-20",
    changes: ["After a multi-file batch completes or fails, the file picker is released and cleared so another selection immediately starts a new batch. Duplicate batch starts are prevented while processing."],
  },
  {
    version: "0.1.30",
    date: "2026-07-20",
    changes: ["WRD CYC parsing now prioritizes the precise electrode mass in the filename, and C-rate guides/y-axis ticks are constrained so CYC Figs remain readable without left-axis overlap."],
  },
  {
    version: "0.1.29",
    date: "2026-07-20",
    changes: ["When multiple files are selected, the primary analysis button now immediately starts the sequential batch Dataset and Fig workflow instead of showing a blocking instruction."],
  },
  {
    version: "0.1.28",
    date: "2026-07-20",
    changes: ["The desktop data-registration sidebar is now 420-450px wide so selected-file details, action labels, and upload status do not clip."],
  },
  {
    version: "0.1.27",
    date: "2026-07-20",
    changes: ["Artifact paths now compact long project, cell, Dataset, and WRD filenames before writing them locally. This prevents Windows path-length failures after a successful CYC inspection."],
  },
  {
    version: "0.1.26",
    date: "2026-07-20",
    changes: ["The desktop menu now preserves full button labels and scrolls horizontally only when needed. Retrying a completed file save returns the original Dataset instead of failing with a duplicate-upload error."],
  },
  {
    version: "0.1.25",
    date: "2026-07-16",
    changes: ["Large CYC/EIS file finalization now uses SQLite WAL mode and a 30-second write wait, reducing transient Dataset-save server errors during concurrent browser activity."],
  },
  {
    version: "0.1.24",
    date: "2026-07-16",
    changes: ["CYC ?붿빟 ?곗씠?곕룄 ?꾩븬怨??꾨쪟??cycle蹂?蹂?붾? ?④퍡 蹂댁뿬二쇨퀬, ?먮낯 ?꾩븬 ?꾨줈?뚯씪? 怨≪꽑蹂??됯퇏 ?꾨쪟瑜?踰붾????쒖떆?섎룄濡?媛쒖꽑?덉뒿?덈떎."],
  },
  {
    version: "0.1.23",
    date: "2026-07-16",
    changes: ["CYC Fig ?앹꽦 ???좏깮???깅뒫, ?꾩븬 ?꾨줈?뚯씪, ?듯빀 Fig 醫낅쪟媛 媛곴컖 ?ㅻⅨ ?붾㈃?쇰줈 ?뚮뜑留곷릺?꾨줉 ?섏젙?덉뒿?덈떎. ?꾩븬-?⑸웾/?쒓컙 怨≪꽑 ?먯씠 遺議깊븳 ?붿빟 ?뚯씪? ?섎せ??怨≪꽑??留뚮뱾吏 ?딄퀬 ?댁쑀瑜??덈궡?⑸땲??"],
  },
  {
    version: "0.1.22",
    date: "2026-07-16",
    changes: ["留뚮즺?섏뿀嫄곕굹 ?쒕쾭 ?ъ떆?묒쑝濡?臾댄슚媛 ??濡쒓렇???좏겙??媛먯??섎㈃, ?뚯씪 遺꾩꽍 ?ㅻ쪟 ???濡쒓렇???붾㈃?쇰줈 ?덉쟾?섍쾶 ?뚯븘媛?꾨줉 ?섏젙?덉뒿?덈떎."],
  },
  {
    version: "0.1.21",
    date: "2026-07-16",
    changes: ["?щ윭 ?뚯씪????踰덉뿉 ?좏깮??理쒕? 10媛쒓퉴吏 ?쒖꽌?濡?遺꾩꽍쨌??ν븯怨? ?뚯씪蹂?Dataset怨?Fig 湲곕줉??留뚮뱾 ???덈룄濡?異붽??덉뒿?덈떎."],
  },
  {
    version: "0.1.20",
    date: "2026-07-16",
    changes: ["CYC ?뚯씪??紐낆떆??C-rate ?댁쓣 ?쎌뼱 Fig cycle 援ш컙???먮룞 援щ텇?섎룄濡?媛쒖꽑?덉뒿?덈떎."],
  },
  {
    version: "0.1.19",
    date: "2026-07-16",
    changes: ["?ы꽭 ?붾㈃??Fig ?⑹뼱瑜??듭씪?덉뒿?덈떎."],
  },
  {
    version: "0.1.18",
    date: "2026-07-16",
    changes: ["WBCS WRD?먯꽌 吏㏐쾶 ?딄릿 ?쒖옉쨌醫낅즺 議곌컖? ?쒖쇅?섍퀬, CYC Fig?먮뒗 1 ?댁긽???좏슚 cycle留?洹몃━?꾨줉 蹂댁셿?덉뒿?덈떎."],
  },
  {
    version: "0.1.17",
    date: "2026-07-16",
    changes: ["?뚯씪 醫낅쪟 ?좏깮 紐⑸줉????긽 ?댁뼱 ?먭퀬, CYC쨌CV쨌EIS ??ぉ??諛붾줈 怨좊Ⅴ硫?吏곸젒 ?좏깮 紐⑤뱶濡??꾪솚?섎룄濡??섏젙?덉뒿?덈떎."],
  },
  {
    version: "0.1.16",
    date: "2026-07-16",
    changes: ["?쇱긽 ?묒뾽 ?붾㈃?먯꽌??Analysis Lab 硫붾돱, ??移대뱶, ?묒뾽 ??쓣 ?④꼈?듬땲?? 湲곗〈 遺꾩꽍 湲곕뒫怨?????대젰? 蹂댁〈?섏뼱 ?섏쨷???ㅼ떆 ?????덉뒿?덈떎."],
  },
  {
    version: "0.1.15",
    date: "2026-07-15",
    changes: ["濡쒓렇???낅젰李쎌뿉??Enter濡??쒖텧?????덇쾶 ?섍퀬, ?뚯씪 ?먮퀎???곗씠??醫낅쪟 ?좏깮怨??쎄린 ?꾩슜 ???대쫫??紐낇솗??援щ텇?덉뒿?덈떎."],
  },
  {
    version: "0.1.14",
    date: "2026-07-15",
    changes: ["60 MB? WBCS CYC WRD ?뚯씪??湲곕낯 ?낅줈???쒕룄 100 MB?먯꽌 ?쎄퀬, ?쒕룄 珥덇낵 ?ъ쑀瑜??붾㈃??紐낇솗???쒖떆?섎룄濡?媛쒖꽑?덉뒿?덈떎."],
  },
  {
    version: "0.1.13",
    date: "2026-07-15",
    changes: ["README? 愿由ъ옄 ?꾩슜 ?붾㈃?먯꽌 踰꾩쟾 ?대젰???뺤씤?????덈룄濡?異붽??덉뒿?덈떎."],
  },
  {
    version: "0.1.12",
    date: "2026-07-15",
    changes: ["AI ?붿빟 硫붾돱, ??移대뱶, ?묒뾽 ??낵 ?꾩슜 ?붾㈃???쒓굅?섍퀬 湲곗〈 ?곗씠???명솚?깆? ?좎??덉뒿?덈떎."],
  },
  {
    version: "0.1.11",
    date: "2026-07-15",
    changes: ["CYC ?덈? ?⑸웾(Ah/mAh)??Retention 遺꾩꽍??諛섏쁺?섍퀬, 遺꾩꽍 ?대젰???덈뒗 Dataset ??젣瑜?蹂댁셿?덉뒿?덈떎."],
  },
  {
    version: "0.1.10",
    date: "2026-07-15",
    changes: ["?댁쁺 ?섍꼍 ?몄쬆, CORS, ?뚯씪 ??? ?낅줈???ш린, Dataset ??젣? ?꾪떚?⑺듃 ?뺣━瑜?媛뺥솕?덉뒿?덈떎."],
  },
  {
    version: "0.1.9",
    date: "2026-07-15",
    changes: ["?쒕㎤??踰꾩쟾 泥닿퀎? ?꾨줈?앺듃 ?꾩슜 ?ㅽ궗, 蹂寃??대젰 湲곕줉 洹쒖튃???꾩엯?덉뒿?덈떎."],
  },
];

// ?ы깉 ?꾩껜?먯꽌 怨듭쑀?섎뒗 ?붾㈃ ?곹깭?낅땲??
// ?쒕쾭????λ릺???곗씠?곕뒗 datasets???ㅼ뼱?ㅺ퀬, ?붾㈃ ?꾪꽣 寃곌낵??filtered???곕줈 ?〓땲??
// ?대젃寃?遺꾨━?섎㈃ 寃??議곌굔??諛붽퓭???먮낯 ?곗씠??紐⑸줉???ㅼ떆 遺덈윭?ㅼ? ?딆븘???⑸땲??
const state = { datasets: [], filtered: [], selectedId: null, user: null, users: [], feedbacks: [], hierarchy: [], organizations: [], selectedOrganizationId: "", organizationMembers: [], cellWorkspace: null, cellWorkspaceRequestId: 0, analysis: null, batchFigureResults: [], batchInProgress: false, analysisRuns: [], selectedAnalysisRunId: null, pendingAnalysisName: "", selectedAnnotation: null, manualInfo: null, inspectToken: 0, annotations: {}, layoutEdits: {}, figureStyles: {}, activeFigureModule: "cyc", searchType: "all", compareIds: [], comparisonColors: {}, tableSaveTimer: null, tableSelection: null, tableUndoStack: [], electrodeProfiles: [], selectedElectrodeProfileId: null, electrodeCalcSlots: [] };
let lastElectrodeCalcAt = "";
let busyUnlockTimer = null;

// ?꾧레 C-rate 怨꾩궛 ??μ냼???곗꽑 釉뚮씪?곗? localStorage????ν빀?덈떎.
// ?좏깮??CYC???곸슜?섎㈃ 洹?怨꾩궛媛믪? CYC ?곗씠?곗쓽 cell.electrodeCalc濡??ㅼ뼱媛 DB?먮룄 ?④퍡 ??λ맗?덈떎.
const ELECTRODE_PROFILE_KEY = "batteryElectrodeRateProfiles";
const ELECTRODE_CALC_SLOT_KEY = "batteryElectrodeCalcSlotsV1";
const ELECTRODE_CALC_SLOT_COUNT = 8;
const ELECTRODE_INPUT_IDS = ["calcElectrodeType", "calcTotalMass", "calcCollectorMass", "calcTotalThickness", "calcCollectorThickness", "calcDiameter", "calcCapacity", "calcNcmRatio", "calcSuperRatio", "calcPtfeRatio"];
const ELECTRODE_SLOT_FIELDS = [
  { id: "calcTotalMass", label: "?꾧레 ?꾩껜 臾닿쾶 (g)", step: "0.000001" },
  { id: "calcTotalThickness", label: "?꾧레 ?꾩껜 ?먭퍡 (mm)", step: "0.001" },
  { id: "calcCollectorMass", label: "吏묒쟾泥?臾닿쾶 (g)", step: "0.000001" },
  { id: "calcCollectorThickness", label: "吏묒쟾泥??먭퍡 (mm)", step: "0.001" },
  { id: "calcDiameter", label: "?꾧레 吏由?(mm)", step: "0.1" },
  { id: "calcCapacity", label: "?대줎 ?⑸웾 (mAh g-1)", step: "1" },
  { id: "calcNcmRatio", label: "?쒕Ъ吏?(%)", step: "0.1" },
  { id: "calcSuperRatio", label: "?꾩쟾??(%)", step: "0.1" },
  { id: "calcPtfeRatio", label: "諛붿씤??(%)", step: "0.1" },
];
const FILE_INSPECT_TIMEOUT_MS = 150000;
const BATCH_FIGURE_FILE_LIMIT = 10;
const BATCH_FIGURE_KIND_BY_TYPE = { cyc: "cycling-performance", cv: "cv-curve", eis: "eis-combined" };

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

function setBusy(on, message = "?곗씠?곕? 泥섎━?섍퀬 ?덉뒿?덈떎.", timeoutMs = 45000) {
  const overlay = $("busyOverlay");
  if (!overlay) return;
  if (busyUnlockTimer) {
    clearTimeout(busyUnlockTimer);
    busyUnlockTimer = null;
  }
  $("busyMessage").textContent = message;
  overlay.classList.toggle("hidden", !on);
  if (on && timeoutMs > 0) {
    busyUnlockTimer = window.setTimeout(() => {
      overlay.classList.add("hidden");
      setStatus("분석 지연");
      setAnalysisMessage(
        "?뚯씪 遺꾩꽍 ?묐떟???ㅻ옒 嫄몃젮 ?붾㈃ ?좉툑???먮룞?쇰줈 ??덉뒿?덈떎. ?덈줈怨좎묠?섏? 留먭퀬, ?뚯씪???ㅼ떆 ?좏깮????'?뚯씪 遺꾩꽍'????踰덈쭔 ?뚮윭二쇱꽭??",
        "遺꾩꽍???ㅻ옒 嫄몃┰?덈떎"
      );
    }, timeoutMs);
  }
}

function setAnalysisMessage(text, title = "?뺤씤 ?꾩슂") {
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
    state.batchFigureResults = [];
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
  setStatus("硫붾돱");
}

function showWorkspace() {
  if ($("moduleHome")) $("moduleHome").classList.add("hidden");
  $("dataWorkspace").classList.remove("hidden");
  setStatus("Data workspace");
}

// ?곷떒 硫붾돱????뿉??"寃??, "?꾧레 怨꾩궛", "遺꾩꽍" 媛숈? ???붾㈃?쇰줈 ?대룞?????ъ슜?⑸땲??
// 媛??붾㈃???????꾩슂???뚮뜑留곷룄 ?ш린????踰덉뿉 ?ㅽ뻾?⑸땲??
function openWorkspaceView(viewName) {
  if ($("moduleHome")) $("moduleHome").classList.add("hidden");
  $("dataWorkspace").classList.remove("hidden");
  if (viewName === "search") {
    setSearchType(state.searchType || "all");
  }
  activateView(viewName);
  if (viewName === "search") renderSearchResults();
  if (viewName === "electrodeCalc") renderElectrodeCalc();
  if (viewName === "analysisLab") {
    renderAnalysisLab();
    loadAnalysisRuns().catch((err) => setStatus(err.message));
  }
  if (viewName === "organization") {
    renderOrganizationView();
    loadOrganizations().catch((err) => setStatus(err.message));
  }
  if (viewName === "feedbackAdmin") loadFeedbacks().catch((err) => setStatus(err.message));
  if (viewName === "releaseHistory") renderReleaseHistory();
  if (viewName === "users") loadUsers().catch((err) => setStatus(err.message));
  renderSelect();
  renderSavedList();
  renderCurrent();
  const label = { search: "검색", savedFigures: "Fig 모음", electrodeCalc: "전극 계산", analysisLab: "Analysis Lab", feedbackAdmin: "의견함", releaseHistory: "버전 이력", users: "사용자 관리", figure: "Fig" }[viewName] || "작업 화면";
  setStatus(label);
  if (viewName === "electrodeCalc") setElectrodeCalcMode("calc");
}

// ?곷떒 ?쒕∼?ㅼ슫 硫붾돱??怨듯넻 ?쇱슦?곗엯?덈떎.
// 踰꾪듉??data-view, data-module 媛숈? ?띿꽦???ъ븘?먮㈃ ???⑥닔媛 ?뚮쭪? ?붾㈃?쇰줈 蹂대깄?덈떎.
function navigateMenuTarget(target) {
  const module = target?.dataset?.module;
  const view = target?.dataset?.view;
  const focusSection = target?.dataset?.focusSection;
  const electrodeMode = target?.dataset?.electrodeMode;
  const analysisName = target?.dataset?.analysisName;
  if (view === "search") return openSearchView(target.dataset.searchType || "all");
  if (module) return showModule(module);
  if (view) {
    if (view === "analysisLab" && analysisName) state.pendingAnalysisName = analysisName;
    openWorkspaceView(view);
    if (view === "electrodeCalc") {
      setElectrodeCalcMode(electrodeMode || "calc");
    }
    if (focusSection) {
      window.setTimeout(() => {
        document.querySelector(`.${focusSection}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }
}

// ?꾧레 怨꾩궛 ?붾㈃? 怨꾩궛 ?낅젰 紐⑤뱶? ??μ냼 紐⑤뱶瑜??④퍡 ?곷땲??
// ??μ냼 硫붾돱瑜??꾨Ⅴ硫?profileMode瑜?耳쒖꽌 ??μ냼 諛뺤뒪瑜????꾩뿉 蹂댁씠寃??⑸땲??
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
  setStatus("검색 페이지");
}

function showModule(module) {
  if (["figure", "cyc", "cv", "eis"].includes(module)) {
    state.activeFigureModule = module === "figure" ? "cyc" : module;
    $("moduleHome").classList.add("hidden");
    $("dataWorkspace").classList.remove("hidden");
    ensureSelectedForModule(state.activeFigureModule);
    activateView("figure", state.activeFigureModule);
    const label = { cyc: "CYC Fig", cv: "CV Fig", eis: "EIS Fig" }[state.activeFigureModule] || "Fig 만들기";
    const hint = {
      cyc: "CYC 파일을 넣으면 사이클, 방전용량, C-rate를 자동 판별합니다.",
      cv: "CV 파일을 넣으면 전압-전류 곡선과 scan rate를 자동 판별합니다.",
      eis: "EIS 파일을 넣으면 Nyquist/Bode Fig 데이터를 자동 판별합니다.",
    }[state.activeFigureModule];
        if ($("fileHint") && hint) $("fileHint").textContent = `${hint} CSV/XLSX/XLSB/WRD/SEO/SDE 지원.`;
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
  if (!res.ok) return setLoginError(body.error || "濡쒓렇???ㅽ뙣");
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
  if (!res.ok) return setLoginError(body.error || "?꾩씠???앹꽦 ?ㅽ뙣");
  ev.currentTarget.reset();
  setLoginSuccess(`${body.user.id} ?꾩씠?붽? ?앹꽦?섏뿀?듬땲??`);
  applyUser(body.user);
  setStatus(`${body.user.id} ?꾩씠?붽? ?앹꽦?섏뿀?듬땲??`);
}

async function safeLogin(ev) {
  if (ev) ev.preventDefault();
  setLoginError("");
  setLoginSuccess("");
  try {
    const form = $("loginForm");
    const fd = new FormData(form);
    if (!$("loginId").value || !$("loginPassword").value) {
      return setLoginError("?꾩씠?붿? 鍮꾨?踰덊샇瑜??낅젰?섏꽭??");
    }
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: fd.get("id"), password: fd.get("password") }),
    });
    const body = await res.json();
    if (!res.ok) return setLoginError(body.error || "濡쒓렇???ㅽ뙣");
    form.reset();
    applyUser(body.user);
  } catch (error) {
    setLoginError(`濡쒓렇??泥섎━ 以??ㅻ쪟: ${error.message}`);
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
      return setLoginError("?꾩씠?붿? 鍮꾨?踰덊샇瑜??낅젰?섏꽭??");
    }
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: fd.get("id"), name: fd.get("name"), password: fd.get("password") }),
    });
    const body = await res.json();
    if (!res.ok) return setLoginError(body.error || "?꾩씠???앹꽦 ?ㅽ뙣");
    form.reset();
    setLoginSuccess(`${body.user.id} ?꾩씠?붽? ?앹꽦?섏뿀?듬땲??`);
    applyUser(body.user);
    setStatus(`${body.user.id} ?꾩씠?붽? ?앹꽦?섏뿀?듬땲??`);
  } catch (error) {
    setLoginError(`?꾩씠???앹꽦 以??ㅻ쪟: ${error.message}`);
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
      ? `<span class="mutedText">?꾩옱 怨꾩젙</span>`
      : `<button class="smallDanger" data-delete-user="${escapeAttr(user.id)}">?덊눜</button>`;
    return `<tr><td>${escapeXml(user.id)}</td><td>${escapeXml(user.name || "-")}</td><td>${user.role === "admin" ? "愿由ъ옄" : "?쇰컲"}</td><td>${action}</td></tr>`;
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
  if (!res.ok) throw new Error(body.error || "?섍껄 紐⑸줉??遺덈윭?ㅼ? 紐삵뻽?듬땲??");
  state.feedbacks = Array.isArray(body) ? body : [];
  renderFeedbackAdmin();
}

function renderFeedbackAdmin() {
  const summary = $("feedbackAdminSummary");
  const list = $("feedbackList");
  if (!summary || !list) return;
  if (!state.user || state.user.role !== "admin") {
    summary.innerHTML = "";
    list.innerHTML = `<p class="emptySaved">愿由ъ옄留??섍껄?⑥쓣 蹂????덉뒿?덈떎.</p>`;
    return;
  }
  const feedbacks = state.feedbacks || [];
  const latest = feedbacks[0]?.createdAt ? formatFeedbackTime(feedbacks[0].createdAt) : "-";
  const withContact = feedbacks.filter((item) => item.email).length;
  summary.innerHTML = `
    <div><strong>${feedbacks.length}</strong><span>?꾩껜 ?섍껄</span></div>
    <div><strong>${withContact}</strong><span>?곕씫泥??덉쓬</span></div>
    <div><strong>${escapeXml(latest)}</strong><span>理쒓렐 ?묒닔</span></div>
  `;
  if (!feedbacks.length) {
    list.innerHTML = `<p class="emptySaved">?꾩쭅 ?묒닔???섍껄???놁뒿?덈떎.</p>`;
    return;
  }
  list.innerHTML = feedbacks.map((item) => {
    const author = item.name || item.userName || item.userId || "?듬챸";
    const contact = item.email || "?곕씫泥??놁쓬";
    const page = item.page || "페이지 미지정";
    const user = item.userId ? `${item.userName || item.userId} / ${item.userId}` : "鍮꾨줈洹몄씤 ?먮뒗 ?ъ슜???뺣낫 ?놁쓬";
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
          <span>?곕씫泥? ${escapeXml(contact)}</span>
          <span>愿???섏씠吏: ${escapeXml(page)}</span>
          <span>?묒꽦 怨꾩젙: ${escapeXml(user)}</span>
        </div>
        <p>${escapeXml(item.message || "")}</p>
      </article>`;
  }).join("");
}

function renderReleaseHistory() {
  const current = $("releaseCurrentVersion");
  const list = $("releaseHistoryList");
  if (!list) return;
  if (current) current.textContent = `?꾩옱 踰꾩쟾 v${PORTAL_VERSION}`;
  list.innerHTML = RELEASE_HISTORY.map((release) => `
    <article class="releaseHistoryCard">
      <div class="releaseHistoryCardHeader">
        <h3>v${escapeXml(release.version)}</h3>
        <time datetime="${escapeXml(release.date)}">${escapeXml(release.date)}</time>
      </div>
      <ul>${release.changes.map((change) => `<li>${escapeXml(change)}</li>`).join("")}</ul>
    </article>
  `).join("");
}

async function deleteUser(id) {
  if (!confirm(`${id} ?ъ슜?먮? ?덊눜?쒗궎怨????ъ슜?먯쓽 ?곗씠?곕? ??젣?좉퉴??`)) return;
  const res = await fetch(`/api/users/${encodeURIComponent(id)}`, { method: "DELETE", headers: authHeaders() });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    setStatus(body.error || "?ъ슜????젣 ?ㅽ뙣");
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
  if (lines.length < 2) throw new Error("CSV???곗씠?곌? 遺議깊빀?덈떎.");
  const headers = splitCsvLine(lines[0]).map((x) => x.toLowerCase().replace(/[^a-z0-9]/g, ""));
  const find = (names) => headers.findIndex((h) => names.includes(h));
  const fi = find(["frequency", "freq", "f", "hz"]);
  const ri = find(["zreal", "real", "re", "zr", "zprime"]);
  const ii = find(["zimag", "imag", "im", "zi", "zdoubleprime"]);
  if (fi < 0 || ri < 0 || ii < 0) throw new Error("frequency, zreal, zimag 而щ읆??李얠? 紐삵뻽?듬땲??");
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
  return hasAnyTerm(key, ["諛⑹쟾", "discharge", "dchg", "dch"]);
}

function isChargeOnlyColumn(key) {
  return key.includes("異⑹쟾") || key.startsWith("charge") || key.startsWith("chg");
}

function isSpecificCapacityColumn(key) {
  return hasAnyTerm(key, ["specificcapacity", "?⑥쐞", "mahg", "ahg"]);
}

function isCapacityColumn(key) {
  return hasAnyTerm(key, ["capacity", "cap", "?⑸웾", "mah", "ah"]);
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
    if (key.includes("?꾩쟻") || key.includes("energy") || key.includes("?먮꼫吏")) score -= 40;
    if (key.includes("final") || key.includes("理쒖쥌") || key.includes("?꾩븬")) score -= 40;

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

// C-rate is often written as a number, "0.33 C", or a fraction such as "C/10".
// Convert those equivalent labels to one numeric value before plotting groups.
function parseCRateValue(value) {
  const direct = numberValue(value);
  if (Number.isFinite(direct) && direct > 0 && direct <= 20) return direct;
  const text = String(value ?? "").trim().toLowerCase().replace(/\s+/g, "");
  const fraction = text.match(/^c\/([0-9]+(?:\.[0-9]+)?)$/);
  if (fraction) {
    const denominator = Number(fraction[1]);
    return Number.isFinite(denominator) && denominator > 0 ? 1 / denominator : null;
  }
  const decimal = text.match(/^(?:re)?([0-9]+(?:\.[0-9]+)?)c?$/);
  const rate = decimal ? Number(decimal[1]) : NaN;
  return Number.isFinite(rate) && rate > 0 && rate <= 20 ? rate : null;
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
    zreal: findColumn(columns, ["zreal", "real", "re", "zr", "zprime", "실수"]),
    zimag: findColumn(columns, ["zimag", "imag", "im", "zi", "zdoubleprime", "허수"]),
    cycle: findColumn(columns, ["cycle", "사이클"]),
    cRate: findColumn(columns, ["crate", "cratec", "ratec", "c-rate", "c rate", "c레이트"]),
    specificCapacity: findBestCycColumn(columns, "dischargeSpecific") || findCycFallbackColumn(columns, "dischargeSpecific", ["dischargecapacityahg", "specificcapacity", "mahg", "방전용량ahg"]),
    chargeSpecificCapacity: findBestCycColumn(columns, "chargeSpecific") || findCycFallbackColumn(columns, "chargeSpecific", ["chargecapacityahg", "충전용량ahg"]),
    capacity: findBestCycColumn(columns, "dischargeCapacity") || findCycFallbackColumn(columns, "dischargeCapacity", ["dischargecapacity", "dischargecap", "dchgcap", "dchcap", "방전용량", "방전"]),
    chargeCapacity: findBestCycColumn(columns, "chargeCapacity") || findCycFallbackColumn(columns, "chargeCapacity", ["chargecapacity", "chargecap", "chgcap", "충전용량", "충전"]),
    efficiency: findColumn(columns, ["coulombicefficiency", "coulombefficiency", "쿨롬효율", "효율", "efficiency", "coulomb", "ce"]),
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
        cRate: parseCRateValue(r[col.cRate]),
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
      throw new Error("?뚯씪 遺꾩꽍 ?쒓컙???덈Т ?ㅻ옒 嫄몃젮 以묐떒?덉뒿?덈떎. ??XLS ?뚯씪?대㈃ Excel?먯꽌 .xlsx濡??ㅼ떆 ??ν븳 ???ｌ뼱二쇱꽭??");
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

function selectedUploadFiles() {
  return Array.from($("smartFile")?.files || []);
}

// Browser file inputs do not fire a new change event when the same file list
// stays selected. Clear only the picker after a batch has finished so the user
// can immediately select another batch while keeping the result summary shown.
function clearUploadSelectionAfterProcessing() {
  const input = $("smartFile");
  if (input) {
    input.value = "";
    input.disabled = false;
  }
  updateSelectedFileName();
  updateBatchFigureControl();
}

function baseNameWithoutExtension(filename) {
  return String(filename || "").replace(/\.[^.]+$/, "").trim() || "batch-file";
}

async function saveDatasetFromInspection(analysis, dataType, cell, figureKind) {
  const rows = canonicalRows(dataType, analysis.columns, analysis.rows);
  if (!rows.length) {
    throw new Error("???뚯씪?먯꽌 Fig???ъ슜???レ옄 ?곗씠?곕? 李얠? 紐삵뻽?듬땲??");
  }
  const { res, body: saved } = await fetchJsonWithTimeout("/api/datasets", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      cell,
      rows,
      columns: analysis.columns,
      sourceName: analysis.filename,
      dataType,
      figureKind,
      uploadId: analysis.uploadId || "",
      canonicalRows: Array.isArray(analysis.canonicalRows) ? analysis.canonicalRows : [],
      columnMapping: analysis.columnMapping || {},
      quality: analysis.quality || {},
      parser: analysis.parser || {},
      ...hierarchySelectionPayload(),
    }),
  });
  if (!res.ok) {
    throw new Error(apiErrorMessage(saved, "Dataset ???以??쒕쾭 ?ㅻ쪟媛 諛쒖깮?덉뒿?덈떎. ?섏씠吏瑜??덈줈怨좎묠?????ㅼ떆 ?쒕룄??二쇱꽭??"));
  }
  return saved;
}

async function saveFigureRecord(dataset) {
  const res = await fetch("/api/figures", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      datasetId: dataset.id,
      name: `${sampleLabel(dataset)} Fig`,
      figureKind: dataset.figureKind,
      edits: dataset.figureEdits || {},
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(apiErrorMessage(body, "Fig 湲곕줉????ν븯吏 紐삵뻽?듬땲??"));
  }
  return body;
}

function renderBatchFigureResults() {
  const panel = $("batchFigureResults");
  if (!panel) return;
  const results = state.batchFigureResults || [];
  if (!results.length) {
    panel.classList.add("hidden");
    panel.innerHTML = "";
    return;
  }
  const completed = results.filter((item) => item.ok).length;
  panel.classList.remove("hidden");
  panel.innerHTML = `
    <strong>여러 파일 Fig 생성 결과: ${completed}/${results.length}개 완료</strong>
    <p>파일은 순서대로 처리됩니다. 일부 파일이 실패해도 나머지 파일은 계속 분석합니다.</p>
    <ul>
      ${results.map((item) => `
        <li class="batchFigureResult ${item.ok ? "isOk" : "hasError"}">
          <div>
            <strong>${escapeXml(item.fileName)}</strong>
            <span>${item.ok ? `${String(item.dataType || "").toUpperCase()} Dataset 및 Fig 저장 완료${item.note ? ` · ${escapeXml(item.note)}` : ""}` : escapeXml(item.message || "처리하지 못했습니다.")}</span>
            ${item.note ? `<span>${escapeXml(item.note)}</span>` : ""}
          </div>
          ${item.ok ? `<button type="button" class="smallAction" data-open-batch-figure="${escapeAttr(item.datasetId)}">Fig 열기</button>` : ""}
        </li>
      `).join("")}
    </ul>
  `;
}

async function createBatchFigures() {
  const files = selectedUploadFiles();
  if (state.batchInProgress) {
    return setStatus("여러 파일 분석이 이미 진행 중입니다. 완료될 때까지 기다려주세요.");
  }
  if (files.length < 2) {
    return setStatus("여러 파일 Fig 생성은 파일을 2개 이상 선택해야 합니다.");
  }
  if (files.length > BATCH_FIGURE_FILE_LIMIT) {
    return setStatus(`한 번에 최대 ${BATCH_FIGURE_FILE_LIMIT}개 파일까지 처리할 수 있습니다.`);
  }

  const cell = batchCellForUpload(collectCellForm());
  // Use the selected hierarchy Cell when available. Without one, the backend creates the default Project/Campaign/Cell hierarchy from each file.
  state.inspectToken += 1;
  state.analysis = null;
  state.batchFigureResults = [];
  state.batchInProgress = true;
  const fileInput = $("smartFile");
  const inspectButton = $("inspectFile");
  if (fileInput) fileInput.disabled = true;
  if (inspectButton) inspectButton.disabled = true;
  renderAnalysis();
  renderBatchFigureResults();
  setStatus(`여러 파일 분석을 시작했습니다. ${files.length}개 파일을 순서대로 Dataset과 Fig로 저장합니다.`);
  setBusy(true, `${files.length}개 파일을 분석하고 Dataset 및 Fig를 생성하고 있습니다.`, 0);

  try {
    for (const file of files) {
      try {
        setStatus(`${file.name} 분석 중...`);
        const { res, body } = await inspectFileUpload(file);
        if (!res.ok) {
          throw new Error(apiErrorMessage(body, "파일 분석을 시작하지 못했습니다."));
        }
        const dataType = body?.detection?.type;
        if (!BATCH_FIGURE_KIND_BY_TYPE[dataType]) {
          throw new Error("CYC, CV, EIS로 판별되지 않은 파일입니다.");
        }
        const fileCell = {
          ...cell,
          sampleName: cell.sampleName || baseNameWithoutExtension(file.name),
        };
        const saved = await saveDatasetFromInspection(body, dataType, fileCell, BATCH_FIGURE_KIND_BY_TYPE[dataType]);
        if (!state.datasets.some((dataset) => dataset.id === saved.id)) state.datasets.unshift(saved);
        let note = saved.reusedExistingSource ? "같은 원본 파일이라 기존 Dataset과 Fig를 재사용했습니다." : "";
        try {
          await saveFigureRecord(saved);
        } catch (error) {
          note = `Dataset은 저장했지만 Fig 기록을 저장하지 못했습니다: ${error.message}`;
        }
        state.batchFigureResults.push({ ok: true, fileName: file.name, dataType, datasetId: saved.id, note });
      } catch (error) {
        state.batchFigureResults.push({ ok: false, fileName: file.name, message: error.message || "처리하지 못했습니다." });
      }
      renderBatchFigureResults();
    }
    if (state.batchFigureResults.some((item) => item.ok)) {
      await loadHierarchy();
      applyFilters();
    }
    const completed = state.batchFigureResults.filter((item) => item.ok).length;
    setStatus(`여러 파일 Fig 생성 완료: ${completed}/${files.length}개`);
  } catch (error) {
    setStatus(`여러 파일 Fig 생성 중 오류: ${error.message}`);
  } finally {
    state.batchInProgress = false;
    clearUploadSelectionAfterProcessing();
    if (inspectButton) inspectButton.disabled = false;
    setBusy(false);
  }
}
function isExpiredLoginResponse(res, body) {
  if (Number(res?.status) !== 401 || !state.user?.token) return false;
  const message = apiErrorMessage(body, "");
  return !message || message.includes("토큰") || message.includes("로그인");
}

function clearExpiredLogin(res, body) {
  if (!isExpiredLoginResponse(res, body)) return false;
  const message = "로그인 시간이 만료되었거나 서버가 다시 시작되었습니다. 다시 로그인해 주세요.";
  setBusy(false);
  applyUser(null);
  setLoginError(message);
  setStatus(message);
  return true;
}

async function inspectSelectedFile() {
  const files = selectedUploadFiles();
  const file = files[0];
  if (!file) return setStatus("먼저 파일을 선택해 주세요.");
  if (files.length > 1) return createBatchFigures();
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
      if (clearExpiredLogin(res, body)) return;
      setStatus("파일 불러오기 실패");
      setAnalysisMessage(body.detail || body.error || "파일을 불러오거나 분석하지 못했습니다.", "파일 불러오기 실패");
      return;
    }
    state.analysis = body;
    renderAnalysis();
    setStatus(`${body.detection.type.toUpperCase()} 異붿젙`);
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
  if (!file) return setStatus("癒쇱? 留ㅻ돱???묒? ?뚯씪???좏깮?섏꽭??");
  setBusy(true, "留ㅻ돱???묒??먯꽌 ?꾨쪟? 濡쒕뵫 ?뺣낫瑜??쎄퀬 ?덉뒿?덈떎.");
  try {
    const { res, body } = await fetchJsonWithTimeout("/api/inspect-manual", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ filename: file.name, contentBase64: await fileToBase64(file) }),
    });
    if (!res.ok) {
      if (clearExpiredLogin(res, body)) return;
      setStatus(body.error || "留ㅻ돱??遺꾩꽍 ?ㅽ뙣");
      return;
    }
    state.manualInfo = body;
    renderExperimentInfo(state.datasets.find((x) => x.id === state.selectedId));
    setStatus("留ㅻ돱???ㅽ뿕 ?뺣낫 遺꾩꽍 ?꾨즺");
    activateView("experimentInfo");
  } catch (error) {
    setStatus(`留ㅻ돱??遺꾩꽍 ?ㅽ뙣: ${error.message}`);
  } finally {
    setBusy(false);
  }
}

function isBadText(text) {
  const s = String(text || "");
  if (!s.trim()) return true;
  return s.includes("�");
}

function renderValidationSummaryLegacy(validation, quality = {}) {
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
    ? `<p class="qualityReview">${Number(qualityCounts.review || 0)}媛??됱? 寃????遺꾩꽍???ы븿?????덉뒿?덈떎.</p>`
    : quality?.status === "ok"
      ? `<p class="qualityOk">?쒖? ?⑥쐞? 踰붿쐞 湲곗???湲곕낯 ?덉쭏 寃?좊? ?듦낵?덉뒿?덈떎.</p>`
      : "";
  return `
    <div class="validationSummary ${warnings.length ? "hasWarning" : "isOk"}">
      <div class="validationHead">
        <strong>${warnings.length ? "?곗씠??寃???꾩슂" : "?곗씠??寃???꾨즺"}</strong>
        <div class="validationChips">${chips}</div>
      </div>
      ${noteHtml ? `<ul>${noteHtml}</ul>` : ""}
      ${warningHtml ? `<ul class="validationWarnings">${warningHtml}</ul>` : ""}
      ${qualityNote}
    </div>`;
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
    ? `<p class="qualityReview">추가 검토가 필요한 ${Number(qualityCounts.review || 0)}개 행이 있어 분석 결과를 확인해 주세요.</p>`
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
  const wideOnly = viewName === "electrodeCalc" || viewName === "savedFigures" || viewName === "search" || viewName === "analysisLab" || viewName === "organization" || viewName === "feedbackAdmin" || viewName === "releaseHistory" || viewName === "users";
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
  const typeLabel = { eis: "EIS", cyc: "CYC", cv: "CV", unknown: "?????녿뒗" }[a.detection.type] || a.detection.type;
  const shortName = a.filename.length > 42 ? `${a.filename.slice(0, 22)}...${a.filename.slice(-14)}` : a.filename;
  const readableColumns = a.columns.filter((c) => !isBadText(c));
  const badCount = a.columns.length - readableColumns.length;
  const columnPreview = readableColumns.length
    ? readableColumns.slice(0, 12).map((c) => `<span>${escapeXml(c)}</span>`).join("")
    : `<span>而щ읆紐낆쓣 紐낇솗???쎌? 紐삵뻽?듬땲??</span>`;
  const badNotice = badCount > 0 ? `<p>?쎄린 ?대젮??而щ읆紐?${badCount}媛쒕뒗 ?④꼈?듬땲?? ?곗씠??醫낅쪟媛 ?由щ㈃ 吏곸젒 ?좏깮??二쇱꽭??</p>` : "";
  const detectedCRates = a.detection.type === "cyc" ? explicitCRateValues(a.canonicalRows || []) : [];
  const cRateNotice = detectedCRates.length
    ? `<p class="columnPreviewHint"><strong>C-rate ??媛먯?:</strong> ${detectedCRates.map(formatExplicitCRate).join(" | ")}. ?????CYC Fig?먯꽌 ??媛믪쑝濡?cycle 援ш컙??援щ텇?⑸땲??</p>`
    : "";
  const eisColumnGuide = a.detection.type === "eis" ? `
    <div class="eisColumnGuide">
      <strong>EIS ???덈궡</strong>
      <ul>
        <li><code>sweep</code>: 諛섎났 痢≪젙 ?뚯감, <code>point</code>: ?뚯감 ?덉쓽 痢≪젙 ?쒖꽌?낅땲??</li>
        <li><code>frequency</code>: ?멸???援먮쪟 二쇳뙆??Hz)?낅땲??</li>
        <li><code>zreal</code>: ?꾪뵾?섏뒪???ㅼ닔遺 Z'(ohm), <code>zimag</code>: ?덉닔遺 Z''(ohm)?낅땲?? Nyquist 洹몃옒?꾨뒗 愿濡??<code>-Z''</code>瑜??몃줈異뺤뿉 ?쒖떆?⑸땲??</li>
        <li><code>mag</code>: ?꾪뵾?섏뒪 ?ш린 |Z|(ohm), <code>phase</code>: ?꾩긽媛?degree)?낅땲??</li>
      </ul>
      <p>Fig ?앹꽦?먮뒗 二쇰줈 frequency, zreal, zimag瑜??ъ슜?⑸땲?? ?섎㉧吏 ?댁? 痢≪젙 ?쒖꽌 ?뺤씤怨?Bode 洹몃옒?꾩뿉 ?④퍡 ?곗엯?덈떎.</p>
    </div>` : "";
  const isUnknown = a.detection.type === "unknown" || a.detection.confidence < 0.35;
  const heading = isUnknown
    ? "?곗씠??醫낅쪟瑜??먮룞?쇰줈 ?먮떒?섏? 紐삵뻽?듬땲??"
    : `${typeLabel} ?곗씠?곕줈 蹂댁엯?덈떎. 留욌굹??`;
  const confirmChoice = isUnknown
    ? ""
    : `<label class="detectedTypeChoice selected"><input type="radio" name="detectedType" value="${a.detection.type}" checked /> ?먮룞 ?좏깮?? ${typeLabel} ?곗씠?곕줈 怨꾩냽</label>`;
  const typeSelectMarkup = `
    <div class="typeSelect typeSelectProminent" role="group" aria-label="?곗씠??醫낅쪟 ?좏깮">
      <strong>?곗씠??醫낅쪟 ?좏깮</strong>
      ${confirmChoice}
      <label class="detectedTypeChoice"><input type="radio" name="detectedType" value="manual" ${isUnknown ? "checked" : ""} /> ${isUnknown ? "?곗씠??醫낅쪟瑜?吏곸젒 ?좏깮?섍쿋?듬땲??" : "?꾨땲?? 吏곸젒 ?좏깮?섍쿋?듬땲??"}</label>
      <select id="manualType">
        <option value="">?곗씠??醫낅쪟 ?좏깮</option>
        <option value="eis">EIS</option>
        <option value="cyc">CYC</option>
        <option value="cv">CV</option>
        <option value="unknown">紐⑸줉???녿뒗 ?곗씠??/option>
      </select>
      <span class="typeSelectHint">紐⑸줉??諛붾줈 怨좊Ⅴ硫?吏곸젒 ?좏깮?쇰줈 諛붾앸땲??</span>
    </div>`;
  panel.classList.remove("hidden");
  createBtn.classList.toggle("hidden", isUnknown);
  if (a.detection.type === "eis") {
    panel.innerHTML = `
      <h3>EIS 데이터로 보입니다. 맞나요?</h3>
      <p title="${escapeAttr(a.filename)}">${escapeXml(shortName)} · ${a.sheetName ? `sheet ${escapeXml(a.sheetName)} · ` : ""}${a.rowCount} rows · confidence ${(a.detection.confidence * 100).toFixed(0)}%</p>
      <div class="typeSelect typeSelectProminent" role="group" aria-label="데이터 종류 선택">
        <strong>데이터 종류 선택</strong>
        <label class="detectedTypeChoice selected"><input type="radio" name="detectedType" value="eis" checked /> 자동 선택됨: EIS 데이터로 계속</label>
        <label class="detectedTypeChoice"><input type="radio" name="detectedType" value="manual" /> 아니오, 직접 선택하겠습니다.</label>
        <select id="manualType">
          <option value="">데이터 종류 선택</option>
          <option value="eis">EIS</option>
          <option value="cyc">CYC</option>
          <option value="cv">CV</option>
          <option value="unknown">판단되지 않음</option>
        </select>
        <span class="typeSelectHint">목록을 바로 고르면 직접 선택으로 바뀝니다.</span>
      </div>
      <p class="columnPreviewHint">아래 항목은 파일에서 읽은 열 이름입니다. 선택할 필요가 없습니다.</p>
      <div class="columnPreview">${columnPreview}</div>
      <div class="eisColumnGuide">
        <strong>EIS 열 안내</strong>
        <ul>
          <li><code>sweep</code>: 반복 측정 회차, <code>point</code>: 회차 안의 측정 순서입니다.</li>
          <li><code>frequency</code>: 인가한 교류 주파수(Hz)입니다.</li>
          <li><code>zreal</code>: 임피던스의 실수부 Z'(ohm), <code>zimag</code>: 허수부 Z''(ohm)입니다. Nyquist 그래프는 관례상 <code>-Z''</code>를 세로축에 표시합니다.</li>
          <li><code>mag</code>: 임피던스 크기 |Z|(ohm), <code>phase</code>: 위상각(degree)입니다.</li>
        </ul>
        <p>Fig 생성에는 주로 frequency, zreal, zimag를 사용합니다. 나머지 열은 측정 순서 확인과 Bode 그래프에 함께 쓰입니다.</p>
      </div>
      ${renderValidationSummary(a.validation, a.quality)}
      <h3 id="figureQuestion">어떤 Fig를 만들어 드릴까요?</h3>
      <div class="choiceGrid" id="figureChoices"></div>
    `;
    for (const radio of panel.querySelectorAll("input[name='detectedType']")) {
      radio.addEventListener("change", updateFigureChoices);
    }
    const manualType = $("manualType");
    manualType.addEventListener("change", () => {
      const manualRadio = panel.querySelector("input[name='detectedType'][value='manual']");
      if (manualType.value && manualRadio) manualRadio.checked = true;
      updateFigureChoices();
    });
    updateFigureChoices();
    return;
  }
  panel.innerHTML = `
    <h3>${heading}</h3>
    <p title="${escapeAttr(a.filename)}">${escapeXml(shortName)} 쨌 ${a.sheetName ? `sheet ${escapeXml(a.sheetName)} 쨌 ` : ""}${a.rowCount} rows 쨌 confidence ${(a.detection.confidence * 100).toFixed(0)}%</p>
    ${typeSelectMarkup}
    <p class="columnPreviewHint">?꾨옒 ??ぉ? ?뚯씪?먯꽌 ?쎌? ???대쫫?낅땲?? ?좏깮???꾩슂媛 ?놁뒿?덈떎.</p>
    <div class="columnPreview">${columnPreview}</div>
    ${cRateNotice}
    ${eisColumnGuide}
    ${renderValidationSummary(a.validation, a.quality)}
    ${badNotice}
    <h3 id="figureQuestion">${isUnknown ? "癒쇱? ?곗씠??醫낅쪟瑜??좏깮??二쇱꽭??" : "?대뼡 Fig瑜?留뚮뱾???쒕┫源뚯슂?"}</h3>
    <div class="choiceGrid" id="figureChoices"></div>
  `;
  if (a.detection.type === "eis") {
    const detectedHeading = panel.querySelector("h3:not(#figureQuestion)");
    if (detectedHeading) detectedHeading.textContent = "EIS 데이터로 보입니다. 맞나요?";
    const meta = panel.querySelector("p[title]");
    if (meta) {
      meta.textContent = `${shortName} · ${a.sheetName ? `sheet ${a.sheetName} · ` : ""}${a.rowCount} rows · confidence ${(a.detection.confidence * 100).toFixed(0)}%`;
    }
    const typeGroup = panel.querySelector(".typeSelectProminent");
    if (typeGroup) {
      const title = typeGroup.querySelector("strong");
      if (title) title.textContent = "데이터 종류 선택";
      const choices = typeGroup.querySelectorAll(".detectedTypeChoice");
      if (choices[0]) choices[0].innerHTML = '<input type="radio" name="detectedType" value="eis" checked /> 자동 선택됨: EIS 데이터로 계속';
      if (choices[1]) choices[1].innerHTML = '<input type="radio" name="detectedType" value="manual" /> 아니오, 직접 선택하겠습니다.';
      const select = typeGroup.querySelector("#manualType");
      if (select) {
        select.innerHTML = `
          <option value="">데이터 종류 선택</option>
          <option value="eis">EIS</option>
          <option value="cyc">CYC</option>
          <option value="cv">CV</option>
          <option value="unknown">판단되지 않음</option>`;
      }
      const hint = typeGroup.querySelector(".typeSelectHint");
      if (hint) hint.textContent = "목록을 바로 고르면 직접 선택으로 바뀝니다.";
    }
    const previewHint = panel.querySelector(".columnPreviewHint");
    if (previewHint) previewHint.textContent = "아래 항목은 파일에서 읽은 열 이름입니다. 선택할 필요가 없습니다.";
    const guide = panel.querySelector(".eisColumnGuide");
    if (guide) {
      guide.outerHTML = `
        <div class="eisColumnGuide">
          <strong>EIS 열 안내</strong>
          <ul>
            <li><code>sweep</code>: 반복 측정 회차, <code>point</code>: 회차 안의 측정 순서입니다.</li>
            <li><code>frequency</code>: 인가한 교류 주파수(Hz)입니다.</li>
            <li><code>zreal</code>: 임피던스의 실수부 Z'(ohm), <code>zimag</code>: 허수부 Z''(ohm)입니다. Nyquist 그래프는 관례상 <code>-Z''</code>를 세로축에 표시합니다.</li>
            <li><code>mag</code>: 임피던스 크기 |Z|(ohm), <code>phase</code>: 위상각(degree)입니다.</li>
          </ul>
          <p>Fig 생성에는 주로 frequency, zreal, zimag를 사용합니다. 나머지 열은 측정 순서 확인과 Bode 그래프에 함께 쓰입니다.</p>
        </div>`;
    }
    const validation = panel.querySelector(".validationSummary");
    if (validation) {
      const validationTitle = validation.querySelector(".validationHead > strong");
      if (validationTitle) validationTitle.textContent = validation.classList.contains("hasWarning") ? "데이터 검토 필요" : "데이터 검토 완료";
      const qualityOk = validation.querySelector(".qualityOk");
      if (qualityOk) qualityOk.textContent = "표준 단위와 범위 기준의 기본 품질 검토를 통과했습니다.";
      const qualityReview = validation.querySelector(".qualityReview");
      if (qualityReview) qualityReview.textContent = "추가 검토가 필요한 행이 있어 분석 결과를 확인해 주세요.";
    }
    const question = panel.querySelector("#figureQuestion");
    if (question) question.textContent = "어떤 Fig를 만들어 드릴까요?";
  }
  for (const radio of panel.querySelectorAll("input[name='detectedType']")) {
    radio.addEventListener("change", updateFigureChoices);
  }
  const manualType = $("manualType");
  manualType.addEventListener("change", () => {
    const manualRadio = panel.querySelector("input[name='detectedType'][value='manual']");
    if (manualType.value && manualRadio) manualRadio.checked = true;
    updateFigureChoices();
  });
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

function batchCellForUpload(cell) {
  const selectedCell = selectedHierarchyCell();
  if (!selectedCell?.cellId || String(cell?.cellId || "").trim()) return cell;
  return {
    ...cell,
    cellId: selectedCell.cellId,
    sampleName: cell.sampleName || selectedCell.sampleName || "",
    material: cell.material || selectedCell.material || "",
    electrolyte: cell.electrolyte || selectedCell.electrolyte || "",
    condition: cell.condition || selectedCell.condition || "",
    notes: cell.notes || selectedCell.notes || "",
  };
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
  const files = selectedUploadFiles();
  const label = $("selectedFileName");
  if (!label) return;
  if (!files.length) {
    label.textContent = "선택한 파일 없음";
  } else if (files.length === 1) {
    label.textContent = files[0].name;
  } else {
    const visibleNames = files.slice(0, 2).map((file) => file.name).join(", ");
    label.textContent = `${files.length}개 파일 선택됨: ${visibleNames}${files.length > 2 ? " ..." : ""}`;
  }
}

function updateBatchFigureControl() {
  const button = $("batchCreateFigures");
  if (!button) return;
  const isBatch = selectedUploadFiles().length > 1;
  button.classList.add("hidden");
  const inspectButton = $("inspectFile");
  if (inspectButton) inspectButton.textContent = isBatch ? "여러 파일 분석·Fig 생성" : "파일 분석";
}

function resetAnalysisForNewFile() {
  updateSelectedFileName();
  updateBatchFigureControl();
  state.inspectToken += 1;
  state.analysis = null;
  state.batchFigureResults = [];
  state.selectedId = null;
  state.selectedAnnotation = null;
  setBusy(false);
  renderAnalysis();
  renderBatchFigureResults();
  renderSelect();
  renderCurrent();
  setStatus("파일 선택 완료 - 파일 분석을 눌러주세요.");
}

function updateFigureChoices() {
  const manual = document.querySelector("input[name='detectedType'][value='manual']")?.checked;
  for (const choice of document.querySelectorAll(".typeSelectProminent .detectedTypeChoice")) {
    choice.classList.toggle("selected", Boolean(choice.querySelector("input")?.checked));
  }
  const type = selectedType();
  const question = $("figureQuestion");
  const createBtn = $("createFigure");
  if (!type || type === "unknown") {
    $("figureChoices").innerHTML = `<p>현재 지원하지 않는 데이터 형식입니다. 데이터 종류를 직접 선택하면 해당 메뉴와 Fig 옵션을 안내합니다.</p>`;
    if (question) question.textContent = type === "unknown" ? "지원 목록에 없는 데이터입니다." : "먼저 데이터 종류를 선택해 주세요.";
    if (createBtn) createBtn.classList.add("hidden");
    return;
  }
  if (question) question.textContent = "어떤 Fig를 만들어 드릴까요?";
  if (createBtn) createBtn.classList.remove("hidden");
  const options = {
    eis: [["eis-combined", "Nyquist + Bode 통합 Fig"], ["nyquist", "Nyquist plot"], ["bode", "Bode magnitude/phase"]],
    cyc: [["cycling-performance", "셀 성능 테스트: capacity/efficiency vs cycle"], ["voltage-profile", "전압/전류 프로파일: voltage-capacity/time 또는 voltage/current vs cycle"], ["cyc-combined", "성능 + 전압/전류 통합 Fig"]],
    cv: [["cv-curve", "CV curve: current vs voltage"], ["cv-comparison", "Scan rate 비교 Fig"]],
    unknown: [["table-preview", "표 형태로 미리보기"]],
  }[type] || [["table-preview", "표 형태로 미리보기"]];
  $("figureChoices").innerHTML = options.map(([id, label], idx) => `<label><input type="radio" name="figureKind" value="${id}" ${idx === 0 ? "checked" : ""}/> ${label}</label>`).join("");
}

async function createSmartFigure() {
  if (!state.analysis) return setStatus("癒쇱? ?뚯씪??遺꾩꽍?섏꽭??");
  setBusy(true, "?좏깮???곗씠?곕줈 Fig瑜?留뚮뱾怨??덉뒿?덈떎.");
  try {
    const dataType = selectedType();
    if (!dataType) {
      setStatus("癒쇱? ?곗씠??醫낅쪟瑜??좏깮?섏꽭??");
      setAnalysisMessage("癒쇱? ?곗씠??醫낅쪟瑜??좏깮??二쇱꽭??");
      return;
    }
    if (dataType === "unknown") {
      setStatus("?녿뒗 ?곗씠???뺤떇?낅땲??");
      setAnalysisMessage("?꾩쭅 吏?먰븯吏 ?딅뒗 ?곗씠?곗엯?덈떎. ?대뼡 ?곗씠?곗씤吏 ?뚮젮二쇱떆硫?硫붾돱? Fig瑜?異붽??섍쿋?듬땲??");
      return;
    }
    const figureKind = document.querySelector("input[name='figureKind']:checked")?.value || `${dataType}-combined`;
    const rows = canonicalRows(dataType, state.analysis.columns, state.analysis.rows);
    if (!rows.length) {
      setStatus("?レ옄 而щ읆??李얠? 紐삵뻽?듬땲??");
      setAnalysisMessage("?좏깮???곗씠????낆뿉 留욌뒗 ?レ옄 而щ읆??李얠? 紐삵뻽?듬땲?? ?ㅻⅨ ?곗씠??醫낅쪟瑜??좏깮?섍굅??而щ읆紐낆쓣 ?뺤씤??二쇱꽭??");
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
      const message = apiErrorMessage(saved, "?곗씠?곗뀑 ???以??쒕쾭 ?ㅻ쪟媛 諛쒖깮?덉뒿?덈떎. ?섏씠吏瑜??덈줈怨좎묠?????ㅼ떆 ?쒕룄??二쇱꽭??");
      setStatus(message);
      setAnalysisMessage(message);
      return;
    }
    if (!state.datasets.some((dataset) => dataset.id === saved.id)) state.datasets.unshift(saved);
    await loadHierarchy();
    state.analysis = null;
    renderAnalysis();
    showDatasetImmediately(saved);
    showModule(["cyc", "cv", "eis"].includes(dataType) ? dataType : "figure");
    setStatus(`${dataType.toUpperCase()} Fig ?앹꽦 ?꾨즺`);
  } catch (error) {
    setStatus("Fig ?앹꽦 ?ㅽ뙣");
    setAnalysisMessage(`Fig ?앹꽦 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎: ${error.message}`);
  } finally {
    setBusy(false);
  }
}

async function loadData() {
  if (!state.user) return;
  const res = await fetch("/api/datasets", { headers: authHeaders() });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    if (clearExpiredLogin(res, body)) return;
    throw new Error(body.error || "?곗씠?곕? 遺덈윭?ㅼ? 紐삵뻽?듬땲??");
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
    if (clearExpiredLogin(res, body)) return;
    throw new Error(body.error || "?ㅽ뿕 怨꾩링??遺덈윭?ㅼ? 紐삵뻽?듬땲??");
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
  if (!res.ok) {
    if (clearExpiredLogin(res, body)) return;
    throw new Error(body.error || "議곗쭅 紐⑸줉??遺덈윭?ㅼ? 紐삵뻽?듬땲??");
  }
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
    .map((item) => `<option value="${escapeAttr(item.id)}">${escapeXml(item.name)} 쨌 ${escapeXml(item.myRole || "member")}</option>`)
    .join("");
  if (projectSelect) {
    const previous = projectSelect.value;
    projectSelect.innerHTML = `<option value="">媛쒖씤 ?꾨줈?앺듃 (?섎쭔 蹂닿린)</option>${optionMarkup}`;
    projectSelect.value = state.organizations.some((item) => item.id === previous) ? previous : "";
  }
  if (organizationSelect) {
    organizationSelect.innerHTML = state.organizations.length
      ? optionMarkup
      : `<option value="">李몄뿬 以묒씤 議곗쭅???놁뒿?덈떎</option>`;
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
      ? `${organization.name} 쨌 ????븷: ${organization.myRole || "member"}`
      : "??議곗쭅??留뚮뱾嫄곕굹, 議곗쭅 愿由ъ옄?먭쾶 珥덈?瑜??붿껌?섏꽭??";
  }
  for (const element of [addButton, memberId, memberRole]) {
    if (element) element.disabled = !organization || !canManage;
  }
  if (!organization && list) {
    list.innerHTML = `<p class="organizationEmpty">?좏깮??議곗쭅???놁뒿?덈떎.</p>`;
  } else if (organization && !state.organizationMembers.length && list) {
    list.innerHTML = `<p class="organizationEmpty">硫ㅻ쾭 ?뺣낫瑜?遺덈윭?ㅻ뒗 以묒씠嫄곕굹 ?깅줉??硫ㅻ쾭媛 ?놁뒿?덈떎.</p>`;
  } else if (list) {
    list.innerHTML = state.organizationMembers.map((member) => {
      const user = member.user || {};
      const remove = canManage && member.role !== "owner"
        ? `<button type="button" class="smallDanger" data-remove-organization-member="${escapeAttr(user.id)}">?쒓굅</button>`
        : "";
      return `<div class="organizationMemberRow"><div><strong>${escapeXml(user.name || user.id)}</strong><span>${escapeXml(user.id)} 쨌 ${escapeXml(member.role || "viewer")}</span></div>${remove}</div>`;
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
  if (!res.ok) throw new Error(body.error || "議곗쭅 硫ㅻ쾭瑜?遺덈윭?ㅼ? 紐삵뻽?듬땲??");
  state.organizationMembers = Array.isArray(body) ? body : [];
  renderOrganizationView();
}

async function createOrganizationFromInput() {
  const input = $("newOrganizationName");
  const name = input?.value.trim() || "";
  if (!name) return setStatus("議곗쭅 ?대쫫???낅젰?댁＜?몄슂.");
  const res = await fetch("/api/organizations", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ name }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return setStatus(body.error || "議곗쭅 ?앹꽦???ㅽ뙣?덉뒿?덈떎.");
  input.value = "";
  state.selectedOrganizationId = body.id;
  await loadOrganizations();
  setStatus(`議곗쭅 '${body.name}'??留뚮뱾?덉뒿?덈떎.`);
}

async function addOrganizationMember() {
  const organization = selectedOrganization();
  const input = $("organizationMemberId");
  const memberUserId = input?.value.trim() || "";
  const role = $("organizationMemberRole")?.value || "researcher";
  if (!organization) return setStatus("癒쇱? 議곗쭅???좏깮?댁＜?몄슂.");
  if (!memberUserId) return setStatus("?뚯썝媛?낇븳 ?ъ슜???꾩씠?붾? ?낅젰?댁＜?몄슂.");
  const res = await fetch(`/api/organizations/${encodeURIComponent(organization.id)}/members/${encodeURIComponent(memberUserId)}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ role }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return setStatus(body.error || "硫ㅻ쾭 ??μ뿉 ?ㅽ뙣?덉뒿?덈떎.");
  input.value = "";
  await loadOrganizationMembers();
  setStatus(`${memberUserId} 怨꾩젙??${role} ??븷????ν뻽?듬땲??`);
}

async function removeOrganizationMember(memberUserId) {
  const organization = selectedOrganization();
  if (!organization || !memberUserId) return;
  if (!window.confirm(`${memberUserId} 怨꾩젙??議곗쭅?먯꽌 ?쒓굅?좉퉴??`)) return;
  const res = await fetch(`/api/organizations/${encodeURIComponent(organization.id)}/members/${encodeURIComponent(memberUserId)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return setStatus(body.error || "硫ㅻ쾭 ?쒓굅???ㅽ뙣?덉뒿?덈떎.");
  await loadOrganizationMembers();
  setStatus(`${memberUserId} 怨꾩젙??議곗쭅?먯꽌 ?쒓굅?덉뒿?덈떎.`);
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
  projectSelect.innerHTML = `<option value="">?꾨줈?앺듃瑜??좏깮?섍굅???덈줈 留뚮뱶?몄슂</option>` + state.hierarchy
    .map((project) => `<option value="${escapeAttr(project.id)}">${escapeXml(project.name)}</option>`)
    .join("");
  const project = state.hierarchy.find((item) => item.id === previousProject) || state.hierarchy[0] || null;
  projectSelect.value = project?.id || "";

  const previousCampaign = preferred.campaignId ?? campaignSelect.value;
  const campaigns = project?.campaigns || [];
  campaignSelect.innerHTML = `<option value="">?ㅽ뿕 諛곗튂瑜??좏깮?섍굅???덈줈 留뚮뱶?몄슂</option>` + campaigns
    .map((campaign) => `<option value="${escapeAttr(campaign.id)}">${escapeXml(campaign.name)}</option>`)
    .join("");
  const campaign = campaigns.find((item) => item.id === previousCampaign) || campaigns[0] || null;
  campaignSelect.value = campaign?.id || "";

  const previousCell = preferred.cellRecordId ?? cellSelect.value;
  const cells = campaign?.cells || [];
  cellSelect.innerHTML = `<option value="">? ID ?낅젰 ???먮룞?쇰줈 ??????깅줉?⑸땲??/option>` + cells
    .map((cell) => `<option value="${escapeAttr(cell.id)}">${escapeXml(cell.cellId)}${cell.sampleName ? ` 쨌 ${escapeXml(cell.sampleName)}` : ""}</option>`)
    .join("");
  cellSelect.value = cells.some((item) => item.id === previousCell) ? previousCell : "";

  const selectedCell = selectedHierarchyCell(campaign);
  const previousDatasetGroup = preferred.datasetGroupId ?? datasetGroupSelect.value;
  const datasetGroups = selectedCell?.datasetGroups || [];
  datasetGroupSelect.innerHTML = `<option value="">???대쫫???낅젰?섍굅??湲곗〈 Dataset???좏깮?섏꽭??/option>` + datasetGroups
    .map((group) => `<option value="${escapeAttr(group.id)}">${escapeXml(group.name)}</option>`)
    .join("");
  datasetGroupSelect.value = datasetGroups.some((item) => item.id === previousDatasetGroup) ? previousDatasetGroup : "";

  const path = $("hierarchyPath");
  if (path) {
    const selectedGroup = selectedHierarchyDatasetGroup(selectedCell);
    path.textContent = [project?.name, campaign?.name, selectedCell?.cellId || "???", selectedGroup?.name || "??Dataset"].filter(Boolean).join("  ?? ") || "?꾨줈?앺듃? ?ㅽ뿕 諛곗튂瑜?癒쇱? 留뚮뱾?댁＜?몄슂.";
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
  if (!name) return setStatus("???꾨줈?앺듃 ?대쫫???낅젰?댁＜?몄슂.");
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ name, organizationId: $("projectOrganizationSelect")?.value || "" }),
  });
  const body = await res.json();
  if (!res.ok) return setStatus(body.error || "?꾨줈?앺듃 ?앹꽦???ㅽ뙣?덉뒿?덈떎.");
  input.value = "";
  await loadHierarchy();
  renderHierarchyControls({ projectId: body.id });
  setStatus(`?꾨줈?앺듃 '${body.name}'瑜?留뚮뱾?덉뒿?덈떎.`);
}

async function createCampaignFromInput() {
  const project = selectedHierarchyProject();
  const input = $("newCampaignName");
  const name = input?.value.trim() || "";
  if (!project) return setStatus("癒쇱? ?꾨줈?앺듃瑜??좏깮?섍굅???덈줈 留뚮뱾?댁＜?몄슂.");
  if (!name) return setStatus("???ㅽ뿕 諛곗튂 ?대쫫???낅젰?댁＜?몄슂.");
  const res = await fetch(`/api/projects/${encodeURIComponent(project.id)}/campaigns`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ name }),
  });
  const body = await res.json();
  if (!res.ok) return setStatus(body.error || "?ㅽ뿕 諛곗튂 ?앹꽦???ㅽ뙣?덉뒿?덈떎.");
  input.value = "";
  await loadHierarchy();
  renderHierarchyControls({ projectId: project.id, campaignId: body.id });
  setStatus(`?ㅽ뿕 諛곗튂 '${body.name}'瑜?留뚮뱾?덉뒿?덈떎.`);
}

async function createDatasetGroupFromInput() {
  const cell = selectedHierarchyCell();
  const input = $("newDatasetGroupName");
  const name = input?.value.trim() || "";
  if (!cell) return setStatus("癒쇱? 湲곗〈 ????좏깮?섍굅?? ???? ?곗씠???????Dataset ?대쫫怨??④퍡 ?깅줉?댁＜?몄슂.");
  if (!name) return setStatus("??Dataset ?대쫫???낅젰?댁＜?몄슂.");
  const res = await fetch(`/api/cells/${encodeURIComponent(cell.id)}/dataset-groups`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ name }),
  });
  const body = await res.json();
  if (!res.ok) return setStatus(body.error || "Dataset ?앹꽦???ㅽ뙣?덉뒿?덈떎.");
  input.value = "";
  await loadHierarchy();
  renderHierarchyControls({
    projectId: cell.projectId,
    campaignId: cell.campaignId,
    cellRecordId: cell.id,
    datasetGroupId: body.id,
  });
  setStatus(`Dataset '${body.name}'瑜?留뚮뱾?덉뒿?덈떎.`);
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
  return { cyc: "CYC", cv: "CV", eis: "EIS", all: "?꾩껜" }[type || "all"] || "DATA";
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
        <strong>寃??寃곌낵媛 ?놁뒿?덈떎.</strong>
        <span>?좎쭨 踰붿쐞瑜??볧엳嫄곕굹 ?뚯옱/? ID 寃?됱뼱瑜?以꾩뿬蹂댁꽭??</span>
      </div>`;
    return;
  }
  list.innerHTML = state.filtered.map((d) => {
    const cell = d.cell || {};
    const active = d.id === state.selectedId ? " active" : "";
    const title = datasetDisplayName(d);
    const meta = [cell.date || "?좎쭨 ?놁쓬", typeDisplay(d.dataType), `${d.rows?.length || 0} points`, displayUserName(d)].filter(Boolean).join(" 쨌 ");
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
          <button type="button" data-open-figure="${escapeAttr(d.id)}">Fig ?닿린</button>
          <button type="button" class="secondaryAction" data-open-saved="${escapeAttr(d.id)}">紐⑥쓬?먯꽌 蹂닿린</button>
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
      setStatus("寃??寃곌낵瑜?Fig濡??댁뿀?듬땲??");
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
      setStatus("寃??寃곌낵瑜?Fig 紐⑥쓬?먯꽌 ?댁뿀?듬땲??");
    });
  }
}

function renderDateOptions() {
  const sel = $("savedDateSelect");
  if (!sel) return;
  const current = sel.value;
  const dates = [...new Set(state.datasets.map((d) => d.cell?.date).filter(Boolean))].sort().reverse();
  sel.innerHTML = `<option value="">?꾩껜 ?좎쭨</option>` + dates.map((date) => `<option value="${escapeAttr(date)}">${escapeXml(date)}</option>`).join("");
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
    sel.innerHTML = `<option>寃??寃곌낵 ?놁쓬</option>`;
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
    list.innerHTML = `<p class="emptySaved">??λ맂 ?곗씠?곌? ?놁뒿?덈떎.</p>`;
    return;
  }
  list.innerHTML = state.filtered.map((d) => {
    const cell = d.cell || {};
    const active = d.id === state.selectedId ? " active" : "";
    const title = datasetDisplayName(d);
    const sub = [d.dataType?.toUpperCase(), `${d.rows?.length || 0} points`, d.ownerName || d.ownerId].filter(Boolean).join(" 쨌 ");
    return `
      <button type="button" class="savedItem${active}" data-dataset-id="${escapeAttr(d.id)}">
        <strong>${escapeXml(title)}</strong>
        <span>${escapeXml(cell.date || "?좎쭨 ?놁쓬")} 쨌 ${escapeXml(sub)}</span>
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
      setStatus("??λ맂 ?곗씠?곕? 遺덈윭?붿뒿?덈떎.");
    });
  }
}

function figureLabel(d) {
  const labels = {
    "cycling-performance": "용량 유지율 Fig",
    "voltage-profile": "전압/전류 Fig",
    "cyc-combined": "성능 + 전압/전류 Fig",
    "nyquist": "Nyquist Fig",
    "bode": "Bode Fig",
    "eis-combined": "EIS 통합 Fig",
    "cv-curve": "CV Fig",
    "cv-comparison": "CV 비교 Fig",
    "table-preview": "표 미리보기",
  };
  return labels[d.figureKind] || `${(d.dataType || "data").toUpperCase()} Fig`;
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
    list.innerHTML = `<p class="emptySaved">저장된 Fig가 없습니다.</p>`;
    return;
  }
  list.innerHTML = state.filtered.map((d) => {
    const cell = d.cell || {};
    const active = d.id === state.selectedId ? " active" : "";
    const title = datasetDisplayName(d);
    const sub = [figureLabel(d), `${d.rows?.length || 0} points`, hierarchyLabel(d), displayUserName(d)].filter(Boolean).join(" · ");
    return `
      <article class="savedItem${active}" data-dataset-id="${escapeAttr(d.id)}">
        <label class="compareCheck${String(d.dataType || "").toLowerCase() === "cyc" ? "" : " disabled"}" title="${String(d.dataType || "").toLowerCase() === "cyc" ? "CYC 비교 선택" : "CYC Fig만 비교할 수 있습니다."}">
          <input type="checkbox" data-compare-id="${escapeAttr(d.id)}"${state.compareIds.includes(d.id) ? " checked" : ""}${String(d.dataType || "").toLowerCase() === "cyc" ? "" : " disabled"} />
          <span>비교</span>
        </label>
        <button type="button" class="savedOpen" data-dataset-id="${escapeAttr(d.id)}" title="Fig 열기">
          ${figureThumb(d)}
          <span class="savedInfo">
            <strong>${escapeXml(title)}</strong>
            <span>${escapeXml(cell.date || "날짜 없음")} · ${escapeXml(sub)}</span>
            <em>${escapeXml(d.sourceName || d.id)}</em>
          </span>
        </button>
        <button type="button" class="savedDelete" data-dataset-id="${escapeAttr(d.id)}" title="저장된 Fig 삭제">×</button>
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
      setStatus("저장된 Fig를 불러왔습니다.");
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

// The saved-Fig comparison UI uses this readable Korean render path.
// It overrides older generated labels that remain in legacy code above.
function renderSavedList() {
  const list = $("savedList");
  const count = $("savedCount");
  if (!list) return;
  if (count) count.textContent = `${state.filtered.length}개`;
  if (!state.filtered.length) {
    list.innerHTML = `<p class="emptySaved">저장된 Fig가 없습니다.</p>`;
    return;
  }
  list.innerHTML = state.filtered.map((d) => {
    const cell = d.cell || {};
    const active = d.id === state.selectedId ? " active" : "";
    const title = datasetDisplayName(d);
    const sub = [figureLabel(d), `${d.rows?.length || 0} points`, hierarchyLabel(d), displayUserName(d)].filter(Boolean).join(" · ");
    const isCyc = String(d.dataType || "").toLowerCase() === "cyc";
    return `
      <article class="savedItem${active}" data-dataset-id="${escapeAttr(d.id)}">
        <label class="compareCheck${isCyc ? "" : " disabled"}" title="${isCyc ? "CYC 비교 선택" : "CYC Fig만 비교할 수 있습니다."}">
          <input type="checkbox" data-compare-id="${escapeAttr(d.id)}"${state.compareIds.includes(d.id) ? " checked" : ""}${isCyc ? "" : " disabled"} />
          <span>비교</span>
        </label>
        <button type="button" class="savedOpen" data-dataset-id="${escapeAttr(d.id)}" title="Fig 열기">
          ${figureThumb(d)}
          <span class="savedInfo">
            <strong>${escapeXml(title)}</strong>
            <span>${escapeXml(cell.date || "날짜 없음")} · ${escapeXml(sub)}</span>
            <em>${escapeXml(d.sourceName || d.id)}</em>
          </span>
        </button>
        <button type="button" class="savedDelete" data-dataset-id="${escapeAttr(d.id)}" title="저장된 Fig 삭제">×</button>
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
      setStatus("저장된 Fig를 불러왔습니다.");
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
    setStatus("CYC Fig留?鍮꾧탳?????덉뒿?덈떎.");
    return;
  }
  if (checked && !state.compareIds.includes(id)) state.compareIds.push(id);
  if (!checked) state.compareIds = state.compareIds.filter((x) => x !== id);
  setStatus(`${state.compareIds.length}개 CYC Fig 선택됨`);
}

function clearCompareSelection() {
  state.compareIds = [];
  renderSavedList();
  const preview = $("comparisonPreview");
  if (preview) {
    preview.classList.add("hidden");
    preview.innerHTML = "";
  }
  setStatus("鍮꾧탳 ?좏깮???댁젣?덉뒿?덈떎.");
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
    preview.innerHTML = `<p class="emptySaved">鍮꾧탳?섎젮硫?CYC Fig瑜?2媛??댁긽 ?좏깮?섏꽭??</p>`;
    setStatus("CYC Fig瑜?2媛??댁긽 ?좏깮?섏꽭??");
    return;
  }
  const series = datasets.map((d) => ({
    d,
    name: datasetDisplayName(d),
    points: dischargeSeries((d.rows || []).filter((r) => Number.isFinite(r.cycle)).sort((a, b) => a.cycle - b.cycle)),
  })).filter((s) => s.points.length);
  if (series.length < 2) {
    preview.classList.remove("hidden");
    preview.innerHTML = `<p class="emptySaved">?좏깮??CYC Fig?먯꽌 鍮꾧탳 媛?ν븳 諛⑹쟾?⑸웾??李얠? 紐삵뻽?듬땲??</p>`;
    setStatus("鍮꾧탳 媛?ν븳 CYC ?곗씠?곌? 遺議깊빀?덈떎.");
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
      <strong>CYC 鍮꾧탳 Fig</strong>
      <span>${series.length}媛?Fig 鍮꾧탳</span>
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
  setStatus("CYC 鍮꾧탳 Fig瑜?留뚮뱾?덉뒿?덈떎.");
}

async function deleteSavedFigure(id, event) {
  if (event) event.stopPropagation();
  const target = state.datasets.find((d) => d.id === id);
  const name = target ? datasetDisplayName(target) : id;
  if (!id || !confirm(`??λ맂 Fig "${name}"瑜???젣?좉퉴??`)) return;
  const res = await fetch(`/api/datasets/${encodeURIComponent(id)}`, { method: "DELETE", headers: authHeaders() });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    setStatus(body.error || "Fig ??젣 ?ㅽ뙣");
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
  setStatus("??λ맂 Fig瑜???젣?덉뒿?덈떎.");
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
    $("figureTitle").textContent = "선택한 Dataset 없음";
    $("figureSubtitle").textContent = "파일을 분석하거나 저장된 Dataset을 선택하세요.";
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
  const title = `${d.cell.cellId || d.id} ${d.cell.sampleName ? "쨌 " + d.cell.sampleName : ""}`;
  $("figureTitle").textContent = title;
  $("figureSubtitle").textContent = `${d.cell.date || ""} ${d.cell.material ? "쨌 " + d.cell.material : ""} ${d.rows.length} points`;
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
      ${panel({ x: eisPlot.nyquist.x, y: eisPlot.nyquist.y, w: eisPlot.nyquist.w, h: eisPlot.nyquist.h, xlabel: "Z' / 廓", ylabel: "-Z'' / 廓", title: "Nyquist plot", xDomain: xNy, yDomain: yNy, points: ny, line: false })}
      ${panel({ x: eisPlot.bodeX, y: eisPlot.nyquist.y, w: eisPlot.bodeW, h: eisPlot.bodeH, xlabel: "Frequency / Hz", ylabel: "|Z| / 廓", title: "Bode magnitude", xDomain: fDomain, yDomain: magDomain, points: bodeMag, logX: true, logY: true, line: false })}
      ${panel({ x: eisPlot.bodeX, y: Math.round(svgSize.h * 0.58), w: eisPlot.bodeW, h: eisPlot.bodeH, xlabel: "Frequency / Hz", ylabel: "-Phase angle, -罐 / deg", title: "Bode phase", xDomain: fDomain, yDomain: phaseDomain, points: bodePhase, logX: true, line: false })}
    </svg>`;
  applyAnnotationsToSvg();
}

function renderLegacyCycFigure(d) {
  const style = currentFigureStyle();
  syncFigureControls(style);
  const svgSize = figureSvgSize(style, "paper");
  const rows = d.rows.filter((r) => Number.isFinite(r.cycle));
  const title = `${d.cell.cellId || d.id} ${d.cell.sampleName ? "쨌 " + d.cell.sampleName : ""}`;
  const capRows = rows.filter((r) => Number.isFinite(r.capacity));
  const effRows = rows.filter((r) => Number.isFinite(r.efficiency));
  const voltRows = rows.filter((r) => Number.isFinite(r.voltage) && (Number.isFinite(r.capacity) || Number.isFinite(r.time)));
  $("figureTitle").textContent = title;
  $("figureSubtitle").textContent = `${d.cell.date || ""} 쨌 CYC 쨌 ${d.rows.length} points`;
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
      <text x="72" y="74" class="caption">CYC 쨌 ${escapeXml(d.cell.condition || "")}</text>
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
  // A CYC export can contain many point-level measurements for the same cycle.
  // Keep the final (largest) discharge capacity once per cycle so the figure
  // cannot turn repeated raw rows into a vertical band of overlapping markers.
  const finalCapacityByCycle = new Map();
  for (const row of rows || []) {
    const cycle = Number(row?.cycle);
    const capacity = Number(row?.capacity);
    if (!Number.isFinite(cycle) || cycle < 1 || !Number.isFinite(capacity)) continue;
    const wholeCycle = Math.round(cycle);
    if (Math.abs(cycle - wholeCycle) > 1e-6) continue;
    const point = { x: wholeCycle, y: capacity };
    const previous = finalCapacityByCycle.get(wholeCycle);
    if (!previous || point.y > previous.y) finalCapacityByCycle.set(wholeCycle, point);
  }
  const raw = [...finalCapacityByCycle.values()].sort((a, b) => a.x - b.x);
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
    // WBCS names can put a cell/sample number between the electrode mass and
    // the first rate, for example `0.0511392g_4_0.33_1_re0.33`.  When a
    // fractional C-rate exists, values before it are identifiers, not rates.
    const firstFractionalRate = labels.findIndex((label) => {
      const value = Number(String(label).replace(/^re\s+/i, "").replace(/\s*C$/i, ""));
      return Number.isFinite(value) && value > 0 && value < 1;
    });
    if (firstFractionalRate > 0) labels = labels.slice(firstFractionalRate);
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

function formatExplicitCRate(value) {
  const rate = Number(value);
  if (!Number.isFinite(rate) || rate <= 0) return "";
  return `${Number(rate.toFixed(4)).toString()} C`;
}

function explicitCRateValues(rows) {
  const values = new Map();
  for (const row of rows || []) {
    const rate = parseCRateValue(row?.cRate ?? row?.c_rate);
    if (!Number.isFinite(rate)) continue;
    values.set(rate.toFixed(4), rate);
  }
  return [...values.values()].sort((a, b) => a - b);
}

// When the source file has a C-rate column, it is more reliable than a filename
// convention or an inferred current ratio. Group consecutive cycles by that value.
function explicitCRateSegments(rows, minCycle, maxCycle) {
  const ratesByCycle = new Map();
  for (const row of rows || []) {
    const cycle = Number(row?.cycle);
    const rate = parseCRateValue(row?.cRate ?? row?.c_rate);
    if (!Number.isFinite(cycle) || !Number.isFinite(rate) || cycle < minCycle || cycle > maxCycle) continue;
    const key = Math.round(cycle);
    const values = ratesByCycle.get(key) || [];
    values.push(rate);
    ratesByCycle.set(key, values);
  }
  const points = [...ratesByCycle.entries()]
    .map(([cycle, values]) => ({ cycle: Number(cycle), rate: average(values) }))
    .filter((point) => Number.isFinite(point.rate))
    .sort((a, b) => a.cycle - b.cycle);
  const groups = [];
  for (const point of points) {
    const previous = groups[groups.length - 1];
    const isConsecutive = previous && point.cycle <= previous.end + 1;
    const sameRate = previous && Math.abs(point.rate - previous.rate) / Math.max(previous.rate, 1e-12) <= 0.02;
    if (!previous || !isConsecutive || !sameRate) {
      groups.push({ start: point.cycle, end: point.cycle, rate: point.rate, count: 1 });
      continue;
    }
    previous.rate = (previous.rate * previous.count + point.rate) / (previous.count + 1);
    previous.count += 1;
    previous.end = point.cycle;
  }
  const distinctRates = new Set(groups.map((group) => group.rate.toFixed(4)));
  if (groups.length < 2 || groups.length > 12 || distinctRates.size < 2) return [];
  return groups.map((group) => ({
    start: group.start,
    end: group.end,
    cRate: group.rate,
    label: formatExplicitCRate(group.rate),
  }));
}

function inferCRateSegments(d, rows, capPts) {
  const cycles = [...new Set(capPts.map((p) => p.x).filter(Number.isFinite))].sort((a, b) => a - b);
  if (!cycles.length) return [];
  const minCycle = Math.min(...cycles);
  const maxCycle = Math.max(...cycles);
  const explicitSegments = explicitCRateSegments(rows, minCycle, maxCycle);
  if (explicitSegments.length >= 2) return explicitSegments;
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

// Only draw C-rate guide lines for complete, displayed cycle ranges.  A raw
// cycler export can contain fractional/duplicate cycle records; using those
// directly would pile guide lines and labels on top of the y-axis.
function cRateFigureSegments(segments, capPts) {
  const observedCycles = [...new Set((capPts || [])
    .map((point) => Math.round(Number(point?.x)))
    .filter((cycle) => Number.isFinite(cycle) && cycle >= 1))]
    .sort((a, b) => a - b);
  if (observedCycles.length < 2) return [];

  const minCycle = observedCycles[0];
  const maxCycle = observedCycles[observedCycles.length - 1];
  const visibleSegments = [];
  for (const segment of segments || []) {
    const start = Math.max(minCycle, Math.ceil(Number(segment?.start)));
    const end = Math.min(maxCycle, Math.floor(Number(segment?.end)));
    const coveredCycles = observedCycles.filter((cycle) => cycle >= start && cycle <= end);
    const previous = visibleSegments[visibleSegments.length - 1];
    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start || coveredCycles.length < 2) continue;
    if (previous && start <= previous.end) continue;
    visibleSegments.push({ ...segment, start, end });
    if (visibleSegments.length === 8) break;
  }
  return visibleSegments;
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
    if (!res.ok) throw new Error(saved.error || "Fig ?섏젙 ????ㅽ뙣");
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
    if (!figureRes.ok) throw new Error(figureBody.error || "Fig ?쇱씠釉뚮윭由???μ뿉 ?ㅽ뙣?덉뒿?덈떎.");
    if (state.cellWorkspace?.cell?.id === saved.cellRecordId) loadCellWorkspace(saved);
    if (!silent) setStatus("Fig ?섏젙 ?댁슜????λ릺?덉뒿?덈떎.");
  } catch (error) {
    setStatus(`Fig ?섏젙 ????ㅽ뙣: ${error.message}`);
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
  if (button) button.textContent = ann ? "湲 ?섏젙" : "湲 異붽?";
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
  if (!state.selectedId) return setStatus("癒쇱? ?뚯씪 遺꾩꽍 ??Fig瑜??앹꽦?섍굅?? 湲곗〈 Fig瑜??좏깮?섏꽭??");
  if (!text) return setStatus("異붽???湲???낅젰?섏꽭??");
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
  if (button) button.textContent = "湲 異붽?";
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
  if (!state.selectedId) return setStatus("癒쇱? ?뚯씪 遺꾩꽍 ??Fig瑜??앹꽦?섍굅?? 湲곗〈 Fig瑜??좏깮?섏꽭??");
  const input = $("figureSeriesColor");
  const style = currentFigureStyle();
  style.seriesColor = normalizeHexColor(input?.value, style.seriesColor);
  if (input) input.value = style.seriesColor;
  renderCurrent();
  saveFigureEdits(false);
}

function changeFigureAspectRatio() {
  if (!state.selectedId) return setStatus("癒쇱? Fig瑜??좏깮?섏꽭??");
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
  const kind = ["cycling-performance", "voltage-profile", "cyc-combined"].includes(d.figureKind)
    ? d.figureKind
    : "cycling-performance";
  if (kind === "voltage-profile") return renderCycVoltageProfileFigure(d);
  if (kind === "cyc-combined") return renderCycCombinedFigure(d);
  return renderCycPerformanceFigure(d);
}

function cycVoltageProfileSeries(rows) {
  const sourceRows = (rows || []).map((row) => ({
    cycle: Number(row?.cycle),
    voltage: Number(row?.voltage),
    capacity: Number(row?.capacity),
    time: Number(row?.time),
    current: Number(row?.current),
  })).filter((row) => Number.isFinite(row.cycle) && row.cycle >= 1 && Number.isFinite(row.voltage));
  const useCapacity = sourceRows.some((row) => Number.isFinite(row.capacity));
  const byCycle = new Map();
  for (const row of sourceRows) {
    const x = useCapacity ? row.capacity : row.time;
    if (!Number.isFinite(x)) continue;
    const cycle = Math.round(row.cycle);
    const points = byCycle.get(cycle) || [];
    points.push({ x, y: row.voltage, current: row.current });
    byCycle.set(cycle, points);
  }
  const usable = [...byCycle.entries()].map(([cycle, points]) => {
    const sortedPoints = points.sort((a, b) => a.x - b.x);
    const currentValues = sortedPoints.map((point) => point.current).filter(Number.isFinite);
    return {
      cycle,
      points: sortedPoints,
      currentA: currentValues.length ? currentValues.reduce((sum, value) => sum + value, 0) / currentValues.length : null,
    };
  }).filter(({ points }) => {
    const xValues = new Set(points.map((point) => point.x.toFixed(8)));
    return points.length >= 2 && xValues.size >= 2;
  }).sort((a, b) => a.cycle - b.cycle);
  const indices = [...new Set([0, Math.floor((usable.length - 1) / 2), usable.length - 1])].filter((index) => index >= 0);
  return {
    xLabel: useCapacity ? "Capacity (reported unit)" : "Time (reported unit)",
    series: indices.map((index) => usable[index]).filter(Boolean),
  };
}

function formatCurrentForFigure(currentA) {
  if (!Number.isFinite(currentA)) return "Iavg unavailable";
  const magnitude = Math.abs(currentA);
  if (magnitude > 0 && magnitude < 1) return `Iavg ${fmt(currentA * 1000, 4)} mA`;
  return `Iavg ${fmt(currentA, 4)} A`;
}

// CYC ?붿빟 ?뚯씪?먮뒗 cycle留덈떎 ?꾩븬怨??꾨쪟媛 ???먯뵫留??덉쓣 ???덉뒿?덈떎.
// ??寃쎌슦 ?꾩븬-?⑸웾 怨≪꽑?쇰줈 ?ㅽ빐?섏? ?딄퀬, cycle蹂??됯퇏 ?꾩븬/?꾨쪟 異붿꽭瑜?蹂꾨룄濡?洹몃┰?덈떎.
function cycVoltageCurrentTrend(rows) {
  const byCycle = new Map();
  for (const row of rows || []) {
    const rawCycle = Number(row?.cycle);
    const cycle = Math.round(rawCycle);
    if (!Number.isFinite(rawCycle) || rawCycle < 1 || Math.abs(rawCycle - cycle) > 1e-6) continue;
    const group = byCycle.get(cycle) || { voltages: [], currents: [] };
    const voltage = Number(row?.voltage);
    const currentA = Number(row?.current);
    if (Number.isFinite(voltage)) group.voltages.push(voltage);
    if (Number.isFinite(currentA)) group.currents.push(currentA);
    byCycle.set(cycle, group);
  }
  const average = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
  const entries = [...byCycle.entries()].sort(([left], [right]) => left - right);
  return {
    voltage: entries.filter(([, group]) => group.voltages.length).map(([cycle, group]) => ({ x: cycle, y: average(group.voltages) })),
    // BDF???쒖? current_a(A)瑜??ъ슜?먯뿉寃??쎄린 ?ъ슫 mA 異뺤쑝濡?蹂?섑빀?덈떎.
    current: entries.filter(([, group]) => group.currents.length).map(([cycle, group]) => ({ x: cycle, y: average(group.currents) * 1000 })),
  };
}

function cycProfilePanel({ x, y, w, h, profile }) {
  if (!profile.series.length) {
    return `
      <g>
        <text x="${x}" y="${y - 18}" class="panelTitle">Voltage profile</text>
        <rect x="${x}" y="${y}" width="${w}" height="${h}" class="profileEmpty"/>
        <text x="${x + w / 2}" y="${y + h / 2 - 16}" class="profileEmptyTitle" text-anchor="middle">?꾩븬 ?꾨줈?뚯씪???먯씠 遺議깊빀?덈떎.</text>
        <text x="${x + w / 2}" y="${y + h / 2 + 14}" class="profileEmptyText" text-anchor="middle">?꾩옱 ?뚯씪? cycle蹂??붿빟媛믪씠???꾩븬-?⑸웾/?쒓컙 怨≪꽑??留뚮뱾 ???놁뒿?덈떎.</text>
        <text x="${x + w / 2}" y="${y + h / 2 + 40}" class="profileEmptyText" text-anchor="middle">cycle ?덉뿉 ?щ윭 voltage? capacity ?먮뒗 time ?먯씠 ?덈뒗 ?먮낯 ?곗씠?곕? ?ъ슜?섏꽭??</text>
      </g>`;
  }
  const allPoints = profile.series.flatMap((series) => series.points);
  const xDomain = niceBounds(allPoints.map((point) => point.x));
  const yDomain = niceBounds(allPoints.map((point) => point.y));
  const axes = drawPaperAxes({
    x,
    y,
    w,
    h,
    xDomain,
    yDomain,
    xlabel: profile.xLabel,
    ylabel: "Voltage (V)",
    xlabelOffset: 48,
    ylabelOffset: 64,
  });
  const colors = ["#0f766e", "#2563eb", "#db2777", "#b45309"];
  const lines = profile.series.map((series, index) => {
    const color = colors[index % colors.length];
    return `<path d="${linePath(series.points, axes.sx, axes.sy)}" class="profileLine" stroke="${color}"/>${markerPoints(series.points, axes.sx, axes.sy, "profilePt", 2.8).replaceAll('class="profilePt"', `class="profilePt" fill="${color}" stroke="${color}"`)}`;
  }).join("");
  const legend = profile.series.map((series, index) => {
    const color = colors[index % colors.length];
    const lx = x + 10 + index * Math.max(84, Math.floor((w - 24) / Math.max(profile.series.length, 1)));
    return `<line x1="${lx}" x2="${lx + 16}" y1="${y + 18}" y2="${y + 18}" class="profileLegendLine" stroke="${color}"/><text x="${lx + 22}" y="${y + 22}" class="profileLegend">cycle ${series.cycle}</text><text x="${lx + 22}" y="${y + 35}" class="profileLegend">${formatCurrentForFigure(series.currentA)}</text>`;
  }).join("");
  return `
    <g>
      <text x="${x}" y="${y - 18}" class="panelTitle">Voltage profile</text>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" class="frame"/>
      ${axes.svg}
      ${lines}
      ${legend}
    </g>`;
}

function cycVoltageCurrentTrendPanel({ x, y, w, h, trend }) {
  if (!trend.voltage.length) {
    return `<g><text x="${x}" y="${y - 18}" class="panelTitle">Voltage/current behavior</text><rect x="${x}" y="${y}" width="${w}" height="${h}" class="profileEmpty"/><text x="${x + w / 2}" y="${y + h / 2}" class="profileEmptyTitle" text-anchor="middle">Voltage ?곗씠?곌? ?놁뼱 ?꾩븬쨌?꾨쪟 異붿꽭瑜?留뚮뱾 ???놁뒿?덈떎.</text></g>`;
  }
  const allCycles = [...trend.voltage, ...trend.current].map((point) => point.x);
  const hasCurrent = trend.current.length > 0;
  const axes = drawPaperAxes({
    x,
    y,
    w,
    h,
    xDomain: niceBounds(allCycles),
    yDomain: niceBounds(trend.voltage.map((point) => point.y)),
    y2Domain: hasCurrent ? niceBounds(trend.current.map((point) => point.y)) : null,
    xlabel: "Cycle number",
    ylabel: "Voltage (V)",
    // ?ㅻⅨ履??꾨쪟 異??쒕ぉ? ?⑤꼸 ??뿉 留욎떠 ?꾨옒?먯꽌 吏곸젒 諛곗튂?⑸땲??
    y2label: "",
    integerX: true,
    xlabelOffset: 48,
    ylabelOffset: 64,
  });
  const voltageLine = `<path d="${linePath(trend.voltage, axes.sx, axes.sy)}" class="voltageTrendLine"/>${markerPoints(trend.voltage, axes.sx, axes.sy, "voltageTrendPt", 3.3)}`;
  const currentLine = hasCurrent && axes.sy2
    ? `<path d="${linePath(trend.current, axes.sx, axes.sy2)}" class="currentTrendLine"/>${markerPoints(trend.current, axes.sx, axes.sy2, "currentTrendPt", 3.1)}`
    : "";
  return `
    <g>
      <text x="${x}" y="${y - 32}" class="panelTitle">Voltage/current behavior</text>
      <text x="${x}" y="${y - 17}" class="caption">Summary trend: mean voltage and current by cycle</text>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" class="frame"/>
      ${axes.svg}
      ${voltageLine}
      ${currentLine}
      <line x1="${x + 12}" x2="${x + 28}" y1="${y + 18}" y2="${y + 18}" class="voltageTrendLine"/><text x="${x + 34}" y="${y + 22}" class="profileLegend">Voltage (V)</text>
      ${hasCurrent ? `<line x1="${x + 122}" x2="${x + 138}" y1="${y + 18}" y2="${y + 18}" class="currentTrendLine"/><text x="${x + 144}" y="${y + 22}" class="profileLegend">Current (mA)</text><text transform="translate(${x + w + 54},${y + h / 2}) rotate(90)" class="label" text-anchor="middle">Current (mA, +charge / -discharge)</text>` : `<text x="${x + 122}" y="${y + 22}" class="profileLegend">Current column unavailable</text>`}
    </g>`;
}

function cycPerformancePanel({ x, y, w, h, points }) {
  if (!points.length) {
    return `<g><text x="${x}" y="${y - 18}" class="panelTitle">Cycling performance</text><rect x="${x}" y="${y}" width="${w}" height="${h}" class="profileEmpty"/><text x="${x + w / 2}" y="${y + h / 2}" class="profileEmptyTitle" text-anchor="middle">?⑸웾 ?곗씠?곕? 李얠? 紐삵뻽?듬땲??</text></g>`;
  }
  return panel({
    x,
    y,
    w,
    h,
    xlabel: "Cycle number",
    ylabel: "Specific capacity (mAh g-1)",
    title: "Cycling performance",
    xDomain: niceBounds(points.map((point) => point.x)),
    yDomain: niceBounds(points.map((point) => point.y)),
    points,
  });
}

function renderCycAlternativeFigure(d, mode) {
  const style = currentFigureStyle();
  syncFigureControls(style);
  const rows = (d.rows || []).filter((row) => Number.isFinite(row.cycle)).sort((a, b) => a.cycle - b.cycle);
  const title = `${d.cell.cellId || d.id}${d.cell.sampleName ? " - " + d.cell.sampleName : ""}`;
  const profile = cycVoltageProfileSeries(rows);
  const electricalTrend = cycVoltageCurrentTrend(rows);
  const hasRawVoltageProfile = profile.series.length > 0;
  const electricalTitle = hasRawVoltageProfile ? "Voltage profile + current" : "Voltage/current trend (cycle summary)";
  const capPts = dischargeSeries(rows);
  const svgSize = figureSvgSize(style, "paper");
  const combined = mode === "combined";
  const padX = Math.max(72, Math.round(svgSize.w * 0.08));
  const rightAxisPad = 112;
  const plotY = Math.max(110, Math.round(svgSize.h * 0.18));
  const plotH = Math.max(280, Math.round(svgSize.h * 0.56));
  const gap = combined ? Math.max(68, Math.round(svgSize.w * 0.06)) : 0;
  const panelW = combined ? Math.max(280, Math.floor((svgSize.w - padX - rightAxisPad - gap) / 2)) : Math.max(360, svgSize.w - padX - rightAxisPad);
  const metaRows = [["Material", d.cell.material], ["Condition", d.cell.condition], ["Figure", combined ? `Performance + ${electricalTitle}` : electricalTitle], ["Owner", displayUserName(d)], ["Source", d.sourceName]];
  $("figureTitle").textContent = title;
  $("figureSubtitle").textContent = `${d.cell.date || ""} - CYC - ${combined ? `Performance + ${electricalTitle} Fig` : `${electricalTitle} Fig`}`;
  $("metaGrid").innerHTML = metaRows.map(([key, value]) => `<div class="metaItem"><strong>${key}</strong>${isBadText(value) ? "-" : (value || "-")}</div>`).join("");
  const performance = combined ? cycPerformancePanel({ x: padX, y: plotY, w: panelW, h: plotH, points: capPts }) : "";
  const electricalX = combined ? padX + panelW + gap : padX;
  const profilePanel = hasRawVoltageProfile
    ? cycProfilePanel({ x: electricalX, y: plotY, w: panelW, h: plotH, profile })
    : cycVoltageCurrentTrendPanel({ x: electricalX, y: plotY, w: panelW, h: plotH, trend: electricalTrend });
  $("figureCanvas").innerHTML = `
    <svg id="paperFigure" class="cycAlternativeFigure" style="--figure-width:${svgSize.w}px" viewBox="0 0 ${svgSize.w} ${svgSize.h}" xmlns="http://www.w3.org/2000/svg">
      ${cycStyle(style.seriesColor)}
      <style>
        .seriesLine{fill:none;stroke:${normalizeHexColor(style.seriesColor)};stroke-width:2.1}.points circle{fill:#fff;stroke:${normalizeHexColor(style.seriesColor)};stroke-width:1.6}
        .profileLine{fill:none;stroke-width:2}.profilePt{stroke-width:1.2}.profileLegend{font:9px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111}.profileLegendLine{stroke-width:2}
        .voltageTrendLine{fill:none;stroke:#0f766e;stroke-width:2}.currentTrendLine{fill:none;stroke:#db2777;stroke-width:2;stroke-dasharray:5 3}.voltageTrendPt{fill:#fff;stroke:#0f766e;stroke-width:1.5}.currentTrendPt{fill:#fff;stroke:#db2777;stroke-width:1.4}
        .profileEmpty{fill:#f8fafc;stroke:#cbd5e1;stroke-width:1}.profileEmptyTitle{font:700 13px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#334155}.profileEmptyText{font:11px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#64748b}
      </style>
      <rect width="${svgSize.w}" height="${svgSize.h}" fill="#fff"/>
      <text x="${padX}" y="48" class="panelTitle">${escapeXml(title)}</text>
      <text x="${padX}" y="72" class="caption">${combined ? `Cycling performance + ${electricalTitle}` : electricalTitle}</text>
      ${performance}
      ${profilePanel}
    </svg>`;
  applyAnnotationsToSvg();
}

function renderCycVoltageProfileFigure(d) {
  renderCycAlternativeFigure(d, "voltage-profile");
}

function renderCycCombinedFigure(d) {
  renderCycAlternativeFigure(d, "combined");
}

function renderCycPerformanceFigure(d) {
  const style = currentFigureStyle();
  syncFigureControls(style);
  const rows = d.rows.filter((r) => Number.isFinite(r.cycle)).sort((a, b) => a.cycle - b.cycle);
  const title = `${d.cell.cellId || d.id}${d.cell.sampleName ? " - " + d.cell.sampleName : ""}`;
  const capPts = dischargeSeries(rows);
  const rateSegments = cRateFigureSegments(inferCRateSegments(d, rows, capPts), capPts);
  const isRateFigure = rateSegments.length >= 2;
  const detectedCRates = explicitCRateValues(rows);
  const cRateText = isRateFigure
    ? rateSegments.map((segment) => segment.label).join(" | ")
    : detectedCRates.map(formatExplicitCRate).join(" | ");
  $("figureTitle").textContent = title;
  $("figureSubtitle").textContent = `${d.cell.date || ""} - CYC - ${d.rows.length} points`;
  const metaRows = [["Material", d.cell.material], ["Condition", d.cell.condition], [cRateText ? "C-rate" : "Mode", cRateText || "Long cycle"], ["Owner", displayUserName(d)], ["Source", d.sourceName]];
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
  // Keep the y-axis readable even if a malformed export contains an unusually
  // large capacity value.  A fixed 20 mAh g-1 step can otherwise create a
  // dense black stripe of overlapping tick labels.
  const yTickStep = Math.max(20, Math.ceil(capDomain[1] / 9 / 20) * 20);
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
  const title = `${d.cell.cellId || d.id} ${d.cell.sampleName ? "쨌 " + d.cell.sampleName : ""}`;
  $("figureTitle").textContent = title;
  $("figureSubtitle").textContent = `${d.cell.date || ""} 쨌 CV 쨌 ${d.rows.length} points`;
  $("metaGrid").innerHTML = [["Material", d.cell.material], ["Condition", d.cell.condition], ["Owner", displayUserName(d)], ["Source", d.sourceName]].map(([k, v]) => `<div class="metaItem"><strong>${k}</strong>${isBadText(v) ? "-" : (v || "-")}</div>`).join("");
  $("figureCanvas").innerHTML = `
    <svg id="paperFigure" style="--figure-width:${svgSize.w}px" viewBox="0 0 ${svgSize.w} ${svgSize.h}" xmlns="http://www.w3.org/2000/svg">
      <style>.axis{stroke:#111827;stroke-width:1.6}.grid{stroke:#e5e7eb;stroke-width:1}.seriesLine{fill:none;stroke:#0f766e;stroke-width:2.4}.points circle{fill:#fff;stroke:#0f766e;stroke-width:1.8}.label{font:18px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111827}.tick{font:13px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#374151}.panelTitle{font:700 20px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111827}.caption{font:15px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#4b5563}</style>
      <rect width="${svgSize.w}" height="${svgSize.h}" fill="#ffffff"/>
      <text x="72" y="48" class="panelTitle">${escapeXml(title)}</text>
      <text x="72" y="74" class="caption">CV 쨌 ${escapeXml(d.cell.condition || "")}</text>
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
        <h3>?꾩옱 CYC ?곗씠???붿빟</h3>
        <div class="infoCards">
          <div><strong>?곗씠??/strong><span>${escapeXml(d.sourceName || d.id)}</span></div>
          <div><strong>?ъ씤??/strong><span>${d.rows.length} rows</span></div>
          <div><strong>C-rate</strong><span>${segments.map((s) => s.label).join(" | ") || "-"}</span></div>
          <div><strong>?꾧레 怨꾩궛</strong><span>${savedCalc ? `${escapeXml(savedCalc.profileName || "??κ컪")} 쨌 1C ${fixed(oneC, 4)} mA` : (manual ? "留ㅻ돱??湲곗?" : "-")}</span></div>
        </div>
        <table>
          <thead><tr><th>C-rate</th><th>Cycle</th><th>?됯퇏 諛⑹쟾?⑸웾 (mAh g-1)</th><th>?곗씠???꾨쪟</th><th>???留ㅻ돱??湲곗? ?꾨쪟 (mA)</th></tr></thead>
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
            <div><strong>?쒕Ъ吏??대줎?⑸웾</strong><span>${sheet.theoreticalCapacity_mAh_g || "-"} mAh g-1</span></div>
            <div><strong>?섑뵆 ??/strong><span>${sheet.sampleCount || 0}</span></div>
            <div><strong>議곗꽦</strong><span>${Object.entries(sheet.composition || {}).map(([k, v]) => `${k} ${v}`).join(" / ") || "-"}</span></div>
          </div>
          <table>
            <thead><tr><th>?섑뵆</th><th>1C ?꾨쪟 (mA)</th><th>?꾧레 臾닿쾶 (g)</th><th>?먭퍡 (mm)</th><th>NCM mass (g)</th><th>C-rate蹂??꾨쪟</th></tr></thead>
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
        <h3>留ㅻ돱???뚯씪</h3>
        <p>${escapeXml(state.manualInfo.filename)} 쨌 ${state.manualInfo.sheetCount} sheets</p>
      </section>
      ${sheetCards}`);
  }

  if (!blocks.length) {
    blocks.push(`<section class="infoBlock emptyInfo"><h3>?ㅽ뿕 ?뺣낫 ?놁쓬</h3><p>CYC Fig瑜??좏깮?섍굅??留ㅻ돱???묒????ｌ쑝硫?C-rate? ?꾨쪟 ?뺣낫媛 ?ш린???뺣━?⑸땲??</p></section>`);
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
    title.textContent = "????좏깮?댁＜?몄슂";
    path.textContent = "Project ??Campaign ??Cell ??Dataset";
    tags.innerHTML = "";
    groupList.innerHTML = segmentList.innerHTML = figureList.innerHTML = reportList.innerHTML = `<span class="recordEmpty">?좏깮?????湲곕줉???ш린???쒖떆?⑸땲??</span>`;
    form.reset();
    return;
  }

  const workspace = state.cellWorkspace?.cell?.id === d.cellRecordId ? state.cellWorkspace : null;
  const metadata = workspace?.metadata?.metadata || {};
  const savedTags = Array.isArray(workspace?.metadata?.tags) ? workspace.metadata.tags : [];
  title.textContent = workspace?.cell?.cellId || d.cell?.cellId || "Cell record";
  path.textContent = hierarchyLabel(d) || "Project ??Campaign ??Cell ??Dataset";
  tags.innerHTML = savedTags.map((tag) => `<span>${escapeXml(tag)}</span>`).join("") || `<span class="recordChip">?쒓렇 ?놁쓬</span>`;
  for (const key of ["cathode", "anode", "separator", "spacer", "cellFormat"]) {
    if (form.elements[key]) form.elements[key].value = metadata[key] || "";
  }
  if (form.elements.tags) form.elements.tags.value = savedTags.join(", ");

  const groups = workspace?.datasetGroups || [];
  groupList.innerHTML = groups.length ? groups.map((group) => {
    const typeText = Object.entries(group.dataTypes || {}).map(([type, count]) => `${String(type).toUpperCase()} ${count}`).join(" 쨌 ") || "?꾩쭅 ?곗씠???놁쓬";
    const current = group.id === d.datasetGroupId ? "?꾩옱 ?좏깮" : "?좏깮";
    return `<div class="recordListItem"><span><strong>${escapeXml(group.name)}</strong><br/><em>${escapeXml(typeText)}</em></span><button type="button" data-select-dataset-group="${escapeAttr(group.id)}">${current}</button></div>`;
  }).join("") : `<span class="recordEmpty">Dataset 臾띠쓬???놁뒿?덈떎.</span>`;

  const segments = workspace?.protocolSegments || [];
  segmentList.innerHTML = segments.length ? segments.map((segment) => {
    const rate = Number.isFinite(Number(segment.cRate)) ? `${segment.cRate} C` : "C-rate 미입력";
    return `<div class="recordListItem"><span><strong>${escapeXml(segment.label)}</strong><br/><em>${segment.startCycle}-${segment.endCycle} cycle 쨌 ${escapeXml(rate)} 쨌 ${escapeXml(segment.mode || "other")}</em></span><button type="button" class="smallDanger" data-delete-segment="${escapeAttr(segment.id)}">??젣</button></div>`;
  }).join("") : `<span class="recordEmpty">?깅줉???꾨줈?좎퐳 援ш컙???놁뒿?덈떎.</span>`;

  const figures = workspace?.figures || [];
  figureList.innerHTML = figures.length ? figures.map((figure) => `<div class="recordListItem"><span><strong>${escapeXml(figure.name)}</strong><br/><em>${escapeXml(figure.figureKind || "figure")}</em></span><button type="button" data-open-figure-record="${escapeAttr(figure.datasetId)}">?닿린</button></div>`).join("") : `<span class="recordEmpty">??ν븳 Fig媛 ?놁뒿?덈떎.</span>`;

  const reports = workspace?.reports || [];
  reportList.innerHTML = reports.length ? reports.map((report) => {
    const lead = String(report.content?.main || report.content?.sections?.main || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").slice(0, 90);
    return `<div class="recordListItem"><span><strong>${escapeXml(report.title)}</strong><br/><em>${escapeXml(lead || report.reportType || "report")}</em></span><button type="button" data-open-report-record="${escapeAttr(report.id)}">蹂닿린</button></div>`;
  }).join("") : `<span class="recordEmpty">??ν븳 AI 蹂닿퀬?쒓? ?놁뒿?덈떎.</span>`;

  for (const button of groupList.querySelectorAll("[data-select-dataset-group]")) {
    button.addEventListener("click", () => {
      const select = $("datasetGroupSelect");
      if (select) select.value = button.dataset.selectDatasetGroup;
      renderHierarchyControls({ ...hierarchySelectionPayload(), datasetGroupId: button.dataset.selectDatasetGroup });
      setStatus("?좏깮??Dataset 臾띠쓬???ㅼ쓬 ????꾩튂濡??ㅼ젙?덉뒿?덈떎.");
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
    if (!res.ok) throw new Error(body.error || "? 湲곕줉??遺덈윭?ㅼ? 紐삵뻽?듬땲??");
    if (requestId !== state.cellWorkspaceRequestId || currentDataset()?.cellRecordId !== d.cellRecordId) return;
    state.cellWorkspace = body;
    renderCellWorkspace(d);
  } catch (error) {
    if (requestId !== state.cellWorkspaceRequestId) return;
    setStatus(error.message || "? 湲곕줉??遺덈윭?ㅼ? 紐삵뻽?듬땲??");
  }
}

async function saveCellMetadata(event) {
  event.preventDefault();
  const d = currentDataset();
  if (!d?.cellRecordId) return setStatus("癒쇱? ??λ맂 ? ?곗씠?곕? ?좏깮?댁＜?몄슂.");
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
    if (!res.ok) throw new Error(body.error || "? 硫뷀??곗씠????μ뿉 ?ㅽ뙣?덉뒿?덈떎.");
    state.cellWorkspace = { ...(state.cellWorkspace || {}), cell: state.cellWorkspace?.cell || { id: d.cellRecordId }, metadata: body };
    renderCellWorkspace(d);
    setStatus("? 硫뷀??곗씠?곗? ?쒓렇瑜???ν뻽?듬땲??");
  } catch (error) {
    setStatus(error.message || "? 硫뷀??곗씠????μ뿉 ?ㅽ뙣?덉뒿?덈떎.");
  }
}

async function saveProtocolSegment(event) {
  event.preventDefault();
  const d = currentDataset();
  if (!d?.cellRecordId) return setStatus("癒쇱? ??λ맂 ? ?곗씠?곕? ?좏깮?댁＜?몄슂.");
  const values = Object.fromEntries(new FormData(event.currentTarget));
  try {
    const res = await fetch(`/api/cells/${encodeURIComponent(d.cellRecordId)}/protocol-segments`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ ...values, datasetGroupId: d.datasetGroupId || "" }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || "?꾨줈?좎퐳 援ш컙 ??μ뿉 ?ㅽ뙣?덉뒿?덈떎.");
    event.currentTarget.reset();
    await loadCellWorkspace(d);
    setStatus(`${body.label} 援ш컙????ν뻽?듬땲??`);
  } catch (error) {
    setStatus(error.message || "?꾨줈?좎퐳 援ш컙 ??μ뿉 ?ㅽ뙣?덉뒿?덈떎.");
  }
}

async function deleteProtocolSegment(segmentId) {
  if (!segmentId) return;
  if (!window.confirm("???꾨줈?좎퐳 援ш컙????젣?좉퉴??")) return;
  try {
    const res = await fetch(`/api/protocol-segments/${encodeURIComponent(segmentId)}`, { method: "DELETE", headers: authHeaders() });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || "?꾨줈?좎퐳 援ш컙 ??젣???ㅽ뙣?덉뒿?덈떎.");
    await loadCellWorkspace();
    setStatus("?꾨줈?좎퐳 援ш컙????젣?덉뒿?덈떎.");
  } catch (error) {
    setStatus(error.message || "?꾨줈?좎퐳 援ш컙 ??젣???ㅽ뙣?덉뒿?덈떎.");
  }
}

function openCellRecordDataset(datasetId) {
  const target = state.datasets.find((item) => item.id === datasetId);
  if (!target) return setStatus("?꾩옱 紐⑸줉?먯꽌 Fig ?곗씠?곗뀑??李얠쓣 ???놁뒿?덈떎.");
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
  window.alert(`${report.title}\n\n${message || "??λ맂 ?댁슜???놁뒿?덈떎."}`);
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
  }[name] || name || "遺꾩꽍";
}

function analysisMetricLabel(key) {
  return {
    cycle_count: "분석 cycle 수",
    capacity_field: "용량 기준 필드",
    capacity_unit: "용량 단위",
    initial_capacity: "초기 용량",
    final_capacity: "마지막 용량",
    initial_capacity_mah: "초기 용량 (mAh)",
    final_capacity_mah: "마지막 용량 (mAh)",
    initial_capacity_mah_g: "초기 용량 (mAh g-1)",
    final_capacity_mah_g: "마지막 용량 (mAh g-1)",
    final_retention_pct: "용량 유지율 (%)",
    point_count: "분석 포인트 수",
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
    statusNode.innerHTML = "<strong>遺꾩꽍???곗씠?곗뀑??癒쇱? ??ν븯嫄곕굹 ?좏깮?섏꽭??</strong>";
    resultNode.innerHTML = "";
    return;
  }
  const provenance = run?.provenance || {};
  statusNode.innerHTML = `
    <strong>${escapeXml(datasetDisplayName(dataset))}</strong>
    <span>${escapeXml((dataset.dataType || "data").toUpperCase())} - ${dataset.parsedArtifact?.objectKey ? "BDF 정규화 데이터 우선" : "기존 데이터"}</span>
    ${run ? `<span>${escapeXml(analysisLabel(run.analysisName))} - ${escapeXml(run.createdAt || "")}</span>` : "<span>분석 방법을 선택하고 실행해 주세요.</span>"}
    ${run?.provenance ? `<small>데이터 출처: ${escapeXml(provenance.rowSource || "dataset-rows")} - 품질 제외 행: ${Number(provenance.excludedQualityRowCount || 0)}</small>` : ""}
  `;
  if (!run) {
    resultNode.innerHTML = "<p class=\"analysisEmpty\">?꾩쭅 ?좏깮???곗씠?곗뀑????λ맂 遺꾩꽍 寃곌낵媛 ?놁뒿?덈떎.</p>";
    return;
  }
  const result = run.result || {};
  if (run.status !== "ok") {
    resultNode.innerHTML = `<div class="analysisUnavailable"><strong>遺꾩꽍 寃곌낵瑜?留뚮뱾 ???놁뒿?덈떎.</strong><span>${escapeXml(result.reason || "?곗씠???뺤떇怨??꾩슂??而щ읆???뺤씤?섏꽭??")}</span></div>`;
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
  const pointNote = Array.isArray(result.points) ? `<p class="analysisPointNote">怨≪꽑 ?곗텧 ?? ${result.points.length}媛? 寃곌낵 JSON ?꾪떚?⑺듃???꾩껜 ?먯씠 蹂댁〈?⑸땲??</p>` : "";
  resultNode.innerHTML = `<div class="analysisResultTitle"><span class="analysisState ok">?꾨즺</span><h3>${escapeXml(analysisLabel(run.analysisName))}</h3></div>${metricHtml}${rangeHtml ? `<dl class="analysisMetricGrid">${rangeHtml}</dl>` : ""}${groupHtml}${pulseHtml}${pointNote}`;
}

function renderAnalysisLab() {
  const select = $("analysisLabDatasetSelect");
  const typeSelect = $("analysisType");
  const binField = $("dqdvBinField");
  if (!select || !typeSelect) return;
  const selectedId = state.selectedId || state.datasets[0]?.id || "";
  if (selectedId && selectedId !== state.selectedId) state.selectedId = selectedId;
  select.innerHTML = state.datasets.length
    ? state.datasets.map((dataset) => `<option value="${escapeAttr(dataset.id)}" ${dataset.id === state.selectedId ? "selected" : ""}>${escapeXml(datasetDisplayName(dataset))} 쨌 ${escapeXml((dataset.dataType || "data").toUpperCase())}</option>`).join("")
    : "<option value=\"\">??λ맂 ?곗씠?곗뀑???놁뒿?덈떎.</option>";
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
    ? state.analysisRuns.map((run) => `<button type="button" class="analysisRunItem${run.id === state.selectedAnalysisRunId ? " active" : ""}" data-analysis-run-id="${escapeAttr(run.id)}"><strong>${escapeXml(analysisLabel(run.analysisName))}</strong><span>${escapeXml(run.status)} 쨌 ${escapeXml(run.createdAt || "")}</span></button>`).join("")
    : "<p class=\"analysisEmpty\">???곗씠?곗뀑??遺꾩꽍 ?대젰???놁뒿?덈떎.</p>";
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
  if (!res.ok) throw new Error(body.detail || body.error || "遺꾩꽍 ?대젰??遺덈윭?ㅼ? 紐삵뻽?듬땲??");
  state.analysisRuns = Array.isArray(body) ? body : [];
  if (!state.analysisRuns.some((run) => run.id === state.selectedAnalysisRunId)) state.selectedAnalysisRunId = state.analysisRuns[0]?.id || null;
  renderAnalysisLab();
}

async function runSelectedDatasetAnalysis() {
  const datasetId = $("analysisLabDatasetSelect")?.value || state.selectedId;
  const analysisName = $("analysisType")?.value || "retention";
  if (!datasetId) return setStatus("遺꾩꽍???곗씠?곗뀑???놁뒿?덈떎.");
  state.selectedId = datasetId;
  const parameters = { includeReviewRows: Boolean($("includeReviewRows")?.checked) };
  if (analysisName === "dqdv") parameters.voltageBinV = Number($("dqdvVoltageBin")?.value || 0.005);
  const button = $("runDatasetAnalysis");
  if (button) {
    button.disabled = true;
    button.textContent = "遺꾩꽍 ?ㅽ뻾 以?..";
  }
  try {
    const res = await fetch(`/api/datasets/${encodeURIComponent(datasetId)}/analyses`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ analysisName, parameters }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.detail || body.error || "遺꾩꽍 ?ㅽ뻾???ㅽ뙣?덉뒿?덈떎.");
    state.analysisRuns = [body, ...state.analysisRuns.filter((run) => run.id !== body.id)];
    state.selectedAnalysisRunId = body.id;
    renderAnalysisLab();
    setStatus(`${analysisLabel(analysisName)} 遺꾩꽍????ν뻽?듬땲??`);
  } catch (error) {
    setStatus(error.message || "遺꾩꽍 ?ㅽ뻾???ㅽ뙣?덉뒿?덈떎.");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "?좏깮 遺꾩꽍 ?ㅽ뻾";
    }
  }
}

function sampleLabel(d) {
  if (!d) return "?좏깮 ?놁쓬";
  const cell = d.cell || {};
  return cell.cellId || cell.sampleName || cell.material || d.sourceName || d.id || "데이터";
}

// ?レ옄 諛곗뿴?먯꽌 理쒖냼/理쒕? 踰붿쐞瑜?援ы빀?덈떎.
// CV ?꾩븬 踰붿쐞, EIS 二쇳뙆??踰붿쐞泥섎읆 "?붿빟 臾몄옣????踰붿쐞"瑜?留뚮뱾 ???ъ궗?⑺빀?덈떎.
function rangeOf(nums) {
  const arr = nums.filter(Number.isFinite);
  return arr.length ? [Math.min(...arr), Math.max(...arr)] : [null, null];
}

// CYC ?곗씠???붿빟???꾩슂???듭떖 吏?쒕? ??踰덉뿉 怨꾩궛?⑸땲??
// 珥덇린/留덉?留??⑸웾? ?몄씠利덈? 以꾩씠?ㅺ퀬 ??3媛? ??3媛쒖쓽 ?됯퇏???ъ슜?⑸땲??
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

// cycle ?ъ씠?먯꽌 ?⑸웾??湲됯꺽??以꾩뼱??援ш컙??李얠뒿?덈떎.
// 湲곗?? 2% ?댁긽 媛먯냼 ?먮뒗 5 mAh g-1 ?댁긽 媛먯냼?대ŉ, ??媛먯냼 ?쒖꽌?濡?理쒕? 5媛쒕쭔 蹂댁뿬以띾땲??
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

// "???곗씠?곗쓽 二쇱슂 寃곌낵 ?붿빟" 移대뱶???ㅼ뼱媛?HTML??留뚮벊?덈떎.
// ?ㅼ젣 ?몃? AI API瑜??몄텧?섏? ?딄퀬, ?ы깉???덈뒗 ?ㅽ뿕 ?곗씠?곕? 怨꾩궛?댁꽌 ?ㅻ챸??臾몄옣?쇰줈 蹂?섑빀?덈떎.
function aiMainSummaryHtml(d) {
  if (!d) return `<p class="aiEmpty">?붿빟???곗씠?곕? 癒쇱? ?좏깮?섏꽭?? ?쇱そ ?곗씠??紐⑸줉?대굹 寃??寃곌낵?먯꽌 CYC/CV/EIS ?곗씠?곕? ?좏깮?섎㈃ ?ш린???먮룞 ?붿빟???쒖떆?⑸땲??</p>`;
  const type = String(d.dataType || "").toLowerCase();
  if (type === "cyc") {
    const s = cycStats(d);
    const rateText = s.segments?.length ? s.segments.map((seg) => seg.label).join(" | ") : "?먮룞 援ш컙 ?놁쓬";
    const quality = s.retention == null ? "?⑸웾 ?좎??⑥쓣 怨꾩궛?섍린?먮뒗 ?곗씠?곌? 遺議깊빀?덈떎." : (s.retention >= 95 ? "?⑸웾 ?좎?媛 留ㅼ슦 ?덉젙?곸엯?덈떎." : s.retention >= 85 ? "以묎컙 ?섏????⑸웾 媛먯냼媛 愿李곕맗?덈떎." : "?쒕졆???깅뒫 ??섍? 愿李곕맗?덈떎.");
    return `
      <p class="aiSummaryLead">${escapeXml(sampleLabel(d))}??${s.cycleMin ?? "-"}-${s.cycleMax ?? "-"} cycle 踰붿쐞??CYC ?곗씠?곗씠硫? ${quality}</p>
      <div class="aiMetricGrid">
        <div class="aiMetric"><strong>珥덇린 ?⑸웾</strong><span>${s.firstCap == null ? "-" : `${fmt(s.firstCap, 5)} mAh g-1`}</span></div>
        <div class="aiMetric"><strong>留덉?留??⑸웾</strong><span>${s.lastCap == null ? "-" : `${fmt(s.lastCap, 5)} mAh g-1`}</span></div>
        <div class="aiMetric"><strong>?좎???/strong><span>${s.retention == null ? "-" : `${fmt(s.retention, 4)} %`}</span></div>
        <div class="aiMetric"><strong>?됯퇏 ?⑥쑉</strong><span>${s.avgEfficiency == null ? "-" : `${fmt(s.avgEfficiency, 5)} %`}</span></div>
      </div>
      <ul class="aiBulletList">
        <li>媛???믪? 諛⑹쟾 ?⑸웾? ${Number.isFinite(s.maxCap) ? `${fmt(s.maxCap, 5)} mAh g-1` : "-"} ?섏??낅땲??</li>
        <li>C-rate 異붿젙 援ш컙? ${escapeXml(rateText)}?낅땲??</li>
        <li>?꾧레 怨꾩궛媛믪씠 ?곌껐??寃쎌슦 loading caption怨?湲곗? ?꾨쪟 ?ㅻ챸???④퍡 諛섏쁺?⑸땲??</li>
      </ul>`;
  }
  if (type === "eis") {
    const rows = d.rows || [];
    const [fMin, fMax] = rangeOf(rows.map((r) => Number(r.frequency)));
    const [zrMin, zrMax] = rangeOf(rows.map((r) => Number(r.zreal)));
    return `
      <p class="aiSummaryLead">${escapeXml(sampleLabel(d))}??${rows.length}媛??ъ씤?몄쓽 EIS ?곗씠?곗엯?덈떎. 二쇳뙆?섏? ?꾪뵾?섏뒪 踰붿쐞瑜?以묒떖?쇰줈 Nyquist/Bode ?댁꽍???ъ슜?????덉뒿?덈떎.</p>
      <div class="aiMetricGrid">
        <div class="aiMetric"><strong>?ъ씤????/strong><span>${rows.length}</span></div>
        <div class="aiMetric"><strong>二쇳뙆??踰붿쐞</strong><span>${fMin == null ? "-" : `${fmt(fMin, 3)}-${fmt(fMax, 3)}`}</span></div>
        <div class="aiMetric"><strong>Z' 踰붿쐞</strong><span>${zrMin == null ? "-" : `${fmt(zrMin, 4)}-${fmt(zrMax, 4)}`}</span></div>
        <div class="aiMetric"><strong>?곗씠?????/strong><span>EIS</span></div>
      </div>`;
  }
  if (type === "cv") {
    const rows = d.rows || [];
    const [vMin, vMax] = rangeOf(rows.map((r) => Number(r.voltage)));
    const [iMin, iMax] = rangeOf(rows.map((r) => Number(r.current)));
    return `
      <p class="aiSummaryLead">${escapeXml(sampleLabel(d))}??${rows.length}媛??ъ씤?몄쓽 CV ?곗씠?곗엯?덈떎. ?꾩븬-?꾨쪟 踰붿쐞? peak 蹂??鍮꾧탳???ъ슜?????덉뒿?덈떎.</p>
      <div class="aiMetricGrid">
        <div class="aiMetric"><strong>?ъ씤????/strong><span>${rows.length}</span></div>
        <div class="aiMetric"><strong>?꾩븬 踰붿쐞</strong><span>${vMin == null ? "-" : `${fmt(vMin, 4)}-${fmt(vMax, 4)} V`}</span></div>
        <div class="aiMetric"><strong>?꾨쪟 踰붿쐞</strong><span>${iMin == null ? "-" : `${fmt(iMin, 4)}-${fmt(iMax, 4)}`}</span></div>
        <div class="aiMetric"><strong>?곗씠?????/strong><span>CV</span></div>
      </div>`;
  }
  return `<p class="aiEmpty">${escapeXml(typeDisplay(type))} ?곗씠?곕뒗 ?꾩옱 湲곕낯 ?붿빟留?吏?먰빀?덈떎. CYC ?곗씠?곕? ?좏깮?섎㈃ ?깅뒫 ??섏? 鍮꾧탳 ?ㅻ챸源뚯? ?먮룞 怨꾩궛?⑸땲??</p>`;
}

// "?깅뒫 ???援ш컙 ?쒖떆" 移대뱶?낅땲??
// CYC媛 ?꾨땶 ?곗씠?곕뒗 ?꾩쭅 ???援ш컙 媛쒕뀗??紐낇솗?섏? ?딆븘 ?덈궡 臾멸뎄留?蹂댁뿬以띾땲??
function aiDegradationHtml(d) {
  if (!d) return `<p class="aiEmpty">?곗씠?곕? ?좏깮?섎㈃ ?깅뒫 ???援ш컙??怨꾩궛?⑸땲??</p>`;
  if (String(d.dataType || "").toLowerCase() !== "cyc") return `<p class="aiEmpty">?깅뒫 ???援ш컙 ?쒖떆??CYC ?곗씠?곗뿉???곗꽑 吏?먮맗?덈떎.</p>`;
  const stats = cycStats(d);
  const drops = degradationSegments(stats);
  if (!drops.length) {
    return `<p class="aiSummaryLead">2% ?댁긽 湲됯꺽??cycle-to-cycle ?⑸웾 ??섎뒗 ?쒕졆?섍쾶 蹂댁씠吏 ?딆뒿?덈떎.</p>
      <ul class="aiBulletList">
        <li>?꾩껜 ?좎??? ${stats.retention == null ? "-" : `${fmt(stats.retention, 4)} %`}</li>
        <li>理쒓퀬 ?⑸웾 ?鍮?留덉?留??⑸웾: ${stats.fromBest == null ? "-" : `${fmt(stats.fromBest, 4)} %`}</li>
      </ul>`;
  }
  return `<div class="aiDegradeList">${drops.map((drop) => `
    <div class="aiSegment">
      <strong>Cycle ${escapeXml(drop.start)} -> ${escapeXml(drop.end)}</strong>
      <span>?⑸웾??${fmt(drop.from, 5)}?먯꽌 ${fmt(drop.to, 5)} mAh g-1濡?媛먯냼?덉뒿?덈떎. 媛먯냼??? ${fmt(drop.loss, 4)} mAh g-1, ??${fmt(drop.lossPct, 4)}%?낅땲??</span>
    </div>`).join("")}</div>`;
}

// "鍮꾧탳 寃곌낵 ?ㅻ챸" 移대뱶?낅땲??
// Fig 紐⑥쓬?먯꽌 泥댄겕??CYC ?곗씠?곕뱾??鍮꾧탳 ??곸쑝濡??ъ슜?⑸땲??
function comparisonSummaryHtml() {
  const selected = state.compareIds
    .map((id) => state.datasets.find((d) => d.id === id))
    .filter((d) => d && d.dataType === "cyc");
  if (selected.length < 2) {
    return `<p class="aiEmpty">鍮꾧탳 寃곌낵 ?ㅻ챸??蹂대젮硫?Fig 紐⑥쓬?먯꽌 CYC ?곗씠?곕? 2媛??댁긽 泥댄겕???????섏씠吏濡??뚯븘?ㅼ꽭?? ?꾩옱 ?좏깮??鍮꾧탳 ??곸? ${selected.length}媛쒖엯?덈떎.</p>`;
  }
  const rows = selected.map((d) => ({ d, stats: cycStats(d) }));
  const ranked = [...rows].sort((a, b) => (b.stats.lastCap || 0) - (a.stats.lastCap || 0));
  const best = ranked[0];
  const stable = [...rows].filter((item) => item.stats.retention != null).sort((a, b) => b.stats.retention - a.stats.retention)[0];
  return `
    <p class="aiSummaryLead">${selected.length}媛?CYC ?곗씠?곕? 鍮꾧탳?덉뒿?덈떎. 留덉?留??⑸웾 湲곗??쇰줈??${escapeXml(sampleLabel(best.d))}媛 媛???믪뒿?덈떎.</p>
    <div class="aiCompareList">
      ${ranked.map((item, idx) => `
        <div class="aiCompareItem">
          <strong>${idx + 1}. ${escapeXml(sampleLabel(item.d))}</strong>
          <span>留덉?留??⑸웾 ${item.stats.lastCap == null ? "-" : `${fmt(item.stats.lastCap, 5)} mAh g-1`} 쨌 ?좎???${item.stats.retention == null ? "-" : `${fmt(item.stats.retention, 4)} %`} 쨌 ${item.stats.cycleMin ?? "-"}-${item.stats.cycleMax ?? "-"} cycle</span>
        </div>`).join("")}
    </div>
    <ul class="aiBulletList">
      <li>?⑸웾 ?좎???湲곗??쇰줈??${stable ? escapeXml(sampleLabel(stable.d)) : "-"}媛 媛???덉젙?곸쑝濡?蹂댁엯?덈떎.</li>
      <li>?쇰Ц??鍮꾧탳 ?ㅻ챸?먯꽌??留덉?留??⑸웾, ?좎??? cycle 踰붿쐞瑜??④퍡 ?쒖떆?섎뒗 寃껋씠 醫뗭뒿?덈떎.</li>
    </ul>`;
}

// AI ?붿빟 ?섏씠吏 ?꾩껜瑜??ㅼ떆 洹몃┰?덈떎.
// ?곗씠???좏깮, 鍮꾧탳 泥댄겕, ?덈줈怨좎묠 踰꾪듉???뚮┫ ?????⑥닔瑜??몄텧?섎㈃ 理쒖떊 ?곹깭媛 諛섏쁺?⑸땲??
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
  if (!Number.isFinite(retention)) return { label: "데이터 부족", tone: "neutral", text: "AI 요약 화면은 현재 비활성화되어 있습니다." };
  return { label: retention >= 90 ? "안정" : "검토 필요", tone: retention >= 90 ? "good" : "warning", text: "AI 요약 화면은 현재 비활성화되어 있습니다." };
}

function aiMainSummaryV2Html() { return ""; }
function aiDegradationV2Html() { return ""; }
function aiInsightSummaryHtml() { return ""; }
function aiWritingSummaryHtml() { return ""; }
function comparisonSummaryV2Html() { return ""; }
function aiLoadingHtml() { return ""; }
function aiApiNoticeHtml() { return ""; }
function aiSectionFromApiHtml(_section, fallbackHtml) { return fallbackHtml || ""; }

function renderLocalAISummary() {
  // AI Summary is intentionally hidden from the portal UI.
  const status = $("aiSummaryStatus");
  const content = $("aiSummaryContent");
  if (status) status.textContent = "";
  if (content) content.innerHTML = "";
}

function renderTable(d) {
  const body = $("dataTable");
  const head = $("excelTableHead");
  const summary = $("excelSummary");
  if (!body || !head) return;
  if (!d || !Array.isArray(d.rows) || !d.rows.length) {
    head.innerHTML = "";
    body.innerHTML = `<tr><td>?쒖떆???곗씠?곌? ?놁뒿?덈떎.</td></tr>`;
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
      ["phase", "罐"],
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
    return `<td class="editableCell" contenteditable="true" data-row-index="${i}" data-key="${escapeAttr(key)}" title="?대┃?댁꽌 ?섏젙">${typeof value === "number" ? escapeXml(fmt(value, 6)) : escapeXml(value ?? "")}</td>`;
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
      setStatus("???섏젙 以?..");
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
  setStatus("???섏젙 諛섏쁺 以?..");
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
    if (!res.ok) throw new Error(saved.error || "??????ㅽ뙣");
    state.datasets = state.datasets.map((item) => item.id === saved.id ? saved : item);
    state.filtered = state.filtered.map((item) => item.id === saved.id ? saved : item);
    setStatus("???섏젙??Fig??諛섏쁺?섍퀬 ??λ릱?듬땲??");
  } catch (error) {
    setStatus(`??????ㅽ뙣: ${error.message}`);
  }
}

// ?섎떒 "?묒? ?곗씠?? ?쒕? ?묒? ?ㅽ봽?덈뱶?쒗듃泥섎읆 ?ㅻ（??湲곕뒫?낅땲??
// ? 吏곸젒 ?섏젙, Tab/Enter ?대룞, ?щ윭 移?遺숈뿬?ｊ린, ??異붽?/??젣, ?먮룞 ??μ쓣 ??臾띠쓬?먯꽌 泥섎━?⑸땲??
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
      ["phase", "罐"],
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

// ?レ옄??蹂닿린 醫뗪쾶 以꾩씠怨? 臾몄옄?댁? 洹몃?濡?蹂댁뿬二쇰뒗 ???쒖떆???щ㎎?곗엯?덈떎.
function formatTableValue(value) {
  return typeof value === "number" ? fmt(value, 6) : (value ?? "");
}

// ?좏깮???곗씠?곗뀑??rows瑜??붾㈃ ?쒕줈 蹂?섑빀?덈떎.
// contenteditable ???留뚮뱾?댁꽌 ?ъ슜?먭? 諛붾줈 媛믪쓣 怨좎튌 ???덇쾶 ?⑸땲??
function renderTable(d) {
  const body = $("dataTable");
  const head = $("excelTableHead");
  const summary = $("excelSummary");
  if (!body || !head) return;
  state.tableSelection = null;
  if (!d || !Array.isArray(d.rows) || !d.rows.length) {
    head.innerHTML = "";
    body.innerHTML = `<tr><td class="emptyCell" colspan="99">표시할 데이터가 없습니다. 파일을 분석하거나 저장된 Dataset을 선택하세요.</td></tr>`;
    if (summary) summary.textContent = "0 rows";
    updateExcelUndoButton();
    return;
  }
  const columns = [["__index", "#"], ...tableColumnDefs(d)];
  head.innerHTML = `<tr>${columns.map(([, label]) => `<th>${escapeXml(label)}</th>`).join("")}</tr>`;
  body.innerHTML = d.rows.map((row, i) => `<tr data-row-index="${i}">${columns.map(([key]) => {
    const value = key === "__index" ? i + 1 : row[key];
    if (key === "__index") return `<td class="rowIndex" data-row-index="${i}" title="???좏깮">${escapeXml(value)}</td>`;
    return `<td class="editableCell" contenteditable="true" spellcheck="false" data-row-index="${i}" data-key="${escapeAttr(key)}" title="?대┃?댁꽌 ?섏젙">${escapeXml(formatTableValue(value))}</td>`;
  }).join("")}</tr>`).join("");
  if (summary) summary.textContent = `${d.rows.length} rows · 편집 가능`;
  updateExcelUndoButton();
  bindEditableTable();
}

// ???덉쓽 媛?????대┃/?ㅻ낫??遺숈뿬?ｊ린 ?대깽?몃? ?곌껐?⑸땲??
// ???⑥닔??renderTable???쒕? ?덈줈 洹몃┛ 吏곹썑留덈떎 ?ㅼ떆 ?몄텧?섏뼱???⑸땲??
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
      setStatus("???섏젙 以?..");
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

// ??踰덊샇瑜??꾨Ⅴ硫??대떦 ?됱쓣 ?좏깮?⑸땲??
// ?좏깮 ????젣 踰꾪듉?????좏깮 ?뺣낫瑜??ъ슜?⑸땲??
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

// ?ъ슜?먭? ?대┃??????꾩옱 ?좏깮 ?濡??쒖떆?⑸땲??
// ?뚮? ?뚮몢由ъ? ??媛뺤“?????⑥닔?먯꽌 遺숇뒗 CSS ?대옒?ㅺ? ?대떦?⑸땲??
function selectTableCell(cell) {
  const body = $("dataTable");
  if (!body || !cell) return;
  const rowIndex = Number(cell.dataset.rowIndex);
  body.querySelectorAll("tr").forEach((row) => row.classList.toggle("selectedRow", Number(row.dataset.rowIndex) === rowIndex));
  body.querySelectorAll(".selectedCell").forEach((el) => el.classList.remove("selectedCell"));
  cell.classList.add("selectedCell");
  state.tableSelection = { rowIndex, key: cell.dataset.key };
}

// Enter???꾨옒 ?? Tab? ???濡??대룞?⑸땲??
// ?쇰컲 ?묒? 議곗옉 媛먭컖??媛源앷쾶 留뚮뱾湲??꾪븳 蹂댁“ ?⑥닔?낅땲??
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

// ?ъ슜?먭? ?낅젰???띿뒪?몃? ??ν븯湲??꾩뿉 ?レ옄?몄? ?먮떒?⑸땲??
// "0.123"泥섎읆 ?レ옄濡??댁꽍 媛?ν븳 媛믪? number濡???ν빐??洹몃옒??怨꾩궛??諛붾줈 ?????덉뒿?덈떎.
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

// ?쒖쓽 rows媛 諛붾뚮㈃ ?붾㈃ ?곹깭, Fig, ?ㅽ뿕 ?뺣낫, ?먮룞 ????덉빟????踰덉뿉 媛깆떊?⑸땲??
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
  if (!d) return setStatus("?섎룎由??곗씠?곌? ?놁뒿?덈떎.");
  let snapshot = null;
  while (state.tableUndoStack.length) {
    const candidate = state.tableUndoStack.pop();
    if (candidate.datasetId === d.id) {
      snapshot = candidate;
      break;
    }
  }
  updateExcelUndoButton();
  if (!snapshot) return setStatus("?섎룎由??섏젙 ?댁뿭???놁뒿?덈떎.");
  d.rows = cloneTableRows(snapshot.rows);
  updateDatasetRows(d);
  renderTable(d);
  setStatus("???섏젙???댁쟾 ?곹깭濡??섎룎?몄뒿?덈떎.");
}

function updateDatasetRows(d) {
  state.datasets = state.datasets.map((item) => item.id === d.id ? d : item);
  state.filtered = state.filtered.map((item) => item.id === d.id ? d : item);
  renderFigure(d);
  renderExperimentInfo(d);
  scheduleRowsSave(d);
}

// ? ?섎굹瑜??섏젙?????ㅼ젣 ?곗씠?곗뀑 rows??諛섏쁺?⑸땲??
// ?댄썑 updateDatasetRows媛 Fig 媛깆떊怨??쒕쾭 ??κ퉴吏 ?댁뼱以띾땲??
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

// ?묒??먯꽌 蹂듭궗???щ윭 移몄쓣 洹몃?濡?遺숈뿬?ｌ쓣 ???덇쾶 ?⑸땲??
// ??? ?? 以꾨컮轅덉? ?됱쑝濡??댁꽍?댁꽌 ?꾩슂??寃쎌슦 ?됱쓣 ?먮룞?쇰줈 ?섎┰?덈떎.
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
  if (!d) return setStatus("癒쇱? ?곗씠?곕? ?좏깮?섏꽭??");
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
  if (!d || !Array.isArray(d.rows) || !d.rows.length) return setStatus("??젣???됱씠 ?놁뒿?덈떎.");
  const rowIndex = Number(state.tableSelection?.rowIndex);
  if (!Number.isInteger(rowIndex) || rowIndex < 0 || rowIndex >= d.rows.length) return setStatus("??젣???됱쓣 癒쇱? ?좏깮?섏꽭??");
  pushTableUndo(d);
  d.rows.splice(rowIndex, 1);
  updateDatasetRows(d);
  renderTable(d);
  setStatus("?좏깮???됱쓣 ??젣?덉뒿?덈떎.");
}

function saveCurrentExcelRows() {
  const d = state.datasets.find((x) => x.id === state.selectedId);
  if (!d) return setStatus("??ν븷 ?곗씠?곌? ?놁뒿?덈떎.");
  clearTimeout(state.tableSaveTimer);
  return saveRowsEdit(d);
}

function scheduleRowsSave(d) {
  clearTimeout(state.tableSaveTimer);
  setStatus("???섏젙 ?댁슜?????以?..");
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
    if (!res.ok) throw new Error(saved.error || "??????ㅽ뙣");
    state.datasets = state.datasets.map((item) => item.id === saved.id ? saved : item);
    state.filtered = state.filtered.map((item) => item.id === saved.id ? saved : item);
    setStatus("???섏젙 ?댁슜??Fig? DB????λ릺?덉뒿?덈떎.");
  } catch (error) {
    setStatus(`??????ㅽ뙣: ${error.message}`);
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
}

async function applyCellInfo() {
  const d = state.datasets.find((x) => x.id === state.selectedId);
  if (!d) return setStatus("癒쇱? ?곗씠?곕? ?좏깮?섏꽭??");
  setBusy(true, "?낅젰???뺣낫瑜??꾩옱 ?곗씠?곗뿉 ?곸슜?섍퀬 ?덉뒿?덈떎.");
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
      setStatus(saved.error || "?뺣낫 ????ㅽ뙣");
      return;
    }
    state.datasets = state.datasets.map((item) => item.id === saved.id ? saved : item);
    state.filtered = state.filtered.map((item) => item.id === saved.id ? saved : item);
    state.selectedId = saved.id;
    await loadHierarchy();
    renderSelect();
    renderSavedList();
    renderCurrent();
    setStatus("?낅젰 ?뺣낫媛 ?꾩옱 Fig???곸슜?섏뿀?듬땲??");
  } catch (error) {
    setStatus(`?뺣낫 ????ㅽ뙣: ${error.message}`);
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
    throw new Error(body.error || "????ㅽ뙣");
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
  }).catch((err) => setStatus(err.message || "PNG 蹂???ㅽ뙣"));
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
          blob ? resolve(blob) : reject(new Error("PNG 蹂???ㅽ뙣"));
        }, "image/png");
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Fig ?대?吏瑜?蹂?섑븯吏 紐삵뻽?듬땲??"));
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
    preview.innerHTML = `<p class="emptySaved">CYC Fig瑜?2媛??댁긽 ?좏깮?섎㈃ 鍮꾧탳 洹몃옒?꾨? 留뚮뱾 ???덉뒿?덈떎.</p>`;
    setStatus("CYC Fig瑜?2媛??댁긽 ?좏깮?섏꽭??");
    return;
  }
  const colorMap = Object.fromEntries(series.map((s, idx) => [s.d.id, comparisonColor(s.d.id, idx)]));
  preview.innerHTML = `
    <div class="comparisonTitle">
      <div>
        <strong>CYC 鍮꾧탳 Fig</strong>
        <span>${series.length}媛?Fig 鍮꾧탳</span>
      </div>
      <div class="comparisonActions">
        <button type="button" id="saveComparisonFigure">鍮꾧탳 Fig ???/button>
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
  setStatus("CYC 鍮꾧탳 Fig瑜?留뚮뱾?덉뒿?덈떎.");
}

async function saveComparisonFigure() {
  const series = selectedComparisonSeries();
  if (series.length < 2) return setStatus("??ν븯?ㅻ㈃ CYC Fig瑜?2媛??댁긽 ?좏깮?섏꽭??");
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
    return setStatus(body.error || "鍮꾧탳 Fig ????ㅽ뙣");
  }
  const saved = await res.json();
  state.datasets.unshift(saved);
  showDatasetImmediately(saved);
  activateView("figure", "cyc");
  setStatus("鍮꾧탳 C-rate Fig瑜???ν뻽?듬땲??");
}

function exportComparisonSvg() {
  const svg = $("comparisonFigure");
  if (!svg) return setStatus("癒쇱? 鍮꾧탳 Fig瑜?留뚮뱾?댁＜?몄슂.");
  download("cyc-comparison.svg", new XMLSerializer().serializeToString(svg), "image/svg+xml");
}

function exportComparisonPng() {
  const svg = $("comparisonFigure");
  if (!svg) return setStatus("癒쇱? 鍮꾧탳 Fig瑜?留뚮뱾?댁＜?몄슂.");
  svgToPngBlob(svg).then((blob) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "cyc-comparison.png";
    a.click();
    URL.revokeObjectURL(a.href);
  }).catch((err) => setStatus(err.message || "PNG 蹂???ㅽ뙣"));
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
    $("figureCanvas").innerHTML = `<p class="emptySaved">??λ맂 鍮꾧탳 Fig ?곗씠?곌? ?놁뒿?덈떎.</p>`;
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
  if (!svg) return setStatus("癒쇱? Fig瑜??앹꽦?섍굅???좏깮?섏꽭??");
  let pngBytes;
  try {
    const pngBlob = await svgToPngBlob(svg);
    pngBytes = new Uint8Array(await pngBlob.arrayBuffer());
  } catch (err) {
    return setStatus(err.message || "PPT 蹂???ㅽ뙣");
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
      throw new Error(body.error || "PPT ?뚯씪??留뚮뱾吏 紐삵뻽?듬땲??");
    }
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "battery-figure.pptx";
    a.click();
    URL.revokeObjectURL(a.href);
    return setStatus("PPT ?ㅼ슫濡쒕뱶 ?꾨즺");
  } catch (err) {
    return setStatus(err.message || "PPT ?ㅼ슫濡쒕뱶 ?ㅽ뙣");
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
<a:themeElements><a:clrScheme name="Office"><a:dk1><a:srgbClr val="000000"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="1F2937"/></a:dk2><a:lt2><a:srgbClr val="F8FAFC"/></a:lt2><a:accent1><a:srgbClr val="0F766E"/></a:accent1><a:accent2><a:srgbClr val="EC4899"/></a:accent2><a:accent3><a:srgbClr val="64748B"/></a:accent3><a:accent4><a:srgbClr val="A78BFA"/></a:accent4><a:accent5><a:srgbClr val="14B8A6"/></a:accent5><a:accent6><a:srgbClr val="F59E0B"/></a:accent6><a:hlink><a:srgbClr val="2563EB"/></a:hlink><a:folHlink><a:srgbClr val="7C3AED"/></a:folHlink></a:clrScheme><a:fontScheme name="Office"><a:majorFont><a:latin typeface="Segoe UI"/><a:ea typeface="留묒? 怨좊뵓"/><a:cs typeface="Segoe UI"/></a:majorFont><a:minorFont><a:latin typeface="Segoe UI"/><a:ea typeface="留묒? 怨좊뵓"/><a:cs typeface="Segoe UI"/></a:minorFont></a:fontScheme><a:fmtScheme name="Office"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements>
</a:theme>` },
    { name: "ppt/media/battery-figure.png", bytes: pngBytes },
  ];
  const a = document.createElement("a");
  a.href = URL.createObjectURL(makeZip(files));
  a.download = "battery-figure.pptx";
  a.click();
  URL.revokeObjectURL(a.href);
  setStatus("PPT ?ㅼ슫濡쒕뱶 ?꾨즺");
}

async function deleteCurrent() {
  if (!state.selectedId || !confirm("?좏깮???곗씠?곕? ??젣?좉퉴??")) return;
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
  { value: "ncm", label: "?묎레 / NCM" },
  { value: "lfp", label: "?묎레 / LFP" },
  { value: "graphite", label: "?뚭레 / Graphite" },
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
    calcCollectorMass: `${p.collector} 臾닿쾶 (g)`,
    calcCollectorThickness: `${p.collector} ?먭퍡 (mm)`,
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
  return `<button class="calcHelpButton" type="button" data-calc-help="${escapeAttr(text)}" aria-label="怨꾩궛 ?ㅻ챸 蹂닿린">?</button>`;
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

// 釉뚮씪?곗? localStorage?먯꽌 ??λ맂 ?꾧레 C-rate 怨꾩궛媛?紐⑸줉??遺덈윭?듬땲??
// ?쒕쾭 DB????ν븯湲??꾩쓽 媛쒖씤 ?묒뾽 蹂닿?????븷?낅땲??
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

// ?꾧레 ??μ냼 紐⑸줉??localStorage????ν븯怨??붾㈃ 紐⑸줉???ㅼ떆 洹몃┰?덈떎.
function persistElectrodeProfiles() {
  localStorage.setItem(ELECTRODE_PROFILE_KEY, JSON.stringify(state.electrodeProfiles));
  renderElectrodeProfileStore();
  renderElectrodeCalcSlots();
}

// ?대쫫??鍮꾩썙?먭퀬 ??ν븷 ???먮룞?쇰줈 遺숇뒗 ?대쫫?낅땲??
// ?좎쭨, active material, 1C ?꾨쪟媛 ?ㅼ뼱媛硫??섏쨷??李얘린媛 ?쎌뒿?덈떎.
function defaultElectrodeProfileName(c) {
  const date = todayLocal().slice(5);
  return `${date} ${c.preset.active} 1C ${fixed(c.oneC, 3)} mA`;
}

// ?꾩옱 ?꾧레 怨꾩궛 ?낅젰媛믨낵 怨꾩궛 寃곌낵瑜??섎굹?????媛앹껜濡?臾띠뒿?덈떎.
// ??媛앹껜媛 ??μ냼 移대뱶媛 ?섍퀬, ?섏쨷??CYC ?곗씠?곗뿉 ?ｌ쓣 payload???먮낯???⑸땲??
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

// ?꾩옱 怨꾩궛 寃곌낵瑜???μ냼??異붽??⑸땲??
// 理쒓렐 ??κ컪???꾩뿉 ?ㅻ룄濡?unshift ?뺥깭濡??ｊ퀬, ?덈Т 而ㅼ?吏 ?딄쾶 40媛쒓퉴吏留??좎??⑸땲??
function saveElectrodeProfile() {
  const profile = buildElectrodeProfile();
  state.electrodeProfiles = [profile, ...state.electrodeProfiles.filter((item) => item.id !== profile.id)].slice(0, 40);
  state.selectedElectrodeProfileId = profile.id;
  persistElectrodeProfiles();
  if ($("electrodeProfileName")) $("electrodeProfileName").value = "";
  setStatus(`?꾧레 C-rate 怨꾩궛媛믪쓣 ??ν뻽?듬땲?? ${profile.name}`);
}

// ??μ냼?먯꽌 ?꾩옱 ?좏깮??怨꾩궛 ?꾨줈?꾩쓣 李얠뒿?덈떎.
function normalizedSlotInputs(inputs = {}, presetKey = "ncm") {
  return { ...defaultElectrodeInputs(presetKey), ...inputs, calcElectrodeType: presetKey };
}

function defaultElectrodeSlot(index, presetKey = "ncm") {
  return {
    id: `electrode-slot-${index + 1}`,
    name: `怨꾩궛湲?${index + 1}`,
    presetKey,
    inputs: defaultElectrodeInputs(presetKey),
  };
}

function normalizeElectrodeSlot(slot, index) {
  const presetKey = slot?.presetKey || slot?.inputs?.calcElectrodeType || "ncm";
  return {
    id: slot?.id || `electrode-slot-${index + 1}`,
    name: slot?.name || `怨꾩궛湲?${index + 1}`,
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
  if (field.id === "calcCollectorMass") return `${preset.collector} 臾닿쾶 (g)`;
  if (field.id === "calcCollectorThickness") return `${preset.collector} ?먭퍡 (mm)`;
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
        <h3>?꾧레 C-rate 怨꾩궛湲?8移?/h3>
        <p>?섑뵆蹂꾨줈 媛믪쓣 ?곕줈 怨꾩궛?섍퀬, ?꾩슂??怨꾩궛媛믪? 硫붿씤 怨꾩궛湲곕굹 C-rate ??μ냼濡?諛붾줈 蹂대궪 ???덉뒿?덈떎.</p>
      </div>
      <span>?꾨옒濡??ㅽ겕濡ㅽ빐??8媛?怨꾩궛湲곕? ?ъ슜?섏꽭??/span>
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
                怨꾩궛 ?대쫫
                <input type="text" value="${escapeAttr(slot.name)}" data-slot-field="name" />
              </label>
              <label>
                ?꾧레
                <select data-slot-field="calcElectrodeType">${options}</select>
              </label>
            </div>
            <div class="calcSlotGrid">${fields}</div>
            <div class="calcSlotSummary">
              <div><small>1C ?꾨쪟</small><b>${fixed(c.oneC, 4)} mA</b></div>
              <div><small>${escapeXml(preset.active)} loading</small><b>${fixed(c.ncmLoadingArea, 8)} g cm-2</b></div>
              <div><small>${escapeXml(preset.collector)} ?쒖쇅 吏덈웾</small><b>${fixed(c.electrodeMass, 6)} g</b></div>
              <div><small>${escapeXml(preset.collector)} ?쒖쇅 ?먭퍡</small><b>${fixed(c.electrodeThickness, 4)} mm</b></div>
            </div>
            <div class="calcSlotRateGrid">
              ${c.rates.map((rate) => `<span><strong>${rate.rate} C</strong>${fixed(rate.current, 4)} mA</span>`).join("")}
            </div>
            <div class="calcSlotActions">
              <button type="button" data-slot-action="calc">怨꾩궛 ?덈줈怨좎묠</button>
              <button type="button" data-slot-action="load" class="secondaryAction">硫붿씤??遺덈윭?ㅺ린</button>
              <button type="button" data-slot-action="save" class="saveAction">??μ냼 ???/button>
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
  const genericName = /^계산기\\s*\\d+$/i.test(customName);
  const name = customName && !genericName ? customName : `${customName || "계산기"} - ${defaultElectrodeProfileName(c)}`;
  const profile = buildElectrodeProfileFromCalc(c, name, inputs, slot.presetKey);
  state.electrodeProfiles = [profile, ...state.electrodeProfiles.filter((item) => item.id !== profile.id)].slice(0, 40);
  state.selectedElectrodeProfileId = profile.id;
  persistElectrodeProfiles();
  renderElectrodeCalcSlots();
  setStatus(`계산기 값을 전극 C-rate 저장소에 저장했습니다. ${profile.name}`);
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
    return setStatus(`${slot.name || "계산기"} C-rate 계산 결과를 갱신했습니다.`);
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

// ??μ냼 移대뱶??"遺덈윭?ㅺ린" 踰꾪듉???꾨Ⅴ硫??낅젰移몄쓣 ????뱀떆 媛믪쑝濡??섎룎由쎈땲??
function applyElectrodeProfileToInputs(id = state.selectedElectrodeProfileId) {
  const profile = selectedElectrodeProfile(id);
  if (!profile) return setStatus("遺덈윭???꾧레 怨꾩궛媛믪쓣 癒쇱? ?좏깮?섏꽭??");
  for (const [inputId, value] of Object.entries(profile.inputs || {})) {
    if ($(inputId)) $(inputId).value = value;
  }
  updateElectrodeLabels();
  renderElectrodeCalc();
  setStatus(`?꾧레 怨꾩궛媛믪쓣 遺덈윭?붿뒿?덈떎: ${profile.name}`);
}

function deleteElectrodeProfile(id) {
  state.electrodeProfiles = state.electrodeProfiles.filter((profile) => profile.id !== id);
  if (state.selectedElectrodeProfileId === id) {
    state.selectedElectrodeProfileId = state.electrodeProfiles[0]?.id || null;
  }
  persistElectrodeProfiles();
  setStatus("??λ맂 ?꾧레 怨꾩궛媛믪쓣 ??젣?덉뒿?덈떎.");
}

// ??μ냼 移대뱶???댁슜??CYC ?곗씠??cell.electrodeCalc???ｊ린 ?꾪븳 ?뺥깭濡??뺣━?⑸땲??
// ?대젃寃??ｌ뼱?먮㈃ CYC Fig? 遺꾩꽍 ?붾㈃?먯꽌 媛숈? 怨꾩궛媛믪쓣 ?ㅼ떆 ?ъ슜?????덉뒿?덈떎.
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

// ?좏깮??CYC ?곗씠?곗뿉 ??λ맂 ?꾧레 怨꾩궛媛믪쓣 ?곸슜?⑸땲??
// PATCH API瑜??몄텧?섍린 ?뚮Ц???곸슜 ?꾩뿉??SQLite DB?먮룄 ?④퍡 ??λ맗?덈떎.
async function applyElectrodeProfileToSelectedCyc(id = state.selectedElectrodeProfileId) {
  const profile = selectedElectrodeProfile(id);
  if (!profile) return setStatus("CYC???ｌ쓣 ?꾧레 怨꾩궛媛믪쓣 癒쇱? ?좏깮?섏꽭??");
  const d = state.datasets.find((x) => x.id === state.selectedId);
  if (!d) return setStatus("癒쇱? CYC ?곗씠?곕? ?좏깮?섏꽭??");
  if (d.dataType !== "cyc") return setStatus("?좏깮???곗씠?곌? CYC媛 ?꾨떃?덈떎. CYC ?곗씠?곕? ?좏깮?????곸슜?섏꽭??");
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
    if (!res.ok) throw new Error(saved.error || "CYC ?곗씠???곸슜 ?ㅽ뙣");
    state.datasets = state.datasets.map((item) => item.id === saved.id ? saved : item);
    state.filtered = state.filtered.map((item) => item.id === saved.id ? saved : item);
    renderCurrent();
    renderSearchResults();
    renderSavedList();
    setStatus(`?꾧레 怨꾩궛媛믪쓣 CYC ?곗씠?곗뿉 ?ｌ뿀?듬땲?? ${profile.name}`);
  } catch (error) {
    setStatus(`CYC ?곸슜 ?ㅽ뙣: ${error.message}`);
  }
}

// ??μ냼 移대뱶 ?대? 踰꾪듉?ㅼ쓣 ??怨녹뿉??泥섎━?섎뒗 ?대깽???꾩엫 ?⑥닔?낅땲??
// 移대뱶媛 ?덈줈 洹몃젮?몃룄 遺紐?紐⑸줉 ?섎굹?먮쭔 ?대깽?몃? 嫄몃㈃ 怨꾩냽 ?묐룞?⑸땲??
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

// ?꾧레 C-rate ??μ냼 移대뱶 紐⑸줉???붾㈃??洹몃┰?덈떎.
// ?좏깮??移대뱶?먮뒗 active ?대옒?ㅻ? 遺숈뿬 ?ъ슜?먭? ?꾩옱 ?좏깮媛믪쓣 ?뚯븘蹂닿린 ?쎄쾶 ?⑸땲??
function renderElectrodeProfileStore() {
  const list = $("electrodeProfileList");
  const count = $("electrodeProfileCount");
  if (!list) return;
  const profiles = state.electrodeProfiles || [];
  if (count) count.textContent = `${profiles.length}媛???λ맖`;
  if (!profiles.length) {
    list.innerHTML = `<p class="emptyProfileList">?꾩쭅 ??λ맂 ?꾧레 C-rate 怨꾩궛媛믪씠 ?놁뒿?덈떎. ??媛믪쓣 怨꾩궛????"?꾩옱 怨꾩궛 ??????꾨Ⅴ?몄슂.</p>`;
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
          <div><small>?꾧레</small><b>${escapeXml(profile.preset?.active || "-")}</b></div>
          <div><small>1C</small><b>${fixed(Number(profile.oneC_mA), 4)} mA</b></div>
          <div><small>loading</small><b>${fixed(Number(profile.activeLoading_g_cm2), 8)} g cm-2</b></div>
          <div><small>吏덈웾</small><b>${fixed(Number(profile.electrodeMass_g), 6)} g</b></div>
        </div>
        <div class="electrodeProfileButtons">
          <button type="button" data-profile-action="select" data-profile-id="${escapeAttr(profile.id)}">?좏깮</button>
          <button type="button" data-profile-action="load" data-profile-id="${escapeAttr(profile.id)}">遺덈윭?ㅺ린</button>
          <button type="button" data-profile-action="apply" data-profile-id="${escapeAttr(profile.id)}" class="saveAction">CYC???ｊ린</button>
          <button type="button" data-profile-action="delete" data-profile-id="${escapeAttr(profile.id)}" class="secondaryAction">??젣</button>
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
      <div class="calcCard"><strong>1C ?꾨쪟 ${calcHelp(`1C ?꾨쪟 = ${activeName} 吏덈웾 횞 ?대줎?⑸웾?낅땲?? 吏湲덉? ${fixed(c.ncmMass, 9)} g 횞 ${fixed(c.capacity, 4)} mAh g-1 = ${fixed(c.oneC, 4)} mA濡?怨꾩궛?덉뒿?덈떎.`)}</strong><span>${fixed(c.oneC, 4)} mA</span></div>
      <div class="calcCard"><strong>${collectorName} ?쒖쇅 ?꾧레 臾닿쾶 ${calcHelp(`${collectorName} ?쒖쇅 ?꾧레 臾닿쾶 = ?꾧레 ?꾩껜 臾닿쾶 - ${collectorName} 臾닿쾶?낅땲?? ${fixed(c.totalMass, 6)} g - ${fixed(c.collectorMass, 6)} g = ${fixed(c.electrodeMass, 6)} g?낅땲??`)}</strong><span>${fixed(c.electrodeMass, 6)} g</span></div>
      <div class="calcCard"><strong>${collectorName} ?쒖쇅 ?꾧레 ?먭퍡 ${calcHelp(`${collectorName} ?쒖쇅 ?꾧레 ?먭퍡 = ?꾧레 ?꾩껜 ?먭퍡 - ${collectorName} ?먭퍡?낅땲?? ${fixed(c.totalThickness, 4)} mm - ${fixed(c.collectorThickness, 4)} mm = ${fixed(c.electrodeThickness, 4)} mm?낅땲??`)}</strong><span>${fixed(c.electrodeThickness, 4)} mm</span></div>
      <div class="calcCard"><strong>${activeName} loading ${calcHelp(`${activeName} loading = ${activeName} 吏덈웾 / ?꾧레 硫댁쟻?낅땲?? ?꾧레 硫댁쟻? 吏由?${fixed(c.diameter, 4)} mm 湲곗? ? 횞 (吏由?20)^2 = ${fixed(c.area, 6)} cm2?닿퀬, ${fixed(c.ncmMass, 9)} g / ${fixed(c.area, 6)} cm2 = ${fixed(c.ncmLoadingArea, 8)} g cm-2?낅땲??`)}</strong><span>${fixed(c.ncmLoadingArea, 8)} g cm-2</span></div>
    </div>
    <section class="calcFormulaBox">
      <div>
        <strong>臾닿쾶 怨꾩궛</strong>
        <span>${fixed(c.totalMass, 6)} g - ${fixed(c.collectorMass, 6)} g = ${fixed(c.electrodeMass, 6)} g</span>
      </div>
      <div>
        <strong>?먭퍡 怨꾩궛</strong>
        <span>${fixed(c.totalThickness, 4)} mm - ${fixed(c.collectorThickness, 4)} mm = ${fixed(c.electrodeThickness, 4)} mm</span>
      </div>
    </section>
    <section class="rateCurrentBox">
      <div class="rateCurrentHeader">
        <h3>C-rate蹂??꾨쪟 ${calcHelp(`媛?C-rate ?꾨쪟 = 1C ?꾨쪟 횞 C-rate?낅땲?? ?덈? ?ㅼ뼱 0.33C??${fixed(c.oneC, 4)} mA 횞 0.33 = ${fixed(c.oneC * 0.33, 4)} mA?낅땲??`)}</h3>
        <span>1C = ${fixed(c.oneC, 4)} mA 湲곗?</span>
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
            <th colspan="2">濡쒕뵫 ${calcHelp(`濡쒕뵫 怨꾩궛???꾩슂??湲곗?媛믪엯?덈떎. C-Al? 吏묒쟾泥?臾닿쾶, 1C??NCM 吏덈웾怨??대줎?⑸웾?쇰줈 怨꾩궛??湲곗? ?꾨쪟?낅땲??`)}</th>
            <th colspan="3">?꾧레 ?낅젰媛?${calcHelp(`?꾧레 ?꾩껜 ?낅젰媛믪뿉??C-coated Al 媛믪쓣 鍮쇨퀬, ?꾧레 吏由꾩쑝濡?硫댁쟻??怨꾩궛?⑸땲??`)}</th>
            <th colspan="3" class="sectionBlue">loading amount ${calcHelp(`媛??깅텇 吏덈웾 = Al ?쒖쇅 ?꾧레 臾닿쾶 횞 議곗꽦鍮꾩엯?덈떎. NCM? ${fixed(c.electrodeMass, 6)} g 횞 ${fixed(c.ncmRatio * 100, 2)}% = ${fixed(c.ncmMass, 9)} g?낅땲??`)}</th>
            <th colspan="2" class="sectionGreen">諛??怨꾩궛 ${calcHelp(`?꾩껜 諛??= Al ?쒖쇅 ?꾧레 臾닿쾶 / ?꾧레 遺?쇱엯?덈떎. ?꾧레 遺??= 硫댁쟻 횞 ?먭퍡(cm) = ${fixed(c.area, 6)} 횞 ${fixed(c.electrodeThickness / 10, 6)} = ${fixed(c.volume, 8)} cm3?낅땲??`)}</th>
          </tr>
          <tr>
            <th>${calcHelpLabel(collectorName, `${collectorName} 吏묒쟾泥댁쓽 臾닿쾶?낅땲?? ?꾧레 ?꾩껜 臾닿쾶?먯꽌 ??媛믪쓣 鍮쇱꽌 ?쒕Ъ吏덉링 臾닿쾶瑜?援ы빀?덈떎.`)}</th>
            <th class="rateHead">${calcHelpLabel("1C", `1C ?꾨쪟??${activeName} 吏덈웾 횞 ?대줎?⑸웾?쇰줈 怨꾩궛??湲곗? ?꾨쪟?낅땲??`)}</th>
            <th>${calcHelpLabel(`${collectorName} ?쒖쇅 ?꾧레 臾닿쾶 (g)`, `?꾧레 ?꾩껜 臾닿쾶?먯꽌 ${collectorName} 臾닿쾶瑜?類 媛믪엯?덈떎.`)}</th>
            <th>${calcHelpLabel(`${collectorName} ?쒖쇅 ?꾧레 ?먭퍡 (mm)`, `?꾧레 ?꾩껜 ?먭퍡?먯꽌 ${collectorName} ?먭퍡瑜?類 媛믪엯?덈떎.`)}</th>
            <th>${calcHelpLabel("Area (cm2)", "?꾧레 吏由꾩쑝濡?怨꾩궛???먰삎 ?꾧레 硫댁쟻?낅땲?? ? 횞 (吏由?20)^2 ?낅땲??")}</th>
            <th>${calcHelpLabel(activeName, `${collectorName} ?쒖쇅 ?꾧레 臾닿쾶??${activeName} 議곗꽦鍮꾨? 怨깊븳 吏덈웾?낅땲??`)}</th>
            <th>${calcHelpLabel(conductorName, `${collectorName} ?쒖쇅 ?꾧레 臾닿쾶??${conductorName} 議곗꽦鍮꾨? 怨깊븳 ?꾩쟾??吏덈웾?낅땲??`)}</th>
            <th>${calcHelpLabel(binderName, `${collectorName} ?쒖쇅 ?꾧레 臾닿쾶??${binderName} 議곗꽦鍮꾨? 怨깊븳 諛붿씤??吏덈웾?낅땲??`)}</th>
            <th>${calcHelpLabel("전체 밀도", "Al 제외 전극 무게를 전극 부피로 나눈 값입니다.")}</th>
            <th>${calcHelpLabel(`${activeName} density`, `${activeName} 吏덈웾???꾧레 遺?쇰줈 ?섎늿 媛믪엯?덈떎.`)}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${fixed(c.collectorMass, 6)} ${calcHelp(`C-coated Al 臾닿쾶 ?낅젰媛믪엯?덈떎.`)}</td>
            <td class="rateHead">${fixed(c.oneC, 4)} ${calcHelp(`${fixed(c.ncmMass, 9)} g 횞 ${fixed(c.capacity, 4)} mAh g-1 = ${fixed(c.oneC, 4)} mA`)}</td>
            <td>${fixed(c.electrodeMass, 6)} ${calcHelp(`${fixed(c.totalMass, 6)} g - ${fixed(c.collectorMass, 6)} g = ${fixed(c.electrodeMass, 6)} g`)}</td>
            <td>${fixed(c.electrodeThickness, 4)} ${calcHelp(`${fixed(c.totalThickness, 4)} mm - ${fixed(c.collectorThickness, 4)} mm = ${fixed(c.electrodeThickness, 4)} mm`)}</td>
            <td>${fixed(c.area, 6)} ${calcHelp(`吏由?${fixed(c.diameter, 4)} mm 湲곗? 硫댁쟻?낅땲??`)}</td>
            <td>${fixed(c.ncmMass, 9)} ${calcHelp(`${fixed(c.electrodeMass, 6)} g 횞 ${fixed(c.ncmRatio * 100, 2)}%`)}</td>
            <td>${fixed(c.superMass, 9)} ${calcHelp(`${fixed(c.electrodeMass, 6)} g 횞 ${fixed(c.superRatio * 100, 2)}%`)}</td>
            <td>${fixed(c.ptfeMass, 9)} ${calcHelp(`${fixed(c.electrodeMass, 6)} g 횞 ${fixed(c.ptfeRatio * 100, 2)}%`)}</td>
            <td>${fixed(c.totalDensity, 8)} ${calcHelp(`${fixed(c.electrodeMass, 6)} g / ${fixed(c.volume, 8)} cm3`)}</td>
            <td>${fixed(c.ncmLoadingVolume, 8)} ${calcHelp(`${fixed(c.ncmMass, 9)} g / ${fixed(c.volume, 8)} cm3`)}</td>
          </tr>
          <tr>
            <th>${calcHelpLabel(collectorName, `${collectorName} 吏묒쟾泥??먭퍡?낅땲??`)}</th>
            <th>${calcHelpLabel(`${collectorName} 臾닿쾶`, `${collectorName} 吏묒쟾泥?臾닿쾶?낅땲??`)}</th>
            <th>${calcHelpLabel("loading (g cm-2)", "Al ?쒖쇅 ?꾧레 臾닿쾶瑜??꾧레 硫댁쟻?쇰줈 ?섎늿 媛믪엯?덈떎.")}</th>
            ${c.rates.map((r) => `<th>${calcHelpLabel(`${r.rate} C ?꾨쪟`, `1C ?꾨쪟 ${fixed(c.oneC, 4)} mA 횞 ${r.rate} = ${fixed(r.current, 4)} mA?낅땲??`)}</th>`).join("")}
            <th colspan="2">${calcHelpLabel(`${activeName} loading (g cm-2)`, `${activeName} 吏덈웾???꾧레 硫댁쟻?쇰줈 ?섎늿 媛믪엯?덈떎.`)}</th>
          </tr>
          <tr>
            <td>${fixed(c.collectorThickness, 4)} ${calcHelp(`C-coated Al ?먭퍡 ?낅젰媛믪엯?덈떎.`)}</td>
            <td>${fixed(c.collectorMass, 6)} ${calcHelp(`C-coated Al 臾닿쾶 ?낅젰媛믪엯?덈떎.`)}</td>
            <td>${fixed(c.loading, 8)} ${calcHelp(`${fixed(c.electrodeMass, 6)} g / ${fixed(c.area, 6)} cm2`)}</td>
            ${c.rates.map((r) => `<td>${fixed(r.current, 4)} ${calcHelp(`${fixed(c.oneC, 4)} mA 횞 ${r.rate}`)}</td>`).join("")}
            <td colspan="2">${fixed(c.ncmLoadingArea, 8)} ${calcHelp(`${fixed(c.ncmMass, 9)} g / ${fixed(c.area, 6)} cm2`)}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="copyNote">Al ?쒖쇅 ?꾧레 臾닿쾶/?먭퍡???낅젰???꾧레 ?꾩껜媛믪뿉??C-coated Al 媛믪쓣 類 媛믪엯?덈떎. ?꾧레 吏由?湲곗? 硫댁쟻???ъ슜?섎?濡?吏由꾩쓣 諛붽씀硫?loading怨?諛?꾧? 媛숈씠 諛붾앸땲??</p>`;
  renderElectrodeProfileStore();
  renderElectrodeCalcSlots();
}

function runElectrodeCalc() {
  lastElectrodeCalcAt = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  renderElectrodeCalc();
  const box = $("electrodeCalcResult");
  box?.insertAdjacentHTML("beforeend", `<p class="calcUpdated">怨꾩궛 ?꾨즺: ${escapeXml(lastElectrodeCalcAt)}</p>`);
  box?.classList.remove("calcFlash");
  void box?.offsetWidth;
  box?.classList.add("calcFlash");
  setStatus("?꾧레 怨꾩궛 ?꾨즺");
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
    ["1C ?꾨쪟", fixed(c.oneC, 6), "mA"],
    ["?꾧레 臾닿쾶 except Al", fixed(c.electrodeMass, 9), "g"],
    ["?꾧레 ?먭퍡 except Al", fixed(c.electrodeThickness, 6), "mm"],
    ["硫댁쟻", fixed(c.area, 9), "cm2"],
    ["loading", fixed(c.loading, 9), "g cm-2"],
    ["NCM 吏덈웾", fixed(c.ncmMass, 9), "g"],
    ["Super P 吏덈웾", fixed(c.superMass, 9), "g"],
    ["PTFE 吏덈웾", fixed(c.ptfeMass, 9), "g"],
    ["전체 밀도", fixed(c.totalDensity, 9), "g cm-3"],
    ["NCM loading", fixed(c.ncmLoadingArea, 9), "g cm-2"],
    ["NCM density", fixed(c.ncmLoadingVolume, 9), "g cm-3"],
    ...c.rates.map((r) => [`${r.rate} C ?꾨쪟`, fixed(r.current, 6), "mA"]),
  ];
  const text = rows.map((row) => row.join("\t")).join("\n");
  navigator.clipboard?.writeText(text).then(
    () => setStatus("?꾧레 怨꾩궛?쒕? 蹂듭궗?덉뒿?덈떎."),
    () => setStatus("蹂듭궗 沅뚰븳???놁뼱 ?쒕? ?좏깮?댁꽌 蹂듭궗??二쇱꽭??")
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
      status.textContent = "?섏젙 ?붿껌 ?댁슜??癒쇱? ?곸뼱二쇱꽭??";
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
    status.textContent = "?섍껄????ν븯??以묒엯?덈떎...";
    status.className = "";
  }
  try {
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || "?섍껄 ????ㅽ뙣");
    form.reset();
    if (status) {
      const when = new Date(body.createdAt || Date.now()).toLocaleString("ko-KR");
      status.textContent = `??λ릱?듬땲?? ?묒닔 ?쒓컙: ${when}`;
      status.className = "success";
    }
    setStatus("?섏젙 ?붿껌 ????꾨즺");
    if (state.user?.role === "admin") loadFeedbacks().catch(() => {});
  } catch (err) {
    if (status) {
      status.textContent = err.message || "?섍껄????ν븯吏 紐삵뻽?듬땲??";
      status.className = "error";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setBusy(false);
  if ($("appVersion")) $("appVersion").textContent = PORTAL_VERSION_LABEL;
  on("loginForm", "submit", safeLogin);
  on("registerForm", "submit", safeRegister);
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
  on("batchCreateFigures", "click", createBatchFigures);
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
  $("batchFigureResults")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-open-batch-figure]");
    if (!button) return;
    const dataset = state.datasets.find((item) => item.id === button.dataset.openBatchFigure);
    if (!dataset) return setStatus("??λ맂 Dataset??李얠? 紐삵뻽?듬땲?? 紐⑸줉???덈줈怨좎묠??二쇱꽭??");
    showDatasetImmediately(dataset);
    showModule(["cyc", "cv", "eis"].includes(dataset.dataType) ? dataset.dataType : "figure");
  });
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

// Authoritative saved-Fig labels. Unicode escapes keep this browser-facing
// Korean text stable even when a Windows editor uses a non-UTF-8 code page.
function savedFigText() {
  return {
    empty: "\uc800\uc7a5\ub41c Fig\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.",
    open: "Fig \uc5f4\uae30",
    remove: "\uc800\uc7a5\ub41c Fig \uc0ad\uc81c",
    dateMissing: "\ub0a0\uc9dc \uc5c6\uc74c",
    compare: "\ube44\uad50",
    compareSelect: "CYC \ube44\uad50 \uc120\ud0dd",
    cycOnly: "CYC Fig\ub9cc \ube44\uad50\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.",
    selected: "\uac1c CYC Fig \uc120\ud0dd\ub428",
    cleared: "\ube44\uad50 \uc120\ud0dd\uc744 \ud574\uc81c\ud588\uc2b5\ub2c8\ub2e4.",
    loaded: "\uc800\uc7a5\ub41c Fig\ub97c \ubd88\ub7ec\uc654\uc2b5\ub2c8\ub2e4.",
    compareTitle: "CYC \ube44\uad50 Fig",
    compareCount: "\uac1c Fig \ube44\uad50",
    compareSave: "\ube44\uad50 Fig \uc800\uc7a5",
    chooseTwo: "CYC Fig\ub97c 2\uac1c \uc774\uc0c1 \uc120\ud0dd\ud558\uba74 \ube44\uad50 \uadf8\ub798\ud504\ub97c \ub9cc\ub4e4 \uc218 \uc788\uc2b5\ub2c8\ub2e4.",
    noSeries: "\uc120\ud0dd\ud55c CYC Fig\uc5d0 \ube44\uad50\ud560 \uc218 \uc788\ub294 \ubc29\uc804\uc6a9\ub7c9 \ub370\uc774\ud130\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.",
    compared: "CYC \ube44\uad50 Fig\ub97c \ub9cc\ub4e4\uc5c8\uc2b5\ub2c8\ub2e4.",
    saveNeedsTwo: "\uc800\uc7a5\ud558\ub824\uba74 CYC Fig\ub97c 2\uac1c \uc774\uc0c1 \uc120\ud0dd\ud558\uc138\uc694.",
    saveFailed: "\ube44\uad50 Fig \uc800\uc7a5\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.",
    saved: "\ube44\uad50 Fig\ub97c \uc800\uc7a5\ud588\uc2b5\ub2c8\ub2e4.",
    exportMissing: "\uba3c\uc800 \ube44\uad50 Fig\ub97c \ub9cc\ub4e4\uc5b4\uc8fc\uc138\uc694.",
  };
}

function figureLabel(d) {
  const labels = {
    "cycling-performance": "\uc131\ub2a5 \ud14c\uc2a4\ud2b8 Fig",
    "voltage-profile": "\uc804\uc555 \ud504\ub85c\ud30c\uc77c Fig",
    "cyc-combined": "\uc131\ub2a5 + \uc804\uc555/\uc804\ub958 Fig",
    "nyquist": "Nyquist Fig",
    "bode": "Bode Fig",
    "eis-combined": "Nyquist + Bode Fig",
    "cv-curve": "CV Fig",
    "cv-comparison": "CV \ube44\uad50 Fig",
    "table-preview": "\ud45c \ubbf8\ub9ac\ubcf4\uae30",
  };
  return labels[d.figureKind] || String(d.dataType || "data").toUpperCase() + " Fig";
}

function renderSavedList() {
  const list = $("savedList");
  if (!list) return;
  const text = savedFigText();
  document.querySelectorAll("#savedCount").forEach((element) => {
    element.textContent = String(state.filtered.length) + "\uac1c";
  });
  const heading = document.querySelector("#savedFiguresView .savedFigureHeader h2");
  const description = document.querySelector("#savedFiguresView .savedFigureHeader p");
  const compareButton = $("compareCycFigures");
  const clearButton = $("clearCompareSelection");
  if (heading) heading.textContent = "\uc800\uc7a5\ub41c Fig";
  if (description) description.textContent = "\uc800\uc7a5\ud55c Fig\ub97c \uc120\ud0dd\ud574 \ub2e4\uc2dc \uc5f4\uac70\ub098 \uc0ad\uc81c\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.";
  if (compareButton) compareButton.textContent = "\uc120\ud0dd CYC \ube44\uad50";
  if (clearButton) clearButton.textContent = "\uc120\ud0dd \ud574\uc81c";
  if (!state.filtered.length) {
    list.innerHTML = '<p class="emptySaved">' + text.empty + "</p>";
    return;
  }
  list.innerHTML = state.filtered.map((dataset) => {
    const cell = dataset.cell || {};
    const active = dataset.id === state.selectedId ? " active" : "";
    const title = datasetDisplayName(dataset);
    const sub = [figureLabel(dataset), String(dataset.rows?.length || 0) + " points", hierarchyLabel(dataset), displayUserName(dataset)].filter(Boolean).join(" \u00b7 ");
    const isCyc = String(dataset.dataType || "").toLowerCase() === "cyc";
    return [
      '<article class="savedItem' + active + '" data-dataset-id="' + escapeAttr(dataset.id) + '">',
      '<label class="compareCheck' + (isCyc ? "" : " disabled") + '" title="' + (isCyc ? text.compareSelect : text.cycOnly) + '">',
      '<input type="checkbox" data-compare-id="' + escapeAttr(dataset.id) + '"' + (state.compareIds.includes(dataset.id) ? " checked" : "") + (isCyc ? "" : " disabled") + " />",
      "<span>" + text.compare + "</span></label>",
      '<button type="button" class="savedOpen" data-dataset-id="' + escapeAttr(dataset.id) + '" title="' + text.open + '">',
      figureThumb(dataset),
      '<span class="savedInfo"><strong>' + escapeXml(title) + "</strong>",
      "<span>" + escapeXml(cell.date || text.dateMissing) + " \u00b7 " + escapeXml(sub) + "</span>",
      "<em>" + escapeXml(dataset.sourceName || dataset.id) + "</em></span></button>",
      '<button type="button" class="savedDelete" data-dataset-id="' + escapeAttr(dataset.id) + '" title="' + text.remove + '">\u00d7</button>',
      "</article>",
    ].join("");
  }).join("");
  list.querySelectorAll(".savedOpen").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedId = button.dataset.datasetId;
      state.selectedAnnotation = null;
      renderSelect();
      renderSavedList();
      renderCurrent();
      state.activeFigureModule = state.datasets.find((dataset) => dataset.id === state.selectedId)?.dataType || state.activeFigureModule;
      activateView("figure", state.activeFigureModule);
      setStatus(text.loaded);
    });
  });
  list.querySelectorAll(".savedDelete").forEach((button) => {
    button.addEventListener("click", (event) => deleteSavedFigure(button.dataset.datasetId, event));
  });
  list.querySelectorAll("input[data-compare-id]").forEach((input) => {
    input.addEventListener("click", (event) => event.stopPropagation());
    input.addEventListener("change", () => toggleCompareSelection(input.dataset.compareId, input.checked));
  });
}

function toggleCompareSelection(id, checked) {
  if (!id) return;
  const text = savedFigText();
  const target = state.datasets.find((dataset) => dataset.id === id);
  if (target?.dataType !== "cyc") {
    setStatus(text.cycOnly);
    return;
  }
  if (checked && !state.compareIds.includes(id)) state.compareIds.push(id);
  if (!checked) state.compareIds = state.compareIds.filter((item) => item !== id);
  setStatus(String(state.compareIds.length) + text.selected);
}

function clearCompareSelection() {
  state.compareIds = [];
  renderSavedList();
  const preview = $("comparisonPreview");
  if (preview) {
    preview.classList.add("hidden");
    preview.innerHTML = "";
  }
  setStatus(savedFigText().cleared);
}

function renderCycComparison() {
  const preview = $("comparisonPreview");
  if (!preview) return;
  const text = savedFigText();
  const series = selectedComparisonSeries();
  preview.classList.remove("hidden");
  if (series.length < 2) {
    preview.innerHTML = '<p class="emptySaved">' + text.chooseTwo + "</p>";
    setStatus(text.chooseTwo);
    return;
  }
  const colorMap = Object.fromEntries(series.map((item, index) => [item.d.id, comparisonColor(item.d.id, index)]));
  preview.innerHTML = [
    '<div class="comparisonTitle"><div><strong>' + text.compareTitle + "</strong>",
    "<span>" + String(series.length) + text.compareCount + "</span></div>",
    '<div class="comparisonActions">',
    '<button type="button" id="saveComparisonFigure">' + text.compareSave + "</button>",
    '<button type="button" id="exportComparisonSvg" class="secondaryAction">SVG</button>',
    '<button type="button" id="exportComparisonPng" class="secondaryAction">PNG</button>',
    "</div></div>",
    '<div class="comparisonControls">',
    series.map((item, index) => [
      '<label class="comparisonColorItem"><input type="color" data-comparison-color="',
      escapeAttr(item.d.id),
      '" value="',
      comparisonColor(item.d.id, index),
      '" /><span>',
      escapeXml(item.name),
      "</span></label>",
    ].join("")).join(""),
    "</div>",
    renderComparisonSvg(series, colorMap),
  ].join("");
  preview.querySelectorAll("[data-comparison-color]").forEach((input) => {
    input.addEventListener("input", () => {
      state.comparisonColors[input.dataset.comparisonColor] = normalizeHexColor(input.value, "#0f766e");
      renderCycComparison();
    });
  });
  $("saveComparisonFigure")?.addEventListener("click", saveComparisonFigure);
  $("exportComparisonSvg")?.addEventListener("click", exportComparisonSvg);
  $("exportComparisonPng")?.addEventListener("click", exportComparisonPng);
  setStatus(text.compared);
}

async function saveComparisonFigure() {
  const series = selectedComparisonSeries();
  const text = savedFigText();
  if (series.length < 2) return setStatus(text.saveNeedsTwo);
  const comparisonColors = Object.fromEntries(series.map((item, index) => [item.d.id, comparisonColor(item.d.id, index)]));
  const payload = {
    dataType: "cyc-comparison",
    figureKind: "cyc-comparison",
    cell: {
      date: todayLocal(),
      cellId: "CYC comparison",
      sampleName: String(series.length) + " CYC figures",
      material: "CYC",
      condition: "comparison",
      notes: series.map((item) => item.name).join(" / "),
    },
    rows: comparisonRowsFromSeries(series),
    columns: ["sourceId", "sourceName", "cycle", "capacity"],
    sourceName: series.map((item) => item.name).join(" + "),
    figureEdits: { comparisonColors },
  };
  const response = await fetch("/api/datasets", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    return setStatus(body.error || text.saveFailed);
  }
  const saved = await response.json();
  state.datasets.unshift(saved);
  showDatasetImmediately(saved);
  activateView("figure", "cyc");
  setStatus(text.saved);
}

function exportComparisonSvg() {
  const svg = $("comparisonFigure");
  if (!svg) return setStatus(savedFigText().exportMissing);
  download("cyc-comparison.svg", new XMLSerializer().serializeToString(svg), "image/svg+xml");
}

function exportComparisonPng() {
  const svg = $("comparisonFigure");
  if (!svg) return setStatus(savedFigText().exportMissing);
  svgToPngBlob(svg).then((blob) => {
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = "cyc-comparison.png";
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  }).catch((error) => setStatus(error.message || "PNG \uc0dd\uc131\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4."));
}
