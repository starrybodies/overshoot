"""Publish consistent coverage and provenance from the actual retained artifacts."""
from pathlib import Path
import json,gzip
BASE=Path(__file__).resolve().parent;ROOT=BASE.parents[2];OUT=ROOT/'public/data/v15'
c=json.loads((OUT/'facilities/catalog.json').read_text());p=json.loads((BASE/'production-reconciliation.json').read_text())
t=json.loads(gzip.decompress((OUT/'trade.json').read_bytes()));trade=json.loads((OUT/'trade-coverage.json').read_text())
coverage=json.loads((ROOT/'public/data/v11/coverage.json').read_text())
for entry in coverage['countries'].values():entry['trade']={}
for row in t['flows']:
 for iso,direction in [(row['origin'],'out'),(row['destination'],'in')]:
  e=coverage['countries'].setdefault(iso,dict(accounts=[],metrics={},trade={},basel={},sites={}))
  key=row['commodity']+'-'+direction;e['trade'][key]=e['trade'].get(key,0)+1
for iso in {iso for d in c['datasets'].values() for iso in d['countries']}:
 e=coverage['countries'].setdefault(iso,dict(accounts=[],metrics={},trade={},basel={},sites={}))
 e['sites']={k:d['countries'][iso]['count'] for k,d in c['datasets'].items() if iso in d['countries']}
coverage['countries'].setdefault('WORLD',dict(accounts=[],metrics={},trade={},basel={},sites={}))['sites']={k:d['count'] for k,d in c['datasets'].items()}
(OUT/'coverage.json').write_text(json.dumps(coverage,separators=(',',':'))+'\n')
counts=dict(facilities=c['totalRecords'],facilityCountries=len({iso for d in c['datasets'].values() for iso in d['countries'] if iso!='UNASSIGNED'}),productionRecords=sum(d['records'] for d in p.values()),productionProducts=sum(d['products'] for d in p.values()),forestProducts=p['forestry']['products'],foodProducts=33,textileProducts=13)
counts.update(tradeRecords=trade['records'],tradeReporters=len(trade['reporters']),tradeCommodities=len(trade['commodities']))
(OUT/'release.json').write_text(json.dumps(counts,indent=2)+'\n')
feeds=json.loads((ROOT/'public/data/v14/feeds.json').read_text())
for f in feeds['feeds']:
 if f['id']=='comtrade':
  f.update(coverage=f"{trade['records']:,} retained bilateral export observations for 2024 across {len(trade['reporters'])} reporting economies and {len(trade['commodities'])} HS4 products. Coverage differs by product; this is not a complete world matrix. Detailed copper import reports remain separate.",method='Query the official public API by reporter, year, HS4 product and export flow. Split any response reaching the 500-row cap. Retain source URLs, hashes, native kilograms, estimate flags and HS revision; publish positive non-estimated net weights. The release adds 192 reviewed requests. Empty queries are coverage gaps, not zero-trade observations.')
 if f['id']=='climate-trace-2025':
  f.update(coverage=c['sources']['climate-trace-2025']['coverage'],method=c['sources']['climate-trace-2025']['method'],limitations=' '.join(c['sources']['climate-trace-2025']['limits']))
 if f['id'] in ('faostat','fao','forestry','faostat-forestry'):
  f['coverage']=f"Release 15 adds {counts['productionRecords']:,} source-preserved annual production observations across {counts['productionProducts']} selected food, forestry and natural-fibre products, within 1970–2024. Product years differ."
feeds['feeds'].append(dict(id='faostat-histories',title='FAOSTAT · production histories',topic='Food, wood, paper and natural textile inputs',status='imported',url='https://www.fao.org/faostat/en/#data/QCL',method='Retain source Production rows for 84 selected products, 1970–2024. Products are separate series; retain tonnes or cubic metres, original flags, notes, CSV row and original archive hash. No interpolation or parent/child aggregation.',coverage=f"{counts['productionRecords']:,} observations; 38 forest products, 33 food products and 13 natural-fibre or animal-material inputs. Product-specific years differ; cotton lint ends in 2023.",refresh='Review new FAO source archives and changes to product definitions before publishing a new snapshot.',rights='CC BY 4.0; FAO statistical-database terms apply.',limitations='Source estimates and imputed values are retained with flags. Former-country and regional aggregates are not mapped. Outputs and inputs can overlap; do not sum them.',destination=dict(view='materials',material='textiles',layer='production',productionItem='767')))
feeds['feeds'].append(dict(id='world-mining-data',title='World Mining Data · mineral production',topic='Country mineral-production tables',status='permission',url='https://www.bmf.gv.at/en/topics/mining/mineral-resources-policy/wmd.html',method='The publisher supplies 2026 Excel tables for 2020–2024 and a methodology report. Tables were discovered; no rows are imported into OVERSHOOT.',coverage='Publisher describes 65 commodities and 168 countries. Not integrated.',refresh='Annual, with source corrections.',rights='The publication permits attributed extracts, while the website terms restrict republication on other websites. Reuse scope needs resolution before a database import.',limitations='Do not substitute gross ore tonnage or estimated site emissions for contained-metal production.',termsUrl='https://www.bmf.gv.at/en/imprint.html'))
(OUT/'feeds.json').write_text(json.dumps(feeds,ensure_ascii=False,separators=(',',':'))+'\n')
lines=['# OVERSHOOT source and method register','Reviewed 22 September 2026. These are fixed snapshots, not live feeds.','']
for f in feeds['feeds']:
 lines += ['## '+f['title'],f"Status: {feeds['statusLabels'].get(f['status'],f['status'])}",f['url'],'',f['coverage'],'',f['method'],'',f['rights'],'',f['limitations'],'']
(OUT/'source-guide.md').write_text('\n'.join(lines))
sources=json.loads((ROOT/'public/data/v3/sources.json').read_text())
comtrade=next(s for s in sources if s['id']=='comtrade')
comtrade.update(retrievedAt='2026-09-22',edition='Reviewed public API snapshots, 19–22 September 2026',geographicCoverage=f"{len(trade['reporters'])} reporting economies with retained exports: "+', '.join(trade['reporters'])+'. Partner and product coverage varies; not a complete global matrix.',citation='United Nations Statistics Division, UN Comtrade Database, annual merchandise trade, retrieved September 2026. Exact public API URLs, response hashes and source row references are retained in the release manifests.',integration=f"{trade['records']:,} positive non-estimated export weights, {len(trade['commodities'])} selected HS4 products, 2024. Detailed copper import reports are a separate source view.")
for ident,source in c['sources'].items():
 match=next((s for s in sources if s['id']==ident),None)
 updated=dict(id=ident,status='available',title=source['title'],publisher=source['publisher'],url=source['url'],method=source['method'],license=source['license'],retrievedAt=source['retrievedAt'],coverageYears=source['edition'],limitations=source['limits'],citation=source.get('citation',''),downloadUrls=[source['download']])
 if match:match.update(updated)
 else:sources.append(updated)
sources.append(dict(id='faostat-production-histories-15',title='FAOSTAT production histories · 84 selected products',status='available',publisher='FAO',url='https://www.fao.org/faostat/en/#data/QCL',method='Production series, original units, flags, notes and source row references. Countries and native world totals retained separately.',units='Tonnes or cubic metres, depending on the product',license='CC BY 4.0; FAO terms apply',retrievedAt='2026-09-22',coverageYears='1970–2024; product-specific years vary',limitations=['Inputs and outputs overlap. Do not add production stages.','Cotton lint ends in 2023 in this edition.','Source estimates and imputation flags are retained.']))
(OUT/'sources.json').write_text(json.dumps(sources,ensure_ascii=False,separators=(',',':'))+'\n')
print(counts)
