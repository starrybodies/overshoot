# OVERSHOOT source and method register

Reviewed 2026-09-22. Data records are reviewed release snapshots. NASA imagery is requested directly from its visualization service for the displayed date.

## EIA International Energy Statistics

Status: Imported snapshot

15 annual measures. Crude oil and NGL production through 2025; gas and coal through 2024. Broader oil-use coverage in 2024.

Method: Download the public INTL.zip bulk JSON; filter exact product/activity/unit/frequency series. Retain original country series IDs, missing markers and update dates. No API key is needed for the bulk file.

Refresh: Check the bulk manifest weekly; rebuild the complete selected history when its hash changes. OVERSHOOT currently publishes reviewed snapshots.

Reuse: Public-domain EIA data; all selected series declare copyright None. Acknowledge EIA and publication date.

Limits: Production, consumption, trade and reserves are different measures. The annual API does not supply observation-level estimate flags. Regional series with country-like geography fields must be excluded to prevent duplication.

Publisher: https://www.eia.gov/opendata/index.php
downloadUrl: https://www.eia.gov/opendata/bulk/INTL.zip
metadataUrl: https://www.eia.gov/opendata/bulk/manifest.txt
termsUrl: https://www.eia.gov/about/copyrights_reuse.php

## JODI Oil World Database

Status: Imported snapshot

Five monthly measures, January 2025–June 2026 in the acquired files. Reporting differs by country and month.

Method: Download primary oil CSV files for each year. Select explicit product, flow and unit combinations. Preserve the assessment code and non-numeric source marker.

Refresh: Check after each monthly release; re-download current and previous annual files because historical months can change.

Reuse: Freely downloadable; attribute IEF, Joint Organizations Data Initiative, Oil World Database and access date.

Limits: KBD is a rate, not a monthly volume. Several Gulf countries have no recent numeric submissions. Keep JODI monthly records separate from EIA annual estimates.

Publisher: https://www.jodidata.org/oil/database/data-downloads.aspx
downloadUrl: https://www.jodidata.org/_resources/files/downloads/oil-data/annual-csv/primary/primaryyear2026.csv
metadataUrl: https://www.jodidata.org/_resources/files/downloads/oil-data/jodi-oil-wdb-item-names-ver2017.pdf

## JODI Gas World Database

Status: Access incomplete

Monthly participating-country gas records. The present app uses EIA annual gas data instead.

Method: Use the publisher’s CSV export with NATGAS, INDPROD, imports/exports, LNG and pipeline dimensions. The current download page describes free CSV access but exposes no CSV link in the retrieved page.

Refresh: Monthly; acquire an official export before building an importer.

Reuse: Publisher attribution required; retain the source release and its terms.

Limits: No gas CSV has been acquired in this release. Do not infer LNG tonnes from gaseous volume or combine LNG and pipeline subcategories with their totals.

Publisher: https://www.jodidata.org/gas/database/data-downloads.aspx
metadataUrl: https://www.jodidata.org/_resources/files/downloads/gas-data/jodi-gas-wdb-short--long-names-ver2025.pdf

## Our World in Data energy data & ETL

Status: Access checked · not imported

Useful harmonized country histories and cross-checks; not imported here as a second competing production series.

Method: Read the CSV and codebook; use the published ETL to trace each variable to EIA, Energy Institute or another original publisher. Codebook access was checked.

Refresh: Track repository releases/commits; pin the codebook and data together.

Reuse: OWID-created work is CC BY; underlying third-party source rights still apply.

Limits: Many production variables are TWh of energy content. They must not be labelled tonnes or barrels. Latest year varies by variable.

Publisher: https://github.com/owid/energy-data
repo: https://github.com/owid/etl
downloadUrl: https://owid-public.owid.io/data/energy/owid-energy-data.csv
metadataUrl: https://github.com/owid/energy-data/blob/master/owid-energy-codebook.csv

## Energy Institute Statistical Review

Status: Access incomplete

Annual country and regional tables; recent edition access has not been completed.

Method: Use the official annual spreadsheet and definitions; pin the edition and sheet/cell references. The 2026 download is behind an email-verification form. The archive lists a public 2025 workbook.

Refresh: Annual edition; revalidate historical revisions and reuse terms.

Reuse: Review the edition’s terms and any third-party reserve sources before republication.

Limits: Do not bypass the email gate. Proven reserves, resources, annual production and capacity have different definitions; regional aggregates must remain regional.

Publisher: https://www.energyinst.org/statistical-review/resources-and-data-downloads

## USGS Mineral Commodity Summaries

Status: Access incomplete

The 2026 data release describes over 90 nonfuel commodities, with US statistics and world production tables. Not imported.

Method: Resolve the official DOI, acquire the ScienceBase CSV tables and their XML metadata, retain table footnotes and exact unit/basis. DOI metadata was acquired; the data host returned HTTP 403.

Refresh: Annual edition, with table-level checksums and revision review.

Reuse: The DOI metadata identifies the data release as CC0 1.0.

Limits: A valid open licence does not solve the current download failure. Do not replace mine output with refined output, gross ore mass or a report’s regional Other subtotal.

Publisher: https://doi.org/10.5066/P1WKQ63T
metadataUrl: https://api.datacite.org/dois/10.5066/P1WKQ63T

## BGS World Mineral Statistics API

Status: Rights review needed

API records extend back to 1970; metadata may lag the newest yearbook. Not imported.

Method: Use OGC API Features with commodity, country and year filters, pagination and retained source fields. A one-record JSON request succeeded. Follow the publisher’s example notebook.

Refresh: Annual; verify actual API years against the yearbook.

Reuse: BGS terms permit specified non-commercial research uses; commercial use or supply to third parties requires checking permission with the rights owner.

Limits: An accessible API is not an unrestricted republication licence. BGS also documents flag-loss in the API representation; estimates and small/missing values need the original yearbook notes.

Publisher: https://www.bgs.ac.uk/mineralsuk/statistics/world-mineral-statistics/
repo: https://github.com/BritishGeologicalSurvey/BGS-API-Documentation
downloadUrl: https://ogcapi.bgs.ac.uk/collections/world-mineral-statistics/items?f=json&limit=1
termsUrl: https://www.bgs.ac.uk/mineralsuk/statistics/world-mineral-statistics/bgs-mineral-statistics-terms-and-conditions-ipr/

## Global Energy Monitor trackers

Status: Access incomplete

The oil/gas extraction tracker describes a March 2026 release. No tracker export was acquired in this release.

Method: Acquire the official dated tracker export; keep unit IDs, source wiki links, operating status, production year and location-accuracy category. Review export terms before import.

Refresh: Per tracker release; do not scrape wiki pages into a substitute census.

Reuse: Verify and retain the licence supplied with the actual export; website availability alone is insufficient.

Limits: Size thresholds exclude smaller assets. Some locations are only country-level placeholders: these must never appear as exact field coordinates.

Publisher: https://globalenergymonitor.org/projects/global-oil-gas-extraction-tracker/
metadataUrl: https://www.gem.wiki/Global_Oil_and_Gas_Extraction_Tracker

## FAOSTAT production & forestry

Status: Imported snapshot

Current maps contain eight primary crops and nine forest products for 2024. Broader crop and livestock coverage is available upstream.

Method: Use the official bulk index to select a dated normalized archive. Retain item/element codes, M49 geography, unit, source flag and note. Expand to additional crops, fibres and livestock products by explicit item code.

Refresh: Check bulk-index timestamps monthly; refresh when the selected archive changes.

Reuse: CC BY 4.0 and FAO Statistical Database terms, including third-party exceptions.

Limits: Products at different processing stages overlap. Timber m³ cannot be converted to tonnes without a density basis; heads of animals cannot be treated as meat tonnage.

Publisher: https://www.fao.org/faostat/en/#data/QCL
metadataUrl: https://bulks-faostat.fao.org/production/datasets_E.json
termsUrl: https://www.fao.org/contact-us/terms/db-terms-of-use/en/

## UNEP IRP Global Material Flows

Status: Imported snapshot

1970–2024 country material histories. Recent years are proxy estimates. Four broad extraction classes do not identify individual minerals.

Method: Retain official country-account CSV exports and original material classifications. Keep direct-flow accounts and modelled footprints separate.

Refresh: Check official dataset editions; no unannounced in-place refresh.

Reuse: Public export; no explicit general reuse licence identified in the reviewed source. Attribution is retained; additional redistribution should be reviewed.

Limits: All metal ores is not copper production; all non-metallic minerals is not cement. Never invent a refined-metal conversion or a balanced global trade total.

Publisher: https://www.resourcepanel.org/global-material-flows-database

## UN Comtrade API & official Python client

Status: Imported snapshot

Existing commodity view is a selected reporter sample, not a complete world matrix. Waste-report coverage is a separate source.

Method: Use official availability metadata before acquisition. Partition by reporter/year/HS/flow until all pages are complete; preserve reporter versus partner, net-weight estimation flags and HS revision. Store response hashes.

Refresh: Reporting schedules differ. Reacquire revised reporter-year partitions rather than append duplicate observations.

Reuse: UN Comtrade usage agreement; no blanket Creative Commons licence is asserted. Some bulk access needs a subscription.

Limits: Public preview responses can be capped. Mirror imports and exporter reports can disagree; never silently combine them. Country links are not vessel tracks or final destinations.

Publisher: https://comtradeplus.un.org/
repo: https://github.com/uncomtrade/comtradeapicall
metadataUrl: https://comtradedeveloper.un.org/
termsUrl: https://comtradeplus.un.org/LicenseAgreement

## CEPII BACI

Status: Access incomplete

A potential broader annual trade matrix. Official page returned HTTP 403 in this environment; no files acquired.

Method: Download the official HS-revision-specific release plus country and product codes. Keep the release identifier and document BACI’s reconciliation method.

Refresh: Annual; pin the release and compare revisions.

Reuse: Check the actual release terms and UN Comtrade-derived reuse conditions before redistribution.

Limits: Reconciled quantities are not original exporter reports. They are not proof of final disposal or vessel movements, and must not replace observed weights without a clear label.

Publisher: https://www.cepii.fr/DATA_DOWNLOAD/baci/doc/baci_webpage.html

## World Bank What a Waste 3.0

Status: Imported snapshot

217 countries/economies and 262 city records already imported.

Method: Download the country and city workbooks with codebooks. Retain field-level original references, dates, methods and notes; validate fractions, percentages and allowed ranges.

Refresh: Edition-based release; there is no claim of a live municipal feed.

Reuse: CC BY 4.0 with attribution to the World Bank and original field sources.

Limits: City areas and observation years differ. Waste sent for recycling does not measure recovered output. Projections and modelled baselines remain separate from observations.

Publisher: https://datacatalog.worldbank.org/search/dataset/0039597/what-a-waste-global-database

## UN SDG API

Status: Imported snapshot

Selected source series already imported. Some e-waste data are modelled and later years can be projections.

Method: Read Series/Data with complete pagination. Preserve series code, source, nature/estimate flags, footnotes, dimensions and reference period; map only actual country codes.

Refresh: Check source-release metadata and re-fetch complete affected series.

Reuse: UN statistical-data terms and original agency attribution; no generic CC licence inferred.

Limits: Series with different denominators or scopes are not interchangeable. An aggregate region is not a country observation.

Publisher: https://unstats.un.org/sdgs/dataportal
downloadUrl: https://unstats.un.org/sdgapi/v1/sdg/Series/Data?seriesCode=EN_EWT_GENV&pageSize=50000
metadataUrl: https://unstats.un.org/sdgapi/swagger/

## Eurostat waste statistics

Status: Imported snapshot

European reporting countries; existing app includes municipal, packaging, all-sector treatment and e-waste series.

Method: Use the official JSON-stat/SDMX API with dataset-specific dimensions and status flags. Preserve sparse cells, hazardous-waste scope and operation hierarchy.

Refresh: Follow dataset update timestamps; annual and biennial series differ.

Reuse: Eurostat attribution policy with third-country/third-party exceptions; existing public output excludes restricted geographies.

Limits: Treatment inside a country can include imported waste. Combined categories overlap with their children. Confidential splits must remain unknown.

Publisher: https://ec.europa.eu/eurostat/web/waste/database
metadataUrl: https://ec.europa.eu/eurostat/web/user-guides/data-browser/api-data-access/api-introduction
termsUrl: https://ec.europa.eu/eurostat/web/main/help/copyright-notice

## OECD Global Plastics Outlook

Status: Imported snapshot

Current snapshot covers 1990–2019, with only a few geographies that map directly to individual countries.

Method: Retain the source model tables and native geographic groups. Keep historical estimates separate from scenario projections and record the version.

Refresh: New model edition; not a monthly observational feed.

Reuse: OECD terms with attribution and third-party exceptions.

Limits: Global model regions cannot be coloured as if every member country had an observed national recycling rate. No new country values have been inferred here.

Publisher: https://doi.org/10.1787/c0821f81-en

## Basel national reports

Status: Imported snapshot

Existing source covers reporting sections, not universal shipment tracking.

Method: Parse national report sections by reporting country and year. Keep waste code, destination, amount, unit and recovery/disposal code together; retain a reference to the original report.

Refresh: Annual submissions; coverage and corrections differ by reporter.

Reuse: Original reporting and convention sources must be attributed. No blanket open licence inferred.

Limits: A permitted/reported movement is not proof of delivery or successful treatment. D/R operation codes have legal versions and cannot be treated as recycling percentages.

Publisher: https://www.basel.int/Countries/NationalReporting/NationalReports/BC2024Reports/tabid/10394/Default.aspx

## Official regional & municipal data

Status: Imported snapshot

Detailed BC disposal areas and Canadian product trade are already retained. Other locales vary in public reporting depth.

Method: Use each publisher’s versioned CSV/API, area codes and definitions. BC and Statistics Canada provide the current regional examples; every additional jurisdiction needs an explicit adapter.

Refresh: Publisher-specific schedules; validate boundary changes, weighbridge basis and transfer/destination fields.

Reuse: Dataset-specific licences; Canadian and BC open-data attribution where applicable.

Limits: No universal public feed connects every household to its final processor. Facility capacity, collected mass and recovered output must remain distinct.

Publisher: https://catalogue.data.gov.bc.ca/
metadataUrl: https://open.canada.ca/data/en/dataset/2909a648-5753-4924-878a-b069392d9cde

## OpenStreetMap / Overpass

Status: Rights review needed

Potential location enrichment; not a throughput or operating-status census. No new OSM facility records imported here.

Method: Query explicitly tagged facilities within bounded areas; retain OSM type/ID, timestamp, tags and attribution. Apply an ODbL-compatible database/reuse design before importing.

Refresh: Incremental changes or dated regional extracts, subject to service usage policies.

Reuse: Open Database Licence; derivative database and attribution obligations require deliberate handling.

Limits: A map tag or nearby point does not prove a material connection. Avoid unbounded global Overpass queries and do not label inferred coordinates as exact.

Publisher: https://www.openstreetmap.org/copyright
termsUrl: https://opendatacommons.org/licenses/odbl/1-0/

## Canada · solid-waste infrastructure

Status: Imported snapshot

Canadian source records compiled October 2023–June 2024; geographic coverage varies.

Method: All 9,074 source locations. Transform EPSG:3347 to WGS84; preserve provider, original ID, classification and status. Missing names are labeled by source class.

Refresh: Reacquire upstream source, compare hashes and original values, validate, then publish a reviewed snapshot. No unattended update.

Reuse: Open Government Licence – Canada

Limits: Location records do not include waste throughput or verified downstream destinations. Several providers may describe the same physical site; counts are source records, not a deduplicated national facility census. The mixed category includes waste infrastructure whose exact role is unspecified.

Publisher: https://www150.statcan.gc.ca/n1/pub/34-26-0003/342600032023001-eng.htm
downloadUrl: https://www150.statcan.gc.ca/pub/34-26-0003/2023001/zip/ODI_v2_solid_waste.zip
termsUrl: https://open.canada.ca/en/open-government-licence-canada

## Canada · oil and gas facilities

Status: Imported snapshot

All records classified as facilities in ODI. Wells and pipelines are separate categories and excluded from this layer.

Method: Transform EPSG:3347 to WGS84. Preserve native facility class, operating status, ownership and original ID. A representative point is used only for non-point facility geometry and labeled.

Refresh: Reacquire upstream source, compare hashes and original values, validate, then publish a reviewed snapshot. No unattended update.

Reuse: Open Government Licence – Canada

Limits: Location and operating status describe the source snapshot, not current production. The source does not supply oil or gas throughput per facility. Provider overlap is retained; records are not claimed to be unique physical sites.

Publisher: https://www150.statcan.gc.ca/n1/pub/34-26-0003/342600032023001-eng.htm
downloadUrl: https://www150.statcan.gc.ca/pub/34-26-0003/2023001/zip/ODI_v2_oil_gas.zip
termsUrl: https://open.canada.ca/en/open-government-licence-canada

## HydroWASTE · treatment plants

Status: Imported snapshot

58,502 treatment-plant records. Coverage and underlying source dates vary by country.

Method: Retain all source rows and all quality codes. Reported treatment, design capacity, unspecified reports and modeled effluent are separate measurement bases. Source population and treatment quality codes remain explicit.

Refresh: Reacquire upstream source, compare hashes and original values, validate, then publish a reviewed snapshot. No unattended update.

Reuse: CC BY 4.0

Limits: The dataset does not provide an observation year for each plant. Liquid volume cannot be added to solid-waste mass. Source estimates have no per-plant statistical interval. Outfall coordinates are estimated and distinct from plant coordinates.

Publisher: https://www.hydrosheds.org/products/hydrowaste
downloadUrl: https://figshare.com/ndownloader/files/31910714
termsUrl: https://creativecommons.org/licenses/by/4.0/

## Global mining land · mapped footprints

Status: Imported snapshot

All 44,929 polygons from the source study. Study search zones are not an exhaustive world mine census.

Method: Use the original area in km² and a representative point inside each mining polygon. Retain the source polygon ID. Derived mining records are shared under CC BY-SA 4.0.

Refresh: Reacquire upstream source, compare hashes and original values, validate, then publish a reviewed snapshot. No unattended update.

Reuse: CC BY-SA 4.0

Limits: Footprints include pits, tailings, waste rock, ponds and processing areas. A footprint does not identify a mine operator, commodity, production or current operating status.

Publisher: https://doi.org/10.1594/PANGAEA.942325
downloadUrl: https://download.pangaea.de/dataset/942325/files/global_mining_polygons_v2.gpkg
termsUrl: https://creativecommons.org/licenses/by-sa/4.0/

## US landfills · waste acceptance

Status: Imported snapshot

2,323 geolocated records of 2,641 source records. Missing coordinates are excluded; LMOP does not include every US landfill.

Method: Annual source short tons × exactly 0.90718474 = metric tonnes. Preserve each measurement year; missing intake or reporting year remains null.

Refresh: Reacquire upstream source, compare hashes and original values, validate, then publish a reviewed snapshot. No unattended update.

Reuse: US government public data

Limits: This is a voluntary program database, not a full US landfill census. Annual intake reports have different years and cannot be summed into a same-year national total.

Publisher: https://www.epa.gov/lmop/landfill-technical-data
downloadUrl: https://www.epa.gov/system/files/documents/2024-09/landfilllmopdata.xlsx
termsUrl: https://www.epa.gov/web-policies-and-procedures/epa-disclaimers

## River plastic · modeled emissions

Status: Imported snapshot

All 31,819 modeled outfalls in the retained source.

Method: Retain original tonnes/year and outfall coordinates. Countries absent in the source remain unassigned; no nearest-country substitution.

Refresh: Reacquire upstream source, compare hashes and original values, validate, then publish a reviewed snapshot. No unattended update.

Reuse: CC BY 4.0

Limits: These are model estimates, not observed shipments or measured discharges. Per-outfall uncertainty intervals and most river names are absent. Most country assignments are unavailable in the source.

Publisher: https://doi.org/10.6084/m9.figshare.14515590.v1
downloadUrl: https://ndownloader.figshare.com/files/27807774
termsUrl: https://creativecommons.org/licenses/by/4.0/

## Global Power Plant Database · archived baseline

Status: Imported snapshot

34,936 source records across 167 countries. WRI states that the project is no longer maintained; this is a historical baseline, not a current operating inventory.

Method: Retain every source row, native plant ID, primary and secondary fuels, capacity in MW, capacity observation year, original provider URLs and all annual generation fields. Reported GWh and modeled GWh remain separate original fields.

Refresh: Reacquire upstream source, compare hashes and original values, validate, then publish a reviewed snapshot. No unattended update.

Reuse: CC BY 4.0

Limits: Capacity in MW is a rated power level, not annual energy production. Current operating status and recent additions or closures are not supplied. Location and capacity accuracy vary by contributing provider. Primary fuel does not establish a complete annual fuel mix. Generation may use calendar, fiscal or regulatory years.

Publisher: https://github.com/wri/global-power-plant-database
downloadUrl: https://raw.githubusercontent.com/wri/global-power-plant-database/master/output_database/global_power_plant_database.csv
termsUrl: https://creativecommons.org/licenses/by/4.0/

## Climate TRACE · global industrial sources

Status: Imported snapshot

19,836 geolocated point-source records across nine selected waste, oil/gas and manufacturing subsectors. Administrative-area aggregates are excluded.

Method: Retain native point-source centroids, identifiers and 2025 inventory estimates. CO₂e uses IPCC AR6 100-year global warming potentials. Upstream activity fields marked license restricted are unavailable, not zero. Original API pages and hashes are retained.

Refresh: Reacquire upstream source, compare hashes and original values, validate, then publish a reviewed snapshot. No unattended update.

Reuse: CC BY 4.0; listed external-source exceptions

Limits: Emissions combine models and public reports. The summary API does not provide a per-record measurement method or uncertainty interval. Tonnes of CO₂e describe climate impact, not tonnes of waste handled or material produced. Point-source centroids can represent a production area or complex; they are not guaranteed building-level coordinates. Names may be descriptive labels assigned by the provider. Overlap with other source inventories is retained. Selected subsectors and source coverage do not form a complete census of operating facilities.

Publisher: https://climatetrace.org/data
downloadUrl: https://api.climatetrace.org/v7/docs/index.html
termsUrl: https://climatetrace.org/terms

## NASA GIBS · satellite and environmental context

Status: Live visualization service

Global Mercator imagery to ±85.05°. Terra MODIS true colour, Blue Marble relief/bathymetry, monthly NDVI and Aqua MODIS chlorophyll-a.

Method: Verified WMTS identifiers, dates and native resolutions from retained capabilities. Request tiles for the selected layer/date. The MCP returns layer metadata and geographic image URLs.

Refresh: Dates are bounded by the reviewed capabilities snapshot. Tile delivery is live; unavailable or cloudy pixels remain gaps.

Reuse: NASA Earth Science data policy; attribution to NASA GIBS / MODIS.

Limits: Imagery is not extracted numerical biogeophysical data. Chlorophyll does not detect plastic, NDVI cannot identify a cause, and zooming does not increase native resolution.

Publisher: https://nasa-gibs.github.io/gibs-api-docs/
repo: https://github.com/nasa-gibs/gibs-web-examples
metadataUrl: https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/1.0.0/WMTSCapabilities.xml
termsUrl: https://www.earthdata.nasa.gov/engage/open-data-services-and-software/data-and-information-policy

