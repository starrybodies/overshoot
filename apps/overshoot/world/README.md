# OVERSHOOT: follow the material

The primary question is where materials around a person come from and where they go. The main interface therefore combines material, place, direction, and material form in one connected workspace. Stories and Explorer are no longer the primary navigation.

An investigation can move from Salt Spring collection guidance to BC program destinations, inspect a named processor, explore BC customs exports, open a partner country, and examine its reported trade or mapped sites. Every step shows its source scope. Program end-market percentages, customs observations, and facility measurements remain distinct. Missing links are explicit.

## Source boundaries

- Existing 2024 UN Comtrade snapshots: six copper forms across selected reporters; other commodities use the existing 13-reporter subset.
- Existing 2024 BC domestic export catalogue: 3,140 product/unit entries. Non-mass units remain source quantities and are not drawn as tonnes.
- Existing local program/operator evidence, including 2025 Recycle BC end markets. A regional record does not verify a particular island shipment.
- 1,500 sampled mining footprints based on 2019 imagery, all minerals; representative points do not establish mine identity or commodity production.
- 2,323 US EPA landfill records with source-specific observation years. Missing acceptance quantities remain missing.

`scripts/aggregate-copper-world.mjs` reproducibly concatenates export observations from the retained copper snapshots, preserving original records and separating source-estimated weights. It does not mirror imports, impute missing quantities, or create supply-chain totals.

## Implementation

`MaterialWorld` owns query-string state and the evidence panel. `WorldMap` provides country, trade-edge and point selection; lists expose the same source records. The main routes `/`, `/materials`, `/region`, and `/journey` use this workspace. The historical resource accounts remain accessible through Coverage & sources.

`node scripts/build-material-world.mjs /absolute/path/Overshoot-Reimagined.html` produces a self-contained review export with the same components, fonts, and embedded snapshots. It uses hash state for local-file compatibility. Primary-source links still require an internet connection.

## Next evidence work

Prioritize verified collection-to-transfer-to-processor links in one region, named mines and processing plants with material identities, and domestic subnational movements. Add links only where the source establishes them. The current interface can expose this evidence when acquired, but does not claim an end-to-end trace for an individual object.
