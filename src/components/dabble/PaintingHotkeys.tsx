import { useHotkey } from '@videojs/react';
import { useEffect, useState, type RefObject } from 'react';
import { blocksPaintingShortcut, paintingShortcutLabel } from './painting-shortcuts';
import { announceShortcut } from './page-feedback';

function PaintingHotkey({ keys, root, painting, size, blocked }: { keys: string; root: RefObject<HTMLDivElement | null>; painting: boolean; size: number; blocked: boolean }) {
  useHotkey({ keys, target: 'document', repeatable: false, disabled: blocked, onActivate: event => {
    const container = root.current;
    const target = event.target instanceof Element ? event.target : null;
    if (!container || blocksPaintingShortcut(target, Boolean(container.querySelector('[aria-expanded="true"], [role="dialog"]')))) return;
    const trayOpen = container.closest('.dabble-canvas')?.nextElementSibling?.getAttribute('data-state') !== 'tucked';
    const label = keys === 'p' ? (trayOpen ? 'Put the paints away' : 'Start painting') : paintingShortcutLabel(keys, painting, size, trayOpen);
    if (!label) return;
    const tray = container.closest('.dabble-canvas')?.nextElementSibling;
    const button = Array.from(tray?.querySelectorAll<HTMLButtonElement>('button') ?? []).find(item => item.getAttribute('aria-label') === label);
    if (button && !button.disabled && button.getAttribute('aria-disabled') !== 'true') { button.click(); announceShortcut(container, keys); }
  } });
  return null;
}

export function PaintingHotkeys(props: { root: RefObject<HTMLDivElement | null>; painting: boolean; size: number; blocked: boolean }) {
  const [inputBlocked, setInputBlocked] = useState(false);
  useEffect(() => {
    const update = () => setInputBlocked(blocksPaintingShortcut(document.activeElement, Boolean(props.root.current?.querySelector('[aria-expanded="true"], [role="dialog"]'))));
    update();
    document.addEventListener('focusin', update);
    document.addEventListener('focusout', update);
    const observer = new MutationObserver(update);
    const root = props.root.current;
    if (root) observer.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['aria-expanded'] });
    return () => { document.removeEventListener('focusin', update); document.removeEventListener('focusout', update); observer.disconnect(); };
  }, [props.root]);
  return <>{['p', '1', '2', '3', '4', '[', ']', 'ctrl+z', 'meta+z', 'shift+backspace', 'shift+delete'].map(keys => <PaintingHotkey key={keys} keys={keys} {...props} blocked={props.blocked || inputBlocked} />)}</>;
}