/**
 * PillarComparisonService
 * 
 * Service to generate canonical comparison tables and analysis
 * for the six money system pillars.
 */

import { MoneyPillar } from '../entities/MoneyPillar'
import { PillarRole } from '../valueObjects/PillarRole'
import {
  CashflowLevel,
  VolatilityLevel,
  InflationProtectionLevel,
} from '../valueObjects/PillarRole'

export interface PillarComparisonRow {
  pillar: string
  primaryJob: string
  cashflow: CashflowLevel
  volatility: VolatilityLevel
  inflationProtection: InflationProtectionLevel
  mentalModel: string
}

export interface TradeOffAnalysis {
  pillar: string
  improves: string[]
  degrades: string[]
}

export class PillarComparisonService {
  /**
   * Generate canonical comparison table
   * This is the spine of the money system - users can orient themselves instantly
   */
  static generateComparisonTable(pillars: MoneyPillar[]): PillarComparisonRow[] {
    if (pillars.length === 0) {
      throw new Error('At least one pillar is required for comparison')
    }

    return pillars.map((pillar) => ({
      pillar: pillar.name,
      primaryJob: pillar.role.primaryJob,
      cashflow: pillar.role.cashflow,
      volatility: pillar.role.volatility,
      inflationProtection: pillar.role.inflationProtection,
      mentalModel: pillar.mentalModel,
    }))
  }

  /**
   * Generate trade-off analysis for each pillar
   * Shows what improves and what degrades when using each pillar
   */
  static generateTradeOffAnalysis(pillars: MoneyPillar[]): TradeOffAnalysis[] {
    return pillars.map((pillar) => {
      const improves: string[] = []
      const degrades: string[] = []

      // Analyze based on role characteristics
      if (pillar.role.cashflow === CashflowLevel.HIGH) {
        improves.push('Predictable income')
        improves.push('Cash flow stability')
      } else if (pillar.role.cashflow === CashflowLevel.NONE) {
        degrades.push('Immediate cash flow')
      }

      if (pillar.role.volatility === VolatilityLevel.HIGH) {
        improves.push('Growth potential')
        improves.push('Capital expansion')
        degrades.push('Price stability')
        degrades.push('Predictability')
      } else if (pillar.role.volatility === VolatilityLevel.LOW) {
        improves.push('Price stability')
        improves.push('Predictability')
        degrades.push('Growth potential')
      }

      if (pillar.role.inflationProtection === InflationProtectionLevel.HIGH) {
        improves.push('Purchasing power preservation')
        improves.push('Inflation resistance')
      } else if (pillar.role.inflationProtection === InflationProtectionLevel.LOW) {
        degrades.push('Inflation protection')
        degrades.push('Purchasing power')
      }

      return {
        pillar: pillar.name,
        improves,
        degrades,
      }
    })
  }

  /**
   * Get decision rules for all pillars
   * Simple rules that make the system actionable
   */
  static getDecisionRules(pillars: MoneyPillar[]): Record<string, string[]> {
    const rules: Record<string, string[]> = {}

    pillars.forEach((pillar) => {
      rules[pillar.name] = pillar.decisionRules
    })

    return rules
  }

  /**
   * Compare pillars side-by-side for a specific need
   */
  static compareForNeed(
    pillars: MoneyPillar[],
    need: 'cashflow' | 'growth' | 'inflation_protection' | 'stability'
  ): MoneyPillar[] {
    return pillars
      .filter((pillar) => pillar.isSuitableFor(need))
      .sort((a, b) => {
        // Sort by suitability score
        const scoreA = this.getSuitabilityScore(a, need)
        const scoreB = this.getSuitabilityScore(b, need)
        return scoreB - scoreA
      })
  }

  /**
   * Get suitability score for a pillar based on need
   */
  private static getSuitabilityScore(
    pillar: MoneyPillar,
    need: 'cashflow' | 'growth' | 'inflation_protection' | 'stability'
  ): number {
    let score = 0

    switch (need) {
      case 'cashflow':
        if (pillar.role.cashflow === CashflowLevel.HIGH) score += 3
        else if (pillar.role.cashflow === CashflowLevel.MEDIUM) score += 2
        else if (pillar.role.cashflow === CashflowLevel.LOW) score += 1
        break
      case 'growth':
        if (pillar.role.volatility === VolatilityLevel.HIGH) score += 3
        else if (pillar.role.volatility === VolatilityLevel.MEDIUM) score += 2
        else if (pillar.role.volatility === VolatilityLevel.LOW) score += 1
        break
      case 'inflation_protection':
        if (pillar.role.inflationProtection === InflationProtectionLevel.HIGH) score += 3
        else if (pillar.role.inflationProtection === InflationProtectionLevel.MEDIUM) score += 2
        else if (pillar.role.inflationProtection === InflationProtectionLevel.LOW) score += 1
        break
      case 'stability':
        if (pillar.role.volatility === VolatilityLevel.LOW) score += 3
        else if (pillar.role.volatility === VolatilityLevel.MEDIUM) score += 1
        break
    }

    return score
  }

  /**
   * Get canonical map summary
   * Returns the complete canonical presentation format
   */
  static getCanonicalMap(pillars: MoneyPillar[]): {
    comparisonTable: PillarComparisonRow[]
    tradeOffs: TradeOffAnalysis[]
    decisionRules: Record<string, string[]>
  } {
    return {
      comparisonTable: this.generateComparisonTable(pillars),
      tradeOffs: this.generateTradeOffAnalysis(pillars),
      decisionRules: this.getDecisionRules(pillars),
    }
  }
}





