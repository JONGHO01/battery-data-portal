"""Shared equipment catalog: no guessed model ratings or condition mutation."""
import importlib.util,json,subprocess,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

class EquipmentCatalogTests(unittest.TestCase):
 def module(self):
  spec=importlib.util.spec_from_file_location('equipment_catalog',ROOT/'backend/equipment_catalog.py')
  module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);return module
 def test_only_designated_processes_and_model_uncertainty(self):
  m=self.module();k=m.equipment_for('KNEADING');x=m.equipment_for('MIXING')
  self.assertEqual(k['model'],'NEP-0.5K');self.assertIsNone(x['model'])
  self.assertIn('미확정',x['displayName'])
  for t in ['OTHER','ROLL_MILL','SEM',None]:self.assertIsNone(m.equipment_for(t))
  k['model']='bad';self.assertEqual(m.equipment_for('KNEADING')['model'],'NEP-0.5K')
 def test_catalog_assets_and_sources_are_allowlisted(self):
  for kind in ['MIXING','KNEADING']:
   data=self.module().equipment_for(kind)
   self.assertTrue(data['sourceUrl'].startswith('https://kmtech.kr/bsr/board.php?bo_table=battery&wr_id='))
   photo=ROOT/'public'/data['photo'].lstrip('/')
   self.assertTrue(photo.is_file());self.assertEqual(photo.read_bytes()[:3],b'\xff\xd8\xff')
   self.assertIn('모델별',data['specificationNote'])
 def test_browser_catalog_and_dialog_are_read_only_and_safe(self):
  result=subprocess.run(['node',str(ROOT/'tests/equipment_catalog_browser.cjs'),str(ROOT)],capture_output=True,text=True,encoding='utf-8')
  self.assertEqual(result.returncode,0,result.stderr)

if __name__=='__main__':unittest.main()
