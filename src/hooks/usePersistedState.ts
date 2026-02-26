import { useState, useEffect, useRef } from 'react';

/**
 * A hook that persists state to localStorage with error handling and quota management.
 * Data is saved on every state change and loaded on mount.
 */
export function usePersistedState<T>(key: string, initialValue: T | (() => T)): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        return parsed;
      }
    } catch (e) {
      // If parsing fails, remove corrupted data
      try { localStorage.removeItem(key); } catch {}
    }
    return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
  });

  const isFirstRender = useRef(true);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    try {
      const serialized = JSON.stringify(state);
      localStorage.setItem(key, serialized);
    } catch (e: any) {
      // Handle quota exceeded - try to clear old data
      if (e?.name === 'QuotaExceededError' || e?.code === 22) {
        console.warn(`localStorage quota exceeded for key "${key}". Attempting cleanup...`);
        try {
          // Remove the largest items first (except current key)
          const entries: [string, number][] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k !== key && k.startsWith('hr_')) {
              entries.push([k, (localStorage.getItem(k) || '').length]);
            }
          }
          entries.sort((a, b) => b[1] - a[1]);
          // Remove up to 3 largest entries
          for (let i = 0; i < Math.min(3, entries.length); i++) {
            localStorage.removeItem(entries[i][0]);
          }
          // Retry save
          localStorage.setItem(key, JSON.stringify(state));
        } catch {
          console.error(`Failed to save "${key}" even after cleanup.`);
        }
      }
    }
  }, [key, state]);

  // Listen for storage events from other tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setState(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [key]);

  return [state, setState];
}
