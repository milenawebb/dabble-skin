import { beforeEach, expect, it } from 'vitest';
import { BORDER_HINT_MS, VIDEO_HINT_MS, BRUSH_NAMES_MS, DISCOVERY_KEY, draggedVideo, hasPaintedBefore, rememberFirstStroke } from './painting-discovery';
beforeEach(() => localStorage.clear());
it('uses three seconds for opening guidance', () => expect(BORDER_HINT_MS).toBe(3000));
it('uses two seconds for wrong-area guidance', () => expect(VIDEO_HINT_MS).toBe(2000));
it('shows brush names for four seconds', () => expect(BRUSH_NAMES_MS).toBe(4000));
it('remembers the first manual stroke independently of cleared paintings', () => {
  expect(hasPaintedBefore()).toBe(false); rememberFirstStroke();
  localStorage.setItem('dabble-painting:v1:video', JSON.stringify({strokes:[]}));
  expect(localStorage.getItem(DISCOVERY_KEY)).toBe('yes'); expect(hasPaintedBefore()).toBe(true);
});
it('distinguishes a stationary video click from dragging', () => {
  expect(draggedVideo(100,100,100,100)).toBe(false);
  expect(draggedVideo(100,100,120,100)).toBe(true);
});