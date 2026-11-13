import { expect, it, vi } from 'vitest';
import { averagePick, movePickPoint, pickPoint, pickThumbnailUrl, readVideoColor } from './video-color-pick';

it('averages every RGB channel without filtering pale or dark colors', () => {
  expect(averagePick(new Uint8ClampedArray([0,0,0,255,255,255,255,255]))).toBe('#808080');
  expect(averagePick(new Uint8ClampedArray([0,0,0,255]))).toBe('#000000');
  expect(averagePick(new Uint8ClampedArray([255,255,255,255]))).toBe('#ffffff');
});
it('moves by 10 CSS pixels per arrow', () => { expect(movePickPoint({x:.5,y:.5}, 'ArrowRight', false, 200,100)).toEqual({x:.55,y:.5}); });
it('moves by 40 CSS pixels with Shift', () => { expect(movePickPoint({x:.5,y:.5}, 'ArrowUp', true, 200,100).y).toBeCloseTo(.1); });
it('clamps the keyboard cursor inside the video', () => { expect(movePickPoint({x:0,y:1}, 'ArrowDown', true, 200,100)).toEqual({x:0,y:1}); });
it('maps the tapped spot excluding contain letterboxing', () => {
  const video = document.createElement('video');
  Object.defineProperties(video, {videoWidth:{value:200},videoHeight:{value:100}});
  video.getBoundingClientRect = () => ({left:10,top:10,width:200,height:200} as DOMRect);
  expect(pickPoint(video,60,85)).toEqual({x:.25,y:.25});
  expect(pickPoint(video,60,20)).toBeNull();
});
it('requests the current-time 640px Mux thumbnail without cropping', () => { expect(pickThumbnailUrl('abc',12.5)).toBe('https://image.mux.com/abc/thumbnail.jpg?time=12.5&width=640'); });
it('falls back to a CORS thumbnail at the identical spot when live reads fail', async () => {
  const video=document.createElement('video'); video.currentTime=7;
  const data=vi.fn().mockReturnValue({data:new Uint8ClampedArray([12,34,56,255])});
  vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockReturnValue({drawImage:vi.fn(),getImageData:data} as unknown as CanvasRenderingContext2D);
  const sources:string[]=[]; const cors:string[]=[];
  vi.stubGlobal('Image',class {crossOrigin='';naturalWidth=640;naturalHeight=360;onload:(()=>void)|null=null;onerror:(()=>void)|null=null;set src(url:string){sources.push(url);cors.push(this.crossOrigin);queueMicrotask(()=>this.onload?.());}});
  expect(await readVideoColor(video,{x:.25,y:.75},'abc')).toEqual({color:'#0c2238',source:'thumbnail'});
  expect(sources).toEqual(['https://image.mux.com/abc/thumbnail.jpg?time=7&width=640']); expect(cors).toEqual(['anonymous']);
  expect(data).toHaveBeenCalledWith(158,267,5,5);
  vi.restoreAllMocks(); vi.unstubAllGlobals();
});