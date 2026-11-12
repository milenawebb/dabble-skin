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