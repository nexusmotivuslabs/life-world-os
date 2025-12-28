/**
 * PortfolioAnalyzerService
 * 
 * Domain service for portfolio analysis business logic.
 * Pure business logic - no infrastructure dependencies.
 */

import { Money } from '../valueObjects/Money.js'

export interface PortfolioHolding {
  id: string
  name: string
  type: string
  amount: number
  currentValue: number
  expectedYield: number
}

export interface PortfolioAnalysis {
  totalValue: Money
  totalInvested: Money
  totalReturn: Money
  totalReturnPercent: number
  expectedAnnualIncome: Money
  allocation: Array<{
    type: string
    amount: Money
    percentage: number
  }>
  performance: {
    bestPerformer: PortfolioHolding | null
    worstPerformer: PortfolioHolding | null
    averageYield: number
  }
}

export class PortfolioAnalyzerService {
  /**
   * Analyze portfolio
   */
  analyzePortfolio(holdings: PortfolioHolding[]): PortfolioAnalysis {
    if (holdings.length === 0) {
      return {
        totalValue: Money.create(0),
        totalInvested: Money.create(0),
        totalReturn: Money.create(0),
        totalReturnPercent: 0,
        expectedAnnualIncome: Money.create(0),
        allocation: [],
        performance: {
          bestPerformer: null,
          worstPerformer: null,
          averageYield: 0,
        },
      }
    }

    // Calculate totals
    const totalInvested = holdings.reduce(
      (sum, h) => sum + h.amount,
      0
    )
    const totalValue = holdings.reduce(
      (sum, h) => sum + h.currentValue,
      0
    )
    const totalReturn = totalValue - totalInvested
    const totalReturnPercent = totalInvested > 0
      ? (totalReturn / totalInvested) * 100
      : 0

    // Calculate expected annual income
    const expectedAnnualIncome = holdings.reduce(
      (sum, h) => sum + (h.currentValue * h.expectedYield / 100),
      0
    )

    // Calculate allocation by type
    const typeMap = new Map<string, number>()
    holdings.forEach(h => {
      const current = typeMap.get(h.type) || 0
      typeMap.set(h.type, current + h.currentValue)
    })

    const allocation = Array.from(typeMap.entries()).map(([type, amount]) => ({
      type,
      amount: Money.create(amount),
      percentage: (amount / totalValue) * 100,
    }))

    // Calculate performance
    const returns = holdings.map(h => ({
      holding: h,
      return: h.currentValue - h.amount,
      returnPercent: h.amount > 0 ? ((h.currentValue - h.amount) / h.amount) * 100 : 0,
    }))

    const bestPerformer = returns.reduce((best, current) =>
      current.returnPercent > (best?.returnPercent || -Infinity) ? current : best
    , null as { holding: PortfolioHolding; return: number; returnPercent: number } | null)

    const worstPerformer = returns.reduce((worst, current) =>
      current.returnPercent < (worst?.returnPercent || Infinity) ? current : worst
    , null as { holding: PortfolioHolding; return: number; returnPercent: number } | null)

    const averageYield = holdings.reduce((sum, h) => sum + h.expectedYield, 0) / holdings.length

    return {
      totalValue: Money.create(totalValue),
      totalInvested: Money.create(totalInvested),
      totalReturn: Money.create(totalReturn),
      totalReturnPercent,
      expectedAnnualIncome: Money.create(expectedAnnualIncome),
      allocation,
      performance: {
        bestPerformer: bestPerformer?.holding ?? null,
        worstPerformer: worstPerformer?.holding ?? null,
        averageYield,
      },
    }
  }

  /**
   * Calculate portfolio health score (0-100)
   */
  calculateHealthScore(holdings: PortfolioHolding[]): number {
    if (holdings.length === 0) return 0

    const analysis = this.analyzePortfolio(holdings)
    let score = 50 // Base score

    // Diversification bonus (more types = better)
    const uniqueTypes = new Set(holdings.map(h => h.type)).size
    score += Math.min(uniqueTypes * 5, 20) // Up to +20 for diversification

    // Performance bonus
    if (analysis.totalReturnPercent > 0) {
      score += Math.min(analysis.totalReturnPercent, 20) // Up to +20 for positive returns
    } else {
      score -= Math.min(Math.abs(analysis.totalReturnPercent), 20) // Penalty for losses
    }

    // Yield bonus
    if (analysis.performance.averageYield > 0) {
      score += Math.min(analysis.performance.averageYield, 10) // Up to +10 for yield
    }

    return Math.max(0, Math.min(100, Math.round(score)))
  }

  /**
   * Recommend rebalancing
   */
  recommendRebalancing(
    holdings: PortfolioHolding[],
    targetAllocation: Record<string, number> // type -> target percentage
  ): Array<{
    type: string
    currentPercent: number
    targetPercent: number
    adjustment: Money
    action: 'buy' | 'sell'
  }> {
    const analysis = this.analyzePortfolio(holdings)
    const recommendations: Array<{
      type: string
      currentPercent: number
      targetPercent: number
      adjustment: Money
      action: 'buy' | 'sell'
    }> = []

    for (const [type, targetPercent] of Object.entries(targetAllocation)) {
      const currentAllocation = analysis.allocation.find(a => a.type === type)
      const currentPercent = currentAllocation?.percentage || 0

      if (Math.abs(currentPercent - targetPercent) > 5) { // 5% threshold
        const targetAmount = analysis.totalValue.multiply(targetPercent / 100)
        const currentAmount = currentAllocation?.amount || Money.create(0)
        const adjustment = targetAmount.subtract(currentAmount)

        recommendations.push({
          type,
          currentPercent,
          targetPercent,
          adjustment,
          action: adjustment.isPositive() ? 'buy' : 'sell',
        })
      }
    }

    return recommendations
  }
}


