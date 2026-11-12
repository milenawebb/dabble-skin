import { describe, expect, it } from 'vitest';
import { BRUSH_SIZES, TRAY_HIDE_DELAY, trayState, cursorDiameter, brushCursor } from './tray-rules';
describe('tray interaction rules', () => {
  it('maps Small to size 10', () => { expect(BRUSH_SIZES[0].value).toBe(10); });
  it('maps Medium to the existing default size 20', () => { expect(BRUSH_SIZES[1].value).toBe(20); });
  it('maps Large to size 34', () => { expect(BRUSH_SIZES[2].value).toBe(34); });
  it('waits 600ms before tucking a peek', () => { expect(TRAY_HIDE_DELAY).toBe(600); });
  it('starts tucked without painting or a peek', () => { expect(trayState(false, false)).toBe('tucked'); });
  it('peeks without enabling painting', () => { expect(trayState(false, true)).toBe('peek'); });
  it('painting pins regardless of pointer position', () => { expect(trayState(true, false)).toBe('pinned'); });
  it('clamps the cursor at 8px', () => { expect(cursorDiameter(10, 100, 'imp')).toBe(8); });
  it('clamps the cursor at 64px', () => { expect(cursorDiameter(34, 3000, 'rib')).toBe(64); });
  it('matches the normalized ribbon footprint', () => { expect(cursorDiameter(20, 680, 'rib')).toBe(32); });
  it('uses centered hotspot and crosshair fallback', () => { expect(brushCursor(32, '#123456', '#111111', '#ffffff')).toMatch(/19 19, crosshair$/); });
});