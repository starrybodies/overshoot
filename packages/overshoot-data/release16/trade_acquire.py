"""Review importer declarations for oil flows missing from selected exporters."""
from pathlib import Path
import urllib.request,urllib.parse,urllib.error,json,gzip,hashlib,time
BASE=Path(__file__).resolve().parent;ROOT=BASE.parents[2];RAW=BASE/'raw/oil-imports';RAW.mkdir(parents=True,exist_ok=True)
MF=RAW/'manifest.json';manifest=json.loads(MF.read_text()) if MF.exists() else []
areas=json.loads((ROOT/'packages/overshoot-data/expanded/resources/raw/country-contract.json').read_text());codes={c['id']:int(c['numeric']) for c in areas};codes['IND']=699
refs=json.loads((ROOT/'packages/overshoot-data/expanded/trade/raw/discovery0.json').read_text())['results']
official={r['reporterCodeIsoAlpha3'].strip():r['reporterCode'] for r in refs if not r.get('isGroup') and not r.get('entryExpiredDate')}
old_codes=dict(codes);codes.update(official)
for m in manifest:
 if m.get('reporterCode')!=codes.get(m.get('reporter')):m['superseded']=True
MF.write_text(json.dumps(manifest,indent=2)+'\n')
reporters=['USA','CHN','IND','ESP','NLD','ITA','SGP','BRA','CAN','JPN','KOR','MYS','THA','GBR','DEU','FRA','TUR','ZAF','IDN','PHL','PAK','GRC','BEL','PRT','MEX','ARG','CHL','PER','COL','SAU','ARE','QAT','KWT','OMN','EGY','NGA','VEN']
def fetch(iso,products):
 name=iso+'-'+('-'.join(products))+('-r'+str(codes[iso]) if codes[iso]!=old_codes[iso] else '')+'.json.gz';p=RAW/name
 url='https://comtradeapi.un.org/public/v1/preview/C/A/HS?'+urllib.parse.urlencode(dict(period=2024,reporterCode=codes[iso],cmdCode=','.join(products),flowCode='M',partner2Code=0,customsCode='C00',motCode=0,maxRecords=500))
 prior=next((m for m in manifest if m['file']==name and m['status']==200 and m.get('url')==url and not m.get('superseded')),None)
 if prior:rows=json.loads(gzip.decompress(p.read_bytes())).get('data',[])
 else:
  try:
   b=urllib.request.urlopen(url,timeout=40).read();j=json.loads(b)
   if j.get('error'):raise ValueError(j['error'])
   rows=j.get('data',[]);p.write_bytes(gzip.compress(b,mtime=0));m=dict(file=name,status=200,url=url,reporter=iso,reporterCode=codes[iso],products=products,rows=len(rows),sha256=hashlib.sha256(b).hexdigest(),retrievedAt='2026-09-23')
  except Exception as e:
   status=getattr(e,'code','error');m=dict(file=name,status=status,url=url,reporter=iso,error=str(e));rows=[]
   if status==429:raise SystemExit('Rate limited; stop acquisition and retain completed requests.')
  manifest.append(m);MF.write_text(json.dumps(manifest,indent=2)+'\n');time.sleep(3.3)
 print(iso,products,len(rows),flush=True)
 if len(rows)>=500:
  if len(products)==1:raise ValueError('Single-product result is capped; do not publish it.')
  for c in products:fetch(iso,[c])
for iso in reporters:fetch(iso,['2709','2710'])
print('DONE',flush=True)
