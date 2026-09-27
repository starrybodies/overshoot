"""Enrich normalized extraction using native IRP population and DE/cap exports."""
import csv,hashlib,json,sys
from pathlib import Path
p=Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).parent
extraction=json.loads((p/'extraction.json').read_text())
meta=json.loads((p/'page.json').read_text())['props']['countries']
by_name={c['name']:c['code'] for c in meta}
allowed={c['id'] for c in extraction['countries']}
historical={'CSK200','ETH230','ANT530','SCG891','YEM886','YMD720','SDN736','SUN810','YUG890'}
raw=p/'irp_population_de_ratios.csv'
ratios={}
for r in csv.DictReader(raw.open()):
 code=by_name[r['Country']]
 if code=='WO':country='WORLD'
 elif len(code)==6 and code not in historical and code[:3] in allowed:country=code[:3]
 else:continue
 flow=r['Flow code'];assert flow in ['Population','DE/cap','DE']
 field={'Population':'population','DE/cap':'per_capita_total','DE':'total'}[flow]
 for y in extraction['years']:
  out=ratios.setdefault((country,y),{'country':country,'year':y,'population':None,'total':None,'per_capita_total':None,'source_id':'irp-2026'})
  val=r[str(y)]
  out[field]=None if not val else (int(val) if flow=='Population' else float(val))
output={'version':'irp-gmfd-2024-ratios-retrieved-2026-09-19-v1','source_id':'irp-2026','rows':sorted(ratios.values(),key=lambda r:(r['country'],r['year']))}
(p/'population.json').write_text(json.dumps(output,separators=(',',':')))
differences=[]
for r in extraction['rows']:
 match=ratios.get((r['country'],r['year']))
 if match:
  if r['total'] is not None and match['total'] is not None:differences.append(abs(r['total']-match['total']))
  r['population']=match['population']
  # Prefer the independently reported all-material total; do not impute missing classes.
  if match['total'] is not None:r['total']=match['total'];r['total_method']='reported_irp_total'
  pop=r['population']
  r['per_capita']={key:r[key]/pop if pop and r[key] is not None else None for key in ['biomass','fossil','metals','minerals']}
  r['per_capita']['total']=match['per_capita_total']
  r['per_capita_method']='Native IRP DE/cap for total; class extraction / native IRP population for material classes.'
extraction['version']='irp-gmfd-2024-retrieved-2026-09-19-v2'
(p/'extraction-with-population.json').write_text(json.dumps(extraction,separators=(',',':'),ensure_ascii=False))
summary={'raw_sha256':hashlib.sha256(raw.read_bytes()).hexdigest(),'ratio_rows':len(output['rows']),'population_nonnull':sum(r['population'] is not None for r in output['rows']),'percapita_nonnull':sum(r['per_capita_total'] is not None for r in output['rows']),'complete_enriched_totals':sum(r['total'] is not None for r in extraction['rows']),'max_absolute_difference_reported_vs_sum_tonnes':max(differences),'world_latest':next(r for r in extraction['rows'] if r['country']=='WORLD' and r['year']==2024)}
(p/'ratios_validation.json').write_text(json.dumps(summary,indent=2));print(json.dumps(summary,indent=2))
