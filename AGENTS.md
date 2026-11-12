<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Player architecture
- Keep player composition inside `DabblePlayer.tsx`, using MuxVideo for playbackId and Video for src; keep UI primitives inside DabbleSkin so source changes cannot alter the skin.
- Use the packaged `@videojs/react/video` player preset with custom Video.js UI primitives and scoped skin CSS; do not import the stock skin stylesheet.
- Keep canvas and paint wrappers outside `VideoPlayer`; `DabbleSkin` registers its inner `Container` as the fullscreen target, so fullscreen excludes the frame.
- Calculate frame spacing from the canvas wrapper's measured width with `ResizeObserver`, and video shape from native metadata; keep geometry rules in a pure tested helper.
- Round video-stage size and screen position in the layout helper; use paper behind non-fullscreen media and black in fullscreen to prevent dark subpixel seams.
- Delegate visibility timing and input actions to Video.js; preserve component-provided handlers and ARIA when rendering custom button content.
- Compose player states with Poster, PlayButton, Gesture, BufferingIndicator, and ErrorDialog, and speed selection with Menu and PlaybackRateRadioGroup; library primitives own actions, focus, and controls locks.
- Read showing caption tracks through native activeCues/cuechange without changing track modes; render safe visual-only ink captions inside Container, with measured video/control/panel clearance and opaque native fallback for WebKit or unreadable cues, because CC state and system fullscreen must remain library-owned.
- Keep phone docking inside the Video.js Container and reserve measured bar height in the outer canvas; use a Video.js controls lock only outside fullscreen so fullscreen retains library auto-hide.
- Pass native caption tracks through DabblePlayer props and keep sample VTT files in public/captions so the actual player exercises captions without injected test tracks.
- Keep the supplied brush engine a math-preserving TypeScript port; isolate interaction and tray UI from renderStroke so reference rendering remains reproducible.
- Store paintings as versioned seeded normalized strokes, rounded on completion and persisted per video source in optional browser storage; use offscreen canvases only as disposable rendering caches.
- Keep palette math reference-identical; sample Mux scene thumbnails (duration fractions or explicit overrides), retain hidden-video sampling for plain sources, and fall back to current-time thumbnails when live pixel reads fail; preserve each stroke's palette.
- Use playbackId as painting identity and export it for Mux sources, so paintings never leak between source identities.
- Disable HLS subtitle formats when an explicit captions file is supplied; do not add Mux analytics, and disclose native-HLS track limitations rather than altering manifests.
- Remount the player for the deliberate broken-source test so media feature subscriptions attach to the replacement adapter.
- Pre-optimize the Mux React media entry in Vite to avoid late dependency discovery replacing shared React chunks during a preview session.
- Use VolumePopover with a MuteButton trigger and vertical VolumeSlider only for hover-capable players at least 420px wide; hold the library controls lock while its popup is open.
- Keep optional Web Audio and activation feedback in a wrapper-level hook with native state listeners and captured trusted gestures, so Video.js actions and brush rendering stay untouched.
- Keep continuous brush audio in a dedicated wrapper hook using the shared gesture-created AudioContext; supplied voice math stays in sounds, with explicit stroke, mute, visibility, and unmount teardown.
- Share supplied icon and brush SVGs in a browser-safe drawing module; keep tray state and cursor geometry separate from the painting engine so visual changes cannot alter saved strokes.
- Subscribe the tray to Video.js visibility through the skin and request the existing controls lock during tray interaction; never introduce a second player auto-hide timer.
- Keep wall selection in the demo route with validated optional browser storage and scoped wall tokens; page themes must not recolor the player or tray.
- Render the tray paper backing independently of its tools and keep the wooden ledge visible in every tray state; shelf decoration must not alter tray actions or visibility timing.
- Register painting and help shortcuts through Video.js hooks, reusing tray button actions and blocking editable fields and open panels; existing player bindings remain unchanged.
- Keep the Keys popover inside the Video.js Container with a controls lock and a focusable keyboard fallback when its responsive trigger is hidden.
