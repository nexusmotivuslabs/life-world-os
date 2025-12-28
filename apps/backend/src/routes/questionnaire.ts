import { Router } from 'express'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { prisma } from '../lib/prisma'
import { calculateInitialStats, QuestionnaireAnswers } from '../services/initialStatsService'
import { calculateOverallRank, calculateOverallLevel } from '../services/rankService'
import { Season } from '../types'
import { logger } from '../lib/logger.js'

const router = Router()

const questionnaireSchema = z.object({
  lifePhase: z.enum(['SPRING', 'SUMMER', 'AUTUMN', 'WINTER']),
  financialMonths: z.number().min(0).max(120),
  healthRating: z.enum(['weak', 'medium', 'strong', 'very_strong']),
  incomeSources: z.number().min(1).max(10),
  purposeClarity: z.enum(['weak', 'medium', 'strong', 'very_strong']),
  availableOptions: z.number().min(1).max(10),
  stressManagement: z.enum(['low', 'medium', 'high', 'very_high']),
  experienceLevel: z.enum(['beginner', 'some', 'experienced', 'very_experienced']),
})

// Submit questionnaire and update initial stats
router.post('/submit', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    
    // Validate and parse answers
    const answers = questionnaireSchema.parse(req.body) as QuestionnaireAnswers

    // Check if user already completed questionnaire
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { cloud: true, resources: true, xp: true },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (user.hasCompletedQuestionnaire) {
      return res.status(400).json({ error: 'Questionnaire already completed' })
    }

    // Calculate initial stats
    const initialStats = calculateInitialStats(answers)

    // Calculate rank and level from starting XP
    const overallRank = calculateOverallRank(initialStats.xp.overall)
    const overallLevel = calculateOverallLevel(initialStats.xp.overall)

    // Update user data in a transaction
    await prisma.$transaction(async (tx) => {
      // Update user
      await tx.user.update({
        where: { id: userId },
        data: {
          currentSeason: initialStats.season,
          seasonStartDate: new Date(),
          overallXP: initialStats.xp.overall,
          overallRank,
          overallLevel,
          hasCompletedQuestionnaire: true,
        },
      })

      // Update clouds
      await tx.cloud.update({
        where: { userId },
        data: {
          capacityStrength: initialStats.clouds.capacity,
          enginesStrength: initialStats.clouds.engines,
          oxygenStrength: initialStats.clouds.oxygen,
          meaningStrength: initialStats.clouds.meaning,
          optionalityStrength: initialStats.clouds.optionality,
        },
      })

      // Update resources
      // Note: Energy is initialized to 100, will be managed by daily tick
      await tx.resources.update({
        where: { userId },
        data: {
          oxygen: new Prisma.Decimal(initialStats.resources.oxygen),
          water: initialStats.resources.water,
          gold: new Prisma.Decimal(initialStats.resources.gold),
          armor: initialStats.resources.armor,
          keys: initialStats.resources.keys,
          energy: 100, // Base daily energy, will be reset by daily tick
        },
      })

      // Update XP
      await tx.xP.update({
        where: { userId },
        data: {
          overallXP: initialStats.xp.overall,
          overallRank,
          overallLevel,
          capacityXP: initialStats.xp.capacity,
          enginesXP: initialStats.xp.engines,
          oxygenXP: initialStats.xp.oxygen,
          meaningXP: initialStats.xp.meaning,
          optionalityXP: initialStats.xp.optionality,
        },
      })
    })

    res.json({
      success: true,
      message: 'Questionnaire completed and stats initialized',
      stats: initialStats,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid questionnaire data', details: error.errors })
    }
    logger.error('Questionnaire submission error:', error)
    res.status(500).json({ error: 'Failed to process questionnaire' })
  }
})

// Check if user has completed questionnaire
router.get('/status', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { hasCompletedQuestionnaire: true },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ hasCompletedQuestionnaire: user.hasCompletedQuestionnaire })
  } catch (error) {
    logger.error('Get questionnaire status error:', error)
    res.status(500).json({ error: 'Failed to get questionnaire status' })
  }
})

export default router

