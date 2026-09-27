"""Primary-source discovery register. Catalogued is not the same as integrated."""
import json
from pathlib import Path

P = Path(__file__).parent
entries = []

def add(id, title, publisher, dataset, edition, year, coverage, url, license, method, units,
        geography, access, barrier, docs=(), scenes=('extraction', 'flow')):
    entries.append({
        'id': id, 'title': title, 'publisher': publisher, 'dataset': dataset,
        'edition': edition, 'publicationYear': year, 'coverageYears': coverage, 'url': url,
        'citation': f'{publisher}. {dataset}. {edition}. Source inspected 19 September 2026.',
        'license': license, 'retrievedAt': '2026-09-19', 'method': method,
        'units': units, 'transformations': 'No quantitative transformation or browser data published from this catalog entry.',
        'geographicCoverage': geography, 'temporalCoverage': coverage,
        'status': 'blocked' if access in ('license-required','access-blocked') else 'partial',
        'integrationStatus': 'catalogued', 'access': access, 'blocker': barrier,
        'sourceDocumentation': list(docs), 'scenes': list(scenes),
    })

fao_terms='https://www.fao.org/contact-us/terms/db-terms-of-use/en/'
fao_index='https://bulks-faostat.fao.org/production/datasets_E.json'
fao_license='CC BY 4.0 plus FAO Statistical Database Terms of Use; verify third-party exceptions and retain attribution/no endorsement.'
add('faostat-forestry','FAOSTAT · Forest products','FAO','Forestry Production and Trade (FO)',
    'Bulk metadata updated 9 January 2026',2026,'Annual; exact series coverage varies by product',
    'https://www.fao.org/faostat/en/#data/FO',fao_license,
    'Roundwood removals and production/trade of wood, pulp and paper products. Preserve primary versus processed product distinctions.',
    'Cubic metres and tonnes by product. Do not convert timber volume to tonnes without a documented density basis.',
    'Global countries and territories','open-download','Catalogued. Product/unit adapter and selected snapshot not yet normalized.',[fao_terms,fao_index])
add('faostat-food-balances','FAOSTAT · Food supply and uses','FAO','Food Balances (FBS)',
    'Bulk metadata updated 28 October 2025',2025,'2010 onward; annual',
    'https://www.fao.org/faostat/en/#data/FBS',fao_license,
    'Country commodity balances separate food, feed, seed, processing, stocks, trade and losses. They do not measure all food waste after sale.',
    'Commodity-specific tonnes, nutrient/energy and per-person measures; preserve the element unit.',
    'Global countries/territories','open-download','Catalogued. Resolve product overlap and exact mass-unit elements before integration.',[fao_terms,fao_index],('extraction','flow','discard'))
add('faostat-supply-utilization','FAOSTAT · Agricultural supply–use accounts','FAO','Supply Utilization Accounts (SCL)',
    'Bulk metadata updated 1 November 2025',2025,'2010 onward; annual',
    'https://www.fao.org/faostat/en/#data/SCL',fao_license,
    'Detailed crop/livestock commodity supply and utilization. Complements FBS; not an independent mass quantity to add to it.',
    'Source item/element units including tonnes; processed outputs must not be added to raw input totals.',
    'Global countries/territories','open-download','Catalogued. Detailed balance adapter not yet normalized.',[fao_terms,fao_index],('extraction','flow','discard'))
add('faostat-trade-matrix','FAOSTAT · Agricultural trade matrix','FAO','Detailed Trade Matrix (TM)',
    'Bulk metadata updated 23 December 2025',2025,'Annual; commodity-specific coverage',
    'https://www.fao.org/faostat/en/#data/TM',fao_license,
    'Physical and monetary bilateral food/agriculture trade. Compiled from UNSD, Eurostat and national sources with partner-data adjustments; overlaps Comtrade.',
    'Only reported quantity units may become physical flows. Never infer weight from trade value.',
    'Reporting countries and partners worldwide','open-download','Catalogued. Large bulk archive; use a selected commodity/reporting subset and retain source flags.',[fao_terms,fao_index],('flow',))
add('faostat-fishstat','FishStat · Aquatic biomass','FAO','Fisheries and Aquaculture statistics',
    'Current corporate statistical database',None,'Coverage depends on capture, aquaculture and trade collection',
    'https://www.fao.org/fishery/en/fishstat',fao_license,
    'Separate wild capture from aquaculture and product trade; conversion between product weight and live weight must be explicit.',
    'Source series include live-weight tonnes and product-specific weights.',
    'Global countries/areas and fisheries reporting areas','open-download','Catalogued; specific collection snapshot and live-weight conventions need validation.',[fao_terms])
add('usgs-minerals-2026','USGS · Mineral commodities','U.S. Geological Survey',
    'Mineral Commodity Summaries 2026; Minerals Yearbook','2026 edition',2026,'2026 report: five-year series; country world-production tables vary',
    'https://www.usgs.gov/centers/national-minerals-information-center/mineral-commodity-summaries',
    'USGS-authored federal data are public domain unless marked otherwise; third-party content retains its rights.',
    'Commodity production, reserves, apparent consumption and recycling details for more than 90 minerals/materials. Gross ore, contained metal and processed product are different mass bases.',
    'Commodity-specific units (including metric tonnes and contained-metal tonnes); no universal ore conversion.',
    'United States and world country tables','access-blocked',
    'Official report/catalogue verified. Data-release DOI returned HTTP 403 in this environment; no source workbook snapshot acquired.',
    ['https://doi.org/10.5066/P1WKQ63T','https://pubs.usgs.gov/periodicals/mcs2026/mcs2026.pdf','https://www.usgs.gov/information-policies-and-instructions/copyrights-and-credits'])
add('bgs-world-minerals','BGS · World mineral statistics','British Geological Survey',
    'World Mineral Statistics','World Mineral Production 2020–2024',2026,'Archive from 1913; machine-readable production from 1970',
    'https://www.bgs.ac.uk/mineralsuk/statistics/world-mineral-statistics/',
    'Non-commercial academic/research use permitted; third-party redistribution/commercial use requires applicable copyright-holder or NERC permission.',
    'Country commodity production for over 70 mineral commodities. API suppresses some publication symbols into null/zero; do not interpret every null as missing or every zero as measured nil.',
    'Commodity-specific source units and ore/metal bases.',
    'Countries worldwide','license-required','Catalogued. Redistribution terms must be resolved before publishing source tables.',
    ['https://www.bgs.ac.uk/mineralsuk/statistics/world-mineral-statistics/bgs-mineral-statistics-terms-and-conditions-ipr/','https://www.bgs.ac.uk/mineralsuk/statistics/world-mineral-statistics/world-mineral-statistics-data-download/'])
eu_terms='https://commission.europa.eu/legal-notice_en'
add('eurostat-ew-mfa','Eurostat · Economy-wide material accounts','European Commission / Eurostat',
    'env_ac_mfa; env_ac_mfadpo; env_ac_mfabi','Current Eurostat datasets',None,'Annual; exact range varies by country and table',
    'https://ec.europa.eu/eurostat/databrowser/view/env_ac_mfa/default/table?lang=en',
    'EU reuse policy: CC BY 4.0 unless a dataset carries a specific exception; confirm metadata at acquisition.',
    'National statistical accounts of extraction, direct trade and DMC; companion datasets add processed outputs and balancing items. Regional quality cross-check of IRP, not additional global mass.',
    'Selected unit must be validated; thousand tonnes must be multiplied by 1,000 for normalized tonnes.',
    'EU and reporting European countries','open-api','Catalogued. Preserve reporting flags, residence/territory conventions and edition differences.',
    ['https://ec.europa.eu/eurostat/cache/metadata/en/env_ac_mfa_sims.htm',eu_terms])
add('eurostat-material-footprint','Eurostat · Material footprints','European Commission / Eurostat',
    'Material footprints / raw material equivalents (env_ac_rme)','Current Eurostat dataset',None,'Annual; country and model coverage varies',
    'https://ec.europa.eu/eurostat/cache/metadata/en/env_ac_rme_esms.htm',
    'EU reuse policy: CC BY 4.0 unless specifically excepted.',
    'Modelled raw-material consumption based on material-flow accounts. Alternative to the IRP footprint model; do not splice versions or mix national and EU aggregate boundaries.',
    'Source unit selection required; retain model and scale metadata.',
    'EU and available European country estimates','open-api','Catalogued. An independent model comparison requires matched years and definitions.',[eu_terms])
add('oecd-material-resources','OECD · Material resources','OECD',
    'Material resources / material consumption','Current OECD Data Explorer',None,'Annual; coverage depends on metric/country',
    'https://www.oecd.org/en/data/indicators/material-consumption.html',
    'OECD data terms permit reuse with credit, including commercial use, except additional dataset/third-party restrictions.',
    'DMC is extraction plus imports less exports. This overlaps IRP/Eurostat accounts and is useful for reconciliation and national quality flags.',
    'Indicator page uses tonnes/person; underlying table contains metric-specific units.',
    'OECD and available partner countries','open-api','Catalogued. Exact versioned SDMX dataflow/export not pinned in this pass.',
    ['https://www.oecd.org/en/about/terms-conditions.html'])
add('un-sdg-materials','UN SDG · Material footprint and consumption','UN Statistics Division / UNEP',
    'SDG 12.2.1 and 12.2.2 (also 8.4.1/8.4.2)','Metadata updated 28 March 2025',2025,'Metadata documents 2000–2023; database refreshes separately',
    'https://unstats.un.org/sdgs/dataportal',
    'UN/UNEP source-specific terms; no Creative Commons licence inferred.',
    'International reporting of MF/DMC totals and ratios. Country validation can replace global model values. Source metadata warns that some zero values reflect source missing-data imputation; do not treat them as verified absence.',
    'Metric and per-capita/per-GDP series have different units; select exact series code and units.',
    'About 160 footprint countries per metadata; coverage varies','open-api','Catalogued. Overlaps IRP; should serve as a separately versioned validation source, not be merged silently.',
    ['https://unstats.un.org/sdgs/metadata/files/Metadata-12-02-01.pdf','https://unstats.un.org/SDGAPI/swagger/'])
add('exiobase-3-10-2','EXIOBASE · Supply-chain footprints','EXIOBASE consortium / XIO Sustainability Analytics',
    'EXIOBASE 3 EE-MRIO','3.10.2; published 13 May 2026',2026,'Annual tables; core updates to 2022 and later nowcasts as documented',
    'https://zenodo.org/records/20051562',
    'Customized non-commercial academic CC-BY-SA-NC derivative for v3.9+; commercial license separate. Latest record supersedes stale general-homepage license wording.',
    'Industry/product environmental input-output model. Monetary transaction matrices are not shipment-tonne data. Material extensions overlap IRP inputs and require matrix calculations to form consumption footprints.',
    'Economic core: million EUR; environmental extensions have independent units.',
    '44 countries and 5 rest-of-world regions','license-required','Catalogued. Current license does not establish permission for Gaia commercial-product redistribution.',
    ['https://exiobase.eu/'])
add('eora2','Eora2 · Global supply-chain accounts','KGM & Associates / Eora',
    'Eora2 Global Supply Chain Database','Current Eora2 release',None,'1990–2024',
    'https://www.eora.org/',
    'Active subscription/license required; eligible academic use has separate free license. Eora1 licenses do not transfer.',
    'MRIO model with national industry classifications and a reduced environmental satellite set compared with Eora1. Monetary flows cannot be represented as physical shipments.',
    'Economic-account and satellite-specific units; require licensed metadata.',
    '190 countries','license-required','No licensed credential available. Do not acquire or redistribute restricted tables.',
    ['https://worldmrio.com/'])
add('ghsl-pop-built','GHSL · Population and built environment','European Commission Joint Research Centre',
    'GHS-POP, GHS-BUILT-S/V; GHS-WUP population and built-up projections','R2023A and R2025A',2025,
    '1975–2030 at five-year steps; WUP projections extend to 2100',
    'https://human-settlement.emergency.copernicus.eu/datasets.php',
    'Open reuse with source acknowledgement under the published GHSL terms.',
    'Spatial context and population exposure. Separate historical estimates from projections. Built area and volume are not material mass.',
    'People per cell; square metres; cubic metres. No conversion to tonnes without a separate calibrated model.',
    'Global raster grids','open-download','Catalogued. Raster acquisition, aggregation and tiling needed; native IRP population remains the current denominator.',
    [],('stock','discard','extraction'))
add('worldpop','WorldPop · Population geography','WorldPop / University of Southampton',
    'WorldPop population counts and density','Current WorldPop Hub',None,
    'Year and projection coverage vary by population product',
    'https://hub.worldpop.org/',
    'CC BY 4.0, with dataset-specific citation.',
    'Gridded demographic estimates for local exposure and per-person analysis. Select a consistent population product/year; do not substitute national gaps using regional values.',
    'Population counts or density as defined by each raster.',
    'Global country products; coverage varies','open-download','Catalogued. No gridded raster normalized; avoid changing the IRP series denominator silently.',
    [],('extraction','discard'))
add('unsd-energy','UN Energy · Fossil-fuel balances','United Nations Statistics Division',
    'Energy Statistics Database / UNdata DF_UNDATA_ENERGY','Current UNSD annual release',None,
    'Full archive from 1950; public online series from 1990',
    'https://unstats.un.org/unsd/energystats/data/',
    'UNSD permits attributed non-profit reuse; other uses require contacting UNSD. Full archive is separately distributed.',
    'Production, trade, conversion and end use of fuels, electricity and heat. Fossil fuel mass is only a subset; energy quantities do not equal tonnes.',
    'Native metric tonnes, volume, GWh or terajoules depending on series. Preserve original units.',
    'More than 230 countries/territories','license-required','Catalogued. Resolve redistribution terms and select physical-mass series before integration.',
    ['https://data.un.org/WS','https://data.un.org/SdmxBrowser'])
add('gloria-mrio','GLORIA · Global resource input-output accounts','IELab / University of Sydney',
    'Global Resource Input-Output Assessment (GLORIA)','Release not pinned',None,
    'Exact release/year coverage requires archive metadata',
    'https://www.ielab.info/resources/gloria',
    'License not verified for a specific release.',
    'Candidate high-resolution MRIO for upstream resource attribution. Keep independent from direct physical shipment statistics and from the existing IRP national accounts.',
    'Economic matrix and satellite units must be acquired from release metadata.',
    'Global model; release-specific geography not yet verified','access-blocked','Landing page reachable but metadata did not render in the research tool; no specific archive or values acquired.',
    [])

(P / 'research-catalog.json').write_text(json.dumps(entries, indent=2, ensure_ascii=False))
print(f'Wrote {len(entries)} complementary source-family entries')
