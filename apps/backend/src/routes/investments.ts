import { Router } from 'express'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { prisma } from '../lib/prisma'
import { InvestmentType, ActivityType } from '../types'
import {
  calculateInvestmentXP,
  getDefaultYield,
  calculateMonthlyGrowth,
} from '../services/investmentService'
import { calculateOverallRank, calculateOverallLevel } from '../services/rankService'
import { checkMilestones } from '../services/milestoneService'
import { ensureDailyTick } from '../services/tickService'
import { getActionEnergyCost, getEffectiveEnergy } from '../services/energyService'
import {
import { logger } from '../lib/logger.js'
  applyCapacityModifierToXP,
} from '../services/capacityModifierService'

const router = Router()

const createInvestmentSchema = z.object({
  type: z.nativeEnum(InvestmentType),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  amount: z.number().min(0),
  expectedYield: z.number().min(0).max(100).optional(),
})

const updateInvestmentSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  amount: z.number().min(0).optional(),
  expectedYield: z.number().min(0).max(100).optional(),
  currentValue: z.number().min(0).optional(),
})

// Get all investments for user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!

    const investments = await prisma.investment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate totals by type
    const totalsByType = investments.reduce(
      (acc, inv) => {
        acc[inv.type] = (acc[inv.type] || 0) + Number(inv.amount)
        return acc
      },
      {} as Record<InvestmentType, number>
    )

    const totalInvested = investments.reduce(
      (sum, inv) => sum + Number(inv.amount),
      0
    )

    const totalValue = investments.reduce(
      (sum, inv) => sum + Number(inv.currentValue || inv.amount),
      0
    )

    const totalReturn = investments.reduce(
      (sum, inv) => sum + Number(inv.totalReturn),
      0
    )

    res.json({
      investments,
      totalsByType,
      totalInvested,
      totalValue,
      totalReturn,
    })
  } catch (error) {
    logger.error('Get investments error:', error)
    res.status(500).json({ error: 'Failed to get investments' })
  }
})

// Create new investment
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const data = createInvestmentSchema.parse(req.body)

    // Ensure daily tick is applied (resets energy if needed)
    await ensureDailyTick(userId)

    // Get user resources
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        resources: true,
        xp: true,
        cloud: true,
      },
    })

    if (!user || !user.resources || !user.xp || !user.cloud) {
      return res.status(404).json({ error: 'User data not found' })
    }

    // Check energy cost for investment (CUSTOM action = 20 energy)
    const energyCost = getActionEnergyCost(ActivityType.CUSTOM)
    const currentEnergy = user.resources.energy ?? 100
    const capacity = user.cloud.capacityStrength
    const usableEnergy = getEffectiveEnergy(currentEnergy, capacity)

    if (usableEnergy < energyCost) {
      return res.status(400).json({
        error: 'Insufficient energy',
        currentEnergy: usableEnergy,
        requiredEnergy: energyCost,
        capacity,
      })
    }

    // Check if user has enough gold
    const availableGold = Number(user.resources.gold)
    if (availableGold < data.amount) {
      return res.status(400).json({
        error: 'Insufficient gold',
        available: availableGold,
        required: data.amount,
      })
    }

    // Use default yield if not provided
    const expectedYield = data.expectedYield ?? getDefaultYield(data.type)

    // Calculate base XP reward
    const baseXpReward = calculateInvestmentXP(data.type, data.amount)

    // Step 5: Apply Capacity modifiers to XP gain
    // Note: capacity is already declared above (line 111)
    const modifiedOverallXP = applyCapacityModifierToXP(baseXpReward.overall, capacity)
    const modifiedCategoryXP = {
      capacity: applyCapacityModifierToXP(baseXpReward.category.capacity, capacity),
      engines: applyCapacityModifierToXP(baseXpReward.category.engines, capacity),
      oxygen: applyCapacityModifierToXP(baseXpReward.category.oxygen, capacity),
      meaning: applyCapacityModifierToXP(baseXpReward.category.meaning, capacity),
      optionality: applyCapacityModifierToXP(baseXpReward.category.optionality, capacity),
    }

    // Update XP with Capacity-modified values
    const newOverallXP = user.xp.overallXP + modifiedOverallXP
    const newRank = calculateOverallRank(newOverallXP)
    const newLevel = calculateOverallLevel(newOverallXP)

    await prisma.$transaction(async (tx) => {
      // Create investment
      const investment = await tx.investment.create({
        data: {
          userId,
          type: data.type,
          name: data.name,
          description: data.description || null,
          amount: new Prisma.Decimal(data.amount),
          initialAmount: new Prisma.Decimal(data.amount),
          expectedYield: new Prisma.Decimal(expectedYield),
          currentValue: new Prisma.Decimal(data.amount), // Start at invested amount
          totalReturn: new Prisma.Decimal(0),
        },
      })

      // Deduct energy and gold from resources
      const newEnergy = Math.max(0, currentEnergy - energyCost)
      await tx.resources.update({
        where: { userId },
        data: {
          energy: newEnergy,
          gold: new Prisma.Decimal(availableGold - data.amount),
        },
      })

      // Update XP with Capacity-modified values
      await tx.xP.update({
        where: { userId },
        data: {
          overallXP: newOverallXP,
          overallRank: newRank,
          overallLevel: newLevel,
          capacityXP: user.xp.capacityXP + modifiedCategoryXP.capacity,
          enginesXP: user.xp.enginesXP + modifiedCategoryXP.engines,
          oxygenXP: user.xp.oxygenXP + modifiedCategoryXP.oxygen,
          meaningXP: user.xp.meaningXP + modifiedCategoryXP.meaning,
          optionalityXP: user.xp.optionalityXP + modifiedCategoryXP.optionality,
        },
      })

      // Update user's overall rank/level
      await tx.user.update({
        where: { id: userId },
        data: {
          overallXP: newOverallXP,
          overallRank: newRank,
          overallLevel: newLevel,
        },
      })

      // Log activity (with Capacity-modified values)
      await tx.activityLog.create({
        data: {
          userId,
          activityType: ActivityType.CUSTOM,
          overallXPGained: modifiedOverallXP,
          categoryXPGain: modifiedCategoryXP,
          resourceChanges: {
            gold: -data.amount,
          },
          seasonContext: user.currentSeason,
          seasonMultiplier: 1.0,
          description: `Invested ${data.amount} in ${data.type}: ${data.name}`,
        },
      })
    })

    // Check for milestones
    const milestones = await checkMilestones(userId)

    // Get updated investments and resources
    const [investments, updatedResources] = await Promise.all([
      prisma.investment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.resources.findUnique({
        where: { userId },
      }),
    ])

    res.json({
      success: true,
      xpGained: xpReward,
      investments,
      milestones,
      energyUsed: energyCost,
      remainingEnergy: updatedResources?.energy ?? 0,
      usableEnergy: updatedResources ? getEffectiveEnergy(updatedResources.energy, capacity) : 0,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }
    logger.error('Create investment error:', error)
    res.status(500).json({ error: 'Failed to create investment' })
  }
})

// Update investment (add more, update value, etc.)
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const { id } = req.params
    const data = updateInvestmentSchema.parse(req.body)

    const investment = await prisma.investment.findUnique({
      where: { id },
    })

    if (!investment || investment.userId !== userId) {
      return res.status(404).json({ error: 'Investment not found' })
    }

    // If adding more money, check available gold
    if (data.amount !== undefined && data.amount > Number(investment.amount)) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { resources: true, cloud: true },
      })

      if (!user || !user.resources || !user.cloud) {
        return res.status(404).json({ error: 'User resources or cloud not found' })
      }

      const additionalAmount = data.amount - Number(investment.amount)
      const availableGold = Number(user.resources.gold)

      if (availableGold < additionalAmount) {
        return res.status(400).json({
          error: 'Insufficient gold',
          available: availableGold,
          required: additionalAmount,
        })
      }

      // Calculate base XP for additional investment
      const baseXpReward = calculateInvestmentXP(investment.type, additionalAmount)

      // Step 5: Apply Capacity modifiers to XP gain
      const capacity = user.cloud.capacityStrength
      const modifiedOverallXP = applyCapacityModifierToXP(baseXpReward.overall, capacity)
      const modifiedCategoryXP = {
        capacity: applyCapacityModifierToXP(baseXpReward.category.capacity, capacity),
        engines: applyCapacityModifierToXP(baseXpReward.category.engines, capacity),
        oxygen: applyCapacityModifierToXP(baseXpReward.category.oxygen, capacity),
        meaning: applyCapacityModifierToXP(baseXpReward.category.meaning, capacity),
        optionality: applyCapacityModifierToXP(baseXpReward.category.optionality, capacity),
      }

      // Update in transaction
      await prisma.$transaction(async (tx) => {
        // Update investment
        await tx.investment.update({
          where: { id },
          data: {
            name: data.name,
            description: data.description,
            amount: new Prisma.Decimal(data.amount),
            expectedYield: data.expectedYield
              ? new Prisma.Decimal(data.expectedYield)
              : undefined,
            currentValue: data.currentValue
              ? new Prisma.Decimal(data.currentValue)
              : undefined,
          },
        })

        // Deduct gold
        await tx.resources.update({
          where: { userId },
          data: {
            gold: new Prisma.Decimal(availableGold - additionalAmount),
          },
        })

        // Update XP if additional investment (with Capacity-modified values)
        if (modifiedOverallXP > 0) {
          const userXP = await tx.xP.findUnique({ where: { userId } })
          if (userXP) {
            const newOverallXP = userXP.overallXP + modifiedOverallXP
            const newRank = calculateOverallRank(newOverallXP)
            const newLevel = calculateOverallLevel(newOverallXP)

            await tx.xP.update({
              where: { userId },
              data: {
                overallXP: newOverallXP,
                overallRank: newRank,
                overallLevel: newLevel,
                capacityXP: userXP.capacityXP + modifiedCategoryXP.capacity,
                enginesXP: userXP.enginesXP + modifiedCategoryXP.engines,
                oxygenXP: userXP.oxygenXP + modifiedCategoryXP.oxygen,
                meaningXP: userXP.meaningXP + modifiedCategoryXP.meaning,
                optionalityXP: userXP.optionalityXP + modifiedCategoryXP.optionality,
              },
            })

            await tx.user.update({
              where: { id: userId },
              data: {
                overallXP: newOverallXP,
                overallRank: newRank,
                overallLevel: newLevel,
              },
            })
          }
        }
      })
    } else {
      // Just update metadata
      await prisma.investment.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          expectedYield: data.expectedYield
            ? new Prisma.Decimal(data.expectedYield)
            : undefined,
          currentValue: data.currentValue
            ? new Prisma.Decimal(data.currentValue)
            : undefined,
        },
      })
    }

    const updated = await prisma.investment.findUnique({
      where: { id },
    })

    res.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }
    logger.error('Update investment error:', error)
    res.status(500).json({ error: 'Failed to update investment' })
  }
})

// Process monthly growth for all investments
router.post('/process-growth', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!

    const investments = await prisma.investment.findMany({
      where: { userId },
    })

    let totalGrowth = 0

    await prisma.$transaction(async (tx) => {
      for (const investment of investments) {
        if (Number(investment.expectedYield) > 0) {
          const monthlyGrowth = calculateMonthlyGrowth(
            Number(investment.currentValue || investment.amount),
            Number(investment.expectedYield)
          )

          const newValue = Number(investment.currentValue || investment.amount) + monthlyGrowth
          const totalReturn = newValue - Number(investment.initialAmount)

          await tx.investment.update({
            where: { id: investment.id },
            data: {
              currentValue: new Prisma.Decimal(newValue),
              totalReturn: new Prisma.Decimal(totalReturn),
            },
          })

          totalGrowth += monthlyGrowth
        }
      }

      // Add growth to gold (realized gains)
      if (totalGrowth > 0) {
        const user = await tx.user.findUnique({
          where: { id: userId },
          include: { resources: true },
        })

        if (user?.resources) {
          await tx.resources.update({
            where: { userId },
            data: {
              gold: new Prisma.Decimal(
                Number(user.resources.gold) + totalGrowth
              ),
            },
          })
        }
      }
    })

    res.json({
      success: true,
      totalGrowth,
      message: 'Monthly growth processed',
    })
  } catch (error) {
    logger.error('Process growth error:', error)
    res.status(500).json({ error: 'Failed to process growth' })
  }
})

// Delete investment (sell/withdraw)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const { id } = req.params

    const investment = await prisma.investment.findUnique({
      where: { id },
    })

    if (!investment || investment.userId !== userId) {
      return res.status(404).json({ error: 'Investment not found' })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { resources: true },
    })

    if (!user || !user.resources) {
      return res.status(404).json({ error: 'User resources not found' })
    }

    // Return current value to gold
    const currentValue = Number(investment.currentValue || investment.amount)
    const totalReturn = Number(investment.totalReturn)

    await prisma.$transaction(async (tx) => {
      // Delete investment
      await tx.investment.delete({
        where: { id },
      })

      // Add current value back to gold
      await tx.resources.update({
        where: { userId },
        data: {
          gold: new Prisma.Decimal(Number(user.resources.gold) + currentValue),
        },
      })
    })

    res.json({
      success: true,
      returnedGold: currentValue,
      totalReturn,
      message: 'Investment sold/withdrawn',
    })
  } catch (error) {
    logger.error('Delete investment error:', error)
    res.status(500).json({ error: 'Failed to delete investment' })
  }
})

export default router

