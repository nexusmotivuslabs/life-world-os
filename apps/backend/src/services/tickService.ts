/**
 * Tick Service
 * 
 * Handles time-based progression: daily ticks that reset energy and apply decay.
 * Step 3: Deterministic tick replay - handles missed days sequentially and idempotently.
 * Step 4: Decay mechanics applied during daily ticks.
 */

import { prisma } from '../lib/prisma'
import { BASE_DAILY_ENERGY } from './energyService'
import { updateEnergyRestorationTimestamp } from './energyBurndownService'
import {
  applyOxygenDecay,
  applyCapacityDecay,
  applyMeaningDecay,
  applyEffortBasedCapacityDecay,
  applyChronicImbalanceDecay,
} from './decayService'
import {
  updateLowCapacityTracking,
  triggerBurnout,
  updateBurnoutRecovery,
  completeBurnoutRecovery,
} from './burnoutService'
import {
  evaluateOverOptimisationPenalties,
  applyOverOptimisationPenalties,
} from './overOptimisationService'
import { applyCapacityRecovery } from './capacityRecoveryService'
import { updateHighEffortTracking } from './capacityEffortTracking'

/**
 * Get start of day (00:00:00) for a given date
 */
function getStartOfDay(date: Date): Date {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  return start
}

/**
 * Calculate number of days between two dates (inclusive of start, exclusive of end)
 * Returns the number of days that need ticks applied.
 */
export function calculateDaysSinceLastTick(lastTickAt: Date | null): number {
  const now = new Date()
  const today = getStartOfDay(now)
  
  if (!lastTickAt) {
    // Never had a tick - need to initialize with today's tick
    return 1
  }

  const lastTickDay = getStartOfDay(lastTickAt)
  
  // Calculate difference in days
  const diffTime = today.getTime() - lastTickDay.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  // If diffDays is 0, we've already ticked today
  // If diffDays > 0, we have missed days to replay
  return Math.max(0, diffDays)
}

/**
 * Apply a single daily tick for a specific date
 * This is the atomic, idempotent tick operation.
 * 
 * Idempotency: If lastTickAt is already >= tickDate, this is a no-op.
 * 
 * @param userId - User ID
 * @param tickDate - The specific date to apply the tick for (start of day)
 * @returns true if tick was applied, false if already applied (idempotent)
 */
async function applySingleDailyTick(userId: string, tickDate: Date): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      resources: true,
      cloud: true,
    },
  })

  if (!user || !user.resources || !user.cloud) {
    throw new Error('User, resources, or cloud not found')
  }

  // Idempotency check: if we've already ticked for this date or later, skip
  if (user.lastTickAt) {
    const lastTickDay = getStartOfDay(user.lastTickAt)
    const targetDay = getStartOfDay(tickDate)
    
    if (lastTickDay.getTime() >= targetDay.getTime()) {
      // Already ticked for this day or later - idempotent no-op
      return false
    }
  }

  // Step 4: Apply decay mechanics during tick
  const currentOxygen = Number(user.resources.oxygen)
  const newOxygen = await applyOxygenDecay(userId, currentOxygen)
  
  let currentCapacity = user.cloud.capacityStrength
  let newCapacity = await applyCapacityDecay(userId, currentCapacity, tickDate)
  
  let currentMeaning = user.cloud.meaningStrength
  let newMeaning = await applyMeaningDecay(userId, currentMeaning, tickDate)
  
  let currentOptionality = user.cloud.optionalityStrength
  let shouldEvaluateWeekly = false

  // Capacity/Health System: Track high effort days during daily tick
  // Note: We track effort for the day being processed (tickDate)
  // Activities on that day will be counted when calculating energy expenditure
  await updateHighEffortTracking(userId, tickDate, currentCapacity, user.isInBurnout)

  // Step 7: Check if weekly tick evaluation should occur
  // Weekly tick happens when 7 days have passed since lastWeeklyTickAt
  if (!user.lastWeeklyTickAt) {
    // Never had a weekly tick - check if at least 7 days since account creation
    const daysSinceCreation = Math.floor(
      (tickDate.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    )
    shouldEvaluateWeekly = daysSinceCreation >= 7
  } else {
    const lastWeeklyTickDay = getStartOfDay(user.lastWeeklyTickAt)
    const tickDay = getStartOfDay(tickDate)
    const daysSinceLastWeekly = Math.floor(
      (tickDay.getTime() - lastWeeklyTickDay.getTime()) / (1000 * 60 * 60 * 24)
    )
    shouldEvaluateWeekly = daysSinceLastWeekly >= 7
  }

  // Step 7: Evaluate and apply over-optimisation penalties during weekly tick
  if (shouldEvaluateWeekly) {
    const penalties = await evaluateOverOptimisationPenalties(userId, tickDate)
    const adjustedStats = await applyOverOptimisationPenalties(
      userId,
      newCapacity,
      newMeaning,
      currentOptionality,
      penalties
    )
    
    // Apply the penalties
    newCapacity = adjustedStats.newCapacity
    newMeaning = adjustedStats.newMeaning
    currentOptionality = adjustedStats.newOptionality

    // Capacity/Health System: Apply effort-based decay during weekly tick
    const userForEffort = await prisma.user.findUnique({
      where: { id: userId },
      select: { consecutiveHighEffortDays: true },
    })
    if (userForEffort) {
      newCapacity = await applyEffortBasedCapacityDecay(
        userId,
        newCapacity,
        userForEffort.consecutiveHighEffortDays
      )
    }

    // Capacity/Health System: Apply chronic imbalance decay during weekly tick
    newCapacity = await applyChronicImbalanceDecay(userId, newCapacity, tickDate)

    // Capacity/Health System: Apply recovery during weekly tick
    newCapacity = await applyCapacityRecovery(userId, newCapacity, tickDate)
  }

  // Step 6: Update burnout tracking
  // Update low capacity tracking (for trigger) - only if not in burnout
  // Use capacity after over-optimisation penalties for burnout tracking
  if (!user.isInBurnout) {
    const lowCapacityTracking = await updateLowCapacityTracking(userId, newCapacity, tickDate)
    
    // Trigger burnout if threshold met (Capacity < 20 for 3 consecutive ticks)
    if (lowCapacityTracking.shouldTrigger) {
      await triggerBurnout(userId, tickDate)
      // After triggering, user is now in burnout - recovery will be checked next tick
    }
  }

  // Update recovery tracking if in burnout
  if (user.isInBurnout) {
    const recoveryTracking = await updateBurnoutRecovery(userId, newCapacity, tickDate)
    if (recoveryTracking.shouldRecover) {
      await completeBurnoutRecovery(userId)
    }
  }

  // Apply tick: reset energy, apply decay, and update lastTickAt
  await prisma.$transaction(async (tx) => {
    // Reset energy to base daily amount and update restoration timestamp
    await tx.resources.update({
      where: { userId },
      data: {
        energy: BASE_DAILY_ENERGY,
        energyRestoredAt: tickDate, // Set restoration timestamp for live burndown
        oxygen: newOxygen,
      },
    })

    // Update stats with decay and over-optimisation penalties applied
    await tx.cloud.update({
      where: { userId },
      data: {
        capacityStrength: newCapacity,
        meaningStrength: newMeaning,
        optionalityStrength: currentOptionality,
      },
    })

    // Update lastTickAt and lastWeeklyTickAt if weekly evaluation occurred
    await tx.user.update({
      where: { id: userId },
      data: {
        lastTickAt: tickDate,
        lastWeeklyTickAt: shouldEvaluateWeekly ? tickDate : undefined,
      },
    })
  })

  return true
}

/**
 * Replay all missed daily ticks deterministically
 * 
 * This function:
 * 1. Calculates all missing days since lastTickAt
 * 2. Replays ticks sequentially, one per day, in chronological order
 * 3. Ensures idempotency (same inputs = same outputs)
 * 
 * Example: If lastTickAt is 3 days ago, this will apply 3 ticks:
 * - Day 1 tick (3 days ago)
 * - Day 2 tick (2 days ago)  
 * - Day 3 tick (1 day ago / today)
 * 
 * Each tick resets energy. Decay will be added in Step 4.
 */
export async function applyDailyTick(userId: string): Promise<{ ticksApplied: number; lastTickDate: Date | null }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      resources: true,
    },
  })

  if (!user || !user.resources) {
    throw new Error('User or resources not found')
  }

  const daysSinceLastTick = calculateDaysSinceLastTick(user.lastTickAt)
  
  if (daysSinceLastTick === 0) {
    // Already ticked today - idempotent no-op
    return { ticksApplied: 0, lastTickDate: user.lastTickAt }
  }

  // Determine the starting date for tick replay
  const today = getStartOfDay(new Date())
  let currentTickDate: Date
  
  if (!user.lastTickAt) {
    // First tick ever - apply for today
    currentTickDate = today
  } else {
    // Start from the day after lastTickAt
    const lastTickDay = getStartOfDay(user.lastTickAt)
    currentTickDate = new Date(lastTickDay)
    currentTickDate.setDate(currentTickDate.getDate() + 1)
  }

  // Replay ticks sequentially for each missing day
  let ticksApplied = 0
  const maxDate = today.getTime()
  
  while (currentTickDate.getTime() <= maxDate) {
    const tickDate = new Date(currentTickDate) // Copy to avoid mutation
    const wasApplied = await applySingleDailyTick(userId, tickDate)
    
    if (wasApplied) {
      ticksApplied++
    }
    
    // Move to next day
    currentTickDate.setDate(currentTickDate.getDate() + 1)
  }

  // Fetch updated lastTickAt
  const updatedUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastTickAt: true },
  })

  return {
    ticksApplied,
    lastTickDate: updatedUser?.lastTickAt || null,
  }
}

/**
 * Ensure daily tick is applied (call before any action that needs current energy)
 * 
 * This is the main entry point for tick application.
 * It handles offline periods by replaying all missed ticks deterministically.
 */
export async function ensureDailyTick(userId: string): Promise<void> {
  await applyDailyTick(userId)
}

