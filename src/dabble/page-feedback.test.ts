import { describe, expect, it, vi } from 'vitest';
import { announceShortcut, keycapFor, keycapSoundAllowed, SHORTCUT_EVENT } from './page-feedback';

describe('landing keycap feedback rules', () => {
  it('is silent without an explicit sound opt-in', () => {
    expect(keycapSoundAllowed(false, true, false)).toBe(false);
    expect(keycapSoundAllowed(true, true, false)).toBe(true);
  });
  it('never sounds before the first gesture', () => {
    expect(keycapSoundAllowed(true, false, false)).toBe(false);
  });
  it('respects media mute', () => {
    expect(keycapSoundAllowed(true, true, true)).toBe(false);
  });
  it('maps handled shortcuts to their readable rows', () => {
    expect(keycapFor('k')).toBe('Space or K');
    expect(keycapFor('ArrowRight')).toBe('← →');
    expect(keycapFor('meta+z')).toBe('Ctrl or Cmd + Z');
    expect(keycapFor('3')).toBe('1 2 3 4');
    expect(keycapFor('Tab')).toBeUndefined();
  });
  it('only publishes decoration, without clicking a player control', () => {
    const root = document.createElement('div');
    const button = document.createElement('button'); root.append(button);
    const action = vi.fn(); button.addEventListener('click', action);
    const listener = vi.fn(); root.addEventListener(SHORTCUT_EVENT, listener);
    announceShortcut(root, 'p');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(action).not.toHaveBeenCalled();
  });
});