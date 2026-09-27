# Resource-account expansion

All files are research/data outputs outside the Site checkout. No Site files were changed.

## Ready to integrate

`resource-accounts.json` is an exact-year country history from the official IRP portal, 1970–2024. `sources.json` has two ready-to-use source registry objects in the application's camelCase `Source` shape plus lineage fields.

- IRP source ID: `irp-resource-accounts-2026`.
- 12,705 country-year rows for 230 modern territories and the native WORLD aggregate.
- MF/footprint coverage: 158 modern territories plus WORLD, 8,245 non-null observations. Do not fill other national selections using the Rest-of-region accounts.
- Fields: `extraction`, `footprint`, `domesticConsumption`, `imports`, `exports`, `physicalTradeBalance`, `rawMaterialEquivalentImports`, `rawMaterialEquivalentExports`, `domesticMaterialInput`, `population`.
- Native per-capita fields: `extractionPerCapita`, `footprintPerCapita`, `domesticConsumptionPerCapita`, `importsPerCapita`, `exportsPerCapita`.
- `footprintByMaterial` and `footprintPerCapitaByMaterial` use biomass/fossil/metals/minerals. The class per-person values use native population division; the total uses the native MF/cap series.
- Units are metric tonnes, except population (people) and per-capita fields (tonnes/person).
- Missing values stay null. Missing rows imply unavailable coverage. `estimated: true` identifies 2022–2024 proxy estimates; false does not mean exclusively observed data.

`agriculture.json` adds a small FAOSTAT country snapshot: 963 rows across 187 territories plus WORLD, all from 2024. These are eight named primary crops, **not** total agricultural production or biomass extraction. Data retain FAO flags A/E/I/M/X. `faostat-validation.json` records their meanings. The historical raw subset contains 47,905 source rows from 1970–2024.

## Accounting limits to retain in the UI

IRP direct physical imports/exports are national totals, not bilateral origin–destination links. They cannot produce a trade arc. The native World import/export totals do not balance; do not invent a residual flow to fix this. Native material-footprint figures also do not reconcile exactly with DE + RME imports − RME exports. The greatest discrepancy is the 2024 global record, about 1.99 billion tonnes. The paired series are the publisher's same edition and year; a comparison is valid if both accounting concepts and the modelled nature of MF are explicit, but these differences must not be treated as exact displacement flows or a balanced Sankey.

The four-class MF export also differs from native total MF in some source years. The largest absolute discrepancy is 394,825,439.862 tonnes for WORLD 2002. Keep class data and the native total separate; do not force percentages to sum against the native total or label this discrepancy as mere rounding. Native DE matches the existing extraction artifact exactly for all 12,705 comparable rows. Hong Kong and Micronesia have no native total-account rows and must remain unavailable in these accounts.

DMC + exports − imports reconciles to DE within 0.008 tonnes in the normalized export. There are 47 negative native DMC records; they remain signed and are neither clamped to zero nor discarded.

FAOSTAT production has commodity-specific moisture bases. It is not a direct dry-mass comparison with material stock studies. Never add primary and processed products to form a supposed biomass total. Use the exact named crop, year and geography.

## Reproduction

Run `python normalize_resources.py` and `python normalize_faostat.py` in this directory. Both are standard-library scripts. The official snapshots are in `raw/`; checksums and exact URLs are in `raw/*-download.json`. The resources script uses `raw/country-contract.json`, copied read-only from the extraction package, so the UI's existing ISO3 identities agree.

`validation.json` and `faostat-validation.json` record country/metric coverage and numerical checks. No source API is needed at application runtime. The complete FAOSTAT bulk ZIP is about 34 MB and belongs in the data snapshot archive, never the browser bundle; `agriculture.json` is about 148 KB. The IRP artifact should be loaded only for scenes or queries that need it, or compacted using the same row-array encoding as extraction.

`research-catalog.json` is the complementary database inventory. Its `integrationStatus` distinguishes cataloguing from acquired normalized data. Do not label entries as powering a visualization solely because their links are listed. MAT_STOCKS is being acquired separately by the waste/stock researcher and is intentionally not duplicated here.

## License findings that matter

- EXIOBASE 3.10.2's versioned Zenodo license overrides the stale CC BY-SA statement on its general homepage. The current license is a customized non-commercial academic license. A commercial license is separate.
- Eora2 requires a current license/subscription and uses fewer satellite accounts than Eora1. Eora1 licenses do not carry over. The latest verified Eora2 time series is 1990–2024.
- BGS permits non-commercial academic/research use but asks users to obtain appropriate permission for third-party redistribution or commercial use. It is not an assumed OGL dataset.
- FAOSTAT statistical datasets use CC BY 4.0 plus FAO's database terms; retain credit and avoid implying endorsement.
- GHSL built-up area/volume measures square/cubic metres. Converting these geometries to material tonnes requires a separate validated stock model.
- Alternative MRIOs, SDG series, Eurostat and OECD accounts overlap with IRP. They are cross-checks or alternative versions, never extra mass to add to the global total.
