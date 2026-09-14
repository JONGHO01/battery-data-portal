import json
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class DrtUiTests(unittest.TestCase):
    def test_candidate_bands_follow_measurement_and_peaks_without_assigning_physics(self):
        self.js(r'''
const points=drt.normalizeRows([1e5,1e2,.1].map(frequency=>({frequency,zreal:5,zimag:-2})));
const bounds=drt.tauBounds(points), before=JSON.stringify(points);
const peaks=[{Peak:'P1',tau_peak:.0001},{Peak:'P2',tau_peak:.01},{Peak:'P3',tau_peak:.5}];
const guide=drt.interpretationBands(points,peaks),empty=drt.interpretationBands(points,[]);
assert.equal(guide.length,3);assert.equal(guide[0].min,bounds.data[0]);assert.equal(guide[2].max,bounds.data[1]);
assert.equal(guide[0].max,guide[1].min);assert.equal(guide[1].max,guide[2].min);
assert.notEqual(guide[0].max,empty[0].max);
assert.deepEqual(drt.interpretationBands([],peaks),[]);
const shifted=drt.normalizeRows([1e6,1e3,1].map(frequency=>({frequency,zreal:5,zimag:-2})));
const moved=drt.interpretationBands(shifted,peaks.map(p=>({...p,tau_peak:p.tau_peak/10})));
assert.ok(Math.abs(moved[0].max/guide[0].max-.1)<1e-10);
assert.equal(JSON.stringify(points),before);
const result={drt:[{tau_s:.0001,gamma_ohm:3},{tau_s:.01,gamma_ohm:5},{tau_s:.5,gamma_ohm:2}],peaks,metadata:{measuredTimeBand:bounds.data}};
const svg=drt.svg(points,result,{w:1100,h:850,title:'test',date:''});
assert.match(svg,/data-drt-guide/);assert.match(svg,/해석 후보/);
assert.match(svg,/>P1</);assert.doesNotMatch(svg,/→ R_SEI/);
assert.match(drt.svg(points,result,{w:1100,h:850,title:'test',date:'',assignments:{P1:'R_SEI'}}),/P1 → R_SEI/);
''')

    def test_manual_assignments_are_allowlisted_and_bound_to_dataset_run_and_peaks(self):
        self.js(r'''
const result={metadata:{spectrumIndex:0},peaks:[{Peak:'P1',tau_peak:.01,f_peak:15.9,R_region:12}]};
const context=drt.assignmentContext('dataset-1','run-1',result);
assert.ok(context);assert.equal(drt.assignmentContext('dataset-1',null,result),null);
assert.deepEqual(drt.readAssignments(null,context,result.peaks),{});
const record={context,source:'user',values:{P1:'R_ct',P2:'R_SEI'}};
assert.deepEqual(drt.readAssignments(record,context,result.peaks),{P1:'R_ct'});
assert.deepEqual(drt.readAssignments({...record,source:'automatic'},context,result.peaks),{});
assert.deepEqual(drt.readAssignments({...record,values:{P1:'<script>bad</script>'}},context,result.peaks),{});
for(const other of [drt.assignmentContext('dataset-2','run-1',result),drt.assignmentContext('dataset-1','run-2',result),drt.assignmentContext('dataset-1','run-1',{...result,metadata:{spectrumIndex:1}})])
 assert.deepEqual(drt.readAssignments(record,other,result.peaks),{});
const restored=JSON.parse(JSON.stringify(record));assert.deepEqual(drt.readAssignments(restored,context,result.peaks),{P1:'R_ct'});
''')

    def test_assignment_ui_save_failure_restore_and_new_run_reset(self):
        self.js(r'''
const values={M:{value:100},lambda:{value:.001},includeL:{checked:true,style:{}},mode:{value:'manual'},lambdaSlider:{value:-3}};
values[Symbol.iterator]=function*(){yield* Object.values(this);};
const form={elements:values,style:{},addEventListener(){}},status={},plot={},select={dataset:{peak:'P1'},value:'Unassigned'},save={};
const details={replaceChildren(){this.innerHTML='';},prepend(){},querySelector:s=>s==='[data-save-assignments]'?save:{},querySelectorAll:s=>s==='[data-peak-assignment]'?[select]:[]};
const controls={insertAdjacentHTML(position,html){this.innerHTML=html+this.innerHTML;},querySelector:s=>s==='form'?form:s==='[data-drt-status]'?status:s==='[data-eis-spectrum]'?{}:details};
const nodes={figureCanvas:{contains:n=>n===controls,querySelector:s=>s==='[data-eis-plot]'?plot:controls},figureTitle:{},figureSubtitle:{},metaGrid:{}};
global.$=id=>nodes[id];global.currentFigureStyle=()=>({});global.syncFigureControls=()=>{};
global.figureSvgSize=()=>({w:1100,h:850});global.figureDatasetLabel=()=> 'test';
global.normalizeHexColor=()=> '#14888a';global.cleanNyquistBounds=()=>({x:[0,10],y:[-5,5]});
global.resolveFigureAxisDomains=(x,y)=>({x,y});global.applyAnnotationsToSvg=()=>{};
global.authHeaders=x=>x;global.apiErrorMessage=()=> 'save denied';global.document={createElement:()=>({})};
const rows=[1,10,100].map(frequency=>({frequency,zreal:5,zimag:-2}));
const result={metadata:{spectrumIndex:0,mode:'manual',lambda:.001,Rs:5,L:0,measuredTimeBand:[.001,.2]},
 reconstruction:drt.normalizeRows(rows).map(p=>({...p,z_real_raw_ohm:p.z_real_ohm,z_imag_raw_ohm:p.z_imag_ohm})),
 drt:[{tau_s:.001,gamma_ohm:1},{tau_s:.01,gamma_ohm:3},{tau_s:.2,gamma_ohm:1}],
 peaks:[{Peak:'P1',tau_peak:.01,f_peak:15.9,R_region:12}],warnings:[],quality:{},relative_complex_RMSE_percent:0};
let fail=true,payload,run='run-1';
global.fetchJsonWithTimeout=async(url,options)=>{
 if(options?.method==='PATCH'){payload=JSON.parse(options.body);return {res:{ok:!fail},body:fail?{}:{figureEdits:payload.figureEdits}};}
 return {res:{ok:true},body:[{id:run,analysisName:'eis-drt',result}]};
};
async function check(){
 const d={id:'dataset-1',rows,figureEdits:{style:{markerSize:8}}};drt.render(d);await new Promise(setImmediate);
 assert.match(details.innerHTML,/<th>Assignment<\/th>/);assert.match(details.innerHTML,/value="Unassigned" selected/);
 assert.match(controls.innerHTML,/High-frequency interfacial \/ film process/);
 select.value='R_ct';select.onchange();assert.match(plot.innerHTML,/P1 → R_ct/);
 await save.onclick();assert.match(details.innerHTML,/save denied/);assert.equal(d.figureEdits.eisDrtAssignments,undefined);
 fail=false;await save.onclick();assert.equal(payload.figureEdits.eisDrtAssignments.values.P1,'R_ct');
 assert.deepEqual(Object.keys(payload.figureEdits),['eisDrtAssignments']);assert.equal(d.figureEdits.style.markerSize,8);
 const restored=JSON.parse(JSON.stringify(d));drt.render(restored);await new Promise(setImmediate);
 assert.match(plot.innerHTML,/P1 → R_ct/);
 select.value='Unassigned';select.onchange();await save.onclick();assert.doesNotMatch(plot.innerHTML,/P1 →/);
 run='run-2';drt.render(JSON.parse(JSON.stringify(d)));await new Promise(setImmediate);
 assert.doesNotMatch(plot.innerHTML,/P1 →/);assert.match(details.innerHTML,/value="Unassigned" selected/);
}
check().catch(e=>{console.error(e);process.exitCode=1;});
''')

    def test_unique_ranges_initial_tau_and_analysis_panel_geometry(self):
        self.js(r'''
const rows=[100000,10,.1,.1,10,100000,1000,10,1].map(frequency=>({frequency,zreal:5,zimag:-2}));
const points=drt.normalizeRows(rows),before=JSON.stringify(points),ranges=drt.frequencyRanges(points);
assert.equal(ranges.length,2);assert.equal(ranges[0].label,'100 kHz – 0.1 Hz');
assert.deepEqual(ranges[0].indices,[0,1]);assert.equal(ranges[0].spectrumIndex,0);
assert.equal(JSON.stringify(points),before);
const selected=points.filter(p=>p.spectrumIndex===0),bounds=drt.tauBounds(selected);
assert.ok(Math.abs(bounds.grid[0]-.1/(2*Math.PI*100000))<1e-16);
assert.ok(Math.abs(bounds.grid[1]-10/(2*Math.PI*.1))<1e-12);
const svg=drt.svg(selected,null,{w:1100,h:850,title:'test',date:''});
assert.match(svg,/DRT 계산 전/);assert.match(svg,/Same EIS data, original imaginary sign/);
const panel=id=>svg.match(new RegExp('data-eis-panel="'+id+'"[^>]*'))[0];
assert.ok(Math.abs(Number(panel('drt').match(/data-x-min="([^"]+)/)[1])-Math.log10(bounds.grid[0]))<1e-10);
assert.doesNotMatch(svg.match(/data-eis-panel="drt"[\s\S]*?<\/g>/)[0],/eis-drt-measured-line/);
const widths=[...svg.matchAll(/data-plot-width="([^"]+)"/g)].map(m=>Number(m[1]));
assert.ok(Math.abs(widths[0]/widths[1]-55/45)<.01);
assert.ok(Number(panel('drt').match(/data-plot-height="([^"]+)/)[1])>=260);
const result={drt:[{tau_s:bounds.grid[0],gamma_ohm:4000},{tau_s:bounds.grid[1],gamma_ohm:20}],metadata:{measuredTimeBand:bounds.data}};
const fitted=drt.svg(selected,result,{w:1100,h:850,title:'test',date:''});
const axis=fitted.match(/data-eis-panel="drt"[^>]+/)[0];
assert.match(axis,/data-y-min="0"/);assert.ok(Number(axis.match(/data-y-max="([^"]+)/)[1])>4000);
''')

    def test_frequency_return_legs_and_explicit_sweeps_are_not_connected(self):
        self.js('''
const rows=[100,10,1,1,10,100,100,10,1].map((frequency,i)=>({frequency,zreal:i+1,zimag:-2,sweep:i<6?1:2}));
const before=JSON.stringify(rows),points=drt.normalizeRows(rows);
assert.deepEqual(points.map(p=>p.spectrumIndex),[0,0,0,1,1,1,2,2,2]);
assert.equal(JSON.stringify(rows),before);
const svg=drt.svg(points,null,{w:1100,h:720,title:'test',date:''});
const paths=[...svg.matchAll(/class="eis-drt-measured-line" d="([^"]+)"/g)];
assert.equal((paths[0][1].match(/M/g)||[]).length,3);
assert.deepEqual(drt.normalizeRows([100,10,1,10,100].map(frequency=>({frequency,zreal:1,zimag:-2}))).map(p=>p.spectrumIndex),[0,0,0,1,1]);
''')

    def test_file_change_discards_inflight_result_and_missing_frequency_does_not_post(self):
        self.js('''
const nodes={}; let fileChanged, resolveRequest, requests=0,lastOptions,supportsSelection=true;
const values={M:{value:100},lambda:{value:.001},includeL:{checked:true,style:{}},mode:{value:'manual'},lambdaSlider:{value:-3}};
values[Symbol.iterator]=function*(){yield* Object.values(this);};
const form={elements:values,style:{},addEventListener(){}};
const status={textContent:''},details={replaceChildren(){this.innerHTML='';}},plot={innerHTML:''};
const selector={value:'',disabled:false};
const controls={innerHTML:'',querySelector(s){return s==='form'?form:s==='[data-drt-status]'?status:s==='[data-eis-spectrum]'?selector:details;}};
nodes.figureCanvas={contains:n=>n===controls,querySelector:s=>s==='[data-eis-plot]'?plot:controls};
for(const id of ['figureTitle','figureSubtitle','metaGrid'])nodes[id]={};
nodes.smartFile={addEventListener(name,callback){fileChanged=callback;}};
global.$=id=>nodes[id];global.currentFigureStyle=()=>({});global.syncFigureControls=()=>{};
global.figureSvgSize=()=>({w:1100,h:720});global.figureDatasetLabel=()=> 'test';
global.normalizeHexColor=()=> '#14888a';global.cleanNyquistBounds=()=>({x:[0,10],y:[-5,5]});
global.resolveFigureAxisDomains=(x,y)=>({x,y});global.applyAnnotationsToSvg=()=>{};
global.authHeaders=x=>x;global.apiErrorMessage=()=> 'controlled failure';
global.fetchJsonWithTimeout=(url,options)=>{if(url==='/api/health')return Promise.resolve({res:{ok:true},body:{eisDrtSpectrumSelection:supportsSelection}});requests++;lastOptions=options;return new Promise(resolve=>resolveRequest=resolve);};
async function check(){
 drt.render({rows:[{zreal:5,zimag:-2}]});
 await form.onsubmit({preventDefault(){}});
 assert.equal(requests,0);assert.match(status.textContent,/frequency/);
 const rows=[1,10,100].map(frequency=>({frequency,zreal:5,zimag:-2}));
 drt.render({rows});const pending=form.onsubmit({preventDefault(){}});await Promise.resolve();
 assert.equal(requests,1);fileChanged();
 resolveRequest({res:{ok:true},body:{result:{reconstruction:[]}}});await pending;
 assert.match(status.textContent,/선택 파일이 변경/);assert.doesNotMatch(plot.innerHTML,/class="eis-drt-fit"/);
 assert.equal(details.innerHTML,'');assert.ok(values.M.disabled);
 drt.render({rows:[...rows]});const failed=form.onsubmit({preventDefault(){}});await Promise.resolve();
 resolveRequest({res:{ok:false},body:{}});await failed;
 assert.match(status.textContent,/controlled failure/);assert.equal(values.M.disabled,false);
 const repeated=[...rows,...[...rows].reverse()];
 drt.render({rows:repeated});
 assert.match(nodes.figureCanvas.innerHTML,/max-width:621px/);
 assert.match(nodes.figureCanvas.innerHTML,/margin:0 auto/);
 assert.match(plot.innerHTML,/viewBox="0 0 1100 850"/);
 assert.match(controls.innerHTML,/DRT Controls/);
 assert.equal((controls.innerHTML.match(/100 Hz – 1 Hz/g)||[]).length,1);
 const selected=form.onsubmit({preventDefault(){}});
 await Promise.resolve();
 assert.equal(JSON.parse(lastOptions.body).parameters.spectrumIndex,0);
 resolveRequest({res:{ok:false},body:{}});await selected;
 supportsSelection=false;const beforeLegacy=requests;
 const legacy=form.onsubmit({preventDefault(){}});await Promise.resolve();
 assert.equal(requests,beforeLegacy);await legacy;assert.match(status.textContent,/재시작/);
}
check().catch(e=>{console.error(e);process.exitCode=1;});
''')

    def js(self, body):
        script = "const assert=require('node:assert/strict'); const drt=require('./public/eis-drt.js');\n" + body
        p = subprocess.run(["node","-"],input=script,text=True,encoding="utf-8",capture_output=True,cwd=ROOT)
        self.assertEqual(p.returncode,0,p.stderr)

    def test_auto_calculation_once_and_unreliable_lambda_not_success(self):
        self.js('''
const nodes={},values={M:{value:100},lambda:{value:.001},includeL:{checked:true,style:{}},mode:{value:'auto'},lambdaSlider:{value:-3}};
values[Symbol.iterator]=function*(){yield* Object.values(this);};
const form={elements:values,style:{},addEventListener(){}},status={},details={replaceChildren(){this.innerHTML='';}},plot={};
const selector={value:'0'},controls={querySelector:s=>s==='form'?form:s==='[data-drt-status]'?status:s==='[data-eis-spectrum]'?selector:details};
nodes.figureCanvas={contains:n=>n===controls,querySelector:s=>s==='[data-eis-plot]'?plot:controls};
for(const id of ['figureTitle','figureSubtitle','metaGrid'])nodes[id]={};
global.$=id=>nodes[id];global.currentFigureStyle=()=>({});global.syncFigureControls=()=>{};
global.figureSvgSize=()=>({w:1100,h:850});global.figureDatasetLabel=()=> 'test';
global.normalizeHexColor=()=> '#14888a';global.cleanNyquistBounds=()=>({x:[0,10],y:[-5,5]});
global.resolveFigureAxisDomains=(x,y)=>({x,y});global.applyAnnotationsToSvg=()=>{};
global.authHeaders=x=>x;global.apiErrorMessage=()=> 'failure';let posts=0;
global.fetchJsonWithTimeout=async(url,options)=>{
 if(url==='/api/health')return {res:{ok:true},body:{eisDrtSpectrumSelection:true}};
 if(options?.method!=='POST')return {res:{ok:true},body:[]};
 posts++;assert.equal(JSON.parse(options.body).parameters.mode,'auto');
 return {res:{ok:true},body:{result:{metadata:{spectrumIndex:0,autoSelectionReliable:false}}}};
};
async function check(){
 const d={id:'test',rows:[1,10,100].map(frequency=>({frequency,zreal:5,zimag:-2}))};
 drt.render(d);await new Promise(setImmediate);
 assert.equal(posts,1);assert.match(status.textContent,/자동 λ/);assert.doesNotMatch(status.textContent,/completed/);
 assert.doesNotMatch(plot.innerHTML,/eis-drt-fit/);assert.equal(values.M.disabled,false);
 drt.render(d);await new Promise(setImmediate);assert.equal(posts,1);
 drt.render({id:'incomplete',rows:[...d.rows,{frequency:1,zreal:5}]});await new Promise(setImmediate);
 assert.equal(posts,1);
 global.document={createElement:()=>({})};
 details.prepend=()=>{};details.querySelector=()=>({});details.querySelectorAll=()=>[];
 const good=drt.normalizeRows(d.rows);
 global.fetchJsonWithTimeout=async(url,options)=>url==='/api/health'?{res:{ok:true},body:{eisDrtSpectrumSelection:true}}:options?.method!=='POST'?{res:{ok:true},body:[]}:{res:{ok:true},body:{result:{
  metadata:{spectrumIndex:0,autoSelectionReliable:true,lambda:7.5e-6,Rs:5,L:0,measuredTimeBand:[.001,.2]},
  reconstruction:good.map(p=>({...p,z_real_raw_ohm:p.z_real_ohm,z_imag_raw_ohm:p.z_imag_ohm})),
  drt:[],warnings:[],peaks:[],quality:{},relative_complex_RMSE_percent:0
 }}};
 drt.render({id:'complete',rows:d.rows});await new Promise(setImmediate);
 assert.match(status.textContent,/completed/);assert.equal(Number(values.lambda.value),7.5e-6);
}
check().catch(e=>{console.error(e);process.exitCode=1;});
''')

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
const missing=drt.svg(points,null,{w:1100,h:850,title:'missing',date:''});
const drtPanel=missing.split('data-eis-panel="drt"')[1].split('</g>')[0];
assert.match(drtPanel,/유효한 주파수/);assert.doesNotMatch(drtPanel,/>1.778<|>3.162<|>5.623</);
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
