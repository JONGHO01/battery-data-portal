import json
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class DrtUiTests(unittest.TestCase):
    def test_file_change_discards_inflight_result_and_missing_frequency_does_not_post(self):
        self.js('''
const nodes={}; let fileChanged, resolveRequest, requests=0;
const values={M:{value:100},lambda:{value:.001},includeL:{checked:true,style:{}},mode:{value:'manual'},lambdaSlider:{value:-3}};
values[Symbol.iterator]=function*(){yield* Object.values(this);};
const form={elements:values,style:{},addEventListener(){}};
const status={textContent:''},details={replaceChildren(){this.innerHTML='';}},plot={innerHTML:''};
const controls={innerHTML:'',querySelector(s){return s==='form'?form:s==='[data-drt-status]'?status:details;}};
nodes.figureCanvas={contains:n=>n===controls,querySelector:s=>s==='[data-eis-plot]'?plot:controls};
for(const id of ['figureTitle','figureSubtitle','metaGrid'])nodes[id]={};
nodes.smartFile={addEventListener(name,callback){fileChanged=callback;}};
global.$=id=>nodes[id];global.currentFigureStyle=()=>({});global.syncFigureControls=()=>{};
global.figureSvgSize=()=>({w:1100,h:720});global.figureDatasetLabel=()=> 'test';
global.normalizeHexColor=()=> '#14888a';global.cleanNyquistBounds=()=>({x:[0,10],y:[-5,5]});
global.resolveFigureAxisDomains=(x,y)=>({x,y});global.applyAnnotationsToSvg=()=>{};
global.authHeaders=x=>x;global.apiErrorMessage=()=> 'controlled failure';
global.fetchJsonWithTimeout=()=>{requests++;return new Promise(resolve=>resolveRequest=resolve);};
async function check(){
 drt.render({rows:[{zreal:5,zimag:-2}]});
 await form.onsubmit({preventDefault(){}});
 assert.equal(requests,0);assert.equal(status.textContent,'DRT 계산에는 frequency, Re(Z), Im(Z)가 필요합니다.');
 const rows=[1,10,100].map(frequency=>({frequency,zreal:5,zimag:-2}));
 drt.render({rows});const pending=form.onsubmit({preventDefault(){}});
 assert.equal(requests,1);fileChanged();
 resolveRequest({res:{ok:true},body:{result:{reconstruction:[]}}});await pending;
 assert.match(status.textContent,/선택 파일이 변경/);assert.doesNotMatch(plot.innerHTML,/class="eis-drt-fit"/);
 assert.equal(details.innerHTML,'');assert.ok(values.M.disabled);
 drt.render({rows:[...rows]});const failed=form.onsubmit({preventDefault(){}});
 resolveRequest({res:{ok:false},body:{}});await failed;
 assert.equal(status.textContent,'controlled failure');assert.equal(values.M.disabled,false);
}
check().catch(e=>{console.error(e);process.exitCode=1;});
''')

    def js(self, body):
        script = "const assert=require('node:assert/strict'); const drt=require('./public/eis-drt.js');\n" + body
        p = subprocess.run(["node","-"],input=script,text=True,encoding="utf-8",capture_output=True,cwd=ROOT)
        self.assertEqual(p.returncode,0,p.stderr)

    def test_signed_coordinates_headers_and_missing_frequency(self):
        self.js('''
for (const [key,value] of [["Im(Z)",-2],["-Im(Z)",2],["Z''",-2],["-Z''",2]]) {
 const rows=[{frequency:10,"Re(Z)":5,[key]:value}]; const old=JSON.stringify(rows);
 const p=drt.normalizeRows(rows)[0]; assert.equal(p.z_imag_ohm,-2);
 const plots=drt.coordinates([p]); assert.equal(plots.left[0].y,2); assert.equal(plots.right[0].y,-2);
 assert.equal(JSON.stringify(rows),old);
}
const legacy={frequency:10,z_real_ohm:5,z_imag_ohm:2,_raw:{"-Im(Z)":2}};
assert.equal(drt.normalizeRows([legacy])[0].z_imag_ohm,-2);
assert.equal(drt.normalizeRows([{...legacy,z_imag_ohm:-2}])[0].z_imag_ohm,-2);
const points=drt.normalizeRows([{zreal:5,zimag:-2}]);
assert.equal(drt.coordinates(points).left.length,1); assert.equal(points[0].frequency_Hz,null);
''')

    def test_sweep_order_tooltips_three_panel_export(self):
        self.js('''
const p=drt.normalizeRows([{frequency:10,zreal:5,zimag:-2},{frequency:100,zreal:4,zimag:1}]);
assert.deepEqual(p.map(x=>x.frequency_Hz),[10,100]);
const svg=drt.svg(p,null,{w:1100,h:720,color:'#14888a',title:'<sample>',date:''});
assert.match(svg,/Nyquist — Im\\(Z\\)/); assert.match(svg,/DRT — nonnegative RC model/);
assert.doesNotMatch(svg,/Bode magnitude|Bode phase|NaN|Infinity/);
assert.match(svg,/frequency_Hz: 10/); assert.match(svg,/Re\\(Z\\): 5/); assert.match(svg,/Im\\(Z\\): -2/);
assert.match(svg,/HF start/); assert.match(svg,/&lt;sample&gt;/); assert.match(svg,/id="paperFigure"/);
''')

    def test_existing_eis_style_controls_are_respected(self):
        self.js('''
const points=drt.normalizeRows([{frequency:10,zreal:5,zimag:-2},{frequency:100,zreal:4,zimag:1}]);
const svg=drt.svg(points,null,{w:1100,h:720,title:'style',date:'',showGrid:false,connectPoints:false,markerSize:6});
assert.doesNotMatch(svg,/class="eis-drt-measured-line"/);
assert.doesNotMatch(svg,/stroke-dasharray="2 6"/);
assert.match(svg,/r="6" fill="white"/);
''')

    def test_integral_csv_and_stale_result_rejected(self):
        self.js('''
assert.ok(Math.abs(drt.integrate([1,Math.E,Math.exp(2)],[2,3,4],Math.exp(.2),Math.exp(1.7))-4.425)<1e-10);
const result={reconstruction:[{frequency_Hz:10,z_real_raw_ohm:5,z_imag_raw_ohm:-2}]};
assert.ok(drt.matches(result,drt.normalizeRows([{frequency:10,zreal:5,zimag:-2}])));
assert.ok(!drt.matches(result,drt.normalizeRows([{frequency:10,zreal:6,zimag:-2}])));
assert.equal(drt.csv(['tau_s','gamma_ohm'],[{tau_s:1,gamma_ohm:2}]),'tau_s,gamma_ohm\\r\\n1,2');
''')
