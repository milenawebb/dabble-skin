import { expect, it } from 'vitest';
import { STROKE_RETURN_DELAY, suppressPaintingControls } from './stroke-controls';
it('keeps an open desktop tray from suppressing controls', () => { expect(suppressPaintingControls(1100,false,true,false)).toBe(false); });
it('keeps an open tablet tray from suppressing controls', () => { expect(suppressPaintingControls(768,false,true,false)).toBe(false); });
it('suppresses controls during a desktop stroke', () => { expect(suppressPaintingControls(1100,false,true,true)).toBe(true); });
it('returns controls one second after stroke completion', () => { expect(STROKE_RETURN_DELAY).toBe(1000); });
it('preserves the phone painting slot behavior', () => { expect(suppressPaintingControls(390,false,true,false)).toBe(true); });
it('never applies painting suppression in fullscreen', () => { expect(suppressPaintingControls(768,true,true,true)).toBe(false); });