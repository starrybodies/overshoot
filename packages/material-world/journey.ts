import type {FacilityKind,FacilityPin} from './model';
export type JourneyPin=FacilityPin&{kind:FacilityKind};
export type JourneyStage={id:string;label:string;color:string;description:string;scope:string;path:string|null;count:number;countries:Record<string,number>};
export type JourneyCatalog={version:string;material:string;stages:JourneyStage[];sourceCatalog:string;method:string};
export const journeyStageColors={extraction:'#b67936',refining:'#ba6760',manufacturing:'#9274a7',use:'#427aaa',recovery:'#448b71',disposal:'#82815b',ocean:'#3e9caa'};
