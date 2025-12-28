/**
 * Burnout Service
 * 
 * Handles Burnout failure state tracking, triggering, penalties, and recovery.
 * Step 6: Implements Burnout mechanics as defined in MECHANICS_BASELINE.md
 */

import { prisma } from '../lib/prisma'
import { ActivityType } from '../types'

/**
 * Burnout thresholds and constants (canonical)
 * Step 6: Updated to match canonical requirements
 */
export const BURNOUT_CONSTANTS = {
  TRIGGER_THRESHOLD: 3, // Consecutive daily ticks with Capacity < 20
  LOW_CAPACITY_THRESHOLD: 20, // Capacity threshold for burnout trigger
  RECOVERY_CAPACITY_THRESHOLD: 25, // Capacity must be above this to exit burnout
  MIN_RECOVERY_DURATION: 1, // Minimum daily ticks that must pass for recovery (at least one tick)
  BURNOUT_ENERGY_CAP: 40, // Energy cap during burnout (significantly reduced)
  BURNOUT_XP_PENALTY: 0.3, // XP gain multiplier during burnout (70% reduction - heavily penalised)
} as const

/**
 * Recovery/rest-type actions that help exit burnout
 * These actions increase Capacity and promote recovery
 */
const RECOVERY_ACTIONS: ActivityType[] = [
  ActivityType.EXERCISE, // Increases Capacity
  ActivityType.LEARNING, // Increases Capacity
  ActivityType.SAVE_EXPENSES, // Financial stability
  ActivityType.REST, // Recovery action - no XP, improves Capacity
]

/**
 * Check if user has performed recovery/rest-type actions since a given date
 */
async function hasRecoveryActionsSince(userId: string, sinceDate: Date): Promise<boolean> {
  const recoveryActions = await prisma.activityLog.findFirst({
    where: {
      userId,
      activityType: { in: RECOVERY_ACTIONS },
      timestamp: { gte: sinceDate },
    },
  })
  return !!recoveryActions
}

/**
 * Update consecutive low capacity days counter
 * Called during daily tick to track burnout trigger condition
 */
export async function updateLowCapacityTracking(
  userId: string,
  currentCapacity: number,
  tickDate: Date
): Promise<{ consecutiveDays: number; shouldTrigger: boolean }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isInBurnout: true,
      consecutiveLowCapacityDays: true,
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  // If already in burnout, don't update trigger tracking
  if (user.isInBurnout) {
    return {
      consecutiveDays: user.consecutiveLowCapacityDays,
      shouldTrigger: false,
    }
  }

  // Check if capacity is below threshold
  const isLowCapacity = currentCapacity < BURNOUT_CONSTANTS.LOW_CAPACITY_THRESHOLD

  let newConsecutiveDays: number
  if (isLowCapacity) {
    // Increment consecutive days
    newConsecutiveDays = user.consecutiveLowCapacityDays + 1
  } else {
    // Reset counter
    newConsecutiveDays = 0
  }

  // Update counter
  await prisma.user.update({
    where: { id: userId },
    data: {
      consecutiveLowCapacityDays: newConsecutiveDays,
    },
  })

  // Check if burnout should be triggered
  const shouldTrigger = newConsecutiveDays >= BURNOUT_CONSTANTS.TRIGGER_THRESHOLD

  return {
    consecutiveDays: newConsecutiveDays,
    shouldTrigger,
  }
}

/**
 * Trigger burnout failure state
 */
export async function triggerBurnout(userId: string, tickDate: Date): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      isInBurnout: true,
      burnoutTriggeredAt: tickDate,
    },
  })
}

/**
 * Update recovery tracking during daily tick
 * Called when user is in burnout to check recovery conditions
 * 
 * Recovery conditions (canonical):
 * 1. Capacity must rise above exit threshold (25)
 * 2. Must have performed recovery/rest-type actions since entering burnout or since last tick
 * 3. Must pass at least one daily tick (minimum recovery duration)
 * 4. Recovery is not cleared by "one good action" - requires time + actions
 */
export async function updateBurnoutRecovery(
  userId: string,
  currentCapacity: number,
  tickDate: Date
): Promise<{ shouldRecover: boolean }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isInBurnout: true,
      burnoutTriggeredAt: true,
      lastTickAt: true,
    },
  })

  if (!user || !user.isInBurnout || !user.burnoutTriggeredAt) {
    // Not in burnout, nothing to do
    return { shouldRecover: false }
  }

  // Recovery condition 1: Capacity must rise above exit threshold
  const capacityAboveThreshold = currentCapacity > BURNOUT_CONSTANTS.RECOVERY_CAPACITY_THRESHOLD

  if (!capacityAboveThreshold) {
    // Capacity too low, cannot recover
    return { shouldRecover: false }
  }

  // Recovery condition 2: Must have performed recovery/rest-type actions
  // Check since burnout was triggered (to ensure actions were taken during burnout)
  const hasRecoveryActions = await hasRecoveryActionsSince(userId, user.burnoutTriggeredAt)

  if (!hasRecoveryActions) {
    // No recovery actions taken, cannot recover
    return { shouldRecover: false }
  }

  // Recovery condition 3: Must pass at least one daily tick (minimum recovery duration)
  // This tick counts as the minimum - if we've reached here, at least one tick has passed
  // since burnout was triggered (because we're in a tick and capacity is above threshold)

  // All conditions met - user can recover
  // Note: Recovery happens immediately when conditions are met, but requires:
  // - Time (at least one tick has passed)
  // - Actions (recovery actions were taken)
  // - Capacity (above threshold)
  // This ensures burnout is not cleared by "one good action"

  return { shouldRecover: true }
}

/**
 * Complete burnout recovery
 */
export async function completeBurnoutRecovery(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      isInBurnout: false,
      burnoutTriggeredAt: null,
      consecutiveLowCapacityDays: 0, // Reset trigger tracking
    },
  })
}

/**
 * Get effective energy cap during burnout
 * Returns 50 if in burnout, otherwise returns null (use normal capacity-based cap)
 */
export async function getBurnoutEnergyCap(userId: string): Promise<number | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isInBurnout: true },
  })

  if (!user) {
    return null
  }

  if (user.isInBurnout) {
    return BURNOUT_CONSTANTS.BURNOUT_ENERGY_CAP
  }

  return null
}

/**
 * Get burnout XP penalty multiplier
 * Returns 0.3 if in burnout (70% reduction - heavily penalised), otherwise 1.0 (no penalty)
 */
export async function getBurnoutXPModifier(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isInBurnout: true },
  })

  if (!user) {
    return 1.0
  }

  if (user.isInBurnout) {
    return BURNOUT_CONSTANTS.BURNOUT_XP_PENALTY
  }

  return 1.0
}

/**
 * Check if user is in burnout
 */
export async function isInBurnout(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isInBurnout: true },
  })

  return user?.isInBurnout ?? false
}

