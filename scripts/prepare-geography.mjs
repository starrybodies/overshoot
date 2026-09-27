import fs from 'node:fs';
import {feature} from 'topojson-client';
import {geoCentroid,geoGraticule10} from 'd3-geo';
const topo=JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-110m.json','utf8'));
const countries=feature(topo,topo.objects.countries);
for(const f of countries.features){f.properties.numeric=String(f.id).padStart(3,'0');f.properties.center=geoCentroid(f);}
fs.mkdirSync('public/data/v1',{recursive:true});
fs.writeFileSync('public/data/v1/geography.json',JSON.stringify(countries));
fs.writeFileSync('public/data/v1/graticule.json',JSON.stringify({type:'Feature',geometry:geoGraticule10(),properties:{}}));
console.log(JSON.stringify({features:countries.features.length,bytes:fs.statSync('public/data/v1/geography.json').size}));
