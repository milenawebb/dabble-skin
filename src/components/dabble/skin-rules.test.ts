import { describe, expect, it } from 'vitest';
import { DABBLE_HOTKEYS, getControlSize } from './skin-rules';

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
  it('uses large controls at 560px', () => { expect(getControlSize(560)).toBe('large'); });
  it('uses medium controls from 420px to 559px', () => { expect(getControlSize(420)).toBe('medium'); expect(getControlSize(559)).toBe('medium'); });
  it('uses small controls below 420px', () => { expect(getControlSize(419)).toBe('small'); });
});