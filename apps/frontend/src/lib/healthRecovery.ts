/**
 * Health Recovery Utilities
 * 
 * Provides utilities to diagnose and recover from health issues.
 */

import { systemHealthManager, HealthStatus } from './systemHealth'
import { checkBackendHealth, checkDatabaseHealth, checkGooglePlacesHealth } from '../services/systemHealthChecks'

/**
 * Diagnose health issues and return actionable recommendations
 */
export interface HealthRecommendation {
  componentId: string
  componentName: string
  issue: string
  severity: 'critical' | 'warning' | 'info'
  steps: string[]
  canAutoRecover: boolean
}

export function diagnoseHealthIssues(): HealthRecommendation[] {
  const components = systemHealthManager.getAllComponents()
  const recommendations: HealthRecommendation[] = []

  components.forEach(component => {
    if (component.status === 'healthy') return

    let recommendation: HealthRecommendation = {
      componentId: component.id,
      componentName: component.name,
      issue: component.error || `${component.name} is ${component.status}`,
      severity: component.status === 'unhealthy' ? 'critical' : 'warning',
      steps: [],
      canAutoRecover: false,
    }

    switch (component.type) {
      case 'backend':
        recommendation.steps = [
          '1. Check if backend server is running: `cd apps/backend && npm run dev`',
          '2. Verify VITE_API_URL environment variable matches backend URL',
          '3. Check backend logs for errors',
          '4. Ensure backend port (default 3001) is not in use by another process',
        ]
        recommendation.severity = 'critical'
        break

      case 'database':
        recommendation.steps = [
          '1. Verify database is running (PostgreSQL)',
          '2. Check database connection in backend .env file',
          '3. Run database migrations: `cd apps/backend && npx prisma migrate dev`',
          '4. Test database connection: `cd apps/backend && npx prisma db pull`',
        ]
        recommendation.severity = 'critical'
        break

      case 'api-provider':
        if (component.id === 'google-places-api') {
          recommendation.steps = [
            '1. Set GOOGLE_PLACES_API_KEY in backend .env file',
            '2. Verify API key has Places API enabled in Google Cloud Console',
            '3. Check API key billing and quotas',
            '4. Note: Google Places API is optional - app works without it',
          ]
          recommendation.severity = 'warning'
          recommendation.canAutoRecover = false
        }
        break

      case 'ui':
        recommendation.steps = [
          '1. Clear browser cache and cookies',
          '2. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)',
          '3. Check browser console for JavaScript errors',
          '4. Try incognito/private browsing mode',
        ]
        recommendation.canAutoRecover = true
        break
    }

    recommendations.push(recommendation)
  })

  return recommendations
}

/**
 * Attempt to recover a specific component
 */
export async function attemptRecovery(componentId: string): Promise<{
  success: boolean
  message: string
}> {
  const component = systemHealthManager.getComponentStatus(componentId)
  if (!component) {
    return { success: false, message: 'Component not found' }
  }

  try {
    switch (component.type) {
      case 'backend':
        // Re-check backend
        const backendResult = await checkBackendHealth()
        systemHealthManager.updateComponentStatus(
          componentId,
          backendResult.status,
          backendResult.responseTime,
          backendResult.error
        )
        return {
          success: backendResult.status === 'healthy',
          message: backendResult.status === 'healthy'
            ? 'Backend is now healthy'
            : `Backend still ${backendResult.status}: ${backendResult.error}`,
        }

      case 'database':
        // Re-check database
        const dbResult = await checkDatabaseHealth()
        systemHealthManager.updateComponentStatus(
          componentId,
          dbResult.status,
          dbResult.responseTime,
          dbResult.error
        )
        return {
          success: dbResult.status === 'healthy',
          message: dbResult.status === 'healthy'
            ? 'Database is now healthy'
            : `Database still ${dbResult.status}: ${dbResult.error}`,
        }

      case 'api-provider':
        if (component.id === 'google-places-api') {
          const apiResult = await checkGooglePlacesHealth()
          systemHealthManager.updateComponentStatus(
            componentId,
            apiResult.status,
            apiResult.responseTime,
            apiResult.error
          )
          return {
            success: apiResult.status !== 'unhealthy',
            message: apiResult.status === 'healthy'
              ? 'Google Places API is configured'
              : 'Google Places API needs configuration (optional)',
          }
        }
        break

      case 'ui':
        // UI is always healthy if component renders
        systemHealthManager.updateComponentStatus(componentId, 'healthy')
        return { success: true, message: 'UI component is healthy' }
    }

    return { success: false, message: 'Recovery not available for this component type' }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Recovery failed',
    }
  }
}

/**
 * Get quick health status summary
 */
export function getHealthSummary(): {
  allHealthy: boolean
  criticalIssues: number
  warnings: number
  message: string
} {
  const components = systemHealthManager.getAllComponents()
  const unhealthy = components.filter(c => c.status !== 'healthy')
  const critical = unhealthy.filter(c => c.status === 'unhealthy')
  const warnings = unhealthy.filter(c => c.status === 'degraded')

  return {
    allHealthy: unhealthy.length === 0,
    criticalIssues: critical.length,
    warnings: warnings.length,
    message:
      unhealthy.length === 0
        ? 'All systems operational'
        : critical.length > 0
        ? `${critical.length} critical issue${critical.length !== 1 ? 's' : ''} need immediate attention`
        : `${warnings.length} component${warnings.length !== 1 ? 's' : ''} ${warnings.length === 1 ? 'has' : 'have'} warnings`,
  }
}





