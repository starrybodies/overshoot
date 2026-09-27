"""Acquire official Canadian infrastructure archives without credentials.

Original archives, hashes and retrieval dates remain alongside the transforms.
"""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import hashlib, json, urllib.request, zipfile

ROOT = Path(__file__).resolve().parent
RAW = ROOT / 'raw'
SOURCES = {
    'odi-solid-waste': 'https://www150.statcan.gc.ca/pub/34-26-0003/2023001/zip/ODI_v2_solid_waste.zip',
    'odi-oil-gas': 'https://www150.statcan.gc.ca/pub/34-26-0003/2023001/zip/ODI_v2_oil_gas.zip',
}

def acquire(item):
    key, url = item
    path = RAW / (key + '.zip')
    with urllib.request.urlopen(url, timeout=90) as response:
        data = response.read()
    if not data.startswith(b'PK'):
        raise ValueError(f'{key}: expected a ZIP archive')
    path.write_bytes(data)
    with zipfile.ZipFile(path) as archive:
        if archive.testzip():
            raise ValueError(f'{key}: ZIP integrity failure')
    return {'id': key, 'url': url, 'file': path.name,
            'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data),
            'retrievedAt': datetime.now(timezone.utc).isoformat()}

if __name__ == '__main__':
    RAW.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=2) as pool:
        records = list(pool.map(acquire, SOURCES.items()))
    (RAW / 'downloads.json').write_text(json.dumps(records, indent=2) + '\n')
    print(json.dumps(records, indent=2))
