# OVERSHOOT source and method register
Reviewed 22 September 2026. These are fixed snapshots, not live feeds.

## EIA International Energy Statistics
Status: Imported snapshot
https://www.eia.gov/opendata/index.php

15 annual measures. Crude oil and NGL production through 2025; gas and coal through 2024. Broader oil-use coverage in 2024.

Download the public INTL.zip bulk JSON; filter exact product/activity/unit/frequency series. Retain original country series IDs, missing markers and update dates. No API key is needed for the bulk file.

Public-domain EIA data; all selected series declare copyright None. Acknowledge EIA and publication date.

Production, consumption, trade and reserves are different measures. The annual API does not supply observation-level estimate flags. Regional series with country-like geography fields must be excluded to prevent duplication.

## JODI Oil World Database
Status: Imported snapshot
https://www.jodidata.org/oil/database/data-downloads.aspx

Five monthly measures, January 2025–June 2026 in the acquired files. Reporting differs by country and month.

Download primary oil CSV files for each year. Select explicit product, flow and unit combinations. Preserve the assessment code and non-numeric source marker.

Freely downloadable; attribute IEF, Joint Organizations Data Initiative, Oil World Database and access date.

KBD is a rate, not a monthly volume. Several Gulf countries have no recent numeric submissions. Keep JODI monthly records separate from EIA annual estimates.

## JODI Gas World Database
Status: Access incomplete
https://www.jodidata.org/gas/database/data-downloads.aspx

Monthly participating-country gas records. The present app uses EIA annual gas data instead.

Use the publisher’s CSV export with NATGAS, INDPROD, imports/exports, LNG and pipeline dimensions. The current download page describes free CSV access but exposes no CSV link in the retrieved page.

Publisher attribution required; retain the source release and its terms.

No gas CSV has been acquired in this release. Do not infer LNG tonnes from gaseous volume or combine LNG and pipeline subcategories with their totals.

## Our World in Data energy data & ETL
Status: Access checked · not imported
https://github.com/owid/energy-data

Useful harmonized country histories and cross-checks; not imported here as a second competing production series.

Read the CSV and codebook; use the published ETL to trace each variable to EIA, Energy Institute or another original publisher. Codebook access was checked.

OWID-created work is CC BY; underlying third-party source rights still apply.

Many production variables are TWh of energy content. They must not be labelled tonnes or barrels. Latest year varies by variable.

## Energy Institute Statistical Review
Status: Access incomplete
https://www.energyinst.org/statistical-review/resources-and-data-downloads

Annual country and regional tables; recent edition access has not been completed.

Use the official annual spreadsheet and definitions; pin the edition and sheet/cell references. The 2026 download is behind an email-verification form. The archive lists a public 2025 workbook.

Review the edition’s terms and any third-party reserve sources before republication.

Do not bypass the email gate. Proven reserves, resources, annual production and capacity have different definitions; regional aggregates must remain regional.

## USGS Mineral Commodity Summaries
Status: Access incomplete
https://doi.org/10.5066/P1WKQ63T

The 2026 data release describes over 90 nonfuel commodities, with US statistics and world production tables. Not imported.

Resolve the official DOI, acquire the ScienceBase CSV tables and their XML metadata, retain table footnotes and exact unit/basis. DOI metadata was acquired; the data host returned HTTP 403.

The DOI metadata identifies the data release as CC0 1.0.

A valid open licence does not solve the current download failure. Do not replace mine output with refined output, gross ore mass or a report’s regional Other subtotal.

## BGS World Mineral Statistics API
Status: Rights review needed
https://www.bgs.ac.uk/mineralsuk/statistics/world-mineral-statistics/

API records extend back to 1970; metadata may lag the newest yearbook. Not imported.

Use OGC API Features with commodity, country and year filters, pagination and retained source fields. A one-record JSON request succeeded. Follow the publisher’s example notebook.

BGS terms permit specified non-commercial research uses; commercial use or supply to third parties requires checking permission with the rights owner.

An accessible API is not an unrestricted republication licence. BGS also documents flag-loss in the API representation; estimates and small/missing values need the original yearbook notes.

## Global Energy Monitor trackers
Status: Access incomplete
https://globalenergymonitor.org/projects/global-oil-gas-extraction-tracker/

The oil/gas extraction tracker describes a March 2026 release. No tracker export was acquired in this release.

Acquire the official dated tracker export; keep unit IDs, source wiki links, operating status, production year and location-accuracy category. Review export terms before import.

Verify and retain the licence supplied with the actual export; website availability alone is insufficient.

Size thresholds exclude smaller assets. Some locations are only country-level placeholders: these must never appear as exact field coordinates.

## FAOSTAT production & forestry
Status: Imported snapshot
https://www.fao.org/faostat/en/#data/QCL

Release 15 adds 394,404 source-preserved annual production observations across 84 selected food, forestry and natural-fibre products, within 1970–2024. Product years differ.

Use the official bulk index to select a dated normalized archive. Retain item/element codes, M49 geography, unit, source flag and note. Expand to additional crops, fibres and livestock products by explicit item code.

CC BY 4.0 and FAO Statistical Database terms, including third-party exceptions.

Products at different processing stages overlap. Timber m³ cannot be converted to tonnes without a density basis; heads of animals cannot be treated as meat tonnage.

## UNEP IRP Global Material Flows
Status: Imported snapshot
https://www.resourcepanel.org/global-material-flows-database

1970–2024 country material histories. Recent years are proxy estimates. Four broad extraction classes do not identify individual minerals.

Retain official country-account CSV exports and original material classifications. Keep direct-flow accounts and modelled footprints separate.

Public export; no explicit general reuse licence identified in the reviewed source. Attribution is retained; additional redistribution should be reviewed.

All metal ores is not copper production; all non-metallic minerals is not cement. Never invent a refined-metal conversion or a balanced global trade total.

## UN Comtrade API & official Python client
Status: Imported snapshot
https://comtradeplus.un.org/

10,514 retained bilateral export observations for 2024 across 31 reporting economies and 23 HS4 products. Coverage differs by product; this is not a complete world matrix. Detailed copper import reports remain separate.

Query the official public API by reporter, year, HS4 product and export flow. Split any response reaching the 500-row cap. Retain source URLs, hashes, native kilograms, estimate flags and HS revision; publish positive non-estimated net weights. The release adds 192 reviewed requests. Empty queries are coverage gaps, not zero-trade observations.

UN Comtrade usage agreement; no blanket Creative Commons licence is asserted. Some bulk access needs a subscription.

Public preview responses can be capped. Mirror imports and exporter reports can disagree; never silently combine them. Country links are not vessel tracks or final destinations.

## CEPII BACI
Status: Access incomplete
https://www.cepii.fr/DATA_DOWNLOAD/baci/doc/baci_webpage.html

A potential broader annual trade matrix. Official page returned HTTP 403 in this environment; no files acquired.

Download the official HS-revision-specific release plus country and product codes. Keep the release identifier and document BACI’s reconciliation method.

Check the actual release terms and UN Comtrade-derived reuse conditions before redistribution.

Reconciled quantities are not original exporter reports. They are not proof of final disposal or vessel movements, and must not replace observed weights without a clear label.

## World Bank What a Waste 3.0
Status: Imported snapshot
https://datacatalog.worldbank.org/search/dataset/0039597/what-a-waste-global-database

217 countries/economies and 262 city records already imported.

Download the country and city workbooks with codebooks. Retain field-level original references, dates, methods and notes; validate fractions, percentages and allowed ranges.

CC BY 4.0 with attribution to the World Bank and original field sources.

City areas and observation years differ. Waste sent for recycling does not measure recovered output. Projections and modelled baselines remain separate from observations.

## UN SDG API
Status: Imported snapshot
https://unstats.un.org/sdgs/dataportal

Selected source series already imported. Some e-waste data are modelled and later years can be projections.

Read Series/Data with complete pagination. Preserve series code, source, nature/estimate flags, footnotes, dimensions and reference period; map only actual country codes.

UN statistical-data terms and original agency attribution; no generic CC licence inferred.

Series with different denominators or scopes are not interchangeable. An aggregate region is not a country observation.

## Eurostat waste statistics
Status: Imported snapshot
https://ec.europa.eu/eurostat/web/waste/database

European reporting countries; existing app includes municipal, packaging, all-sector treatment and e-waste series.

Use the official JSON-stat/SDMX API with dataset-specific dimensions and status flags. Preserve sparse cells, hazardous-waste scope and operation hierarchy.

Eurostat attribution policy with third-country/third-party exceptions; existing public output excludes restricted geographies.

Treatment inside a country can include imported waste. Combined categories overlap with their children. Confidential splits must remain unknown.

## OECD Global Plastics Outlook
Status: Imported snapshot
https://doi.org/10.1787/c0821f81-en

Current snapshot covers 1990–2019, with only a few geographies that map directly to individual countries.

Retain the source model tables and native geographic groups. Keep historical estimates separate from scenario projections and record the version.

OECD terms with attribution and third-party exceptions.

Global model regions cannot be coloured as if every member country had an observed national recycling rate. No new country values have been inferred here.

## Basel national reports
Status: Imported snapshot
https://www.basel.int/Countries/NationalReporting/NationalReports/BC2024Reports/tabid/10394/Default.aspx

Existing source covers reporting sections, not universal shipment tracking.

Parse national report sections by reporting country and year. Keep waste code, destination, amount, unit and recovery/disposal code together; retain a reference to the original report.

Original reporting and convention sources must be attributed. No blanket open licence inferred.

A permitted/reported movement is not proof of delivery or successful treatment. D/R operation codes have legal versions and cannot be treated as recycling percentages.

## Official regional & municipal data
Status: Imported snapshot
https://catalogue.data.gov.bc.ca/

Detailed BC disposal areas and Canadian product trade are already retained. Other locales vary in public reporting depth.

Use each publisher’s versioned CSV/API, area codes and definitions. BC and Statistics Canada provide the current regional examples; every additional jurisdiction needs an explicit adapter.

Dataset-specific licences; Canadian and BC open-data attribution where applicable.

No universal public feed connects every household to its final processor. Facility capacity, collected mass and recovered output must remain distinct.

## OpenStreetMap / Overpass
Status: Rights review needed
https://www.openstreetmap.org/copyright

Potential location enrichment; not a throughput or operating-status census. No new OSM facility records imported here.

Query explicitly tagged facilities within bounded areas; retain OSM type/ID, timestamp, tags and attribution. Apply an ODbL-compatible database/reuse design before importing.

Open Database Licence; derivative database and attribution obligations require deliberate handling.

A map tag or nearby point does not prove a material connection. Avoid unbounded global Overpass queries and do not label inferred coordinates as exact.

## Canada · solid-waste infrastructure
Status: Imported snapshot
https://www150.statcan.gc.ca/n1/pub/34-26-0003/342600032023001-eng.htm

Canadian source records compiled October 2023–June 2024; geographic coverage varies.

All 9,074 source locations. Transform EPSG:3347 to WGS84; preserve provider, original ID, classification and status. Missing names are labeled by source class.

Open Government Licence – Canada

Location records do not include waste throughput or verified downstream destinations. Several providers may describe the same physical site; counts are source records, not a deduplicated national facility census. The mixed category includes waste infrastructure whose exact role is unspecified.

## Canada · oil and gas facilities
Status: Imported snapshot
https://www150.statcan.gc.ca/n1/pub/34-26-0003/342600032023001-eng.htm

All records classified as facilities in ODI. Wells and pipelines are separate categories and excluded from this layer.

Transform EPSG:3347 to WGS84. Preserve native facility class, operating status, ownership and original ID. A representative point is used only for non-point facility geometry and labeled.

Open Government Licence – Canada

Location and operating status describe the source snapshot, not current production. The source does not supply oil or gas throughput per facility. Provider overlap is retained; records are not claimed to be unique physical sites.

## HydroWASTE · treatment plants
Status: Imported snapshot
https://www.hydrosheds.org/products/hydrowaste

58,502 treatment-plant records. Coverage and underlying source dates vary by country.

Retain all source rows and all quality codes. Reported treatment, design capacity, unspecified reports and modeled effluent are separate measurement bases. Source population and treatment quality codes remain explicit.

CC BY 4.0

The dataset does not provide an observation year for each plant. Liquid volume cannot be added to solid-waste mass. Source estimates have no per-plant statistical interval. Outfall coordinates are estimated and distinct from plant coordinates.

## Global mining land · mapped footprints
Status: Imported snapshot
https://doi.org/10.1594/PANGAEA.942325

All 44,929 polygons from the source study. Study search zones are not an exhaustive world mine census.

Use the original area in km² and a representative point inside each mining polygon. Retain the source polygon ID. Derived mining records are shared under CC BY-SA 4.0.

CC BY-SA 4.0

Footprints include pits, tailings, waste rock, ponds and processing areas. A footprint does not identify a mine operator, commodity, production or current operating status.

## US landfills · waste acceptance
Status: Imported snapshot
https://www.epa.gov/lmop/landfill-technical-data

2,323 geolocated records of 2,641 source records. Missing coordinates are excluded; LMOP does not include every US landfill.

Annual source short tons × exactly 0.90718474 = metric tonnes. Preserve each measurement year; missing intake or reporting year remains null.

US government public data

This is a voluntary program database, not a full US landfill census. Annual intake reports have different years and cannot be summed into a same-year national total.

## River plastic · modeled emissions
Status: Imported snapshot
https://doi.org/10.6084/m9.figshare.14515590.v1

All 31,819 modeled outfalls in the retained source.

Retain original tonnes/year and outfall coordinates. Countries absent in the source remain unassigned; no nearest-country substitution.

CC BY 4.0

These are model estimates, not observed shipments or measured discharges. Per-outfall uncertainty intervals and most river names are absent. Most country assignments are unavailable in the source.

## Global Power Plant Database · archived baseline
Status: Imported snapshot
https://github.com/wri/global-power-plant-database

34,936 source records across 167 countries. WRI states that the project is no longer maintained; this is a historical baseline, not a current operating inventory.

Retain every source row, native plant ID, primary and secondary fuels, capacity in MW, capacity observation year, original provider URLs and all annual generation fields. Reported GWh and modeled GWh remain separate original fields.

CC BY 4.0

Capacity in MW is a rated power level, not annual energy production. Current operating status and recent additions or closures are not supplied. Location and capacity accuracy vary by contributing provider. Primary fuel does not establish a complete annual fuel mix. Generation may use calendar, fiscal or regulatory years.

## Climate TRACE · global industrial sources
Status: Imported snapshot
https://climatetrace.org/data

124,954 retained geolocated point-source records across selected waste, power, mining, oil/gas and manufacturing subsectors. Administrative aggregates are excluded.

Retain native point-source centroids, identifiers and 2025 inventory estimates. CO₂e uses IPCC AR6 100-year global warming potentials. Upstream activity fields marked license restricted are unavailable, not zero. Original API pages and hashes are retained. The release 15 extension removes only byte-equivalent repeated source IDs from API pagination. All original pages and hashes remain available.

CC BY 4.0; listed external-source exceptions

Emissions combine models and public reports. The summary API does not provide a per-record measurement method or uncertainty interval. Tonnes of CO₂e describe climate impact, not tonnes of waste handled or material produced. Point-source centroids can represent a production area or complex; they are not guaranteed building-level coordinates. Names may be descriptive labels assigned by the provider. Overlap with other source inventories is retained. Selected subsectors and source coverage do not form a complete census of operating facilities. Offset pagination repeats some identical rows at tied sort values. Identical IDs are deduplicated; conflicting versions stop the import. Completeness beyond the retained API response is not claimed.

## NASA GIBS · satellite and environmental context
Status: Live visualization service
https://nasa-gibs.github.io/gibs-api-docs/

Global Mercator imagery to ±85.05°. Terra MODIS true colour, Blue Marble relief/bathymetry, monthly NDVI and Aqua MODIS chlorophyll-a.

Verified WMTS identifiers, dates and native resolutions from retained capabilities. Request tiles for the selected layer/date. The MCP returns layer metadata and geographic image URLs.

NASA Earth Science data policy; attribution to NASA GIBS / MODIS.

Imagery is not extracted numerical biogeophysical data. Chlorophyll does not detect plastic, NDVI cannot identify a cause, and zooming does not increase native resolution.

## FAOSTAT · production histories
Status: Imported snapshot
https://www.fao.org/faostat/en/#data/QCL

394,404 observations; 38 forest products, 33 food products and 13 natural-fibre or animal-material inputs. Product-specific years differ; cotton lint ends in 2023.

Retain source Production rows for 84 selected products, 1970–2024. Products are separate series; retain tonnes or cubic metres, original flags, notes, CSV row and original archive hash. No interpolation or parent/child aggregation.

CC BY 4.0; FAO statistical-database terms apply.

Source estimates and imputed values are retained with flags. Former-country and regional aggregates are not mapped. Outputs and inputs can overlap; do not sum them.

## World Mining Data · mineral production
Status: Rights review needed
https://www.bmf.gv.at/en/topics/mining/mineral-resources-policy/wmd.html

Publisher describes 65 commodities and 168 countries. Not integrated.

The publisher supplies 2026 Excel tables for 2020–2024 and a methodology report. Tables were discovered; no rows are imported into OVERSHOOT.

The publication permits attributed extracts, while the website terms restrict republication on other websites. Reuse scope needs resolution before a database import.

Do not substitute gross ore tonnage or estimated site emissions for contained-metal production.
