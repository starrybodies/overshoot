"""Extend the retained inventory and build complete, lightweight world indexes.

No point is inferred from a country centroid. Original point-source observations
are retained; identical repeated API IDs are removed, not summed. Existing v14
records remain byte-for-byte reproducible and retain their original provenance.
"""
from pathlib import Path
from collections import Counter, defaultdict
import json, gzip, hashlib, math

BASE=Path(__file__).resolve().parent
ROOT=BASE.parents[2]
OUT=ROOT/'public/data/v15/facilities'
OLD=ROOT/'public/data/v14/facilities'
catalog=json.loads((OLD/'catalog.json').read_text())
catalog.update(version='15',publishedAt='2026-09-22')
catalog['sourceAreas']={'ZNC':{'name':'Northern Cyprus','publisherLabel':'Turkish Republic of Northern Cyprus','source':'Climate TRACE definitions/countries','note':'Publisher-specific geographic code, preserved without changing the map’s country boundaries. National material-account series are not mapped to this code.'}}
manifest=json.loads((BASE/'raw/climate-trace/manifest.json').read_text())
classes={'bauxite-mining':'Bauxite mine','copper-mining':'Copper mine','iron-mining':'Iron mine','coal-mining':'Coal mine','rock-quarrying':'Rock quarry','sand-quarrying':'Sand quarry','other-mining-quarrying':'Other mine / quarry','textiles-leather-apparel':'Textiles, leather & apparel','wood-and-wood-products':'Wood products','food-beverage-tobacco':'Food, beverage & tobacco','chemicals':'Chemicals','other-chemicals':'Other chemicals','other-metals':'Other metals','lime':'Lime','electricity-generation':'Electricity generation','oil-and-gas-transport':'Oil / gas transport','industrial-wastewater-treatment-and-discharge':'Industrial wastewater','domestic-wastewater-treatment-and-discharge':'Domestic wastewater','incineration-and-open-burning-of-waste':'Waste incineration / open burning','biological-treatment-of-solid-waste-and-biogenic':'Biological waste treatment'}
added=defaultdict(list);seen={};excluded=Counter()
for page in manifest['pages']:
    payload=gzip.decompress((BASE/page['file']).read_bytes())
    assert hashlib.sha256(payload).hexdigest()==page['sha256']
    for r in json.loads(payload) or []:
        if r['id'] in seen:
            assert seen[r['id']]==r
            excluded['identical_repeated_api_rows']+=1;continue
        seen[r['id']]=r
        if r['sourceType']!='point-source':excluded[r['sourceType']]+=1;continue
        p=r.get('centroid') or {};x,y=p.get('longitude'),p.get('latitude')
        if not all(isinstance(n,(float,int)) and math.isfinite(n) for n in [x,y]) or not(-180<=x<=180 and -90<=y<=90):excluded['invalid_coordinates']+=1;continue
        assert p.get('srid')==4326 and r['gas']=='co2e_100yr' and r['year']==2025
        sub=r['subsector']
        kind='mining' if sub.endswith(('mining','quarrying')) else 'power' if sub=='electricity-generation' else 'energy' if sub=='oil-and-gas-transport' else 'wastewater' if 'wastewater' in sub else 'landfill' if 'waste' in sub else 'industry'
        attrs={k:v for k,v in r.items() if k not in ('centroid','name','country','id')}
        attrs.update(location_method='Climate TRACE point-source centroid; positional precision varies by source.',url=f"https://api.climatetrace.org/v7/sources/{r['id']}",estimate_method='Source inventory estimate; the summary API does not identify a measurement method for each value.',restricted_fields=','.join(k for k in ['activity','capacity','emissionsFactor'] if 'restricted' in str(r.get(k+'Units','')).lower()))
        country=r['country']
        if country=='KOS':country='XKX';attrs['original_country_code']='KOS'
        row=dict(id='trace-'+str(r['id']),kind=kind,name=r['name'],country=country,region='',locality='',coordinates=[x,y],type=classes[sub],source='climate-trace-2025',sourceRow=str(r['id']),value=r.get('emissionsQuantity'),unit='tonnes CO₂e/year',metric='Greenhouse-gas emissions · 100-year warming potential',year=2025,basis='estimated',status=None,attributes=attrs)
        added[(kind,country)].append(row)

def read(path):
    b=path.read_bytes();return json.loads(gzip.decompress(b) if b[:2]==b'\x1f\x8b' else b)
def write(path,data):
    path.parent.mkdir(parents=True,exist_ok=True)
    b=json.dumps(data,ensure_ascii=False,separators=(',',':'),allow_nan=False).encode()
    path.write_bytes(gzip.compress(b,mtime=0) if path.name!='catalog.json' else b)
def compact_index(pins):
    fields=list(pins[0])
    keys=['country','region','type','source','metric','unit','basis','status']
    dictionaries={k:list(dict.fromkeys(r[k] for r in pins)) for k in keys}
    lookups={k:{v:i for i,v in enumerate(values)} for k,values in dictionaries.items()}
    return dict(fields=fields,dictionaries=dictionaries,rows=[[lookups[k][r[k]] if k in lookups else r[k] for k in fields] for r in pins])

new_count=0
for (kind,country),new in added.items():
    entry=catalog['datasets'][kind]['countries'].get(country)
    rows=[]
    for path in entry['parts'] if entry else []:rows.extend(read(ROOT/'public'/path.lstrip('/')))
    old_ids={r['id'] for r in rows}
    assert not old_ids.intersection(r['id'] for r in new)
    rows+=new;new_count+=len(new)
    rows.sort(key=lambda r:(r['name'].casefold(),r['id']))
    parts=[]
    for start in range(0,len(rows),2000):
        part=start//2000;path=f'/data/v15/facilities/{kind}/{country}/{part}.json'
        write(ROOT/'public'/path.lstrip('/'),rows[start:start+2000]);parts.append(path)
    pins=[dict(**{k:v for k,v in r.items() if k not in ('kind','sourceRow','attributes')},part=i//2000) for i,r in enumerate(rows)]
    write(OUT/f'{kind}/{country}/index.json',pins)
    catalog['datasets'][kind]['countries'][country]=dict(count=len(rows),parts=parts,index=f'/data/v15/facilities/{kind}/{country}/index.json',regions=dict(Counter(r['region'] for r in rows if r['region'])),types=dict(Counter(r['type'] for r in rows)),bases=dict(Counter(r['basis'] for r in rows)),sources=sorted({r['source'] for r in rows}))

for kind,d in catalog['datasets'].items():
    pins=[]
    for country,entry in d['countries'].items():
        entry.setdefault('index',f'/data/v14/facilities/{kind}/{country}/index.json')
        pins.extend(read(ROOT/'public'/entry['index'].lstrip('/')))
    pins.sort(key=lambda r:(r['name'].casefold(),r['id']))
    assert len({r['id'] for r in pins})==len(pins)
    d['count']=len(pins)
    d['world']=dict(count=len(pins),index=f'/data/v15/facilities/{kind}/WORLD/index.json',parts=[],regions={},types=dict(Counter(r['type'] for r in pins)),bases=dict(Counter(r['basis'] for r in pins)),sources=sorted({r['source'] for r in pins}))
    write(OUT/f'{kind}/WORLD/index.json',compact_index(pins))

source=catalog['sources']['climate-trace-2025']
trace_count=19836+new_count
source['coverage']=f'{trace_count:,} retained geolocated point-source records across selected waste, power, mining, oil/gas and manufacturing subsectors. Administrative aggregates are excluded.'
source['method']+=' The release 15 extension removes only byte-equivalent repeated source IDs from API pagination. All original pages and hashes remain available.'
source['limits'].append(manifest['paginationCaveat'])
catalog['totalRecords']=sum(d['count'] for d in catalog['datasets'].values())
catalog['exclusions']['climate-trace-2025-extension']=dict(excluded)
write(OUT/'catalog.json',catalog)
report=dict(totalRecords=catalog['totalRecords'],addedRecords=new_count,climateTraceRecords=trace_count,datasets={k:v['count'] for k,v in catalog['datasets'].items()},subsectors=dict(Counter(r['attributes']['subsector'] for rows in added.values() for r in rows)),excluded=dict(excluded))
(BASE/'facility-reconciliation.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
