/**
 * MoneyPillar Domain Entity
 * 
 * Represents one of the six canonical money system pillars.
 * Pure business logic entity - no infrastructure dependencies.
 */

import { PillarRole, CashflowLevel, VolatilityLevel, InflationProtectionLevel } from '../valueObjects/PillarRole'

export class MoneyPillar {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly role: PillarRole,
    public readonly mentalModel: string,
    public readonly failureModes: string[],
    public readonly decisionRules: string[]
  ) {
    // Validate mental model (single metaphor only)
    if (!mentalModel || mentalModel.trim().length === 0) {
      throw new Error('Mental model cannot be empty')
    }

    // Validate failure modes
    if (!Array.isArray(failureModes)) {
      throw new Error('Failure modes must be an array')
    }

    // Validate decision rules
    if (!Array.isArray(decisionRules)) {
      throw new Error('Decision rules must be an array')
    }

    if (decisionRules.length === 0) {
      throw new Error('At least one decision rule is required')
    }
  }

  /**
   * Create a new MoneyPillar entity
   */
  static create(
    id: string,
    name: string,
    role: PillarRole,
    mentalModel: string,
    failureModes: string[] = [],
    decisionRules: string[] = []
  ): MoneyPillar {
    if (!id || id.trim().length === 0) {
      throw new Error('Pillar ID cannot be empty')
    }

    if (!name || name.trim().length === 0) {
      throw new Error('Pillar name cannot be empty')
    }

    return new MoneyPillar(id, name, role, mentalModel, failureModes, decisionRules)
  }

  /**
   * Create MoneyPillar from persisted data
   */
  static fromPersistence(data: {
    id: string
    name: string
    role: {
      primaryJob: string
      cashflow: CashflowLevel
      volatility: VolatilityLevel
      inflationProtection: InflationProtectionLevel
    }
    mentalModel: string
    failureModes: string[]
    decisionRules: string[]
  }): MoneyPillar {
    const role = PillarRole.fromPersistence(data.role)

    return new MoneyPillar(
      data.id,
      data.name,
      role,
      data.mentalModel,
      data.failureModes,
      data.decisionRules
    )
  }

  /**
   * Get pillar summary for comparison table
   */
  getComparisonSummary(): {
    name: string
    primaryJob: string
    cashflow: CashflowLevel
    volatility: VolatilityLevel
    inflationProtection: InflationProtectionLevel
  } {
    return {
      name: this.name,
      primaryJob: this.role.primaryJob,
      cashflow: this.role.cashflow,
      volatility: this.role.volatility,
      inflationProtection: this.role.inflationProtection,
    }
  }

  /**
   * Check if pillar is suitable for a given need
   */
  isSuitableFor(need: 'cashflow' | 'growth' | 'inflation_protection' | 'stability'): boolean {
    switch (need) {
      case 'cashflow':
        return this.role.cashflow === CashflowLevel.HIGH || this.role.cashflow === CashflowLevel.MEDIUM
      case 'growth':
        return this.role.volatility === VolatilityLevel.HIGH || this.role.volatility === VolatilityLevel.MEDIUM
      case 'inflation_protection':
        return (
          this.role.inflationProtection === InflationProtectionLevel.HIGH ||
          this.role.inflationProtection === InflationProtectionLevel.MEDIUM
        )
      case 'stability':
        return this.role.volatility === VolatilityLevel.LOW
      default:
        return false
    }
  }
}


