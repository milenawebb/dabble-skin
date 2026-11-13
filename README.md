# Dabble, a Video.js v10 skin

A video player on a canvas. Viewers paint the frame around the video.

[Live demo](https://dabblevideo.com) · [Video.js v10 Skins Design Challenge](https://contra.com/community/topic/videojsskinschallenge) · [GitHub](https://github.com/milenawebb/dabble-skin)

## Where the skin is

The skin lives in `src/dabble/`. The demo landing page lives outside that folder. The remaining root files provide project tooling and hosting. Import the skin only through `src/dabble/index.ts`. It has no imports from the landing page or other app folders.

## Use it

This is a React 19 player using `@videojs/react` 10.3.0 and its packaged video preset. The folder includes its own buttons, frame styles, painting, captions, sounds and tests. Keep the Video.js patch in `patches/` and the `patchedDependencies` entry in `package.json`: it preserves caption intent and controls visibility.

```tsx
import { DabblePlayer, type DabblePlayerProps } from './src/dabble';

const player: DabblePlayerProps = {
  playbackId: 'AAprZsIykh7T29gtsNk02YhBrQRHXTj14ZxbWdc498wA',
  poster: 'https://image.mux.com/AAprZsIykh7T29gtsNk02YhBrQRHXTj14ZxbWdc498wA/thumbnail.jpg?time=9&width=1280',
  captions: {
    src: '/captions/dabble-dab.en.vtt',
    srcLang: 'en',
    label: 'English',
  },
};

export function Example() {
  return <DabblePlayer {...player} />;
}
```

The import above assumes your example is at the repository root. Inside this demo, use `@/dabble`. The CSS is imported automatically. Host your caption file in your site's public folder. Load Instrument Serif, DM Sans and Caveat, as the demo does, or use the font variables below. The shared button styles use Tailwind CSS v4 utilities, already enabled in this project; another host must include the skin folder in its Tailwind source scan.

| Prop | Default | What it does |
| --- | --- | --- |
| `playbackId` | Not supplied | Public Mux playback ID. Takes priority over `src` and identifies saved paintings. |
| `src` | `''` | Direct video URL when no Mux ID is supplied. Cross-origin video needs permission for color sampling. |
| `poster` | Not supplied | Image shown before play. |
| `captions` | Not supplied | One track with `{ src, srcLang, label }`. Explicit VTT disables generated HLS subtitle formats. |
| `paintable` | `true` | Shows viewer painting tools. |
| `painting` | Not supplied | Starting `{ version: 1, palette, strokes }` painting. Stored viewer paintings take priority. Each stroke retains its own chosen colors. |
| `ownerTools` | `false` | Adds Copy painting code to the desktop/tablet tray. |
| `sounds` | `false` | Compatibility prop. It does not enable sound or hide the toggle; explicit viewer consent controls sound. |
| `defaultTrayOpen` | `false` | Initial discovery state. Desktop/tablet trays currently open on every visit regardless; phones start with watching controls. |
| `thumbnailSampleTimes` | Not supplied | Mux thumbnail times in seconds. Otherwise uses 15%, 35%, 55% and 75% of duration. |
| `onPaletteChange` | Not supplied | Receives the six current paint colors. |
| `onSoundPreferenceChange` | Not supplied | Receives the viewer's sound opt-in state. |
| `broken` | `false` | Deliberate broken-source test, not needed for normal use. |

Paintings use normalized points, fixed seeds and per-stroke palettes, so they redraw at any size. Browser storage is optional. Fresh visitors start silent; explicit sound consent is remembered. No private Mux credentials or Mux analytics are used.

## Customize

Defaults live in `canvas.css` and `dabble-skin.css`. Colors below are their equivalent hex values. Keep readable contrast when changing them.

| CSS variable | Default | Changes |
| --- | --- | --- |
| `--dabble-paper` | `#FDFDFB` | Control and caption paper. |
| `--dabble-ink` | `#1B1B1A` | Text and outlines. |
| `--canvas-surface` | `#FDFDFB` | Canvas paper. |
| `--dabble-caption-text` | `var(--dabble-ink)` | Caption text. |
| `--dabble-caption-shadow` | `drop-shadow(0 2px 6px rgba(0, 0, 0, .18))` | Soft caption shadow. |
| `--dabble-video-pencil` | `color-mix(in srgb, var(--dabble-ink) 30%, transparent)` | Video outline. |
| `--dabble-video-shadow` | `0 1px 3px oklch(0 0 0 / .12)` | Video shadow. |
| `--dabble-ui-font` | `'DM Sans', Arial, sans-serif` | UI and captions. |
| `--dabble-label-font` | `'Instrument Serif', Georgia, serif` | Time, controls and panel titles. |
| `--dabble-hand-font` | `'Caveat', cursive` fallback | Blank canvas tag. Other handwritten labels use Caveat directly. |
| `--shelf-wood` | `#C99A5B` | Wooden ledge. |
| `--shelf-wood-shade` | `#A97B40` | Ledge shading. |
| `--shelf-wood-grain` | `#7A4E22` | Wood grain. |
| `--dabble-ledge-text` | `#C9C5BD` | Desktop/tablet ledge invitation. |

Override variables on the elements that use them. `--dabble-paper`, `--dabble-ink` and the two primary font variables have local defaults on `.dabble-skin`; override them there as well as on your host. Tray and canvas defaults inherit from the host. Avoid overriding measured geometry variables. Seek and button paint colors follow the sampled video palette; supply a `painting` with your own stroke colors for a branded starting frame.

## Accessibility

- Every control works with the keyboard. Escape closes menus.
- Two-tone focus rings show keyboard focus.
- Opaque paper controls remain readable over video and paint.
- Captions have an outlined paper label, with native fullscreen handover on iOS.
- Touch controls have targets at least 44 pixels across.
- Phone controls dock under the video and stay visible outside fullscreen.
- Reduced motion disables fades and slides. Forced colors use system colors.

## Run it locally

Install Bun, then:

```sh
git clone https://github.com/milenawebb/dabble-skin.git
cd dabble-skin
bun install
bun run dev
```

Open the local URL printed by Vite. Other commands:

```sh
bun run test
bun run build
bun run preview
```

## Credits

Built on Video.js v10. Demo film made for this project, hosted on Mux. Made by Milena Webb.

## License

Apache License 2.0. See [LICENSE](LICENSE).
