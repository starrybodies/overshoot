"""Check every added trade observation against the retained, hashed API response."""
from pathlib import Path
from collections import Counter
import gzip,json,hashlib,math

BASE=Path(__file__).resolve().parent; ROOT=BASE.parents[2]
table=json.loads(gzip.decompress((ROOT/'public/data/v15/trade.json').read_bytes()))
manifest=json.loads((BASE/'raw/comtrade/manifest.json').read_text())
raw={}; requested={}; checked=0
for m in manifest:
 assert m['status']==200, 'A failed upstream query must be reviewed before publication.'
 payload=gzip.decompress((BASE/'raw/comtrade'/m['file']).read_bytes())
 assert hashlib.sha256(payload).hexdigest()==m['sha256']
 rows=json.loads(payload).get('data',[])
 assert len(rows)<500, 'Review capped responses before including them.'
 raw['release15/raw/comtrade/'+m['file']]=rows
 requested[m['reporter']]=requested.get(m['reporter'],set())|set(m['commodities'])
assert len(requested)==24 and all(len(codes)==23 for codes in requested.values())
keys=set(); counts=Counter()
for r in table['flows']:
 key=tuple(r[k] for k in ('origin','destination','commodity','year','reported_flow','hs_revision'))
 assert key not in keys;keys.add(key)
 assert r['tonnes']>0 and math.isfinite(r['tonnes']) and r['reported_flow']=='X'
 assert r['reporter']==r['origin'] and r['origin']!=r['destination']
 assert r['is_net_weight_estimated'] is False and r['original_unit']=='kg'
 assert r['tonnes']==r['original_value']/1000
 counts[r['reporter']]+=1
 if r['snapshot'] in raw:
  n=raw[r['snapshot']][r['row_index']]
  assert r['original_value']==n['netWgt'] and r['year']==n['refYear']
  assert r['commodity']==n['cmdCode'] and r['hs_revision']==n['classificationCode']
  for a,b in [('is_net_weight_estimated','isNetWgtEstimated'),('is_reported','isReported'),('is_aggregate','isAggregate'),('is_original_classification','isOriginalClassification'),('legacy_estimation_flag','legacyEstimationFlag')]:assert r[a]==n[b]
  assert n['partner2Code']==0 and n['customsCode']=='C00' and n['motCode']==0
  checked+=1
assert checked==5895 and len(table['flows'])==10514
assert sorted(counts)==table['reporters'] and len(counts)==31
assert len(table['commodities'])==23
report=dict(status='PASS',records=len(table['flows']),reporters=len(counts),commodities=len(table['commodities']),newSourceRowsChecked=checked,hashedSnapshots=len(raw),requestedReporterProductPairs=sum(map(len,requested.values())),checks=['Source hash and native row match','No duplicate bilateral export observations','Original weight, HS revision and all retained flags','No missing, zero or estimated net weights','Country, product and dimensional filters','All 24 acquisition reporters and 23 requested products reviewed'])
(BASE/'trade-validation.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
