"""Run the real upload confirmation helper without touching user files."""
from pathlib import Path
import re
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]


class ImportConfirmationUiTests(unittest.TestCase):
    def run_js(self, assertions):
        source = (ROOT / "public/app.js").read_text(encoding="utf-8")
        match = re.search(r"^async function postDatasetImport\([^\n]*\).*?^}", source, re.M | re.S)
        self.assertIsNotNone(match, "Missing import confirmation helper")
        script = """
const assert = require('node:assert/strict');
const state = {datasets:[{id:'old'},{id:'other'}],filtered:[{id:'old'},{id:'other'}],
 compareIds:['old','other'],annotations:{old:['test'],other:['kept']}};
const authHeaders = x => x;
const conflicts = [{id:'old',sourceName:'same.csv',updatedAt:'revision'}];
const duplicate = {res:{ok:false,status:409},body:{detail:{code:'duplicate_source_name',conflicts}}};
let calls=[], alerts=[], confirmed=false, message='';
const confirmImportReplacement=async text=>{message=text;return confirmed;};
let replies = [duplicate];
const fetchJsonWithTimeout = async (url,opts)=>{calls.push({url,payload:JSON.parse(opts.body)});return replies.shift();};
"""
        result = subprocess.run(["node", "-"], input=script + match.group() +
            "\n(async()=>{" + assertions + "})().catch(e=>{console.error(e);process.exitCode=1;});",
            text=True, encoding="utf-8", capture_output=True, cwd=ROOT)
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_cancel_does_not_send_deletion_or_second_save(self):
        self.run_js("""
const result=await postDatasetImport({sourceName:'same.csv'});
assert.equal(result.res.ok,false);
assert.equal(calls.length,1);
assert.deepEqual(state.datasets.map(x=>x.id),['old','other']);
assert.ok(message.includes('same.csv'));
""")

    def test_confirm_sends_exact_targets_and_updates_lists(self):
        self.run_js("""
confirmed=true;
replies.push({res:{ok:true,status:201},body:{dataset:{id:'new'},deletedIds:['old'],deleteFailures:[]}});
const result=await postDatasetImport({sourceName:'same.csv'});
assert.equal(result.body.id,'new');
assert.deepEqual(calls[1].payload.replaceExisting,conflicts);
assert.deepEqual(state.datasets.map(x=>x.id),['other']);
assert.deepEqual(state.filtered.map(x=>x.id),['other']);
assert.deepEqual(state.compareIds,['other']);
assert.equal(state.annotations.old,undefined);
assert.deepEqual(state.annotations.other,['kept']);
""")

    def test_partial_deletion_is_not_presented_as_complete(self):
        self.run_js("""
confirmed=true;
replies.push({res:{ok:true,status:201},body:{dataset:{id:'new'},deletedIds:[],deleteFailures:['old']}});
const result=await postDatasetImport({sourceName:'same.csv'});
assert.ok(result.body.replacementWarning);
assert.equal(state.datasets.length,2);
""")

    def test_missing_new_endpoint_does_not_fallback_to_unsafe_old_save(self):
        self.run_js("""
replies=[{res:{ok:false,status:404},body:{detail:'Not Found'}}];
const result=await postDatasetImport({sourceName:'same.csv'});
assert.equal(result.res.ok,false);
assert.equal(calls.length,1);
assert.ok(result.body.detail.includes('재시작'));
""")
