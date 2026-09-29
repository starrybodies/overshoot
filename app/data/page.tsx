import AtlasEntry from '@/apps/overshoot/atlas-next/AtlasEntry';
export const metadata={title:'Open data and MCP',description:'Download the atlas datasets and query them through the open MCP endpoint, with the full source register.',alternates:{canonical:'/data'}};
export default function Page(props:{searchParams:Promise<Record<string,string|string[]|undefined>>}){return <AtlasEntry view='data' searchParams={props.searchParams}/>}
