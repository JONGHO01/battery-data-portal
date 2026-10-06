"""Regression checks for the shipped CYC voltage-profile trace selection."""
import re
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class CycProfileTraceTests(unittest.TestCase):
    def run_js(self, assertions):
        source = (ROOT / "public/app.js").read_text(encoding="utf-8")
        names = ["cycVoltageProfileSeries", "cycDirectionFromValue", "cycCapacityUnit",
                 "cycCapacityAxisLabel", "cycDqdvCapacity", "evenlySpacedItems",
                 "selectRepresentativeCycTraces", "cycProfilePanel", "figureTraceLabel",
                 "traceStyleByRate", "formatCurrentForFigure", "inferCRateSegments",
                 "explicitCRateSegments", "parseCRateValue", "numberValue",
                 "formatExplicitCRate", "average", "parseCRateLabels",
                 "hasStandardRateLadder", "defaultRateLabels", "tokenizeCRateBlock",
                 "formatCRateLabel", "fiveCycleSegments", "hasRateStepPattern"]
        helpers = []
        for name in names:
            match = re.search(r"^function " + name + r"\([^\n]*\).*?^}", source, re.M | re.S)
            self.assertIsNotNone(match, f"Shipped helper missing: {name}")
            helpers.append(match.group())
        setup = r"""
const assert = require('node:assert/strict');
const fmt=(v)=>String(v);
const niceBounds=values=>[Math.min(...values),Math.max(...values)];
const resolveFigureAxisDomains=(x,y)=>({x,y});
const cycProfileSeriesColor=()=> '#0f766e';
const linePath=()=> '';
const markerPoints=()=> '';
const escapeXml=String;
let latestAxes;
const drawPaperAxes=opts=> {
  latestAxes=opts;
  return {sx:()=>0,sy:()=>0,svg:''};
};
function discharge(cycle=1, count=12) {
  return Array.from({length:count}, (_,i)=>({cycle, voltage:4.2-i*.05,
    capacity:i*10, chargeCapacity:null, current:-.001, time:i,
    direction:'discharge', capacityUnit:'mAh g-1'}));
}
function charge(cycle=1, count=12) {
  return Array.from({length:count}, (_,i)=>({cycle, voltage:3+i*.05,
    capacity:null, chargeCapacity:i*10, current:.001, time:i,
    direction:'charge', capacityUnit:'mAh g-1', chargeCapacityUnit:'mAh g-1'}));
}
"""
        result = subprocess.run(
            ["node", "-"], input=setup + "\n".join(helpers) + assertions,
            text=True, encoding="utf-8", capture_output=True, cwd=ROOT,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_nullable_discharge_capacity_keeps_matching_charge_curve(self):
        self.run_js(r"""
const profile=cycVoltageProfileSeries([...charge(), ...discharge()]);
assert.deepEqual(profile.series.map(s=>s.direction).sort(), ['charge','discharge'],
  'A missing discharge capacity on charge rows must not hide measured charge data');
for (const series of profile.series) {
  assert.equal(series.points.length,12);
  assert.equal(Math.max(...series.points.map(p=>p.x)),110);
}
""")

    def test_charge_uses_charge_capacity_even_with_zero_discharge_placeholder(self):
        self.run_js(r"""
const chargeRows=charge().map(row=>({...row,capacity:0}));
const profile=cycVoltageProfileSeries([...chargeRows,...discharge()]);
const charging=profile.series.find(s=>s.direction==='charge');
assert.ok(charging, 'A numeric zero discharge placeholder is not the charge curve');
assert.equal(Math.max(...charging.points.map(p=>p.x)),110);
""")

    def test_all_seven_rate_segments_include_initial_and_return_two_c(self):
        self.run_js(r"""
const labels=['1 C','2 C','6 C','10 C','20 C','40 C','2 C'];
const segments=labels.map((label,i)=>({start:1+i*3,end:3+i*3,label}));
const rows=Array.from({length:21},(_,i)=>discharge(i+1)).flat();
const profile=cycVoltageProfileSeries(rows,segments);
assert.deepEqual(profile.series.map(s=>s.cycle),[2,5,8,11,14,17,20],
  'Valid initial 2 C and 20 C segments cannot be silently sampled out');
assert.deepEqual(profile.series.map(s=>s.rateLabel),labels);
assert.equal(profile.series.filter(s=>s.rateLabel==='2 C').length,2,
  'Initial and return 2 C cycles are separate measured segments');
""")

    def test_missing_voltage_is_not_a_zero_volt_point(self):
        self.run_js(r"""
for (const missing of [null,'',false]) {
  const rows=discharge();
  rows.splice(6,0,{...rows[6],voltage:missing});
  const profile=cycVoltageProfileSeries(rows);
  assert.ok(profile.series.length>0);
  const points=profile.series.flatMap(s=>s.points);
  assert.equal(points.filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)).length,12);
  assert.ok(points.every(p=>!Number.isFinite(p.y)||p.y>=3),
    'Missing measured voltage must not invent a 0 V excursion');
}
""")

    def test_missing_capacity_is_not_a_zero_capacity_point(self):
        self.run_js(r"""
for (const missing of [null,'',false]) {
  const rows=discharge();
  rows.splice(6,0,{...rows[6],capacity:missing,chargeCapacity:null});
  const profile=cycVoltageProfileSeries(rows);
  assert.ok(profile.series.length>0);
  const points=profile.series.flatMap(s=>s.points);
  assert.equal(points.filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)).length,12,
    'Missing capacity must not draw a false return to the origin');
}
""")

    def test_render_preparation_keeps_source_rows_immutable(self):
        self.run_js(r"""
const rows=discharge();
const before=JSON.stringify(rows);
rows.forEach(Object.freeze);
Object.freeze(rows);
const profile=cycVoltageProfileSeries(rows);
assert.equal(profile.series.length,1);
assert.equal(JSON.stringify(rows),before);
assert.equal(profile.series[0].points.length,12);
""")

    def test_profile_legend_does_not_cover_the_capacity_axis_title(self):
        self.run_js(r"""
const profile=cycVoltageProfileSeries(discharge());
const svg=cycProfilePanel({x:80,y:100,w:800,h:460,profile,style:{}});
const legendRect=svg.match(/<rect[^>]*y="([^"]+)"[^>]*class="profileLegendPanel"/);
assert.ok(legendRect,'Profile legend should have its separate bottom band');
const xlabelBaseline=latestAxes.y+latestAxes.h+latestAxes.xlabelOffset;
assert.ok(Number(legendRect[1])>=xlabelBaseline+12,
  `Legend begins at ${legendRect[1]}, covering axis-title baseline ${xlabelBaseline}`);
""")

    def test_narrow_profile_legend_keeps_each_trace_inside_its_band(self):
        self.run_js(r"""
const labels=['1 C','2 C','6 C','10 C','20 C','40 C','2 C'];
const segments=labels.map((label,i)=>({start:i+1,end:i+1,label}));
const rows=labels.flatMap((label,i)=>[...charge(i+1),...discharge(i+1)]);
const profile=cycVoltageProfileSeries(rows,segments);
const x=80,w=280;
const svg=cycProfilePanel({x,y:100,w,h:460,profile,style:{}});
const entries=[...svg.matchAll(/<line x1="([^"]+)"[^>]*y1="([^"]+)"[^>]*class="profileLegendLine"/g)]
  .map(match=>({x:Number(match[1]),y:Number(match[2])}));
assert.equal(entries.length,14,'Every measured trace should retain its legend entry');
assert.equal(new Set(entries.map(entry=>entry.x)).size,1,
  'A narrow 280-pixel panel needs one legend column to avoid text collisions');
assert.equal(new Set(entries.map(entry=>entry.y)).size,14);
assert.ok(entries.every(entry=>entry.x>=x&&entry.x+140<x+w),
  'Legend swatch and trace label need space within the panel width');
""")

    def test_current_ratios_are_not_labelled_as_absolute_c_rates(self):
        self.run_js(r"""
const ratios=[1,2,6,10,20,40,2];
const capacities=[220,210,190,170,90,20,210];
const rows=Array.from({length:21},(_,i)=>discharge(i+1).map(row=>({
  ...row,current:-.0004624*ratios[Math.floor(i/3)]
}))).flat();
const capPts=Array.from({length:21},(_,i)=>({x:i+1,y:capacities[Math.floor(i/3)]}));
const before=JSON.stringify(rows);
const segments=inferCRateSegments({sourceName:'sample.wrd',cell:{}},rows,capPts);
assert.equal(segments.length,7,'Measured current steps must remain available');
assert.ok(segments.every(s=>!/\bC\b/.test(s.label)),
  'A current ratio cannot establish absolute C-rate without a 1 C reference');
assert.ok(segments.every(s=>s.label.includes('mA')),
  'Uncalibrated current groups should show their measured current unit');
assert.equal(JSON.stringify(rows),before);
""")

    def test_explicit_measured_c_rate_is_preserved(self):
        self.run_js(r"""
const rows=Array.from({length:3},(_,i)=>discharge(i+1).map(row=>({...row,cRate:.2}))).flat();
const segments=inferCRateSegments({sourceName:'sample.wrd',cell:{}},rows,
  [{x:1,y:160},{x:2,y:161},{x:3,y:160}]);
assert.equal(segments.length,1);
assert.equal(segments[0].label,'0.2 C');
assert.ok(Math.abs(segments[0].cRate-.2)<1e-12);
""")


if __name__ == "__main__":
    unittest.main()
