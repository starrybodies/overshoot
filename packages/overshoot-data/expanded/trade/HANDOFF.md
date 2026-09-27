# OVERSHOOT trade expansion — pinned 19 September 2026

## Integration

- `trade.json`: 4,963 non-estimated UN Comtrade net-weight records, 2024, 13 exporter reporters, 214 partner countries/areas and 13 HS4 commodities. 2.19 MB JSON / 95 KB gzip. `type` is `raw` or `discard`; each record contains `origin`, `destination`, `commodity`, `year`, `tonnes`, `source_id='comtrade'` plus original kilograms, reporter, direction, HS revision, source flags, raw snapshot filename and row index.
- `basel-routes.json`: 1,152 route/year aggregates for 2023–2024, 103 reporting Parties; 473 KB / 63 KB gzip. `commodity='BASEL'`, `type='controlled-waste'`, `source_id='basel-national-reporting'`. Keep this as a separate layer. Each route resolves to `record_ids` in the detailed artifact.
- `basel.json`: 17,314 valid distinct Basel Table 4 export detail records; 9.32 MB / 634 KB gzip. Preserve the native Basel Annex/Y/national waste taxonomy and intended R/D treatment codes. Load only for inspection if needed. The original unit is already metric tons.
- `source-registry.json`: typed Source entries for Comtrade, Basel, the UN M49 supporting lookup, BACI, Comext, FAOSTAT Detailed Trade Matrix, UNCTAD Plastics Trade, WITS and UNdata. The six unacquired complements are marked blocked/catalogued and must not be counted as numerical integration. Existing registry entries with matching IDs must be replaced rather than duplicated.

Both flow artifacts are partial. A missing route or year means unavailable coverage, never zero. Ranking or summing these datasets must explicitly say **within the loaded sample**, not global trade. Comtrade includes 13 selected reporting economies; partner coverage is much wider than reporter coverage. Basel includes available valid national reports; a country without a report is not assumed to have no controlled waste movements.

## Important definitions

- HS2603 identifies **copper ores and concentrates**. The net-weight field is used as published; do not call it tonnes of pure copper or convert to metal content. HS4 commodity weight is not equivalent to contained-element mass.
- HS6309 is worn clothing and other worn articles; it can include reuse, so the `discard` grouping is a navigation shorthand for scrap/worn categories, not a legal waste determination.
- HS8549 relies on HS2022 (H6) in this snapshot; do not carry the code backward into an older HS classification.
- Comtrade weights exclude `isNetWgtEstimated=true`, missing and zero weights, aggregate/unsupported partners and non-total customs/mode/second-partner dimensions. An HS4 row can be `isReported=false` because Comtrade aggregates reported HS6 records, while `isNetWgtEstimated=false` remains valid. Retain both flags; don't mislabel every HS4 row as a raw national micro-record.
- Basel controlled waste includes **hazardous and other wastes**. Do not call the whole dataset hazardous waste. Intended recovery code R does not prove completed recycling.
- Keep exporter reporting direction only in map totals. Do not add importer mirror reports to exports. Basel and Comtrade overlap conceptually, have different classification/reporting regimes, and must never be added together.
- Country codes were checked rather than assumed: Comtrade's current India reporter is 699 and US reporter is 842; 356 is historical India. The historical request remains visible in the raw acquisition log and is explicitly excluded from normalization. Basel uses ISO2 country codes resolved with the official UN M49 ISO table. Comtrade's `Europe EU, nes` partner entry resembles Monaco in one reference field, so special/unspecified areas are filtered by source labels as well as group/ISO flags.

## Reproducibility and lineage

Run `python acquire.py` then `python normalize.py` for the fixed Comtrade selection. The downloader is paced, respects retry delays, preserves exact request URLs/response hashes and splits any response hitting the public API's 500-record cap. It reuses successful pinned snapshots; it does not overwrite them silently. Selected reporters: CHL, USA, CAN, JPN, AUS, BRA, DEU, NLD, GBR, CHN, PER, TUR and IND. Selected HS4 codes: 2603, 2601, 2701, 2709, 1001, 4403, 3915, 4707, 7204, 7404, 7602, 6309 and 8549.

Run `python basel.py` to regenerate detail and route data from two pinned national-reporting Table 4 export snapshots. `--download` explicitly requests fresh copies of those two fixed-year endpoints. The public service is linked by the Basel control tool; it works without authentication even though the separate full-report viewer redirects to login. Table 4 exports, Table 5 imports and metric-ton units were verified against the official national-reporting manual.

Run `python validate.py` for 9 substantive checks: snapshot SHA256, unique trade keys, non-estimated net weight, exact kg/tonne conversion, valid geography/direction, source resolution, unique Basel survey sections, exact raw tonne values and exact route aggregation. `checks.json` records the passing counts. No monetary-to-mass inference, interpolation, mirror filling or estimated-weight inclusion occurs.

Copy pipeline/raw acquisition files using the manifests rather than copying every exploratory download. Required Comtrade files are `raw/comtrade_*.json`, `raw/discovery0.json` (official Reporters), and `raw/discovery1.json` (official partners); required Basel files are `raw/basel-detail0.json`, `raw/basel-detail1.json`, and `raw/un-m49-table.json`. Keep `snapshots.json`, `basel-snapshots.json`, `reference-snapshots.json`, the scripts, registries and checks. The original UN M49 table, OData metadata and Basel manual are supporting provenance snapshots. Exploratory minified Comtrade JavaScript and an incomplete BACI zip probe are research intermediates and should not be published or copied into the app.

## Source access and licences

- Comtrade public preview is accessible without credentials for this bounded sample. Exact terms are the United Nations Comtrade usage agreement; no CC/open-data licence is asserted. Always credit UNSD and retain terms/source links.
- Basel national-report data are publicly queryable; a dataset-specific open redistribution licence was not verified. Registry links the official portal/terms and preserves original provenance.
- CEPII BACI release 202601 is publicly downloadable and expressly Etalab Open Licence 2.0. Its HS22 matrix spans 2022–2024 and the zip is 301,386,611 bytes. It is harmonized/reconciled trade, not interchangeable with direct Comtrade reporting; numerical matrix was not ingested here.
- Eurostat Comext bulk files, FAOSTAT agricultural trade, UNCTAD plastics trade, WITS and UNdata are catalogued complements/access routes. WITS/FAOSTAT/UNCTAD direct retrieval had access blocks; Comext's large bulk matrix was not acquired. UNdata and WITS expose underlying Comtrade and are not independent observations.

## Exclusions

Comtrade: 739 estimated/unknown-weight records, 115 missing-weight records, and 178 aggregate/unsupported partner records are excluded. Five obsolete India-code queries are excluded from coverage.

Basel: 2 zero amounts, 2 missing amounts, 3 unsupported/missing country records and 182 source self-partner entries are excluded from international route visualizations. The originals remain in raw snapshots. Positive self-partner data should not become arcs across invented borders.

## Material source-quality finding

A targeted official mirror check found Chile-to-China HS2603 in 2024 has exporter net weight 2,253,844.262907 tonnes versus importer net weight 9,210,398 tonnes. Both fields are marked non-estimated. This unresolved reporting-side discrepancy is recorded in `quality-notes.json` and `mirror-snapshots.json`. Keep the exporter-only atlas data but label **reported export weight** and disclose the counterpart where selected; never imply reconciled physical truth, infer ore grade, average the reports, or silently replace one side. The audit covered this single salient corridor and does not certify all other weights. The raw mirror snapshot is a QA observation only and is not added to trade totals.
