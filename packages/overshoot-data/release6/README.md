# Material and home-region explorer — v6 draft

This is a reviewable additive implementation, **not yet published**. The latest remote source commit could not be fetched (HTTP 500 for current and parent commits under ordinary, shallow and protocol-v0 fetches). The checkout recovered the older published commit 658538de78af9b9c2a34bec6735ac2f4282212a3. Do not deploy this checkout over the live v5 application or force-push main.

## Integrating after source retrieval recovers

Cherry-pick the additive v6 branch onto current main, resolve the BUILD append, then add /materials and /region links to the v5 Introduction, Atlas and Data Room. Merge `materialSources` into the central registry without replacing existing sources. Preserve v5 identity, provenance UI and compressed artifact transport. The two new routes currently use isolated components and an equivalent gzip reader to minimize conflict. Replace their simple wordmark with the existing v5 Brand component. Re-run type checks, five new domain tests, existing tests, build, route/mobile QA. Publish the exact resulting main commit normally.

## Acquired scope

- BC: 19,205 annual product × destination × native-unit observations and 3,140 product/unit catalogue entries, all reported BC-origin domestic export products in the acquired 2024 file. Complete acquired catalogue is not all material movement.
- Copper: six HS4 forms, 76 uncapped public-preview responses, 5,724 source rows; 4,830 nonestimated bilateral records, 468 separately eligible source-estimated records. Imports and exports stay separate. Requested 19 reporters, 18 with usable weight; DR Congo explicitly empty. No assumed mirrors or missing zeros.
- Salt Spring: official operator location and accepted collection categories. Final processors, household residual-waste destination, tonnage and geometry are not known here.

Run `python packages/overshoot-data/release6/publish.py` offline. Inputs are gzip-compressed normalized source products. Source archives preserve raw responses, source URLs/hashes, country nomenclature, native classifications, adapter scripts and documentation. Unpack archives to reproduce original normalization scripts; their original sibling filenames are retained inside the archives. `publish.py` emits 122 bounded browser artifacts (~1 MB total), grouped by HS2 or reporter, with encoded and decoded hashes. No upstream API is used at runtime. Country mapping TW→TWN is an explicit ISO-code mapping, not an equivalence to Comtrade's Other Asia reporting aggregate.

BC HS260300 KGM is contained copper (2024 Canadian Export Classification printed p124). HS740100 is also a copper-content quantity. Do not call these concentrate shipment mass. Comtrade CAN2603 source netWgt equals qty, but source-estimated and national quantity semantics differ; leave this unresolved and warn visibly rather than reconciling two incompatible sources. No sum across units, stages or directional reports.

## Remaining scope

- Province-level exports are not town/household flows. Other provinces, interprovincial trade, named mine/refinery/recipient relationships and historical BC series need separate acquisitions.
- Global material coverage beyond six copper forms still uses the existing atlas; broad BC product browsing is available in the new regional route. Do not claim all global materials have equivalent depth.
- Bring v5 named industrial recipient records into the regional page after recovering the latest source. Facility coordinates must remain null where not supplied.
- The global map is a persistent deterministic SVG geography view with keyboard-accessible rotation and equivalent partner-list selection; no shipping routes or final recipients are inferred. It has no decorative flow animation.
