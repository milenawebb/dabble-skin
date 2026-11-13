import { describe, it, expect } from 'vitest';
import reference from './fixtures/paint-reference.js?raw';
import { renderStroke, type Brush, type Geo, type Stroke } from './paint-engine';
import { PAINT_PALETTE } from './paint-rules';

const referenceRender = new Function(`${reference}; return renderStroke;`)() as typeof renderStroke;
function trace(draw: typeof renderStroke, stroke: Stroke, geo: Geo) {
  const operations: unknown[] = [];
  const gradient = { addColorStop: (...args: unknown[]) => operations.push(['addColorStop', ...args]) };
  const context = new Proxy({}, {
    set(_target, property, value) { operations.push(['set', property, value === gradient ? 'gradient' : value]); return true; },
    get(_target, property) { return (...args: unknown[]) => { operations.push([property, ...args]); return property === 'createLinearGradient' ? gradient : undefined; }; },
  }) as CanvasRenderingContext2D;
  draw(context, stroke, geo);
  return operations;
}
describe('reference brush parity', () => {
  for (const brush of ['imp', 'cub', 'drip', 'rib'] as Brush[]) {
    for (const automatic of [false, true]) {
      it(`${automatic ? 'automatic' : 'hand'} ${brush} retains every drawing operation and number`, () => {
        const stroke: Stroke = automatic ? {type:`auto-${brush}`, seed:1729, pal:PAINT_PALETTE} : {type:brush, seed:1729, pal:PAINT_PALETTE, color:'#0057FF', size:20/680, pts:[[0.02,0.03],[0.1,0.04],[0.2,0.06],[0.3,0.03]]};
        for (const geo of [{W:848,H:402,vx:42,vy:42,vw:764,vh:318}, {W:346,H:301,vx:30,vy:30,vw:286,vh:119}]) {
          const expected = trace(referenceRender, stroke, geo);
          expect(expected.length).toBeGreaterThan(0);
          expect(trace(renderStroke, stroke, geo)).toEqual(expected);
        }
      });
    }
  }
});