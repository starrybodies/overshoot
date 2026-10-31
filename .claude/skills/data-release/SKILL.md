---
name: data-release
description: Add, refresh or correct a dataset in OVERSHOOT (new source, new edition, new public/data/vN, source register update). Use for any request to ingest, update or fix published data.
---

Follow `packages/overshoot-data/RELEASING.md` step by step. Don't skip a step because it looks done; each one names the evidence it must leave.

- Step 0 comes first: run `pnpm check:live`. If it lists any NEW or KNOWN difference, production is ahead of the repo: stop and report that to the user before changing anything.
- Write the step 1 contract into `releaseN/README.md` and show it to the user before acquiring or transforming anything.
- Published files under `public/data/vN/` are immutable. A hook denies edits to them, and `pnpm check` fails if they change by any other route. Corrections always go in a new `vN`.
- Finish with the step 9 receipt, and quote the actual PASS/SKIP lines from `pnpm check`, `pnpm lint` and `pnpm check:build`.
