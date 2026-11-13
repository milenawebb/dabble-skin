import { describe, expect, it } from 'vitest';
import reference from './fixtures/palette-reference.js?raw';
import { paletteFromPixels, tintForInk, contrast, colorName, paintColorNames } from './palette';
const original = new Function(`${reference};return {paletteFromPixels,tintForInk};`)() as {paletteFromPixels:typeof paletteFromPixels;tintForInk:typeof tintForInk};
describe('descriptive palette names', () => {
  it.each([['#ffffff', 'White'], ['#000000', 'Black'], ['#888888', 'Gray']])('names low saturation %s as %s', (hex, name) => expect(colorName(hex)).toBe(name));
  it.each([['#ff0000', 'Red'], ['#ff8000', 'Orange'], ['#ffff00', 'Yellow'], ['#80ff00', 'Lime'], ['#00ff00', 'Green'], ['#00ffbf', 'Teal'], ['#00ffff', 'Cyan'], ['#0080ff', 'Blue'], ['#6000ff', 'Indigo'], ['#bf00ff', 'Purple'], ['#ff0080', 'Pink'], ['#ff0040', 'Rose']])('names hue %s as %s', (hex, name) => expect(colorName(hex)).toBe(name));
  it('names dark muted orange brown', () => expect(colorName('#805533')).toBe('Brown'));
  it('adds Light above 75 percent lightness', () => expect(colorName('#cce5ff')).toBe('Light blue'));
  it('adds Dark below 30 percent lightness', () => expect(colorName('#006600')).toBe('Dark green'));
  it('distinguishes duplicate blues by lightness first', () => expect(paintColorNames(['#0080ff', '#80bfff'])).toEqual(['Blue paint', 'Light blue paint']));
  it('numbers remaining duplicates', () => expect(paintColorNames(['#0080ff', '#0080ff', '#0080ff'])).toEqual(['Blue paint', 'Blue paint 2', 'Blue paint 3']));
  it('names the Dab palette distinctly', () => expect(paintColorNames(['#e6af33', '#369ce6', '#185ebf', '#cc4819', '#bf1842', '#bf1874'])).toEqual(['Yellow paint', 'Light blue paint', 'Blue paint', 'Orange paint', 'Rose paint', 'Pink paint']));
});
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