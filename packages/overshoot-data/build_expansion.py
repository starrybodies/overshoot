"""Publish browser-sized v2 artifacts from pinned research snapshots.
Each publisher remains a separate account. No regional substitution or missing=0.
"""
from pathlib import Path
from collections import defaultdict,Counter
import json,hashlib,shutil,math
import duckdb,pyarrow as pa
from restore_snapshots import restore
BASE=Path(__file__).resolve().parent
ROOT=BASE.parent.parent
EXP=BASE/'expanded'; OUT=ROOT/'public/data/v2'

def read(path):return json.loads(path.read_text())
def write(path,value):
 path.parent.mkdir(parents=True,exist_ok=True)
 path.write_text(json.dumps(value,separators=(',',':'),ensure_ascii=False,allow_nan=False))
def build():
 restore()
 OUT.mkdir(parents=True,exist_ok=True)
 for name in ['extraction','geography','graticule','scenes']:
  shutil.copyfile(ROOT/f'public/data/v1/{name}.json',OUT/f'{name}.json')
 sources={r['id']:r for r in read(ROOT/'public/data/v1/sources.json')}
 write(OUT/'countries.json',read(ROOT/'public/data/v1/extraction.json')['countries'])
 paths=['resources/sources.json','resources/research-catalog.json','sites/source-registry.json','waste/sources.json','trade/source-registry.json']
 for path in paths:
  if not (EXP/path).exists():continue
  for original in read(EXP/path):
   r=dict(original)
   if r.get('integrationStatus')=='catalogued' and r['status']!='blocked' or r.get('acquisitionStatus')=='registered':r['status']='catalogued'
   r['topics']=r.get('scenes',[])
   limitations=r.get('limitations',[])
   r['accessNote']=r.get('blocker') or r.get('notes') or (' '.join(limitations) if isinstance(limitations,list) else limitations)
   r['integration']='Catalogued; no normalized observations in this atlas.' if r['status']=='catalogued' else 'No display data. See the access and method notes.' if r['status']=='blocked' else 'Pinned source snapshot. Country, year and unit limits are retained.'
   if r.get('acquisitionStatus')=='acquired' and r['id']=='unitar-gem-2024':
    r['integration']='Methodology report acquired. Country observations use the separately cited UN SDG series; report tables are not republished.'
   sources[r['id']]=r
  # Source acquisition and visible integration are different statuses.
 for source_id,note in {
  'mat-stocks-eu-2025':'Detailed EU27 CSV acquired offline. The country atlas uses the broader MAT_STOCKS account to avoid duplicate stock totals.',
  'unsd-m49':'Official country-code metadata acquired for reporter/partner validation; no mass quantities.',
  'natural-earth':'Generalized country boundaries and graticule; cartographic context, not a mass dataset.'
 }.items():
  sources[source_id]['integration']=note
 # Every resource account is sharded by year; no global historical raw table enters browser.
 resources=read(EXP/'resources/resource-accounts.json')
 by_year=defaultdict(list)
 for row in resources['rows']:by_year[row['year']].append(row)
 for year,rows in by_year.items():write(OUT/f'resources/{year}.json',{'source_id':resources['source_id'],'unit':resources['unit'],'rows':rows})
 write(OUT/'resource-index.json',{'years':resources['years'],'coverage':resources['coverage'],'source_id':resources['source_id']})
 write(OUT/'agriculture.json',read(EXP/'resources/agriculture.json'))
 # Country shards retain all acquired observations, including flags and distinct source series.
 metrics=read(EXP/'waste/metrics.json')['records']; by_country=defaultdict(list)
 for r in metrics:
  assert r['source_id'] in sources,(r['source_id'],'missing source')
  assert isinstance(r['value'],(int,float)) and math.isfinite(r['value'])
  by_country[r['country']].append(r)
 for country,records in by_country.items():write(OUT/f'metrics/{country}.json',{'country':country,'records':records})
 write(OUT/'metrics-latest.json',read(EXP/'waste/atlas-metrics-latest.json'))
 write(OUT/'stock-components.json',read(EXP/'waste/stock-components.json'))
 history=read(EXP/'waste/stock-history.json'); stock_by_country=defaultdict(list)
 for row in history['records']:stock_by_country[row[0]].append(row)
 for country,records in stock_by_country.items():write(OUT/f'stock/{country}.json',{'source_id':history['source_id'],'columns':history['columns'],'unit':history['unit'],'records':records})
 # Original snapshots and records stay offline; browser flows retain a stable raw-row reference.
 if (EXP/'trade/trade.json').exists():
  trade=read(EXP/'trade/trade.json')
  write(OUT/'trade.json',trade)
  if (EXP/'trade/quality-notes.json').exists():write(OUT/'trade-quality.json',read(EXP/'trade/quality-notes.json'))
 if (EXP/'trade/basel.json').exists():
  basel=read(EXP/'trade/basel.json');write(OUT/'basel.json',{k:v for k,v in basel.items() if k!='records'})
  by_origin=defaultdict(list)
  for row in basel.get('records',[]):by_origin[row.get('origin','UNKNOWN')].append(row)
  for country,records in by_origin.items():write(OUT/f'basel/{country}.json',{'records':records})
 for name in ['river-sites','landfill-sites','mining-sites','wastewater-sites']:
  shutil.copyfile(EXP/f'sites/artifacts/{name}.geojson',OUT/f'{name}.geojson')
 # Export all quantitative records to Parquet for reproducible typed query services.
 con=duckdb.connect()
 simplified=[{k:r.get(k) for k in ['country','metric','year','value','unit','source_id','original_value','original_unit','estimated']}|{'lineage_json':json.dumps(r,separators=(',',':'))} for r in metrics]
 con.register('metrics',pa.Table.from_pylist(simplified))
 con.execute('COPY metrics TO ? (FORMAT PARQUET, COMPRESSION ZSTD)',[str(BASE/'artifacts/expanded-metrics-v2.parquet')])
 write(OUT/'sources.json',list(sources.values()))
 # Pin source and output checksums without generated duration noise.
 manifest={'version':'2.0.0','retrieved':'2026-09-19','canonical_mass_unit':'metric tonnes','counts':{'sources':len(sources),'sources_by_status':dict(Counter(r['status'] for r in sources.values())),'resource_country_years':len(resources['rows']),'metric_observations':len(metrics),'stock_history_rows':len(history['records']),'metrics_countries':len(by_country)},'artifacts':{str(p.relative_to(OUT)):{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in OUT.rglob('*') if p.is_file() and p.name!='manifest.json'},'snapshot_manifests':{str(p.relative_to(BASE)):hashlib.sha256(p.read_bytes()).hexdigest() for p in EXP.rglob('*.json') if 'snapshot' in p.name or p.name=='manifest.json'}}
 write(OUT/'manifest.json',manifest)
 print(json.dumps(manifest['counts']))
if __name__=='__main__':
 build()
 from build_release import build as publish_current_release
 publish_current_release()
