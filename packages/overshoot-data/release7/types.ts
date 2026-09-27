export type WasteMaterial='plastic'|'paper'|'glass'|'metal'|'food'|'electronics'|'garbage'|'rigid-plastic';
export type JourneyStage='collection'|'sorting'|'processing'|'after';
export type JourneyPlace='general'|'bc'|'salt-spring';
export interface ProcessStep {title:string;plain:string;technical:string;sources:string[];outputs?:{name:string;explanation:string}[]}
export interface JourneySource {id:string;title:string;publisher:string;url:string;retrievedAt:string;license:string;coverage:string;year:number|null;method:string}
export interface JourneyEvidence {id:string;materials:WasteMaterial[];stage:JourneyStage;supportedStages?:JourneyStage[];plainGap?:string;place:Exclude<JourneyPlace,'general'>;title:string;plain:string;technical:string;source_ids:string[];year:number|null;entity:string;kind:'operator-report'|'program-report'|'public-guidance';quantity?:{value:number;unit:string;label:string};destinations?:{label:string;percent:number|null;previousPercent:number|null}[];comparisonYear?:number;gap:string}
export interface JourneyMaterial {id:WasteMaterial;name:string;example:string;summary:string;steps:Record<JourneyStage,ProcessStep>}
export interface JourneyDataset {version:string;materials:JourneyMaterial[];sources:JourneySource[];evidence:JourneyEvidence[]}
export const stages:{id:JourneyStage;name:string;question:string}[]=[{id:'collection',name:'Collected',question:'Where does it go first?'},{id:'sorting',name:'Separated',question:'What gets kept or removed?'},{id:'processing',name:'Processed',question:'How does it change?'},{id:'after',name:'What happens next',question:'What comes out—and where does it go?'}];
export interface JourneyState {material:WasteMaterial;place:JourneyPlace;stage:JourneyStage;view:'learn'|'research';detail:boolean;query:string}
export const initialJourney:JourneyState={material:'plastic',place:'salt-spring',stage:'collection',view:'learn',detail:false,query:''};
export function readJourney(search:string):JourneyState{const q=new URLSearchParams(search);return{material:['plastic','paper','glass','metal','food','electronics','garbage','rigid-plastic'].includes(q.get('material')||'')?q.get('material') as WasteMaterial:'plastic',place:['general','bc','salt-spring'].includes(q.get('place')||'')?q.get('place') as JourneyPlace:'salt-spring',stage:stages.some(s=>s.id===q.get('stage'))?q.get('stage') as JourneyStage:'collection',view:q.get('view')==='research'?'research':'learn',detail:q.get('detail')==='1',query:(q.get('q')||'').slice(0,200)}}
export function journeyQuery(s:JourneyState){return new URLSearchParams({material:s.material,place:s.place,stage:s.stage,view:s.view,detail:s.detail?'1':'0',q:s.query}).toString()}
export function visibleEvidence(d:JourneyDataset,s:JourneyState){return d.evidence.filter(e=>e.place===s.place&&e.materials.includes(s.material))}

export function evidenceAtStage(e:JourneyEvidence,stage:JourneyStage){return (e.supportedStages??[e.stage]).includes(stage)}
