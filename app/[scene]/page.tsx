import {notFound,redirect} from 'next/navigation';
const scenes:Record<string,string>={
 extraction:'/facilities?kind=mining&place=WORLD',
 stock:'/places?place=WORLD',overview:'/places?place=WORLD',
 discard:'/materials?material=garbage',
 return:'/materials?material=plastic&form=3915',recycling:'/materials?material=plastic&form=3915',
 flow:'/trade',flows:'/trade',
 stories:'/',story:'/',explore:'/',explorer:'/',home:'/'
};
export default async function Page({params}:{params:Promise<{scene:string}>}){
 const target=scenes[(await params).scene];
 if(!target)notFound();
 redirect(target);
}
