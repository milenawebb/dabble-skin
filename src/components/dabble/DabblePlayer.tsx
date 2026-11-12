import '@videojs/react/video/skin.css';
import { VideoPlayer, VideoSkin, Video } from '@videojs/react/video';

type DabblePlayerProps = {
  src: string;
};

export function DabblePlayer({ src }: DabblePlayerProps) {
  return (
    <VideoPlayer>
      <VideoSkin className="h-full w-full">
        <Video src={src} crossOrigin="anonymous" playsInline />
      </VideoSkin>
    </VideoPlayer>
  );
}