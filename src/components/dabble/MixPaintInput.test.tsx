import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { MixPaintInput } from './MixPaintInput';
import { DEFAULT_PALETTE } from './painting-data';

it('sends live input colors immediately', () => {
  const onPick = vi.fn();
  render(<MixPaintInput palette={DEFAULT_PALETTE} customColor={null} selected={false} onPick={onPick} />);
  fireEvent.input(screen.getByLabelText('Mix your own color'), { target: { value: '#123456' } });
  expect(onPick).toHaveBeenCalledWith('#123456');
});
it('sends the final changed color', () => {
  const onPick = vi.fn();
  render(<MixPaintInput palette={DEFAULT_PALETTE} customColor={null} selected={false} onPick={onPick} />);
  fireEvent.change(screen.getByLabelText('Mix your own color'), { target: { value: '#abcdef' } });
  expect(onPick).toHaveBeenCalledWith('#abcdef');
});
it.each(['Enter', ' '])('activates the native input with %s', key => {
  render(<MixPaintInput palette={DEFAULT_PALETTE} customColor={null} selected={false} onPick={() => {}} />);
  const input = screen.getByLabelText('Mix your own color');
  const activate = vi.spyOn(input, 'click');
  fireEvent.keyDown(input, { key });
  expect(activate).toHaveBeenCalledTimes(1);
});