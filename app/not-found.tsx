import Link from 'next/link';
export default function NotFound(){
 return <main className="oa-system-page"><Link href="/" className="oa-system-brand">OVERSHOOT</Link><span className="oa-system-label">404</span><h1>Page not found.</h1><p>This address does not match a page. Start with a material or a place to continue.</p><nav aria-label="Page recovery"><Link href="/">Homepage</Link><Link href="/materials">Materials</Link><Link href="/places">Places</Link></nav></main>;
}
