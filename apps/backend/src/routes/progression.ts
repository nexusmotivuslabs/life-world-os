import { Router } from 'express'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { prisma } from '../lib/prisma'
import { getXPForNextRank, getRankProgress } from '../services/rankService'
import { calculateBalance } from '../services/balanceService'
import { calculateCategoryLevel } from '../services/rankService'
import { checkMilestones } from '../services/milestoneService'

const router = Router()

// Get overall rank, level, and progress to next rank
router.get('/overall', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        overallXP: true,
        overallRank: true,
        overallLevel: true,
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const xpForNext = getXPForNextRank(user.overallRank, user.overallXP)
    const progress = getRankProgress(user.overallRank, user.overallXP)

    res.json({
      overallXP: user.overallXP,
      overallRank: user.overallRank,
      overallLevel: user.overallLevel,
      xpForNextRank: xpForNext,
      progressToNextRank: progress,
    })
  } catch (error) {
    console.error('Get overall progression error:', error)
    res.status(500).json({ error: 'Failed to get overall progression' })
  }
})

// Get all category levels and balance
router.get('/categories', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const xp = await prisma.xP.findUnique({
      where: { userId },
    })

    if (!xp) {
      return res.status(404).json({ error: 'XP data not found' })
    }

    const categoryLevels = {
      capacity: calculateCategoryLevel(xp.capacityXP),
      engines: calculateCategoryLevel(xp.enginesXP),
      oxygen: calculateCategoryLevel(xp.oxygenXP),
      meaning: calculateCategoryLevel(xp.meaningXP),
      optionality: calculateCategoryLevel(xp.optionalityXP),
    }

    const balance = calculateBalance({
      capacity: xp.capacityXP,
      engines: xp.enginesXP,
      oxygen: xp.oxygenXP,
      meaning: xp.meaningXP,
      optionality: xp.optionalityXP,
    })

    res.json({
      categoryLevels,
      balance,
    })
  } catch (error) {
    console.error('Get category progression error:', error)
    res.status(500).json({ error: 'Failed to get category progression' })
  }
})

// List achieved milestones
router.get('/milestones', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const milestones = await prisma.milestone.findMany({
      where: { userId },
      orderBy: { achievedDate: 'desc' },
    })

    res.json(milestones)
  } catch (error) {
    console.error('Get milestones error:', error)
    res.status(500).json({ error: 'Failed to get milestones' })
  }
})

// Check for new milestones
router.post('/check-milestones', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const result = await checkMilestones(userId)

    res.json(result)
  } catch (error) {
    console.error('Check milestones error:', error)
    res.status(500).json({ error: 'Failed to check milestones' })
  }
})

// Get balance indicator and warnings
router.get('/balance', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const xp = await prisma.xP.findUnique({
      where: { userId },
    })

    if (!xp) {
      return res.status(404).json({ error: 'XP data not found' })
    }

    const balance = calculateBalance({
      capacity: xp.capacityXP,
      engines: xp.enginesXP,
      oxygen: xp.oxygenXP,
      meaning: xp.meaningXP,
      optionality: xp.optionalityXP,
    })

    res.json(balance)
  } catch (error) {
    console.error('Get balance error:', error)
    res.status(500).json({ error: 'Failed to get balance' })
  }
})

export default router

