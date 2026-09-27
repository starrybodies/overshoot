"""Normalize snapshotted primary data. No interpolation, missing-to-zero, or regional substitution."""
from pathlib import Path
import json,csv,math,collections,sys
ROOT=Path(__file__).resolve().parent; RAW=ROOT/'raw'
def read(name):return json.loads((RAW/name).read_text())
COUNTRIES=read('country-codes.json')
M49={str(int(c['numeric'])):c['id'] for c in COUNTRIES if c.get('numeric')}; M49['1']='WORLD'
EUISO={'AT':'AUT','BE':'BEL','BG':'BGR','CY':'CYP','CZ':'CZE','DE':'DEU','DK':'DNK','EE':'EST','EL':'GRC','ES':'ESP','FI':'FIN','FR':'FRA','HR':'HRV','HU':'HUN','IE':'IRL','IT':'ITA','LT':'LTU','LU':'LUX','LV':'LVA','MT':'MLT','NL':'NLD','PL':'POL','PT':'PRT','RO':'ROU','SE':'SWE','SI':'SVN','SK':'SVK','NO':'NOR','CH':'CHE','IS':'ISL','UK':'GBR','TR':'TUR','RS':'SRB','ME':'MNE','MK':'MKD','AL':'ALB','BA':'BIH','XK':'XKX'}
SERIES={
'EN_EWT_GENV':('ewaste_generated','unsd-ewaste-2026','tonnes'),
'EN_EWT_GENPCAP':('ewaste_per_capita','unsd-ewaste-2026','tonnes/person'),
'EN_EWT_RCYV':('ewaste_recycled','unsd-ewaste-2026','tonnes'),
'EN_EWT_RCYR':('ewaste_recycling_rate','unsd-ewaste-2026','percent'),
'EN_MWT_GENV':('municipal_waste_generated','unsd-municipal-2026','tonnes'),
'EN_MWT_RCYV':('municipal_waste_recycled','unsd-municipal-2026','tonnes'),
'EN_MWT_RCYR':('municipal_recycling_rate','unsd-municipal-2026','percent'),
'EN_HAZ_GENV':('hazardous_waste_generated','unsd-hazardous-2026','tonnes'),
'EN_HAZ_TREATV':('hazardous_waste_treated','unsd-hazardous-2026','tonnes'),
'AG_FOOD_WST':('food_waste','unsd-food-waste-2026','tonnes'),
'AG_FOOD_WST_PC':('food_waste_per_capita','unsd-food-waste-2026','tonnes/person'),
'AG_FLS_PCT':('food_loss_rate','fao-food-loss-2026','percent')}
SECTORS={'ALL':'','HHS':'household_','RTL':'retail_','OOHC':'food_service_','MNFC':'manufacturing_'}
records=[];regions=[];skipped=[]
for s,(metric,source,unit) in SERIES.items():
 p=RAW/f'sdg-{s}.json'
 if not p.exists():continue
 ds=read(p.name)
 assert ds['totalPages']==1 and len(ds['data'])==ds['totalElements'],f'Incomplete page: {s}'
 for i in ds['data']:
  try:v=float(i['value'])
  except (TypeError,ValueError):skipped.append({'series':s,'reason':'missing/non-numeric','row':i});continue
  if not math.isfinite(v):skipped.append({'series':s,'reason':'missing/nonfinite source value','row':i});continue
  assert v>=0
  k=metric;dim=i['dimensions']
  if 'Food Waste Sector' in dim:k=SECTORS[dim['Food Waste Sector']]+k
  if 'Type of waste treatment' in dim:k+='_'+dim['Type of waste treatment'].lower()
  if 'Type of product' in dim and dim['Type of product']!='ALP':k+='_'+dim['Type of product'].lower()
  country=M49.get(str(int(i['geoAreaCode'])))
  r={'country':country or 'UNM49:'+i['geoAreaCode'],'country_name':i['geoAreaName'],'metric':k,'year':int(i['timePeriodStart']),'value':v/1000 if unit=='tonnes/person' else v,'unit':unit,'source_id':source,'original_value':v,'original_unit':i['attributes']['Units'],'series':s,'dimensions':dim,'source_detail':i['source'],'nature':i['attributes'].get('Nature'),'status':i['attributes'].get('Observation Status'),'footnotes':i['footnotes']}
  if i['upperBound'] is not None:r['upper_bound']=i['upperBound']
  if i['lowerBound'] is not None:r['lower_bound']=i['lowerBound']
  # UNITAR time-series is modelled; future-from-GEM baseline values remain explicit.
  if source=='unsd-ewaste-2026' and 'UNITAR' in i['source']:
   r['method']='UNITAR model estimate' if r['year']<=2022 else 'UNITAR model projection beyond 2022 reference'
   r['estimated']=True
  if i['attributes'].get('Nature') in ['M','E','CA'] or any('confidence' in f.lower() or 'estimate' in f.lower() or 'imputed' in f.lower() for f in i['footnotes']):r['estimated']=True
  (records if country else regions).append(r)

def eurostat_rows(filename):
 ds=read(filename);ids=ds['id'];size=ds['size'];cats=[{v:k for k,v in ds['dimension'][d]['category']['index'].items()} for d in ids]
 for index,v in ds['value'].items():
  n=int(index);coordinates=[]
  for length in reversed(size):coordinates.append(n%length);n//=length
  dims={d:cats[j][val] for j,(d,val) in enumerate(zip(ids,reversed(coordinates)))}
  yield ds,dims,v,ds.get('status',{}).get(str(index))
for filename,sid in [('eurostat-env_ac_cur.json','eurostat-circularity-2025'),('eurostat-env_wasmun.json','eurostat-municipal-2026'),('eurostat-env_waspac.json','eurostat-packaging-2026'),('eurostat-cei_wm020.json','eurostat-packaging-recycling-2026')]:
 for ds,dim,v,flag in eurostat_rows(filename):
  metric='circular_material_use_rate';unit='percent';factor=1
  if 'wst_oper' in dim:
   metric=('municipal_' if filename.endswith('wasmun.json') else 'packaging_')+dim['wst_oper'].lower()
   if dim.get('waste'):metric+='_'+dim['waste'].lower()
   unit='tonnes';factor=1000 if dim['unit']=='THS_T' else 1
  elif 'waste' in dim:metric='packaging_recycling_rate_'+dim['waste'].lower()
  country=EUISO.get(dim['geo']);row={'country':country or dim['geo'],'country_name':ds['dimension']['geo']['category']['label'][dim['geo']],'metric':metric,'year':int(dim['time']),'value':v*factor,'unit':unit,'source_id':sid,'original_value':v,'original_unit':dim['unit'],'dimensions':dim,'status':flag,'updated':ds['updated']}
  if flag:row['footnotes']=[ds['extension']['status']['label'].get(ch,ch) for ch in flag.split()];row['estimated']='i' in flag or 'e' in flag
  (records if country else regions).append(row)
# MAT_STOCKS: 16 mutually exclusive sector/material combinations per process/country/year.
stock_sums=collections.defaultdict(list);material_sums=collections.defaultdict(list);sector_sums=collections.defaultdict(list);names={}
processes={'S10_stock_enduse':'in_use_stock','F_9_10_GAS_enduse':'stock_additions','F_10_11_supply_EoL_waste_enduse':'stock_end_of_life'}
with (RAW/'miso2_global_data_v1.csv').open() as f:
 for row in csv.DictReader(f):
  country=row['ISO3166-1-Alpha-3'];names[country]=row['region'];metric=processes[row['name']]
  for year in range(1900,2017):
   v=float(row[str(year)]);assert math.isfinite(v) and v>=0
   stock_sums[country,metric,year].append(v)
   if year==2016:
    material_sums[country,metric,row['material']].append(v)
    sector_sums[country,metric,row['sector']].append(v)
stock=[]
for (country,metric,year),vals in sorted(stock_sums.items()):
 assert len(vals)==16
 val=math.fsum(vals)
 r={'country':country,'country_name':names[country],'metric':metric,'year':year,'value':val*1000,'unit':'tonnes','source_id':'mat-stocks-2024','original_value':val,'original_unit':'kilotonnes','estimated':True,'method':'MISO2 stock-flow model; sum of 4 end uses × 4 material groups'}
 stock.append(r)
 if year==2016:records.append(r)
# Latest sector/material components retained separately; no accidental total + component summation.
components=[]
for (country,metric,material),vals in sorted(material_sums.items()):
 components.append({'country':country,'metric':metric,'year':2016,'dimension':'material','category':material,'value':math.fsum(vals)*1000,'unit':'tonnes','source_id':'mat-stocks-2024'})
for (country,metric,sector),vals in sorted(sector_sums.items()):
 components.append({'country':country,'metric':metric,'year':2016,'dimension':'end_use','category':sector,'value':math.fsum(vals)*1000,'unit':'tonnes','source_id':'mat-stocks-2024'})
# Native source-rounded OECD values (primary report executive summary and press release).
if (RAW/'oecd-plastics-rounded.json').exists():
 for r in read('oecd-plastics-rounded.json')['records']:records.append(r)
if (ROOT/'plastics-metrics.json').exists():
 records.extend(json.loads((ROOT/'plastics-metrics.json').read_text())['records'])

for collection in [records,stock,components]:
 assert all(math.isfinite(x['value']) and x['value']>=0 for x in collection)
(ROOT/'metrics.json').write_text(json.dumps({'version':'2026-09-19','records':records},separators=(',',':')))
(ROOT/'stock-history.json').write_text(json.dumps({'source_id':'mat-stocks-2024','unit':'tonnes','columns':['country','metric','year','value'],'records':[[r[k] for k in ['country','metric','year','value']] for r in stock]},separators=(',',':')))
(ROOT/'stock-components.json').write_text(json.dumps({'records':components},separators=(',',':')))
(ROOT/'regional-records.json').write_text(json.dumps({'note':'Never substitute these aggregates for national records.','records':regions},separators=(',',':')))
summary={sid:{'records':len(rr:=[r for r in records if r['source_id']==sid]),'countries':len(set(r['country'] for r in rr)),'years':[min(r['year'] for r in rr),max(r['year'] for r in rr)],'metrics':sorted(set(r['metric'] for r in rr))} for sid in sorted(set(r['source_id'] for r in records))}
summary['mat-stocks-history']={'records':len(stock),'countries':177,'years':[1900,2016]}
(ROOT/'missing-observations.json').write_text(json.dumps({'observations':skipped},separators=(',',':')))
(ROOT/'validation.json').write_text(json.dumps(summary,indent=2));print(json.dumps(summary,indent=2))
