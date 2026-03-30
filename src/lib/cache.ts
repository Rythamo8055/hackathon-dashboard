// Simple in-memory cache with TTL
const cache = new Map<string, { data: unknown; expiry: number }>();

export function getCache<T>(key: string): T | null {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  return item.data as T;
}

export function setCache<T>(key: string, data: T, ttlMs: number = 30000): void {
  cache.set(key, {
    data,
    expiry: Date.now() + ttlMs,
  });
}

export function invalidateCache(pattern: string): void {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  CONTESTANTS: 30000,      // 30 seconds
  JUDGES: 300000,          // 5 minutes
  RATINGS: 10000,          // 10 seconds
  DASHBOARD: 15000,        // 15 seconds
};
