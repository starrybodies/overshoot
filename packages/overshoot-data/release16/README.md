# Release 16 · transport, Venezuela and layered material geography

Acquired and reviewed 23 September 2026. This release is a reproducible snapshot, not a live AIS service or an inferred end-to-end product trace.

## Why Venezuela looked absent

The existing EIA crude-production series includes Venezuela, as does the facility atlas. The selected export-reporter snapshot did not. The UI did not make that distinction sufficiently clear. The release adds 2,647 positive, non-estimated import net-weight observations for oil (HS 2709/2710) from 33 reporting economies. Thirteen name Venezuela as origin (five crude-oil, eight petroleum-product observations). Some small observations are less than one tonne; they remain positive values, not rounded zero.

The Comtrade request IDs come from its official active reporter register, not ISO numeric codes. They differ for several reporting economies, including the United States and France. Earlier incorrectly coded requests are retained in the manifest, marked superseded, and excluded from publication. Empty Venezuela export and import queries remain evidence of missing coverage, not zero trade.

Outgoing views use the retained exporter side where present for an origin/product/year group. Otherwise they use available partner import reports for that whole group. Incoming oil prefers the selected reporter's own imports; otherwise it shows partner exports. The two sides are never added or averaged. HS4 source-aggregate flags, native kg, estimate flags, classification revision, source URLs, source rows and hashes are retained. Import and export reports can disagree and coverage remains partial.

## Maritime data

- **IMF PortWatch:** all 2,065 published port/terminal records across 180 source country/area codes, and 24,780 monthly port observations for September 2025–August 2026. Public ArcGIS services owned by IMF-portwatch_imf_dataviz were queried with pagination and source-side monthly aggregation. Exact requests and response hashes are retained under `raw/portwatch`. The latest daily date was checked before selecting twelve completed calendar months. All retained monthly groups have a record for each calendar day; this does not establish complete AIS reception.
- **Visits by vessel class:** container, dry bulk, general cargo, roll-on/roll-off and tanker. A call is a visit, not a unique vessel. Counts are AIS-derived and subject to source port-boundary and transit-filter methods. Source-modeled cargo tonnes are displayed separately, never as customs weights or a specific material's tonnage.
- **World Bank commercial shipping activity:** January 2015–February 2021 hourly AIS position reports, moving and stationary. The CC BY 4.0 raster was downloaded from the primary catalog. Its 480 MB compressed archive expands to large rasters; the original archive is not duplicated in git. The retained metadata includes its exact URL, byte size and SHA-256 for reacquisition. `shipping_tiles.py` generates 341 tiles (zoom 0–4) using publisher overviews, masked averaging, Web Mercator reprojection and log-scaled color. The display is generalized to 4,096 pixels around the world and cannot resolve individual ships or berths. No timing extrapolation, route inference or density-to-cargo conversion is applied.
- PortWatch data retains IMF statistical-data terms and the required attribution: “Sources: UN Global Platform; IMF PortWatch (portwatch.imf.org).” Source terms and public service descriptions are retained. No raw vessel identities or proprietary raw AIS are acquired or redistributed.

## Lifecycle layers

Fourteen material guides have individually selectable extraction, refining, manufacturing, use, recovery and disposal stages; plastic-related guides also have river-to-ocean context. Indexes filter validated release-15 source types and retain IDs and detail-chunk references. Missing stages are explicit. General recycling/disposal locations do not imply acceptance of a material; river plastic is modeled leakage context, not a traced object. Fuel combustion is not presented as a landfill flow. No proximity join connects a mine, factory, port or end user.

The new wordmark uses the bundled Barlow Condensed 600 font. Maps retain their existing view while overlays change. Maritime animation steps through actual retained monthly observations and stops on a hidden tab. Theme and reduced-motion settings are respected. Share links retain lifecycle stages, port visibility, density visibility, vessel class, month, selected port and worldwide-port scope. Server entry points initialize from validated query parameters, avoiding a flash of the wrong material on a shared link.

## Reproduction

1. `python packages/overshoot-data/release16/trade_acquire.py`
2. `python packages/overshoot-data/release16/trade_publish.py`
3. `python packages/overshoot-data/release16/maritime_acquire.py`
4. `python packages/overshoot-data/release16/maritime_publish.py`
5. Download the archive at the exact URL in `public/data/v16/maritime/density/metadata.json`, verify SHA-256, then run `shipping_tiles.py ARCHIVE WORKDIR` with rasterio, NumPy and Pillow installed. The working directory needs space for the source overview.
6. `python packages/overshoot-data/release16/journeys_publish.py`
7. `python packages/overshoot-data/release16/metadata.py`

Scripts retain successful requests, stop on truncated unresolvable partitions, and do not replace missing observations with zero. The websites, read-only JSON API and MCP use the same selection policy. The MCP now exposes 14 tools, including `ports`, `port_activity` and `journey`.

## Verification

`node --import tsx scripts/checks/release16.mts` checks source hashes, table sizes, country/port queries, native weight conversions, the Venezuela regression, single reporting-side selection, zero/null handling, shared-link serialization and invalid requests. Existing map-style, map-worker, navigation, API and MCP protocol checks are also required. The available QA browser does not support WebGL2; the fallback map and page flows are browser tested, while the MapLibre styles and production worker are checked separately.
