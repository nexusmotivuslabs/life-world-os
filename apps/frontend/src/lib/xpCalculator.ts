// Frontend XP calculation utilities
// Step 8: PREVIEW ONLY - This function is for UI preview purposes only
// Actual XP calculations are performed by the backend with all mechanics applied
// (Capacity modifiers, burnout penalties, over-optimisation penalties, etc.)
// Do not use this for actual game state - only for UI preview display

import { ActivityType, Season, CategoryXP } from '../types'

// Base XP values (matching backend)
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

const SEASON_MULTIPLIERS: Record<Season, number> = {
  [Season.SPRING]: 1.2,
  [Season.SUMMER]: 1.3,
  [Season.AUTUMN]: 1.2,
  [Season.WINTER]: 1.1,
}

export function calculateXP(
  activityType: ActivityType,
  season: Season,
  customXP?: { overall?: number; category?: Partial<CategoryXP> }
) {
  const baseXP = ACTIVITY_XP[activityType]
  const multiplier = SEASON_MULTIPLIERS[season]

  const overallXP = customXP?.overall ?? baseXP.overall
  const categoryXP: CategoryXP = {
    capacity: customXP?.category?.capacity ?? baseXP.category.capacity,
    engines: customXP?.category?.engines ?? baseXP.category.engines,
    oxygen: customXP?.category?.oxygen ?? baseXP.category.oxygen,
    meaning: customXP?.category?.meaning ?? baseXP.category.meaning,
    optionality: customXP?.category?.optionality ?? baseXP.category.optionality,
  }

  return {
    overallXP: Math.round(overallXP * multiplier),
    categoryXP: {
      capacity: Math.round(categoryXP.capacity * multiplier),
      engines: Math.round(categoryXP.engines * multiplier),
      oxygen: Math.round(categoryXP.oxygen * multiplier),
      meaning: Math.round(categoryXP.meaning * multiplier),
      optionality: Math.round(categoryXP.optionality * multiplier),
    },
    seasonMultiplier: multiplier,
  }
}

