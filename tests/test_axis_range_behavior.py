"""Real CYC renderers must consume axis settings, not just expose form controls."""
from pathlib import Path
import re
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]


def helpers():
    source = (ROOT / "public/app.js").read_text(encoding="utf-8")
    names = ("normalizeAxisRangeValue", "normalizeFigureAxisRange", "normalizeFigureAxisRanges",
             "resolveFigureAxisDomains", "selectedFigureAxisRangeTarget", "syncFigureAxisRangeControls",
             "readFigureAxisRangeInput", "setFigureAxisRangeMessage", "applyFigureAxisRange",
             "resetFigureAxisRange", "cycProfilePanel", "renderCycPerformanceFigure",
             "cycPerformanceCapacityDomain", "cycCapacityTickStep", "cycCapacityTickLabel",
             "cycCapacityLabelOffset", "cycReadableAxisTicks", "axisTicks", "ticks", "niceBounds")
    return "\n".join(re.search(r"^function " + n + r"\([^\n]*\).*?^}", source, re.M | re.S).group() for n in names)


SETUP = r"""
const FIGURE_AXIS_RANGE_KEYS=['performance','voltage','dqdv','eis','cv'];
const fixture={id:'qa',dataType:'cyc',figureKind:'cycling-performance',cell:{},rows:[{cycle:1,x:1,y:140},{cycle:2,x:2,y:160}]};
const state={selectedId:'qa',datasets:[fixture],cycFigureViewKinds:{}};
let style={axisRanges:{},markerSize:4,showGrid:true,connectPoints:true}, scales=[], saved=[];
const currentFigureStyle=()=>style;
const elements={};const $=id=>elements[id] ||= {value:'',textContent:'',innerHTML:'',classList:{toggle:()=>{}}};
const setStatus=x=>$('status').textContent=x;
const saveFigureEdits=()=>saved.push(structuredClone(style));
const activeCycFigureViewKind=d=>state.cycFigureViewKinds[d.id]||d.figureKind;
const syncFigureControls=()=>{};const renderCurrent=()=>{};
const figureDatasetLabel=()=> 'Synthetic CYC';const dischargeSeries=rows=>rows;
const cycCapacityAxisLabel=()=> 'Specific capacity';const cycCapacityUnit=()=> 'mAh g-1';
const cRateFigureSegments=x=>x;const inferCRateSegments=()=>[];
const explicitCRateValues=()=>[];const formatExplicitCRate=String;const declaredConstantCRate=()=>'';
const displayUserName=()=>'';const isBadText=()=>false;
const figureSvgSize=()=>({w:640,h:480});const loadingCaption=()=>'';const cycStyle=()=>'';
const movableWrap=(key,x,y,content)=>`<g>${content}</g>`;
const escapeXml=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const applyAnnotationsToSvg=()=>{};
const makeScale=(domain,range)=>{scales.push([...domain]);return value=>range[0]+(value-domain[0])/(domain[1]-domain[0])*(range[1]-range[0]);};
const fmt=(v,n=3)=>String(Number(v.toPrecision(n)));
const linePath=(points,sx,sy)=>points.map((p,i)=>`${i?'L':'M'}${sx(p.x)} ${sy(p.y)}`).join(' ');
const markerPoints=(points,sx,sy,cls,r)=>points.map(p=>`<circle class="${cls}" cx="${sx(p.x)}" cy="${sy(p.y)}" r="${r}"/>`).join('');
const traceStyleByRate=()=>({dash:''});const cycProfileSeriesColor=()=> '#0f766e';
const figureTraceLabel=()=> 'synthetic';const formatCurrentForFigure=()=>'';
const drawPaperAxes=opts=>({sx:makeScale(opts.xDomain,[opts.x,opts.x+opts.w]),
 sy:makeScale(opts.yDomain,[opts.y+opts.h,opts.y]),svg:`<text>${opts.xDomain.join(' – ')} / ${opts.yDomain.join(' – ')}</text>`});
const profile={xLabel:'Capacity',series:[{points:[{x:0,y:4.2},{x:160,y:2.5}]}]};
"""


class AxisRangeBehaviorTests(unittest.TestCase):
    def run_js(self, code):
        result = subprocess.run(["node", "-"], input="const assert=require('node:assert/strict');\n"+SETUP+helpers()+code,
                                text=True, encoding="utf-8", capture_output=True, cwd=ROOT)
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_voltage_profile_uses_exact_manual_domains(self):
        self.run_js("""
style.axisRanges.voltage={xMin:20,xMax:120,yMin:3,yMax:4};
const svg=cycProfilePanel({x:60,y:80,w:500,h:350,profile,style});
assert.deepEqual(scales,[[20,120],[3,4]]);
assert.ok(svg.includes('clip-path'), 'zoomed traces must stay inside the frame');
""")

    def test_performance_uses_exact_manual_domains(self):
        self.run_js("""
style.axisRanges.performance={xMin:1,xMax:2,yMin:100,yMax:170};
renderCycPerformanceFigure(fixture);
assert.deepEqual(scales,[[1,2],[100,170]]);
assert.ok($('figureCanvas').innerHTML.includes('clip-path'));
""")

    def test_partial_limit_outside_auto_range_still_applies(self):
        self.run_js("""
style.axisRanges.voltage={xMin:300,yMax:-2};
const result=resolveFigureAxisDomains([0,160],[2,4],'voltage');
assert.equal(result.x[0],300);assert.ok(result.x[1]>300);
assert.equal(result.y[1],-2);assert.ok(result.y[0]<-2);
""")

    def test_apply_selects_target_view_and_reset_preserves_other_ranges(self):
        self.run_js("""
$('figureAxisRangeTarget').value='voltage';$('figureXMin').value='0';$('figureXMax').value='100';
$('figureYMin').value='3';$('figureYMax').value='4';applyFigureAxisRange();
assert.equal(state.cycFigureViewKinds.qa,'voltage-profile');
assert.deepEqual(saved.at(-1).axisRanges.voltage,{xMin:0,xMax:100,yMin:3,yMax:4});
style.axisRanges.performance={yMin:100};resetFigureAxisRange();
assert.equal(style.axisRanges.performance.yMin,100);
assert.deepEqual(resolveFigureAxisDomains([0,160],[2,4],'voltage'),{x:[0,160],y:[2,4]});
""")

    def test_reversed_limits_do_not_save(self):
        self.run_js("""
$('figureAxisRangeTarget').value='voltage';$('figureXMin').value='3';$('figureXMax').value='2';
applyFigureAxisRange();assert.equal(saved.length,0);assert.ok($('figureAxisRangeMessage').textContent);
""")

    def test_saved_ranges_restore_without_changing_data_or_other_views(self):
        self.run_js("""
const original=JSON.stringify(fixture.rows);
$('figureAxisRangeTarget').value='performance';
$('figureXMin').value='0';$('figureXMax').value='5';
$('figureYMin').value='100';$('figureYMax').value='170';applyFigureAxisRange();
style=JSON.parse(JSON.stringify(saved.at(-1)));
syncFigureAxisRangeControls();renderCycPerformanceFigure(fixture);
assert.deepEqual(scales,[[0,5],[100,170]]);assert.equal($('figureYMin').value,'100');
assert.equal(JSON.stringify(fixture.rows),original);
assert.deepEqual(resolveFigureAxisDomains([0,160],[2,4],'voltage'),{x:[0,160],y:[2,4]});
""")

    def test_empty_ranges_keep_existing_auto_domains(self):
        self.run_js("""
for(const key of FIGURE_AXIS_RANGE_KEYS){
 assert.deepEqual(resolveFigureAxisDomains([0,10],[-2,4],key),{x:[0,10],y:[-2,4]});
}
renderCycPerformanceFigure(fixture);assert.deepEqual(scales,[[0,6],[0,180]]);
""")


if __name__ == '__main__':
    unittest.main()
