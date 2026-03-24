/**
 * Attendance Queue & Anti-Fraud Utilities
 *
 * Features:
 *  • Request deduplication (ignore within 10s)
 *  • Rate limiting (1 request per 10s per employee)
 *  • Random delay distribution (0–3s)
 *  • Employee data cache (5 min)
 *  • Station data cache (10 min)
 *  • Response queue with immediate UI feedback
 *  • Performance monitoring
 */

// ─── Rate Limiting ──────────────────────────────────────────────────────────

const RATE_LIMIT_MS = 10_000; // 1 request per 10 seconds
const lastRequestTime = new Map<string, number>();

export function isRateLimited(userId: string): boolean {
  const last = lastRequestTime.get(userId);
  if (last && Date.now() - last < RATE_LIMIT_MS) return true;
  return false;
}

export function recordRequest(userId: string): void {
  lastRequestTime.set(userId, Date.now());
}

// ─── Deduplication ──────────────────────────────────────────────────────────

const DEDUP_WINDOW_MS = 10_000; // ignore within 10 seconds
const recentRequests = new Map<string, number>();

export function isDuplicate(key: string): boolean {
  const last = recentRequests.get(key);
  if (last && Date.now() - last < DEDUP_WINDOW_MS) return true;
  return false;
}

export function recordDedup(key: string): void {
  recentRequests.set(key, Date.now());
}

// ─── Random Delay ───────────────────────────────────────────────────────────

const MAX_DELAY_MS = 3_000;

export function getRandomDelay(): number {
  return Math.floor(Math.random() * MAX_DELAY_MS);
}

export function waitRandomDelay(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, getRandomDelay()));
}

// ─── Employee/Station Cache ─────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
}

const EMPLOYEE_CACHE_TTL = 5 * 60_000;  // 5 minutes
const STATION_CACHE_TTL = 10 * 60_000;  // 10 minutes

const employeeCache = new Map<string, CacheEntry<any>>();
const stationCache = new Map<string, CacheEntry<any>>();

export function getCachedEmployee<T>(userId: string): T | null {
  const entry = employeeCache.get(userId);
  if (!entry || Date.now() - entry.cachedAt > EMPLOYEE_CACHE_TTL) return null;
  return entry.data as T;
}

export function setCachedEmployee<T>(userId: string, data: T): void {
  employeeCache.set(userId, { data, cachedAt: Date.now() });
}

export function getCachedStation<T>(stationId: string): T | null {
  const entry = stationCache.get(stationId);
  if (!entry || Date.now() - entry.cachedAt > STATION_CACHE_TTL) return null;
  return entry.data as T;
}

export function setCachedStation<T>(stationId: string, data: T): void {
  stationCache.set(stationId, { data, cachedAt: Date.now() });
}

// ─── Queue System ───────────────────────────────────────────────────────────

type QueueItem = {
  id: string;
  fn: () => Promise<any>;
  resolve: (v: any) => void;
  reject: (e: any) => void;
  enqueuedAt: number;
};

const MAX_CONCURRENT = 10;
let activeWorkers = 0;
const queue: QueueItem[] = [];

function processQueue(): void {
  while (queue.length > 0 && activeWorkers < MAX_CONCURRENT) {
    const item = queue.shift()!;
    activeWorkers++;
    item.fn()
      .then(item.resolve)
      .catch(item.reject)
      .finally(() => {
        activeWorkers--;
        processQueue();
      });
  }
}

export function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    queue.push({
      id: crypto.randomUUID(),
      fn,
      resolve,
      reject,
      enqueuedAt: Date.now(),
    });
    processQueue();
  });
}

// ─── Performance Monitoring ─────────────────────────────────────────────────

interface AttendanceMonitor {
  totalCheckins: number;
  totalErrors: number;
  totalDuplicates: number;
  avgResponseMs: number;
  responseTimes: number[];
  lastMinuteRequests: number[];
}

const monitor: AttendanceMonitor = {
  totalCheckins: 0,
  totalErrors: 0,
  totalDuplicates: 0,
  avgResponseMs: 0,
  responseTimes: [],
  lastMinuteRequests: [],
};

export function trackCheckinStart(): number {
  return performance.now();
}

export function trackCheckinEnd(startTime: number, success: boolean): void {
  const elapsed = performance.now() - startTime;
  monitor.responseTimes.push(elapsed);
  monitor.lastMinuteRequests.push(Date.now());

  // Keep only last 100 response times
  if (monitor.responseTimes.length > 100) monitor.responseTimes.shift();

  // Prune requests older than 1 minute
  const oneMinAgo = Date.now() - 60_000;
  monitor.lastMinuteRequests = monitor.lastMinuteRequests.filter(t => t > oneMinAgo);

  if (success) {
    monitor.totalCheckins++;
  } else {
    monitor.totalErrors++;
  }

  monitor.avgResponseMs =
    monitor.responseTimes.reduce((a, b) => a + b, 0) / monitor.responseTimes.length;

  // Alert if response time > 1 second
  if (elapsed > 1000) {
    console.warn(`[AttendanceMonitor] Slow check-in: ${Math.round(elapsed)}ms`);
  }

  // Alert if duplicate spike (>5 in last minute)
  if (monitor.totalDuplicates > 5) {
    console.warn(`[AttendanceMonitor] Duplicate attempt spike: ${monitor.totalDuplicates}`);
  }
}

export function trackDuplicate(): void {
  monitor.totalDuplicates++;
}

export function getAttendanceStats(): Readonly<AttendanceMonitor> {
  return { ...monitor };
}

// Expose to console
if (typeof window !== 'undefined') {
  (window as any).__attendanceStats = () => getAttendanceStats();
  (window as any).__attendanceQueueSize = () => queue.length;
}

// ─── Consolidated Check-in Flow ─────────────────────────────────────────────

interface CheckinParams {
  eventType: 'check_in' | 'check_out';
  accessToken: string;
  userId: string;
  deviceId: string;
  gpsLat: number;
  gpsLng: number;
  gpsAccuracy: number;
}

interface CheckinResult {
  ok: boolean;
  error?: string;
  event_type?: string;
  location?: string;
}

export async function performCheckin(params: CheckinParams): Promise<CheckinResult> {
  const dedupKey = `${params.userId}:${params.eventType}`;

  // 1. Dedup check
  if (isDuplicate(dedupKey)) {
    trackDuplicate();
    return { ok: false, error: 'طلب مكرر - يرجى الانتظار / Duplicate request - please wait' };
  }

  // 2. Rate limit check
  if (isRateLimited(params.userId)) {
    return { ok: false, error: 'يرجى الانتظار 10 ثوانٍ / Please wait 10 seconds' };
  }

  // 3. Record dedup + rate limit
  recordDedup(dedupKey);
  recordRequest(params.userId);

  const startTime = trackCheckinStart();

  try {
    // 4. Random delay for load distribution
    await waitRandomDelay();

    // 5. Enqueue the actual request
    const result = await enqueue(async () => {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/gps-checkin`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${params.accessToken}`,
          },
          body: JSON.stringify({
            event_type: params.eventType,
            gps_lat: params.gpsLat,
            gps_lng: params.gpsLng,
            gps_accuracy: params.gpsAccuracy,
            device_id: params.deviceId,
          }),
        }
      );

      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        return { ok: false, error: e.error || res.statusText } as CheckinResult;
      }

      return await res.json() as CheckinResult;
    });

    trackCheckinEnd(startTime, result.ok !== false);
    return result;
  } catch (e: any) {
    trackCheckinEnd(startTime, false);
    return { ok: false, error: e.message };
  }
}
