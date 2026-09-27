/** Shared, source-preserving waste research contracts. Missing values are never zero-filled. */
export type WasteSource={title:string;publisher:string;url:string;apiUrl?:string;metadataUrl?:string;retrievedAt:string;license:string;licenseUrl?:string;sha256?:string;citation?:string};
export type WasteSeries={id:string;group:string;label:string;unit:string;sourceId:string;operation?:string;material?:string;description:string;comparability:string;path:string;count:number;countries:Record<string,number>;years:number[]};
export type WasteCatalog={sources:Record<string,WasteSource>;series:WasteSeries[];counts:{historyRecords:number;series:number;countries:number;cityObservations:number;cities:number;cityCountries:number}};
export type WasteObservation={id:string;country:string;year:number;value:number;unit:string;rawValue:string|number;rawUnit:string;factor:number;flags:string;flagLabels:string[];basis:string;dimensions:Record<string,string>;attributes?:Record<string,string>;source:string;footnotes:string[];[key:string]:unknown};
export type CityCollection={id:string;cityId:string;city:string;country:string;countryName:string;year:number;value:number;unit:string;basis:string;source:string;footnotes:string[];issue:string|null;[key:string]:unknown};
export type CityCollectionData={source:WasteSource;records:CityCollection[];method:string};
export type WasteField={label:string;group:string;unit:string;description:string};
export type ComparisonObservation={value:number|null;dates:string[];year:number|null;sourceField:string;issue?:string};
export type ComparisonPlace={id:string;country:string;name:string;countryName:string;level:'country'|'city';region:string;year:number|null;observations:Record<string,ComparisonObservation>};
export type WasteComparison={source:WasteSource;fields:Record<string,WasteField>;records:ComparisonPlace[]};
export function latestCities(rows:CityCollection[]):CityCollection[]{const years=new Map<string,number>();for(const r of rows)years.set(r.cityId,Math.max(years.get(r.cityId)??-Infinity,r.year));return rows.filter(r=>r.year===years.get(r.cityId))}
export function collectionRows(rows:CityCollection[],country='WORLD',query='',year='latest'){
 const filtered=rows.filter(r=>(country==='WORLD'||r.country===country)&&(!query||(r.city+' '+r.countryName).toLocaleLowerCase().includes(query.toLocaleLowerCase())));
 return (year==='latest'?latestCities(filtered):filtered.filter(r=>year==='all'||String(r.year)===year)).sort((a,b)=>a.countryName.localeCompare(b.countryName)||a.city.localeCompare(b.city)||b.year-a.year||a.id.localeCompare(b.id));
}
export function comparisonDate(o?:ComparisonObservation){const projection=o?.sourceField.match(/projected_(20\d{2})$/);if(projection)return projection[1]+' · model';return o?.dates?.length?o.dates.join(' / '):o?.year?String(o.year):'Year not specified'}
/** Duplicated country/year observations must not silently replace one another in charts. */
export function uniqueYearPoints(rows:WasteObservation[]){const counts=new Map<number,number>();rows.forEach(r=>counts.set(r.year,(counts.get(r.year)||0)+1));return rows.filter(r=>counts.get(r.year)===1).sort((a,b)=>a.year-b.year)}
export const researchBase='/data/v18/waste/';
