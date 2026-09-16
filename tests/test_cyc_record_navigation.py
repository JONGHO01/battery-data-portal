"""Execute the actual browser navigation helpers with Node."""
from pathlib import Path
import re
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]


class CycRecordNavigationTests(unittest.TestCase):
    def run_js(self, script):
        source = (ROOT / "public/app.js").read_text(encoding="utf-8")
        names = ["normalizeSavedFigureDateToken", "savedFigureSourceDateKey",
                 "savedFigureDateKey", "cycRecordNavigation"]
        functions = []
        for name in names:
            match = re.search(r"^function " + name + r"\([^\n]*\).*?^}", source, re.M | re.S)
            self.assertIsNotNone(match, f"Missing function {name}")
            functions.append(match.group())
        result = subprocess.run(["node", "-"], input="\n".join(functions) + "\n" + script,
                                text=True, capture_output=True, cwd=ROOT)
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_gallery_order_and_endpoints_without_mutating_data(self):
        self.run_js("""
const assert = require('node:assert/strict');
const rows = [
 {id:'old', dataType:'cyc', cell:{date:'2026-07-20'}},
 {id:'unknown', dataType:'cyc'},
 {id:'first', dataType:'CYC', sourceName:'260911_first.wrd'},
 {id:'eis', dataType:'eis', cell:{date:'2026-09-16'}},
 {id:'second', dataType:'cyc', sourceName:'260911_second.wrd'},
];
const before = JSON.stringify(rows);
assert.deepEqual(cycRecordNavigation(rows,'first'), {index:0,total:4,previousId:null,nextId:'second'});
assert.deepEqual(cycRecordNavigation(rows,'second'), {index:1,total:4,previousId:'first',nextId:'old'});
assert.deepEqual(cycRecordNavigation(rows,'unknown'), {index:3,total:4,previousId:'old',nextId:null});
assert.equal(JSON.stringify(rows),before);
""")

    def test_empty_single_and_filtered_selection_do_not_wrap(self):
        self.run_js("""
const assert = require('node:assert/strict');
assert.deepEqual(cycRecordNavigation([], 'x'), {index:-1,total:0,previousId:null,nextId:null});
const rows = [{id:'only',dataType:'cyc'}];
assert.deepEqual(cycRecordNavigation(rows,'only'), {index:0,total:1,previousId:null,nextId:null});
assert.deepEqual(cycRecordNavigation(rows,'excluded'), {index:-1,total:1,previousId:null,nextId:null});
""")

    def test_record_binds_navigation_and_guards_late_hydration(self):
        source = (ROOT / "public/app.js").read_text(encoding="utf-8")
        body = re.search(r"^async function renderCycRecordView\(\).*?^}", source, re.M | re.S).group()
        self.assertIn('cycRecordNavigation(state.filtered, selectedId)', body)
        self.assertIn('data-cyc-record-step="previous"', body)
        self.assertIn('data-cyc-record-step="next"', body)
        self.assertIn('state.selectedId !== selectedId', body)
        self.assertIn('classList.contains("active")', body)
        self.assertIn('state.selectedId = targetId', body)

