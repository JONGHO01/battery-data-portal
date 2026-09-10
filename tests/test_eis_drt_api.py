"""DRT stays inside the existing protected analysis contract."""
import unittest
from unittest.mock import patch
from fastapi import HTTPException
import python_backend as portal
from tests.test_eis_drt import spectrum


class DrtApiTests(unittest.TestCase):
    def test_existing_analysis_dispatch_preserves_review_rows_and_provenance(self):
        rows = spectrum()
        rows[0]["analysis_include"] = False
        item = {"id":"DRT-TEST","dataType":"eis","rows":rows}
        with patch.object(portal,"load_analysis_rows",wraps=portal.load_analysis_rows) as load:
            result, provenance = portal.run_dataset_analysis(item,"eis-drt",{})
        self.assertTrue(load.call_args.args[1])
        self.assertEqual(result["quality"]["validCount"],161)
        self.assertEqual(provenance["sourceDatasetId"],"DRT-TEST")
        self.assertEqual(len(rows),161)

    def test_non_eis_and_invalid_parameters_rejected_with_controlled_error(self):
        for item, parameters in [({"id":"x","dataType":"cyc","rows":spectrum()},{}),
                                 ({"id":"x","dataType":"eis","rows":spectrum()},{"M":9999})]:
            with self.assertRaises(HTTPException) as raised:
                portal.run_dataset_analysis(item,"eis-drt",parameters)
            self.assertEqual(raised.exception.status_code,400)
