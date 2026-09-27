"""Build research-ready tables without merging sources or inventing missing observations."""
from pathlib import Path
from collections import defaultdict,Counter
import gzip,json,hashlib,math,re
ROOT=Path(__file__).resolve().parents[3];BASE=Path(__file__).resolve().parent;OUT=ROOT/'public/data/v18/waste';OUT.mkdir(parents=True,exist_ok=True)
def read(p):
 b=p.read_bytes();return json.loads(gzip.decompress(b) if b[:2]==b'\x1f\x8b' else b)
def write(name,value):
 p=OUT/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(value,ensure_ascii=False,separators=(',',':'))+'\n')
countries=read(ROOT/'public/data/v11/countries.json');m49={str(int(c['numeric'])):c for c in countries if str(c.get('numeric','')).isdigit()};a2={c['alpha2']:c for c in countries if c.get('alpha2')};a2['EL']=a2['GR']
manifest=read(BASE/'manifest.json');by_source={r['id']:r for r in manifest}
for r in manifest:assert hashlib.sha256(gzip.decompress((BASE/r['file']).read_bytes())).hexdigest()==r['sha256']
series=[];all_rows=0;aggregate_rows=0
def publish_series(meta,rows):
 global all_rows
 if not rows:return
 rows.sort(key=lambda r:(r['country'],r['year'],r['id']))
 ids=[r['id'] for r in rows];assert len(ids)==len(set(ids)),meta['id']
 path='series/'+meta['id']+'.json';write(path,rows)
 meta.update(path='/data/v18/waste/'+path,count=len(rows),countries=dict(Counter(r['country'] for r in rows)),years=sorted(set(r['year'] for r in rows)))
 series.append(meta);all_rows+=len(rows)
flag_labels={'b':'Break in time series','d':'Definition differs','e':'Estimated','p':'Provisional','s':'Eurostat estimate','u':'Low reliability','c':'Confidential','z':'Not applicable','n':'Not significant'}
operation_names={'GEN':'Generated','TRT':'Treated','DSP_I_RCV_E':'Incineration, including energy recovery','DSP_L_OTH':'Landfill and other disposal','DSP_I':'Incineration without energy recovery','RCV_E':'Energy recovery','RCY':'Recycled, total','RCY_M':'Material recycling','RCY_C_D':'Composting and digestion','PRP_REU':'Prepared for reuse','RCV':'Recovered, total','RCV_E_PAC':'Energy recovery','RCV_OTH':'Other recovery','RCY_NAT':'Recycled domestically','RCY_EU_FOR':'Recycled in another EU country','RCY_NEU':'Recycled outside the EU','RPR':'Repaired'}
sources={}
for source,code,group in [('eurostat-municipal','env_wasmun','Municipal waste'),('eurostat-packaging','env_waspac','Packaging')]:
 d=read(BASE/by_source[source]['file']);dims=d['dimension'];indices={k:[c for c,i in sorted(v['category']['index'].items(),key=lambda x:x[1])] for k,v in dims.items()};groups=defaultdict(list);metas={};aggregates=[]
 source_url='https://ec.europa.eu/eurostat/databrowser/view/'+code+'/default/table'
 sources[source]=dict(title='Eurostat · '+d['label'],publisher='Eurostat',url=source_url,apiUrl=by_source[source]['url'],metadataUrl='https://ec.europa.eu/eurostat/cache/metadata/en/'+('env_wasmun' if group=='Municipal waste' else 'env_waspac')+'_esms.htm',retrievedAt=by_source[source]['retrievedAt'],updated=d['updated'],license='Eurostat reuse policy: attribution required; third-party exceptions apply. OVERSHOOT reformats and converts units; Eurostat is not responsible for these changes.',licenseUrl='https://ec.europa.eu/eurostat/help/copyright-notice',sha256=by_source[source]['sha256'])
 for flat,value in d['value'].items():
  if value is None or not isinstance(value,(int,float)) or not math.isfinite(value):continue
  cell={};n=int(flat)
  for k,size in reversed(list(zip(d['id'],d['size']))):cell[k]=indices[k][n%size];n//=size
  # Eurostat's Kosovo geography is withheld under the publisher's reuse exception.
  # Keep its raw source response for audit, but do not emit cells into public series.
  if cell['geo']=='XK':continue
  country=a2.get(cell['geo']);operation=cell['wst_oper'];material=cell.get('waste','municipal');unit='tonnes/year' if cell['unit'] in ['T','THS_T'] else 'kg/person/year';factor=1000 if cell['unit']=='THS_T' else 1
  sid='eu-'+('municipal' if group=='Municipal waste' else 'packaging-'+material.lower())+'-'+operation.lower().replace('_','-')+'-'+cell['unit'].lower().replace('_','-')
  flag=d.get('status',{}).get(flat,'');row=dict(id=source+':'+flat,country=country['id'] if country else cell['geo'],year=int(cell['time']),value=value*factor,unit=unit,rawValue=value,rawUnit=cell['unit'],factor=factor,flags=flag,flagLabels=[flag_labels.get(f,f) for f in flag],basis='Estimate' if any(f in flag for f in ['e','s']) else 'Reported',dimensions=cell,sourceCell=int(flat),source=source_url,footnotes=[])
  if not country:aggregates.append(row);continue
  groups[sid].append(row)
  material_name=dims['waste']['category']['label'][material] if 'waste' in dims else 'Municipal waste'
  metas[sid]=dict(id=sid,group=group,label=material_name+' · '+operation_names.get(operation,operation),unit=unit,sourceId=source,operation=operation,material=material,description=('Waste generated in the reporting country, including its treatment abroad. Totals overlap their components; do not add them.' if group=='Municipal waste' else 'Packaging waste by material and treatment operation. Total packaging, metals and total recycling overlap their subcategories. Destination categories do not identify receiving facilities.'),comparability='Definitions changed around 2019–2022; retain break flags. Compare matching units and years. Missing years are not interpolated.')
 for sid,rows in groups.items():publish_series(metas[sid],rows)
 write(source+'-aggregates.json',aggregates);aggregate_rows+=len(aggregates)

# Expose previously retained complete SDG histories; preserve source dimensions.
old=ROOT/'packages/overshoot-data/expanded/waste';old_manifest={m['file']:m for m in read(old/'snapshots-sdg.json')}
group_for={'EN_MWT':'Municipal waste','EN_EWT':'Electronic waste','EN_HAZ':'Hazardous waste','AG_FOOD':'Food waste'}
for filename,m in old_manifest.items():
 prefix=next((k for k in group_for if filename[4:].startswith(k)),None)
 if not prefix:continue
 b=(old/'raw'/filename).read_bytes();assert hashlib.sha256(b).hexdigest()==m['sha256'];d=json.loads(b)
 assert len(d['data'])==d['totalElements'] and d['totalPages']==1
 source='un-'+filename[4:-5].lower().replace('_','-');groups=defaultdict(list);metas={};labels={x['id']:{c['code']:c['description'] for c in x['codes']} for x in d['dimensions']};attr={x['id']:{c['code']:c['description'] for c in x['codes']} for x in d['attributes']}
 indicator=d['data'][0]['indicator'][0];sources[source]=dict(title='UN SDG · '+d['data'][0]['seriesDescription'],publisher='UNSD and custodian agencies; original providers retained per observation',url='https://unstats.un.org/sdgs/dataportal',apiUrl=m['url'],metadataUrl='https://unstats.un.org/sdgs/metadata/files/Metadata-'+indicator.replace('.','-').replace('12-5-1','12-05-01').replace('12-4-2','12-04-02').replace('12-3-1','12-03-01B')+'.pdf',retrievedAt=m['retrieved'],license='UN statistical-data terms and original agency attribution; no blanket Creative Commons license asserted.',licenseUrl='https://www.un.org/en/about-us/terms-of-use',sha256=m['sha256'])
 for i,r in enumerate(d['data']):
  c=m49.get(str(int(r['geoAreaCode'])));
  if not c:continue
  try:value=float(r['value'])
  except (ValueError,TypeError):continue
  if not math.isfinite(value):continue
  extra={k:v for k,v in r['dimensions'].items() if k!='Reporting Type'};suffix='-'.join(str(v).lower().replace('_','-') for k,v in sorted(extra.items()));sid=source+('-'+suffix if suffix else '')
  unit={'TONNES':'tonnes/year','PERCENT':'%','KG':'kg/person/year'}[r['attributes']['Units']];year=int(r['timePeriodStart']);nature=attr.get('Nature',{}).get(r['attributes'].get('Nature',''),'Not specified');basis='Model projection' if prefix=='EN_EWT' and 'UNITAR' in r['source'].upper() and year>2022 else nature
  row=dict(id=source+':'+str(i),country=c['id'],year=year,value=value,unit=unit,rawValue=r['value'],rawUnit=r['attributes']['Units'],factor=1,flags=r['attributes'].get('Observation Status',''),flagLabels=[attr.get('Observation Status',{}).get(r['attributes'].get('Observation Status',''),'')],basis=basis,dimensions=r['dimensions'],attributes=r['attributes'],source=r['source'],footnotes=r['footnotes'],sourceRow=i,timeDetail=r.get('time_detail'),timeCoverage=r.get('timeCoverage'),upperBound=r.get('upperBound'),lowerBound=r.get('lowerBound'))
  groups[sid].append(row);extra_label=' · '.join(labels.get(k,{}).get(v,v) for k,v in extra.items())
  metas[sid]=dict(id=sid,group=group_for[prefix],label=r['seriesDescription']+(' · '+extra_label if extra_label else ''),unit=unit,sourceId=source,description='National observations compiled in the UN SDG database. Original provider, estimation status, dimensions and notes are retained.',comparability='Do not combine overlapping UN, Eurostat and World Bank observations. E-waste records after 2022 from UNITAR are labeled projections. Country definitions and coverage differ.')
 for sid,rows in groups.items():publish_series(metas[sid],rows)

# City service coverage has its own source city identifiers. No geocoding or city-to-city join.
d=read(BASE/by_source['sdg-city-collection']['file']);city_labels=next({c['code']:c['description'] for c in x['codes']} for x in d['dimensions'] if x['id']=='Cities');nature_labels=next({c['code']:c['description'] for c in x['codes']} for x in d['attributes'] if x['id']=='Nature');city_rows=[];national_rows=[];city_aggregates=[]
for i,r in enumerate(d['data']):
 c=m49.get(str(int(r['geoAreaCode'])));
 if not c:
  city_aggregates.append(dict(sourceRow=i,record=r));continue
 try:value=float(r['value'])
 except (ValueError,TypeError):continue
 if not math.isfinite(value):continue
 city=r['dimensions'].get('Cities','_T');row=dict(id='un-city-'+str(i),cityId=c['id']+':'+city,city=city_labels.get(city,city),country=c['id'],countryName=c['name'],year=int(r['timePeriodStart']),value=value,unit='%',basis=nature_labels.get(r['attributes'].get('Nature',''),'Not specified'),attributes=r['attributes'],dimensions=r['dimensions'],source=r['source'],footnotes=r['footnotes'],rawValue=r['value'],sourceRow=i,issue='Outside expected percentage range; inspect original source' if value<0 or value>100 else None)
 (national_rows if city=='_T' else city_rows).append(row)
city_source=dict(title='UN SDG 11.6.1 · Municipal solid-waste collection coverage, by cities',publisher='UN-Habitat / UNSD and original providers',url='https://unstats.un.org/sdgs/dataportal/database',apiUrl=by_source['sdg-city-collection']['url'],metadataUrl='https://unstats.un.org/sdgs/metadata/files/Metadata-11-06-01.pdf',retrievedAt=by_source['sdg-city-collection']['retrievedAt'],license='UN statistical-data terms; original provider attribution retained.',licenseUrl='https://www.un.org/en/about-us/terms-of-use',sha256=by_source['sdg-city-collection']['sha256'])
write('city-collection.json',dict(source=city_source,records=city_rows,method='The intended measure is waste collected as a share of waste generated; some providers use service-population coverage. Inspect source notes before comparing. It does not establish controlled treatment, recycling or safe disposal. Source city definitions, years and methods vary; identifiers are not merged with the World Bank 3.0 register. No city coordinates are inferred.'))
write('collection-national.json',national_rows)
write('collection-regional-aggregates.json',city_aggregates)

# A compact comparison matrix derived entirely from field-level World Bank records.
wi=read(ROOT/'public/data/v12/waste-index.json');matrix=[]
for e in wi['records']:
 r=read(ROOT/'public/data/v12/waste'/(e['id']+'.json'));obs={}
 for k,o in r['observations'].items():
  refs=o['references'];years=sorted(set(str(v['date']) for v in refs if v.get('date') is not None))
  obs[k]=dict(value=o['value'],dates=years,year=r['year'] if k in ['tonnes','perPerson'] else None,sourceField=o['sourceField'],issue=o.get('issue'))
 matrix.append(dict(id=e['id'],country=e['country'],name=e['name'],countryName=e['countryName'],level=e['level'],region=e['region'],year=e['year'],observations=obs))
write('comparison.json',dict(source={k:wi[k] for k in ['title','publisher','url','citation','license','retrievedAt']},fields=wi['fields'],records=matrix))
catalog=dict(release='18',reviewedAt='2026-09-23',series=series,sources=sources,counts=dict(historyRecords=all_rows,series=len(series),countries=len(set(c for s in series for c in s['countries'])),cityObservations=len(city_rows),cities=len(set(r['cityId'] for r in city_rows)),cityCountries=len(set(r['country'] for r in city_rows)),nationalCollectionRows=len(national_rows),separateEurostatAggregateRows=aggregate_rows),method='Source-separated histories, not an additive global total. No missing values are filled and no years are interpolated. Parent categories, national totals and their components must not be added. Countries retain ISO3; EU aggregates are separate artifacts.')
write('catalog.json',catalog);(BASE/'validation.json').write_text(json.dumps(catalog['counts'],indent=2)+'\n');print(catalog['counts'])
