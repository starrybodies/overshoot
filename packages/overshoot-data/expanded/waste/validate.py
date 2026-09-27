from pathlib import Path
import json,math,collections
P=Path(__file__).resolve().parent
R=json.loads((P/'metrics.json').read_text())['records'];S={s['id'] for s in json.loads((P/'sources.json').read_text())}
assert all(r['source_id'] in S for r in R)
assert all(math.isfinite(r['value']) and r['value']>=0 for r in R)
keys=[(r['source_id'],r['country'],r['metric'],r['year']) for r in R];assert len(keys)==len(set(keys))
plastic={r['metric']:r['value'] for r in R if r['source_id']=='oecd-plastics-database-2022' and r['country']=='WORLD' and r['year']==2019}
assert sum(plastic[k] for k in ['plastic_waste_recycled','plastic_waste_incinerated','plastic_waste_sanitary_landfill','plastic_waste_mismanaged','plastic_waste_uncollected_litter'])==plastic['plastic_waste_generated']==353291100
st=[r for r in R if r['source_id']=='mat-stocks-2024'];assert len(st)==531 and len(set(r['country'] for r in st))==177
assert all(r['year']==2016 and r['original_unit']=='kilotonnes' and r['value']==r['original_value']*1000 for r in st)
assert not any(r['country']=='CHN' for r in R if r['source_id']=='oecd-plastics-database-2022')
assert any(r['country']=='WORLD' and r['year']==2022 and abs(r['value']-61908365.36)<1e-3 for r in R if r['metric']=='ewaste_generated')
assert any(r['country']=='CAN' and r['metric']=='ewaste_per_capita' and r['original_unit']=='KG' and r['value']==r['original_value']/1000 for r in R)
curated={'in_use_stock','stock_additions','stock_end_of_life','ewaste_generated','ewaste_recycled','ewaste_recycling_rate','ewaste_per_capita','municipal_waste_generated','municipal_waste_recycled','municipal_recycling_rate','food_waste','food_waste_per_capita','household_food_waste','household_food_waste_per_capita','circular_material_use_rate','plastic_waste_generated','plastic_waste_recycled','plastic_waste_incinerated','plastic_waste_sanitary_landfill','plastic_waste_mismanaged','plastic_waste_uncollected_litter','plastic_use','plastic_environmental_leakage','plastic_stock_in_ocean','plastic_stock_in_rivers','plastic_aquatic_leakage','plastic_ocean_inflow','hazardous_waste_generated','food_loss_rate'}
curated.update({'food_service_food_waste','retail_food_waste','hazardous_waste_treated_recycl','hazardous_waste_treated_landfil','hazardous_waste_treated_incinrt','hazardous_waste_treated_incinrt_egy','hazardous_waste_treated_otherwm'})
latest={}
for r in R:
 if r['metric'] not in curated:continue
 if r['source_id']=='oecd-plastics-2022':continue # native dataset replaces rounded-summary duplicates
 if 'projection beyond' in r.get('method',''):continue
 key=(r['source_id'],r['country'],r['metric'])
 if key not in latest or r['year']>latest[key]['year']:latest[key]=r
fields=['country','country_name','metric','year','value','unit','source_id','original_value','original_unit','estimated','footnotes','method','nature','status']
compact=[{k:r[k] for k in fields if k in r} for r in latest.values()]
(P/'atlas-metrics-latest.json').write_text(json.dumps({'version':'2026-09-19','selection':'Latest available record by source/country/metric. UNITAR projections beyond2022 excluded; source model estimates retained. No substitution of regions for countries.','records':compact},separators=(',',':')))
print(f'PASS: {len(R):,} normalized records, {len(S)} source IDs, exact OECD mass closure,177-country stock coverage; {len(compact):,} latest atlas metrics.')
