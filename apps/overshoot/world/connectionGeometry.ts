import type {Flow} from './model';
const regionalCoordinates:Record<string,[number,number]>={BC:[-125,54],SSI:[-123.5,48.8]};
export function flowEndpoints(flow:Flow,coordinates:Map<string,[number,number]>):{a:[number,number];b:[number,number]}|null{
 const a=flow.connection?.from||coordinates.get(flow.origin)||regionalCoordinates[flow.origin],b=flow.connection?.to||coordinates.get(flow.destination)||regionalCoordinates[flow.destination];
 if((!flow.connection&&flow.amount<=0)||!a||!b)return null;
 if(![a,b].every(p=>p.every(Number.isFinite)&&Math.abs(p[0])<=180&&Math.abs(p[1])<=90))return null;
 return {a,b};
}
export function flowLabel(flow:Flow,format:(n:number)=>string){return `${flow.originLabel} → ${flow.destinationLabel} · ${flow.connection?flow.connection.mode+' · operator-reported':format(flow.amount)+' '+flow.unit}`}
export function connectionBounds(flows:Flow[]):[[number,number],[number,number]]|null{
 if(!flows.length||flows.some(f=>!f.connection||!flowEndpoints(f,new Map())))return null;
 const points=flows.flatMap(f=>[f.connection!.from,f.connection!.to]),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
 if(Math.max(...xs)-Math.min(...xs)>180)return null;
 return [[Math.min(...xs)-.025,Math.min(...ys)-.025],[Math.max(...xs)+.025,Math.max(...ys)+.025]];
}
