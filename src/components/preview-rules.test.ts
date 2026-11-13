import { describe, expect, it } from 'vitest';
import { effectivePreviewSize, visiblePreviewSizes } from './preview-rules';

describe('preview size tabs', () => {
  it('offers all three sizes on a wide window', () => {
    expect(visiblePreviewSizes(1280).map(size => size.id)).toEqual(['desktop', 'tablet', 'mobile']);
  });
  it('does not offer any switch below 900px', () => {
    expect(visiblePreviewSizes(390)).toEqual([]);
    expect(visiblePreviewSizes(899)).toEqual([]);
    expect(visiblePreviewSizes(900).map(size => size.id)).toEqual(['desktop', 'tablet', 'mobile']);
  });
  it('uses full-width Desktop below 900px regardless of selection', () => {
    expect(effectivePreviewSize('tablet', 899)).toBe('desktop');
    expect(effectivePreviewSize('mobile', 390)).toBe('desktop');
    expect(effectivePreviewSize('mobile', 900)).toBe('mobile');
  });
});
