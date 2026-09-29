import AtlasEntry from '@/apps/overshoot/atlas-next/AtlasEntry';
export const metadata={title:'Waste',description:'National waste generation and treatment accounts, with the reference year and definitions each country reports.',alternates:{canonical:'/waste'}};
export default function Page(props:{searchParams:Promise<Record<string,string|string[]|undefined>>}){return <AtlasEntry view='waste' searchParams={props.searchParams}/>;}
