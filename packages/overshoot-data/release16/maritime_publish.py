"""Reconcile the retained public PortWatch queries into UI/API snapshots."""
from pathlib import Path
import json,gzip,hashlib,math,calendar
from collections import Counter
BASE=Path(__file__).resolve().parent;ROOT=BASE.parents[2];RAW=BASE/'raw/portwatch';OUT=ROOT/'public/data/v16/maritime';OUT.mkdir(parents=True,exist_ok=True)
manifest=json.loads((RAW/'manifest.json').read_text())
def read(m):
 b=gzip.decompress((RAW/m['file']).read_bytes());assert hashlib.sha256(b).hexdigest()==m['sha256'];return json.loads(b)
def write(name,data):
 (OUT/name).write_bytes(gzip.compress(json.dumps(data,separators=(',',':'),ensure_ascii=False,allow_nan=False).encode(),mtime=0))
ports=[]
for m in manifest:
 if not m['file'].startswith('ports-'):continue
 for f in read(m)['features']:
  a=f['attributes'];x,y=a['lon'],a['lat'];assert math.isfinite(x) and math.isfinite(y) and -180<=x<=180 and -90<=y<=90
  ports.append(dict(id=a['portid'],name=a['portname'],country=a['ISO3'],countryName=a['country'],coordinates=[x,y],locode=a.get('LOCODE'),sourceRow=a['ObjectId'],sourceUrl=m['url']))
assert len(ports)==len({p['id'] for p in ports})
expected=read(next(m for m in manifest if m['file']=='port-count.json.gz'))['count'];assert len(ports)==expected
known={p['id'] for p in ports};months=[f'{y}-{m:02d}' for y,m in [(2025,m) for m in range(9,13)]+[(2026,m) for m in range(1,9)]]
fields=['portcalls','portcalls_container','portcalls_dry_bulk','portcalls_general_cargo','portcalls_roro','portcalls_tanker','import','export','import_tanker','export_tanker']
observations=[];coverage={};queries={}
for month in months:
 entries=sorted([m for m in manifest if m['file'].startswith('month-'+month+'-')],key=lambda m:int(m['file'].split('-')[-1].split('.')[0]))
 assert entries and not read(entries[-1]).get('exceededTransferLimit'),f'Incomplete month {month}'
 seen=set();days=calendar.monthrange(*map(int,month.split('-')))[1]
 queries[month]=[m['url'] for m in entries]
 for m in entries:
  for f in read(m)['features']:
   a=f['attributes'];pid=a['portid'];assert pid not in seen;seen.add(pid);assert pid in known
   values={field:a[field+'_sum'] for field in fields}
   assert all(v is None or isinstance(v,(int,float)) and math.isfinite(v) and v>=0 for v in values.values())
   assert 0<a['observed_days']<=days
   assert str(a['first_date']).startswith(month) and str(a['last_date']).startswith(month)
   observations.append(dict(port=pid,month=month,days=a['observed_days'],expectedDays=days,firstDate=a['first_date'],lastDate=a['last_date'],**values))
 coverage[month]=dict(ports=len(seen),completeCalendarMonths=sum(r['month']==month and r['days']==days for r in observations))
assert len(observations)==len({(r['port'],r['month']) for r in observations})
ports.sort(key=lambda r:(r['country'],r['name']));observations.sort(key=lambda r:(r['port'],r['month']))
source=dict(id='imf-portwatch',title='PortWatch · ports and monthly maritime activity',publisher='International Monetary Fund / University of Oxford',url='https://portwatch.imf.org/',methodUrl='https://portwatch.imf.org/pages/data-and-methodology',license='IMF statistical-data terms; attribution and transformation disclosure required',licenseUrl='https://www.imf.org/en/about/copyright-and-terms',attribution='Sources: UN Global Platform; IMF PortWatch (portwatch.imf.org).',retrievedAt='2026-09-23',method='Monthly sums of the public daily port series, grouped by source port ID using ArcGIS statistical queries. Dates, day counts and original port identifiers are retained. Ship classes are container, dry bulk, general cargo, roll-on/roll-off and tanker. Calls are visits, not unique ships.',limitations=['Port calls are derived from AIS and port boundaries. Source transit filters and AIS coverage affect the counts.','Cargo tonnes are modeled from vessel draft, deadweight and payload changes; they are not weighed cargo or customs declarations.','The vessel class does not establish the commodity, origin, destination or owner of a shipment.','A port location may represent a port complex or offshore terminal. Records are not individual berths.','This is a reviewed historical snapshot, not a live AIS feed.'])
catalog=dict(version='16.0.0',source=source,count=len(ports),countries=dict(sorted(Counter(p['country'] for p in ports).items())),months=months,defaultMonth=months[-1],observations=len(observations),coverage=coverage,portsPath='/data/v16/maritime/ports.json',activityPath='/data/v16/maritime/activity.json',densityPath='/data/v16/maritime/density/metadata.json',queries=queries)
write('ports.json',ports);write('activity.json',observations)
(OUT/'catalog.json').write_text(json.dumps(catalog,separators=(',',':'))+'\n')
(BASE/'maritime-reconciliation.json').write_text(json.dumps(dict(ports=len(ports),countries=len(catalog['countries']),months=months,observations=len(observations),coverage=coverage,venezuela=[p for p in ports if p['country']=='VEN']),indent=2)+'\n')
print('Ports',len(ports),'countries',len(catalog['countries']),'monthly observations',len(observations))
