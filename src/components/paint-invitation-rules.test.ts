import { expect, it } from 'vitest';
import { invitationAction, MIN_ARROW_GUTTER, INVITATION_FADE_MS } from './paint-invitation-rules';

it('requires 140px side space and removes invitations after a 400ms fade', () => {
  expect(MIN_ARROW_GUTTER).toBe(140);
  expect(INVITATION_FADE_MS).toBe(400);
});
it('dismisses on a paint stroke, not a watching click or secondary button', () => {
  const root = document.createElement('div');
  root.className = 'dabble-canvas';
  const canvas = root.appendChild(document.createElement('canvas'));
  canvas.className = 'dabble-paint';
  expect(invitationAction(canvas)).toBe(false);
  root.dataset['painting'] = 'true';
  expect(invitationAction(canvas)).toBe(true);
  expect(invitationAction(canvas, 2)).toBe(false);
});
it.each(['Start painting', 'Blank canvas'])('dismisses on %s including its child icon', label => {
  const button = document.createElement('button');
  button.setAttribute('aria-label', label);
  const icon = button.appendChild(document.createElement('span'));
  expect(invitationAction(icon)).toBe(true);
  button.setAttribute('aria-label', 'Done painting');
  expect(invitationAction(icon)).toBe(false);
});