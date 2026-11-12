import { describe, expect, it } from 'vitest';
import reference from './fixtures/palette-reference.js?raw';
import { paletteFromPixels, tintForInk, contrast } from './palette';
const original = new Function(`${reference};return {paletteFromPixels,tintForInk};`)() as {paletteFromPixels:typeof paletteFromPixels;tintForInk:typeof tintForInk};
describe('reference palette port', () => {
  it('matches the original on colorful and gray pixels', () => {
    for (const data of [new Uint8ClampedArray(64*36*4), Uint8ClampedArray.from({length:64*36*4},(_,i)=>(i*37+i%7*19)%256)]) {
      expect(paletteFromPixels(data)).toEqual(original.paletteFromPixels(data));
      expect(paletteFromPixels(data)).toHaveLength(6);
    }
  });
  it('preserves tint math and gives ink at least 4.5:1 contrast', () => {
    for (const color of ['#0057FF','#076acf','#271ded','#ed6d1d','#1dedb2','#ed1d57','#000000']) {
      expect(tintForInk(color)).toBe(original.tintForInk(color));
      expect(contrast(tintForInk(color),'#1b1b1a')).toBeGreaterThanOrEqual(4.5);
    }
  });
});