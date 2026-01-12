/**
 * Emergency Fund Use Cases
 * 
 * Application layer use cases for emergency fund operations.
 */
import { EmergencyFund } from '../../domain/entities/EmergencyFund.js'
import { EmergencyFundGoal } from '../../domain/valueObjects/EmergencyFundGoal.js'
import { EmergencyFundHealth } from '../../domain/valueObjects/EmergencyFundHealth.js'
import { EmergencyFundRepositoryPort } from '../ports/EmergencyFundRepositoryPort.js'

export class SetEmergencyFundGoalUseCase {
  constructor(private repository: EmergencyFundRepositoryPort) {}

  async execute(
    userId: string,
    targetAmount: number,
    monthsCoverage: number,
    monthlyExpenses: number,
    currentAmount?: number
  ): Promise<EmergencyFund> {
    const goal = EmergencyFundGoal.create(targetAmount, monthsCoverage, monthlyExpenses)

    const existing = await this.repository.findByUserId(userId)
    if (existing) {
      const updated = existing.updateGoal(goal)
      if (currentAmount !== undefined) {
        return this.repository.save(updated.updateAmount(currentAmount))
      }
      return this.repository.save(updated)
    }

    const emergencyFund = EmergencyFund.create(
      `ef-${userId}-${Date.now()}`,
      userId,
      goal,
      currentAmount || 0
    )

    return this.repository.save(emergencyFund)
  }
}

export class UpdateEmergencyFundProgressUseCase {
  constructor(private repository: EmergencyFundRepositoryPort) {}

  async execute(
    userId: string,
    newAmount: number,
    notes?: string
  ): Promise<EmergencyFund> {
    const existing = await this.repository.findByUserId(userId)
    if (!existing) {
      throw new Error('Emergency fund goal must be set before updating progress')
    }

    const updated = existing.updateAmount(newAmount, notes)
    return this.repository.save(updated)
  }
}

export class GetEmergencyFundStatusUseCase {
  constructor(private repository: EmergencyFundRepositoryPort) {}

  async execute(userId: string): Promise<{
    emergencyFund: EmergencyFund | null
    health: EmergencyFundHealth | null
    progress: number
    remaining: number
    isGoalMet: boolean
  }> {
    const emergencyFund = await this.repository.findByUserId(userId)
    if (!emergencyFund) {
      return {
        emergencyFund: null,
        health: null,
        progress: 0,
        remaining: 0,
        isGoalMet: false,
      }
    }

    const health = emergencyFund.getHealth()
    const progress = emergencyFund.getProgressPercentage()
    const remaining = emergencyFund.getRemaining()
    const isGoalMet = emergencyFund.isGoalMet()

    return {
      emergencyFund,
      health,
      progress,
      remaining,
      isGoalMet,
    }
  }
}

export class CalculateEmergencyFundRequiredUseCase {
  async execute(
    monthlyExpenses: number,
    monthsCoverage: number = 6
  ): Promise<number> {
    return EmergencyFundGoal.calculateRequired(monthlyExpenses, monthsCoverage)
  }
}





