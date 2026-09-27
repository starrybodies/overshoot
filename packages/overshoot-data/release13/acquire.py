"""Acquire a candidate snapshot, without publishing or overwriting the release.

python acquire.py --output /tmp/overshoot-energy-candidate
Review hashes/coverage/revisions, then run build.py --input <candidate>.
Sources can revise historical observations; never append the latest month alone.
"""
import argparse, datetime, hashlib, json, pathlib, urllib.request

URLS={
 'eia-international.zip':'https://www.eia.gov/opendata/bulk/INTL.zip',
 'eia-manifest.json':'https://www.eia.gov/opendata/bulk/manifest.txt',
 'jodi-oil-2025.csv':'https://www.jodidata.org/_resources/files/downloads/oil-data/annual-csv/primary/2025.csv',
 'jodi-oil-2026.csv':'https://www.jodidata.org/_resources/files/downloads/oil-data/annual-csv/primary/primaryyear2026.csv',
}
def main():
 p=argparse.ArgumentParser();p.add_argument('--output',type=pathlib.Path,required=True);a=p.parse_args()
 a.output.mkdir(parents=True,exist_ok=True);manifest=[]
 for name,url in URLS.items():
  with urllib.request.urlopen(url,timeout=90) as response:content=response.read()
  if content.lstrip().startswith(b'<'):raise ValueError('Expected source data, received HTML: '+url)
  (a.output/name).write_bytes(content)
  manifest.append({'file':name,'url':url,'bytes':len(content),'sha256':hashlib.sha256(content).hexdigest(),'retrievedAt':datetime.datetime.now(datetime.timezone.utc).isoformat()})
 (a.output/'downloads.json').write_text(json.dumps(manifest,indent=2)+'\n')
 print(json.dumps(manifest,indent=2))
if __name__=='__main__':main()
