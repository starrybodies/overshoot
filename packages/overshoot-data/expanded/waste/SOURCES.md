# OVERSHOOT expanded waste / plastics / stock sources

Snapshot date: 19 September 2026. All values are acquired public primary-source observations or explicitly identified model estimates. Coverage is broad, not a claim to exhaust every local database in existence.

## Deliverables

- `metrics.json`: 37,610 records with ISO3 or WORLD, metric, year, normalized value/unit, source_id, original values/units, source flags, and available lineage.
- `sources.json`: 20 typed source-registry records, including acquired and registered datasets; `acquisitionStatus` states what happened.
- `stock-history.json`: 62,127 country/process/year rows, 177 countries × 3 processes × 117 years (1900–2016). The file is compact with explicit columns and dataset-level source ID.
- `stock-components.json`: source-scaled 2016 stock/flow components by material and end use; do not add component totals to country totals.
- `plastics-metrics.json`: 1,208 model observations in metric tonnes, from OECD's own public page. Also included in metrics.json.
- `regional-records.json` and `plastics-regional.json`: aggregates deliberately kept separate from countries. OECD's China model region includes Hong Kong.
- `missing-observations.json`: source records with no provided figure (720 NaN entries from food-loss series), omitted from numeric metrics, never replaced with zero.
- `validation.json`: actual acquired coverage/counts. Raw snapshots and SHA256 manifests retained.

## Canonical metric keys for UI

- Stock: `in_use_stock`, `stock_additions`, `stock_end_of_life`, tonnes. Latest country totals2016; source `mat-stocks-2024`. **Model estimates**, not direct inventory observations.
- E-waste: `ewaste_generated`, `ewaste_recycled`, `ewaste_per_capita` (tonnes/person), `ewaste_recycling_rate` (%), source `unsd-ewaste-2026`. National reporting years differ. The UN SDG extract has incomplete country coverage, unlike the full GEM report table.
- Food: `food_waste` for the source's all-sector value; `household_food_waste`, `retail_food_waste`, `food_service_food_waste` for components, plus `_per_capita` variants. Some estimates have low/very-low confidence. Keep those footnotes accessible.
- Municipal: `municipal_waste_generated`, `municipal_waste_recycled`, `municipal_recycling_rate`, source `unsd-municipal-2026`. Eurostat aliases preserve operation codes, e.g. `municipal_rcy_m` (material recycling), `municipal_rcy_c_d` (composting/digestion), `municipal_dsp_i` (incineration), `municipal_rcv_e` (energy recovery), `municipal_dsp_l_oth` (landfill and other disposal).
- Circularity: `circular_material_use_rate`, source `eurostat-circularity-2025`, percentages, 27 countries2010–2024. Eurostat method differs from Circle Economy, so do not compare as if the same statistic.
- Plastics: `plastic_waste_generated`, `plastic_waste_recycled`, `plastic_waste_incinerated`, `plastic_waste_sanitary_landfill`, `plastic_waste_mismanaged`, `plastic_waste_uncollected_litter`, plus use/leakage/river/ocean-stock metrics. Historical model estimates1990–2019, source `oecd-plastics-database-2022`. All mass is tonnes.

## Validation anchors

OECD2019 global waste353,291,100t exactly equals recycled32,830,539 + incinerated67,269,367 + sanitarylandfill173,829,281 + mismanaged78,291,438 + uncollectedlitter1,070,475. Do not merge the last two without explicitly labelling the aggregation.

MAT_STOCKS v1 global file has exactly16 mutually exclusive material/end-use cells per country/process/year. Converted kilotonnes×1,000; compensated summation. Canada in-use stock2016 is13,847,908,195.69547t (display with sensible precision, e.g.13.8billion tonnes). No global sum is invented from a partial country inventory.

UN SDG native2022 global e-waste generation61,908,365.36t; UNITAR values beyond2022 explicitly marked as model projections in this edition. Canada's2023 figure786,150t has its source detail preserved. Raw API can contain model, country, imputed and differently-defined values; those flags are retained.

Every `source_id` resolves to sources.json. No duplicate (source_id,country,metric,year) keys. No nonfinite/negative mass in published metrics. Sparse years remain sparse. Country names/codes retain a frozen mapping derived from the already-acquired official IRP country metadata.

## Acquisition and reproduction

`acquire.py` and `acquire_sdg.py` acquire core snapshots using public HTTPS GETs. `refresh_all.py NEW_DIRECTORY` repeats every successfully snapshotted exact URL without overwriting validated source files. Rebuild derived data with `python normalize_plastics.py`, `python normalize.py`, `python build_registry.py` in this directory. Standard Python library only.

OECD's normal reportHTML returned403, but its official reportPDF and Compare Your Country page downloaded successfully. The latter embeds public chart data in `var backend`; parser uses JSON decoding and does not execute JavaScript or access the site's internal API. Scenario series after2019 are **not** imported into historical metrics.

## Licences / source boundaries

MAT_STOCKS data CC BY4.0; model software GPL separately. OECD numerical data reuse permitted with attribution under its public terms, including commercial uses subject to third-party rights. Eurostat reuse requires attribution; no unsupported claim of a specific Creative Commons licence is made. UN SDG API does not return a uniform licence; underlying agencies and original source references remain explicit.

Global E-waste Monitor2024 fullPDF is CC BY-NC-SA3.0IGO excluding photographs and third-party materials. It is snapshotted for methodology, but its bulk country table was not imported as an unrestricted dataset. E-waste values currently come from the separately available UN SDG API.

The full FAO Food Loss and Waste literature database, Eurostat all-activity waste cube/WEEE dataset, OECD Regional Plastics Outlook2025, and EEA2022stock update are **registered** with honest acquisition notes. Their numeric contents are not claimed to be incorporated. Basel transboundary records are handled by the trade workstream.

## Publishing guidance

Do not deliver14MB of rich-lineage JSON on initial atlas paint. Generate selected-country or latest-per-metric browser artifacts, or factor fields into an envelope/columns; preserve source resolution. Complete source snapshots are build inputs, not browser payloads. Keep OECD historical plastics separate from hypothetical return scenarios.
