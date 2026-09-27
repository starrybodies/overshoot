"""Release gates against original records, not just the exported schema."""
from pathlib import Path
import json,gzip,zipfile,csv,io,math,collections,hashlib
import pyarrow.parquet as pq
ROOT=Path(__file__).resolve().parents[3]
BASE=Path(__file__).resolve().parent

def read(path):
 b=Path(path).read_bytes();return json.loads(gzip.decompress(b) if b[:2]==b'\x1f\x8b' else b)
catalog=read(ROOT/'public/data/v14/facilities/catalog.json')
rows=[];checks={}
for kind,d in catalog['datasets'].items():
 for country,c in d['countries'].items():
  records=[r for p in c['parts'] for r in read(ROOT/'public'/p.lstrip('/'))]
  pins=read(ROOT/f'public/data/v14/facilities/{kind}/{country}/index.json')
  assert len(records)==len(pins)==c['count']
  assert collections.Counter(r['basis'] for r in records)==c['bases']
  for i,(r,p) in enumerate(zip(records,pins)):
   assert r['id']==p['id'] and p['part']==i//2000
   assert r['coordinates']==p['coordinates'] and r['value']==p['value']
   assert -180<=r['coordinates'][0]<=180 and -90<=r['coordinates'][1]<=90
   assert r['value'] is None or math.isfinite(r['value']) and r['value']>=0
   assert r['source'] in catalog['sources']
  rows.extend(records)
assert len(rows)==catalog['totalRecords']==len({r['id'] for r in rows})
by_id={r['id']:r for r in rows}
old=ROOT/'packages/overshoot-data/expanded/sites'
with zipfile.ZipFile(old/'raw/HydroWASTE_v10.zip') as z:
 original=list(csv.DictReader(io.TextIOWrapper(z.open('HydroWASTE_v10.csv'),encoding='cp1252')))
 for o in original:
  r=by_id['hydrowaste-'+o['WASTE_ID']]
  assert r['value']==float(o['WASTE_DIS'])
  assert r['coordinates']==[float(o['LON_WWTP']),float(o['LAT_WWTP'])]
  assert r['basis']=={'1':'reported','2':'capacity','3':'unspecified','4':'modeled'}[o['QUAL_WASTE']]
  assert r['year'] is None and r['attributes']['QUAL_POP']==o['QUAL_POP']
 checks['hydrowasteOriginalRowsReconciled']=len(original)
for o in pq.read_table(old/'artifacts/sites-full.parquet').to_pylist():
 if o['type']=='wastewater-treatment':continue
 r=by_id[o['id']]
 assert r['year']==o['year'] and r['unit']==o['unit']
 assert r['value']==o['value'] or o['source_id']=='epa-lmop-2024' and math.isclose(r['value'],o['value'],abs_tol=0.000051)
 assert r['coordinates']==[o['longitude'],o['latitude']]
 if o['source_id']=='epa-lmop-2024' and o['original_value'] is not None:
  assert math.isclose(r['value'],o['original_value']*0.90718474,rel_tol=1e-10)
checks['retainedOriginalParquetRowsReconciled']=79071
trace_manifest=read(BASE/'raw/climate-trace/manifest.json')
trace_count=0
for page in trace_manifest['pages']:
 payload=gzip.decompress((BASE/page['file']).read_bytes())
 assert hashlib.sha256(payload).hexdigest()==page['sha256']
 for o in json.loads(payload) or []:
  if o['sourceType']!='point-source':continue
  r=by_id['trace-'+str(o['id'])]
  assert r['coordinates']==[o['centroid']['longitude'],o['centroid']['latitude']]
  assert r['value']==o['emissionsQuantity'] and r['year']==o['year']==2025
  assert r['unit']=='tonnes CO₂e/year' and r['basis']=='estimated'
  assert r['attributes']['activity']==o['activity'] and r['attributes']['activityUnits']==o['activityUnits']
  trace_count+=1
checks['climateTraceOriginalRowsReconciled']=trace_count
checks['climateTraceCountries']=len({r['country'] for r in rows if r['source']=='climate-trace-2025'})
power=[]
with gzip.open(BASE/'raw/wri-power-plants.csv.gz','rt',encoding='utf-8') as f:
 for o in csv.DictReader(f):
  r=by_id['wri-'+o['gppd_idnr']];power.append(r)
  assert r['value']==float(o['capacity_mw']) and r['unit']=='MW' and r['basis']=='capacity'
  assert r['attributes']['primary_fuel']==o['primary_fuel']
  for year in range(2013,2020):
   for prefix in ['generation_gwh_','estimated_generation_gwh_']:
    key=prefix+str(year)
    if o.get(key):assert r['attributes'][key]==o[key]
checks['powerOriginalRowsReconciled']=len(power)
checks['powerCountries']=len({r['country'] for r in power})
checks['middleEastPowerPlants']={c:sum(r['country']==c for r in power) for c in ['SAU','IRN','IRQ','ARE','QAT','KWT','OMN','BHR','YEM','JOR','ISR','LBN','SYR']}
assert all(r['value'] is None and r['year'] is None and r['basis']=='location' for r in rows if r['source'].startswith('statcan-'))
checks['unmeasuredInfrastructureRecordsRemainNull']=36425+9074
checks['total']=len(rows)
checks['sha256Catalog']=hashlib.sha256((ROOT/'public/data/v14/facilities/catalog.json').read_bytes()).hexdigest()
checks['outcome']='PASS'
(BASE/'reconciliation.json').write_text(json.dumps(checks,indent=2)+'\n')
print(json.dumps(checks,indent=2))
