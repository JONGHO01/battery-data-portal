"""CYC rates need measured discharge current and a documented 1 C reference."""
import re
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class CycReferenceRateTests(unittest.TestCase):
    def run_js(self, assertions):
        source = (ROOT / "public/app.js").read_text(encoding="utf-8")
        names = ["inferCRateSegments", "explicitCRateSegments", "parseCRateValue",
                 "numberValue", "formatExplicitCRate", "average", "parseCRateLabels",
                 "hasStandardRateLadder", "defaultRateLabels", "tokenizeCRateBlock",
                 "formatCRateLabel", "fiveCycleSegments", "hasRateStepPattern",
                 "cycDirectionFromValue", "median", "renderExperimentInfo", "bestManualSample",
                 "rateNumber", "fixed", "dischargeSeries"]
        helpers = []
        for name in names:
            match = re.search(r"^function " + name + r"\([^\n]*\).*?^}", source, re.M | re.S)
            self.assertIsNotNone(match, f"Shipped helper missing: {name}")
            helpers.append(match.group())
        # Missing new helpers must leave the old real implementation in place,
        # so a RED result demonstrates behavior rather than a missing mock.
        for name in ["cycCRateReference", "cycDischargeCurrentGroups", "calibratedCRateSegments"]:
            match = re.search(r"^function " + name + r"\([^\n]*\).*?^}", source, re.M | re.S)
            if match:
                helpers.append(match.group())
        setup = r"""
const assert=require('node:assert/strict');
const fmt=(value,digits=4)=>String(Number(value.toPrecision(digits)));
const state={electrodeProfiles:[{oneC_mA:.7111}],
  manualInfo:{sheets:[{samples:[{oneC_mA:.7111}]}]}};
const infoPanel={innerHTML:''};
const $=()=>infoPanel;
const escapeXml=value=>String(value??'');
const expectedRates=[.1,.2,.3,.5,1,2];
function experiment({denseCharge=false,constant=false}={}) {
  const ratios=constant?[1]:[1,2,3,5,10,20];
  const counts=constant?[5]:[5,5,5,5,5,19];
  const rows=[],capPts=[],ranges=[];
  let cycle=1;
  ratios.forEach((ratio,group)=>{
    const start=cycle;
    for(let offset=0;offset<counts[group];offset++,cycle++) {
      const current=-.0007111*ratio;
      if(denseCharge) {
        // Many fixed-current charge/CV samples must not determine the
        // discharge rate just because the logger kept more charge points.
        for(let i=0;i<100;i++) rows.push({cycle,current:.003,direction:'charge'});
        for(let i=0;i<40;i++) rows.push({cycle,current:.003*(40-i)/40,direction:'charge'});
      }
      for(let i=0;i<9;i++) rows.push({cycle,current:current*(1+(i-4)*.0002),direction:'discharge'});
      if(denseCharge) {
        rows.push({cycle,current:current*.01,direction:'discharge'});
        rows.push({cycle,current:0,direction:'rest'});
      }
      capPts.push({x:cycle,y:constant?160:160-group*12});
    }
    ranges.push([start,cycle-1]);
  });
  return {rows,capPts,ranges};
}
function assertSixCalibratedGroups(segments,ranges) {
  assert.equal(segments.length,6,'Six measured discharge-current stages must remain six groups');
  assert.deepEqual(segments.map(s=>[s.start,s.end]),ranges);
  segments.forEach((segment,i)=>{
    assert.ok(Number.isFinite(segment.cRate), 'A calibrated stage needs its numerical C-rate');
    assert.ok(Math.abs(segment.cRate-expectedRates[i])<.001,
      `Stage ${i}: expected approximately ${expectedRates[i]} C, got ${segment.cRate}`);
    assert.ok(/\bC\b/.test(segment.label));
    assert.ok(!segment.currentOnly,'A calibrated stage is not an uncalibrated current-only label');
  });
}
function nominalReference() {
  return {oneC_mA:7.10941,source:'wrd_test_report_cell_capacity',nominalCapacity_Ah:.00710941};
}
"""
        result = subprocess.run(["node", "-"], input=setup + "\n".join(helpers) + assertions,
                                text=True, encoding="utf-8", capture_output=True, cwd=ROOT)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_explicit_row_c_rate_takes_precedence_over_reference(self):
        self.run_js(r"""
const {rows,capPts}=experiment({constant:true});
rows.forEach(row=>row.cRate=.2);
const segments=inferCRateSegments({sourceName:'sample.wrd',cell:{electrodeCalc:{oneC_mA:7.10941}},
  cRateReference:nominalReference()},rows,capPts);
assert.equal(segments.length,1);
assert.ok(Math.abs(segments[0].cRate-.2)<1e-12);
assert.equal(segments[0].label,'0.2 C');
""")

    def test_linked_electrode_one_c_reference_calibrates_six_stages(self):
        self.run_js(r"""
const {rows,capPts,ranges}=experiment();
const before=JSON.stringify(rows);
const segments=inferCRateSegments({sourceName:'sample.wrd',cell:{electrodeCalc:{oneC_mA:7.10941}}},rows,capPts);
assertSixCalibratedGroups(segments,ranges);
assert.equal(JSON.stringify(rows),before,'Rate preparation must preserve measured rows');
""")

    def test_trusted_report_reference_calibrates_44_cycle_current_pattern(self):
        self.run_js(r"""
const {rows,capPts,ranges}=experiment();
assert.equal(capPts.length,44);
const segments=inferCRateSegments({sourceName:'sample.wrd',cell:{},cRateReference:nominalReference()},rows,capPts);
assertSixCalibratedGroups(segments,ranges);
""")

    def test_linked_reference_precedes_the_original_report_reference(self):
        self.run_js(r"""
const {rows,capPts}=experiment({constant:true});
const segments=inferCRateSegments({sourceName:'sample.wrd',cell:{electrodeCalc:{oneC_mA:3.554705}},
  cRateReference:nominalReference()},rows,capPts);
assert.equal(segments.length,1);
assert.ok(Math.abs(segments[0].cRate-.2)<.001,
  'An explicitly linked electrode calculation is the selected 1 C convention');
""")

    def test_discharge_median_ignores_dense_charge_and_cv_measurements(self):
        self.run_js(r"""
const {rows,capPts,ranges}=experiment({denseCharge:true});
const segments=inferCRateSegments({sourceName:'sample.wrd',cell:{},cRateReference:nominalReference()},rows,capPts);
assertSixCalibratedGroups(segments,ranges);
""")

    def test_calibrated_constant_rate_does_not_require_capacity_drop(self):
        self.run_js(r"""
const {rows,capPts}=experiment({constant:true});
const segments=inferCRateSegments({sourceName:'sample.wrd',cell:{},cRateReference:nominalReference()},rows,capPts);
assert.equal(segments.length,1,'A constant-current experiment still has a measurable C-rate');
assert.ok(Math.abs(segments[0].cRate-.1)<.001);
assert.deepEqual([segments[0].start,segments[0].end],[1,5]);
""")

    def test_unknown_reference_does_not_use_material_or_global_profiles(self):
        self.run_js(r"""
const {rows,capPts}=experiment();
const segments=inferCRateSegments({sourceName:'sample_LFP.wrd',cell:{material:'LFP',loadingAmount:50}},rows,capPts);
assert.equal(segments.length,6);
assert.ok(segments.every(s=>s.currentOnly&&s.label.includes('mA')&&!/\bC\b/.test(s.label)),
  'A material label, loading hint or unlinked global profile cannot establish 1 C');
""")

    def test_invalid_linked_reference_does_not_invent_a_c_rate(self):
        self.run_js(r"""
const {rows,capPts}=experiment();
for(const oneC_mA of [null,'',false,0,-7,'not-a-number']) {
  const segments=inferCRateSegments({sourceName:'sample.wrd',cell:{electrodeCalc:{oneC_mA}}},rows,capPts);
  assert.equal(segments.length,6);
  assert.ok(segments.every(s=>s.currentOnly&&!/\bC\b/.test(s.label)));
}
""")

    def test_untrusted_nominal_reference_source_is_ignored(self):
        self.run_js(r"""
const {rows,capPts}=experiment();
for(const source of ['', 'filename_guess', 'material_default']) {
  const segments=inferCRateSegments({sourceName:'sample.wrd',cell:{},
    cRateReference:{...nominalReference(),source}},rows,capPts);
  assert.equal(segments.length,6);
  assert.ok(segments.every(s=>s.currentOnly&&!/\bC\b/.test(s.label)));
}
""")

    def test_original_44_cycle_stage_order_and_three_digit_labels(self):
        self.run_js(r"""
const rates=[.2,.3,.5,1,2,.1],counts=[6,5,5,5,5,18];
const rows=[],capPts=[],ranges=[];
let cycle=1;
rates.forEach((rate,index)=>{
  const start=cycle;
  for(let offset=0;offset<counts[index];offset++,cycle++) {
    for(let i=0;i<9;i++) rows.push({cycle,current:-.0007111*rate/.1,direction:'discharge'});
    capPts.push({x:cycle,y:160-index*10});
  }
  ranges.push([start,cycle-1]);
});
assert.equal(capPts.length,44);
const segments=inferCRateSegments({sourceName:'sample.wrd',cell:{},cRateReference:nominalReference()},rows,capPts);
assert.deepEqual(segments.map(s=>[s.start,s.end]),ranges);
assert.deepEqual(segments.map(s=>s.label),['0.2 C','0.3 C','0.5 C','1 C','2 C','0.1 C']);
segments.forEach((segment,index)=>assert.ok(Math.abs(segment.cRate-rates[index])<.001));
""")

    def test_report_nominal_capacity_and_reference_current_must_agree(self):
        self.run_js(r"""
const {rows,capPts}=experiment();
const malformed=[
  {...nominalReference(),nominalCapacity_Ah:7.10941},
  {...nominalReference(),oneC_mA:1},
  {...nominalReference(),nominalCapacity_Ah:null},
  {...nominalReference(),nominalCapacity_Ah:'not-a-number'},
  {...nominalReference(),nominalCapacity_Ah:true,oneC_mA:1000},
];
for(const cRateReference of malformed) {
  const segments=inferCRateSegments({sourceName:'sample.wrd',cell:{},cRateReference},rows,capPts);
  assert.equal(segments.length,6);
  assert.ok(segments.every(s=>s.currentOnly&&!/\bC\b/.test(s.label)),
    `Malformed original reference must not establish rates: ${JSON.stringify(cRateReference)}`);
}
""")

    def test_fractional_cycles_are_not_merged_into_discharge_reference_groups(self):
        self.run_js(r"""
const {rows,capPts}=experiment({constant:true});
for(const cycle of [1.5,2.25,4.9,0,-1]) rows.push({cycle,current:-.05,direction:'discharge'});
const segments=inferCRateSegments({sourceName:'sample.wrd',cell:{},cRateReference:nominalReference()},rows,capPts);
assert.equal(segments.length,1);
assert.deepEqual([segments[0].start,segments[0].end],[1,5]);
assert.ok(Math.abs(segments[0].cRate-.1)<.001);
""")

    def test_calibration_does_not_mutate_original_rows_or_reference(self):
        self.run_js(r"""
const {rows,capPts}=experiment({denseCharge:true});
rows.reverse();
const dataset={sourceName:'sample.wrd',cell:{},cRateReference:nominalReference()};
const before=JSON.stringify({rows,capPts,dataset});
rows.forEach(Object.freeze);Object.freeze(rows);
capPts.forEach(Object.freeze);Object.freeze(capPts);
Object.freeze(dataset.cRateReference);Object.freeze(dataset.cell);Object.freeze(dataset);
const segments=inferCRateSegments(dataset,rows,capPts);
assert.equal(segments.length,6);
assert.equal(JSON.stringify({rows,capPts,dataset}),before);
""")

    def test_experiment_summary_expected_current_uses_the_selected_reference(self):
        self.run_js(r"""
const {rows}=experiment({constant:true});
rows.forEach(row=>row.capacity=160);
renderExperimentInfo({dataType:'cyc',sourceName:'sample.wrd',rows,cell:{},cRateReference:nominalReference()});
const firstTable=infoPanel.innerHTML.match(/<tbody>([\s\S]*?)<\/tbody>/)[1];
const cells=[...firstTable.matchAll(/<td>([^<]*)<\/td>/g)].map(match=>match[1]);
assert.equal(cells[0],'0.1 C');
assert.ok(Math.abs(Number(cells[4])-.710941)<.00001,
  `Expected current must use original 1C 7.10941 mA, not unlinked manual sample: ${cells[4]}`);
""")

    def test_experiment_summary_measured_current_is_displayed_in_milliamperes(self):
        self.run_js(r"""
const {rows}=experiment({constant:true});
rows.forEach(row=>row.capacity=160);
renderExperimentInfo({dataType:'cyc',sourceName:'sample.wrd',rows,cell:{},cRateReference:nominalReference()});
const firstTable=infoPanel.innerHTML.match(/<tbody>([\s\S]*?)<\/tbody>/)[1];
const cells=[...firstTable.matchAll(/<td>([^<]*)<\/td>/g)].map(match=>match[1]);
assert.ok(Math.abs(Number(cells[3])-.7111)<.00001,
  `The mA column must convert measured 0.0007111 A to 0.7111 mA: ${cells[3]}`);
""")

    def test_experiment_summary_identifies_original_reference_not_unlinked_manual(self):
        self.run_js(r"""
const {rows}=experiment({constant:true});
rows.forEach(row=>row.capacity=160);
renderExperimentInfo({dataType:'cyc',sourceName:'sample.wrd',rows,cell:{},cRateReference:nominalReference()});
const summary=infoPanel.innerHTML.split('</section>')[0];
assert.ok(!summary.includes('매뉴얼 기준'),
  'The CYC reference card cannot attribute original report calibration to an unlinked manual sample');
assert.ok(/TestReport|원본|wrd_test_report_cell_capacity/i.test(summary),
  'The selected dataset summary must identify its original-report reference');
const displayedReference=summary.match(/1\s*C\s*[:=]?\s*([0-9.]+)\s*mA/i);
assert.ok(displayedReference,'The original reference needs its documented 1 C current');
assert.ok(Math.abs(Number(displayedReference[1])-7.10941)<.0001);
""")


if __name__ == "__main__":
    unittest.main()
