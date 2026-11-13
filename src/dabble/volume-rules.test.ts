import { expect, it } from 'vitest';
import { shouldShowVolumePopover } from './skin-rules';
it('omits the volume popover under 420px and on touch-only devices', () => {
  expect(shouldShowVolumePopover(419,true)).toBe(false);
  expect(shouldShowVolumePopover(420,true)).toBe(true);
  expect(shouldShowVolumePopover(1000,false)).toBe(false);
});
it('removes volume adjustment on coarse-pointer devices even with a connected fine pointer', () => {
  expect(shouldShowVolumePopover(768, true, true)).toBe(false);
  expect(shouldShowVolumePopover(1100, true, false)).toBe(true);
});