/**
 * EmergencyFund Entity
 * 
 * Domain entity representing a user's emergency fund tracking data.
 */
import { EmergencyFundGoal } from '../valueObjects/EmergencyFundGoal.js'
import { EmergencyFundHealth, FundHealthStatus } from '../valueObjects/EmergencyFundHealth.js'

export interface EmergencyFundProgress {
  date: Date
  amount: number
  notes?: string
}

export class EmergencyFund {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly goal: EmergencyFundGoal,
    public readonly currentAmount: number,
    public readonly progressHistory: EmergencyFundProgress[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Create a new EmergencyFund entity
   */
  static create(
    id: string,
    userId: string,
    goal: EmergencyFundGoal,
    initialAmount: number = 0
  ): EmergencyFund {
    const now = new Date()
    const progressHistory: EmergencyFundProgress[] = initialAmount > 0
      ? [{ date: now, amount: initialAmount }]
      : []

    return new EmergencyFund(
      id,
      userId,
      goal,
      initialAmount,
      progressHistory,
      now,
      now
    )
  }

  /**
   * Create from persisted data
   */
  static fromPersistence(data: {
    id: string
    userId: string
    targetAmount: number
    monthsCoverage: number
    monthlyExpenses: number
    currentAmount: number
    progressHistory?: EmergencyFundProgress[]
    createdAt: Date
    updatedAt: Date
  }): EmergencyFund {
    const goal = EmergencyFundGoal.create(
      data.targetAmount,
      data.monthsCoverage,
      data.monthlyExpenses
    )

    return new EmergencyFund(
      data.id,
      data.userId,
      goal,
      data.currentAmount,
      data.progressHistory || [],
      data.createdAt,
      data.updatedAt
    )
  }

  /**
   * Update current amount and add to progress history
   */
  updateAmount(newAmount: number, notes?: string): EmergencyFund {
    if (newAmount < 0) {
      throw new Error('Amount cannot be negative')
    }

    const newProgress: EmergencyFundProgress = {
      date: new Date(),
      amount: newAmount,
      notes,
    }

    return new EmergencyFund(
      this.id,
      this.userId,
      this.goal,
      newAmount,
      [...this.progressHistory, newProgress],
      this.createdAt,
      new Date()
    )
  }

  /**
   * Update goal
   */
  updateGoal(newGoal: EmergencyFundGoal): EmergencyFund {
    return new EmergencyFund(
      this.id,
      this.userId,
      newGoal,
      this.currentAmount,
      this.progressHistory,
      this.createdAt,
      new Date()
    )
  }

  /**
   * Get health status
   */
  getHealth(): EmergencyFundHealth {
    return EmergencyFundHealth.calculate(
      this.currentAmount,
      this.goal.monthlyExpenses,
      this.goal.monthsCoverage
    )
  }

  /**
   * Get progress percentage
   */
  getProgressPercentage(): number {
    return this.goal.getProgress(this.currentAmount)
  }

  /**
   * Get remaining amount needed
   */
  getRemaining(): number {
    return this.goal.getRemaining(this.currentAmount)
  }

  /**
   * Check if goal is met
   */
  isGoalMet(): boolean {
    return this.goal.isMet(this.currentAmount)
  }
}





