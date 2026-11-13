export const PAINT_INVITATION_KEY = 'dabble-page-paint-invitations-v1';
export const INVITATION_FADE_MS = 400;
export const MIN_ARROW_GUTTER = 140;

export function invitationAction(target: Element | null, button = 0) {
  if (!target || button !== 0) return false;
  if (target.closest('.dabble-paint') && target.closest('.dabble-canvas[data-painting]')) return true;
  const control = target.closest('button');
  return control?.getAttribute('aria-label') === 'Start painting' ||
    control?.getAttribute('aria-label') === 'Blank canvas';
}