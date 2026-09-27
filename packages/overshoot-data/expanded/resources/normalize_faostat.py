"""Publish exact-year, selected primary-crop tonnes from the pinned FAOSTAT QCL export.

These eight crops are an editorial subset, never a total biomass indicator.
The raw subset CSV retains all source columns and years for reproducibility.
"""
import csv
import hashlib
import io
import json
import math
import sys
import zipfile
from pathlib import Path

P = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).parent
source_id = 'faostat-qcl-2025'
country_map = {c['numeric']: c['id'] for c in json.loads((P / 'raw/country-contract.json').read_text())}
items = {'15', '27', '44', '56', '116', '156', '236', '254'}
rows = []
source_rows = []
observed_items = {}
with zipfile.ZipFile(P / 'raw/faostat-qcl.zip') as z:
    filename = next(n for n in z.namelist() if n.endswith('(Normalized).csv'))
    with z.open(filename) as f:
        reader = csv.DictReader(io.TextIOWrapper(f, encoding='utf-8-sig'))
        fieldnames = reader.fieldnames
        for r in reader:
            if r['Item Code'] not in items or r['Element'] != 'Production' or r['Unit'] != 't': continue
            country = 'WORLD' if r['Area'] == 'World' else country_map.get(r['Area Code (M49)'].lstrip("'"))
            if country is None: continue
            year = int(r['Year'])
            if year < 1970: continue
            value = float(r['Value']) if r['Value'] else None
            assert value is None or math.isfinite(value) and value >= 0
            source_rows.append(r)
            observed_items[r['Item Code']] = r['Item']
            rows.append({'country': country, 'year': year, 'item_code': r['Item Code'], 'item': r['Item'],
                         'tonnes': value, 'source_flag': r['Flag'], 'source_id': source_id, 'original_unit': 't'})
    flags_name = next(n for n in z.namelist() if n.endswith('Flags.csv'))
    flag_rows = list(csv.DictReader(io.StringIO(z.read(flags_name).decode())))
    flags = {r['Flag']: r[' Description'] for r in flag_rows}
assert len({(r['country'], r['year'], r['item_code']) for r in rows}) == len(rows)
assert set(observed_items) == items
rows.sort(key=lambda r: (r['country'], r['year'], r['item_code']))
with (P / 'raw/faostat-primary-crops-subset.csv').open('w') as f:
    w = csv.DictWriter(f, fieldnames=fieldnames)
    w.writeheader()
    w.writerows(source_rows)
latest_year = max(r['year'] for r in rows)
output = {'version': 'faostat-qcl-2025-12-31-retrieved-2026-09-19-v1', 'source_id': source_id,
          'unit': 'metric tonnes', 'year': latest_year, 'items': observed_items, 'sourceFlags': flags,
          'scope': 'Eight selected primary crops. This is not total agriculture or biomass extraction.',
          'rows': [r for r in rows if r['year'] == latest_year]}
(P / 'agriculture.json').write_text(json.dumps(output, ensure_ascii=False, separators=(',', ':')))
validation = {'source_id': source_id, 'raw_sha256': hashlib.sha256((P/'raw/faostat-qcl.zip').read_bytes()).hexdigest(),
              'subset_sha256': hashlib.sha256((P/'raw/faostat-primary-crops-subset.csv').read_bytes()).hexdigest(),
              'subsetRows': len(rows), 'browserRows': len(output['rows']), 'browserYear': latest_year,
              'countriesIncludingWorld': len({r['country'] for r in output['rows']}),
              'years': [min(r['year'] for r in rows), latest_year], 'items': observed_items,
              'flags': flags, 'worldLatest': [r for r in output['rows'] if r['country'] == 'WORLD']}
(P/'faostat-validation.json').write_text(json.dumps(validation, indent=2))
print(json.dumps(validation, indent=2))
