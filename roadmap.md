# Dabble

## Pick custom paint from the video
- [x] Replace the system picker with shared video pick mode and swirled eyedropper button.
- [x] Verify exact-spot live/fallback pixels, keyboard movement, cancellation, and unchanged playback/painting during picks in Chromium.
- [x] Check desktop and 390px touch views; live frames and forced CORS thumbnail fallback work in both. WebKit crashes, so physical iPhone behavior is unverified.

## Painting playback and direct custom color picker
- [x] Hide the center button during painting playback, retaining tap-to-pause and paused/replay states; suppress the touch compatibility click that otherwise hits the newly revealed Play button.
- [x] Replace both indirect color pickers with a full-target native input and permanent swirled artwork; verify live/final selection and keyboard access.
- [x] Verify desktop and 390px touch Chromium flows with real video playback; WebKit crashes on page load, so Safari and native OS picker selection remain unverified.

## Phone plaque, restored tools and fresh sound consent
- [x] Keep the phone plaque visible with a 20px canvas gap, preserving the panel swap and fullscreen; verified playing after idle in Chromium.
- [x] Restore upright brushes, three size blobs, circle actions and Blank canvas tag with 44px targets; verified at 320/360/390px.
- [x] Migrate sound consent to a new key, delete the old key, and verify fresh-load painting creates no audio; real stroke and permanent regression test pass.

## Shared phone watching/painting slot
- [x] Replace stacked phone panels with one animated slot and compact three-row tools; use agreed reduced padding at 320px.
- [x] Verify 44px targets at 320/360/390, uninterrupted playback, Done/Escape, fixed canvas, captions and narrow Chromium fullscreen; physical Android remains unavailable.

## Fixed phone frame and hanging plaque
- [x] Remove the drawer and split painting; position the phone plaque outside the fixed frame with reserved space.
- [x] Verify equal 24px frame, stable hide/show layout, captions, bottom-frame painting and narrow desktop/touch Chromium fullscreen controls; physical Android remains unverified.

## Phone drawer and centralized sound gate
- [x] Animate phone drawer with fixed equal-frame painting geometry and a moving bottom paint band.
- [x] Gate every audio entry and stop active sources immediately when switched off; verified silent/off and active/on strokes, identical bottom paint pixels and fixed video bounds.

## Sound opt-in and shared control visibility
- [x] Default every sound off and persist explicit music-button consent without early AudioContext activation.
- [x] Share library 2.5-second idle and locks across phone/desktop; hide during painting without resizing the phone band.
- [x] Verify first/second touch taps, keyboard focus, menus, captions, bottom-band painting and sound persistence.

## iOS painted captions
- [x] Remove Safari fallback, preserve library CC intent with hidden tracks, and hand over only in native iPhone fullscreen.
- [x] Verified real Mux playback on iOS-sized Chromium views, cue events, mode resets, CC off, phone clearance and simulated fullscreen handover; WebKit crashes loading the page, so real iPhone/iPad handover remains unverified.

## Compact gallery and wider phone frame
- [x] Move the header GitHub control to the museum label and tighten phone/desktop spacing; shared repository URL remains pending below.
- [x] Use 24px below 560px and 5% above; verified visible starter paint, 24px below phone bar, long two-line captions, painting and page fit at 390/1280px; 197 tests passed.

## Keycap refresh recovery
- [x] Prevent stale keycap-hook state reuse and pre-optimize Lucide to avoid replacing shared React chunks; verified live refresh, saved paintings, playback and touch feedback with no runtime errors.

## Real-phone fixes
- [x] Restrict preview switch to 900px+, simplify header and museum label, prepare three shared GitHub controls.
- [ ] Activate and verify the three GitHub destinations: waiting for the user's repository URL.
- [x] Draw title strokes on scroll; add decorative touch keycap feedback and a working custom paint picker.
- [x] Close shelf and tools as one clipped piece; verify 390px touch, tablet/desktop, slow transitions, custom-color saved strokes and reduced motion; regression tests pass.

## Video edge and phone fixes
- [x] Add a single non-fullscreen video pencil outline and soft shadow; restore device drawings and reset invalid preview choices.
- [x] Keep brush tags within tray bounds with collision-free above/below/beside placement.
- [x] Verify even outline at 390/767/1001/1439, device limits and live resize without remounting, fullscreen and collision-free labels in every tray layout.

## Gallery wall
- [x] Rearrange the landing page into gallery paper pieces, live brush samples, access sign, loose keys and developer notes.
- [x] Preserve hero interactions; verify all Try it actions, palette samples, accessibility modes and 360px layout; omit default-silence and CSS paint-palette claims.

## Single brush tag
- [x] Replace duplicate/timed brush names with one selected/hovered/focused tag; preserve accessible names and other tooltips.
- [x] Verify all four tag positions, hover/focus restoration, reduced-motion swaps and unchanged tray height at desktop, tablet and mobile sizes.

## Layered logo plop
- [x] Render supplied ink/paper SVG layers inline and animate hero blobs only, with two-second hover replay cooldown.
- [x] Verify exact inline artwork, load, throttled hover, reduced-motion, forced-colors, static header/footer and phone layout.

## Painting discovery
- [x] Add timed border guidance, persisted first-stroke completion and video-drag reminders without changing click playback.
- [x] Add timed/selected brush-name tags without increasing tray height.
- [x] Verify painting, reload, video clicks and responsive labels.

## Lighter starter and Blank canvas
- [x] Replace default painting with six fixed-seed corner strokes in three footage colors.
- [x] Replace reset confirmation with immediate Blank canvas, one-step undo and open-tray clearing shortcuts.
- [x] Verify saved/owner precedence, reload behavior and appearance at 1100, 768 and 390px.

## Contest audit
- [x] Keep opening controls visible; enforce 1.8-second idle and immediate leave after playback, including paused/ended cycles.
- [x] Audit and fix player states, fullscreen, responsive/keyboard/contrast/touch/reduced-motion behavior without redesign; Chrome checks and 183 tests passed.
- [x] Add the footer license line and report every checklist item with testing limitations; temporary error route removed.

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