/**
 * Health Check Service
 * 
 * Checks backend and service availability before making critical requests.
 * Caches health status with TTL to avoid excessive checks.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: number
  services?: {
    database?: 'healthy' | 'degraded' | 'unhealthy'
    api?: 'healthy' | 'degraded' | 'unhealthy'
  }
  message?: string
}

interface CachedHealthStatus extends HealthStatus {
  cachedUntil: number
}

// Cache health status for 30 seconds
const HEALTH_CACHE_TTL = 30 * 1000
let cachedHealth: CachedHealthStatus | null = null

/**
 * Check backend health status
 */
export async function checkHealth(forceRefresh: boolean = false): Promise<HealthStatus> {
  // Return cached status if still valid and not forcing refresh
  if (!forceRefresh && cachedHealth && cachedHealth.cachedUntil > Date.now()) {
    return {
      status: cachedHealth.status,
      timestamp: cachedHealth.timestamp,
      services: cachedHealth.services,
      message: cachedHealth.message,
    }
  }

  try {
    const response = await fetch(`${API_BASE}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Timeout after 5 seconds
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      const healthStatus: HealthStatus = {
        status: 'degraded',
        timestamp: Date.now(),
        message: `Backend returned ${response.status}`,
      }
      
      // Cache even degraded status
      cachedHealth = {
        ...healthStatus,
        cachedUntil: Date.now() + HEALTH_CACHE_TTL,
      }
      
      return healthStatus
    }

    const data = await response.json()
    const healthStatus: HealthStatus = {
      status: data.status || 'healthy',
      timestamp: Date.now(),
      services: data.services,
      message: data.message,
    }

    // Cache healthy status
    cachedHealth = {
      ...healthStatus,
      cachedUntil: Date.now() + HEALTH_CACHE_TTL,
    }

    return healthStatus
  } catch (error) {
    // Network error or timeout
    const healthStatus: HealthStatus = {
      status: 'unhealthy',
      timestamp: Date.now(),
      message: error instanceof Error ? error.message : 'Network error',
    }

    // Cache unhealthy status for shorter time (10 seconds)
    cachedHealth = {
      ...healthStatus,
      cachedUntil: Date.now() + 10 * 1000,
    }

    return healthStatus
  }
}

/**
 * Check if backend is available (quick check)
 */
export async function isBackendAvailable(): Promise<boolean> {
  const health = await checkHealth()
  return health.status !== 'unhealthy'
}

/**
 * Check specific service health
 */
export async function checkServiceHealth(service: 'database' | 'api'): Promise<'healthy' | 'degraded' | 'unhealthy'> {
  const health = await checkHealth()
  return health.services?.[service] || 'unhealthy'
}

/**
 * Clear health cache (useful for testing or after errors)
 */
export function clearHealthCache(): void {
  cachedHealth = null
}

/**
 * Get cached health status without making a request
 */
export function getCachedHealth(): HealthStatus | null {
  if (cachedHealth && cachedHealth.cachedUntil > Date.now()) {
    return {
      status: cachedHealth.status,
      timestamp: cachedHealth.timestamp,
      services: cachedHealth.services,
      message: cachedHealth.message,
    }
  }
  return null
}


