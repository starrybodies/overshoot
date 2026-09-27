import type {FlowRecord} from './expanded-queries';
export interface TreatmentRecord {country:string;name:string;year:number;scope:string;source_id:string;values:Record<string,number>;flags:Record<string,string>;source_cells:Record<string,string>}
export interface TreatmentData {source_id:string;unit:string;years:number[];operations:{code:string;label:string}[];scopes:{code:string;label:string}[];records:TreatmentRecord[];notes:string[];country_notes?:Record<string,string>;geography_exceptions?:Record<string,string>}
export function getWasteDestinations(flows:FlowRecord[],country:string,commodity:string,year:number,destination='WORLD') {
 return flows.filter(f=>f.type==='discard'&&f.year===year&&f.commodity===commodity&&(country==='WORLD'||f.origin===country)&&(destination==='WORLD'||f.destination===destination)).sort((a,b)=>b.tonnes-a.tonnes);
}
/** Mutually exclusive leaves; never add a parent to its children. Missing remains missing. */
export function treatmentLeaves(row:TreatmentRecord){
 const codes=['RCV_E','DSP_I'];
 for(const [parent,children] of [['RCV_R_B',['RCV_R','RCV_B']],['DSP_L_OTH',['DSP_L','DSP_OTH']]] as const){
  if(children.every(code=>row.values[code]!==undefined))codes.push(...children);
  else if(row.values[parent]!==undefined)codes.push(parent);
  else codes.push(...children.filter(code=>row.values[code]!==undefined));
 }
 return codes.filter(code=>row.values[code]!==undefined).map(code=>({code,value:row.values[code],flag:row.flags[code],source_cell:row.source_cells[code],source_id:row.source_id}));
}
