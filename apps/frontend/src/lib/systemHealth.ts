/**
 * System Health Monitoring
 * 
 * Tracks live availability of:
 * - External API providers (Google Places, etc.)
 * - Internal components (Database, Backend, UI)
 */

export type ComponentType = 'api-provider' | 'database' | 'backend' | 'ui' | 'service'
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown' | 'checking'

export type SystemId = 'money' | 'energy' | 'travel' | 'dashboard'

export interface SystemComponent {
  id: string
  name: string
  type: ComponentType
  status: HealthStatus
  lastChecked: number
  responseTime?: number // in milliseconds
  error?: string
  endpoint?: string
  metadata?: {
    systemId?: SystemId
    version?: string
    region?: string
    apiKeyStatus?: 'valid' | 'invalid' | 'missing'
    runbookUrl?: string
    expectedErrors?: string[]
    [key: string]: any
  }
}

export interface SystemHealthMetadata {
  systemId: SystemId
  components: SystemComponent[]
  dependencies: {
    apiKeys: string[]
    externalServices: string[]
    integrations: string[]
  }
  runbooks: {
    [componentId: string]: {
      url: string
      expectedErrors: string[]
      bestPractices: string[]
    }
  }
}

export interface SystemHealthMap {
  [componentId: string]: SystemComponent
}

/**
 * System Health Manager
 */
class SystemHealthManager {
  private components: SystemHealthMap = {}
  private checkIntervals: Map<string, NodeJS.Timeout> = new Map()

  /**
   * Register a system component
   */
  registerComponent(component: Omit<SystemComponent, 'lastChecked'>): void {
    this.components[component.id] = {
      ...component,
      lastChecked: Date.now(),
    }
  }

  /**
   * Update component status
   */
  updateComponentStatus(
    componentId: string,
    status: HealthStatus,
    responseTime?: number,
    error?: string
  ): void {
    if (this.components[componentId]) {
      this.components[componentId] = {
        ...this.components[componentId],
        status,
        lastChecked: Date.now(),
        responseTime,
        error,
      }
    }
  }

  /**
   * Get component status
   */
  getComponentStatus(componentId: string): SystemComponent | null {
    return this.components[componentId] || null
  }

  /**
   * Get all components
   */
  getAllComponents(): SystemComponent[] {
    return Object.values(this.components)
  }

  /**
   * Get components by type
   */
  getComponentsByType(type: ComponentType): SystemComponent[] {
    return Object.values(this.components).filter(comp => comp.type === type)
  }

  /**
   * Get components by system ID
   */
  getComponentsBySystem(systemId: SystemId): SystemComponent[] {
    return Object.values(this.components).filter(
      comp => comp.metadata?.systemId === systemId
    )
  }

  /**
   * Get system-specific health metadata
   */
  getSystemMetadata(systemId: SystemId): SystemHealthMetadata {
    const systemComponents = this.getComponentsBySystem(systemId)
    const apiProviders = systemComponents.filter(c => c.type === 'api-provider')

    const dependencies = {
      apiKeys: apiProviders
        .map(c => c.metadata?.apiKeyStatus)
        .filter((status): status is string => !!status),
      externalServices: apiProviders.map(c => c.name),
      integrations: systemComponents
        .filter(c => c.type === 'service')
        .map(c => c.name),
    }

    const runbooks: SystemHealthMetadata['runbooks'] = {}
    systemComponents.forEach(comp => {
      if (comp.metadata?.runbookUrl) {
        runbooks[comp.id] = {
          url: comp.metadata.runbookUrl,
          expectedErrors: comp.metadata.expectedErrors || [],
          bestPractices: comp.metadata.bestPractices || [],
        }
      }
    })

    return {
      systemId,
      components: systemComponents,
      dependencies,
      runbooks,
    }
  }

  /**
   * Get overall system health
   */
  getOverallHealth(): {
    overall: HealthStatus
    healthy: number
    degraded: number
    unhealthy: number
    unknown: number
    total: number
    byType: Record<ComponentType, { total: number; healthy: number; degraded: number; unhealthy: number }>
  } {
    const components = Object.values(this.components)
    const total = components.length
    const healthy = components.filter(c => c.status === 'healthy').length
    const degraded = components.filter(c => c.status === 'degraded').length
    const unhealthy = components.filter(c => c.status === 'unhealthy').length
    const unknown = components.filter(c => c.status === 'unknown' || c.status === 'checking').length

    let overall: HealthStatus = 'unknown'
    if (total === 0) {
      overall = 'unknown'
    } else if (unhealthy > 0) {
      overall = 'unhealthy'
    } else if (degraded > 0) {
      overall = 'degraded'
    } else if (healthy === total) {
      overall = 'healthy'
    } else {
      overall = 'degraded'
    }

    // Group by type
    const byType: Record<ComponentType, { total: number; healthy: number; degraded: number; unhealthy: number }> = {
      'api-provider': { total: 0, healthy: 0, degraded: 0, unhealthy: 0 },
      'database': { total: 0, healthy: 0, degraded: 0, unhealthy: 0 },
      'backend': { total: 0, healthy: 0, degraded: 0, unhealthy: 0 },
      'ui': { total: 0, healthy: 0, degraded: 0, unhealthy: 0 },
      'service': { total: 0, healthy: 0, degraded: 0, unhealthy: 0 },
    }

    components.forEach(comp => {
      const typeStats = byType[comp.type]
      typeStats.total++
      if (comp.status === 'healthy') typeStats.healthy++
      else if (comp.status === 'degraded') typeStats.degraded++
      else if (comp.status === 'unhealthy') typeStats.unhealthy++
    })

    return {
      overall,
      healthy,
      degraded,
      unhealthy,
      unknown,
      total,
      byType,
    }
  }

  /**
   * Start auto-checking a component
   */
  startAutoCheck(
    componentId: string,
    checkFn: () => Promise<{ status: HealthStatus; responseTime?: number; error?: string }>,
    intervalMs: number = 30000 // 30 seconds default
  ): void {
    // Clear existing interval if any
    this.stopAutoCheck(componentId)

    // Perform initial check
    checkFn()
      .then(result => {
        this.updateComponentStatus(componentId, result.status, result.responseTime, result.error)
      })
      .catch(error => {
        this.updateComponentStatus(componentId, 'unhealthy', undefined, error.message)
      })

    // Set up interval
    const interval = setInterval(() => {
      checkFn()
        .then(result => {
          this.updateComponentStatus(componentId, result.status, result.responseTime, result.error)
        })
        .catch(error => {
          this.updateComponentStatus(componentId, 'unhealthy', undefined, error.message)
        })
    }, intervalMs)

    this.checkIntervals.set(componentId, interval)
  }

  /**
   * Stop auto-checking a component
   */
  stopAutoCheck(componentId: string): void {
    const interval = this.checkIntervals.get(componentId)
    if (interval) {
      clearInterval(interval)
      this.checkIntervals.delete(componentId)
    }
  }

  /**
   * Clear all components
   */
  clear(): void {
    // Stop all intervals
    this.checkIntervals.forEach(interval => clearInterval(interval))
    this.checkIntervals.clear()
    this.components = {}
  }
}

// Global instance
export const systemHealthManager = new SystemHealthManager()

