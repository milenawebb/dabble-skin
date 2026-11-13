export const SHORTCUT_EVENT = 'dabble-handled-shortcut';
export function announceShortcut(root: Element | null, key: string) {
  root?.dispatchEvent(new CustomEvent(SHORTCUT_EVENT, { bubbles: true, detail: key }));
}
export function keycapFor(key: string): string | undefined {
  const k = key.toLowerCase();
  if (k === ' ' || k === 'k') return 'Space or K';
  if (['m', 'c', 'f', '?', 'p'].includes(k)) return k.toUpperCase();
  if (k === 'arrowleft' || k === 'arrowright') return '← →';
  if (k === 'arrowup' || k === 'arrowdown') return '↑ ↓';
  if (['1', '2', '3', '4'].includes(k)) return '1 2 3 4';
  if (k === '[' || k === ']') return '[ ]';
  if (k === 'ctrl+z' || k === 'meta+z') return 'Ctrl or Cmd + Z';
  return undefined;
}
export function keycapSoundAllowed(optedIn: boolean, gestureSeen: boolean, muted: boolean) {
  return optedIn && gestureSeen && !muted;
}