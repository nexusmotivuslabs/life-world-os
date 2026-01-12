/**
 * EmergencyFundHealth Value Object
 * 
 * Represents the health status of an emergency fund.
 */
export enum FundHealthStatus {
  CRITICAL = 'CRITICAL', // < 1 month coverage
  LOW = 'LOW', // 1-3 months coverage
  MODERATE = 'MODERATE', // 3-6 months coverage
  GOOD = 'GOOD', // 6-9 months coverage
  EXCELLENT = 'EXCELLENT', // 9+ months coverage
}

export class EmergencyFundHealth {
  private constructor(
    public readonly status: FundHealthStatus,
    public readonly monthsCovered: number,
    public readonly recommendedMonths: number,
    public readonly recommendations: string[]
  ) {}

  /**
   * Calculate health status from current amount and monthly expenses
   */
  static calculate(
    currentAmount: number,
    monthlyExpenses: number,
    recommendedMonths: number = 6
  ): EmergencyFundHealth {
    if (monthlyExpenses <= 0) {
      return new EmergencyFundHealth(
        FundHealthStatus.CRITICAL,
        0,
        recommendedMonths,
        ['Set monthly expenses to calculate emergency fund needs']
      )
    }

    const monthsCovered = currentAmount / monthlyExpenses

    let status: FundHealthStatus
    let recommendations: string[]

    if (monthsCovered < 1) {
      status = FundHealthStatus.CRITICAL
      recommendations = [
        'Your emergency fund is critically low. Aim for at least 1 month of expenses as an immediate goal.',
        'Start by saving $' + Math.ceil(monthlyExpenses) + ' to reach 1 month coverage.',
      ]
    } else if (monthsCovered < 3) {
      status = FundHealthStatus.LOW
      recommendations = [
        'Your emergency fund is low. Financial experts recommend 3-6 months of expenses.',
        'Continue building your emergency fund to reach at least 3 months coverage.',
      ]
    } else if (monthsCovered < 6) {
      status = FundHealthStatus.MODERATE
      recommendations = [
        'You have a moderate emergency fund. Most experts recommend 6 months of expenses for optimal security.',
        'Consider reaching 6 months coverage, especially if you have variable income or dependents.',
      ]
    } else if (monthsCovered < 9) {
      status = FundHealthStatus.GOOD
      recommendations = [
        'Your emergency fund is in good shape!',
        'You may want to consider investing additional savings beyond your emergency fund for better returns.',
      ]
    } else {
      status = FundHealthStatus.EXCELLENT
      recommendations = [
        'Excellent! You have a strong emergency fund.',
        'Consider investing excess emergency fund savings (beyond 6-9 months) to earn better returns while maintaining your safety net.',
      ]
    }

    return new EmergencyFundHealth(status, monthsCovered, recommendedMonths, recommendations)
  }

  /**
   * Get color code for UI display
   */
  getColorCode(): string {
    switch (this.status) {
      case FundHealthStatus.CRITICAL:
        return 'red'
      case FundHealthStatus.LOW:
        return 'orange'
      case FundHealthStatus.MODERATE:
        return 'yellow'
      case FundHealthStatus.GOOD:
        return 'green'
      case FundHealthStatus.EXCELLENT:
        return 'blue'
      default:
        return 'gray'
    }
  }
}





