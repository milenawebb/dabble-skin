import { expect, it } from 'vitest';
import { paintingHeight } from './drawer-rules';

it('keeps the 24px bottom paint band independent of the open drawer height', () => {
  expect(paintingHeight(true, 216, 192)).toBe(216);
  expect(paintingHeight(true, 338, 192)).toBe(216);
});
it('preserves desktop paint geometry', () => {
  expect(paintingHeight(false, 640, 580)).toBe(640);
});