"""Snapshot public UN Comtrade preview, preserving URLs, response flags and hashes.
No key needed. Queries each reporter separately; splits any 500-row response.
Run: python acquire.py; then python normalize.py.
"""
from pathlib import Path
import json, urllib.request, urllib.parse, urllib.error, time, hashlib, datetime, re
ROOT=Path(__file__).resolve().parent
RAW=ROOT/'raw';RAW.mkdir(exist_ok=True)
REPORTERS=[152,842,124,392,36,76,276,528,826,156,604,792,699]
GROUPS=[['2603','2601','2701'],['2709','1001','4403'],['3915','4707','7204'],['7404','7602','6309'],['8549']]
BASE='https://comtradeapi.un.org/public/v1/preview/C/A/HS'
MF=ROOT/'snapshots.json'
manifest=json.loads(MF.read_text()) if MF.exists() else []
next_time=0.0

def fetch(reporter,codes,year=2024):
 global next_time
 params={'period':year,'reporterCode':reporter,'cmdCode':','.join(codes),'flowCode':'X','partner2Code':0,'customsCode':'C00','motCode':0,'maxRecords':500}
 url=BASE+'?'+urllib.parse.urlencode(params)
 name=f'comtrade_{year}_{reporter}_{"-".join(codes)}.json'
 existing=next((x for x in manifest if x['file']==name and x.get('status')==200),None)
 if existing:
  p=json.loads((RAW/name).read_text())
 else:
  for attempt in range(4):
   time.sleep(max(0,next_time-time.monotonic()))
   next_time=time.monotonic()+3.1
   try:
    request=urllib.request.Request(url,headers={'User-Agent':'OVERSHOOT-data-research/1.0'})
    with urllib.request.urlopen(request,timeout=35) as r:b=r.read()
    p=json.loads(b)
    if p.get('error'):raise ValueError(p['error'])
    (RAW/name).write_bytes(b)
    entry={'file':name,'url':url,'retrievedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':200,'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b),'count':p.get('count',len(p.get('data',[]))),'reporterCode':reporter,'year':year,'commodities':codes}
    manifest[:]=[x for x in manifest if x['file']!=name];manifest.append(entry);MF.write_text(json.dumps(manifest,indent=2));break
   except urllib.error.HTTPError as e:
    message=e.read().decode(errors='replace');print('HTTP',e.code,name,message[:120],flush=True)
    if e.code==429 and attempt<3:
     wait=int(re.search(r'(\d+) seconds',message).group(1)) if re.search(r'(\d+) seconds',message) else 10
     if wait>60:break
     next_time=time.monotonic()+wait+1;continue
    p={'data':[]};manifest.append({'file':name,'url':url,'status':e.code,'error':message[:500],'reporterCode':reporter,'year':year,'commodities':codes});MF.write_text(json.dumps(manifest,indent=2));break
   except Exception as e:
    print('ERROR',name,str(e),flush=True)
    if attempt<3:continue
    p={'data':[]};manifest.append({'file':name,'url':url,'status':'error','error':str(e),'reporterCode':reporter,'year':year,'commodities':codes});MF.write_text(json.dumps(manifest,indent=2))
  else:p={'data':[]}
 print(name,len(p.get('data',[])),flush=True)
 if len(p.get('data',[]))>=500:
  if len(codes)==1:raise ValueError('Single-commodity response still capped; requires partner-partition queries')
  for code in codes:fetch(reporter,[code],year)

if __name__=='__main__':
 for reporter in REPORTERS:
  for group in GROUPS:fetch(reporter,group)
  from normalize import normalize
  normalize()
 print('SNAPSHOT COMPLETE',len(manifest),flush=True)
