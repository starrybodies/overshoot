"""Build a generalized, log-scaled display of the World Bank's commercial AIS raster.

Input: shipdensity_commercial_.zip from the URL below. Requires rasterio, numpy, Pillow.
The published tiles are a visual index, NOT ship counts or tonnes. No time extrapolation.
Usage: python shipping_tiles.py /path/to/shipdensity-commercial.zip /path/to/workdir
"""
from pathlib import Path
import sys,zipfile,shutil,hashlib,json,urllib.request
import numpy as np
import rasterio
from rasterio.enums import Resampling
from rasterio.transform import from_bounds
from rasterio.warp import reproject
from PIL import Image

BASE=Path(__file__).resolve().parent;ROOT=BASE.parents[2]
archive=Path(sys.argv[1]);work=Path(sys.argv[2]);work.mkdir(parents=True,exist_ok=True)
OUT=ROOT/'public/data/v16/maritime/density';OUT.mkdir(parents=True,exist_ok=True)
url='https://datacatalogfiles.worldbank.org/ddh-published/0037580/5/DR0045405/shipdensity_commercial_.zip'
h=hashlib.sha256()
with archive.open('rb') as f:
 for chunk in iter(lambda:f.read(8*1024*1024),b''):h.update(chunk)
with zipfile.ZipFile(archive) as z:
 native=next(n for n in z.namelist() if n.endswith('.tif'))
 name=next(n for n in z.namelist() if n.endswith('.tif.ovr'))
 p=work/name
 if not p.exists():
  print('Extracting source overview for random access',flush=True)
  with z.open(name) as src,p.open('wb') as dst:shutil.copyfileobj(src,dst,8*1024*1024)
with rasterio.open('zip://'+str(archive)+'!'+native) as original:
 native_bounds=original.bounds
 native_nodata=original.nodata
with rasterio.open(p,'r+') as overview:
 overview.nodata=native_nodata
 overview.crs='EPSG:4326'
 overview.transform=from_bounds(*native_bounds,overview.width,overview.height)
with rasterio.open(p) as src:
 # Read the publisher's overview, then aggregate to a modest display grid.
 a=src.read(1,out_shape=(2125,4500),resampling=Resampling.average,masked=True)
 # External .ovr files omit georeferencing; inherit the parent raster bounds.
 transform=from_bounds(*native_bounds,a.shape[1],a.shape[0])
 a=np.where(np.ma.getmaskarray(a),np.nan,np.asarray(a,dtype='float32'))
 extent=20037508.342789244
 dest=np.full((4096,4096),np.nan,dtype='float32')
 reproject(a,dest,src_transform=transform,src_crs='EPSG:4326',src_nodata=np.nan,
  dst_transform=from_bounds(-extent,-extent,extent,extent,4096,4096),dst_crs='EPSG:3857',dst_nodata=np.nan,resampling=Resampling.average)
positive=dest[np.isfinite(dest)&(dest>0)]
assert len(positive)>1000
scale=float(np.percentile(positive,99.5));print('Display p99.5',scale,'positive cells',len(positive),flush=True)
def rgba(a):
 valid=np.isfinite(a)&(a>0)
 t=np.clip(np.log1p(np.where(valid,a,0))/np.log1p(scale),0,1)
 out=np.zeros((*a.shape,4),dtype='uint8')
 # Deep amber at low intensity; pale gold at high intensity, on both map themes.
 out[:,:,0]=(190+65*t).astype('uint8');out[:,:,1]=(102+125*t).astype('uint8');out[:,:,2]=(28+112*t).astype('uint8')
 out[:,:,3]=np.where(valid,25+220*t,0).astype('uint8')
 return Image.fromarray(out)
for zoom in range(5):
 n=2**zoom;factor=4096//(256*n)
 if factor==1:level=dest
 else:
  # Masked average; an unobserved cell never becomes a measured zero.
  shape=(256*n,factor,256*n,factor);valid=np.isfinite(dest)
  sums=np.where(valid,dest,0).reshape(shape).sum(axis=(1,3));counts=valid.reshape(shape).sum(axis=(1,3))
  level=np.divide(sums,counts,out=np.full_like(sums,np.nan),where=counts>0)
 im=rgba(level)
 for x in range(n):
  folder=OUT/str(zoom)/str(x);folder.mkdir(parents=True,exist_ok=True)
  for y in range(n):im.crop((x*256,y*256,(x+1)*256,(y+1)*256)).save(folder/(str(y)+'.png'),optimize=True)
 print('zoom',zoom,'tiles',n*n,flush=True)
readme_url='https://datacatalogfiles.worldbank.org/ddh-published/0037580/5/DR0084213/readme.txt'
(BASE/'raw/shipping-density-readme.txt').write_bytes(urllib.request.urlopen(readme_url,timeout=45).read())
meta=dict(id='worldbank-commercial-ais',title='Commercial shipping activity',publisher='World Bank',url='https://datacatalog.worldbank.org/search/dataset/0037580/global-shipping-traffic-density',download=url,license='CC BY 4.0',licenseUrl='https://creativecommons.org/licenses/by/4.0/',period='January 2015–February 2021',retrievedAt='2026-09-23',sourceSha256=h.hexdigest(),sourceBytes=archive.stat().st_size,sourceResolutionDegrees=.005,displayMaxZoom=4,tileTemplate='/data/v16/maritime/density/{z}/{x}/{y}.png',scale='Log-scaled relative density; clipped at the positive-cell 99.5th percentile',displayScale=scale,method='Source hourly AIS position reports, including stationary vessels. Source overviews averaged to a display grid, reprojected to Web Mercator, then averaged for lower zoom levels. Color is a relative visual index, not a quantity of ships or cargo.',limits=['Historical activity, not live vessel positions.','Generalized to a 4,096-pixel-wide world raster; do not interpret individual berths or vessels.','AIS coverage varies. Blank cells do not establish that no shipping occurred.','Activity is not specific to the material selected in OVERSHOOT.'])
(OUT/'metadata.json').write_text(json.dumps(meta,indent=2)+'\n')
print('DONE',flush=True)
