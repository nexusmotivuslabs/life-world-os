import { Router } from 'express'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { requireAdmin } from '../middleware/adminGuard'
import { prisma } from '../lib/prisma'
import { ActivityType } from '../types'
import { calculateXP } from '../services/xpCalculator'
import { calculateOverallRank, calculateOverallLevel, calculateCategoryLevel } from '../services/rankService'
import { checkMilestones } from '../services/milestoneService'
import { ensureDailyTick } from '../services/tickService'
import { getActionEnergyCost, getEffectiveEnergy } from '../services/energyService'
import {
  applyCapacityModifierToXP,
  applyCapacityModifierToReward,
} from '../services/capacityModifierService'
import { isInBurnout, getBurnoutXPModifier } from '../services/burnoutService'

const router = Router()

// Get overall XP, rank, level, and all category XP
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const xp = await prisma.xP.findUnique({
      where: { userId },
    })

    if (!xp) {
      return res.status(404).json({ error: 'XP data not found' })
    }

    res.json({
      overallXP: xp.overallXP,
      overallRank: xp.overallRank,
      overallLevel: xp.overallLevel,
      categoryXP: {
        capacity: xp.capacityXP,
        engines: xp.enginesXP,
        oxygen: xp.oxygenXP,
        meaning: xp.meaningXP,
        optionality: xp.optionalityXP,
      },
      categoryLevels: {
        capacity: calculateCategoryLevel(xp.capacityXP),
        engines: calculateCategoryLevel(xp.enginesXP),
        oxygen: calculateCategoryLevel(xp.oxygenXP),
        meaning: calculateCategoryLevel(xp.meaningXP),
        optionality: calculateCategoryLevel(xp.optionalityXP),
      },
      lastUpdated: xp.lastUpdated,
    })
  } catch (error) {
    console.error('Get XP error:', error)
    res.status(500).json({ error: 'Failed to get XP' })
  }
})

// Calculate XP for activity (preview)
router.post('/calculate', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const { activityType, customXP } = z
      .object({
        activityType: z.nativeEnum(ActivityType),
        customXP: z
          .object({
            overall: z.number().optional(),
            category: z
              .object({
                capacity: z.number().optional(),
                engines: z.number().optional(),
                oxygen: z.number().optional(),
                meaning: z.number().optional(),
                optionality: z.number().optional(),
              })
              .optional(),
          })
          .optional(),
      })
      .parse(req.body)

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { currentSeason: true },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const calculation = calculateXP(activityType, user.currentSeason, customXP)

    res.json(calculation)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }
    console.error('Calculate XP error:', error)
    res.status(500).json({ error: 'Failed to calculate XP' })
  }
})

// Record activity and calculate XP gains
router.post('/activity', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const { activityType, description, customXP, resourceChanges } = z
      .object({
        activityType: z.nativeEnum(ActivityType),
        description: z.string().optional(),
        customXP: z
          .object({
            overall: z.number().optional(),
            category: z
              .object({
                capacity: z.number().optional(),
                engines: z.number().optional(),
                oxygen: z.number().optional(),
                meaning: z.number().optional(),
                optionality: z.number().optional(),
              })
              .optional(),
          })
          .optional(),
        resourceChanges: z
          .object({
            oxygen: z.number().optional(),
            water: z.number().optional(),
            gold: z.number().optional(),
            armor: z.number().optional(),
            keys: z.number().optional(),
          })
          .optional(),
      })
      .parse(req.body)

    // Ensure daily tick is applied (resets energy if needed)
    await ensureDailyTick(userId)

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        resources: true,
        xp: true,
        cloud: true,
      },
    })

    if (!user || !user.resources || !user.xp || !user.cloud) {
      return res.status(404).json({ error: 'User or data not found' })
    }

    // Step 6: Check if user is in burnout
    const userIsInBurnout = await isInBurnout(userId)

    // Step 6: Block Work Project actions during burnout (Work actions are not recovery actions)
    if (userIsInBurnout && activityType === ActivityType.WORK_PROJECT) {
      return res.status(403).json({
        error: 'Cannot perform Work Project actions while in burnout',
        burnoutRecovery: 'Requires recovery actions (Exercise, Learning, Save Expenses) and Capacity > 25',
      })
    }

    // Check energy cost for this action
    let energyCost = getActionEnergyCost(activityType)
    
    // Apply loadout bonuses
    const loadoutBonuses = await getActiveLoadoutBonuses(userId)
    energyCost = applyLoadoutEnergyReduction(energyCost, loadoutBonuses.energyCostReduction)
    
    const currentEnergy = user.resources.energy ?? 100 // Default if null
    const capacity = user.cloud.capacityStrength
    const usableEnergy = getEffectiveEnergy(currentEnergy, capacity, userIsInBurnout)

    if (usableEnergy < energyCost) {
      return res.status(400).json({
        error: 'Insufficient energy',
        currentEnergy: usableEnergy,
        requiredEnergy: energyCost,
        capacity,
        isInBurnout: userIsInBurnout,
      })
    }

    // Capacity/Health System: Handle REST recovery actions
    const isRecoveryAction = activityType === ActivityType.REST
    
    // Calculate base XP (REST actions grant 0 XP)
    const baseCalculation = calculateXP(activityType, user.currentSeason, customXP)
    
    // Step 5: Apply Capacity modifiers to XP gain (only if not REST)
    let modifiedOverallXP = isRecoveryAction ? 0 : applyCapacityModifierToXP(baseCalculation.overallXP, capacity)
    let modifiedCategoryXP = isRecoveryAction ? {
      capacity: 0,
      engines: 0,
      oxygen: 0,
      meaning: 0,
      optionality: 0,
    } : {
      capacity: applyCapacityModifierToXP(baseCalculation.categoryXP.capacity, capacity),
      engines: applyCapacityModifierToXP(baseCalculation.categoryXP.engines, capacity),
      oxygen: applyCapacityModifierToXP(baseCalculation.categoryXP.oxygen, capacity),
      meaning: applyCapacityModifierToXP(baseCalculation.categoryXP.meaning, capacity),
      optionality: applyCapacityModifierToXP(baseCalculation.categoryXP.optionality, capacity),
    }

    // Apply loadout XP gain bonus
    if (!isRecoveryAction && loadoutBonuses.xpGain) {
      modifiedOverallXP = applyLoadoutXPModifier(modifiedOverallXP, loadoutBonuses.xpGain)
      modifiedCategoryXP = {
        capacity: applyLoadoutXPModifier(modifiedCategoryXP.capacity, loadoutBonuses.xpGain),
        engines: applyLoadoutXPModifier(modifiedCategoryXP.engines, loadoutBonuses.xpGain),
        oxygen: applyLoadoutXPModifier(modifiedCategoryXP.oxygen, loadoutBonuses.xpGain),
        meaning: applyLoadoutXPModifier(modifiedCategoryXP.meaning, loadoutBonuses.xpGain),
        optionality: applyLoadoutXPModifier(modifiedCategoryXP.optionality, loadoutBonuses.xpGain),
      }
    }

    // Step 6: Apply burnout XP penalty (-50%) - not applicable to REST actions
    if (userIsInBurnout && !isRecoveryAction) {
      const burnoutModifier = await getBurnoutXPModifier(userId)
      modifiedOverallXP = Math.round(modifiedOverallXP * burnoutModifier)
      modifiedCategoryXP = {
        capacity: Math.round(modifiedCategoryXP.capacity * burnoutModifier),
        engines: Math.round(modifiedCategoryXP.engines * burnoutModifier),
        oxygen: Math.round(modifiedCategoryXP.oxygen * burnoutModifier),
        meaning: Math.round(modifiedCategoryXP.meaning * burnoutModifier),
        optionality: Math.round(modifiedCategoryXP.optionality * burnoutModifier),
      }
    }

    // Update XP with Capacity-modified values (skip for REST actions)
    const newOverallXP = isRecoveryAction ? user.xp.overallXP : user.xp.overallXP + modifiedOverallXP
    const newRank = isRecoveryAction ? user.overallRank : calculateOverallRank(newOverallXP)
    const newLevel = isRecoveryAction ? user.overallLevel : calculateOverallLevel(newOverallXP)

    if (!isRecoveryAction) {
      await prisma.xP.update({
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
      await prisma.user.update({
        where: { id: userId },
        data: {
          overallXP: newOverallXP,
          overallRank: newRank,
          overallLevel: newLevel,
        },
      })
    } else {
      // REST action: Update recovery tracking timestamp
      await prisma.user.update({
        where: { id: userId },
        data: {
          lastRecoveryActionAt: new Date(),
        },
      })
    }

    // Deduct energy for this action
    const newEnergy = Math.max(0, currentEnergy - energyCost)

    // Step 5: Apply Capacity modifiers to rewards (resource changes)
    const modifiedResourceChanges = resourceChanges
      ? {
          oxygen: resourceChanges.oxygen !== undefined
            ? applyCapacityModifierToReward(resourceChanges.oxygen, capacity)
            : undefined,
          water: resourceChanges.water !== undefined
            ? applyCapacityModifierToReward(resourceChanges.water, capacity)
            : undefined,
          gold: resourceChanges.gold !== undefined
            ? applyCapacityModifierToReward(resourceChanges.gold, capacity)
            : undefined,
          armor: resourceChanges.armor !== undefined
            ? Math.round(applyCapacityModifierToReward(resourceChanges.armor, capacity))
            : undefined,
          keys: resourceChanges.keys !== undefined
            ? Math.round(applyCapacityModifierToReward(resourceChanges.keys, capacity))
            : undefined,
        }
      : undefined

    // Update resources (including energy deduction and Capacity-modified rewards)
    await prisma.resources.update({
      where: { userId },
      data: {
        energy: newEnergy,
        oxygen: modifiedResourceChanges?.oxygen !== undefined
          ? new Prisma.Decimal(user.resources.oxygen.toNumber() + modifiedResourceChanges.oxygen)
          : undefined,
        water: modifiedResourceChanges?.water !== undefined
          ? modifiedResourceChanges.water
          : undefined,
        gold: modifiedResourceChanges?.gold !== undefined
          ? new Prisma.Decimal(user.resources.gold.toNumber() + modifiedResourceChanges.gold)
          : undefined,
        armor: modifiedResourceChanges?.armor !== undefined
          ? modifiedResourceChanges.armor
          : undefined,
        keys: modifiedResourceChanges?.keys !== undefined
          ? user.resources.keys + modifiedResourceChanges.keys
          : undefined,
      },
    })

    // Log activity (with Capacity-modified values)
    await prisma.activityLog.create({
      data: {
        userId,
        activityType,
        overallXPGained: modifiedOverallXP,
        categoryXPGain: modifiedCategoryXP,
        resourceChanges: modifiedResourceChanges || null,
        seasonContext: user.currentSeason,
        seasonMultiplier: baseCalculation.seasonMultiplier,
        description: description || null,
      },
    })

    // Check for milestones
    const milestones = await checkMilestones(userId)

    // Get updated resources to return current energy
    const updatedResources = await prisma.resources.findUnique({
      where: { userId },
    })

    // Return Capacity-modified XP gains in response
    res.json({
      xpGained: {
        overallXP: modifiedOverallXP,
        categoryXP: modifiedCategoryXP,
        seasonMultiplier: baseCalculation.seasonMultiplier,
      },
      newOverallXP,
      newRank,
      newLevel,
      milestones,
      energyUsed: energyCost,
      remainingEnergy: updatedResources?.energy ?? 0,
      usableEnergy: updatedResources ? getEffectiveEnergy(updatedResources.energy, capacity, userIsInBurnout) : 0,
      capacityModifier: {
        capacity,
        xpEfficiency: baseCalculation.overallXP > 0 ? modifiedOverallXP / baseCalculation.overallXP : 1, // Show the modifier applied (avoid division by zero for REST)
      },
      isInBurnout: userIsInBurnout,
      isRecoveryAction: isRecoveryAction, // Indicate if this was a recovery action
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }
    console.error('Record activity error:', error)
    res.status(500).json({ error: 'Failed to record activity' })
  }
})

// Get XP earning history
router.get('/history', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const limit = parseInt(req.query.limit as string) || 50

    const logs = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    })

    res.json(logs)
  } catch (error) {
    console.error('Get XP history error:', error)
    res.status(500).json({ error: 'Failed to get XP history' })
  }
})

// Get category levels and balance indicator
router.get('/categories', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const xp = await prisma.xP.findUnique({
      where: { userId },
    })

    if (!xp) {
      return res.status(404).json({ error: 'XP data not found' })
    }

    const { calculateBalance } = await import('../services/balanceService')
    const balance = calculateBalance({
      capacity: xp.capacityXP,
      engines: xp.enginesXP,
      oxygen: xp.oxygenXP,
      meaning: xp.meaningXP,
      optionality: xp.optionalityXP,
    })

    res.json(balance)
  } catch (error) {
    console.error('Get categories error:', error)
    res.status(500).json({ error: 'Failed to get categories' })
  }
})

// Admin: Direct XP update (set absolute values)
router.put('/admin', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const { overallXP, categoryXP } = z
      .object({
        overallXP: z.number().min(0).optional(),
        categoryXP: z
          .object({
            capacity: z.number().min(0).optional(),
            engines: z.number().min(0).optional(),
            oxygen: z.number().min(0).optional(),
            meaning: z.number().min(0).optional(),
            optionality: z.number().min(0).optional(),
          })
          .optional(),
      })
      .parse(req.body)

    const currentXP = await prisma.xP.findUnique({
      where: { userId },
    })

    if (!currentXP) {
      return res.status(404).json({ error: 'XP data not found' })
    }

    const newOverallXP = overallXP !== undefined ? overallXP : currentXP.overallXP
    const newRank = calculateOverallRank(newOverallXP)
    const newLevel = calculateOverallLevel(newOverallXP)

    const updated = await prisma.xP.update({
      where: { userId },
      data: {
        overallXP: newOverallXP,
        overallRank: newRank,
        overallLevel: newLevel,
        capacityXP: categoryXP?.capacity !== undefined ? categoryXP.capacity : currentXP.capacityXP,
        enginesXP: categoryXP?.engines !== undefined ? categoryXP.engines : currentXP.enginesXP,
        oxygenXP: categoryXP?.oxygen !== undefined ? categoryXP.oxygen : currentXP.oxygenXP,
        meaningXP: categoryXP?.meaning !== undefined ? categoryXP.meaning : currentXP.meaningXP,
        optionalityXP: categoryXP?.optionality !== undefined ? categoryXP.optionality : currentXP.optionalityXP,
      },
    })

    // Update user's overall rank/level
    await prisma.user.update({
      where: { id: userId },
      data: {
        overallXP: newOverallXP,
        overallRank: newRank,
        overallLevel: newLevel,
      },
    })

    res.json({
      overallXP: updated.overallXP,
      overallRank: updated.overallRank,
      overallLevel: updated.overallLevel,
      categoryXP: {
        capacity: updated.capacityXP,
        engines: updated.enginesXP,
        oxygen: updated.oxygenXP,
        meaning: updated.meaningXP,
        optionality: updated.optionalityXP,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }
    console.error('Admin XP update error:', error)
    res.status(500).json({ error: 'Failed to update XP' })
  }
})

export default router

