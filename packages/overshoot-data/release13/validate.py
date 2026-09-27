"""Verify every published energy value against the retained original records."""
import collections,csv,gzip,json,math,pathlib
from energy_config import EIA,JODI
HERE=pathlib.Path(__file__).parent;ROOT=HERE.parents[2];OUT=ROOT/'public/data/v13/energy'
catalog=json.loads((OUT/'catalog.json').read_text());ids={c['id'] for c in json.loads((ROOT/'public/data/v11/countries.json').read_text())}
source={}
for line in gzip.open(HERE/'raw/eia-original-series.jsonl.gz','rt'):
 s=json.loads(line);source[s['series_id']]=s
jodi={}
for r in csv.DictReader(gzip.open(HERE/'raw/jodi-original-rows.csv.gz','rt')):
 key=(r['REF_AREA'],r['TIME_PERIOD'],r['ENERGY_PRODUCT'],r['FLOW_BREAKDOWN'],r['UNIT_MEASURE']);assert key not in jodi
 jodi[key]=r
alpha={c['id']:c['alpha2'] for c in json.loads((ROOT/'public/data/v11/countries.json').read_text())}
numeric=0;missing=0;zeros=0;negatives=[]
for meta in catalog['measures']:
 d=json.loads((OUT/(meta['id']+'.json')).read_text());seen=set();counts=collections.Counter()
 for r in d['rows']:
  key=(r['country'],r['period']);assert key not in seen;seen.add(key)
  assert r['country'] in ids|{'WORLD'}
  s=d['series'][r['country']]
  if meta['sourceId'].startswith('eia'):
   original=source[s['series_id']];raw=dict(original['data'])[r['period']]
   assert original['copyright']=='None'
   assert s['series_id'].split('-')[2]==('WORL' if r['country']=='WORLD' else r['country'])
   assert raw==r['rawValue'];expected=raw*meta['factor'] if isinstance(raw,(int,float)) else None
  else:
   _,product,flow,_=s['series_id'].split('/');original=jodi[(alpha[r['country']],r['period'],product,flow,'KBD')]
   assert original['OBS_VALUE']==r['rawValue'];assert original['ASSESSMENT_CODE']==r['flag'];assert r['flag'] in d['assessments']
   try:expected=float(original['OBS_VALUE'])*1000
   except ValueError:expected=None
  assert r['value']==expected,(meta['id'],key,r['value'],expected)
  if expected is None:missing+=1
  else:
   assert math.isfinite(expected);numeric+=1;zeros+=expected==0
   if expected<0:negatives.append([meta['id'],*key,expected])
   if r['country']!='WORLD':counts[r['period']]+=1
 assert dict(sorted(counts.items()))==dict(sorted(meta['coverageByPeriod'].items()))
 assert meta['latestPeriod']==max(counts)
 if meta['frequency']=='annual':assert counts[meta['defaultPeriod']]>=max(counts.values())*.9
 assert len(d['rows'])==len(seen)
coverage=json.loads((OUT/'coverage.json').read_text())
for country in ['SAU','ARE','IRN','IRQ','QAT','KWT','OMN','BHR']:
 for measure,year in [('crude-production','2025'),('gas-production','2024')]:
  assert coverage[country][measure]['period']==year
  assert coverage[country][measure]['value']>0
assert numeric==catalog['numericRecords'];assert len(set(coverage)-{'WORLD'})==catalog['countries']
# An absent JODI value must not acquire EIA's annual value or become zero.
ae=json.loads((OUT/'monthly-crude-production.json').read_text())
assert next(r for r in ae['rows'] if r['country']=='ARE' and r['period']=='2026-06')['value'] is None
assert coverage['SAU']['coal-production']['value']==0  # An actual source zero survives.
report={'result':'PASS','numericObservations':numeric,'missingMarkersPreserved':missing,'reportedZerosPreserved':zeros,'negativeSourceValues':negatives,'measures':len(catalog['measures']),'countriesAcrossHistory':catalog['countries'],'middleEastChecks':16,'sourceValueChecks':'Every published row checked against its original EIA series or JODI CSV row.'}
(HERE/'validation.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
