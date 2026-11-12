import { VideoPlayer, Video } from '@videojs/react/video';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { getFrameWidth, getVideoLayout } from './canvas-layout';
import { DabbleSkin } from './DabbleSkin';
import { getDockSpace, getPlayerSource } from './skin-rules';

type DabblePlayerProps = {
  src: string;
  poster?: string;
  broken?: boolean;
  captions?: { src: string; srcLang: string; label: string };
};

export function DabblePlayer({ src, poster, broken = false, captions }: DabblePlayerProps) {
  const [ready, setReady] = useState(false);
  const source = getPlayerSource(src, broken && ready);
  const canvasRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
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
    '--dabble-m': `${frameWidth}px`,
    '--dabble-dock-space': `${dockSpace}px`,
    '--dabble-aspect': layout.aspectRatio,
  } as CSSProperties;

  return (
    <div ref={canvasRef} className="dabble-canvas" data-portrait={layout.portrait} style={geometry}>
      <canvas className="dabble-paint" aria-hidden="true" />
      <div className="dabble-stage">
        <VideoPlayer poster={poster}>
          <DabbleSkin>
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
  );
}