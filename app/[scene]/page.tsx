import MaterialAtlas from '@/apps/overshoot/atlas-next/MaterialAtlas';
import {notFound} from 'next/navigation';
export default async function Page({params}:{params:Promise<{scene:string}>}){
 const {scene}=await params;
 if(scene==='extraction')return <MaterialAtlas initial={{view:'facilities',kind:'mining',place:'WORLD'}}/>;
 if(['stock','overview'].includes(scene))return <MaterialAtlas initial={{view:'places',place:'WORLD'}}/>;
 if(['discard','waste'].includes(scene))return <MaterialAtlas initial={{view:'materials',material:'garbage',form:''}}/>;
 if(['return','recycling'].includes(scene))return <MaterialAtlas initial={{view:'materials',material:'plastic',form:'3915'}}/>;
 if(['flow','flows','trade'].includes(scene))return <MaterialAtlas initial={{view:'trade'}}/>;
 if(['stories','story','explore','explorer','home'].includes(scene))return <MaterialAtlas/>;
 notFound();
}
