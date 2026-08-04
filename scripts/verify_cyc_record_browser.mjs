/*
 * Browser smoke test for the saved CYC integrated-record workspace.
 *
 * Run after verify_large_cyc_browser.mjs against the same disposable server.
 * The check opens an existing saved CYC record, presses its "integrated" button,
 * and verifies that performance, voltage/current, and dQ/dV charts appear.
 */
const portalUrl = (process.env.PORTAL_URL || "http://127.0.0.1:4196").replace(/\/$/, "");
const cdpUrl = (process.env.CHROME_CDP || "http://127.0.0.1:9226").replace(/\/$/, "");

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response.json();
}

function connect(wsUrl) {
  const socket = new WebSocket(wsUrl);
  let nextId = 1;
  const pending = new Map();
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    const item = pending.get(message.id);
    if (!item) return;
    pending.delete(message.id);
    if (message.error) item.reject(new Error(message.error.message));
    else item.resolve(message.result || {});
  });
  const ready = new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", () => reject(new Error("Chrome DevTools connection failed.")), { once: true });
  });
  return {
    ready,
    call(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = nextId++;
        pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
    close() { socket.close(); },
  };
}

async function main() {
  const tabs = await fetchJson(`${cdpUrl}/json`);
  const tab = tabs.find((item) => item.url === `${portalUrl}/`);
  if (!tab) throw new Error(`No Chrome tab is open for ${portalUrl}.`);

  const devtools = connect(tab.webSocketDebuggerUrl);
  await devtools.ready;
  await devtools.call("Runtime.enable");
  const evaluate = async (expression) => {
    const result = await devtools.call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) {
      const detail = result.exceptionDetails.exception?.description || result.exceptionDetails.text || "browser evaluation failed";
      throw new Error(detail);
    }
    return result.result?.value;
  };

  const opened = await evaluate(`(() => {
    const button = document.querySelector(".savedRecordOpen");
    if (!button) return { error: "No saved CYC integrated-record button is available." };
    button.click();
    return { opened: true };
  })()`);
  if (opened.error) throw new Error(opened.error);

  const timeoutAt = Date.now() + 30000;
  let snapshot = null;
  while (Date.now() < timeoutAt) {
    snapshot = await evaluate(`(() => ({
      active: document.querySelector("#cycRecordView")?.classList.contains("active"),
      title: document.querySelector(".cycRecordHero h2")?.textContent || "",
      charts: document.querySelectorAll("#cycRecordContent svg").length,
      text: document.querySelector("#cycRecordContent")?.innerText || ""
    }))()`);
    if (snapshot.active && snapshot.charts >= 3) break;
    await sleep(250);
  }

  if (!snapshot?.active || snapshot.charts < 3) {
    throw new Error(`Integrated CYC record did not render three charts: ${JSON.stringify(snapshot)}`);
  }
  const structure = await evaluate(`(() => ({
    electrode: document.querySelectorAll("#cycRecordContent .cycRecordElectrode").length,
    rawPreview: document.querySelectorAll("#cycRecordContent .cycRecordRaw").length,
    chartCards: document.querySelectorAll("#cycRecordContent .cycRecordChart").length
  }))()`);
  if (structure.electrode !== 1 || structure.rawPreview !== 1 || structure.chartCards !== 3) {
    throw new Error(`Integrated CYC record structure is incomplete: ${JSON.stringify(structure)}`);
  }

  console.log(JSON.stringify({ title: snapshot.title, charts: snapshot.charts, structure }, null, 2));
  devtools.close();
}

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
