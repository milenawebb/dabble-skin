import { describe, expect, it } from 'vitest';
import { DABBLE_HOTKEYS, DABBLE_PLAYBACK_RATES, getCaptionLine, getPlayerSource, getControlSize, showCenterPlay, shouldDockControls, getPlaqueSpace } from './skin-rules';

describe('Dabble keyboard rules', () => {
  it('binds Space and K to playback', () => {
    expect(DABBLE_HOTKEYS.filter((binding) => binding.action === 'togglePaused').map((binding) => binding.keys)).toEqual(['Space', 'k']);
  });
  it('binds M to mute', () => { expect(DABBLE_HOTKEYS.find((binding) => binding.keys === 'm')?.action).toBe('toggleMuted'); });
  it('binds F to fullscreen', () => { expect(DABBLE_HOTKEYS.find((binding) => binding.keys === 'f')?.action).toBe('toggleFullscreen'); });
  it('binds C to captions', () => { expect(DABBLE_HOTKEYS.find((binding) => binding.keys === 'c')?.action).toBe('toggleSubtitles'); });
  it('seeks back exactly five seconds', () => { expect(DABBLE_HOTKEYS.find((binding) => binding.keys === 'ArrowLeft')).toEqual({ keys: 'ArrowLeft', action: 'seekStep', value: -5 }); });
  it('seeks forward exactly five seconds', () => { expect(DABBLE_HOTKEYS.find((binding) => binding.keys === 'ArrowRight')).toEqual({ keys: 'ArrowRight', action: 'seekStep', value: 5 }); });
  it('binds arrow up and down to volume', () => { expect(DABBLE_HOTKEYS.filter((binding) => binding.action === 'volumeStep').map((binding) => binding.keys)).toEqual(['ArrowUp', 'ArrowDown']); });
});

describe('player-relative controls', () => {
  it('docks only below 420px outside fullscreen', () => {
    expect(shouldDockControls(419, false)).toBe(true);
    expect(shouldDockControls(420, false)).toBe(false);
    expect(shouldDockControls(419, true)).toBe(false);
  });
  it('reserves the plaque height plus a 12px canvas gap only on phones', () => {
    expect(getPlaqueSpace(419, 115)).toBe(127);
    expect(getPlaqueSpace(420, 115)).toBe(0);
  });
  it('keeps caption bottoms inside the video when the docked bar has no overlap', () => {
    expect(getCaptionLine(0, 200, true)).toBe(96);
  });
  it('uses large controls at 560px', () => { expect(getControlSize(560)).toBe('large'); });
  it('uses medium controls from 420px to 559px', () => { expect(getControlSize(420)).toBe('medium'); expect(getControlSize(559)).toBe('medium'); });
  it('uses small controls below 420px', () => { expect(getControlSize(419)).toBe('small'); });
});

describe('step four player rules', () => {
  it('offers the five requested playback rates in order', () => { expect(DABBLE_PLAYBACK_RATES).toEqual([0.5, 1, 1.25, 1.5, 2]); });
  it('shows the center invitation before first play', () => { expect(showCenterPlay(false, false)).toBe(true); });
  it('does not return the invitation on an ordinary pause', () => { expect(showCenterPlay(true, false)).toBe(false); });
  it('returns the center invitation after ending', () => { expect(showCenterPlay(true, true)).toBe(true); });
  it('moves captions above a visible 84px overlap', () => { expect(getCaptionLine(84, 200, true)).toBe(54); });
  it('lowers captions when the controls are hidden', () => { expect(getCaptionLine(84, 200, false)).toBe(98); });
  it('uses a nonexistent source only for the broken test', () => { expect(getPlayerSource('oceans.mp4', true)).toBe('/dabble-video-does-not-exist.mp4'); expect(getPlayerSource('oceans.mp4', false)).toBe('oceans.mp4'); });
});