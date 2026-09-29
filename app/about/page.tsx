import AtlasEntry from '@/apps/overshoot/atlas-next/AtlasEntry';
export const metadata={title:'About and how to use',description:'What OVERSHOOT shows, where the numbers come from, and how to read the maps.',alternates:{canonical:'/about'}};
export default function Page(props:{searchParams:Promise<Record<string,string|string[]|undefined>>}){return <AtlasEntry view='about' searchParams={props.searchParams}/>}
