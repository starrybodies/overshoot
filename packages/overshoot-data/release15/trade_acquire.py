"""Extend the retained 2024 trade sample via the official public API.
Pace requests; split capped responses. Every reviewed request is retained with
its URL and SHA-256. Neither empty responses nor missing reporters imply zero.
"""
from pathlib import Path
import json,urllib.request,urllib.parse,urllib.error,time,hashlib,gzip
BASE=Path(__file__).resolve().parent;ROOT=BASE.parents[2];RAW=BASE/'raw/comtrade';RAW.mkdir(parents=True,exist_ok=True)
areas=json.loads((ROOT/'packages/overshoot-data/expanded/resources/raw/country-contract.json').read_text())
iso={c['id']:int(c['numeric']) for c in areas}
# Deliberate expansion across regions; this remains selected-reporter coverage.
REPORTERS=['SAU','ARE','QAT','KWT','OMN','IRN','IRQ','EGY','ZAF','KEN','NGA','GHA','MAR','IDN','MYS','VNM','THA','PHL','KOR','IND','MEX','ARG','COL','PAK']
GROUPS=[['2709','2710','2701'],['2601','2603','2606'],['7403','7601','7208'],['3915','4707','7204'],['7404','7602','8549'],['7001','2523','2517'],['5201','5202','6309'],['1001','4403']]
MF=RAW/'manifest.json';manifest=json.loads(MF.read_text()) if MF.exists() else []
last=0

def fetch(country,codes):
 global last
 reporter=699 if country=='IND' else iso[country]
 params=dict(period=2024,reporterCode=reporter,cmdCode=','.join(codes),flowCode='X',partner2Code=0,customsCode='C00',motCode=0,maxRecords=500)
 url='https://comtradeapi.un.org/public/v1/preview/C/A/HS?'+urllib.parse.urlencode(params)
 name=country+'-'+('-'.join(codes))+'.json.gz';p=RAW/name
 entry=next((e for e in manifest if e['file']==name and e['status']==200),None)
 if entry:payload=gzip.decompress(p.read_bytes())
 else:
  time.sleep(max(0,3.2-(time.monotonic()-last)));last=time.monotonic()
  try:
   with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'OVERSHOOT-source-snapshot/1.0'}),timeout=40) as r:payload=r.read()
   data=json.loads(payload)
   if data.get('error'):raise ValueError(data['error'])
   p.write_bytes(gzip.compress(payload,mtime=0))
   entry=dict(file=name,status=200,url=url,reporter=country,reporterCode=reporter,commodities=codes,year=2024,rows=len(data.get('data',[])),sha256=hashlib.sha256(payload).hexdigest(),retrievedAt='2026-09-22')
  except Exception as error:
   code=getattr(error,'code','error');entry=dict(file=name,status=code,url=url,reporter=country,reporterCode=reporter,commodities=codes,year=2024,error=str(error))
   manifest[:]=[e for e in manifest if e['file']!=name];manifest.append(entry);MF.write_text(json.dumps(manifest,indent=2)+'\n');print(country,codes,code,flush=True)
   if code==429:raise SystemExit('Publisher rate limit reached; retained requests remain available. Resume later.')
   return
  manifest[:]=[e for e in manifest if e['file']!=name];manifest.append(entry);MF.write_text(json.dumps(manifest,indent=2)+'\n')
 data=json.loads(payload);rows=data.get('data',[]);print(country,','.join(codes),len(rows),flush=True)
 if len(rows)>=500:
  if len(codes)==1:raise ValueError('Single product response capped; do not import this incomplete page.')
  for code in codes:fetch(country,[code])
for country in REPORTERS:
 for codes in GROUPS:fetch(country,codes)
