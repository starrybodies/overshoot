# OVERSHOOT release 15: connected material investigations

## Rebuild from retained evidence

```sh
python packages/overshoot-data/restore_snapshots.py
python packages/overshoot-data/release15/facilities.py
python packages/overshoot-data/release15/production.py
python packages/overshoot-data/release15/trade_publish.py
python packages/overshoot-data/release15/metadata.py
python packages/overshoot-data/release15/validate.py
python packages/overshoot-data/release15/validate_trade.py
```

The pipeline uses the existing release 14 facility records and original retained input snapshots. It does not need credentials or an upstream network request. The complete FAO crop archive is restored from the already versioned, checksum-verified snapshot parts. Retained raw Climate TRACE and Comtrade responses include their exact request URLs and hashes. `climate_trace.py` and `trade_acquire.py` are explicit acquisition steps; new upstream snapshots require review. This is not an automatically refreshed service.

## What changed

- **342,962 geolocated source records across 220 country/area codes.** The Climate TRACE extension adds 105,118 point-source records, including named copper, bauxite, iron and coal mines, textile and food-processing sites, chemicals, power generation, wastewater and oil/gas transport. Exclude 9,564 administrative aggregates; do not map an administrative centroid as a facility. All counts describe source records, with provider overlap retained.
- **Complete global indexes for every facility layer.** Repeated labels are dictionary-encoded. The largest world index falls from 39.3 MB to 11.6 MB uncompressed without dropping a record or changing a coordinate. Detailed records remain in 2,000-row chunks; API/MCP queries read only detail chunks needed for their bounded result page.
- **394,404 FAO production observations across 84 distinct products.** Histories fall within 1970–2024, with each product’s available years retained. The pinned cotton-lint series ends in 2023. There are 38 forest products, 33 food products and 13 natural-fibre/animal-material inputs. Products and their processing stages can overlap; no cross-product sum is published. Eggs use the source’s tonne series, not its separate thousand-egg series. Original flags, values, units, notes and logical CSV row references are retained. Country and world quantities are source observations; they are not derived by adding selected country rows.
- **10,514 bilateral export observations across 31 reporters and 23 HS4 product groups.** The extension includes 192 retained public API queries; 5,895 positive non-estimated source weights are normalized. New rows replace overlapping reporter/product snapshots, so old and new observations are not added twice. Country and product coverage remain incomplete.
- **Material guides connect to their corresponding physical sites.** Source-defined copper mines, bauxite mines, aluminium plants, iron mines, steel plants, cement plants and mills are separate from the broader satellite mining-land inventory. A named mineral class is never inferred for an unclassified mining footprint.
- **Shareable investigations.** Country, facility layer, type, source, evidence, region, search, selected record, production item and year are restored from URLs. Map instances survive changes of country and facility layer. Global search can open a facility-name query in any source layer.
- **Receiving-water context.** HydroWASTE records expose source estimates of river discharge, dilution factor, RiverATLAS reach and outfall coordinates. The outfall can be located separately from the plant. These are model context, not water-quality measurements or proof of ecological harm. NASA imagery remains a visualization, not a quantitative impact attribution.
- **Eleven public read-only MCP tools.** Bilateral trade, production discovery and source histories join global facility search and the existing environmental, energy, waste and material-account tools. Interpolation is still explicit and limited to the existing annual-energy tool; no estimated values are written into the observations.

## Source integrity

Climate TRACE offset pagination repeated three identical source IDs. Only identical duplicates are removed. A conflicting duplicate stops acquisition. Pages ending in the API’s null response are retained. The publisher’s pagination is not treated as proof of a complete real-world census. Native activity/capacity fields marked licence-restricted remain unavailable even when the native numeric value is zero. CO₂e estimates are not material production, waste intake or electricity generation.

UN Comtrade acquisition is paced, source-country specific, and splits responses that reach the public API’s 500-row cap. Capped parent responses are excluded. Only positive, non-estimated net weights enter the main mass view. Zero, missing and estimated-weight exclusions are counted. Incoming views based on partners’ export reports are explicitly labeled; they are not claimed as the receiving country’s import declarations. Detailed copper import reports remain separate from exports. New empty responses do not silently erase positive older observations.

World Mining Data was evaluated as a mineral-production source. The publisher’s extract and website-republication terms do not provide a clear basis for the proposed database import. No tables were imported. USGS data access remains incomplete. Neither national mineral production nor a supply-chain connection is inferred from facility emissions or from generic all-ore extraction totals.

## Verification and limits

`validation.json` records reconciliation of all 342,962 facility IDs, indexes, coordinates and detail references. All 105,118 additional point sources are checked against the native API values and coordinates. The production check independently compares 6,149 world/decade/country observations across every product with the original CSV rows, including flags and units.

`trade-validation.json` checks all 5,895 new normalized trade observations against their original response fields, all 192 hashes, the requested reporter/product coverage and the complete combined dataset for duplicate flows and incorrect units.

Application checks in `scripts/checks/` cover URL round trips, source queries and pagination, global copper-mine searches, source filtering, production histories, missing years, invalid-input rejection, actual MCP protocol initialization/tool calls, MapLibre style validation and bundled worker availability. The managed visual preview was blocked by the browser service during this release; the new layouts have not completed browser visual QA. No alternative browser or private endpoint was used.
