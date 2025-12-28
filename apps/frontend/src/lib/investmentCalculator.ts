// Frontend investment calculation utilities
// Step 8: PREVIEW ONLY - This function is for UI preview purposes only
// Actual XP calculations are performed by the backend with all mechanics applied
// (Capacity modifiers, burnout penalties, over-optimisation penalties, etc.)
// Do not use this for actual game state - only for UI preview display

import { InvestmentType, CategoryXP } from '../types'

/**
 * Calculate XP reward preview for making an investment (UI preview only)
 * Actual XP is computed by backend with all mechanics
 */
export function calculateInvestmentXP(
  investmentType: InvestmentType,
  amount: number
): { overall: number; category: CategoryXP } {
  // Base XP scales with investment amount (logarithmic scale)
  const baseXP = Math.floor(10 * Math.log10(Math.max(amount / 10, 1)) + 10)
  
  let categoryXP: CategoryXP = {
    capacity: 0,
    engines: 0,
    oxygen: 0,
    meaning: 0,
    optionality: 0,
  }

  switch (investmentType) {
    case InvestmentType.CRYPTO:
      categoryXP = {
        capacity: Math.round(baseXP * 0.1),
        engines: Math.round(baseXP * 0.5),
        oxygen: Math.round(baseXP * 0.1),
        meaning: Math.round(baseXP * 0.05),
        optionality: Math.round(baseXP * 0.25),
      }
      break

    case InvestmentType.STOCKS:
      categoryXP = {
        capacity: Math.round(baseXP * 0.15),
        engines: Math.round(baseXP * 0.45),
        oxygen: Math.round(baseXP * 0.25),
        meaning: Math.round(baseXP * 0.05),
        optionality: Math.round(baseXP * 0.1),
      }
      break

    case InvestmentType.CASH:
      categoryXP = {
        capacity: Math.round(baseXP * 0.2),
        engines: Math.round(baseXP * 0.1),
        oxygen: Math.round(baseXP * 0.5),
        meaning: Math.round(baseXP * 0.1),
        optionality: Math.round(baseXP * 0.1),
      }
      break

    case InvestmentType.HIGH_YIELD_SAVINGS:
      categoryXP = {
        capacity: Math.round(baseXP * 0.15),
        engines: Math.round(baseXP * 0.3),
        oxygen: Math.round(baseXP * 0.4),
        meaning: Math.round(baseXP * 0.05),
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

