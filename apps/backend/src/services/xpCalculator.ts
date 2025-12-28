import { ActivityType, Season, CategoryXP, XPCalculation } from '../types'

// Base XP values for activities
const ACTIVITY_XP: Record<ActivityType, { overall: number; category: CategoryXP }> = {
  [ActivityType.WORK_PROJECT]: {
    overall: 500,
    category: {
      capacity: 100,
      engines: 300,
      oxygen: 50,
      meaning: 0,
      optionality: 0,
    },
  },
  [ActivityType.EXERCISE]: {
    overall: 200,
    category: {
      capacity: 250,
      engines: 0,
      oxygen: 0,
      meaning: 0,
      optionality: 50,
    },
  },
  [ActivityType.SAVE_EXPENSES]: {
    overall: 1000,
    category: {
      capacity: 0,
      engines: 200,
      oxygen: 500,
      meaning: 0,
      optionality: 300,
    },
  },
  [ActivityType.LEARNING]: {
    overall: 400,
    category: {
      capacity: 150,
      engines: 100,
      oxygen: 0,
      meaning: 0,
      optionality: 200,
    },
  },
  [ActivityType.SEASON_COMPLETION]: {
    overall: 1000,
    category: {
      capacity: 200,
      engines: 200,
      oxygen: 200,
      meaning: 200,
      optionality: 200,
    },
  },
  [ActivityType.MILESTONE]: {
    overall: 2000,
    category: {
      capacity: 500,
      engines: 500,
      oxygen: 500,
      meaning: 500,
      optionality: 500,
    },
  },
  [ActivityType.REST]: {
    overall: 0, // Recovery action - no XP granted
    category: {
      capacity: 0,
      engines: 0,
      oxygen: 0,
      meaning: 0,
      optionality: 0,
    },
  },
  [ActivityType.CUSTOM]: {
    overall: 0,
    category: {
      capacity: 0,
      engines: 0,
      oxygen: 0,
      meaning: 0,
      optionality: 0,
    },
  },
}

// Season multipliers
const SEASON_MULTIPLIERS: Record<Season, number> = {
  [Season.SPRING]: 1.2, // Learning/Planning activities
  [Season.SUMMER]: 1.3, // Work/Revenue activities
  [Season.AUTUMN]: 1.2, // Optimization/Teaching activities
  [Season.WINTER]: 1.1, // Rest/Reflection activities
}

/**
 * Calculate XP for an activity
 */
export function calculateXP(
  activityType: ActivityType,
  season: Season,
  customXP?: { overall?: number; category?: Partial<CategoryXP> }
): XPCalculation {
  const baseXP = ACTIVITY_XP[activityType]
  const multiplier = SEASON_MULTIPLIERS[season]

  // Use custom XP if provided, otherwise use base
  const overallXP = customXP?.overall ?? baseXP.overall
  const categoryXP: CategoryXP = {
    capacity: customXP?.category?.capacity ?? baseXP.category.capacity,
    engines: customXP?.category?.engines ?? baseXP.category.engines,
    oxygen: customXP?.category?.oxygen ?? baseXP.category.oxygen,
    meaning: customXP?.category?.meaning ?? baseXP.category.meaning,
    optionality: customXP?.category?.optionality ?? baseXP.category.optionality,
  }

  // Apply season multiplier
  const finalOverallXP = Math.round(overallXP * multiplier)
  const finalCategoryXP: CategoryXP = {
    capacity: Math.round(categoryXP.capacity * multiplier),
    engines: Math.round(categoryXP.engines * multiplier),
    oxygen: Math.round(categoryXP.oxygen * multiplier),
    meaning: Math.round(categoryXP.meaning * multiplier),
    optionality: Math.round(categoryXP.optionality * multiplier),
  }

  return {
    overallXP: finalOverallXP,
    categoryXP: finalCategoryXP,
    seasonMultiplier: multiplier,
  }
}

