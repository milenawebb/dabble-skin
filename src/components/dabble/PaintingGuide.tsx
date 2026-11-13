import { useEffect, useRef, useState, type RefObject } from 'react';
import { BORDER_HINT_MS, VIDEO_HINT_MS, draggedVideo, hasPaintedBefore } from './painting-discovery';
import './painting-guide.css';

export function PaintingGuide({ root, open }: { root: RefObject<HTMLDivElement | null>; open: boolean }) {
  const [visible, setVisible] = useState(false);
  const [flash, setFlash] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const [bounds, setBounds] = useState({ width: 0, height: 0, x: 0, y: 0, vw: 0, vh: 0 });
  const learned = useRef(false);
  const announced = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    const canvas = root.current;
    const video = canvas?.querySelector('video');
    if (!canvas || !video) return;
    learned.current = hasPaintedBefore();
    const measure = () => {
      const c = canvas.getBoundingClientRect(), v = video.getBoundingClientRect();
      setBounds({ width: c.width, height: c.height, x: v.left-c.left, y: v.top-c.top, vw: v.width, vh: v.height });
    };
    const stroke = () => { learned.current = true; setVisible(false); clearTimeout(timer.current); };
    measure(); const observer = new ResizeObserver(measure); observer.observe(canvas); observer.observe(video);
    canvas.addEventListener('dabble-first-stroke', stroke);
    return () => { observer.disconnect(); canvas.removeEventListener('dabble-first-stroke', stroke); clearTimeout(timer.current); };
  }, [root]);
  useEffect(() => {
    if (!open) { setVisible(false); clearTimeout(timer.current); return; }
    if (!announced.current) { setAnnouncement('Painting tools open. Drag on the white border around the video to paint.'); announced.current = true; }
    if (learned.current) return;
    setVisible(true); timer.current = setTimeout(() => setVisible(false), BORDER_HINT_MS);
    return () => clearTimeout(timer.current);
  }, [open]);
  useEffect(() => {
    const canvas = root.current;
    const skin = canvas?.querySelector<HTMLElement>('.dabble-skin');
    if (!canvas || !skin || !open) return;
    let start: { x: number; y: number; id: number } | undefined;
    let dragged = false;
    const down = (event: PointerEvent) => {
      if (event.button !== 0 || (event.target as Element).closest('button, input, [role="slider"], .dabble-bar, [role="dialog"]')) return;
      start = { x: event.clientX, y: event.clientY, id: event.pointerId }; dragged = false;
    };
    const move = (event: PointerEvent) => {
      if (!start || start.id !== event.pointerId || dragged || !draggedVideo(start.x, start.y, event.clientX, event.clientY)) return;
      dragged = true; setFlash(value => value+1); setVisible(true);
      clearTimeout(timer.current); timer.current = setTimeout(() => setVisible(false), VIDEO_HINT_MS);
    };
    const up = (event: PointerEvent) => { if (dragged) { event.preventDefault(); event.stopImmediatePropagation(); } start = undefined; };
    const click = (event: MouseEvent) => { if (dragged) { event.preventDefault(); event.stopImmediatePropagation(); dragged = false; } };
    skin.addEventListener('pointerdown', down, true); skin.addEventListener('pointermove', move, true);
    skin.addEventListener('pointerup', up, true); skin.addEventListener('click', click, true);
    return () => { skin.removeEventListener('pointerdown', down, true); skin.removeEventListener('pointermove', move, true); skin.removeEventListener('pointerup', up, true); skin.removeEventListener('click', click, true); };
  }, [root, open]);
  const { width, height, x, y, vw, vh } = bounds;
  return <><div className="painting-guide" aria-hidden="true" data-visible={visible || undefined} data-small={width < 560 || undefined}>
    {width > 0 && <svg key={flash} className="painting-guide-outline" data-flash={flash > 0 || undefined} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none"><path d={`M4 5 Q${width/2} 2 ${width-5} 5 L${width-4} ${height-5} Q${width/2} ${height-2} 5 ${height-4} Z M${x-2} ${y-2} L${x+vw+2} ${y-3} L${x+vw+3} ${y+vh+2} L${x-3} ${y+vh+3} Z`} /></svg>}
    <span className="painting-guide-tag" style={{ bottom: `calc(100% - ${Math.max(0,y-2)}px)` }}><span className="painting-guide-long">Drag on the white border to paint</span><span className="painting-guide-short">Paint the border</span></span>
  </div><span className="sr-only" role="status" aria-live="polite">{announcement}</span></>;
}