import { useEffect, useRef, useState, type RefObject } from 'react';
import { VIDEO_HINT_MS, draggedVideo } from './painting-discovery';
import { PaperLabel } from './PlayerLabels';
import './painting-guide.css';

export function PaintingGuide({ root, open }: { root: RefObject<HTMLDivElement | null>; open: boolean }) {
  const [visible, setVisible] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    setVisible(false);
    setAnnouncement(open ? 'Painting tools open. Drag on the frame around the video to paint.' : '');
    return () => clearTimeout(timer.current);
  }, [open]);
  useEffect(() => {
    const video = root.current?.querySelector('video');
    if (!video || !open) return;
    let start: { x: number; y: number; id: number } | undefined;
    let dragged = false;
    const down = (event: PointerEvent) => {
      if (event.button !== 0) return;
      start = { x: event.clientX, y: event.clientY, id: event.pointerId }; dragged = false;
    };
    const move = (event: PointerEvent) => {
      if (!start || start.id !== event.pointerId || dragged || !draggedVideo(start.x, start.y, event.clientX, event.clientY)) return;
      dragged = true; setVisible(true);
      clearTimeout(timer.current); timer.current = setTimeout(() => setVisible(false), VIDEO_HINT_MS);
    };
    const up = (event: PointerEvent) => {
      if (start?.id !== event.pointerId) return;
      if (dragged) { event.preventDefault(); event.stopImmediatePropagation(); }
      start = undefined;
    };
    const click = (event: MouseEvent) => { if (dragged) { event.preventDefault(); event.stopImmediatePropagation(); dragged = false; } };
    const cancel = () => { start = undefined; dragged = false; };
    video.addEventListener('pointerdown', down, true); video.addEventListener('pointermove', move, true);
    video.addEventListener('pointerup', up, true); video.addEventListener('click', click, true); video.addEventListener('pointercancel', cancel, true);
    return () => { video.removeEventListener('pointerdown', down, true); video.removeEventListener('pointermove', move, true); video.removeEventListener('pointerup', up, true); video.removeEventListener('click', click, true); video.removeEventListener('pointercancel', cancel, true); };
  }, [root, open]);
  return <><div className="painting-guide" aria-hidden="true" data-visible={visible || undefined}>
    <PaperLabel text="Paint on the frame around the video" />
  </div><span className="sr-only" role="status" aria-live="polite">{announcement}</span></>;
}
