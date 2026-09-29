import AtlasEntry from '@/apps/overshoot/atlas-next/AtlasEntry';
export const metadata={title:'Trade',description:'Reported trade flows between countries for a chosen product, by year, with sources and coverage.',alternates:{canonical:'/trade'}};
export default function Page(props:{searchParams:Promise<Record<string,string|string[]|undefined>>}){return <AtlasEntry view='trade' searchParams={props.searchParams}/>}
