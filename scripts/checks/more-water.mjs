// sites/more-water/README.md: the figures appear in several places (each page's small print and big "×"
// number, the notes table, the FAQ, the JSON-LD block and llms.txt). "Change all of them together."
// This check is the mechanical twin of that rule. It needs no dependencies and runs before every Pages deploy.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const site=new URL('../../sites/more-water/',import.meta.url);
const html=readFileSync(new URL('index.html',site),'utf8'),llms=readFileSync(new URL('llms.txt',site),'utf8');
const text=s=>s.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
const num=s=>Number(s.replace(/,/g,'').replace('½','.5').replace(/^(\d+)\.5$/,'$1.5'));
const near=(shown,exact,abs,rel)=>Math.abs(shown-exact)<=Math.max(abs,Math.abs(exact)*rel);
const BOOK=19,GALLON=3.785; // one 5-gallon bucket is the book's unit; liters per US gallon

// The notes table is the reference: Thing | Liters | Gallons | × this site.
const rows=[...html.match(/<tbody id="numbers">([\s\S]*?)<\/tbody>/)[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)]
 .map(r=>[...r[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(c=>text(c[1])))
 .map(([thing,liters,gallons,times])=>({thing,liters:num(liters),gallons:num(gallons),times,x:num(times)}));
assert(rows.length>=10,'notes table not found');
for(const r of rows){
 assert(near(r.x,r.liters/BOOK,0.26,0.01),`${r.thing}: × ${r.times} but ${r.liters} L ÷ ${BOOK} = ${(r.liters/BOOK).toFixed(2)}`);
 assert(near(r.gallons,r.liters/GALLON,0.5,0.01),`${r.thing}: ${r.gallons} gal but ${r.liters} L = ${(r.liters/GALLON).toFixed(1)} gal`);
}
const [best,worst,...things]=rows;
assert.match(best.thing,/best estimate/);assert.match(worst.thing,/pessimistic/);
for(const r of things)assert(r.liters>worst.liters,`${r.thing} (${r.liters} L) must exceed the most pessimistic estimate (${worst.liters} L)`);

// Each story page with a big "N×": title, × number and small-print liters/gallons match its table row.
const pages=[...html.matchAll(/<section class="page[^"]*" id="([^"]+)"[\s\S]*?<\/section>/g)].map(m=>m[0]).filter(s=>/<p class="x[^"]*">[^<]*<small>×<\/small>/.test(s));
assert.equal(pages.length,things.length,'every table row has a story page and vice versa');
pages.forEach((page,i)=>{
 const row=things[i],title=text(page.match(/<h2>([\s\S]*?)<\/h2>/)[1]).replace(/\.$/,'');
 const times=text(page.match(/<p class="x[^"]*">([\s\S]*?)<small>/)[1]),fine=text(page.match(/<p class="fine">([\s\S]*?)<\/p>/)[1]);
 const [,liters,gallons]=fine.match(/([\d,]+) liters \(([\d,.]+) gallons\)/);
 assert.equal(title,row.thing,`page ${i+1} is out of order with the notes table`);
 assert.equal(times,row.times,`${title}: page says ${times}×, table says ${row.times}×`);
 assert.equal(num(liters),row.liters,`${title}: page says ${liters} L, table says ${row.liters} L`);
 assert.equal(num(gallons),row.gallons,`${title}: page says ${gallons} gal, table says ${row.gallons} gal`);
});

// The method line: kWh × liters per kWh × 5/3 ≈ the table's best and most pessimistic estimates.
const method=text(html.match(/<p class="math">([\s\S]*?)<\/p>/)[1]);
const estimates=[...method.matchAll(/([\d.]+) kWh × ([\d.]+) liters per kWh × 5\/3 ≈ ([\d.]+) liters/g)].map(m=>m.slice(1).map(Number));
assert.equal(estimates.length,2,'method line not found');
for(const [[kwh,perKwh,result],row] of [[estimates[0],best],[estimates[1],worst]]){
 assert(near(result,kwh*perKwh*5/3,0.5,0),`method: ${kwh} × ${perKwh} × 5/3 is not ≈ ${result}`);
 assert.equal(result,row.liters,`method says ${result} L, table says ${row.liters} L`);
}

// llms.txt: the same things in the same order, with the same liters (within display rounding).
const listed=[...llms.split('## Things that took more water')[1].split('\n## ')[0].matchAll(/^- (.+): (?:up to )?([\d,]+) \(/gm)];
assert.equal(listed.length,things.length,'llms.txt lists a different number of things');
listed.forEach(([,name,liters],i)=>assert(near(num(liters),things[i].liters,0,0.01),`llms.txt "${name}": ${liters} L, table "${things[i].thing}": ${things[i].liters} L`));

// The headline estimate and the pessimistic bound, wherever they are stated.
const ld=html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
const graph=JSON.parse(ld)['@graph'];
for(const [where,s] of [['llms.txt',llms],['JSON-LD',ld],['page',text(html)]]){
 assert(s.includes(`${best.liters} liters`),`${where} does not state the best estimate (${best.liters} liters)`);
 for(const [,n] of s.matchAll(/under ([\d,]+) liters/g))assert(num(n)>worst.liters,`${where} says "under ${n} liters" but the most pessimistic estimate is ${worst.liters} L`);
}

// FAQ structured data must match the visible FAQ: same questions, same numbers.
const qa=new Map([...html.matchAll(/<div class="qa">\s*<h3>([\s\S]*?)<\/h3>([\s\S]*?)<\/div>/g)].map(m=>[text(m[1]),text(m[2])]));
const faq=graph.find(n=>n['@type']==='FAQPage').mainEntity;
assert.equal(faq.length,qa.size,'JSON-LD and visible FAQ have different question counts');
for(const q of faq){
 const answer=qa.get(q.name);assert(answer!==undefined,`JSON-LD question not on the page: ${q.name}`);
 for(const n of q.acceptedAnswer.text.match(/\d[\d,.]*\d|\d/g)??[])assert(answer.includes(n),`FAQ "${q.name}": JSON-LD says ${n}, visible answer does not`);
}
console.log(`PASS: more-water figures agree across ${pages.length} pages, the notes table, the method line, llms.txt, JSON-LD and ${faq.length} FAQ answers.`);
