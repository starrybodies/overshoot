# Regional waste and controlled-waste evidence

September 2026 source expansion for the material atlas. This is a retained,
dated snapshot, not live tracking or an assertion of worldwide completeness.

## Reproduce

Run `python packages/overshoot-data/release10/build.py` and
`node packages/overshoot-data/release10/maps.mjs` from the repository root.
The first command uses retained snapshots; it does not refetch current data.
`manifest.json` records public source URLs, retrieval dates and SHA-256 hashes.

## Sources and interpretation

- BC municipal disposal CSV: 945 observations, 27 reporting areas, 1990–2024.
  The interface exposes 2012–2024 because earlier reporting methods differ.
  Zero rates are treated as unavailable, following the province's own retained
  indicator code. Original cells remain inspectable and exportable. The 2024
  population method stops adjustments for tourism and other factors; changes
  across that break must not be described as waste-reduction performance alone.
- BC regional district WFS: 27 geometries representing 26 disposal reporting
  areas. Comox Valley and Strathcona share one observation. Northern Rockies
  municipality is in the data but absent from this regional-district layer;
  unincorporated Stikine is also absent. No polygon or observation is invented.
  Data is distributed under the Open Government Licence – British Columbia.
  Display geometry uses Douglas–Peucker simplification at 0.008 degrees,
  five-decimal coordinates, and D3-compatible spherical ring orientation.
  Simplified geometry is never used to calculate areas, distances or quantities.
- Basel Table 4 exports: 17,314 positive, unambiguous report sections across
  2023 (7,884, 92 exporters) and 2024 (9,430, 88 exporters); 103 distinct
  exporters across both years. Existing raw source files and normalization are
  retained under expanded/trade. Import mirrors are not added. Codes describing
  multiple operations do not duplicate a section's tonnage in filtered totals.
  R/D operations state where waste was destined, not verified completion.
  Sections aggregate movements; they are not individual shipment records.
- Basel code labels: short paraphrases from the retained Convention PDF,
  Annex I printed pp. 46–48, Annex II p. 49, Annex IV pp. 54–56 and Annex VIII
  pp. 67–72. A1160/A1170/A1180 were visually checked on PDF page 69 (printed
  p. 68). The A1180 label is historical for the 2023–2024 reports; the Secretariat
  overview states that e-waste classification amendments became effective on
  1 January 2025. Labels are not a full legal classification or an assay. A row
  with no reporter description is explicitly identified as a classification
  summary. Original codes and descriptions are preserved.
- Hartland December 2025 report, PDF p. 2: 2021–2025 annual quantities exclude
  blended biosolids. Those are a separate column, not added to the stated rate.
  CRD's 2024 population differs from the provincial indicator (464,934 versus
  460,317); the same 157,189 tonnes therefore has different rounded rates (338
  and 341 kg/person). 2025 population is projected. Other waste intake measures
  in other reports have different scopes and are not substituted here.
- OECD plastic fates: existing source-preserving metrics from the 2022 Global
  Plastics Outlook, reference year 2019, for World, Canada and USA. These are
  modeled all-plastic waste fates, not packaging-program outcomes. Recycling is
  ultimate recycling after losses. Five fate categories partition the generated
  waste estimate; 100 kg amounts are derived percentages. Mismanaged waste is
  not equated with ocean leakage. No later model year is inferred.
- Natural Earth 1:50m country geometry via installed world-atlas 2.0.2, replacing
  the coarser 1:110m basemap. Country and region anchors do not identify ports,
  physical shipping paths, factory connections or a particular object's route.

## Accuracy checks

Run `python packages/overshoot-data/release10/validate.py` for independently
reconciled source rows, reporting-area joins, missingness, fate partitions,
Hartland transcription and raw-snapshot hashes. Browser verification covers
district/year/measure changes, Basel filters and section detail, plastic
geography comparison, the copper mirror warning and facility marker sizing.

The copper warning exposes the already retained Chile–China HS2603 2024 mirror
check. It does not represent a systematic mirror audit. Neither declaration is
averaged, replaced or converted to a pure-copper equivalent.
