# OVERSHOOT release 13 — energy coverage and feed acquisition

This release repairs the fuel page's default (a sparse bilateral-trade sample), adds an explicit physical-energy account, and makes source acquisition gaps visible.

The current import has 20 measures and 135,334 numeric observations across 218 modern countries/areas over the retained history. Fifteen EIA annual measures begin in 1980 where available. Five JODI oil measures retain January 2025–June 2026. Country coverage varies by measure and period. These are reviewed snapshots, not an automatically refreshing service.

## Reproduce offline

From the repository root:

```sh
python packages/overshoot-data/release13/build.py
python packages/overshoot-data/release13/validate.py
python packages/overshoot-data/release13/feed_register.py
```

The compressed files in `raw/` retain the original EIA series (including original data and metadata) and the selected original JODI CSV rows. `raw/downloads.json` records complete source archive URLs, byte counts, SHA-256 hashes and acquisition dates. The full bulk archive is not served to app visitors.

## Acquire a new candidate

```sh
python packages/overshoot-data/release13/acquire.py --output /tmp/overshoot-energy-candidate
```

Compare the new hashes, source releases and coverage with `raw/downloads.json` and `coverage-validation.json`. Review the explicit allowlist in `energy_config.py`, including year-specific JODI download paths. When a candidate is ready, normalize it with `build.py --input /tmp/overshoot-energy-candidate`, run the validator and review the data diff before publication. An upstream error never changes the published site; publication is a separate validated step. The candidate acquisition does not overwrite the release.

## Dimensions and units

- EIA records retain the product/activity/unit/frequency series ID. Country identity comes from the series ID, not its `geography` field: regional and IEO series can have the same country-valued geography as a national series. Only modern country series and the original WORL aggregate are retained. Historical and regional codes are listed in `coverage-validation.json` and are not remapped onto present-day states.
- Crude oil includes lease condensate in EIA. JODI's crude definition is kept separate. They are never stitched into one history or silently used to fill each other's gaps.
- EIA thousand barrels/day and JODI KBD are multiplied by 1,000 to display barrels/day. These are rates. They are not summed into annual/monthly volumes. No barrel-to-tonne conversion is attempted.
- EIA BCM is retained as billion m³ on the publisher's dry-gas basis. It is not liquid LNG volume, energy content or mass.
- EIA MT means **1,000 metric tonnes**, not megatonnes. The factor to displayed tonnes is 1,000. Metallurgical coal is a subset of total coal and is not added to it.
- Original null and non-numeric values survive alongside the normalized null. Zero survives only when reported by the source. Negative source values, if present, are not silently clipped.
- JODI assessment codes 1–4 survive on every record. EIA's bulk file has no observation-level estimate flags, so the app never invents an “official observation” confidence flag.
- Latest annual years can have partial coverage. The default is the newest year with at least 90% of the maximum country count for that measure. The newest partial year remains selectable. Monthly views default to the latest numeric month and show reporting gaps explicitly.
- No regional or world totals are constructed from the displayed sample. World values are retained only from the original EIA world series. The “Middle East” filter is a disclosed 16-country/area browsing selection, not a source statistical region.
- Gas and coal imports/exports are national totals, not bilateral destination records. Oil consumption is broader than crude production. No material balance is forced, no reserves are inferred, and no transport routes are invented.

## Validation and access research

`validate.py` matches **every** published numeric and missing observation to its original series or CSV row, checks duplicate keys, geography, period coverage, native units/rights, nulls and zeros, and includes 16 current production checks across Saudi Arabia, UAE, Iran, Iraq, Qatar, Kuwait, Oman and Bahrain. It explicitly verifies that a missing UAE JODI report stays missing even though EIA has an annual value.

`feed_register.py` publishes `public/data/v13/feeds.json` and a downloadable [source guide](../../../public/data/v13/source-guide.md). Twenty source families cover energy, minerals, production, waste, trade and local/facility evidence. Statuses distinguish imported snapshots, checked access, incomplete access and rights review. The full source catalogue now exposes incomplete and catalogued sources rather than hiding their gaps.

Access findings as of 22 September 2026:

- EIA INTL bulk and JODI 2025/2026 oil CSV downloads succeeded without API credentials.
- OWID's energy codebook and official UN Comtrade Python-client README were acquired. Their repositories supply useful traceable methods, not automatic permission to redistribute every upstream dataset.
- BGS OGC API returned a JSON sample; the published terms require a rights check before onward supply. Its documented flag transformations need the yearbook context.
- USGS MCS 2026 DOI metadata resolves and lists CC0. The ScienceBase table endpoint returned 403; no mineral quantities were invented as a substitute.
- Climate TRACE's data page, terms and API documentation are accessible. Its machine-readable schema response did not parse as JSON in this environment. No assets have been imported. Use emissions as emissions, with source-specific rights exceptions.
- JODI gas currently describes a CSV download but does not expose its link in the acquired page. EIA annual gas remains the usable feed here.
- Energy Institute's current edition asks for email verification; no signup was submitted. GEM tracker export access/terms need completion. CEPII BACI's official page returned 403.

There is no scheduled refresh, universal local waste feed, imported global fossil-fuel facility census or newly completed bilateral trade matrix in this release.
