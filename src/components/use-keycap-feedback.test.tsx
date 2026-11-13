import { act, renderHook } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { useKeycapFeedback } from './use-keycap-feedback';

it('keeps decorative pointer paint for 800ms without invoking a player action', () => {
  vi.useFakeTimers();
  const root = document.createElement('div');
  const action = vi.fn();
  root.addEventListener('click', action);
  const { result, unmount } = renderHook(() => useKeycapFeedback({ current: root }, false));
  act(() => result.current.dab('Space or K'));
  act(() => vi.advanceTimersByTime(799));
  expect(result.current.active.has('Space or K')).toBe(true);
  act(() => vi.advanceTimersByTime(1));
  expect(result.current.active.has('Space or K')).toBe(false);
  expect(action).not.toHaveBeenCalled();
  unmount();
  vi.useRealTimers();
});

it('cleans up feedback on remount and stays usable when sound preference changes', () => {
  vi.useFakeTimers();
  const player = { current: document.createElement('div') };
  const first = renderHook(() => useKeycapFeedback(player, false));
  act(() => first.result.current.dab('P'));
  first.unmount();
  expect(vi.getTimerCount()).toBe(0);
  const next = renderHook(({ optedIn }) => useKeycapFeedback(player, optedIn), { initialProps: { optedIn: false } });
  expect(next.result.current.active.size).toBe(0);
  next.rerender({ optedIn: true });
  act(() => next.result.current.dab('P'));
  expect(next.result.current.active.has('P')).toBe(true);
  act(() => vi.advanceTimersByTime(800));
  expect(next.result.current.active.size).toBe(0);
  next.unmount();
  vi.useRealTimers();
});