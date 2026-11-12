import { VideoPlayer, Video } from '@videojs/react/video';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { getFrameWidth, getVideoLayout } from './canvas-layout';
import { DabbleSkin } from './DabbleSkin';

type DabblePlayerProps = {
  src: string;
};

export function DabblePlayer({ src }: DabblePlayerProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [frameWidth, setFrameWidth] = useState(12);
  const [metadata, setMetadata] = useState({ src: '', width: 0, height: 0 });
  const layout = metadata.src === src
    ? getVideoLayout(metadata.width, metadata.height)
    : getVideoLayout(0, 0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const readMetadata = () => {
      if (video.videoWidth <= 0 || video.videoHeight <= 0) return;
      setMetadata({ src, width: video.videoWidth, height: video.videoHeight });
    };
    // Metadata can arrive before hydration attaches React's event handlers.
    readMetadata();
    video.addEventListener('loadedmetadata', readMetadata);
    video.addEventListener('resize', readMetadata);
    return () => {
      video.removeEventListener('loadedmetadata', readMetadata);
      video.removeEventListener('resize', readMetadata);
    };
  }, [src]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const updateFrame = () => setFrameWidth(getFrameWidth(canvas.getBoundingClientRect().width));
    updateFrame();
    const observer = new ResizeObserver(updateFrame);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  const geometry = {
    '--dabble-m': `${frameWidth}px`,
    '--dabble-aspect': layout.aspectRatio,
  } as CSSProperties;

  return (
    <div ref={canvasRef} className="dabble-canvas" data-portrait={layout.portrait} style={geometry}>
      <canvas className="dabble-paint" aria-hidden="true" />
      <div className="dabble-stage">
        <VideoPlayer>
          <DabbleSkin>
            <Video
              ref={videoRef}
              src={src}
              crossOrigin="anonymous"
              playsInline
            />
          </DabbleSkin>
        </VideoPlayer>
      </div>
    </div>
  );
}