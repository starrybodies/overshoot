import MaterialAtlas from './MaterialAtlas';
import {readAtlasState,type AtlasView} from './atlasState';
type Search=Promise<Record<string,string|string[]|undefined>>;
/** Render the shared-link selection on the server; avoid flashing the default guide. */
export default async function AtlasEntry({view='home',searchParams}:{view?:AtlasView;searchParams?:Search}){
 const values=await searchParams||{},query=new URLSearchParams();
 for(const [key,value] of Object.entries(values)){const first=Array.isArray(value)?value[0]:value;if(first!==undefined)query.set(key,first)}
 return <MaterialAtlas initial={readAtlasState({pathname:view==='home'?'/':'/'+view,search:query.toString()})}/>;
}
