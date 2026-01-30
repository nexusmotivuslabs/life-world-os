/**
 * Redis client for Life World OS
 * Optional: if REDIS_URL is not set, cache operations are no-ops (app works without Redis).
 */

import Redis from 'ioredis'

const REDIS_URL = process.env.REDIS_URL
const KEY_PREFIX = 'lw:'

let client: Redis | null = null

function getClient(): Redis | null {
  if (!REDIS_URL || REDIS_URL === '') return null
  if (client) return client
  try {
    client = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null
        return Math.min(times * 200, 2000)
      },
    })
    client.on('error', (err) => console.warn('[Redis]', err.message))
    return client
  } catch (err) {
    console.warn('[Redis] Failed to connect:', err)
    return null
  }
}

export function redisAvailable(): boolean {
  return !!REDIS_URL && REDIS_URL !== ''
}

export function redisKey(parts: string[]): string {
  return KEY_PREFIX + parts.join(':')
}

export async function redisGet<T = string>(key: string): Promise<T | null> {
  const c = getClient()
  if (!c) return null
  try {
    const fullKey = key.startsWith(KEY_PREFIX) ? key : KEY_PREFIX + key
    const raw = await c.get(fullKey)
    if (raw == null) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export async function redisSet(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
  const c = getClient()
  if (!c) return
  try {
    const k = key.startsWith(KEY_PREFIX) ? key : KEY_PREFIX + key
    const v = JSON.stringify(value)
    if (ttlSeconds != null && ttlSeconds > 0) {
      await c.setex(k, ttlSeconds, v)
    } else {
      await c.set(k, v)
    }
  } catch (err) {
    console.warn('[Redis] set failed:', err)
  }
}

export async function redisDel(key: string): Promise<void> {
  const c = getClient()
  if (!c) return
  try {
    const k = key.startsWith(KEY_PREFIX) ? key : KEY_PREFIX + key
    await c.del(k)
  } catch {
    // ignore
  }
}

export async function redisDelPattern(prefix: string): Promise<void> {
  const c = getClient()
  if (!c) return
  try {
    const fullPrefix = prefix.startsWith(KEY_PREFIX) ? prefix : KEY_PREFIX + prefix
    const keys = await c.keys(fullPrefix + '*')
    if (keys.length > 0) await c.del(...keys)
  } catch {
    // ignore
  }
}
