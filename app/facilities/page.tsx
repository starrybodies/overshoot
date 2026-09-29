import AtlasEntry from '@/apps/overshoot/atlas-next/AtlasEntry';
export const metadata={title:'Facilities',description:'Mapped mines, plants, landfills, wastewater works and other sites from named source registries.',alternates:{canonical:'/facilities'}};
export default function Page(props:{searchParams:Promise<Record<string,string|string[]|undefined>>}){return <AtlasEntry view='facilities' searchParams={props.searchParams}/>}
