# OVERSHOOT: map for coding agents

Public atlas of material extraction, trade, use and waste (https://overshoot.gaiaai.xyz). Vinext (Next.js on Vite), built to a Cloudflare Worker. Every number on the site, the JSON API and the MCP server is read from committed, versioned artifacts in `public/data/vN/`. This file is a map; follow the pointers for detail.

## Where things live
- `app/`: routes and APIs (`api/mcp`, `api/material-world`, `api/agent`, `api/subscribe`).
- `apps/overshoot/`: atlas UI; `atlas-next/` is the current interface.
- `packages/material-world/`: the query surface (`query.ts`, one zod schema per tool) and the MCP server (`mcp.ts`). The API release label is `snapshot.release` in `query.ts`; the MCP version follows it.
- `packages/overshoot-data/`: pipelines. `releaseN/README.md` records a release's source, edition, licence, units and decisions. Not every `vN` has one (v29, v30, v34, v42 do not).
- `public/data/vN/`: published artifacts. Immutable. A `vN` number is not always an API release (v42 is a cache-busting copy of the source register).
- `scripts/checks/`: executable acceptance checks; `run.mjs` runs the offline ones.
- `sites/more-water/`: a separate static picture-book site with its own README and Pages workflow.

## Commands (Node >= 22.13; pnpm from `packageManager`, e.g. via `corepack enable`)
- `pnpm install --frozen-lockfile`, `pnpm dev` (port 5173), `pnpm build`
- `pnpm check`: typecheck, unit tests and every offline check (about 30 s). This is what "done" means.
- `pnpm lint`: must pass. Existing errors are recorded in `eslint-suppressions.json`; never add to it. After cleaning a file, run `pnpm lint --prune-suppressions`.
- `pnpm check:build`: production build plus the map-worker bundle check.
- `pnpm check:live`: compares this repo with production (network).
- One check: `node --import tsx scripts/checks/<name>.mts` (or `node scripts/checks/<name>.mjs`).

## Production is ahead of this repo
`pnpm check:live` (2026-10-31): production serves API release 84 with 6 MCP tools that are not in this repo, 21 files differ at the same `/data/vN/` URL, and production no longer serves `v14`. The atlas is deployed from an external hosting project (`.openai/hosting.json`), not from this repo's CI. Do not assume the repo is what users see, and do not cut a data release here until the owner has reconciled it.

## Rules, and what enforces each one
1. Never modify or delete a file under an existing `public/data/vN/`. Corrections go in a new `vN` (one above the highest existing N), then repoint the code. Only the owner removes a published file, for a licence withdrawal, listed in `scripts/checks/published-data-exceptions.json`. Enforced by `scripts/checks/published-data.mjs` (in `pnpm check` and CI) and a Claude Code hook.
2. Missing is not zero. Never interpolate, back-fill, zero-fill or replace a publisher's world total with a sum of rows. Only the `estimate_*` tools estimate, labelled and never stored. Partly enforced by `material-world.mts`, `mcp-protocol.mts`, `waste-research.mts` and `test_comtrade.py`.
3. Keep evidence kinds apart: capacity is not production; exporter reports and mirror importer reports are never combined; a map line needs evidence for both endpoints. Partly enforced by `release16.mts`, `release17.mts` and `release35.mts`; otherwise by review.
4. Every new artifact carries its source, edition or vintage, unit and licence or reuse terms. Not mechanically checked yet.
5. Raw acquired source files never enter git (`.gitignore`). Checks that hash them print SKIP in this public mirror; `REQUIRE_RAW=1` makes them fail where the archive exists.
6. MCP tools are read-only. Adding or removing a tool means updating the tool list in `scripts/checks/mcp-protocol.mts`.
7. The more-water figures appear in several places and change together. Enforced by `scripts/checks/more-water.mjs`, which also runs before every Pages deploy.

Change an expected value in a check only when your diff explains why, and say so. Never delete or skip an assertion to get green.

## Owner-only actions
Merging to `main` (it deploys `sites/more-water` to GitHub Pages), deploying the atlas, DNS, D1 and production configuration, model keys, and removing published data. Propose these; do not do them.

## How to work here
- Data release or source refresh: follow `packages/overshoot-data/RELEASING.md`.
- Anything else: before editing, state the goal, the files in scope and which checks will prove it. Finish with a receipt: files changed, each command run with its PASS/SKIP/FAIL line, and open risks.
- Historical records, not maps: `apps/overshoot/BUILD.md` (releases 1–7) and `packages/overshoot-data/SOURCES.md` (the 2026-09-19 inventory). The living source register is the `source_observatory` tool (`public/data/v42/source-opportunities.json`).
