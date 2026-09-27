"""Build complete country shards and evidence metadata for the facility atlas.

No throughput is inferred from location, capacity, land cover, or facility type.
Canadian oil/gas facility records are retained in full; wells and linear pipeline
segments remain separate source categories and are not repurposed as facilities.
"""
from pathlib import Path
from collections import Counter, defaultdict
import csv, gzip, hashlib, io, json, math, sqlite3, zipfile
import pyarrow.parquet as pq
from pyproj import Transformer
from shapely import from_wkb
from trace_records import load_trace

ROOT = Path(__file__).resolve().parents[3]
BASE = Path(__file__).resolve().parent
OLD = ROOT / 'packages/overshoot-data/expanded/sites'
OUT = ROOT / 'public/data/v14'
ODI_URL = 'https://www150.statcan.gc.ca/n1/pub/34-26-0003/342600032023001-eng.htm'
SOURCES = {
 'statcan-odi-solid-waste-2024': dict(title='Canada · solid-waste infrastructure',publisher='Statistics Canada and original data providers',url=ODI_URL,license='Open Government Licence – Canada',licenseUrl='https://open.canada.ca/en/open-government-licence-canada',edition='Version 2 · November 2024',retrievedAt='2026-09-22',coverage='Canadian source records compiled October 2023–June 2024; geographic coverage varies.',method='All 9,074 source locations. Transform EPSG:3347 to WGS84; preserve provider, original ID, classification and status. Missing names are labeled by source class.',limits=['Location records do not include waste throughput or verified downstream destinations.','Several providers may describe the same physical site; counts are source records, not a deduplicated national facility census.','The mixed category includes waste infrastructure whose exact role is unspecified.'],question='Where can waste be collected, sorted or disposed of?',download='https://www150.statcan.gc.ca/pub/34-26-0003/2023001/zip/ODI_v2_solid_waste.zip'),
 'statcan-odi-energy-2024': dict(title='Canada · oil and gas facilities',publisher='Statistics Canada and original data providers',url=ODI_URL,license='Open Government Licence – Canada',licenseUrl='https://open.canada.ca/en/open-government-licence-canada',edition='Version 2 · November 2024',retrievedAt='2026-09-22',coverage='All records classified as facilities in ODI. Wells and pipelines are separate categories and excluded from this layer.',method='Transform EPSG:3347 to WGS84. Preserve native facility class, operating status, ownership and original ID. A representative point is used only for non-point facility geometry and labeled.',limits=['Location and operating status describe the source snapshot, not current production.','The source does not supply oil or gas throughput per facility.','Provider overlap is retained; records are not claimed to be unique physical sites.'],question='Where is oil and gas gathered, processed or stored?',download='https://www150.statcan.gc.ca/pub/34-26-0003/2023001/zip/ODI_v2_oil_gas.zip'),
 'hydrowaste-2022':dict(title='HydroWASTE · treatment plants',publisher='Ehalt Macedo et al. / McGill University',url='https://www.hydrosheds.org/products/hydrowaste',license='CC BY 4.0',licenseUrl='https://creativecommons.org/licenses/by/4.0/',edition='Version 1 · December 2021',retrievedAt='2026-09-19',coverage='58,502 treatment-plant records. Coverage and underlying source dates vary by country.',method='Retain all source rows and all quality codes. Reported treatment, design capacity, unspecified reports and modeled effluent are separate measurement bases. Source population and treatment quality codes remain explicit.',limits=['The dataset does not provide an observation year for each plant.','Liquid volume cannot be added to solid-waste mass.','Source estimates have no per-plant statistical interval.','Outfall coordinates are estimated and distinct from plant coordinates.'],question='What happens to wastewater, and where is it discharged?',download='https://figshare.com/ndownloader/files/31910714',citation='Ehalt Macedo et al. (2022), Distribution and characteristics of wastewater treatment plants within the global river network. https://doi.org/10.5194/essd-14-559-2022'),
 'maus-mining-2022':dict(title='Global mining land · mapped footprints',publisher='Maus et al. / PANGAEA',url='https://doi.org/10.1594/PANGAEA.942325',license='CC BY-SA 4.0',licenseUrl='https://creativecommons.org/licenses/by-sa/4.0/',edition='Version 2 · 2019 imagery',retrievedAt='2026-09-19',coverage='All 44,929 polygons from the source study. Study search zones are not an exhaustive world mine census.',method='Use the original area in km² and a representative point inside each mining polygon. Retain the source polygon ID. Derived mining records are shared under CC BY-SA 4.0.',limits=['Footprints include pits, tailings, waste rock, ponds and processing areas.','A footprint does not identify a mine operator, commodity, production or current operating status.'],question='Where has mining changed the land?',download='https://download.pangaea.de/dataset/942325/files/global_mining_polygons_v2.gpkg',citation='Maus et al. (2022), Global-scale mining polygons (Version 2). PANGAEA. https://doi.org/10.1594/PANGAEA.942325'),
 'epa-lmop-2024':dict(title='US landfills · waste acceptance',publisher='US Environmental Protection Agency',url='https://www.epa.gov/lmop/landfill-technical-data',license='US government public data',licenseUrl='https://www.epa.gov/web-policies-and-procedures/epa-disclaimers',edition='September 2024',retrievedAt='2026-09-19',coverage='2,323 geolocated records of 2,641 source records. Missing coordinates are excluded; LMOP does not include every US landfill.',method='Annual source short tons × exactly 0.90718474 = metric tonnes. Preserve each measurement year; missing intake or reporting year remains null.',limits=['This is a voluntary program database, not a full US landfill census.','Annual intake reports have different years and cannot be summed into a same-year national total.'],question='How much waste does a landfill accept?',download='https://www.epa.gov/system/files/documents/2024-09/landfilllmopdata.xlsx'),
 'meijer-rivers-2021':dict(title='River plastic · modeled emissions',publisher='Meijer et al.',url='https://doi.org/10.6084/m9.figshare.14515590.v1',license='CC BY 4.0',licenseUrl='https://creativecommons.org/licenses/by/4.0/',edition='2015 midpoint scenario · published 2021',retrievedAt='2026-09-19',coverage='All 31,819 modeled outfalls in the retained source.',method='Retain original tonnes/year and outfall coordinates. Countries absent in the source remain unassigned; no nearest-country substitution.',limits=['These are model estimates, not observed shipments or measured discharges.','Per-outfall uncertainty intervals and most river names are absent.','Most country assignments are unavailable in the source.'],question='Where could river-borne plastic reach the sea?',download='https://ndownloader.figshare.com/files/27807774',citation='Meijer et al. (2021), More than 1000 rivers account for 80% of global riverine plastic emissions into the ocean. https://doi.org/10.1126/sciadv.aaz5803'),
}

def write(path, data):
 path.parent.mkdir(parents=True,exist_ok=True)
 payload=json.dumps(data,ensure_ascii=False,separators=(',',':'),allow_nan=False).encode('utf-8')
 path.write_bytes(gzip.compress(payload,mtime=0) if path.stem.isdigit() or path.name=='index.json' else payload)

def clean(v):
 if v is None or str(v).strip() in ('','..','...','NULL'): return None
 return v.strip() if isinstance(v,str) else v

def num(v):
 try:
  n=float(v);return n if math.isfinite(n) else None
 except (ValueError,TypeError):return None

records=[]
# The retained Parquet contains ALL previously acquired points, not the UI samples.
parquet=OLD/'artifacts/sites-full.parquet'
for r in pq.read_table(parquet).to_pylist():
 if r['type']=='wastewater-treatment':continue
 kind={'mining-area':'mining','river-plastic':'river','landfill':'landfill'}[r['type']]
 basis='mapped' if kind=='mining' else 'modeled' if kind=='river' else 'reported' if r['value'] is not None else 'location'
 records.append(dict(id=r['id'],kind=kind,name=r['name'],country=r['country'] or 'UNASSIGNED',region=r.get('state') or '',locality='',coordinates=[r['longitude'],r['latitude']],type=r['type'],source=r['source_id'],sourceRow=str(r['source_row']),value=r['original_value']*0.90718474 if r['source_id']=='epa-lmop-2024' and r.get('original_value') is not None else r['value'],unit=r['unit'],metric=r['metric'],year=r['year'],basis=basis,status=r.get('status') or None,attributes={k:r[k] for k in ('original_value','original_unit') if r.get(k) is not None}))

with zipfile.ZipFile(OLD/'raw/HydroWASTE_v10.zip') as z:
 rows=csv.DictReader(io.TextIOWrapper(z.open('HydroWASTE_v10.csv'),encoding='cp1252'))
 for r in rows:
  q=int(r['QUAL_WASTE'])
  metric={1:'Reported treated effluent',2:'Reported design capacity',3:'Reported value · type unspecified',4:'Modeled effluent'}[q]
  attrs={k:clean(r[k]) for k in ['ORG_ID','SOURCE','COUNTRY','QUAL_LOC','POP_SERVED','QUAL_POP','LEVEL','QUAL_LEVEL','DF','HYRIV_ID','RIVER_DIS','LAT_OUT','LON_OUT','DESIGN_CAP','QUAL_CAP']}
  attrs['QUAL_WASTE']=q
  records.append(dict(id='hydrowaste-'+r['WASTE_ID'],kind='wastewater',name=r['WWTP_NAME'] or 'Unnamed treatment plant · '+r['WASTE_ID'],country=r['CNTRY_ISO'],region='',locality='',coordinates=[float(r['LON_WWTP']),float(r['LAT_WWTP'])],type='Wastewater treatment',source='hydrowaste-2022',sourceRow=r['WASTE_ID'],value=num(r['WASTE_DIS']),unit='m³/day',metric=metric,year=None,basis={1:'reported',2:'capacity',3:'unspecified',4:'modeled'}[q],status=clean(r['STATUS']),attributes=attrs))

transform=Transformer.from_crs(3347,4326,always_xy=True)
exclusions={};provider_catalog={}
for key,kind in [('odi-solid-waste','landfill'),('odi-oil-gas','energy')]:
 folder=BASE/'raw'/key
 # A fresh acquisition can be used; the selected original energy rows also rebuild offline.
 archive=BASE/'raw'/f'{key}.zip'
 if archive.exists():
  with zipfile.ZipFile(archive) as z:
   folder.mkdir(exist_ok=True)
   for name in z.namelist():
    if name.lower().endswith(('.gpkg','.csv','.pdf')):
     (folder/Path(name).name).write_bytes(z.read(name))
  gpkg=next(folder.glob('*.gpkg'));conn=sqlite3.connect(gpkg);conn.row_factory=sqlite3.Row
  table=conn.execute('select table_name from gpkg_geometry_columns').fetchone()[0]
  source_rows=conn.execute(f'SELECT * FROM "{table}"')
 else:
  assert kind=='energy', 'Acquire original solid-waste ZIP first.'
  source_rows=json.loads(gzip.decompress((BASE/'raw/odi-oil-gas-facilities-original.json.gz').read_bytes()))
  conn=None
 provider_file=BASE/'raw'/f'{key}-providers.json'
 if folder.exists():
  for p in folder.glob('data_providers*.csv'):
   provider_catalog[key]=list(csv.DictReader(p.open(encoding='utf-8-sig')))
 if key not in provider_catalog:provider_catalog[key]=json.loads(provider_file.read_text())
 omitted=Counter()
 for row in source_rows:
  r=dict(row)
  if kind=='energy' and r['sub_type']!='facilities':omitted[r['sub_type']]+=1;continue
  blob=r.pop('geom')
  if isinstance(blob,str):blob=bytes.fromhex(blob)
  if not blob:omitted['no_geometry']+=1;continue
  offset=8+{0:0,1:32,2:48,3:48,4:64}[(blob[3]>>1)&7]
  geom=from_wkb(blob[offset:]);point=geom if geom.geom_type=='Point' else geom.representative_point()
  lon,lat=transform.transform(point.x,point.y)
  if not(math.isfinite(lon) and math.isfinite(lat) and -180<=lon<=180 and -90<=lat<=90):omitted['invalid_coordinates']+=1;continue
  source='statcan-odi-solid-waste-2024' if kind=='landfill' else 'statcan-odi-energy-2024'
  subtype={'landfill':'Landfill','recycling':'Recycling','mixed':'Waste site · role unspecified','facilities':'Oil / gas facility'}[r['sub_type']]
  native_class=clean(r['source_class'])
  readable_class=clean(r.get('ccpi_class')) if native_class and str(native_class).isdigit() else native_class
  # Native class is preserved; it is never inferred from the name.
  label=clean(r['name']) or readable_class or subtype
  attrs={k:clean(v) for k,v in r.items() if k not in ['fid','id','name','prov_terr','csdname','sub_type','status'] and clean(v) is not None}
  attrs['original_subtype']=r['sub_type'];attrs['location_method']='Source point; EPSG:3347 → WGS84' if geom.geom_type=='Point' else f'Representative point inside source {geom.geom_type}; EPSG:3347 → WGS84'
  if not clean(r['name']):attrs['name_not_reported']=True
  records.append(dict(id=key+'-'+r['id'],kind=kind,name=label,country='CAN',region=r['prov_terr'],locality=clean(r['csdname']) or '',coordinates=[round(lon,6),round(lat,6)],type=readable_class or subtype,source=source,sourceRow=r['id'],value=None,unit='',metric='Location record · throughput not provided',year=None,basis='location',status=clean(r.get('status')),attributes=attrs))
 if not archive.exists():omitted.update({'pipelines':296945,'wells':96466})
 exclusions[key]=dict(omitted)
 if conn:conn.close()

# Archived global power-plant baseline: capacity and generation are different measures.
power_path=BASE/'raw/wri-power-plants.csv.gz'
SOURCES['wri-power-plants']=dict(title='Global Power Plant Database · archived baseline',publisher='World Resources Institute and contributing providers',url='https://github.com/wri/global-power-plant-database',license='CC BY 4.0',licenseUrl='https://creativecommons.org/licenses/by/4.0/',edition='Archived database · source years vary',retrievedAt='2026-09-22',coverage='34,936 source records across 167 countries. WRI states that the project is no longer maintained; this is a historical baseline, not a current operating inventory.',method='Retain every source row, native plant ID, primary and secondary fuels, capacity in MW, capacity observation year, original provider URLs and all annual generation fields. Reported GWh and modeled GWh remain separate original fields.',limits=['Capacity in MW is a rated power level, not annual energy production.','Current operating status and recent additions or closures are not supplied.','Location and capacity accuracy vary by contributing provider.','Primary fuel does not establish a complete annual fuel mix. Generation may use calendar, fiscal or regulatory years.'],question='Where does electricity come from, and what powers the plants?',download='https://raw.githubusercontent.com/wri/global-power-plant-database/master/output_database/global_power_plant_database.csv',citation='World Resources Institute, Global Power Plant Database. Archived public repository snapshot retrieved 22 September 2026. CC BY 4.0.')
with gzip.open(power_path,'rt',encoding='utf-8') as f:
 for r in csv.DictReader(f):
  capacity_year=num(r['year_of_capacity_data'])
  records.append(dict(id='wri-'+r['gppd_idnr'],kind='power',name=r['name'],country=r['country'],region='',locality='',coordinates=[float(r['longitude']),float(r['latitude'])],type=r['primary_fuel']+' power',source='wri-power-plants',sourceRow=r['gppd_idnr'],value=num(r['capacity_mw']),unit='MW',metric='Installed generation capacity',year=int(capacity_year) if capacity_year is not None else None,basis='capacity',status=None,attributes={k:clean(v) for k,v in r.items() if k not in ('name','country','latitude','longitude') and clean(v) is not None}))

trace_rows,trace_source,trace_exclusions=load_trace(BASE)
records.extend(trace_rows)
SOURCES['climate-trace-2025']=trace_source
exclusions['climate-trace-2025']=trace_exclusions

# Stable sorting and IDs; no cross-source entity deduplication is claimed.
for r in records:
 if r['country']=='KOS':
  r['attributes']['original_country_code']='KOS'
  r['country']='XKX' # Source alias for Kosovo; original source code remains explicit.
records.sort(key=lambda r:(r['kind'],r['country'],r['name'].casefold(),r['id']))
assert len({r['id'] for r in records})==len(records)
shards=defaultdict(list)
for r in records:
 assert all(math.isfinite(x) for x in r['coordinates'])
 assert r['value'] is None or math.isfinite(r['value']) and r['value']>=0
 shards[(r['kind'],r['country'])].append(r)
index={'version':'14','publishedAt':'2026-09-22','totalRecords':len(records),'sources':SOURCES,'datasets':{},'exclusions':exclusions,'countDefinition':'Source records; provider overlap is not silently merged. Counts are not a census of unique operating facilities.'}
for (kind,country),rows in shards.items():
 # 2,000-row chunks bound server memory; each query scans one chunk at a time.
 parts=[]
 for start in range(0,len(rows),2000):
  part=start//2000
  path=f'/data/v14/facilities/{kind}/{country}/{part}.json'
  write(ROOT/'public'/path.lstrip('/'),rows[start:start+2000])
  parts.append(path)
 entry=dict(count=len(rows),parts=parts,regions=dict(Counter(r['region'] for r in rows if r['region'])),types=dict(Counter(r['type'] for r in rows)),bases=dict(Counter(r['basis'] for r in rows)),sources=sorted(set(r['source'] for r in rows)))
 # Lightweight full map index has no record truncation and no heavy evidence payload.
 pins=[dict(id=r['id'],name=r['name'],coordinates=r['coordinates'],country=r['country'],region=r['region'],locality=r['locality'],type=r['type'],basis=r['basis'],value=r['value'],unit=r['unit'],metric=r['metric'],year=r['year'],source=r['source'],part=i//2000,status=r['status']) for i,r in enumerate(rows)]
 write(OUT/f'facilities/{kind}/{country}/index.json',pins)
 index['datasets'].setdefault(kind,{'count':0,'countries':{}})['count']+=len(rows)
 index['datasets'][kind]['countries'][country]=entry
# Global outfalls retain source country assignments, including UNASSIGNED.
river_pins=[]
for iso in index['datasets']['river']['countries']:
 river_pins.extend(json.loads(gzip.decompress((OUT/f'facilities/river/{iso}/index.json').read_bytes())))
write(OUT/'facilities/river/WORLD/index.json',river_pins)
write(OUT/'facilities/catalog.json',index)
# Original provider links are preserved separately. Signed legacy links are not republished.
for providers in provider_catalog.values():
 for p in providers:
  for key,value in list(p.items()):
   if isinstance(value,str) and ('X-Amz-' in value or 'sig=' in value):p[key]='See license URL in original Statistics Canada archive.'
write(OUT/'facilities/providers.json',provider_catalog)
for key,providers in provider_catalog.items():write(BASE/'raw'/f'{key}-providers.json',providers)
# Retain only the selected, original oil/gas rows in compressed form in Git.
# Full upstream archive is reacquirable and its hash is pinned in downloads.json.
if (BASE/'raw/odi-oil-gas/odi_oil_gas.gpkg').exists():
 raw_oil=[]
 conn=sqlite3.connect(BASE/'raw/odi-oil-gas/odi_oil_gas.gpkg');conn.row_factory=sqlite3.Row
 for r in conn.execute("SELECT * FROM odi_oil_gas WHERE sub_type='facilities'"):
  d=dict(r);d['geom']=d['geom'].hex() if d['geom'] else None;raw_oil.append(d)
 (BASE/'raw/odi-oil-gas-facilities-original.json.gz').write_bytes(gzip.compress(json.dumps(raw_oil,ensure_ascii=False,separators=(',',':')).encode(),mtime=0))
 conn.close()
# Update the shared place coverage and source registry so other pages report the same scope.
coverage_path=ROOT/'public/data/v11/coverage.json'
coverage=json.loads(coverage_path.read_text())
for iso,entry in coverage['countries'].items():
 entry['sites']={kind:d['countries'][iso]['count'] for kind,d in index['datasets'].items() if iso in d['countries']}
 if iso=='WORLD':entry['sites']={kind:d['count'] for kind,d in index['datasets'].items()}
 if iso=='BC':entry['sites']={kind:d['countries'].get('CAN',{}).get('regions',{}).get('BC',0) for kind,d in index['datasets'].items() if d['countries'].get('CAN',{}).get('regions',{}).get('BC')}
coverage['method']='Accounts and trade retain their own source scope. Facility counts use all release-14 source records, without UI sample caps; provider overlap is retained.'
write(coverage_path,coverage)
registry_path=ROOT/'public/data/v3/sources.json'
registry=json.loads(registry_path.read_text())
registry=[r for r in registry if r['id'] not in SOURCES]
for id,s in SOURCES.items():registry.append(dict(id=id,status='available',title=s['title'],publisher=s['publisher'],url=s['url'],edition=s['edition'],coverageYears=s['edition'],license=s['license'],retrievedAt=s['retrievedAt'],method=s['coverage']+' '+s['method'],limitations=s['limits'],citation=s.get('citation'),downloadUrls=[s['download']]))
write(registry_path,registry)
report={'version':'14','records':len(records),'kinds':dict(Counter(r['kind'] for r in records)),'countries':len(set(r['country'] for r in records if r['country']!='UNASSIGNED')),'basis':dict(Counter(r['basis'] for r in records)),'canada':dict(Counter(r['kind'] for r in records if r['country']=='CAN')),'sourceCounts':dict(Counter(r['source'] for r in records)),'exclusions':exclusions,'inputs':{'fullParquetSha256':hashlib.sha256(parquet.read_bytes()).hexdigest(),'wriCsvSha256':hashlib.sha256(gzip.decompress(power_path.read_bytes())).hexdigest()},'largestRecordChunkBytes':max(p.stat().st_size for p in (OUT/'facilities').rglob('*.json') if p.stem.isdigit())}
write(BASE/'validation.json',report)
print(json.dumps(report,indent=2))
