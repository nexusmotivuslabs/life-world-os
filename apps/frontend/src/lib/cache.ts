/**
 * Cache Layer
 * 
 * Provides caching functionality for API responses, health checks, and other data.
 * Uses in-memory storage with TTL (Time To Live) support.
 */

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  expiresAt: number
}

// In-memory cache store
const cacheStore = new Map<string, CacheEntry<any>>()

/**
 * Get cached data if it exists and hasn't expired
 */
export function getCachedData<T>(key: string): CacheEntry<T> | null {
  const entry = cacheStore.get(key)

  if (!entry) {
    return null
  }

  // Check if expired
  if (Date.now() > entry.expiresAt) {
    cacheStore.delete(key)
    return null
  }

  return entry as CacheEntry<T>
}

/**
 * Set cached data with TTL
 */
export function setCachedData<T>(key: string, data: T, ttl: number): void {
  const now = Date.now()
  const entry: CacheEntry<T> = {
    data,
    timestamp: now,
    ttl,
    expiresAt: now + ttl,
  }

  cacheStore.set(key, entry)
}

/**
 * Remove cached data
 */
export function removeCachedData(key: string): void {
  cacheStore.delete(key)
}

/**
 * Clear all cached data
 */
export function clearCache(): void {
  cacheStore.clear()
}

/**
 * Get all cache keys
 */
export function getCacheKeys(): string[] {
  return Array.from(cacheStore.keys())
}

/**
 * Clean expired entries from cache
 */
export function cleanExpiredEntries(): number {
  const now = Date.now()
  let cleaned = 0

  for (const [key, entry] of cacheStore.entries()) {
    if (now > entry.expiresAt) {
      cacheStore.delete(key)
      cleaned++
    }
  }

  return cleaned
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  size: number
  keys: string[]
  totalSize: number
} {
  return {
    size: cacheStore.size,
    keys: Array.from(cacheStore.keys()),
    totalSize: cacheStore.size,
  }
}

// Clean expired entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    cleanExpiredEntries()
  }, 5 * 60 * 1000)
}


