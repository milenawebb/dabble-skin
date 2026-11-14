import { useHotkey } from '@videojs/react';
import { useEffect, type RefObject } from 'react';
import { blocksPaintingShortcut } from './painting-shortcuts';
import { announceShortcut } from './page-feedback';
import { Button } from './Button';
import { X } from 'lucide-react';

// The landing page Keys card reads these same lists so the two never disagree.
export const PLAYER_KEYS = [['Space or K', 'Play and pause'], ['M', 'Mute'], ['C', 'Captions'], ['F', 'Fullscreen'], ['← →', 'Back or forward 5 seconds'], ['↑ ↓', 'Volume'], ['?', 'Open this list']];
export const PAINT_KEYS = [['P', 'Start or stop painting'], ['1 2 3 4', 'Choose a brush'], ['[ ]', 'Brush size'], ['Ctrl or Cmd + Z', 'Undo'], ['Shift + Backspace', 'Blank canvas']];

export function KeysHotkey({ root, toggle, open }: { root: RefObject<HTMLDivElement | null>; toggle: () => void; open: boolean }) {
  useHotkey({ keys: '?', target: 'document', repeatable: false, onActivate: event => {
    const target = event.target instanceof Element ? event.target : null;
    if (blocksPaintingShortcut(target, false) && !open) return;
    if (!open && root.current?.querySelector('[aria-expanded="true"]')) return;
    toggle();
    announceShortcut(root.current, '?');
  } });
  return null;
}

export function KeysContent({ paintable, titleId, popup, onClose, open, splitPlayer = false }: { paintable: boolean; titleId: string; popup: RefObject<HTMLDivElement | null>; onClose: () => void; open: boolean; splitPlayer?: boolean }) {
  useEffect(() => {
    const panel = popup.current;
    if (!panel || !open) return;
    panel.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const controls = Array.from(panel.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], [tabindex="0"]'));
      const first = controls[0];
      const last = controls.at(-1);
      if (!first || !last) { event.preventDefault(); panel.focus(); return; }
      if (!panel.contains(document.activeElement) || document.activeElement === panel || (event.shiftKey ? document.activeElement === first : document.activeElement === last)) {
        event.preventDefault(); (event.shiftKey ? last : first).focus();
      }
    };
    const contain = (event: FocusEvent) => { if (event.target instanceof Node && !panel.contains(event.target)) panel.focus(); };
    document.addEventListener('keydown', trap, true);
    document.addEventListener('focusin', contain);
    return () => { document.removeEventListener('keydown', trap, true); document.removeEventListener('focusin', contain); };
  }, [popup, open]);
  return <>
    <div className="dabble-keys-header"><h2 id={titleId} className="dabble-keys-title">Keys</h2><Button variant="ghost" size="icon" className="dabble-button dabble-keys-close" aria-label="Close Keys" onClick={onClose}><X aria-hidden="true" /></Button></div>
    <div className="dabble-keys-columns">
    {[...(splitPlayer ? [{ title: 'Player 1', rows: PLAYER_KEYS.slice(0, 4) }, { title: 'Player 2', rows: PLAYER_KEYS.slice(4) }] : [{ title: 'Player', rows: PLAYER_KEYS }]), ...(paintable ? [{ title: 'Painting', rows: PAINT_KEYS }] : [])].map(group => <section className="dabble-keys-group" key={group.title} aria-label={group.title}>
      <h3>{group.title}</h3>
      <dl>{group.rows.map(([key, action]) => <div className="dabble-key-row" key={key} role="group" aria-label={`${key}, ${action}`}><dt><kbd>{key}</kbd></dt><dd>{action === 'Back or forward 5 seconds' ? <><span className="dabble-key-action-full">{action}</span><span className="dabble-key-action-short">Back or forward 5s</span></> : action}</dd></div>)}</dl>
    </section>)}
    </div>
  </>;
}