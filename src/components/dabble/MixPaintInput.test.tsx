import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { MixPaintInput } from './MixPaintInput';
import { DEFAULT_PALETTE } from './painting-data';

it('activates video pick mode without selecting a paint', () => {
  const toggle = vi.fn();
  render(<MixPaintInput palette={DEFAULT_PALETTE} customColor={null} selected={false} picking={false} onToggle={toggle} />);
  fireEvent.click(screen.getByRole('button', { name: 'Pick a color from the video' }));
  expect(toggle).toHaveBeenCalledOnce();
});