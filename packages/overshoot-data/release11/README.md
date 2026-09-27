# Worldwide place experience

The directory uses the retained UN Statistics Division M49 country/area table in `expanded/trade/raw/un-m49-table.json`, merged with existing reporting IDs. Repeated source header rows are excluded by strict ISO alpha-code validation. Taiwan's existing reporting ID is preserved. The result contains 249 selectable countries and areas; administrative status is not inferred from selectable entries.

`build.py` produces a coverage index from the actual retained account, waste-indicator, Comtrade, Basel, and site records. Counts describe availability, not real-world activity, completeness or zero activity. Years and import/export declaration bases remain distinct. No new quantities are modeled or estimated. `geography.mjs` adds missing country anchors from the retained Natural Earth 1:50m shapes; a centroid is neither a port nor a facility.

Regenerate from the checkout root:

```
python packages/overshoot-data/release11/build.py
node packages/overshoot-data/release11/geography.mjs
```

Primary geography reference: https://unstats.un.org/unsd/methodology/m49/
Basemap reference: https://www.naturalearthdata.com/downloads/50m-cultural-vectors/
All statistical records retain the provenance in their existing releases.

The interface remains English. Country-name search includes English, ISO codes, the browser locale and selected additional language aliases. Number formatting follows the browser locale after hydration. No automatic geolocation is requested and a language is never treated as a home country.
