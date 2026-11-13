import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { MixPaintInput } from './MixPaintInput';
import { DEFAULT_PALETTE } from './painting-data';

it('refreshes the six paints with one press', () => {
  const toggle = vi.fn();
  render(<MixPaintInput palette={DEFAULT_PALETTE} onRefresh={toggle} />);
  fireEvent.click(screen.getByRole('button', { name: 'Take new paint colors from the current video scene' }));
  expect(toggle).toHaveBeenCalledOnce();
});