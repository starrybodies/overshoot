"""Publish source, feed and coverage metadata for release 16 without editing old releases."""
from pathlib import Path
from collections import Counter
import json,gzip
BASE=Path(__file__).resolve().parent;ROOT=BASE.parents[2];OUT=ROOT/'public/data/v16'
def read(p):
 b=(ROOT/'public/data'/p).read_bytes();return json.loads(gzip.decompress(b) if b[:2]==b'\x1f\x8b' else b)
def write(name,data):(OUT/name).write_text(json.dumps(data,separators=(',',':'),ensure_ascii=False)+'\n')
maritime=read('v16/maritime/catalog.json');density=read('v16/maritime/density/metadata.json');oil=read('v16/oil-imports.json');trade=read('v15/trade.json')
sources=read('v15/sources.json');comtrade=next(s for s in sources if s['id']=='comtrade')
comtrade.update(retrievedAt='2026-09-23',edition='Reviewed public API snapshots, 19–23 September 2026',integration=f"{len(trade['flows']):,} export observations plus {len(oil['flows']):,} separately retained oil import observations. The view selects one reporting side per product/year group, not their sum.")
comtrade['transformations']+=' Release 16 also retains positive non-estimated oil import net weights. Official Comtrade reporter codes differ from ISO numeric codes; the active official reporter register resolves the request identifiers. In outgoing views, partner imports fill only origin/product/year groups with no retained exports. Incoming oil uses its own importer reports where available, otherwise partner exports.'
comtrade['method']+=' The importer supplement covers HS 2709 and 2710. Selected importer coverage is incomplete; no national total is extrapolated. All original report/aggregate and estimation flags remain available.'
comtrade['geographicCoverage']+=f" Oil importer supplement: {len(oil['reporters'])} reporting economies, {len(set(r['origin'] for r in oil['flows']))} partner origin codes. Not all partner codes are selectable modern countries."
sources.extend([
 dict(id='imf-portwatch',title=maritime['source']['title'],publisher=maritime['source']['publisher'],dataset='Port locations and monthly AIS-derived visits and modeled cargo',edition='Snapshot acquired 23 September 2026',publicationYear=2026,coverageYears='September 2025–August 2026',url=maritime['source']['url'],citation=maritime['source']['attribution'],license=maritime['source']['license'],licenseUrl=maritime['source']['licenseUrl'],retrievedAt='2026-09-23',method=maritime['source']['method'],units='Port calls (visits); source-modeled metric tonnes of cargo; WGS84 coordinates',transformations='Monthly sums of the public daily port series via source-side statistical queries. Preserve observed-day counts, original IDs, dates, query URLs and raw response hashes.',geographicCoverage=f"{maritime['count']:,} ports and terminals across {len(maritime['countries'])} source country/area codes",temporalCoverage='Twelve historical calendar months, September 2025–August 2026. Not live AIS.',status='available',integrationStatus='snapshot-normalized',artifact='/data/v16/maritime/catalog.json',normalizationScript='packages/overshoot-data/release16/maritime_publish.py',limitations=maritime['source']['limitations']),
 dict(id='worldbank-commercial-ais',title=density['title'],publisher=density['publisher'],dataset='Historical commercial shipping activity density',edition='Source hourly AIS positions, January 2015–February 2021',publicationYear=2021,coverageYears=density['period'],url=density['url'],citation='World Bank, Global Shipping Traffic Density, commercial shipping layer. Based on IMF hourly AIS analysis, 2015–2021. Display generalized by OVERSHOOT.',license=density['license'],licenseUrl=density['licenseUrl'],retrievedAt='2026-09-23',method=density['method'],units='Relative visual intensity; native source counts hourly position reports per 0.005-degree cell',transformations=density['scale']+'; display raster is 4,096 pixels wide.',geographicCoverage='Global commercial shipping activity; source latitude range approximately 85°S–85°N',temporalCoverage=density['period'],status='available',integrationStatus='snapshot-normalized',artifact='/data/v16/maritime/density/metadata.json',normalizationScript='packages/overshoot-data/release16/shipping_tiles.py',downloadUrls=[density['download']],sourceSha256=density['sourceSha256'],limitations=density['limits'])
]);write('sources.json',sources)
feeds=read('v15/feeds.json');feeds['reviewedAt']='2026-09-23'
f=next(f for f in feeds['feeds'] if f['id']=='comtrade');f['coverage']+=f" Added {len(oil['flows']):,} oil import observations from {len(oil['reporters'])} reporting economies. One reporting side is selected per product/year group; imports are not added to matching exports."
for source in sources[-2:]:
 feeds['feeds'].append(dict(id=source['id'],title=source['title'],topic='Ports & maritime transport',status='imported',url=source['url'],method=source['method'],coverage=source['geographicCoverage']+' · '+source['temporalCoverage'],refresh='Reviewed acquisition scripts; no scheduled automatic refresh or live vessel feed.',rights=source['license'],limitations=' '.join(source['limitations']),termsUrl=source['licenseUrl'],destination=dict(view='materials',material='fuels',form='2709',layer='journey',mapPorts=True,mapShipping=True)))
write('feeds.json',feeds)
guide='# OVERSHOOT source and method register · release 16\n\nReviewed 23 September 2026. '+feeds['refreshMode']+'\n\n'
for f in feeds['feeds']:
 guide+='## '+f['title']+'\n\n'+f['coverage']+'\n\n- Status: '+feeds['statusLabels'][f['status']]+'\n- Source: '+f['url']+'\n- Acquisition: '+f['method']+'\n- Reuse: '+f['rights']+'\n- Limits: '+f['limitations']+'\n\n'
(OUT/'source-guide.md').write_text(guide)
# Match the one-side-per-group display policy for oil coverage, preserving other datasets.
coverage=read('v15/coverage.json');x=trade['flows'];m=oil['flows']
for iso,entry in coverage['countries'].items():
 for code in ['2709','2710']:
  for direction in ['in','out']:
   if direction=='in':
    own=[r for r in m if r['destination']==iso and r['commodity']==code];rows=own or [r for r in x if r['destination']==iso and r['commodity']==code]
   else:
    own=[r for r in x if r['origin']==iso and r['commodity']==code];rows=own or [r for r in m if r['origin']==iso and r['commodity']==code]
   key=code+'-'+direction
   if rows:entry['trade'][key]=len(rows)
  entry['maritimePorts']=maritime['countries'].get(iso,0)
coverage['method']+=' Oil trade uses one reporting side per country/product/year group; partner imports supplement missing exporter groups. Port counts are source locations, not unique berths.'
write('coverage.json',coverage)
print('Published sources, feeds, source guide and country coverage for release 16.')
