"""Publish selected FAO production records in their native units; no aggregation.

The forestry archive is pinned by raw/faostat-forestry.download.json.
Crop records reuse the validated, retained QCL snapshot from release 2.
Run from any directory with standard Python 3. Network is only needed to
reacquire a missing forestry archive, whose checksum is verified before use.
"""
import csv, hashlib, io, json, math, pathlib, urllib.request, zipfile

HERE=pathlib.Path(__file__).parent
ROOT=HERE.parents[2]
OUT=ROOT/'public/data/v12/production'
OUT.mkdir(parents=True,exist_ok=True)
meta=json.loads((HERE/'raw/faostat-forestry.download.json').read_text())
archive=HERE/'raw'/meta['file']
if not archive.exists():
    with urllib.request.urlopen(meta['url'],timeout=60) as response: archive.write_bytes(response.read())
assert hashlib.sha256(archive.read_bytes()).hexdigest()==meta['sha256'], 'Source archive changed; review before replacing the pinned release.'
country_map={c['numeric']:c['id'] for c in json.loads((ROOT/'packages/overshoot-data/expanded/resources/raw/country-contract.json').read_text())}
products={
 '1865':{'name':'Industrial roundwood','unit':'m³','materials':['wood','paper'],'description':'Roundwood for industrial uses. The source reports volume; it is not converted into a mass of finished products.'},
 '1864':{'name':'Wood fuel','unit':'m³','materials':['wood'],'description':'Wood fuel production, reported by volume. This does not measure combustion emissions.'},
 '1872':{'name':'Sawnwood','unit':'m³','materials':['wood'],'description':'Sawnwood output, in cubic metres. A processed product, separate from roundwood input.'},
 '1873':{'name':'Wood-based panels','unit':'m³','materials':['wood'],'description':'Panel production, in cubic metres. This aggregate includes several panel types and is separate from their wood inputs.'},
 '1696':{'name':'Wood pellets & briquettes','unit':'tonnes','materials':['wood'],'description':'Wood pellets, briquettes and other agglomerates. The source reports mass, unlike roundwood and sawnwood.'},
 '1875':{'name':'Wood pulp','unit':'tonnes','materials':['paper'],'description':'Wood pulp output. This is an intermediate material and must not be added to the paper made from it.'},
 '1668':{'name':'Pulp from other fibres','unit':'tonnes','materials':['paper'],'description':'Pulp from fibres other than wood, as classified by FAO. Separate from wood pulp and finished paper.'},
 '1669':{'name':'Recovered paper','unit':'tonnes','materials':['paper'],'description':'Recovered paper in the FAO production series. This is a quantity, not a recycling rate or a measurement of finished recycled paper.'},
 '1876':{'name':'Paper & paperboard','unit':'tonnes','materials':['paper'],'description':'Finished paper and paperboard production. Imported fibre can contribute to this output; the producing country is not necessarily where the trees grew.'},
}
rows=[];raw=[]
with zipfile.ZipFile(archive) as z:
    flags={r['Flag']:r[' Description'] for r in csv.DictReader(io.StringIO(z.read('Forestry_E_Flags.csv').decode('utf-8-sig')))}
    with z.open('Forestry_E_All_Data_(Normalized).csv') as f:
        reader=csv.DictReader(io.TextIOWrapper(f,encoding='utf-8-sig'))
        fieldnames=reader.fieldnames
        for r in reader:
            if r['Year']!='2024' or r['Element']!='Production' or r['Item Code'] not in products:continue
            country='WORLD' if r['Area']=='World' else country_map.get(r['Area Code (M49)'].lstrip("'"))
            if not country:continue
            p=products[r['Item Code']]
            assert r['Unit']==('m3' if p['unit']=='m³' else 't')
            value=float(r['Value']) if r['Value'] else None
            assert value is None or math.isfinite(value) and value>=0
            rows.append({'country':country,'year':2024,'item_code':r['Item Code'],'item':r['Item'],'value':value,'unit':p['unit'],'source_flag':r['Flag'],'source_id':'faostat-forestry-2026','original_unit':r['Unit'],'note':r.get('Note','')})
            raw.append(r)
assert len({(r['country'],r['item_code']) for r in rows})==len(rows)
assert {r['item_code'] for r in rows}==set(products)
with (HERE/'raw/faostat-forestry-2024-subset.csv').open('w') as f:
    w=csv.DictWriter(f,fieldnames=fieldnames);w.writeheader();w.writerows(raw)
def write(path,data):path.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'),allow_nan=False)+'\n')
for material in ['wood','paper']:
    chosen={k:v for k,v in products.items() if material in v['materials']}
    write(OUT/(material+'.json'),{'year':2024,'sourceId':'faostat-forestry-2026','publisher':'FAO','title':'Forestry production and trade','url':'https://www.fao.org/faostat/en/#data/FO','methodUrl':'https://www.fao.org/statistics/data-collection/forestry/en','license':'CC BY 4.0; FAO statistical database terms apply','retrievedAt':'2026-09-21','edition':'9 January 2026','products':chosen,'sourceFlags':flags,'rows':[r for r in rows if r['item_code'] in chosen]})
crop=json.loads((ROOT/'public/data/v2/agriculture.json').read_text())
crop_rows=[{**{k:v for k,v in r.items() if k!='tonnes'},'value':r['tonnes'],'unit':'tonnes'} for r in crop['rows']]
write(OUT/'food.json',{'year':crop['year'],'sourceId':crop['source_id'],'publisher':'FAO','title':'Crops and livestock products · selected crops','url':'https://www.fao.org/faostat/en/#data/QCL','methodUrl':'https://www.fao.org/faostat/en/#data/QCL','license':'CC BY 4.0; FAO statistical database terms apply','retrievedAt':'2026-09-19','edition':'31 December 2025','products':{k:{'name':v,'unit':'tonnes','description':'Primary crop production in source commodity tonnes. Moisture basis differs between crops; these are not dry biomass equivalents or the amount eaten.'} for k,v in crop['items'].items()},'sourceFlags':crop['sourceFlags'],'rows':crop_rows})
report={'forestProducts':len(products),'forestRecords':len(rows),'forestNumericRecords':sum(r['value'] is not None for r in rows),'forestCountries':len({r['country'] for r in rows if r['country']!='WORLD'}),'cropProducts':len(crop['items']),'cropRecords':len(crop_rows),'cropNumericRecords':sum(r['value'] is not None for r in crop_rows),'cropCountries':len({r['country'] for r in crop_rows if r['country']!='WORLD'}),'forestFlags':flags,'forestWorld':[r for r in rows if r['country']=='WORLD']}
write(HERE/'production-validation.json',report)
print(json.dumps({k:v for k,v in report.items() if k!='forestWorld'},indent=2))
