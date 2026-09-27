"""Strict net-weight normalizer; no price inference, interpolation, or mirror merging."""
from pathlib import Path
import json, re, datetime, collections, math
ROOT=Path(__file__).resolve().parent
DISCARD={'3915','4707','7204','7404','7602','6309','8549'}
NAMES={'2603':'Copper ores and concentrates','2601':'Iron ores and concentrates','2701':'Coal','2709':'Crude petroleum oils','1001':'Wheat and meslin','4403':'Wood in the rough','3915':'Plastic waste and scrap','4707':'Recovered paper and paperboard','7204':'Ferrous waste and scrap','7404':'Copper waste and scrap','7602':'Aluminium waste and scrap','6309':'Worn clothing and other worn articles','8549':'Electrical and electronic waste and scrap'}

def normalize():
 manifest=json.loads((ROOT/'snapshots.json').read_text())
 refs=json.loads((ROOT/'raw/discovery0.json').read_text())['results']
 countries={r['reporterCode']:r['reporterCodeIsoAlpha3'].strip() for r in refs if not r.get('isGroup') and not r.get('entryExpiredDate')}
 partner_refs=json.loads((ROOT/'raw/discovery1.json').read_text())['results']
 for r in partner_refs:
  iso=(r.get('PartnerCodeIsoAlpha3') or '').strip()
  if re.fullmatch('[A-Z]{3}',iso) and not r.get('isGroup') and not r.get('entryExpiredDate') and not re.search(r'\bnes\b|not elsewhere specified|neutral zone|special categories|free zones',r.get('PartnerDesc','')+' '+r.get('partnerNote',''),re.I):countries.setdefault(r['PartnerCode'],iso)
 flows=[];counts=collections.Counter();seen=set();used=[];coverage=[]
 for m in manifest:
  if m['status']!=200:continue
  if m['reporterCode'] not in countries:counts['inactive_reporter_query_skipped']+=1;continue
  payload=json.loads((ROOT/'raw'/m['file']).read_text());rows=payload.get('data',[])
  if len(rows)>=500:counts['capped_parent_query_skipped']+=1;continue
  used.append(m['file']);coverage.append({'reporter':countries.get(m['reporterCode']), 'year':m['year'],'commodities':m['commodities'],'source_records':len(rows),'snapshot':m['file']})
  for n,r in enumerate(rows):
   w=r.get('netWgt');reporter=countries.get(r['reporterCode']);partner=countries.get(r['partnerCode']);code=str(r['cmdCode'])
   if r.get('isNetWgtEstimated') is not False:counts['estimated_or_unknown_weight']+=1;continue
   if w is None:counts['missing_weight']+=1;continue
   if not isinstance(w,(float,int)) or not math.isfinite(w) or w<0:raise ValueError('Invalid weight')
   if not w:counts['reported_zero_weight']+=1;continue
   if not reporter or not partner or r['partnerCode']==0 or not re.fullmatch('[A-Z]{3}',partner):counts['noncountry_or_aggregate_partner']+=1;continue
   if reporter==partner:counts['self_partner']+=1;continue
   if r.get('partner2Code')!=0 or r.get('customsCode')!='C00' or r.get('motCode')!=0:counts['nonaggregate_dimension']+=1;continue
   if r.get('flowCode') not in ('X','M'):continue
   origin,dest=(reporter,partner) if r['flowCode']=='X' else (partner,reporter)
   key=(origin,dest,code,r['refYear'],reporter,r['flowCode'],r['classificationCode'])
   if key in seen:raise ValueError(f'Duplicate {key}')
   seen.add(key)
   flows.append({'origin':origin,'destination':dest,'commodity':code,'year':r['refYear'],'tonnes':w/1000,'type':'discard' if code in DISCARD else 'raw','source_id':'comtrade','original_value':w,'original_unit':'kg','reporter':reporter,'reported_flow':r['flowCode'],'mirror':r['flowCode']=='M','hs_revision':r['classificationCode'],'is_net_weight_estimated':False,'is_reported':r.get('isReported'),'is_aggregate':r.get('isAggregate'),'is_original_classification':r.get('isOriginalClassification'),'legacy_estimation_flag':r.get('legacyEstimationFlag'),'snapshot':m['file'],'row_index':n})
 flows.sort(key=lambda r:(r['year'],r['commodity'],-r['tonnes'],r['origin'],r['destination']))
 artifact={'version':'2.0.0','source_id':'comtrade','unit':'metric tonnes','status':'partial','coverage_note':'Selected reporting countries and HS4 commodities only. Exporter-reported direction; non-estimated net weights only. Not a complete global trade matrix. Missing, estimated and unsupported geographical records omitted; absence is not zero. HS4 source aggregates can have isReported=false while their net weight is non-estimated.','method':'UN Comtrade original-classification annual HS4 exports. netWgt kilograms divided by 1000; no dollar-to-mass inference. Reporter and partner M49 codes resolved using official UN Comtrade area registries. Export and import reports are never added together.','years':sorted({r['year'] for r in flows}),'reporters':sorted({r['reporter'] for r in flows}),'commodities':[{'id':k,'name':v,'type':'discard' if k in DISCARD else 'raw'} for k,v in NAMES.items()],'flows':flows,'coverage':coverage,'exclusions':dict(counts)}
 (ROOT/'trade.json').write_text(json.dumps(artifact,separators=(',',':')))
 (ROOT/'validation.json').write_text(json.dumps({'flow_count':len(flows),'years':artifact['years'],'reporters':artifact['reporters'],'partners':len({r['destination'] for r in flows}),'commodities':sorted({r['commodity'] for r in flows}),'exclusions':dict(counts),'raw_snapshots':used,'all_tonnes_nonnegative':all(r['tonnes']>=0 for r in flows),'unique_keys':len(seen)==len(flows),'estimated_weights_included':False},indent=2))
 print('NORMALIZED',len(flows),'flows;',len(artifact['reporters']),'reporters',flush=True)
 return artifact
if __name__=='__main__':normalize()
