import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { brushLabelPosition } from './brush-label';
import './player-labels.css';

export function shortPlayerLabel(name: string) {
  if (name.startsWith('Your color')) return 'Your color';
  if (name === 'Pick a color from the video') return 'Pick from video';
  if (name === 'Turn sounds on') return 'Sounds off';
  if (name === 'Turn sounds off') return 'Sounds on';
  if (name === 'Start painting') return 'Paint the frame';
  if (name === 'Done painting') return 'Done';
  if (name === 'Keyboard shortcuts') return 'Keys';
  return name.replace(/ brush$/, '').replace(/ paint(?= \d|$)/, '');
}

export function PaperLabel({ text }: { text: string }) {
  return <span className="player-paper-label" aria-hidden="true">{text}</span>;
}

export function PlayerLabels({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const hovered = useRef<HTMLButtonElement | null>(null);
  const focused = useRef<HTMLButtonElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [target, setTarget] = useState<HTMLButtonElement | null>(null);
  const [host, setHost] = useState<Element | null>(null);
  const [visible, setVisible] = useState(false);
  const fallback = () => {
    const scope = root.current;
    return scope?.querySelector<HTMLButtonElement>('.paint-tray:not([data-state="tucked"]) .tray-brush button[aria-pressed="true"], .phone-panel[data-painting] .phone-upright-brush[aria-pressed="true"]') ?? null;
  };
  const restore = () => setTarget(hovered.current ?? focused.current ?? fallback());
  const buttonFor = (element: EventTarget | null) => {
    const button = element instanceof Element ? element.closest<HTMLButtonElement>('button[aria-label]') : null;
    return button?.closest('.paint-tray, .phone-panel, .dabble-skin') ? button : null;
  };
  useEffect(() => {
    const scope = root.current;
    if (!scope) return;
    const observer = new MutationObserver(restore);
    observer.observe(scope, { subtree: true, attributes: true, attributeFilter: ['aria-pressed', 'data-state', 'data-painting'], childList: true });
    const fullscreen = () => { setHost(document.fullscreenElement ?? document.body); restore(); };
    fullscreen();
    document.addEventListener('fullscreenchange', fullscreen);
    return () => { observer.disconnect(); clearTimeout(timer.current); document.removeEventListener('fullscreenchange', fullscreen); };
  }, []);
  useEffect(() => {
    setVisible(false);
    if (!target) return;
    let frame = 0;
    const measure = () => {
      const node = label.current;
      if (!node) { frame = requestAnimationFrame(measure); return; }
      const box = target.getBoundingClientRect();
      const tag = node.getBoundingClientRect();
      const hidden = target.closest('[inert]') || !target.getClientRects().length || box.bottom < 0 || box.top > innerHeight || (document.fullscreenElement && !document.fullscreenElement.contains(target));
      let left = Math.max(4, Math.min(innerWidth - tag.width - 4, box.left + (box.width - tag.width) / 2));
      let top = Math.max(4, box.top - tag.height - 8);
      const tray = target.closest('.paint-tray');
      const drawing = target.querySelector('.tray-brush-drawing');
      if (tray && drawing) {
        const bounds = tray.getBoundingClientRect();
        const obstacles = Array.from(tray.querySelectorAll('.tray-brush-drawing, .tray-item:not(.tray-brush) > button')).map(e => e.getBoundingClientRect());
        const spot = brushLabelPosition(bounds, drawing.getBoundingClientRect(), obstacles, tag.width, tag.height);
        if (spot) { left = bounds.left + spot.left; top = bounds.top + spot.top; }
      } else if (drawing) top = Math.max(4, drawing.getBoundingClientRect().top - tag.height - 8);
      const boundary = target.closest('.paint-tray, .phone-panel, .dabble-bar')?.getBoundingClientRect();
      if (boundary) left = Math.max(Math.max(4, boundary.left + 4), Math.min(Math.min(innerWidth - tag.width - 4, boundary.right - tag.width - 4), left));
      node.style.left = `${left}px`; node.style.top = `${top}px`;
      setVisible(!hidden);
      frame = requestAnimationFrame(measure);
    };
    frame = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(frame);
  }, [target, host]);
  return <div ref={root} className="player-label-scope" onPointerOverCapture={event => {
    const button = buttonFor(event.target);
    if (!button || button === hovered.current || (event.pointerType === 'touch' || !matchMedia('(any-hover: hover)').matches) && !button.querySelector('.tray-brush-drawing')) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { hovered.current = button; restore(); }, 300);
  }} onPointerOutCapture={event => {
    const button = buttonFor(event.target);
    if (button?.contains(event.relatedTarget as Node | null)) return;
    clearTimeout(timer.current); hovered.current = null; restore();
  }} onFocusCapture={event => {
    const button = buttonFor(event.target);
    if (!button || !matchMedia('(any-hover: hover)').matches && !button.querySelector('.tray-brush-drawing')) return;
    clearTimeout(timer.current); hovered.current = null; focused.current = button; restore();
  }} onBlurCapture={() => { focused.current = null; restore(); }}>
    {children}
    {host && createPortal(<div ref={label} className="player-label-position" data-visible={visible && Boolean(target) || undefined}><PaperLabel text={shortPlayerLabel(target?.getAttribute('aria-label') ?? '')} /></div>, host)}
  </div>;
}