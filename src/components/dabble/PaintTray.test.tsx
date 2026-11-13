import { fireEvent, render, screen, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePaint } from './use-paint';
import { PaintTray } from './PaintTray';
vi.mock('./video-palette', () => ({ sampleSource: () => () => {}, sampleVideo: () => null }));
beforeEach(() => { localStorage.clear(); vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} }); });
function Tray({ ownerTools = false, defaultTrayOpen = false }: { ownerTools?: boolean; defaultTrayOpen?: boolean }) {
  const paint = usePaint({ current: null }, { current: null }, true, 'tray-test');
  return <PaintTray paint={paint} src="tray-test" ownerTools={ownerTools} sounds={false} toggleSounds={() => {}} automaticSound={() => {}} controlsState={{visible:true,paused:true}} onActivity={() => {}} />;
}
describe('tray state interactions', () => {
  it('initial reveal leaves painting inactive and focus untouched, and can close and reopen', () => {
    const previousFocus = document.activeElement;
    const { container, rerender } = render(<Tray defaultTrayOpen />);
    expect(container.querySelector('section')).toHaveAttribute('data-state', 'open');
    expect(document.activeElement).toBe(previousFocus);
    rerender(<Tray defaultTrayOpen={false} />);
    expect(container.querySelector('section')).toHaveAttribute('data-state', 'open');
    fireEvent.click(screen.getByRole('button', { name: 'Done painting' }));
    expect(container.querySelector('section')).toHaveAttribute('data-state', 'closed');
    fireEvent.click(screen.getByRole('button', { name: 'Start painting' }));
    expect(container.querySelector('section')).toHaveAttribute('data-state', 'open');
  });
  it('reserves copying for ownerTools', () => {
    const { rerender } = render(<Tray />);
    expect(screen.queryByRole('button', {name:'Copy painting code'})).toBeNull();
    rerender(<Tray ownerTools />);
    expect(screen.getByRole('button', {name:'Copy painting code'})).toBeEnabled();
  });
  it('clears immediately and Undo restores all strokes in one step', () => { render(<Tray defaultTrayOpen />); const clear=screen.getByRole('button',{name:'Blank canvas'}); fireEvent.click(screen.getByRole('button',{name:'Paint it for me'})); const saved=localStorage.getItem('dabble-painting:v1:tray-test'); fireEvent.click(clear); expect(JSON.parse(localStorage.getItem('dabble-painting:v1:tray-test') ?? '{}').strokes).toEqual([]); expect(clear).toHaveAttribute('aria-disabled','true'); clear.focus(); expect(clear).toHaveFocus(); fireEvent.click(screen.getByRole('button',{name:'Undo'})); expect(localStorage.getItem('dabble-painting:v1:tray-test')).toBe(saved); });
  it('opens on activation and Escape stops painting, tucks tools, and returns focus', () => {
    const {container} = render(<Tray />);
    fireEvent.click(screen.getByRole('button', { name: 'Done painting' }));
    expect(container.querySelector('section')).toHaveAttribute('data-state', 'closed');
    expect(screen.getByRole('group', {name:'Brush',hidden:true})).toHaveAttribute('inert');
    fireEvent.click(screen.getByRole('button', {name:'Start painting'}));
    expect(container.querySelector('section')).toHaveAttribute('data-state', 'open');
    fireEvent.keyDown(screen.getByRole('button', {name:'Medium brush'}), {key:'Escape'});
    expect(container.querySelector('section')).toHaveAttribute('data-state', 'closed');
    expect(screen.getByRole('button', {name:'Start painting'})).toHaveFocus();
  });
  it('hover and pointer leave never change an open tray, even after idle', () => {
    vi.useFakeTimers();
    const {container}=render(<Tray />); const tray=screen.getByRole('region',{name:'Paint tools'});
    fireEvent.pointerEnter(tray); fireEvent.pointerLeave(tray);
    act(()=>vi.advanceTimersByTime(10000));
    expect(container.querySelector('section')).toHaveAttribute('data-state','open');
    vi.useRealTimers();
  });
  it('hover and focus never reopen a closed tray', () => {
    const {container}=render(<Tray />);
    fireEvent.click(screen.getByRole('button',{name:'Done painting'}));
    fireEvent.pointerEnter(screen.getByRole('region',{name:'Paint tools'}));
    fireEvent.focus(screen.getByRole('button',{name:'Start painting'}));
    expect(container.querySelector('section')).toHaveAttribute('data-state','closed');
  });
  it('starts open again after unmounting regardless of the previous closed state', () => {
    const first=render(<Tray />);fireEvent.click(screen.getByRole('button',{name:'Done painting'}));first.unmount();
    const next=render(<Tray />);expect(next.container.querySelector('section')).toHaveAttribute('data-state','open');
  });

});
it('offers scene palette refresh without changing the six sampled colors', () => {
  const {container} = render(<Tray defaultTrayOpen />);
  fireEvent.click(screen.getByRole('button', { name: 'Take new paint colors from the current video scene' }));
  expect(container.querySelectorAll('.tray-color button')).toHaveLength(6);
});
