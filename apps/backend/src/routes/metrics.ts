/**
 * Metrics Routes
 * 
 * Exposes Prometheus metrics and observability endpoints
 */

import { Router, Request, Response } from 'express'
import { getPrometheusMetrics, metricsCollector } from '../middleware/metrics.js'
import { prisma } from '../lib/prisma.js'

const router = Router()

/**
 * GET /api/metrics
 * Prometheus metrics endpoint
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const metrics = getPrometheusMetrics()
    res.set('Content-Type', 'text/plain')
    res.send(metrics)
  } catch (error) {
    console.error('Error generating metrics:', error)
    res.status(500).json({ error: 'Failed to generate metrics' })
  }
})

/**
 * GET /api/metrics/errors
 * Get error statistics (4xx/5xx)
 */
router.get('/errors', async (req: Request, res: Response) => {
  try {
    const minutes = parseInt(req.query.minutes as string) || 5
    const errorRate = metricsCollector.getErrorRate(minutes)
    const statusDistribution = metricsCollector.getStatusDistribution()

    // Separate 4xx and 5xx
    const errors4xx = Object.entries(statusDistribution)
      .filter(([status]) => status.startsWith('4'))
      .reduce((sum, [, count]) => sum + count, 0)

    const errors5xx = Object.entries(statusDistribution)
      .filter(([status]) => status.startsWith('5'))
      .reduce((sum, [, count]) => sum + count, 0)

    res.json({
      period: `${minutes} minutes`,
      total: errorRate.total,
      errors: errorRate.errors,
      errorRate: errorRate.rate,
      breakdown: {
        '4xx': errors4xx,
        '5xx': errors5xx,
      },
      statusDistribution,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error getting error metrics:', error)
    res.status(500).json({ error: 'Failed to get error metrics' })
  }
})

/**
 * GET /api/metrics/health
 * Comprehensive health check for FE, BE, DB
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Backend health
    const backendHealth = {
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    }

    // Database health
    let dbHealth = {
      status: 'unknown',
      connected: false,
      latency: 0,
      error: null as string | null,
    }

    try {
      const startTime = Date.now()
      await prisma.$queryRaw`SELECT 1`
      const latency = Date.now() - startTime
      
      dbHealth = {
        status: 'healthy',
        connected: true,
        latency,
        error: null,
      }
    } catch (error: any) {
      dbHealth = {
        status: 'unhealthy',
        connected: false,
        latency: 0,
        error: error.message || 'Database connection failed',
      }
    }

    // Error rate
    const errorRate = metricsCollector.getErrorRate(5)

    res.json({
      backend: backendHealth,
      database: dbHealth,
      errors: {
        rate: errorRate.rate,
        total: errorRate.total,
        errorCount: errorRate.errors,
        period: '5 minutes',
      },
      overall: {
        status: dbHealth.status === 'healthy' && errorRate.rate < 0.1 ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Error getting health metrics:', error)
    res.status(500).json({ error: 'Failed to get health metrics' })
  }
})

export default router

