# OVERSHOOT release 14: a shared, geolocated evidence layer

The facility UI, JSON API and Material World MCP share these records. Counts refer to source records, not a deduplicated inventory of operating facilities.

## Rebuild

```sh
python -m venv .venv-data
.venv-data/bin/pip install -r packages/overshoot-data/release14/requirements.txt
.venv-data/bin/python packages/overshoot-data/release14/build.py
.venv-data/bin/python packages/overshoot-data/release14/environment.py
.venv-data/bin/python packages/overshoot-data/release14/feed_register.py
.venv-data/bin/python packages/overshoot-data/release14/validate.py
```

Rebuild uses the retained original HydroWASTE archive, complete prior Parquet, ODI solid-waste archive, selected original ODI oil/gas rows with original WKB geometry, archived WRI CSV, and original Climate TRACE API pages. No credentials or live upstream request is needed. To reacquire the two Canadian archives, run `acquire.py`; compare hashes in `raw/downloads.json` before accepting a changed source. WRI's exact source URL and uncompressed hash are in `raw/wri-download.json`. NASA WMTS capabilities are retained as a gzip file with a SHA-256 in the public environment catalog. New upstream data requires a reviewed release; no unattended refresh is claimed.

## Source inventory

- HydroWASTE: all 58,502 plants. Original `QUAL_WASTE` distinguishes reported treatment, design capacity, unspecified reports and source estimates. Population, treatment and location quality flags remain original fields. Per-plant observation year is null because it is absent. Estimated outfall coordinates are distinct from plant coordinates.
- Maus/PANGAEA: all 44,929 mining polygons represented by their retained interior points and original area. A polygon can contain pits, tailings, ponds and processing land; it is not a named mine or mineral-production record. Derived mining data retains **CC BY-SA 4.0**.
- EPA LMOP: 2,323 geolocated landfill records out of 2,641 source records. Native US short tons are converted using exactly 0.90718474 tonnes per short ton; each record keeps its own year. Locations with missing coordinates are excluded.
- Meijer river plastic: all 31,819 modeled outfalls, including all previously undisplayed rows. World map includes the complete set. Missing country assignments remain `UNASSIGNED`; there is no nearest-country fiction. Values are modeled annual plastic emissions, not observed waste shipments.
- Statistics Canada ODI v2: all 9,074 solid-waste points and 36,425 records classified as oil/gas facilities. Wells and pipelines are separate native categories and excluded from this facility layer. Transform EPSG:3347 to WGS84 with `always_xy=True`. Non-point geometries use a labeled representative point. No throughput is inferred. Provider overlap remains explicit. Licenses: Open Government Licence – Canada; provider references remain available.
- WRI Global Power Plant Database: all 34,936 source rows across 167 countries. The source is archived and no longer maintained. It is a historical baseline, **not a current operating inventory**. Capacity in MW, its source year, original URLs, fuels and reported/estimated annual GWh are separate fields. CC BY 4.0.

- Climate TRACE: all 19,836 point-source records returned for nine explicitly selected subsectors in the 2025 annual CO₂e inventory: solid-waste disposal, oil/gas production and refining, cement, iron/steel, aluminium, glass, pulp/paper and petrochemical cracking. Retain original centroids, identifiers, estimates and activity units. API v7 pagination terminates with JSON null; the final page is retained as proof of the boundary. `climate_trace.py --refresh` reacquires sequentially; the app has no live dependency on the beta API. Restricted activity fields are unavailable even when their native number is zero. Administrative aggregates are excluded. Terms include CC BY 4.0 and listed external-source exceptions.

## Delivery and memory

Country indexes contain every retained point. Detailed records are split into at most 2,000-row shards. Larger JSON artifacts are deterministic gzip payloads with JSON paths, following the existing project artifact convention; use `materialArtifact`/`assetReader`, not unconditionally `response.json()`. The catalog itself is plain JSON. MapLibre clusters dense points in its worker; the CPU fallback groups all visible points in screen space. There is no largest-N site cap. Query results use bounded pagination; a limit never changes the matched count.

Country code `KOS` in retained upstream records is normalized to the commonly used `XKX` alias for Kosovo; the original code remains in `attributes.original_country_code`. This groups source records for navigation without changing borders or implying a position on status. Country/area counts use the resulting distinct codes.

## Environmental context

NASA GIBS supplies true-colour satellite imagery, land/ocean relief, monthly NDVI and daily ocean chlorophyll. Date, resolution, legend, source and known limits are always available. Layers are visualization products, not numerical sampling APIs. Chlorophyll does not measure plastic; NDVI does not establish an impact cause. Map zoom cannot add source resolution. The Mercator imagery view excludes the extreme poles. Facility records retain their source coordinates independently of imagery availability.

## Verification

`validate.py` reconciles all rows against original HydroWASTE and WRI inputs and the retained complete Parquet, checks conversion units, coordinate ranges, unique IDs, null treatment, country counts, quality codes, shard/index consistency and coverage totals. `reconciliation.json` records the outcome. Query/protocol and map checks live in `scripts/checks/`. Browser checks cover filtering, record opening, URL sharing, image context, graceful graphics fallback and actual MCP initialization, tool discovery and a source-backed tool call.

## Endpoints

- `/mcp`: stateless Streamable HTTP using the official MCP TypeScript SDK; public, read-only tools.
- `/api/material-world?query=coverage&input={}`: JSON API using the same validated query implementation.
- `/data`: connection instructions, runnable examples, coverage and per-source licensing.

Interpolation is opt-in, limited to one missing annual energy value bracketed by two observations at most three years apart. The response retains its formula, source inputs and linear assumption. It never extrapolates or writes synthetic values back into source tables.
