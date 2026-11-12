import { VideoPlayer, Video } from '@videojs/react/video';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { getFrameWidth, getVideoLayout } from './canvas-layout';
import { DabbleSkin } from './DabbleSkin';
import { getDockSpace, getPlayerSource } from './skin-rules';
import { paintFrameWidth } from './paint-rules';
import { usePaint } from './use-paint';
import { PaintTray } from './PaintTray';
import type { Painting } from './painting-data';

type DabblePlayerProps = {
  src: string;
  poster?: string;
  broken?: boolean;
  captions?: { src: string; srcLang: string; label: string };
  paintable?: boolean;
  painting?: Painting;
};

export function DabblePlayer({ src, poster, broken = false, captions, paintable = false, painting }: DabblePlayerProps) {
  const [ready, setReady] = useState(false);
  const source = getPlayerSource(src, broken && ready);
  const canvasRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const paintRef = useRef<HTMLCanvasElement>(null);
  const paint = usePaint(canvasRef, paintRef, paintable, src, painting);
  const [frameWidth, setFrameWidth] = useState(12);
  const [dockSpace, setDockSpace] = useState(0);
  const [metadata, setMetadata] = useState({ src: '', width: 0, height: 0 });
  const layout = metadata.src === source
    ? getVideoLayout(metadata.width, metadata.height)
    : getVideoLayout(0, 0);

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
      const width = canvas.getBoundingClientRect().width;
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
    return () => { observer.disconnect(); document.removeEventListener('fullscreenchange', updateFrame); };
  }, []);

  const geometry = {
    '--dabble-m': `${paintFrameWidth(frameWidth, paint.painting)}px`,
    '--dabble-dock-space': `${dockSpace}px`,
    '--dabble-aspect': layout.aspectRatio,
  } as CSSProperties;

  return (
    <>
    <div ref={canvasRef} className="dabble-canvas" data-painting={paint.painting || undefined} data-stroke-count={paint.count} data-portrait={layout.portrait} style={geometry}>
      <canvas ref={paintRef} className="dabble-paint" aria-hidden="true" />
      <div className="dabble-stage">
        <VideoPlayer poster={poster}>
          <DabbleSkin painting={paint.painting} palette={paint.palette}>
            <Video
              ref={videoRef}
              src={source}
              crossOrigin="anonymous"
              playsInline
            >
              {captions && <track kind="captions" src={captions.src} srcLang={captions.srcLang} label={captions.label} />}
            </Video>
          </DabbleSkin>
        </VideoPlayer>
      </div>
    </div>
    {paintable && <PaintTray paint={paint} src={src} />}
    </>
  );
}