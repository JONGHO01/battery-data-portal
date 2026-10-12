"""DRT stays inside the existing protected analysis contract."""
import unittest
from unittest.mock import patch
from fastapi import HTTPException
import python_backend as portal
from tests.test_eis_drt import spectrum


class DrtApiTests(unittest.TestCase):
    def test_health_advertises_spectrum_selection_capability(self):
        self.assertIs(portal.health()["eisDrtSpectrumSelection"], True)
        self.assertEqual(portal.health()["eisDrtAnalysisVersion"], "rc-drt-4")

    def test_selected_spectrum_provenance_and_invalid_index_controlled_error(self):
        rows = [dict(row, sweep=sweep) for sweep in (1, 2) for row in spectrum()[:8]]
        item = {"id": "DRT-SELECT", "dataType": "eis", "rows": rows}
        result, provenance = portal.run_dataset_analysis(item, "eis-drt", {"M": 20, "spectrumIndex": 1})
        self.assertEqual(result["metadata"]["spectrumIndex"], 1)
        self.assertEqual(result["metadata"]["spectrumCount"], 2)
        self.assertEqual([p["rowIndex"] for p in result["reconstruction"]], list(range(8, 16)))
        self.assertEqual(provenance["sourceDatasetId"], "DRT-SELECT")
        self.assertEqual(provenance["analysisVersion"], result["metadata"]["analysisVersion"])
        for index in [True, "1", -1, 2]:
            with self.subTest(index=index), self.assertRaises(HTTPException) as raised:
                portal.run_dataset_analysis(item, "eis-drt", {"M": 20, "spectrumIndex": index})
            self.assertEqual(raised.exception.status_code, 400)

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
