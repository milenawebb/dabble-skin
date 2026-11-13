import { afterEach, describe, expect, it, vi } from 'vitest';
import { muxThumbnail, sampleThumbnails, thumbnailTimes } from './video-palette';

describe('Mux palette sampling', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('uses 15%, 35%, 55% and 75% once duration is known', () => {
    expect(thumbnailTimes(40)).toEqual([6, 14, 22, 30]);
    expect(thumbnailTimes(Infinity)).toEqual([]);
  });
  it('requests the exact asset at the four supplied scene times and dimensions', () => {
    const id = 'AAprZsIykh7T29gtsNk02YhBrQRHXTj14ZxbWdc498wA';
    expect([9,14,19,23].map(time => muxThumbnail(id,time))).toEqual([9,14,19,23].map(time => `https://image.mux.com/${id}/thumbnail.jpg?time=${time}&width=64&height=36&fit_mode=crop`));
  });
  it('silently returns no replacement palette when every thumbnail fails', async () => {
    vi.stubGlobal('Image', class {
      onerror: (() => void) | null = null;
      set src(_value: string) { queueMicrotask(() => this.onerror?.()); }
    });
    expect(await sampleThumbnails('test', [9,14,19,23])).toBeNull();
  });
  it('uses successful scenes when another thumbnail is blocked', async () => {
    vi.stubGlobal('Image', class {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(value: string) { queueMicrotask(() => value.includes('time=14&') ? this.onerror?.() : this.onload?.()); }
    });
    const pixels = new Uint8ClampedArray(64 * 36 * 4);
    for (let i=0;i<pixels.length;i+=4) { pixels[i]=30; pixels[i+1]=120; pixels[i+2]=200; pixels[i+3]=255; }
    const read = vi.fn().mockReturnValue({data:pixels});
    const spy = vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockReturnValue({drawImage:vi.fn(),getImageData:read} as unknown as CanvasRenderingContext2D);
    expect(await sampleThumbnails('test',[9,14,19,23])).toHaveLength(6);
    expect(read).toHaveBeenCalledTimes(3);
    spy.mockRestore();
  });
});