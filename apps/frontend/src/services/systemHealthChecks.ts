/**
 * System Health Check Functions
 * 
 * Provides health check functions for different system components.
 */

import { HealthStatus, systemHealthManager } from '../lib/systemHealth'
import { checkHealth } from './healthCheck'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/**
 * Check backend health
 */
export async function checkBackendHealth(): Promise<{
  status: HealthStatus
  responseTime?: number
  error?: string
}> {
  const startTime = Date.now()
  try {
    const health = await checkHealth(true) // Force refresh
    const responseTime = Date.now() - startTime

    if (health.status === 'healthy') {
      return { status: 'healthy', responseTime }
    } else if (health.status === 'degraded') {
      return { status: 'degraded', responseTime, error: health.message }
    } else {
      return { status: 'unhealthy', responseTime, error: health.message }
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    return {
      status: 'unhealthy',
      responseTime,
      error: error instanceof Error ? error.message : 'Backend check failed',
    }
  }
}

/**
 * Check database health via backend
 */
export async function checkDatabaseHealth(): Promise<{
  status: HealthStatus
  responseTime?: number
  error?: string
}> {
  const startTime = Date.now()
  try {
    const response = await fetch(`${API_BASE}/api/health/database`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    })
    const responseTime = Date.now() - startTime

    if (response.ok) {
      const data = await response.json()
      return { status: 'healthy', responseTime: data.responseTime || responseTime }
    } else {
      return {
        status: 'unhealthy',
        responseTime,
        error: `HTTP ${response.status}`,
      }
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    return {
      status: 'unhealthy',
      responseTime,
      error: error instanceof Error ? error.message : 'Database check failed',
    }
  }
}

/**
 * Check Google Places API (if used)
 */
export async function checkGooglePlacesHealth(): Promise<{
  status: HealthStatus
  responseTime?: number
  error?: string
}> {
  const startTime = Date.now()
  try {
    const response = await fetch(`${API_BASE}/api/travel/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    })
    const responseTime = Date.now() - startTime

    if (response.ok) {
      const data = await response.json()
      if (data.googlePlacesApi === 'configured') {
        return { status: 'healthy', responseTime }
      } else {
        return { status: 'degraded', responseTime, error: 'Not configured' }
      }
    } else {
      return {
        status: 'unhealthy',
        responseTime,
        error: `HTTP ${response.status}`,
      }
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    return {
      status: 'unhealthy',
      responseTime,
      error: error instanceof Error ? error.message : 'Google Places check failed',
    }
  }
}

/**
 * Check UI health (always healthy if component is rendered)
 */
export function checkUIHealth(): {
  status: HealthStatus
  responseTime?: number
  error?: string
} {
  return {
    status: 'healthy',
    responseTime: 0,
  }
}

/**
 * Initialize system health monitoring
 */
export function initializeSystemHealth(): void {
  // Register shared components (available to all systems)
  systemHealthManager.registerComponent({
    id: 'backend-api',
    name: 'Backend API',
    type: 'backend',
    status: 'checking',
    endpoint: `${API_BASE}/api/health`,
    metadata: {
      systemId: 'dashboard', // Shared component
      runbookUrl: '/system-health/dashboard/components',
      expectedErrors: ['ECONNREFUSED', 'Timeout', '500 Internal Server Error'],
      bestPractices: ['Ensure backend is running on port 3001', 'Check network connectivity'],
    },
  })

  systemHealthManager.registerComponent({
    id: 'database',
    name: 'Database',
    type: 'database',
    status: 'checking',
    endpoint: `${API_BASE}/api/health/database`,
    metadata: {
      systemId: 'dashboard', // Shared component
      runbookUrl: '/system-health/dashboard/components',
      expectedErrors: ['Connection refused', 'Database timeout', 'Migration errors'],
      bestPractices: ['Ensure PostgreSQL is running', 'Check DATABASE_URL environment variable'],
    },
  })

  systemHealthManager.registerComponent({
    id: 'ui',
    name: 'User Interface',
    type: 'ui',
    status: 'healthy',
    metadata: {
      systemId: 'dashboard', // Shared component
    },
  })

  // Register Travel system-specific components
  try {
    systemHealthManager.registerComponent({
      id: 'google-places-api',
      name: 'Google Places API',
      type: 'api-provider',
      status: 'checking',
      endpoint: 'Google Places',
      metadata: {
        systemId: 'travel',
        apiKeyStatus: 'checking',
        runbookUrl: '/system-health/travel/dependencies',
        expectedErrors: ['API key invalid', 'Quota exceeded', 'Request denied'],
        bestPractices: [
          'Set GOOGLE_PLACES_API_KEY environment variable',
          'Check API key permissions in Google Cloud Console',
          'Monitor API quota usage',
        ],
      },
    })
  } catch (e) {
    // Ignore if not available
  }

  // Register Money system-specific components (if any)
  // These would be added when Money system has specific dependencies

  // Register Energy system-specific components (if any)
  // These would be added when Energy system has specific dependencies

  // Start auto-checking
  systemHealthManager.startAutoCheck('backend-api', checkBackendHealth, 30000)
  systemHealthManager.startAutoCheck('database', checkDatabaseHealth, 30000)
  
  // Check Google Places less frequently (external API)
  try {
    systemHealthManager.startAutoCheck('google-places-api', checkGooglePlacesHealth, 60000)
  } catch (e) {
    // Ignore if not available
  }
}

