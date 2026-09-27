"""Acquire full primary tables, retaining bytes and source hashes before publication."""
from pathlib import Path
import concurrent.futures,datetime,gzip,hashlib,json,urllib.request
BASE=Path(__file__).resolve().parent
(BASE/'raw').mkdir(parents=True,exist_ok=True)
URLS={
 'eurostat-municipal':'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/env_wasmun?lang=EN',
 'eurostat-packaging':'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/env_waspac?lang=EN&unit=T',
 'sdg-city-collection':'https://unstats.un.org/SDGAPI/v1/sdg/Series/Data?seriesCode=EN_REF_WASCOL&pageSize=50000',
 'sdg-city-series':'https://unstats.un.org/SDGAPI/v1/sdg/Indicator/11.6.1/Series/List',
}
def acquire(item):
 key,url=item
 with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'OVERSHOOT public-data research'}),timeout=60) as response:b=response.read()
 d=json.loads(b)
 if isinstance(d,dict) and 'totalElements' in d:
  assert d['totalPages']==1 and len(d['data'])==d['totalElements'], 'Incomplete SDG response; paginate before publishing'
 path=BASE/'raw'/f'{key}.json.gz';path.write_bytes(gzip.compress(b,mtime=0))
 return dict(id=key,url=url,file=str(path.relative_to(BASE)),bytes=len(b),sha256=hashlib.sha256(b).hexdigest(),retrievedAt=datetime.datetime.now(datetime.timezone.utc).isoformat())
if __name__=='__main__':
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:manifest=list(pool.map(acquire,URLS.items()))
 (BASE/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
 print([(r['id'],r['bytes']) for r in manifest])
