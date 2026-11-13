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