"""The saved CYC header reports only electrode facts belonging to that record."""
import re
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class CycElectrodeHeaderTests(unittest.TestCase):
    def run_js(self, assertions):
        source = (ROOT / "public/app.js").read_text(encoding="utf-8")
        helpers = []
        required = ["fixed", "loadingCaption", "filenameElectrodeMassLabels", "compactElectrodeSummaryValue",
                    "renderCycFigureElectrodeSummary", "renderCycRecordElectrode",
                    "cycRecordFact", "cycRecordNumber", "cycRecordRateText"]
        optional = ["cycCRateReference", "cycFigureElectrodeRows",
                    "filenameElectrodeMaterialLabel"]
        for name in required + optional:
            match = re.search(r"^function " + name + r"\([^\n]*\).*?^}", source, re.M | re.S)
            if name in required:
                self.assertIsNotNone(match, f"Shipped helper missing: {name}")
            if match:
                helpers.append(match.group())
        setup = r"""
const assert=require('node:assert/strict');
class Element {
  constructor(tagName='div') {
    this.tagName=tagName; this.className=''; this.hidden=false;
    this.children=[]; this._text=''; this.dataset={};
  }
  set textContent(value) {this._text=String(value??'');this.children=[];}
  get textContent() {return this._text+this.children.map(child=>typeof child==='string'?child:child.textContent).join(' ');}
  append(...items) {this.children.push(...items);}
  replaceChildren(...items) {this._text='';this.children=[...items];}
}
const summary=new Element();
const $=id=>id==='cycElectrodeSummary'?summary:null;
const document={createElement:tagName=>new Element(tagName)};
const escapeXml=value=>String(value??'').replace(/[<>&"]/g,
  c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const escapeAttr=value=>escapeXml(value).replace(/'/g,'&#39;');
// Deliberately unrelated session data: neither is linked to this Dataset.
const state={electrodeProfiles:[{profileName:'UNLINKED PROFILE',electrodeMass_g:.0999,
  activeMass_g:.0888,activeLoading_g_cm2:.0666,area_cm2:22,oneC_mA:123}],
  manualInfo:{sheets:[{samples:[{sample:'UNLINKED SAMPLE',oneC_mA:456,electrodeWeight_g:.7777}]}]}};
function record() {
  return {dataType:'cyc',sourceName:'synthetic_LFP_39.30803255.cyc.wrd',
    cell:{material:'',sampleName:'unrelated_NCM622_50mg'},
    electrodeInfo:{cellWeight_g:.04443,source:'wrd_test_report_cell_weight'},
    cRateReference:{oneC_mA:7.10941,nominalCapacity_Ah:.00710941,
      source:'wrd_test_report_cell_capacity'}};
}
function displayedRows(element=summary) {
  const rows=[];
  function visit(node) {
    if(typeof node==='string') return;
    if(node.className==='cycElectrodeSummaryRow')
      rows.push({label:node.children[0]?.textContent||'',value:node.children[1]?.textContent||''});
    node.children.forEach(visit);
  }
  visit(element);return rows;
}
function assertShown() {assert.equal(summary.hidden,false,'The electrode summary should be visible');}
function containsNumber(text,value,tolerance=1e-4) {
  return [...String(text).matchAll(/(?:^|[^A-Za-z])([0-9]+(?:\.[0-9]+)?)/g)]
    .some(match=>Math.abs(Number(match[1])-value)<tolerance);
}
function rawRows() {
  return displayedRows().filter(row=>/WRD|TestReport|원본/.test(row.label+' '+row.value)
    && !/파일명/.test(row.label));
}
"""
        result = subprocess.run(["node", "-"], input=setup + "\n".join(helpers) + assertions,
                                text=True, encoding="utf-8", capture_output=True, cwd=ROOT)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_original_wrd_mass_without_filename_units_keeps_summary_visible(self):
        self.run_js(r"""
const d=record();renderCycFigureElectrodeSummary(d);assertShown();
assert.ok(rawRows().some(row=>/질량|무게|weight|mass/i.test(row.label+' '+row.value)
  && /\bmg\b/.test(row.value) && containsNumber(row.value,44.43)),
  'The original WRD CellWeight should be labelled as a recorded report setting in mg');
""")

    def test_original_nominal_capacity_and_one_c_reference_have_report_provenance(self):
        self.run_js(r"""
renderCycFigureElectrodeSummary(record());assertShown();
const text=rawRows().map(row=>row.label+' '+row.value).join(' ');
assert.ok(/설정|nominal/i.test(text),'Recorded setting capacity is not measured discharge capacity');
assert.ok(/mAh\b/.test(text)&&containsNumber(text,7.10941),'Display original setting capacity in mAh');
assert.ok(/1\s*C/.test(text)&&/mA\b/.test(text)&&containsNumber(text,7.10941),
  'Display the 1 C reference derived from that recorded setting');
""")

    def test_report_mass_is_not_promoted_to_active_mass_loading_area_or_thickness(self):
        self.run_js(r"""
renderCycFigureElectrodeSummary(record());assertShown();
const facts=displayedRows().map(row=>row.label+' '+row.value).join(' ');
assert.ok(!/39\.30803255|50\s*mg/.test(facts),'Bare filename number and another sample name are not source mass');
assert.ok(!/mg\s*cm|cm2|cm²/.test(facts),'Original report mass alone cannot determine area or loading');
assert.ok(!/(?:활물질|active\s*mass)[^·]*44\.43/i.test(facts),
  'Raw TestReport weight must not automatically become confirmed active mass');
assert.ok(!/\b(?:0\.0999|0\.0888|0\.0666|123|456|0\.7777)\b/.test(facts),
  'No unlinked global profile or manual sample may supply facts');
""")

    def test_connected_calculation_keeps_its_distinct_electrode_details(self):
        self.run_js(r"""
const d=record();d.cell.electrodeCalc={profileName:'OWN SAVED ELECTRODE',electrodeMass_g:.035,
  activeMass_g:.028,activeLoading_g_cm2:.014,area_cm2:2,electrodeThickness_mm:.125,oneC_mA:4.76};
renderCycFigureElectrodeSummary(d);assertShown();
const saved=displayedRows().filter(row=>/저장|연결|linked|saved/i.test(row.label)).map(row=>row.value).join(' ');
for(const value of [.035,.028,14,2,.125,4.76])
  assert.ok(containsNumber(saved,value),'Retain linked mass, active mass, loading, area, thickness and 1 C: '+value);
assert.match(saved,/OWN SAVED ELECTRODE/);
assert.ok(rawRows().some(row=>containsNumber(row.value,44.43)),
  'Linked electrode values do not replace the original report weight');
""")

    def test_original_report_one_c_remains_separate_from_linked_reference(self):
        self.run_js(r"""
const d=record();d.cell.electrodeCalc={profileName:'OWN REFERENCE',oneC_mA:4.76};
renderCycFigureElectrodeSummary(d);assertShown();
assert.ok(rawRows().some(row=>containsNumber(row.value,7.10941)),
  'The original setting is still reported even if a linked calculation chooses another 1 C');
assert.ok(displayedRows().filter(row=>/저장|연결|linked|saved/i.test(row.label))
  .some(row=>containsNumber(row.value,4.76)),'The chosen linked reference is labelled separately');
""")

    def test_invalid_or_untrusted_report_mass_is_not_displayed(self):
        self.run_js(r"""
for(const value of [true,false,null,'',NaN,Infinity,-.04443,0,'not-a-number']) {
  const d=record();d.electrodeInfo.cellWeight_g=value;
  renderCycFigureElectrodeSummary(d);
  assert.ok(!rawRows().some(row=>/질량|무게|weight|mass/i.test(row.label+' '+row.value)
    && /\b(?:mg|g)\b/.test(row.value)), 'Ignore non-positive/invalid/boolean report weight: '+value);
}
const d=record();d.electrodeInfo.source='filename_guess';renderCycFigureElectrodeSummary(d);
assert.ok(!rawRows().some(row=>containsNumber(row.value,44.43)),
  'Only trusted WRD TestReport provenance may supply original report weight');
""")

    def test_invalid_nominal_reference_is_not_reported_as_fact(self):
        self.run_js(r"""
for(const ref of [
  {oneC_mA:7.10941,nominalCapacity_Ah:.00710941,source:'material_guess'},
  {oneC_mA:true,nominalCapacity_Ah:.001,source:'wrd_test_report_cell_capacity'},
  {oneC_mA:7.10941,nominalCapacity_Ah:.001,source:'wrd_test_report_cell_capacity'},
  {oneC_mA:NaN,nominalCapacity_Ah:.00710941,source:'wrd_test_report_cell_capacity'}
]) {
  const d=record();d.cRateReference=ref;renderCycFigureElectrodeSummary(d);assertShown();
  assert.ok(!rawRows().some(row=>/mAh|1\s*C/.test(row.label+' '+row.value)),
    'Invalid or incompatible nominal references are not original setting facts');
}
""")

    def test_empty_cyc_record_reports_missing_link_without_hiding_summary(self):
        self.run_js(r"""
renderCycFigureElectrodeSummary({dataType:'cyc',sourceName:'plain.wrd',cell:{}});assertShown();
assert.match(summary.textContent,/미등록|미연결|등록되지|연결되지|없습니다|not\s*(?:registered|linked)/i,
  'An explicit missing-electrode message is better than silently hiding the section');
""")

    def test_non_cyc_or_closed_record_clears_previous_summary(self):
        self.run_js(r"""
const d=record();d.cell.electrodeCalc={oneC_mA:4.76};
for(const next of [{dataType:'eis',cell:{}},null]) {
  renderCycFigureElectrodeSummary(d);assertShown();
  renderCycFigureElectrodeSummary(next);
  assert.equal(summary.hidden,true);assert.equal(summary.textContent,'');
}
""")

    def test_filename_material_is_explicitly_only_a_notation_candidate(self):
        self.run_js(r"""
const d=record();const before=JSON.stringify(d);renderCycFigureElectrodeSummary(d);
const candidates=displayedRows().filter(row=>/LFP/.test(row.value));
assert.ok(candidates.length,'The source filename may describe its material notation');
assert.ok(candidates.every(row=>/파일명|filename/i.test(row.label+' '+row.value)),
  'An LFP filename token is not a confirmed registered material');
assert.equal(d.cell.material,'');assert.equal(JSON.stringify(d),before,
  'The display must not fill or overwrite stored Cell material');
""")

    def test_registered_material_is_not_replaced_by_filename_candidate(self):
        self.run_js(r"""
const d=record();d.cell.material='OWN REGISTERED MATERIAL';renderCycFigureElectrodeSummary(d);assertShown();
assert.match(summary.textContent,/OWN REGISTERED MATERIAL/);
assert.equal(d.cell.material,'OWN REGISTERED MATERIAL');
const lfp=displayedRows().filter(row=>/LFP/.test(row.value));
assert.ok(lfp.every(row=>/파일명|filename/i.test(row.label+' '+row.value)),
  'Any different filename material is only a notation candidate');
""")

    def test_rendering_preserves_all_inputs_and_uses_safe_text_nodes(self):
        self.run_js(r"""
const d=record();d.cell.electrodeCalc={profileName:'<img src=x onerror=alert(1)>',
  electrodeMass_g:.035,oneC_mA:4.76};
const before=JSON.stringify(d),stateBefore=JSON.stringify(state);
renderCycFigureElectrodeSummary(d);assertShown();
assert.equal(JSON.stringify(d),before);assert.equal(JSON.stringify(state),stateBefore);
assert.match(summary.textContent,/<img src=x onerror=alert\(1\)>/);
assert.ok(summary.children.every(node=>node instanceof Element),
  'Source metadata belongs in text nodes rather than HTML strings');
""")

    def test_loading_caption_never_relabels_bare_mass_as_areal_loading(self):
        self.run_js(r"""
for(const d of [record(),{sourceName:'sample_0.04443g.wrd',cell:{}},
  {sourceName:'sample.wrd',cell:{sampleName:'unrelated_50mg'}},
  {sourceName:'sample_50mg.wrd',cell:{condition:'mass 50 mg',notes:'powder 50mg'}}])
  assert.equal(loadingCaption(d),'','Bare mass has no confirmed cm² denominator');
""")

    def test_loading_caption_preserves_linked_areal_loading_with_units(self):
        self.run_js(r"""
const d=record();d.cell.electrodeCalc={activeLoading_g_cm2:.0012};
const before=JSON.stringify(d);const caption=loadingCaption(d);
assert.ok(/mg\s*cm-2/.test(caption)&&containsNumber(caption,1.2),
  'A linked activeLoading_g_cm2 is a legitimate mg cm-2 caption');
assert.equal(JSON.stringify(d),before);
""")

    def test_loading_caption_accepts_explicit_condition_areal_units(self):
        self.run_js(r"""
for(const condition of ['Loading: 5 mg cm-2','Loading: 5 mg/cm2','Loading: 5 mg cm^-2']) {
  const caption=loadingCaption({sourceName:'sample.wrd',cell:{condition}});
  assert.ok(/mg\s*cm-2/.test(caption)&&containsNumber(caption,5),
    'An explicit recorded areal-loading unit is sufficient: '+condition);
}
""")

    def test_loading_caption_accepts_explicit_filename_areal_units(self):
        self.run_js(r"""
const caption=loadingCaption({sourceName:'sample_loading_2.5mgcm-2.wrd',cell:{}});
assert.ok(/mg\s*cm-2/.test(caption)&&containsNumber(caption,2.5),
  'An explicit filename denominator must remain supported without guessing one');
""")

    def test_loading_caption_ignores_boolean_and_nonpositive_linked_values(self):
        self.run_js(r"""
for(const value of [true,false,null,'',NaN,Infinity,-.0012,0,'not-a-number']) {
  const d={sourceName:'sample.wrd',cell:{electrodeCalc:{activeLoading_g_cm2:value}}};
  assert.equal(loadingCaption(d),'','Invalid linked loading cannot become a measured loading: '+value);
}
""")

    def test_loading_caption_does_not_turn_negative_recorded_loading_positive(self):
        self.run_js(r"""
for(const condition of ['Loading: -5 mg/cm2','Loading: -5 mg cm-2'])
  assert.equal(loadingCaption({sourceName:'sample.wrd',cell:{condition}}),'',
    'A negative recorded loading must not be displayed as a positive magnitude');
""")

    def test_loading_caption_does_not_misread_exponent_suffix_as_a_new_value(self):
        self.run_js(r"""
const caption=loadingCaption({sourceName:'sample.wrd',cell:{condition:'Loading: 1e-3 mg/cm2'}});
assert.ok(caption===''||containsNumber(caption,.001,1e-9),
  'Unsupported exponent notation may be omitted, but its suffix is never a separate 3 mg/cm2');
""")

    def test_loading_caption_does_not_display_overflow_as_infinity(self):
        self.run_js(r"""
const condition='Loading: '+'9'.repeat(400)+' mg/cm2';
assert.equal(loadingCaption({sourceName:'sample.wrd',cell:{condition}}),'',
  'A recorded loading must remain finite after parsing');
""")

    def test_loading_caption_does_not_overflow_when_converting_linked_grams(self):
        self.run_js(r"""
assert.equal(loadingCaption({sourceName:'sample.wrd',cell:{electrodeCalc:{activeLoading_g_cm2:1e308}}}),'',
  'A finite linked g/cm2 value must not become an infinite mg/cm2 caption during conversion');
""")

    def test_loading_caption_does_not_read_decimal_comma_suffix_as_separate_loading(self):
        self.run_js(r"""
const caption=loadingCaption({sourceName:'sample.wrd',cell:{condition:'Loading: 1,5 mg/cm2'}});
assert.ok(caption===''||containsNumber(caption,1.5,1e-9),
  'Decimal comma may be interpreted as 1.5 or rejected, never truncated to a separate 5 mg/cm2');
""")

    def test_filename_mass_labels_exclude_space_separated_areal_loading(self):
        self.run_js(r"""
assert.deepEqual(filenameElectrodeMassLabels('sample_5mg cm-2.wrd'),[],
  'An explicitly area-normalized loading is not a filename total mass');
""")

    def test_filename_mass_labels_exclude_slash_separated_areal_loading(self):
        self.run_js(r"""
assert.deepEqual(filenameElectrodeMassLabels('sample_5mg/cm2.wrd'),[],
  'An explicitly area-normalized loading is not a filename total mass');
""")

    def test_filename_mass_labels_keep_total_mass_separate_from_areal_loading(self):
        self.run_js(r"""
const labels=filenameElectrodeMassLabels('sample_0.04443g_loading_5mg cm-2.wrd');
assert.equal(labels.length,1,'Keep the genuine total mass but exclude the areal-loading token');
assert.ok(containsNumber(labels[0],44.43),'The existing explicit total-mass filename remains supported');
""")

    def test_integrated_record_shows_known_wrd_electrode_facts_without_profile_link(self):
        self.run_js(r"""
const d=record(),before=JSON.stringify(d);state.electrodeProfiles=[];
let html=renderCycRecordElectrode(d);
assert.ok(/WRD|TestReport|원본/.test(html),'The integrated view distinguishes original report facts');
assert.ok(/\bmg\b/.test(html)&&containsNumber(html,44.43),
  'Known WRD CellWeight is available even without a saved electrode link');
assert.ok(/mAh\b/.test(html)&&containsNumber(html,7.10941),
  'The original nominal setting capacity is retained in the integrated view');
assert.ok(/1\s*C/.test(html)&&/mA\b/.test(html),
  'Do not claim that the original WRD lacks 1 C information when its reference is known');
assert.ok(!/1C 정보가 직접 기록되어 있지 않습니다/.test(html));
state.electrodeProfiles=[{id:'my-profile',name:'Available electrode profile'}];
html=renderCycRecordElectrode(d);
assert.ok(/data-cyc-record-profile/.test(html)&&/Available electrode profile/.test(html),
  'The existing explicit profile connection picker remains available');
assert.equal(JSON.stringify(d),before,'Rendering is not an automatic profile link or data write');
""")


if __name__ == "__main__":
    unittest.main()
