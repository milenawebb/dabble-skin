import { fireEvent, render, screen, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePaint } from './use-paint';
import { PaintTray } from './PaintTray';
vi.mock('./video-palette', () => ({ sampleSource: () => () => {}, sampleVideo: () => null }));
beforeEach(() => localStorage.clear());
function Tray({ ownerTools = false, defaultTrayOpen = false }: { ownerTools?: boolean; defaultTrayOpen?: boolean }) {
  const paint = usePaint({ current: null }, { current: null }, true, 'tray-test');
  return <PaintTray defaultTrayOpen={defaultTrayOpen} paint={paint} src="tray-test" ownerTools={ownerTools} sounds={false} toggleSounds={() => {}} automaticSound={() => {}} controlsState={{visible:true,paused:true}} onActivity={() => {}} />;
}
describe('tray state interactions', () => {
  it('initial reveal leaves painting inactive and focus untouched, and can close and reopen', () => {
    const previousFocus = document.activeElement;
    const { container, rerender } = render(<Tray defaultTrayOpen />);
    expect(container.querySelector('section')).toHaveAttribute('data-state', 'peek');
    expect(document.activeElement).toBe(previousFocus);
    rerender(<Tray defaultTrayOpen={false} />);
    expect(container.querySelector('section')).toHaveAttribute('data-state', 'peek');
    fireEvent.click(screen.getByRole('button', { name: 'Put the paints away' }));
    expect(container.querySelector('section')).toHaveAttribute('data-state', 'tucked');
    fireEvent.click(screen.getByRole('button', { name: 'Start painting' }));
    expect(container.querySelector('section')).toHaveAttribute('data-state', 'pinned');
  });
  it('reserves copying for ownerTools', () => {
    const { rerender } = render(<Tray />);
    fireEvent.click(screen.getByRole('button', {name:'Start painting'}));
    expect(screen.queryByRole('button', {name:'Copy painting code'})).toBeNull();
    rerender(<Tray ownerTools />);
    expect(screen.getByRole('button', {name:'Copy painting code'})).toBeEnabled();
  });
  it('requires confirmation, focuses Keep painting, and Escape preserves strokes', () => {
    const { container } = render(<Tray />);
    fireEvent.click(screen.getByRole('button', {name:'Start painting'}));
    fireEvent.click(screen.getByRole('button', {name:'Paint it for me'}));
    fireEvent.click(screen.getByRole('button', {name:'Start over'}));
    expect(screen.getByRole('button', {name:'Keep painting'})).toHaveFocus();
    fireEvent.keyDown(screen.getByRole('button', {name:'Keep painting'}), {key:'Escape'});
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', {name:'Start over'})).toHaveFocus();
    expect(container.querySelector('section')).toHaveAttribute('data-state','pinned');
    expect(JSON.parse(localStorage.getItem('dabble-painting:v1:tray-test') ?? '{}').strokes).toHaveLength(2);
  });
  it('Keep painting cancels and Yes restores the starting painting', () => {
    render(<Tray />);
    fireEvent.click(screen.getByRole('button', {name:'Start painting'}));
    fireEvent.click(screen.getByRole('button', {name:'Paint it for me'}));
    fireEvent.click(screen.getByRole('button', {name:'Start over'}));
    fireEvent.click(screen.getByRole('button', {name:'Keep painting'}));
    expect(JSON.parse(localStorage.getItem('dabble-painting:v1:tray-test') ?? '{}').strokes).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', {name:'Start over'}));
    fireEvent.click(screen.getByRole('button', {name:'Yes, start over'}));
    expect(JSON.parse(localStorage.getItem('dabble-painting:v1:tray-test') ?? '{}').strokes).toHaveLength(1);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('opens on activation and Escape stops painting, tucks tools, and returns focus', () => {
    const {container} = render(<Tray />);
    expect(container.querySelector('section')).toHaveAttribute('data-state', 'tucked');
    expect(screen.getByRole('group', {name:'Brush',hidden:true})).toHaveAttribute('inert');
    fireEvent.click(screen.getByRole('button', {name:'Start painting'}));
    expect(container.querySelector('section')).toHaveAttribute('data-state', 'pinned');
    fireEvent.keyDown(screen.getByRole('button', {name:'Medium brush'}), {key:'Escape'});
    expect(container.querySelector('section')).toHaveAttribute('data-state', 'tucked');
    expect(screen.getByRole('button', {name:'Start painting'})).toHaveFocus();
  });
  it('hover peeks without painting, then a selection pins', () => {
    const original = window.matchMedia;
    window.matchMedia = vi.fn().mockReturnValue({matches:true,addEventListener:vi.fn(),removeEventListener:vi.fn()});
    const {container} = render(<Tray />);
    fireEvent.pointerEnter(screen.getByRole('region', {name:'Paint tools'}));
    expect(container.querySelector('section')).toHaveAttribute('data-state','peek');
    expect(screen.getByRole('button', {name:'Start painting'})).toHaveAttribute('aria-expanded','true');
    fireEvent.click(container.querySelectorAll('.tray-color button')[2] ?? screen.getByRole('button', {name:'Start painting'}));
    expect(container.querySelector('section')).toHaveAttribute('data-state','pinned');
    expect(screen.getByRole('button', {name:'Put the paints away'})).toHaveAttribute('aria-expanded','true');
    window.matchMedia = original;
  });
  it('leaving a hover-only peek waits 600ms', () => {
    vi.useFakeTimers(); const original=window.matchMedia;
    window.matchMedia = vi.fn().mockReturnValue({matches:true,addEventListener:vi.fn(),removeEventListener:vi.fn()});
    const {container}=render(<Tray />); const tray=screen.getByRole('region',{name:'Paint tools'});
    fireEvent.pointerEnter(tray);fireEvent.pointerLeave(tray);
    act(()=>vi.advanceTimersByTime(599));expect(container.querySelector('section')).toHaveAttribute('data-state','peek');
    act(()=>vi.advanceTimersByTime(1));expect(container.querySelector('section')).toHaveAttribute('data-state','tucked');
    window.matchMedia=original;vi.useRealTimers();
  });
});