export type ProductionMaterial='food'|'wood'|'paper'|'textiles';
export type ProductionRow={country:string;year:number;item_code:string;item:string;value:number|null;unit:string;source_flag:string;source_id:string;original_unit:string;note?:string;sourceRow:number};
export type ProductionCatalog={material:ProductionMaterial;sourceId:string;publisher:string;title:string;url:string;methodUrl:string;license:string;retrievedAt:string;edition:string;defaultItem:string;latestYear:number;sourceFlags:Record<string,string>;sourceArchiveSha256:string;limitations:string[];products:Record<string,{name:string;unit:string;description:string;years:number[];path:string;countries:number}>};
export type ProductionSelection={productionItem:string;productionYear:string};
