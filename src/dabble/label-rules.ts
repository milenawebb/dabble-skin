export function paintLabelButton(element: EventTarget | null): HTMLButtonElement | null {
  const button = element instanceof Element ? element.closest<HTMLButtonElement>('button[aria-label]') : null;
  if (!button || button.closest('.tray-ledge-mode, .phone-ledge, .dabble-bar, .dabble-skin, [inert]')) return null;
  return button.closest('.paint-tray[data-state="open"] .tray-shelf, .phone-panel[data-painting] .phone-paint-panel') ? button : null;
}