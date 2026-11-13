import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { PaintingGuide } from './PaintingGuide';
import { rememberFirstStroke } from './painting-discovery';
beforeEach(() => { localStorage.clear(); vi.useFakeTimers(); vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} }); });
afterEach(() => vi.useRealTimers());
function mount(open = true) {
  const root = document.createElement('div'); root.appendChild(document.createElement('video'));
  return render(<PaintingGuide root={{current:root}} open={open} />);
}
it('dismisses opening guidance after three seconds', () => {
  const {container}=mount(); expect(container.querySelector('.painting-guide')).toHaveAttribute('data-visible');
  act(()=>vi.advanceTimersByTime(2999)); expect(container.querySelector('.painting-guide')).toHaveAttribute('data-visible');
  act(()=>vi.advanceTimersByTime(1)); expect(container.querySelector('.painting-guide')).not.toHaveAttribute('data-visible');
});
it('does not show opening guidance after a previously remembered manual stroke', () => {
  rememberFirstStroke(); const {container}=mount(); expect(container.querySelector('.painting-guide')).not.toHaveAttribute('data-visible');
});