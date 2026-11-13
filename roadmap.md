# Dabble

## Landing page polish
- [x] Replace the drawn logo with the supplied dark and white artwork, preserving proportions and reduced-motion behavior.
- [x] Open the demo tray initially without focus or scroll changes; retain the closed component default.
- [x] Add decorative keycap feedback from handled shortcuts with explicitly opted-in, gesture-gated sounds.
- [x] Polish tagline, painted title/nav strokes, film credit, Notes, fixed-width drips and two-column prop descriptions.
- [x] Verify desktop/phone, shortcut single actions, silence, tray behavior and regression tests.

## Landing page
- [x] Rebuild the demo route as a landing page: header with skip link and nav, hero with pill/logo/tagline, Keys card, drip divider, Access, Notes, Use it, footer.
- [x] Replace preview-size pills with a hand-drawn device switch (teal blob and underline selected state, Caveat words, 44px targets, same radio behavior and hiding rules).
- [x] Remove the wall switcher and wall-rules; fixed #1F1D1B wall; recheck tray, ledge, brush button and tooltips on dark.
- [x] Share the Keys panel data with the Keys card; verify every Access claim against the code and report any untrue one.
- [x] Verify 360px layout, landmarks, contrast, playback/painting continuity, and the test suite.

## Demo preview sizes and tucked shelf
- [x] Collapse the tucked tray shelf to the brush button on the ledge, animating growth with reduced-motion instant switching.
- [x] Rename the mode button Start painting / Put the paints away with aria-expanded.
- [x] Audit responsive rules: all player/tray rules already use player width (container queries, ResizeObserver, cqw); no viewport rules to convert.
- [x] Add Desktop/Tablet/Mobile preview-size radiogroup with arrow keys, window-fit hiding, and animated column width without remounting the player.
- [x] Verify ledge gap, phone layout at Mobile size, playback/painting continuity across tabs, and tab hiding at narrow windows.

## Paint color names
- [x] Derive English HSL color names and distinguish duplicates by lightness, then number.
- [x] Use names for paint tooltips and accessible labels, retaining pressed state, sampler and size names.
- [x] Verify the six Dab names, palette naming rules, and existing tray actions.

## Viewer painting
- [x] Default painting tools on; gate copying behind ownerTools and preserve viewer-saved painting precedence.
- [x] Reuse Clear as confirmed Start over, restore the starting painting, and verify focus/Escape.
- [x] Audit viewer wording; 145 tests pass and real desktop/phone painting, reload, cancellation, and reset are verified. No signature feature exists in the current player.

## Frame cleanup
- [x] Remove the frame progress indicator and its dedicated code; retain the controls seek bar.
- [x] Round video-stage geometry and prevent dark subpixel gaps, retaining black fullscreen backgrounds.
- [x] Verify matching poster/video boxes and clean edges at 390, 559, 834, 1001, 1277, and 1439px in Chrome, plus black fullscreen and no hidden-frame indicator.

## Hand-painted captions
- [x] Render active showing cues safely on one ink swipe per cue, preserving Video.js CC state and native fallback.
- [x] Measure video/control/panel clearance across desktop, phone, hidden controls, and fullscreen; support forced colors.
- [x] Test caption rules and Chrome playback, CC toggling, panels, phone/fullscreen and forced colors.
- [ ] Verify Firefox and Safari captions end-to-end: sandbox Firefox lacks H.264 playback support and WebKit crashes; real Safari is unavailable. Safari conservatively retains native captions.

## Mux demo
- [x] Play the exact Mux asset with its scene poster and unchanged supplied captions.
- [x] Sample scene thumbnails and live frames with thumbnail fallback; isolate saved paintings and export playbackId.
- [x] Verify playback, volume, speed, captions, fullscreen, Keys, painting/export, desktop/phone presentation, and report limitations.
- [ ] Verify native Safari playback/canvas and single-track behavior: sandbox WebKit crashes; real Safari is unavailable.
- [x] Verify the existing error card for a delayed HLS manifest failure and the deliberate broken-source test.

## Continuous painting sounds
- [x] Port the supplied pink-noise voices and exact envelopes; preserve player sounds.
- [x] Follow every stroke movement and stop on all stroke, mute, visibility, and component exits.
- [x] Verify lifecycle, sound-off/muted silence, real painting, and regression tests.

## Step 11
- [x] Thin and recenter the hidden-bar progress line.
- [x] Add Video.js-registered painting shortcuts with text-field and popup isolation.
- [x] Add the accessible Keys popover, responsive button, and question-mark toggle.
- [x] Verify shortcut actions, focus return, popup locks, and desktop/phone layouts.
- [x] Omit the signature as requested.

## Step 10
- [x] Add the background-independent paper shelf and supplied wooden ledge without changing tray behavior.
- [x] Add five accessible, locally remembered demo wall swatches and dark-wall canvas shadows.
- [x] Verify all walls, open/tucked tray, focus, tooltips, contrast, and phone/tablet layouts.

## Step 9
- [x] Replace player and tray icons with the supplied drawings.
- [x] Build the easel ledge tray with tucked, peek, pinned, and responsive layouts.
- [x] Add the size-aware brush cursor without changing painting logic.
- [x] Verify keyboard, touch, tray visibility, actions, saved paintings, and desktop stability; report dimensions and drawing issues.
- [x] Preserve nonoverlapping 44px touch targets with horizontal tool-row scrolling where the requested row cannot physically fit.

## Step 8
- [x] Fix two-tone focus, coarse-pointer targets, captions state, hidden focus, and forced colors.
- [x] Audit keyboard, names, announcements, contrast, motion, zoom-equivalent widths, and automated accessibility.
- [x] Report fixes, failures, automated results, and checks requiring real assistive technology.

## Step 7
- [x] Add restartable brush sweeps, pressed states, and reduced-motion behavior.
- [x] Add gesture-gated Web Audio, muted suppression, painting throttles, touch feedback, and the saved sounds switch.
- [x] Verify real controls, keyboard shortcuts, painting, silence rules, persistence, and regressions.

## Step 6
- [x] Port the uploaded palette reference unchanged and test parity and contrast.
- [x] Add Video.js vertical volume popover and soften speed-item focus rings.
- [x] Sample video palettes without seeking playback; update pots, initial paint, and tinted controls.
- [x] Persist per-video painting data, restore/export embedded paintings, and add clipboard fallback.
- [x] Verify sampling, mouse/keyboard volume, reload persistence, export size, and player regressions.

## Step 5
- [x] Port the reference brushes unchanged to TypeScript and verify output parity.
- [x] Add normalized stroke storage, offscreen rendering, pointer painting, and resize replay.
- [x] Add the paint tray, initial Ribbon stroke, and paint-mode frame rules.
- [x] Test mouse, touch, keyboard actions, resizing, captions, and fullscreen; report measured geometry.

## Step 4

- [x] Add poster, opening/replay invitation, gestures, buffering, and playback errors.
- [x] Replace cycling speed with the Video.js menu and preserve auto-hide.
- [x] Apply DM Sans labels and native caption styling with measured control-bar clearance.
- [x] Test real playback, menu keyboard controls, states, captions, and phone layout.
- [x] Report poster, focus approach, components, captions, and documentation differences.
- [x] Add the sample English VTT track and confirm the CC button appears.
- [x] Dock controls below the video under 420px, grow the painted canvas, and retain fullscreen overlay behavior.
- [x] Verify two-line captions with the phone bar visible, desktop behavior, and fullscreen auto-hide.