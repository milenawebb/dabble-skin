import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { DabblePlayer } from './DabblePlayer';

vi.mock('@videojs/react/video', () => ({ VideoPlayer: ({children}: {children: ReactNode}) => <>{children}</>, Video: () => <video /> }));
vi.mock('@videojs/react/media/mux-video', () => ({ MuxVideo: () => <video /> }));
vi.mock('./DabbleSkin', () => ({ DabbleSkin: ({children}: {children: ReactNode}) => <div>{children}</div> }));
const trayProps = vi.hoisted(() => vi.fn());
vi.mock('./PaintTray', () => ({ PaintTray: (props: {ownerTools: boolean; defaultTrayOpen: boolean}) => { trayProps(props); return <div role="region" aria-label="Paint tools">{props.ownerTools && <span>Owner tools</span>}</div>; } }));
vi.mock('./use-paint', () => ({ usePaint: () => ({ size:20, palette:['#000000'], color:0, brush:'rib', painting:false, count:1 }) }));
vi.mock('./use-feedback', () => ({ useFeedback: () => () => {} }));
vi.mock('./use-brush-cursor', () => ({ useBrushCursor: () => {} }));
vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });

describe('painting defaults', () => {
  it('defaults the tray closed and forwards the explicit initial-open option', () => {
    const { rerender } = render(<DabblePlayer src="sample.mp4" />);
    expect(trayProps.mock.lastCall?.[0].defaultTrayOpen).toBe(false);
    rerender(<DabblePlayer src="sample.mp4" defaultTrayOpen />);
    expect(trayProps.mock.lastCall?.[0].defaultTrayOpen).toBe(true);
  });
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