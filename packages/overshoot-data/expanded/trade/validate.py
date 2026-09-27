"""Validate acquired artifacts against their raw snapshots and source registry."""
from pathlib import Path
import json,math,decimal,collections,hashlib
ROOT=Path(__file__).resolve().parent

def validate():
 source_ids={s['id'] for s in json.loads((ROOT/'source-registry.json').read_text())}
 d=json.loads((ROOT/'trade.json').read_text());seen=set();cache={}
 for m in json.loads((ROOT/'snapshots.json').read_text()):
  if m['status']==200:assert hashlib.sha256((ROOT/'raw'/m['file']).read_bytes()).hexdigest()==m['sha256']
 for flow in d['flows']:
  k=tuple(flow[x] for x in ['origin','destination','commodity','year','reporter','reported_flow','hs_revision']);assert k not in seen;seen.add(k)
  assert flow['source_id'] in source_ids and flow['is_net_weight_estimated'] is False
  assert flow['tonnes']>0 and math.isfinite(flow['tonnes'])
  path=flow['snapshot']
  if path not in cache:cache[path]=json.loads((ROOT/'raw'/path).read_text())['data']
  raw=cache[path][flow['row_index']]
  assert raw['netWgt']==flow['original_value'] and raw['isNetWgtEstimated'] is False
  assert raw['netWgt']/1000==flow['tonnes']
  assert str(raw['cmdCode'])==flow['commodity'] and raw['refYear']==flow['year']
  assert raw['partner2Code']==0 and raw['customsCode']=='C00' and raw['motCode']==0
  assert flow['origin']!=flow['destination'] and flow['reported_flow']=='X'
 b=json.loads((ROOT/'basel.json').read_text());ids=set();records={};routekeys=set()
 for r in b['records']:
  assert r['id'] not in ids;ids.add(r['id']);records[r['id']]=r
  assert r['source_id'] in source_ids
  assert decimal.Decimal(r['original_value'].strip())==decimal.Decimal(str(r['tonnes']))
  path=r['snapshot']
  if path not in cache:cache[path]=json.loads((ROOT/'raw'/path).read_text())['value']
  raw=cache[path][r['row_index']]
  assert raw['Amount']==r['original_value'] and raw['SectionNumber']==r['section_number']
 for route in b['flows']:
  k=(route['origin'],route['destination'],route['year']);assert k not in routekeys;routekeys.add(k)
  total=decimal.Decimal(0)
  for identifier in route['record_ids']:
   r=records[identifier];assert (r['origin'],r['destination'],r['year'])==k;total+=decimal.Decimal(r['original_value'].strip())
  assert float(total)==route['tonnes']
 report={'checks_passed':True,'comtrade_flow_count':len(d['flows']),'comtrade_reporters':len(d['reporters']),'comtrade_partner_count':len({r['destination'] for r in d['flows']}),'comtrade_commodities':len({r['commodity'] for r in d['flows']}),'basel_record_count':len(b['records']),'basel_route_year_count':len(b['flows']),'basel_reporter_count':len(b['reporters']),'basel_exclusions':b['exclusions'],'comtrade_exclusions':d['exclusions'],'checks':['Raw snapshots SHA256','Unique physical-trade keys','Non-estimated net-weight flag','Exact kg-to-tonne conversion','No world/self/ambiguous partners','Source registry resolution','Unique Basel survey sections','Exact Basel raw tonne values','Exact route aggregation and lineage']}
 (ROOT/'checks.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
if __name__=='__main__':validate()
