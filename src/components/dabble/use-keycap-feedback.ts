import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { SHORTCUT_EVENT, keycapFor, keycapSoundAllowed } from './page-feedback';
import { SOUND, swish, unlockSound } from './sounds';

export function useKeycapFeedback(player: RefObject<HTMLDivElement | null>, optedIn: boolean) {
  const [active, setActive] = useState<Set<string>>(new Set());
  const gestureSeen = useRef(false);
  const choice = useRef(optedIn);
  choice.current = optedIn;
  const playSound = useCallback(() => {
    const video = player.current?.querySelector('video');
    if (keycapSoundAllowed(choice.current, gestureSeen.current, video?.muted ?? false)) {
      swish(...SOUND.pause);
    }
  }, [player]);
  useEffect(() => {
    const timers = new Map<string, ReturnType<typeof setTimeout>>();
    const gesture = (event: Event) => {
      if (!event.isTrusted) return;
      gestureSeen.current = true;
      if (choice.current) unlockSound();
    };
    const handled = (event: Event) => {
      if (!(event instanceof CustomEvent) || !(event.target instanceof Node) || !player.current?.contains(event.target)) return;
      const label = keycapFor(event.detail);
      if (!label) return;
      clearTimeout(timers.get(label));
      setActive(previous => new Set([...previous, label]));
      playSound();
      timers.set(label, setTimeout(() => {
        timers.delete(label);
        setActive(previous => { const next = new Set(previous); next.delete(label); return next; });
      }, 600));
    };
    document.addEventListener('click', gesture, true);
    document.addEventListener('keydown', gesture, true);
    document.addEventListener(SHORTCUT_EVENT, handled);
    return () => {
      document.removeEventListener('click', gesture, true);
      document.removeEventListener('keydown', gesture, true);
      document.removeEventListener(SHORTCUT_EVENT, handled);
      timers.forEach(clearTimeout);
    };
  }, [player, playSound]);
  return { active, playSound };
}