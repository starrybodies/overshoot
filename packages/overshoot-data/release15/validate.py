"""Reconcile release artifacts with native source observations and their lineage."""
from pathlib import Path
import json,gzip,csv,io,zipfile,hashlib,math
from collections import Counter
ROOT=Path(__file__).resolve().parents[3];BASE=Path(__file__).resolve().parent;PUB=ROOT/'public';OUT=PUB/'data/v15'
def read(p):
 b=p.read_bytes();return json.loads(gzip.decompress(b) if b[:2]==b'\x1f\x8b' else b)
def pins(index):
 if isinstance(index,list):return index
 return [{k:index['dictionaries'][k][row[i]] if k in index['dictionaries'] else row[i] for i,k in enumerate(index['fields'])} for row in index['rows']]
cat=read(OUT/'facilities/catalog.json');ids=set();record_count=0;trace_count=0
manifest=read(BASE/'raw/climate-trace/manifest.json');native={}
for page in manifest['pages']:
 raw=gzip.decompress((BASE/page['file']).read_bytes());assert hashlib.sha256(raw).hexdigest()==page['sha256']
 for r in json.loads(raw) or []:
  if r['id'] in native:assert native[r['id']]==r
  native[r['id']]=r
new_ids=set()
for kind,dataset in cat['datasets'].items():
 world=pins(read(PUB/dataset['world']['index'].lstrip('/')));assert len(world)==dataset['count']
 assert len({p['id'] for p in world})==len(world)
 world_by_id={p['id']:p for p in world}
 for iso,entry in dataset['countries'].items():
  country=pins(read(PUB/entry['index'].lstrip('/')));assert len(country)==entry['count'];country_by_id={p['id']:p for p in country}
  rows=[]
  for part,path in enumerate(entry['parts']):
   chunk=read(PUB/path.lstrip('/'));assert len(chunk)<=2000
   for r in chunk:
    assert r['id'] not in ids;ids.add(r['id']);record_count+=1
    assert r['kind']==kind and r['country']==iso and r['source'] in cat['sources']
    x,y=r['coordinates'];assert -180<=x<=180 and -90<=y<=90 and math.isfinite(x+y)
    pin=country_by_id[r['id']];assert pin['part']==part and pin==world_by_id[r['id']]
    assert {k:v for k,v in pin.items() if k!='part'}=={k:v for k,v in r.items() if k not in ('kind','attributes','sourceRow')}
    if r['source']=='climate-trace-2025':
     trace_count+=1;source=native.get(int(r['sourceRow']))
     if source:
      assert source['sourceType']=='point-source';assert r['value']==source['emissionsQuantity'] and r['year']==source['year']
      assert r['coordinates']==[source['centroid']['longitude'],source['centroid']['latitude']]
      assert r['type'] and r['basis']=='estimated' and r['unit']=='tonnes CO₂e/year'
      assert r['attributes']['subsector']==source['subsector'];new_ids.add(source['id'])
      for key in ('activity','activityUnits','capacity','capacityUnits'):assert r['attributes'].get(key)==source.get(key)
   rows.extend(chunk)
  assert len(rows)==entry['count']
 assert sum(e['count'] for e in dataset['countries'].values())==dataset['count']
expected={r['id'] for r in native.values() if r['sourceType']=='point-source'}
assert new_ids==expected and record_count==cat['totalRecords']
print('PASS facilities:',record_count,'records;',len(new_ids),'additional native point-source observations;',trace_count,'total TRACE records',flush=True)
# Independently compare sampled source rows for every product, every decade,
# and each world total with the original full FAO CSV (no derived-file fixture).
samples={'forestry':{},'agriculture':{}};production_count=0
for p in (OUT/'production/items').glob('*.json'):
 rows=read(p);production_count+=len(rows);assert len({(r['country'],r['year']) for r in rows})==len(rows)
 for r in rows:
  assert r['value'] is None or math.isfinite(r['value']) and r['value']>=0
  assert r['unit'] in ('tonnes','m³') and 1970<=r['year']<=2024
  if r['country']=='WORLD' or r['year'] in (1970,1980,1990,2000,2010,2020,2024) and r['country'] in ('CAN','IND','CHN','BRA','ZAF'):
   group='forestry' if r['source_id']=='faostat-forestry-2026' else 'agriculture';samples[group][r['sourceRow']]=r
checked=0
for group,archive in [('forestry',ROOT/'packages/overshoot-data/release12/raw/faostat-forestry.zip'),('agriculture',ROOT/'packages/overshoot-data/expanded/resources/raw/faostat-qcl.zip')]:
 with zipfile.ZipFile(archive) as z:
  for i,native in enumerate(csv.DictReader(io.TextIOWrapper(z.open(next(n for n in z.namelist() if '(Normalized)' in n)),encoding='utf-8-sig')),2):
   r=samples[group].get(i)
   if r:
    assert r['item_code']==native['Item Code'] and r['year']==int(native['Year']) and r['source_flag']==native['Flag'] and r['original_unit']==native['Unit']
    assert r['value']==(float(native['Value']) if native['Value'] else None)
    assert r.get('note','')==native.get('Note','');checked+=1
assert checked==sum(len(s) for s in samples.values())
print('PASS production:',production_count,'observations;',checked,'records independently checked against native CSV fields',flush=True)
report=dict(status='PASS',facilityRecords=record_count,addedNativePointSources=len(new_ids),traceRecords=trace_count,productionRecords=production_count,productionSourceRowsChecked=checked,checks=['Valid coordinate bounds','Unique source IDs; provider overlap retained','Country and global index/detail agreement','Original point-source estimates, gas units and restricted native fields','Original production value, units, flags, notes and source row','No interpolation or parent/child aggregation'])
(BASE/'validation.json').write_text(json.dumps(report,indent=2)+'\n')
