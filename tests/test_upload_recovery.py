"""Regression coverage for disconnected uploads and blocking inspection work."""
import re
import subprocess
import threading
import unittest
from pathlib import Path
from unittest.mock import AsyncMock, patch

ROOT = Path(__file__).resolve().parents[1]


class UploadRecoveryUiTests(unittest.TestCase):
    def run_js(self, assertions):
        source = (ROOT / "public/app.js").read_text(encoding="utf-8")
        functions = []
        for name in ("fetchJsonWithTimeout", "uploadFailureMessage", "inspectFileUpload", "inspectSelectedFile", "renderAnalysis", "setAnalysisMessage"):
            match = re.search(r"^(?:async )?function " + name + r"\([^\n]*\).*?^}", source, re.M | re.S)
            if match:
                functions.append(match.group())
        script = r'''
const assert = require('node:assert/strict');
const FILE_INSPECT_TIMEOUT_MS = 1000;
function node() {return {disabled:false,textContent:'',innerHTML:'old EIS result',
 classList:{add(){},remove(){}},replaceChildren(){this.innerHTML='';},
 querySelector(){return null;},append(){},prepend(){}};}
const nodes = {analysisPanel:node(),createFigure:node(),inspectFile:node(),smartFile:node()};
const $ = id => nodes[id];
const document = {createElement:node};
const state = {analysis:{filename:'old.sde'},inspectToken:0};
const window = {location:{hostname:'127.0.0.1',port:'4196',origin:'http://127.0.0.1:4196'}};
const file = {name:'new.wrd'};
const selectedUploadFiles = () => [file];
const authHeaders = h => h;
const setStatus = () => {};
const setBusy = () => {};
const clearExpiredLogin = () => false;
const nextBrowserPaint = async () => {};
let calls=0;
'''
        result = subprocess.run(["node", "-"], input=script + '\n'.join(functions) +
                                '\n(async()=>{' + assertions + '})().catch(e=>{console.error(e);process.exitCode=1;});',
                                text=True, capture_output=True, cwd=ROOT)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_network_failure_clears_old_eis_preview_and_keeps_file_for_retry(self):
        self.run_js(r'''
fetch = async () => {calls++;throw new TypeError('Failed to fetch');};
await inspectSelectedFile();
assert.equal(state.analysis,null);
assert.equal(nodes.analysisPanel.innerHTML,'');
assert.equal(nodes.smartFile.disabled,false);
assert.equal(nodes.inspectFile.disabled,false);
assert.equal(selectedUploadFiles()[0],file);
assert.equal(calls,1,'Do not automatically replay an upload POST');
''')

    def test_http_failure_clears_previous_analysis(self):
        self.run_js(r'''
fetch = async () => ({ok:false,status:413,text:async()=>JSON.stringify({detail:'File too large'})});
await inspectSelectedFile();
assert.equal(state.analysis,null);
assert.equal(nodes.analysisPanel.innerHTML,'');
''')

    def test_disconnected_local_server_message_points_to_correct_port(self):
        self.run_js(r'''
fetch = async () => {throw new TypeError('Failed to fetch');};
await assert.rejects(inspectFileUpload(file), e => e.message.includes('4174') && !e.message.includes('Failed to fetch'));
window.location = {hostname:'portal.example',port:'',origin:'https://portal.example'};
await assert.rejects(inspectFileUpload(file), e => !e.message.includes('4174') && !e.message.includes('Failed to fetch'));
''')

    def test_second_click_does_not_send_a_duplicate_upload(self):
        self.run_js(r'''
let rejectRequest;
fetch = () => {calls++;return new Promise((resolve,reject)=>{rejectRequest=reject;});};
const first = inspectSelectedFile();
assert.equal(nodes.smartFile.disabled,true);
const second = inspectSelectedFile();
assert.equal(calls,1);
rejectRequest(new TypeError('Failed to fetch'));
await Promise.all([first,second]);
assert.equal(nodes.smartFile.disabled,false);
''')


class UploadResponsivenessTests(unittest.IsolatedAsyncioTestCase):
    async def test_synchronous_parser_does_not_block_event_loop(self):
        import python_backend as portal
        loop_thread = threading.get_ident()
        worker_threads = []

        def inspect(*args, **kwargs):
            worker_threads.append(threading.get_ident())
            return {'detection': {'type': 'cyc'}, 'rows': []}

        with patch.object(portal, 'stage_request_upload', AsyncMock(return_value=(Path('test.wrd'), None, 1, 'hash'))), \
             patch.object(portal, 'inspect_staged_file', side_effect=inspect):
            result = await portal.inspect_upload(object(), x_filename='test.wrd', user={'id':'test'})
        self.assertEqual(result['detection']['type'], 'cyc')
        self.assertNotEqual(worker_threads, [loop_thread], 'Parsing inside the event loop stalls uploads and health checks')
