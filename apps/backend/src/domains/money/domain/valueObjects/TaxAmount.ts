/**
 * TaxAmount Value Object
 * 
 * Value object representing tax calculations with breakdown.
 * Business logic for tax-related calculations.
 */

import { Money } from './Money'

export interface TaxBracket {
  min: number
  max: number | null // null means no upper limit
  rate: number // percentage (e.g., 10 for 10%)
}

export interface TaxBreakdown {
  taxableIncome: Money
  totalTax: Money
  effectiveRate: number // percentage
  marginalRate: number // percentage
  brackets: Array<{
    bracket: TaxBracket
    taxableAmount: Money
    taxAmount: Money
  }>
  deductions: Money
  credits: Money
}

export class TaxAmount {
  private constructor(
    public readonly grossIncome: Money,
    public readonly deductions: Money,
    public readonly credits: Money,
    public readonly brackets: TaxBracket[]
  ) {
    // Validate brackets are in order
    for (let i = 1; i < brackets.length; i++) {
      if (brackets[i].min <= brackets[i - 1].min) {
        throw new Error('Tax brackets must be in ascending order')
      }
    }
  }

  /**
   * Create TaxAmount with standard 2024 US tax brackets (simplified)
   */
  static createStandard(
    grossIncome: Money,
    deductions: Money = Money.create(0),
    credits: Money = Money.create(0)
  ): TaxAmount {
    // Simplified 2024 US federal tax brackets (single filer)
    const brackets: TaxBracket[] = [
      { min: 0, max: 11600, rate: 10 },
      { min: 11600, max: 47150, rate: 12 },
      { min: 47150, max: 100525, rate: 22 },
      { min: 100525, max: 191950, rate: 24 },
      { min: 191950, max: 243725, rate: 32 },
      { min: 243725, max: 609350, rate: 35 },
      { min: 609350, max: null, rate: 37 },
    ]

    return new TaxAmount(grossIncome, deductions, credits, brackets)
  }

  /**
   * Create TaxAmount with custom brackets
   */
  static createCustom(
    grossIncome: Money,
    brackets: TaxBracket[],
    deductions: Money = Money.create(0),
    credits: Money = Money.create(0)
  ): TaxAmount {
    return new TaxAmount(grossIncome, deductions, credits, brackets)
  }

  /**
   * Calculate taxable income (gross income - deductions)
   */
  calculateTaxableIncome(): Money {
    const taxableAmount = this.grossIncome.subtract(this.deductions)
    
    // Taxable income cannot be negative
    return taxableAmount.isNegative() ? Money.create(0, this.grossIncome.currency) : taxableAmount
  }

  /**
   * Calculate total tax based on brackets
   */
  calculateTax(): Money {
    const taxableIncome = this.calculateTaxableIncome()
    const taxableAmount = taxableIncome.toNumber()

    if (taxableAmount <= 0) {
      return Money.create(0, this.grossIncome.currency)
    }

    let totalTax = 0
    let remainingIncome = taxableAmount

    for (const bracket of this.brackets) {
      if (remainingIncome <= 0) break

      const bracketMin = bracket.min
      const bracketMax = bracket.max ?? Infinity
      const bracketRange = Math.min(bracketMax - bracketMin, remainingIncome)

      if (taxableAmount > bracketMin) {
        const taxableInBracket = Math.min(
          bracketRange,
          taxableAmount - bracketMin
        )
        const taxInBracket = (taxableInBracket * bracket.rate) / 100
        totalTax += taxInBracket
        remainingIncome -= taxableInBracket
      }
    }

    const totalTaxAmount = Money.create(totalTax, this.grossIncome.currency)

    // Apply credits (reduce tax, cannot go below zero)
    const taxAfterCredits = totalTaxAmount.subtract(this.credits)
    
    return taxAfterCredits.isNegative() 
      ? Money.create(0, this.grossIncome.currency)
      : taxAfterCredits
  }

  /**
   * Get full tax breakdown
   */
  getBreakdown(): TaxBreakdown {
    const taxableIncome = this.calculateTaxableIncome()
    const taxableAmount = taxableIncome.toNumber()
    const totalTax = this.calculateTax()

    // Calculate effective rate
    const effectiveRate = this.grossIncome.isZero()
      ? 0
      : (totalTax.toNumber() / this.grossIncome.toNumber()) * 100

    // Find marginal rate (highest bracket that applies)
    let marginalRate = 0
    for (const bracket of this.brackets) {
      if (taxableAmount > bracket.min) {
        marginalRate = bracket.rate
      }
    }

    // Calculate tax by bracket
    const bracketTaxes: Array<{
      bracket: TaxBracket
      taxableAmount: Money
      taxAmount: Money
    }> = []

    let remainingIncome = taxableAmount

    for (const bracket of this.brackets) {
      if (remainingIncome <= 0) break

      const bracketMin = bracket.min
      const bracketMax = bracket.max ?? Infinity

      if (taxableAmount > bracketMin) {
        const taxableInBracket = Math.min(
          bracketMax - bracketMin,
          taxableAmount - bracketMin
        )
        const taxInBracket = (taxableInBracket * bracket.rate) / 100

        bracketTaxes.push({
          bracket,
          taxableAmount: Money.create(taxableInBracket, this.grossIncome.currency),
          taxAmount: Money.create(taxInBracket, this.grossIncome.currency),
        })

        remainingIncome -= taxableInBracket
      }
    }

    return {
      taxableIncome,
      totalTax,
      effectiveRate,
      marginalRate,
      brackets: bracketTaxes,
      deductions: this.deductions,
      credits: this.credits,
    }
  }

  /**
   * Calculate take-home pay (gross income - tax)
   */
  calculateTakeHome(): Money {
    const tax = this.calculateTax()
    return this.grossIncome.subtract(tax)
  }

  /**
   * Calculate tax savings from additional deduction
   */
  calculateDeductionSavings(additionalDeduction: Money): Money {
    const currentTax = this.calculateTax()
    
    const newTaxAmount = new TaxAmount(
      this.grossIncome,
      this.deductions.add(additionalDeduction),
      this.credits,
      this.brackets
    )
    
    const newTax = newTaxAmount.calculateTax()
    
    return currentTax.subtract(newTax)
  }
}





