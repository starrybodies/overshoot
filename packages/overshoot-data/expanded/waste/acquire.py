"""Fetch public primary-source snapshots; output is immutable until explicit --refresh."""
from pathlib import Path
import urllib.request,json,hashlib,concurrent.futures
ROOT=Path(__file__).resolve().parent
RAW=ROOT/'raw';RAW.mkdir(exist_ok=True)
URLS={
 'sdg-series-12.4.2.json':'https://unstats.un.org/SDGAPI/v1/sdg/Indicator/12.4.2/Series/List',
 'sdg-series-12.5.1.json':'https://unstats.un.org/SDGAPI/v1/sdg/Indicator/12.5.1/Series/List',
 'sdg-series-12.3.1.json':'https://unstats.un.org/SDGAPI/v1/sdg/Indicator/12.3.1/Series/List',
 'sdg-series-11.6.1.json':'https://unstats.un.org/SDGAPI/v1/sdg/Indicator/11.6.1/Series/List',
 'eurostat-env_ac_cur.json':'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/env_ac_cur?lang=en',
 'globalewaste.html':'https://globalewaste.org/',
 'oecd-plastics.html':'https://www.oecd.org/en/publications/global-plastics-outlook_de747aef-en.html',
 'ewaste-monitor.html':'https://ewastemonitor.info/the-global-e-waste-monitor-2024/',
}
def fetch(pair):
 name,url=pair;p=RAW/name
 try:
  if not p.exists():
   req=urllib.request.Request(url,headers={'User-Agent':'OVERSHOOT source provenance research/0.2'})
   with urllib.request.urlopen(req,timeout=60) as r:b=r.read()
   p.write_bytes(b)
  b=p.read_bytes();print(name,len(b),flush=True)
  return {'file':name,'url':url,'retrieved':'2026-09-19','sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
 except Exception as e:print(name,str(e),flush=True);return {'file':name,'url':url,'error':str(e)}
if __name__=='__main__':
 with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:r=list(ex.map(fetch,URLS.items()))
 (ROOT/'snapshots.json').write_text(json.dumps(r,indent=2))
