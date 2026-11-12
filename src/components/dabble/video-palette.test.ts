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
});