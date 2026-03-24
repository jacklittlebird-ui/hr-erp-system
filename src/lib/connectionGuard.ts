/**
 * Connection guard — limits concurrent Supabase auth requests
 * to prevent connection-pool exhaustion under load.
 */

const MAX_CONCURRENT_LOGINS = 50;
const LOGIN_QUEUE_TIMEOUT_MS = 15_000;

let activeLogins = 0;
let totalLogins = 0;
let totalErrors = 0;
let totalLoginTimeMs = 0;
const waitQueue: Array<{ resolve: () => void; timer: ReturnType<typeof setTimeout> }> = [];

function releaseSlot() {
  activeLogins = Math.max(0, activeLogins - 1);
  const next = waitQueue.shift();
  if (next) {
    clearTimeout(next.timer);
    activeLogins++;
    next.resolve();
  }
}

/**
 * Acquire a login slot. Resolves immediately if under limit,
 * otherwise queues and resolves when a slot opens (or rejects on timeout).
 */
export function acquireLoginSlot(): Promise<void> {
  if (activeLogins < MAX_CONCURRENT_LOGINS) {
    activeLogins++;
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      const idx = waitQueue.findIndex((w) => w.resolve === resolve);
      if (idx !== -1) waitQueue.splice(idx, 1);
      reject(new Error('Login queue timeout — server is busy'));
    }, LOGIN_QUEUE_TIMEOUT_MS);

    waitQueue.push({ resolve, timer });
  });
}

export { releaseSlot };

/**
 * Global request throttle — simple token-bucket for any Supabase call.
 */
let lastRequestTs = 0;
const MIN_REQUEST_GAP_MS = 50; // 20 req/s max per tab

export async function throttle(): Promise<void> {
  const now = Date.now();
  const gap = MIN_REQUEST_GAP_MS - (now - lastRequestTs);
  if (gap > 0) {
    await new Promise((r) => setTimeout(r, gap));
  }
  lastRequestTs = Date.now();
}

/**
 * Emergency flags — disable heavy background work.
 */
export const EMERGENCY_MODE = {
  disableRealtimeSubscriptions: true,
  disableBackgroundJobs: true,
  disableAutoPreload: true,
  maxIdleConnectionMs: 5_000,
};
