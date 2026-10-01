'use client';
import Link from 'next/link';
export default function ErrorPage({reset}:{error:Error&{digest?:string};reset:()=>void}){
 return <main className="oa-system-page"><Link href="/" className="oa-system-brand">OVERSHOOT</Link><span className="oa-system-label">SOMETHING WENT WRONG</span><h1>This page<br/>could not load.</h1><p>Try again, or return to the homepage to continue.</p><nav aria-label="Page recovery"><button onClick={reset}>Try again</button><Link href="/">Homepage</Link></nav></main>;
}
