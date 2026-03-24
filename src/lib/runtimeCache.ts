type CacheEnvelope<T> = {
  expiresAt: number;
  value: T;
};

const memoryCache = new Map<string, CacheEnvelope<unknown>>();

const canUseStorage = () => typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';

export function getCachedValue<T>(key: string): T | null {
  const now = Date.now();
  const memoryEntry = memoryCache.get(key) as CacheEnvelope<T> | undefined;

  if (memoryEntry && memoryEntry.expiresAt > now) {
    return memoryEntry.value;
  }

  if (memoryEntry) {
    memoryCache.delete(key);
  }

  if (!canUseStorage()) return null;

  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CacheEnvelope<T>;
    if (parsed.expiresAt <= now) {
      window.sessionStorage.removeItem(key);
      return null;
    }

    memoryCache.set(key, parsed as CacheEnvelope<unknown>);
    return parsed.value;
  } catch {
    return null;
  }
}

export function setCachedValue<T>(key: string, value: T, ttlMs: number) {
  const envelope: CacheEnvelope<T> = {
    value,
    expiresAt: Date.now() + ttlMs,
  };

  memoryCache.set(key, envelope as CacheEnvelope<unknown>);

  if (!canUseStorage()) return;

  try {
    window.sessionStorage.setItem(key, JSON.stringify(envelope));
  } catch {
    // Ignore storage quota / serialization failures during emergency mode.
  }
}

export function clearCachedValue(key: string) {
  memoryCache.delete(key);

  if (!canUseStorage()) return;

  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Ignore.
  }
}
