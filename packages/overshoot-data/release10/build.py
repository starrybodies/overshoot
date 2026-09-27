"""Publish source-preserving regional and controlled-waste observations.
Run from any directory; inputs are retained snapshots, never live replacements.
"""
from pathlib import Path
import csv, json, gzip, hashlib, importlib.util
ROOT=Path(__file__).resolve().parent
REPO=ROOT.parents[2]
OUT=REPO/'public/data/v10'
OUT.mkdir(exist_ok=True,parents=True)
def publish(name,value,compressed=False):
    data=json.dumps(value,separators=(',',':'),ensure_ascii=False).encode()
    (OUT/name).write_bytes(gzip.compress(data,mtime=0) if compressed else data)
spec=importlib.util.spec_from_file_location('basel',ROOT.parent/'expanded/trade/basel.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
basel=module.run()
for year in basel['years']:
    rows=[r for r in basel['records'] if r['year']==year]
    publish('basel-'+str(year)+'.json.gz',{'records':rows,'year':year,'reporters':sorted({r['origin'] for r in rows}),'method':basel['method'],'coverage':basel['coverage_note'],'exclusions_all_years':basel['exclusions']},True)
rows=[]
for i,r in enumerate(csv.DictReader((ROOT/'raw/bc-disposal.csv').open())):
    valid=bool(r['Disposal_Rate_kg']) and float(r['Disposal_Rate_kg'])>0
    rows.append({'district':r['Regional_District'],'year':int(r['Year']),'tonnes':float(r['Total_Disposed_Tonnes']) if valid else None,'population':float(r['Population']) if r['Population'] else None,'rate':float(r['Disposal_Rate_kg']) if valid else None,'source_row':i+2,'original':r})
links={r['Local_Govt_Name']:{k:v for k,v in r.items() if v and v!='NA' and k in ['url','swmPlan','wComposition']} for r in csv.DictReader((ROOT/'raw/bc-report-links.csv').open())}
publish('bc-disposal.json',{'rows':rows,'links':links,'source':'https://www.env.gov.bc.ca/soe/indicators/sustainability/municipal-solid-waste.html','retrievedAt':'2026-09-21','method':'Source CSV zero rates are missing observations in the official indicator code; retain original cells and publish null, not zero. Comox Valley and Strathcona share one reported waste service area. Provincial method changed in 2024: population adjustments such as tourism removed.'})
metrics=json.loads((REPO/'public/data/v3/metrics-latest.json').read_text())
publish('plastic-fates.json',{'records':[r for r in metrics['records'] if r['country'] in ['WORLD','CAN','USA'] and r['metric'].startswith('plastic_waste_')],'source':'https://www.oecd.org/en/publications/global-plastics-outlook_de747aef-en.html','method':'OECD 2019 modeled waste-management fates, published in the 2022 Global Plastics Outlook. Recycled is the final recycled quantity after recycling losses; all plastics, not just packaging.'})
publish('hartland.json',{'source':'https://www.crd.ca/media/file/crd-hartland-tonnage-report-december2025pdf','source_page':2,'retrievedAt':'2026-09-21','scope':'Total material landfilled excluding blended biosolids; CRD December 2025 report. Population series differs from the provincial indicator. 2025 population is projected.','rows':[{'year':y,'population':p,'tonnes':t,'rate':r,'biosolids':b} for y,p,t,r,b in [(2021,432062,172886,400,None),(2022,439950,178290,405,1714),(2023,455092,173975,382,10591),(2024,464934,157189,338,4352),(2025,457162,151928,332,0)]]})
sources={
 'bc-disposal.csv':'https://catalogue.data.gov.bc.ca/dataset/d21ed158-0ac7-4afd-a03b-ce22df0096bc/resource/d2648733-e484-40f2-b589-48192c16686b/download/bc_municipal_solid_waste_disposal.csv',
 'bc-report-links.csv':'https://raw.githubusercontent.com/bcgov/msw-disposal-indicator/master/data/rd_report_links.csv',
 'bc-map-code.R':'https://raw.githubusercontent.com/bcgov/msw-disposal-indicator/master/dataviz/data.R',
 'bc-districts.geojson.gz':'https://openmaps.gov.bc.ca/geo/pub/WHSE_ADMIN_BOUNDARIES.EBC_REGIONAL_DISTRICTS_SP/ows?service=WFS&version=2.0.0&request=GetFeature&typeNames=pub:WHSE_ADMIN_BOUNDARIES.EBC_REGIONAL_DISTRICTS_SP&outputFormat=application/json&srsName=EPSG:4326&count=100',
 'hartland-december-2025.pdf':'https://www.crd.ca/media/file/crd-hartland-tonnage-report-december2025pdf',
 'basel-convention.pdf':'https://www.basel.int/Portals/4/Basel%20Convention/docs/text/BaselConventionText-e.pdf',
 'basel-convention-2025.pdf':'https://www.basel.int/Portals/4/download.aspx?e=UNEP-CHW-IMPL-CONVTEXT-2025.English.pdf'
}
manifest={'retrievedAt':'2026-09-21','files':[],'basel_snapshots':json.loads((ROOT.parent/'expanded/trade/basel-snapshots.json').read_text()),'derived_inputs':[{'path':str(p.relative_to(REPO)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in [REPO/'public/data/v3/metrics-latest.json',REPO/'node_modules/world-atlas/countries-50m.json']]}
for p in sorted((ROOT/'raw').iterdir()):manifest['files'].append({'file':p.name,'url':sources.get(p.name),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size})
(ROOT/'manifest.json').write_text(json.dumps(manifest,indent=2))
print('BC',len(rows),'observations;',len({r['district'] for r in rows}),'reporting areas; Basel',len(basel['records']),'sections')
