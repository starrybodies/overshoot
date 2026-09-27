# OVERSHOOT source and method register · release 16

Reviewed 23 September 2026. Data records are reviewed release snapshots. NASA imagery is requested directly from its visualization service for the displayed date.

## EIA International Energy Statistics

15 annual measures. Crude oil and NGL production through 2025; gas and coal through 2024. Broader oil-use coverage in 2024.

- Status: Imported snapshot
- Source: https://www.eia.gov/opendata/index.php
- Acquisition: Download the public INTL.zip bulk JSON; filter exact product/activity/unit/frequency series. Retain original country series IDs, missing markers and update dates. No API key is needed for the bulk file.
- Reuse: Public-domain EIA data; all selected series declare copyright None. Acknowledge EIA and publication date.
- Limits: Production, consumption, trade and reserves are different measures. The annual API does not supply observation-level estimate flags. Regional series with country-like geography fields must be excluded to prevent duplication.

## JODI Oil World Database

Five monthly measures, January 2025–June 2026 in the acquired files. Reporting differs by country and month.

- Status: Imported snapshot
- Source: https://www.jodidata.org/oil/database/data-downloads.aspx
- Acquisition: Download primary oil CSV files for each year. Select explicit product, flow and unit combinations. Preserve the assessment code and non-numeric source marker.
- Reuse: Freely downloadable; attribute IEF, Joint Organizations Data Initiative, Oil World Database and access date.
- Limits: KBD is a rate, not a monthly volume. Several Gulf countries have no recent numeric submissions. Keep JODI monthly records separate from EIA annual estimates.

## JODI Gas World Database

Monthly participating-country gas records. The present app uses EIA annual gas data instead.

- Status: Access incomplete
- Source: https://www.jodidata.org/gas/database/data-downloads.aspx
- Acquisition: Use the publisher’s CSV export with NATGAS, INDPROD, imports/exports, LNG and pipeline dimensions. The current download page describes free CSV access but exposes no CSV link in the retrieved page.
- Reuse: Publisher attribution required; retain the source release and its terms.
- Limits: No gas CSV has been acquired in this release. Do not infer LNG tonnes from gaseous volume or combine LNG and pipeline subcategories with their totals.

## Our World in Data energy data & ETL

Useful harmonized country histories and cross-checks; not imported here as a second competing production series.

- Status: Access checked · not imported
- Source: https://github.com/owid/energy-data
- Acquisition: Read the CSV and codebook; use the published ETL to trace each variable to EIA, Energy Institute or another original publisher. Codebook access was checked.
- Reuse: OWID-created work is CC BY; underlying third-party source rights still apply.
- Limits: Many production variables are TWh of energy content. They must not be labelled tonnes or barrels. Latest year varies by variable.

## Energy Institute Statistical Review

Annual country and regional tables; recent edition access has not been completed.

- Status: Access incomplete
- Source: https://www.energyinst.org/statistical-review/resources-and-data-downloads
- Acquisition: Use the official annual spreadsheet and definitions; pin the edition and sheet/cell references. The 2026 download is behind an email-verification form. The archive lists a public 2025 workbook.
- Reuse: Review the edition’s terms and any third-party reserve sources before republication.
- Limits: Do not bypass the email gate. Proven reserves, resources, annual production and capacity have different definitions; regional aggregates must remain regional.

## USGS Mineral Commodity Summaries

The 2026 data release describes over 90 nonfuel commodities, with US statistics and world production tables. Not imported.

- Status: Access incomplete
- Source: https://doi.org/10.5066/P1WKQ63T
- Acquisition: Resolve the official DOI, acquire the ScienceBase CSV tables and their XML metadata, retain table footnotes and exact unit/basis. DOI metadata was acquired; the data host returned HTTP 403.
- Reuse: The DOI metadata identifies the data release as CC0 1.0.
- Limits: A valid open licence does not solve the current download failure. Do not replace mine output with refined output, gross ore mass or a report’s regional Other subtotal.

## BGS World Mineral Statistics API

API records extend back to 1970; metadata may lag the newest yearbook. Not imported.

- Status: Rights review needed
- Source: https://www.bgs.ac.uk/mineralsuk/statistics/world-mineral-statistics/
- Acquisition: Use OGC API Features with commodity, country and year filters, pagination and retained source fields. A one-record JSON request succeeded. Follow the publisher’s example notebook.
- Reuse: BGS terms permit specified non-commercial research uses; commercial use or supply to third parties requires checking permission with the rights owner.
- Limits: An accessible API is not an unrestricted republication licence. BGS also documents flag-loss in the API representation; estimates and small/missing values need the original yearbook notes.

## Global Energy Monitor trackers

The oil/gas extraction tracker describes a March 2026 release. No tracker export was acquired in this release.

- Status: Access incomplete
- Source: https://globalenergymonitor.org/projects/global-oil-gas-extraction-tracker/
- Acquisition: Acquire the official dated tracker export; keep unit IDs, source wiki links, operating status, production year and location-accuracy category. Review export terms before import.
- Reuse: Verify and retain the licence supplied with the actual export; website availability alone is insufficient.
- Limits: Size thresholds exclude smaller assets. Some locations are only country-level placeholders: these must never appear as exact field coordinates.

## FAOSTAT production & forestry

Release 15 adds 394,404 source-preserved annual production observations across 84 selected food, forestry and natural-fibre products, within 1970–2024. Product years differ.

- Status: Imported snapshot
- Source: https://www.fao.org/faostat/en/#data/QCL
- Acquisition: Use the official bulk index to select a dated normalized archive. Retain item/element codes, M49 geography, unit, source flag and note. Expand to additional crops, fibres and livestock products by explicit item code.
- Reuse: CC BY 4.0 and FAO Statistical Database terms, including third-party exceptions.
- Limits: Products at different processing stages overlap. Timber m³ cannot be converted to tonnes without a density basis; heads of animals cannot be treated as meat tonnage.

## UNEP IRP Global Material Flows

1970–2024 country material histories. Recent years are proxy estimates. Four broad extraction classes do not identify individual minerals.

- Status: Imported snapshot
- Source: https://www.resourcepanel.org/global-material-flows-database
- Acquisition: Retain official country-account CSV exports and original material classifications. Keep direct-flow accounts and modelled footprints separate.
- Reuse: Public export; no explicit general reuse licence identified in the reviewed source. Attribution is retained; additional redistribution should be reviewed.
- Limits: All metal ores is not copper production; all non-metallic minerals is not cement. Never invent a refined-metal conversion or a balanced global trade total.

## UN Comtrade API & official Python client

10,514 retained bilateral export observations for 2024 across 31 reporting economies and 23 HS4 products. Coverage differs by product; this is not a complete world matrix. Detailed copper import reports remain separate. Added 2,647 oil import observations from 33 reporting economies. One reporting side is selected per product/year group; imports are not added to matching exports.

- Status: Imported snapshot
- Source: https://comtradeplus.un.org/
- Acquisition: Query the official public API by reporter, year, HS4 product and export flow. Split any response reaching the 500-row cap. Retain source URLs, hashes, native kilograms, estimate flags and HS revision; publish positive non-estimated net weights. The release adds 192 reviewed requests. Empty queries are coverage gaps, not zero-trade observations.
- Reuse: UN Comtrade usage agreement; no blanket Creative Commons licence is asserted. Some bulk access needs a subscription.
- Limits: Public preview responses can be capped. Mirror imports and exporter reports can disagree; never silently combine them. Country links are not vessel tracks or final destinations.

## CEPII BACI

A potential broader annual trade matrix. Official page returned HTTP 403 in this environment; no files acquired.

- Status: Access incomplete
- Source: https://www.cepii.fr/DATA_DOWNLOAD/baci/doc/baci_webpage.html
- Acquisition: Download the official HS-revision-specific release plus country and product codes. Keep the release identifier and document BACI’s reconciliation method.
- Reuse: Check the actual release terms and UN Comtrade-derived reuse conditions before redistribution.
- Limits: Reconciled quantities are not original exporter reports. They are not proof of final disposal or vessel movements, and must not replace observed weights without a clear label.

## World Bank What a Waste 3.0

217 countries/economies and 262 city records already imported.

- Status: Imported snapshot
- Source: https://datacatalog.worldbank.org/search/dataset/0039597/what-a-waste-global-database
- Acquisition: Download the country and city workbooks with codebooks. Retain field-level original references, dates, methods and notes; validate fractions, percentages and allowed ranges.
- Reuse: CC BY 4.0 with attribution to the World Bank and original field sources.
- Limits: City areas and observation years differ. Waste sent for recycling does not measure recovered output. Projections and modelled baselines remain separate from observations.

## UN SDG API

Selected source series already imported. Some e-waste data are modelled and later years can be projections.

- Status: Imported snapshot
- Source: https://unstats.un.org/sdgs/dataportal
- Acquisition: Read Series/Data with complete pagination. Preserve series code, source, nature/estimate flags, footnotes, dimensions and reference period; map only actual country codes.
- Reuse: UN statistical-data terms and original agency attribution; no generic CC licence inferred.
- Limits: Series with different denominators or scopes are not interchangeable. An aggregate region is not a country observation.

## Eurostat waste statistics

European reporting countries; existing app includes municipal, packaging, all-sector treatment and e-waste series.

- Status: Imported snapshot
- Source: https://ec.europa.eu/eurostat/web/waste/database
- Acquisition: Use the official JSON-stat/SDMX API with dataset-specific dimensions and status flags. Preserve sparse cells, hazardous-waste scope and operation hierarchy.
- Reuse: Eurostat attribution policy with third-country/third-party exceptions; existing public output excludes restricted geographies.
- Limits: Treatment inside a country can include imported waste. Combined categories overlap with their children. Confidential splits must remain unknown.

## OECD Global Plastics Outlook

Current snapshot covers 1990–2019, with only a few geographies that map directly to individual countries.

- Status: Imported snapshot
- Source: https://doi.org/10.1787/c0821f81-en
- Acquisition: Retain the source model tables and native geographic groups. Keep historical estimates separate from scenario projections and record the version.
- Reuse: OECD terms with attribution and third-party exceptions.
- Limits: Global model regions cannot be coloured as if every member country had an observed national recycling rate. No new country values have been inferred here.

## Basel national reports

Existing source covers reporting sections, not universal shipment tracking.

- Status: Imported snapshot
- Source: https://www.basel.int/Countries/NationalReporting/NationalReports/BC2024Reports/tabid/10394/Default.aspx
- Acquisition: Parse national report sections by reporting country and year. Keep waste code, destination, amount, unit and recovery/disposal code together; retain a reference to the original report.
- Reuse: Original reporting and convention sources must be attributed. No blanket open licence inferred.
- Limits: A permitted/reported movement is not proof of delivery or successful treatment. D/R operation codes have legal versions and cannot be treated as recycling percentages.

## Official regional & municipal data

Detailed BC disposal areas and Canadian product trade are already retained. Other locales vary in public reporting depth.

- Status: Imported snapshot
- Source: https://catalogue.data.gov.bc.ca/
- Acquisition: Use each publisher’s versioned CSV/API, area codes and definitions. BC and Statistics Canada provide the current regional examples; every additional jurisdiction needs an explicit adapter.
- Reuse: Dataset-specific licences; Canadian and BC open-data attribution where applicable.
- Limits: No universal public feed connects every household to its final processor. Facility capacity, collected mass and recovered output must remain distinct.

## OpenStreetMap / Overpass

Potential location enrichment; not a throughput or operating-status census. No new OSM facility records imported here.

- Status: Rights review needed
- Source: https://www.openstreetmap.org/copyright
- Acquisition: Query explicitly tagged facilities within bounded areas; retain OSM type/ID, timestamp, tags and attribution. Apply an ODbL-compatible database/reuse design before importing.
- Reuse: Open Database Licence; derivative database and attribution obligations require deliberate handling.
- Limits: A map tag or nearby point does not prove a material connection. Avoid unbounded global Overpass queries and do not label inferred coordinates as exact.

## Canada · solid-waste infrastructure

Canadian source records compiled October 2023–June 2024; geographic coverage varies.

- Status: Imported snapshot
- Source: https://www150.statcan.gc.ca/n1/pub/34-26-0003/342600032023001-eng.htm
- Acquisition: All 9,074 source locations. Transform EPSG:3347 to WGS84; preserve provider, original ID, classification and status. Missing names are labeled by source class.
- Reuse: Open Government Licence – Canada
- Limits: Location records do not include waste throughput or verified downstream destinations. Several providers may describe the same physical site; counts are source records, not a deduplicated national facility census. The mixed category includes waste infrastructure whose exact role is unspecified.

## Canada · oil and gas facilities

All records classified as facilities in ODI. Wells and pipelines are separate categories and excluded from this layer.

- Status: Imported snapshot
- Source: https://www150.statcan.gc.ca/n1/pub/34-26-0003/342600032023001-eng.htm
- Acquisition: Transform EPSG:3347 to WGS84. Preserve native facility class, operating status, ownership and original ID. A representative point is used only for non-point facility geometry and labeled.
- Reuse: Open Government Licence – Canada
- Limits: Location and operating status describe the source snapshot, not current production. The source does not supply oil or gas throughput per facility. Provider overlap is retained; records are not claimed to be unique physical sites.

## HydroWASTE · treatment plants

58,502 treatment-plant records. Coverage and underlying source dates vary by country.

- Status: Imported snapshot
- Source: https://www.hydrosheds.org/products/hydrowaste
- Acquisition: Retain all source rows and all quality codes. Reported treatment, design capacity, unspecified reports and modeled effluent are separate measurement bases. Source population and treatment quality codes remain explicit.
- Reuse: CC BY 4.0
- Limits: The dataset does not provide an observation year for each plant. Liquid volume cannot be added to solid-waste mass. Source estimates have no per-plant statistical interval. Outfall coordinates are estimated and distinct from plant coordinates.

## Global mining land · mapped footprints

All 44,929 polygons from the source study. Study search zones are not an exhaustive world mine census.

- Status: Imported snapshot
- Source: https://doi.org/10.1594/PANGAEA.942325
- Acquisition: Use the original area in km² and a representative point inside each mining polygon. Retain the source polygon ID. Derived mining records are shared under CC BY-SA 4.0.
- Reuse: CC BY-SA 4.0
- Limits: Footprints include pits, tailings, waste rock, ponds and processing areas. A footprint does not identify a mine operator, commodity, production or current operating status.

## US landfills · waste acceptance

2,323 geolocated records of 2,641 source records. Missing coordinates are excluded; LMOP does not include every US landfill.

- Status: Imported snapshot
- Source: https://www.epa.gov/lmop/landfill-technical-data
- Acquisition: Annual source short tons × exactly 0.90718474 = metric tonnes. Preserve each measurement year; missing intake or reporting year remains null.
- Reuse: US government public data
- Limits: This is a voluntary program database, not a full US landfill census. Annual intake reports have different years and cannot be summed into a same-year national total.

## River plastic · modeled emissions

All 31,819 modeled outfalls in the retained source.

- Status: Imported snapshot
- Source: https://doi.org/10.6084/m9.figshare.14515590.v1
- Acquisition: Retain original tonnes/year and outfall coordinates. Countries absent in the source remain unassigned; no nearest-country substitution.
- Reuse: CC BY 4.0
- Limits: These are model estimates, not observed shipments or measured discharges. Per-outfall uncertainty intervals and most river names are absent. Most country assignments are unavailable in the source.

## Global Power Plant Database · archived baseline

34,936 source records across 167 countries. WRI states that the project is no longer maintained; this is a historical baseline, not a current operating inventory.

- Status: Imported snapshot
- Source: https://github.com/wri/global-power-plant-database
- Acquisition: Retain every source row, native plant ID, primary and secondary fuels, capacity in MW, capacity observation year, original provider URLs and all annual generation fields. Reported GWh and modeled GWh remain separate original fields.
- Reuse: CC BY 4.0
- Limits: Capacity in MW is a rated power level, not annual energy production. Current operating status and recent additions or closures are not supplied. Location and capacity accuracy vary by contributing provider. Primary fuel does not establish a complete annual fuel mix. Generation may use calendar, fiscal or regulatory years.

## Climate TRACE · global industrial sources

124,954 retained geolocated point-source records across selected waste, power, mining, oil/gas and manufacturing subsectors. Administrative aggregates are excluded.

- Status: Imported snapshot
- Source: https://climatetrace.org/data
- Acquisition: Retain native point-source centroids, identifiers and 2025 inventory estimates. CO₂e uses IPCC AR6 100-year global warming potentials. Upstream activity fields marked license restricted are unavailable, not zero. Original API pages and hashes are retained. The release 15 extension removes only byte-equivalent repeated source IDs from API pagination. All original pages and hashes remain available.
- Reuse: CC BY 4.0; listed external-source exceptions
- Limits: Emissions combine models and public reports. The summary API does not provide a per-record measurement method or uncertainty interval. Tonnes of CO₂e describe climate impact, not tonnes of waste handled or material produced. Point-source centroids can represent a production area or complex; they are not guaranteed building-level coordinates. Names may be descriptive labels assigned by the provider. Overlap with other source inventories is retained. Selected subsectors and source coverage do not form a complete census of operating facilities. Offset pagination repeats some identical rows at tied sort values. Identical IDs are deduplicated; conflicting versions stop the import. Completeness beyond the retained API response is not claimed.

## NASA GIBS · satellite and environmental context

Global Mercator imagery to ±85.05°. Terra MODIS true colour, Blue Marble relief/bathymetry, monthly NDVI and Aqua MODIS chlorophyll-a.

- Status: Live visualization service
- Source: https://nasa-gibs.github.io/gibs-api-docs/
- Acquisition: Verified WMTS identifiers, dates and native resolutions from retained capabilities. Request tiles for the selected layer/date. The MCP returns layer metadata and geographic image URLs.
- Reuse: NASA Earth Science data policy; attribution to NASA GIBS / MODIS.
- Limits: Imagery is not extracted numerical biogeophysical data. Chlorophyll does not detect plastic, NDVI cannot identify a cause, and zooming does not increase native resolution.

## FAOSTAT · production histories

394,404 observations; 38 forest products, 33 food products and 13 natural-fibre or animal-material inputs. Product-specific years differ; cotton lint ends in 2023.

- Status: Imported snapshot
- Source: https://www.fao.org/faostat/en/#data/QCL
- Acquisition: Retain source Production rows for 84 selected products, 1970–2024. Products are separate series; retain tonnes or cubic metres, original flags, notes, CSV row and original archive hash. No interpolation or parent/child aggregation.
- Reuse: CC BY 4.0; FAO statistical-database terms apply.
- Limits: Source estimates and imputed values are retained with flags. Former-country and regional aggregates are not mapped. Outputs and inputs can overlap; do not sum them.

## World Mining Data · mineral production

Publisher describes 65 commodities and 168 countries. Not integrated.

- Status: Rights review needed
- Source: https://www.bmf.gv.at/en/topics/mining/mineral-resources-policy/wmd.html
- Acquisition: The publisher supplies 2026 Excel tables for 2020–2024 and a methodology report. Tables were discovered; no rows are imported into OVERSHOOT.
- Reuse: The publication permits attributed extracts, while the website terms restrict republication on other websites. Reuse scope needs resolution before a database import.
- Limits: Do not substitute gross ore tonnage or estimated site emissions for contained-metal production.

## PortWatch · ports and monthly maritime activity

2,065 ports and terminals across 180 source country/area codes · Twelve historical calendar months, September 2025–August 2026. Not live AIS.

- Status: Imported snapshot
- Source: https://portwatch.imf.org/
- Acquisition: Monthly sums of the public daily port series, grouped by source port ID using ArcGIS statistical queries. Dates, day counts and original port identifiers are retained. Ship classes are container, dry bulk, general cargo, roll-on/roll-off and tanker. Calls are visits, not unique ships.
- Reuse: IMF statistical-data terms; attribution and transformation disclosure required
- Limits: Port calls are derived from AIS and port boundaries. Source transit filters and AIS coverage affect the counts. Cargo tonnes are modeled from vessel draft, deadweight and payload changes; they are not weighed cargo or customs declarations. The vessel class does not establish the commodity, origin, destination or owner of a shipment. A port location may represent a port complex or offshore terminal. Records are not individual berths. This is a reviewed historical snapshot, not a live AIS feed.

## Commercial shipping activity

Global commercial shipping activity; source latitude range approximately 85°S–85°N · January 2015–February 2021

- Status: Imported snapshot
- Source: https://datacatalog.worldbank.org/search/dataset/0037580/global-shipping-traffic-density
- Acquisition: Source hourly AIS position reports, including stationary vessels. Source overviews averaged to a display grid, reprojected to Web Mercator, then averaged for lower zoom levels. Color is a relative visual index, not a quantity of ships or cargo.
- Reuse: CC BY 4.0
- Limits: Historical activity, not live vessel positions. Generalized to a 4,096-pixel-wide world raster; do not interpret individual berths or vessels. AIS coverage varies. Blank cells do not establish that no shipping occurred. Activity is not specific to the material selected in OVERSHOOT.

