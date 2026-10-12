"""Separate numerical KK diagnostics from physical validation in the EIS UI."""

import subprocess
import unittest
from pathlib import Path

from tests.test_eis_drt_review_ui import RENDER_HARNESS


ROOT = Path(__file__).resolve().parents[1]

KK_HARNESS = RENDER_HARNESS + r"""
result.metadata.analysisVersion='rc-drt-4';
result.metadata.kkConsistency={method:'linear-kk',status:'computed',reason:'numerical diagnostic only',
 selectionReliable:true,modelOrder:7,mu:.91,relativeComplexRMSEPercent:.42,
 residualReal:[.01,-.01,0],residualImag:[0,.02,-.02]};
result.relative_complex_RMSE_percent=1.2;
"""


class DrtCorrectedUiTests(unittest.TestCase):
    def js(self, body):
        script = "const assert=require('node:assert/strict');const drt=require('./public/eis-drt.js');\n" + body
        completed = subprocess.run(
            ["node", "-"], input=script, text=True, encoding="utf-8", capture_output=True, cwd=ROOT
        )
        self.assertEqual(completed.returncode, 0, completed.stderr)

    def test_small_kk_residual_is_visible_and_never_means_physical_validation(self):
        self.js(KK_HARNESS + r"""
async function check(){
 await restore();
 assert.match(status.textContent,/KK[^<]*0\.42\s*%/);
 assert.match(status.textContent,/물리 검증:\s*미완료/);
 assert.match(status.textContent+details.innerHTML,/diagnostic[- ]only/i);
 assert.doesNotMatch(status.textContent+details.innerHTML,/KK\s*(?:pass|passed|통과)|physical\s*(?:success|validated)|물리 검증:\s*(?:완료|성공)/i);
}
check().catch(error=>{console.error(error);process.exitCode=1;});
""")

    def test_unreliable_model_order_is_not_hidden_by_small_diagnostic_residual(self):
        self.js(KK_HARNESS + r"""
async function check(){
 result.metadata.kkConsistency.selectionReliable=false;
 result.metadata.kkConsistency.reason='model_order_selection_inconclusive';
 await restore();
 assert.match(status.textContent,/KK[^<]*0\.42\s*%/);
 assert.match(status.textContent+details.innerHTML,/(?:차수|order)[^<]*선택[^<]*미확정|차수[^<]*미확정|order[^<]*inconclusive/i);
 assert.match(status.textContent,/물리 검증:\s*미완료/);
 assert.doesNotMatch(status.textContent,/KK\s*(?:pass|통과)/i);
}
check().catch(error=>{console.error(error);process.exitCode=1;});
""")

    def test_inconclusive_diagnostic_does_not_show_a_fabricated_zero_error(self):
        self.js(KK_HARNESS + r"""
async function check(){
 result.metadata.kkConsistency={method:'linear-kk',status:'inconclusive',reason:'insufficient distinct frequencies',
  selectionReliable:false,modelOrder:null,mu:null,relativeComplexRMSEPercent:null};
 await restore();
 assert.match(status.textContent,/KK[^<]*(?:판정 불가|미확정|불확정|미완료|inconclusive)/i);
 assert.doesNotMatch(status.textContent,/KK[^·|<]*\b0\s*%/);
 assert.match(status.textContent,/물리 검증:\s*미완료/);
}
check().catch(error=>{console.error(error);process.exitCode=1;});
""")

    def test_rc_drt_3_history_without_kk_explicitly_needs_recalculation(self):
        self.js(KK_HARNESS + r"""
async function check(){
 result.metadata.analysisVersion='rc-drt-3';
 delete result.metadata.kkConsistency;
 await restore();
 assert.match(status.textContent,/이전 계산 기준/);
 assert.match(status.textContent,/재계산/);
 assert.match(status.textContent,/KK[^<]*진단[^<]*없음/);
 assert.match(plot.innerHTML,/class="eis-drt-fit"/);
}
check().catch(error=>{console.error(error);process.exitCode=1;});
""")

    def test_svg_discloses_physical_validation_incomplete_even_for_good_fit(self):
        self.js(KK_HARNESS + r"""
const svg=drt.svg(points,result,{w:1100,h:850,title:'diagnostic test',date:''});
assert.match(svg,/물리 검증:\s*미완료/);
assert.match(svg,/KK[^<]*0\.42\s*%/);
assert.doesNotMatch(svg,/KK\s*(?:pass|passed|통과)|physical\s*(?:success|validated)/i);
assert.equal((svg.match(/class="eis-drt-fit"/g)||[]).length,2);
assert.equal((svg.match(/class="eis-drt-measured"/g)||[]).length,6);
""")

    def test_metadata_export_preserves_nested_kk_and_every_candidate(self):
        self.js(KK_HARNESS + r"""
async function check(){
 const before=JSON.stringify(result);
 await restore();
 metadataExport.onclick();peakExport.onclick();
 const metadata=JSON.parse(await exports[0].text()),csv=await exports[1].text();
 assert.deepEqual(metadata.kkConsistency,result.metadata.kkConsistency);
 assert.equal(metadata.peaks.length,2);
 assert.equal(metadata.peaks[1].interpretationEligible,false);
 assert.equal(metadata.peaks[0].Assignment,'Unassigned');
 assert.equal(metadata.peaks[1].Assignment,'Unassigned');
 assert.match(csv,/P2,5,0\.03183,30,Unassigned/);
 assert.equal(JSON.stringify(result),before);
}
check().catch(error=>{console.error(error);process.exitCode=1;});
""")

    def test_kk_diagnostic_does_not_smooth_gamma_or_assign_chemical_processes(self):
        self.js(KK_HARNESS + r"""
const beforeRows=JSON.stringify(rows),beforeResult=JSON.stringify(result);
const svg=drt.svg(points,result,{w:1100,h:850,title:'diagnostic test',date:''});
const panel=svg.split('data-eis-panel="drt"')[1].split('</g>')[0];
const path=panel.match(/class="eis-drt-measured-line" d="([^"]+)"/)[1];
const samples=[...path.matchAll(/[ML]([\d.-]+),([\d.-]+)/g)];
assert.equal(samples.length,result.drt.length);
const frame=panel.match(/<rect x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)"/);
const top=Number(frame[2]),height=Number(frame[4]);
const min=Number(panel.match(/data-y-min="([^"]+)"/)[1]),max=Number(panel.match(/data-y-max="([^"]+)"/)[1]);
samples.forEach((sample,index)=>assert.ok(Math.abs((top+height-Number(sample[2]))/height*(max-min)+min-result.drt[index].gamma_ohm)<.001));
assert.doesNotMatch(svg,/P\d+ → R_SEI|P\d+ → R_ct|P\d+ → R_ion/);
assert.equal(JSON.stringify(rows),beforeRows);assert.equal(JSON.stringify(result),beforeResult);
""")

    def test_old_or_missing_server_contract_never_posts_a_new_analysis(self):
        self.js(KK_HARNESS + r"""
async function check(){
 await restore();
 let version,posts=0,healthRequests=0;
 global.fetchJsonWithTimeout=async(url,options)=>{
  if(url==='/api/health'){
   healthRequests++;
   return {res:{ok:true},body:{eisDrtSpectrumSelection:true,...(version?{eisDrtAnalysisVersion:version}:{})}};
  }
  if(options?.method==='POST'){
   posts++;
   return {res:{ok:true},body:{id:'fresh-memory-run',result}};
  }
  return {res:{ok:true},body:[]};
 };
 for(const oldVersion of [undefined,'rc-drt-3']){
  version=oldVersion;
  await form.onsubmit({preventDefault(){}});
  assert.equal(posts,0);
  assert.match(status.textContent,/재시작/);
  assert.doesNotMatch(plot.innerHTML,/class="eis-drt-fit"/);
 }
 version='rc-drt-4';
 await form.onsubmit({preventDefault(){}});
 assert.equal(posts,1);
 assert.equal(healthRequests,3);
 assert.match(status.textContent,/completed/);
 assert.match(status.textContent,/KK RMSE:\s*0\.42\s*%/);
}
check().catch(error=>{console.error(error);process.exitCode=1;});
""")


if __name__ == "__main__":
    unittest.main()
