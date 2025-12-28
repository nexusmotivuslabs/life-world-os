/**
 * SleepController
 * 
 * Presentation layer controller for sleep-related endpoints.
 * Uses use cases to handle business logic.
 */

import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { PrismaSleepRepositoryAdapter } from '../../infrastructure/adapters/database/PrismaSleepRepositoryAdapter.js'
import { UserEnergyContextAdapter } from '../../infrastructure/adapters/userContext/UserEnergyContextAdapter.js'
import {
  LogSleepUseCase,
  GetSleepHistoryUseCase,
  GetMostRecentSleepUseCase,
  CalculateEnergyRestorationUseCase,
} from '../../application/useCases/SleepUseCases.js'
import { prisma } from '../../../../lib/prisma.js'
import { authenticateToken, AuthRequest } from '../../../../middleware/auth.js'
import { logger } from '../lib/logger.js'

const router = Router()

// Initialize adapters and use cases
const sleepRepository = new PrismaSleepRepositoryAdapter(prisma)
const userContext = new UserEnergyContextAdapter(prisma)

const logSleepUseCase = new LogSleepUseCase(sleepRepository, userContext)
const getSleepHistoryUseCase = new GetSleepHistoryUseCase(sleepRepository)
const getMostRecentSleepUseCase = new GetMostRecentSleepUseCase(sleepRepository)
const calculateEnergyRestorationUseCase = new CalculateEnergyRestorationUseCase(
  sleepRepository,
  userContext
)

/**
 * POST /api/sleep
 * Log sleep for a specific date
 */
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!
    const { date, hoursSlept, quality, bedTime, wakeTime, notes } = req.body

    if (!date || !hoursSlept || !quality) {
      return res.status(400).json({
        error: 'date, hoursSlept, and quality are required',
      })
    }

    if (hoursSlept < 0 || hoursSlept > 24) {
      return res.status(400).json({
        error: 'hoursSlept must be between 0 and 24',
      })
    }

    if (quality < 1 || quality > 10) {
      return res.status(400).json({
        error: 'quality must be between 1 and 10',
      })
    }

    const sleepDate = new Date(date)
    const bedTimeDate = bedTime ? new Date(bedTime) : undefined
    const wakeTimeDate = wakeTime ? new Date(wakeTime) : undefined

    const sleep = await logSleepUseCase.execute(
      userId,
      sleepDate,
      hoursSlept,
      quality,
      bedTimeDate,
      wakeTimeDate,
      notes
    )

    res.json({
      id: sleep.id,
      userId: sleep.userId,
      date: sleep.date,
      hoursSlept: sleep.hoursSlept,
      quality: sleep.quality.value,
      bedTime: sleep.bedTime,
      wakeTime: sleep.wakeTime,
      energyRestored: sleep.energyRestored,
      notes: sleep.notes,
      isOptimal: sleep.isOptimal(),
      category: sleep.getCategory(),
      createdAt: sleep.createdAt,
      updatedAt: sleep.updatedAt,
    })
  } catch (error: any) {
    logger.error('Error logging sleep:', error)
    res.status(500).json({ error: error.message || 'Failed to log sleep' })
  }
})

/**
 * GET /api/sleep
 * Get sleep history for the authenticated user
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!
    const { startDate, endDate } = req.query

    const start = startDate ? new Date(startDate as string) : undefined
    const end = endDate ? new Date(endDate as string) : undefined

    const sleepLogs = await getSleepHistoryUseCase.execute(userId, start, end)

    res.json({
      sleepLogs: sleepLogs.map(sleep => ({
        id: sleep.id,
        userId: sleep.userId,
        date: sleep.date,
        hoursSlept: sleep.hoursSlept,
        quality: sleep.quality.value,
        bedTime: sleep.bedTime,
        wakeTime: sleep.wakeTime,
        energyRestored: sleep.energyRestored,
        notes: sleep.notes,
        isOptimal: sleep.isOptimal(),
        category: sleep.getCategory(),
        durationFormatted: sleep.getDurationFormatted(),
        createdAt: sleep.createdAt,
        updatedAt: sleep.updatedAt,
      })),
      count: sleepLogs.length,
    })
  } catch (error: any) {
    logger.error('Error getting sleep history:', error)
    res.status(500).json({ error: error.message || 'Failed to get sleep history' })
  }
})

/**
 * GET /api/sleep/recent
 * Get most recent sleep log
 */
router.get('/recent', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!
    const sleep = await getMostRecentSleepUseCase.execute(userId)

    if (!sleep) {
      return res.json({ sleep: null })
    }

    res.json({
      sleep: {
        id: sleep.id,
        userId: sleep.userId,
        date: sleep.date,
        hoursSlept: sleep.hoursSlept,
        quality: sleep.quality.value,
        bedTime: sleep.bedTime,
        wakeTime: sleep.wakeTime,
        energyRestored: sleep.energyRestored,
        notes: sleep.notes,
        isOptimal: sleep.isOptimal(),
        category: sleep.getCategory(),
        durationFormatted: sleep.getDurationFormatted(),
        createdAt: sleep.createdAt,
        updatedAt: sleep.updatedAt,
      },
    })
  } catch (error: any) {
    logger.error('Error getting recent sleep:', error)
    res.status(500).json({ error: error.message || 'Failed to get recent sleep' })
  }
})

/**
 * POST /api/sleep/calculate-restoration
 * Calculate energy restoration for a specific date
 */
router.post('/calculate-restoration', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!
    const { date } = req.body

    if (!date) {
      return res.status(400).json({ error: 'date is required' })
    }

    const sleepDate = new Date(date)
    const result = await calculateEnergyRestorationUseCase.execute(userId, sleepDate)

    res.json({
      sleep: result.sleep
        ? {
            id: result.sleep.id,
            date: result.sleep.date,
            hoursSlept: result.sleep.hoursSlept,
            quality: result.sleep.quality.value,
            energyRestored: result.sleep.energyRestored,
          }
        : null,
      restorationAmount: result.restorationAmount,
      newBaseEnergy: result.newBaseEnergy,
    })
  } catch (error: any) {
    logger.error('Error calculating energy restoration:', error)
    res.status(500).json({ error: error.message || 'Failed to calculate energy restoration' })
  }
})

export default router

