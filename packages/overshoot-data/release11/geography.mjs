import {readFileSync,writeFileSync} from 'node:fs';
import {geoCentroid} from 'd3-geo';
const countries=JSON.parse(readFileSync('public/data/v11/countries.json','utf8'));
const shapes=JSON.parse(readFileSync('public/data/v10/geography.json','utf8')).features;
let added=0;
for(const c of countries){if(c.center)continue;const f=shapes.find(f=>f.properties.numeric===c.numeric);if(f){const point=geoCentroid(f);if(point.every(Number.isFinite)){c.center=point;c.center_method='Natural Earth 1:50m spherical centroid; country anchor, not facility or port';added++}}}
writeFileSync('public/data/v11/countries.json',JSON.stringify(countries));
console.log(`Added ${added} basemap-derived country anchors; unlocated areas remain selectable.`);
