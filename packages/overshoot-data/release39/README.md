# Release 39 · USGS 2025 mineral production estimates

OVERSHOOT retains 63 numeric country-by-process observations from four commodity chapters of the [U.S. Geological Survey Mineral Commodity Summaries 2026](https://www.usgs.gov/publications/mineral-commodity-summaries-2026): copper, aluminium, lithium and iron/steel. The estimate columns are for 2025. The published artifact is `public/data/v39/usgs-minerals-2025.json`, created by `python packages/overshoot-data/release39/build.py`.

| Series | Original table basis | Country values | World total |
| --- | --- | ---: | ---: |
| Copper mine | Mine production, copper content | 14 | 23 million metric tonnes |
| Copper refinery | Refinery production, copper content | 17 | 29 million metric tonnes |
| Primary aluminium | Smelter production | 12 | 74 million metric tonnes |
| Lithium mine | Mine production, lithium content | 9 | 290,000 metric tonnes |
| Raw steel | Raw steel production | 11 | 1.9 billion metric tonnes |

The script keeps these as separate processes. Copper and aluminium values printed in *thousand metric tons* were multiplied by 1,000; raw steel printed in *million metric tons* was multiplied by 1,000,000. Lithium is already in metric tonnes. The original rounded world totals remain separate and should not be compared with a sum of the named rows as a completeness test. “Other countries” is not allocated. The US lithium mine figure is withheld and absent, not zero. The copper mine and refinery series must not be added together.

The USGS commodity PDFs were acquired as byte-for-byte copies in a [public PDF extraction repository](https://github.com/pranava0x0/usgs-mineral-commodity-summaries) because the execution network did not allow direct USGS downloads. We read the printed source tables, corrected a significant ambiguity in that repository's copper world-table extraction (its default `production_latest_year` is **refinery** production, not mine production), and transcribed the relevant 2025 columns directly. The official source URLs and PDF SHA-256 values are embedded per series. The upstream extraction repository is an acquisition route, not the source of authority for the numbers. USGS work is public domain.

These national estimates cannot be joined into a physical mine-to-smelter chain. The map colors countries for one process at a time. The named-facility and bilateral-trade views use different sources and boundaries. An estimate is labeled as such throughout the map and API.
