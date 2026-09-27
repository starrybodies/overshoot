"""Publish bounded, native-unit v6 browser artifacts from preserved source snapshots."""
import gzip,json,hashlib,sys
from pathlib import Path
from collections import defaultdict
root=Path(__file__).resolve().parents[3]
data=Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).parent/'inputs'
out=root/'public/data/v6';out.mkdir(parents=True,exist_ok=True)
manifest=[]
def write(name,obj):
 b=json.dumps(obj,ensure_ascii=False,separators=(',',':'),allow_nan=False).encode();p=out/name;p.parent.mkdir(parents=True,exist_ok=True)
 encoded=gzip.compress(b,compresslevel=6,mtime=0) if name.endswith('.gz') else b;p.write_bytes(encoded)
 manifest.append({'path':name,'bytes':len(encoded),'sha256':hashlib.sha256(encoded).hexdigest(),'decoded_sha256':hashlib.sha256(b).hexdigest()})
def read(name):
 p=data/name
 return json.loads(p.read_bytes() if p.exists() else gzip.decompress(Path(str(p)+'.gz').read_bytes()))
bc=read('bc-materials-v6/bc-exports-2024.json');groups=defaultdict(list);catalog={}
for row in bc['observations']:
 groups[row['hs6'][:2]].append(row)
 key=(row['hs6'],row['unit'])
 if key not in catalog:catalog[key]={k:row[k] for k in ['hs6','commodity','unit','unitLabel','quantityBasis']}
for chapter,rows in groups.items():write(f'bc/{chapter}.json.gz',rows)
write('bc/catalog.json.gz',{'source':bc['source'],'products':list(catalog.values()),'recordCount':len(bc['observations']),'year':2024})
write('bc/collection.json',read('bc-materials-v6/salt-spring-collection.json'))
trade=read('copper-trade-v6/trade.json');groups=defaultdict(lambda:{'flows':[],'estimated_flows':[]})
for mode in ['flows','estimated_flows']:
 for row in trade[mode]:groups[row['reporter']][mode].append(row)
for reporter in trade['reporters']:groups[reporter]
for reporter,rows in groups.items():write(f'copper/{reporter}.json.gz',rows)
write('copper/catalog.json',{k:v for k,v in trade.items() if k not in ['flows','estimated_flows']})
write('country-codes.json',{'TW':'TWN',**{r['reporterCodeIsoAlpha2']:r['reporterCodeIsoAlpha3'] for r in read('copper-trade-v6/references/discovery0.json')['results'] if r.get('reporterCodeIsoAlpha2') and r.get('reporterCodeIsoAlpha3')}})
write('manifest.json',{'version':'6.0.0','artifacts':manifest.copy(),'method':'BC native quantities never summed across HS6 or unit. Comtrade X and M and processing stages remain separate. No inferred final recipient or physical route.'})
print(json.dumps({'artifacts':len(manifest),'bytes':sum(x['bytes'] for x in manifest),'bc_products':len(catalog),'bc_records':len(bc['observations']),'copper_records':len(trade['flows'])}))
