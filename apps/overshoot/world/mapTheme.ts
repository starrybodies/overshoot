/** One source for map colour. JS consumers (maplibre) read `mapTheme`; SVG maps read the `--map-*` CSS variables that `mapCssVars` writes. */
export type MapMode='light'|'dark';
export const mapTheme={
 light:{water:'#e7ede8',land:'#f7f6ed',line:'#a9b9aa',route:'#d7e2cf',text:'#314b37',place:'#bbcfa7',selected:'#97431f',noData:'#e4e2d6',graticule:'#c5d4cb',mining:'#ba6539',site:'#397263',
  ramp:['#eef3d8','#c5db9d','#7fbb87','#3a8f78','#1c5a6e']},
 // Dark reverses direction so the highest values are the lightest, and stay distinct from the land fill.
 dark:{water:'#131e1b',land:'#293a2d',line:'#6b7f6b',route:'#7b997b',text:'#e1edd7',place:'#55754a',selected:'#f3d192',noData:'#1b2a23',graticule:'#3a4f44',mining:'#e08a5a',site:'#6cc4a8',
  ramp:['#1f3d47','#2d6a72','#3f9a86','#8fcf8a','#e6f2a8']}
} as const;
export const mode=(dark:boolean):MapMode=>dark?'dark':'light';
/** `n` evenly spread classes from the five-step ramp. */
export function rampColors(dark:boolean,n=5):string[]{
 const ramp=mapTheme[mode(dark)].ramp;
 return Array.from({length:n},(_,i)=>ramp[n===1?0:Math.round(i*(ramp.length-1)/(n-1))]);
}
/** Class colour for a value against ascending thresholds; null and undefined stay "no observation". */
export function classColor(dark:boolean,value:number|null|undefined,thresholds:number[]):string{
 if(value==null)return mapTheme[mode(dark)].noData;
 return rampColors(dark,thresholds.length+1)[thresholds.filter(t=>value>=t).length];
}
function cssVars(dark:boolean):string{
 const t=mapTheme[mode(dark)],out:string[]=[];
 for(const [key,value] of Object.entries(t))if(typeof value==='string')out.push('--map-'+key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())+':'+value);
 t.ramp.forEach((c,i)=>out.push('--map-ramp-'+i+':'+c));
 return out.join(';');
}
/** Both modes as static CSS, so server-rendered SVG maps resolve `--map-*` before hydration. */
export const mapCss=`:root{${cssVars(false)}}.dark{${cssVars(true)}}`;
/** CSS-variable form of `classColor`, for SVG maps that follow the theme without knowing it. */
export function classVar(value:number|null|undefined,thresholds:number[]):string{
 if(value==null)return 'var(--map-no-data)';
 const n=thresholds.length+1,index=n===1?0:Math.round(thresholds.filter(t=>value>=t).length*4/(n-1));
 return `var(--map-ramp-${index})`;
}
