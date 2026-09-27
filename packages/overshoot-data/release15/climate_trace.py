"""Acquire a bounded, reproducible Climate TRACE point-source snapshot.

The public beta is queried sequentially, in large pages, once at release time.
Run with --refresh to replace the retained snapshot after reviewing upstream changes.
"""
from pathlib import Path
import sys, json, gzip, hashlib, urllib.request, urllib.parse, time

BASE=Path(__file__).resolve().parent
RAW=BASE/'raw/climate-trace'
RAW.mkdir(parents=True,exist_ok=True)
SUBSECTORS=['bauxite-mining','copper-mining','iron-mining','coal-mining','rock-quarrying','sand-quarrying','other-mining-quarrying','textiles-leather-apparel','wood-and-wood-products','food-beverage-tobacco','chemicals','other-chemicals','other-metals','lime','electricity-generation','oil-and-gas-transport','industrial-wastewater-treatment-and-discharge','domestic-wastewater-treatment-and-discharge','incineration-and-open-burning-of-waste','biological-treatment-of-solid-waste-and-biogenic']
LIMIT=5000
manifest={'publisher':'Climate TRACE','apiVersion':7,'retrievedAt':'2026-09-22','year':2025,'gas':'co2e_100yr','subsectors':SUBSECTORS,'pages':[],'method':'Sequential offset pagination until an empty page. Retain original responses; import only point-source records with valid coordinates. No live API dependency in the application.'}
seen={};offset=0;duplicate_rows=0
while True:
 url='https://api.climatetrace.org/v7/sources?'+urllib.parse.urlencode(dict(subsectors=','.join(SUBSECTORS),year=2025,gas='co2e_100yr',limit=LIMIT,offset=offset))
 path=RAW/f'{offset}.json.gz'
 if path.exists() and '--refresh' not in sys.argv:
  payload=gzip.decompress(path.read_bytes())
 else:
  with urllib.request.urlopen(url,timeout=90) as response:payload=response.read()
  path.write_bytes(gzip.compress(payload,mtime=0))
 rows=json.loads(payload)
 if rows is None:rows=[] # v7 returns JSON null after the last source.
 assert isinstance(rows,list), 'Unexpected API response'
 ids={r['id'] for r in rows}
 for r in rows:
  if r['id'] in seen:
   assert seen[r['id']]==r, 'Conflicting duplicate source IDs: stop and review.'
   duplicate_rows+=1
  seen[r['id']]=r
 manifest['pages'].append(dict(offset=offset,rows=len(rows),url=url,file=str(path.relative_to(BASE)),sha256=hashlib.sha256(payload).hexdigest()))
 print(f'offset {offset}: {len(rows)} rows',flush=True)
 if not rows:break
 offset+=len(rows)
 assert offset<150000,'Unexpected scale; use the bulk publisher export instead.'
 time.sleep(.4)
manifest['sourceRecords']=len(seen)
manifest['identicalRepeatedRows']=duplicate_rows
manifest['paginationCaveat']='Offset pagination repeats some identical rows at tied sort values. Identical IDs are deduplicated; conflicting versions stop the import. Completeness beyond the retained API response is not claimed.'
(RAW/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
