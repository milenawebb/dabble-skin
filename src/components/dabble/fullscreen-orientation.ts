type Orientation = {
  lock?: (orientation: 'landscape') => Promise<void> | void;
  unlock?: () => Promise<void> | void;
};

// Best-effort enhancement only: never participate in fullscreen entry/exit.
export function updateFullscreenOrientation(active: boolean, width: number, height: number, orientation?: Orientation) {
  try {
    if (active) {
      if (width > height && height > 0 && typeof orientation?.lock === 'function') {
        void Promise.resolve(orientation.lock('landscape')).catch(() => {});
      }
    } else if (typeof orientation?.unlock === 'function') {
      void Promise.resolve(orientation.unlock()).catch(() => {});
    }
  } catch { /* Unsupported orientation APIs must not affect fullscreen. */ }
}