/**
 * TaxCalculatorService
 * 
 * Domain service for tax calculation business logic.
 * Pure business logic - no infrastructure dependencies.
 */

import { TaxAmount, TaxBreakdown } from '../valueObjects/TaxAmount.js'
import { Money } from '../valueObjects/Money.js'

export class TaxCalculatorService {
  /**
   * Calculate tax for given income
   */
  calculateTax(
    grossIncome: number,
    deductions: number = 0,
    credits: number = 0,
    useStandardBrackets: boolean = true
  ): TaxAmount {
    const income = Money.create(grossIncome)
    const ded = Money.create(deductions)
    const cred = Money.create(credits)

    if (useStandardBrackets) {
      return TaxAmount.createStandard(income, ded, cred)
    } else {
      // Would use custom brackets - for now use standard
      return TaxAmount.createStandard(income, ded, cred)
    }
  }

  /**
   * Get tax breakdown with all details
   */
  getTaxBreakdown(
    grossIncome: number,
    deductions: number = 0,
    credits: number = 0
  ): TaxBreakdown {
    const taxAmount = this.calculateTax(grossIncome, deductions, credits)
    return taxAmount.getBreakdown()
  }

  /**
   * Calculate take-home pay
   */
  calculateTakeHome(
    grossIncome: number,
    deductions: number = 0,
    credits: number = 0
  ): number {
    const taxAmount = this.calculateTax(grossIncome, deductions, credits)
    const takeHome = taxAmount.calculateTakeHome()
    return takeHome.toNumber()
  }

  /**
   * Calculate tax savings from additional deduction
   */
  calculateDeductionSavings(
    grossIncome: number,
    currentDeductions: number,
    additionalDeduction: number
  ): number {
    const taxAmount = this.calculateTax(grossIncome, currentDeductions, 0)
    const savings = taxAmount.calculateDeductionSavings(
      Money.create(additionalDeduction)
    )
    return savings.toNumber()
  }

  /**
   * Optimize deductions to minimize tax
   */
  optimizeDeductions(
    grossIncome: number,
    availableDeductions: number[],
    targetTaxAmount?: number
  ): {
    recommendedDeductions: number
    estimatedTax: number
    estimatedSavings: number
  } {
    // Simple optimization: use all available deductions
    // In a real scenario, this might consider deduction limits, phase-outs, etc.
    const totalDeductions = availableDeductions.reduce((sum, d) => sum + d, 0)
    
    const currentTax = this.calculateTax(grossIncome, 0, 0)
    const optimizedTax = this.calculateTax(grossIncome, totalDeductions, 0)
    
    const savings = currentTax.calculateTax().subtract(optimizedTax.calculateTax())

    return {
      recommendedDeductions: totalDeductions,
      estimatedTax: optimizedTax.calculateTax().toNumber(),
      estimatedSavings: savings.toNumber(),
    }
  }
}





