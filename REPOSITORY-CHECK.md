# Repository organization check

## Result

- Skin moved to `src/dabble/`, including player, canvas, painting, captions, sounds, labels, shortcuts, local buttons, styles, fixtures and tests.
- `src/dabble/index.ts` exports `DabblePlayer`, `DabblePlayerProps` and the shared types/drawing/shortcut helpers the landing demo uses. Every external consumer imports through this one entry.
- No file inside the skin imports from the landing page, routes, demo components or other app folders. A permanent boundary test checks local imports.
- DabbleLogo and landing sections remain outside the skin. Demo-only device selection and decorative keycap hooks also remain outside.
- README now documents actual usage, defaults, customization, accessibility and Bun commands. It explicitly notes that `sounds` is a compatibility prop and that desktop/tablet trays currently open regardless of `defaultTrayOpen`.
- LICENSE contains the complete official Apache License 2.0 text and Copyright 2026 Milena Webb.
- All three GitHub links point to https://github.com/milenawebb/dabble-skin and open safely in a new tab.

## Verification

- 38 test files passed, 236 tests passed.
- Latest automatic production build: build OK. The production build was run by the preview system, not manually.
- Chromium desktop (1280px window), tablet (820px window) and phone (390px window) preserved identical player positions and dimensions. Tablet and phone screenshots matched exactly. Desktop differed only in a small loading-time timeline buffer region.
- Real Mux playback, a manual frame stroke, Undo and all three rendered GitHub destinations passed. No page errors.
- Page logos, favicon files, painting engine math and player actions were not changed.
- Physical iOS/Safari behavior was not re-tested for this file move.

## Private-information check

No API keys, access tokens, passwords, private keys, credential-bearing URLs or signed private URLs were found in the current tracked/new source scan. Public Mux playback and thumbnail URLs remain. Public asset CDN pointers, Google font URLs and ordinary tooling/service references are not credentials. This checks the working tree, not historical Git commits or hosting secret stores.

## Files in src/dabble/

```text
AGENTS.md
Button.tsx
DabblePlayer.test.tsx
DabblePlayer.tsx
DabbleSkin.tsx
HandDrawings.tsx
KeysPanel.tsx
MixPaintInput.css
MixPaintInput.test.tsx
MixPaintInput.tsx
PaintTray.test.tsx
PaintTray.tsx
PaintedCaptions.test.tsx
PaintedCaptions.tsx
PaintingGuide.test.tsx
PaintingGuide.tsx
PaintingHotkeys.tsx
PhonePaintPanel.test.tsx
PhonePaintPanel.tsx
PlayerLabels.tsx
accessibility-rules.test.ts
boundaries.test.ts
brush-label.test.ts
brush-label.ts
brush-sounds.test.ts
canvas-layout.test.ts
canvas-layout.ts
canvas.css
caption-rules.test.ts
caption-rules.ts
controls-feature.test.ts
dabble-skin.css
fixtures/paint-reference.js
fixtures/palette-reference.js
fresh-load-sounds.test.tsx
fullscreen-orientation.test.ts
fullscreen-orientation.ts
index.ts
keys-data.test.ts
page-feedback.test.ts
page-feedback.ts
paint-engine.test.ts
paint-engine.ts
paint-rules.test.ts
paint-rules.ts
paint-tray.css
painting-data.test.ts
painting-data.ts
painting-discovery.test.ts
painting-discovery.ts
painting-guide.css
painting-shortcuts.test.ts
painting-shortcuts.ts
palette.test.ts
palette.ts
phone-panel-rules.test.ts
phone-panel-rules.ts
phone-panel.css
player-labels.css
skin-rules.test.ts
skin-rules.ts
sounds.test.ts
sounds.ts
stroke-controls.test.ts
stroke-controls.ts
text-track-feature.test.ts
tray-rules.test.ts
tray-rules.ts
use-brush-cursor.ts
use-brush-feedback.test.tsx
use-brush-feedback.ts
use-feedback.test.tsx
use-feedback.ts
use-paint.test.tsx
use-paint.ts
utils.ts
video-palette.test.ts
video-palette.ts
volume-rules.test.ts
```
