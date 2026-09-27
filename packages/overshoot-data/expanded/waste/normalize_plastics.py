"""Parse numeric JSON embedded by OECD's public Compare Your Country publication. No private endpoint accessed."""
from pathlib import Path
import re,json,math
P=Path(__file__).resolve().parent;raw=P/'raw'
s=(raw/'oecd-plastics-database.html').read_text();m=re.search(r'var backend\s*=\s*',s);backend,_=json.JSONDecoder().raw_decode(s[m.end():]);charts=backend['project']['charts']
(raw/'oecd-plastics-backend.json').write_text(json.dumps(backend))
ids={'4709':'plastic_waste_generated','4710':'plastic_waste_recycled','4711':'plastic_waste_incinerated','4712':'plastic_waste_sanitary_landfill','4713':'plastic_waste_mismanaged','4714':'plastic_waste_uncollected_litter','4719':'plastic_use','4692':'plastic_environmental_leakage','4715':'plastic_stock_in_ocean','4716':'plastic_stock_in_rivers','4717':'plastic_aquatic_leakage','4718':'plastic_ocean_inflow'}
records=[];regions=[]
for key,metric in ids.items():
 c=charts[key];d=c['data'];assert d['dimensions']==['LOCATION','YEAR'];unit=c['options']['tooltipUnit'];assert unit=='million tonnes'
 for i,country in enumerate(d['keys'][0]):
  for j,y in enumerate(d['keys'][1]):
   value=d['data'][i][j]
   if value is None:continue
   assert value>=0 and math.isfinite(value)
   record={'country':country,'metric':metric,'year':int(y),'value':value*1e6,'unit':'tonnes','original_value':value,'original_unit':unit,'source_id':'oecd-plastics-database-2022','estimated':True,'method':'OECD Global Plastics Outlook database model estimate','series':c['data_url'],'source_chart':key}
   # OECD China model region includes Hong Kong; preserve it as a region.
   if country in ['CAN','USA','IND','WORLD']:records.append(record)
   else:record['country']='OECD:'+country;regions.append(record)
json.dump({'version':'2026-09-19','records':records},open(P/'plastics-metrics.json','w'),separators=(',',':'))
json.dump({'note':'Regional entities are not silently assigned to countries. China model region includes Hong Kong.','records':regions},open(P/'plastics-regional.json','w'),separators=(',',':'))
print(len(records),'country/global records',len(regions),'regional records')
for r in records:
 if r['country']=='WORLD' and r['year']==2019:print(r['metric'],r['value'])
