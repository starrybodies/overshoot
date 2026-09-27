# OVERSHOOT

[OVERSHOOT](https://overshoot.gaiaai.xyz) is Gaia AI's public atlas of material extraction, production, movement, use, discard and return. It pairs maps and guided journeys with source records, dates, units and visible gaps. The website, [JSON API](https://overshoot.gaiaai.xyz/data) and [remote MCP server](https://overshoot.gaiaai.xyz/api/mcp) read the same retained evidence.

## Explore the atlas

- Start with a material journey. Each stage separates measured places and connections from country aggregates and unknown links. A mapped facility near a country is not automatically a supplier to that country.
- Open a map record for its original source and fields. The atlas shows country capacity, actual reported trade and selected named deliveries as different kinds of evidence; it does not assemble them into an invented chain of custody.
- Use **Open data & MCP** for the read-only query console and remote server setup. The endpoint accepts stateless Streamable HTTP JSON-RPC at `https://overshoot.gaiaai.xyz/api/mcp`; `/api/material-world` serves bounded JSON queries. No account or API key is required for reading.
- Source dates vary by layer. The data page and individual records carry their own vintage and limits; a recent country capacity table is not a current shipment measurement.

## Recent country capacity data

Release 35 retains Global Energy Monitor's public country summaries for operating cement and clinker capacity (July 2026) and steelmaking capacity by process (June 2026 V1), alongside operating plant counts. The published derivatives are in `public/data/v35/`; the import script, original-file checksums, attribution and method notes are in [`packages/overshoot-data/release35/README.md`](packages/overshoot-data/release35/README.md). GEM licenses these tables under CC BY 4.0.

These are rated annual capacities, in million metric tonnes per annum, not actual production, consumption or trade. The country polygons do not locate individual GEM plants. Separate Climate TRACE facility markers are not added to the GEM counts. Missing country values remain missing. An explicit interpolation tool exists for a bounded gap in certain historical series; it returns the formula and source observations and is never presented as a measured record.

Other retained accounts include national material extraction and footprints, selected reported bilateral trade, waste series, product histories, geolocated facilities and some source-identified mine-to-plant deliveries. Coverage, licensing and exclusions are documented in [`packages/overshoot-data/SOURCES.md`](packages/overshoot-data/SOURCES.md) and the release-specific READMEs. A line between two places appears only when its evidence supports those endpoints; a route line is not a precise vehicle track.

## 2025 mineral production estimates

Release 39 adds USGS 2025 estimate columns for copper mining and refining, primary aluminium smelting, lithium mining and raw steel production: 63 named country-by-process observations. The world totals are the publisher’s rounded figures. They are shown as distinct country layers and exposed through the `mineral_production` MCP and JSON API tool. See [`packages/overshoot-data/release39/README.md`](packages/overshoot-data/release39/README.md) for the source PDFs, transformation, omissions and comparison limits.

## Run locally

Use Node 22.13+ and the pinned pnpm version from `package.json`:

```sh
pnpm install
pnpm dev
```

`pnpm build` creates the Cloudflare-compatible Worker and static assets through the supplied Vinext adapter. The public browser artifacts are committed and do not require a statistics-provider API at runtime. This public mirror omits acquired raw source files, normalized research archives and snapshot parts. Source transformation scripts and manifests remain for inspection, but rerunning many data pipelines requires reacquiring source files under their original terms. See the respective release README for acquisition and transformation steps.

The website can be explored locally without a production database. The optional email signup requires a configured Cloudflare D1 `DB` binding and the `newsletter_subscribers` migration; see `app/api/subscribe/route.ts` and `drizzle/`. Do not use a local signup as a production subscriber store.

## Project layout

- `app/`: routes, APIs and runtime integration.
- `apps/overshoot/`: atlas interface, maps, journeys and source inspection.
- `packages/material-world/`: bounded query surface and MCP protocol.
- `packages/overshoot-data/`: transformation code, provenance descriptions and validators; research-only raw archives are omitted here.
- `public/data/`: immutable, versioned browser artifacts.
- `scripts/checks/`: release, map and protocol checks.

This repository includes the same public browser data that the live atlas serves, with third-party source-specific reuse terms. Attribution and licenses are recorded beside the data; a repository copy does not replace those terms. Some identified datasets are catalogued but withheld from public quantitative redistribution. The source notes distinguish a researched source from an ingested observation. The private research archive remains separate from this public mirror.
