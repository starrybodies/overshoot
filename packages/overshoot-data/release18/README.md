# Release 18 — Waste research

Acquired 23 September 2026. These are retained snapshots, not live operational feeds.

## Primary acquisition and reproducibility

Run `python packages/overshoot-data/release18/acquire.py`, then `python packages/overshoot-data/release18/publish.py` from the repository root. Acquisition preserves compressed raw responses and records URL, UTC retrieval time, byte count and SHA-256 of the original response in `manifest.json`. Publication validates those hashes and the earlier UN SDG raw-response hashes in `expanded/waste/snapshots-sdg.json` before transforming anything.

- Eurostat `env_wasmun`: full available 1995–2024 annual municipal history, two native units and ten operations. Earlier product views exposed shorter histories.
- Eurostat `env_waspac`: full available 1997–2023 packaging mass history, eleven source material categories and nine operations. Includes domestic, other-EU and non-EU recycling destination categories; these do not identify facilities or shipments.
- UN SDG `EN_REF_WASCOL`: complete paginated response (one page, 5,179 observations) and official 11.6.1 series catalog. 5,170 observations belong to 4,452 source city/area identifiers in 152 mapped countries/areas. Nine world/regional aggregate observations are retained separately; none are treated as cities. These identifiers are not a verified census of unique municipal governments.
- Previously retained complete UN SDG electronic, hazardous, municipal and food-waste histories are now exposed through discoverable, source-separated series. They are not described as newly acquired records.
- World Bank What a Waste 3.0: comparison matrix derived from the existing 217 national/economy and 262 city source records. Detailed field references remain at `/data/v12/waste/{id}.json`.

## Transformations and boundaries

123 series / 63,691 historical observations. Eurostat thousand-tonne values are multiplied by 1,000; original values, units, source cell and factor remain attached. Per-person measures remain in native kg/person/year; World Bank per-person quantities remain kg/person/day. No implicit conversion or cross-source aggregation occurs in comparisons. Eurostat regional totals (1,320 rows) remain in separate files. The 122 Eurostat Kosovo cells in the acquired response are withheld from public series under the source's geographic reuse exception.

Missing observations stay missing. Zeroes remain zero. Source quality/status flags are retained, including 976 break flags. Series remain split by material, operation, unit and SDG dimensions. Country/year duplicates are checked; the chart explicitly omits ambiguous duplicated points rather than selecting one silently. Lines connect consecutive years only and disconnect before reported breaks. No interpolation is applied.

UN city collection measures retain original provider, year, nature, notes, attributes and source city code. Some providers use service-population coverage rather than waste mass; the UI and API explain that denominator mismatch. Collection is not evidence of controlled treatment or recycling. Latest selects the largest year per source city identifier, preserving all ties. No coordinates or joins to the World Bank city register are invented.

UN e-waste observations from UNITAR beyond 2022 are labeled model projections. World Bank future modeled quantities carry model years instead of being presented as observation dates. Food sectors, packaging materials and treatment parent/child categories may overlap and must not be summed.

## Reuse and access

Licenses and attribution are per source. Eurostat reuse policy and third-party exceptions apply; OVERSHOOT converts/reformats data and Eurostat is not responsible for those changes. UN agency/provider terms are retained without asserting a blanket Creative Commons license. World Bank register: CC BY 4.0.

Website: `/waste`, with shareable tab, place, comparison, measure, series, query, level and observation-year selections. JSON API and MCP share four new read-only queries: `waste_catalog`, `waste_history`, `waste_collection`, `waste_compare`. Results preserve source metadata, nulls and bounded pagination. Existing `waste` returns complete World Bank record lineage.

## Validation

`node --import tsx scripts/checks/waste-research.mts` verifies raw hashes, counts, genuine zeroes, break flags, original-value conversions, units, aggregate separation, duplicate handling, country/year pagination, projection dates, rejected invalid queries and share-link round trips. `scripts/checks/mcp-protocol.mts` verifies protocol initialization, nineteen-tool discovery and actual structured queries.

`source-link-check.json` records the focused primary metadata/link audit. An obsolete Eurostat policy URL returned 404 and was replaced with the verified `/help/copyright-notice` page. The UN terms page returned 403 to the fetch client; this is an access limitation, not evidence that the public page is dead. Historical provider links inside individual source workbooks have not all been revalidated.
