import copy
import unittest
from backend import data_workspace as work


class WorkspaceTransformTests(unittest.TestCase):
    def test_recipe_preserves_input_and_requires_explicit_unit_conversion(self):
        rows = [{'Q': 0.007, 'note': 'LFP'}, {'Q': '', 'note': ''}]
        original = copy.deepcopy(rows)
        result = work.transform(rows, {'dropEmpty': True, 'column': 'Q', 'outputColumn': 'capacity_mAh', 'factor': 1000, 'unit': 'mAh'})
        self.assertEqual(result['rows'], [{'Q': 0.007, 'note': 'LFP', 'capacity_mAh': 7.0}])
        self.assertEqual(rows, original)
        self.assertEqual(result['removedRows'], 1)

    def test_unknown_columns_invalid_factor_and_overwrite_rejected(self):
        for recipe in [{'column':'missing','outputColumn':'x','factor':1,'unit':'V'},
                       {'column':'Q','outputColumn':'Q','factor':1,'unit':'Ah'},
                       {'column':'Q','outputColumn':'x','factor':float('nan'),'unit':'Ah'}]:
            with self.subTest(recipe=recipe), self.assertRaises(ValueError):
                work.transform([{'Q':1}], recipe)

    def test_non_numeric_values_preserved_and_reported_not_guessed(self):
        result = work.transform([{'Q':'bad'}, {'Q':None}, {'Q':0}], {'column':'Q','outputColumn':'converted','factor':2,'unit':'mAh'})
        self.assertEqual(result['rows'][0]['Q'], 'bad')
        self.assertIsNone(result['rows'][0]['converted'])
        self.assertEqual(result['invalidValues'], 1)
        self.assertEqual(result['rows'][2]['converted'], 0)

    def test_material_alias_is_candidate_not_automatic_assignment(self):
        self.assertEqual(work.material_candidate('LiFePO4'), 'LFP')
        self.assertEqual(work.material_candidate('LFP + NCM'), '')
        self.assertEqual(work.material_candidate('unknown'), '')

    def test_profile_strict_fields_training_default_not_granted(self):
        self.assertEqual(work.validate_profile({'material':'LiFePO4'})['material'], 'LiFePO4')
        for value in [{'ownerId':'other'}, {'trainingAllowed':True}, {'tags':['x']*21}]:
            with self.assertRaises(ValueError):
                work.validate_profile(value)

if __name__ == '__main__':
    unittest.main()
