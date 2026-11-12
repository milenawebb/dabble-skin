import { describe, expect, it, vi, afterEach } from 'vitest';
import { SOUND, VOICES, dragDue, followsGesture, swish } from './sounds';

afterEach(() => vi.restoreAllMocks());
describe('optional feedback rules', () => {
  it('requires a user gesture no more than 500ms ago', () => {
    expect(followsGesture(true,false,1000,500)).toBe(true);
    expect(followsGesture(true,false,1001,500)).toBe(false);
    expect(followsGesture(true,false,1000,-Infinity)).toBe(false);
  });
  it('is silent when muted, but allows the unmuted state', () => {
    expect(followsGesture(true,true,1000,999)).toBe(false);
    expect(followsGesture(true,false,1000,999)).toBe(true);
  });
  it('is silent when sounds are disabled', () => expect(followsGesture(false,false,1000,999)).toBe(false));
  it('limits seeking to once every 60ms', () => {
    expect(dragDue(59,0)).toBe(false); expect(dragDue(60,0)).toBe(true);
  });
  it('uses the exact requested control sound envelopes and volumes', () => {
    expect(SOUND).toEqual({play:[.32,700,2600,.25],pause:[.14,1800,600,.20],mute:[.07,320,140,.40,'lowpass'],scratch:[.07,3500,5000,.14,'highpass'],scratchSecond:[.07,3800,5200,.12,'highpass'],fullscreen:[.42,400,3200,.20],automatic:[.40,500,2800,.20],dripDown:[.09,500,180,.40,'lowpass']});
  });
  it.each([
    ['imp', 'bandpass', 1300, 1700, .7, .55, .38, 31],
    ['rib', 'lowpass', 520, 1100, .4, .50, .07, 9],
    ['cub', 'bandpass', 2400, 2200, 2.4, .30, .18, 47],
    ['drip', 'lowpass', 300, 260, .6, .22, 0, 5],
  ] as const)('preserves the exact %s voice', (kind, type, f, fs, q, g, fl, hz) => {
    expect(VOICES[kind]).toEqual({ type, f, fs, q, g, fl, hz });
  });
  it('never throws when browser audio is unavailable', () => expect(() => swish(...SOUND.play)).not.toThrow());
});