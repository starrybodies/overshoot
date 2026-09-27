"""Rebuild the pinned, traceable atlas snapshot. No runtime statistical API calls.
python packages/overshoot-data/pipeline.py
Use --download DIR to acquire candidate IRP snapshots without replacing the pin.
"""
from pathlib import Path
import argparse, datetime, hashlib, json, subprocess, sys, time, urllib.request
import duckdb
import pyarrow as pa
BASE=Path(__file__).resolve().parent
ROOT=BASE.parent.parent
PUBLIC=ROOT/'public/data/v1'
RAW=BASE/'raw'
START=time.perf_counter()

def download(target):
    target=Path(target);target.mkdir(parents=True,exist_ok=True)
    source=json.loads((RAW/'irp/sources.json').read_text())[0]
    urls={'irp_de_4classes_export.csv':source['download_url']}
    for key,value in source.items():
        if 'ratio' in key and isinstance(value,str) and value.startswith('https:'):urls['irp_population_de_ratios.csv']=value
    manifest={}
    for filename,url in urls.items():
        with urllib.request.urlopen(url,timeout=40) as r: payload=r.read()
        if not payload.startswith(b'"Country"'):raise ValueError('Expected official IRP CSV header')
        (target/filename).write_bytes(payload)
        manifest[filename]={'url':url,'sha256':hashlib.sha256(payload).hexdigest(),'retrieved':datetime.datetime.now(datetime.timezone.utc).isoformat()}
    (target/'snapshot.json').write_text(json.dumps(manifest,indent=2))
    return manifest

def source_registry():
    sources=json.loads((RAW/'irp/sources.json').read_text())+json.loads((RAW/'scenes/source-registry.json').read_text())
    normalized=[]
    for s in sources:
        years=s.get('data_coverage_years',s.get('coverage_years',[]));notes=s['transformation_notes']
        normalized.append(dict(id=s['id'],title=s['title'],publisher=s['publisher'],dataset=s['dataset'],edition=s['edition'],publicationYear=s.get('publication_year'),coverageYears='–'.join(map(str,years)),url=s['url'],citation=s['citation'],license=s['license'],retrievedAt=s.get('retrieved',s.get('retrieval_date','2026-09-19')),method=s['method_note'],units=s['unit_notes'],transformations=' '.join(notes) if isinstance(notes,list) else notes,geographicCoverage=s['geographic_coverage'],temporalCoverage=s['temporal_coverage'],status='partial' if s['id']=='irp-2026' else 'available'))
    normalized.extend(json.loads((BASE/'supplemental-sources.json').read_text()))
    return normalized

def build():
    for script,folder in [('normalize_irp.py','irp'),('enrich_irp.py','irp'),('transform_scenes.py','scenes')]:
        subprocess.run([sys.executable,str(BASE/'pipeline'/script),str(RAW/folder)],check=True,stdout=subprocess.DEVNULL)
    data=json.loads((RAW/'irp/extraction-with-population.json').read_text())
    sources=source_registry();source_ids={s['id'] for s in sources}
    geo=json.loads((PUBLIC/'geography.json').read_text())
    centers={f['properties']['numeric']:f['properties']['center'] for f in geo['features']}
    for c in data['countries']:
        if c.get('numeric') in centers:c['center']=centers[c['numeric']]
    for r in data['rows']:
        assert r['source_id'] in source_ids
        r.pop('per_capita_method',None) # identical method retained in typed registry
        assert all(r[k] is None or r[k]>=0 for k in ['biomass','fossil','metals','minerals','total'])
    table=pa.Table.from_pylist(data['rows'])
    con=duckdb.connect();con.register('observations',table)
    assert con.execute('SELECT COUNT(*)-COUNT(DISTINCT (country,year)) FROM observations').fetchone()[0]==0
    parquet=BASE/'artifacts/extraction-v1.parquet'
    con.execute('COPY observations TO ? (FORMAT PARQUET, COMPRESSION ZSTD)',[str(parquet)])
    years=con.execute("SELECT COUNT(*),MIN(year),MAX(year) FROM observations WHERE country='WORLD'").fetchone()
    assert years==(55,1970,2024),years
    PUBLIC.mkdir(parents=True,exist_ok=True)
    columns=['country','year','biomass','fossil','metals','minerals','total','population','per_capita_total','estimated']
    compact={k:data[k] for k in ['version','source_id','years','countries']}
    compact.update(unit='t',columns=columns,observations=[[r.get(k) if k!='per_capita_total' else r.get('per_capita',{}).get('total') for k in columns] for r in data['rows']])
    (PUBLIC/'extraction.json').write_text(json.dumps(compact,separators=(',',':'),ensure_ascii=False))
    (PUBLIC/'scenes.json').write_bytes((RAW/'scenes/scenes.json').read_bytes())
    (PUBLIC/'sources.json').write_text(json.dumps(sources,indent=2,ensure_ascii=False))
    manifest={'version':data['version'],'normalized_unit':'metric tonnes','source_ids':sorted(source_ids),'files':{p.name:{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in PUBLIC.glob('*.json') if p.name!='manifest.json'},'raw_snapshots':{str(p.relative_to(RAW)):{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in RAW.rglob('*') if p.suffix in ['.csv','.xlsx']},'records':len(data['rows']),'countries':len(data['countries']),'build_seconds':round(time.perf_counter()-START,3)}
    (PUBLIC/'manifest.json').write_text(json.dumps(manifest,indent=2));print(json.dumps({k:manifest[k] for k in ['version','records','countries','build_seconds']}))

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--download');args=parser.parse_args()
    print(json.dumps(download(args.download),indent=2)) if args.download else build()
