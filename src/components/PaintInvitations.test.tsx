import { act, render, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { PaintInvitations } from './PaintInvitations';
import { PAINT_INVITATION_KEY } from './paint-invitation-rules';

afterEach(() => { cleanup(); localStorage.clear(); vi.useRealTimers(); vi.unstubAllGlobals(); });
function setup() {
  vi.useFakeTimers();
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  vi.stubGlobal('PointerEvent', MouseEvent);
  const root = document.createElement('div');
  root.innerHTML = '<div class="dabble-canvas" data-painting="true"><canvas class="dabble-paint"></canvas></div><button aria-label="Blank canvas"></button><button aria-label="Start painting"></button>';
  const view = render(<PaintInvitations player={{ current: root }} />);
  return { root, view };
}
it.each(['.dabble-paint', '[aria-label="Start painting"]', '[aria-label="Blank canvas"]'])('dismisses on %s for this and later visits', selector => {
  const { root, view } = setup();
  expect(view.container.childElementCount).toBe(1);
  act(() => root.querySelector(selector)?.dispatchEvent(new MouseEvent(selector === '.dabble-paint' ? 'pointerdown' : 'click', { bubbles: true })));
  expect(localStorage.getItem(PAINT_INVITATION_KEY)).toBe('dismissed');
  act(() => vi.advanceTimersByTime(399));
  expect(view.container.childElementCount).toBe(1);
  act(() => vi.advanceTimersByTime(1));
  expect(view.container.childElementCount).toBe(0);
  view.unmount();
  const next = render(<PaintInvitations player={{ current: root }} />);
  expect(next.container.childElementCount).toBe(0);
});