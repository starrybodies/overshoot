"""Normalize pinned official IRP resource accounts without interpolation.

Usage: python normalize_resources.py [root directory]
Outputs use metric tonnes. Native t/cap ratios are retained separately.
"""
import csv
import hashlib
import json
import math
import sys
from pathlib import Path

P = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).parent
raw = P / 'raw' / 'irp-resource-accounts.csv'
metadata = json.loads((P / 'raw' / 'totals-ratios-page.json').read_text())['props']['countries']
existing_countries = json.loads((P / 'raw' / 'country-contract.json').read_text())
allowed = {c['id'] for c in existing_countries}
historical = {'CSK200','ETH230','ANT530','SCG891','YEM886','YMD720','SDN736','SUN810','YUG890'}
by_name = {c['name']: c['code'] for c in metadata}
fields = {
    'DE': 'extraction', 'DMC': 'domesticConsumption', 'MF': 'footprint',
    'IMP': 'imports', 'EXP': 'exports', 'PTB': 'physicalTradeBalance',
    'RME_IMP': 'rawMaterialEquivalentImports', 'RME_EXP': 'rawMaterialEquivalentExports',
    'DMI': 'domesticMaterialInput', 'Population': 'population',
    'DE/cap': 'extractionPerCapita', 'DMC/cap': 'domesticConsumptionPerCapita',
    'MF/cap': 'footprintPerCapita', 'IMP/cap': 'importsPerCapita', 'EXP/cap': 'exportsPerCapita',
}
source_id = 'irp-resource-accounts-2026'
records = list(csv.DictReader(raw.open()))
years = [int(k) for k in records[0] if k.isdigit()]
output = {}
seen = set()
for r in records:
    code = by_name[r['Country']]
    if code == 'WO': country = 'WORLD'
    elif len(code) == 6 and code not in historical and code[3:] != '000' and code[:3] in allowed:
        country = code[:3]
    else: continue
    flow = r['Flow code']
    assert flow in fields
    expected_unit = '' if flow == 'Population' else ('t/cap' if flow.endswith('/cap') else 't')
    assert r['Flow unit'] == expected_unit, (flow, r['Flow unit'])
    for year in years:
        assert (country, year, flow) not in seen
        seen.add((country, year, flow))
        row = output.setdefault((country, year), {
            'country': country, 'year': year, **{field: None for field in fields.values()},
            'source_id': source_id, 'original_unit': 't', 'estimated': year >= 2022,
        })
        value = r[str(year)]
        row[fields[flow]] = (int(value) if flow == 'Population' else float(value)) if value else None
        assert row[fields[flow]] is None or math.isfinite(row[fields[flow]])
        # Negative reported DMC and PTB are legitimate account values/anomalies to retain.
        if flow not in {'PTB', 'DMC', 'DMC/cap'}:
            assert row[fields[flow]] is None or row[fields[flow]] >= 0
rows = sorted(output.values(), key=lambda r: (r['country'], r['year']))
materials = {'Biomass': 'biomass', 'Fossil fuels': 'fossil', 'Metal ores': 'metals', 'Non-metallic minerals': 'minerals'}
for row in rows:
    row['footprintByMaterial'] = {m: None for m in materials.values()}
    row['footprintPerCapitaByMaterial'] = {m: None for m in materials.values()}
material_raw = P / 'raw' / 'irp-footprint-materials.csv'
for r in csv.DictReader(material_raw.open()):
    code = by_name[r['Country']]
    country = 'WORLD' if code == 'WO' else (code[:3] if len(code) == 6 and code not in historical and code[3:] != '000' and code[:3] in allowed else None)
    if country is None: continue
    assert r['Flow code'] == 'MF' and r['Flow unit'] == 't'
    for year in years:
        row = output.get((country, year))
        if row is None: continue
        value = int(r[str(year)]) if r[str(year)] else None
        assert value is None or value >= 0
        material = materials[r['Category']]
        row['footprintByMaterial'][material] = value
        row['footprintPerCapitaByMaterial'][material] = value / row['population'] if value is not None and row['population'] else None
assert len(rows) == len(set((r['country'], r['year']) for r in rows))
assert all(r['country'] == 'WORLD' or r['country'] in allowed for r in rows)
coverage = {}
for field in fields.values():
    vals = [r for r in rows if r[field] is not None]
    coverage[field] = {'observations': len(vals), 'countriesIncludingWorld': len({r['country'] for r in vals}),
                       'years': [min(r['year'] for r in vals), max(r['year'] for r in vals)]}
balance_errors = []
footprint_balance_errors = []
for r in rows:
    if all(r[x] is not None for x in ['extraction', 'imports', 'exports', 'domesticConsumption']):
        error = r['extraction'] + r['imports'] - r['exports'] - r['domesticConsumption']
        balance_errors.append({'country': r['country'], 'year': r['year'], 'differenceTonnes': error})
    if all(r[x] is not None for x in ['extraction','rawMaterialEquivalentImports','rawMaterialEquivalentExports','footprint']):
        error = r['extraction'] + r['rawMaterialEquivalentImports'] - r['rawMaterialEquivalentExports'] - r['footprint']
        footprint_balance_errors.append({'country': r['country'], 'year': r['year'], 'differenceTonnes': error})
result = {'version': 'irp-resource-accounts-2024-retrieved-2026-09-19-v1',
          'source_id': source_id, 'years': years, 'unit': 'metric tonnes',
          'perCapitaUnit': 'metric tonnes per person', 'flowFields': fields, 'coverage': coverage,
          'countries': existing_countries, 'rows': rows}
(P / 'resource-accounts.json').write_text(json.dumps(result, ensure_ascii=False, separators=(',', ':')))
validation = {'source_id': source_id, 'raw_sha256': hashlib.sha256(raw.read_bytes()).hexdigest(),
              'material_raw_sha256': hashlib.sha256(material_raw.read_bytes()).hexdigest(),
              'rawRows': len(records), 'normalizedRows': len(rows), 'countriesIncludingWorld': len({r['country'] for r in rows}),
              'coverage': coverage, 'historicalCodesExcluded': sorted(historical),
              'negativeDmcRetained': sum(r['domesticConsumption'] is not None and r['domesticConsumption'] < 0 for r in rows),
              'maxDmcBalanceErrorTonnes': max(balance_errors, key=lambda r: abs(r['differenceTonnes'])),
              'maxFootprintIdentityDifferenceTonnes': max(footprint_balance_errors, key=lambda r: abs(r['differenceTonnes'])),
              'world2024': next(r for r in rows if r['country'] == 'WORLD' and r['year'] == 2024),
              'japan2024': next(r for r in rows if r['country'] == 'JPN' and r['year'] == 2024)}
(P / 'validation.json').write_text(json.dumps(validation, indent=2))
print(json.dumps(validation, indent=2))
