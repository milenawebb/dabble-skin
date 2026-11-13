import { describe, expect, it } from 'vitest';
import { BRUSH_SIZES, cursorDiameter, brushCursor, twoZoneTray } from './tray-rules';
describe('tray interaction rules', () => {
  it('uses three tablet rows below 670px', () => { expect(twoZoneTray(669)).toBe(false); expect(twoZoneTray(480)).toBe(false); expect(twoZoneTray(600)).toBe(false); });
  it('keeps two zones until fixed-size contents and gaps fit', () => { expect(twoZoneTray(670)).toBe(true); expect(twoZoneTray(800)).toBe(true); expect(twoZoneTray(1000)).toBe(true); expect(twoZoneTray(1191)).toBe(true); expect(twoZoneTray(1192)).toBe(false); expect(twoZoneTray(1200)).toBe(false); expect(twoZoneTray(1600)).toBe(false); expect(twoZoneTray(2000)).toBe(false); expect(twoZoneTray(390)).toBe(false); });
  it('maps Small to size 10', () => { expect(BRUSH_SIZES[0].value).toBe(10); });
  it('maps Medium to the existing default size 20', () => { expect(BRUSH_SIZES[1].value).toBe(20); });
  it('maps Large to size 34', () => { expect(BRUSH_SIZES[2].value).toBe(34); });
  it('clamps the cursor at 8px', () => { expect(cursorDiameter(10, 100, 'imp')).toBe(8); });
  it('clamps the cursor at 64px', () => { expect(cursorDiameter(34, 3000, 'rib')).toBe(64); });
  it('matches the normalized ribbon footprint', () => { expect(cursorDiameter(20, 680, 'rib')).toBe(32); });
  it('uses centered hotspot and crosshair fallback', () => { expect(brushCursor(32, '#123456', '#111111', '#ffffff')).toMatch(/19 19, crosshair$/); });
});