import { TrainingModuleType, TaskStatus, OverallRank, CategoryXP } from '../types'

export interface TaskXP {
  overall: number
  category: CategoryXP
}

/**
 * Calculate XP reward for completing a training task
 * Based on task type and difficulty
 */
export function calculateTaskXP(
  taskType: TrainingModuleType,
  taskOrder: number
): TaskXP {
  // Base XP increases with task order (later tasks = more XP)
  const baseXP = 10 + (taskOrder * 5)
  
  // Category XP distribution based on task type
  let categoryXP: CategoryXP = {
    capacity: 0,
    engines: 0,
    oxygen: 0,
    meaning: 0,
    optionality: 0,
  }

  switch (taskType) {
    case TrainingModuleType.EMERGENCY_FUND:
      categoryXP = {
        capacity: Math.round(baseXP * 0.1),
        engines: Math.round(baseXP * 0.1),
        oxygen: Math.round(baseXP * 0.6), // Main focus
        meaning: Math.round(baseXP * 0.1),
        optionality: Math.round(baseXP * 0.1),
      }
      break

    case TrainingModuleType.INCREASE_INCOME:
      categoryXP = {
        capacity: Math.round(baseXP * 0.1),
        engines: Math.round(baseXP * 0.7), // Main focus
        oxygen: Math.round(baseXP * 0.1),
        meaning: Math.round(baseXP * 0.05),
        optionality: Math.round(baseXP * 0.05),
      }
      break

    case TrainingModuleType.REDUCE_EXPENSES:
      categoryXP = {
        capacity: Math.round(baseXP * 0.2),
        engines: Math.round(baseXP * 0.1),
        oxygen: Math.round(baseXP * 0.5), // Main focus
        meaning: Math.round(baseXP * 0.1),
        optionality: Math.round(baseXP * 0.1),
      }
      break

    case TrainingModuleType.AUTOMATE_SAVINGS:
      categoryXP = {
        capacity: Math.round(baseXP * 0.15),
        engines: Math.round(baseXP * 0.2),
        oxygen: Math.round(baseXP * 0.5), // Main focus
        meaning: Math.round(baseXP * 0.1),
        optionality: Math.round(baseXP * 0.05),
      }
      break

    case TrainingModuleType.MULTIPLE_INCOME_STREAMS:
      categoryXP = {
        capacity: Math.round(baseXP * 0.1),
        engines: Math.round(baseXP * 0.6), // Main focus
        oxygen: Math.round(baseXP * 0.1),
        meaning: Math.round(baseXP * 0.05),
        optionality: Math.round(baseXP * 0.15), // Also important
      }
      break

    case TrainingModuleType.TRACK_EXPENSES:
      categoryXP = {
        capacity: Math.round(baseXP * 0.2),
        engines: Math.round(baseXP * 0.1),
        oxygen: Math.round(baseXP * 0.4), // Main focus
        meaning: Math.round(baseXP * 0.15),
        optionality: Math.round(baseXP * 0.15),
      }
      break

    case TrainingModuleType.AVOID_LIFESTYLE_INFLATION:
      categoryXP = {
        capacity: Math.round(baseXP * 0.2),
        engines: Math.round(baseXP * 0.1),
        oxygen: Math.round(baseXP * 0.4), // Main focus
        meaning: Math.round(baseXP * 0.2),
        optionality: Math.round(baseXP * 0.1),
      }
      break

    default:
      categoryXP = {
        capacity: Math.round(baseXP * 0.2),
        engines: Math.round(baseXP * 0.2),
        oxygen: Math.round(baseXP * 0.2),
        meaning: Math.round(baseXP * 0.2),
        optionality: Math.round(baseXP * 0.2),
      }
  }

  const overallXP = Object.values(categoryXP).reduce((sum, xp) => sum + xp, 0)

  return {
    overall: overallXP,
    category: categoryXP,
  }
}

/**
 * Check if a training module is unlocked for a user
 */
export function isModuleUnlocked(
  moduleRequiredRank: OverallRank | null,
  moduleRequiredTasks: number | null,
  userRank: OverallRank,
  completedTasksCount: number
): boolean {
  // Check rank requirement
  if (moduleRequiredRank) {
    const rankOrder = [
      OverallRank.RECRUIT,
      OverallRank.PRIVATE,
      OverallRank.CORPORAL,
      OverallRank.SERGEANT,
      OverallRank.STAFF_SERGEANT,
      OverallRank.SERGEANT_FIRST_CLASS,
      OverallRank.MASTER_SERGEANT,
      OverallRank.FIRST_SERGEANT,
      OverallRank.SERGEANT_MAJOR,
      OverallRank.COMMAND_SERGEANT_MAJOR,
    ]
    const userRankIndex = rankOrder.indexOf(userRank)
    const requiredRankIndex = rankOrder.indexOf(moduleRequiredRank)
    if (userRankIndex < requiredRankIndex) {
      return false
    }
  }

  // Check completed tasks requirement
  if (moduleRequiredTasks !== null && completedTasksCount < moduleRequiredTasks) {
    return false
  }

  return true
}

/**
 * Determine task status based on prerequisites
 */
export function calculateTaskStatus(
  previousTaskCompleted: boolean,
  moduleUnlocked: boolean
): TaskStatus {
  if (!moduleUnlocked) {
    return TaskStatus.LOCKED
  }
  if (!previousTaskCompleted) {
    return TaskStatus.LOCKED
  }
  return TaskStatus.AVAILABLE
}

