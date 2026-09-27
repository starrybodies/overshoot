# Overshoot: material investigations

The previous site put broad narrative scenes and a generic map ahead of the user's question. Its legacy scene URLs still mounted the navy Atlas. This rebuild replaces every public page with one application: Materials, Places, Trade and Facilities.

The opening interaction explains physical transformations, useful outputs and residues. It exposes named operations immediately. Fourteen material profiles connect to documented cases and statistical records. A material profile is an explanation of processes, not a claimed chain of custody for an individual's object.

## Investigations

- Paper: collection, sorting, bales, repulping, products, and BC's 2025 end markets.
- Copper: HVC–Ashcroft and Horne–CCR are separate documented connections. There is no invented HVC–Horne edge. Purity, copper production, assay quantity and net trade weight remain distinct.
- Garbage: Hartland's stored material, gas and leachate are separate outputs.
- BC: compare four program streams; search all 3,140 retained HS6 exports; open foreign destinations and original records.
- Countries: material accounts from 1970–2024, extraction composition, stocks and specific waste streams with their own reference years.
- Treatment: Eurostat operation partitions never add a parent aggregate to its children. Missing quantities are not inferred. German confidential e-waste exports remain in the national source line with an explicit qualification.
- Facilities: twelve named Canadian operations plus the retained mining, US landfill, wastewater and modeled river-outfall datasets. Footprints are not mine production, liquid volume is not solid mass, and modeled outfalls are not shipment tracking.

## Reproduce derived data

Run node scripts/build-material-atlas.mjs. It builds a value-ranked BC basket from the previously sourced chapter records and copies the existing normalized treatment snapshots unchanged.

Component-level sources are in data.ts; the older datasets retain source registries and original observations. The established public trade map is reused, with light styling and clearer selection context.

## Publication recovery

The source Git service returned HTTP 500 on both incremental fetches and a fresh ordinary clone. The prior production build remains archived as native Sites version 4, source commit 055c34825f978ec9d9b2ac016fd666c2499002c2. Its saved version ID is appgprj_6aae9d74b4d481919f3a0dd064120db6~appgver_b4f5151b73b08191bbb25abf2bd16dd8. It can be redeployed for rollback independently of fetching Git history.
