// @refresh reset
// Remount after edits: nested paint and sound hooks must not reuse older hook slots.
import { VideoPlayer, Video } from '@videojs/react/video';
import { MuxVideo } from '@videojs/react/media/mux-video';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { getFrameWidth, getVideoLayout } from './canvas-layout';
import { DabbleSkin } from './DabbleSkin';
import { getDockSpace, getPlayerSource } from './skin-rules';
import { paintFrameWidth } from './paint-rules';
import { usePaint } from './use-paint';
import { PaintTray } from './PaintTray';
import type { Painting } from './painting-data';
import { useFeedback } from './use-feedback';
import { useBrushCursor } from './use-brush-cursor';

type DabblePlayerProps = {
  src?: string;
  playbackId?: string;
  thumbnailSampleTimes?: readonly number[];
  poster?: string;
  broken?: boolean;
  captions?: { src: string; srcLang: string; label: string };
  paintable?: boolean;
  ownerTools?: boolean;
  painting?: Painting;
  sounds?: boolean;
  defaultTrayOpen?: boolean;
  onSoundPreferenceChange?: (optedIn: boolean) => void;
};

export function DabblePlayer({ src = '', playbackId, thumbnailSampleTimes, poster, broken = false, captions, paintable = true, ownerTools = false, painting, sounds = false, defaultTrayOpen = false, onSoundPreferenceChange }: DabblePlayerProps) {
  const [ready, setReady] = useState(false);
  const source = getPlayerSource(playbackId ? `https://stream.mux.com/${playbackId}.m3u8` : src, broken && ready);
  const muxSource = useMemo(() => ({
    playbackId,
    // The supplied VTT is authoritative: do not import the asset's generated HLS subtitles.
    ...(captions ? { engine: { hlsJs: { enableWebVTT: false, enableIMSC1: false } } } : {}),
  }), [playbackId, captions]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const paintRef = useRef<HTMLCanvasElement>(null);
  const paint = usePaint(canvasRef, paintRef, paintable, src, painting, playbackId, thumbnailSampleTimes);
  useBrushCursor(canvasRef, paintRef, paint.size, paint.palette[paint.color] ?? paint.palette[0], paint.brush);
  const [controlsState, setControlsState] = useState({ visible: true, paused: true });
  const trayActivity = useCallback((active: boolean) => { canvasRef.current?.dispatchEvent(new CustomEvent('dabble-tray-activity', { detail: active })); }, []);
  const [soundChoice, setSoundChoice] = useState(sounds);
  const [soundOptIn, setSoundOptIn] = useState(false);
  const automaticSound = useFeedback(canvasRef, soundChoice, paint.painting, paint.brush);
  useEffect(() => {
    if (!sounds) return;
    try { const saved = localStorage.getItem('dabble-sounds'); setSoundChoice(saved !== 'off'); setSoundOptIn(saved === 'on'); } catch { /* Storage is optional. */ }
  }, [sounds]);
  useEffect(() => { onSoundPreferenceChange?.(soundChoice && soundOptIn); }, [soundChoice, soundOptIn, onSoundPreferenceChange]);
  const toggleSounds = () => {
    const next = !soundChoice;
    setSoundChoice(next);
    setSoundOptIn(next);
    try { localStorage.setItem('dabble-sounds', next ? 'on' : 'off'); } catch { /* Storage is optional. */ }
  };
  const [frameWidth, setFrameWidth] = useState(12);
  const [canvasBox, setCanvasBox] = useState({ width: 0, left: 0, top: 0 });
  const [dockSpace, setDockSpace] = useState(0);
  const [metadata, setMetadata] = useState({ src: '', width: 0, height: 0 });
  const stageInput = canvasBox.width > 0 ? { canvasWidth: canvasBox.width, canvasLeft: canvasBox.left, canvasTop: canvasBox.top, frame: paintFrameWidth(frameWidth, paint.painting) } : undefined;
  const layout = metadata.src === source
    ? getVideoLayout(metadata.width, metadata.height, stageInput)
    : getVideoLayout(0, 0, stageInput);

  useEffect(() => {
    // Apply the broken source after the media adapter has attached its listeners.
    setReady(true);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const readMetadata = () => {
      if (video.videoWidth <= 0 || video.videoHeight <= 0) return;
      setMetadata({ src: source, width: video.videoWidth, height: video.videoHeight });
    };
    // Metadata can arrive before hydration attaches React's event handlers.
    readMetadata();
    video.addEventListener('loadedmetadata', readMetadata);
    video.addEventListener('resize', readMetadata);
    return () => {
      video.removeEventListener('loadedmetadata', readMetadata);
      video.removeEventListener('resize', readMetadata);
    };
  }, [source]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const bar = canvas.querySelector<HTMLElement>('.dabble-bar');
    const updateFrame = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      setCanvasBox(previous => previous.width === width && previous.left === rect.left && previous.top === rect.top ? previous : { width, left: rect.left, top: rect.top });
      setFrameWidth(getFrameWidth(width));
      // Preserve the page's reserved space while its inner Container is fullscreen.
      if (!canvas.querySelector('.dabble-skin:fullscreen')) {
        setDockSpace(getDockSpace(width, bar?.getBoundingClientRect().height ?? 0));
      }
    };
    updateFrame();
    const observer = new ResizeObserver(updateFrame);
    observer.observe(canvas);
    if (bar) observer.observe(bar);
    document.addEventListener('fullscreenchange', updateFrame);
    window.addEventListener('resize', updateFrame);
    return () => { observer.disconnect(); document.removeEventListener('fullscreenchange', updateFrame); window.removeEventListener('resize', updateFrame); };
  }, []);

  const geometry = {
    '--dabble-m': `${paintFrameWidth(frameWidth, paint.painting)}px`,
    '--dabble-dock-space': `${dockSpace}px`,
    '--dabble-aspect': layout.aspectRatio,
    ...(layout.stage ? { '--dabble-stage-width': `${layout.stage.width}px`, '--dabble-stage-height': `${layout.stage.height}px`, '--dabble-stage-left': `${layout.stage.left}px`, '--dabble-stage-top': `${layout.stage.top}px` } : {}),
  } as CSSProperties;

  return (
    <>
    <div ref={canvasRef} className="dabble-canvas" data-painting={paint.painting || undefined} data-stroke-count={paint.count} data-portrait={layout.portrait} style={geometry}>
      <canvas ref={paintRef} className="dabble-paint" aria-hidden="true" />
      <div className="dabble-stage">
        <VideoPlayer key={broken && ready ? 'broken' : 'normal'} poster={poster}>
          <DabbleSkin paintable={paintable} brushSize={paint.size} painting={paint.painting} palette={paint.palette} onControlsState={setControlsState}>
            {playbackId && !(broken && ready) ? <MuxVideo ref={videoRef} source={muxSource} crossOrigin="anonymous" playsInline>
              {captions && <track kind="captions" src={captions.src} srcLang={captions.srcLang} label={captions.label} />}
            </MuxVideo> : <Video
              ref={videoRef}
              src={source}
              preload={broken ? 'none' : 'metadata'}
              crossOrigin="anonymous"
              playsInline
            >
              {captions && <track kind="captions" src={captions.src} srcLang={captions.srcLang} label={captions.label} />}
            </Video>}
          </DabbleSkin>
        </VideoPlayer>
      </div>
    </div>
    {paintable && <PaintTray defaultTrayOpen={defaultTrayOpen} paint={paint} src={src} ownerTools={ownerTools} {...(playbackId ? { playbackId } : {})} sounds={soundChoice} toggleSounds={toggleSounds} automaticSound={automaticSound} controlsState={controlsState} onActivity={trayActivity} />}
    </>
  );
}