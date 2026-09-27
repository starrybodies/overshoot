# Waste journey review — release 7 draft

This is additive work on `material-region-v6`, not a deployment of the latest live application. The live v5 source could not be fetched (server HTTP500). An older recovered source is the development base; never deploy it over live v5. Apply the two draft releases onto the current source once access is restored.

## Experience and architecture

`/journey` offers eight material choices, four process stages, explicit Salt Spring / British Columbia / general-process scopes, separate learning and research modes, optional technical text, sourced outcomes, source inspection, search, and CSV/JSON download links. Mobile replaces the desktop grid with a labeled material selector. URL state preserves material, place, stage, mode, reading depth and search. Server rendering receives the initial URL state; the portable build reads its initial hash before rendering. Nothing requests geolocation or assumes a household shipment route.

The React view consumes a separate typed data package. `normalize.py` transforms reviewed research into `local-evidence.json`, preserving native percentages, missing values and source IDs. `dataset.ts` joins four EPA process references with sixteen local/operator/report sources. All quantities stay within their original program, year, unit and boundary. There are 19 narrative evidence records derived from 15 reviewed research records, plus material-specific 2024/2025 end-market tables. These are not 19 individual shipments or 20 complete databases.

## Exact acquired evidence

- Recycle BC Annual Reports 2024 and 2025: visually checked p.29 end-market geography; 2025 p.47 management quantities. Paper, plastics, metal and glass remain separate. A source dash remains null. The source categories Canada (separate from BC) and Export (separate from USA) are explicitly explained. End-market geography is not a recycling/capture rate. The disposal quantity is labeled for all program materials combined.
- Recycle BC post-collection guidance, April 2026 network-transition announcement, and paper/container/glass/plastic process pages. Planned facilities are not treated as operating, and the 2025 network is not silently called current.
- Salt Spring Community Services depot and accepted-material pages: collection entry only. No downstream facility assignment is inferred.
- CRD organics, Hartland landfill, landfill-process and public-depot pages: collection/process guidance, landfill gas to upgrading and the gas network, leachate to the sanitary sewer, and bulky rigid plastic used as landfill cover. Non-packaging rigid plastics have a separate material selector.
- EPRA BC 2025 Report to Director and process FAQ: the Salt Spring collection entry and approved primary recyclers, without inventing an assignment between them. Further processing is not labeled completed recycling. Indicative output percentages and a gas-energy forecast are not plotted as measured household quantities.
- EPA recycling, composting, landfill-gas and waste-combustion pages supply general explanations. They are not used to substitute US acceptance rules or rates into BC observations.

Source URLs, retrieval times, report hashes, page locators, licenses/reuse notes and reviewed source records live in `research/journey-records.json`. `research/sha256-manifest.json` records the acquired originals. `research/source-extracts.tar.gz` preserves acquired HTML/web-response snapshots and layout text extracted from reports. The 121 MB of original PDF reports remain outside this Git checkout, reproducible from their original URLs with recorded SHA-256; they were visually inspected during acquisition. Neither full reports nor source extracts are served to the browser. No open redistribution license was established for the local publishers; the interface uses attributed factual paraphrases, not wholesale report redistribution.

## Reproduce

```sh
python packages/overshoot-data/release7/normalize.py
node --import tsx --test packages/overshoot-data/tests/journey-v7.test.ts packages/overshoot-data/tests/materials-v6.test.ts
node node_modules/typescript/bin/tsc --noEmit
node packages/overshoot-data/release7/build-review.mjs /absolute/output/OVERSHOOT-Waste-Journeys.html
```

The review build is a single HTML file with embedded JavaScript, styles and data. Source links require connectivity. It does not fetch source APIs, external fonts, scripts or data to render. The same component is used by the app route. The review explicitly identifies itself as unpublished. Its outbound atlas links open the existing live site.

## Verification and limits

- Ten focused tests pass: URL state, source resolution, local/provincial separation, non-packaging plastics, missing values, native-unit exports, and the five prior material-data contracts. Strict TypeScript and the production framework build pass.
- Browser-checked on desktop and mobile frames sized 390×844 and 412×915. Content widths are 375/397 after reserved scrollbars; equal scroll/client widths in the measured views. Desktop materials, local-gap-to-BC navigation, general-process selection, four stages, reading-depth control, research search/clear, source dialogs, Escape dismissal and sharing were checked. Mobile material choice, landfill outcomes and source modal bounds were checked.
- Fixed a double-translation conflict in the new source modal that could put its close button off-screen. Replaced click-created Blob downloads with native download links; CSV and JSON URI payloads were decoded and checked. Browser automation did not confirm an operating-system file save, and its initial download-event wait timed out. The final JSON link was verified to contain all 19 records / 20 sources / 8 materials.
- Final standalone file: 420,775 bytes; representative pre-final JS 402.09 KB / 124.72 KB gzip, CSS 18.07 KB / 4.62 KB gzip; approximately 1.1 s standalone bundling in this environment. These are packaging measurements, not controlled first-paint or real-device performance measurements.
- Full source dialogs and records provide screen-reader structure, keyboard controls, focus rings and reduced-motion CSS. No formal assistive-technology audit, real-device multitouch, GPU/FPS or production-latency measurement is claimed.
- The latest live buttons could not be reproduced or repaired against current source. This draft is not a claim of a completed live-site regression.

## Integration still required

Recover live commit `055c34825f978ec9d9b2ac016fd666c2499002c2` or newer. Apply the additive v6 material/regional changes and v7 journey files; merge source entries into the current data-room registry and use its existing brand/fonts/navigation. Preserve the current live map and datasets. Test the live-reported broken controls and actual Story/Explore entries against that source. Rebuild, save and deploy through the existing Site identity only after that integration. Never force-push this older base to main.

Remaining evidence gaps include connected Salt Spring shipment manifests, a named organics processor, garbage-hauler receiving sites, final glass processors, final products after intermediate electronics processing, and leachate treatment after the documented sewer connection. These are displayed as gaps. No exhaustive global or household-level tracing is claimed.
