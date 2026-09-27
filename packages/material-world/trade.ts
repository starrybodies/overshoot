export type TradeEvidenceRow={origin:string;destination:string;commodity:string;year:number;reporter:string;reported_flow:string};
/** Choose one reporting side per origin/product/year (out) or destination/product/year (in).
 * Partner imports fill a missing exporter group, never individual gaps within it.
 * No averaging, reconciliation or addition of two declarations of the same flow.
 */
export function selectTradeEvidence<T extends TradeEvidenceRow>(exports:T[],imports:T[],country:string,direction:'in'|'out',commodity?:string):T[]{
 const relevant=(r:T)=>!commodity||r.commodity===commodity;
 const x=exports.filter(relevant),m=imports.filter(relevant);
 if(country!=='WORLD'&&direction==='in'){
  const own=m.filter(r=>r.destination===country),groups=new Set(own.map(r=>`${r.commodity}|${r.year}`));
  return [...own,...x.filter(r=>r.destination===country&&!groups.has(`${r.commodity}|${r.year}`))];
 }
 const primary=x.filter(r=>country==='WORLD'||r.origin===country);
 const groups=new Set(primary.map(r=>`${r.origin}|${r.commodity}|${r.year}`));
 return [...primary,...m.filter(r=>(country==='WORLD'||r.origin===country)&&!groups.has(`${r.origin}|${r.commodity}|${r.year}`))];
}
export function tradeBasis(rows:TradeEvidenceRow[],direction:'in'|'out',country:string){
 const imports=rows.some(r=>r.reported_flow==='M'),exports=rows.some(r=>r.reported_flow==='X');
 if(imports&&exports)return 'mixed';
 if(imports)return country!=='WORLD'&&direction==='in'?'importer':'partner-importers';
 return direction==='in'?'partners':'exporter';
}
export const tradeBasisLabels:Record<string,string>={provincial:'BC domestic exports',exporter:'Exporter declarations',importer:'This country’s import declarations',partners:'Partners’ export declarations','partner-importers':'Partners’ import declarations',mixed:'Exports, supplemented by partner imports'};
