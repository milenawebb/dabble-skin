import { act, render, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRef } from 'react';
import { useBrushFeedback } from './use-brush-feedback';

const sound = vi.hoisted(() => ({ start: vi.fn(), move: vi.fn(), stop: vi.fn() }));
vi.mock('./sounds', () => ({ createBrushSound: () => sound }));
function Harness({ enabled = true, painting = true }: { enabled?: boolean; painting?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useBrushFeedback(ref, enabled, painting, 'imp');
  return <div ref={ref}><video /><canvas className="dabble-paint" /></div>;
}
function pointer(target: Element, type: string) {
  const event = { target, isTrusted: true, button: 0, pointerId: 1, clientX: 20, clientY: 30, timeStamp: 10 };
  act(() => { callbacks.get(type)?.(event); });
}
const callbacks = new Map<string, (event: unknown) => void>();
beforeEach(() => {
  callbacks.clear();
  const add = EventTarget.prototype.addEventListener;
  vi.spyOn(EventTarget.prototype, 'addEventListener').mockImplementation(function(this: EventTarget, type, listener, options) {
    if (['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'lostpointercapture'].includes(type) && typeof listener === 'function' && options === true) callbacks.set(type, listener as (event: unknown) => void);
    add.call(this, type, listener, options);
  });
  const windowAdd = window.addEventListener;
  vi.spyOn(window, 'addEventListener').mockImplementation((type, listener, options) => {
    if ((type === 'pointerup' || type === 'pointercancel') && typeof listener === 'function') callbacks.set(type, listener as (event: unknown) => void);
    windowAdd.call(window, type, listener, options);
  });
});
afterEach(() => { vi.clearAllMocks(); vi.restoreAllMocks(); });
describe('brush audio lifecycle', () => {
  it.each(['pointerup', 'pointercancel', 'lostpointercapture'])('stops on %s', event => {
    const { container } = render(<Harness />);
    const canvas = container.querySelector('canvas'); if (!canvas) throw new Error('Missing canvas');
    pointer(canvas, 'pointerdown'); pointer(canvas, 'pointermove'); pointer(canvas, event);
    expect(sound.start).toHaveBeenCalledOnce(); expect(sound.move).toHaveBeenCalledOnce(); expect(sound.stop).toHaveBeenCalledWith();
  });
  it.each(['painting', 'enabled'])('stops immediately when %s turns off', option => {
    const { container, rerender } = render(<Harness />);
    const canvas = container.querySelector('canvas'); if (!canvas) throw new Error('Missing canvas');
    pointer(canvas, 'pointerdown'); rerender(<Harness {...{ [option]: false }} />);
    expect(sound.stop).toHaveBeenCalledWith(true);
  });
  it('stops when hidden and on unmount', () => {
    const { container, unmount } = render(<Harness />);
    const canvas = container.querySelector('canvas'); if (!canvas) throw new Error('Missing canvas');
    pointer(canvas, 'pointerdown');
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    fireEvent(document, new Event('visibilitychange')); expect(sound.stop).toHaveBeenCalledWith(true);
    sound.stop.mockClear(); unmount(); expect(sound.stop).toHaveBeenCalledWith(true);
  });
  it('is silent while muted and stops immediately on mute', () => {
    const { container } = render(<Harness />);
    const canvas = container.querySelector('canvas'), video = container.querySelector('video'); if (!canvas || !video) throw new Error('Missing media');
    video.muted = true; pointer(canvas, 'pointerdown'); expect(sound.start).not.toHaveBeenCalled();
    video.muted = false; pointer(canvas, 'pointerdown'); expect(sound.start).toHaveBeenCalledOnce();
    video.muted = true; fireEvent(video, new Event('volumechange')); expect(sound.stop).toHaveBeenCalledWith(true);
  });
  it('creates no voice with Sounds off', () => {
    const { container } = render(<Harness enabled={false} />);
    const canvas = container.querySelector('canvas'); if (!canvas) throw new Error('Missing canvas');
    pointer(canvas, 'pointerdown'); pointer(canvas, 'pointermove'); expect(sound.start).not.toHaveBeenCalled(); expect(sound.move).not.toHaveBeenCalled();
  });
});