"""Build physical energy observations from retained, auditable source records.

With --input, select original series/CSV rows and retain compressed extracts.
Without --input, reproduce this release offline from the retained extracts.
Nulls and source markers survive. Zero is only a source-reported numeric zero.
"""
import argparse, collections, csv, datetime, gzip, hashlib, io, json, math, pathlib, zipfile
from acquire import URLS
from energy_config import EIA,JODI,MIDDLE_EAST,ASSESSMENTS
HERE=pathlib.Path(__file__).parent;ROOT=HERE.parents[2];OUT=ROOT/'public/data/v13/energy';RAW=HERE/'raw'
def dump(path,data):path.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'),allow_nan=False)+'\n')
def numeric(v):return isinstance(v,(int,float)) and not isinstance(v,bool) and math.isfinite(v)
def main():
 p=argparse.ArgumentParser();p.add_argument('--input',type=pathlib.Path);a=p.parse_args();RAW.mkdir(parents=True,exist_ok=True);OUT.mkdir(parents=True,exist_ok=True)
 directory=json.loads((ROOT/'public/data/v11/countries.json').read_text());ids={c['id'] for c in directory};alpha={c['alpha2']:c['id'] for c in directory}
 # EIA uses some legacy geography identifiers. Identity mappings are explicit.
 aliases={'WORL':'WORLD','XKX':'XKX'}
 allow={f'INTL.{spec[1]}.A' for spec in EIA}
 if a.input:
  manifest=[]
  for name,url in URLS.items():
   b=(a.input/name).read_bytes();manifest.append({'file':name,'url':url,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'retrievedAt':'2026-09-22'})
  dump(RAW/'downloads.json',manifest)
  with zipfile.ZipFile(a.input/'eia-international.zip') as z:
   selected=[r for line in z.open('INTL.txt') if (r:=json.loads(line)).get('geoset_id') in allow and 'series_id' in r]
  with gzip.open(RAW/'eia-original-series.jsonl.gz','wt') as f:
   for r in selected:f.write(json.dumps(r,separators=(',',':'))+'\n')
  allowed_jodi={(r[1],r[2]) for r in JODI}
  jrows=[]
  for name in ['jodi-oil-2025.csv','jodi-oil-2026.csv']:
   for r in csv.DictReader((a.input/name).open(encoding='utf-8-sig')):
    if (r['ENERGY_PRODUCT'],r['FLOW_BREAKDOWN']) in allowed_jodi and r['UNIT_MEASURE']=='KBD':jrows.append(r)
  with gzip.open(RAW/'jodi-original-rows.csv.gz','wt') as f:
   w=csv.DictWriter(f,fieldnames=list(jrows[0]));w.writeheader();w.writerows(jrows)
 sources={
  'eia-international-2026':{'publisher':'U.S. Energy Information Administration','name':'EIA International Energy Statistics','url':'https://www.eia.gov/opendata/index.php','termsUrl':'https://www.eia.gov/about/copyrights_reuse.php','license':'U.S. public domain; source acknowledgment required. Retained series declare copyright: None.','retrievedAt':'2026-09-22','method':'Public bulk JSON archive. Exact series IDs, original units, source update dates and missing markers are retained. Display conversions only scale thousands of barrels/day to barrels/day and thousands of metric tonnes to tonnes.','limitations':'Annual records may be estimated or revised. EIA bulk values do not provide observation-level estimate flags. Gas trade totals do not identify partners or separate LNG from pipeline deliveries.'},
  'jodi-oil-2026':{'publisher':'International Energy Forum / JODI partners','name':'JODI Oil World Database','url':'https://www.jodidata.org/oil/database/data-downloads.aspx','termsUrl':'https://www.jodidata.org/oil/','license':'Freely downloadable JODI data; cite IEF, JODI Oil World Database and access date.','retrievedAt':'2026-09-22','method':'Primary oil annual CSV files, KBD only, for 2025 and 2026. KBD multiplied by 1,000 gives barrels/day. Original assessment codes and non-numeric markers are retained.','limitations':'Monthly reporting is incomplete and revisions are possible. Missing values are not zero. Rates cannot be summed into monthly or annual volumes without weighting by days. Country trade totals do not identify shipping routes.'}}
 data={};series=list(map(json.loads,gzip.open(RAW/'eia-original-series.jsonl.gz','rt')));excluded=collections.Counter()
 for id,code,name,fuel,measure,unit,factor,description in EIA:
  meta={'id':id,'name':name,'fuel':fuel,'measure':measure,'unit':unit,'factor':factor,'frequency':'annual','sourceId':'eia-international-2026','description':description};rows=[];refs={}
  for s in series:
   if s['geoset_id']!=f'INTL.{code}.A':continue
   # The geography field can be a country list even on a regional/IEO series.
   # Use the explicit series country code to exclude duplicate regional series.
   source_country=s['series_id'].split('-')[2]
   country=aliases.get(source_country,source_country)
   if country not in ids and country!='WORLD':excluded[source_country]+=1;continue
   assert s.get('copyright')=='None',(s['series_id'],'Unexpected rights; review')
   expected={'TBPD':'thousand barrels per day','BCM':'billion cubic meters','MT':'1000 metric tons'}[code.split('-')[-1]]
   assert s['units']==expected,(s['series_id'],s['units'])
   refs[country]={k:s[k] for k in ['series_id','name','units','source','last_updated','start','end','copyright']}
   for period,raw in s['data']:
    assert len(period)==4 and period.isdigit(),(s['series_id'],period)
    if int(period)<1980:continue
    rows.append({'country':country,'period':period,'value':raw*factor if numeric(raw) else None,'rawValue':raw,'flag':None})
  data[id]={**meta,'rows':rows,'series':refs}
 jrows=list(csv.DictReader(gzip.open(RAW/'jodi-original-rows.csv.gz','rt')))
 for id,product,flow,name,measure,description in JODI:
  rows=[];refs={}
  for r in jrows:
   if (r['ENERGY_PRODUCT'],r['FLOW_BREAKDOWN'])!=(product,flow):continue
   country=alpha.get(r['REF_AREA'])
   if not country:excluded['JODI:'+r['REF_AREA']]+=1;continue
   raw=r['OBS_VALUE']
   try:value=float(raw)*1000
   except ValueError:value=None
   assert value is None or math.isfinite(value)
   rows.append({'country':country,'period':r['TIME_PERIOD'],'value':value,'rawValue':raw,'flag':r['ASSESSMENT_CODE']})
   refs[country]={'series_id':f"{r['REF_AREA']}/{product}/{flow}/KBD",'name':name,'units':'KBD','source':'JODI','last_updated':None}
  data[id]={'id':id,'name':name,'fuel':'oil','measure':measure,'unit':'barrels / day','factor':1000,'frequency':'monthly','sourceId':'jodi-oil-2026','description':description,'rows':rows,'series':refs,'assessments':ASSESSMENTS}
 catalog=[];coverage={};total=0
 for id,d in data.items():
  rows=d['rows'];keys={(r['country'],r['period']) for r in rows};assert len(keys)==len(rows),(id,'duplicate observation')
  rows.sort(key=lambda r:(r['country'],r['period']));periods=sorted({r['period'] for r in rows if r['value'] is not None},reverse=True);latest=periods[0]
  by_period={period:sum(r['period']==period and r['country']!='WORLD' and r['value'] is not None for r in rows) for period in periods}
  meta={k:v for k,v in d.items() if k not in ['rows','series','assessments']}
  default_period=next((p for p in periods if by_period[p]>=max(by_period.values())*.9),latest) if d['frequency']=='annual' else latest
  meta.update({'periods':periods,'latestPeriod':latest,'defaultPeriod':default_period,'coverageByPeriod':by_period,'countries':len({r['country'] for r in rows if r['country']!='WORLD' and r['value'] is not None}),'numericRecords':sum(r['value'] is not None for r in rows)})
  d.update(meta);dump(OUT/(id+'.json'),d);catalog.append(meta);total+=meta['numericRecords']
  for r in rows:
   if r['value'] is None:continue
   prior=coverage.setdefault(r['country'],{}).get(id)
   if not prior or r['period']>prior['period']:coverage[r['country']][id]={'period':r['period'],'value':r['value'],'flag':r['flag']}
 catalog_data={'retrievedAt':'2026-09-22','refreshMode':'Reviewed release snapshot; no background refresh is running.','sources':sources,'measures':catalog,'middleEast':MIDDLE_EAST,'numericRecords':total,'countries':len(set(coverage)-{'WORLD'})}
 dump(OUT/'catalog.json',catalog_data);dump(OUT/'coverage.json',coverage)
 report={'numericRecords':total,'countries':catalog_data['countries'],'measures':len(data),'excludedGeographies':dict(excluded),'middleEast':{c:coverage.get(c,{}) for c in MIDDLE_EAST}}
 dump(HERE/'coverage-validation.json',report)
 print(json.dumps({'numericRecords':total,'countries':catalog_data['countries'],'measures':len(data),'latest':{m['id']:(m['latestPeriod'],m['coverageByPeriod'][m['latestPeriod']]) for m in catalog}},indent=2))
if __name__=='__main__':main()
