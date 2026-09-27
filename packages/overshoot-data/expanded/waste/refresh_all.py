"""Re-download exact snapshotted URLs into a NEW directory; do not overwrite validated artifacts."""
import json,concurrent.futures,urllib.request,hashlib,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parent
if len(sys.argv)!=2:raise SystemExit('Usage: python refresh_all.py /path/to/new-candidate-directory')
target=Path(sys.argv[1]);target.mkdir(parents=True,exist_ok=False)
manifest={}
for path in ROOT.glob('snapshots*.json'):
 for r in json.loads(path.read_text()):
  if 'error' not in r:manifest[r['file']]=r['url']
def fetch(pair):
 name,url=pair
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'OVERSHOOT public data snapshot/0.2'})
  with urllib.request.urlopen(req,timeout=60) as response:b=response.read()
  (target/name).write_bytes(b)
  return {'file':name,'url':url,'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
 except Exception as e:return {'file':name,'url':url,'error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:results=list(ex.map(fetch,manifest.items()))
(target/'snapshot-manifest.json').write_text(json.dumps(results,indent=2))
print(f'{sum("error" not in r for r in results)}/{len(results)} files acquired into {target}; review before adopting.')
