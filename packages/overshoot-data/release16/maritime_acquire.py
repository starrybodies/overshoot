"""Acquire public, attributed PortWatch statistics; no raw AIS or vessel identities."""
from pathlib import Path
import urllib.request,urllib.parse,json,gzip,hashlib,time
BASE=Path(__file__).resolve().parent;RAW=BASE/'raw/portwatch';RAW.mkdir(parents=True,exist_ok=True)
ROOT='https://services9.arcgis.com/weJ1QsnbMYJlCHdG/arcgis/rest/services/'
MF=RAW/'manifest.json';manifest=json.loads(MF.read_text()) if MF.exists() else []
def fetch(name,service,params):
 url=ROOT+service+'/FeatureServer/0/query?'+urllib.parse.urlencode(dict(f='json',**params))
 p=RAW/(name+'.json.gz');prior=next((r for r in manifest if r['file']==p.name and r['url']==url),None)
 if prior:return json.loads(gzip.decompress(p.read_bytes()))
 b=urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'OVERSHOOT-public-research/1.0'}),timeout=60).read();j=json.loads(b)
 if j.get('error'):raise ValueError(j['error'])
 p.write_bytes(gzip.compress(b,mtime=0));manifest.append(dict(file=p.name,url=url,sha256=hashlib.sha256(b).hexdigest(),retrievedAt='2026-09-23',records=len(j.get('features',[]))));MF.write_text(json.dumps(manifest,indent=2)+'\n')
 print(name,len(j.get('features',[])),j.get('exceededTransferLimit',False),flush=True);time.sleep(.4);return j
# A source snapshot of every published port, not a hand-picked sample.
count=fetch('port-count','PortWatch_ports_database',dict(where='1=1',returnCountOnly='true'))['count']
for offset in range(0,count,1000):fetch('ports-'+str(offset),'PortWatch_ports_database',dict(where='1=1',outFields='*',outSR=4326,orderByFields='ObjectId',resultOffset=offset,resultRecordCount=1000))
latest=fetch('latest-date','Daily_Ports_Data',dict(where='1=1',outStatistics=json.dumps([dict(statisticType='max',onStatisticField='date',outStatisticFieldName='latest')]),returnGeometry='false'))
print('Latest daily observation:',latest['features'][0]['attributes'],flush=True)
# Monthly sums by port. Preserve observation-day counts to expose partial coverage.
fields=['portcalls','portcalls_container','portcalls_dry_bulk','portcalls_general_cargo','portcalls_roro','portcalls_tanker','import','export','import_tanker','export_tanker']
stats=[dict(statisticType='sum',onStatisticField=f,outStatisticFieldName=f+'_sum') for f in fields]+[dict(statisticType='count',onStatisticField='date',outStatisticFieldName='observed_days'),dict(statisticType='min',onStatisticField='date',outStatisticFieldName='first_date'),dict(statisticType='max',onStatisticField='date',outStatisticFieldName='last_date')]
for y,m in [(2025,m) for m in range(9,13)]+[(2026,m) for m in range(1,9)]:
 offset=0
 while True:
  j=fetch(f'month-{y}-{m:02d}-{offset}','Daily_Ports_Data',dict(where=f'year = {y} AND month = {m}',outStatistics=json.dumps(stats,separators=(',',':')),groupByFieldsForStatistics='portid',orderByFields='portid',returnGeometry='false',resultOffset=offset,resultRecordCount=1000))
  if not j.get('exceededTransferLimit'):break
  assert j.get('features'), 'Empty truncated page';offset+=len(j['features'])
print('DONE: public ports and twelve complete calendar months requested.',flush=True)
