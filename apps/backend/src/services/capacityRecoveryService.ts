/**
 * Capacity Recovery Service
 * 
 * Handles Capacity recovery mechanics.
 * Recovery occurs on weekly ticks and requires sustained recovery actions.
 * Recovery is slow but reliable - requires time + repetition.
 */

import { prisma } from '../lib/prisma'
import { ActivityType } from '../types'
import { applyCapacityChange } from './capacityService'

/**
 * Recovery action types
 * These actions help improve Capacity over time
 */
export const RECOVERY_ACTION_TYPES: ActivityType[] = [
  ActivityType.EXERCISE, // Already exists, grants XP
  ActivityType.LEARNING, // Already exists, grants XP
  ActivityType.SAVE_EXPENSES, // Already exists, grants XP
  ActivityType.REST, // New recovery action - no XP, improves Capacity
]

/**
 * Recovery rate constants
 */
export const RECOVERY_CONSTANTS = {
  MIN_RECOVERY_ACTIONS: 2, // Minimum actions per week for recovery
  MAX_RECOVERY_ACTIONS: 4, // Actions needed for max recovery
  MIN_RECOVERY_RATE: 1, // Minimum Capacity recovery per week (+1)
  MAX_RECOVERY_RATE: 2, // Maximum Capacity recovery per week (+2)
  WEEKLY_RECOVERY_CAP: 2, // Maximum Capacity recovery per week
} as const

/**
 * Count recovery actions in the past 7 days
 * 
 * @param userId - User ID
 * @param tickDate - Current tick date (for weekly evaluation)
 * @returns Number of recovery actions in past 7 days
 */
export async function countRecoveryActionsInWeek(
  userId: string,
  tickDate: Date
): Promise<number> {
  const weekStart = new Date(tickDate)
  weekStart.setDate(weekStart.getDate() - 7)

  const count = await prisma.activityLog.count({
    where: {
      userId,
      activityType: { in: RECOVERY_ACTION_TYPES },
      timestamp: {
        gte: weekStart,
        lt: tickDate,
      },
    },
  })

  return count
}

/**
 * Calculate recovery rate based on recovery actions performed
 * 
 * @param recoveryActionCount - Number of recovery actions in past week
 * @returns Capacity recovery amount (0-2)
 */
export function calculateRecoveryRate(recoveryActionCount: number): number {
  if (recoveryActionCount < RECOVERY_CONSTANTS.MIN_RECOVERY_ACTIONS) {
    // Not enough recovery actions - no recovery
    return 0
  }

  if (recoveryActionCount >= RECOVERY_CONSTANTS.MAX_RECOVERY_ACTIONS) {
    // Maximum recovery actions - max recovery rate
    return RECOVERY_CONSTANTS.MAX_RECOVERY_RATE
  }

  // Between min and max - linear interpolation
  const progress = (recoveryActionCount - RECOVERY_CONSTANTS.MIN_RECOVERY_ACTIONS) /
    (RECOVERY_CONSTANTS.MAX_RECOVERY_ACTIONS - RECOVERY_CONSTANTS.MIN_RECOVERY_ACTIONS)
  
  const recoveryRate = RECOVERY_CONSTANTS.MIN_RECOVERY_RATE +
    (progress * (RECOVERY_CONSTANTS.MAX_RECOVERY_RATE - RECOVERY_CONSTANTS.MIN_RECOVERY_RATE))
  
  return Math.round(recoveryRate)
}

/**
 * Apply Capacity recovery during weekly tick
 * 
 * Recovery mechanics:
 * - Recovery occurs on weekly ticks (not daily)
 * - Requires 2-4 recovery actions per week
 * - Recovery rate: +1 to +2 Capacity per week
 * - Recovery cannot exceed 100
 * - Recovery requires sustained action (not one-off)
 * 
 * @param userId - User ID
 * @param currentCapacity - Current Capacity value
 * @param tickDate - Current tick date
 * @returns New Capacity value after recovery
 */
export async function applyCapacityRecovery(
  userId: string,
  currentCapacity: number,
  tickDate: Date
): Promise<number> {
  // Count recovery actions in past 7 days
  const recoveryActionCount = await countRecoveryActionsInWeek(userId, tickDate)
  
  // Calculate recovery rate
  const recoveryRate = calculateRecoveryRate(recoveryActionCount)
  
  if (recoveryRate === 0) {
    // No recovery - not enough actions
    return currentCapacity
  }
  
  // Apply recovery (capped at 100)
  const newCapacity = applyCapacityChange(currentCapacity, recoveryRate)
  
  // Update tracking fields
  await prisma.user.update({
    where: { id: userId },
    data: {
      lastWeeklyRecoveryAt: tickDate,
      recoveryActionsThisWeek: recoveryActionCount,
    },
  })
  
  return newCapacity
}

/**
 * Check if user has performed recovery actions recently
 * 
 * @param userId - User ID
 * @param sinceDate - Date to check since
 * @returns true if recovery actions performed since date
 */
export async function hasRecoveryActionsSince(
  userId: string,
  sinceDate: Date
): Promise<boolean> {
  const count = await prisma.activityLog.count({
    where: {
      userId,
      activityType: { in: RECOVERY_ACTION_TYPES },
      timestamp: { gte: sinceDate },
    },
  })
  
  return count > 0
}

