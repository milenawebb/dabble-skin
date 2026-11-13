import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { forwardRef, type ReactNode } from 'react';
import { DabblePlayer } from './DabblePlayer';

vi.mock('@videojs/react/video', () => ({ VideoPlayer: ({ children }: { children: ReactNode }) => <>{children}</>, Video: forwardRef<HTMLVideoElement>((_, ref) => <video ref={ref} />) }));
vi.mock('@videojs/react/media/mux-video', () => ({ MuxVideo: forwardRef<HTMLVideoElement>((_, ref) => <video ref={ref} />) }));
vi.mock('./DabbleSkin', () => ({ DabbleSkin: ({ children }: { children: ReactNode }) => <div>{children}</div> }));
vi.mock('./video-palette', () => ({ sampleSource: () => () => {} }));
vi.mock('./use-brush-cursor', () => ({ useBrushCursor: () => {} }));

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('PointerEvent', MouseEvent);
  vi.spyOn(HTMLMediaElement.prototype, 'textTracks', 'get').mockReturnValue(Object.assign([], { addEventListener: () => {}, removeEventListener: () => {} }) as unknown as TextTrackList);
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({ x: 0, y: 0, left: 0, top: 0, right: 320, bottom: 240, width: 320, height: 240, toJSON: () => ({}) });
  const noop = () => {};
  const context = new Proxy({}, { get: (_, key) => key === 'createLinearGradient' ? () => ({ addColorStop: noop }) : noop, set: () => true });
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as CanvasRenderingContext2D);
  HTMLCanvasElement.prototype.setPointerCapture = noop;
  HTMLCanvasElement.prototype.hasPointerCapture = () => false;
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it('loads with empty storage, paints a stroke, and creates no audio context or node with sounds off', () => {
  const nodeCreated = vi.fn();
  const audioContext = vi.fn(function() { return { createGain: nodeCreated, createBufferSource: nodeCreated, createBiquadFilter: nodeCreated, createOscillator: nodeCreated }; });
  vi.stubGlobal('AudioContext', audioContext);
  const audioListeners: { type: string; listener: (event: unknown) => void }[] = [];
  const add = EventTarget.prototype.addEventListener;
  vi.spyOn(EventTarget.prototype, 'addEventListener').mockImplementation(function(this: EventTarget, type, listener, options) {
    if (this instanceof Element && this.classList.contains('dabble-canvas') && options === true && typeof listener === 'function' && ['pointerdown', 'pointermove'].includes(type)) {
      audioListeners.push({ type, listener: listener as (event: unknown) => void });
    }
    add.call(this, type, listener, options);
  });
  const { container } = render(<DabblePlayer src="silent-stroke.mp4" />);
  fireEvent.click(screen.getByRole('button', { name: 'Start painting' }));
  const canvas = container.querySelector('.dabble-paint');
  const wrapper = container.querySelector('.dabble-canvas');
  if (!canvas || !wrapper) throw new Error('Missing painting canvas');
  const before = Number(wrapper.getAttribute('data-stroke-count'));
  const pointer = (type: string, y: number) => {
    const data = { button: 0, pointerId: 1, clientX: 8, clientY: y, pointerType: 'touch', pressure: .5, timeStamp: y };
    act(() => audioListeners.filter(item => item.type === type).forEach(item => item.listener({ ...data, target: canvas, isTrusted: true })));
    const event = new Event(type, { bubbles: true, cancelable: true });
    for (const [key, value] of Object.entries(data)) Object.defineProperty(event, key, { value });
    fireEvent(canvas, event);
  };
  pointer('pointerdown', 40); pointer('pointermove', 100); pointer('pointerup', 100);
  expect(Number(wrapper.getAttribute('data-stroke-count'))).toBe(before + 1);
  expect(audioListeners.some(item => item.type === 'pointerdown')).toBe(true);
  expect(audioContext).not.toHaveBeenCalled();
  expect(nodeCreated).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Turn sounds on' })).toHaveAttribute('aria-pressed', 'false');
});