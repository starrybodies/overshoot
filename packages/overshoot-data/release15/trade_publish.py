"""Merge source-preserved exports with reviewed additional reporters.

Only positive, non-estimated net weights are in the main mass view. Estimated,
missing and zero-weight records are counted separately. National imports are
not inferred by claiming that partner-reported exports are import declarations.
"""
from pathlib import Path
from collections import Counter,defaultdict
import gzip,json,hashlib,re,math
BASE=Path(__file__).resolve().parent;ROOT=BASE.parents[2];RAW=BASE/'raw/comtrade';OUT=ROOT/'public/data/v15'
original=json.loads((ROOT/'public/data/v2/trade.json').read_text());manifest=json.loads((RAW/'manifest.json').read_text())
refs=json.loads((ROOT/'packages/overshoot-data/expanded/trade/raw/discovery0.json').read_text())['results']
countries={r['reporterCode']:r['reporterCodeIsoAlpha3'].strip() for r in refs if not r.get('isGroup') and not r.get('entryExpiredDate')}
partners=json.loads((ROOT/'packages/overshoot-data/expanded/trade/raw/discovery1.json').read_text())['results']
for r in partners:
 iso=(r.get('PartnerCodeIsoAlpha3') or '').strip()
 if re.fullmatch('[A-Z]{3}',iso) and not r.get('isGroup') and not r.get('entryExpiredDate') and not re.search(r'\bnes\b|not elsewhere specified|neutral zone|special categories|free zones',r.get('PartnerDesc','')+' '+r.get('partnerNote',''),re.I):countries.setdefault(r['PartnerCode'],iso)
counts=Counter();new=[];coverage=[];pairs=set();seen=set();commodity_names={r['id']:r['name'] for r in original['commodities']}
for m in manifest:
 if m['status']!=200:counts['failed_queries']+=1;continue
 payload=gzip.decompress((RAW/m['file']).read_bytes());assert hashlib.sha256(payload).hexdigest()==m['sha256'];rows=json.loads(payload).get('data',[])
 if len(rows)>=500:counts['capped_parent_query_excluded']+=1;continue
 reporter=countries.get(m['reporterCode'])
 if not reporter:counts['unsupported_reporter']+=1;continue
 pairs.update((reporter,c) for c in m['commodities'])
 coverage.append(dict(reporter=reporter,year=2024,commodities=m['commodities'],source_records=len(rows),snapshot=m['file'],url=m['url']))
 for i,r in enumerate(rows):
  weight=r.get('netWgt');partner=countries.get(r['partnerCode']);code=str(r['cmdCode'])
  commodity_names.setdefault(code,r['cmdDesc'])
  if r.get('isNetWgtEstimated') is not False:counts['estimated_or_unknown_net_weight']+=1;continue
  if weight is None:counts['missing_net_weight']+=1;continue
  assert isinstance(weight,(int,float)) and math.isfinite(weight) and weight>=0
  if not weight:counts['reported_zero_net_weight']+=1;continue
  if not partner or r['partnerCode']==0 or reporter==partner:counts['aggregate_unsupported_or_self_partner']+=1;continue
  if r.get('partner2Code')!=0 or r.get('customsCode')!='C00' or r.get('motCode')!=0 or r.get('flowCode')!='X':counts['non_export_or_non_total_dimension']+=1;continue
  assert r['refYear']==2024 and code in m['commodities'] and r['reporterCode']==m['reporterCode']
  key=(reporter,partner,code,r['refYear'],r['classificationCode']);assert key not in seen;seen.add(key)
  new.append(dict(origin=reporter,destination=partner,commodity=code,year=2024,tonnes=weight/1000,type='discard' if code in {'3915','4707','7204','7404','7602','6309','8549','7001','5202'} else 'raw',source_id='comtrade',original_value=weight,original_unit='kg',reporter=reporter,reported_flow='X',mirror=False,hs_revision=r['classificationCode'],is_net_weight_estimated=False,is_reported=r.get('isReported'),is_aggregate=r.get('isAggregate'),is_original_classification=r.get('isOriginalClassification'),legacy_estimation_flag=r.get('legacyEstimationFlag'),snapshot='release15/raw/comtrade/'+m['file'],row_index=i,source_url=m['url']))
# An empty new API result cannot erase positive older observations without review.
positive_pairs={(r['reporter'],r['commodity']) for r in new}
retained=[r for r in original['flows'] if (r['reporter'],r['commodity']) not in positive_pairs]
flows=retained+new;flows.sort(key=lambda r:(r['commodity'],-r['tonnes'],r['origin'],r['destination']))
assert len({(r['origin'],r['destination'],r['commodity'],r['year'],r['reported_flow'],r['hs_revision']) for r in flows})==len(flows)
artifact={**original,'version':'15.0.0','flows':flows,'reporters':sorted({r['reporter'] for r in flows}),'coverage':[x for x in original['coverage'] if not all((x['reporter'],c) in positive_pairs for c in x['commodities'])]+coverage,'exclusions':{'previous_snapshot':original['exclusions'],'release15':dict(counts)},'coverage_note':'Selected reporting countries and HS4 products, 2024. Positive non-estimated net weights only. Incoming views use selected partners’ export declarations. Missing observations are not zero; this is not a complete global trade matrix.'}
artifact['commodities']=[dict(id=code,name=commodity_names[code],type=next(r['type'] for r in flows if r['commodity']==code)) for code in sorted({r['commodity'] for r in flows})]
OUT.mkdir(parents=True,exist_ok=True);(OUT/'trade.json').write_bytes(gzip.compress(json.dumps(artifact,separators=(',',':')).encode(),mtime=0))
summary=dict(year=2024,records=len(flows),previousRecords=len(original['flows']),newSourceRecords=len(new),reporters=artifact['reporters'],requestedReporters=sorted({m['reporter'] for m in manifest}),commodities=sorted({r['commodity'] for r in flows}),requestCount=len(manifest),exclusions=dict(counts),coverage=coverage)
(OUT/'trade-coverage.json').write_text(json.dumps(summary,separators=(',',':'))+'\n');(BASE/'trade-reconciliation.json').write_text(json.dumps({k:v for k,v in summary.items() if k!='coverage'},indent=2)+'\n')
print(json.dumps({k:v for k,v in summary.items() if k!='coverage'},indent=2))
