/**
 * Decay Service
 * 
 * Handles stat and resource decay during daily ticks.
 * Step 4: Implements decay mechanics as defined in MECHANICS_BASELINE.md
 */

import { prisma } from '../lib/prisma'
import { ActivityType } from '../types'

/**
 * Decay rates from MECHANICS_BASELINE.md
 */
export const DECAY_RATES = {
  OXYGEN_DAILY: 0.1, // months per day
  OXYGEN_ENGINE_OFFSET: 0.05, // months offset per active engine
  CAPACITY_WEEKLY: 2, // points per week if neglected
  MEANING_WEEKLY: 1, // points per week if value drift
  CAPACITY_FLOOR: 20,
  MEANING_FLOOR: 20,
} as const

/**
 * Capacity-improving actions (from xpCalculator.ts)
 * WORK_PROJECT: +100 capacity XP
 * EXERCISE: +250 capacity XP
 * LEARNING: +150 capacity XP
 */
const CAPACITY_IMPROVING_ACTIONS: ActivityType[] = [
  ActivityType.WORK_PROJECT,
  ActivityType.EXERCISE,
  ActivityType.LEARNING,
]

/**
 * Apply Oxygen resource daily decay
 * 
 * Daily decay: 0.1 months (if no active Engines)
 * Decay reduction: Active Engines offset decay (1 Engine = 0.05 months offset)
 * Minimum: Cannot go below 0
 */
export async function applyOxygenDecay(userId: string, currentOxygen: number): Promise<number> {
  // Count active engines
  const activeEngines = await prisma.engine.count({
    where: {
      userId,
      status: 'ACTIVE',
    },
  })

  // Calculate decay
  const baseDecay = DECAY_RATES.OXYGEN_DAILY
  const engineOffset = activeEngines * DECAY_RATES.OXYGEN_ENGINE_OFFSET
  const netDecay = Math.max(0, baseDecay - engineOffset)

  // Apply decay (cannot go below 0)
  const newOxygen = Math.max(0, currentOxygen - netDecay)

  return newOxygen
}

/**
 * Check if Capacity should decay on this tick date
 * 
 * Capacity decays weekly if:
 * - It's been 7+ days since the last capacity-improving action
 * - We're applying decay once per week period
 * 
 * To avoid double-decay during tick replay, we only apply decay when we cross a week boundary:
 * - Day 7 (first week): Apply decay
 * - Day 14 (second week): Apply decay
 * - Day 21 (third week): Apply decay
 * etc.
 * 
 * We check if daysSinceLastAction is exactly divisible by 7 (week boundary).
 */
async function shouldApplyCapacityDecay(userId: string, tickDate: Date): Promise<boolean> {
  // Find the most recent capacity-improving action before this tick date
  const lastCapacityAction = await prisma.activityLog.findFirst({
    where: {
      userId,
      activityType: { in: CAPACITY_IMPROVING_ACTIONS },
      timestamp: { lt: tickDate },
    },
    orderBy: { timestamp: 'desc' },
  })

  if (!lastCapacityAction) {
    // No capacity actions ever - skip decay (user hasn't started yet)
    return false
  }

  const daysSinceLastAction = Math.floor(
    (tickDate.getTime() - lastCapacityAction.timestamp.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Apply decay only on week boundaries (day 7, 14, 21, etc.)
  // This ensures we only decay once per week period, even during tick replay
  return daysSinceLastAction >= 7 && daysSinceLastAction % 7 === 0
}

/**
 * Apply Capacity stat weekly decay if neglected
 * 
 * Weekly decay (if neglected): -2 points per week
 * Neglect definition: No capacity-improving actions for 7 days
 * Decay stops: When Capacity hits 20 (floor)
 */
export async function applyCapacityDecay(
  userId: string,
  currentCapacity: number,
  tickDate: Date
): Promise<number> {
  // Don't decay if already at or below floor
  if (currentCapacity <= DECAY_RATES.CAPACITY_FLOOR) {
    return currentCapacity
  }

  // Check if capacity should decay on this tick date
  const shouldDecay = await shouldApplyCapacityDecay(userId, tickDate)

  if (!shouldDecay) {
    // Not time to decay yet, or already decayed for this week period
    return currentCapacity
  }

  // Apply weekly decay
  const newCapacity = Math.max(DECAY_RATES.CAPACITY_FLOOR, currentCapacity - DECAY_RATES.CAPACITY_WEEKLY)

  return newCapacity
}

/**
 * Check if Meaning should decay on this tick date
 * 
 * Meaning decays weekly if there's value drift.
 * For Step 4, we use a simplified heuristic:
 * - If it's been 7+ days since any activity, consider it drift
 * - In a full implementation, this would check alignment with user's stated values
 * 
 * Similar to Capacity, we only apply decay once per week period (on week boundaries)
 * to avoid double-decay during tick replay.
 */
async function shouldApplyMeaningDecay(userId: string, tickDate: Date): Promise<boolean> {
  // Find the most recent activity before this tick date
  const lastActivity = await prisma.activityLog.findFirst({
    where: {
      userId,
      timestamp: { lt: tickDate },
    },
    orderBy: { timestamp: 'desc' },
  })

  if (!lastActivity) {
    // No activities ever - skip decay (user hasn't started yet)
    return false
  }

  const daysSinceLastActivity = Math.floor(
    (tickDate.getTime() - lastActivity.timestamp.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Apply decay only on week boundaries (day 7, 14, 21, etc.)
  // This ensures we only decay once per week period, even during tick replay
  return daysSinceLastActivity >= 7 && daysSinceLastActivity % 7 === 0
}

/**
 * Apply Meaning stat weekly decay if value drift detected
 * 
 * Weekly decay (if value drift): -1 point per week
 * Value drift definition: Actions consistently misaligned with user's stated values
 * Decay stops: When Meaning hits 20 (floor)
 * 
 * Note: Step 4 uses simplified drift detection (7+ days since last activity)
 */
export async function applyMeaningDecay(
  userId: string,
  currentMeaning: number,
  tickDate: Date
): Promise<number> {
  // Don't decay if already at or below floor
  if (currentMeaning <= DECAY_RATES.MEANING_FLOOR) {
    return currentMeaning
  }

  // Check if meaning should decay on this tick date
  const shouldDecay = await shouldApplyMeaningDecay(userId, tickDate)

  if (!shouldDecay) {
    // Not time to decay yet, or already decayed for this week period
    return currentMeaning
  }

  // Apply weekly decay
  const newMeaning = Math.max(DECAY_RATES.MEANING_FLOOR, currentMeaning - DECAY_RATES.MEANING_WEEKLY)

  return newMeaning
}

/**
 * Apply effort-based Capacity decay
 * 
 * Decay based on consecutive high effort days:
 * - 7 days: -1 Capacity
 * - 14 days: -2 Capacity
 * - 21+ days: -3 Capacity
 * 
 * Applied during weekly tick evaluation.
 * Decay stops at Capacity 20 (floor).
 * 
 * @param userId - User ID
 * @param currentCapacity - Current Capacity value
 * @param consecutiveHighEffortDays - Number of consecutive high effort days
 * @returns New Capacity value after effort-based decay
 */
export async function applyEffortBasedCapacityDecay(
  userId: string,
  currentCapacity: number,
  consecutiveHighEffortDays: number
): Promise<number> {
  // Don't decay if already at or below floor
  if (currentCapacity <= DECAY_RATES.CAPACITY_FLOOR) {
    return currentCapacity
  }

  // Calculate decay amount based on consecutive days
  let decayAmount = 0
  if (consecutiveHighEffortDays >= 21) {
    decayAmount = 3
  } else if (consecutiveHighEffortDays >= 14) {
    decayAmount = 2
  } else if (consecutiveHighEffortDays >= 7) {
    decayAmount = 1
  }

  if (decayAmount === 0) {
    return currentCapacity
  }

  // Apply decay (cannot go below floor)
  const newCapacity = Math.max(DECAY_RATES.CAPACITY_FLOOR, currentCapacity - decayAmount)

  return newCapacity
}

/**
 * Apply chronic imbalance Capacity decay
 * 
 * Chronic imbalance decay:
 * - Work actions > 70% of total: -1 Capacity
 * - No recovery actions for 7+ days: -1 Capacity
 * 
 * Applied during weekly tick evaluation.
 * Decay stops at Capacity 20 (floor).
 * 
 * @param userId - User ID
 * @param currentCapacity - Current Capacity value
 * @param tickDate - Current tick date
 * @returns New Capacity value after chronic imbalance decay
 */
export async function applyChronicImbalanceDecay(
  userId: string,
  currentCapacity: number,
  tickDate: Date
): Promise<number> {
  // Don't decay if already at or below floor
  if (currentCapacity <= DECAY_RATES.CAPACITY_FLOOR) {
    return currentCapacity
  }

  const weekStart = new Date(tickDate)
  weekStart.setDate(weekStart.getDate() - 7)

  // Get all activities in past 7 days
  const activities = await prisma.activityLog.findMany({
    where: {
      userId,
      timestamp: {
        gte: weekStart,
        lt: tickDate,
      },
    },
    select: {
      activityType: true,
    },
  })

  if (activities.length === 0) {
    return currentCapacity
  }

  let decayAmount = 0

  // Check for excessive Work actions (>70% of total)
  const workActions = activities.filter(
    (a) => a.activityType === ActivityType.WORK_PROJECT
  ).length
  const workPercentage = workActions / activities.length
  if (workPercentage > 0.7) {
    decayAmount += 1
  }

  // Check for no recovery actions
  const recoveryActions = activities.filter(
    (a) => a.activityType === ActivityType.EXERCISE ||
           a.activityType === ActivityType.LEARNING ||
           a.activityType === ActivityType.SAVE_EXPENSES ||
           a.activityType === ActivityType.REST
  ).length
  if (recoveryActions === 0) {
    decayAmount += 1
  }

  if (decayAmount === 0) {
    return currentCapacity
  }

  // Apply decay (cannot go below floor)
  const newCapacity = Math.max(DECAY_RATES.CAPACITY_FLOOR, currentCapacity - decayAmount)

  return newCapacity
}

