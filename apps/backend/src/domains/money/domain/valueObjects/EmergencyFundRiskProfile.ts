/**
 * EmergencyFundRiskProfile Value Object
 * 
 * Represents risk factors that determine emergency fund coverage duration.
 */
export enum EmploymentType {
  SALARIED = 'SALARIED',
  SELF_EMPLOYED = 'SELF_EMPLOYED',
  CONTRACTOR = 'CONTRACTOR',
  RETIRED = 'RETIRED',
}

export enum JobSecurity {
  STABLE = 'STABLE',
  MODERATE = 'MODERATE',
  VOLATILE = 'VOLATILE',
}

export enum RiskTolerance {
  CONSERVATIVE = 'CONSERVATIVE',
  BALANCED = 'BALANCED',
  AGGRESSIVE = 'AGGRESSIVE',
}

export enum IncomeStructure {
  SINGLE_INCOME = 'SINGLE_INCOME',
  DUAL_INCOME = 'DUAL_INCOME',
  MULTIPLE_INCOME = 'MULTIPLE_INCOME',
}

export interface RiskProfileInput {
  employmentType: EmploymentType
  jobSecurity: JobSecurity
  incomeStructure: IncomeStructure
  numberOfDependents: number
  isSoleEarner: boolean
  riskTolerance: RiskTolerance
  numberOfIncomeSources: number
}

export class EmergencyFundRiskProfile {
  private constructor(private input: RiskProfileInput) {}

  static create(input: RiskProfileInput): EmergencyFundRiskProfile {
    if (input.numberOfDependents < 0) {
      throw new Error('Number of dependents cannot be negative')
    }
    if (input.numberOfIncomeSources < 1) {
      throw new Error('Must have at least one income source')
    }
    return new EmergencyFundRiskProfile(input)
  }

  /**
   * Calculate recommended coverage duration in months
   * Based on risk factors, not hardcoded rules
   */
  calculateCoverageMonths(): number {
    let baseMonths = 3 // Starting point

    // Employment type adjustments
    switch (this.input.employmentType) {
      case EmploymentType.SALARIED:
        baseMonths = 3
        break
      case EmploymentType.CONTRACTOR:
        baseMonths = 6
        break
      case EmploymentType.SELF_EMPLOYED:
        baseMonths = 9
        break
      case EmploymentType.RETIRED:
        baseMonths = 12 // Retirees need more buffer
        break
    }

    // Job security adjustments
    switch (this.input.jobSecurity) {
      case JobSecurity.STABLE:
        // No adjustment
        break
      case JobSecurity.MODERATE:
        baseMonths += 1
        break
      case JobSecurity.VOLATILE:
        baseMonths += 3
        break
    }

    // Income structure adjustments
    if (this.input.incomeStructure === IncomeStructure.SINGLE_INCOME) {
      baseMonths += 3 // Single income needs more buffer
    } else if (this.input.incomeStructure === IncomeStructure.DUAL_INCOME) {
      // Dual income provides natural diversification
      baseMonths = Math.max(3, baseMonths - 1)
    } else if (this.input.incomeStructure === IncomeStructure.MULTIPLE_INCOME) {
      // Multiple income sources provide even more stability
      baseMonths = Math.max(3, baseMonths - 2)
    }

    // Sole earner penalty
    if (this.input.isSoleEarner && this.input.numberOfDependents > 0) {
      baseMonths += 2 // Sole earner with dependents needs significant buffer
    }

    // Risk tolerance adjustment
    switch (this.input.riskTolerance) {
      case RiskTolerance.CONSERVATIVE:
        baseMonths += 2 // Prefer more safety
        break
      case RiskTolerance.BALANCED:
        // No adjustment
        break
      case RiskTolerance.AGGRESSIVE:
        baseMonths = Math.max(3, baseMonths - 1) // Willing to take more risk
        break
    }

    // Number of income sources (beyond structure)
    if (this.input.numberOfIncomeSources >= 3) {
      baseMonths = Math.max(3, baseMonths - 1) // Multiple sources provide stability
    }

    // Clamp between 3 and 24 months
    return Math.max(3, Math.min(24, baseMonths))
  }

  /**
   * Get explanation of why this coverage duration was chosen
   */
  getCoverageExplanation(): string {
    const months = this.calculateCoverageMonths()
    const reasons: string[] = []

    reasons.push(`Your recommended coverage is ${months} months based on:`)

    // Employment type reasoning
    switch (this.input.employmentType) {
      case EmploymentType.SALARIED:
        reasons.push(`• Stable salaried employment provides predictable income`)
        break
      case EmploymentType.CONTRACTOR:
        reasons.push(`• Contract work has variable income patterns requiring more buffer`)
        break
      case EmploymentType.SELF_EMPLOYED:
        reasons.push(`• Self-employment income can be irregular, necessitating extended coverage`)
        break
      case EmploymentType.RETIRED:
        reasons.push(`• Retirees need larger buffers due to fixed income`)
        break
    }

    // Job security reasoning
    if (this.input.jobSecurity === JobSecurity.VOLATILE) {
      reasons.push(`• Volatile job security increases financial risk`)
    }

    // Income structure reasoning
    if (this.input.incomeStructure === IncomeStructure.SINGLE_INCOME) {
      reasons.push(`• Single income household needs larger emergency buffer`)
    } else if (this.input.incomeStructure === IncomeStructure.DUAL_INCOME) {
      reasons.push(`• Dual income provides natural diversification, allowing lower coverage`)
    }

    // Dependents reasoning
    if (this.input.numberOfDependents > 0) {
      if (this.input.isSoleEarner) {
        reasons.push(`• Sole earner with ${this.input.numberOfDependents} dependent(s) requires significant safety buffer`)
      } else {
        reasons.push(`• ${this.input.numberOfDependents} dependent(s) increases financial obligations`)
      }
    }

    // Risk tolerance reasoning
    if (this.input.riskTolerance === RiskTolerance.CONSERVATIVE) {
      reasons.push(`• Conservative risk tolerance prioritizes safety`)
    } else if (this.input.riskTolerance === RiskTolerance.AGGRESSIVE) {
      reasons.push(`• Aggressive risk tolerance allows for lower coverage`)
    }

    return reasons.join('\n')
  }

  /**
   * Get risks this coverage protects against
   */
  getProtectedRisks(): string[] {
    const risks: string[] = ['Job loss or income interruption']

    if (this.input.employmentType === EmploymentType.SELF_EMPLOYED || 
        this.input.employmentType === EmploymentType.CONTRACTOR) {
      risks.push('Irregular income patterns')
      risks.push('Client loss or contract termination')
    }

    if (this.input.jobSecurity === JobSecurity.VOLATILE) {
      risks.push('Industry downturn or layoffs')
    }

    risks.push('Unexpected medical expenses')
    risks.push('Major home or vehicle repairs')
    risks.push('Family emergencies')

    return risks
  }

  /**
   * Get what this coverage does NOT protect against
   */
  getUnprotectedRisks(): string[] {
    return [
      'Long-term disability (separate insurance needed)',
      'Major lifestyle expenses (vacations, upgrades)',
      'Investment opportunities',
      'Large planned expenses',
    ]
  }
}


