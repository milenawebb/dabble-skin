import { expect, it } from 'vitest';
import { shouldShowVolumePopover } from './skin-rules';
it('omits the volume popover under 420px and on touch-only devices', () => {
  expect(shouldShowVolumePopover(419,true)).toBe(false);
  expect(shouldShowVolumePopover(420,true)).toBe(true);
  expect(shouldShowVolumePopover(1000,false)).toBe(false);
});