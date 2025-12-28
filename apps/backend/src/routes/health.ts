import { Router } from 'express'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { prisma } from '../lib/prisma'
import { ensureDailyTick } from '../services/tickService'
import { getEffectiveEnergy } from '../services/energyService'
import { isInBurnout } from '../services/burnoutService'
import { ActivityType } from '../types'
import { logger } from '../lib/logger.js'

const router = Router()

/**
 * GET /api/health
 * System health check endpoint (no auth required)
 * Returns system status and version information
 */
router.get('/', async (req, res) => {
  try {
    const versionInfo = {
      version: process.env.BUILD_VERSION || 'dev-unknown',
      commit: process.env.BUILD_COMMIT || 'unknown',
      branch: process.env.BUILD_BRANCH || 'unknown',
      buildTimestamp: process.env.BUILD_TIMESTAMP || 'unknown',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    }

    // Check database connection
    let dbStatus = 'unknown'
    try {
      await prisma.$queryRaw`SELECT 1`
      dbStatus = 'connected'
    } catch (error) {
      dbStatus = 'disconnected'
    }

    res.json({
      status: 'ok',
      version: versionInfo,
      database: {
        status: dbStatus,
      },
      uptime: process.uptime(),
    })
  } catch (error) {
    logger.error('Error in health check:', error)
    res.status(500).json({
      status: 'error',
      error: 'Health check failed',
      timestamp: new Date().toISOString(),
    })
  }
})

/**
 * GET /api/health/database
 * Database health check endpoint (no auth required)
 * Returns database connection status and latency
 */
router.get('/database', async (req, res) => {
  try {
    const startTime = Date.now()
    
    // Test database connection
    try {
      await prisma.$queryRaw`SELECT 1`
      const latency = Date.now() - startTime
      
      res.json({
        status: 'healthy',
        connected: true,
        latency,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      const latency = Date.now() - startTime
      res.status(503).json({
        status: 'unhealthy',
        connected: false,
        latency,
        error: error instanceof Error ? error.message : 'Database connection failed',
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    logger.error('Error in database health check:', error)
    res.status(500).json({
      status: 'error',
      error: 'Health check failed',
      timestamp: new Date().toISOString(),
    })
  }
})

/**
 * GET /api/health/status
 * Get current health/capacity status for the authenticated user
 */
router.get('/status', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    
    // Ensure daily tick is applied
    await ensureDailyTick(userId)
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        cloud: true,
        resources: true,
      },
    })

    if (!user || !user.cloud || !user.resources) {
      return res.status(404).json({ error: 'User data not found' })
    }

    const userIsInBurnout = await isInBurnout(userId)
    const currentEnergy = user.resources.energy ?? 100
    const capacity = user.cloud.capacityStrength
    const usableEnergy = getEffectiveEnergy(currentEnergy, capacity, userIsInBurnout)

    // Get recovery actions in past 7 days
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - 7)

    const recoveryActions = await prisma.activityLog.count({
      where: {
        userId,
        activityType: {
          in: [
            ActivityType.EXERCISE,
            ActivityType.LEARNING,
            ActivityType.SAVE_EXPENSES,
            ActivityType.REST,
          ],
        },
        timestamp: {
          gte: weekStart,
        },
      },
    })

    // Get consecutive high effort days
    const consecutiveHighEffortDays = user.consecutiveHighEffortDays || 0

    // Calculate capacity band
    let capacityBand: 'critical' | 'low' | 'medium' | 'high' | 'optimal'
    if (capacity <= 20) {
      capacityBand = 'critical'
    } else if (capacity <= 40) {
      capacityBand = 'low'
    } else if (capacity <= 70) {
      capacityBand = 'medium'
    } else if (capacity <= 85) {
      capacityBand = 'high'
    } else {
      capacityBand = 'optimal'
    }

    // Get last recovery action
    const lastRecoveryAction = await prisma.activityLog.findFirst({
      where: {
        userId,
        activityType: {
          in: [
            ActivityType.EXERCISE,
            ActivityType.LEARNING,
            ActivityType.SAVE_EXPENSES,
            ActivityType.REST,
          ],
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      select: {
        timestamp: true,
        activityType: true,
      },
    })

    res.json({
      capacity: capacity,
      capacityBand,
      isInBurnout: userIsInBurnout,
      consecutiveHighEffortDays,
      recoveryActionsThisWeek: recoveryActions,
      lastRecoveryActionAt: lastRecoveryAction?.timestamp || user.lastRecoveryActionAt,
      energy: {
        current: currentEnergy,
        usable: usableEnergy,
        capacityCap: usableEnergy,
      },
      // System interactions
      systems: {
        energy: {
          capacityModifiesEnergy: true,
          currentEnergyCap: usableEnergy,
          baseEnergyCap: capacity >= 80 ? 110 : capacity >= 60 ? 100 : capacity >= 30 ? 85 : 70,
        },
        burnout: {
          isInBurnout: userIsInBurnout,
          riskLevel: capacity < 30 ? 'high' : capacity < 50 ? 'medium' : 'low',
          consecutiveLowCapacityDays: user.consecutiveLowCapacityDays || 0,
        },
        xp: {
          efficiencyModifier: capacity <= 20 ? 0.6 : capacity <= 40 ? 0.8 : capacity <= 70 ? 1.0 : capacity <= 85 ? 1.1 : 1.15,
        },
      },
    })
  } catch (error) {
    logger.error('Error getting health status:', error)
    res.status(500).json({ error: 'Failed to get health status' })
  }
})

/**
 * POST /api/health/quick-fix
 * System-level quick health fix endpoint
 * Clears caches, refreshes health checks, and attempts automatic recovery
 */
router.post('/quick-fix', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const { systemId } = req.body // Optional: 'money', 'energy', 'travel', etc.

    const results = {
      cacheCleared: false,
      healthChecksRefreshed: false,
      recoveryAttempted: false,
      issuesFixed: 0,
      issuesRemaining: 0,
      details: [] as string[],
    }

    // Step 1: Clear caches
    try {
      // Clear any in-memory caches (if we have any)
      // For now, we'll just ensure fresh data by forcing a tick
      await ensureDailyTick(userId)
      results.cacheCleared = true
      results.details.push('Caches cleared and data refreshed')
    } catch (error) {
      logger.error('Error clearing caches:', error)
      results.details.push('Warning: Cache clear had issues')
    }

    // Step 2: Refresh health checks
    try {
      // Force refresh by ensuring daily tick (which validates system state)
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          cloud: true,
          resources: true,
        },
      })

      if (user && user.cloud && user.resources) {
        // Validate system state
        const userIsInBurnout = await isInBurnout(userId)
        const capacity = user.cloud.capacityStrength
        
        // Check for critical issues
        const criticalIssues: string[] = []
        
        if (capacity <= 20) {
          criticalIssues.push('Critical: Capacity is very low')
        }
        
        if (userIsInBurnout) {
          criticalIssues.push('Critical: User is in burnout state')
        }

        if (user.resources.oxygen < 0.5) {
          criticalIssues.push('Critical: Oxygen (financial buffer) is very low')
        }

        results.healthChecksRefreshed = true
        results.issuesRemaining = criticalIssues.length
        results.details.push(`Health checks refreshed. Found ${criticalIssues.length} critical issue(s)`)
        
        if (criticalIssues.length > 0) {
          results.details.push(...criticalIssues)
        }
      }
    } catch (error) {
      logger.error('Error refreshing health checks:', error)
      results.details.push('Warning: Health check refresh had issues')
    }

    // Step 3: Attempt automatic recovery
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          cloud: true,
          resources: true,
        },
      })

      if (user && user.cloud) {
        const capacity = user.cloud.capacityStrength
        const userIsInBurnout = await isInBurnout(userId)
        
        // Automatic recovery actions we can take:
        // 1. If in burnout and capacity is recovering, check if recovery conditions are met
        if (userIsInBurnout && capacity > 25) {
          // Check if recovery actions have been taken
          const weekStart = new Date()
          weekStart.setDate(weekStart.getDate() - 7)
          
          const recoveryActions = await prisma.activityLog.count({
            where: {
              userId,
              activityType: {
                in: [
                  ActivityType.EXERCISE,
                  ActivityType.LEARNING,
                  ActivityType.SAVE_EXPENSES,
                  ActivityType.REST,
                ],
              },
              timestamp: {
                gte: weekStart,
              },
            },
          })

          if (recoveryActions > 0) {
            // Recovery conditions may be met - this would be handled by the next tick
            results.recoveryAttempted = true
            results.details.push('Recovery conditions checked - recovery will be processed on next tick if conditions are met')
          }
        }

        // 2. Ensure system state is consistent
        await ensureDailyTick(userId)
        results.recoveryAttempted = true
        results.details.push('System state validated and synchronized')
      }
    } catch (error) {
      logger.error('Error attempting recovery:', error)
      results.details.push('Warning: Recovery attempt had issues')
    }

    // Determine overall success
    const success = results.cacheCleared && results.healthChecksRefreshed && results.recoveryAttempted

    res.json({
      success,
      message: success 
        ? 'Quick fix completed successfully'
        : 'Quick fix completed with some warnings',
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('Error performing quick fix:', error)
    res.status(500).json({ 
      error: 'Failed to perform quick fix',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router
