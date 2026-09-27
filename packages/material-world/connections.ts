import type {FacilityKind} from './model';
export const connectionsPath='/data/v28/connections.json';
export type ConnectionSource={id:string;title:string;publisher:string;url:string;publishedAt:string|null;reviewedAt:string;locator:string;reuse:string};
export type ConnectionNode={id:string;name:string;country:string;stage:string;coordinates:[number,number]|null;locationNote:string;locationSource:string|null;facility?:{id:string;kind:FacilityKind};portId?:string};
export type MaterialConnection={id:string;from:string;to:string;materialForm:string;mode:'ship'|'rail'|'pipeline'|'conveyor'|'unspecified';claim:string;sourceIds:string[];evidence:'operator-reported'|'government-reported';quantity:number|null;quantityUnit?:string;months?:number[];period:string;geometry:'schematic'|'unmapped';scope:string};
export type ConnectionNetwork={id:string;material:string;title:string;region:string;summary:string;nodes:ConnectionNode[];links:MaterialConnection[];gaps:string[];generationMWh?:number};
export type ConnectionCatalog={release:string;reviewedAt:string;method:string;geometry:string;sources:ConnectionSource[];networks:ConnectionNetwork[]};
export const modeLabels={ship:'Ship',rail:'Rail',pipeline:'Pipeline',conveyor:'Conveyor',unspecified:'Transport not specified'};
export function selectNetworks(catalog:ConnectionCatalog,material?:string,country='WORLD'){
 return catalog.networks.filter(n=>(!material||n.material===material)&&(country==='WORLD'||n.nodes.some(p=>p.country===country)));
}
