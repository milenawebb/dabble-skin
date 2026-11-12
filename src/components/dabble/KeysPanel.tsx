import { useHotkey } from '@videojs/react';
import { useEffect, type RefObject } from 'react';
import { blocksPaintingShortcut } from './painting-shortcuts';

const playerKeys = [['Space or K', 'Play and pause'], ['M', 'Mute'], ['C', 'Captions'], ['F', 'Fullscreen'], ['← →', 'Back or forward 5 seconds'], ['↑ ↓', 'Volume'], ['?', 'Show these keys']];
const paintKeys = [['P', 'Start or stop painting'], ['1 2 3 4', 'Choose a brush'], ['[ ]', 'Brush size'], ['Ctrl or Cmd + Z', 'Undo']];

export function KeysHotkey({ root, toggle, open }: { root: RefObject<HTMLDivElement | null>; toggle: () => void; open: boolean }) {
  useHotkey({ keys: '?', target: 'document', repeatable: false, onActivate: event => {
    const target = event.target instanceof Element ? event.target : null;
    if (blocksPaintingShortcut(target, false) && !open) return;
    if (!open && root.current?.querySelector('[aria-expanded="true"]')) return;
    toggle();
  } });
  return null;
}

export function KeysContent({ paintable, titleId, popup }: { paintable: boolean; titleId: string; popup: RefObject<HTMLDivElement | null> }) {
  useEffect(() => { popup.current?.focus(); }, [popup]);
  return <>
    <h2 id={titleId} className="dabble-keys-title">Keys</h2>
    {[{ title: 'Player', rows: playerKeys }, ...(paintable ? [{ title: 'Painting', rows: paintKeys }] : [])].map(group => <section className="dabble-keys-group" key={group.title} aria-label={group.title}>
      <h3>{group.title}</h3>
      <dl>{group.rows.map(([key, action]) => <div className="dabble-key-row" key={key}><dt><kbd>{key}</kbd></dt><dd>{action}</dd></div>)}</dl>
    </section>)}
  </>;
}