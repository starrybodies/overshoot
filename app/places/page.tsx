import AtlasEntry from '@/apps/overshoot/atlas-next/AtlasEntry';
export const metadata={title:'Places',description:'Material accounts for a country or region: what it extracts, trades and discards.',alternates:{canonical:'/places'}};
export default function Page(props:{searchParams:Promise<Record<string,string|string[]|undefined>>}){return <AtlasEntry view='places' searchParams={props.searchParams}/>}
