const RECOVERY_KEY = 'dabble-module-recovery';
const RECOVERY_COOLDOWN_MS = 60_000;

export function isModuleLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : typeof error === 'string' ? error : '';
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(message);
}

// Called only from browser effects/events. Storage makes the guard survive reloads.
export function recoverModuleLoad(error: unknown, storage: Pick<Storage, 'getItem' | 'setItem'>, reload: () => void, now = Date.now()): boolean {
  if (!isModuleLoadError(error)) return false;
  try {
    const previous = storage.getItem(RECOVERY_KEY);
    if (previous !== null && now - Number(previous) < RECOVERY_COOLDOWN_MS) return false;
    storage.setItem(RECOVERY_KEY, String(now));
  } catch {
    // Without a durable guard, keep the error screen instead of risking a reload loop.
    return false;
  }
  reload();
  return true;
}