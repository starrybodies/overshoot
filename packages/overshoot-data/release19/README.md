# Local place index

Source: `cities.json@1.1.64`, derived from the GeoNames `cities1000` gazetteer. The pinned npm archive and license are in `raw/` and `LICENSE.txt`; the SHA-256 is recorded in `public/data/v19/cities/provenance.json`. License: Creative Commons Attribution 4.0.

Run `node packages/overshoot-data/release19/build-cities.mjs` from the repository root to regenerate the browser shards. The source edition contains 171,075 named populated places and administrative seats. Search also recognizes words after the first word of a name and nine common alternate names mapped to coordinates from the same source.

The index is broad but not a complete inventory of settlements, neighbourhoods, or addresses. City coordinates are reference points, not city boundaries. Local reports query the existing site records by radius around that point; a record count is not a count of all activity in that area. Coordinate entry remains available for unindexed locations.
