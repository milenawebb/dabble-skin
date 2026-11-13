import { expect, it } from 'vitest';
import { VIDEO_HINT_MS, draggedVideo } from './painting-discovery';
it('uses two seconds for wrong-area guidance', () => expect(VIDEO_HINT_MS).toBe(2000));
it('distinguishes stationary clicks and short movements from a video drag', () => {
  expect(draggedVideo(100,100,100,100)).toBe(false);
  expect(draggedVideo(100,100,108,100)).toBe(false);
  expect(draggedVideo(100,100,120,100)).toBe(true);
});
