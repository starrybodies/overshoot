# OVERSHOOT — implementation record

## Architecture and environment · 2026-09-19

The Symbai monorepo and the requested `/mnt/skills/public/frontend-design/SKILL.md` are not present in the mounted Linux workspace. Laptop filesystem access is not exposed to this session. App source is isolated in `apps/overshoot`; pipeline, typed queries and source registry in `packages/overshoot-data`. The root Next.js App Router uses a Vinext adapter to the supplied Sites runtime. This is a portable independent checkout, not a claimed Symbai integration.

Visual thesis: near-black planetary instrument, mineral amber, recessed tactile controls. The revised visual system uses pronounced raised and inset interactive surfaces, brighter material colors, and visible keyboard focus.

Immutable versioned local artifacts own all quantitative truth. Missing observations are never interpolated or replaced with regional values. LLM credentials are unavailable; a finite typed query surface will return data and provenance.

## Data acquisition

Primary IRP material extraction CSV acquired by research task. Data extends 1970–2024; 2022–2024 are source estimates. Exact versions, licenses and transformations recorded below at integration.

## Acquired datasets and transformations

| Source | Snapshot used | Coverage and units | License / terms |
|---|---|---|---|
| UNEP International Resource Panel | 2024 GMFD portal, retrieved 2026-09-19; four-class DE CSV and native Population / DE / DE-cap CSV | 1970–2024, 232 entities including WORLD; native metric tonnes and persons | Public export, attribution requested; explicit open-data license not located. No CC license asserted. |
| Elhacham et al., Nature 2020 | Authors' Milo lab human-mass and dry-biomass workbooks | 103 source-aligned years in 1900–2025 subset; source teratonnes × 10^12 → tonnes | Authors' repository MIT; article rights separate |
| Circle Economy, CGR 2025 v1.0 | Tables 1–2 and Figure 3 | 2021 global account: 6.9% secondary input; flow values source-rounded Gt × 10^9 | CC BY-SA 4.0, attribution and license retained |
| World Bank, What a Waste 3.0, March 2026 | Country Dataset & Codebook workbook | 217 national records, each actual reported generation year; native tonnes/year; fate fractions × 100 | CC BY 4.0 |
| UNEP / ISWA GWMO 2024 | Figure 7 factual transcription | 2020 global waste destinations; thousand tonnes × 1,000; source-rounded percentages | Report reproduction terms recorded; no report imagery/text reproduced |
| Natural Earth through world-atlas 2.0.2 | countries-110m | 177 generalized modern country geometries; WGS84 | Public domain geometry; ISC package |

Exact input-file SHA-256 checksums, byte sizes, transformed artifact hashes and IDs are in `public/data/v1/manifest.json`. Source mappings, methods, citations and retrieval dates are exposed in `public/data/v2/sources.json` and the in-app source ledger.

### Data integrity decisions

- `DE` means domestic extraction entering economic use; unused mining overburden is excluded. Gross metal ore is not contained metal.
- Publisher flags 2022–2024 as proxy estimates; earlier accounts also include modeling, and the technical annex cautions about some projections from 2020. A false late-year flag does not mean a direct observation.
- Native IRP all-material DE totals take precedence over four-class sums. Small source differences are retained and documented, not reconciled artificially (maximum 1972–75 global relative discrepancy about 0.00776%). Material-composition shares use the sum of available classes and are omitted when incomplete.
- Native IRP DE/cap is used for total per-person extraction. Class per-person values divide native class tonnes by acquired native population. No population is inferred from totals and ratios.
- Empty cells and absent classes remain null; historical boundary codes are excluded rather than assigned to modern boundaries. No missing class becomes zero. World totals use the source World record, not a sum over overlapping geography.
- Biomass and human-made mass are joined only at source-provided years. No new annual observations are interpolated. Line segments are visual guides between source points. Uncertainty band uses supplied biomass ±1 standard deviation. Post-2015 human-mass values are the original study's extrapolation, not contemporary observations. Crossover: approximately 2020 ±6 years.
- Stock flow chart is explicitly global, annual, and fixed to the CGR 2021 account. Its 98.8 Gt extraction baseline is not replaced with a different IRP edition/year. Figure 3 net accumulation is 40.4 Gt; Table 1 says 40.3 Gt. The diagram retains its own figure values and does not assert an exact downstream mass balance.
- World Bank global generation uses its modeled 2022 baseline (2.56 Gt). UNEP waste destinations are a separately labeled 2020 baseline. These are not joined into a single physical flow.
- National fate fields have no per-field dates in the flat World Bank workbook; the generation year is never assigned to them. Categories are preserved, and no residual share or normalization is invented.
- The persistent counter integrates global annual tonnes / seconds in the selected year, including leap years, across scene and selection changes. It is labeled an annual-rate estimate, not a live measurement feed. A fresh page load begins a new visit.

## Architecture delivered

- Five canonical routes plus home entry; Story and Explore; Zustand state.
- URL round-trip includes scene/year/country/material/mode/normalization/camera and applicable flow/commodity/scenario fields. Back/forward restore state without inserting a new history entry.
- Country/material selection, history play/pause, native per-person normalization and camera reset/zoom. Keyboard buttons, keyboard globe movement, arrow-key scene rail, explicitly named keyboard sliders, source dialogs with focus trapping, readable textual summaries and reduced-motion camera handling.
- Custom source-scaled 2021 flow ribbons and human-mass/biomass trajectory. Stock uses separate accessible tabs so the diagrams do not overlap the narrative.
- Country municipal waste with actual reference year and source-native fate labels; separate global UNEP fate baseline.
- Custom d3-sankey-based primary/secondary input ribbons; explicit scenario label and reset. Scenario shares do not modify observed data or claim a forecast.
- Finite typed queries with source-bearing results; the expanded endpoints are listed below. The query box returns supported source lookups and can navigate. No LLM credential is configured, so no language-model connection is claimed.
- WebMCP tools feature-detect `document.modelContext`, share the same store, validate typed inputs and unregister on teardown.
- GlobeView is experimental upstream. WebGL2 capability is checked before lazy-loading deck.gl. A geographic SVG fallback supports drag, keyboard, zoom and country selection if WebGL is unavailable. No fake planet image or decorative flow particles.
- Regional MapLibre adapter exists for future validated site geometry; it is not mounted in the present release.
- Python pipeline: acquired snapshots → assertions → normalized rows → DuckDB uniqueness/coverage checks → Parquet → compact versioned browser artifacts. Geometry preparation is reproducible from pinned world-atlas.
- Compact observations factor repeated unit/source lineage into the artifact envelope, decoded into typed rows. Initial snapshot is 960,246 bytes (370,214 gzip); geography 447,477 bytes (153,897 gzip). Scene data is loaded on demand. Statistical source APIs are never called by the browser.

## Baseline verification and measured limits (version 1)

- Final strict TypeScript compilation and the Sites/Vinext production build passed on 2026-09-19. Only the home and canonical scene router are deployed; the responsive test harness is retained outside the route tree. The conditional WebGL bundle produces a large-chunk warning and remains lazy-loaded.
- Seven TypeScript tests pass: all-record provenance/nonnegative units/uniqueness; exact source totals and native per-capita; null/missing behavior; leap-year rate; deep-link round-trip; valid/invalid typed tools; scene year/model separation.
- Two Python adapter tests pass: import direction and kg→tonnes conversion, missing/estimated weights excluded, negative weights rejected.
- Browser QA: desktop 1364 × 934; responsive frames 390 × 844 and 412 × 915. No horizontal document overflow in either frame. Country Canada, historical year selection, per-person mode, scenario state, source ledger, question answer and URL restoration verified. Stock overlap found and corrected with phone tabs; both material-flow and mass-comparison views were checked at both sizes. Query navigation restores its answer’s normalization as well as country and year.
- The initial dev build showed SVG/globe readiness above target in simultaneous phone frames, so deck.gl was split behind capability detection and the browser data payload reduced from 4.4 MB to 960 KB. The development preview is not a controlled broadband benchmark. Production under-three-second meaningful visual and M1 60 fps remain unverified; no achieved target is claimed.
- Cloud QA browser does not support WebGL2. Interactive SVG fallback is tested; hardware GlobeView needs a real WebGL-capable laptop/phone check. The capability guard avoids unhandled WebGL creation errors.
- Browser WebMCP modelContext is unavailable in QA; typed tool behavior is unit-tested, live registration/execution could not be validated. This is documented, not reported as passed.
- Map geometry is already generalized and statistical data already aggregated. No PMTiles or worker preprocessing is required for this small snapshot; those remain options when acquired site/flow geometry warrants tiling.

## Expanded release · 19 September 2026

The source library contains **64 entries: 23 available + 6 partial acquired sources, 16 catalogued databases, 19 access gaps**. “Acquired” includes methodology reports and reference metadata; it is not a claim of 29 complete global observation databases. `packages/overshoot-data/SOURCES.md` provides the full primary-source inventory, licenses, transformations and blockers. Every normalized record resolves to this registry.

| Account | Exact acquired / displayed scope | Transform and lineage |
|---|---|---|
| IRP resource accounts | 12,705 country-years, 1970–2024; 230 current national/territorial accounts plus WORLD; MF available for 158 countries plus WORLD | Native DE, DMC, MF, physical trade, raw-material equivalents and per-capita records. Metric tonnes. Current year fetched as a 182 KB shard. |
| FAOSTAT QCL | 963 observations, eight selected primary crops, 2024; archived historical subset 47,905 rows | Native tonnes and A/E/I/M/X flags; never summed into a new biomass extraction total. CC BY 4.0. |
| UN Comtrade | 4,963 export routes; 13 reporters × selected partners (214 distinct economies), 13 HS4 codes; 2024 | Native non-estimated netWgt kg / 1,000. Reporter, HS revision, original values, snapshot and source row preserved. Parent capped queries split; capped parents excluded. |
| Basel national reporting | 17,314 detail records, 103 reporters, 2023–2024; 1,152 route-year aggregates | Source metric-ton strings parsed; each aggregate retains exact contributing record IDs. Kept separate from Comtrade. |
| UNSD / UNITAR / UNEP / FAO | National e-waste, municipal and hazardous waste, Food Waste Index and food loss | Actual source years, flags, methods, original units and projections retained. Main scenes exclude marked UNITAR projections after 2022; evidence browser labels them explicitly. GEM report CC BY-NC-SA 3.0 IGO; observations separately attributed to SDG series. |
| Eurostat | Circular material use, municipal waste, packaging generation and recycling | Native categories, years, estimate and imputation flags. European circularity is not substituted for CGR global circularity. |
| OECD plastics | 1,208 native model observations, 1990–2019, WORLD/CAN/USA/IND | Native tonnes and source fate taxonomy; China-plus-Hong-Kong aggregate not recoded as CHN. Historical accounts not forecasts. Report summaries also archived and distinguishable. |
| MAT_STOCKS / MISO2 | 177 countries, stock/additions/retirements, 1900–2016; 62,127 historical rows; 4,248 latest component records | Source kilotonnes × 1,000. Four end uses and four material groups; 2016 UI stock and annual flows remain distinct. Detailed EU27 CSV archived without double import. CC BY 4.0. |
| Meijer et al. | 31,819 modeled outfalls; largest 1,000 displayed; reference 2015 | Published WGS84 coordinates, source midpoint mass and row lineage. No per-point statistical interval supplied. CC BY 4.0. |
| EPA LMOP | 2,641 records; 2,323 usable published locations, 318 missing coordinates | Reported annual waste acceptance, actual facility year. US short tons × 0.90718474, display rounded to four decimal tonnes. US subset, not all US landfills. |
| Maus mining-land inventory | 44,929 mining polygons; largest 1,500 represented by interior points | Area remains km²; these are mapped mining areas, not tailings facilities or production quantities. CC BY-SA 4.0. |
| HydroWASTE | 58,502 plants; largest 1,000 with reported treatment-rate quality flag 1 displayed | Native m³/day, source location quality retained; reporting years unspecified. Liquid volume is never converted to mass. CC BY 4.0. |

The expanded waste/resource metric account contains **37,610 observations**, with **2,993 curated latest records** and 230 country shards. Geographic layers total **5,823 display records**, loaded only when selected. Full raw sources and normalized Parquet remain outside browser deployment.

### Integrity decisions in the expanded release

- Extraction and footprint native totals can disagree with class sums or a constructed DE + RME trade balance. The native accounts are preserved. In WORLD 2024, MF and DE differ by about 1.99 Gt; no forced closure. The largest native footprint/class discrepancy is WORLD 2002, about 394.8 Mt; it is not dismissed as rounding. Native negative DMC values remain intact.
- Hong Kong and Micronesia lack native total-resource-account rows in the acquired export. They are unavailable, even though extraction coverage exists elsewhere.
- Chile reports 2,253,844.262907 tonnes of HS2603 exported to China in 2024; China reports 9,210,398 tonnes imported from Chile. Both net-weight fields are marked non-estimated. The route retains exporter reporting, with both values and the unresolved discrepancy visible. This is a targeted audit, not a claim that every mirror is reconciled.
- HS2603 is ore/concentrate mass, not copper content. HS6309 can include reusable clothing. HS8549 is used only in the reported revision. Reported HS aggregates may have isReported=false even where net weight is non-estimated; the flags remain in lineage.
- Flow links join country centers and encode square-root tonnes, capped at 60 qualifying routes. They are not reconstructed shipping itineraries. Site radii are nonlinear within a single layer. The SVG fallback shows up to 500 largest markers plus a selected marker, and never mixes area, volume and mass in one scale.
- Site country assignment is only shown when present in the normalized source. An unassigned river outfall is not silently geocoded into a national statistic. Published geometry is rounded for display without claiming corresponding positional accuracy.
- GRID API snapshots were acquired and validated (1,920 usable disclosures), but public geometry is withheld because bulk reuse terms are unresolved. Storage is m³, not tonnes. Shipbreaking locations were not guessed from names or unrelated OSM shipyard tags.
- Report acquisition does not imply permission to republish the entire report. EXIOBASE 3.10.2's actual custom noncommercial terms and Eora/BGS restrictions are explicit in the inventory. Provider catalogs are not claimed as normalized display coverage.

### Interface and query changes

Mobile now uses natural vertical scrolling, a dedicated globe region and a fixed five-scene thumb dock. Quantities, controls and charts have independent space; stock tabs prevent chart collisions. The theme uses Syne display, Space Grotesk UI, IBM Plex Mono quantities, duotone Phosphor scene/material icons, stronger tactile shadows and brighter material colors. Fonts are local assets.

The source library supports publisher/database search, acquired/catalogued/gap filters, detailed methods and licenses, and a country evidence browser with actual years. Waste scenes switch municipal/e-waste/plastics/food/hazardous/places. Country stock displays native 2016 accumulation and end-use bars. Return includes available national Eurostat circular material use with its own boundary warning.

Ten finite WebMCP tools: getExtraction, getMaterialFootprint, getBilateralFlow, getTopFlowPartners, getWasteGeneration, getWasteFate, getCountryMetric, getSites, compareCountries, navigateAtlas. Input validation and output provenance are shared with the app. The deterministic question interface supports extraction, footprint, selected trade corridors, stocks and acquired waste metrics. Explicit historical answers do not navigate to a different latest-value scene. No connected LLM is claimed.

Deep links add waste stream, physical layer, selected site, stock view and Basel/raw/scrap selection. Browser back/forward and source-bearing navigation remain supported.

### Expanded verification and measurements

- Strict TypeScript and production build pass. Thirteen TypeScript tests cover all-record lineage, conversions, missing values, years, URL round trips, typed tools and mirror discrepancy preservation. Two existing Python adapter tests pass.
- Expanded Comtrade/Basel validator passes nine checks including raw SHA-256 hashes, unique keys, non-estimated net weights, exact kg conversion, route aggregation and record lineage. Waste validator passes 37,610 record/unit/source checks, OECD fate closure and stock coverage.
- Browser QA uses desktop 1364 × 934 and phone frames 390 × 844 / 412 × 915. New source library, filtering, country evidence, Canada stock, e-waste selection, actual trade question scenario distinction and Pasig place selection verified. No horizontal document overflow observed; chart-only horizontal scrolling is intentional for the material-flow diagram.
- A circular component dependency caused a preview hot-reload error; SourceButton was extracted to a dependency-free component and the preview recovered. No runtime error remains in tested views.
- Simultaneous phone development frames measured first contentful paint about 1.09 s / 2.69 s and extraction-data readiness 2.69 s / 2.63 s in one run. These are warm development observations, not controlled production/broadband results; under-3-second production visual and 60 fps on M1 remain unverified.
- Representative gzip payloads: extraction 370,214 bytes; geometry 153,897; current resource year 37,456; Canada historical metric shard 7,030; stock components 64,915; Comtrade 95,120; Basel 62,553; river points 35,303; landfills 99,371; mining points 69,777; wastewater 42,280. No raw global dataset is loaded in the browser. The optional WebGL bundle is ~216.5 KB gzip and remains lazy. The production build retains the large-chunk warning for that optional bundle.
- Cloud browser does not support hardware WebGL2. SVG geography and actual routes are checked; hardware globe FPS, mobile multitouch and assistive-technology testing remain unverified.

## Remaining work / explicit limits

1. Connect the user's actual laptop/Symbai checkout; this environment did not expose it. No laptop files were changed.
2. Expand trade reporters, commodities and historical years; systematically validate mirrors and reporter consistency. No complete global matrix is claimed.
3. Resolve GRID and other reuse terms; acquire reusable shipbreaking/e-waste site geometry, additional OSM/industrial registries and catalogued material databases. The 64-entry inventory is broad, not exhaustive of all national or municipal sources.
4. Expose detailed stock-history and EU27 material dimensions beyond the published artifacts and current country views; add licensed regional imagery and MapLibre arrivals.
5. Connect an approved language-model service to the finite tools; automatic data refresh is not configured.
6. Measure production performance on M1 and modern phones, test WebGL interaction and perform assistive-technology review.

### Source archive transport

The source repository rejects large individual Git objects. All new snapshots above 6 MB are preserved as lossless gzip parts of at most 6 MB under `packages/overshoot-data/snapshot-parts`. The manifest records original paths, byte counts, original SHA-256 and each part checksum. `restore_snapshots.py` reconstructs and verifies original files; the v2 publisher calls it automatically. Existing source manifests continue to identify the original uncompressed files. Browser artifacts are unchanged. Every stored part was reconstructed and checked against its original source before publication.

## Release 3 — destinations and map stability (19 September 2026)

This release adds source-native waste treatment geography and makes Discard open on **Where scrap goes**. Comtrade reporter/commodity coverage remains explicitly partial: receiving scrap establishes a country destination, not dumping, completed recycling or a receiving facility. Routes have selectable origin/destination labels; directional markers show direction only. Width encodes square-root tonnes within the active selection. The selected route can open the receiving country's separate treatment account; no join asserts the shipment received that treatment. Physical-site inspection now exposes exact source coordinates and an OpenStreetMap location link.

### New acquired accounts

- **Eurostat env_wastrt:** 584 country/year/scope groups, 35 national geographies plus two EU aggregates, 2004–2022, source updated September 2025. Source-native all-waste and excluding-major-mineral views remain separate. Treatment inside a country includes imports and excludes exports. Six exclusive leaves preserve recycling, backfilling, energy recovery, non-energy incineration, land disposal and other disposal; combined parent categories are used once only when a complete child split is unavailable.
- **Eurostat env_waseleeos:** 184 groups, 31 reporting countries plus EU aggregate, 2018–2023. Thirty countries have treatment quantities; Bosnia contributes market/generation only. Treatment locations are national, elsewhere in the EU, outside the EU. Germany's published national cell incorporates confidential exports: its geographic split is withheld in the interface. Hungary describes first treatment rather than final fate. Other country notes remain visible.
- Together the canonical dataset contains **20,502 source cells: 20,450 numeric and 52 confidential missing cells**. Unit `T` is metric tonnes. Exact JSON-stat source cell IDs, original units, flags, raw snapshots, hashes and Parquet are retained in `packages/overshoot-data/expanded/destinations`. Reuse follows Eurostat's attribution and geographic exceptions; UK/Kosovo are excluded from new public data.
- The source registry now has **67 entries: 28 available, 5 partial, 14 catalogued, 20 blocked**. These include methodology references, not 33 complete global databases. Sources and the two new treatment artifacts live under `public/data/v3`; unchanged extraction/trade/stock/site artifacts are inherited from v2 by SHA-256 in the v3 manifest.

### Concrete reuse correction

Basel's current Terms of Use do not grant derivative compilation/commercial redistribution permission. The source is now blocked for quantitative republication. All prior public Basel JSON route/detail assets are withdrawn; the raw national reports and adapters remain in private source/audit storage. The finite tools and interface return an explicit unavailable state. The official 2025 manual confirms destination codes describe intended operations, not audited completion. Legacy D1–15/R1–13 apply to 2023–24; the 2025 amendment takes effect in 2030. Methodology, exact terms and validation live in `expanded/basel-methods`.

The prior Eurostat municipal Kosovo observations are also withheld under the publisher's geographic reuse exception. The amended country shard and latest-metric artifact live in v3, and their old public paths are withdrawn. No other v2 quantities are silently rewritten. `build_expansion.py` now invokes `build_release.py`, which enforces these publication gates after reconstruction.

### Interaction and resilience

Camera flights follow the shortest longitude path, cancel immediately on direct manipulation, and commit settled views to the URL. Geographic bounds and zoom are clamped. A camera conversion compensates deck.gl's latitude-dependent Mercator zoom and perspective radius so the atlas camera retains angular scale across latitude/resize. A stable GlobeView controller is reused. SVG dragging and two-pointer pinch are supported; source-country menus and keyboard rotation remain alternatives. A graphics failure boundary preserves the geographic fallback. Actual GPU/touch behavior still requires device verification.

Flow animation updates SVG marker coordinates independently of expensive geography; the GPU direction layer runs at 20 Hz. Animation stops when hidden, respects reduced motion and has a visible pause button. Scene entry renders its URL-selected shell on the server, avoiding the initial extraction-to-other-scene flash. Geographic data starts loading concurrently with extraction data; waste metrics are not fetched for route/treatment views. Failed source fetches show unavailable states.

### Verification and measured limits

- Strict TypeScript passes. Nineteen TypeScript tests pass, including date-line flight, GPU zoom round trips across latitude/phone dimensions, exclusive treatment categories, native source cells, actual Ireland values, deep-linked destinations and restricted-publication checks.
- Four new Python tests validate every normalized cell/flag against pinned originals, missing/confidential handling, geographic exceptions, hashes and Parquet. Offline normalization was byte-identical.
- Desktop: actual Japan→Malaysia route selection, directional map, receiving-country unavailable state and Ireland WEEE treatment verified. Phone frames: 390×844 and 412×915; document widths 375 and 397 respectively (reserved scrollbars), no horizontal overflow in the tested destination entry. Phone waste-stream selection and the Germany WEEE geographic-withholding message also verified.
- One simultaneous warm development phone run before the geographic prefetch optimization measured FCP 416/716 ms; extraction readiness 1,412/2,415 ms; geographic fallback ready 4,192/4,187 ms. These are observations of a shared development environment, not claims of production performance or 60 fps. Hardware WebGL, real multi-touch and M1 GPU rates remain unverified.
- New gzip payloads: treatment **45,887 bytes**, WEEE treatment **18,871**, registry **28,737**, latest country metrics **67,441**. New sources are lazy-loaded and raw research tables never enter the browser.

### Domain

`overshoot.gaiaai.xyz` is attached to the existing Site. DNS is hosted at Cloudflare. Provider status is pending DNS/SSL validation; the browser's Cloudflare security verification prevented editing its records. Three exact DNS records were returned by the hosting provider (CNAME plus two TXT verification records). Do not claim the custom hostname is active until native domain verification reports active. The prior release was owner-only. The user’s original brief describes a public proof of concept; the current request asks to publish the atlas to the custom domain. Audience changes are applied through the hosting access policy only after the updated, publication-filtered artifacts are deployed. Domain attachment itself does not alter access.

Final production build succeeded (Vinext/Vite). The optional WebGL chunk retains the bundler’s large-chunk advisory; no extra raw datasets were added to the browser. The temporary QA route is absent from the production route table. All 67 registry entries pass the required-field and unique-ID contract.

## v6 material / regional exploration draft (2026-09-20)

Implemented additive `/materials` and `/region` working surfaces: copper forms, reporting economy, arrivals/departures, optional labelled source-estimated weights, BC product search and material families, native-unit quantities, quantity-scaled map links, accessible partner list, record/source inspection, CSV export, URL filters, Salt Spring collection evidence and explicit downstream gaps.

Acquired 19,205 BC annual destination records / 3,140 product-unit selections and 4,830 nonestimated copper routes + 468 separately estimated routes. Read `packages/overshoot-data/release6/README.md` for exact source scope, normalization, licenses, source archives and remaining work. Typed supplemental sources are in `release6/sources.ts`. Browser artifacts total 1,001,614 bytes before the manifest itself; compressed country/chapter shards avoid whole-source browser loading.

**Publication blocked:** current Git source at 055c34825f978ec9d9b2ac016fd666c2499002c2 repeatedly returned HTTP500 during fetch, as did its v5 parent. Older commit 658538de78af9b9c2a34bec6735ac2f4282212a3 was recoverable. New files were authored and tested against that recovered checkout, preserved as an additive branch; no main overwrite or rollback deployment. Latest live v5 application remains intact. Integration instructions are in the v6 README. This is not a new published release.

Validation: TypeScript passed; five domain/artifact tests passed (all publication hashes, native-unit isolation, BC copper assay basis, direction/estimate filtering, URL round trips). Production build passed on recovered checkout. Browser confirmed BC China source inspection, six copper forms, source-estimated China record, incoming scrap direction. Responsive frames at 390 and 412px (content375/397 with scrollbars) showed equal scroll/client widths; mobile screenshot reviewed. No device GPU or 60fps measurement claimed. Full regression against latest v5 source remains required before publication.

## v7 accessible waste-journey review (2026-09-20)

Added `/journey`: eight material types, four stages, general explanation beside explicitly scoped local evidence, distinct learning/research modes, technical depth, source inspection, 2024/2025 end-market comparisons, source-preserving CSV/JSON exports and URL state including search. Mobile uses a compact material selector instead of pushing results below eight large buttons. Source-modal positioning was fixed after browser QA identified an off-screen close control. Material/regional draft navigation links to the new journey.

The separate release7 data package contains 19 attributed narrative records and 20 source references, including visually inspected Recycle BC reports, the June 2026 network transition, Salt Spring collection, Hartland gas/leachate/cover pathways, CRD organics and EPRA processing. Percentages are geography, not capture yields; intermediate processing is not final recycling; forecasts are not plotted as observations. Raw source lineage, hashes, extraction decisions, reuse terms and gaps are documented in `packages/overshoot-data/release7/README.md` and its research package.

Validation: ten targeted data/state tests and strict TypeScript pass. Production build passes, with the pre-existing large optional atlas chunk warning. Browser checked desktop and 390/412 px mobile frames, source-modal dismissal, place/material/stage changes, research filtering, native export payloads and shared state. No horizontal document overflow in the measured mobile views. The self-contained HTML review is 420,775 bytes with all evidence embedded. It runs without source API calls. Bundle sizes and precise verification limits are recorded in the release README; no new production first-paint/FPS claim.

Publication remains blocked: fetching the current source returned server HTTP500 again. The live app is untouched. New work is saved on the additive branch and a functioning portable review has been provided. A current source checkout/archive is needed to integrate both drafts and reproduce the user's reported live control failures; deploying the recovered old base would discard newer live work.
