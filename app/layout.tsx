import type { Metadata } from 'next';
import '@fontsource-variable/syne';
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/dm-sans';
import '@fontsource-variable/newsreader';
import '@fontsource/barlow-condensed/600.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import './globals.css';
import {AppTheme} from '@/apps/overshoot/atlas-next/AppTheme';
import {NewsletterInvite} from '@/apps/overshoot/atlas-next/NewsletterInvite';
export const metadata:Metadata={title:'OVERSHOOT — A planetary atlas of material flows',description:'Follow extraction, trade, making, use and waste by place and material. Explore geolocated source records and national accounts, then inspect the evidence.',icons:{icon:'/favicon.svg?v=2',shortcut:'/favicon.svg?v=2'},openGraph:{type:'website',url:'https://overshoot.gaiaai.xyz/',siteName:'OVERSHOOT',title:'OVERSHOOT — A planetary atlas of material flows',description:'Where did it come from? Where did it go? Follow materials from extraction through trade, use, and waste.',images:[{url:'https://overshoot.gaiaai.xyz/og.png',width:1200,height:630,alt:'OVERSHOOT — Where did it come from? Where did it go?'}]},twitter:{card:'summary_large_image',title:'OVERSHOOT — A planetary atlas of material flows',description:'Where did it come from? Where did it go? Follow materials from extraction through trade, use, and waste.',images:['https://overshoot.gaiaai.xyz/og.png']}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:"try{var t=localStorage.getItem('overshoot-theme');document.documentElement.classList.toggle('dark',t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches)}catch(e){}"}}/></head><body><AppTheme>{children}<NewsletterInvite/></AppTheme></body></html>}
