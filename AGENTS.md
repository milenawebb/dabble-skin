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
- Keep player composition inside `DabblePlayer.tsx`, accepting `src`, and UI primitives inside `DabbleSkin.tsx`, so skin changes stay isolated from the page.
- Use the packaged `@videojs/react/video` player preset with custom Video.js UI primitives and scoped skin CSS; do not import the stock skin stylesheet.
- Keep canvas and paint wrappers outside `VideoPlayer`; `DabbleSkin` registers its inner `Container` as the fullscreen target, so fullscreen excludes the frame.
- Calculate frame spacing from the canvas wrapper's measured width with `ResizeObserver`, and video shape from native metadata; keep geometry rules in a pure tested helper.
- Delegate visibility timing and input actions to Video.js; preserve component-provided handlers and ARIA when rendering custom button content.
- Compose player states with Poster, PlayButton, Gesture, BufferingIndicator, and ErrorDialog, and speed selection with Menu and PlaybackRateRadioGroup; library primitives own actions, focus, and controls locks.
- Keep native browser caption rendering and position cue bottoms with percentage lines from measured control-bar overlap; resolve semantic CSS tokens for native cue styling without replacing the renderer.
- Keep phone docking inside the Video.js Container and reserve measured bar height in the outer canvas; use a Video.js controls lock only outside fullscreen so fullscreen retains library auto-hide.
- Pass native caption tracks through DabblePlayer props and keep sample VTT files in public/captions so the actual player exercises captions without injected test tracks.
- Keep the supplied brush engine a math-preserving TypeScript port; isolate interaction and tray UI from renderStroke so reference rendering remains reproducible.
- Store paintings only as seeded normalized strokes in memory, using an offscreen canvas as a disposable rendering cache and replaying after debounced measured geometry changes.
