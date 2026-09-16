"""Exercise real annotation handlers with isolated UI/state, no user data writes."""
from pathlib import Path
import re
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]


class MultipleAnnotationTests(unittest.TestCase):
    def run_js(self, assertions):
        source = (ROOT / "public/app.js").read_text(encoding="utf-8")
        names = ["clampFontSize", "currentAnnotations", "selectAnnotation",
                 "addOrUpdateAnnotation", "annotationSvg", "clearAnnotations"]
        helpers = "\n".join(re.search(r"^function " + name + r"\([^\n]*\).*?^}",
                             source, re.M | re.S).group() for name in names)
        setup = r"""
const assert=require('node:assert/strict');
const state={selectedId:'one',selectedAnnotation:null,annotations:{},datasets:[{id:'one'}]};
const controls={annotationText:{value:''},annotationSize:{value:13},
 addAnnotation:{textContent:'글 추가'},updateAnnotation:{hidden:true}};
const $=id=>controls[id];
const document={getElementById:()=>({viewBox:{baseVal:{width:1000,height:700}}}),querySelectorAll:()=>[]};
let saves=[];const saveFigureEdits=()=>saves.push(JSON.parse(JSON.stringify(currentAnnotations())));
const renderCurrent=()=>selectAnnotation(state.selectedAnnotation);
const setStatus=()=>{};
const escapeXml=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
"""
        result = subprocess.run(["node", "-"], input=setup + helpers + "\n" + assertions,
                                text=True, encoding="utf-8", capture_output=True, cwd=ROOT)
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_repeated_add_keeps_previous_text_and_separate_positions(self):
        self.run_js("""
for(const text of ['0.1C','0.2C','0.5C']) {controls.annotationText.value=text;addOrUpdateAnnotation(true);}
assert.deepEqual(currentAnnotations().map(a=>a.text),['0.1C','0.2C','0.5C']);
assert.equal(new Set(currentAnnotations().map(a=>`${a.x},${a.y}`)).size,3);
assert.equal(controls.addAnnotation.textContent,'글 추가');
assert.equal(saves.at(-1).length,3);
""")

    def test_explicit_update_only_changes_selected_annotation(self):
        self.run_js("""
state.annotations.one=[{text:'first',x:50,y:60,size:13},{text:'second',x:90,y:80,size:13}];
selectAnnotation(0);controls.annotationText.value='edited';addOrUpdateAnnotation();
assert.deepEqual(currentAnnotations().map(a=>a.text),['edited','second']);
assert.equal(currentAnnotations()[0].x,50);
assert.equal(controls.updateAnnotation.hidden,false);
""")

    def test_empty_text_noop_and_added_markup_escaped(self):
        self.run_js("""
controls.annotationText.value=' ';addOrUpdateAnnotation(true);assert.equal(saves.length,0);
controls.annotationText.value='<script>alert(1)</script>';addOrUpdateAnnotation(true);
assert.ok(!annotationSvg().includes('<script>'));
assert.ok(annotationSvg().includes('&lt;script&gt;'));
""")

    def test_clear_hides_edit_control_and_other_dataset_is_preserved(self):
        self.run_js("""
state.annotations.other=[{text:'keep'}];controls.annotationText.value='first';addOrUpdateAnnotation(true);
clearAnnotations();assert.deepEqual(currentAnnotations(),[]);
assert.equal(controls.updateAnnotation.hidden,true);assert.equal(state.annotations.other[0].text,'keep');
""")

    def test_button_and_enter_are_append_actions(self):
        source = (ROOT / "public/app.js").read_text(encoding="utf-8")
        self.assertTrue(re.search(r'on\("addAnnotation", "click", \(\) => addOrUpdateAnnotation\(true\)\)', source))
        self.assertTrue(re.search(r'on\("updateAnnotation", "click", \(\) => addOrUpdateAnnotation\(\)\)', source))
        self.assertTrue(re.search(r'event.key === "Enter" && !event.isComposing', source))
        html = (ROOT / "public/index.html").read_text(encoding="utf-8")
        self.assertIn('id="updateAnnotation"', html)

    def test_rapid_saves_keep_all_annotations_in_ui_dataset_and_figure(self):
        source = (ROOT / "public/app.js").read_text(encoding="utf-8")
        helpers = "\n".join(m.group() for m in re.finditer(
            r'^async function (?:saveFigureEdits|persistFigureEdits)\([^\n]*\).*?^}', source, re.M | re.S))
        script = """
const assert=require('node:assert/strict');
const state={selectedId:'one',datasets:[{id:'one',cellRecordId:'cell'}],filtered:[],
 annotations:{one:[]},figureStyles:{one:{}}};
const currentAnnotations=()=>state.annotations.one;
const currentLayoutEdits=()=>({});const currentFigureStyle=()=>state.figureStyles.one;
const normalizeHexColor=x=>x;const normalizeProfileSeriesColorOverrides=x=>x;
const normalizeFigureAspectRatio=x=>x;const normalizeFigureMarkerSize=x=>x;
const normalizeFigureAxisRanges=x=>x;const sampleLabel=()=>'';
const authHeaders=x=>x;const loadCellWorkspace=()=>{};const setStatus=()=>{};
let patches=[], figures=[], pending=[], stored;
const fetch=async(url,opts)=>{
 const body=JSON.parse(opts.body);
 if(opts.method==='PATCH'){
   patches.push(body.figureEdits);
   await new Promise(resolve=>pending.push(resolve));
   stored={id:'one',figureEdits:body.figureEdits};
   return {ok:true,json:async()=>stored};
 }
 figures.push(body.edits);return {ok:true,json:async()=>({})};
};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
"""
        assertions = """
(async()=>{
state.annotations.one.push({text:'first'});const a=saveFigureEdits();await tick();
state.annotations.one.push({text:'second'});const b=saveFigureEdits();await tick();
assert.equal(patches.length,1,'writes for the same figure must be ordered');
pending.shift()();await a;await tick();
assert.equal(state.annotations.one.length,2,'old response must not discard newer text');
assert.equal(patches.length,2);
pending.shift()();await b;
assert.deepEqual(stored.figureEdits.annotations.map(a=>a.text),['first','second']);
assert.equal(figures.at(-1).annotations.length,2);
assert.equal(state.annotations.one.length,2);
})().catch(e=>{console.error(e);process.exitCode=1;});
"""
        result = subprocess.run(["node", "-"], input=script+helpers+assertions,
                                text=True, encoding="utf-8", capture_output=True, cwd=ROOT)
        self.assertEqual(result.returncode, 0, result.stderr)


if __name__ == "__main__":
    unittest.main()
