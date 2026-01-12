/**
 * EmergencyFundGoal Value Object
 * 
 * Represents an emergency fund goal with target amount and months coverage.
 */
export class EmergencyFundGoal {
  private constructor(
    public readonly targetAmount: number,
    public readonly monthsCoverage: number,
    public readonly monthlyExpenses: number
  ) {
    if (targetAmount <= 0) {
      throw new Error('Target amount must be greater than 0')
    }
    if (monthsCoverage <= 0) {
      throw new Error('Months coverage must be greater than 0')
    }
    if (monthlyExpenses <= 0) {
      throw new Error('Monthly expenses must be greater than 0')
    }
  }

  /**
   * Create a new EmergencyFundGoal
   */
  static create(
    targetAmount: number,
    monthsCoverage: number,
    monthlyExpenses: number
  ): EmergencyFundGoal {
    return new EmergencyFundGoal(targetAmount, monthsCoverage, monthlyExpenses)
  }

  /**
   * Create from monthly expenses and desired coverage
   */
  static fromMonthlyExpenses(
    monthlyExpenses: number,
    monthsCoverage: number = 6
  ): EmergencyFundGoal {
    const targetAmount = monthlyExpenses * monthsCoverage
    return new EmergencyFundGoal(targetAmount, monthsCoverage, monthlyExpenses)
  }

  /**
   * Calculate required amount based on monthly expenses
   */
  static calculateRequired(
    monthlyExpenses: number,
    monthsCoverage: number
  ): number {
    return monthlyExpenses * monthsCoverage
  }

  /**
   * Check if goal is met
   */
  isMet(currentAmount: number): boolean {
    return currentAmount >= this.targetAmount
  }

  /**
   * Calculate progress percentage
   */
  getProgress(currentAmount: number): number {
    if (this.targetAmount === 0) return 0
    return Math.min(100, (currentAmount / this.targetAmount) * 100)
  }

  /**
   * Calculate remaining amount needed
   */
  getRemaining(currentAmount: number): number {
    return Math.max(0, this.targetAmount - currentAmount)
  }
}





