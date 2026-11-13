import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { usePaint } from './use-paint';
import { PhonePaintPanel } from './PhonePaintPanel';
vi.mock('./video-palette', () => ({ sampleSource: () => () => {} }));
beforeEach(() => { localStorage.clear(); });
function Panel() {
  const paint = usePaint({ current: null }, { current: null }, true, 'phone-panel-test');
  return <PhonePaintPanel width={320} paint={paint} setHost={() => {}} sounds={false} toggleSounds={() => {}} automaticSound={() => {}} onActivity={() => {}} />;
}
it('starts in watching mode and Done restores watching with focus on the brush button', () => {
  const { container } = render(<Panel />);
  expect(container.querySelector('.phone-paint-panel')).toHaveAttribute('inert');
  fireEvent.click(screen.getByRole('button', { name: 'Start painting' }));
  expect(container.querySelector('.phone-watch-panel')).toHaveAttribute('inert');
  fireEvent.click(screen.getByRole('button', { name: 'Done painting' }));
  expect(container.querySelector('.phone-paint-panel')).toHaveAttribute('inert');
  expect(screen.getByRole('button', { name: 'Start painting' })).toHaveFocus();
});
it('Escape restores watching and returns focus to the brush button', () => {
  const { container } = render(<Panel />);
  fireEvent.click(screen.getByRole('button', { name: 'Start painting' }));
  fireEvent.keyDown(screen.getByRole('button', { name: 'Cubist brush' }), { key: 'Escape' });
  expect(container.querySelector('.phone-paint-panel')).toHaveAttribute('inert');
  expect(screen.getByRole('button', { name: 'Start painting' })).toHaveFocus();
});