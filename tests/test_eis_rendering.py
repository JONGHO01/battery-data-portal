"""Execute the shipped EIS renderer against persisted and legacy row shapes."""
import re
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class EisRenderingTests(unittest.TestCase):
    def run_js(self, assertions):
        source = (ROOT / "public/app.js").read_text(encoding="utf-8")
        names = ["eisPlotRows", "renderEisFigure", "figureThumb"]
        functions = []
        for name in names:
            match = re.search(r"^function " + name + r"\([^\n]*\).*?^}", source, re.M | re.S)
            if match:
                functions.append(match.group())
        script = r'''
const assert = require('node:assert/strict');
const nodes = {};
const $ = id => nodes[id] ||= {};
const currentFigureStyle = () => ({seriesColor:'#123456'});
const syncFigureControls = () => {};
const normalizeHexColor = v => v;
const figureSvgSize = () => ({w:1100,h:720});
const positiveLogBounds = v => [Math.min(...v),Math.max(...v)];
const niceBounds = positiveLogBounds;
const figureDatasetLabel = () => 'EIS test';
const escapeXml = v => String(v);
const isBadText = () => false;
const applyAnnotationsToSvg = () => {};
const panels = [];
const panel = options => {panels.push(options);return '<g/>';};
const nyquistPanel = panel;
const measured = [
 {frequency_hz:79433,z_real_ohm:2.90052,z_imag_ohm:-0.510143},
 {frequency_hz:100000,z_real_ohm:2.84293,z_imag_ohm:-0.417499}
];
const dataset = rows => ({rows,cell:{},dataType:'eis'});
'''
        result = subprocess.run(["node", "-"], input=script + "\n".join(functions) + assertions,
                                text=True, capture_output=True, cwd=ROOT)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_persisted_rows_reach_all_three_plots_without_mutation(self):
        self.run_js(r'''
const before = JSON.stringify(measured);
renderEisFigure(dataset(measured));
assert.equal(panels.length,3);
for (const p of panels) assert.equal(p.points.length,2);
assert.equal(panels[0].points[0].x,2.84293);
assert.equal(panels[0].points[0].y,0.417499);
assert.equal(panels[1].points[0].x,100000);
assert.equal(panels[1].points[0].y,Math.hypot(2.84293,-0.417499));
assert.equal(panels[2].points[0].y,-Math.atan2(-0.417499,2.84293)*180/Math.PI);
assert.equal(JSON.stringify(measured),before);
''')

    def test_legacy_rows_and_numeric_strings_remain_supported(self):
        self.run_js(r'''
renderEisFigure(dataset([{frequency:'1000',zreal:'0',zimag:'-2'}]));
assert.equal(panels[0].points.length,1);
assert.equal(panels[0].points[0].x,0);
assert.equal(panels[0].points[0].y,2);
''')

    def test_missing_values_do_not_become_zero_measurements(self):
        self.run_js(r'''
const invalid = [null,'',undefined,false,Infinity,'invalid'];
const rows = invalid.map(v=>({frequency_hz:1000,z_real_ohm:v,z_imag_ohm:-2}));
rows.push({frequency_hz:0,z_real_ohm:2,z_imag_ohm:-2});
rows.push({frequency_hz:-1,z_real_ohm:2,z_imag_ohm:-2});
renderEisFigure(dataset([...rows,...measured]));
assert.equal(panels[0].points.length,2);
''')

    def test_saved_fig_thumbnail_has_a_measured_path(self):
        self.run_js(r'''
const svg = figureThumb(dataset(measured));
assert.match(svg, /<path d="M[^" ]+ L/);
assert.doesNotMatch(svg,/NaN/);
''')

    def test_empty_data_explains_missing_measurements_instead_of_blank_axes(self):
        self.run_js(r'''
renderEisFigure(dataset([{frequency_hz:1000,z_real_ohm:null,z_imag_ohm:-2}]));
assert.equal(panels.length,0);
assert.match(nodes.figureCanvas.innerHTML,/role="status"/);
assert.doesNotMatch(nodes.figureCanvas.innerHTML,/<svg/);
''')
