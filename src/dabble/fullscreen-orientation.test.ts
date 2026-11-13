import { describe, expect, it, vi } from 'vitest';
import { updateFullscreenOrientation } from './fullscreen-orientation';

describe('optional fullscreen orientation', () => {
  it('locks landscape only for a wider-than-tall video', () => {
    const lock = vi.fn();
    updateFullscreenOrientation(true, 1920, 1080, { lock });
    expect(lock).toHaveBeenCalledExactlyOnceWith('landscape');
  });
  it('does not lock portrait, square or unloaded video', () => {
    const lock = vi.fn();
    for (const [width, height] of [[1080, 1920], [1080, 1080], [0, 0]] as const) {
      updateFullscreenOrientation(true, width, height, { lock });
    }
    expect(lock).not.toHaveBeenCalled();
  });
  it('unlocks when fullscreen ends regardless of video shape', () => {
    const unlock = vi.fn();
    updateFullscreenOrientation(false, 1080, 1920, { unlock });
    expect(unlock).toHaveBeenCalledOnce();
  });
  it('silently tolerates missing APIs and synchronous failures', () => {
    const fail = () => { throw new Error('Unsupported'); };
    expect(() => {
      updateFullscreenOrientation(true, 1920, 1080);
      updateFullscreenOrientation(false, 1920, 1080, {});
      updateFullscreenOrientation(true, 1920, 1080, { lock: fail });
      updateFullscreenOrientation(false, 1920, 1080, { unlock: fail });
    }).not.toThrow();
  });
  it('handles rejected lock and unlock promises', async () => {
    const fail = vi.fn(() => Promise.reject(new Error('Not supported')));
    updateFullscreenOrientation(true, 1920, 1080, { lock: fail });
    updateFullscreenOrientation(false, 1920, 1080, { unlock: fail });
    await Promise.resolve();
    expect(fail).toHaveBeenCalledTimes(2);
  });
});