// Code-rendered shots for the launch film. Loaded into the page by render.mjs.
//
// window.setup(id) prepares a shot; window.draw(t) paints the frame at t
// seconds. Shots that hand off to each other share the same drawing call at
// the cut, so the last frame of one is the first frame of the next.
//
// Colours come from the atlas (copper #b85226, the home globe's greens).
// Globe lights are the atlas's own mapped points (mining areas, landfills,
// river outfalls); flows are illustrative particles between them and carry no
// labels, numbers or claims. Nothing here draws the OVERSHOOT interface: G12
// only scales the recorded P15 still.

const canvas=document.getElementById('c'),ctx=canvas.getContext('2d');
const W=canvas.width,H=canvas.height;
const land=topojson.feature(DATA.land,DATA.land.objects.land);
const C={bg:'#0d1310',ocean:'#1c3024',land:'#4a6848',nightOcean:'#060b0a',nightLand:'#17241c',coast:'rgba(214,230,190,.35)',copper:'#b85226',glow:'#e8a468',bone:'#ece6d6'};

// ── maths ───────────────────────────────────────────────────────────────
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const ease=x=>{x=clamp(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2};
const lerp=(a,b,x)=>a+(b-a)*x;
const span=(t,a,b)=>clamp((t-a)/(b-a));
const fade=(t,a,b,c,d)=>Math.min(ease(span(t,a,b)),1-ease(span(t,c,d)));
const rng=seed=>()=>((seed=Math.imul(seed^seed>>>15,1|seed)+0x6d2b79f5|0)>>>0)/4294967296;
function hash(x,y,s=0){let h=Math.imul(x|0,374761393)+Math.imul(y|0,668265263)+Math.imul(s|0,982451653)|0;h=Math.imul(h^h>>>13,1274126177);return((h^h>>>16)>>>0)/4294967296}
function noise(x,y,s=0){
 const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
 const a=hash(xi,yi,s),b=hash(xi+1,yi,s),c=hash(xi,yi+1,s),d=hash(xi+1,yi+1,s);
 return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;
}
function fbm(x,y,s=0,octaves=5){let v=0,a=.5,f=1,n=0;for(let i=0;i<octaves;i++){v+=a*noise(x*f,y*f,s+i*17);n+=a;f*=2;a*=.5}return v/n}
const rgb=(r,g,b,a=1)=>`rgba(${r|0},${g|0},${b|0},${a})`;
const mix=(p,q,x)=>p.map((v,i)=>lerp(v,q[i],x));

// ── textures ────────────────────────────────────────────────────────────
function texture(size,fn){
 const c=document.createElement('canvas');c.width=c.height=size;
 const x=c.getContext('2d'),img=x.createImageData(size,size),d=img.data;
 for(let j=0;j<size;j++)for(let i=0;i<size;i++){const [r,g,b]=fn(i,j),k=(j*size+i)*4;d[k]=r;d[k+1]=g;d[k+2]=b;d[k+3]=255}
 x.putImageData(img,0,0);return c;
}
const layer=()=>{const c=document.createElement('canvas');c.width=W;c.height=H;return c};
const image=src=>new Promise(done=>{const img=new Image();img.onload=()=>done(img);img.src=src});

// Dark host rock cut by a vein of chalcopyrite (brass) and bornite (peacock).
const ROCK=1400;
const vein=(i,j)=>Math.abs(fbm(i/430+fbm(i/520,j/520,2,3)*1.3,j/980,3,4)-.5);
let rock,glint;
function makeRock(){
 const cell=30;
 rock=texture(ROCK,(i,j)=>{
  const v=vein(i,j),grain=fbm(i/55,j/55,5,3);
  if(v<.055){
   const gx=Math.floor(i/cell),gy=Math.floor(j/cell);let d1=1e9,d2=1e9,id=0;
   for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++){
    const cx=gx+ox,cy=gy+oy,px=(cx+hash(cx,cy,1))*cell,py=(cy+hash(cx,cy,2))*cell,d=(px-i)**2+(py-j)**2;
    if(d<d1){d2=d1;d1=d;id=cx*7919+cy}else if(d<d2)d2=d;
   }
   const pick=hash(id,0,3),facet=.45+.75*hash(id,0,4),edge=clamp((Math.sqrt(d2)-Math.sqrt(d1))/3);
   const base=pick<.55?[205,160,62]:pick<.7?[176,86,46]:pick<.85?[122,72,160]:[64,108,176];
   const shade=facet*(.35+.65*edge)*(1-v*6);
   return base.map(c=>c*shade);
  }
  const h=fbm(i/140,j/140,1,5),halo=clamp(1-(v-.055)*9);
  const g=(18+54*h*(.7+.6*grain))*(1-.45*halo);
  const fleck=hash(i,j,9)>.9985?90:0;
  return [g+fleck,g*1.02+fleck,g*1.06+fleck];
 });
 // The grain that catches the light: a vein pixel near the centre.
 for(let r=0;r<200&&!glint;r+=4)for(let a=0;a<Math.PI*2&&!glint;a+=.2){
  const i=Math.round(700+r*Math.cos(a)),j=Math.round(700+r*Math.sin(a));
  if(vein(i,j)<.02)glint={x:i,y:j};
 }
 glint=glint||{x:700,y:700};
}

// Arid, ridged mountain country seen from high above.
let terrain;
function makeTerrain(){
 const S=1400;
 const ridge=(i,j)=>{let v=0,a=.5,f=1/260;for(let o=0;o<5;o++){v+=a*(1-Math.abs(noise(i*f,j*f,40+o)*2-1))**2;a*=.5;f*=2}return v};
 terrain=texture(S,(i,j)=>{
  const h=ridge(i,j),dx=ridge(i+3,j+3)-h,flat=clamp((.34-h)*6);
  const light=clamp(.75-dx*14,.25,1.4);
  const base=mix([88,62,44],[168,126,84],clamp(h*1.4));
  const c=mix(base,[196,184,160],flat*.8);
  return c.map(v=>v*light);
 });
 const m=terrain.getContext('2d'),g=m.createRadialGradient(S/2,S/2,S*.2,S/2,S/2,S*.5);
 g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(1,'rgba(0,0,0,0)');
 m.globalCompositeOperation='destination-in';m.fillStyle=g;m.fillRect(0,0,S,S);
}

// ── globe ───────────────────────────────────────────────────────────────
function arcs(count,seed,ends=[DATA.mines,DATA.rivers,DATA.landfills,DATA.mines]){
 const r=rng(seed),pick=list=>{const i=Math.floor(r()*list.length/2)*2;return [list[i],list[i+1]]};
 const out=[];
 while(out.length<count){
  const a=pick(DATA.mines),b=pick(ends[Math.floor(r()*ends.length)]);
  if(d3.geoDistance(a,b)<.25)continue;
  out.push({i:d3.geoInterpolate(a,b),phase:r(),speed:.05+r()*.1,len:.025+r()*.045,w:.5+r()*.9});
 }
 return out;
}

function globe(proj,{night=false,alpha=1,lines=false}={}){
 const path=d3.geoPath(proj,ctx),[cx,cy]=proj.translate(),r=proj.scale();
 ctx.globalAlpha=alpha;
 if(r<4000){
  const halo=ctx.createRadialGradient(cx,cy,r*.96,cx,cy,r*1.2);
  halo.addColorStop(0,night?'rgba(120,160,190,.16)':'rgba(170,205,160,.22)');halo.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=halo;ctx.beginPath();ctx.arc(cx,cy,r*1.2,0,Math.PI*2);ctx.fill();
 }
 ctx.fillStyle=night?C.nightOcean:C.ocean;ctx.beginPath();path({type:'Sphere'});ctx.fill();
 if(lines){
  ctx.strokeStyle='rgba(236,230,214,.1)';ctx.lineWidth=.6;ctx.beginPath();path(d3.geoGraticule10());ctx.stroke();
  ctx.strokeStyle='rgba(236,230,214,.55)';ctx.lineWidth=1;ctx.beginPath();path(land);ctx.stroke();
 }else{
  ctx.fillStyle=night?C.nightLand:C.land;ctx.beginPath();path(land);ctx.fill();
  ctx.strokeStyle=night?'rgba(160,190,170,.18)':C.coast;ctx.lineWidth=.8;ctx.stroke();
 }
 if(r<4000){
  const shade=ctx.createRadialGradient(cx-r*.35,cy-r*.35,r*.1,cx,cy,r);
  shade.addColorStop(0,'rgba(0,0,0,0)');shade.addColorStop(1,night?'rgba(0,0,0,.6)':'rgba(0,0,0,.45)');
  ctx.fillStyle=shade;ctx.beginPath();path({type:'Sphere'});ctx.fill();
 }
 ctx.globalAlpha=1;
}

function lights(proj,list,colour,size,alpha,twinkle=0,t=0){
 const rot=proj.rotate(),centre=[-rot[0],-rot[1]];
 ctx.fillStyle=colour;ctx.globalCompositeOperation='lighter';
 for(let i=0;i<list.length;i+=2){
  const p=[list[i],list[i+1]];
  if(d3.geoDistance(p,centre)>1.5)continue;
  const [x,y]=proj(p);
  ctx.globalAlpha=alpha*(1-twinkle+twinkle*(.5+.5*Math.sin(t*3+i)));
  ctx.fillRect(x-size/2,y-size/2,size,size);
 }
 ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}

function flows(proj,list,t,alpha){
 if(alpha<=0)return;
 const rot=proj.rotate(),centre=[-rot[0],-rot[1]];
 ctx.lineCap='round';ctx.globalCompositeOperation='lighter';
 for(const a of list){
  const head=(a.phase+t*a.speed)%1,tail=Math.max(0,head-a.len);
  const p=a.i(head);if(d3.geoDistance(p,centre)>1.52)continue;
  const pts=[];for(let k=0;k<=5;k++)pts.push(proj(a.i(lerp(tail,head,k/5))));
  const fadeIn=Math.sin(Math.PI*head);
  ctx.globalAlpha=alpha*.55*fadeIn;ctx.strokeStyle=C.copper;ctx.lineWidth=a.w;
  ctx.beginPath();pts.forEach(([x,y],k)=>k?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();
  const [hx,hy]=pts[pts.length-1];
  ctx.globalAlpha=alpha*fadeIn;ctx.fillStyle=C.glow;ctx.fillRect(hx-a.w,hy-a.w,a.w*2,a.w*2);
 }
 ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}

const ortho=(x,y,r,lon,lat)=>d3.geoOrthographic().clipAngle(90).translate([x,y]).scale(r).rotate([-lon,-lat]);

// ── shared pieces ───────────────────────────────────────────────────────
function vignette(strength=.6){
 const g=ctx.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*1.05);
 g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(0,0,0,${strength})`);
 ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
}
function flare(x,y,size,alpha){
 if(alpha<=0)return;
 ctx.globalCompositeOperation='lighter';ctx.globalAlpha=alpha;
 const g=ctx.createRadialGradient(x,y,0,x,y,size);
 g.addColorStop(0,'rgba(255,236,200,1)');g.addColorStop(.15,'rgba(232,164,104,.6)');g.addColorStop(1,'rgba(184,82,38,0)');
 ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,size,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='rgba(255,230,190,.8)';ctx.lineWidth=1.2;
 ctx.beginPath();ctx.moveTo(x-size*2.2,y);ctx.lineTo(x+size*2.2,y);ctx.moveTo(x,y-size*1.1);ctx.lineTo(x,y+size*1.1);ctx.stroke();
 ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}
function motes(t,count,seed,alpha){
 const r=rng(seed);
 ctx.globalCompositeOperation='lighter';
 for(let i=0;i<count;i++){
  const x=(r()*W+t*(10+r()*30))%W,y=(r()*H-t*(5+r()*12)+H)%H,s=1+r()*3;
  ctx.globalAlpha=alpha*(.2+.5*r());ctx.fillStyle='rgba(236,220,190,1)';
  ctx.beginPath();ctx.arc(x,y,s,0,Math.PI*2);ctx.fill();
 }
 ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}

// An ore fragment: a faceted stone cut from the rock texture around the glint.
const FRAG=(()=>{const r=rng(31),v=[];for(let k=0;k<11;k++){const a=k/11*Math.PI*2+r()*.3;v.push([Math.cos(a)*(.72+r()*.3),Math.sin(a)*(.72+r()*.3)])}return v})();
function fragment(x,y,size,rot,alpha=1){
 ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(rot);
 ctx.beginPath();FRAG.forEach(([a,b],k)=>k?ctx.lineTo(a*size,b*size):ctx.moveTo(a*size,b*size));ctx.closePath();
 ctx.save();ctx.clip();
 const s=size/180;ctx.drawImage(rock,-glint.x*s*1.2,-glint.y*s*1.2,ROCK*s*1.2,ROCK*s*1.2);
 for(let k=0;k<FRAG.length;k++){
  const [a,b]=FRAG[k],[c,d]=FRAG[(k+1)%FRAG.length],n=Math.atan2(b+d,a+c);
  const lit=Math.cos(n+2.3);
  ctx.fillStyle=lit>0?`rgba(255,235,210,${lit*.18})`:`rgba(0,0,0,${-lit*.55})`;
  ctx.beginPath();ctx.moveTo(size*.08,-size*.1);ctx.lineTo(a*size,b*size);ctx.lineTo(c*size,d*size);ctx.fill();
 }
 ctx.restore();
 ctx.strokeStyle='rgba(255,220,180,.35)';ctx.lineWidth=2;ctx.stroke();
 ctx.restore();
}

// A falling stream of fine particles: concentrate (dark, glittering) or scrap.
function stream(t,x,width,{top=-20,bottom=H+20,count=900,seed=5,dark=true,alpha=1}={}){
 const r=rng(seed),len=bottom-top;
 ctx.globalAlpha=alpha*.55;
 const body=ctx.createLinearGradient(x-width,0,x+width,0);
 body.addColorStop(0,'rgba(0,0,0,0)');body.addColorStop(.5,dark?'rgba(30,30,27,.9)':'rgba(120,60,30,.5)');body.addColorStop(1,'rgba(0,0,0,0)');
 ctx.fillStyle=body;ctx.fillRect(x-width,top,width*2,len);
 for(let i=0;i<count;i++){
  const off=(r()-.5)*(r()+r())*width,speed=.55+r()*.35,phase=r(),s=1.5+r()*2.5;
  const y=top+((phase+t*speed)%1)*len,wx=x+off+Math.sin(y/90+i)*3;
  const sparkle=r()>.9&&hash(i,Math.floor(t*14),3)>.4;
  ctx.globalAlpha=alpha*(sparkle?1:.85);
  ctx.fillStyle=sparkle?'#f3d3a0':dark?rgb(38+r()*30,36+r()*28,32+r()*24):rgb(150+r()*80,80+r()*50,40);
  ctx.fillRect(wx,y,s,s*3.5);
 }
 ctx.globalAlpha=1;
}

// Molten metal poured in an arc from a ladle into a mould.
function moltenPour(t,{from=[520,180],to=[1240,760],flow=1,mould='anode',fill=1,alpha=1}={}){
 ctx.save();ctx.globalAlpha=alpha;
 ctx.fillStyle='#0a0908';ctx.fillRect(0,0,W,H);
 const heat=ctx.createRadialGradient(to[0],to[1],10,to[0],to[1],900);
 heat.addColorStop(0,'rgba(255,140,50,.35)');heat.addColorStop(1,'rgba(0,0,0,0)');
 ctx.fillStyle=heat;ctx.fillRect(0,0,W,H);
 // ladle lip
 ctx.fillStyle='#1d1a18';ctx.beginPath();ctx.ellipse(from[0]-120,from[1]-40,230,120,-.5,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='rgba(255,170,90,.5)';ctx.lineWidth=4;ctx.stroke();
 // mould
 const [mx,my]=to,mw=mould==='anode'?360:420,mh=mould==='anode'?190:150;
 ctx.fillStyle='#2a2522';
 ctx.beginPath();
 if(mould==='anode'){ctx.rect(mx-mw/2,my-mh/2,mw,mh);ctx.rect(mx-mw/2-60,my-mh/2,60,34);ctx.rect(mx+mw/2,my-mh/2,60,34)}
 else{ctx.moveTo(mx-mw/2,my-mh/2);ctx.lineTo(mx+mw/2,my-mh/2);ctx.lineTo(mx+mw/2-40,my+mh/2);ctx.lineTo(mx-mw/2+40,my+mh/2);ctx.closePath()}
 ctx.fill();
 const metal=ctx.createRadialGradient(mx,my,10,mx,my,mw*.7);
 metal.addColorStop(0,'rgba(255,245,210,1)');metal.addColorStop(.4,'rgba(255,170,70,1)');metal.addColorStop(1,'rgba(200,80,30,1)');
 ctx.save();ctx.clip();ctx.globalAlpha=alpha*clamp(fill);ctx.fillStyle=metal;ctx.fillRect(mx-mw,my-mh,mw*2,mh*2);
 for(let k=0;k<30;k++){const sx=mx+Math.sin(k*7.1+t*2)*mw*.4,sy=my+Math.cos(k*3.3+t*1.7)*mh*.35;ctx.fillStyle='rgba(255,255,230,.25)';ctx.beginPath();ctx.ellipse(sx,sy,18,6,0,0,Math.PI*2);ctx.fill()}
 ctx.restore();
 // arc
 if(flow>0){
  ctx.globalAlpha=alpha;ctx.lineCap='round';ctx.globalCompositeOperation='lighter';
  const ctrl=[lerp(from[0],to[0],.55),from[1]-60];
  for(const [w,c] of [[34,'rgba(255,120,40,.25)'],[16,'rgba(255,190,90,.8)'],[6,'rgba(255,250,220,1)']]){
   ctx.strokeStyle=c;ctx.lineWidth=w*flow;ctx.beginPath();ctx.moveTo(...from);ctx.quadraticCurveTo(...ctrl,...to);ctx.stroke();
  }
  const r=rng(8);
  for(let k=0;k<70;k++){
   const age=(r()+t*1.8)%1,a=r()*Math.PI*2,v=80+r()*260;
   ctx.globalAlpha=alpha*(1-age)*flow;ctx.fillStyle='#ffd99a';
   ctx.fillRect(to[0]+Math.cos(a)*v*age,to[1]-Math.abs(Math.sin(a))*v*age+age*age*200,3,3);
  }
  ctx.globalCompositeOperation='source-over';
 }
 ctx.restore();
}

// A bulk carrier from high above at night: hatch covers, no name or livery.
function ship(x,y,L,angle,t,alpha=1){
 ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(angle);
 const B=L*.16;
 // wake: a thin bright line trailing astern, spreading into foam
 ctx.globalCompositeOperation='lighter';
 const wake=ctx.createLinearGradient(-L/2-W*2,0,-L/2,0);
 wake.addColorStop(0,'rgba(220,235,240,0)');wake.addColorStop(1,'rgba(220,235,240,.22)');
 ctx.fillStyle=wake;ctx.beginPath();ctx.moveTo(-L/2,-B*.35);ctx.lineTo(-L/2-W*2,-B*.9);ctx.lineTo(-L/2-W*2,B*.9);ctx.lineTo(-L/2,B*.35);ctx.fill();
 ctx.strokeStyle='rgba(255,245,235,.9)';ctx.lineWidth=Math.max(1,L*.004);
 ctx.beginPath();ctx.moveTo(-L/2,0);ctx.lineTo(-L/2-W*2,0);ctx.stroke();
 const r=rng(4);
 for(let k=0;k<160;k++){const d=r()*W*1.2,s=(r()-.5)*B*(.5+d/L*.6);ctx.fillStyle=`rgba(230,240,245,${.4*(1-d/(W*1.2))})`;ctx.fillRect(-L/2-d,s+Math.sin(t*3+k)*2,2,2)}
 ctx.globalCompositeOperation='source-over';
 // hull
 const hull=()=>{ctx.beginPath();ctx.moveTo(-L/2+B*.3,-B/2);ctx.lineTo(L*.3,-B/2);ctx.quadraticCurveTo(L/2,-B*.4,L/2,0);ctx.quadraticCurveTo(L/2,B*.4,L*.3,B/2);ctx.lineTo(-L/2+B*.3,B/2);ctx.quadraticCurveTo(-L/2,B/2,-L/2,0);ctx.quadraticCurveTo(-L/2,-B/2,-L/2+B*.3,-B/2);ctx.closePath()};
 ctx.fillStyle='#3b1f1a';hull();ctx.fill();
 ctx.save();ctx.scale(.94,.84);ctx.fillStyle='#2b302f';hull();ctx.fill();ctx.restore();
 for(let k=0;k<7;k++){
  const hx=-L*.3+k*L*.086;
  ctx.fillStyle='#3d4a50';ctx.fillRect(hx,-B*.3,L*.072,B*.6);
  ctx.strokeStyle='rgba(200,215,220,.25)';ctx.lineWidth=1;ctx.strokeRect(hx,-B*.3,L*.072,B*.6);
 }
 ctx.fillStyle='#cfccc2';ctx.fillRect(-L*.46,-B*.38,L*.07,B*.76);
 ctx.fillStyle='rgba(255,200,120,.9)';for(let k=0;k<5;k++)ctx.fillRect(-L*.455+k*L*.012,-B*.3,L*.005,B*.05);
 // deck lights and bow wave
 ctx.globalCompositeOperation='lighter';
 for(const [lx,ly] of [[-L*.42,0],[L*.36,-B*.3],[L*.36,B*.3],[0,-B*.42],[0,B*.42],[-L*.2,-B*.42],[L*.2,B*.42]]){
  const g=ctx.createRadialGradient(lx,ly,0,lx,ly,L*.04);g.addColorStop(0,'rgba(255,205,140,.9)');g.addColorStop(1,'rgba(255,205,140,0)');
  ctx.fillStyle=g;ctx.fillRect(lx-L*.04,ly-L*.04,L*.08,L*.08);
 }
 ctx.strokeStyle='rgba(235,245,250,.6)';ctx.lineWidth=Math.max(1,L*.005);
 ctx.beginPath();ctx.moveTo(L/2,0);ctx.quadraticCurveTo(L*.35,-B*.9,L*.1,-B*1.2);ctx.moveTo(L/2,0);ctx.quadraticCurveTo(L*.35,B*.9,L*.1,B*1.2);ctx.stroke();
 ctx.restore();
}

function nightSea(t,alpha=1){
 ctx.globalAlpha=alpha;ctx.fillStyle='#04080a';ctx.fillRect(0,0,W,H);
 ctx.globalCompositeOperation='lighter';
 const r=rng(71);
 for(let k=0;k<900;k++){
  const x=r()*W,y=r()*H,band=Math.exp(-((((x-W*.7)-(y-H*.3)*.6)/260)**2));
  const on=hash(k,Math.floor(t*10),2);
  if(on<.5)continue;
  ctx.globalAlpha=alpha*band*(on-.5)*1.6;ctx.fillStyle='#dfe8ea';ctx.fillRect(x,y,3+band*6,1.5);
 }
 ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}

// A city seen from above at dusk: blocks, lit windows, glowing streets.
function city(scale,t,alpha=1,cx=W/2,cy=H/2){
 ctx.save();ctx.globalAlpha=alpha;
 const sky=ctx.createLinearGradient(0,0,W,H);sky.addColorStop(0,'#141526');sky.addColorStop(1,'#2a1c1a');
 ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
 const bw=190*scale,bh=130*scale,st=28*scale;
 const nx=Math.ceil(W/(bw+st)/2)+2,ny=Math.ceil(H/(bh+st)/2)+2;
 ctx.globalCompositeOperation='lighter';
 ctx.strokeStyle='rgba(255,178,96,.35)';ctx.lineWidth=Math.max(1,st*.4);
 for(let i=-nx;i<=nx;i++){const x=cx+i*(bw+st)-st/2;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
 for(let j=-ny;j<=ny;j++){const y=cy+j*(bh+st)-st/2;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
 ctx.globalCompositeOperation='source-over';
 for(let i=-nx;i<nx;i++)for(let j=-ny;j<ny;j++){
  const x=cx+i*(bw+st),y=cy+j*(bh+st);
  ctx.fillStyle=rgb(22+hash(i,j,1)*16,22+hash(i,j,2)*14,30+hash(i,j,3)*14,alpha);ctx.fillRect(x,y,bw,bh);
  const n=6,m=4;
  for(let a=0;a<n;a++)for(let b=0;b<m;b++){
   const on=hash(i*13+a,j*17+b,5);if(on<.45)continue;
   const flick=hash(i*13+a,j*17+b,Math.floor(t*2+on*9))>.97?.3:1;
   ctx.fillStyle=on>.85?`rgba(200,215,240,${.8*flick*alpha})`:`rgba(255,196,120,${.85*flick*alpha})`;
   ctx.fillRect(x+bw*(a+.3)/n,y+bh*(b+.3)/m,Math.max(1,bw*.07),Math.max(1,bh*.08));
  }
 }
 ctx.restore();
}

// ── scenes ──────────────────────────────────────────────────────────────
// G01 → G02 share the rock view; G02 → G03 share the orbit globe.
const rockView=(s,x,y)=>ctx.drawImage(rock,x-glint.x*s,y-glint.y*s,ROCK*s,ROCK*s);
const G01end={s:1.6,x:1080,y:560};
const ORBIT={x:W*.52,y:H*.54,r:430,lon:-40,lat:-14};
function orbitGlobe(t,flowAlpha,flowList){
 const p=ortho(ORBIT.x,ORBIT.y,ORBIT.r,ORBIT.lon,ORBIT.lat);
 globe(p,{night:true});
 const term=ctx.createLinearGradient(ORBIT.x-ORBIT.r,0,ORBIT.x+ORBIT.r,0);
 term.addColorStop(0,'rgba(255,255,255,.06)');term.addColorStop(.55,'rgba(0,0,0,0)');term.addColorStop(1,'rgba(0,0,0,.55)');
 ctx.fillStyle=term;ctx.beginPath();d3.geoPath(p,ctx)({type:'Sphere'});ctx.fill();
 lights(p,DATA.mines,C.glow,1.6,.5*flowAlpha);
 flows(p,flowList,t,flowAlpha*.6);
 return p;
}

const scenes={
 // Mineral vein macro: raking light finds one copper grain.
 G01(){
  makeRock();
  return {draw(t){
   ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
   const k=t/3.5,s=lerp(1.75,G01end.s,ease(k)),x=lerp(1180,G01end.x,k),y=lerp(610,G01end.y,k);
   rockView(s,x,y);
   const light=ease(t/2.6),sweep=lerp(-.4,1.15,ease(t/3.2));
   const g=ctx.createLinearGradient(0,0,W,H*.4);
   g.addColorStop(0,`rgba(0,0,0,${1-light*.9})`);g.addColorStop(clamp(sweep-.35),`rgba(0,0,0,${1-light*.9})`);
   g.addColorStop(clamp(sweep),`rgba(0,0,0,${.35*(1-light)+.1})`);g.addColorStop(1,`rgba(0,0,0,${1-light*.35})`);
   ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
   vignette(.75);
   motes(t,40,3,.35*light);
   flare(x,y,lerp(10,46,span(t,2.1,3.2)),span(t,2.1,2.9)*(.85+.15*Math.sin(t*9)));
  }};
 },

 // Pull-back: grain → rock → range → continent → Earth, trajectories fading in.
 G02(){
  makeRock();makeTerrain();const list=arcs(900,2);
  return {draw(t){
   ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
   const a=Math.pow(t/3.5,1.35);
   const gs=ORBIT.r*Math.exp((1-a)*10.5);
   if(a>.4){
    const p=ortho(W/2+(ORBIT.x-W/2)*span(a,.6,1),H/2+(ORBIT.y-H/2)*span(a,.6,1),Math.min(gs,60000),lerp(-69,ORBIT.lon,ease(span(a,.55,1))),lerp(-24,ORBIT.lat,ease(span(a,.55,1))));
    if(a<.999){globe(p,{night:true});lights(p,DATA.mines,C.glow,1.6,.5*span(a,.8,1))}
    if(a>=.999||t>=3.5-1/48){ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);orbitGlobe(t,1,list)}
    else{
     const term=ctx.createLinearGradient(p.translate()[0]-gs,0,p.translate()[0]+gs,0);
     term.addColorStop(0,'rgba(255,255,255,.06)');term.addColorStop(.55,'rgba(0,0,0,0)');term.addColorStop(1,'rgba(0,0,0,.55)');
     ctx.globalAlpha=span(a,.8,1);ctx.fillStyle=term;ctx.beginPath();d3.geoPath(p,ctx)({type:'Sphere'});ctx.fill();ctx.globalAlpha=1;
     flows(p,list,t,.6*span(a,.82,1));
    }
   }
   const ts=G01end.s*35*Math.exp(-a*10.5);
   ctx.globalAlpha=1-ease(span(a,.45,.72));
   if(ctx.globalAlpha>0)ctx.drawImage(terrain,W/2-700*ts,H/2-700*ts,1400*ts,1400*ts);
   const rs=G01end.s*Math.exp(-a*10.5);
   ctx.globalAlpha=1-ease(span(a,.04,.28));
   if(ctx.globalAlpha>0){
    const x=lerp(G01end.x,W/2,ease(span(a,0,.1))),y=lerp(G01end.y,H/2,ease(span(a,0,.1)));
    rockView(rs,x,y);
    flare(x,y,46*(1-span(a,0,.08)),1-span(a,0,.06));
   }
   ctx.globalAlpha=1;vignette(.55);
  }};
 },

 // Dive from orbit into a terraced open pit; lock onto one falling fragment.
 G03(){
  makeRock();makeTerrain();const list=arcs(900,2);
  const PIT={x:W/2,y:H/2};
  const pit=(R,blur)=>{
   ctx.save();if(blur)ctx.filter=`blur(${blur}px)`;
   const ts=R/300;ctx.drawImage(terrain,PIT.x-700*ts,PIT.y-700*ts,1400*ts,1400*ts);
   const N=16;
   for(let i=0;i<N;i++){
    const rx=R*(1-i/N*.93),ry=rx*.78,oy=PIT.y+i*R*.012,tone=mix([146,108,74],[86,80,76],i/N);
    ctx.fillStyle=rgb(...tone.map(v=>v*.55));ctx.beginPath();ctx.ellipse(PIT.x,oy,rx,ry,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=rgb(...tone);ctx.beginPath();ctx.ellipse(PIT.x,oy+R*.01,rx*.955,ry*.95,0,0,Math.PI*2);ctx.fill();
   }
   ctx.globalCompositeOperation='overlay';ctx.globalAlpha=.55;
   ctx.beginPath();ctx.ellipse(PIT.x,PIT.y,R,R*.78,0,0,Math.PI*2);ctx.clip();
   ctx.drawImage(terrain,PIT.x-700*ts*.5,PIT.y-700*ts*.5,1400*ts*.5,1400*ts*.5);
   ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
   ctx.fillStyle='#2c4a44';ctx.beginPath();ctx.ellipse(PIT.x,PIT.y+R*.19,R*.07,R*.05,0,0,Math.PI*2);ctx.fill();
   ctx.strokeStyle='rgba(220,200,170,.35)';ctx.lineWidth=R*.008;ctx.beginPath();
   for(let a=0;a<Math.PI*9;a+=.05){const rr=R*(.95-a/(Math.PI*9)*.85);ctx.lineTo(PIT.x+Math.cos(a)*rr,PIT.y+Math.sin(a)*rr*.78+(1-rr/R)*R*.19)}
   ctx.stroke();ctx.restore();
  };
  return {draw(t){
   ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
   if(t<1.7){
    const d=ease(span(t,0,1.1)),z=Math.pow(span(t,0,1.7),2.2);
    const p=ortho(lerp(ORBIT.x,W/2,d),lerp(ORBIT.y,H/2,d),Math.min(ORBIT.r*Math.exp(z*11),60000),lerp(ORBIT.lon,-69.1,d),lerp(ORBIT.lat,-24.3,d));
    if(t<1/48)orbitGlobe(t,1,list);
    else{globe(p,{night:t<.8});lights(p,DATA.mines,C.glow,1.6,.5*(1-d));flows(p,list,t,.6*(1-span(t,0,.6)))}
   }
   const R=380*Math.exp(Math.pow(span(t,1.1,4),1.1)*2.9);
   ctx.globalAlpha=ease(span(t,1.1,1.7));
   if(ctx.globalAlpha>0)pit(R,lerp(0,10,span(t,3.1,3.7)));
   ctx.globalAlpha=1;
   if(t>2.6){
    const b=span(t,2.6,4),r=rng(12);
    for(let k=0;k<260;k++){
     const a=r()*Math.PI*2,v=r();
     ctx.fillStyle=`rgba(${150+r()*40},${120+r()*30},${90+r()*20},${.5*(1-b*.6)*v})`;
     const s=4+r()*18*b;ctx.beginPath();ctx.arc(W*.52+Math.cos(a)*v*b*700,H*.45+Math.sin(a)*v*b*420+b*b*260,s,0,Math.PI*2);ctx.fill();
    }
   }
   if(t>3){
    const f=ease(span(t,3,3.9));
    fragment(lerp(W*.56,W/2,f),lerp(H*.35,H/2,f),lerp(20,170,f),t*.35,span(t,3,3.2));
   }
   vignette(.55);
  }};
 },

 // Crush → grind → flotation → a dark, glittering stream of concentrate.
 G04(){
  makeRock();makeTerrain();
  const r=rng(44),parts=[...Array(900)].map(()=>({a:r()*Math.PI*2,d:r(),s:1.5+r()*3,g:r(),b:Math.floor(r()*60)}));
  const bubbles=[...Array(60)].map(()=>({x:W*(.2+r()*.6),r:12+r()*38,v:.4+r()*.5,p:r()}));
  return {draw(t){
   ctx.fillStyle='#0b0b0a';ctx.fillRect(0,0,W,H);
   // crusher jaws close in
   const close=ease(span(t,0,.55));
   if(t<1){
    ctx.globalAlpha=ease(span(t,0,.2))*(1-span(t,.8,1));
    for(const side of [-1,1]){
     ctx.fillStyle='#1c1d1f';ctx.beginPath();
     const x0=W/2+side*lerp(900,210,close);
     ctx.moveTo(x0,-50);ctx.lineTo(x0+side*900,-50);ctx.lineTo(x0+side*900,H+50);ctx.lineTo(x0+side*60,H+50);ctx.closePath();ctx.fill();
     ctx.strokeStyle='rgba(180,180,175,.18)';ctx.lineWidth=6;
     for(let k=0;k<12;k++){const y=k*95-20;ctx.beginPath();ctx.moveTo(x0+side*(8+k*5),y);ctx.lineTo(x0+side*80,y+30);ctx.stroke()}
    }
    ctx.globalAlpha=1;
   }
   if(t<.55){
    const shake=span(t,.3,.55)*8;
    fragment(W/2+Math.sin(t*90)*shake,H/2,170,1.05,1);
    ctx.strokeStyle=`rgba(255,220,170,${span(t,.35,.55)})`;ctx.lineWidth=2;ctx.beginPath();
    ctx.moveTo(W/2-60,H/2-120);ctx.lineTo(W/2+10,H/2-10);ctx.lineTo(W/2-30,H/2+130);ctx.moveTo(W/2+10,H/2-10);ctx.lineTo(W/2+140,H/2+30);ctx.stroke();
   }else if(t<1.1){
    // shards fly, then break down into particles
    const b=span(t,.55,1.1);
    for(let k=0;k<FRAG.length;k++){
     const [a,c]=FRAG[k],ang=Math.atan2(c,a);
     ctx.save();ctx.translate(W/2+Math.cos(ang)*b*260,H/2+Math.sin(ang)*b*200+b*b*120);ctx.rotate(b*(k-5)*.5);
     ctx.globalAlpha=1-span(b,.4,1);ctx.fillStyle=rgb(70+k*6,62+k*4,54);
     ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(a*90,c*90);ctx.lineTo(FRAG[(k+1)%FRAG.length][0]*90,FRAG[(k+1)%FRAG.length][1]*90);ctx.fill();ctx.restore();
    }
    ctx.globalAlpha=1;
   }
   // ground particles swirl into the flotation cell
   if(t>.75){
    const g=span(t,.75,1.6),pour=span(t,1.75,2.2);
    ctx.fillStyle=`rgba(46,52,46,${ease(span(t,.9,1.4))*(1-pour)})`;ctx.fillRect(0,0,W,H);
    for(let i=0;i<parts.length;i++){
     const p=parts[i],bub=bubbles[p.b];
     const swirl=p.a+g*3,rad=lerp(320,120,g)*p.d+40;
     let x=W/2+Math.cos(swirl)*rad*1.6,y=H/2+Math.sin(swirl)*rad;
     const cling=span(t,1.15+p.g*.3,1.5+p.g*.3);
     if(cling>0){const by=H+60-((bub.p+t*bub.v)%1)*(H+120);x=lerp(x,bub.x+Math.cos(p.a)*bub.r,cling);y=lerp(y,by+Math.sin(p.a)*bub.r,cling)}
     ctx.globalAlpha=(1-pour)*ease(span(t,.75,1));ctx.fillStyle=p.g>.8?'#d8b47c':rgb(52+p.g*40,50+p.g*36,44+p.g*30);
     ctx.fillRect(x,y,p.s,p.s);
    }
    ctx.globalAlpha=ease(span(t,1.05,1.4))*(1-span(t,1.8,2.1));
    for(const b of bubbles){
     const y=H+60-((b.p+t*b.v)%1)*(H+120);
     ctx.strokeStyle='rgba(225,235,230,.55)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(b.x,y,b.r,0,Math.PI*2);ctx.stroke();
     ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.arc(b.x-b.r*.35,y-b.r*.35,b.r*.18,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
   }
   if(t>1.75)stream(t,W/2,lerp(40,150,span(t,1.75,2.3)),{alpha:ease(span(t,1.75,2.15))});
   vignette(.6);
  }};
 },

 // Smelt → anode → tank house → cathode → rod → wire.
 G05(){
  return {draw(t){
   ctx.fillStyle='#0b0b0a';ctx.fillRect(0,0,W,H);
   if(t<1.15){
    const f=span(t,.2,1.1);
    const glow=ctx.createRadialGradient(W/2,H+60,20,W/2,H+60,lerp(200,1100,f));
    glow.addColorStop(0,'rgba(255,240,200,1)');glow.addColorStop(.25,'rgba(255,150,50,.9)');glow.addColorStop(1,'rgba(120,30,10,0)');
    ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
    for(let k=0;k<40;k++){const x=W/2+(hash(k,1)-.5)*900,y=H-((hash(k,2)+t*.8)%1)*H*.9;ctx.fillStyle=`rgba(255,${150+hash(k,3)*80},60,${.5*f})`;ctx.fillRect(x,y,3,8)}
    stream(t,W/2,150,{bottom:lerp(H+20,H*.7,f),alpha:1-span(t,.8,1.15)});
   }
   if(t>.95&&t<2.35)moltenPour(t,{alpha:fade(t,.95,1.2,2.1,2.35),fill:span(t,1.2,2.2)});
   if(t>2.1&&t<3.55){
    ctx.globalAlpha=fade(t,2.1,2.35,3.3,3.55);
    ctx.fillStyle='#0d1114';ctx.fillRect(0,0,W,H);
    for(let z=12;z>=1.2;z-=.8)for(let l=-7;l<=7;l++){
     const sx=W/2+l*300/z,sy=H*.4+160/z,w=170/z,h=230/z;
     if(z<1.9&&l===0)continue;
     ctx.fillStyle=rgb(96,52,30);ctx.fillRect(sx-w/2,sy,w,h);
     ctx.fillStyle='rgba(230,150,90,.5)';ctx.fillRect(sx-w/2,sy,w,Math.max(1,h*.03));
     ctx.fillStyle='rgba(40,110,110,.35)';ctx.fillRect(sx-w/2,sy+h*.55,w,h*.45);
    }
    const lift=ease(span(t,2.55,3.3)),cw=360,ch=480,cx=W/2,cy=H*.58-lift*300;
    const sheen=ctx.createLinearGradient(cx-cw,cy,cx+cw,cy+ch);
    const s=lerp(-.3,1.2,span(t,2.7,3.4));
    sheen.addColorStop(0,'#8a4724');sheen.addColorStop(clamp(s-.12),'#b8622e');sheen.addColorStop(clamp(s),'#ffd3a2');sheen.addColorStop(clamp(s+.12),'#b8622e');sheen.addColorStop(1,'#7a3d1f');
    ctx.fillStyle=sheen;ctx.fillRect(cx-cw/2,cy,cw,ch);
    ctx.fillStyle='rgba(40,110,110,.35)';ctx.fillRect(cx-cw/2,Math.max(cy,H*.58+ch*.55),cw,Math.max(0,cy+ch-Math.max(cy,H*.58+ch*.55)));
    ctx.fillStyle='#2a2a2a';ctx.fillRect(cx-cw/2-40,cy-18,cw+80,16);
    ctx.globalAlpha=1;
   }
   if(t>3.3){
    // sheet stretches into a glowing rod, the rod multiplies into drawn wire
    const r=ease(span(t,3.3,4.1)),n=Math.round(lerp(1,64,ease(span(t,4.05,4.9))));
    ctx.fillStyle='#0a0908';ctx.globalAlpha=ease(span(t,3.3,3.5));ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;
    if(t<4.1){
     const w=lerp(360,W*1.1,r),h=lerp(480,20,r);
     const g=ctx.createLinearGradient(0,H/2-h/2,0,H/2+h/2);g.addColorStop(0,'#7a3d1f');g.addColorStop(.45,'#ffc58f');g.addColorStop(1,'#6a3219');
     ctx.fillStyle=g;ctx.fillRect(W/2-w/2,H/2-h/2,w,h);
    }else{
     for(let k=0;k<n;k++){
      const y=H/2+(k-(n-1)/2)*(H/Math.max(n,2))*1.02,w=Math.max(3,lerp(20,12,span(t,4.05,4.9)));
      const g=ctx.createLinearGradient(0,y-w/2,0,y+w/2);g.addColorStop(0,'#5a2a14');g.addColorStop(.45,'#f0a468');g.addColorStop(1,'#4a2210');
      ctx.fillStyle=g;ctx.fillRect(0,y-w/2,W,w);
      ctx.globalCompositeOperation='lighter';
      for(let m=0;m<3;m++){const x=((hash(k,m,4)+t*2.2*(1+hash(k,m,5)))%1.2-.1)*W;ctx.fillStyle='rgba(255,220,180,.5)';ctx.fillRect(x,y-w*.3,160,w*.25)}
      ctx.globalCompositeOperation='source-over';
     }
    }
   }
   vignette(.55);
  }};
 },

 // A copper line rises into a circuit trace, a coastline route, then a ship's wake.
 G06(){
  const r=rng(66),traces=[...Array(70)].map(()=>{let x=r()*W*2-W/2,y=r()*H*2-H/2;const pts=[[x,y]];for(let k=0;k<6;k++){if(k%2)x+=(r()-.3)*500;else y+=(r()-.5)*300;pts.push([x,y])}return pts});
  const coast=x=>H*.36+(fbm(x/700,.5,77,4)-.5)*380;
  const SHIP={x:W*.62,y:H*.5,L:900};
  return {draw(t){
   const up=Math.exp(-span(t,.3,2.6)*1.6);
   ctx.fillStyle=C.bg;ctx.fillRect(0,0,W,H);
   const board=fade(t,.3,.8,1.2,1.7);
   if(board>0){
    ctx.globalAlpha=board;ctx.fillStyle='#10231a';ctx.fillRect(0,0,W,H);
    ctx.save();ctx.translate(W/2,H/2);ctx.scale(up,up);ctx.translate(-W/2,-H/2);
    ctx.strokeStyle='rgba(184,82,38,.55)';ctx.lineWidth=4;
    for(const p of traces){ctx.beginPath();p.forEach(([x,y],k)=>k?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.fillStyle='rgba(210,150,90,.6)';ctx.beginPath();ctx.arc(...p[p.length-1],8,0,Math.PI*2);ctx.fill()}
    ctx.restore();ctx.globalAlpha=1;
   }
   const shore=fade(t,1.3,1.8,2.3,2.8);
   if(shore>0){
    ctx.globalAlpha=shore;ctx.fillStyle='#0a1114';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#2a2620';ctx.beginPath();ctx.moveTo(0,0);for(let x=0;x<=W;x+=12)ctx.lineTo(x,coast(x));ctx.lineTo(W,0);ctx.fill();
    ctx.strokeStyle='rgba(220,230,220,.35)';ctx.lineWidth=2;ctx.beginPath();for(let x=0;x<=W;x+=12)x?ctx.lineTo(x,coast(x)):ctx.moveTo(x,coast(x));ctx.stroke();
    ctx.globalAlpha=1;
   }
   const sea=ease(span(t,2.3,2.8));
   if(sea>0)nightSea(t,sea);
   // the one copper line, morphing its path
   const wT=board,wC=shore,wS=sea;
   ctx.strokeStyle=C.glow;ctx.lineWidth=lerp(5,3,span(t,0,2.5));ctx.globalCompositeOperation='lighter';ctx.globalAlpha=1-wS;
   ctx.beginPath();
   for(let x=0;x<=W;x+=8){
    const trace=H/2+(x>W*.55?Math.min(200,(x-W*.55)*.9):0)*up;
    const route=coast(x)+90;
    const y=lerp(lerp(H/2,trace,wT),route,wC);
    x?ctx.lineTo(x,y):ctx.moveTo(x,y);
   }
   ctx.stroke();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
   if(sea>0){
    const k=ease(span(t,2.5,4));
    ship(lerp(W*1.25,SHIP.x,ease(span(t,2.3,3.1))),SHIP.y,lerp(600,SHIP.L,k),lerp(-.14,0,k),t,sea);
   }
   vignette(.5);
  }};
 },

 // The ship becomes one light among many; lanes fill; the night Earth appears.
 G07(){
  const r=rng(77),ships=[...Array(160)].map(()=>({x:(r()-.5)*9000,y:(r()-.5)*5200,a:(r()-.5)*.8,p:r()}));
  const list=arcs(1600,7,[DATA.rivers,DATA.landfills,DATA.mines]);
  return {draw(t){
   const z=Math.exp(-span(t,0,1.4)*4.1),L=900*z;
   nightSea(t,1);
   ctx.save();ctx.translate(W*.62,H*.5);ctx.scale(z,z);ctx.globalCompositeOperation='lighter';
   const lanes=ease(span(t,.5,1.2));
   ctx.strokeStyle=`rgba(184,82,38,${.35*lanes})`;ctx.lineWidth=2/z;
   for(let k=0;k<12;k++){ctx.beginPath();ctx.moveTo(-6000,(k-6)*700);ctx.bezierCurveTo(-2000,(k-6)*500+900,2000,(k-6)*800-900,6000,(k-6)*600);ctx.stroke()}
   for(const s of ships){
    ctx.globalAlpha=ease(span(t,.4+s.p*.5,.8+s.p*.5));ctx.fillStyle='#ffdcaa';
    ctx.beginPath();ctx.arc(s.x+t*60*Math.cos(s.a),s.y+t*60*Math.sin(s.a),4/z,0,Math.PI*2);ctx.fill();
   }
   ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
   ship(W*.62,H*.5,L,0,t,1);
   if(L<30){ctx.globalCompositeOperation='lighter';flare(W*.62,H*.5,14,1-span(t,1.4,1.8));ctx.globalCompositeOperation='source-over'}
   const g=ease(span(t,1.15,1.7));
   if(g>0){
    ctx.globalAlpha=g;ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;
    const s=Math.exp(lerp(Math.log(9000),Math.log(470),ease(span(t,1.15,2.5))));
    const p=ortho(W/2,H/2+20,s,lerp(-100,-40,span(t,1.15,2.5)),lerp(-10,12,span(t,1.15,2.5)));
    globe(p,{night:true,alpha:g});
    lights(p,DATA.rivers,'#ffd49a',1.4,.55*g,.3,t);
    lights(p,DATA.landfills,'#ffd49a',1.2,.45*g,.3,t);
    lights(p,DATA.mines,C.glow,1.6,.6*g);
    flows(p,list,t,g);
   }
   vignette(.5);
  }};
 },

 // Containers → motor winding → board traces → phone → the city grid at dusk.
 G08(){
  const cols=[[138,59,36],[47,74,106],[107,111,110],[61,90,69],[120,96,52]];
  const r=rng(88),traces=[...Array(40)].map(()=>{let x=W*.25+r()*W*.5,y=H*.25+r()*H*.5;const p=[[x,y]];for(let k=0;k<4;k++){if(k%2)x+=(r()-.5)*420;else y+=(r()-.5)*260;p.push([x,y])}return p});
  const containers=(scale,alpha,morph)=>{
   const cw=140*scale,ch=56*scale,gx=8*scale,gy=10*scale;
   for(let i=-9;i<9;i++)for(let j=-12;j<12;j++){
    const lane=Math.floor(j/4);const x=W/2+i*(cw+gx),y=H/2+j*(ch+gy)+lane*24*scale;
    if(i===0&&j===0&&morph===0)continue;
    const c=cols[Math.floor(hash(i,j,4)*cols.length)];
    ctx.fillStyle=rgb(...mix(c,[26,26,34],morph),alpha);ctx.fillRect(x,y,cw,ch);
    ctx.strokeStyle=`rgba(0,0,0,${.25*alpha*(1-morph)})`;ctx.lineWidth=1;
    if(scale>.6)for(let k=1;k<14;k++){ctx.beginPath();ctx.moveTo(x+k*cw/14,y);ctx.lineTo(x+k*cw/14,y+ch);ctx.stroke()}
   }
  };
  const glintAt=(x,y,a)=>flare(x,y,22,a);
  return {draw(t){
   ctx.fillStyle='#0c0e10';ctx.fillRect(0,0,W,H);
   if(t<1.15){
    const s=lerp(1,1.15,span(t,0,1.1));containers(s,1,0);
    const drop=ease(span(t,.1,.9)),cs=s*lerp(1.35,1,drop);
    ctx.fillStyle='rgba(0,0,0,.4)';ctx.fillRect(W/2+20*(1-drop),H/2+26*(1-drop),140*cs,56*cs);
    ctx.fillStyle=rgb(...cols[0]);ctx.fillRect(W/2-(1-drop)*80,H/2-(1-drop)*40,140*cs,56*cs);
    ctx.fillStyle='#1e2226';ctx.fillRect(0,H/2-(1-drop)*40-30,W,18);ctx.fillRect(0,H/2-(1-drop)*40+56*cs+12,W,18);
    ctx.strokeStyle='#e0a040';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(W/2+70*cs-(1-drop)*80,H/2-(1-drop)*40-20);ctx.lineTo(W/2+70*cs-(1-drop)*80,H/2-(1-drop)*40);ctx.stroke();
    ctx.fillStyle=`rgba(0,0,0,${span(t,.95,1.15)})`;ctx.fillRect(0,0,W,H);
   }
   if(t>1&&t<1.75){
    const a=fade(t,1,1.12,1.6,1.75),w=span(t,1.05,1.6);
    ctx.globalAlpha=a;ctx.fillStyle='#16181a';ctx.beginPath();ctx.arc(W/2,H/2,380,0,Math.PI*2);ctx.arc(W/2,H/2,190,0,Math.PI*2,true);ctx.fill();
    for(let k=0;k<12;k++){
     const ang=k/12*Math.PI*2;ctx.save();ctx.translate(W/2+Math.cos(ang)*250,H/2+Math.sin(ang)*250);ctx.rotate(ang);
     ctx.fillStyle='#2a2d30';ctx.fillRect(-60,-26,120,52);
     const turns=Math.floor(w*14);ctx.strokeStyle='#c8733c';ctx.lineWidth=4;
     for(let m=0;m<turns;m++){ctx.beginPath();ctx.ellipse(-50+m*7.5,0,4,32,0,0,Math.PI*2);ctx.stroke()}
     ctx.restore();
    }
    glintAt(W/2+Math.cos(w*6)*250,H/2+Math.sin(w*6)*250,a);ctx.globalAlpha=1;
   }
   if(t>1.6&&t<2.35){
    const a=fade(t,1.6,1.72,2.2,2.35),e=span(t,1.65,2.2);
    ctx.globalAlpha=a;ctx.fillStyle='#0f2a1c';ctx.fillRect(W*.2,H*.18,W*.6,H*.64);
    ctx.strokeStyle='#d0864c';ctx.lineWidth=5;ctx.lineCap='round';
    let head=[W/2,H/2];
    for(const p of traces){
     const n=Math.max(1,Math.ceil(e*(p.length-1)));ctx.beginPath();ctx.moveTo(...p[0]);
     for(let k=1;k<=n;k++){const [x0,y0]=p[k-1],[x1,y1]=p[k],f=k<n?1:e*(p.length-1)-(n-1);ctx.lineTo(lerp(x0,x1,clamp(f)),lerp(y0,y1,clamp(f)));if(p===traces[0])head=[lerp(x0,x1,clamp(f)),lerp(y0,y1,clamp(f))]}
     ctx.stroke();
    }
    ctx.fillStyle='#1b1d1f';for(let k=0;k<6;k++)ctx.fillRect(W*(.3+hash(k,1)*.35),H*(.3+hash(k,2)*.35),110,80);
    glintAt(...head,a);ctx.globalAlpha=1;
   }
   if(t>2.2&&t<2.75){
    const a=fade(t,2.2,2.32,2.62,2.75);ctx.globalAlpha=a;
    ctx.fillStyle='#101214';ctx.beginPath();ctx.roundRect(W/2-170,H/2-340,340,680,48);ctx.fill();
    ctx.strokeStyle='rgba(220,210,190,.4)';ctx.lineWidth=3;ctx.stroke();
    ctx.save();ctx.beginPath();ctx.roundRect(W/2-150,H/2-320,300,640,36);ctx.clip();
    ctx.strokeStyle='rgba(208,134,76,.55)';ctx.lineWidth=3;
    for(const p of traces.slice(0,16)){ctx.beginPath();p.forEach(([x,y],k)=>{const px=W/2+(x-W/2)*.35,py=H/2+(y-H/2)*.9;k?ctx.lineTo(px,py):ctx.moveTo(px,py)});ctx.stroke()}
    ctx.restore();glintAt(W/2+40,H/2-80,a);ctx.globalAlpha=1;
   }
   if(t>2.6){
    const k=ease(span(t,2.6,3.5)),m=ease(span(t,2.75,3.4));
    ctx.globalAlpha=ease(span(t,2.6,2.75));
    if(m<1)containers(lerp(1.3,.62,k),1-m,m);
    ctx.globalAlpha=1;
    if(m>0)city(lerp(1.3,.62,k)*.8,t,m);
   }
   vignette(.5);
  }};
 },

 // Human scale: a hand, a phone, a room; the hidden materials glow; then the city.
 G09(){
  const room=layer(),rc=room.getContext('2d');
  const r=rng(99),veins=[...Array(14)].map(()=>{let x=r()*W,y=r()*H*.2;const p=[[x,y]];for(let k=0;k<8;k++){x+=(r()-.5)*260;y+=60+r()*120;p.push([x,y])}return p});
  const drawRoom=t=>{
   const c=rc;c.fillStyle='#121517';c.fillRect(0,0,W,H);
   // window onto the dusk city
   c.save();c.beginPath();c.rect(300,170,640,600);c.clip();
   const sky=c.createLinearGradient(0,170,0,770);sky.addColorStop(0,'#1b1a33');sky.addColorStop(1,'#4a2c24');c.fillStyle=sky;c.fillRect(300,170,640,600);
   for(let k=0;k<180;k++){c.fillStyle=hash(k,1)>.8?'rgba(200,215,240,.8)':'rgba(255,196,120,.8)';c.beginPath();c.arc(300+hash(k,2)*640,420+hash(k,3)*350,2+hash(k,4)*5,0,Math.PI*2);c.fill()}
   c.restore();c.strokeStyle='#070808';c.lineWidth=18;c.strokeRect(300,170,640,600);c.beginPath();c.moveTo(620,170);c.lineTo(620,770);c.stroke();
   // curtain
   c.fillStyle='#23201f';c.fillRect(960,120,140,760);
   // lamp switches on
   const on=span(t,2,2.15);
   if(on>0){const g=c.createRadialGradient(W*.62,0,10,W*.62,0,1300);g.addColorStop(0,`rgba(255,200,130,${.35*on})`);g.addColorStop(1,'rgba(255,200,130,0)');c.fillStyle=g;c.fillRect(0,0,W,H)}
   // x-ray: copper in the walls, steel behind, fibres in the curtain
   const x=fade(t,2.8,3.5,4.4,5);
   if(x>0){
    c.globalCompositeOperation='lighter';
    c.strokeStyle=`rgba(150,160,170,${.18*x})`;c.lineWidth=10;for(let k=0;k<8;k++){c.beginPath();c.moveTo(k*280,0);c.lineTo(k*280,H);c.stroke()}
    c.beginPath();c.moveTo(0,110);c.lineTo(W,110);c.moveTo(0,930);c.lineTo(W,930);c.stroke();
    c.strokeStyle=`rgba(210,110,50,${.55*x})`;c.lineWidth=3;c.shadowColor='rgba(232,164,104,.9)';c.shadowBlur=14;
    for(const p of veins){c.beginPath();p.forEach(([a,b],k)=>k?c.lineTo(a,b):c.moveTo(a,b));c.stroke()}
    c.shadowBlur=0;c.strokeStyle=`rgba(236,220,200,${.25*x})`;c.lineWidth=1;
    for(let k=0;k<40;k++){c.beginPath();for(let y=120;y<880;y+=20)c.lineTo(965+k*3.3+Math.sin(y/40+k)*3,y);c.stroke()}
    c.globalCompositeOperation='source-over';
   }
   // hand and phone
   c.save();c.translate(1330,700);c.rotate(-.18);
   const screen=c.createLinearGradient(0,-300,0,300);screen.addColorStop(0,'#3d5560');screen.addColorStop(1,'#16242a');
   c.fillStyle='#0b0c0d';c.beginPath();c.roundRect(-150,-310,300,620,42);c.fill();
   c.fillStyle=screen;c.beginPath();c.roundRect(-136,-296,272,592,32);c.fill();
   if(x>0){c.globalCompositeOperation='lighter';c.strokeStyle=`rgba(232,150,90,${.7*x})`;c.lineWidth=2;for(let k=0;k<22;k++){c.beginPath();c.moveTo(-110+hash(k,1)*220,-260+hash(k,2)*520);c.lineTo(-110+hash(k,3)*220,-260+hash(k,2)*520);c.lineTo(-110+hash(k,3)*220,-260+hash(k,4)*520);c.stroke()}c.globalCompositeOperation='source-over'}
   const skin=on>0?'#5a4034':'#2a201c';c.fillStyle=skin;
   c.beginPath();c.ellipse(20,330,230,200,0,0,Math.PI*2);c.fill();
   c.beginPath();c.roundRect(-205,80,70,260,34);c.fill();
   for(let k=0;k<4;k++){c.beginPath();c.roundRect(128,-60+k*95,70,82,34);c.fill()}
   c.strokeStyle=`rgba(255,200,140,${.4*on})`;c.lineWidth=3;c.beginPath();c.ellipse(20,330,230,200,0,Math.PI*1.05,Math.PI*1.6);c.stroke();
   c.restore();
   const dim=1-.45*(1-on);c.fillStyle=`rgba(0,0,0,${1-dim})`;c.fillRect(0,0,W,H);
  };
  // The facade and the city it belongs to, in window units.
  const WX=W*1.45,WY=H*1.5;
  const buildings=[...Array(15)].map((_,k)=>({x0:(k-7)*11-3,cols:6+Math.floor(hash(k,1)*4),rows:9+Math.floor(hash(k,2)*9)}));
  return {draw(t){
   if(t<1.4){
    city(lerp(.62,4,ease(span(t,0,1.4)))*.8,t,1,W/2+lerp(0,-300,span(t,0,1.4)),H/2);
    drawRoom(t);ctx.globalAlpha=ease(span(t,.9,1.4));ctx.drawImage(room,0,0);ctx.globalAlpha=1;
    vignette(.5);return;
   }
   drawRoom(t);
   const z=Math.exp(-ease(span(t,4.6,7))*4.4);
   ctx.fillStyle='#0b0c12';ctx.fillRect(0,0,W,H);
   const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#151633');sky.addColorStop(1,'#3a2420');
   ctx.globalAlpha=1-z;ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;
   const cx=W/2,cy=H/2+lerp(0,H*.25,1-z);
   for(const b of buildings){
    for(let i=0;i<b.cols;i++)for(let j=0;j<b.rows;j++){
     const wx=(b.x0+i)*WX*z,wy=(-j+3)*WY*z,x=cx+wx-W*z/2,y=cy+wy-H*z/2;
     if(x>W||y>H||x+W*z<0||y+H*z<0)continue;
     if(b.x0+i===0&&j===3){ctx.drawImage(room,x,y,W*z,H*z);continue}
     const on=hash(b.x0+i,j,7);
     ctx.fillStyle=on<.35?'#0e1014':on>.85?'rgba(190,210,240,.85)':'rgba(255,190,110,.85)';
     if(hash(b.x0+i,j,Math.floor(t*1.5+on*9))>.985)ctx.fillStyle='#0e1014';
     ctx.fillRect(x,y,W*z,H*z);
    }
   }
   if(z<.15){
    const k=span(z,.15,.02),by=cy+4*WY*z;
    ctx.fillStyle=`rgba(10,10,12,${k})`;ctx.fillRect(0,by,W,H-by);
    for(let m=0;m<120;m++){const x=((hash(m,1)+t*(.05+hash(m,2)*.1)*(m%2?1:-1))%1+1)%1*W;ctx.fillStyle=m%2?`rgba(255,240,220,${k})`:`rgba(255,70,50,${k})`;ctx.fillRect(x,by+8+(m%4)*6,4,2)}
   }
   vignette(.5);
  }};
 },

 // Discard: bin, truck, sorting line; the stream splits; only one strand returns.
 G10(){
  const r=rng(10),scrap=[...Array(260)].map(()=>({p:r(),k:r()<.3?'steel':r()<.55?'copper':'plastic',y:r(),s:5+r()*9}));
  const tint={steel:'#8d9296',copper:'#c8733c',plastic:'#5a6a86'};
  const heap=[...Array(420)].map(()=>{const a=r(),x=(r()-.5)*2;return {x,y:Math.pow(r(),1.5)*(1-Math.abs(x))*.9,w:20+r()*60,h:8+r()*30,c:['#2b2e30','#1f3a2a','#3a3a3a','#4d4f52','#16181a'][Math.floor(a*5)],rot:(r()-.5)*1.2}});
  const landfillRing=(i,N,R,cx,cy)=>{ctx.beginPath();for(let a=0;a<=Math.PI*2+.01;a+=.08){const rr=R*(1-i/N*.85)*(1+.18*(noise(Math.cos(a)*1.6+3,Math.sin(a)*1.6+3,50)-.5));const x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr*.8;a?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath()};
  return {draw(t){
   ctx.fillStyle='#0b0c0d';ctx.fillRect(0,0,W,H);
   if(t<.95){
    const a=1-span(t,.8,.95),f=ease(span(t,.05,.7));
    ctx.globalAlpha=a;
    ctx.fillStyle='#1a1c1e';ctx.beginPath();ctx.moveTo(W/2-260,H*.55);ctx.lineTo(W/2+260,H*.55);ctx.lineTo(W/2+220,H+40);ctx.lineTo(W/2-220,H+40);ctx.fill();
    ctx.fillStyle='#050505';ctx.beginPath();ctx.ellipse(W/2,H*.55,260,50,0,0,Math.PI*2);ctx.fill();
    ctx.save();ctx.beginPath();ctx.rect(0,0,W,H*.55+Math.max(0,50*(1-f)));ctx.clip();
    ctx.translate(W/2+lerp(-120,0,f),lerp(H*.1,H*.62,f));ctx.rotate(lerp(-.5,.9,f));
    ctx.fillStyle='#101214';ctx.beginPath();ctx.roundRect(-70,-140,140,280,22);ctx.fill();ctx.strokeStyle='rgba(220,210,190,.5)';ctx.lineWidth=3;ctx.stroke();
    ctx.restore();ctx.globalAlpha=1;
   }
   if(t>.8&&t<1.45){
    const a=fade(t,.8,.95,1.3,1.45),x=lerp(-500,W+200,span(t,.8,1.45));
    ctx.globalAlpha=a;ctx.fillStyle='#16181b';ctx.fillRect(0,H*.7,W,H*.3);
    ctx.fillStyle='#2f3538';ctx.fillRect(x,H*.42,520,260);ctx.fillStyle='#24292c';ctx.fillRect(x+520,H*.5,170,180);
    ctx.fillStyle='#0a0a0a';for(const wx of [x+80,x+400,x+600]){ctx.beginPath();ctx.arc(wx,H*.42+270,48,0,Math.PI*2);ctx.fill()}
    ctx.fillStyle='rgba(255,60,40,.9)';ctx.fillRect(x-6,H*.62,10,24);ctx.globalAlpha=1;
   }
   if(t>1.3&&t<2.75){
    const a=fade(t,1.3,1.45,2.6,2.75),by=H*.62;ctx.globalAlpha=a;
    ctx.fillStyle='#17191b';ctx.fillRect(0,by,W*.72,40);
    ctx.strokeStyle='rgba(255,255,255,.08)';for(let x=(t*300)%80;x<W*.72;x+=80){ctx.beginPath();ctx.moveTo(x,by);ctx.lineTo(x,by+40);ctx.stroke()}
    const drum={x:W*.4,y:by-90,r:80};ctx.fillStyle='#2b3034';ctx.beginPath();ctx.arc(drum.x,drum.y,drum.r,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#202428';ctx.fillRect(W*.72,by-10,90,60);
    for(const s of scrap){
     let x=((s.p+t*.35)%1)*W*.9-W*.1,y=by-s.s;
     if(s.k==='steel'&&x>drum.x-drum.r*.3){const q=clamp((x-drum.x+drum.r*.3)/(drum.r*2));const ang=Math.PI*(1-q)+Math.PI*.5;x=drum.x+Math.cos(ang)*drum.r;y=drum.y-Math.sin(ang-Math.PI*.5)*drum.r*.2-drum.r*q}
     else if(x>W*.72){const d=(x-W*.72)/W;x=W*.72+d*W*(s.k==='copper'?2.4:.4);y=by+d*d*(s.k==='copper'?2600:6000)-d*(s.k==='copper'?700:0)}
     ctx.fillStyle=tint[s.k];ctx.fillRect(x,y,s.s,s.s*.7);
    }
    ctx.globalAlpha=1;
   }
   // the stream splits: six fates, one ends in a furnace
   if(t>2.55&&t<3.05){
    const a=fade(t,2.55,2.65,2.95,3.05),g=ease(span(t,2.55,2.95));ctx.globalAlpha=a;
    ctx.strokeStyle='rgba(200,190,170,.7)';ctx.lineWidth=5;ctx.lineCap='round';
    for(let k=0;k<6;k++){const ey=H*(.12+k*.15);ctx.strokeStyle=k===5?C.glow:'rgba(180,176,166,.7)';ctx.beginPath();ctx.moveTo(-20,H/2);ctx.bezierCurveTo(W*.35,H/2,W*.45,lerp(H/2,ey,g),lerp(W*.3,W+40,g),lerp(H/2,ey,g));ctx.stroke()}
    ctx.globalAlpha=1;
   }
   const beat=(a,b)=>fade(t,a,a+.08,b-.08,b);
   let v=beat(2.95,3.55);
   if(v>0){ // landfill cell being covered
    ctx.globalAlpha=v;ctx.fillStyle='#1c1a16';ctx.fillRect(0,0,W,H);
    for(let i=0;i<10;i++){landfillRing(i,10,760,W/2,H/2);ctx.fillStyle=rgb(...mix([96,84,66],[62,58,52],i/10));ctx.fill();ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=3;ctx.stroke()}
    const cover=span(t,3,3.5);ctx.fillStyle='#4a3c2c';ctx.save();landfillRing(6,10,760,W/2,H/2);ctx.clip();ctx.fillRect(W/2-400,0,800*cover,H);ctx.restore();
    ctx.globalAlpha=1;
   }
   v=beat(3.45,4.05);
   if(v>0){ // informal recovery: small fires and smoke
    ctx.globalAlpha=v;ctx.fillStyle='#121110';ctx.fillRect(0,0,W,H);
    for(let k=0;k<7;k++){
     const fx=W*(.12+k*.13),fy=H*(.62+hash(k,1)*.25);
     const g=ctx.createRadialGradient(fx,fy,2,fx,fy,70);g.addColorStop(0,'rgba(255,200,110,1)');g.addColorStop(1,'rgba(255,90,30,0)');ctx.fillStyle=g;ctx.fillRect(fx-70,fy-70,140,140);
     for(let m=0;m<26;m++){const age=(hash(k,m,2)+t*.6)%1;ctx.fillStyle=`rgba(90,88,84,${.35*(1-age)})`;ctx.beginPath();ctx.arc(fx+Math.sin(m+t)*30*age+age*120,fy-age*520,18+age*90,0,Math.PI*2);ctx.fill()}
    }
    ctx.globalAlpha=1;
   }
   v=beat(3.95,4.55);
   if(v>0){ // a mountain of discarded electronics
    ctx.globalAlpha=v;ctx.fillStyle='#0d0e10';ctx.fillRect(0,0,W,H);
    const s=lerp(1,1.12,span(t,3.95,4.55));
    for(const h of heap){ctx.save();ctx.translate(W/2+h.x*W*.55*s,H*.95-h.y*H*.85*s);ctx.rotate(h.rot);ctx.fillStyle=h.c;ctx.fillRect(-h.w/2*s,-h.h/2*s,h.w*s,h.h*s);ctx.restore()}
    ctx.globalAlpha=1;
   }
   v=beat(4.45,5.05);
   if(v>0){ // industrial recycler shredding boards
    ctx.globalAlpha=v;ctx.fillStyle='#0e0f10';ctx.fillRect(0,0,W,H);
    for(const [x,dir] of [[W/2-150,1],[W/2+150,-1]]){
     ctx.save();ctx.translate(x,H/2);ctx.rotate(dir*t*6);ctx.fillStyle='#3a3e42';ctx.beginPath();
     for(let k=0;k<32;k++){const a=k/32*Math.PI*2,rr=k%2?150:175;ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}ctx.fill();ctx.restore();
    }
    for(let k=0;k<24;k++){const age=(hash(k,1)+t*1.4)%1;ctx.fillStyle=age<.45?'#1f4a30':'#2d5a3c';const s=age<.45?70:14;ctx.fillRect(W/2-s/2+(hash(k,2)-.5)*(age<.45?200:260),lerp(-80,H+40,age),s,age<.45?50:10)}
    ctx.globalAlpha=1;
   }
   if(t>4.95)moltenPour(t,{alpha:ease(span(t,4.95,5.15)),fill:span(t,5.1,6),mould:'ingot',to:[W*.62,H*.72]});
   vignette(.55);
  }};
 },

 // Away is a place: landfill contours become a topographic Earth of destinations.
 G11(){
  const ring=(i,N,R,cx,cy,s)=>{ctx.beginPath();for(let a=0;a<=Math.PI*2+.01;a+=.05){const rr=R*(1-i/N*.9)*(1+.22*(noise(Math.cos(a)*1.6+s,Math.sin(a)*1.6+s,50)-.5));const x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr*.8;a?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath()};
  return {draw(t){
   ctx.fillStyle='#0b0d0c';ctx.fillRect(0,0,W,H);
   const z=Math.exp(-span(t,.3,1.6)*2.2),lines=ease(span(t,.35,.9)),g=ease(span(t,1.2,1.8));
   if(g<1){
    ctx.save();ctx.globalAlpha=1-g;ctx.translate(W/2,H/2);ctx.scale(z,z);ctx.translate(-W/2,-H/2);
    const fams=[[W/2,H/2,820,3],[W/2-1500,H/2-700,700,9],[W/2+1600,H/2+500,760,14],[W/2+300,H/2-1500,600,21],[W/2-1300,H/2+1100,650,27]];
    fams.forEach(([cx,cy,R,s],f)=>{
     const N=14;
     for(let i=0;i<N;i++){
      ring(i,N,R,cx,cy,s);
      if(f===0){ctx.fillStyle=rgb(...mix([104,90,70],[60,56,50],i/N),1-lines);ctx.fill()}
      ctx.strokeStyle=`rgba(236,230,214,${(f===0?lines:ease(span(t,.7,1.2)))*.6})`;ctx.lineWidth=1.6/z;ctx.stroke();
     }
    });
    ctx.restore();
   }
   if(g>0){
    const p=ortho(W/2,H/2+20,lerp(1400,470,ease(span(t,1.2,2.5))),-40,20);
    globe(p,{night:true,lines:true,alpha:g});
    lights(p,DATA.landfills,'#e8a468',2,.8*g,.5,t);
    lights(p,DATA.rivers,'#f0d8b0',1.6,.7*g,.5,t);
   }
   vignette(.55);
  }};
 },

 // The map becomes the planet. Opens exactly on the P15 still; the interface
 // recedes while its globe rises out of it into a breathing Earth.
 async G12(){
  const still=await image(STILLS.P15),list=arcs(2200,12);
  const from={x:1308,y:398,r:210},to={x:W/2,y:H/2+40,r:470};
  return {draw(t){
   ctx.fillStyle=C.bg;ctx.fillRect(0,0,W,H);
   const back=ease(t/4.5),k=1-.5*back;
   const sw=W*k,sh=H*k,sx=(W-sw)/2,sy=(H-sh)/2;
   ctx.globalAlpha=1-ease((t-1.2)/3);ctx.drawImage(still,sx,sy,sw,sh);ctx.globalAlpha=1;
   const rise=ease((t-.4)/4.6);
   const start={x:sx+from.x*k,y:sy+from.y*k,r:from.r*k};
   const proj=d3.geoOrthographic().clipAngle(90)
    .translate([lerp(start.x,to.x,rise),lerp(start.y,to.y,rise)])
    .scale(lerp(start.r,to.r,rise)).rotate([60-6*t,-12+4*rise]);
   const show=ease(t/.8);
   globe(proj,{alpha:show});
   const breath=.8+.2*Math.sin(Math.PI*2*t/3.5);
   lights(proj,DATA.mines,C.glow,1.6,.55*show);
   lights(proj,DATA.rivers,'#c9d8b8',1.2,.25*show);
   flows(proj,list,t,breath*ease((t-.8)/2.5));
  }};
 },
};

let scene;
window.setup=async id=>{if(!scenes[id])throw new Error(`No scene ${id}`);scene=await scenes[id]()};
window.draw=t=>scene.draw(t);
window.ready=Promise.resolve();
