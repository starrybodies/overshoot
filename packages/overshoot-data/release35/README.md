# Release 35: industrial capacity by country

Four public summary tables from Global Energy Monitor were downloaded on 25 September 2026 from the tracker pages linked below. Original CSVs and SHA-256 digests are retained in `raw/` and the published JSON. Run `python packages/overshoot-data/release35/import_gem.py` to rebuild the output.

| Source | Edition | Retained scope | Published output |
| --- | --- | --- | --- |
| [Global Cement and Concrete Tracker](https://globalenergymonitor.org/projects/global-cement-concrete-tracker) | July 2026 | Rated operating cement and clinker capacity, plus plant type counts for 171 countries and areas | `public/data/v35/cement-country.json` |
| [Global Iron and Steel Tracker](https://globalenergymonitor.org/projects/global-iron-steel-tracker) | June 2026 (V1) | Rated operating steelmaking capacity by BOF/EAF/other for 79 countries and areas; plant counts for 84 | `public/data/v35/steel-country.json` |

These are country aggregates. They are not facility coordinates, production, material shipments, or supplier relationships. The stage-map dots come from the separate Climate TRACE facility inventory and should not be added to the GEM country plant counts. GEM's operating category includes operating pre-retirement assets. The steel tracker generally covers plants at or above 500,000 tonnes/year, so an absent plant is not proof of no steel industry. Five countries have a plant count but no numeric capacity row in the public summary; they remain null.

Steel's original capacity unit is thousand metric tonnes per annum (TTPA). The derivative divides by 1,000 for million metric tonnes per annum (Mtpa). No missing capacity or country is estimated. The publisher's world totals are retained independently; summed one-decimal country values can differ from the world line. Country name aliases are explicit in the import script and unmatched names fail the build. GEM data are [CC BY 4.0](https://globalenergymonitor.org/creative-commons-license); attribute Global Energy Monitor, the tracker and edition when reusing these derivatives.
