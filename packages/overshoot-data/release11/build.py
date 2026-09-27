"""Build a coverage index from retained evidence; never infer an absent value."""
import json,gzip,hashlib,re
from pathlib import Path
from collections import Counter,defaultdict
ROOT=Path(__file__).resolve().parents[3]
def read(f):
 p=ROOT/f
 return json.loads(gzip.decompress(p.read_bytes()) if p.suffix=='.gz' else p.read_text())
old={c['id']:c for c in read('public/data/v2/countries.json')}
table=read('packages/overshoot-data/expanded/trade/raw/un-m49-table.json')
directory={}
for r in table[1:]:
 if not re.fullmatch('[A-Z]{3}',r[11]) or not re.fullmatch('[A-Z]{2}',r[10]):continue
 if r[11] in directory:continue
 c=dict(old.get(r[11],{}));c.update(id=r[11],name=c.get('name',r[8]),numeric=r[9],alpha2=r[10],region=r[3],subregion=r[5]);directory[c['id']]=c
for id,c in old.items():
 if id!='WORLD' and id not in directory:directory[id]=dict(c,alpha2='TW' if id=='TWN' else '',region='Asia' if id=='TWN' else 'Other areas',subregion='')
coverage=defaultdict(lambda:{'accounts':[], 'metrics':{},'trade':{},'basel':{},'sites':{}})
for year in range(1970,2025):
 p=ROOT/f'public/data/v2/resources/{year}.json'
 if p.exists():
  for r in read(str(p.relative_to(ROOT)))['rows']:
   if any(r.get(k) is not None for k in ['extraction','imports','exports','domesticConsumption']):coverage[r['country']]['accounts'].append(year)
metrics=['in_use_stock','food_waste','municipal_waste_generated','municipal_waste_recycled','municipal_recycling_rate','ewaste_generated','plastic_waste_generated']
for r in read('public/data/v3/metrics-latest.json')['records']:
 if r['metric'] in metrics:coverage[r['country']]['metrics'][r['metric']]=r['year']
def count_trade(rows,copper=False):
 for r in rows:
  if r.get('reported_flow','X')!='X' and not copper:continue
  # Copper uses own declarations, other materials use selected exporters' reports.
  pairs=[(r['reporter'],'out' if r['reported_flow']=='X' else 'in')] if copper else [(r['origin'],'out'),(r['destination'],'in')]
  if r.get('reported_flow','X')=='X':pairs.append(('WORLD','out'))
  for id,d in pairs:
   key=r['commodity']+'-'+d;coverage[id]['trade'][key]=coverage[id]['trade'].get(key,0)+1
count_trade([r for r in read('public/data/v2/trade.json')['flows'] if not r['commodity'].startswith('74') and r['commodity']!='2603'])
for p in sorted((ROOT/'public/data/v6/copper').glob('*.json.gz')):count_trade(read(str(p.relative_to(ROOT)))['flows'],True)
for year in [2023,2024]:
 for r in read(f'public/data/v10/basel-{year}.json.gz')['records']:
  for id,d in [(r['origin'],'out'),(r['destination'],'in'),('WORLD','out')]:
   key=str(year)+'-'+d;coverage[id]['basel'][key]=coverage[id]['basel'].get(key,0)+1
for kind in ['mining','landfill','wastewater','river']:
 for f in read(f'public/data/v2/{kind}-sites.geojson')['features']:
  for id in set([f['properties'].get('country'),'WORLD']):
   if id:coverage[id]['sites'][kind]=coverage[id]['sites'].get(kind,0)+1
out=ROOT/'public/data/v11'
(out/'countries.json').write_text(json.dumps(sorted(directory.values(),key=lambda c:c['name']),ensure_ascii=False,separators=(',',':')))
(out/'coverage.json').write_text(json.dumps({'method':'Availability in retained snapshots only. Counts are records, not a measure of all activity. No record is not zero.','countries':dict(coverage)},separators=(',',':')))
print('Directory:',len(directory),'countries and areas; coverage:',len(coverage),'geographies')
for id in ['WORLD','JPN','KEN','BRA','KIR','ATA']:
 c=coverage[id];print(id,'accounts',len(c['accounts']),'metrics',c['metrics'],'sites',c['sites'],'Basel',c['basel'])
