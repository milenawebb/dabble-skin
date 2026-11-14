import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { DabblePlayer } from './DabblePlayer';

vi.mock('@videojs/react/video', () => ({ VideoPlayer: ({children}: {children: ReactNode}) => <>{children}</>, Video: () => <video /> }));
vi.mock('@videojs/react/media/mux-video', () => ({ MuxVideo: () => <video /> }));
const skinProps = vi.hoisted(() => vi.fn());
vi.mock('./DabbleSkin', () => ({ DabbleSkin: (props: {children: ReactNode; painting: boolean}) => { skinProps(props); return <div>{props.children}</div>; } }));
vi.mock('./PhonePaintPanel', () => ({ PhonePaintPanel: ({paint}: {paint: {painting: boolean}}) => <div role="region" aria-label="Phone controls" data-painting={String(paint.painting)} /> }));
const trayProps = vi.hoisted(() => vi.fn());
vi.mock('./PaintTray', () => ({ PaintTray: (props: {ownerTools: boolean; defaultTrayOpen: boolean}) => { trayProps(props); return <div role="region" aria-label="Paint tools">{props.ownerTools && <span>Owner tools</span>}</div>; } }));
const setPainting = vi.hoisted(() => vi.fn());
vi.mock('./use-paint', () => ({ usePaint: () => ({ size:20, palette:['#000000'], color:0, brush:'rib', painting:false, setPainting, count:1 }) }));
const feedback = vi.hoisted(() => vi.fn());
const unlock = vi.hoisted(() => vi.fn());
vi.mock('./use-feedback', () => ({ useFeedback: (...args: unknown[]) => { feedback(...args); return () => {}; } }));
vi.mock('./sounds', () => ({ unlockSound: unlock, setSoundsEnabled: vi.fn() }));
vi.mock('./use-brush-cursor', () => ({ useBrushCursor: () => {} }));
vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });

beforeEach(() => { localStorage.clear(); unlock.mockClear(); trayProps.mockClear(); skinProps.mockClear(); setPainting.mockClear(); });

describe('initial tray state by measured player width', () => {
  it.each([390, 768, 1100])('starts closed without the prop at %ipx', width => {
    const rect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({width, height:400, left:0, top:0} as DOMRect);
    const {unmount} = render(<DabblePlayer />);
    expect(skinProps.mock.lastCall?.[0].painting).toBe(false);
    if (width >= 420) expect(trayProps.mock.lastCall?.[0].defaultTrayOpen).toBe(false);
    else expect(screen.getByRole('region',{name:'Phone controls'})).toHaveAttribute('data-painting','false');
    expect(setPainting).toHaveBeenLastCalledWith(false);
    unmount(); rect.mockRestore();
  });
  it.each([768, 1100])('honors an explicit open request at %ipx', width => {
    const rect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({width, height:400, left:0, top:0} as DOMRect);
    const {unmount} = render(<DabblePlayer defaultTrayOpen />);
    expect(trayProps.mock.lastCall?.[0].defaultTrayOpen).toBe(true);
    expect(skinProps.mock.lastCall?.[0].painting).toBe(true);
    unmount(); rect.mockRestore();
  });
  it('starts phones watching even with an explicit open request', () => {
    const rect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({width:390, height:220, left:0, top:0} as DOMRect);
    const {unmount} = render(<DabblePlayer defaultTrayOpen />);
    expect(screen.getByRole('region',{name:'Phone controls'})).toHaveAttribute('data-painting','false');
    expect(skinProps.mock.lastCall?.[0].painting).toBe(false);
    expect(setPainting).toHaveBeenLastCalledWith(false);
    unmount(); rect.mockRestore();
  });
});

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
  it('defaults off without storage when sounds is omitted', () => {
    render(<DabblePlayer />);
    expect(trayProps.mock.lastCall?.[0].sounds).toBe(false);
    expect(feedback.mock.lastCall?.[1]).toBe(false);
    expect(unlock).not.toHaveBeenCalled();
  });
  it('honors the demo sound default without unlocking audio or implying explicit opt-in', () => {
    const changed = vi.fn();
    render(<DabblePlayer sounds onSoundPreferenceChange={changed} />);
    expect(trayProps.mock.lastCall?.[0].sounds).toBe(true);
    expect(feedback.mock.lastCall?.[1]).toBe(true);
    expect(changed).toHaveBeenLastCalledWith(false);
    expect(unlock).not.toHaveBeenCalled();
  });
  it('lets saved off override the demo default after a one-press opt-out and remount', () => {
    const { unmount } = render(<DabblePlayer sounds />);
    act(() => trayProps.mock.lastCall?.[0].toggleSounds());
    expect(trayProps.mock.lastCall?.[0].sounds).toBe(false);
    expect(localStorage.getItem('dabble-sounds-v2')).toBe('off');
    unmount();
    render(<DabblePlayer sounds />);
    expect(trayProps.mock.lastCall?.[0].sounds).toBe(false);
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
