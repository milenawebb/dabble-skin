import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { DabblePlayer } from './DabblePlayer';

vi.mock('@videojs/react/video', () => ({ VideoPlayer: ({children}: {children: ReactNode}) => <>{children}</>, Video: () => <video /> }));
vi.mock('@videojs/react/media/mux-video', () => ({ MuxVideo: () => <video /> }));
vi.mock('./DabbleSkin', () => ({ DabbleSkin: ({children}: {children: ReactNode}) => <div>{children}</div> }));
const trayProps = vi.hoisted(() => vi.fn());
vi.mock('./PaintTray', () => ({ PaintTray: (props: {ownerTools: boolean; defaultTrayOpen: boolean}) => { trayProps(props); return <div role="region" aria-label="Paint tools">{props.ownerTools && <span>Owner tools</span>}</div>; } }));
vi.mock('./use-paint', () => ({ usePaint: () => ({ size:20, palette:['#000000'], color:0, brush:'rib', painting:false, setPainting: vi.fn(), count:1 }) }));
const feedback = vi.hoisted(() => vi.fn());
const unlock = vi.hoisted(() => vi.fn());
vi.mock('./use-feedback', () => ({ useFeedback: (...args: unknown[]) => { feedback(...args); return () => {}; } }));
vi.mock('./sounds', () => ({ unlockSound: unlock, setSoundsEnabled: vi.fn() }));
vi.mock('./use-brush-cursor', () => ({ useBrushCursor: () => {} }));
vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });

beforeEach(() => { localStorage.clear(); unlock.mockClear(); });

describe('painting defaults', () => {
  it('enables the viewer tray by default and excludes owner tools', () => {
    render(<DabblePlayer src="sample.mp4" />);
    expect(screen.getByRole('region', {name:'Paint tools'})).toBeInTheDocument();
    expect(screen.queryByText('Owner tools')).toBeNull();
  });
  it('removes the entire tray when paintable is false', () => {
    render(<DabblePlayer src="sample.mp4" paintable={false} ownerTools />);
    expect(screen.queryByRole('region', {name:'Paint tools'})).toBeNull();
  });
  it('passes explicit ownerTools to the tray', () => {
    render(<DabblePlayer src="sample.mp4" ownerTools />);
    expect(screen.getByText('Owner tools')).toBeInTheDocument();
  });
});
 describe('sound consent', () => {
  it('defaults off without storage even when the old sounds prop is supplied', () => {
    render(<DabblePlayer sounds />);
    expect(trayProps.mock.lastCall?.[0].sounds).toBe(false);
    expect(feedback.mock.lastCall?.[1]).toBe(false);
    expect(unlock).not.toHaveBeenCalled();
  });
  it('restores a stored off choice without activating audio', () => {
    localStorage.setItem('dabble-sounds-v2', 'off'); render(<DabblePlayer />);
    expect(trayProps.mock.lastCall?.[0].sounds).toBe(false); expect(unlock).not.toHaveBeenCalled();
  });
  it('remembers explicit on consent without activating audio on load', () => {
    localStorage.setItem('dabble-sounds-v2', 'on');
    const changed = vi.fn(); render(<DabblePlayer onSoundPreferenceChange={changed} />);
    expect(trayProps.mock.lastCall?.[0].sounds).toBe(true);
    expect(changed).toHaveBeenLastCalledWith(true);
    expect(unlock).not.toHaveBeenCalled();
  });
  it('discards earlier sound-on consent and starts silent for returning visitors', () => {
    localStorage.setItem('dabble-sounds', 'on');
    render(<DabblePlayer />);
    expect(trayProps.mock.lastCall?.[0].sounds).toBe(false);
    expect(localStorage.getItem('dabble-sounds')).toBeNull();
    expect(unlock).not.toHaveBeenCalled();
  });
  it('unlocks only when switched on and persists both choices', () => {
    render(<DabblePlayer />);
    act(() => trayProps.mock.lastCall?.[0].toggleSounds());
    expect(unlock).toHaveBeenCalledOnce(); expect(localStorage.getItem('dabble-sounds-v2')).toBe('on');
    act(() => trayProps.mock.lastCall?.[0].toggleSounds());
    expect(unlock).toHaveBeenCalledOnce(); expect(localStorage.getItem('dabble-sounds-v2')).toBe('off');
  });
 });
