"""Run the shipped CYC display adapter against immutable artifact row shapes."""
import re
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class CycRenderingTests(unittest.TestCase):
    def run_js(self, assertions):
        source = (ROOT / "public/app.js").read_text(encoding="utf-8")
        names = ["keyOf", "findColumn", "hasAnyTerm", "isDischargeColumn",
                 "isChargeOnlyColumn", "isSpecificCapacityColumn", "isCapacityColumn",
                 "findBestCycColumn", "findCycFallbackColumn", "numberValue",
                 "parseCRateValue", "cycDirectionFromValue", "canonicalRows",
                 "scaleCycCapacity", "scaledCycValue", "cycCapacityUnitFromColumn",
                 "cycCapacityUnit", "cycCapacityAxisLabel", "normalizeSavedCycDataset",
                 "median", "dischargeSeries", "cycPerformanceCapacityDomain",
                 "cycCapacityTickStep", "cycCapacityTickLabel", "cycCapacityLabelOffset"]
        functions = [m.group() for name in names if
                     (m := re.search(r"^function " + name + r"\([^\n]*\).*?^}", source, re.M | re.S))]
        setup = r'''
const assert = require('node:assert/strict');
const columns = ['cycle','direction','specific capacity (mAh g-1)',
  'charge Q (Ah)','discharge Q (Ah)','voltage (V)','current (A)'];
const rows = [
 {cycle_index:1,charge_capacity_ah:0.0008,voltage_v:4.2,current_a:0.001,
  _raw:{cycle:1,direction:'charge','specific capacity (mAh g-1)':'',
    'charge Q (Ah)':0.0008,'discharge Q (Ah)':'','voltage (V)':4.2,'current (A)':0.001}},
 {cycle_index:1,discharge_capacity_ah:0.0007,voltage_v:2.5,current_a:-0.001,
  _raw:{cycle:1,direction:'discharge','specific capacity (mAh g-1)':'',
    'charge Q (Ah)':'','discharge Q (Ah)':0.0007,'voltage (V)':2.5,'current (A)':-0.001}}
];
const dataset = {dataType:'cyc',columns,rows};
'''
        result = subprocess.run(["node", "-"], input=setup + "\n".join(functions) + assertions,
                                text=True, capture_output=True, cwd=ROOT)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_blank_specific_capacity_falls_back_to_measured_ah_without_mutation(self):
        self.run_js(r'''
const before = JSON.stringify(dataset);
const plotted = normalizeSavedCycDataset(dataset);
assert.deepEqual(dischargeSeries(plotted.rows),[{x:1,y:0.0007}]);
assert.equal(cycCapacityAxisLabel(plotted.rows),'Discharge capacity (Ah)');
assert.equal(plotted.rows[0].capacity,null);
assert.equal(JSON.stringify(dataset),before);
assert.deepEqual(normalizeSavedCycDataset(plotted).rows,plotted.rows);
''')

    def test_canonical_only_rows_work_with_legacy_metadata_columns(self):
        self.run_js(r'''
const canonical = rows.map(({_raw,...row})=>row);
const plotted = normalizeSavedCycDataset({...dataset,rows:canonical});
assert.deepEqual(dischargeSeries(plotted.rows),[{x:1,y:0.0007}]);
assert.equal(cycCapacityUnit(plotted.rows),'Ah');
''')

    def test_missing_capacity_is_not_a_zero_discharge_cycle(self):
        self.run_js(r'''
assert.deepEqual(dischargeSeries([null,'',undefined,false].map(capacity=>({cycle:1,capacity}))),[]);
assert.equal(scaledCycValue({'q': ''},'q'),null);
''')

    def test_small_ah_capacity_uses_a_visible_numeric_range(self):
        self.run_js(r'''
assert.deepEqual(cycPerformanceCapacityDomain([{x:1,y:0.0007}],false),[0,0.0008]);
assert.deepEqual(cycPerformanceCapacityDomain([{x:1,y:160}],true),[0,180]);
''')

    def test_capacity_axis_uses_round_steps_without_changing_ah_measurements(self):
        self.run_js(r'''
const points = [{x:1,y:0.00717},{x:2,y:0.00721},{x:3,y:0.0004}];
const before = JSON.stringify(points);
const domain = cycPerformanceCapacityDomain(points,false);
assert.deepEqual(domain,[0,0.008]);
const step = cycCapacityTickStep(domain[1],false);
assert.equal(step,0.002);
assert.deepEqual(Array.from({length:5},(_,i)=>cycCapacityTickLabel(i*step)),
 ['0','0.002','0.004','0.006','0.008']);
assert.equal(JSON.stringify(points),before);
''')

    def test_axis_labels_stay_compact_and_reserve_space_for_the_title(self):
        self.run_js(r'''
assert.equal(cycCapacityTickLabel(0.0006000000000000001),'0.0006');
assert.equal(cycCapacityTickLabel(2e-8),'2e-8');
assert.equal(cycCapacityTickLabel(180),'180');
assert.ok(cycCapacityLabelOffset(['0','0.0008']) >= 9+6*7+16);
assert.equal(cycCapacityTickStep(180,true),20);
''')

    def test_specific_capacity_and_legacy_numeric_strings_keep_declared_units(self):
        self.run_js(r'''
const source = [{cycle:'1','discharge capacity (Ah g-1)':'0.16'},
 {cycle:'2','discharge capacity (Ah g-1)':'0.15'}];
const plotted = normalizeSavedCycDataset({dataType:'cyc',columns:Object.keys(source[0]),rows:source});
assert.deepEqual(dischargeSeries(plotted.rows),[{x:1,y:160},{x:2,y:150}]);
assert.equal(cycCapacityUnit(plotted.rows),'mAh g-1');
assert.deepEqual(normalizeSavedCycDataset(plotted).rows,plotted.rows);
''')
