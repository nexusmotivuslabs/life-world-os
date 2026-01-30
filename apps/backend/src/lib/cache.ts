/**
 * Cache-aside helpers for Life World OS
 * Uses Redis when REDIS_URL is set; otherwise no-op (data from DB only).
 * Data is captured on first read; invalidate on write/seed.
 */

import { redisGet, redisSet, redisDel, redisDelPattern } from './redis.js'

const DEFAULT_TTL = 5 * 60 // 5 minutes

export const cacheKeys = {
  realityNode: (id: string) => `node:${id}`,
  realityNodeChildren: (id: string) => `node:${id}:children`,
  realityNodeAncestors: (id: string) => `node:${id}:ancestors`,
  realityNodeHierarchy: (id: string) => `node:${id}:hierarchy`,
}

export async function getCached<T>(key: string): Promise<T | null> {
  return redisGet<T>(key)
}

export async function setCached(key: string, value: unknown, ttlSeconds: number = DEFAULT_TTL): Promise<void> {
  return redisSet(key, value, ttlSeconds)
}

export async function invalidateCached(key: string): Promise<void> {
  return redisDel(key)
}

/** Invalidate all reality node caches (e.g. after seed or admin update) */
export async function invalidateRealityNodeCaches(): Promise<void> {
  return redisDelPattern('node:')
}

/**
 * Cache-aside: get from cache or run loader and store.
 */
export async function getOrSet<T>(key: string, loader: () => Promise<T>, ttlSeconds: number = DEFAULT_TTL): Promise<T> {
  const cached = await getCached<T>(key)
  if (cached != null) return cached
  const value = await loader()
  await setCached(key, value, ttlSeconds)
  return value
}
