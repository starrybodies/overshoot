import AtlasEntry from '@/apps/overshoot/atlas-next/AtlasEntry';
export const metadata={title:'Materials',description:'Pick a material and follow where it is extracted, refined, made, used, recovered and disposed of, with the source behind each record.',alternates:{canonical:'/materials'}};
export default function Page(props:{searchParams:Promise<Record<string,string|string[]|undefined>>}){return <AtlasEntry view='materials' searchParams={props.searchParams}/>}
