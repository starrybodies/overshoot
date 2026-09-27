import AtlasEntry from '@/apps/overshoot/atlas-next/AtlasEntry';
export default function Page(props:{searchParams:Promise<Record<string,string|string[]|undefined>>}){return <AtlasEntry view='local' searchParams={props.searchParams}/>}
