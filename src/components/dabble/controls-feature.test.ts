import { afterEach, describe, expect, it, vi } from 'vitest';
import { controlsFeature } from '@videojs/core/dom';

// Exercise the installed patched feature, not a parallel skin timer/helper.
function setup() {
  vi.useFakeTimers();
  const container = document.createElement('div');
  const media = Object.assign(new EventTarget(), { paused: true, ended: false, pause() {} });
  const abort = new AbortController();
  let state: any;
  const get = () => state;
  const set = (next: object) => { Object.assign(state, next); };
  const feature = controlsFeature as any;
  state = feature.state({ get, set });
  feature.attach({ target: { media, container }, signal: abort.signal, get, set });
  const play = () => { media.paused = false; media.dispatchEvent(new Event('play')); };
  const move = () => container.dispatchEvent(new MouseEvent('pointermove'));
  return { state, media, container, abort, play, move };
}
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); });
describe('contest controls visibility', () => {
  it('holds controls before first play even after leaving', () => {
    const s = setup(); s.container.dispatchEvent(new MouseEvent('mouseleave')); vi.advanceTimersByTime(10000);
    expect(s.state.controlsVisible).toBe(true); s.abort.abort();
  });
  it('hides at exactly 1800 milliseconds of inactivity after play', () => {
    const s = setup(); s.play(); s.move(); vi.advanceTimersByTime(1799);
    expect(s.state.controlsVisible).toBe(true); vi.advanceTimersByTime(1);
    expect(s.state.controlsVisible).toBe(false); s.abort.abort();
  });
  it('hides immediately on pointer leave after play', () => {
    const s = setup(); s.play(); s.container.dispatchEvent(new MouseEvent('mouseleave'));
    expect(s.state.controlsVisible).toBe(false); s.abort.abort();
  });
  it('does not hold controls on an ordinary pause', () => {
    const s = setup(); s.play(); s.media.paused = true; s.media.dispatchEvent(new Event('pause')); vi.advanceTimersByTime(1800);
    expect(s.state.controlsVisible).toBe(false); s.abort.abort();
  });
  it('holds ended controls until the next interaction cycle', () => {
    const s = setup(); s.play(); vi.advanceTimersByTime(1800); s.media.paused = true; s.media.ended = true; s.media.dispatchEvent(new Event('ended'));
    vi.advanceTimersByTime(10000); expect(s.state.controlsVisible).toBe(true);
    s.move(); vi.advanceTimersByTime(1800); expect(s.state.controlsVisible).toBe(false); s.abort.abort();
  });
  it('preserves phone and popup locks until they are released', () => {
    const s = setup(); s.play(); const release = s.state.requestControlsLock(); s.container.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(10000); expect(s.state.controlsVisible).toBe(true);
    release(); vi.advanceTimersByTime(1800); expect(s.state.controlsVisible).toBe(false); s.abort.abort();
  });
  it('restores controls on pointer movement, keyboard input and focus', () => {
    const s = setup(); s.play();
    for (const event of [new MouseEvent('pointermove'), new KeyboardEvent('keydown', {key: 'k'}), new FocusEvent('focusin')]) {
      vi.advanceTimersByTime(1800); expect(s.state.controlsVisible).toBe(false);
      s.container.dispatchEvent(event); expect(s.state.controlsVisible).toBe(true);
    }
    s.abort.abort();
  });
});