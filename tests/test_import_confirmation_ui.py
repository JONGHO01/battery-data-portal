"""Run the real upload confirmation helper without touching user files."""
from pathlib import Path
import asyncio
import json
import re
import subprocess
import unittest
import python_backend as p

ROOT = Path(__file__).resolve().parents[1]


def duplicate_response_body():
    """Use the portal's actual HTTP exception serializer, not FastAPI defaults."""
    response = asyncio.run(p.http_exception_handler(None, p.HTTPException(409, {
        "code": "duplicate_source_name",
        "conflicts": [{"id": "old", "sourceName": "same.csv", "updatedAt": "revision"}],
    })))
    return json.loads(response.body)


class ImportConfirmationUiTests(unittest.TestCase):
    def run_js(self, assertions):
        source = (ROOT / "public/app.js").read_text(encoding="utf-8")
        match = re.search(r"^async function postDatasetImport\([^\n]*\).*?^}", source, re.M | re.S)
        self.assertIsNotNone(match, "Missing import confirmation helper")
        error_helper = re.search(r"^function apiErrorMessage\([^\n]*\).*?^}", source, re.M | re.S).group()
        script = """
const assert = require('node:assert/strict');
const state = {datasets:[{id:'old'},{id:'other'}],filtered:[{id:'old'},{id:'other'}],
 compareIds:['old','other'],annotations:{old:['test'],other:['kept']}};
const authHeaders = x => x;
const conflicts = [{id:'old',sourceName:'same.csv',updatedAt:'revision'}];
const duplicate = {res:{ok:false,status:409},body:RESPONSE_BODY};
let calls=[], alerts=[], confirmed=false, message='';
const confirmImportReplacement=async text=>{message=text;return confirmed;};
let replies = [duplicate];
const fetchJsonWithTimeout = async (url,opts)=>{calls.push({url,payload:JSON.parse(opts.body)});return replies.shift();};
"""
        script = script.replace("RESPONSE_BODY", json.dumps(duplicate_response_body()))
        result = subprocess.run(["node", "-"], input=script + error_helper + match.group() +
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

    def test_standard_detail_shape_still_requests_confirmation(self):
        self.run_js("""
replies=[{res:{ok:false,status:409},body:{detail:{code:'duplicate_source_name',conflicts}}}];
await postDatasetImport({sourceName:'same.csv'});
assert.ok(message.includes('same.csv'));assert.equal(calls.length,1);
""")

    def test_changed_conflicts_do_not_automatically_retry_deletion(self):
        self.run_js("""
confirmed=true;replies.push(duplicate);
const result=await postDatasetImport({sourceName:'same.csv'});
assert.equal(calls.length,2);assert.equal(result.res.ok,false);
assert.ok(apiErrorMessage(result.body,'fallback').includes('변경'));
assert.deepEqual(state.datasets.map(x=>x.id),['old','other']);
""")

    def test_object_errors_have_readable_message_or_safe_fallback(self):
        self.run_js("""
assert.equal(apiErrorMessage({error:{message:'  저장 실패  '}},'fallback'),'저장 실패');
assert.equal(apiErrorMessage({error:{code:'unknown',conflicts}},'fallback'),'fallback');
assert.equal(apiErrorMessage({detail:[{msg:'invalid'}]},'fallback'),'fallback');
assert.equal(apiErrorMessage({error:'Internal Server Error'},'fallback'),'fallback');
assert.equal(apiErrorMessage({detail:'일반 오류'},'fallback'),'일반 오류');
""")

    def test_malformed_conflicts_never_request_replacement(self):
        self.run_js("""
confirmed=true;
for(const conflicts of [[],[null],[{id:'old'}]]){
 replies=[{res:{ok:false,status:409},body:{error:{code:'duplicate_source_name',conflicts}}}];
 const result=await postDatasetImport({sourceName:'same.csv'});
 assert.equal(result.res.ok,false);
}
assert.equal(calls.length,3);assert.equal(message,'');
assert.deepEqual(state.datasets.map(x=>x.id),['old','other']);
""")
