import { CategoryXP, BalanceIndicator } from '../types'
import { calculateCategoryLevel } from './rankService'

/**
 * Calculate balance indicator across all 5 categories
 */
export function calculateBalance(categoryXP: CategoryXP): BalanceIndicator {
  const levels = {
    capacity: calculateCategoryLevel(categoryXP.capacity),
    engines: calculateCategoryLevel(categoryXP.engines),
    oxygen: calculateCategoryLevel(categoryXP.oxygen),
    meaning: calculateCategoryLevel(categoryXP.meaning),
    optionality: calculateCategoryLevel(categoryXP.optionality),
  }

  const levelValues = Object.values(levels)
  const averageLevel = levelValues.reduce((sum, level) => sum + level, 0) / levelValues.length

  // Check for imbalance (>10 level difference from average)
  const imbalanceThreshold = 10
  const warnings: string[] = []
  const recommendations: string[] = []

  if (levels.capacity < averageLevel - imbalanceThreshold) {
    warnings.push('Capacity level is significantly below average')
    recommendations.push('Focus on health, energy, and resilience activities')
  }
  if (levels.engines < averageLevel - imbalanceThreshold) {
    warnings.push('Engines level is significantly below average')
    recommendations.push('Focus on income generation and career activities')
  }
  if (levels.oxygen < averageLevel - imbalanceThreshold) {
    warnings.push('Oxygen level is significantly below average')
    recommendations.push('Focus on financial stability and savings')
  }
  if (levels.meaning < averageLevel - imbalanceThreshold) {
    warnings.push('Meaning level is significantly below average')
    recommendations.push('Focus on values, purpose, and alignment activities')
  }
  if (levels.optionality < averageLevel - imbalanceThreshold) {
    warnings.push('Optionality level is significantly below average')
    recommendations.push('Focus on building assets, skills, and freedom')
  }

  const isBalanced = warnings.length === 0

  return {
    isBalanced,
    averageLevel: Math.round(averageLevel * 10) / 10,
    categoryLevels: levels,
    warnings,
    recommendations,
  }
}


