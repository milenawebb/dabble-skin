import { Github } from 'lucide-react';
import { createFileRoute } from "@tanstack/react-router";
import { DabblePlayer } from "@/dabble";
import { useEffect, useId, useRef, useState } from 'react';
import { PREVIEW_SIZES, effectivePreviewSize, visiblePreviewSizes, type PreviewSize } from '@/components/preview-rules';
import { HandIcon } from '@/dabble';
import { PLAYER_KEYS, PAINT_KEYS } from '@/dabble';
import { DabbleLogo, BLOB_PATH } from '@/components/DabbleLogo';
import { PaintedTitle } from '@/components/PaintedTitle';
import { useKeycapFeedback } from '@/components/use-keycap-feedback';
import { Button } from '@/components/ui/button';
import { BrushSample } from '@/components/BrushSample';
import { DEFAULT_PALETTE, type Palette } from '@/dabble';
import { WhoItsFor } from '@/components/WhoItsFor';

const PLAYBACK_ID = 'AAprZsIykh7T29gtsNk02YhBrQRHXTj14ZxbWdc498wA';
const POSTER = `https://image.mux.com/${PLAYBACK_ID}/thumbnail.jpg?time=9&width=1280`;
const SAMPLE_TIMES = [9, 14, 19, 23] as const;
const CAPTIONS = { src: '/captions/dabble-dab.en.vtt', srcLang: 'en', label: 'English' };

const REPO_URL = 'https://github.com/milenawebb/dabble-skin';
function GitHubLink({ text = false, museum = false }: { text?: boolean; museum?: boolean }) {
  const content = text || museum ? <>{museum && <Github aria-hidden="true" size={20} />}<span>View the code on GitHub</span></> : <><svg className="github-blob" aria-hidden="true" viewBox="-17 -17 34 34"><path d={BLOB_PATH} /></svg><Github aria-hidden="true" size={24} /></>;
  const className = museum ? 'github-text github-museum' : text ? 'github-text' : 'github-icon';
  const label = text || museum ? 'View the code on GitHub (opens in a new tab)' : 'Dabble on GitHub (opens in a new tab)';
  return REPO_URL ? <Button asChild variant="ghost" className={className}><a href={REPO_URL} target="_blank" rel="noopener noreferrer" aria-label={label}>{content}</a></Button> : <Button variant="ghost" className={className} aria-disabled="true" aria-label={label}>{content}</Button>;
}
const BRUSHES = [
  { type: 'imp', name: 'Impressionist', line: 'Short dabs of broken color.' },
  { type: 'cub', name: 'Cubist', line: 'Flat, angled facets.' },
  { type: 'drip', name: 'Drip', line: 'Flicks, splashes and runs.' },
  { type: 'rib', name: 'Ribbon', line: 'One long striped sweep.' },
] as const;
const OPEN_ITEMS = [
  'Every control works with the keyboard. Escape closes any menu.',
  'A two-tone focus ring shows where you are.',
  'Controls sit on an opaque paper label, so they stay readable over any video and any paint.',
  'Captions have their own outlined label.',
  'Buttons are at least 44 pixels on touch screens.',
  'On phones the controls dock under the video and stay visible.',
  'With reduced motion on, fades and slides switch off.',
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

function Index() {
  const [palette, setPalette] = useState<Palette>(DEFAULT_PALETTE);
  const tryBrush = (name: string) => {
    const button = playerRef.current?.querySelector<HTMLButtonElement>(`button[aria-label="${name} brush"]`);
    if (!button) return;
    if (button.closest('.phone-paint-panel')?.hasAttribute('inert')) playerRef.current?.querySelector<HTMLButtonElement>('button[aria-label="Start painting"]')?.click();
    button.click();
    playerRef.current?.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    requestAnimationFrame(() => button.focus({ preventScroll: true }));
  };
  const [previewSize, setPreviewSize] = useState<PreviewSize>('desktop');
  const [windowWidth, setWindowWidth] = useState(0);
  const heroTitleId = useId();
  const playerRef = useRef<HTMLDivElement>(null);
  const [soundOptIn, setSoundOptIn] = useState(false);
  const keycapFeedback = useKeycapFeedback(playerRef, soundOptIn);
  const keyRows = (rows: string[][], offset: number) => rows.map(([key = '', action], index) => <div className="keys-row" key={key}><dt><kbd className={`keycap paint-tone-${(index + offset) % 5}`} data-dabbed={keycapFeedback.active.has(key) || undefined} onPointerDown={event => { if (event.isTrusted && event.pointerType !== 'mouse') keycapFeedback.dab(key); }} onPointerEnter={event => { if (event.isTrusted && event.pointerType === 'mouse') keycapFeedback.playSound(); }}><svg className="keycap-blob" aria-hidden="true" viewBox="-17 -17 34 34" preserveAspectRatio="none"><path d={BLOB_PATH} /></svg><span>{key}</span></kbd></dt><dd>{action}</dd></div>);
  useEffect(() => {
    const measure = () => {
      const width = window.innerWidth;
      const wide = matchMedia('(min-width: 900px)').matches;
      setWindowWidth(width);
      setPreviewSize(selected => effectivePreviewSize(selected, wide ? width : 0));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);
  const sizes = visiblePreviewSizes(windowWidth);
  const activeSize = effectivePreviewSize(previewSize, windowWidth);
  const columnWidth = PREVIEW_SIZES.find(size => size.id === activeSize)?.width ?? 1100;
  return (
    <div className="landing">
      <header className="landing-header"><a className="skip-link" href="#player">Skip to player</a></header>
      <main>
        <div className="landing-wall">
          <section className="landing-hero" aria-labelledby={heroTitleId}>
            <h1 id={heroTitleId} className="landing-title"><DabbleLogo size={windowWidth < 640 ? 64 : 110} tone="paper" animate /></h1>
            <p className="landing-tagline">A video player on a canvas. Pick up a brush, paint the frame in your style, then press play.</p>
            {sizes.length > 0 && <DeviceSwitch sizes={sizes} activeSize={activeSize} onChoose={setPreviewSize} />}
            <div ref={playerRef} className="preview-column" id="player" tabIndex={-1} style={{ maxWidth: columnWidth }}>
              <DabblePlayer defaultTrayOpen onPaletteChange={setPalette} onSoundPreferenceChange={setSoundOptIn} playbackId={PLAYBACK_ID} thumbnailSampleTimes={SAMPLE_TIMES} poster={POSTER} captions={CAPTIONS} />
            </div>
            <p className="film-credit">Dab is an original short made for this demo. Video hosted on Mux.</p>
          </section>
        </div>
        <section className="gallery-section gallery-intro" aria-label="About the artwork">
          <aside className="paper-piece museum-label" aria-label="Museum label">
            <p className="museum-name">Dabble</p><p>2026</p><p>A skin for Video.js v10</p><p>Paper, ink, four brushes, six colors</p>
            <GitHubLink museum />
          </aside>
          <article className="paper-piece artist-note">
            <h2><PaintedTitle>Artist's note</PaintedTitle></h2>
            <p>Most player skins are finished before anyone presses play. Dabble starts unfinished on purpose. The video sits on a white stretched canvas, and the frame around it is yours to paint.</p>
            <p>Under the paint it is a plain Video.js v10 skin built from the standard components. Your painting is saved in your own browser, scales with the player, and steps aside completely in fullscreen.</p>
            <p>The film is original too. Dab, the blank canvas who rolls through four colors and stays blank, was made for this page so the video and the player tell the same story.</p>
          </article>
        </section>
        <section className="gallery-section" id="brushes" aria-labelledby="brushes-title">
          <h2 id="brushes-title"><PaintedTitle>Four brushes</PaintedTitle></h2>
          <div className="brush-gallery">
            {BRUSHES.map((brush, index) => <article className={`paper-piece brush-swatch brush-swatch-${index}`} key={brush.type}>
              <BrushSample brush={brush.type} name={brush.name} palette={palette} index={index} />
              <h3><PaintedTitle>{brush.name}</PaintedTitle></h3>
              <p>{brush.line}</p>
              <Button variant="ghost" className="brush-try" aria-label={`Try ${brush.name} brush`} onClick={() => tryBrush(brush.name)}>Try it</Button>
            </article>)}
          </div>
          <p className="gallery-caption">Named after ways of painting, not after painters.</p>
        </section>
        <WhoItsFor />
        <section className="gallery-section" id="open" aria-labelledby="open-title">
          <div className="paper-piece gallery-sign">
            <h2 id="open-title"><PaintedTitle>Open to all</PaintedTitle></h2>
            <ul className="open-checklist">{OPEN_ITEMS.map((line, index) => <li key={line}><svg className={`check-dab paint-tone-${index}`} aria-hidden="true" viewBox="-17 -17 34 34"><path d={BLOB_PATH} /></svg><span>{line}</span></li>)}</ul>
          </div>
        </section>
        <section className="gallery-section gallery-keys" id="keys" aria-labelledby="keys-title">
          <h2 id="keys-title"><PaintedTitle>Or use the keys</PaintedTitle></h2>
          <dl className="loose-keys" aria-label="Player shortcuts">{keyRows(PLAYER_KEYS, 0)}</dl>
          <svg className="keys-divider" aria-hidden="true" viewBox="0 0 1100 10" preserveAspectRatio="none"><path d="M2 5Q280 2 540 6T1098 4" /></svg>
          <dl className="loose-keys" aria-label="Painting shortcuts">{keyRows(PAINT_KEYS, 2)}</dl>
        </section>
        <section className="gallery-section" id="developers" aria-labelledby="developers-title">
          <h2 id="developers-title"><PaintedTitle>For developers</PaintedTitle></h2>
          <div className="developer-pieces">
            <article className="paper-piece viewer-note"><h3>For viewers</h3><p>Pick a brush and paint the frame.</p><p>Your painting is saved in your browser.</p><p>Clear it or undo it any time.</p></article>
            <article className="paper-piece owner-note"><h3>For site owners</h3><p>Turn painting off with one setting.</p><p>Set the painting every visitor starts with, in your brand colors.</p><p>Turn sounds on or off.</p></article>
          </div>
          <pre className="use-code"><code>{USAGE_CODE}</code></pre>
          <ul className="use-props">{PROPS.map(([name, line]) => <li key={name}><code>{name}</code><span>{line}</span></li>)}</ul>
          <GitHubLink text />
        </section>
      </main>
      <footer className="landing-footer">
        <svg className="footer-stroke" aria-hidden="true" viewBox="0 0 1100 30" preserveAspectRatio="none"><path d="M2 12L18 7L11 5Q270 1 530 8T1091 5L1085 12L1098 15L1088 20Q800 28 552 21T5 23L12 18Z" /></svg>
        <DabbleLogo size={44} tone="paper" />
        <GitHubLink />
        <div className="landing-footer-note">
          <p>Built on Video.js v10. Apache License 2.0.</p>
          <p>Made by Milena Webb for the Video.js v10 Skins Design Challenge, 2026.</p>
        </div>
      </footer>
    </div>
  );
}
