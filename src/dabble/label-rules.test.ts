import { expect, it } from 'vitest';
import { paintLabelButton } from './label-rules';

it('limits labels to open paint tools, excluding playback and ledge controls', () => {
  const root = document.createElement('div');
  root.innerHTML = '<section class="paint-tray" data-state="open"><div class="tray-shelf"><button aria-label="Undo"></button></div><button class="tray-ledge-mode" aria-label="Done painting"></button></section><section class="phone-panel" data-painting><div class="phone-paint-panel"><button aria-label="Ribbon brush"></button></div><div class="phone-watch-panel dabble-bar"><button aria-label="Mute"></button></div><div class="phone-ledge"><button aria-label="Done painting"></button></div></section><div class="dabble-skin"><button aria-label="Play"></button></div>';
  const buttons = Array.from(root.querySelectorAll('button'));
  expect(buttons.map(button => Boolean(paintLabelButton(button)))).toEqual([true, false, true, false, false, false]);
  root.querySelector('.paint-tray')?.setAttribute('data-state', 'closed');
  expect(paintLabelButton(buttons[0] ?? null)).toBeNull();
  root.querySelector('.phone-paint-panel')?.setAttribute('inert', '');
  expect(paintLabelButton(buttons[2] ?? null)).toBeNull();
});