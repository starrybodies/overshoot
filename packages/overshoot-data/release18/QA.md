# Release 18 UX and data verification

## Findings addressed

1. **High — country record layout broke the research flow.** A shared `.oa-waste-record` class applied a three-column row grid to the entire country section. Renamed the section class, bounded child grids, and retained field source dates as the primary dates. Before: 1,437 px document inside a 1,348 px viewport. After: 1,348 px, no page overflow; readable composition/treatment columns. Evidence: `qa/overshoot-18-02-waste-before.jpg`, `qa/overshoot-18-06-country-after.jpg`.
2. **High — evidence existed without a usable comparative path.** Added a dedicated Waste workspace, comparison selection (up to four), explicit units, field-level dates, source inspectors, filtered exports, source-separated charts, period controls and city collection search. Source artifacts, website and API/MCP share contracts and selectors. Missing values stay missing.
3. **Medium — homepage entry points did not explain practical use.** Kept the interactive trade globe and material guides; added immediate waste research/search actions, task cards and concrete research questions. About now explains how to build and cite an answer. Evidence: homepage before/after images in `qa/`.
4. **Medium — tab contrast and slow overlapping entrances.** Fixed an inherited dark-mode active-tab contrast collision. Shortened view transitions and retained reduced-motion overrides; no map camera animation was replaced.
5. **Medium — tables and citations were difficult on narrow screens.** Wide data tables scroll inside named keyboard-focusable regions. Reference sheets lead with the value, date, definition and source notes; raw fields are expandable. 390 px frame / 375 px content checks passed with document scroll width equal to viewport width. City table: 333 px visible panel, 680 px internal table, 375 px page. Evidence: `qa/overshoot-18-05-mobile.jpg`.
6. **Medium — dead policy link.** Verified focused source metadata/terms URLs. Corrected Eurostat's obsolete 404 policy link. UN terms returned 403 to the fetch client; preserved the official link without classifying it as dead. Original historical workbook reference links are not all audited.

## Flow checks

| Step | Result |
| --- | --- |
| Homepage → India city collection → Mumbai search | Pass; Mumbai and Navi Mumbai retain 2018 estimated observations and distinct source IDs |
| Filtered city CSV | Pass; actual browser-downloaded file parsed, two filtered rows, source, date, original notes and metadata URLs retained |
| Comparison selection | Pass; Canada and Japan selectable across searches, nulls visible, per-field dates preserved |
| Comparison source → original references | Pass; original provider notes, source year, workbook row, complete-record action |
| Historical series selection | Pass; unavailable countries shown as coverage gaps, no silent substitute |
| Germany/France → 2020–2024 | Pass; ten values, estimates/provisional flags, native kg/person/year; URL includes period and selection |
| Share research view | Pass; copy dialog preserves tab, series selection, countries and year filters |
| City and historical source inspectors | Pass; quantity, basis, notes, source links and original fields |
| Country record deep link | Pass; source table loads, scrolls into view, no horizontal page overflow |
| Light/dark and narrow layouts | Pass for inspected homepage/research paths; nested 390 px document harness removed before publishing |
| JSON API via Data page | Pass; actual release-18 India city response with complete provenance |
| MCP via Data page | Pass; initialization, nineteen tools and source-backed Saudi facility query |
| Data integrity | Pass; raw hashes, 63,813 observations, 13,844 zeroes, 976 breaks, original unit factors, source/country separation and no duplicate country-years |
| Input and protocol checks | Pass; bounded pagination, invalid IDs, reversed years, origin/body-size checks, source-preserving tool responses |

## Limits of this verification

This is a bounded verification of the changed research flows, not a claim that every external citation or historical page has been checked. Desktop browser lacks WebGL2; the existing SVG atlas fallback is visible, while GPU map rendering was not visually verified in this environment. No live vessel positions, operating-status feed, census of all facilities, or current-year values for every city are claimed. The added UI/data improves research access; it does not fill missing observations with invented data.

Checks: TypeScript; `scripts/checks/waste-research.mts`; `scripts/checks/mcp-protocol.mts`; production build; bundled map-worker check (run by release workflow).
