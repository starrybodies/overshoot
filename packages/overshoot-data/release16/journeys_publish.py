"""Build small, reusable stage indexes from the already validated facility release.

Classification selects published facility types; no proximity joins or claimed supply links.
Every pin retains its source identifier and the original detail-chunk reference.
"""
from pathlib import Path
import json,gzip,hashlib
from collections import Counter
BASE=Path(__file__).resolve().parent;ROOT=BASE.parents[2];OUT=ROOT/'public/data/v16/journeys';OUT.mkdir(parents=True,exist_ok=True)
catalog=json.loads((ROOT/'public/data/v15/facilities/catalog.json').read_text())
indexes={}
for kind,d in catalog['datasets'].items():
 b=(ROOT/'public'/d['world']['index'].lstrip('/')).read_bytes();j=json.loads(gzip.decompress(b) if b[:2]==b'\x1f\x8b' else b)
 indexes[kind]=j if isinstance(j,list) else [{key:j['dictionaries'][key][row[i]] if key in j['dictionaries'] else row[i] for i,key in enumerate(j['fields'])} for row in j['rows']]
colors=dict(extraction='#b67936',refining='#ba6760',manufacturing='#9274a7',use='#427aaa',recovery='#448b71',disposal='#82815b',ocean='#3e9caa')
labels=dict(extraction='Extraction',refining='Refining',manufacturing='Making products',use='Use',recovery='Recovery',disposal='Disposal',ocean='To the ocean')
descriptions=dict(extraction='Locate the sources of primary material.',refining='Find where raw inputs are separated, purified or transformed.',manufacturing='See where materials become industrial products.',use='Find industrial users and examine national material accounts.',recovery='Locate infrastructure that may return discarded material to use.',disposal='See infrastructure where residual waste is deposited.',ocean='Compare modeled river-borne plastic releases at river mouths.')
recovery=[('landfill',['Recycling','Material recovery','Recycling Station','Recycling Depot','Community Recycling Centre','Resource Recovery Centre','Waste Processing or Sorting','RECYCLE DEPOT'])]
disposal=[('landfill',[t for t in catalog['datasets']['landfill']['world']['types'] if 'landfill' in t.lower() or t in ['Solid-waste disposal','Dump']])]
ocean=[('river',['river-plastic'])]
specs={
 'fuels':dict(extraction=[('energy',['Oil / gas production','Oil and Gas Field']),('mining',['Coal mine'])],refining=[('energy',['Oil refinery','Gas Processing Plant','NGL Fractionation Facility'])],manufacturing=[('industry',['Petrochemical cracking'])],use=[('power',['Oil power','Gas power','Coal power','Petcoke power'])]),
 'copper':dict(extraction=[('mining',['Copper mine'])]),
 'aluminium':dict(extraction=[('mining',['Bauxite mine'])],refining=[('industry',['Aluminium'])]),
 'steel':dict(extraction=[('mining',['Iron mine'])],refining=[('industry',['Iron & steel'])]),
 'concrete':dict(refining=[('industry',['Lime'])],manufacturing=[('industry',['Cement'])]),
 'glass':dict(manufacturing=[('industry',['Glass'])]),
 'paper':dict(manufacturing=[('industry',['Pulp & paper'])]),
 'wood':dict(manufacturing=[('industry',['Pulp & paper'])]),
 'plastic':dict(extraction=[('energy',['Oil / gas production'])],refining=[('industry',['Petrochemical cracking'])],ocean=ocean),
 'rigid-plastic':dict(extraction=[('energy',['Oil / gas production'])],refining=[('industry',['Petrochemical cracking'])],ocean=ocean),
 'textiles':dict(manufacturing=[('industry',['Textiles, leather & apparel'])]),
 'food':dict(manufacturing=[('industry',['Food, beverage & tobacco'])]),
 'electronics':dict(extraction=[('mining',['Copper mine'])],ocean=ocean),
 'garbage':dict(ocean=ocean),
}
scope={
 ('fuels','extraction'):'Oil/gas production areas, source fields and coal mines. A point may represent a basin or area centroid; these are not individual well locations.',
 ('fuels','refining'):'Oil refineries, gas processing and NGL fractionation plants. Oil and gas remain separate source categories.',
 ('fuels','manufacturing'):'Petrochemical cracking is a non-fuel use of fossil feedstocks. These plants make chemical intermediates, not necessarily final consumer products.',
 ('fuels','use'):'Power plants classified by oil, gas, coal or petroleum-coke fuel. This does not cover transport, household or all industrial fuel use.',
 ('plastic','extraction'):'Oil/gas production is upstream context. These sources cannot identify which output becomes plastic rather than fuel.',
 ('rigid-plastic','extraction'):'Oil/gas production is upstream context; no link to a particular polymer or plastic object is established.',
 ('plastic','refining'):'Petrochemical cracking produces chemical feedstocks. Plant outputs are not all plastic, and supply links to manufacturers are not provided.',
 ('rigid-plastic','refining'):'Petrochemical feedstock plants; this source does not isolate feedstock for rigid products.',
 ('electronics','extraction'):'Copper is one of many electronic inputs. These are copper mines, not a verified device or manufacturer supply chain.',
 ('aluminium','refining'):'The source groups aluminium operations together. It does not distinguish every alumina refinery, smelter or downstream plant.',
 ('steel','refining'):'Iron and steel plants may use ore, scrap, or both. No feedstock share is inferred.',
 ('wood','manufacturing'):'Pulp and paper mills are one industrial destination for wood; sawmills and harvested forests are not inventoried here.',
 ('textiles','manufacturing'):'The source combines textiles, leather and apparel. Material and production steps cannot be disaggregated at every plant.',
 ('food','manufacturing'):'The source combines food, beverage and tobacco operations. These points are processing sites, not farms.',
}
gap=dict(extraction='A global, material-specific extraction-site register is not included for this guide. Production statistics and material accounts remain available in the other map tabs.',refining='This inventory does not reliably identify a global set of material-specific refining sites. Named regional operations and their sources appear below the map.',manufacturing='Final product makers are not comprehensively identified in the retained sources. Customs product records do not locate the factories.',use='Households, buildings and individual product use are not geolocated by these datasets. National consumption accounts describe broader material demand.',recovery='No material-specific global recovery inventory has been verified.',disposal='Disposal sites do not identify the origin or composition of every incoming load.')
written={};summary={}
for material,stages in specs.items():
 # Common infrastructure is explicitly context, never a material-specific destination.
 if material!='fuels':stages.update(recovery=recovery,disposal=disposal)
 result=[]
 for stage in ['extraction','refining','manufacturing','use','recovery','disposal']+(['ocean'] if 'ocean' in stages else []):
  specification=stages.get(stage,[]);records=[]
  for kind,types in specification:records.extend(dict(r,kind=kind) for r in indexes[kind] if r['type'] in types)
  key=hashlib.sha256(json.dumps(specification,sort_keys=True).encode()).hexdigest()[:12]
  path='/data/v16/journeys/layer-'+key+'.json' if records else None
  if records and key not in written:
   (OUT/('layer-'+key+'.json')).write_bytes(gzip.compress(json.dumps(records,separators=(',',':'),ensure_ascii=False).encode(),mtime=0));written[key]=len(records)
  note=scope.get((material,stage)) or (gap[stage] if not records else 'Source facility types identify this stage. Locations do not establish throughput, suppliers, buyers or a connection to the next stage.')
  if stage=='recovery' and records:note='General recycling and material-recovery infrastructure. Accepted materials and actual recovery outcomes vary; these are not verified destinations for this material.'
  if stage=='disposal' and records:note='General solid-waste disposal infrastructure, shown as context. The source does not establish that a selected product or material reaches these sites.'
  if stage=='ocean':note='Meijer et al. model of river plastic emissions for 2015. Outfall locations and modeled releases do not trace this material from an upstream facility. This is plastic context, not an electronics-waste measurement.' if material=='electronics' else 'Meijer et al. model of river plastic emissions for 2015. Outfalls are modeled release locations; they do not trace a selected object or identify upstream suppliers.'
  result.append(dict(id=stage,label=labels[stage],color=colors[stage],description=descriptions[stage],scope=note,path=path,count=len(records),countries=dict(Counter(r['country'] for r in records))))
 artifact=dict(version='16.0.0',material=material,stages=result,sourceCatalog='/data/v15/facilities/catalog.json',method='Filtered source types from the validated facility inventory. Dates, coordinates, source IDs and detail-chunk links are unchanged. No geographic proximity links, shipment tracking, interpolation or unique-facility deduplication is applied.')
 (OUT/(material+'.json')).write_text(json.dumps(artifact,separators=(',',':'))+'\n');summary[material]={s['id']:s['count'] for s in result}
(BASE/'journey-reconciliation.json').write_text(json.dumps(dict(materials=summary,sharedLayers=written),indent=2)+'\n')
print(json.dumps(summary,indent=2))
