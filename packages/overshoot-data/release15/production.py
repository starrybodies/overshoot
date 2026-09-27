"""Build source-preserving FAO product histories, 1970–2024.

Each item is a separate series. Parent categories and their children are never
summed. Source world totals, original units, flags, notes and CSV row are kept.
"""
from pathlib import Path
from collections import defaultdict,Counter
import csv,zipfile,io,json,gzip,math,hashlib
BASE=Path(__file__).resolve().parent;ROOT=BASE.parents[2];OUT=ROOT/'public/data/v15/production';OUT.mkdir(parents=True,exist_ok=True)
country_map={c['numeric']:c['id'] for c in json.loads((ROOT/'packages/overshoot-data/expanded/resources/raw/country-contract.json').read_text())}
forest={
 'wood':['1865','1864','1872','1873','1696','1693','1694','1630','1861','1868','1634','1640','1697','1874','1648','1606','1688','1636','1607','1600','1619','1620'],
 'paper':['1876','1875','1668','1669','1865','1667','1656','1685','2043','1617','1618','1621','1622','2042','1671','1674','1676'],
}
crops={'food':['15','27','56','44','116','125','156','157','236','254','267','270','242','656','661','667','486','490','515','560','388','403','176','191','882','951','867','1035','1058','1062','1182','122','137'],
 'textiles':['767','328','771','780','782','777','789','987','1186','1185','919','995','1025']}
notes={
 '767':'Ginned cotton lint is the fibre separated from seed cotton. Do not add it to the unginned harvest as though both were new material.',
 '328':'Seed cotton includes seed and fibre before ginning. It is not the mass of cotton fibre in a garment.',
 '987':'Greasy shorn wool includes its natural grease and impurities. Clean wool and finished textiles have a different mass.',
 '1865':'Roundwood for industrial uses, in cubic metres. No conversion to tonnes or finished-product output is made.',
 '1861':'Roundwood includes industrial roundwood and wood fuel. These categories overlap and must not be added together.',
 '1876':'Finished paper and paperboard. Imported or recovered fibre can contribute; the producing country need not be where the trees grew.',
 '1669':'Recovered paper collected for use as a raw material. This is a quantity, not a recycling rate or finished recycled-paper output.',
 '1600':'Recovered post-consumer wood reported by the source. This quantity is not a collection or recycling rate.',
 '1875':'Wood pulp is an intermediate input. Adding it to finished paper would count material again.',
 '2043':'Packaging paper and paperboard is a subcategory of paper and paperboard. These totals overlap.',
 '1667':'Dissolving wood pulp is processed cellulose used in applications including manufactured fibres. Its output is not a textile production total.',
}
def write(path,data):
 b=json.dumps(data,ensure_ascii=False,separators=(',',':'),allow_nan=False).encode();path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(gzip.compress(b,mtime=0) if path.name!='catalog.json' else b)
reports={}
for key,groups,archive,manifest_name in [
 ('forestry',forest,ROOT/'packages/overshoot-data/release12/raw/faostat-forestry.zip',ROOT/'packages/overshoot-data/release12/raw/faostat-forestry.download.json'),
 ('agriculture',crops,ROOT/'packages/overshoot-data/expanded/resources/raw/faostat-qcl.zip',ROOT/'packages/overshoot-data/expanded/resources/raw/faostat-qcl-download.json')]:
 meta=json.loads(manifest_name.read_text());assert hashlib.sha256(archive.read_bytes()).hexdigest()==meta['sha256']
 chosen={c for v in groups.values() for c in v};rows=defaultdict(list);units={};excluded=Counter()
 with zipfile.ZipFile(archive) as z:
  items={r['Item Code']:r['Item'] for r in csv.DictReader(io.StringIO(z.read(next(n for n in z.namelist() if 'ItemCodes' in n)).decode('utf-8-sig')))}
  flags={r['Flag']:r.get('Description',r.get(' Description','')) for r in csv.DictReader(io.StringIO(z.read(next(n for n in z.namelist() if 'Flags' in n)).decode('utf-8-sig')))}
  for i,r in enumerate(csv.DictReader(io.TextIOWrapper(z.open(next(n for n in z.namelist() if '(Normalized)' in n)),encoding='utf-8-sig')),2):
   if r['Element']!='Production' or r['Item Code'] not in chosen or not 1970<=int(r['Year'])<=2024:continue
   country='WORLD' if r['Area']=='World' else country_map.get(r['Area Code (M49)'].lstrip("'"))
   if not country:excluded['non-country_or_historical_area']+=1;continue
   code=r['Item Code']
   if key=='agriculture' and r['Unit']!='t':excluded['non_mass_production_series']+=1;continue
   assert r['Unit'] in ('m3','t'),(code,r['Unit'])
   unit='m³' if r['Unit']=='m3' else 'tonnes';units[code]=unit
   value=float(r['Value']) if r['Value'] else None;assert value is None or math.isfinite(value) and value>=0
   rows[code].append(dict(country=country,year=int(r['Year']),item_code=code,item=r['Item'],value=value,unit=unit,source_flag=r['Flag'],source_id='faostat-forestry-2026' if key=='forestry' else 'faostat-qcl-2025',original_unit=r['Unit'],note=r.get('Note',''),sourceRow=i))
 for code,rr in rows.items():
  assert len({(r['country'],r['year']) for r in rr})==len(rr)
  write(OUT/f'items/{code}.json',rr)
 for material,codes in groups.items():
  products={code:dict(name=items[code].replace(';',','),unit=units[code],description=notes.get(code,'Production in the original FAO commodity and unit. This is one product series; parent categories, inputs and processed outputs may overlap.'),years=sorted({r['year'] for r in rows[code]}),path=f'/data/v15/production/items/{code}.json',countries=len({r['country'] for r in rows[code] if r['country']!='WORLD'})) for code in codes if code in rows}
  cat=dict(material=material,sourceId='faostat-forestry-2026' if key=='forestry' else 'faostat-qcl-2025',publisher='FAO',title='Forestry production and trade' if key=='forestry' else 'Crops and livestock products',url='https://www.fao.org/faostat/en/#data/'+('FO' if key=='forestry' else 'QCL'),methodUrl='https://www.fao.org/statistics/data-collection/forestry/en' if key=='forestry' else 'https://www.fao.org/faostat/en/#data/QCL',license='CC BY 4.0; FAO statistical database terms apply',retrievedAt=meta.get('retrievedAt','2026-09-21'),edition='9 January 2026' if key=='forestry' else '31 December 2025',defaultItem={'wood':'1865','paper':'1876','food':'15','textiles':'767'}[material],latestYear=2024,products=products,sourceFlags=flags,sourceArchiveSha256=meta['sha256'],limitations=['Source world totals are retained rather than calculated by summing displayed countries.','Products overlap: compare series separately; do not add parent categories, inputs and processed outputs.','Historical political boundaries change. Only the retained country directory is mapped; former-country and regional aggregates are excluded.','Source flags distinguish official observations, estimates and imputed values. No additional interpolation is applied.'])
  write(OUT/f'{material}/catalog.json',cat)
 reports[key]=dict(products=len(rows),records=sum(len(r) for r in rows.values()),countries=len({r['country'] for rr in rows.values() for r in rr if r['country']!='WORLD'}),years=[1970,2024],excluded=dict(excluded),sha256=meta['sha256'])
 print(key,reports[key],flush=True)
(BASE/'production-reconciliation.json').write_text(json.dumps(reports,indent=2)+'\n')
