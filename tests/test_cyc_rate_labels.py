"""Execute shipped CYC rate helpers, including constant-rate experiments."""
import re
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class CycRateLabelTests(unittest.TestCase):
    def run_js(self, assertions):
        source = (ROOT / 'public/app.js').read_text(encoding='utf-8')
        names = ['numberValue', 'parseCRateValue', 'formatExplicitCRate', 'explicitCRateValues',
                 'explicitCRateSegments', 'cRateFigureSegments', 'declaredConstantCRate']
        functions = [m.group() for name in names if
                     (m := re.search(r'^function ' + name + r'\([^\n]*\).*?^}', source, re.M | re.S))]
        script = "const assert=require('node:assert/strict'); const average=v=>v.reduce((a,b)=>a+b,0)/v.length;\n"
        result = subprocess.run(['node','-'], input=script+'\n'.join(functions)+assertions,
                                capture_output=True, text=True, cwd=ROOT)
        self.assertEqual(result.returncode, 0, result.stdout+result.stderr)

    def test_constant_explicit_rate_retains_one_visible_segment(self):
        self.run_js('''
const rows=[1,2,3,4,5].map(cycle=>({cycle,cRate:0.1}));
const before=JSON.stringify(rows);
const segments=cRateFigureSegments(explicitCRateSegments(rows,1,5),rows.map(r=>({x:r.cycle,y:160})));
assert.equal(segments.length,1);
assert.equal(segments[0].label,'0.1 C');
assert.equal(JSON.stringify(rows),before);
''')

    def test_declared_rate_is_not_guessed_from_temperature_or_filename(self):
        self.run_js('''
assert.equal(declaredConstantCRate({cell:{condition:'C-rate: 0.1 C'}}),'0.1 C');
assert.equal(declaredConstantCRate({cell:{condition:'C-rate: 0.33 C'}}),'0.33 C');
assert.equal(declaredConstantCRate({cell:{condition:'1 C'}}),'');
assert.equal(declaredConstantCRate({cell:{condition:'25 C, OCV'}}),'');
assert.equal(declaredConstantCRate({cell:{condition:'25 C'}}),'');
assert.equal(declaredConstantCRate({sourceName:'sample_1_2_3.wrd',cell:{}}),'');
assert.equal(declaredConstantCRate({cell:{condition:'charge 0.1 C / discharge 0.33 C'}}),'');
''')

    def test_performance_renderer_draws_single_rate_and_unknown_notice(self):
        source=(ROOT/'public/app.js').read_text(encoding='utf-8')
        renderer=re.search(r'^function renderCycPerformanceFigure\([^\n]*\).*?^}',source,re.M|re.S).group()
        self.assertIn('const isRateFigure = rateSegments.length >= 1;',renderer)
        self.assertIn('C-rate: not specified',renderer)
