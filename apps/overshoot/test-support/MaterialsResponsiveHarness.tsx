'use client';
export default function QA(){if(process.env.NODE_ENV!=='development')return null;return <main style={{background:'#ddd',padding:20,display:'flex',gap:20}}>{[390,412].map(w=><iframe key={w} title={`Mobile ${w}`} width={w} height={915} src="/region"/>)}</main>}
