import { useEffect, useRef, useState, type RefObject } from 'react';
import { colorName } from './palette';
import { fittedVideoRect } from './caption-rules';
import { liveVideoColor, movePickPoint, pickPoint, readVideoColor, type PickPoint } from './video-color-pick';

export function useVideoColorPicker(root: RefObject<HTMLDivElement | null>, playbackId: string | undefined, onPick: (color: string) => void) {
  const [picking, setPicking] = useState(false);
  const [message, setMessage] = useState('');
  const [point, setPoint] = useState<PickPoint>({ x: .5, y: .5 });
  const [preview, setPreview] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const [bounds, setBounds] = useState({ left: 0, top: 0, width: 0, height: 0, phone: false });
  const active = useRef(false), busy = useRef(false), sequence = useRef(0), suppressed = useRef(false);
  const callback = useRef(onPick); callback.current = onPick;
  const pointRef = useRef(point); pointRef.current = point;
  const cancel = () => { active.current = false; busy.current = false; sequence.current++; setPicking(false); setMessage('Pick mode canceled.'); };
  const toggle = () => {
    if (active.current) { cancel(); return; }
    active.current = true; pointRef.current = { x: .5, y: .5 }; setPoint(pointRef.current); setPreview(null); setKeyboard(true); setShowPreview(true); setPicking(true);
    setMessage('Pick mode. Tap the video, or use the arrow keys and Enter.');
  };
  useEffect(() => {
    const canvas = root.current, video = canvas?.querySelector('video');
    if (!canvas || !video) return;
    const measure = () => { const c = canvas.getBoundingClientRect(), v = fittedVideoRect(video.getBoundingClientRect(), video.videoWidth, video.videoHeight); setBounds({ left: v.left - c.left, top: v.top - c.top, width: v.width, height: v.height, phone: c.width < 420 }); };
    measure(); const observer = new ResizeObserver(measure); observer.observe(canvas); observer.observe(video);
    video.addEventListener('loadedmetadata', measure); window.addEventListener('resize', measure);
    const choose = async (at: PickPoint) => {
      if (busy.current) return;
      busy.current = true; const request = ++sequence.current;
      const result = await readVideoColor(video, at, playbackId);
      if (!active.current || sequence.current !== request) return;
      busy.current = false;
      if (!result) { setMessage('Could not read this color. Try another spot.'); return; }
      callback.current(result.color); active.current = false; setPicking(false);
      canvas.dataset['lastPickSource'] = result.source;
      setMessage(`Picked ${colorName(result.color).toLowerCase()}.`);
    };
    const block = (event: Event) => { event.preventDefault(); event.stopImmediatePropagation(); };
    const down = (event: PointerEvent) => {
      suppressed.current = false;
      if (!active.current || event.button !== 0) return;
      if (event.target instanceof Element && event.target.closest('[data-video-color-toggle]')) return;
      suppressed.current = true; block(event);
      const at = event.target === video ? pickPoint(video, event.clientX, event.clientY) : null;
      if (at) { setPoint(at); void choose(at); } else cancel();
    };
    const up = (event: PointerEvent) => { if (suppressed.current) block(event); };
    const click = (event: MouseEvent) => { if (suppressed.current) { suppressed.current = false; block(event); } };
    let lastPreview = 0;
    const move = (event: PointerEvent) => {
      if (!active.current || event.pointerType !== 'mouse') return;
      const at = pickPoint(video, event.clientX, event.clientY);
      if (!at) { setShowPreview(false); return; }
      setPoint(at); setKeyboard(false); setShowPreview(true);
      if (performance.now() - lastPreview < 50) return;
      lastPreview = performance.now(); setPreview(liveVideoColor(video, at));
    };
    const key = (event: KeyboardEvent) => {
      if (!active.current) return;
      if (event.key === 'Escape') { block(event); cancel(); }
      else if (event.key.startsWith('Arrow')) {
        block(event); const v = fittedVideoRect(video.getBoundingClientRect(), video.videoWidth, video.videoHeight);
        const next = movePickPoint(pointRef.current, event.key, event.shiftKey, v.width, v.height);
        pointRef.current = next; setPoint(next); setKeyboard(true); setShowPreview(true); setPreview(liveVideoColor(video, next));
      } else if (event.key === 'Enter') { block(event); setKeyboard(true); void choose(pointRef.current); }
      else if (event.key === 'Tab') cancel();
      else if (event.key === ' ' && !(event.target instanceof Element && event.target.closest('[data-video-color-toggle]'))) block(event);
    };
    document.addEventListener('pointerdown', down, true); document.addEventListener('pointerup', up, true); document.addEventListener('click', click, true); document.addEventListener('pointermove', move, true); document.addEventListener('keydown', key, true);
    return () => { sequence.current++; observer.disconnect(); video.removeEventListener('loadedmetadata', measure); window.removeEventListener('resize', measure); document.removeEventListener('pointerdown', down, true); document.removeEventListener('pointerup', up, true); document.removeEventListener('click', click, true); document.removeEventListener('pointermove', move, true); document.removeEventListener('keydown', key, true); };
  }, [root, playbackId]);
  useEffect(() => { const canvas = root.current; if (!canvas) return; if (picking) canvas.dataset['picking'] = 'true'; else delete canvas.dataset['picking']; }, [picking, root]);
  return { picking, toggle, message, point, preview, showPreview, keyboard, bounds };
}