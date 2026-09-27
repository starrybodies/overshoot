# Release 17 · documented material connections

Reviewed 23 September 2026. Five curated networks contain ten operator-described links across Brazil, Australia, Sweden, Norway, Chile and the United Kingdom. Seven links have two retained source locations and can be mapped. Three remain unlocated. This is a small evidence collection, not a global supply-chain graph or a live shipment service.

## What is established

| Network | Evidence | Map boundary |
| --- | --- | --- |
| Pará aluminium | Paragominas–Alunorte bauxite pipeline; Alunorte supplies Albras; refinery residue goes into its DRS deposits | Mine, refinery and smelter points retained; residue deposits unlocated |
| Queensland aluminium | Weipa bauxite shipped to QAL; QAL alumina supplied to Boyne by conveyor | Origin uses the port-area anchor, not an individual Weipa mine |
| Kiruna–Narvik | LKAB describes iron-ore pellet trains from Kiruna to Narvik in February 2024 | Mine-area and port anchors; not loading sidings or current service status |
| Escondida copper | 2025 BHP disclosure names concentrate pipelines to Coloso and cathode rail transport to Antofagasta and Mejillones | Coloso unlocated; never substituted with the nearby Antofagasta port |
| JLR manufacturing scrap | A December 2014 Novelis announcement describes JLR production scrap recycling at Latchford | Originating plants unspecified; neither headquarters nor guessed coordinates used |

Each link has its material form, transport mode (or explicitly unspecified mode), claim, source IDs, evidence period and scope. Quantities are null. Manufacturing scrap and refinery residue are not end-of-life consumer products. No return flow, supplier relationship or transport mode is inferred from ownership, geographic proximity or another material's route.

## Location identity and geometry

`build_connections.py` joins explicitly reviewed facility identities to the retained release-16 Climate TRACE journey points and IMF PortWatch port anchors. It copies coordinates and source IDs exactly. These representative points do not resolve property boundaries, berths or internal process equipment. Missing endpoints remain null.

Map lines interpolate endpoints for a schematic geographic view. They are **not** surveyed railways, pipe alignments or navigable shipping routes; a shipping connection can therefore cross land in this schematic. Width does not encode quantity. The same meaning appears beside the map and in API responses. Selecting a link focuses its endpoints; selecting a point opens its location basis and underlying facility or port record. The atlas fallback retains regional trade anchors and provides usable endpoint labels without WebGL2.

## Sources and reuse

Nine primary publications are referenced in `public/data/v17/connections.json`, with publication dates where established, review dates, section/page locators and reuse notes. Text is paraphrased; no blanket open license applies to operator publications. Upstream point datasets retain their own terms.

`source-fingerprints.json` records response URLs, byte sizes and SHA-256 hashes for seven directly retrieved publications. QAL and Maritime Safety Queensland returned HTTP 403 to the acquisition script; both were reviewed through primary-page web retrieval, and the manifest explicitly records the absence of a direct snapshot. A hash fingerprints an acquisition; it is not an archived publication or independent confirmation of an operator claim. The BHP Form 20-F transport statement was checked in the downloaded PDF on printed page 186 / PDF page 199. Full copyrighted publications are not redistributed in the app or repository.

Undated source pages have no invented publication date. Historical statements are displayed as historical evidence and do not establish current operation or current throughput. Operator statements have not been independently audited.

## Shared interface and reproduction

The material-page **Documented links** tab, JSON API and fifteenth read-only MCP tool, `connections`, consume the same catalog. Filter by material, country or network. Country discovery includes both sides of a cross-border network. Empty responses are coverage gaps. Every response carries source records, dates, method and geometry limitations.

1. Run `python packages/overshoot-data/release17/build_connections.py` using the retained release-16 artifacts.
2. Optionally reacquire source fingerprints with `python packages/overshoot-data/release17/review_sources.py`. Source pages may change or refuse automated retrieval; do not silently replace reviewed claims.
3. Run `node --import tsx scripts/checks/release17.mts` and the existing release-16, map-style, navigation and MCP protocol checks.

The release-17 checks verify graph integrity, exact upstream coordinates, null quantity semantics, mapped/unmapped boundaries, country filtering, unsafe query rejection and share-link preservation. Browser verification covers connection selection, endpoint focus, missing-location explanation, port navigation, dark mode and the API/MCP examples. The QA browser does not support WebGL2: fallback-map interaction is verified visually; MapLibre style validation and the production worker are checked separately.
