/**
 * Capacity Effort Tracking Service
 * 
 * Tracks high effort days and chronic imbalance patterns.
 * Used to calculate effort-based Capacity decay.
 */

import { prisma } from '../lib/prisma'
import { ActivityType } from '../types'
import { calculateUsableEnergyCap, getActionEnergyCost } from './energyService'

/**
 * Effort tracking constants
 */
export const EFFORT_CONSTANTS = {
  HIGH_EFFORT_THRESHOLD: 0.8, // 80% of usable energy = high effort day
  DECAY_7_DAYS: 1, // Capacity decay after 7 consecutive high effort days
  DECAY_14_DAYS: 2, // Capacity decay after 14 consecutive high effort days
  DECAY_21_DAYS: 3, // Capacity decay after 21+ consecutive high effort days
  WORK_ACTION_THRESHOLD: 0.7, // 70% Work actions = chronic imbalance
} as const

/**
 * Calculate energy expenditure percentage for a day
 * 
 * @param userId - User ID
 * @param date - Date to check
 * @param capacity - Current Capacity value
 * @param isInBurnout - Whether user is in burnout
 * @returns Energy expenditure percentage (0-1)
 */
export async function calculateEnergyExpenditurePercentage(
  userId: string,
  date: Date,
  capacity: number,
  isInBurnout: boolean
): Promise<number> {
  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(date)
  dayEnd.setHours(23, 59, 59, 999)

  // Get all activities for this day
  const activities = await prisma.activityLog.findMany({
    where: {
      userId,
      timestamp: {
        gte: dayStart,
        lte: dayEnd,
      },
    },
    select: {
      activityType: true,
    },
  })

  // Calculate total energy spent
  let totalEnergySpent = 0
  for (const activity of activities) {
    const energyCost = getActionEnergyCost(activity.activityType)
    totalEnergySpent += energyCost
  }

  // Calculate usable energy cap
  const usableEnergyCap = isInBurnout
    ? 40 // Burnout cap
    : calculateUsableEnergyCap(capacity)

  // Calculate percentage
  if (usableEnergyCap === 0) {
    return 0
  }

  return Math.min(1, totalEnergySpent / usableEnergyCap)
}


/**
 * Update high effort day tracking during daily tick
 * 
 * @param userId - User ID
 * @param tickDate - Current tick date
 * @param capacity - Current Capacity value
 * @param isInBurnout - Whether user is in burnout
 */
export async function updateHighEffortTracking(
  userId: string,
  tickDate: Date,
  capacity: number,
  isInBurnout: boolean
): Promise<void> {
  const energyExpenditure = await calculateEnergyExpenditurePercentage(
    userId,
    tickDate,
    capacity,
    isInBurnout
  )

  const isHighEffortDay = energyExpenditure > EFFORT_CONSTANTS.HIGH_EFFORT_THRESHOLD

  // Get current tracking
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      consecutiveHighEffortDays: true,
    },
  })

  if (!user) {
    return
  }

  // Update consecutive high effort days
  const newConsecutiveDays = isHighEffortDay
    ? user.consecutiveHighEffortDays + 1
    : 0 // Reset if not high effort

  await prisma.user.update({
    where: { id: userId },
    data: {
      consecutiveHighEffortDays: newConsecutiveDays,
    },
  })
}

/**
 * Calculate effort-based Capacity decay
 * 
 * Decay based on consecutive high effort days:
 * - 7 days: -1 Capacity
 * - 14 days: -2 Capacity
 * - 21+ days: -3 Capacity
 * 
 * @param consecutiveHighEffortDays - Number of consecutive high effort days
 * @returns Capacity decay amount (0-3)
 */
export function calculateEffortBasedDecay(consecutiveHighEffortDays: number): number {
  if (consecutiveHighEffortDays >= 21) {
    return EFFORT_CONSTANTS.DECAY_21_DAYS
  } else if (consecutiveHighEffortDays >= 14) {
    return EFFORT_CONSTANTS.DECAY_14_DAYS
  } else if (consecutiveHighEffortDays >= 7) {
    return EFFORT_CONSTANTS.DECAY_7_DAYS
  }
  
  return 0
}

/**
 * Check for chronic imbalance (Work actions > 70% of total)
 * 
 * @param userId - User ID
 * @param tickDate - Current tick date
 * @returns true if chronic imbalance detected
 */
export async function hasChronicImbalance(
  userId: string,
  tickDate: Date
): Promise<boolean> {
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
    return false
  }

  // Count work actions
  const workActions = activities.filter(
    (a) => a.activityType === ActivityType.WORK_PROJECT
  ).length

  // Calculate percentage
  const workPercentage = workActions / activities.length

  return workPercentage > EFFORT_CONSTANTS.WORK_ACTION_THRESHOLD
}

/**
 * Check if user has performed recovery actions in past 7 days
 * 
 * @param userId - User ID
 * @param tickDate - Current tick date
 * @returns true if recovery actions performed
 */
export async function hasRecoveryActionsInWeek(
  userId: string,
  tickDate: Date
): Promise<boolean> {
  const weekStart = new Date(tickDate)
  weekStart.setDate(weekStart.getDate() - 7)

  const count = await prisma.activityLog.count({
    where: {
      userId,
      activityType: {
        in: [
          ActivityType.EXERCISE,
          ActivityType.LEARNING,
          ActivityType.SAVE_EXPENSES,
          ActivityType.REST,
        ],
      },
      timestamp: {
        gte: weekStart,
        lt: tickDate,
      },
    },
  })

  return count > 0
}

