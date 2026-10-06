"""Scientific trust and boundary guards for the EIS-only DRT presentation."""

import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

RENDER_HARNESS = r"""
const values={M:{value:100},lambda:{value:.001},includeL:{checked:true,style:{}},mode:{value:'manual'},lambdaSlider:{value:-3}};
values[Symbol.iterator]=function*(){yield* Object.values(this);};
const form={elements:values,style:{},addEventListener(){}},status={},plot={},exports=[];
const peakExport={dataset:{export:'peaks'}},metadataExport={dataset:{export:'metadata'}};
const details={replaceChildren(){this.innerHTML='';},querySelector(){return {append(){}};},
 querySelectorAll(selector){return selector==='[data-export]'?[peakExport,metadataExport]:[];}};
const controls={querySelector:selector=>selector==='form'?form:selector==='[data-drt-status]'?status:selector==='[data-eis-spectrum]'?{}:details};
const nodes={figureCanvas:{contains:node=>node===controls,querySelector:selector=>selector==='[data-eis-plot]'?plot:controls},figureTitle:{},figureSubtitle:{},metaGrid:{}};
global.$=id=>nodes[id];global.currentFigureStyle=()=>({});global.syncFigureControls=()=>{};
global.figureSvgSize=()=>({w:1100,h:850});global.figureDatasetLabel=()=> 'synthetic test';
global.normalizeHexColor=()=> '#14888a';global.cleanNyquistBounds=()=>({x:[0,10],y:[-5,5]});
global.resolveFigureAxisDomains=(x,y)=>({x,y});global.applyAnnotationsToSvg=()=>{};
global.authHeaders=value=>value;global.apiErrorMessage=()=> 'controlled failure';
global.document={body:{append(){}},createElement:()=>({click(){},remove(){}})};
global.URL={createObjectURL:blob=>{exports.push(blob);return 'blob:synthetic';},revokeObjectURL(){}};
global.setTimeout=callback=>{callback();return 0;};
const rows=[1000,10,.1].map(frequency=>({frequency,zreal:5,zimag:-2}));
const points=drt.normalizeRows(rows);
const result={metadata:{analysisVersion:'rc-drt-3',spectrumIndex:0,mode:'manual',lambda:.001,M:100,Rs:5,L:0,includeL:true,measuredTimeBand:[.00015915494309189535,1.5915494309189535],tau_min:.000015915494309189535,tau_max:15.915494309189535},
 reconstruction:points.map(point=>({...point,z_real_raw_ohm:point.z_real_ohm,z_imag_raw_ohm:point.z_imag_ohm,z_real_fit_ohm:point.z_real_ohm,z_imag_fit_ohm:point.z_imag_ohm})),
 drt:[{tau_s:.001,gamma_ohm:1},{tau_s:.01,gamma_ohm:3},{tau_s:5,gamma_ohm:1}],
 peaks:[{Peak:'P1',tau_peak:.01,f_peak:15.915,R_region:12,prominence:2,interpretationEligible:true,regionOutsideMeasuredBand:true,tau_a:.00001,tau_b:.1},
        {Peak:'P2',tau_peak:5,f_peak:.03183,R_region:30,prominence:20,interpretationEligible:false,regionOutsideMeasuredBand:true,tau_a:2,tau_b:10}],
 warnings:[],quality:{excludedCount:0,duplicateFrequencyCount:0,excludedReasons:{}},relative_complex_RMSE_percent:0};
global.fetchJsonWithTimeout=async()=>({res:{ok:true},body:[{id:'synthetic-run',analysisName:'eis-drt',result}]});
async function restore(){drt.render({id:'synthetic-dataset',rows});await new Promise(setImmediate);}
"""


class DrtScientificReviewUiTests(unittest.TestCase):
    def js(self, body):
        script = "const assert=require('node:assert/strict');const drt=require('./public/eis-drt.js');\n" + body
        completed = subprocess.run(
            ["node", "-"], input=script, text=True, encoding="utf-8", capture_output=True, cwd=ROOT
        )
        self.assertEqual(completed.returncode, 0, completed.stderr)

    def test_out_of_band_peak_is_not_major_and_original_region_is_preserved(self):
        self.js(r"""
const peaks=[
 {Peak:'P1',tau_peak:.01,prominence:3,interpretationEligible:true,regionOutsideMeasuredBand:true,R_region:12},
 {Peak:'P2',tau_peak:10,prominence:500,interpretationEligible:false,regionOutsideMeasuredBand:true,R_region:300}
];
const before=JSON.stringify(peaks),groups=drt.peakGroups(peaks);
assert.deepEqual(groups.major.map(peak=>peak.Peak),['P1']);
assert.deepEqual(groups.minor.map(peak=>peak.Peak),['P2']);
assert.equal(groups.major[0].regionOutsideMeasuredBand,true);
assert.equal(groups.major[0].R_region,12);
assert.equal(groups.minor[0].R_region,300);
assert.equal(JSON.stringify(peaks),before);
""")

    def test_backend_major_priorities_are_honored_before_prominence_cap(self):
        self.js(r"""
const peaks=Array.from({length:6},(_,i)=>({Peak:'P'+(i+1),tau_peak:10**(i-5),prominence:i+1,interpretationEligible:true}));
peaks.slice(0,4).forEach(peak=>peak.major=true);
peaks[4].priorityMajor=true;
peaks.push({Peak:'edge',tau_peak:100,prominence:5000,interpretationEligible:false,major:true});
const groups=drt.peakGroups(peaks);
assert.deepEqual(groups.major.map(peak=>peak.Peak),['P1','P2','P3','P4','P5']);
assert.deepEqual(groups.minor.map(peak=>peak.Peak),['P6','edge']);
""")

    def test_out_of_band_curve_is_kept_but_not_labelled_as_a_major_peak(self):
        self.js(r"""
const points=drt.normalizeRows([1000,10,.1].map(frequency=>({frequency,zreal:5,zimag:-2})));
const result={metadata:{analysisVersion:'rc-drt-3'},peaks:[
 {Peak:'P1',tau_peak:.01,prominence:2,interpretationEligible:true},
 {Peak:'P2',tau_peak:5,prominence:20,interpretationEligible:false}],
 drt:[{tau_s:.001,gamma_ohm:0},{tau_s:.01,gamma_ohm:2},{tau_s:5,gamma_ohm:20},{tau_s:10,gamma_ohm:0}]};
const svg=drt.svg(points,result,{w:1100,h:850,title:'test',date:''});
assert.match(svg,/>P1</);
assert.doesNotMatch(svg,/>P2</);
const panel=svg.split('data-eis-panel="drt"')[1];
assert.equal(Number(panel.match(/data-y-max="([^"]+)"/)[1]),24);
assert.equal((panel.match(/class="eis-drt-measured-line" d="([^"]+)"/)[1].match(/[ML]/g)||[]).length,4);
""")

    def test_poor_fit_has_visible_svg_warning_without_hiding_reconstruction(self):
        self.js(r"""
const points=drt.normalizeRows([1000,10,.1].map(frequency=>({frequency,zreal:5,zimag:-2})));
const result={metadata:{analysisVersion:'rc-drt-3'},relative_complex_RMSE_percent:19.16,
 drt:[{tau_s:.001,gamma_ohm:0},{tau_s:.01,gamma_ohm:10},{tau_s:.1,gamma_ohm:0}],peaks:[],
 reconstruction:points.map(point=>({...point,z_real_fit_ohm:5.1,z_imag_fit_ohm:-1.9}))};
const svg=drt.svg(points,result,{w:1100,h:850,title:'test',date:''});
assert.match(svg,/Fit RMSE[^<]*19\.16\s*%/);
assert.match(svg,/해석 주의/);
assert.equal((svg.match(/class="eis-drt-fit"/g)||[]).length,2);
assert.equal((svg.match(/class="eis-drt-measured"/g)||[]).length,6);
""")

    def test_warning_does_not_smooth_or_delete_gamma_samples(self):
        self.js(r"""
const points=drt.normalizeRows([1000,10,.1].map(frequency=>({frequency,zreal:5,zimag:-2})));
const gamma=[0,10,1,20,0],tau=[.001,.002,.004,.008,.016];
const result={metadata:{analysisVersion:'rc-drt-3'},relative_complex_RMSE_percent:19.16,
 drt:tau.map((tau_s,index)=>({tau_s,gamma_ohm:gamma[index]})),peaks:[]};
const before=JSON.stringify(result),svg=drt.svg(points,result,{w:1100,h:850,title:'test',date:''});
const panel=svg.split('data-eis-panel="drt"')[1].split('</g>')[0];
const path=panel.match(/class="eis-drt-measured-line" d="([^"]+)"/)[1];
const samples=[...path.matchAll(/[ML]([\d.-]+),([\d.-]+)/g)];
assert.equal(samples.length,gamma.length);
const frame=panel.match(/<rect x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)"/);
const top=Number(frame[2]),height=Number(frame[4]);
const min=Number(panel.match(/data-y-min="([^"]+)"/)[1]),max=Number(panel.match(/data-y-max="([^"]+)"/)[1]);
samples.forEach((sample,index)=>assert.ok(Math.abs((top+height-Number(sample[2]))/height*(max-min)+min-gamma[index])<.001));
assert.equal(JSON.stringify(result),before);
""")

    def test_legacy_result_requires_recalculation_in_compact_status(self):
        self.js(RENDER_HARNESS + r"""
async function check(){
 result.metadata.analysisVersion='rc-drt-2';
 await restore();
 assert.match(status.textContent,/이전 계산 기준/);
 assert.match(status.textContent,/재계산/);
 assert.match(plot.innerHTML,/class="eis-drt-fit"/);
}
check().catch(error=>{console.error(error);process.exitCode=1;});
""")

    def test_poor_fit_compact_status_discloses_interpretation_warning(self):
        self.js(RENDER_HARNESS + r"""
async function check(){
 result.relative_complex_RMSE_percent=19.16;
 await restore();
 assert.match(status.textContent,/Fit RMSE[^<]*19\.16\s*%/);
 assert.match(status.textContent,/해석 주의/);
 assert.match(details.innerHTML,/<th>Assignment<\/th>/);
}
check().catch(error=>{console.error(error);process.exitCode=1;});
""")

    def test_all_peaks_export_and_assignment_remains_explicit_user_interpretation(self):
        self.js(RENDER_HARNESS + r"""
async function check(){
 await restore();
 peakExport.onclick();metadataExport.onclick();
 const csv=await exports[0].text(),metadata=JSON.parse(await exports[1].text());
 assert.match(csv,/P1,0\.01,15\.915,12,Unassigned/);
 assert.match(csv,/P2,5,0\.03183,30,Unassigned/);
 assert.equal(metadata.peaks.length,2);
 assert.equal(metadata.peaks[0].regionOutsideMeasuredBand,true);
 assert.equal(metadata.peaks[1].interpretationEligible,false);
 assert.equal(metadata.peaks[1].R_region,30);
 const context=drt.assignmentContext('synthetic-dataset','synthetic-run',result);
 assert.deepEqual(drt.readAssignments({context,source:'automatic',values:{P1:'R_SEI'}},context,result.peaks),{});
 assert.deepEqual(drt.readAssignments({context,source:'user',values:{P1:'R_ct'}},context,result.peaks),{P1:'R_ct'});
}
check().catch(error=>{console.error(error);process.exitCode=1;});
""")


if __name__ == "__main__":
    unittest.main()
