"""Keep the public feed register consistent with retained release artifacts."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[3]
out=ROOT/'public/data/v14'
data=json.loads((ROOT/'public/data/v13/feeds.json').read_text())
catalog=json.loads((out/'facilities/catalog.json').read_text())
data['reviewedAt']='2026-09-22'
data['refreshMode']='Data records are reviewed release snapshots. NASA imagery is requested directly from its visualization service for the displayed date.'
data['statusLabels']['visualization']='Live visualization service'
data['feeds']=[r for r in data['feeds'] if r['id']!='climate-trace']
destinations={'statcan-odi-solid-waste-2024':('landfill','CAN'),'statcan-odi-energy-2024':('energy','CAN'),'hydrowaste-2022':('wastewater','WORLD'),'maus-mining-2022':('mining','WORLD'),'epa-lmop-2024':('landfill','USA'),'meijer-rivers-2021':('river','WORLD'),'wri-power-plants':('power','WORLD'),'climate-trace-2025':('industry','WORLD')}
for id,s in catalog['sources'].items():
 kind,country=destinations[id]
 data['feeds'].append(dict(id=id,title=s['title'],topic=kind,status='imported',url=s['url'],method=s['method'],coverage=s['coverage'],refresh='Reacquire upstream source, compare hashes and original values, validate, then publish a reviewed snapshot. No unattended update.',rights=s['license'],limitations=' '.join(s['limits']),downloadUrl=s['download'],termsUrl=s['licenseUrl'],destination=dict(view='facilities',kind=kind,place=country)))
data['feeds'].append(dict(id='nasa-gibs',title='NASA GIBS · satellite and environmental context',topic='Imagery, relief, vegetation and ocean colour',status='visualization',url='https://nasa-gibs.github.io/gibs-api-docs/',method='Verified WMTS identifiers, dates and native resolutions from retained capabilities. Request tiles for the selected layer/date. The MCP returns layer metadata and geographic image URLs.',coverage='Global Mercator imagery to ±85.05°. Terra MODIS true colour, Blue Marble relief/bathymetry, monthly NDVI and Aqua MODIS chlorophyll-a.',refresh='Dates are bounded by the reviewed capabilities snapshot. Tile delivery is live; unavailable or cloudy pixels remain gaps.',rights='NASA Earth Science data policy; attribution to NASA GIBS / MODIS.',limitations='Imagery is not extracted numerical biogeophysical data. Chlorophyll does not detect plastic, NDVI cannot identify a cause, and zooming does not increase native resolution.',repo='https://github.com/nasa-gibs/gibs-web-examples',metadataUrl='https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/1.0.0/WMTSCapabilities.xml',termsUrl='https://www.earthdata.nasa.gov/engage/open-data-services-and-software/data-and-information-policy',destination=dict(view='facilities',kind='river',place='WORLD')))
(out/'feeds.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
lines=['# OVERSHOOT source and method register','',f"Reviewed {data['reviewedAt']}. {data['refreshMode']}",'']
for f in data['feeds']:
 lines.extend([f"## {f['title']}",'',f"Status: {data['statusLabels'][f['status']]}",'',f['coverage'],'',f"Method: {f['method']}",'',f"Refresh: {f['refresh']}",'',f"Reuse: {f['rights']}",'',f"Limits: {f['limitations']}",'',f"Publisher: {f['url']}"])
 for k in ['repo','downloadUrl','metadataUrl','termsUrl']:
  if f.get(k):lines.append(f"{k}: {f[k]}")
 lines.append('')
(out/'source-guide.md').write_text('\n'.join(lines)+'\n')
print(f"Published {len(data['feeds'])} feed entries.")
