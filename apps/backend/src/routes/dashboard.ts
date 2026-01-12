import { Router } from 'express'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { prisma } from '../lib/prisma'
import { calculateCategoryLevel } from '../services/rankService'
import { calculateBalance } from '../services/balanceService'
import { getXPForNextRank, getRankProgress } from '../services/rankService'
import { ensureDailyTick } from '../services/tickService'
import { getEffectiveEnergy } from '../services/energyService'
import { isInBurnout } from '../services/burnoutService'

const router = Router()

// Get complete dashboard data
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    
    // Ensure daily tick is applied (resets energy if needed)
    await ensureDailyTick(userId)
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        cloud: true,
        resources: true,
        xp: true,
        engines: {
          where: { status: 'ACTIVE' },
        },
      },
    })

    if (!user || !user.cloud || !user.resources || !user.xp) {
      return res.status(404).json({ error: 'User data not found' })
    }

    // Step 6: Check burnout status for energy cap
    const userIsInBurnout = await isInBurnout(userId)

    // Calculate usable energy based on Capacity and Burnout
    const currentEnergy = user.resources.energy ?? 100
    const usableEnergy = getEffectiveEnergy(currentEnergy, user.cloud.capacityStrength, userIsInBurnout)

    const daysInSeason = Math.floor(
      (Date.now() - user.seasonStartDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    const categoryLevels = {
      capacity: calculateCategoryLevel(user.xp.capacityXP),
      engines: calculateCategoryLevel(user.xp.enginesXP),
      oxygen: calculateCategoryLevel(user.xp.oxygenXP),
      meaning: calculateCategoryLevel(user.xp.meaningXP),
      optionality: calculateCategoryLevel(user.xp.optionalityXP),
    }

    const balance = calculateBalance({
      capacity: user.xp.capacityXP,
      engines: user.xp.enginesXP,
      oxygen: user.xp.oxygenXP,
      meaning: user.xp.meaningXP,
      optionality: user.xp.optionalityXP,
    })

    const xpForNext = getXPForNextRank(user.overallRank, user.overallXP)
    const progress = getRankProgress(user.overallRank, user.overallXP)

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        overallXP: user.overallXP,
        overallRank: user.overallRank,
        overallLevel: user.overallLevel,
        xpForNextRank: xpForNext,
        progressToNextRank: progress,
        isAdmin: user.isAdmin, // Admin status - only configurable in database
      },
      season: {
        season: user.currentSeason,
        startDate: user.seasonStartDate,
        daysInSeason,
      },
      clouds: {
        capacity: user.cloud.capacityStrength,
        engines: user.cloud.enginesStrength,
        oxygen: user.cloud.oxygenStrength,
        meaning: user.cloud.meaningStrength,
        optionality: user.cloud.optionalityStrength,
      },
      resources: {
        oxygen: Number(user.resources.oxygen),
        water: user.resources.water,
        gold: Number(user.resources.gold),
        armor: user.resources.armor,
        keys: user.resources.keys,
        energy: currentEnergy,
        usableEnergy: usableEnergy,
        energyCap: usableEnergy, // The effective cap based on Capacity and Burnout
      },
      isInBurnout: userIsInBurnout,
      xp: {
        overall: user.xp.overallXP,
        category: {
          capacity: user.xp.capacityXP,
          engines: user.xp.enginesXP,
          oxygen: user.xp.oxygenXP,
          meaning: user.xp.meaningXP,
          optionality: user.xp.optionalityXP,
        },
        categoryLevels,
      },
      balance,
      engines: user.engines.map((e) => ({
        id: e.id,
        type: e.type,
        name: e.name,
        description: e.description,
        fragilityScore: e.fragilityScore,
        currentOutput: Number(e.currentOutput),
        status: e.status,
      })),
    })
  } catch (error) {
    console.error('Get dashboard error:', error)
    res.status(500).json({ error: 'Failed to get dashboard data' })
  }
})

export default router

