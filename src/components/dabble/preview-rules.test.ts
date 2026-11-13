import { describe, expect, it } from 'vitest';
import { effectivePreviewSize, visiblePreviewSizes } from './preview-rules';

describe('preview size tabs', () => {
  it('offers all three sizes on a wide window', () => {
    expect(visiblePreviewSizes(1280).map(size => size.id)).toEqual(['desktop', 'tablet', 'mobile']);
  });
  it('hides the Tablet tab when the window is narrower than 820px', () => {
    expect(visiblePreviewSizes(819).map(size => size.id)).toEqual(['desktop', 'mobile']);
    expect(visiblePreviewSizes(820).map(size => size.id)).toContain('tablet');
  });
  it('hides the whole group when the window is narrower than 440px', () => {
    expect(visiblePreviewSizes(439)).toEqual([]);
    expect(visiblePreviewSizes(440)).not.toEqual([]);
  });
  it('falls back to Desktop when the selected size no longer fits', () => {
    expect(effectivePreviewSize('tablet', 700)).toBe('desktop');
    expect(effectivePreviewSize('tablet', 1000)).toBe('tablet');
    expect(effectivePreviewSize('mobile', 500)).toBe('mobile');
  });
});
