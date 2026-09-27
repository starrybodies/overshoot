"""Retain retrieval fingerprints for reviewed primary sources.
Full copyrighted publications are not shipped with the public relationship data.
"""
from pathlib import Path
import concurrent.futures,urllib.request,json,hashlib,datetime
ROOT=Path(__file__).resolve().parents[3];BASE=Path(__file__).resolve().parent
sources=json.loads((ROOT/'public/data/v17/connections.json').read_text())['sources']
def fetch(s):
 try:
  req=urllib.request.Request(s['url'],headers={'User-Agent':'Mozilla/5.0 (OVERSHOOT source review)'})
  with urllib.request.urlopen(req,timeout=35) as r:b=r.read();url=r.url;status=r.status
  return dict(id=s['id'],url=s['url'],resolvedUrl=url,status=status,bytes=len(b),sha256=hashlib.sha256(b).hexdigest(),reviewedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),locator=s['locator'])
 except Exception as e:return dict(id=s['id'],url=s['url'],fetchError=str(e),review='Source content reviewed on '+s['reviewedAt']+'; this direct retrieval failed. No new content review is implied.')
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:rows=list(ex.map(fetch,sources))
(BASE/'source-fingerprints.json').write_text(json.dumps(rows,indent=2)+'\n')
print([(r['id'],r.get('status',r.get('fetchError'))) for r in rows])
