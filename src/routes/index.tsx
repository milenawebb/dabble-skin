import { createFileRoute } from "@tanstack/react-router";
import { DabblePlayer } from "@/components/dabble/DabblePlayer";
import { useEffect, useId, useRef, useState } from 'react';
import { PREVIEW_SIZES, effectivePreviewSize, visiblePreviewSizes, type PreviewSize } from '@/components/dabble/preview-rules';
import { HandIcon } from '@/components/dabble/HandDrawings';
import { PLAYER_KEYS, PAINT_KEYS } from '@/components/dabble/KeysPanel';
import { DabbleLogo, BLOB_PATH } from '@/components/DabbleLogo';
import { PaintedTitle } from '@/components/PaintedTitle';
import { useKeycapFeedback } from '@/components/dabble/use-keycap-feedback';
import { Button } from '@/components/ui/button';

const PLAYBACK_ID = 'AAprZsIykh7T29gtsNk02YhBrQRHXTj14ZxbWdc498wA';
const POSTER = `https://image.mux.com/${PLAYBACK_ID}/thumbnail.jpg?time=9&width=1280`;
const SAMPLE_TIMES = [9, 14, 19, 23] as const;
const CAPTIONS = { src: '/captions/dabble-dab.en.vtt', srcLang: 'en', label: 'English' };

const NAV_LINKS = [
  { href: '#player', label: 'Player' },
  { href: '#keys', label: 'Keys' },
  { href: '#access', label: 'Access' },
  { href: '#notes', label: 'Notes' },
];

const ACCESS_CARDS = [
  {
    word: 'Tab', color: '#0057FF', onDark: true, rotate: -14,
    title: 'Keyboard first',
    text: 'Every control is reachable with Tab and works with Space, Enter and the arrow keys. Escape closes any menu. A two-tone ring shows where you are.',
  },
  {
    word: 'Aa', color: '#FFB800', onDark: false, rotate: 9,
    title: 'Readable on any footage',
    text: 'Controls sit on an opaque paper label and captions have their own outlined label, so they stay clear on bright or dark video and over any paint.',
  },
  {
    word: '44', color: '#00D1B2', onDark: false, rotate: -7,
    title: 'Room for a thumb',
    text: 'On touch screens every button is at least 44 pixels. On phones the controls dock under the video in two rows and stay visible.',
  },
  {
    word: 'Calm', color: '#FF2E93', onDark: false, rotate: 16,
    title: 'Calm on request',
    text: 'With reduced motion turned on, fades and slides switch off.',
  },
];

const LOGO_SWATCHES = [
  { color: '#2B5FC2', name: 'Blue' },
  { color: '#E8973A', name: 'Orange' },
  { color: '#6FE3D2', name: 'Mint' },
  { color: '#5B2BE0', name: 'Purple' },
  { color: '#E6B84F', name: 'Yellow' },
];
const PAINT_SWATCHES = [
  { color: '#0057FF', name: 'Blue' },
  { color: '#00B7FF', name: 'Sky' },
  { color: '#00D1B2', name: 'Turquoise' },
  { color: '#FFB800', name: 'Gold' },
  { color: '#FF5A1F', name: 'Orange' },
  { color: '#FF2E93', name: 'Pink' },
];

const PROPS: Array<[string, string]> = [
  ['playbackId', 'Mux playback ID. Plays through Mux, and paintings are saved under this ID.'],
  ['src', 'Direct video URL, used when there is no playbackId. Default: \'\'.'],
  ['poster', 'Poster image shown before play. Optional.'],
  ['captions', 'A captions track: { src, srcLang, label }. Optional.'],
  ['paintable', 'Show the painting tools. Default: true.'],
  ['painting', 'A starting painting; a viewer\'s own saved painting wins over it. Optional.'],
  ['sounds', 'Offer the sound toggle and interface sounds. Default: false.'],
];

const USAGE_CODE = `<DabblePlayer
  playbackId="YOUR_MUX_PLAYBACK_ID"
  captions={{ src: '/captions/en.vtt', srcLang: 'en', label: 'English' }}
/>`;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dabble: paint the frame around your video" },
      { name: "description", content: "A Video.js v10 skin where the video sits on a white canvas and every viewer paints the frame." },
      { property: "og:title", content: "Dabble: paint the frame around your video" },
      { property: "og:description", content: "A Video.js v10 skin where the video sits on a white canvas and every viewer paints the frame." },
      { property: "og:image", content: POSTER },
      { name: "twitter:image", content: POSTER },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function DeviceSwitch({ sizes, activeSize, onChoose }: { sizes: typeof PREVIEW_SIZES[number][]; activeSize: PreviewSize; onChoose: (size: PreviewSize) => void }) {
  const labelId = useId();
  const group = useRef<HTMLDivElement>(null);
  const move = (direction: 1 | -1) => {
    const index = sizes.findIndex(size => size.id === activeSize);
    const next = sizes[(index + direction + sizes.length) % sizes.length];
    if (!next) return;
    onChoose(next.id);
    group.current?.querySelector<HTMLButtonElement>(`[data-size="${next.id}"]`)?.focus();
  };
  return (
    <div className="device-switch" role="radiogroup" aria-labelledby={labelId} ref={group}
      onKeyDown={event => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); move(1); }
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); move(-1); }
      }}>
      <span className="sr-only" id={labelId}>Preview size</span>
      {sizes.map(size => (
        <Button variant="ghost" key={size.id} type="button" role="radio" aria-checked={activeSize === size.id}
          aria-label={size.label} tabIndex={activeSize === size.id ? 0 : -1} data-size={size.id} className="device-choice"
          onClick={() => onChoose(size.id)}>
          <span className="device-sketch" aria-hidden="true">
            <svg className="device-blob" viewBox="-17 -17 34 34"><path d={BLOB_PATH} /></svg>
            <HandIcon kind={size.icon} />
          </span>
          <span className="device-word" aria-hidden="true">{size.label}
            <svg className="device-underline" viewBox="0 0 60 6" preserveAspectRatio="none"><path d="M2 3.6c17-2.4 39-2.2 56 .4" /></svg>
          </span>
        </Button>
      ))}
    </div>
  );
}

function DripDivider() {
  return (
    <svg className="drip-divider" aria-hidden="true" height="96" width="100%">
      <svg width="100%" height="26" viewBox="0 0 1440 26" preserveAspectRatio="none">
        <path className="drip-wall" d="M0 0H1440V19C1300 23 1230 15 1100 19S890 24 720 19 530 16 390 20 160 23 0 19Z" />
      </svg>
      {[{ x: '8%', width: 8, length: 44 }, { x: '23%', width: 10, length: 70 }, { x: '36%', width: 6, length: 20, color: 'teal' }, { x: '57%', width: 9, length: 55 }, { x: '69%', width: 7, length: 32 }, { x: '83%', width: 8, length: 14, color: 'orange' }, { x: '95%', width: 10, length: 62 }].map(run => <svg key={run.x} x={run.x} y="17" width={run.width + 2} height={run.length + 3} viewBox={`0 0 ${run.width + 2} ${run.length + 3}`}><path className={`drip-${run.color ?? 'wall'}`} d={`M2 0H${run.width}L${run.width} ${run.length - 8}C${run.width + 3} ${run.length + 3} 0 ${run.length + 3} 1 ${run.length - 8}Z`} /></svg>)}
    </svg>
  );
}

function Index() {
  const [previewSize, setPreviewSize] = useState<PreviewSize>('desktop');
  const [windowWidth, setWindowWidth] = useState(1024);
  const heroTitleId = useId();
  const playerRef = useRef<HTMLDivElement>(null);
  const [soundOptIn, setSoundOptIn] = useState(false);
  const keycapFeedback = useKeycapFeedback(playerRef, soundOptIn);
  const keyRows = (rows: string[][], offset: number) => rows.map(([key = '', action], index) => <div className="keys-row" key={key}><dt><kbd className={`keycap paint-tone-${(index + offset) % 5}`} data-dabbed={keycapFeedback.active.has(key) || undefined} onPointerEnter={event => { if (event.isTrusted && event.pointerType === 'mouse') keycapFeedback.playSound(); }}><svg className="keycap-blob" aria-hidden="true" viewBox="-17 -17 34 34" preserveAspectRatio="none"><path d={BLOB_PATH} /></svg><span>{key}</span></kbd></dt><dd>{action}</dd></div>);
  useEffect(() => {
    const measure = () => setWindowWidth(window.innerWidth);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);
  const sizes = visiblePreviewSizes(windowWidth);
  const activeSize = effectivePreviewSize(previewSize, windowWidth);
  const columnWidth = PREVIEW_SIZES.find(size => size.id === activeSize)?.width ?? 1100;
  return (
    <div className="landing">
      <a className="skip-link" href="#player">Skip to player</a>
      <div className="landing-wall">
        <header className="landing-header">
          <DabbleLogo size={28} tone="paper" />
          <nav className="landing-nav" aria-label="Page sections">
            {NAV_LINKS.map(link => <a key={link.href} href={link.href}><PaintedTitle>{link.label}</PaintedTitle></a>)}
          </nav>
        </header>
      </div>
      <main>
        <div className="landing-wall">
          <section className="landing-hero" aria-labelledby={heroTitleId}>
            <p className="landing-pill">Video.js v10 skin</p>
            <h1 id={heroTitleId} className="landing-title"><DabbleLogo size={windowWidth < 640 ? 64 : 110} tone="paper" animate /></h1>
            <p className="landing-tagline">A video player on a blank canvas. Press play, then pick up a brush and paint the frame.</p>
            {sizes.length > 0 && <DeviceSwitch sizes={sizes} activeSize={activeSize} onChoose={setPreviewSize} />}
            <div ref={playerRef} className="preview-column" id="player" tabIndex={-1} style={{ maxWidth: columnWidth }}>
              <DabblePlayer defaultTrayOpen onSoundPreferenceChange={setSoundOptIn} sounds playbackId={PLAYBACK_ID} thumbnailSampleTimes={SAMPLE_TIMES} poster={POSTER} captions={CAPTIONS} />
            </div>
            <p className="film-credit">Dab is an original short made for this demo. Video hosted on Mux.</p>
          </section>
          <section className="landing-keys" id="keys" aria-labelledby="keys-title">
            <div className="keys-card">
              <h2 id="keys-title"><PaintedTitle>Keyboard</PaintedTitle></h2>
              <div className="keys-grid">
                <section className="keys-group keys-group--player" aria-label="Player">
                  <h3>Player</h3>
                  <dl>{keyRows(PLAYER_KEYS, 0)}</dl>
                </section>
                <section className="keys-group" aria-label="Painting">
                  <h3>Painting</h3>
                  <dl>{keyRows(PAINT_KEYS, 2)}</dl>
                </section>
              </div>
            </div>
          </section>
        </div>
        <DripDivider />
        <div className="landing-paper">
          <section className="landing-section" id="access" aria-labelledby="access-title">
            <p className="landing-label">01 / Access</p>
            <h2 id="access-title"><PaintedTitle>Built for every viewer</PaintedTitle></h2>
            <div className="access-grid">
              {ACCESS_CARDS.map(card => (
                <article className="access-card" key={card.title}>
                  <span className="access-blob" aria-hidden="true">
                    <svg viewBox="-17 -17 34 34" style={{ transform: `rotate(${card.rotate}deg)` }}><path d={BLOB_PATH} fill={card.color} /></svg>
                    <span className={`access-word${card.onDark ? ' access-word--paper' : ''}`}>{card.word}</span>
                  </span>
                  <h3><PaintedTitle>{card.title}</PaintedTitle></h3>
                  <p>{card.text}</p>
                </article>
              ))}
            </div>
          </section>
          <section className="landing-section" id="notes" aria-labelledby="notes-title">
            <p className="landing-label">02 / Notes</p>
            <h2 id="notes-title"><PaintedTitle>Why a canvas</PaintedTitle></h2>
            <div className="notes-grid">
              <div className="notes-copy">
                <p>Most player skins are finished before anyone presses play. Dabble starts blank on purpose. The video sits on a white stretched canvas, and the frame around it is yours to paint with four brushes inspired by four ways of painting.</p>
                <p>Under the paint it is a plain Video.js v10 skin built from the standard components. Your painting is saved in your own browser, scales with the player, and steps aside completely in fullscreen.</p>
                <p>The film is original too. Dab, the blank canvas who rolls through four colors and stays blank, was made for this page so the video and the player tell the same story.</p>
              </div>
              <aside className="notes-aside" aria-label="Colors and type">
                <div className="notes-swatches">
                  <h3>Logo</h3>
                  <ul>{LOGO_SWATCHES.map(swatch => <li key={swatch.color}><span style={{ backgroundColor: swatch.color }} aria-hidden="true" />{swatch.name}</li>)}</ul>
                  <h3>Paint</h3>
                  <ul>{PAINT_SWATCHES.map(swatch => <li key={swatch.color}><span style={{ backgroundColor: swatch.color }} aria-hidden="true" />{swatch.name}</li>)}</ul>
                </div>
                <div className="notes-type">
                  <p className="type-serif">Instrument Serif</p>
                  <p className="type-sans">DM Sans</p>
                  <p className="type-hand">Caveat</p>
                </div>
              </aside>
            </div>
          </section>
          <section className="landing-section" id="use" aria-labelledby="use-title">
            <p className="landing-label">03 / Use it</p>
            <h2 id="use-title"><PaintedTitle>Drop it in</PaintedTitle></h2>
            <pre className="use-code"><code>{USAGE_CODE}</code></pre>
            <ul className="use-props">
              {PROPS.map(([name, line]) => <li key={name}><code>{name}</code><span>{line}</span></li>)}
            </ul>
          </section>
        </div>
      </main>
      <footer className="landing-footer">
        <DabbleLogo size={44} tone="ink" />
        <div className="landing-footer-note">
          <p>Built on Video.js v10. Apache License 2.0.</p>
          <p>Made by Milena Webb for the Video.js v10 Skins Design Challenge, 2026.</p>
        </div>
      </footer>
    </div>
  );
}
