/**
 * Vite Plugin for Prometheus Metrics
 * Exposes /metrics endpoint for Prometheus scraping
 */

import type { Plugin } from 'vite'

interface MetricsCollector {
  httpRequestsTotal: number
  httpRequests4xx: number
  httpRequests5xx: number
  startTime: number
}

const metrics: MetricsCollector = {
  httpRequestsTotal: 0,
  httpRequests4xx: 0,
  httpRequests5xx: 0,
  startTime: Date.now(),
}

export function metricsPlugin(): Plugin {
  return {
    name: 'prometheus-metrics',
    configureServer(server) {
      // Add /metrics endpoint
      server.middlewares.use('/metrics', (req, res, next) => {
        if (req.method === 'GET' && req.url === '/metrics') {
          const uptime = (Date.now() - metrics.startTime) / 1000
          
          // Prometheus metrics format
          const prometheusMetrics = `# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{service="frontend"} ${metrics.httpRequestsTotal}

# HELP http_requests_4xx_total Total number of 4xx HTTP requests
# TYPE http_requests_4xx_total counter
http_requests_4xx_total{service="frontend"} ${metrics.httpRequests4xx}

# HELP http_requests_5xx_total Total number of 5xx HTTP requests
# TYPE http_requests_5xx_total counter
http_requests_5xx_total{service="frontend"} ${metrics.httpRequests5xx}

# HELP frontend_uptime_seconds Frontend uptime in seconds
# TYPE frontend_uptime_seconds gauge
frontend_uptime_seconds{service="frontend"} ${uptime}

# HELP frontend_info Frontend information
# TYPE frontend_info gauge
frontend_info{service="frontend",environment="dev",version="dev"} 1
`

          res.setHeader('Content-Type', 'text/plain; version=0.0.4')
          res.statusCode = 200
          res.end(prometheusMetrics)
        } else {
          next()
        }
      })

      // Track requests (simple counter)
      server.middlewares.use((req, res, next) => {
        metrics.httpRequestsTotal++
        
        // Track response status
        const originalEnd = res.end
        res.end = function(chunk?: any, encoding?: any) {
          if (res.statusCode >= 400 && res.statusCode < 500) {
            metrics.httpRequests4xx++
          } else if (res.statusCode >= 500) {
            metrics.httpRequests5xx++
          }
          originalEnd.call(this, chunk, encoding)
        }
        
        next()
      })
    },
  }
}

