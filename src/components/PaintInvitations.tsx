import { useEffect, useState, type RefObject } from 'react';
import { INVITATION_FADE_MS, MIN_ARROW_GUTTER, PAINT_INVITATION_KEY, invitationAction } from './paint-invitation-rules';

type Placement = { left?: number; right?: number; top: number; kind: 'frame' | 'brush' | 'phone' };

export function PaintInvitations({ player }: { player: RefObject<HTMLDivElement | null> }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [placements, setPlacements] = useState<Placement[]>([]);
  useEffect(() => {
    const root = player.current;
    if (!root) return;
    try { if (localStorage.getItem(PAINT_INVITATION_KEY) === 'dismissed') return; } catch { /* Optional browser storage. */ }
    setVisible(true);
    let dismissed = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      try { localStorage.setItem(PAINT_INVITATION_KEY, 'dismissed'); } catch { /* Still dismiss for this visit. */ }
      setLeaving(true);
      timer = setTimeout(() => setVisible(false), INVITATION_FADE_MS);
    };
    const action = (event: Event) => {
      if (invitationAction(event.target instanceof Element ? event.target : null, event instanceof PointerEvent ? event.button : 0)) dismiss();
    };
    const measure = () => {
      const canvas = root.querySelector<HTMLElement>('.dabble-canvas');
      if (!canvas) return;
      const base = root.getBoundingClientRect();
      const frame = canvas.getBoundingClientRect();
      const next: Placement[] = [];
      if (canvas.hasAttribute('data-phone')) {
        const button = root.querySelector<HTMLElement>('.phone-ledge button');
        if (button) {
          const box = button.getBoundingClientRect();
          if (window.innerWidth - box.right >= 108) next.push({ kind: 'phone', left: box.right - base.left + 8, top: box.top - base.top });
        }
      } else {
        if (frame.left >= MIN_ARROW_GUTTER) next.push({ kind: 'frame', right: base.width + 14, top: frame.top - base.top + frame.height * .3 });
        const tray = root.querySelector<HTMLElement>('.paint-tray');
        if (tray && window.innerWidth - frame.right >= MIN_ARROW_GUTTER) {
          const box = tray.getBoundingClientRect();
          next.push({ kind: 'brush', left: base.width + 14, top: box.top - base.top - 56 });
        }
      }
      setPlacements(next);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    let count = root.querySelector('.dabble-canvas')?.getAttribute('data-stroke-count');
    const mutations = new MutationObserver(() => {
      const nextCount = root.querySelector('.dabble-canvas')?.getAttribute('data-stroke-count');
      if (count && count !== '0' && nextCount === '0') dismiss();
      count = nextCount;
      measure();
    });
    // Only watch player state, not the decorative elements rendered by this component.
    mutations.observe(root, { subtree: true, attributes: true, attributeFilter: ['data-phone', 'data-stroke-count', 'data-painting', 'data-state'] });
    root.addEventListener('pointerdown', action);
    root.addEventListener('click', action);
    window.addEventListener('resize', measure);
    measure();
    return () => { clearTimeout(timer); observer.disconnect(); mutations.disconnect(); root.removeEventListener('pointerdown', action); root.removeEventListener('click', action); window.removeEventListener('resize', measure); };
  }, [player]);
  if (!visible) return null;
  return <div className="paint-invitations" aria-hidden="true" data-leaving={leaving || undefined}>
    {placements.map(placement => <div key={placement.kind} className={`paint-invitation paint-invitation-${placement.kind}`} style={{ left: placement.left, right: placement.right, top: placement.top }}>
      <span>{placement.kind === 'frame' ? 'paint here!' : placement.kind === 'brush' ? 'pick a brush' : 'try it!'}</span>
      <svg viewBox={placement.kind === 'phone' ? '0 0 100 36' : '0 0 112 120'} fill="none" focusable="false">
        <path pathLength="1" d={placement.kind === 'frame' ? 'M12 38C4 65 18 94 46 95S89 80 105 71M94 67L105 71 100 82' : placement.kind === 'brush' ? 'M91 37C106 58 96 77 74 82S36 89 8 110M9 99L8 110 20 108' : 'M79 26C56 23 43 24 28 30S13 34 3 32M11 26L3 32 13 35'} />
      </svg>
    </div>)}
  </div>;
}