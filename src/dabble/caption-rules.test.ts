import { describe, expect, it } from 'vitest';
import { captionBottom, measuredCaptionBottom, captionsOverlap, fittedVideoRect, plainCueText } from './caption-rules';

const video = { left: 0, top: 0, width: 800, height: 450 };
it('moves desktop captions up even with a barely overlapping bar', () => { expect(measuredCaptionBottom(video,{top:445,height:48},true)).toBe(435); expect(measuredCaptionBottom(video,{top:445,height:48},false)).toBe(442); });
it('clears a taller tablet bar by ten pixels', () => { expect(measuredCaptionBottom(video,{top:400,height:72},true)).toBe(390); });
it('keeps fullscreen captions inside letterboxed video with controls below it', () => { expect(measuredCaptionBottom(video,{top:700,height:48},true)).toBe(440); });
describe('caption clearance', () => {
  it('clears visible overlay controls by 10px', () => { expect(captionBottom(video, 400, true, false)).toBe(390); });
  it('keeps exactly 10px even when the bar barely overlaps the video', () => { expect(captionBottom(video, 445, true, false)).toBe(435); });
  it('stays over the actual fullscreen video when controls sit in letterboxing', () => { expect(captionBottom(video, 700, true, false)).toBe(423); });
  it('uses 6% of video height when controls hide', () => { expect(captionBottom(video, 400, false, false)).toBe(423); });
  it('uses 6% on phones even with docked controls showing', () => { expect(captionBottom({ ...video, width: 320, height: 180 }, 188, true, true)).toBe(169.2); });
  it('keeps at least 8px bottom clearance in very short phone videos', () => { expect(captionBottom({ ...video, width: 180, height: 100 }, 108, true, true)).toBe(92); });
  it('measures letterboxed fullscreen video instead of the screen', () => { expect(fittedVideoRect({ left: 0, top: 0, width: 1200, height: 900 }, 1600, 900)).toEqual({ left: 0, top: 112.5, width: 1200, height: 675 }); });
  it('hides when a panel intersects the caption or bristles', () => { expect(captionsOverlap({ left: 100, top: 300, width: 200, height: 40 }, { left: 310, top: 320, width: 50, height: 50 })).toBe(true); });
  it('keeps captions when a panel is clear', () => { expect(captionsOverlap({ left: 100, top: 300, width: 200, height: 40 }, { left: 310, top: 100, width: 50, height: 50 })).toBe(false); });
});
describe('cue text safety', () => {
  it('preserves line breaks while stripping tags and decoding simple VTT entities', () => { expect(plainCueText({ text: '<v Dab><b>First &amp; second</b>\n<i>Next line</i>' })).toBe('First & second\nNext line'); });
});