"""Derived discharge rates must not masquerade as measured charge rates."""
import re
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class CycRateTraceBasisTests(unittest.TestCase):
    def run_js(self, assertions):
        source = (ROOT / "public/app.js").read_text(encoding="utf-8")
        helpers = []
        for name in ["evenlySpacedItems", "selectRepresentativeCycTraces",
                     "figureTraceLabel", "traceStyleByRate", "cycRateColorKey"]:
            match = re.search(r"^function " + name + r"\([^\n]*\).*?^}", source, re.M | re.S)
            self.assertIsNotNone(match, f"Shipped helper missing: {name}")
            helpers.append(match.group())
        setup = r"""
const assert=require('node:assert/strict');
function candidates() {
  return [1,2,3,4,5].flatMap(cycle=>[
    {cycle,direction:'charge',currentA:.001,points:[{x:0,y:3},{x:1,y:4}]},
    {cycle,direction:'discharge',currentA:-.01421882,points:[{x:0,y:4},{x:1,y:3}]},
  ]);
}
function stage(source) {
  return {start:1,end:5,label:'2 C',cRate:2,rateSource:source,oneC_mA:7.10941};
}
"""
        result = subprocess.run(["node", "-"], input=setup + "\n".join(helpers) + assertions,
                                text=True, encoding="utf-8", capture_output=True, cwd=ROOT)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_derived_charge_legend_identifies_the_discharge_stage(self):
        self.run_js(r"""
for(const source of ['wrd_test_report_cell_capacity','linked_electrode_calculation']) {
  const selected=selectRepresentativeCycTraces(candidates(),[stage(source)]);
  const charge=selected.find(trace=>trace.direction==='charge');
  const discharge=selected.find(trace=>trace.direction==='discharge');
  assert.equal(figureTraceLabel(charge),'2 C discharge stage \u00b7 cycle 3 charge',
    'A discharge-derived label cannot claim that a different charge current is 2 C');
  assert.equal(figureTraceLabel(discharge),'2 C \u00b7 cycle 3 discharge');
}
""")

    def test_reference_evidence_survives_selection_without_mutating_inputs(self):
        self.run_js(r"""
const traces=candidates(),segments=[stage('wrd_test_report_cell_capacity')];
const before=JSON.stringify({traces,segments});
traces.forEach(Object.freeze);segments.forEach(Object.freeze);
Object.freeze(traces);Object.freeze(segments);
const selected=selectRepresentativeCycTraces(traces,segments);
assert.deepEqual(selected.map(trace=>trace.rateSource),Array(2).fill(segments[0].rateSource));
assert.deepEqual(selected.map(trace=>trace.oneC_mA),Array(2).fill(7.10941));
assert.equal(JSON.stringify({traces,segments}),before);
""")

    def test_qualified_legend_preserves_shared_stage_label_and_color(self):
        self.run_js(r"""
const selected=selectRepresentativeCycTraces(candidates(),[stage('wrd_test_report_cell_capacity')]);
assert.deepEqual(selected.map(trace=>trace.rateLabel),['2 C','2 C']);
assert.equal(cycRateColorKey(selected[0]),cycRateColorKey(selected[1]));
const styles=selected.map(trace=>traceStyleByRate(trace,selected,['#123456','#abcdef']));
assert.deepEqual(styles.map(style=>style.color),['#123456','#123456']);
assert.equal(styles[0].dash,'');assert.equal(styles[1].dash,'6 3');
""")

    def test_explicit_and_filename_rate_legends_keep_existing_labels(self):
        self.run_js(r"""
for(const source of [undefined,'explicit_column','filename']) {
  const selected=selectRepresentativeCycTraces(candidates(),[stage(source)]);
  assert.deepEqual(selected.map(figureTraceLabel),
    ['2 C \u00b7 cycle 3 charge','2 C \u00b7 cycle 3 discharge']);
}
""")


if __name__ == "__main__":
    unittest.main()
