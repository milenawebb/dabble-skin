import { describe, expect, it } from 'vitest';
import { getFrameWidth, getVideoLayout } from './canvas-layout';

describe('canvas frame widths', () => {
  it('uses five percent at 560px and above', () => {
    expect(getFrameWidth(560)).toBe(28);
    expect(getFrameWidth(860)).toBe(43);
  });
  it('uses 20px from 420px through 559px', () => {
    expect(getFrameWidth(420)).toBe(20);
    expect(getFrameWidth(559)).toBe(20);
  });
  it('uses 12px below 420px', () => {
    expect(getFrameWidth(419)).toBe(12);
    expect(getFrameWidth(358)).toBe(12);
  });
});

describe('video shape', () => {
  it('rounds stage dimensions and screen position to whole pixels at odd widths', () => {
    for (const browserWidth of [1001, 1277, 1439]) {
      const canvasLeft = (browserWidth - 860) / 2;
      const frame = 42.4;
      const layout = getVideoLayout(1920, 1080, { canvasWidth: 848, canvasLeft, canvasTop: 120, frame });
      expect(layout.stage?.width).toBe(763);
      expect(layout.stage?.height).toBe(429);
      const renderedFrame = Math.floor(frame * 64) / 64;
      expect(canvasLeft + renderedFrame + (layout.stage?.left ?? 0)).toBe(Math.round(canvasLeft + frame));
      expect(120 + renderedFrame + (layout.stage?.top ?? 0)).toBe(162);
    }
  });
  it('defaults to 16:9 before metadata is available', () => {
    expect(getVideoLayout(0, 0)).toEqual({ aspectRatio: 16 / 9, portrait: false });
  });
  it('uses the actual landscape video ratio', () => {
    expect(getVideoLayout(960, 400)).toEqual({ aspectRatio: 2.4, portrait: false });
  });
  it('identifies portrait video from metadata', () => {
    expect(getVideoLayout(360, 640)).toEqual({ aspectRatio: 0.5625, portrait: true });
  });
});