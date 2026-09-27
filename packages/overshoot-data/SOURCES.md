# OVERSHOOT source inventory

Snapshot: 19 September 2026. This is a broad inventory of relevant international and national databases, not a claim that every database on Earth is integrated. Acquisition and public visualization are separate: reports, metadata, detailed offline snapshots and normalized display records are identified in each entry.

| Status | Count |
|---|---:|
| partial | 6 |
| available | 23 |
| catalogued | 16 |
| blocked | 19 |

## UNEP IRP Global Material Flows Database — Domestic extraction

- ID: `irp-2026` · **partial**
- Publisher: United Nations Environment Programme, International Resource Panel; compiled by CSIRO and WU Vienna
- Dataset / edition: Global Material Flows Database, MFA4Plus domestic extraction (DE) · 2024 edition; live portal snapshot retrieved 2026-09-19
- Coverage: 1970–2024 · Raw selected export: 249 geographies including regions and historical territories. Normalized output: 232 modern countries/territories plus source World aggregate. Coverage differs by material and year.
- Source: [UNEP IRP Global Material Flows Database — Domestic extraction](https://www.resourcepanel.org/global-material-flows-database)
- License: No explicit machine-readable reuse license identified on the database landing page, portal, or downloaded CSV. Public export available; attribution requested by publisher. Do not label CC BY or public domain.
- In this atlas: See the baseline BUILD.md acquisition table.
- Method: Domestic extraction is the gross physical mass extracted within a territory and used for economic activity or further transformed. Includes gross metal ore, not only contained metal. Excludes unused mining overburden and extraction not entering economic use. This is DE, not domestic material consumption (DE + imports − exports) or material footprint. Underlying source series contain estimates/models. The publisher identifies 2022–2024 as estimates based on economic proxies; the 2024 technical annex says some projections enter from 2020 and the last year recommended for establishing statistical correlations is 2019.
- Units: Native extraction unit t (metric tonnes), native total extraction per-capita t/cap, and native Population counts of people (export unit field blank; metric explicitly Population). No mass conversion. Material per-capita values are derived from source class tonnes / native population; total per-capita uses the native DE/cap field. Missing data stays null.
- Transformations: Public selected-export CSV acquired unchanged. SHA-256: 60779224616b80582c6c49115322a23abef308add755dab83acf88eb3728097b. Wide annual columns 1970–2024 melted to country-year rows. Categories mapped Biomass→biomass, Fossil fuels→fossil, Metal ores→metals, Non-metallic minerals→minerals. Publisher code list from the portal maps country names to ISO3+UN M49 codes. Regional aggregates are excluded from countries and rows; World is retained as WORLD. Nine historical boundary codes are retained only in raw archive, not conflated with current polygons. estimated=true identifies guaranteed 2022–2024 late-year proxy estimates. false does NOT mean a direct observation; historical accounts also contain modelled estimates. Cura<e7>ao source display name repaired to Curaçao; its source ISO3 CUW / M49 531 is unchanged. Native totals/ratios export acquired unchanged: Population, DE/cap, DE, 1970–2024. SHA-256: 3cdbd45f9221bbc3dee437e91ed0e94599e389c887817888780daa758ef87761. In enriched v2 only, all-material total is native DE from totals/ratios if present; total per-capita is native DE/cap. Each class per-capita is class tonnes divided by native population. Population is never inferred, and missing material classes stay null even when a reported total exists. Source reconciliation finding: native World DE totals differ slightly from the sum of four exported classes. Largest absolute difference occurs in 1975 (2,681,998.592 tonnes; approximately 0.00776%). Most differences are source rounding. All are retained without forced balancing. 2024 class sum is 106,971,469,898t versus native total 106,971,469,894.03t.
- Retrieved: 2026-09-19

## Global human-made mass exceeds all living biomass

- ID: `elhacham-2020` · **available**
- Publisher: Elhacham et al.; Nature / Weizmann Institute of Science
- Dataset / edition: Milo lab anthropogenic_mass source workbooks · Nature 588, 442–444 (2020)
- Coverage: 1900–2037 · Global
- Source: [Global human-made mass exceeds all living biomass](https://www.nature.com/articles/s41586-020-3010-5)
- License: MIT for authors' data/code repository; Nature article has separate publisher rights.
- In this atlas: See the baseline BUILD.md acquisition table.
- Method: Original end-of-year anthropogenic mass, excluding waste; summed six material columns. Biomass uses source-provided years only, without smoothing or interpolation. Historical values are research estimates. Anthropogenic values after 2015 are the publication's extrapolations; biomass values after 2017 are extrapolations. Low/high, where present, are biomass +/- one standard deviation. Gaps between source years remain gaps; connecting chart segments are guides, not annual observations.
- Units: Source teratonnes dry weight, normalized by multiplying by 1e12.
- Transformations: Six human-made categories summed; waste excluded; no smoothing/interpolation; joined only on available source years; shipped subset ends 2025.
- Retrieved: 2026-09-19

## The Circularity Gap Report 2025

- ID: `circle-cgr-2025` · **available**
- Publisher: Circle Economy, in collaboration with Deloitte
- Dataset / edition: Circularity Indicator Set; Tables 1–2 and Figure 3 · Version 1.0, May 2025
- Coverage: 2018–2021 · Global
- Source: [The Circularity Gap Report 2025](https://www.circle-economy.com/resources/the-circularity-gap-report-2025)
- License: CC BY-SA 4.0; the derived transcription is distributed under the same license with attribution.
- In this atlas: See the baseline BUILD.md acquisition table.
- Method: Published Circularity Metric: secondary material input / total primary + secondary material input. Includes recycling and downcycling. Input share, not the share of all waste recycled. Report 2025 v1.0, data 2021. 2026 edition focuses on economic value loss and continues to reference this 6.9% materials metric.
- Units: Percent of total material input; flow figure original Gt normalized to metric tonnes.
- Transformations: Exact source rounded numbers transcribed; no precision invented; percent not recalculated from rounded tonnes.
- Retrieved: 2026-09-19

## What a Waste 3.0: Global Snapshot of Solid Waste Management Toward Circularity until 2050

- ID: `worldbank-waw3-2026` · **available**
- Publisher: World Bank Group
- Dataset / edition: Country Dataset & Codebook · March 2026
- Coverage: 2010–2050 · 217 countries/economies
- Source: [What a Waste 3.0: Global Snapshot of Solid Waste Management Toward Circularity until 2050](https://www.worldbank.org/en/publication/what-a-waste)
- License: CC BY 4.0
- In this atlas: See the baseline BUILD.md acquisition table.
- Method: Country MSW values use the workbook's reported generation year, not projected 2022 column. Reporting definitions/measurement points differ. Fate fields have no per-field year in flat workbook and must not inherit generation year. Missing remains null/absent; shares are not renormalized.
- Units: Source MSW tonnes/year retained. Source numeric percentage cells are fractions; multiplied by 100 for percent display.
- Transformations: Sheet Country dataset, row 2 machine field names, rows 3–219. Preserves ISO3, actual year and source row; extraction only, no estimation.
- Retrieved: 2026-09-19

## Global Waste Management Outlook 2024: Beyond an Age of Waste – Turning Rubbish into a Resource

- ID: `unep-gwmo-2024` · **available**
- Publisher: UNEP / ISWA
- Dataset / edition: Figure 7: Global municipal solid waste destinations · 2024
- Coverage: 2020–2050 · Global
- Source: [Global Waste Management Outlook 2024: Beyond an Age of Waste – Turning Rubbish into a Resource](https://www.unep.org/resources/global-waste-management-outlook-2024)
- License: Educational/non-profit reproduction with attribution; report prohibits commercial reproduction without permission. No imagery or report text reproduced in data artifact.
- In this atlas: See the baseline BUILD.md acquisition table.
- Method: GWMO 2024 Figure 7, page 21. Original tonnes reported in thousands, multiplied by 1,000. Keep this baseline separate from the World Bank 2022 baseline. Uncontrolled combines dumping and open burning and cannot be separated from this figure. Displayed percentages are source-rounded.
- Units: Source Figure 7 thousand tonnes, multiplied by 1,000; rounded percent retained.
- Transformations: Transcribed factual values only, no data interpolation or geographic substitution.
- Retrieved: 2026-09-19

## UN Comtrade — bilateral physical trade

- ID: `comtrade` · **partial**
- Publisher: United Nations Statistics Division
- Dataset / edition: Annual goods exports, original HS classification; selected HS4 commodities and reporting economies · Public preview snapshot 2026-09-19
- Coverage: 2024 snapshot · Selected reporting economies: Chile, United States, Canada, Japan, Australia, Brazil, Germany, Netherlands, United Kingdom, China, Peru, Türkiye and India. Partner coverage varies. Not a complete world matrix.
- Source: [UN Comtrade — bilateral physical trade](https://comtradeplus.un.org/)
- License: United Nations Comtrade usage agreement. Attribution and redistribution conditions apply; no Creative Commons or blanket open-data licence is asserted. https://comtradeplus.un.org/LicenseAgreement
- In this atlas: Pinned source snapshot. Country, year and unit limits are retained.
- Method: Source annual export-direction records from selected reporters. Use netWgt only when isNetWgtEstimated is explicitly false. HS4 records can be source aggregates (isReported=false, isAggregate=true); that does not make the non-estimated net-weight field synthetic. Retain original-classification, report/aggregate, legacy estimation and provenance flags. Mirror imports are not combined with export records. HS6309 is worn articles and is not necessarily waste. Native reported weights can still disagree across partners: a targeted 2024 Chile-to-China HS2603 mirror check found 2,253,844 tonnes reported by Chile versus 9,210,398 tonnes by China, with both non-estimated. Display reporting side explicitly; no reconciliation is inferred. See quality-notes.json.
- Units: Native netWgt in kilograms; canonical metric tonnes = netWgt / 1,000. Commodity mass is not contained-metal mass.
- Transformations: Official reporter/partner M49-to-ISO3 lookup. Exclude world/unsupported partners, self-flows, missing/zero/estimated weights and non-total mode/customs/partner2 dimensions. Retain strictly positive exporter-direction records. Capped 500-row queries are split by commodity before inclusion; parent responses are excluded. No interpolation, dollar-to-weight conversion, mirror blending or global extrapolation.
- Retrieved: 2026-09-19

## Natural Earth country boundaries

- ID: `natural-earth` · **available**
- Publisher: Natural Earth
- Dataset / edition: 1:110m countries through world-atlas 2.0.2 · world-atlas 2.0.2
- Coverage: Contemporary boundaries · 177 generalized country geometries; small states may not be visible
- Source: [Natural Earth country boundaries](https://www.naturalearthdata.com/about/terms-of-use/)
- License: Public domain (Natural Earth); world-atlas package ISC.
- In this atlas: Generalized country boundaries and graticule; cartographic context, not a mass dataset.
- Method: Generalized modern boundaries. Historical country codes are excluded where no compatible geographic concordance exists.
- Units: WGS84 longitude and latitude
- Transformations: TopoJSON converted to GeoJSON; centroids generated by d3-geo. Country-code joins use publisher M49 mappings.
- Retrieved: 2026-09-19

## Global material accounts & consumption footprints

- ID: `irp-resource-accounts-2026` · **available**
- Publisher: UNEP International Resource Panel; CSIRO and WU Vienna
- Dataset / edition: Global Material Flows Database — totals/ratios and four-class material footprints · 2024 edition; official portal snapshot 19 September 2026
- Coverage: 1970–2024 · 230 modern countries/territories plus WORLD in normalized account rows. Material footprint available for 158 countries plus WORLD; coverage varies by metric/year.
- Source: [Global material accounts & consumption footprints](https://www.resourcepanel.org/global-material-flows-database)
- License: Public export. No explicit reuse licence identified on the reviewed IRP pages/CSV; attribution required. No Creative Commons licence inferred.
- In this atlas: Pinned source snapshot. Country, year and unit limits are retained.
- Method: Domestic extraction records used materials taken within a territory. Domestic material consumption is extraction + physical imports − physical exports. Material footprint (raw material consumption) allocates upstream extraction to final demand using a multiregional input-output model. These are distinct accounts. Preserve the published native values: world direct imports/exports do not balance and native MF does not exactly equal the DE/RME balance. Do not turn that difference into an invented flow. Years 2022–2024 are source proxy estimates; earlier years include modelling too.
- Units: Native t (metric tonnes), t/cap (tonnes/person), and Population (people). No mass conversion. Four-class footprint per capita = reported class tonnes / native IRP population; total per capita is native MF/cap.
- Transformations: Melt annual CSV columns. Preserve null gaps. Join portal country names using publisher ISO3+M49 codes and existing atlas country contract; exclude nine obsolete countries and all regional aggregates except WORLD. Keep negative DMC/PTB as reported. Never sum modern countries as a world total. MF class values have integer tonne precision; totals/ratios retain publisher precision. No interpolation, stock estimation or bilateral inference. Source class sums are not forced to match independently reported totals.
- Retrieved: 2026-09-19
- Access / limitations: Raw MF accounting differences are retained, not balanced. 47 negative native DMC observations remain signed. Global MF has fewer explicitly separate countries than DE; Rest-of regions are excluded from country selections. Latest years are estimates, not live measurement. The four-class MF export can differ from native total MF; the largest absolute difference is 394,825,439.862 tonnes (WORLD 2002). Preserve both; do not force balancing or describe every difference as rounding.

## FAOSTAT · Primary crop production

- ID: `faostat-qcl-2025` · **available**
- Publisher: Food and Agriculture Organization of the United Nations
- Dataset / edition: FAOSTAT QCL: Crops and livestock products; eight selected primary crops · Bulk release updated 31 December 2025; retrieved 19 September 2026
- Coverage: 1970–2024 archived subset; 2024 browser snapshot · 2024: 187 modern countries/territories plus WORLD; eight selected crops have uneven country coverage.
- Source: [FAOSTAT · Primary crop production](https://www.fao.org/faostat/en/#data/QCL)
- License: CC BY 4.0 plus FAO Statistical Database Terms of Use; attribution, no endorsement, and applicable third-party exceptions.
- In this atlas: Pinned source snapshot. Country, year and unit limits are retained.
- Method: Source-reported production of eight selected primary crops: wheat, rice, barley, maize, potatoes, sugar cane, soya beans and oil palm fruit. Editorial subset, not total agricultural output or biomass extraction. Retains official/estimated/imputed flags.
- Units: Source production quantities in t, retained as metric tonnes. Crop-specific commodity moisture basis remains the FAO basis; no biomass dry-mass conversion.
- Transformations: Select QCL Production rows with source unit t and eight explicit item codes. Join source M49 to existing atlas countries; preserve WORLD and exclude historical/regional aggregates. Retain exact numeric values and flags. Archive 1970–2024 subset; publish only exact 2024 rows, without fallback to another year.
- Retrieved: 2026-09-19
- Access / limitations: Selected crops only; never label as biomass total. Primary crop tonnes differ in moisture basis and are not additive with processed agricultural output. No nearest-year substitution; missing national values stay absent.

## FAOSTAT · Forest products

- ID: `faostat-forestry` · **catalogued**
- Publisher: FAO
- Dataset / edition: Forestry Production and Trade (FO) · Bulk metadata updated 9 January 2026
- Coverage: Annual; exact series coverage varies by product · Global countries and territories
- Source: [FAOSTAT · Forest products](https://www.fao.org/faostat/en/#data/FO)
- License: CC BY 4.0 plus FAO Statistical Database Terms of Use; verify third-party exceptions and retain attribution/no endorsement.
- In this atlas: Catalogued; no normalized observations in this atlas.
- Method: Roundwood removals and production/trade of wood, pulp and paper products. Preserve primary versus processed product distinctions.
- Units: Cubic metres and tonnes by product. Do not convert timber volume to tonnes without a documented density basis.
- Transformations: No quantitative transformation or browser data published from this catalog entry.
- Retrieved: 2026-09-19
- Access / limitations: Catalogued. Product/unit adapter and selected snapshot not yet normalized.

## FAOSTAT · Food supply and uses

- ID: `faostat-food-balances` · **catalogued**
- Publisher: FAO
- Dataset / edition: Food Balances (FBS) · Bulk metadata updated 28 October 2025
- Coverage: 2010 onward; annual · Global countries/territories
- Source: [FAOSTAT · Food supply and uses](https://www.fao.org/faostat/en/#data/FBS)
- License: CC BY 4.0 plus FAO Statistical Database Terms of Use; verify third-party exceptions and retain attribution/no endorsement.
- In this atlas: Catalogued; no normalized observations in this atlas.
- Method: Country commodity balances separate food, feed, seed, processing, stocks, trade and losses. They do not measure all food waste after sale.
- Units: Commodity-specific tonnes, nutrient/energy and per-person measures; preserve the element unit.
- Transformations: No quantitative transformation or browser data published from this catalog entry.
- Retrieved: 2026-09-19
- Access / limitations: Catalogued. Resolve product overlap and exact mass-unit elements before integration.

## FAOSTAT · Agricultural supply–use accounts

- ID: `faostat-supply-utilization` · **catalogued**
- Publisher: FAO
- Dataset / edition: Supply Utilization Accounts (SCL) · Bulk metadata updated 1 November 2025
- Coverage: 2010 onward; annual · Global countries/territories
- Source: [FAOSTAT · Agricultural supply–use accounts](https://www.fao.org/faostat/en/#data/SCL)
- License: CC BY 4.0 plus FAO Statistical Database Terms of Use; verify third-party exceptions and retain attribution/no endorsement.
- In this atlas: Catalogued; no normalized observations in this atlas.
- Method: Detailed crop/livestock commodity supply and utilization. Complements FBS; not an independent mass quantity to add to it.
- Units: Source item/element units including tonnes; processed outputs must not be added to raw input totals.
- Transformations: No quantitative transformation or browser data published from this catalog entry.
- Retrieved: 2026-09-19
- Access / limitations: Catalogued. Detailed balance adapter not yet normalized.

## FAOSTAT — detailed agricultural trade matrix

- ID: `faostat-trade-matrix` · **blocked**
- Publisher: Food and Agriculture Organization of the United Nations
- Dataset / edition: Detailed trade matrix of agricultural products · Current FAOSTAT domain TM, catalogue reviewed September 2026
- Coverage: Series-specific; verify downloaded release before display · FAOSTAT country/territory reporting and partner coverage.
- Source: [FAOSTAT — detailed agricultural trade matrix](https://www.fao.org/faostat/en/#data/TM)
- License: FAOSTAT data licensing and source-specific conditions require verification with acquired release.
- In this atlas: No display data. See the access and method notes.
- Method: Agricultural bilateral quantities would extend biomass trade beyond the selected HS crops in Comtrade. Retain FAOSTAT product code, item unit, reporter/partner direction and flags; do not mix product weights with primary-crop equivalents or double-count reporter and mirror observations. Web catalogue resolves, but the direct portal request returned HTTP403; no matrix acquired in this expansion.
- Units: Native units; no conversion applied because no numerical observations are bundled.
- Transformations: Catalogue and access/methodology review only. No data inserted into the atlas.
- Retrieved: 2026-09-19

## FishStat · Aquatic biomass

- ID: `faostat-fishstat` · **catalogued**
- Publisher: FAO
- Dataset / edition: Fisheries and Aquaculture statistics · Current corporate statistical database
- Coverage: Coverage depends on capture, aquaculture and trade collection · Global countries/areas and fisheries reporting areas
- Source: [FishStat · Aquatic biomass](https://www.fao.org/fishery/en/fishstat)
- License: CC BY 4.0 plus FAO Statistical Database Terms of Use; verify third-party exceptions and retain attribution/no endorsement.
- In this atlas: Catalogued; no normalized observations in this atlas.
- Method: Separate wild capture from aquaculture and product trade; conversion between product weight and live weight must be explicit.
- Units: Source series include live-weight tonnes and product-specific weights.
- Transformations: No quantitative transformation or browser data published from this catalog entry.
- Retrieved: 2026-09-19
- Access / limitations: Catalogued; specific collection snapshot and live-weight conventions need validation.

## USGS · Mineral commodities

- ID: `usgs-minerals-2026` · **blocked**
- Publisher: U.S. Geological Survey
- Dataset / edition: Mineral Commodity Summaries 2026; Minerals Yearbook · 2026 edition
- Coverage: 2026 report: five-year series; country world-production tables vary · United States and world country tables
- Source: [USGS · Mineral commodities](https://www.usgs.gov/centers/national-minerals-information-center/mineral-commodity-summaries)
- License: USGS-authored federal data are public domain unless marked otherwise; third-party content retains its rights.
- In this atlas: No display data. See the access and method notes.
- Method: Commodity production, reserves, apparent consumption and recycling details for more than 90 minerals/materials. Gross ore, contained metal and processed product are different mass bases.
- Units: Commodity-specific units (including metric tonnes and contained-metal tonnes); no universal ore conversion.
- Transformations: No quantitative transformation or browser data published from this catalog entry.
- Retrieved: 2026-09-19
- Access / limitations: Official report/catalogue verified. Data-release DOI returned HTTP 403 in this environment; no source workbook snapshot acquired.

## BGS · World mineral statistics

- ID: `bgs-world-minerals` · **blocked**
- Publisher: British Geological Survey
- Dataset / edition: World Mineral Statistics · World Mineral Production 2020–2024
- Coverage: Archive from 1913; machine-readable production from 1970 · Countries worldwide
- Source: [BGS · World mineral statistics](https://www.bgs.ac.uk/mineralsuk/statistics/world-mineral-statistics/)
- License: Non-commercial academic/research use permitted; third-party redistribution/commercial use requires applicable copyright-holder or NERC permission.
- In this atlas: No display data. See the access and method notes.
- Method: Country commodity production for over 70 mineral commodities. API suppresses some publication symbols into null/zero; do not interpret every null as missing or every zero as measured nil.
- Units: Commodity-specific source units and ore/metal bases.
- Transformations: No quantitative transformation or browser data published from this catalog entry.
- Retrieved: 2026-09-19
- Access / limitations: Catalogued. Redistribution terms must be resolved before publishing source tables.

## Eurostat · Economy-wide material accounts

- ID: `eurostat-ew-mfa` · **catalogued**
- Publisher: European Commission / Eurostat
- Dataset / edition: env_ac_mfa; env_ac_mfadpo; env_ac_mfabi · Current Eurostat datasets
- Coverage: Annual; exact range varies by country and table · EU and reporting European countries
- Source: [Eurostat · Economy-wide material accounts](https://ec.europa.eu/eurostat/databrowser/view/env_ac_mfa/default/table?lang=en)
- License: EU reuse policy: CC BY 4.0 unless a dataset carries a specific exception; confirm metadata at acquisition.
- In this atlas: Catalogued; no normalized observations in this atlas.
- Method: National statistical accounts of extraction, direct trade and DMC; companion datasets add processed outputs and balancing items. Regional quality cross-check of IRP, not additional global mass.
- Units: Selected unit must be validated; thousand tonnes must be multiplied by 1,000 for normalized tonnes.
- Transformations: No quantitative transformation or browser data published from this catalog entry.
- Retrieved: 2026-09-19
- Access / limitations: Catalogued. Preserve reporting flags, residence/territory conventions and edition differences.

## Eurostat · Material footprints

- ID: `eurostat-material-footprint` · **catalogued**
- Publisher: European Commission / Eurostat
- Dataset / edition: Material footprints / raw material equivalents (env_ac_rme) · Current Eurostat dataset
- Coverage: Annual; country and model coverage varies · EU and available European country estimates
- Source: [Eurostat · Material footprints](https://ec.europa.eu/eurostat/cache/metadata/en/env_ac_rme_esms.htm)
- License: EU reuse policy: CC BY 4.0 unless specifically excepted.
- In this atlas: Catalogued; no normalized observations in this atlas.
- Method: Modelled raw-material consumption based on material-flow accounts. Alternative to the IRP footprint model; do not splice versions or mix national and EU aggregate boundaries.
- Units: Source unit selection required; retain model and scale metadata.
- Transformations: No quantitative transformation or browser data published from this catalog entry.
- Retrieved: 2026-09-19
- Access / limitations: Catalogued. An independent model comparison requires matched years and definitions.

## OECD · Material resources

- ID: `oecd-material-resources` · **catalogued**
- Publisher: OECD
- Dataset / edition: Material resources / material consumption · Current OECD Data Explorer
- Coverage: Annual; coverage depends on metric/country · OECD and available partner countries
- Source: [OECD · Material resources](https://www.oecd.org/en/data/indicators/material-consumption.html)
- License: OECD data terms permit reuse with credit, including commercial use, except additional dataset/third-party restrictions.
- In this atlas: Catalogued; no normalized observations in this atlas.
- Method: DMC is extraction plus imports less exports. This overlaps IRP/Eurostat accounts and is useful for reconciliation and national quality flags.
- Units: Indicator page uses tonnes/person; underlying table contains metric-specific units.
- Transformations: No quantitative transformation or browser data published from this catalog entry.
- Retrieved: 2026-09-19
- Access / limitations: Catalogued. Exact versioned SDMX dataflow/export not pinned in this pass.

## UN SDG · Material footprint and consumption

- ID: `un-sdg-materials` · **catalogued**
- Publisher: UN Statistics Division / UNEP
- Dataset / edition: SDG 12.2.1 and 12.2.2 (also 8.4.1/8.4.2) · Metadata updated 28 March 2025
- Coverage: Metadata documents 2000–2023; database refreshes separately · About 160 footprint countries per metadata; coverage varies
- Source: [UN SDG · Material footprint and consumption](https://unstats.un.org/sdgs/dataportal)
- License: UN/UNEP source-specific terms; no Creative Commons licence inferred.
- In this atlas: Catalogued; no normalized observations in this atlas.
- Method: International reporting of MF/DMC totals and ratios. Country validation can replace global model values. Source metadata warns that some zero values reflect source missing-data imputation; do not treat them as verified absence.
- Units: Metric and per-capita/per-GDP series have different units; select exact series code and units.
- Transformations: No quantitative transformation or browser data published from this catalog entry.
- Retrieved: 2026-09-19
- Access / limitations: Catalogued. Overlaps IRP; should serve as a separately versioned validation source, not be merged silently.

## EXIOBASE · Supply-chain footprints

- ID: `exiobase-3-10-2` · **blocked**
- Publisher: EXIOBASE consortium / XIO Sustainability Analytics
- Dataset / edition: EXIOBASE 3 EE-MRIO · 3.10.2; published 13 May 2026
- Coverage: Annual tables; core updates to 2022 and later nowcasts as documented · 44 countries and 5 rest-of-world regions
- Source: [EXIOBASE · Supply-chain footprints](https://zenodo.org/records/20051562)
- License: Customized non-commercial academic CC-BY-SA-NC derivative for v3.9+; commercial license separate. Latest record supersedes stale general-homepage license wording.
- In this atlas: No display data. See the access and method notes.
- Method: Industry/product environmental input-output model. Monetary transaction matrices are not shipment-tonne data. Material extensions overlap IRP inputs and require matrix calculations to form consumption footprints.
- Units: Economic core: million EUR; environmental extensions have independent units.
- Transformations: No quantitative transformation or browser data published from this catalog entry.
- Retrieved: 2026-09-19
- Access / limitations: Catalogued. Current license does not establish permission for Gaia commercial-product redistribution.

## Eora2 · Global supply-chain accounts

- ID: `eora2` · **blocked**
- Publisher: KGM & Associates / Eora
- Dataset / edition: Eora2 Global Supply Chain Database · Current Eora2 release
- Coverage: 1990–2024 · 190 countries
- Source: [Eora2 · Global supply-chain accounts](https://www.eora.org/)
- License: Active subscription/license required; eligible academic use has separate free license. Eora1 licenses do not transfer.
- In this atlas: No display data. See the access and method notes.
- Method: MRIO model with national industry classifications and a reduced environmental satellite set compared with Eora1. Monetary flows cannot be represented as physical shipments.
- Units: Economic-account and satellite-specific units; require licensed metadata.
- Transformations: No quantitative transformation or browser data published from this catalog entry.
- Retrieved: 2026-09-19
- Access / limitations: No licensed credential available. Do not acquire or redistribute restricted tables.

## GHSL · Population and built environment

- ID: `ghsl-pop-built` · **catalogued**
- Publisher: European Commission Joint Research Centre
- Dataset / edition: GHS-POP, GHS-BUILT-S/V; GHS-WUP population and built-up projections · R2023A and R2025A
- Coverage: 1975–2030 at five-year steps; WUP projections extend to 2100 · Global raster grids
- Source: [GHSL · Population and built environment](https://human-settlement.emergency.copernicus.eu/datasets.php)
- License: Open reuse with source acknowledgement under the published GHSL terms.
- In this atlas: Catalogued; no normalized observations in this atlas.
- Method: Spatial context and population exposure. Separate historical estimates from projections. Built area and volume are not material mass.
- Units: People per cell; square metres; cubic metres. No conversion to tonnes without a separate calibrated model.
- Transformations: No quantitative transformation or browser data published from this catalog entry.
- Retrieved: 2026-09-19
- Access / limitations: Catalogued. Raster acquisition, aggregation and tiling needed; native IRP population remains the current denominator.

## WorldPop · Population geography

- ID: `worldpop` · **catalogued**
- Publisher: WorldPop / University of Southampton
- Dataset / edition: WorldPop population counts and density · Current WorldPop Hub
- Coverage: Year and projection coverage vary by population product · Global country products; coverage varies
- Source: [WorldPop · Population geography](https://hub.worldpop.org/)
- License: CC BY 4.0, with dataset-specific citation.
- In this atlas: Catalogued; no normalized observations in this atlas.
- Method: Gridded demographic estimates for local exposure and per-person analysis. Select a consistent population product/year; do not substitute national gaps using regional values.
- Units: Population counts or density as defined by each raster.
- Transformations: No quantitative transformation or browser data published from this catalog entry.
- Retrieved: 2026-09-19
- Access / limitations: Catalogued. No gridded raster normalized; avoid changing the IRP series denominator silently.

## UN Energy · Fossil-fuel balances

- ID: `unsd-energy` · **blocked**
- Publisher: United Nations Statistics Division
- Dataset / edition: Energy Statistics Database / UNdata DF_UNDATA_ENERGY · Current UNSD annual release
- Coverage: Full archive from 1950; public online series from 1990 · More than 230 countries/territories
- Source: [UN Energy · Fossil-fuel balances](https://unstats.un.org/unsd/energystats/data/)
- License: UNSD permits attributed non-profit reuse; other uses require contacting UNSD. Full archive is separately distributed.
- In this atlas: No display data. See the access and method notes.
- Method: Production, trade, conversion and end use of fuels, electricity and heat. Fossil fuel mass is only a subset; energy quantities do not equal tonnes.
- Units: Native metric tonnes, volume, GWh or terajoules depending on series. Preserve original units.
- Transformations: No quantitative transformation or browser data published from this catalog entry.
- Retrieved: 2026-09-19
- Access / limitations: Catalogued. Resolve redistribution terms and select physical-mass series before integration.

## GLORIA · Global resource input-output accounts

- ID: `gloria-mrio` · **blocked**
- Publisher: IELab / University of Sydney
- Dataset / edition: Global Resource Input-Output Assessment (GLORIA) · Release not pinned
- Coverage: Exact release/year coverage requires archive metadata · Global model; release-specific geography not yet verified
- Source: [GLORIA · Global resource input-output accounts](https://www.ielab.info/resources/gloria)
- License: License not verified for a specific release.
- In this atlas: No display data. See the access and method notes.
- Method: Candidate high-resolution MRIO for upstream resource attribution. Keep independent from direct physical shipment statistics and from the existing IRP national accounts.
- Units: Economic matrix and satellite units must be acquired from release metadata.
- Transformations: No quantitative transformation or browser data published from this catalog entry.
- Retrieved: 2026-09-19
- Access / limitations: Landing page reachable but metadata did not render in the research tool; no specific archive or values acquired.

## River plastic emission outfalls

- ID: `meijer-rivers-2021` · **available**
- Publisher: Meijer et al.; The Ocean Cleanup / Figshare
- Dataset / edition: Supplementary data: More than 1000 rivers account for 80% of global riverine plastic emissions into the ocean · Figshare v1; DOI 10.6084/m9.figshare.14515590.v1
- Coverage: 2015 model year · Global river outfalls; 2015 model, not all rivers.
- Source: [River plastic emission outfalls](https://doi.org/10.6084/m9.figshare.14515590.v1)
- License: CC BY 4.0 (dataset metadata).
- In this atlas: Pinned source snapshot. Country, year and unit limits are retained.
- Method: Midpoint modeled floating macroplastic emissions at 31,819 river outfalls. Field-calibrated probabilistic model; not live measurement. The paper reports 31,904 locations, but the distributed GIS file contains 31,819; retain actual file count. Native field dots_exten stores metric tons/year. Per-outfall confidence intervals are absent in this file.
- Units: Metric tonnes/year; geographic coordinates WGS84.
- Transformations: Shapefile to GeoJSON; preserve source row; top1,000 outfalls selected by emission mass (subset explicitly labeled). Full31,819 kept in Parquet. Coordinates rounded to six decimals. River names and country absent; only unique highest-emitting outfall linked to Pasig by article ranking. No other country/name inference.
- Retrieved: 2026-09-19

## US landfill locations and reported waste intake

- ID: `epa-lmop-2024` · **available**
- Publisher: US Environmental Protection Agency
- Dataset / edition: LMOP Landfill and Landfill Gas Energy Project Database · September 2024 landfill-level XLSX
- Coverage: Record-specific reporting years; snapshot September2024 · United States only
- Source: [US landfill locations and reported waste intake](https://www.epa.gov/lmop/landfill-technical-data)
- License: EPA-produced geospatial data public domain by default under17 USC105; https://www.epa.gov/web-policies-and-procedures/epa-disclaimers . Other source notices retained.
- In this atlas: Pinned source snapshot. Country, year and unit limits are retained.
- Method: EPA compiled facility inventory, reviewed for reasonableness; not an exhaustive US landfill census. Each mass metric retains its own reporting year; not all values refreshed annually.
- Units: Native mass: US short tons; normalized metric tonnes.
- Transformations: 2,641 raw records;2,323 have valid coordinates.318 omitted from spatial artifact only. Annual acceptance masses multiplied by exact0.90718474. No reporting year or mass means null. Preserved native values,units and IDs; no inferred missing coordinates.
- Retrieved: 2026-09-19

## Global mining land footprints

- ID: `maus-mining-2022` · **available**
- Publisher: Maus et al.; PANGAEA
- Dataset / edition: Global-scale mining polygons · Version2; PANGAEA.942325
- Coverage: 2019 satellite mosaic · Global mapped mining land in study search zones
- Source: [Global mining land footprints](https://doi.org/10.1594/PANGAEA.942325)
- License: CC BY-SA4.0; transformed database remains under the same license.
- In this atlas: Pinned source snapshot. Country, year and unit limits are retained.
- Method: 44,929 polygons visually delineated from2019 Sentinel-2 imagery inside10km study search zones around mining coordinates. Includes pits, tailings, waste dumps, ponds and processing land jointly; polygons are not classified tailings facilities. Source land-cover accuracy88.3%.
- Units: Native polygon area km²; WGS84 coordinates. Not a mass metric.
- Transformations: Compute interior representative points for navigation; preserve native polygon area. Largest1,500 polygons displayed, all44,929 retained in Parquet and raw GPKG. Country area sums derived without claiming exhaustive national mining area.
- Retrieved: 2026-09-19

## Global Tailings Portal

- ID: `grid-tailings-portal` · **blocked**
- Publisher: GRID-Arendal; Investor Mining and Tailings Safety Initiative
- Dataset / edition: Tailings storage facility disclosures and geometry · Public portal API snapshot2026-09-19
- Coverage: Disclosure-specific dates; no common current observation year · Global participating-company disclosures, incomplete coverage
- Source: [Global Tailings Portal](https://tailing.grida.no/)
- License: No explicit open bulk reuse license found in portal terms https://tailing.grida.no/gdpr . Public viewing is not treated as a redistribution grant.
- In this atlas: No display data. See the access and method notes.
- Method: Company-reported tailings disclosures.2,144 rows acquired;193 markedduplicates and31 missing/invalid coordinates leave1,920 distinct geolocated records. Homepage1,805 count differs from actual current API.
- Units: Storage volume m³, height m. Never convert volume to tonnes without density.
- Transformations: Schema/adapter and raw snapshot present; excluded from public site artifacts pending license resolution. No invented dates, no risk ranking from incomparable hazard classifications.
- Retrieved: 2026-09-19

## Global Coal Mine Tracker

- ID: `gem-coal-mine-tracker` · **blocked**
- Publisher: Global Energy Monitor
- Dataset / edition: Global Coal Mine Tracker · August2026 release; May2026 v2
- Coverage: Assets as of2026; production2025 · Global, selective capacity thresholds
- Source: [Global Coal Mine Tracker](https://globalenergymonitor.org/projects/global-coal-mine-tracker/)
- License: GEM Creative Commons Public License; exact downloadable artifact terms require inspection before publication.
- In this atlas: No display data. See the access and method notes.
- Method: Tracked operating, proposed and retired mines; usual threshold1Mt/year, China0.45Mt/year. Source may substitute capacity when production is missing. Must preserve production versus capacity and location accuracy.
- Units: Million tonnes production; Mt/year capacity.
- Transformations: Catalogued and methodology verified; complete source file not acquired. Download flow requests user details. No form submitted and no values incorporated.
- Retrieved: 2026-09-19

## Shipbreaking destinations and annual ship lists

- ID: `ngo-shipbreaking-platform` · **blocked**
- Publisher: NGO Shipbreaking Platform
- Dataset / edition: Annual lists and country profiles · Country profiles reviewed2026-09-19
- Coverage: Annual lists vary; country profiles mix dates · Major South Asian and other shipbreaking destinations
- Source: [Shipbreaking destinations and annual ship lists](https://shipbreakingplatform.org/our-work/the-problem/)
- License: No blanket open database license confirmed. Country-profile text not republished; underlying factual destinations catalogued.
- In this atlas: No display data. See the access and method notes.
- Method: Primary NGO documentation identifies Alang-Sosiya, Chattogram/Sitakund,Gadani and Turkish sites. No georeferenced bulk yard inventory acquired.
- Units: Ship counts and various ship tonnage concepts; gross tonnage is not mass.
- Transformations: Destination geography documented but no invented exact coordinates. OSM region queries timed out; no guessed shipyard markers rendered.
- Retrieved: 2026-09-19

## OpenStreetMap waste and shipbreaking geography

- ID: `osm-waste-sites` · **blocked**
- Publisher: OpenStreetMap contributors
- Dataset / edition: Landfill, recycling, and shipbreaking tags · Live database; no complete snapshot acquired
- Coverage: Mapper-specific observations and edits · Global potential coverage, uneven and incomplete
- Source: [OpenStreetMap waste and shipbreaking geography](https://www.openstreetmap.org/copyright)
- License: ODbL1.0 for database; attribution and share-alike obligations apply.
- In this atlas: No display data. See the access and method notes.
- Method: Volunteer mapping. landuse=landfill is geography, not proof of operational status, waste mass, safety or complete coverage. General shipyard tags include ship construction/repair and must not be relabeled shipbreaking.
- Units: Coordinates and geometry; no universal mass values.
- Transformations: Adapter approach catalogued. Initial exact industrial=shipbreaking tag query returned zero; broader name queries timed out. An unrelated candidate node was rejected by coordinate validation. No OSM points added.
- Retrieved: 2026-09-19

## European Industrial Emissions Portal

- ID: `eea-industrial-emissions-sites` · **blocked**
- Publisher: European Environment Agency
- Dataset / edition: E-PRTR and industrial facility reporting · Current portal inspected2026-09-19
- Coverage: Annual reporting; release-specific · European reporting countries
- Source: [European Industrial Emissions Portal](https://industry.eea.europa.eu/)
- License: Release-specific EEA metadata terms need verification for each acquired dataset.
- In this atlas: No display data. See the access and method notes.
- Method: Industrial facility emissions and off-site waste-transfer data. Useful for landfills/incinerators/hazardous waste handlers subject to reporting thresholds.
- Units: Pollutant tonnes, waste-transfer tonnes and facility coordinates; taxonomies remain native.
- Transformations: Catalogue only; data download and activity-code filtering adapter not acquired in this update. Do not treat all industrial facilities as waste sites.
- Retrieved: 2026-09-19

## US hazardous-waste handlers and pollutant discharge facilities

- ID: `epa-rcra-echo` · **blocked**
- Publisher: US Environmental Protection Agency
- Dataset / edition: RCRAInfo; ECHO; FRS; NPDES · Weekly refresh downloads
- Coverage: Dataset-specific reporting years · United States
- Source: [US hazardous-waste handlers and pollutant discharge facilities](https://echo.epa.gov/tools/data-downloads)
- License: EPA geospatial public-domain default; each dataset metadata must be retained.
- In this atlas: No display data. See the access and method notes.
- Method: Regulated facility inventory with facility IDs and coordinates; RCRA hazardous-waste handlers can be generators, transporters or treatment/storage/disposal facilities, requiring role filtering.
- Units: Facility coordinates; waste types and metrics dataset-specific.
- Transformations: Verified availability. Large raw files not acquired: RCRAInfo103MB; FRS318MB; ECHO exporter392MB. Separate filter-and-join pipeline needed; no unsupported facility claims published.
- Retrieved: 2026-09-19

## Mineral Resources Data System

- ID: `usgs-mrds` · **blocked**
- Publisher: US Geological Survey
- Dataset / edition: MRDS mineral occurrences and mines · Legacy database
- Coverage: Historical records; not a current operating-mine census · Global with uneven historical coverage
- Source: [Mineral Resources Data System](https://mrdata.usgs.gov/mrds/)
- License: US government-produced data generally public domain; release metadata not retrieved.
- In this atlas: No display data. See the access and method notes.
- Method: Mineral occurrences, prospects and mine records require status/category distinction.
- Units: Locations and native commodity/resource metadata.
- Transformations: Catalogued; primary endpoint returnedHTTP403 in this environment. No data added.
- Retrieved: 2026-09-19

## Global wastewater treatment plants

- ID: `hydrowaste-2022` · **available**
- Publisher: Ehalt Macedo et al.; HydroSHEDS
- Dataset / edition: HydroWASTE · Version1.0; December2021
- Coverage: Source-specific observations; compiled December2021 · Global known treatment plants; not complete sanitation coverage.
- Source: [Global wastewater treatment plants](https://www.hydrosheds.org/products/hydrowaste)
- License: CC BY4.0 (HydroSHEDS product page).
- In this atlas: Pinned source snapshot. Country, year and unit limits are retained.
- Method: 58,502 treatment plants compiled from national and regional sources. Source-specific quality codes distinguish reported treatment, design capacity, unspecified reports and model estimates. Position quality assessed at country/region level.
- Units: Effluent volume m³/day. Liquid wastewater volume is never added to solid-waste mass or converted to tonnes.
- Transformations: Native plant coordinates retained rather than modeled outfalls. Public subset top1,000 records with QUAL_WASTE=1 (reported treated volume); excluded capacity and model estimates. Source reporting years absent at record level remain null. Full record set stored in Parquet with native quality flags.
- Retrieved: 2026-09-19

## Electronic waste generated and recycled

- ID: `unsd-ewaste-2026` · **available**
- Publisher: UN Statistics Division / UNEP / UNITAR / national statistical offices
- Dataset / edition: SDG12.4.2 and12.5.1 · 2026.Q2.G.02 API snapshot, 19 September 2026
- Coverage: 2000–2025 · 84 national/global entities in the published subset; see record-level geography.
- Source: [Electronic waste generated and recycled](https://unstats.un.org/sdgs/dataportal)
- License: UN statistical-data terms; no explicit Creative Commons licence supplied by this API. Original agency and country attribution retained per observation. GEM report and photographs have separate, more restrictive terms.
- In this atlas: Pinned source snapshot. Country, year and unit limits are retained.
- Method: UNITAR/WESR model estimates and national/Eurostat observations as identified on each row. UN SDG series is not the complete GEM country table. UNITAR values after2022 are labelled model projections; missing countries remain unavailable.
- Units: Metric tonnes for mass; percentages and tonnes/person where specified. Original values and units retained.
- Transformations: Parse complete Series/Data JSON response; map UN M49 to ISO3; kilograms/person÷1000; tonnes and percentages unchanged. Exclude nonfinite missing observations, preserve footnotes/flags/dimensions. Keep regions in a separate artifact.
- Retrieved: 2026-09-19

## Municipal waste generation and recycling

- ID: `unsd-municipal-2026` · **available**
- Publisher: UN Statistics Division / UNEP / UNITAR / national statistical offices
- Dataset / edition: SDG12.4.2 and12.5.1 · 2026.Q2.G.02 API snapshot, 19 September 2026
- Coverage: 2000–2024 · 131 national/global entities in the published subset; see record-level geography.
- Source: [Municipal waste generation and recycling](https://unstats.un.org/sdgs/dataportal)
- License: UN statistical-data terms; no explicit Creative Commons licence supplied by this API. Original agency and country attribution retained per observation. GEM report and photographs have separate, more restrictive terms.
- In this atlas: Pinned source snapshot. Country, year and unit limits are retained.
- Method: National questionnaires and Eurostat/OECD figures compiled by UNSD/UNEP. National definitions and reporting years differ. Keep country footnotes and observation status. Never add these quantities to World Bank figures for the same waste stream.
- Units: Metric tonnes for mass; percentages and tonnes/person where specified. Original values and units retained.
- Transformations: Parse complete Series/Data JSON response; map UN M49 to ISO3; kilograms/person÷1000; tonnes and percentages unchanged. Exclude nonfinite missing observations, preserve footnotes/flags/dimensions. Keep regions in a separate artifact.
- Retrieved: 2026-09-19

## Hazardous waste generation and treatment

- ID: `unsd-hazardous-2026` · **available**
- Publisher: UN Statistics Division / UNEP / UNITAR / national statistical offices
- Dataset / edition: SDG12.4.2 · 2026.Q2.G.02 API snapshot, 19 September 2026
- Coverage: 2000–2024 · 123 national/global entities in the published subset; see record-level geography.
- Source: [Hazardous waste generation and treatment](https://unstats.un.org/sdgs/dataportal)
- License: UN statistical-data terms; no explicit Creative Commons licence supplied by this API. Original agency and country attribution retained per observation. GEM report and photographs have separate, more restrictive terms.
- In this atlas: Pinned source snapshot. Country, year and unit limits are retained.
- Method: National and Eurostat/UNSD observations. Treatment categories retain source taxonomy: incineration, incineration with energy recovery, landfill, recycling and other management. Imported/exported treatment can differ from domestic generation; no forced mass closure.
- Units: Metric tonnes for mass; percentages and tonnes/person where specified. Original values and units retained.
- Transformations: Parse complete Series/Data JSON response; map UN M49 to ISO3; kilograms/person÷1000; tonnes and percentages unchanged. Exclude nonfinite missing observations, preserve footnotes/flags/dimensions. Keep regions in a separate artifact.
- Retrieved: 2026-09-19

## Food Waste Index country and sector data

- ID: `unsd-food-waste-2026` · **available**
- Publisher: UN Statistics Division / UNEP / UNITAR / national statistical offices
- Dataset / edition: SDG12.3.1(b) · 2026.Q2.G.02 API snapshot, 19 September 2026
- Coverage: 2005–2022 · 228 national/global entities in the published subset; see record-level geography.
- Source: [Food Waste Index country and sector data](https://unstats.un.org/sdgs/dataportal)
- License: UN statistical-data terms; no explicit Creative Commons licence supplied by this API. Original agency and country attribution retained per observation. GEM report and photographs have separate, more restrictive terms.
- In this atlas: Pinned source snapshot. Country, year and unit limits are retained.
- Method: UNEP Food Waste Index2021/2024 estimates, alongside national observations. Household, retail, out-of-home and total sectors are distinct metrics. Confidence footnotes remain visible; national totals may be model estimates, not direct measurements. No addition across total and components.
- Units: Metric tonnes for mass; percentages and tonnes/person where specified. Original values and units retained.
- Transformations: Parse complete Series/Data JSON response; map UN M49 to ISO3; kilograms/person÷1000; tonnes and percentages unchanged. Exclude nonfinite missing observations, preserve footnotes/flags/dimensions. Keep regions in a separate artifact.
- Retrieved: 2026-09-19

## Food loss percentages

- ID: `fao-food-loss-2026` · **available**
- Publisher: UN Statistics Division / FAO
- Dataset / edition: SDG12.3.1(a) · 2026.Q2.G.02 API snapshot, 19 September 2026
- Coverage: 2015–2023 · 1 national/global entities in the published subset; see record-level geography.
- Source: [Food loss percentages](https://unstats.un.org/sdgs/dataportal)
- License: UN statistical-data terms; no explicit Creative Commons licence supplied by this API. Original agency and country attribution retained per observation. GEM report and photographs have separate, more restrictive terms.
- In this atlas: Pinned source snapshot. Country, year and unit limits are retained.
- Method: FAO loss before retail, by food-product group. Global and regional estimates; no national numeric data in this acquired series. Food loss and retail/household food waste have different boundaries and denominators; never sum their percentages.
- Units: Metric tonnes for mass; percentages and tonnes/person where specified. Original values and units retained.
- Transformations: Parse complete Series/Data JSON response; map UN M49 to ISO3; kilograms/person÷1000; tonnes and percentages unchanged. Exclude nonfinite missing observations, preserve footnotes/flags/dimensions. Keep regions in a separate artifact.
- Retrieved: 2026-09-19

## Circular material use rate

- ID: `eurostat-circularity-2025` · **available**
- Publisher: Eurostat
- Dataset / edition: env_ac_cur · JSON-stat API snapshot; updated2025-11-24T23:00:00+0100
- Coverage: 2010–2024 · 27 European countries
- Source: [Circular material use rate](https://ec.europa.eu/eurostat/databrowser/view/env_ac_cur/default/table)
- License: Eurostat reuse policy: attribution required, third-party exceptions apply. No separate licence is asserted for external-source components.
- In this atlas: Pinned source snapshot. Country, year and unit limits are retained.
- Method: Share of circular material use in overall material use. Eurostat indicator denominator differs from the global Circularity Gap Report; do not rank both as if methodologically identical.
- Units: Metric tonnes for mass; percentages and tonnes/person where specified. Original values and units retained.
- Transformations: Decode JSON-stat dimensions; preserve source flags. Thousand tonnes×1000 where applicable, tonnes and rates unchanged. EU/other aggregates stored separately from national data.
- Retrieved: 2026-09-19

## Municipal waste by management operation

- ID: `eurostat-municipal-2026` · **available**
- Publisher: Eurostat
- Dataset / edition: env_wasmun · JSON-stat API snapshot; updated2026-03-30T23:00:00+0200
- Coverage: 2010–2024 · 37 European countries
- Source: [Municipal waste by management operation](https://ec.europa.eu/eurostat/databrowser/view/env_wasmun/default/table)
- License: Eurostat reuse policy: attribution required, third-party exceptions apply. No separate licence is asserted for external-source components.
- In this atlas: Pinned source snapshot. Country, year and unit limits are retained.
- Method: National municipal waste statistics. GEN and TRT totals overlap their child categories. DSP_I_RCV_E overlaps DSP_I and RCV_E; RCY overlaps RCY_M and RCY_C_D. Render source-selected categories without summing parents and children.
- Units: Metric tonnes for mass; percentages and tonnes/person where specified. Original values and units retained.
- Transformations: Decode JSON-stat dimensions; preserve source flags. Thousand tonnes×1000 where applicable, tonnes and rates unchanged. EU/other aggregates stored separately from national data.
- Retrieved: 2026-09-19

## Packaging waste by management operation

- ID: `eurostat-packaging-2026` · **available**
- Publisher: Eurostat
- Dataset / edition: env_waspac · JSON-stat API snapshot; updated2026-05-11T23:00:00+0200
- Coverage: 2018–2023 · 29 European countries
- Source: [Packaging waste by management operation](https://ec.europa.eu/eurostat/databrowser/view/env_waspac/default/table)
- License: Eurostat reuse policy: attribution required, third-party exceptions apply. No separate licence is asserted for external-source components.
- In this atlas: Pinned source snapshot. Country, year and unit limits are retained.
- Method: Packaging material and operation taxonomy preserved, including plastics, paper/cardboard, metals, wood and glass. W1501 total includes components. Recycling national/EU/nonEU destination categories overlap total recycling.
- Units: Metric tonnes for mass; percentages and tonnes/person where specified. Original values and units retained.
- Transformations: Decode JSON-stat dimensions; preserve source flags. Thousand tonnes×1000 where applicable, tonnes and rates unchanged. EU/other aggregates stored separately from national data.
- Retrieved: 2026-09-19

## Packaging recycling rates

- ID: `eurostat-packaging-recycling-2026` · **available**
- Publisher: Eurostat
- Dataset / edition: cei_wm020 · JSON-stat API snapshot; updated2026-05-11T23:00:00+0200
- Coverage: 2000–2023 · 29 European countries
- Source: [Packaging recycling rates](https://ec.europa.eu/eurostat/databrowser/view/cei_wm020/default/table)
- License: Eurostat reuse policy: attribution required, third-party exceptions apply. No separate licence is asserted for external-source components.
- In this atlas: Pinned source snapshot. Country, year and unit limits are retained.
- Method: Source unit RT_TGT2025: rates under2025-and-onwards target methodology, by packaging type. Historical break flags and source precision preserved.
- Units: Metric tonnes for mass; percentages and tonnes/person where specified. Original values and units retained.
- Transformations: Decode JSON-stat dimensions; preserve source flags. Thousand tonnes×1000 where applicable, tonnes and rates unchanged. EU/other aggregates stored separately from national data.
- Retrieved: 2026-09-19

## MAT_STOCKS: national material stocks and flows

- ID: `mat-stocks-2024` · **available**
- Publisher: Wiedenhofer et al. / BOKU University
- Dataset / edition: MAT_STOCKS / MISO2 global database · v1.0, Zenodo12794253
- Coverage: 1900–2016 · 177 countries
- Source: [MAT_STOCKS: national material stocks and flows](https://doi.org/10.5281/zenodo.12794253)
- License: CC BY4.0 (dataset). Model software has a separate GPL licence.
- In this atlas: Pinned source snapshot. Country, year and unit limits are retained.
- Method: Economy-wide dynamic, inflow-driven stock-flow model. Four end uses × four material groups. Values are model estimates; uncertainty is not supplied in this summarized CSV. Stock is accumulated mass, not annual extraction.
- Units: Metric tonnes for mass; percentages and tonnes/person where specified. Original values and units retained.
- Transformations: Kilotonnes×1000 to metric tonnes. Sum exactly16 disjoint end-use/material cells per country/process/year using compensated summation. Latest2016 totals in metrics; complete1900–2016 totals in stock-history; components retained separately.
- Retrieved: 2026-09-19

## MAT_STOCKS detailed EU27 extract

- ID: `mat-stocks-eu-2025` · **partial**
- Publisher: Wiedenhofer et al. / BOKU University
- Dataset / edition: MAT_STOCKS EU27 · v1.0, Zenodo15090142
- Coverage: 1990–2016 · EU27
- Source: [MAT_STOCKS detailed EU27 extract](https://doi.org/10.5281/zenodo.15090142)
- License: CC BY4.0
- In this atlas: Detailed EU27 CSV acquired offline. The country atlas uses the broader MAT_STOCKS account to avoid duplicate stock totals.
- Method: Detailed stock, gross additions and end-of-life flows across12end uses and19materials. This is1990–2016, not the later EEA2022extension.
- Units: Metric tonnes for mass; percentages and tonnes/person where specified. Original values and units retained.
- Transformations: Raw CSV acquired. Retained for material-specific exploration; summarized global artifact already includes these27countries, so no duplicate import.
- Retrieved: 2026-09-19

## Global Plastics Outlook: published global estimates

- ID: `oecd-plastics-2022` · **partial**
- Publisher: OECD
- Dataset / edition: Global Plastics Outlook · Revised April2022
- Coverage: 2000 and2019 · Global
- Source: [Global Plastics Outlook: published global estimates](https://doi.org/10.1787/de747aef-en)
- License: OECD Terms and Conditions: data may be reused including commercially with attribution, subject to third-party restrictions.
- In this atlas: Pinned source snapshot. Country, year and unit limits are retained.
- Method: ENV-Linkages model and plastics lifecycle estimates. Rounded values transcribed from the official executive summary/press release. Model mass/fate dataset is published separately under oecd-plastics-database-2022.
- Units: Metric tonnes for mass; percentages and tonnes/person where specified. Original values and units retained.
- Transformations: Million tonnes×1e6; published percentage shares unchanged. No deriving tonnes from rounded percentages.
- Retrieved: 2026-09-19

## Global Plastics Outlook: use, fate, leakage and stocks

- ID: `oecd-plastics-database-2022` · **available**
- Publisher: OECD
- Dataset / edition: PLASTIC_WASTE_1, PLASTIC_USE_1, PLASTIC_LEAKAGE_2 andPLASTIC_LEAKAGE_3 · OECD Compare Your Country embedded data snapshot
- Coverage: 1990–2019 · Global; Canada, USA, India;11regional aggregates retained separately
- Source: [Global Plastics Outlook: use, fate, leakage and stocks](https://doi.org/10.1787/c0821f81-en)
- License: OECD Terms and Conditions, section3: attribution; permitted reuse including commercial, subject to third-party restrictions.
- In this atlas: Pinned source snapshot. Country, year and unit limits are retained.
- Method: Historical model estimates,1990–2019. Five separate waste fates exactly sum to source total. Reported geographic model regions do not generally match countries: China includes Hong Kong. Only Canada, USA and India are mapped to national ISO3; WORLD is the native source global total. Regional model entities stay separate.
- Units: Metric tonnes for mass; percentages and tonnes/person where specified. Original values and units retained.
- Transformations: Parse publicly embedded backend JSON without executing code. Million tonnes×1e6. Preserve five source fate categories and exact native values. No post2019 scenario projections imported into factual metrics.
- Retrieved: 2026-09-19

## Global E-waste Monitor2024

- ID: `unitar-gem-2024` · **partial**
- Publisher: UNITAR / ITU
- Dataset / edition: Global E-waste Monitor country/territory tableA2.4 · Edition2, November2024
- Coverage: 2022 · Global country/territory coverage
- Source: [Global E-waste Monitor2024](https://ewastemonitor.info/the-global-e-waste-monitor-2024/)
- License: CC BY-NC-SA3.0IGO, excluding third-party photographs/material. Commercial reuse may need permission.
- In this atlas: Methodology report acquired. Country observations use the separately cited UN SDG series; report tables are not republished.
- Method: Country/territory2022 generation and documented formal collection/recycling. The report mixes estimated generation and documented collection; missing collection is N/A, not zero.
- Units: Metric tonnes for mass; percentages and tonnes/person where specified. Original values and units retained.
- Transformations: PDF acquired for methodology/verification. Bulk country table not imported into browser due to its distinct reuse conditions; public SDG country observations used instead.
- Retrieved: 2026-09-19

## Food Loss and Waste Database

- ID: `fao-flw-database` · **catalogued**
- Publisher: FAO
- Dataset / edition: Food Loss and Waste Database · Live2026portal
- Coverage: Study-specific, many years · 167countries described by source portal
- Source: [Food Loss and Waste Database](https://www.fao.org/platform-food-loss-waste/flw-data/en/)
- License: Underlying literature/databases retain their own rights; FAO warns against assuming endorsement or accuracy.
- In this atlas: Catalogued; no normalized observations in this atlas.
- Method: Commodity-, value-chain-stage- and study-specific observations. Source portal describes almost40,000data points from167countries and296commoditygroups. These studies are not interchangeable national annual totals.
- Units: Metric tonnes for mass; percentages and tonnes/person where specified. Original values and units retained.
- Transformations: Portal verified and snapshotted. Shiny download session not acquired; SDG food-loss country/global series acquired separately.
- Retrieved: 2026-09-19
- Access / limitations: Requires study-level harmonization and confidence handling before display.

## Waste generation by economic activity

- ID: `eurostat-waste-generation` · **catalogued**
- Publisher: Eurostat
- Dataset / edition: env_wasgen · Live database
- Coverage: Biennial series; coverage varies · Europe
- Source: [Waste generation by economic activity](https://ec.europa.eu/eurostat/databrowser/view/env_wasgen/default/table)
- License: Eurostat reuse policy: attribution required, third-party exceptions apply. No separate licence is asserted for external-source components.
- In this atlas: Catalogued; no normalized observations in this atlas.
- Method: Biennial waste generation by NACEactivity, waste category and hazardous status. Includes mineral/construction waste beyond municipal scope.
- Units: Metric tonnes for mass; percentages and tonnes/person where specified. Original values and units retained.
- Transformations: Adapter pattern implemented by JSON-stat normalizer. Fullactivity/wastetype cube not acquired in this iteration.
- Retrieved: 2026-09-19

## Treatment of waste by treatment operation

- ID: `eurostat-waste-treatment` · **catalogued**
- Publisher: Eurostat
- Dataset / edition: env_wastrt · Live database
- Coverage: Biennial series; coverage varies · Europe
- Source: [Treatment of waste by treatment operation](https://ec.europa.eu/eurostat/databrowser/view/env_wastrt/default/table)
- License: Eurostat reuse policy: attribution required, third-party exceptions apply. No separate licence is asserted for external-source components.
- In this atlas: Catalogued; no normalized observations in this atlas.
- Method: Waste treatment by category, hazardousness and operation, including recovery/backfilling/disposal. Geography describes treatment, not origin of waste.
- Units: Metric tonnes for mass; percentages and tonnes/person where specified. Original values and units retained.
- Transformations: Registered; must keep treatment and generation boundaries separate.
- Retrieved: 2026-09-19

## Waste electrical and electronic equipment

- ID: `eurostat-weee` · **catalogued**
- Publisher: Eurostat
- Dataset / edition: env_waseleeos · Open-scope WEEE reporting
- Coverage: Open-scope seriesfrom2018 · Europe
- Source: [Waste electrical and electronic equipment](https://ec.europa.eu/eurostat/databrowser/view/env_waseleeos/default/table)
- License: Eurostat reuse policy: attribution required, third-party exceptions apply. No separate licence is asserted for external-source components.
- In this atlas: Catalogued; no normalized observations in this atlas.
- Method: Placed-on-market, collected, recovered and recycled electrical/electronic equipment by category. Scope changes from previous10categoryseries must be handled explicitly.
- Units: Metric tonnes for mass; percentages and tonnes/person where specified. Original values and units retained.
- Transformations: Registered; SDG electronicwaste quantities already incorporate some Eurostat observations. Do not duplicate them in totals.
- Retrieved: 2026-09-19

## Regional Plastics Outlook for Southeast and East Asia

- ID: `oecd-regional-plastics-2025` · **catalogued**
- Publisher: OECD
- Dataset / edition: Regional Plastics Outlook · 2025edition
- Coverage: Historicalbaselineandscenarios · SoutheastandEastAsia
- Source: [Regional Plastics Outlook for Southeast and East Asia](https://www.oecd.org/en/topics/sub-issues/plastics.html)
- License: OECD publication-specific terms; most postJuly2024 written contentCCBY4.0; verify dataset third-party rights.
- In this atlas: Catalogued; no normalized observations in this atlas.
- Method: Regionalplastics model with historical estimates and future policy scenarios. Should complement global2019baseline, not silently replace with projected2030/2050values.
- Units: Metric tonnes for mass; percentages and tonnes/person where specified. Original values and units retained.
- Transformations: Publication existence verified on officialOECDpublicationlisting; tables not acquired.
- Retrieved: 2026-09-19

## Material stocks in a circular economy

- ID: `eea-material-stocks-2026` · **catalogued**
- Publisher: European Environment Agency
- Dataset / edition: Material stocks in Europe · 2026report
- Coverage: 2022 · EU27
- Source: [Material stocks in a circular economy](https://www.eea.europa.eu/en/analysis/publications/material-stocks-in-a-circular-economy)
- License: EEAreuse policy; underlyingBOKUMAT_STOCKSdataCCBY4.0, figure-specificterms apply.
- In this atlas: Catalogued; no normalized observations in this atlas.
- Method: EEA2022stock estimates build onWiedenhoferet al.2024/2025. Different editionfrom downloadedMAT_STOCKSglobal2016.
- Units: Metric tonnes for mass; percentages and tonnes/person where specified. Original values and units retained.
- Transformations: Report verified. Updated2022countryvalues not automatically acquired; do not label2016CSVas2022.
- Retrieved: 2026-09-19

## BACI — reconciled international trade

- ID: `cepii-baci-202601` · **blocked**
- Publisher: CEPII
- Dataset / edition: BACI HS22 bilateral HS6 trade value and quantity · 202601 (January 2026)
- Coverage: 2022–2024 for HS22; other harmonizations extend to 1995 · About 200 reporting economies and their partners; HS6 product coverage.
- Source: [BACI — reconciled international trade](https://www.cepii.fr/DATA_DOWNLOAD/baci/doc/baci_webpage.html)
- License: Etalab Open Licence 2.0; attribution to BACI and CEPII required.
- In this atlas: No display data. See the access and method notes.
- Method: Public download verified. BACI reconciles importer/exporter reports using reporter-reliability weighting and CIF/FOB treatment; therefore it is a separate harmonized statistical product, not direct observations equivalent to UN Comtrade netWgt. Do not silently replace missing reported weights with BACI quantities or sum both databases. Latest-year figures can be revised. Bulk zip is 301,386,611 bytes; full raw matrix not bundled in this expansion.
- Units: Trade quantity q is metric tonnes. Trade value v is thousands of current USD; never used here to infer mass.
- Transformations: Catalogue and access/methodology review only. No data inserted into the atlas.
- Retrieved: 2026-09-19

## Basel Convention — transboundary hazardous and other wastes

- ID: `basel-national-reporting` · **partial**
- Publisher: Secretariat of the Basel, Rotterdam and Stockholm Conventions
- Dataset / edition: Basel national reporting: import/export waste movements and waste-management facilities · National reporting Table 4 exports, OData snapshot 2026-09-19
- Coverage: 2023–2024 snapshot · Reporting Parties with valid destination and mass values; country/report coverage differs by year. Missing reports do not imply no waste movements.
- Source: [Basel Convention — transboundary hazardous and other wastes](https://www.basel.int/Countries/NationalReporting/NationalReports/BC2024Reports/tabid/10394/Default.aspx)
- License: Basel Convention website Terms of Use; no dataset-specific open redistribution licence verified.
- In this atlas: Pinned source snapshot. Country, year and unit limits are retained.
- Method: Acquired official public OData Table 4 export records for 2023 and 2024. Retain Basel Annex/Y/national waste codes, hazardous characteristics, intended recovery/disposal codes and survey-section lineage. Table 5 imports are not merged with Table 4 exports. Controlled wastes include hazardous and other wastes; do not equate the aggregate with hazardous waste alone, HS scrap or verified recycling.
- Units: Reported Amount in metric tons, confirmed by Basel national-reporting manual Table 4. Numeric values retained in metric tonnes; original strings retained.
- Transformations: Parse unambiguous positive decimal Amount strings; Trim and uppercase ISO2 codes, then resolve ISO3 using the UN Statistics Division M49 table. Retain all valid detail records, and aggregate distinct survey sections by origin, destination and year for optional routes. Reject missing/ambiguous quantities and unsupported countries. No inferred countries, missing-to-zero conversion, classification crosswalk or mirror filling.
- Retrieved: 2026-09-19

## Eurostat Comext — detailed physical goods trade

- ID: `eurostat-comext` · **blocked**
- Publisher: Eurostat / European Commission
- Dataset / edition: International trade in goods, detailed Comext monthly and annual datasets · Live bulk-download catalogue reviewed September 2026
- Coverage: January 1988–latest reference month · EU, euro area, member countries and many non-EU partners.
- Source: [Eurostat Comext — detailed physical goods trade](https://ec.europa.eu/eurostat/web/international-trade-in-goods/database)
- License: European Commission reuse policy applies; verify source-specific attribution and third-party exclusions before numerical publication.
- In this atlas: No display data. See the access and method notes.
- Method: Primary EU customs/statistical trade complement. Preserve Combined Nomenclature revision, declarant, partner, trade flow, confidentiality and estimate flags. Use net mass fields and their published scale only; supplementary units cannot be treated as tonnes. Bulk CSV download access documented; no physical observations acquired in this expansion.
- Units: Native units; no conversion applied because no numerical observations are bundled.
- Transformations: Catalogue and access/methodology review only. No data inserted into the atlas.
- Retrieved: 2026-09-19

## UNCTAD — global trade in plastics

- ID: `unctad-plastics-trade` · **blocked**
- Publisher: UN Trade and Development (UNCTAD)
- Dataset / edition: Global trade in plastics across the value chain · Data-centre catalogue reviewed September 2026
- Coverage: Release-dependent · Global bilateral trade, subject to source reporting and classification coverage.
- Source: [UNCTAD — global trade in plastics](https://unctadstat.unctad.org/datacentre/dataviewer/US.PlasticsTrade)
- License: UNCTAD data terms; dataset-specific reuse conditions not verified in this acquisition.
- In this atlas: No display data. See the access and method notes.
- Method: Candidate concordance and cross-check for plastic feedstocks, primary plastics, goods and scrap. Quantity coverage must be inspected independently of monetary coverage. Data-centre endpoint was not accessible in this environment; no observations acquired or shown.
- Units: Native units; no conversion applied because no numerical observations are bundled.
- Transformations: Catalogue and access/methodology review only. No data inserted into the atlas.
- Retrieved: 2026-09-19

## WITS — UN Comtrade access and concordances

- ID: `worldbank-wits-comtrade` · **blocked**
- Publisher: World Bank
- Dataset / edition: World Integrated Trade Solution: UN Comtrade access, classifications and concordances · Current catalogue
- Coverage: Depends on underlying UN Comtrade extraction · Underlying reporter/partner coverage.
- Source: [WITS — UN Comtrade access and concordances](https://wits.worldbank.org/videos/bulk-download-un-comtrade.html)
- License: WITS and underlying provider conditions. Not a separate open licence for Comtrade data.
- In this atlas: No display data. See the access and method notes.
- Method: Secondary access path and concordance resource, not an independent source to add to Comtrade totals. Bulk download and advanced queries may need an account; landing page returned HTTP403 during direct acquisition. No duplicate trade observations ingested.
- Units: Native units; no conversion applied because no numerical observations are bundled.
- Transformations: Catalogue and access/methodology review only. No data inserted into the atlas.
- Retrieved: 2026-09-19

## UNdata — Comtrade access mirror

- ID: `undata-comtrade` · **blocked**
- Publisher: United Nations Statistics Division
- Dataset / edition: UNdata ComTrade explorer · Current catalogue
- Coverage: Underlying Comtrade table-specific coverage · Underlying UN Comtrade reporter/partner coverage.
- Source: [UNdata — Comtrade access mirror](https://data.un.org/Explorer.aspx?d=ComTrade)
- License: United Nations and underlying Comtrade terms.
- In this atlas: No display data. See the access and method notes.
- Method: Alternative access path for the same Comtrade observations. Do not combine mirror totals as independent evidence. Explorer accessible; no separate numerical acquisition was needed because the current official Comtrade preview API supplied the selected physical flows.
- Units: Native units; no conversion applied because no numerical observations are bundled.
- Transformations: Catalogue and access/methodology review only. No data inserted into the atlas.
- Retrieved: 2026-09-19

## UN M49 — countries, territories and ISO codes

- ID: `unsd-m49` · **available**
- Publisher: United Nations Statistics Division
- Dataset / edition: Standard country or area codes for statistical use (M49) · Table snapshot 2026-09-19
- Coverage: Current classification snapshot · Countries and areas in UN M49.
- Source: [UN M49 — countries, territories and ISO codes](https://unstats.un.org/unsd/methodology/m49/overview/)
- License: United Nations website terms; country-code reference data with source attribution.
- In this atlas: Official country-code metadata acquired for reporter/partner validation; no mass quantities.
- Method: Authoritative ISO-alpha2 / ISO-alpha3 / M49 lookup used to normalize Basel reporting country identifiers. Trade reporter codes must still follow Comtrade metadata: current India is 699 and United States 842, which differ from M49.
- Units: Country identifiers, not mass or population values.
- Transformations: Extract ISO2/ISO3 correspondence from the official HTML table, discarding headers and duplicate language rows. No material quantities derived.
- Retrieved: 2026-09-19

## Release 3 amendments

The current registry is `public/data/v3/sources.json` (67 entries). Eurostat waste-treatment and WEEE sources are now acquired and visible, with 20,502 canonical cells and complete source lineage; see `expanded/destinations/README.md`. Germany's WEEE geography is suppressed through aggregation and is not rendered as a domestic/foreign split. Hungary reports first treatment. Parent operations and child operations are never summed together. Treatment is distinct from the fate of a selected Comtrade shipment.

Basel quantitative republication is blocked after inspection of explicit derivative-reuse restrictions. Public route/detail artifacts have been removed; exact terms, manuals, legacy operation schema and offline adapter are in `expanded/basel-methods`. Eurostat Kosovo observations have also been withdrawn from public assets under source geographic reuse exceptions. `build_release.py` enforces the current publication policy and records inherited artifact hashes and withdrawals. Earlier counts and source notes above describe the prior release, not the current publication.
