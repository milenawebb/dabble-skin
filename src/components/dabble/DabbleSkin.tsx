import { Container, Controls, PlayButton, TimeSlider, Time, MuteButton, VolumeSlider, CaptionsButton, PlaybackRateButton, FullscreenButton, Hotkey, StatusAnnouncer } from '@videojs/react';
import { usePlayer } from '@videojs/react/video';
import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';
import './dabble-skin.css';
import { DABBLE_HOTKEYS, getControlSize } from './skin-rules';

function Blob() { return <span className="dabble-blob" aria-hidden="true" />; }

function Icon({ kind }: { kind: 'play' | 'pause' | 'replay' | 'volume' | 'muted' | 'fullscreen' | 'exit' }) {
  const paths = {
    play: <path d="m8 5 11 7-11 7Z" />,
    pause: <><path d="M8 5v14M16 5v14" /></>,
    replay: <><path d="M4 10a8 8 0 1 1 2 8M4 4v6h6" /></>,
    volume: <><path d="M11 4 6 8H3v8h3l5 4ZM15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14" /></>,
    muted: <><path d="M11 4 6 8H3v8h3l5 4ZM16 9l5 6m0-6-5 6" /></>,
    fullscreen: <path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6" />,
    exit: <path d="M3 9h6V3m6 0v6h6M9 21v-6H3m18 0h-6v6" />,
  };
  return <svg className="dabble-icon" viewBox="0 0 24 24" aria-hidden="true">{paths[kind]}</svg>;
}

export function DabbleSkin({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('large');
  const progress = usePlayer((state) => state.duration > 0 ? Math.min(100, Math.max(0, state.currentTime / state.duration * 100)) : 0);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = root?.closest('.dabble-canvas');
    if (!root || !canvas) return;
    const measure = () => {
      const width = (document.fullscreenElement === root ? root : canvas).getBoundingClientRect().width;
      setSize(getControlSize(width));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(canvas);
    observer.observe(root);
    document.addEventListener('fullscreenchange', measure);
    return () => { observer.disconnect(); document.removeEventListener('fullscreenchange', measure); };
  }, []);

  const play = <PlayButton className="dabble-button dabble-play" render={(props, state) => <button {...props}><Blob /><Icon kind={state.ended ? 'replay' : state.paused ? 'play' : 'pause'} /></button>} />;
  const mute = <MuteButton className="dabble-button dabble-mute" render={(props, state) => <button {...props} data-on={state.muted}><Blob /><Icon kind={state.volumeLevel === 'off' ? 'muted' : 'volume'} /></button>} />;
  const captions = <CaptionsButton label="Captions" className="dabble-button dabble-captions" render={(props, state) => <button {...props} data-on={state.subtitlesShowing}><Blob /><span aria-hidden="true">CC</span></button>} />;
  const speed = <PlaybackRateButton label="Playback speed" className="dabble-button dabble-speed" render={(props, state) => <button {...props}><Blob /><span aria-hidden="true">{state.rate}x</span></button>} />;
  const fullscreen = <FullscreenButton className="dabble-button dabble-fullscreen" render={(props, state) => <button {...props}><Blob /><Icon kind={state.fullscreen ? 'exit' : 'fullscreen'} /></button>} />;
  const seek = <TimeSlider.Root className="dabble-slider dabble-seek"><TimeSlider.Track className="dabble-track"><TimeSlider.Buffer className="dabble-buffer" /><TimeSlider.Fill className="dabble-fill" /></TimeSlider.Track><TimeSlider.Thumb className="dabble-thumb" /></TimeSlider.Root>;
  const time = <span className="dabble-time"><Time.Value type="current" /><span aria-hidden="true">/</span><Time.Value type="duration" /></span>;
  const volume = <VolumeSlider.Root className="dabble-slider dabble-volume"><VolumeSlider.Track className="dabble-track"><VolumeSlider.Fill className="dabble-fill" /></VolumeSlider.Track><VolumeSlider.Thumb className="dabble-thumb" /></VolumeSlider.Root>;

  return (
    <Container ref={rootRef} className="dabble-skin" data-size={size}>
      {children}
      <Controls.Root>
        <Controls.Content className="dabble-bar">
          {size === 'small' ? <><Controls.Group className="dabble-row" aria-label="Timeline">{seek}{time}</Controls.Group><Controls.Group className="dabble-row dabble-buttons-row" aria-label="Playback controls">{play}{mute}{captions}{speed}{fullscreen}</Controls.Group></> : <Controls.Group className="dabble-row" aria-label="Playback controls">{play}{seek}{time}{mute}{volume}{captions}{speed}{fullscreen}</Controls.Group>}
        </Controls.Content>
      </Controls.Root>
      <div className="dabble-progress" aria-hidden="true" style={{ '--dabble-progress': `${progress}%` } as CSSProperties}><span className="dabble-progress-fill" /></div>
      {DABBLE_HOTKEYS.map((binding) => <Hotkey key={binding.keys} {...binding} />)}
      <StatusAnnouncer className="dabble-announcer" />
    </Container>
  );
}