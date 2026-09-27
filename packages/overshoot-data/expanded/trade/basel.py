"""Normalize official Basel Table 4 exports; retain waste taxonomy and raw lineage.
Import records stay outside this artifact to avoid mirror double counting.
Run `python basel.py`; add --download to re-snapshot the two fixed public requests.
"""
from pathlib import Path
import json,decimal,re,collections,hashlib,datetime,urllib.request,sys
ROOT=Path(__file__).resolve().parent
BASE='https://ers.basel.int/eRSodataReports2/WcfERS_OdataService.svc/GetBCREPORT_Export_Import_Format2'
SPECS=[(2023,'basel-detail0.json'),(2024,'basel-detail1.json')]

def run(download=False):
 iso={r[10]:r[11] for r in json.loads((ROOT/'raw/un-m49-table.json').read_text()) if len(r)>=12 and re.fullmatch('[A-Z]{2}',r[10]) and re.fullmatch('[A-Z]{3}',r[11])}
 records=[];snapshots=[];excluded=collections.Counter();seen=set();groups={}
 for year,name in SPECS:
  url=BASE+f'?SurveyYear={year}&bcTable=4&$format=json';path=ROOT/'raw'/name
  if download:
   with urllib.request.urlopen(url,timeout=60) as response:path.write_bytes(response.read())
  raw=path.read_bytes();payload=json.loads(raw)
  if payload.get('odata.nextLink') or payload.get('@odata.nextLink'):raise ValueError('Pagination must be acquired before publishing')
  snapshots.append({'file':name,'url':url,'retrievedAt':'2026-09-19','sha256':hashlib.sha256(raw).hexdigest(),'source_rows':len(payload['value']),'year':year,'table':4})
  for n,r in enumerate(payload['value']):
   identifier=f"{year}-{r['Voter']}-{r['SectionNumber']}"
   if identifier in seen:raise ValueError('Duplicate survey section '+identifier)
   seen.add(identifier)
   origin=iso.get(r['Voter'].strip().upper());destination=iso.get((r.get('Country_D') or '').strip().upper());amount=(r.get('Amount') or '').strip()
   if not amount:excluded['missing_amount']+=1;continue
   if not re.fullmatch(r'\d+(?:\.\d+)?',amount):excluded['ambiguous_amount']+=1;continue
   tonnes=decimal.Decimal(amount)
   if tonnes==0:excluded['reported_zero_amount']+=1;continue
   if not origin or not destination:excluded['unsupported_or_missing_country']+=1;continue
   if origin==destination:excluded['self_partner']+=1;continue
   item={'id':identifier,'origin':origin,'destination':destination,'year':year,'tonnes':float(tonnes),'source_id':'basel-national-reporting','original_value':r['Amount'],'original_unit':'metric tons','reported_flow':'X','reporter':origin,'basel_code':r.get('VIII_Code'),'y_code':r.get('Y_Code'),'national_code':r.get('National_Code'),'waste_description':r.get('Type_of_waste'),'hazard_characteristics':r.get('Characteristics'),'disposal_code':r.get('D_Code'),'recovery_code':r.get('R_Code'),'transit_countries':r.get('Country_T'),'snapshot':name,'row_index':n,'survey_id':r['SurveyId'],'section_number':r['SectionNumber']}
   records.append(item)
   key=(origin,destination,year)
   if key not in groups:groups[key]={'amount':decimal.Decimal(0),'record_ids':[]}
   groups[key]['amount']+=tonnes;groups[key]['record_ids'].append(identifier)
 routes=[{'origin':a,'destination':b,'year':y,'tonnes':float(v['amount']),'commodity':'BASEL','type':'controlled-waste','source_id':'basel-national-reporting','reported_flow':'X','reporter':a,'record_ids':v['record_ids']} for (a,b,y),v in groups.items()]
 routes.sort(key=lambda r:(r['year'],-r['tonnes']))
 out={'version':'1.0.0','source_id':'basel-national-reporting','status':'partial','unit':'metric tonnes','years':[2023,2024],'method':'Official Basel national reporting Table 4 (exports). Amount is in metric tons per reporting manual. ISO2 reporter/destination converted using UN Statistics Division M49 ISO2/ISO3 mapping. Sum valid distinct report sections for route aggregates. Keep national, Basel/Y, recovery and disposal codes without reclassifying them as HS. No mirror import reports included.','coverage_note':'Participating national reports only; controlled waste includes hazardous and other wastes. Not all waste or all transboundary movements. Missing and unparseable records are excluded and logged, not treated as zero. Reporting is not an audit of treatment completion. Never add this dataset to Comtrade scrap totals.','reporters':sorted({r['reporter'] for r in records}),'records':records,'flows':routes,'exclusions':dict(excluded)}
 (ROOT/'basel.json').write_text(json.dumps(out,separators=(',',':'),ensure_ascii=False));(ROOT/'basel-snapshots.json').write_text(json.dumps(snapshots,indent=2));print('BASEL',len(records),'records',len(routes),'routes',len(out['reporters']),'reporters',dict(excluded))
 return out
if __name__=='__main__':run('--download' in sys.argv)
