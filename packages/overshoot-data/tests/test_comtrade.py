import importlib.util
import pathlib
import unittest
spec=importlib.util.spec_from_file_location('adapter',pathlib.Path(__file__).parents[1]/'pipeline/comtrade.py')
adapter=importlib.util.module_from_spec(spec);spec.loader.exec_module(adapter)
class ComtradeTest(unittest.TestCase):
 def test_reported_weights_direction_and_gaps(self):
  base=dict(reporterISO='USA',partnerISO='CAN',flowCode='M',cmdCode='3915',refYear=2022,classificationCode='H6',netWgt=2400)
  rows=adapter.normalize_response({'data':[base,{**base,'netWgt':None},{**base,'isNetWgtEstimated':True},{**base,'partnerISO':'W00'}]})
  self.assertEqual(len(rows),1);self.assertEqual(rows[0]['tonnes'],2.4);self.assertEqual(rows[0]['origin'],'CAN');self.assertEqual(rows[0]['destination'],'USA');self.assertEqual(rows[0]['hs_revision'],'H6')
 def test_negative_weight_rejected(self):
  with self.assertRaises(ValueError):adapter.normalize_response({'data':[{'netWgt':-1}]})
if __name__=='__main__':unittest.main()
