"""Pin public NASA GIBS layer definitions and dates; no inference from rendered pixels."""
from pathlib import Path
import json,gzip,hashlib,xml.etree.ElementTree as E,urllib.request
ROOT=Path(__file__).resolve().parents[3];BASE=Path(__file__).resolve().parent
url='https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/1.0.0/WMTSCapabilities.xml'
raw=BASE/'raw/gibs-capabilities.xml.gz'
if not raw.exists():raw.write_bytes(gzip.compress(urllib.request.urlopen(url,timeout=45).read(),mtime=0))
body=gzip.decompress(raw.read_bytes());root=E.fromstring(body)
ns={'w':'http://www.opengis.net/wmts/1.0','o':'http://www.opengis.net/ows/1.1'}
specs=[
 ('relief','BlueMarble_ShadedRelief_Bathymetry','Land & ocean relief','Static composite','500 m','Topography and seafloor relief give regional physical context. This is a composite visualization, not a current satellite scene or a numerical elevation query.'),
 ('satellite','MODIS_Terra_CorrectedReflectance_TrueColor','Satellite · true colour','Daily','250 m','MODIS Terra imagery shows clouds, land and water at regional scale. Cloud cover and observation gaps can obscure the surface. This resolution cannot identify individual waste items or small facilities.'),
 ('vegetation','MODIS_Terra_L3_NDVI_Monthly','Vegetation · NDVI','Monthly','1 km','NDVI describes vegetation greenness. Season, land cover and clouds affect it; it does not identify a cause of change or measure species diversity.'),
 ('ocean','MODIS_Aqua_L2_Chlorophyll_A','Ocean · chlorophyll','Daily','1 km','Surface chlorophyll-a is an indicator of phytoplankton, derived from ocean colour. It is not a plastic or pollution measurement. Clouds and retrieval conditions leave gaps.'),
]
layers=[]
for id,identifier,label,frequency,resolution,note in specs:
 l=next(l for l in root.findall('.//w:Layer',ns) if l.findtext('o:Identifier',namespaces=ns)==identifier)
 matrix=l.findtext('w:TileMatrixSetLink/w:TileMatrixSet',namespaces=ns)
 fmt=l.findtext('w:Format',namespaces=ns).split('/')[-1]
 default=l.findtext('w:Dimension/w:Default',namespaces=ns)
 ranges=[v.text for v in l.findall('w:Dimension/w:Value',ns)]
 first=ranges[0].split('/')[0] if ranges else None
 if id=='satellite':default='2026-09-21'
 legend=l.find('.//w:LegendURL',ns)
 template=next(r.attrib['template'] for r in l.findall('w:ResourceURL',ns) if r.attrib['resourceType']=='tile')
 layers.append(dict(id=id,identifier=identifier,label=label,title=l.findtext('o:Title',namespaces=ns),frequency=frequency,resolution=resolution,defaultDate=default,minDate=first,maxDate=default,availableRanges=ranges,matrix=matrix,maxZoom=int(matrix.split('Level')[-1]),format=fmt,tileTemplate=template.replace('{TileMatrixSet}',matrix).replace('{Time}', '{date}').replace('{TileMatrix}','{z}').replace('{TileRow}','{y}').replace('{TileCol}','{x}'),legend=legend.attrib.get('{http://www.w3.org/1999/xlink}href') if legend is not None else None,interpretation=note,source='NASA GIBS / MODIS',documentation='https://nasa-gibs.github.io/gibs-api-docs/available-visualizations/',dataPolicy='https://www.earthdata.nasa.gov/engage/open-data-services-and-software/data-and-information-policy'))
out={'retrievedAt':'2026-09-22','capabilitiesUrl':url,'capabilitiesSha256':hashlib.sha256(body).hexdigest(),'scope':'Visualization layers. Native imagery resolution differs from map zoom. Coordinates outside ±85.05° are outside the Mercator image extent; polar coverage needs a polar projection. Rendering a pixel is not a quantitative scientific measurement.','layers':layers}
(ROOT/'public/data/v14/environment.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print('Pinned NASA layers:',[(l['id'],l['defaultDate'],l['matrix']) for l in layers])
