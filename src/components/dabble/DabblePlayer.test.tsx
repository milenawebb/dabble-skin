import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { DabblePlayer } from './DabblePlayer';

vi.mock('@videojs/react/video', () => ({ VideoPlayer: ({children}: {children: ReactNode}) => <>{children}</>, Video: () => <video /> }));
vi.mock('@videojs/react/media/mux-video', () => ({ MuxVideo: () => <video /> }));
vi.mock('./DabbleSkin', () => ({ DabbleSkin: ({children}: {children: ReactNode}) => <div>{children}</div> }));
vi.mock('./PaintTray', () => ({ PaintTray: ({ownerTools}: {ownerTools: boolean}) => <div role="region" aria-label="Paint tools">{ownerTools && <span>Owner tools</span>}</div> }));
vi.mock('./use-paint', () => ({ usePaint: () => ({ size:20, palette:['#000000'], color:0, brush:'rib', painting:false, count:1 }) }));
vi.mock('./use-feedback', () => ({ useFeedback: () => () => {} }));
vi.mock('./use-brush-cursor', () => ({ useBrushCursor: () => {} }));
vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });

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