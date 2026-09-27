"""Keep importer declarations separate; retain flags and unmodified net-weight basis."""
from pathlib import Path
import json,gzip,hashlib,math,re
from collections import Counter
BASE=Path(__file__).resolve().parent;ROOT=BASE.parents[2];RAW=BASE/'raw/oil-imports';OUT=ROOT/'public/data/v16';OUT.mkdir(parents=True,exist_ok=True)
refs=json.loads((ROOT/'packages/overshoot-data/expanded/trade/raw/discovery0.json').read_text())['results']
countries={r['reporterCode']:r['reporterCodeIsoAlpha3'].strip() for r in refs if not r.get('isGroup') and not r.get('entryExpiredDate')}
for r in json.loads((ROOT/'packages/overshoot-data/expanded/trade/raw/discovery1.json').read_text())['results']:
 iso=(r.get('PartnerCodeIsoAlpha3') or '').strip()
 if re.fullmatch('[A-Z]{3}',iso) and not r.get('isGroup') and not r.get('entryExpiredDate') and not re.search(r'\bnes\b|not elsewhere specified|neutral zone|special categories|free zones',r.get('PartnerDesc','')+' '+r.get('partnerNote',''),re.I):countries.setdefault(r['PartnerCode'],iso)
flows=[];seen=set();excluded=Counter();coverage=[]
for m in json.loads((RAW/'manifest.json').read_text()):
 if m.get('superseded'):excluded['superseded_reporter_code_query']+=1;continue
 if m['status']!=200:excluded['failed_query']+=1;continue
 b=gzip.decompress((RAW/m['file']).read_bytes());assert hashlib.sha256(b).hexdigest()==m['sha256'];rows=json.loads(b)['data']
 if len(rows)>=500:excluded['capped_query']+=1;continue
 coverage.append(dict(reporter=m['reporter'],year=2024,commodities=m['products'],sourceRecords=len(rows),sourceUrl=m['url']))
 for i,r in enumerate(rows):
  weight=r.get('netWgt');partner=countries.get(r['partnerCode']);reporter=m['reporter'];code=r['cmdCode']
  if r.get('isNetWgtEstimated') is not False:excluded['estimated_or_unknown_weight']+=1;continue
  if weight is None:excluded['missing_weight']+=1;continue
  assert isinstance(weight,(float,int)) and math.isfinite(weight) and weight>=0
  if weight==0:excluded['zero_weight']+=1;continue
  if not partner or reporter==partner or r['partnerCode']==0:excluded['aggregate_unsupported_or_self_partner']+=1;continue
  assert r['partner2Code']==0 and r['customsCode']=='C00' and r['motCode']==0 and r['flowCode']=='M' and r['refYear']==2024 and r['reporterCode']==m['reporterCode'] and code in m['products']
  key=(partner,reporter,code,2024,r['classificationCode']);assert key not in seen;seen.add(key)
  flows.append(dict(origin=partner,destination=reporter,commodity=code,year=2024,tonnes=weight/1000,type='raw',source_id='comtrade',original_value=weight,original_unit='kg',reporter=reporter,reported_flow='M',mirror=True,hs_revision=r['classificationCode'],is_net_weight_estimated=False,is_reported=r.get('isReported'),is_aggregate=r.get('isAggregate'),is_original_classification=r.get('isOriginalClassification'),legacy_estimation_flag=r.get('legacyEstimationFlag'),snapshot='release16/raw/oil-imports/'+m['file'],row_index=i,source_url=m['url']))
flows.sort(key=lambda r:-r['tonnes'])
artifact=dict(version='16.0.0',year=2024,flows=flows,reporters=sorted({r['reporter'] for r in flows}),coverage=coverage,exclusions=dict(excluded),coverage_note='Selected importer reports for crude oil (HS 2709) and petroleum oils/products (HS 2710). Positive, non-estimated net weights only. These are partner-side evidence of exports, not declarations by the producing country. Imports and exports are never added for the same origin/product/year reporting group.',retrievedAt='2026-09-23')
(OUT/'oil-imports.json').write_bytes(gzip.compress(json.dumps(artifact,separators=(',',':')).encode(),mtime=0))
summary={k:v for k,v in artifact.items() if k!='flows'};summary.update(records=len(flows),origins=len({r['origin'] for r in flows}),venezuela=[r for r in flows if r['origin']=='VEN'])
(BASE/'trade-reconciliation.json').write_text(json.dumps(summary,indent=2)+'\n')
print('Oil import declarations:',len(flows),'origin countries:',summary['origins'],'Venezuela records:',len(summary['venezuela']))
