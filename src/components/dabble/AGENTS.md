# Page presentation boundaries
- Keep the pinned Bun controls-feature patch in dev/production so Video.js alone owns the 1.8-second idle and initial/ended holds; test its actual runtime on upgrades.
- Keep defaultTrayOpen as a tray-only initial reveal, not painting mode or a focus action, so playback and visibility ownership remain unchanged.
- Publish decorative shortcut feedback through the existing Video.js coordinator and guarded custom actions; page listeners never run player actions.
- Gate page keycap audio on an explicit sound preference and a trusted page gesture; offering player sounds is not itself opt-in consent.