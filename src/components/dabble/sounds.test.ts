import { describe, expect, it, vi, afterEach } from 'vitest';
import { SOUND, brushSound, dragDue, followsGesture, swish } from './sounds';

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
    expect(dragDue(59,0,false)).toBe(false); expect(dragDue(60,0,false)).toBe(true);
  });
  it('limits brush dragging to once every 70ms', () => {
    expect(dragDue(69,0,true)).toBe(false); expect(dragDue(70,0,true)).toBe(true);
  });
  it('uses the exact requested control sound envelopes and volumes', () => {
    expect(SOUND).toEqual({play:[.32,700,2600,.25],pause:[.14,1800,600,.20],mute:[.07,320,140,.40,'lowpass'],scratch:[.07,3500,5000,.14,'highpass'],scratchSecond:[.07,3800,5200,.12,'highpass'],fullscreen:[.42,400,3200,.20],automatic:[.40,500,2800,.20],dripDown:[.09,500,180,.40,'lowpass']});
  });
  it('uses the requested brush envelopes without changing paint math', () => {
    vi.spyOn(Math,'random').mockReturnValue(.5);
    expect(brushSound('imp')).toEqual([.07,1650,2400,.09]);
    expect(brushSound('rib')).toEqual([.07,1650,2400,.09]);
    expect(brushSound('cub')).toEqual([.04,3000,4200,.10,'highpass']);
    expect(brushSound('drip')).toEqual([.07,600,200,.30,'lowpass']);
  });
  it('never throws when browser audio is unavailable', () => expect(() => swish(...SOUND.play)).not.toThrow());
});