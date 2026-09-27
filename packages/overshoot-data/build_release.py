"""Release 3: new treatment accounts, corrected reuse gates, immutable inherited data.
Run after build_expansion.py. Source snapshots stay offline. Public withdrawals are
explicitly listed rather than hidden behind a UI-only restriction.
"""
from pathlib import Path
from collections import Counter
import json,hashlib,shutil
BASE=Path(__file__).resolve().parent
ROOT=BASE.parent.parent
V2=ROOT/'public/data/v2'; OUT=ROOT/'public/data/v3'
def read(p):return json.loads(p.read_text())
def write(p,v):
 p.parent.mkdir(parents=True,exist_ok=True)
 p.write_text(json.dumps(v,separators=(',',':'),ensure_ascii=False,allow_nan=False))
def build():
 OUT.mkdir(parents=True,exist_ok=True)
 sources={r['id']:r for r in read(V2/'sources.json')}
 for file in ['destinations/sources.json','basel-methods/source-registry.json']:
  for row in read(BASE/'expanded'/file):sources[row['id']]=row
 for source in sources.values():
  if source['id'].startswith('eurostat-'):
   source['license']='Eurostat reuse with attribution, including commercial reuse, subject to its geographic and third-party exceptions: https://ec.europa.eu/eurostat/web/main/help/copyright-notice . Public outputs exclude non-EU/EFTA/official-candidate country records covered by those exceptions.'
  if source['id'] in ['eurostat-waste-treatment','eurostat-weee']:
   source['integration']='Source-native treatment accounts displayed in Discard, including actual years, confidential gaps, native operation codes and country-specific methodological notes.'
 write(OUT/'sources.json',list(sources.values()))
 for name in ['treatment.json','weee-treatment.json']:
  artifact=read(BASE/'expanded/destinations/normalized'/name)
  assert artifact['source_id'] in sources
  for row in artifact['records']:
   assert row['source_id']==artifact['source_id']
   assert all(code in row['source_cells'] for code in row['values'])
  write(OUT/name,artifact)
 # Withdraw restricted distribution, retaining the private audit/adapter inputs.
 withdrawn=[]
 for p in [V2/'basel.json',*list((V2/'basel').glob('*.json'))]:
  if p.exists():withdrawn.append(str(p.relative_to(ROOT/'public/data')));p.unlink()
 if (V2/'basel').exists(): (V2/'basel').rmdir()
 # Previous Eurostat municipality subset included Kosovo, an exception to reuse.
 source_metrics=read(BASE/'expanded/waste/metrics.json')['records']
 xkx=[r for r in source_metrics if r['country']=='XKX' and not r['source_id'].startswith('eurostat-')]
 write(OUT/'metrics/XKX.json',{'country':'XKX','records':xkx,'coverage_note':'Eurostat records withheld pending reuse permission under geographic exceptions.'})
 latest=read(BASE/'expanded/waste/atlas-metrics-latest.json')
 removed=[r for r in latest['records'] if r['country']=='XKX' and r['source_id'].startswith('eurostat-')]
 latest['records']=[r for r in latest['records'] if r not in removed]
 write(OUT/'metrics-latest.json',latest)
 for p in [V2/'metrics/XKX.json',V2/'metrics-latest.json']:
  if p.exists():withdrawn.append(str(p.relative_to(ROOT/'public/data')));p.unlink()
 manifest={'version':'3.0.0','retrieved':'2026-09-19','canonical_mass_unit':'metric tonnes','inherits':'v2 (unchanged artifacts listed by checksum below)','withdrawals':{'paths':withdrawn,'reason':'Basel derivative publication requires permission; Eurostat geographic exceptions remove Kosovo observations from public distribution.'},'counts':{'sources':len(sources),'sources_by_status':dict(Counter(s['status'] for s in sources.values())),'treatment_groups':len(read(OUT/'treatment.json')['records']),'weee_groups':len(read(OUT/'weee-treatment.json')['records']),'new_canonical_cells':20502,'latest_country_metrics':len(latest['records'])},'artifacts':{str(p.relative_to(ROOT/'public/data')):{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for folder in [V2,OUT] for p in folder.rglob('*') if p.is_file() and p.name!='manifest.json'}}
 # Stable withdrawal listing also covers a repeated build after files are removed.
 manifest['withdrawals']['paths']=['v2/basel.json','v2/basel/*.json','v2/metrics/XKX.json','v2/metrics-latest.json']
 write(OUT/'manifest.json',manifest)
 print(json.dumps(manifest['counts']))
if __name__=='__main__':build()
