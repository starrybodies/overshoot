import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
const read=p=>JSON.parse(p.endsWith('.gz')?gunzipSync(readFileSync(p)):readFileSync(p,'utf8'));
const places=read('public/data/v11/countries.json'),coverage=read('public/data/v11/coverage.json').countries;
assert.equal(places.length,249);assert.equal(new Set(places.map(c=>c.id)).size,249);
for(const c of places){assert.match(c.id,/^[A-Z]{3}$/);assert.match(c.alpha2,/^[A-Z]{2}$/);assert.match(c.numeric,/^\d{3}$/);for(const locale of ['en','ar','ja','hi','fr','pt-BR','zh-TW'])new Intl.DisplayNames([locale],{type:'region'}).of(c.alpha2);if(c.center){assert(c.center.every(Number.isFinite));assert(Math.abs(c.center[0])<=180&&Math.abs(c.center[1])<=90)}}
for(const year of [2023,2024]){const rows=read(`public/data/v10/basel-${year}.json.gz`).records;assert.equal(coverage.WORLD.basel[year+'-out'],rows.length);for(const c of places){assert.equal(coverage[c.id]?.basel[year+'-out']||0,rows.filter(r=>r.origin===c.id).length);assert.equal(coverage[c.id]?.basel[year+'-in']||0,rows.filter(r=>r.destination===c.id).length)}}
for(const kind of ['mining','landfill','wastewater','river']){const rows=read(`public/data/v2/${kind}-sites.geojson`).features;assert.equal(coverage.WORLD.sites[kind],rows.length);for(const c of places)assert.equal(coverage[c.id]?.sites[kind]||0,rows.filter(r=>r.properties.country===c.id).length)}
const accounts=read('public/data/v2/resources/2024.json').rows;
for(const c of places){const record=accounts.find(r=>r.country===c.id);assert.equal(!!coverage[c.id]?.accounts.includes(2024),!!record&&['extraction','imports','exports','domesticConsumption'].some(k=>record[k]!=null))}
console.log('PASS: 249 area codes/localized names and anchors; all country Basel directions, mapped-site counts and 2024 account coverage reconcile with source records.');
