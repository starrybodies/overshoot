"""Acquire a bounded, reproducible Climate TRACE point-source snapshot.

The public beta is queried sequentially, in large pages, once at release time.
Run with --refresh to replace the retained snapshot after reviewing upstream changes.
"""
from pathlib import Path
import sys, json, gzip, hashlib, urllib.request, urllib.parse, time

BASE=Path(__file__).resolve().parent
RAW=BASE/'raw/climate-trace'
RAW.mkdir(parents=True,exist_ok=True)
SUBSECTORS=['solid-waste-disposal','oil-and-gas-refining','oil-and-gas-production','cement','iron-and-steel','aluminum','pulp-and-paper','glass','petrochemical-steam-cracking']
LIMIT=5000
manifest={'publisher':'Climate TRACE','apiVersion':7,'retrievedAt':'2026-09-22','year':2025,'gas':'co2e_100yr','subsectors':SUBSECTORS,'pages':[],'method':'Sequential offset pagination until an empty page. Retain original responses; import only point-source records with valid coordinates. No live API dependency in the application.'}
seen=set();offset=0
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
 assert len(ids)==len(rows) and not seen.intersection(ids),'Pagination changed or duplicated records; review before publication.'
 seen.update(ids)
 manifest['pages'].append(dict(offset=offset,rows=len(rows),url=url,file=str(path.relative_to(BASE)),sha256=hashlib.sha256(payload).hexdigest()))
 print(f'offset {offset}: {len(rows)} rows',flush=True)
 if not rows:break
 offset+=len(rows)
 assert offset<150000,'Unexpected scale; use the bulk publisher export instead.'
 time.sleep(.4)
manifest['sourceRecords']=len(seen)
(RAW/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
