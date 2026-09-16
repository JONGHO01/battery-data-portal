"""Exercise shipped dQ/dV math with analytic, immutable Q(V) traces."""
import re
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class DqdvNumericsTests(unittest.TestCase):
    def run_js(self, assertions):
        source = (ROOT / "public/app.js").read_text(encoding="utf-8")
        functions = []
        for name in ["dqdvCurveFromPoints", "cycDqdvCapacity", "orientDqdvCurve", "cycDqdvSeries",
                     "cycDirectionFromValue", "cycCapacityUnit", "evenlySpacedItems",
                     "selectRepresentativeCycTraces"]:
            match = re.search(r"^function " + name + r"\([^\n]*\).*?^}", source, re.M | re.S)
            self.assertIsNotNone(match, f"Shipped helper missing: {name}")
            functions.append(match.group())
        setup = r"""
const assert = require('node:assert/strict');
// Q is monotonic with a narrow transition; all source points are exact samples
// of this same function. Extra samples change logging density, never chemistry.
const q = v => 100 * (v - 3) + 20 * (1 + Math.tanh((v - 3.5025) / 0.0005));
function trace(extraSamples = false, discharge = false) {
  const voltages = Array.from({length:10001}, (_,i) => 3 + i / 10000);
  if (extraSamples) {
    for (let i=0; i<100; i++) voltages.push(3.5002 + i * 0.000006);
  }
  voltages.sort((a,b) => discharge ? b-a : a-b);
  return voltages.map((voltage,index) => ({
    voltage, capacity: discharge ? q(4)-q(voltage) : q(voltage),
    time:index, index,
  }));
}
const integratedCapacity = curve => curve.reduce((sum,p) => sum+p.y*0.005,0);
"""
        result = subprocess.run(
            ["node", "-"], input=setup + "\n".join(functions) + assertions,
            capture_output=True, text=True, encoding="utf-8", cwd=ROOT,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_density_biased_sampling_preserves_capacity_area(self):
        self.run_js(r"""
const source = trace(true);
const curve = dqdvCurveFromPoints(source);
const expected = source.at(-1).capacity-source[0].capacity;
const area = integratedCapacity(curve);
assert.ok(curve.length >= 190, 'A complete 1 V trace should populate its 5 mV bins');
assert.ok(Math.abs(area-expected) < expected*0.01,
  `5 mV dQ/dV integral ${area} must reproduce measured capacity ${expected} within 1%`);
""")

    def test_same_qv_curve_is_insensitive_to_extra_voltage_samples(self):
        self.run_js(r"""
const uniform = dqdvCurveFromPoints(trace(false));
const dense = dqdvCurveFromPoints(trace(true));
const uniformArea = integratedCapacity(uniform);
const denseArea = integratedCapacity(dense);
assert.ok(Math.abs(denseArea-uniformArea) < (q(4)-q(3))*0.01,
  `Same Q(V): uniform integral ${uniformArea}, locally dense integral ${denseArea}`);
const reference = new Map(uniform.map(p => [p.x.toFixed(5),p.y]));
const peak = Math.max(...uniform.map(p=>p.y));
for (const p of dense) {
  if (!reference.has(p.x.toFixed(5))) continue;
  assert.ok(Math.abs(p.y-reference.get(p.x.toFixed(5))) < peak*0.05,
    `Logging density changed dQ/dV at ${p.x}: ${reference.get(p.x.toFixed(5))} -> ${p.y}`);
}
""")

    def test_discharge_has_negative_sign_and_conserves_capacity(self):
        self.run_js(r"""
const source = trace(true,true);
const curve = orientDqdvCurve(dqdvCurveFromPoints(source),'discharge');
const expected = source.at(-1).capacity-source[0].capacity;
assert.ok(curve.length > 0);
assert.ok(curve.every(p => Number.isFinite(p.y) && p.y<=0),
  'Increasing discharge capacity against falling voltage must produce negative dQ/dV');
const area = integratedCapacity(curve);
assert.ok(Math.abs(area+expected) < expected*0.01,
  `Signed discharge integral ${area} must equal -${expected} within 1%`);
""")

    def test_capacity_reset_does_not_create_a_negative_charge_peak(self):
        self.run_js(r"""
const source = [];
for (let i=0; i<=1000; i++) {
  const voltage = 3+i/1000;
  const capacity = i<=500 ? 100*(voltage-3) : 100*(voltage-3.5);
  source.push({voltage,capacity,time:i,index:i});
}
const curve = dqdvCurveFromPoints(source);
assert.ok(curve.length > 0);
assert.ok(curve.every(p => p.y>=-1e-8),
  `A capacity-counter reset is not negative charge: minimum dQ/dV ${Math.min(...curve.map(p=>p.y))}`);
assert.ok(Math.abs(integratedCapacity(curve)-100) < 1,
  'Both valid linear charge segments should retain their approximately 100 total capacity');
""")

    def test_analysis_never_mutates_or_reorders_source_points(self):
        self.run_js(r"""
const source = trace(true).reverse();
const before = JSON.stringify(source);
for (const point of source) Object.freeze(point);
Object.freeze(source);
const curve = dqdvCurveFromPoints(source);
assert.ok(curve.length>0);
assert.equal(JSON.stringify(source),before);
assert.ok(curve.every(p => Number.isFinite(p.x) && Number.isFinite(p.y)));
""")

    def test_invalid_measurement_breaks_trace_without_invented_bridge(self):
        self.run_js(r"""
const source = [];
for (let i=0; i<=100; i++) source.push({voltage:3+i/1000,capacity:i/10});
source.push({voltage:NaN,capacity:NaN});
for (let i=0; i<=100; i++) source.push({voltage:3.9+i/1000,capacity:20+i/10});
source.forEach((p,index)=>{p.time=index;p.index=index;});
const curve = dqdvCurveFromPoints(source);
assert.ok(curve.length>0);
assert.ok(!curve.some(p=>p.x>3.11 && p.x<3.89),
  'Missing measurement must break the trace, not create a derivative across the voltage gap');
assert.ok(Math.abs(integratedCapacity(curve)-20)<0.2,
  'Only capacity changes within the two valid measured segments belong in the integral');
""")

    def test_constant_voltage_capacity_is_retained_in_finite_bin(self):
        self.run_js(r"""
const source = [];
for (let i=0; i<=500; i++) source.push({voltage:3+i/1000,capacity:i/10});
for (let i=1; i<=1000; i++) source.push({voltage:3.5,capacity:50+i*0.04});
for (let i=1; i<=500; i++) source.push({voltage:3.5+i/1000,capacity:90+i/10});
source.forEach((p,index)=>{p.time=index;p.index=index;});
const curve = dqdvCurveFromPoints(source);
assert.ok(curve.every(p=>Number.isFinite(p.y)));
const area = integratedCapacity(curve);
assert.ok(Math.abs(area-140)<1.4,
  `A 40 capacity plateau must contribute finite 5 mV-bin area, got ${area} instead of 140`);
""")

    def test_missing_voltage_does_not_become_zero_or_bridge_gap(self):
        self.run_js(r"""
for (const missing of [null, '']) {
  const rows = Array.from({length:21},(_,i)=>({cycle:1,
    voltage:i===10?missing:3+i*.01, capacity:null, chargeCapacity:i,
    direction:'charge',current:1,capacityUnit:'mAh g-1'}));
  const result = cycDqdvSeries(rows);
  assert.equal(result.series.length,1);
  assert.ok(result.series[0].points.every(p=>p.x>=3));
  assert.ok(Math.abs(integratedCapacity(result.series[0].points)-18)<1e-8);
}
""")

    def test_nullable_discharge_capacity_does_not_hide_charge_trace(self):
        self.run_js(r"""
const charge = trace(false).map(p => ({
  cycle:1, voltage:p.voltage, time:p.time, direction:'charge', current:0.1,
  capacity:null, chargeCapacity:p.capacity, capacityUnit:'mAh g-1',
}));
const discharge = trace(false,true).map(p => ({
  cycle:1, voltage:p.voltage, time:p.time+charge.length, direction:'discharge', current:-0.1,
  capacity:p.capacity, chargeCapacity:null, capacityUnit:'mAh g-1',
}));
const rows = [...charge,...discharge];
const before = JSON.stringify(rows);
const analysis = cycDqdvSeries(rows);
assert.deepEqual(analysis.series.map(s=>s.direction).sort(), ['charge','discharge'],
  'Charge rows with capacity:null must use their measured chargeCapacity');
for (const series of analysis.series) {
  const signedExpected = series.direction==='charge' ? 140 : -140;
  assert.ok(Math.abs(integratedCapacity(series.points)-signedExpected)<1.4);
}
assert.equal(JSON.stringify(rows),before);
""")


if __name__ == "__main__":
    unittest.main()
