/**
 * Metrics Middleware
 * 
 * Tracks HTTP metrics for Prometheus:
 * - Request count by method, route, status code
 * - Response time (latency)
 * - Error rates (4xx, 5xx)
 */

import { Request, Response, NextFunction } from 'express'

// Simple in-memory metrics store (can be replaced with Prometheus client)
interface Metric {
  name: string
  value: number
  labels: Record<string, string>
  timestamp: number
}

class MetricsCollector {
  private metrics: Metric[] = []
  private readonly MAX_METRICS = 10000 // Prevent memory leak

  record(name: string, value: number, labels: Record<string, string> = {}) {
    this.metrics.push({
      name,
      value,
      labels,
      timestamp: Date.now(),
    })

    // Keep only recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS)
    }
  }

  getMetrics(): Metric[] {
    return [...this.metrics]
  }

  getMetricsByType(type: string): Metric[] {
    return this.metrics.filter(m => m.name === type)
  }

  // Get error rate (4xx + 5xx) in last N minutes
  getErrorRate(minutes: number = 5): { total: number; errors: number; rate: number } {
    const cutoff = Date.now() - minutes * 60 * 1000
    const recent = this.metrics.filter(m => m.timestamp >= cutoff)
    const total = recent.filter(m => m.name === 'http_request_total').length
    const errors = recent.filter(
      m => m.name === 'http_request_total' && 
      (m.labels.status?.startsWith('4') || m.labels.status?.startsWith('5'))
    ).length

    return {
      total,
      errors,
      rate: total > 0 ? errors / total : 0,
    }
  }

  // Get status code distribution
  getStatusDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {}
    this.metrics
      .filter(m => m.name === 'http_request_total')
      .forEach(m => {
        const status = m.labels.status || 'unknown'
        distribution[status] = (distribution[status] || 0) + 1
      })
    return distribution
  }

  // Clear old metrics (older than N minutes)
  clearOldMetrics(minutes: number = 60) {
    const cutoff = Date.now() - minutes * 60 * 1000
    this.metrics = this.metrics.filter(m => m.timestamp >= cutoff)
  }
}

export const metricsCollector = new MetricsCollector()

// Clean up old metrics every 10 minutes
setInterval(() => {
  metricsCollector.clearOldMetrics(60)
}, 10 * 60 * 1000)

/**
 * Metrics middleware - tracks all HTTP requests
 */
export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now()
  const route = req.route?.path || req.path || 'unknown'

  // Record request start
  metricsCollector.record('http_request_total', 1, {
    method: req.method,
    route,
    status: 'pending',
  })

  // Track response
  res.on('finish', () => {
    const duration = Date.now() - startTime
    const status = res.statusCode.toString()

    // Record request completion
    metricsCollector.record('http_request_total', 1, {
      method: req.method,
      route,
      status,
    })

    // Record response time
    metricsCollector.record('http_request_duration_ms', duration, {
      method: req.method,
      route,
      status,
    })

    // Track errors separately
    if (status.startsWith('4')) {
      metricsCollector.record('http_4xx_errors', 1, {
        method: req.method,
        route,
        status,
      })
    } else if (status.startsWith('5')) {
      metricsCollector.record('http_5xx_errors', 1, {
        method: req.method,
        route,
        status,
      })
    }
  })

  next()
}

/**
 * Get Prometheus-formatted metrics
 */
export function getPrometheusMetrics(): string {
  const metrics = metricsCollector.getMetrics()
  const lines: string[] = []

  // Group metrics by name
  const grouped = metrics.reduce((acc, metric) => {
    if (!acc[metric.name]) {
      acc[metric.name] = []
    }
    acc[metric.name].push(metric)
    return acc
  }, {} as Record<string, Metric[]>)

  // Format as Prometheus metrics
  for (const [name, metricList] of Object.entries(grouped)) {
    // Aggregate by labels
    const aggregated = metricList.reduce((acc, m) => {
      const key = JSON.stringify(m.labels)
      if (!acc[key]) {
        acc[key] = { labels: m.labels, count: 0, sum: 0 }
      }
      acc[key].count += 1
      acc[key].sum += m.value
      return acc
    }, {} as Record<string, { labels: Record<string, string>; count: number; sum: number }>)

    // Output metrics
    for (const { labels, count, sum } of Object.values(aggregated)) {
      const labelStr = Object.entries(labels)
        .map(([k, v]) => `${k}="${v}"`)
        .join(',')
      
      if (name.includes('duration')) {
        // Histogram/summary format
        lines.push(`${name}_sum{${labelStr}} ${sum}`)
        lines.push(`${name}_count{${labelStr}} ${count}`)
      } else {
        // Counter format
        lines.push(`${name}{${labelStr}} ${count}`)
      }
    }
  }

  return lines.join('\n') + '\n'
}

