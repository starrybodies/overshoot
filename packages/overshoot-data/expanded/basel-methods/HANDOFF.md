# Basel destination and declared-operation research

**Publication decision:** keep the quantitative records and derived artifacts offline. The current [Basel Terms of Use](https://www.basel.int/Home/TermsofUse/tabid/10656/Default.aspx), Introduction §1, permits personal/non-commercial copying but does not grant rights to compile, create derivatives, or commercially redistribute. No separate data reuse permission was verified. This is a concrete correction to the existing registry's less specific licence note. Show a source-linked unavailable state in the public release. Do not label this source openly licensed.

`source-registry.json` contains a **replacement entry** for `basel-national-reporting` with `status: blocked` and the specific licence blocker, plus three methodological reference entries. `raw/terms-of-use.html` is the exact terms snapshot. `snapshots.json` gives URL, date, bytes and SHA-256 for every new reference.

## Reporting semantics

The [2025 reporting manual](https://www.basel.int/Portals/4/download.aspx?d=UNEP-CHW-NationalReporting-Manual-2025.English.docx), Tables 4–5, identifies the unit as metric tons. Table 4 is export reporting and Table 5 import reporting. For general notifications containing several movements, Parties are told to aggregate movement-document quantities received at the facility, assigned to the reporting year by arrival date.

The D/R code is the operation **the waste was destined for**. It is not independent verification that treatment was completed, material was actually recycled, or pollution was prevented. The dataset's destination is a country; it does not identify a receiving facility. A record may summarize several movements, so call them reporting records, not individual shipments.

The [Annex IV amendment](https://www.basel.int/TheConvention/Amendments/AmendmenttoAnnexIV/Overview/tabid/10270/Default.aspx) adopted in 2025 takes effect on **1 January 2030**. The 2023–2024 observations use legacy D1–D15 and R1–R13. R14 is not back-applied. The current [2025 Convention PDF](https://www.basel.int/Portals/4/download.aspx?e=UNEP-CHW-IMPL-CONVTEXT-2025.English.pdf) still carries the applicable legacy Annex IV.

## Classification

`operations.json` and `types.ts` provide a typed 28-code lookup with concise editorial labels. Native codes remain authoritative. `normalize.py` enriches existing records while preserving every original field, unit, quantity, survey ID, section number and raw snapshot pointer.

- R12/R13 and D13/D14/D15 are intermediate steps. They cannot demonstrate final recycling or disposal.
- D8/D9 describe treatment that produces material for further disposal; they are kept separately as pretreatment.
- R1 is energy recovery, distinct from material recovery. R10 is beneficial land treatment, also kept separate.
- Multiple codes, even D1 + D5 in the same broad group, are kept in `multiple_operations`. No amount is divided or counted against each code. Their sequence is unknown.
- Unknown placeholders D_/R_ and missing codes stay `unspecified`. Only whitespace and case are normalized.
- Every record contributes once to one operation category. No Comtrade crosswalk, mirror filling, facility join, completion inference, or missing-as-zero behavior.

`offline/destinations.json` contains 2,043 disjoint country-pair/year/category groups, derived from the 17,314 existing records and 1,152 country-pair/year routes. `offline/records/{ISO3}.json` preserves all original fields plus classification. Every output has a public-publication block. These outputs are for local evaluation only.

## Validation

The adapter verified original-field identity, positive source quantities, unique source record IDs, exactly one group assignment per record, and exact Decimal mass conservation across every route/year. All 1,152 original route totals reconstruct to within 0.000001 tonnes after JSON numeric conversion. Six fixtures cover intermediate, pretreatment, multiple codes, unknown placeholders and whitespace/case normalization.

Rebuild locally with:

```sh
python normalize.py --input /absolute/path/to/expanded/trade/basel.json
```

No files in the Site checkout were modified. Do not copy `raw/` or `offline/` into public data assets.
