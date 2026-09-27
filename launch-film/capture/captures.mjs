// Screen captures for the OVERSHOOT launch film.
//
// Each capture is a scripted, repeatable camera move through the real atlas.
// IDs match the plates named in ../SHOT-LIST.md. Every URL is an ordinary
// shared link, so an editor can reopen the exact view by hand.
//
// Step types:
//   {wait: ms}                         hold on the frame
//   {still: 'name'}                    save a 4K PNG keyframe (stills mode)
//   {scrollTo: 'text'}                 smooth-scroll until the text is centred
//   {scroll: px, ms}                   smooth-scroll by px over ms
//   {click: {role, name}}              click an accessible control
//   {click: {role, hasText}}           click the first control of that role containing the text
//   {clickText: 'text'}                click the first visible element with this text
//   {type: {selector, text, delay}}    type as a person would
//   {press: 'Key'}                     keyboard press
//   {drag: {selector, dx, dy, ms}}     drag across an element (globe rotation)
//   {hover: 'text'}                    move the pointer over text
//
// First and last frames are always saved, so every plate has a matching
// first/last frame for the generated shots on either side of it.

export const captures=[
 {id:'P01-hero',title:'Homepage hero and globe',url:'/',steps:[
  {wait:2500},{still:'hero'},
  {click:{role:'tab',name:'Plastic scrap'}},{wait:2500},
  {click:{role:'tab',name:'Copper'}},{wait:3500},
  {drag:{selector:'.oa-home-map-panel svg[role=img]',dx:-420,dy:0,ms:5000}},{wait:2500},
 ]},
 {id:'P02-globe-copper',title:'Reported copper trade on the home globe',url:'/',steps:[
  {click:{role:'tab',name:'Copper'}},{wait:4000},
  {scrollTo:'Largest available reported connection'},{wait:5000},
 ]},
 {id:'P03-select-copper',title:'Choose Copper from the material guides',url:'/materials',steps:[
  {wait:2000},{hover:'Copper wire'},{wait:800},{clickText:'Copper wire'},{wait:4000},
  {scroll:500,ms:3000},{wait:2500},
 ]},
 {id:'P04-escondida',title:'Escondida to the coast: sourced copper connections',url:'/materials?material=copper&layer=connections&network=escondida-ports&place=CHL',steps:[
  {wait:2000},{scrollTo:'Copper leaves Escondida in two forms'},{wait:1500},
  {scrollTo:'Select a step or map marker to inspect the source.',ms:3500},{scroll:420,ms:2500},{wait:5000},
 ]},
 {id:'P05-journey',title:'Copper journey: mine, smelt, refine, make, recover',url:'/materials?material=copper&layer=journey',steps:[
  {wait:2000},{scroll:520,ms:3000},{wait:3000},
  {scrollTo:'Select a point to inspect',ms:5000},{wait:4000},
 ]},
 {id:'P06-extraction-sites',title:'Mines and extraction facilities worldwide',url:'/facilities?kind=mining',steps:[
  {wait:3000},{scroll:380,ms:3000},{wait:5000},
 ]},
 {id:'P07-trade-world',title:'Refined copper trade connections worldwide',url:'/trade?material=copper&form=7403',steps:[
  {wait:3000},{scrollTo:'Map and list'},{scroll:380,ms:2500},{wait:6000},
 ]},
 {id:'P08-trade-concentrate',title:'Copper ore and concentrate trade from Chile',url:'/trade?material=copper&form=2603&place=CHL',steps:[
  {wait:3000},{scrollTo:'Map and list'},{scroll:380,ms:2500},{wait:6000},
 ]},
 {id:'P09-ports',title:'Ports and shipping layer',url:'/materials?material=copper&place=CHL&ports=1&shipping=1',steps:[
  {wait:3000},{scroll:600,ms:4000},{wait:5000},
 ]},
 {id:'P10-local-search',title:'Local search: type a city and arrive',url:'/local',steps:[
  {wait:2000},{type:{selector:'#lc-city-input',text:'Vancouver',delay:140}},{wait:1500},
  {click:{role:'option',hasText:'British Columbia'}},{wait:5000},{scroll:500,ms:3500},{wait:4000},
 ]},
 {id:'P11-waste',title:'Waste: where discarded material is counted',url:'/waste',steps:[
  {wait:3000},{scroll:500,ms:3500},{wait:5000},
 ]},
 {id:'P12-electronics-waste',title:'Electronics end-of-life flows',url:'/materials?material=electronics&layer=waste',steps:[
  {wait:3000},{scroll:500,ms:3500},{wait:5000},
 ]},
 {id:'P13-provenance',title:'Source record and data provenance',url:'/materials?material=copper&layer=connections&network=escondida-ports&place=CHL',steps:[
  {scrollTo:'Follow a documented connection.'},{wait:1500},
  {click:{role:'button',name:'Sources and coverage'}},{wait:5000},
 ]},
 {id:'P14-mcp',title:'Open data and MCP query console',url:'/data',steps:[
  {wait:2500},{scroll:600,ms:4000},{wait:3000},{scroll:600,ms:4000},{wait:3000},
 ]},
 {id:'P15-return-global',title:'Local back out to the world overview',url:'/local?lat=49.2827&lon=-123.1207&city=Vancouver',steps:[
  {wait:4000},{click:{role:'link',name:'Overshoot home'}},{wait:5000},
 ]},
];
