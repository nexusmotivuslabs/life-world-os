import { Router } from 'express'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { requireAdmin } from '../middleware/adminGuard'
import { prisma } from '../lib/prisma'
import { ensureDailyTick } from '../services/tickService'
import { getEffectiveEnergy } from '../services/energyService'
import { isInBurnout } from '../services/burnoutService'

const router = Router()

const transactionSchema = z.object({
  oxygen: z.number().optional(),
  water: z.number().min(0).max(100).optional(),
  gold: z.number().optional(),
  armor: z.number().min(0).max(100).optional(),
  keys: z.number().optional(),
})

// Get all resources
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    
    // Ensure daily tick is applied (resets energy if needed)
    await ensureDailyTick(userId)
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        resources: true,
        cloud: true,
      },
    })

    if (!user || !user.resources || !user.cloud) {
      return res.status(404).json({ error: 'Resources not found' })
    }

    // Step 6: Check burnout status for energy cap
    const userIsInBurnout = await isInBurnout(userId)

    // Calculate usable energy based on Capacity and Burnout
    const currentEnergy = user.resources.energy ?? 100
    const usableEnergy = getEffectiveEnergy(currentEnergy, user.cloud.capacityStrength, userIsInBurnout)

    res.json({
      oxygen: Number(user.resources.oxygen),
      water: user.resources.water,
      gold: Number(user.resources.gold),
      armor: user.resources.armor,
      keys: user.resources.keys,
      energy: currentEnergy,
      usableEnergy: usableEnergy,
      energyCap: usableEnergy, // The effective cap based on Capacity and Burnout
      lastUpdated: user.resources.lastUpdated,
      isInBurnout: userIsInBurnout,
    })
  } catch (error) {
    console.error('Get resources error:', error)
    res.status(500).json({ error: 'Failed to get resources' })
  }
})

// Record resource transaction
router.post('/transaction', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const changes = transactionSchema.parse(req.body)

    const current = await prisma.resources.findUnique({
      where: { userId },
    })

    if (!current) {
      return res.status(404).json({ error: 'Resources not found' })
    }

    const updated = await prisma.resources.update({
      where: { userId },
      data: {
        oxygen: changes.oxygen !== undefined ? new Prisma.Decimal(current.oxygen.toNumber() + changes.oxygen) : undefined,
        water: changes.water !== undefined ? changes.water : undefined,
        gold: changes.gold !== undefined ? new Prisma.Decimal(current.gold.toNumber() + changes.gold) : undefined,
        armor: changes.armor !== undefined ? changes.armor : undefined,
        keys: changes.keys !== undefined ? current.keys + changes.keys : undefined,
      },
    })

    res.json({
      oxygen: Number(updated.oxygen),
      water: updated.water,
      gold: Number(updated.gold),
      armor: updated.armor,
      keys: updated.keys,
      lastUpdated: updated.lastUpdated,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }
    console.error('Resource transaction error:', error)
    res.status(500).json({ error: 'Failed to update resources' })
  }
})

// Get resource history
router.get('/history', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const limit = parseInt(req.query.limit as string) || 50

    const logs = await prisma.activityLog.findMany({
      where: {
        userId,
        resourceChanges: { not: null },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      select: {
        id: true,
        activityType: true,
        resourceChanges: true,
        timestamp: true,
        description: true,
      },
    })

    res.json(logs)
  } catch (error) {
    console.error('Get resource history error:', error)
    res.status(500).json({ error: 'Failed to get resource history' })
  }
})

// Admin: Set absolute resource values
router.put('/admin', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const { oxygen, water, gold, armor, keys } = z
      .object({
        oxygen: z.number().optional(),
        water: z.number().min(0).max(100).optional(),
        gold: z.number().optional(),
        armor: z.number().min(0).max(100).optional(),
        keys: z.number().min(0).optional(),
      })
      .parse(req.body)

    const current = await prisma.resources.findUnique({
      where: { userId },
    })

    if (!current) {
      return res.status(404).json({ error: 'Resources not found' })
    }

    const updated = await prisma.resources.update({
      where: { userId },
      data: {
        oxygen: oxygen !== undefined ? new Prisma.Decimal(oxygen) : undefined,
        water: water !== undefined ? water : undefined,
        gold: gold !== undefined ? new Prisma.Decimal(gold) : undefined,
        armor: armor !== undefined ? armor : undefined,
        keys: keys !== undefined ? keys : undefined,
      },
    })

    res.json({
      oxygen: Number(updated.oxygen),
      water: updated.water,
      gold: Number(updated.gold),
      armor: updated.armor,
      keys: updated.keys,
      lastUpdated: updated.lastUpdated,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }
    console.error('Admin resource update error:', error)
    res.status(500).json({ error: 'Failed to update resources' })
  }
})

export default router

