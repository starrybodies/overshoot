"""Reconcile published values against source records, not UI formatting."""
from pathlib import Path
from decimal import Decimal
import json,gzip,csv,hashlib,collections
ROOT=Path(__file__).resolve().parent
REPO=ROOT.parents[2]
OUT=REPO/'public/data/v10'
def read(path):return json.loads(path.read_text())
manifest=read(ROOT/'manifest.json')
for f in manifest['files']:
    assert f['url'],f['file']
    assert hashlib.sha256((ROOT/'raw'/f['file']).read_bytes()).hexdigest()==f['sha256']
all_ids=set();all_reporters=set()
for year,filename in [(2023,'basel-detail0.json'),(2024,'basel-detail1.json')]:
    raw=read(ROOT.parent/'expanded/trade/raw'/filename)['value']
    published=json.loads(gzip.decompress((OUT/('basel-'+str(year)+'.json.gz')).read_bytes()))
    total=Decimal(0);by_route=collections.defaultdict(Decimal)
    for r in published['records']:
        source=raw[r['row_index']]
        assert r['id'] not in all_ids
        all_ids.add(r['id']);all_reporters.add(r['origin'])
        assert r['origin']!=r['destination']
        assert Decimal(str(r['tonnes']))==Decimal(source['Amount'])>0
        assert r['waste_description']==source.get('Type_of_waste')
        assert r['recovery_code']==source.get('R_Code')
        assert r['disposal_code']==source.get('D_Code')
        total+=Decimal(source['Amount']);by_route[(r['origin'],r['destination'])]+=Decimal(source['Amount'])
    assert sum(by_route.values())==total
    assert len(published['reporters'])==len({r['origin'] for r in published['records']})
assert len(all_ids)==17314 and len(all_reporters)==103
source=list(csv.DictReader((ROOT/'raw/bc-disposal.csv').open()))
bc=read(OUT/'bc-disposal.json')['rows']
assert len(source)==len(bc)==945
for a,b in zip(source,bc):
    assert b['original']==a
    if not a['Disposal_Rate_kg'] or Decimal(a['Disposal_Rate_kg'])==0:
        assert b['rate'] is None and b['tonnes'] is None
    else:
        assert Decimal(str(b['rate']))==Decimal(a['Disposal_Rate_kg'])
        assert Decimal(str(b['tonnes']))==Decimal(a['Total_Disposed_Tonnes'])
mapped={f['properties']['district'] for f in read(OUT/'bc-districts.json')['features']}
assert {r['district'] for r in bc}-mapped=={'Northern Rockies'}
assert len(mapped)==26
plastic=read(OUT/'plastic-fates.json')['records']
for country in ['WORLD','CAN','USA']:
    values={r['metric']:Decimal(str(r['value'])) for r in plastic if r['country']==country}
    generated=values.pop('plastic_waste_generated')
    assert abs(sum(values.values())-generated)<=1
    assert all(r['estimated'] and r['year']==2019 for r in plastic if r['country']==country)
hartland=read(OUT/'hartland.json')['rows']
assert next(r for r in hartland if r['year']==2025)['tonnes']==151928
h24=next(r for r in hartland if r['year']==2024)
b24=next(r for r in bc if r['year']==2024 and r['district']=='Capital')
assert h24['tonnes']==b24['tonnes']==157189
assert h24['population']!=b24['population'] and h24['rate']!=b24['rate']
print('PASS: 17,314 Basel sections match raw values and operations; 945 BC source rows; missingness and geographic joins; three plastic fate partitions; Hartland scope; snapshot hashes.')
