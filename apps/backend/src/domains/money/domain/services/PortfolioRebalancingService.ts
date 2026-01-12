/**
 * PortfolioRebalancingService
 * 
 * Domain service for portfolio rebalancing business logic.
 * Pure business logic - no infrastructure dependencies.
 */

import { Money } from '../valueObjects/Money.js'
import { PortfolioHolding, PortfolioAnalyzerService } from './PortfolioAnalyzerService.js'

export interface RebalancingConfig {
  timeHorizonYears: number
  incomeStability: 'HIGH' | 'MEDIUM' | 'LOW'
  emotionalTolerance: 'LOW' | 'MEDIUM' | 'HIGH'
  decisionDiscipline: 'LOW' | 'MEDIUM' | 'HIGH'
  targetStocksPercent: number
  targetBondsPercent: number
  rebalancingFrequency: 'ANNUAL' | 'THRESHOLD_BASED'
  driftThreshold: number
  preferContributions: boolean
  bondPurpose: string[]
  lastRebalancedAt?: Date | null
}

export interface CurrentAllocation {
  stocksPercent: number
  bondsPercent: number
  stocksValue: Money
  bondsValue: Money
  totalValue: Money
}

export interface RebalancingRecommendation {
  assetClass: 'STOCKS' | 'BONDS'
  currentPercent: number
  targetPercent: number
  drift: number
  adjustment: Money
  action: 'buy' | 'sell' | 'contribute'
  priority: 'high' | 'medium' | 'low'
  preferredMethod: 'contribution' | 'sell' | 'both'
}

export interface RebalancingStatus {
  needsRebalancing: boolean
  currentAllocation: CurrentAllocation
  targetAllocation: {
    stocksPercent: number
    bondsPercent: number
  }
  drift: {
    stocks: number
    bonds: number
  }
  recommendations: RebalancingRecommendation[]
  canUseContributions: boolean
  availableContributionAmount?: Money
}

export class PortfolioRebalancingService {
  private portfolioAnalyzer: PortfolioAnalyzerService

  constructor() {
    this.portfolioAnalyzer = new PortfolioAnalyzerService()
  }

  /**
   * Calculate recommended allocation based on user profile
   */
  calculateRecommendedAllocation(
    timeHorizonYears: number,
    incomeStability: 'HIGH' | 'MEDIUM' | 'LOW',
    emotionalTolerance: 'LOW' | 'MEDIUM' | 'HIGH',
    decisionDiscipline: 'LOW' | 'MEDIUM' | 'HIGH'
  ): { stocksPercent: number; bondsPercent: number } {
    // Base allocation on time horizon
    let stocksPercent = Math.min(100, Math.max(0, 100 - timeHorizonYears))
    
    // Adjust based on income stability
    if (incomeStability === 'HIGH') {
      stocksPercent += 10
    } else if (incomeStability === 'LOW') {
      stocksPercent -= 10
    }

    // Adjust based on emotional tolerance
    if (emotionalTolerance === 'HIGH') {
      stocksPercent += 10
    } else if (emotionalTolerance === 'LOW') {
      stocksPercent -= 15
    }

    // Adjust based on decision discipline
    if (decisionDiscipline === 'HIGH') {
      stocksPercent += 5
    } else if (decisionDiscipline === 'LOW') {
      stocksPercent -= 10
    }

    // Clamp to reasonable bounds
    stocksPercent = Math.max(20, Math.min(90, stocksPercent))
    const bondsPercent = 100 - stocksPercent

    return { stocksPercent, bondsPercent }
  }

  /**
   * Calculate current allocation from holdings
   * Maps: STOCKS -> stocks, HIGH_YIELD_SAVINGS + CASH -> bonds
   */
  calculateCurrentAllocation(holdings: PortfolioHolding[]): CurrentAllocation {
    const analysis = this.portfolioAnalyzer.analyzePortfolio(holdings)
    const totalValue = analysis.totalValue.toNumber()

    if (totalValue === 0) {
      return {
        stocksPercent: 0,
        bondsPercent: 0,
        stocksValue: Money.create(0),
        bondsValue: Money.create(0),
        totalValue: Money.create(0),
      }
    }

    // Calculate stocks (STOCKS investment type)
    const stocksAllocation = analysis.allocation.find(a => a.type === 'STOCKS')
    const stocksValue = stocksAllocation?.amount || Money.create(0)
    const stocksPercent = (stocksValue.toNumber() / totalValue) * 100

    // Calculate bonds (HIGH_YIELD_SAVINGS + CASH combined)
    const highYieldAllocation = analysis.allocation.find(a => a.type === 'HIGH_YIELD_SAVINGS')
    const cashAllocation = analysis.allocation.find(a => a.type === 'CASH')
    
    const highYieldValue = highYieldAllocation?.amount || Money.create(0)
    const cashValue = cashAllocation?.amount || Money.create(0)
    const bondsValue = highYieldValue.add(cashValue)
    const bondsPercent = (bondsValue.toNumber() / totalValue) * 100

    return {
      stocksPercent,
      bondsPercent,
      stocksValue,
      bondsValue,
      totalValue: analysis.totalValue,
    }
  }

  /**
   * Check if rebalancing is needed
   */
  checkRebalancingNeeded(
    currentAllocation: CurrentAllocation,
    targetStocksPercent: number,
    targetBondsPercent: number,
    driftThreshold: number,
    rebalancingFrequency: 'ANNUAL' | 'THRESHOLD_BASED',
    lastRebalancedAt?: Date | null
  ): boolean {
    // If threshold-based, check drift
    if (rebalancingFrequency === 'THRESHOLD_BASED') {
      const stocksDrift = Math.abs(currentAllocation.stocksPercent - targetStocksPercent)
      const bondsDrift = Math.abs(currentAllocation.bondsPercent - targetBondsPercent)
      
      return stocksDrift > driftThreshold || bondsDrift > driftThreshold
    }

    // If annual, check if it's been a year
    if (rebalancingFrequency === 'ANNUAL') {
      if (!lastRebalancedAt) {
        return true // Never rebalanced, should do it
      }
      
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      
      return lastRebalancedAt < oneYearAgo
    }

    return false
  }

  /**
   * Generate rebalancing plan with preference for contributions
   */
  generateRebalancingPlan(
    currentAllocation: CurrentAllocation,
    targetStocksPercent: number,
    targetBondsPercent: number,
    preferContributions: boolean,
    availableContributionAmount?: Money
  ): RebalancingRecommendation[] {
    const recommendations: RebalancingRecommendation[] = []
    const totalValue = currentAllocation.totalValue.toNumber()

    if (totalValue === 0) {
      return recommendations
    }

    // Calculate target values
    const targetStocksValue = currentAllocation.totalValue.multiply(targetStocksPercent / 100)
    const targetBondsValue = currentAllocation.totalValue.multiply(targetBondsPercent / 100)

    // Calculate adjustments needed
    const stocksAdjustment = targetStocksValue.subtract(currentAllocation.stocksValue)
    const bondsAdjustment = targetBondsValue.subtract(currentAllocation.bondsValue)

    // Calculate drift
    const stocksDrift = currentAllocation.stocksPercent - targetStocksPercent
    const bondsDrift = currentAllocation.bondsPercent - targetBondsPercent

    // Determine if we can use contributions
    const canUseContributions = preferContributions && availableContributionAmount && availableContributionAmount.isPositive()
    const contributionAmount = canUseContributions ? availableContributionAmount!.toNumber() : 0

    // Stocks recommendation
    if (Math.abs(stocksDrift) > 0.1) { // 0.1% minimum drift
      const needsBuy = stocksAdjustment.isPositive()
      const needsSell = stocksAdjustment.isNegative()
      
      let preferredMethod: 'contribution' | 'sell' | 'both' = 'both'
      let action: 'buy' | 'sell' | 'contribute' = needsBuy ? 'buy' : 'sell'
      
      if (needsBuy && canUseContributions) {
        // Prefer contributions for buying
        preferredMethod = 'contribution'
        action = 'contribute'
      } else if (needsSell && !canUseContributions) {
        // Must sell if no contributions available
        preferredMethod = 'sell'
      }

      const priority = Math.abs(stocksDrift) > 5 ? 'high' : Math.abs(stocksDrift) > 2 ? 'medium' : 'low'

      recommendations.push({
        assetClass: 'STOCKS',
        currentPercent: currentAllocation.stocksPercent,
        targetPercent: targetStocksPercent,
        drift: stocksDrift,
        adjustment: stocksAdjustment,
        action,
        priority,
        preferredMethod,
      })
    }

    // Bonds recommendation
    if (Math.abs(bondsDrift) > 0.1) { // 0.1% minimum drift
      const needsBuy = bondsAdjustment.isPositive()
      const needsSell = bondsAdjustment.isNegative()
      
      let preferredMethod: 'contribution' | 'sell' | 'both' = 'both'
      let action: 'buy' | 'sell' | 'contribute' = needsBuy ? 'buy' : 'sell'
      
      if (needsBuy && canUseContributions) {
        // Prefer contributions for buying
        preferredMethod = 'contribution'
        action = 'contribute'
      } else if (needsSell && !canUseContributions) {
        // Must sell if no contributions available
        preferredMethod = 'sell'
      }

      const priority = Math.abs(bondsDrift) > 5 ? 'high' : Math.abs(bondsDrift) > 2 ? 'medium' : 'low'

      recommendations.push({
        assetClass: 'BONDS',
        currentPercent: currentAllocation.bondsPercent,
        targetPercent: targetBondsPercent,
        drift: bondsDrift,
        adjustment: bondsAdjustment,
        action,
        priority,
        preferredMethod,
      })
    }

    return recommendations
  }

  /**
   * Get rebalancing status
   */
  getRebalancingStatus(
    holdings: PortfolioHolding[],
    config: RebalancingConfig,
    availableContributionAmount?: Money
  ): RebalancingStatus {
    const currentAllocation = this.calculateCurrentAllocation(holdings)
    const needsRebalancing = this.checkRebalancingNeeded(
      currentAllocation,
      config.targetStocksPercent,
      config.targetBondsPercent,
      config.driftThreshold,
      config.rebalancingFrequency,
      config.lastRebalancedAt
    )

    const recommendations = this.generateRebalancingPlan(
      currentAllocation,
      config.targetStocksPercent,
      config.targetBondsPercent,
      config.preferContributions,
      availableContributionAmount
    )

    return {
      needsRebalancing,
      currentAllocation,
      targetAllocation: {
        stocksPercent: config.targetStocksPercent,
        bondsPercent: config.targetBondsPercent,
      },
      drift: {
        stocks: currentAllocation.stocksPercent - config.targetStocksPercent,
        bonds: currentAllocation.bondsPercent - config.targetBondsPercent,
      },
      recommendations,
      canUseContributions: config.preferContributions && availableContributionAmount?.isPositive() === true,
      availableContributionAmount,
    }
  }
}





