/**
 * CalculateEmergencyFundWithRiskProfileUseCase
 * 
 * Enhanced emergency fund calculation that acts as a decision clarifier.
 * Answers: How much safety? What risks? How fast to safety?
 */
import { EmergencyFundRiskProfile } from '../../domain/valueObjects/EmergencyFundRiskProfile.js'
export { EmploymentType, JobSecurity, RiskTolerance, IncomeStructure } from '../../domain/valueObjects/EmergencyFundRiskProfile.js'

export interface EmergencyFundCalculationInput {
  // Risk Profile
  employmentType: EmploymentType
  jobSecurity: JobSecurity
  incomeStructure: IncomeStructure
  numberOfDependents: number
  isSoleEarner: boolean
  riskTolerance: RiskTolerance
  numberOfIncomeSources: number
  
  // Essential Expenses (survival burn rate only)
  monthlyEssentialExpenses: number
  
  // Current Position
  currentEmergencySavings: number
  liquidityType: 'INSTANT' | 'DELAYED' | 'MIXED'
}

export interface EmergencyFundCalculationResult {
  // Core Outputs
  targetAmount: number
  recommendedMonthsCoverage: number
  currentCoverageMonths: number
  shortfall: number
  surplus: number
  
  // Guidance Layer
  coverageExplanation: string
  protectedRisks: string[]
  unprotectedRisks: string[]
  whyThisTarget: string
  
  // Action Plan
  recommendedMonthlyContribution?: number
  estimatedMonthsToTarget?: number
}

export class CalculateEmergencyFundWithRiskProfileUseCase {
  /**
   * Calculate emergency fund as a decision clarifier
   */
  async execute(input: EmergencyFundCalculationInput): Promise<EmergencyFundCalculationResult> {
    // Step 1: Determine coverage duration based on risk profile
    const riskProfile = EmergencyFundRiskProfile.create({
      employmentType: input.employmentType,
      jobSecurity: input.jobSecurity,
      incomeStructure: input.incomeStructure,
      numberOfDependents: input.numberOfDependents,
      isSoleEarner: input.isSoleEarner,
      riskTolerance: input.riskTolerance,
      numberOfIncomeSources: input.numberOfIncomeSources,
    })

    const recommendedMonths = riskProfile.calculateCoverageMonths()
    
    // Step 2: Calculate target amount
    const targetAmount = input.monthlyEssentialExpenses * recommendedMonths
    
    // Step 3: Gap analysis
    const currentCoverageMonths = input.monthlyEssentialExpenses > 0
      ? input.currentEmergencySavings / input.monthlyEssentialExpenses
      : 0
    
    const shortfall = Math.max(0, targetAmount - input.currentEmergencySavings)
    const surplus = Math.max(0, input.currentEmergencySavings - targetAmount)
    
    // Step 4: Generate guidance
    const coverageExplanation = riskProfile.getCoverageExplanation()
    const protectedRisks = riskProfile.getProtectedRisks()
    const unprotectedRisks = riskProfile.getUnprotectedRisks()
    
    // Build "why this target" explanation
    const whyThisTarget = this.buildWhyThisTargetExplanation(
      recommendedMonths,
      targetAmount,
      input.monthlyEssentialExpenses,
      riskProfile
    )
    
    return {
      targetAmount,
      recommendedMonthsCoverage: recommendedMonths,
      currentCoverageMonths,
      shortfall,
      surplus,
      coverageExplanation,
      protectedRisks,
      unprotectedRisks,
      whyThisTarget,
    }
  }

  /**
   * Calculate action plan (optional, can be calculated on frontend)
   */
  calculateActionPlan(
    targetAmount: number,
    currentAmount: number,
    monthlySurplus?: number
  ): { recommendedMonthlyContribution: number; estimatedMonthsToTarget: number } | null {
    if (!monthlySurplus || monthlySurplus <= 0) {
      return null
    }

    const shortfall = Math.max(0, targetAmount - currentAmount)
    if (shortfall === 0) {
      return null
    }

    // Recommend 20% of monthly surplus, or enough to reach target in 24 months, whichever is lower
    const recommendedMonthlyContribution = Math.min(
      monthlySurplus * 0.2, // 20% of surplus
      shortfall / 24, // Reach target in 24 months max
      monthlySurplus * 0.5 // Never more than 50% of surplus
    )

    const estimatedMonthsToTarget = Math.ceil(shortfall / recommendedMonthlyContribution)

    return {
      recommendedMonthlyContribution,
      estimatedMonthsToTarget,
    }
  }

  private buildWhyThisTargetExplanation(
    months: number,
    targetAmount: number,
    monthlyExpenses: number,
    riskProfile: EmergencyFundRiskProfile
  ): string {
    const parts: string[] = []
    
    parts.push(`Your emergency fund target is £${targetAmount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`)
    parts.push(`This provides ${months} months of essential expense coverage at £${monthlyExpenses.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} per month.`)
    parts.push('')
    parts.push('This amount gives you breathing room—not for investment, not for growth, but for clear thinking when life applies pressure.')
    parts.push('It is your financial oxygen.')
    
    return parts.join('\n')
  }
}

