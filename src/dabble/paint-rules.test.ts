import { describe, it, expect } from 'vitest';
import { backingRatio, DEFAULT_BRUSH, DEFAULT_SIZE, initialPainting, PAINT_PALETTE, paintFrameWidth, pointSpacing, strokeSize, undoPainting } from './paint-rules';
describe('paint rules', () => {
  it('starts with six reproducible strokes using only Ribbon and Drip in three colors', () => { const strokes=initialPainting(); expect(strokes).toHaveLength(6); expect(strokes).toEqual(initialPainting()); expect(strokes.map(s=>s.type)).toEqual(['rib','rib','rib','drip','drip','drip']); expect(new Set(strokes.flatMap(s=>'color' in s ? [s.color]:[])).size).toBe(3); expect(DEFAULT_BRUSH).toBe('rib'); });
  it('uses the requested six paint colors', () => { expect(PAINT_PALETTE).toEqual(['#0057FF','#00B7FF','#00D1B2','#FFB800','#FF5A1F','#FF2E93']); });
  it('normalizes the default 20px brush against 680', () => { expect(DEFAULT_SIZE).toBe(20); expect(strokeSize(20,'mouse',0)).toBe(20/680); });
  it('ignores finger pressure', () => { expect(strokeSize(20,'touch',0.1)).toBe(20/680); });
  it('scales pen pressure from 0.6 to 1.4', () => { expect(strokeSize(20,'pen',0)).toBe(20/680*0.6); expect(strokeSize(20,'pen',1)).toBe(20/680*1.4); });
  it('requires 7px for Ribbon and 5px for other brushes', () => { expect(pointSpacing('rib')).toBe(7); for (const brush of ['imp','cub','drip'] as const) expect(pointSpacing(brush)).toBe(5); });
  it('widens only thin frames while painting', () => { expect(paintFrameWidth(12,true)).toBe(30); expect(paintFrameWidth(20,true)).toBe(30); expect(paintFrameWidth(42,true)).toBe(42); expect(paintFrameWidth(12,false)).toBe(12); });
  it('caps backing resolution at 2', () => { expect(backingRatio(3)).toBe(2); expect(backingRatio(1)).toBe(1); });
  it('undo removes the starting stroke too', () => { expect(undoPainting(initialPainting())).toHaveLength(5); });
});