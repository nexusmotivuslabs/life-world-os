import { Router } from 'express'
import { z } from 'zod'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { prisma } from '../lib/prisma'
import { Season } from '../types'
import { validateSeasonTransition } from '../services/seasonValidator'

const router = Router()

// Get current season
router.get('/current', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentSeason: true,
        seasonStartDate: true,
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const daysInSeason = Math.floor(
      (Date.now() - user.seasonStartDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    res.json({
      season: user.currentSeason,
      startDate: user.seasonStartDate,
      daysInSeason,
    })
  } catch (error) {
    console.error('Get current season error:', error)
    res.status(500).json({ error: 'Failed to get current season' })
  }
})

// Request season transition
router.post('/transition', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const { season, reason } = z
      .object({
        season: z.nativeEnum(Season),
        reason: z.string().optional(),
      })
      .parse(req.body)

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        resources: true,
      },
    })

    if (!user || !user.resources) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Validate transition
    const validation = await validateSeasonTransition(
      userId,
      season,
      user.currentSeason,
      user.seasonStartDate,
      user.resources.water
    )

    if (!validation.allowed) {
      return res.status(400).json({ error: validation.reason })
    }

    // Record current season in history
    await prisma.seasonHistory.create({
      data: {
        userId,
        season: user.currentSeason,
        startDate: user.seasonStartDate,
        endDate: new Date(),
        reason: reason || 'User requested transition',
        resourcesAtStart: {
          oxygen: Number(user.resources.oxygen),
          water: user.resources.water,
          gold: Number(user.resources.gold),
          armor: user.resources.armor,
          keys: user.resources.keys,
        },
      },
    })

    // Update user season
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        currentSeason: season,
        seasonStartDate: new Date(),
      },
    })

    res.json({
      season: updated.currentSeason,
      startDate: updated.seasonStartDate,
      daysInSeason: 0,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }
    console.error('Season transition error:', error)
    res.status(500).json({ error: 'Failed to transition season' })
  }
})

// Get season history
router.get('/history', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const limit = parseInt(req.query.limit as string) || 20

    const history = await prisma.seasonHistory.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
      take: limit,
    })

    res.json(history)
  } catch (error) {
    console.error('Get season history error:', error)
    res.status(500).json({ error: 'Failed to get season history' })
  }
})

export default router


