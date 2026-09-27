"""Normalize point-source evidence; administrative centroids are not facilities."""
from pathlib import Path
from collections import Counter
import json,gzip,math,hashlib

def load_trace(base):
 manifest=json.loads((base/'raw/climate-trace/manifest.json').read_text())
 records=[];excluded=Counter()
 classes={'solid-waste-disposal':'Solid-waste disposal','oil-and-gas-refining':'Oil refinery','oil-and-gas-production':'Oil / gas production','cement':'Cement','iron-and-steel':'Iron & steel','aluminum':'Aluminium','pulp-and-paper':'Pulp & paper','glass':'Glass','petrochemical-steam-cracking':'Petrochemical cracking'}
 for page in manifest['pages']:
  payload=gzip.decompress((base/page['file']).read_bytes())
  assert hashlib.sha256(payload).hexdigest()==page['sha256']
  for r in json.loads(payload) or []:
   if r['sourceType']!='point-source':excluded[r['sourceType']]+=1;continue
   p=r.get('centroid') or {};x,y=p.get('longitude'),p.get('latitude')
   if not all(isinstance(n,(float,int)) and math.isfinite(n) for n in [x,y]) or not(-180<=x<=180 and -90<=y<=90):excluded['missing_or_invalid_coordinates']+=1;continue
   assert p.get('srid')==4326 and r['gas']=='co2e_100yr' and r['year']==2025
   kind='landfill' if r['subsector']=='solid-waste-disposal' else 'energy' if r['sector']=='fossil-fuel-operations' else 'industry'
   attrs={k:v for k,v in r.items() if k not in ('centroid','name','country','id')}
   attrs['location_method']='Climate TRACE point-source centroid; positional precision varies by source.'
   attrs['url']=f"https://api.climatetrace.org/v7/sources/{r['id']}"
   attrs['estimate_method']='Source inventory estimate: models and public reports; the summary API does not identify a measurement method for each value.'
   # Upstream uses 0 alongside "license restricted". Keep the native fields,
   # but these zeros must never become a displayed or derived activity measure.
   attrs['restricted_fields']=','.join(k for k in ['activity','capacity','emissionsFactor'] if 'restricted' in str(r.get(k+'Units','')).lower())
   records.append(dict(id='trace-'+str(r['id']),kind=kind,name=r['name'],country=r['country'],region='',locality='',coordinates=[x,y],type=classes[r['subsector']],source='climate-trace-2025',sourceRow=str(r['id']),value=r.get('emissionsQuantity'),unit='tonnes CO₂e/year',metric='Greenhouse-gas emissions · 100-year warming potential',year=r['year'],basis='estimated',status=None,attributes=attrs))
 source=dict(title='Climate TRACE · global industrial sources',publisher='Climate TRACE coalition and contributing providers',url='https://climatetrace.org/data',license='CC BY 4.0; listed external-source exceptions',licenseUrl='https://climatetrace.org/terms',edition='2025 annual estimates · API v7 snapshot, September 2026',retrievedAt='2026-09-22',coverage=f"{len(records):,} geolocated point-source records across nine selected waste, oil/gas and manufacturing subsectors. Administrative-area aggregates are excluded.",method='Retain native point-source centroids, identifiers and 2025 inventory estimates. CO₂e uses IPCC AR6 100-year global warming potentials. Upstream activity fields marked license restricted are unavailable, not zero. Original API pages and hashes are retained.',limits=['Emissions combine models and public reports. The summary API does not provide a per-record measurement method or uncertainty interval.','Tonnes of CO₂e describe climate impact, not tonnes of waste handled or material produced.','Point-source centroids can represent a production area or complex; they are not guaranteed building-level coordinates.','Names may be descriptive labels assigned by the provider. Overlap with other source inventories is retained.','Selected subsectors and source coverage do not form a complete census of operating facilities.'],question='Where do material-processing and fossil-fuel emissions originate?',download='https://api.climatetrace.org/v7/docs/index.html',citation='Climate TRACE. Emissions inventory, 2025 annual CO₂e estimates. API v7 snapshot retrieved 22 September 2026. Modified by filtering point-source records, organizing subsectors and labeling measurement basis; quantities and coordinates unchanged.')
 return records,source,dict(excluded)
