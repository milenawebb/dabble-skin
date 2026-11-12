import { fireEvent, render, screen, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { usePaint } from './use-paint';
import { PaintTray } from './PaintTray';
vi.mock('./video-palette', () => ({ sampleSource: () => () => {}, sampleVideo: () => null }));
function Tray() {
  const paint = usePaint({ current: null }, { current: null }, true, 'tray-test');
  return <PaintTray paint={paint} src="tray-test" sounds={false} toggleSounds={() => {}} automaticSound={() => {}} controlsState={{visible:true,paused:true}} onActivity={() => {}} />;
}
describe('tray state interactions', () => {
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
    expect(screen.getByRole('button', {name:'Start painting'})).toHaveAttribute('aria-pressed','false');
    fireEvent.click(screen.getByRole('button', {name:'Paint color 3'}));
    expect(container.querySelector('section')).toHaveAttribute('data-state','pinned');
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