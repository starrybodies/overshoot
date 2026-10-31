# Releasing data

How to add a source or refresh one. Each step names the evidence it must leave. A release is done when every step has its evidence, not when the agent says so.

0. **Check production first.** Run `pnpm check:live`. If production is ahead of the repo, stop and tell the owner: a release cut from a repo behind production would replace newer data. (On 2026-10-31 it is ahead: release 84 live, 39 here.)
1. **Write the contract** at the top of `packages/overshoot-data/releaseN/README.md` before changing anything else:
   goal; source (publisher, URL, edition or vintage, retrieval date); licence and reuse terms; units and conversions; expected row counts and world totals; the files in scope; the checks that will prove it.
2. **Pick N** as one above the highest `public/data/vN`. Never edit an existing `vN`: `scripts/checks/published-data.mjs` fails, and so does CI.
3. **Acquire** into `releaseN/raw/` (gitignored). Record each file's sha256, bytes and retrieval date, either in `releaseN/manifest.json` (the shape of `release18/manifest.json`) or in the artifact (as `v39` does with `sourcePdfSha256`).
4. **Transform** with a script in `releaseN/` that writes only to `public/data/vN/`. Every artifact carries its source, edition, unit and licence or reuse terms. Missing stays `null`; nothing is interpolated or zero-filled.
5. **Wire it up.** Point `packages/material-world/query.ts` and the UI at the new paths. When the API release changes, update `snapshot.release` (the MCP version follows). When a tool is added or removed, update the tool list in `scripts/checks/mcp-protocol.mts`.
6. **Add `scripts/checks/releaseN.mts`.** Assert the published data and query behaviour: counts, world totals, null handling, rejected inputs. These assertions must run without raw files. Guard any raw-hash block with `rawAvailable()` from `scripts/checks/raw.ts`.
7. **Update the record.** Update the README's release section. If a source's status changes, publish a new version of the source register; never edit it in place.
8. **Prove it.** `pnpm check`, `pnpm lint` and `pnpm check:build` pass.
9. **Write the receipt** under `## Verification receipt` in `releaseN/README.md`: base commit, each command run with its PASS/SKIP line, new artifacts with their sha256, and open risks.

Deploying is owner-only.
