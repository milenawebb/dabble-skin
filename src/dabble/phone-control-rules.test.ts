import { expect, it } from 'vitest';
import { phoneCaptionBottom, phonePlayInStrip, usesPhoneOverlay } from './phone-control-rules';
it('uses phone overlay only below 420px', () => {
  expect(usesPhoneOverlay(390, false)).toBe(true);
  expect(usesPhoneOverlay(320, false)).toBe(true);
  expect(usesPhoneOverlay(419, false)).toBe(true);
  expect(usesPhoneOverlay(420, false)).toBe(false);
  expect(usesPhoneOverlay(756, false)).toBe(false);
  expect(usesPhoneOverlay(1056, false)).toBe(false);
});
it('never uses phone overlays in fullscreen', () => {
  expect(usesPhoneOverlay(320, true)).toBe(false);
  expect(usesPhoneOverlay(390, true)).toBe(false);
});
it('puts play in the strip only on videos shorter than 180px', () => {
  expect(phonePlayInStrip(124)).toBe(true);
  expect(phonePlayInStrip(179)).toBe(true);
  expect(phonePlayInStrip(180)).toBe(false);
  expect(phonePlayInStrip(220)).toBe(false);
});
it('moves captions above the visible strip and lowers them when hidden', () => {
  expect(phoneCaptionBottom({ top: 0, height: 180 }, 142, true)).toBe(140);
  expect(phoneCaptionBottom({ top: 0, height: 180 }, 142, false)).toBe(172);
});