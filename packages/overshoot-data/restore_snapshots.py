"""Restore large pinned snapshots from verified, Git-sized gzip parts."""
from pathlib import Path
import gzip,hashlib,json
BASE=Path(__file__).resolve().parent
STORE=BASE/'snapshot-parts'
def restore():
 manifest=json.loads((STORE/'manifest.json').read_text())
 restored=0
 for entry in manifest['files']:
  target=BASE/entry['path']
  if target.exists() and hashlib.sha256(target.read_bytes()).hexdigest()==entry['sha256']:continue
  compressed=bytearray()
  for chunk in entry['chunks']:
   b=(STORE/chunk['file']).read_bytes()
   if hashlib.sha256(b).hexdigest()!=chunk['sha256']:raise ValueError('Corrupt snapshot part: '+chunk['file'])
   compressed.extend(b)
  raw=gzip.decompress(compressed)
  if len(raw)!=entry['bytes'] or hashlib.sha256(raw).hexdigest()!=entry['sha256']:raise ValueError('Snapshot checksum mismatch: '+entry['path'])
  target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(raw);restored+=1
 return restored
if __name__=='__main__':print(f'Restored {restore()} verified snapshots.')
