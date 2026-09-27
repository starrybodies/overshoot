"""Rebuild public site points from acquired primary-source snapshots.

Dependencies: pyshp, shapely, openpyxl, pycountry, pyarrow.
Run: python transform_sites.py [--root DIRECTORY]
No source API is used at browser runtime. GRID is intentionally excluded from
the public artifact until a reuse license is resolved.
"""
from pathlib import Path
import argparse, collections, csv, hashlib, json, math, sqlite3, zipfile
import openpyxl, pycountry, shapefile
import pyarrow as pa
import pyarrow.parquet as pq
from shapely import from_wkb

ROOT = Path(__file__).resolve().parent
arg = argparse.ArgumentParser()
arg.add_argument('--root', type=Path, default=ROOT)
ROOT = arg.parse_args().root
RAW = ROOT / 'raw'
OUT = ROOT / 'artifacts'
OUT.mkdir(exist_ok=True)
SHORT_TON_TO_TONNE = 0.90718474

def write(name, data):
    path = OUT / name
    path.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':'), allow_nan=False))
    return path.stat().st_size

def finite(value):
    return isinstance(value, (int, float)) and math.isfinite(value)

def iso(name):
    aliases = {'Bosnia': 'BIH', 'Democratic Republic of Congo': 'COD', 'UK':'GBR', 'Russia':'RUS', 'Tanzania':'TZA'}
    name = (name or '').strip()
    if name in aliases: return aliases[name]
    try: return pycountry.countries.lookup(name).alpha_3
    except LookupError: return None

def feature(id, kind, name, lon, lat, country, source_id, **extra):
    assert finite(lon) and -180 <= lon <= 180
    assert finite(lat) and -90 <= lat <= 90
    return {'type': 'Feature', 'id': id,
        'geometry': {'type': 'Point', 'coordinates': [round(lon, 6), round(lat, 6)]},
        'properties': {'id': id, 'type': kind, 'name': name, 'country': country,
            'source_id': source_id, **extra}}

def collection(features, **meta):
    return {'type': 'FeatureCollection', 'version': '2026-09-19', 'metadata': meta, 'features': features}

# Midpoint model for 2015; the shapefile itself supplies neither river names,
# countries, nor per-outfall uncertainty intervals. No country is guessed.
if not (RAW/'meijer/Meijer2021_midpoint_emissions.shp').exists():
    with zipfile.ZipFile(RAW/'Meijer2021_midpoint_emissions.zip') as z:
        z.extractall(RAW/'meijer')
reader = shapefile.Reader(str(RAW/'meijer/Meijer2021_midpoint_emissions.shp'))
rivers = []
for row_id, row in enumerate(reader.iterShapeRecords()):
    lon, lat = row.shape.points[0]
    tonnes = row.record['dots_exten']
    assert finite(tonnes) and tonnes >= 0
    # The article identifies Pasig as the highest emitting river. The retained
    # source record is uniquely highest in this official midpoint shapefile.
    is_pasig = row_id == 12639 and tonnes == 62591.9
    rivers.append(feature(f'meijer-{row_id}', 'river-plastic',
        'Pasig River outfall' if is_pasig else f'River outfall {row_id}',
        lon, lat, 'PHL' if is_pasig else None, 'meijer-rivers-2021',
        year=2015, value=tonnes, unit='tonnes/year',
        metric='Modeled floating macroplastic emissions', original_value=tonnes,
        original_unit='metric tons/year', source_row=row_id, estimated=True))
rivers.sort(key=lambda r: r['properties']['value'], reverse=True)
river_meta = dict(total_records=len(rivers), displayed_records=1000,
    subset='Top 1,000 outfalls by modeled annual emissions; not a complete map of rivers.',
    full_dataset_tonnes_per_year=sum(f['properties']['value'] for f in rivers),
    displayed_tonnes_per_year=sum(f['properties']['value'] for f in rivers[:1000]),
    year=2015, source_id='meijer-rivers-2021',
    uncertainty='Midpoint scenario. Per-site intervals are absent in the distributed shapefile. Article reports substantial model uncertainty; these are not measured discharge rates.',
    position_method='Original WGS84 river-outfall coordinates; display rounded to six decimals.',
    country_coverage='Country absent in original file. Pasig identified using article ranking; other countries remain null.')
write('river-sites.geojson', collection(rivers[:1000], **river_meta))

# EPA native masses are US short tons, not metric tonnes. A reported annual
# waste-acceptance value is shown only with its own native reporting year.
book = openpyxl.load_workbook(RAW/'landfilllmopdata.xlsx', read_only=True, data_only=True)
rows = book['LMOP Database'].values
header = next(rows)
landfills, omitted_landfills = [], []
for native in rows:
    row = dict(zip(header, native))
    if not row['Landfill ID']: continue
    lon, lat = row['Longitude'], row['Latitude']
    if not finite(lon) or not finite(lat) or not -180 <= lon <= 180 or not -90 <= lat <= 90:
        omitted_landfills.append(row['Landfill ID']); continue
    tons, year = row['Annual Waste Acceptance Rate (tons per year)'], row['Annual Waste Acceptance Year']
    valid = finite(tons) and tons >= 0 and finite(year)
    extra = dict(year=int(year) if valid else None,
        value=round(tons * SHORT_TON_TO_TONNE, 4) if valid else None,
        unit='tonnes/year', metric='Reported annual waste acceptance',
        original_value=tons if valid else None, original_unit='US short tons/year',
        source_row=row['Landfill ID'], status=row['Current Landfill Status'],
        state=row['State'])
    landfills.append(feature(f'epa-lmop-{row["Landfill ID"]}', 'landfill', row['Landfill Name'],
        lon, lat, 'USA', 'epa-lmop-2024', **extra))
landfill_meta = dict(total_records=2641, displayed_records=len(landfills),
    excluded_missing_coordinates=omitted_landfills, source_id='epa-lmop-2024',
    subset='All geolocated records in the September 2024 LMOP snapshot. United States only; EPA states this is not every US landfill.',
    mass_conversion='US short tons multiplied by exactly 0.90718474. Acceptance year remains record-specific.',
    position_method='EPA-reported coordinates; no inferred location.',
    uncertainty='Missing mass or mass-reporting year remains null. No per-facility statistical uncertainty supplied.')
write('landfill-sites.geojson', collection(landfills, **landfill_meta))

# Mining-land polygons are not facilities, tailings dams, or extraction masses.
# Use an interior representative point for navigation and native polygon area.
conn = sqlite3.connect(RAW/'global_mining_polygons_v2.gpkg')
mining, country_areas = [], collections.defaultdict(lambda: {'area_km2':0, 'features':0})
for fid, blob, country, country_name, area in conn.execute('SELECT fid,geom,ISO3_CODE,COUNTRY_NAME,AREA FROM mining_polygons'):
    # GeoPackage binary header: flag bits 1..3 encode envelope dimensions.
    envelope = (blob[3] >> 1) & 7
    offset = 8 + {0:0, 1:32, 2:48, 3:48, 4:64}[envelope]
    geom = from_wkb(blob[offset:])
    point = geom.representative_point()
    assert area >= 0
    mining.append(feature(f'maus-{fid}', 'mining-area', f'Mapped mining area {fid}',
        point.x, point.y, country, 'maus-mining-2022', year=2019,
        value=area, unit='km²', metric='Mapped mining land area', original_value=area,
        original_unit='km²', source_row=fid, estimated=True))
    country_areas[country]['area_km2'] += area
    country_areas[country]['features'] += 1
mining.sort(key=lambda f: f['properties']['value'], reverse=True)
mining_meta = dict(total_records=len(mining), displayed_records=1500,
    subset='Largest 1,500 mapped mining-land polygons by original area; navigation points, not a list of mines or tailings facilities.',
    year=2019, source_id='maus-mining-2022',
    full_dataset_area_km2=sum(f['properties']['value'] for f in mining),
    displayed_area_km2=sum(f['properties']['value'] for f in mining[:1500]),
    position_method='Interior representative point computed from native WGS84 polygon; native area retained without recalculation.',
    uncertainty='Visual interpretation of 2019 10 m Sentinel-2 imagery within study search zones; source overall land-cover validation accuracy 88.3%. Not an exhaustive all-mine census.')
write('mining-sites.geojson', collection(mining[:1500], **mining_meta))
write('mining-country-areas.json', {'source_id':'maus-mining-2022','year':2019,'unit':'km²','countries':dict(country_areas)})

# Liquid discard is a distinct stream. A cubic metre of effluent is NOT a
# tonne of solid waste. HydroWASTE mixes reported treatment, design capacity,
# unspecified reports, and estimated discharge; retain source quality codes.
# Public display restricts to QUAL_WASTE=1 so capacity/model estimates are not
# presented as measured treatment throughput. Dates are not invented.
wastewater, wastewater_public = [], []
hydro = RAW/'hydrowaste/HydroWASTE_v10.csv'
if hydro.exists():
    for row in csv.DictReader(hydro.open(encoding='cp1252')):
        lon,lat = float(row['LON_WWTP']),float(row['LAT_WWTP'])
        native=float(row['WASTE_DIS']) if row['WASTE_DIS'] else None
        quality=int(row['QUAL_WASTE'])
        f=feature(f'hydrowaste-{row["WASTE_ID"]}', 'wastewater-treatment',
            row['WWTP_NAME'] or f'Wastewater treatment plant {row["WASTE_ID"]}',
            lon,lat,row['CNTRY_ISO'],'hydrowaste-2022',year=None,
            value=native,unit='m³/day',
            metric={1:'Reported treated effluent',2:'Reported design capacity',3:'Reported effluent/capacity (type unspecified)',4:'Estimated effluent'}[quality],
            original_value=native,original_unit='m³/day',source_row=int(row['WASTE_ID']),
            quality_location=int(row['QUAL_LOC']),quality_waste=quality,
            status=row['STATUS'],estimated=quality==4)
        wastewater.append(f)
        if quality==1 and native is not None and native>=0: wastewater_public.append(f)
    wastewater_public.sort(key=lambda f:f['properties']['value'],reverse=True)
    write('wastewater-sites.geojson',collection(wastewater_public[:1000],
        total_records=len(wastewater),reported_treatment_records=len(wastewater_public),displayed_records=min(1000,len(wastewater_public)),
        source_id='hydrowaste-2022',year=None,
        subset='Top 1,000 native reported-treatment discharge values (QUAL_WASTE=1), not design capacities or estimated values. Snapshot December 2021; actual reporting years differ and are not provided per record.',
        position_method='Reported treatment-plant location, not modeled outfall; native regional location-quality code retained.',
        uncertainty='Source location quality is regional:1 high,2 medium,3 low,4 not assessed. No per-record statistical interval. Native reporting date unavailable.',
        unit_warning='Liquid effluent volume m³/day; cannot be added to solid-material mass.'))

# GRID coordinates are acquired, but lack an explicit bulk-reuse license.
# Preserve an adapter and validation result; DO NOT publish these points in the
# combined atlas artifact until the owner resolves the terms.
tailings, tailings_omitted = [], collections.Counter()
for row in json.loads((RAW/'tailings-disclosures.json').read_text()):
    if str(row.get('duplicate')).lower() == 'yes':
        tailings_omitted['marked_duplicate'] += 1; continue
    lon, lat = row.get('longitude'), row.get('latitude')
    if not finite(lon) or not finite(lat) or not -180 <= lon <= 180 or not -90 <= lat <= 90 or (lon == 0 and lat == 0):
        tailings_omitted['missing_or_invalid_coordinates'] += 1; continue
    tailings.append(feature(f'grid-tailings-{row["ubc_number"]}', 'tailings',
        f'{row.get("mine") or "Mine"} · {row.get("tsf") or "Tailings storage"}',
        lon, lat, iso(row.get('country')), 'grid-tailings-portal', year=None,
        source_row=row['ubc_number'], status=row.get('status')))
write('tailings-validation.json', {'status':'blocked','reason':'No explicit reuse license found in portal terms; bulk derivative is excluded from browser artifact.',
    'disclosure_rows':2144,'nonduplicate_geolocated_rows':len(tailings),'omitted':dict(tailings_omitted)})

all_public = rivers[:1000] + landfills + mining[:1500]
assert len(set(f['id'] for f in all_public)) == len(all_public)
write('sites.geojson', collection(all_public, layers={
    'river-plastic':river_meta,'landfill':landfill_meta,'mining-area':mining_meta}))

# Full acquired, normalized public dataset is a pipeline artifact, not a
# browser asset. This retains all river/mining records excluded by display caps.
flat = []
for f in rivers + landfills + mining + wastewater:
    flat.append({**f['properties'], 'longitude':f['geometry']['coordinates'][0], 'latitude':f['geometry']['coordinates'][1]})
all_columns=sorted(set().union(*(set(row) for row in flat)))
pq.write_table(pa.Table.from_pylist([{col:row.get(col) for col in all_columns} for row in flat]), OUT/'sites-full.parquet', compression='zstd')
manifest = {'version':'2026-09-19', 'counts':{'river_plastic':len(rivers),'landfills':len(landfills),'mining_areas':len(mining),'wastewater_treatment':len(wastewater)},
    'browser_counts':{**dict(collections.Counter(f['properties']['type'] for f in all_public)), 'wastewater-treatment':min(1000,len(wastewater_public))},
    'artifacts':[]}
for f in sorted(OUT.iterdir()):
    if f.name == 'sites-manifest.json': continue
    manifest['artifacts'].append({'file':f.name,'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()})
write('sites-manifest.json', manifest)
print(json.dumps(manifest, indent=2))
