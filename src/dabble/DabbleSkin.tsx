import { Container, Controls, PlayButton, TimeSlider, Time, MuteButton, VolumePopover, VolumeSlider, CaptionsButton, Menu, PlaybackRateRadioGroup, FullscreenButton, Hotkey, useHotkey, StatusAnnouncer, Poster, Gesture, BufferingIndicator, ErrorDialog, Popover } from '@videojs/react';
import { usePlayer } from '@videojs/react/video';
import { useEffect, useId, useRef, useState, type ReactNode, type CSSProperties } from 'react';
import './dabble-skin.css';
import { DABBLE_HOTKEYS, DABBLE_PLAYBACK_RATES, getControlSize, shouldDockControls, shouldShowVolumePopover, showCenterPlay } from './skin-rules';
import { PaintedCaptions } from './PaintedCaptions';
import { tintForInk } from './palette';
import { DEFAULT_PALETTE, type Palette } from './painting-data';
import { HandIcon as Icon } from './HandDrawings';
import { PaintingHotkeys } from './PaintingHotkeys';
import { KeysContent, KeysHotkey } from './KeysPanel';
import { Button } from './Button';
import { getHotkeyCoordinator } from '@videojs/core/dom';
import { announceShortcut } from './page-feedback';
import { updateFullscreenOrientation } from './fullscreen-orientation';
import { createPortal } from 'react-dom';
import { STROKE_RETURN_DELAY, suppressPaintingControls } from './stroke-controls';
import { PhoneControls } from './PhoneControls';
import { usesPhoneOverlay } from './phone-control-rules';

function Blob() { return <span className="dabble-blob" aria-hidden="true" />; }

export function DabbleSkin({ children, phoneHost, paintable = false, brushSize = 20, painting = false, palette = DEFAULT_PALETTE, onControlsState }: { children: ReactNode; phoneHost?: HTMLDivElement | null; paintable?: boolean; brushSize?: number; painting?: boolean; palette?: Palette; onControlsState?: (state: { visible: boolean; paused: boolean }) => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('large');
  const [playerWidth, setPlayerWidth] = useState(860);
  const [hoverCapable, setHoverCapable] = useState(false);
  const [coarsePointer, setCoarsePointer] = useState(false);
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [keysOpen, setKeysOpen] = useState(false);
  const [keysBounds, setKeysBounds] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const keysRef = useRef<HTMLButtonElement>(null);
  const keysPopup = useRef<HTMLDivElement>(null);
  const keysTitleId = useId();
  const closeKeys = () => {
    setKeysOpen(false);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const button = keysRef.current;
      if (button && button.getClientRects().length && !button.closest('[inert]')) button.focus();
      else rootRef.current?.focus();
    }));
  };
  const muteRef = useRef<HTMLButtonElement>(null);
  const volumeEscape = useRef(false);
  const fullscreenActive = usePlayer((state) => state.isFullscreen);
  const previousFullscreen = useRef(false);
  useEffect(() => {
    if (previousFullscreen.current === fullscreenActive) return;
    previousFullscreen.current = fullscreenActive;
    const video = rootRef.current?.querySelector('video');
    updateFullscreenOrientation(fullscreenActive, video?.videoWidth ?? 0, video?.videoHeight ?? 0, screen.orientation);
  }, [fullscreenActive]);
  const exitFullscreen = usePlayer((state) => state.exitFullscreen);
  const docked = shouldDockControls(playerWidth, fullscreenActive);
  const phoneOverlay = usesPhoneOverlay(playerWidth, fullscreenActive);
  const started = usePlayer((state) => state.started);
  const ended = usePlayer((state) => state.ended);
  const controlsVisible = usePlayer((state) => state.controlsVisible);
  const paused = usePlayer((state) => state.paused);
  const hasError = usePlayer((state) => Boolean(state.error));
  const toggleControls = usePlayer((state) => state.toggleControls);
  const requestControlsLock = usePlayer((state) => state.requestControlsLock);
  const [strokeHold, setStrokeHold] = useState(false);
  const hideForPainting = !phoneOverlay && suppressPaintingControls(playerWidth, fullscreenActive, painting, strokeHold);
  useEffect(() => {
    const canvas = rootRef.current?.closest<HTMLElement>('.dabble-canvas');
    if (!canvas || playerWidth < 420 || fullscreenActive) { setStrokeHold(false); return; }
    let pointer: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const down = (event: PointerEvent) => {
      if (event.button !== 0 || !(event.target instanceof Element) || !event.target.matches('.dabble-paint') || !canvas.hasAttribute('data-painting')) return;
      pointer = event.pointerId; clearTimeout(timer); setStrokeHold(true);
    };
    const end = (event: PointerEvent) => {
      if (pointer === undefined || event.pointerId !== pointer) return;
      pointer = undefined;
      timer = setTimeout(() => { setStrokeHold(false); toggleControls(true); }, STROKE_RETURN_DELAY);
    };
    canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end); canvas.addEventListener('lostpointercapture', end);
    return () => { clearTimeout(timer); canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointerup', end); canvas.removeEventListener('pointercancel', end); canvas.removeEventListener('lostpointercapture', end); };
  }, [playerWidth, fullscreenActive, toggleControls]);
  // A permanent library lock disables phone idle hiding, but not fullscreen auto-hide.
  useEffect(() => phoneHost && !fullscreenActive && !phoneOverlay ? requestControlsLock() : undefined, [phoneHost, fullscreenActive, phoneOverlay, requestControlsLock]);
  const centerVisible = !phoneOverlay && showCenterPlay(started, ended, painting, paused) && !hasError;
  const centerRef = useRef<HTMLButtonElement>(null);
  const playRef = useRef<HTMLButtonElement>(null);
  const centerHadFocus = useRef(false);
  const paintingVideoTouch = useRef(false);
  const captionId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  useHotkey({ keys: 'Escape', onActivate: event => {
    if (!fullscreenActive || keysOpen || volumeOpen || rootRef.current?.querySelector('.dabble-speed[aria-expanded="true"], .dabble-error')) return;
    event.preventDefault();
    void exitFullscreen();
  } });
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return getHotkeyCoordinator(root).subscribe(event => {
      // Custom shortcuts announce only after their own guards and action succeed.
      if (event.action && event.event.isTrusted) announceShortcut(root, event.event.key);
    });
  }, []);

  useEffect(() => {
    if (!keysOpen) return;
    const root = rootRef.current;
    if (!root) return;
    const measure = () => {
      const rect = root.getBoundingClientRect();
      setKeysBounds({ left: rect.left, top: rect.top, width: rect.width, height: rect.height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    window.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);
    return () => { observer.disconnect(); window.removeEventListener('scroll', measure, true); window.removeEventListener('resize', measure); };
  }, [keysOpen]);

  useEffect(() => { onControlsState?.({ visible: controlsVisible, paused }); }, [controlsVisible, paused, onControlsState]);
  useEffect(() => {
    const canvas = rootRef.current?.closest('.dabble-canvas');
    if (!canvas || fullscreenActive || phoneOverlay) return;
    let release: (() => void) | undefined;
    const activity = (event: Event) => {
      const active = (event as CustomEvent<boolean>).detail;
      if (active) release ??= requestControlsLock();
      else { release?.(); release = undefined; }
    };
    canvas.addEventListener('dabble-tray-activity', activity);
    return () => { canvas.removeEventListener('dabble-tray-activity', activity); release?.(); };
  }, [requestControlsLock, fullscreenActive, phoneOverlay]);

  useEffect(() => {
    return volumeOpen || keysOpen ? requestControlsLock() : undefined;
  }, [volumeOpen, keysOpen, requestControlsLock]);

  useEffect(() => {
    const root = rootRef.current;
    const bar = (phoneHost ?? root)?.querySelector<HTMLElement>('.dabble-bar');
    if (!root || !bar || phoneOverlay) return;
    let releaseHover: (() => void) | undefined;
    let releaseFocus: (() => void) | undefined;
    const enter = (event: PointerEvent) => { if (event.pointerType !== 'touch') releaseHover ??= requestControlsLock(); };
    const leave = () => { releaseHover?.(); releaseHover = undefined; };
    // Only keyboard focus holds the bar; mouse clicks leave focus without keeping it visible.
    const focus = (event: FocusEvent) => { if (event.target instanceof Element && event.target.matches(':focus-visible')) releaseFocus ??= requestControlsLock(); };
    const blur = (event: FocusEvent) => { if (!(event.relatedTarget instanceof Node) || !bar.contains(event.relatedTarget)) { releaseFocus?.(); releaseFocus = undefined; } };
    bar.addEventListener('pointerenter', enter); bar.addEventListener('pointerleave', leave);
    bar.addEventListener('focusin', focus); bar.addEventListener('focusout', blur);
    return () => { leave(); releaseFocus?.(); bar.removeEventListener('pointerenter', enter); bar.removeEventListener('pointerleave', leave); bar.removeEventListener('focusin', focus); bar.removeEventListener('focusout', blur); };
  }, [requestControlsLock, phoneHost, fullscreenActive, phoneOverlay]);
  useEffect(() => {
    const root = rootRef.current;
    if (!root || phoneHost || phoneOverlay) return;
    // Video.js only restarts its idle timer on leave; hide at once instead. Locks (menus, keyboard focus) still win.
    const leave = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || (event.relatedTarget instanceof Node && root.contains(event.relatedTarget))) return;
      const video = root.querySelector('video');
      if (video && !video.paused && !video.ended) toggleControls(false);
    };
    root.addEventListener('pointerleave', leave);
    return () => root.removeEventListener('pointerleave', leave);
  }, [phoneHost, toggleControls, phoneOverlay]);
  useEffect(() => { if (!painting) toggleControls(true); }, [painting, toggleControls]);

  useEffect(() => {
    const query = window.matchMedia('(any-hover: hover) and (any-pointer: fine)');
    const coarse = window.matchMedia('(pointer: coarse)');
    const update = () => { setHoverCapable(query.matches); setCoarsePointer(coarse.matches); };
    update(); query.addEventListener('change', update);
    coarse.addEventListener('change', update);
    return () => { query.removeEventListener('change', update); coarse.removeEventListener('change', update); };
  }, []);
  const showVolume = shouldShowVolumePopover(playerWidth, hoverCapable, coarsePointer);
  useEffect(() => { if (!showVolume) setVolumeOpen(false); }, [showVolume]);

  useEffect(() => {
    if (!centerVisible && centerHadFocus.current) {
      playRef.current?.focus();
      centerHadFocus.current = false;
    }
  }, [centerVisible]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = root?.closest('.dabble-canvas');
    if (!root || !canvas) return;
    const measure = () => {
      const width = (document.fullscreenElement === root ? root : canvas).getBoundingClientRect().width;
      setSize(getControlSize(width));
      setPlayerWidth(width);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(canvas);
    observer.observe(root);
    document.addEventListener('fullscreenchange', measure);
    return () => { observer.disconnect(); document.removeEventListener('fullscreenchange', measure); };
  }, []);

  const play = <PlayButton ref={playRef} label={(state) => state.ended ? 'Replay' : state.paused ? 'Play' : 'Pause'} className="dabble-button dabble-play" render={(props, state) => <button {...props} tabIndex={centerVisible ? -1 : props.tabIndex} aria-hidden={centerVisible || undefined}><Blob /><Icon kind={state.ended ? 'replay' : state.paused ? 'play' : 'pause'} /></button>} />;
  const muteButton = <MuteButton ref={muteRef} className="dabble-button dabble-mute" render={(props, state) => <button {...props} data-on={state.muted}><Blob /><Icon kind={state.volumeLevel === 'off' ? 'muted' : 'volume'} /></button>} />;
  const mute = showVolume ? <VolumePopover.Root openOnHover closeDelay={150} side="top" align="center" boundary="container" open={volumeOpen} onOpenChange={(open, details) => {
    if (!open && details.reason === 'click') return;
    if (open && volumeEscape.current) return;
    setVolumeOpen(open);
  }}>
    <VolumePopover.Trigger render={(triggerProps) => {
      // Hover/focus owns popup visibility; clicks belong only to MuteButton.
      const { onClick: _togglePopup, ref: triggerRef, ...props } = triggerProps;
      return <MuteButton {...props} ref={(element) => {
        muteRef.current = element;
        if (typeof triggerRef === 'function') return triggerRef(element);
        if (triggerRef) triggerRef.current = element;
      }} className="dabble-button dabble-mute" render={(buttonProps, state) => <button {...buttonProps} data-on={state.muted}><Blob /><Icon kind={state.volumeLevel === 'off' ? 'muted' : 'volume'} /></button>} />;
    }} onFocus={() => { if (!volumeEscape.current) setVolumeOpen(true); }} onBlur={() => { volumeEscape.current = false; }} onPointerEnter={() => { volumeEscape.current = false; setVolumeOpen(true); }} onKeyDown={event => { if (event.key === 'Escape') { volumeEscape.current = true; setVolumeOpen(false); } }} />
    <VolumePopover.Popup className="dabble-volume-popup" onKeyDown={event => { if (event.key === 'Escape') { volumeEscape.current = true; setVolumeOpen(false); muteRef.current?.focus(); } }}>
      <VolumeSlider.Root orientation="vertical" className="dabble-volume-vertical"><VolumeSlider.Track className="dabble-volume-track"><VolumeSlider.Fill className="dabble-volume-fill" /></VolumeSlider.Track><VolumeSlider.Thumb className="dabble-volume-thumb" /></VolumeSlider.Root>
    </VolumePopover.Popup>
  </VolumePopover.Root> : muteButton;
  const captions = <CaptionsButton label="Captions" className="dabble-button dabble-captions" render={(props, state) => <button {...props} aria-pressed={state.subtitlesShowing} data-on={state.subtitlesShowing}><Blob /><span aria-hidden="true">CC</span>{state.subtitlesShowing && <Icon kind="captions" className="dabble-cc-underline" />}</button>} />;
  const speed = <Menu.Root side="top" align="end" boundary="container"><PlaybackRateRadioGroup.Root rates={DABBLE_PLAYBACK_RATES} formatRate={(rate) => `${rate}x`}><Menu.Trigger aria-label="Playback speed" className="dabble-button dabble-speed" render={<button type="button" />}><Blob /><PlaybackRateRadioGroup.Value aria-hidden="true" /></Menu.Trigger><Menu.Popup className="dabble-speed-menu"><Menu.Content><PlaybackRateRadioGroup.Options renderItem={(props, item) => <Menu.RadioItem {...props} key={item.value} className="dabble-speed-item"><Blob />{item.label}</Menu.RadioItem>} /></Menu.Content></Menu.Popup></PlaybackRateRadioGroup.Root></Menu.Root>;
  const fullscreen = <FullscreenButton className="dabble-button dabble-fullscreen" render={(props, state) => <button {...props}><Blob /><Icon kind={state.fullscreen ? 'exit' : 'fullscreen'} /></button>} />;
  const keys = <Popover.Trigger ref={keysRef} aria-label="Keyboard shortcuts" className="dabble-button dabble-keys-button" render={<Button variant="ghost" size="icon" />}><Blob /><Icon kind="keys" /></Popover.Trigger>;
  const seek = <TimeSlider.Root className="dabble-slider dabble-seek"><TimeSlider.Track className="dabble-track"><TimeSlider.Buffer className="dabble-buffer" /><TimeSlider.Fill className="dabble-fill" /></TimeSlider.Track><TimeSlider.Thumb className="dabble-thumb" /></TimeSlider.Root>;
  const time = <span className="dabble-time"><Time.Value type="current" /><span aria-hidden="true">/</span><Time.Value type="duration" /></span>;
  const colors = { '--dabble-seek':palette[0], '--dabble-b1':tintForInk(palette[4]), '--dabble-b2':tintForInk(palette[3]), '--dabble-b3':tintForInk(palette[2]), '--dabble-b4':tintForInk(palette[5]), '--dabble-b5':tintForInk(palette[1]), '--dabble-keys-tint':tintForInk(palette[0]), '--keys-left': `${keysBounds.left + (playerWidth >= 560 ? keysBounds.width * .04 : Math.max(6, keysBounds.width - 306))}px`, '--keys-top': `${keysBounds.top + 6}px`, '--keys-width': `${Math.max(0, playerWidth >= 560 ? keysBounds.width * .92 : Math.min(300, keysBounds.width - 12))}px`, '--keys-height': `${Math.max(0, keysBounds.height - 12)}px` } as CSSProperties;
  const phonePlaque = Boolean(phoneHost) && !fullscreenActive;
  const bar = <Controls.Root><Controls.Content className={`dabble-bar${phonePlaque ? ' phone-control-plaque' : ''}`} style={phonePlaque ? colors : undefined} inert={phonePlaque && painting || undefined}>
    {phonePlaque ? <><div className="phone-seek-edge">{seek}</div><Controls.Group className="dabble-row" aria-label="Playback controls">{play}{time}{mute}{captions}{speed}{fullscreen}</Controls.Group></> : size === 'small' ? <><Controls.Group className="dabble-row" aria-label="Timeline">{seek}{time}</Controls.Group><Controls.Group className="dabble-row dabble-buttons-row" aria-label="Playback controls">{play}{mute}{captions}{speed}{keys}{fullscreen}</Controls.Group></> : <Controls.Group className="dabble-row" aria-label="Playback controls">{play}{seek}{time}{mute}{captions}{speed}{keys}{fullscreen}</Controls.Group>}
  </Controls.Content></Controls.Root>;

  return (
    <Container ref={rootRef} tabIndex={-1} aria-label="Dabble video player" style={colors} className="dabble-skin" data-phone-overlay={phoneOverlay || undefined} data-size={size} data-painting={painting || undefined} data-stroke-hold={strokeHold && !fullscreenActive || undefined} data-docked={docked && !phoneOverlay || undefined} data-caption-id={captionId} data-invitation={centerVisible || undefined} data-bar-visible={(!hideForPainting && controlsVisible) || undefined} onPointerDownCapture={event => {
      // Pausing reveals Play under the finger before the compatibility click.
      paintingVideoTouch.current = !phoneOverlay && event.pointerType === 'touch' && event.target instanceof HTMLVideoElement;
    }} onClickCapture={event => {
      if (!paintingVideoTouch.current) return;
      paintingVideoTouch.current = false;
      event.preventDefault(); event.stopPropagation();
    }}>
      {children}
      {!hasError && <Poster.Root className="dabble-poster"><Poster.Image /></Poster.Root>}
      <PaintedCaptions phoneOverlay={phoneOverlay} phoneHost={phoneHost ?? null} rootRef={rootRef} captionId={captionId} docked={docked && !phoneOverlay} barEnabled={!hideForPainting} />
      {!phoneOverlay && <Gesture type="tap" action={controlsVisible || painting ? "togglePaused" : "toggleControls"} />}
      <PlayButton ref={centerRef} hidden={!centerVisible} label={ended ? 'Replay' : paused ? 'Play' : 'Pause'} className="dabble-button dabble-play dabble-center-play" render={(props) => <button {...props} onFocus={(event) => { props.onFocus?.(event); centerHadFocus.current = event.currentTarget.matches(':focus-visible'); }} onBlur={(event) => { props.onBlur?.(event); if (event.relatedTarget) centerHadFocus.current = false; }}><Blob /><Icon kind={ended ? 'replay' : paused ? 'play' : 'pause'} /></button>} />
      <BufferingIndicator className="dabble-loading" render={(props, state) => <div {...props} role="status" aria-live="polite">{state.visible && <><span className="dabble-loading-disc" aria-hidden="true"><span /></span><span className="dabble-loading-label">Loading</span></>}</div>} />
      <Popover.Root side="top" align="end" boundary="container" open={keysOpen} onOpenChange={open => { if (open) setKeysOpen(true); else closeKeys(); }}>
      {phoneOverlay ? <PhoneControls /> : phonePlaque && phoneHost ? createPortal(bar, phoneHost) : bar}
      <Popover.Popup ref={keysPopup} tabIndex={-1} role="dialog" aria-labelledby={keysTitleId} className="dabble-keys-panel" data-wide={playerWidth >= 560 || undefined} data-compact={playerWidth >= 560 && playerWidth < 700 || undefined} data-short-actions={playerWidth >= 560 && keysBounds.width < 750 || undefined} render={props => <div {...props} style={{ ...props.style, translate: 'none', positionAnchor: 'none' }} />} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeKeys(); } else if (event.key === '?') { event.preventDefault(); event.stopPropagation(); closeKeys(); } }}>
        <KeysContent paintable={paintable} titleId={keysTitleId} popup={keysPopup} onClose={closeKeys} open={keysOpen} />
      </Popover.Popup>
      </Popover.Root>
      {DABBLE_HOTKEYS.map((binding) => <Hotkey key={binding.keys} {...binding} />)}
      <KeysHotkey root={rootRef} open={keysOpen} toggle={() => { if (keysOpen) closeKeys(); else setKeysOpen(true); }} />
      {paintable && <PaintingHotkeys root={rootRef} painting={painting} size={brushSize} blocked={keysOpen} />}
      <StatusAnnouncer className="dabble-announcer" />
      <ErrorDialog.Root><ErrorDialog.Backdrop className="dabble-error-backdrop" /><ErrorDialog.Popup className="dabble-error"><ErrorDialog.Title className="dabble-error-title">This video can't be played</ErrorDialog.Title><ErrorDialog.Description className="dabble-error-description">The video could not load. Please check your connection and try reloading the page.</ErrorDialog.Description><ErrorDialog.Close className="dabble-button dabble-error-close">Close</ErrorDialog.Close></ErrorDialog.Popup></ErrorDialog.Root>
    </Container>
  );
}