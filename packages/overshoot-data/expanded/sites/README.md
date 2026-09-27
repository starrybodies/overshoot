# OVERSHOOT physical-site source expansion

Acquired and verified 2026-09-19. All original downloads have exact URLs and
SHA-256 checksums in `snapshots.json`. These are source snapshots, not runtime
API dependencies. `source-registry.json` contains 11 fully typed Source records.

## Ready for integration

| File | Browser records | Full source records | Coverage / meaning |
|---|---:|---:|---|
| `artifacts/river-sites.geojson` | 1,000 | 31,819 | Highest modeled 2015 river macroplastic emissions; midpoint scenario |
| `artifacts/landfill-sites.geojson` | 2,323 | 2,641 | All geolocated US EPA LMOP landfill records; 318 lack usable coordinates |
| `artifacts/mining-sites.geojson` | 1,500 | 44,929 | Largest mapped 2019 mining-land polygons represented by interior navigation points |
| `artifacts/wastewater-sites.geojson` | 1,000 | 58,502 | Largest native *reported treatment* rates, QUAL_WASTE=1; distinct liquid stream |

`sites.geojson` combines the first three layers (2,068,425 bytes, 204,580 gzip).
Wastewater is separate to support lazy loading. Raw sources and full normalized
`sites-full.parquet` are pipeline assets, not browser assets. Individual files
are 0.43–1.01 MB uncompressed. The original mining GeoPackage is 24.7 MB and
must remain outside the public browser directory; alternatively retain its
pinned download manifest and reproducible download step outside deployment.

Every feature has `geometry: Point`, an ID, and properties:
`id,type,name,country,source_id,year,value,unit,metric,original_value,original_unit,source_row`.
Some datasets add `estimated`, `status`, or native quality fields. Country is
ISO3 or null. Coordinates are in the GeoJSON geometry, avoiding repeated bytes.
Use `metadata` for the native precision, coverage, display-cap and uncertainty
notes. It must be visible when a layer is inspected. Site types are
`river-plastic`, `landfill`, `mining-area`, `wastewater-treatment`.

Source IDs: `meijer-rivers-2021`, `epa-lmop-2024`, `maus-mining-2022`,
`hydrowaste-2022`. Geometry and quantities resolve to the same source registry.

## Important distinctions

* Meijer shapefile has no native river-name or country columns. Country stays
  null except the uniquely highest outfall, identified as Pasig in the paper.
  Do not imply anonymous points have been geocoded to countries. No per-point
  confidence interval is in the distributed midpoint data. The paper count
  differs from the file count; the file's 31,819 is preserved. Top 1,000 sum to
  722,553.741 tonnes/year, versus 1,005,984.146652 for the full file. Do not
  describe the top 1,000 as representing 80% (it is about 71.8% here).
* EPA masses are US **short tons**, converted to tonnes by exactly 0.90718474.
  Each annual-intake value keeps its actual reporting year. A missing year or
  mass becomes null, never zero. 2,323 mapped landfills are not all US landfills.
* Mining points are derived **navigation points inside land-cover polygons**,
  not named mines, tailings dams, or production reports. Area stays km².
  Do not mix those areas into mass quantities or portray all sites as waste.
  Show this layer in Extraction, or label its separate role in Discard.
* HydroWASTE is liquid effluent in **m³/day**. It mixes treatment reports,
  capacity reports and modeled estimates. Public subset deliberately uses only
  QUAL_WASTE=1 and preserves location-quality codes; raw/full Parquet retains
  all classes. Source reporting years are absent, so year remains null. Do not
  title these values "2021 observations" just because the compilation is2021.

## Acquired but excluded

GRID Global Tailings Portal provides public `/api/taillingLoc?format=json`
and `/api/tailings_all?format=json`. Snapshots contain 2,113 coordinate entries
and 2,144 disclosure rows. Removing 193 source-flagged duplicates and31 records
without valid coordinates leaves1,920 distinct geolocated disclosures.

No explicit bulk reuse license was found in GRID's terms; public viewing is
not treated as an open redistribution grant. `transform_sites.py` contains the
validated adapter but deliberately excludes all GRID features from public
artifacts. `tailings-validation.json` records this blocker. Its storage unit is
m³, not tonnes, and dates are disclosure-specific. The source homepage's1,805
counter is stale relative to the live API. Do not copy that counter into atlas
coverage summaries.

## Further databases checked

The registry includes current Global Energy Monitor Coal Mine Tracker,
NGO Shipbreaking Platform, OpenStreetMap waste geometry, European Industrial
Emissions Portal/E-PRTR, EPA RCRAInfo/ECHO/FRS/NPDES and USGS MRDS. They are
catalogued with honest unacquired status and specific access/schema limitations.
This is a relevant database inventory, not a claim to have exhausted every
national or municipal register on Earth.

NGO profiles support Alang-Sosiya, Chattogram/Sitakund and Gadani as real
shipbreaking regions but no reusable coordinate table was acquired. OSM exact
industrial-tag query returned zero; name and regional queries timed out. An
unrelated candidate OSM node was rejected after checking coordinates. No
shipbreaking coordinates are invented. A general `industrial=shipyard` tag
describes construction/repair too and cannot safely mean shipbreaking.

US EPA larger facility resources have useful bulk downloads (RCRAInfo103MB,
FRS318MB, ECHO exporter392MB at inspection) and need explicit waste-handler
roles and deduplication by FRS IDs before spatial integration. Not every
hazardous-waste generator is a disposal facility. EEA similarly needs native
industrial activity-code and waste-transfer filtering. MRDS endpoint returned
HTTP403 here. GEM's download flow requests user details; none were submitted.

## Reproduce

Install `pyshp shapely openpyxl pycountry pyarrow`, restore pinned raw files,
and run `python transform_sites.py`. Pipeline runtime is about5 seconds in this
workspace. Original coordinates rounded to six decimals for display, without
claiming metre-scale real-world accuracy. Artifact hashes/sizes are in
`artifacts/sites-manifest.json`. Browser lineages are derived, never manually
edited values. This directory is research output; the main agent integrates it
into the app and source package.
