import {env} from 'cloudflare:workers';

const CONSENT='Email me occasional OVERSHOOT updates from Gaia AI. I can unsubscribe from future messages.';
const headers={'Content-Type':'application/json','Cache-Control':'no-store'};
const json=(body:object,status=200)=>new Response(JSON.stringify(body),{status,headers});

export async function POST(request:Request){
  const origin=request.headers.get('origin');
  if(origin){try{if(new URL(origin).host!==new URL(request.url).host)return json({error:'Invalid origin.'},403)}catch{return json({error:'Invalid origin.'},403)}}
  let body:Record<string,unknown>;
  try{body=await request.json() as Record<string,unknown>}catch{return json({error:'Please enter a valid email address.'},400)}
  if(body.website)return json({ok:true}); // A hidden field discourages automated submissions.
  const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';
  const path=typeof body.path==='string'&&body.path.startsWith('/')?body.path.slice(0,256):'/';
  if(!/^[^\s@]{1,64}@[^\s@]{1,240}\.[^\s@]{2,}$/.test(email)||email.length>254)return json({error:'Please enter a valid email address.'},400);
  if(body.consent!==true)return json({error:'Please agree to receive updates before subscribing.'},400);
  try{
    const db=(env as unknown as {DB:D1Database}).DB;
    await db.prepare('INSERT INTO newsletter_subscribers (email, consent_text, source_path, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(email) DO NOTHING').bind(email,CONSENT,path,new Date().toISOString()).run();
    return json({ok:true});
  }catch(error){console.error('Newsletter signup failed',error);return json({error:'Signup is temporarily unavailable. Please try again.'},503)}
}
