import { expect, it } from 'vitest';
import { nextBrushSize, phonePanelPadding, phonePanelWidth } from './phone-panel-rules';
it('fits seven nonoverlapping 44px targets at 320, 360 and 390px', () => {
  for (const viewport of [320, 360, 390]) {
    const width = phonePanelWidth(viewport - 44, viewport);
    expect(width - phonePanelPadding(width) * 2).toBeGreaterThanOrEqual(308);
    expect(width).toBeLessThanOrEqual(viewport);
  }
});
it('uses the agreed 6px padding at 320px', () => { expect(phonePanelPadding(320)).toBe(6); });
it('cycles small, medium and large brush sizes', () => {
  expect(nextBrushSize(10)).toBe(20); expect(nextBrushSize(20)).toBe(34); expect(nextBrushSize(34)).toBe(10);
});