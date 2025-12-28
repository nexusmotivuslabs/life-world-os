import { InvestmentType, CategoryXP } from '../types'

/**
 * Calculate XP reward for making an investment
 * Based on investment type and amount
 */
export function calculateInvestmentXP(
  investmentType: InvestmentType,
  amount: number
): { overall: number; category: CategoryXP } {
  // Base XP scales with investment amount (logarithmic scale)
  // $100 = 10 XP, $1000 = 50 XP, $10000 = 150 XP
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
      // Crypto: High risk/reward, mainly Engines and Optionality
      categoryXP = {
        capacity: Math.round(baseXP * 0.1),
        engines: Math.round(baseXP * 0.5), // Main focus
        oxygen: Math.round(baseXP * 0.1),
        meaning: Math.round(baseXP * 0.05),
        optionality: Math.round(baseXP * 0.25), // High optionality
      }
      break

    case InvestmentType.STOCKS:
      // Stocks: Balanced growth, Engines and Oxygen
      categoryXP = {
        capacity: Math.round(baseXP * 0.15),
        engines: Math.round(baseXP * 0.45), // Main focus
        oxygen: Math.round(baseXP * 0.25), // Wealth building
        meaning: Math.round(baseXP * 0.05),
        optionality: Math.round(baseXP * 0.1),
      }
      break

    case InvestmentType.CASH:
      // Cash: Safety and liquidity, mainly Oxygen
      categoryXP = {
        capacity: Math.round(baseXP * 0.2),
        engines: Math.round(baseXP * 0.1),
        oxygen: Math.round(baseXP * 0.5), // Main focus - security
        meaning: Math.round(baseXP * 0.1),
        optionality: Math.round(baseXP * 0.1),
      }
      break

    case InvestmentType.HIGH_YIELD_SAVINGS:
      // High-Yield Savings: Safe growth, Oxygen and Engines
      categoryXP = {
        capacity: Math.round(baseXP * 0.15),
        engines: Math.round(baseXP * 0.3), // Passive income engine
        oxygen: Math.round(baseXP * 0.4), // Main focus - security with growth
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

/**
 * Calculate expected annual yield for investment type
 */
export function getDefaultYield(investmentType: InvestmentType): number {
  switch (investmentType) {
    case InvestmentType.CRYPTO:
      return 0 // Highly volatile, no fixed yield
    case InvestmentType.STOCKS:
      return 7.0 // Historical S&P 500 average
    case InvestmentType.CASH:
      return 0 // No yield on cash
    case InvestmentType.HIGH_YIELD_SAVINGS:
      return 4.5 // Current high-yield savings rate
    default:
      return 0
  }
}

/**
 * Calculate periodic growth (monthly) for an investment
 */
export function calculateMonthlyGrowth(
  amount: number,
  annualYield: number
): number {
  // Monthly compound growth: (1 + annualYield/100)^(1/12) - 1
  const monthlyRate = Math.pow(1 + annualYield / 100, 1 / 12) - 1
  return amount * monthlyRate
}

/**
 * Get recommended allocation percentages by investment type
 */
export function getRecommendedAllocation(): Record<InvestmentType, number> {
  return {
    [InvestmentType.CASH]: 5, // 5% cash for emergencies
    [InvestmentType.HIGH_YIELD_SAVINGS]: 20, // 20% high-yield savings
    [InvestmentType.STOCKS]: 60, // 60% stocks for growth
    [InvestmentType.CRYPTO]: 15, // 15% crypto for optionality
  }
}


