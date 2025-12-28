import { Router } from 'express'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { prisma } from '../lib/prisma'
import { ensureDailyTick } from '../services/tickService'
import { getActionEnergyCost, getEffectiveEnergy } from '../services/energyService'
import { TaskStatus, ActivityType, TrainingModuleType } from '../types'
import { calculateTaskXP, isModuleUnlocked, calculateTaskStatus } from '../services/trainingService'
import { calculateXP } from '../services/xpCalculator'
import { calculateOverallRank, calculateOverallLevel } from '../services/rankService'
import { checkMilestones } from '../services/milestoneService'
import {
  applyCapacityModifierToXP,
  applyCapacityModifierToReward,
} from '../services/capacityModifierService'
import { isInBurnout, getBurnoutXPModifier } from '../services/burnoutService'
import { logger } from '../lib/logger.js'

const router = Router()

// Get all training modules with tasks and user progress
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        trainingProgress: {
          include: {
            task: {
              include: {
                module: true,
              },
            },
          },
        },
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get all modules with tasks
    const modules = await prisma.trainingModule.findMany({
      include: {
        tasks: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    })

    // Count completed tasks per module
    const completedTasksByModule = new Map<string, number>()
    user.trainingProgress.forEach((progress) => {
      if (progress.status === TaskStatus.COMPLETED) {
        const moduleId = progress.task.moduleId
        completedTasksByModule.set(
          moduleId,
          (completedTasksByModule.get(moduleId) || 0) + 1
        )
      }
    })

    // Build response with progress
    const modulesWithProgress = modules.map((module) => {
      const completedCount = completedTasksByModule.get(module.id) || 0
      const totalTasks = module.tasks.length
      const isUnlocked = isModuleUnlocked(
        module.requiredRank,
        module.requiredTasks,
        user.overallRank,
        user.trainingProgress.filter((p) => p.status === TaskStatus.COMPLETED).length
      )

      const tasksWithProgress = module.tasks.map((task) => {
        const progress = user.trainingProgress.find((p) => p.taskId === task.id)
        
        // Check if previous task is completed
        const taskIndex = module.tasks.findIndex((t) => t.id === task.id)
        const previousTask = taskIndex > 0 ? module.tasks[taskIndex - 1] : null
        const previousTaskCompleted = previousTask
          ? user.trainingProgress.find((p) => p.taskId === previousTask.id)?.status === TaskStatus.COMPLETED
          : true

        const status = progress
          ? progress.status
          : calculateTaskStatus(previousTaskCompleted, isUnlocked)

        return {
          ...task,
          status,
          progress: progress || null,
        }
      })

      return {
        ...module,
        isUnlocked,
        completedTasks: completedCount,
        totalTasks,
        progress: totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0,
        tasks: tasksWithProgress,
      }
    })

    res.json({ modules: modulesWithProgress })
  } catch (error) {
    logger.error('Get training modules error:', error)
    res.status(500).json({ error: 'Failed to get training modules' })
  }
})

// Complete a training task
router.post('/tasks/:taskId/complete', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const { taskId } = req.params
    const { notes } = z
      .object({
        notes: z.string().optional(),
      })
      .parse(req.body)

    // Get task with module
    const task = await prisma.trainingTask.findUnique({
      where: { id: taskId },
      include: {
        module: true,
      },
    })

    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }

    // Ensure daily tick is applied (resets energy if needed)
    await ensureDailyTick(userId)

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        resources: true,
        xp: true,
        cloud: true,
        trainingProgress: {
          where: { taskId },
        },
      },
    })

    if (!user || !user.resources || !user.xp || !user.cloud) {
      return res.status(404).json({ error: 'User data not found' })
    }

    // Step 6: Check burnout status
    const userIsInBurnout = await isInBurnout(userId)

    // Check energy cost for training task (Learning action = 20 energy)
    const energyCost = getActionEnergyCost(ActivityType.LEARNING)
    const currentEnergy = user.resources.energy ?? 100
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

    // Check if already completed
    const existingProgress = user.trainingProgress[0]
    if (existingProgress?.status === TaskStatus.COMPLETED) {
      return res.status(400).json({ error: 'Task already completed' })
    }

    // Check prerequisites
    const module = task.module
    const isUnlocked = isModuleUnlocked(
      module.requiredRank,
      module.requiredTasks,
      user.overallRank,
      user.trainingProgress.filter((p) => p.status === TaskStatus.COMPLETED).length
    )

    if (!isUnlocked) {
      return res.status(403).json({ error: 'Module not unlocked' })
    }

    // Check previous task
    const allTasks = await prisma.trainingTask.findMany({
      where: { moduleId: module.id },
      orderBy: { order: 'asc' },
    })
    const taskIndex = allTasks.findIndex((t) => t.id === taskId)
    if (taskIndex > 0) {
      const previousTask = allTasks[taskIndex - 1]
      const previousProgress = await prisma.trainingProgress.findUnique({
        where: {
          userId_taskId: {
            userId,
            taskId: previousTask.id,
          },
        },
      })
      if (!previousProgress || previousProgress.status !== TaskStatus.COMPLETED) {
        return res.status(403).json({ error: 'Previous task must be completed first' })
      }
    }

    // Calculate base XP reward
    const baseTaskXP = calculateTaskXP(task.module.type, task.order)
    
    // Parse category XP from task (stored as JSON)
    const taskCategoryXP = task.categoryXP as any
    const baseCategoryXP = {
      capacity: taskCategoryXP.capacity || baseTaskXP.category.capacity,
      engines: taskCategoryXP.engines || baseTaskXP.category.engines,
      oxygen: taskCategoryXP.oxygen || baseTaskXP.category.oxygen,
      meaning: taskCategoryXP.meaning || baseTaskXP.category.meaning,
      optionality: taskCategoryXP.optionality || baseTaskXP.category.optionality,
    }

    // Step 5: Apply Capacity modifiers to XP gain
    // Note: capacity is already declared above (line 165)
    let modifiedOverallXP = applyCapacityModifierToXP(baseTaskXP.overall, capacity)
    let modifiedCategoryXP = {
      capacity: applyCapacityModifierToXP(baseCategoryXP.capacity, capacity),
      engines: applyCapacityModifierToXP(baseCategoryXP.engines, capacity),
      oxygen: applyCapacityModifierToXP(baseCategoryXP.oxygen, capacity),
      meaning: applyCapacityModifierToXP(baseCategoryXP.meaning, capacity),
      optionality: applyCapacityModifierToXP(baseCategoryXP.optionality, capacity),
    }

    // Step 6: Apply burnout XP penalty (-50%)
    if (userIsInBurnout) {
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

    // Parse base resource rewards
    const baseResourceReward = task.resourceReward as any || {}
    
    // Step 5: Apply Capacity modifiers to resource rewards
    const modifiedResourceReward = {
      oxygen: baseResourceReward.oxygen !== undefined
        ? applyCapacityModifierToReward(baseResourceReward.oxygen, capacity)
        : undefined,
      water: baseResourceReward.water !== undefined
        ? applyCapacityModifierToReward(baseResourceReward.water, capacity)
        : undefined,
      gold: baseResourceReward.gold !== undefined
        ? applyCapacityModifierToReward(baseResourceReward.gold, capacity)
        : undefined,
      armor: baseResourceReward.armor !== undefined
        ? Math.round(applyCapacityModifierToReward(baseResourceReward.armor, capacity))
        : undefined,
      keys: baseResourceReward.keys !== undefined
        ? Math.round(applyCapacityModifierToReward(baseResourceReward.keys, capacity))
        : undefined,
    }

    // Update XP with Capacity-modified values
    const newOverallXP = user.xp.overallXP + modifiedOverallXP
    const newRank = calculateOverallRank(newOverallXP)
    const newLevel = calculateOverallLevel(newOverallXP)

    await prisma.$transaction(async (tx) => {
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

      // Deduct energy for this action
      const newEnergy = Math.max(0, currentEnergy - energyCost)

      // Update resources (including energy deduction and Capacity-modified rewards)
      await tx.resources.update({
        where: { userId },
        data: {
          energy: newEnergy,
          oxygen: modifiedResourceReward.oxygen !== undefined
            ? new Prisma.Decimal(user.resources.oxygen.toNumber() + modifiedResourceReward.oxygen)
            : undefined,
          water: modifiedResourceReward.water !== undefined ? modifiedResourceReward.water : undefined,
          gold: modifiedResourceReward.gold !== undefined
            ? new Prisma.Decimal(user.resources.gold.toNumber() + modifiedResourceReward.gold)
            : undefined,
          armor: modifiedResourceReward.armor !== undefined ? modifiedResourceReward.armor : undefined,
          keys: modifiedResourceReward.keys !== undefined ? user.resources.keys + modifiedResourceReward.keys : undefined,
        },
      })

      // Update or create progress
      await tx.trainingProgress.upsert({
        where: {
          userId_taskId: {
            userId,
            taskId,
          },
        },
        create: {
          userId,
          taskId,
          status: TaskStatus.COMPLETED,
          completedAt: new Date(),
          notes: notes || null,
        },
        update: {
          status: TaskStatus.COMPLETED,
          completedAt: new Date(),
          notes: notes || null,
        },
      })

      // Log as activity (with Capacity-modified values)
      await tx.activityLog.create({
        data: {
          userId,
          activityType: ActivityType.LEARNING,
          overallXPGained: modifiedOverallXP,
          categoryXPGain: modifiedCategoryXP,
          resourceChanges: Object.keys(modifiedResourceReward).length > 0 ? modifiedResourceReward : null,
          seasonContext: user.currentSeason,
          seasonMultiplier: 1.0,
          description: `Completed training: ${task.title}`,
        },
      })
    })

    // Check for milestones
    const milestones = await checkMilestones(userId)

    // Get updated resources to return current energy
    const updatedResources = await prisma.resources.findUnique({
      where: { userId },
    })

    res.json({
      success: true,
      xpGained: {
        overall: modifiedOverallXP,
        category: modifiedCategoryXP,
      },
      resourceReward: modifiedResourceReward,
      milestones,
      energyUsed: energyCost,
      remainingEnergy: updatedResources?.energy ?? 0,
      usableEnergy: updatedResources ? getEffectiveEnergy(updatedResources.energy, capacity, userIsInBurnout) : 0,
      capacityModifier: {
        capacity,
        xpEfficiency: modifiedOverallXP / baseTaskXP.overall, // Show the modifier applied
      },
      isInBurnout: userIsInBurnout,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }
    logger.error('Complete training task error:', error)
    res.status(500).json({ error: 'Failed to complete training task' })
  }
})

// Get user's training progress summary
router.get('/progress', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!

    const progress = await prisma.trainingProgress.findMany({
      where: { userId },
      include: {
        task: {
          include: {
            module: true,
          },
        },
      },
    })

    const completed = progress.filter((p) => p.status === TaskStatus.COMPLETED)
    const inProgress = progress.filter((p) => p.status === TaskStatus.IN_PROGRESS)

    res.json({
      totalCompleted: completed.length,
      totalInProgress: inProgress.length,
      progress,
    })
  } catch (error) {
    logger.error('Get training progress error:', error)
    res.status(500).json({ error: 'Failed to get training progress' })
  }
})

export default router

