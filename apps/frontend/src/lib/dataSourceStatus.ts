/**
 * Data Source Status Tracking
 * 
 * Tracks the status of individual data sources (agents, teams, products, etc.)
 * to provide detailed information about data accessibility.
 */

export type DataSourceStatus = 'available' | 'unavailable' | 'partial' | 'loading' | 'error'

export interface DataSource {
  id: string
  name: string
  status: DataSourceStatus
  lastChecked?: number
  error?: string
  recordCount?: number
  expectedCount?: number
}

export interface DataSourceStatusMap {
  [key: string]: DataSource
}

/**
 * Data Source Status Manager
 */
class DataSourceStatusManager {
  private sources: DataSourceStatusMap = {}

  /**
   * Register or update a data source
   */
  registerSource(source: Omit<DataSource, 'lastChecked'>): void {
    this.sources[source.id] = {
      ...source,
      lastChecked: Date.now(),
    }
  }

  /**
   * Get status of a specific source
   */
  getSourceStatus(sourceId: string): DataSource | null {
    return this.sources[sourceId] || null
  }

  /**
   * Get all sources
   */
  getAllSources(): DataSource[] {
    return Object.values(this.sources)
  }

  /**
   * Get sources by status
   */
  getSourcesByStatus(status: DataSourceStatus): DataSource[] {
    return Object.values(this.sources).filter(source => source.status === status)
  }

  /**
   * Get overall status summary
   */
  getStatusSummary(): {
    total: number
    available: number
    unavailable: number
    partial: number
    loading: number
    error: number
    overallStatus: 'all-available' | 'partial' | 'degraded' | 'unavailable'
  } {
    const sources = Object.values(this.sources)
    const total = sources.length
    const available = sources.filter(s => s.status === 'available').length
    const unavailable = sources.filter(s => s.status === 'unavailable').length
    const partial = sources.filter(s => s.status === 'partial').length
    const loading = sources.filter(s => s.status === 'loading').length
    const error = sources.filter(s => s.status === 'error').length

    let overallStatus: 'all-available' | 'partial' | 'degraded' | 'unavailable'
    if (total === 0) {
      overallStatus = 'unavailable'
    } else if (available === total) {
      overallStatus = 'all-available'
    } else if (available > 0 || partial > 0) {
      overallStatus = 'partial'
    } else if (error > 0 || unavailable > 0) {
      overallStatus = 'degraded'
    } else {
      overallStatus = 'unavailable'
    }

    return {
      total,
      available,
      unavailable,
      partial,
      loading,
      error,
      overallStatus,
    }
  }

  /**
   * Clear all sources
   */
  clear(): void {
    this.sources = {}
  }

  /**
   * Remove a source
   */
  removeSource(sourceId: string): void {
    delete this.sources[sourceId]
  }
}

// Global instance
export const dataSourceStatusManager = new DataSourceStatusManager()

/**
 * Helper to create data source from fetch result
 */
export function createDataSourceFromFetch(
  id: string,
  name: string,
  data: any[] | null,
  error: Error | null,
  loading: boolean,
  expectedCount?: number
): DataSource {
  let status: DataSourceStatus = 'loading'
  let recordCount: number | undefined

  if (loading) {
    status = 'loading'
  } else if (error) {
    status = 'error'
  } else if (data === null) {
    status = 'unavailable'
  } else if (Array.isArray(data)) {
    recordCount = data.length
    if (data.length === 0) {
      status = 'unavailable'
    } else if (expectedCount && data.length < expectedCount) {
      status = 'partial'
    } else {
      status = 'available'
    }
  } else {
    status = data ? 'available' : 'unavailable'
  }

  return {
    id,
    name,
    status,
    recordCount,
    expectedCount,
    error: error?.message,
    lastChecked: Date.now(),
  }
}





