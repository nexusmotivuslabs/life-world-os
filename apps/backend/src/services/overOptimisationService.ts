/**
 * Over-Optimisation Penalty Service
 * 
 * Handles detection and application of over-optimisation penalties.
 * Step 7: Implements penalties for sustained imbalance in action distribution.
 * 
 * Penalties are applied during weekly tick evaluation (every 7 days).
 * This step punishes fragile success, not failure.
 */

import { prisma } from '../lib/prisma'
import { ActivityType } from '../types'

/**
 * Over-optimisation thresholds and penalties (canonical)
 */
export const OVER_OPTIMISATION_CONSTANTS = {
  // Thresholds for detecting imbalance
  WORK_DOMINANCE_THRESHOLD: 0.6, // Work actions > 60% of total
  SAVING_DOMINANCE_THRESHOLD: 0.4, // Save actions > 40% of total
  LEARNING_DOMINANCE_THRESHOLD: 0.5, // Learning actions > 50% of total
  
  // Penalties
  EXCESSIVE_WORK_CAPACITY_PENALTY: -5, // Capacity reduction
  EXCESSIVE_WORK_MEANING_PENALTY: -3, // Meaning reduction
  EXCESSIVE_SAVING_MEANING_PENALTY: -4, // Meaning reduction
  EXCESSIVE_LEARNING_OPTIONALITY_PENALTY: -4, // Optionality reduction
} as const

/**
 * Get start of day (00:00:00) for a given date
 */
function getStartOfDay(date: Date): Date {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  return start
}

/**
 * Analyze action distribution for the past 7 days
 * Returns counts of each action type
 */
async function analyzeActionDistribution(
  userId: string,
  weekStartDate: Date,
  weekEndDate: Date
): Promise<{
  workCount: number
  saveCount: number
  learningCount: number
  exerciseCount: number
  totalCount: number
}> {
  const actions = await prisma.activityLog.findMany({
    where: {
      userId,
      timestamp: {
        gte: weekStartDate,
        lt: weekEndDate,
      },
      // Only count player actions (exclude system events)
      activityType: {
        in: [
          ActivityType.WORK_PROJECT,
          ActivityType.SAVE_EXPENSES,
          ActivityType.LEARNING,
          ActivityType.EXERCISE,
          ActivityType.CUSTOM,
        ],
      },
    },
    select: {
      activityType: true,
    },
  })

  let workCount = 0
  let saveCount = 0
  let learningCount = 0
  let exerciseCount = 0

  for (const action of actions) {
    switch (action.activityType) {
      case ActivityType.WORK_PROJECT:
        workCount++
        break
      case ActivityType.SAVE_EXPENSES:
        saveCount++
        break
      case ActivityType.LEARNING:
        learningCount++
        break
      case ActivityType.EXERCISE:
        exerciseCount++
        break
      default:
        // CUSTOM actions don't count toward imbalance
        break
    }
  }

  const totalCount = workCount + saveCount + learningCount + exerciseCount

  return {
    workCount,
    saveCount,
    learningCount,
    exerciseCount,
    totalCount,
  }
}

/**
 * Check if excessive work dominance is detected
 * Definition: Work actions > 60% of total actions in past week
 */
function detectExcessiveWork(workCount: number, totalCount: number): boolean {
  if (totalCount === 0) {
    return false
  }
  const workPercentage = workCount / totalCount
  return workPercentage > OVER_OPTIMISATION_CONSTANTS.WORK_DOMINANCE_THRESHOLD
}

/**
 * Check if excessive saving dominance is detected
 * Definition: Save actions > 40% of total actions in past week
 */
function detectExcessiveSaving(saveCount: number, totalCount: number): boolean {
  if (totalCount === 0) {
    return false
  }
  const savePercentage = saveCount / totalCount
  return savePercentage > OVER_OPTIMISATION_CONSTANTS.SAVING_DOMINANCE_THRESHOLD
}

/**
 * Check if excessive learning without execution is detected
 * Definition: Learning actions > 50% of total, no Work/Exercise actions
 */
function detectExcessiveLearning(
  learningCount: number,
  workCount: number,
  exerciseCount: number,
  totalCount: number
): boolean {
  if (totalCount === 0) {
    return false
  }
  const learningPercentage = learningCount / totalCount
  const hasExecutionActions = workCount > 0 || exerciseCount > 0
  
  return (
    learningPercentage > OVER_OPTIMISATION_CONSTANTS.LEARNING_DOMINANCE_THRESHOLD &&
    !hasExecutionActions
  )
}

/**
 * Apply over-optimisation penalties based on detected imbalances
 * Returns the stat adjustments to apply
 */
export interface OverOptimisationPenalties {
  capacityAdjustment: number
  meaningAdjustment: number
  optionalityAdjustment: number
}

export async function evaluateOverOptimisationPenalties(
  userId: string,
  tickDate: Date
): Promise<OverOptimisationPenalties> {
  // Analyze actions from the past 7 days
  const weekEndDate = getStartOfDay(tickDate)
  const weekStartDate = new Date(weekEndDate)
  weekStartDate.setDate(weekStartDate.getDate() - 7)

  const distribution = await analyzeActionDistribution(userId, weekStartDate, weekEndDate)

  let capacityAdjustment = 0
  let meaningAdjustment = 0
  let optionalityAdjustment = 0

  // Check for excessive work dominance
  if (detectExcessiveWork(distribution.workCount, distribution.totalCount)) {
    capacityAdjustment += OVER_OPTIMISATION_CONSTANTS.EXCESSIVE_WORK_CAPACITY_PENALTY
    meaningAdjustment += OVER_OPTIMISATION_CONSTANTS.EXCESSIVE_WORK_MEANING_PENALTY
  }

  // Check for excessive saving dominance
  if (detectExcessiveSaving(distribution.saveCount, distribution.totalCount)) {
    meaningAdjustment += OVER_OPTIMISATION_CONSTANTS.EXCESSIVE_SAVING_MEANING_PENALTY
  }

  // Check for excessive learning without execution
  if (
    detectExcessiveLearning(
      distribution.learningCount,
      distribution.workCount,
      distribution.exerciseCount,
      distribution.totalCount
    )
  ) {
    optionalityAdjustment += OVER_OPTIMISATION_CONSTANTS.EXCESSIVE_LEARNING_OPTIONALITY_PENALTY
  }

  return {
    capacityAdjustment,
    meaningAdjustment,
    optionalityAdjustment,
  }
}

/**
 * Apply over-optimisation penalties to stats
 * Enforces floors (stats cannot go below 0)
 */
export async function applyOverOptimisationPenalties(
  userId: string,
  currentCapacity: number,
  currentMeaning: number,
  currentOptionality: number,
  penalties: OverOptimisationPenalties
): Promise<{
  newCapacity: number
  newMeaning: number
  newOptionality: number
}> {
  const newCapacity = Math.max(0, currentCapacity + penalties.capacityAdjustment)
  const newMeaning = Math.max(0, currentMeaning + penalties.meaningAdjustment)
  const newOptionality = Math.max(0, currentOptionality + penalties.optionalityAdjustment)

  return {
    newCapacity,
    newMeaning,
    newOptionality,
  }
}





