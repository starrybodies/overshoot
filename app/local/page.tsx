import AtlasEntry from '@/apps/overshoot/atlas-next/AtlasEntry';
export const metadata={title:'Local',description:'Source records nearest to a latitude and longitude you choose.',alternates:{canonical:'/local'}};
export default function Page(props:{searchParams:Promise<Record<string,string|string[]|undefined>>}){return <AtlasEntry view='local' searchParams={props.searchParams}/>}
