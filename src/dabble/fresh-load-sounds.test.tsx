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

it.each([320, 390])('blocks touch scrolling only during a captured phone stroke at %ipx', width => {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({ x: 0, y: 0, left: 0, top: 0, right: width, bottom: 240, width, height: 240, toJSON: () => ({}) });
  const setStyle = vi.spyOn(CSSStyleDeclaration.prototype, 'setProperty');
  const readStyle = CSSStyleDeclaration.prototype.getPropertyValue;
  vi.spyOn(CSSStyleDeclaration.prototype, 'getPropertyValue').mockImplementation(function (this: CSSStyleDeclaration, name) { return name === 'overscroll-behavior' ? 'contain' : readStyle.call(this, name); });
  const capture = vi.fn(); HTMLCanvasElement.prototype.setPointerCapture = capture;
  const { container } = render(<DabblePlayer src="phone-scroll.mp4" />);
  fireEvent.click(screen.getByRole('button', { name: 'Start painting' }));
  const canvas = container.querySelector('.dabble-paint');
  if (!canvas) throw new Error('Missing painting layer');
  const touch = (type: string) => {
    const event = new Event(type, { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'changedTouches', { value: [{ identifier: 1 }] });
    canvas.dispatchEvent(event); return event;
  };
  fireEvent.pointerDown(canvas, { button: 0, clientX: 5, clientY: 5 });
  expect(capture).toHaveBeenCalledOnce();
  expect(touch('touchstart').defaultPrevented).toBe(true);
  expect(setStyle).toHaveBeenCalledWith('overscroll-behavior', 'none', 'important');
  expect(touch('touchmove').defaultPrevented).toBe(true);
  const outsideMove = new Event('touchmove', { cancelable: true }); document.dispatchEvent(outsideMove);
  expect(outsideMove.defaultPrevented).toBe(false);
  fireEvent.pointerMove(canvas, { clientX: width + 30, clientY: 20 });
  fireEvent.pointerUp(canvas);
  touch('touchend');
  expect(setStyle).toHaveBeenCalledWith('overscroll-behavior', 'contain', '');
  expect(touch('touchmove').defaultPrevented).toBe(false);
  document.documentElement.style.removeProperty('overscroll-behavior');
});

it('does not suppress page scrolling for a desktop stroke', () => {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({ x: 0, y: 0, left: 0, top: 0, right: 1056, bottom: 700, width: 1056, height: 700, toJSON: () => ({}) });
  const { container } = render(<DabblePlayer src="desktop-scroll.mp4" />);
  const wrapper = container.querySelector('.dabble-canvas');
  const canvas = container.querySelector('.dabble-paint');
  if (!wrapper || !canvas) throw new Error('Missing painting layer');
  wrapper.removeAttribute('data-phone');
  fireEvent.click(screen.getByRole('button', { name: 'Start painting' }));
  fireEvent.pointerDown(canvas, { button: 0, clientX: 5, clientY: 5 });
  const move = new Event('touchmove', { cancelable: true }); document.dispatchEvent(move);
  expect(move.defaultPrevented).toBe(false);
  fireEvent.pointerUp(canvas);
});