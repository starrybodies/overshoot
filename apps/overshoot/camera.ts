export interface Camera { longitude:number; latitude:number; zoom:number }
export const wrapLongitude=(value:number)=>((value+180)%360+360)%360-180;
export function safeCamera(camera:Camera):Camera {
 return {longitude:wrapLongitude(Number.isFinite(camera.longitude)?camera.longitude:27),latitude:Math.max(-85,Math.min(85,Number.isFinite(camera.latitude)?camera.latitude:18)),zoom:Math.max(-.5,Math.min(4,Number.isFinite(camera.zoom)?camera.zoom:.55))};
}
/** Follow the short path across the antimeridian. No 358° flight for a 2° move. */
export function interpolateCamera(from:Camera,to:Camera,progress:number):Camera {
 const target=safeCamera(to),p=Math.max(0,Math.min(1,progress));
 return safeCamera({longitude:from.longitude+wrapLongitude(target.longitude-from.longitude)*p,latitude:from.latitude+(target.latitude-from.latitude)*p,zoom:from.zoom+(target.zoom-from.zoom)*p});
}
export function cameraEquals(a:Camera,b:Camera){return Math.abs(wrapLongitude(a.longitude-b.longitude))+Math.abs(a.latitude-b.latitude)+Math.abs(a.zoom-b.zoom)<.001}
/** deck.gl's GlobeViewport uses a Mercator-adjusted zoom. Keep our angular size
 * independent of latitude and viewport size, including the perspective limb. */
export function toDeckZoom(camera:Camera,width:number,height:number){
 const radius=Math.min(width,height)*.45*2**(camera.zoom-.55),distance=height*1.5;
 const projected=radius/Math.sqrt(1+(radius/distance)**2);
 return Math.log2(projected/256*Math.PI*Math.cos(Math.max(-85,Math.min(85,camera.latitude))*Math.PI/180));
}
export function fromDeckZoom(camera:Camera,width:number,height:number){
 const distance=height*1.5,projected=256*2**camera.zoom/(Math.PI*Math.cos(Math.max(-85,Math.min(85,camera.latitude))*Math.PI/180));
 const radius=projected/Math.sqrt(Math.max(.00001,1-(projected/distance)**2));
 return .55+Math.log2(radius/(Math.min(width,height)*.45));
}
