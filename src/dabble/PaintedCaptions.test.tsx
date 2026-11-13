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

function setup(activeCues: unknown, cues: unknown[] = []) {
  const root = document.createElement('div');
  root.dataset['captionId'] = 'test';
  const video = document.createElement('video');
  const bar = document.createElement('div');
  bar.className = 'dabble-bar';
  const track = Object.assign(new EventTarget(), { kind: 'captions', mode: 'showing', activeCues, cues });
  const events = new EventTarget();
  const list = Object.assign([track], { addEventListener: events.addEventListener.bind(events), removeEventListener: events.removeEventListener.bind(events), dispatchEvent: events.dispatchEvent.bind(events) });
  Object.defineProperty(video, 'textTracks', { value: list });
  root.append(video, bar);
  document.body.append(root);
  const props = { rootRef: { current: root }, captionId: 'test', docked: false, barEnabled: true };
  const view = render(<PaintedCaptions {...props} />, { container: root.appendChild(document.createElement('div')) });
  return { root, video, track, list, props, view };
}

describe('caption state and safety net', () => {
  it('stacks simultaneous cues oldest first using hidden mode', () => {
    const { root, track } = setup([{ text: 'Newest\nsecond line', startTime: 3, endTime: 8 }, { text: '<b>Older</b>', startTime: 1, endTime: 8 }]);
    expect(Array.from(root.querySelectorAll('.dabble-caption-swipe')).map(el => el.textContent)).toEqual(['Older', 'Newest\nsecond line']);
    expect(track.mode).toBe('hidden');
  });
  it('renders nothing when CC is off', () => {
    showing = false;
    const { root, track, list } = setup([{ text: 'Cue', startTime: 1, endTime: 8 }]);
    Object.assign(track, { __dabbleCaptionOn: false });
    act(() => { list.dispatchEvent(new Event('change')); });
    expect(track.mode).toBe('disabled');
    expect(root.querySelectorAll('.dabble-caption-swipe').length).toBe(0);
  });
  it('renders nothing in a cue gap and updates on cuechange', () => {
    const { root, track } = setup([]);
    expect(root.querySelectorAll('.dabble-caption-swipe').length).toBe(0);
    act(() => { track.activeCues = [{ text: 'Now active', startTime: 1, endTime: 8 }]; track.dispatchEvent(new Event('cuechange')); });
    expect(root.querySelector('.dabble-caption-swipe')?.textContent).toBe('Now active');
  });
  it('waits for hidden cues to load rather than treating null as a browser failure', () => {
    const { root, track } = setup(null);
    expect(root.dataset['captionRenderer']).toBe('painted');
    expect(track.mode).toBe('hidden');
    act(() => { track.activeCues = [{ text: 'Loaded', startTime: 1, endTime: 8 }]; track.dispatchEvent(new Event('cuechange')); });
    expect(root.querySelector('.dabble-caption-swipe')?.textContent).toBe('Loaded');
  });
  it('uses native fallback for truly unreadable cue objects', () => {
    const { root, track } = setup([{ startTime: 1, endTime: 8 }]);
    expect(root.dataset['captionRenderer']).toBe('native');
    expect(track.mode).toBe('showing');
  });
  it('does not require cue CSS support when the track is hidden', () => {
    vi.stubGlobal('CSS', { supports: () => false });
    const { root, track } = setup([{ text: 'Cue', startTime: 1, endTime: 8 }]);
    expect(root.dataset['captionRenderer']).toBe('painted');
    expect(track.mode).toBe('hidden');
  });
  it('uses painted captions on iOS and repairs silent mode changes', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('iPhone AppleWebKit/605.1.15 Safari/605.1.15');
    const { root, track, list } = setup([{ text: 'Cue', startTime: 1, endTime: 8 }]);
    expect(root.dataset['captionRenderer']).toBe('painted');
    for (const mode of ['showing', 'disabled']) {
      act(() => { track.mode = mode; list.dispatchEvent(new Event('change')); });
      expect(track.mode).toBe('hidden');
    }
  });
  it('hands on captions to native iPhone fullscreen and back, preserving CC off', () => {
    const { root, video, track, list } = setup([{ text: 'Cue', startTime: 1, endTime: 8 }]);
    act(() => { video.dispatchEvent(new Event('webkitbeginfullscreen')); });
    expect(track.mode).toBe('showing');
    expect(root.dataset['captionRenderer']).toBe('native');
    expect(root.querySelectorAll('.dabble-caption-swipe')).toHaveLength(0);
    act(() => { video.dispatchEvent(new Event('webkitendfullscreen')); });
    expect(track.mode).toBe('hidden');
    expect(root.dataset['captionRenderer']).toBe('painted');
    act(() => { Object.assign(track, { __dabbleCaptionOn: false }); list.dispatchEvent(new Event('change')); video.dispatchEvent(new Event('webkitbeginfullscreen')); });
    expect(track.mode).toBe('disabled');
  });
  it('resets every cue to native defaults and restores exact geometry on exit', () => {
    const first = { text: 'First', startTime: 1, endTime: 8, line: 98, position: 45, size: 80, align: 'start' };
    const second = { text: 'Later', startTime: 12, endTime: 18, line: -1, position: 60, size: 90, align: 'end' };
    const originals = [{ ...first }, { ...second }];
    const { video, track, root, list } = setup([first], [first, second]);
    act(() => { video.dispatchEvent(new Event('webkitbeginfullscreen')); });
    for (const cue of [first, second]) expect(cue).toMatchObject({ line: 'auto', position: 'auto', size: 100, align: 'center' });
    act(() => { list.dispatchEvent(new Event('change')); video.dispatchEvent(new Event('webkitbeginfullscreen')); });
    act(() => { video.dispatchEvent(new Event('webkitendfullscreen')); });
    expect([first, second]).toEqual(originals);
    expect(track.mode).toBe('hidden');
    expect(root.querySelector('.dabble-caption-swipe')?.textContent).toBe('First');
  });
  it('resets late-loaded cues and survives caption-effect reattachment during native fullscreen', () => {
    const cue = { text: 'Cue', startTime: 1, endTime: 8, line: 98, position: 50, size: 70, align: 'end' };
    const original = { ...cue };
    const { video, track, props, view } = setup([cue]);
    act(() => { video.dispatchEvent(new Event('webkitbeginfullscreen')); track.cues.push(cue); video.dispatchEvent(new Event('load')); });
    expect(cue).toMatchObject({ line: 'auto', position: 'auto', size: 100, align: 'center' });
    view.rerender(<PaintedCaptions {...props} barEnabled={false} />);
    expect(cue).toMatchObject({ line: 'auto', position: 'auto', size: 100, align: 'center' });
    expect(track.mode).toBe('showing');
    act(() => { video.dispatchEvent(new Event('webkitendfullscreen')); });
    expect(cue).toEqual(original);
    expect(track.mode).toBe('hidden');
  });
  it('leaves cue positions and painted rendering alone for container fullscreen', () => {
    const cue = { text: 'Cue', startTime: 1, endTime: 8, line: 98, position: 50, size: 70, align: 'end' };
    const original = { ...cue };
    const { root, track } = setup([cue], [cue]);
    act(() => { document.dispatchEvent(new Event('fullscreenchange')); });
    expect(cue).toEqual(original);
    expect(track.mode).toBe('hidden');
    expect(root.dataset['captionRenderer']).toBe('painted');
  });
});
