import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { PaintingGuide } from './PaintingGuide';
beforeEach(() => { vi.useFakeTimers(); vi.stubGlobal('PointerEvent', MouseEvent); });
afterEach(() => vi.useRealTimers());
function mount(open = true) {
  const root = document.createElement('div'); const video = document.createElement('video'); root.appendChild(video);
  return { ...render(<PaintingGuide root={{current:root}} open={open} />), video };
}
const drag = (video: HTMLVideoElement) => {
  fireEvent.pointerDown(video, {button:0, clientX:100, clientY:100});
  fireEvent.pointerMove(video, {clientX:120, clientY:100});
};
it('shows no opening reminder or plain-click reminder', () => {
  const {container,video}=mount();
  fireEvent.pointerDown(video,{button:0,clientX:100,clientY:100});fireEvent.pointerUp(video);fireEvent.click(video);
  expect(container.querySelector('.painting-guide')).not.toHaveAttribute('data-visible');
});
it('shows the reminder only after a video drag with tools open and dismisses at 2000ms', () => {
  const {container,video}=mount();drag(video);
  expect(container.querySelector('.painting-guide')).toHaveAttribute('data-visible');
  act(()=>vi.advanceTimersByTime(1999));expect(container.querySelector('.painting-guide')).toHaveAttribute('data-visible');
  act(()=>vi.advanceTimersByTime(1));expect(container.querySelector('.painting-guide')).not.toHaveAttribute('data-visible');
});
it('does not respond to a video drag with tools closed', () => {
  const {container,video}=mount(false);drag(video);
  expect(container.querySelector('.painting-guide')).not.toHaveAttribute('data-visible');
});
