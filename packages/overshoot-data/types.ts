export type Material = 'all' | 'biomass' | 'fossil' | 'metals' | 'minerals';
export type Scene = 'extraction' | 'flow' | 'stock' | 'discard' | 'return';
export interface Source {
 id: string; title: string; publisher: string; dataset: string; edition: string;
 publicationYear: number | null; coverageYears: string; url: string; citation: string;
 license: string; retrievedAt: string; method: string; units: string;
 transformations: string; geographicCoverage: string; temporalCoverage: string;
 status: 'available' | 'partial' | 'blocked' | 'catalogued';
 topics?: string[]; downloadUrls?: string[]; recordCount?: number; integration?: string; accessNote?: string; checksums?: Record<string,string>; snapshot?: string;
}
export interface Country { id: string; name: string; numeric?: string; center?: [number,number]; }
export interface ExtractionRow {
 country: string; year: number; biomass: number | null; fossil: number | null;
 metals: number | null; minerals: number | null; total: number | null;
 population: number | null; source_id: string; population_source_id?: string;
 original_unit: string; estimated?: boolean; per_capita?: Record<string,number|null>;
}
export interface ExtractionData { version: string; years: number[]; countries: Country[]; rows: ExtractionRow[]; source_id: string; }
export const MATERIALS = [
 { id:'biomass', name:'Biomass', color:'#8be5a5', description:'Crops, timber & grazing' },
 { id:'fossil', name:'Fossil fuels', color:'#91bfff', description:'Coal, oil & natural gas' },
 { id:'metals', name:'Metal ores', color:'#ff927b', description:'Iron, copper & other ores' },
 { id:'minerals', name:'Non-metallic minerals', color:'#ffd16c', description:'Sand, gravel, stone & clay' },
] as const;
export const SCENES: {id:Scene; roman:string; name:string; heading:string; description:string}[] = [
 {id:'extraction',roman:'I',name:'Extraction',heading:'A world pulled\nfrom the Earth.',description:'Every road, meal and machine begins here. Follow what we take from the Earth.'},
 {id:'flow',roman:'II',name:'Flow',heading:'Where it begins\nisn’t where it stays.',description:'Trade moves physical matter across borders. The place of extraction and the place of consumption tell different stories.'},
 {id:'stock',roman:'III',name:'Stock',heading:'The hidden pile.\nThe world we built.',description:'Much of what we extract stays with us. In our roads. Our buildings. Our cities. The built environment is accumulated material.'},
 {id:'discard',roman:'IV',name:'Discard',heading:'Out of sight.\nStill on Earth.',description:'When materials leave use, they gather in particular landscapes. Follow what is measured, and where the record goes quiet.'},
 {id:'return',roman:'V',name:'Return',heading:'A small loop.\nAn open system.',description:'Some materials return to use. Much stays in stock, dissipates, or is discarded. See the system we have—and explore a different one.'},
];
