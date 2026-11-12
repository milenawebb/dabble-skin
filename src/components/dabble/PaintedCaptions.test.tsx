import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PaintedCaptions } from './PaintedCaptions';

let showing = true;
vi.mock('@videojs/react/video', () => ({ usePlayer: (select: (state: unknown) => unknown) => select({ subtitlesShowing: showing, controlsVisible: true }) }));

beforeEach(() => {
  showing = true;
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Chrome/142.0 AppleWebKit/537.36');
  vi.stubGlobal('CSS', { supports: () => true });
  vi.stubGlobal('requestAnimationFrame', () => 1);
  vi.stubGlobal('cancelAnimationFrame', () => {});
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); document.body.innerHTML = ''; });

function setup(activeCues: unknown) {
  const root = document.createElement('div');
  root.dataset['captionId'] = 'test';
  const video = document.createElement('video');
  const bar = document.createElement('div');
  bar.className = 'dabble-bar';
  const track = Object.assign(new EventTarget(), { kind: 'captions', mode: 'showing', activeCues, cues: [] });
  const list = Object.assign([track], { addEventListener: vi.fn(), removeEventListener: vi.fn() });
  Object.defineProperty(video, 'textTracks', { value: list });
  root.append(video, bar);
  document.body.append(root);
  const props = { rootRef: { current: root }, captionId: 'test', docked: false, barEnabled: true };
  const view = render(<PaintedCaptions {...props} />, { container: root.appendChild(document.createElement('div')) });
  return { root, track, props, view };
}

describe('caption state and safety net', () => {
  it('stacks simultaneous cues oldest first without changing showing mode', () => {
    const { root, track } = setup([{ text: 'Newest\nsecond line', startTime: 3, endTime: 8 }, { text: '<b>Older</b>', startTime: 1, endTime: 8 }]);
    expect(Array.from(root.querySelectorAll('.dabble-caption-swipe')).map(el => el.textContent)).toEqual(['Older', 'Newest\nsecond line']);
    expect(track.mode).toBe('showing');
  });
  it('renders nothing when CC is off', () => {
    showing = false;
    const { root } = setup([{ text: 'Cue', startTime: 1, endTime: 8 }]);
    expect(root.querySelectorAll('.dabble-caption-swipe').length).toBe(0);
  });
  it('renders nothing in a cue gap and updates on cuechange', () => {
    const { root, track } = setup([]);
    expect(root.querySelectorAll('.dabble-caption-swipe').length).toBe(0);
    act(() => { track.activeCues = [{ text: 'Now active', startTime: 1, endTime: 8 }]; track.dispatchEvent(new Event('cuechange')); });
    expect(root.querySelector('.dabble-caption-swipe')?.textContent).toBe('Now active');
  });
  it('keeps native captions when active cues cannot be read', () => {
    const { root, track } = setup(null);
    expect(root.dataset['captionRenderer']).toBe('native');
    expect(root.querySelectorAll('.dabble-caption-swipe').length).toBe(0);
    expect(track.mode).toBe('showing');
  });
  it('keeps native captions if cue CSS suppression is unsupported', () => {
    vi.stubGlobal('CSS', { supports: () => false });
    const { root } = setup([{ text: 'Cue', startTime: 1, endTime: 8 }]);
    expect(root.dataset['captionRenderer']).toBe('native');
    expect(root.querySelectorAll('.dabble-caption-swipe').length).toBe(0);
  });
  it('uses the native safety net in Safari', () => {
    const ua = vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Version/18.0 AppleWebKit/605.1.15 Safari/605.1.15');
    const { root, track } = setup([{ text: 'Cue', startTime: 1, endTime: 8 }]);
    expect(root.dataset['captionRenderer']).toBe('native');
    expect(track.mode).toBe('showing');
    ua.mockRestore();
  });
});