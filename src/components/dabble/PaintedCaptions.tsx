import { useEffect, useRef, useState, type RefObject } from 'react';
import { usePlayer } from '@videojs/react/video';
import { captionBottom, captionsOverlap, fittedVideoRect, plainCueText } from './caption-rules';

type ManagedTrack = TextTrack & { __dabblePaintedCaption?: boolean; __dabbleCaptionOn?: boolean };

type Cue = { text: string; startTime: number; endTime: number };

export function PaintedCaptions({ rootRef, captionId, docked, barEnabled, phoneHost }: { rootRef: RefObject<HTMLDivElement | null>; captionId: string; docked: boolean; barEnabled: boolean; phoneHost?: HTMLDivElement | null }) {
  const showing = usePlayer(state => state.subtitlesShowing);
  const controlsVisible = usePlayer(state => state.controlsVisible);
  const nativeFullscreen = useRef(false);
  const layerRef = useRef<HTMLDivElement>(null);
  const [cues, setCues] = useState<Cue[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    const video = root?.querySelector('video');
    const layer = layerRef.current;
    const bar = (docked && phoneHost ? phoneHost : root)?.querySelector<HTMLElement>('.dabble-bar');
    if (!root || !video || !layer || !bar) return;
    const style = document.createElement('style');
    document.head.append(style);
    const tracked = new Set<ManagedTrack>();
    const unreadable = new Set<ManagedTrack>();
    let custom = false;
    let frame = 0;
    let lastCSS = '';
    let lastCues = '';
    let updating = false;
    const update = () => {
      if (updating) return;
      updating = true;
      try {
        const tracks = Array.from(video.textTracks) as ManagedTrack[];
        tracks.forEach(track => {
          if (!tracked.has(track)) {
            tracked.add(track); track.addEventListener('cuechange', update);
            if (track.kind === 'captions' || track.kind === 'subtitles') {
              track.__dabbleCaptionOn = track.mode === 'showing';
              track.__dabblePaintedCaption = true;
            }
          }
        });
        const selected = tracks.filter(track => track.__dabblePaintedCaption && track.__dabbleCaptionOn);
        // Hidden tracks must load before deciding that cue access is unavailable.
        for (const track of tracks.filter(track => track.__dabblePaintedCaption)) {
          const mode = track.__dabbleCaptionOn ? (nativeFullscreen.current || unreadable.has(track) ? 'showing' : 'hidden') : 'disabled';
          if (track.mode !== mode) track.mode = mode;
        }
        let readable = true;
        const next = selected.flatMap(track => {
          if (track.activeCues === null) {
            const element = Array.from(video.querySelectorAll('track')).find(element => element.track === track);
            if (element?.readyState === 2) { readable = false; unreadable.add(track); }
            return [];
          }
          return Array.from(track.activeCues).map(cue => {
            const vtt = cue as VTTCue;
            if (typeof vtt.text !== 'string') throw new Error('Unreadable caption');
            return { text: plainCueText(vtt), startTime: vtt.startTime, endTime: vtt.endTime };
          });
        }).sort((a, b) => a.startTime - b.startTime);
        custom = readable && !nativeFullscreen.current;
        if (!readable) selected.forEach(track => { if (track.mode !== 'showing') track.mode = 'showing'; });
        const signature = JSON.stringify(custom ? next : []);
        if (signature !== lastCues) { lastCues = signature; setCues(custom ? next : []); }
      } catch {
        custom = false;
        tracked.forEach(track => { if (track.__dabbleCaptionOn) { unreadable.add(track); if (track.mode !== 'showing') track.mode = 'showing'; } });
        lastCues = ''; setCues([]);
      } finally { updating = false; }
      root.dataset['captionRenderer'] = custom ? 'painted' : 'native';
    };
    const beginFullscreen = () => { nativeFullscreen.current = true; update(); };
    const endFullscreen = () => { nativeFullscreen.current = false; update(); };
    const measure = () => {
      const rootBox = root.getBoundingClientRect();
      const videoBox = fittedVideoRect(video.getBoundingClientRect(), video.videoWidth, video.videoHeight);
      const barShowing = barEnabled && (controlsVisible || Boolean(bar.querySelector(':focus-visible')) || docked);
      const bottom = captionBottom(videoBox, bar.getBoundingClientRect().top, barShowing, docked);
      layer.style.left = `${videoBox.left + videoBox.width / 2 - rootBox.left}px`;
      layer.style.bottom = `${rootBox.bottom - bottom}px`;
      layer.style.maxWidth = `${Math.max(0, Math.min(videoBox.width * .86, videoBox.width - 48))}px`;
      const boxes = Array.from(layer.children).map(element => element.getBoundingClientRect());
      const panels = root.querySelectorAll<HTMLElement>('.dabble-speed-menu, .dabble-volume-popup, .dabble-keys-panel');
      const overlap = Array.from(panels).some(panel => {
        const computed = getComputedStyle(panel);
        return !panel.hidden && computed.display !== 'none' && computed.visibility !== 'hidden' && Number(computed.opacity) > 0 && panel.getClientRects().length > 0 && boxes.some(box => captionsOverlap(box, panel.getBoundingClientRect()));
      });
      const tooTall = boxes.some(box => box.top < videoBox.top + 8);
      layer.style.visibility = overlap || tooTall ? 'hidden' : 'visible';
      const tokens = getComputedStyle(root);
      const forced = window.matchMedia('(forced-colors: active)').matches;
      const color = custom ? 'transparent' : forced ? 'CanvasText' : tokens.getPropertyValue('--dabble-ink');
      const background = custom ? 'transparent' : forced ? 'Canvas' : tokens.getPropertyValue('--dabble-paper');
      const css = `[data-caption-id="${captionId}"] video::cue { color: ${color}; background-color: ${background}; font-family: ${tokens.getPropertyValue('--dabble-ui-font')}; font-weight: 500; font-size: ${Math.min(20, Math.max(15, rootBox.width * .024))}px; line-height: 1.35; text-shadow: none; opacity: ${custom ? 0 : 1}; }`;
      if (css !== lastCSS) { style.textContent = css; lastCSS = css; }
      frame = requestAnimationFrame(measure);
    };
    update();
    measure();
    video.textTracks.addEventListener('change', update);
    video.textTracks.addEventListener('addtrack', update);
    video.textTracks.addEventListener('removetrack', update);
    video.addEventListener('load', update, true);
    video.addEventListener('loadedmetadata', update);
    video.addEventListener('timeupdate', update);
    video.addEventListener('play', update);
    video.addEventListener('webkitbeginfullscreen', beginFullscreen);
    video.addEventListener('webkitendfullscreen', endFullscreen);
    return () => {
      cancelAnimationFrame(frame);
      style.remove();
      delete root.dataset['captionRenderer'];
      tracked.forEach(track => track.removeEventListener('cuechange', update));
      video.textTracks.removeEventListener('change', update);
      video.textTracks.removeEventListener('addtrack', update);
      video.textTracks.removeEventListener('removetrack', update);
      video.removeEventListener('load', update, true);
      video.removeEventListener('loadedmetadata', update);
      video.removeEventListener('timeupdate', update);
      video.removeEventListener('play', update);
      video.removeEventListener('webkitbeginfullscreen', beginFullscreen);
      video.removeEventListener('webkitendfullscreen', endFullscreen);
      tracked.forEach(track => {
        if (!track.__dabblePaintedCaption) return;
        const on = track.__dabbleCaptionOn;
        delete track.__dabblePaintedCaption; delete track.__dabbleCaptionOn;
        track.mode = on ? 'showing' : 'disabled';
      });
    };
  }, [rootRef, captionId, showing, controlsVisible, docked, barEnabled, phoneHost]);

  return <div ref={layerRef} className="dabble-painted-captions" aria-hidden="true">{showing && cues.map((cue, index) => <div className="dabble-caption-swipe" key={`${cue.startTime}-${cue.endTime}-${index}`}><span className="dabble-caption-shape" aria-hidden="true">
    <svg viewBox="0 0 16 100" preserveAspectRatio="none"><path className="dabble-caption-paper" d="M16 0H11.2L2.4 10L8 24L.8 36L9.6 50L1.6 62L8.8 76L0 88L6.4 100H16Z" /><path d="M16 0H11.2L2.4 10L8 24L.8 36L9.6 50L1.6 62L8.8 76L0 88L6.4 100H16" /></svg>
    <svg viewBox="0 0 100 100" preserveAspectRatio="none"><path className="dabble-caption-paper" d="M0 0H100V100H0Z" /><path d="M0 0H100M0 100H100" /></svg>
    <svg viewBox="0 0 16 100" preserveAspectRatio="none"><path className="dabble-caption-paper" d="M0 0H4.8L13.6 10L8 24L15.2 36L6.4 50L14.4 62L7.2 76L16 88L9.6 100H0Z" /><path d="M0 0H4.8L13.6 10L8 24L15.2 36L6.4 50L14.4 62L7.2 76L16 88L9.6 100H0" /></svg>
  </span>{cue.text}</div>)}</div>;
}