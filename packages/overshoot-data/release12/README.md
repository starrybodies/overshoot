# OVERSHOOT release 12: traceable waste and production records

## Sources and coverage

- **World Bank, What a Waste 3.0 (2026 edition):** original country and city
  workbooks, 217 countries/economies, 262 city records. The public subset has
  6,717 numeric values across generation, composition, collection, treatment,
  other waste streams, distance and modeled quantities. Reporting years vary;
  2026 is the edition, not an observation year. CC BY 4.0.
- **FAO, Forestry Production and Trade:** bulk release updated 9 January 2026,
  acquired 21 September 2026. Nine selected products, 1,388 exact-2024 production
  records, 225 countries/territories plus the source World aggregate. Original
  volume/mass units and source flags are retained. CC BY 4.0 plus FAO statistical
  database terms; no endorsement implied.
- **FAO crops:** the previously acquired and validated QCL snapshot is now
  exposed as eight product-specific maps. 963 rows, 935 numeric values, 187
  countries/territories plus World, all 2024. The original 28 missing values
  remain missing; they never appear as zero on a map.
- **UNEP IRP material accounts:** existing source records partitioned by country
  for fast historical comparisons. 231 entities including World, 55 years
  (1970–2024), 12,705 annual records. No quantities were recalculated. Native
  per-capita measures, missing values, negative values and source estimates
  remain intact.

Official entry points:

- https://datacatalog.worldbank.org/search/dataset/0039597/what-a-waste-global-database
- https://www.worldbank.org/en/publication/what-a-waste
- https://www.fao.org/forestry/statistics/data/en
- https://www.fao.org/faostat/en/#data/FO
- https://www.fao.org/faostat/en/#data/QCL
- https://www.fao.org/statistics/data-collection/forestry/en

## Reproduce

Run from the repository root:

```sh
python packages/overshoot-data/release12/acquire.py
python packages/overshoot-data/release12/build.py
python packages/overshoot-data/release12/production.py
python packages/overshoot-data/release12/validate.py
node --import tsx scripts/checks/atlas-navigation.mts
```

The World Bank build and validation require `openpyxl`. `acquire.py` is a refresh
operation: review any changed checksums before accepting a newer workbook.
The raw files and acquisition manifests are retained in Git. Forestry
`production.py` verifies the pinned archive checksum, and reacquires it only if
missing. `source-registry-entries.json` preserves this release's additions to
the public source catalog.

`validate.py` checks all emitted World Bank cells against the original tables,
their numerical transformations and codebook references, plus every retained
IRP annual value. It also checks production quantities, flags, source years and
units. Navigation checks cover city and history URLs, production layers,
legacy routes and invalid query input.

## Interpretation decisions

- World Bank percentage cells are stored as fractions. Display values multiply
  them by 100; raw cells remain available in the source drawer and downloads.
- Valparaíso's population-collection cell is 94.6, outside the fraction range.
  Its numeric display is withheld. The app does not guess 0.946.
- Canada's generation table says 2018, while the corresponding codebook source
  date says 2016. Both dates and the original quantity remain visible.
- Collection for recycling does not establish recovered output. Treatment
  stages and source years can overlap, so shares are never normalized to 100%.
- The modeled 2022 baseline and 2030–2050 projections are distinct from reported
  quantities. Common-year map comparisons default to the modeled baseline.
- City records can describe administrative, service or metropolitan boundaries.
  No city coordinates or facility routes are invented. The map explicitly shows
  national context when a city record is selected.
- Channel Islands and Kosovo records retain the World Bank identifiers. They
  remain searchable but are not assigned to unrelated map geometries.
- FAO World aggregates are source values, not sums of the retained country
  sample. Raw inputs and processed products are not added together. Cubic
  metres are never silently converted to tonnes.
- Mineral-specific USGS data were not acquired in this release because the
  source download was unavailable. Existing broad ore context remains labeled
  as such; no invented mineral-production observations were introduced.

## Verification scope

The data validation and navigation regression checks passed on 21 September
2026. Browser visual/interaction review of this release was blocked by the
preview environment (`ERR_BLOCKED_BY_CLIENT` with the supervised preview
running). The existing map worker/fallback is unchanged and the emitted worker
check remains part of publication. No claim of a passed new browser review is
made. Custom-domain work remains on hold.
