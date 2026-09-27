export type Port={id:string;name:string;country:string;countryName:string;coordinates:[number,number];locode:string|null;sourceRow:number;sourceUrl:string};
export const vesselTypes=[['all','All cargo vessels'],['tanker','Tankers'],['container','Container ships'],['dry_bulk','Dry bulk'],['general_cargo','General cargo'],['roro','Roll-on / roll-off']] as const;
export type VesselType=typeof vesselTypes[number][0];
export type PortActivity={port:string;month:string;days:number;expectedDays:number;firstDate:string;lastDate:string;portcalls:number|null;portcalls_container:number|null;portcalls_dry_bulk:number|null;portcalls_general_cargo:number|null;portcalls_roro:number|null;portcalls_tanker:number|null;import:number|null;export:number|null;import_tanker:number|null;export_tanker:number|null};
export type MaritimeCatalog={version:string;source:{title:string;publisher:string;url:string;methodUrl:string;license:string;licenseUrl:string;attribution:string;retrievedAt:string;method:string;limitations:string[]};count:number;countries:Record<string,number>;months:string[];defaultMonth:string;observations:number;portsPath:string;activityPath:string;densityPath:string;queries:Record<string,string[]>};
export function portCalls(row:PortActivity|undefined,vessel:VesselType):number|null{return row?(vessel==='all'?row.portcalls:row[('portcalls_'+vessel) as keyof PortActivity] as number|null):null}
export const shippingTiles='/data/v16/maritime/density/{z}/{x}/{y}.png';
export const shippingSource='https://datacatalog.worldbank.org/search/dataset/0037580/global-shipping-traffic-density';
export function monthLabel(month:string){return new Intl.DateTimeFormat('en',{month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(month+'-01T00:00:00Z'))}

export type TransportSelection={mapPorts:boolean|null;mapShipping:boolean|null;portMonth:string;portVessel:VesselType;portId:string;portsWorldwide:boolean};
export const defaultTransportSelection:TransportSelection={mapPorts:null,mapShipping:null,portMonth:'',portVessel:'all',portId:'',portsWorldwide:false};
