/*
 * Browser-level smoke test for a large CYC upload.
 *
 * This script uses a disposable local server and a disposable Chrome profile.
 * It does not write to the user's normal portal database or browser profile.
 * Required environment variables:
 *   PORTAL_URL     e.g. http://127.0.0.1:4194
 *   E2E_CYC_FILE   absolute path of the CYC/WRD source file
 * Optional:
 *   CHROME_CDP     Chrome DevTools endpoint (default http://127.0.0.1:9225)
 *   E2E_USER / E2E_PASSWORD  disposable bootstrap credentials
 *   SCREENSHOT_PATH
 */
import fs from "node:fs";
import path from "node:path";

const portalUrl = (process.env.PORTAL_URL || "http://127.0.0.1:4194").replace(/\/$/, "");
const cdpUrl = (process.env.CHROME_CDP || "http://127.0.0.1:9225").replace(/\/$/, "");
const sourceFile = process.env.E2E_CYC_FILE;
const userId = process.env.E2E_USER || "browser_e2e_admin";
const password = process.env.E2E_PASSWORD || "browser-e2e-only-password";
const screenshotPath = process.env.SCREENSHOT_PATH || path.resolve("tmp-browser-e2e-cyc.png");

if (!sourceFile || !fs.existsSync(sourceFile)) {
  throw new Error("E2E_CYC_FILE must point to an existing CYC/WRD source file.");
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response.json();
}

async function waitFor(check, label, timeoutMs = 120000) {
  const until = Date.now() + timeoutMs;
  let lastError = "";
  while (Date.now() < until) {
    try {
      const value = await check();
      if (value) return value;
    } catch (error) {
      lastError = error?.message || String(error);
    }
    await sleep(250);
  }
  throw new Error(`Timed out waiting for ${label}${lastError ? `: ${lastError}` : ""}`);
}

function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let nextId = 1;
  const pending = new Map();
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    const item = pending.get(message.id);
    if (!item) return;
    pending.delete(message.id);
    if (message.error) item.reject(new Error(message.error.message));
    else item.resolve(message.result || {});
  });
  const ready = new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", () => reject(new Error("Chrome DevTools connection failed.")), { once: true });
  });
  return {
    ready,
    call(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = nextId++;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    },
    close() { ws.close(); },
  };
}

async function main() {
  await fetchJson(`${portalUrl}/api/health`);
  const tab = await fetchJson(`${cdpUrl}/json/new?${encodeURIComponent(portalUrl)}`, { method: "PUT" });
  const devtools = connect(tab.webSocketDebuggerUrl);
  await devtools.ready;
  await devtools.call("Page.enable");
  await devtools.call("Runtime.enable");
  await devtools.call("DOM.enable");
  await devtools.call("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });

  const evaluate = async (expression) => {
    const result = await devtools.call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) {
      const detail = result.exceptionDetails.exception?.description || result.exceptionDetails.text || "browser evaluation failed";
      throw new Error(detail);
    }
    return result.result?.value;
  };
  const pageText = () => evaluate("document.body.innerText");

  await waitFor(() => evaluate("document.readyState === 'complete' && !!document.querySelector('#loginForm')"), "login page");
  await evaluate(`document.querySelector('#loginId').value = ${JSON.stringify(userId)}; document.querySelector('#loginPassword').value = ${JSON.stringify(password)}; document.querySelector('#loginForm').requestSubmit();`);
  await waitFor(() => evaluate("document.querySelector('#loginScreen')?.classList.contains('hidden')"), "login", 30000);

  async function selectSourceFile() {
    const documentRoot = await devtools.call("DOM.getDocument", { depth: 1 });
    const query = await devtools.call("DOM.querySelector", { nodeId: documentRoot.root.nodeId, selector: "#smartFile" });
    if (!query.nodeId) throw new Error("The upload file picker was not found.");
    await devtools.call("DOM.setFileInputFiles", { nodeId: query.nodeId, files: [sourceFile] });
  }

  async function inspectAndCreate(kind, expectedText) {
    await selectSourceFile();
    await evaluate("document.querySelector('#inspectFile').click()");
    await waitFor(async () => {
      const text = await pageText();
      const ready = await evaluate("!!document.querySelector(\"input[name='figureKind']\") && document.querySelector('#busyOverlay')?.classList.contains('hidden')");
      return text.includes("CYC") && ready;
    }, `CYC inspection for ${kind}`);
    const figureSelector = `input[name="figureKind"][value="${kind}"]`;
    await evaluate(`(() => { const option = document.querySelector(${JSON.stringify(figureSelector)}); if (!option || option.disabled) throw new Error('Requested Fig choice is unavailable: ${kind}'); option.checked = true; option.dispatchEvent(new Event('change', { bubbles: true })); document.querySelector('#createFigure').click(); })()`);
    await waitFor(async () => {
      const text = await pageText();
      const rendered = await evaluate("(() => { const svg = document.querySelector('#paperFigure'); return !!svg && svg.outerHTML.length > 3000 && document.querySelector('#busyOverlay')?.classList.contains('hidden'); })()");
      return rendered && text.includes(expectedText);
    }, `${kind} Fig rendering`, 120000);
    const snapshot = await evaluate(`(() => { const svg = document.querySelector('#paperFigure'); return { title: document.querySelector('#figureTitle')?.textContent || '', subtitle: document.querySelector('#figureSubtitle')?.textContent || '', svgLength: svg?.outerHTML.length || 0, hasPath: svg?.querySelectorAll('path').length || 0, hasCircle: svg?.querySelectorAll('circle').length || 0 }; })()`);
    if (!snapshot.hasPath || !snapshot.hasCircle) throw new Error(`${kind} Fig did not contain plotted paths and points.`);
    return snapshot;
  }

  const results = {};
  results.performance = await inspectAndCreate("cycling-performance", "CYC");
  results.voltageProfile = await inspectAndCreate("voltage-profile", "Voltage");
  results.dqdv = await inspectAndCreate("dqdv", "dQ/dV");

  const shot = await devtools.call("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
  fs.writeFileSync(screenshotPath, Buffer.from(shot.data, "base64"));
  devtools.close();
  console.log(JSON.stringify({ sourceFile, screenshotPath, results }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
