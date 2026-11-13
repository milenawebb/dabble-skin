# Page presentation boundaries
- Keep the pinned Bun controls-feature patch in dev/production so Video.js alone owns the 2.5-second idle and paused/ended holds; test its actual runtime on upgrades.
- Keep defaultTrayOpen as a tray-only initial reveal, not painting mode or a focus action, so playback and visibility ownership remain unchanged.
- Publish decorative shortcut feedback through the existing Video.js coordinator and guarded custom actions; page listeners never run player actions.
- Gate page keycap audio on an explicit sound preference and a trusted page gesture; offering player sounds is not itself opt-in consent.
- Self-accept painting-hook development updates with a full page reload so hook-layout edits cannot reuse incompatible React state slots; saved strokes restore normally.
- Keep discovery overlays pointer-transparent outside the player; observe tray openings and actual manual strokes separately from saved paintings, and leave Video.js tap actions untouched.