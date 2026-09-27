"""Normalize the archived IRP CSV into OVERSHOOT's browser contract; stdlib only.
Run: python normalize_irp.py [directory_containing_snapshots]
Missing cells and missing country/material records remain null. No interpolation.
"""
import csv, hashlib, json, sys
from pathlib import Path
P = Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).parent
raw = P / 'irp_de_4classes_export.csv'
metadata = json.loads((P / 'page.json').read_text())['props']['countries']
rows = list(csv.DictReader(raw.open()))
years = [int(k) for k in rows[0] if k.isdigit()]
materials = {'Biomass':'biomass','Fossil fuels':'fossil','Metal ores':'metals','Non-metallic minerals':'minerals'}
# Historical boundaries cannot be painted onto current geometry without a documented spatial concordance.
historical = {'CSK200','ETH230','ANT530','SCG891','YEM886','YMD720','SDN736','SUN810','YUG890'}
by_name = {c['name']:c for c in metadata}
retained_names = set(r['Country'] for r in rows)
countries = [{'id': c['code'][:3], 'name':'Curaçao' if c['name']=='Cura<e7>ao' else c['name'], 'numeric':c['code'][3:]} for c in metadata if c['name'] in retained_names and len(c['code'])==6 and c['code'] not in historical and c['code'][3:]!='000']
assert len({c['id'] for c in countries})==len(countries), 'Duplicate modern ISO3'
allowed = {c['id'] for c in countries}
normalized = {}
for raw_row in rows:
    code = by_name[raw_row['Country']]['code']
    if code == 'WO': country = 'WORLD'
    elif len(code)==6 and code not in historical and code[:3] in allowed: country=code[:3]
    else: continue
    assert raw_row['Flow code']=='DE' and raw_row['Flow unit']=='t'
    material=materials[raw_row['Category']]
    for year in years:
        key=(country,year)
        out=normalized.setdefault(key, {'country':country,'year':year,'biomass':None,'fossil':None,'metals':None,'minerals':None,'total':None,'population':None,'source_id':'irp-2026','original_unit':'t','estimated':year>=2022})
        val=raw_row[str(year)]
        out[material] = None if val=='' else int(val)
        assert out[material] is None or out[material]>=0
for row in normalized.values():
    vals=[row[m] for m in materials.values()]
    row['total']=sum(vals) if all(v is not None for v in vals) else None
result={'version':'irp-gmfd-2024-retrieved-2026-09-19-v1','source_id':'irp-2026','years':years,'countries':countries,'rows':sorted(normalized.values(),key=lambda r:(r['country'],r['year']))}
(P/'extraction.json').write_text(json.dumps(result,separators=(',',':'),ensure_ascii=False))
world=[r for r in result['rows'] if r['country']=='WORLD']
assert len(world)==55 and all(r['total'] is not None for r in world)
assert world[-1]['total']==106971469898
summary={'raw_sha256':hashlib.sha256(raw.read_bytes()).hexdigest(),'raw_rows':len(rows),'normalized_rows':len(result['rows']),'countries':len(countries),'years':[min(years),max(years)],'complete_country_years':sum(r['total'] is not None for r in result['rows'] if r['country']!='WORLD'),'world_latest':world[-1],'historical_codes_excluded':sorted(historical),'missing_population':True,'missing_categories_are_null':True}
(P/'validation.json').write_text(json.dumps(summary,indent=2))
print(json.dumps(summary,indent=2))
