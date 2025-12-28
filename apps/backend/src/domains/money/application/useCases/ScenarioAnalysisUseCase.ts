/**
 * ScenarioAnalysisUseCase
 * 
 * Analyzes financial scenarios based on expense ranges and provides
 * research-backed recommendations for achieving goals.
 */
import { ExpenseCategoryType } from '../../domain/valueObjects/ExpenseCategory.js'
import { ExpenseCategory } from '../../domain/valueObjects/ExpenseCategory.js'

export interface ExpenseRange {
  category: ExpenseCategoryType
  min: number
  max: number
}

export interface ScenarioInput {
  monthlyIncome: number
  expenseRanges: ExpenseRange[]
  goalType: 'EMERGENCY_FUND' | 'DEBT_PAYOFF' | 'SAVINGS' | 'RETIREMENT'
  goalAmount?: number
  timeHorizon?: number // months
}

export interface ScenarioResult {
  scenario: 'OPTIMISTIC' | 'MODERATE' | 'CONSERVATIVE'
  totalExpenses: {
    min: number
    max: number
    average: number
  }
  essentialExpenses: {
    min: number
    max: number
    average: number
  }
  monthlySurplus: {
    min: number
    max: number
    average: number
  }
  timeToGoal: {
    monthsMin: number
    monthsMax: number
    monthsAverage: number
  }
  recommendations: string[]
  researchBasedInsights: string[]
}

export class ScenarioAnalysisUseCase {
  /**
   * Analyze scenarios based on expense ranges
   */
  async execute(input: ScenarioInput): Promise<ScenarioResult[]> {
    const scenarios: ScenarioResult[] = []

    // Calculate three scenarios: optimistic (min expenses), moderate (average), conservative (max expenses)
    const essentialCategories = ExpenseCategory.getEssentialCategories().map(c => c.info.type)

    // Optimistic scenario (minimum expenses)
    const optimisticExpenses = this.calculateTotalForRange(input.expenseRanges, essentialCategories, 'min')
    const optimisticResult = this.calculateScenario('OPTIMISTIC', input, optimisticExpenses, essentialCategories)

    // Moderate scenario (average expenses)
    const moderateExpenses = this.calculateTotalForRange(input.expenseRanges, essentialCategories, 'average')
    const moderateResult = this.calculateScenario('MODERATE', input, moderateExpenses, essentialCategories)

    // Conservative scenario (maximum expenses)
    const conservativeExpenses = this.calculateTotalForRange(input.expenseRanges, essentialCategories, 'max')
    const conservativeResult = this.calculateScenario('CONSERVATIVE', input, conservativeExpenses, essentialCategories)

    return [optimisticResult, moderateResult, conservativeResult]
  }

  private calculateTotalForRange(
    ranges: ExpenseRange[],
    essentialCategories: ExpenseCategoryType[],
    type: 'min' | 'max' | 'average'
  ): number {
    const filteredRanges = essentialCategories.length > 0
      ? ranges.filter(r => essentialCategories.includes(r.category))
      : ranges
    return filteredRanges.reduce((sum, r) => {
      const value = type === 'min' ? r.min : type === 'max' ? r.max : (r.min + r.max) / 2
      return sum + value
    }, 0)
  }

  private calculateScenario(
    scenarioType: 'OPTIMISTIC' | 'MODERATE' | 'CONSERVATIVE',
    input: ScenarioInput,
    essentialExpenses: number,
    essentialCategories: ExpenseCategoryType[]
  ): ScenarioResult {
    const totalExpensesMin = this.calculateTotalForRange(input.expenseRanges, [], 'min')
    const totalExpensesMax = this.calculateTotalForRange(input.expenseRanges, [], 'max')
    const totalExpensesAvg = (totalExpensesMin + totalExpensesMax) / 2

    const essentialExpensesMin = this.calculateTotalForRange(input.expenseRanges, essentialCategories, 'min')
    const essentialExpensesMax = this.calculateTotalForRange(input.expenseRanges, essentialCategories, 'max')
    const essentialExpensesAvg = (essentialExpensesMin + essentialExpensesMax) / 2

    const monthlySurplusMin = input.monthlyIncome - totalExpensesMax
    const monthlySurplusMax = input.monthlyIncome - totalExpensesMin
    const monthlySurplusAvg = input.monthlyIncome - totalExpensesAvg

    // Calculate time to goal based on goal type
    let timeToGoal = { monthsMin: 0, monthsMax: 0, monthsAverage: 0 }

    if (input.goalType === 'EMERGENCY_FUND' && input.goalAmount) {
      const monthsCoverage = input.timeHorizon || 6
      const goalAmount = essentialExpenses * monthsCoverage
      
      if (monthlySurplusMin > 0) {
        timeToGoal.monthsMin = Math.ceil(goalAmount / monthlySurplusMin)
      }
      if (monthlySurplusMax > 0) {
        timeToGoal.monthsMax = Math.ceil(goalAmount / monthlySurplusMax)
      }
      if (monthlySurplusAvg > 0) {
        timeToGoal.monthsAverage = Math.ceil(goalAmount / monthlySurplusAvg)
      }
    } else if (input.goalAmount) {
      // For other goals, use the provided goal amount
      if (monthlySurplusMin > 0) {
        timeToGoal.monthsMin = Math.ceil(input.goalAmount / monthlySurplusMin)
      }
      if (monthlySurplusMax > 0) {
        timeToGoal.monthsMax = Math.ceil(input.goalAmount / monthlySurplusMax)
      }
      if (monthlySurplusAvg > 0) {
        timeToGoal.monthsAverage = Math.ceil(input.goalAmount / monthlySurplusAvg)
      }
    }

    const recommendations = this.generateRecommendations(scenarioType, input, monthlySurplusAvg, essentialExpenses)
    const researchBasedInsights = this.generateResearchInsights(
      scenarioType,
      input,
      totalExpensesAvg,
      monthlySurplusAvg
    )

    return {
      scenario: scenarioType,
      totalExpenses: {
        min: totalExpensesMin,
        max: totalExpensesMax,
        average: totalExpensesAvg,
      },
      essentialExpenses: {
        min: essentialExpensesMin,
        max: essentialExpensesMax,
        average: essentialExpensesAvg,
      },
      monthlySurplus: {
        min: monthlySurplusMin,
        max: monthlySurplusMax,
        average: monthlySurplusAvg,
      },
      timeToGoal,
      recommendations,
      researchBasedInsights,
    }
  }

  private generateRecommendations(
    scenarioType: 'OPTIMISTIC' | 'MODERATE' | 'CONSERVATIVE',
    input: ScenarioInput,
    monthlySurplus: number,
    essentialExpenses: number
  ): string[] {
    const recommendations: string[] = []
    const expensePercentage = (input.monthlyIncome > 0 ? (essentialExpenses / input.monthlyIncome) * 100 : 0)

    if (monthlySurplus < 0) {
      recommendations.push(
        '⚠️ Your expenses exceed income in this scenario. Immediate action required: reduce non-essential expenses or increase income.'
      )
      recommendations.push(
        '💡 Research shows that households with negative cash flow should focus on eliminating non-essential expenses first (entertainment, dining out, subscriptions).'
      )
    } else if (monthlySurplus < essentialExpenses * 0.1) {
      recommendations.push(
        '💡 Your surplus is less than 10% of essential expenses. Consider reducing expenses in non-essential categories to increase savings capacity.'
      )
      recommendations.push(
        '📊 Studies indicate that maintaining at least 20% savings rate significantly improves financial resilience.'
      )
    }

    if (expensePercentage > 80) {
      recommendations.push(
        '⚠️ Expenses represent over 80% of income, leaving little room for savings. Focus on reducing the largest expense categories first.'
      )
      recommendations.push(
        '🏠 Housing costs exceeding 30% of income is a red flag. If possible, consider downsizing, refinancing, or finding roommates.'
      )
    }

    if (input.goalType === 'EMERGENCY_FUND') {
      const recommendedFund = essentialExpenses * 6
      if (monthlySurplus > 0) {
        const monthsToGoal = Math.ceil(recommendedFund / monthlySurplus)
        if (monthsToGoal > 24) {
          recommendations.push(
            `⏰ At current surplus rates, building a 6-month emergency fund will take ${monthsToGoal} months. Consider increasing your savings rate.`
          )
          recommendations.push(
            '💡 Research by Federal Reserve shows that 40% of Americans cannot cover a $400 emergency. Building emergency savings should be prioritized.'
          )
        } else {
          recommendations.push(
            `✅ You can achieve your emergency fund goal in approximately ${monthsToGoal} months at this savings rate.`
          )
        }
      }
    }

    // Category-specific recommendations
    const ranges = input.expenseRanges
    const housingRange = ranges.find(r => r.category === ExpenseCategoryType.HOUSING)
    if (housingRange && housingRange.max > input.monthlyIncome * 0.3) {
      recommendations.push(
        '🏠 Housing expenses are high relative to income. The 30% rule suggests limiting housing costs to 30% of gross income for better financial health.'
      )
    }

    const foodRange = ranges.find(r => r.category === ExpenseCategoryType.FOOD)
    if (foodRange && foodRange.max > input.monthlyIncome * 0.15) {
      recommendations.push(
        '🍔 Food expenses can be optimized. Research shows meal planning and reducing dining out can save 20-30% on food costs.'
      )
    }

    const debtRange = ranges.find(r => r.category === ExpenseCategoryType.DEBT_PAYMENTS)
    if (debtRange && debtRange.max > input.monthlyIncome * 0.2) {
      recommendations.push(
        '💳 High debt payments are impacting your cash flow. Consider debt consolidation or the debt avalanche method to accelerate payoff.'
      )
      recommendations.push(
        '📈 Studies show that reducing debt payments below 20% of income significantly improves financial flexibility and mental health.'
      )
    }

    return recommendations
  }

  private generateResearchInsights(
    scenarioType: 'OPTIMISTIC' | 'MODERATE' | 'CONSERVATIVE',
    input: ScenarioInput,
    totalExpenses: number,
    monthlySurplus: number
  ): string[] {
    const insights: string[] = []
    const savingsRate = input.monthlyIncome > 0 ? (monthlySurplus / input.monthlyIncome) * 100 : 0

    // Research-based insights
    if (savingsRate >= 20) {
      insights.push(
        '✅ Excellent savings rate! Research from the Bureau of Labor Statistics shows that households saving 20%+ have significantly higher financial security.'
      )
    } else if (savingsRate >= 10) {
      insights.push(
        '👍 Good savings rate. Financial experts recommend saving 15-20% of income for optimal financial health and retirement readiness.'
      )
    } else if (savingsRate >= 5) {
      insights.push(
        '⚠️ Savings rate is below recommended levels. The 50/30/20 rule suggests allocating 20% to savings and debt repayment.'
      )
    }

    insights.push(
      `📊 Based on ${scenarioType.toLowerCase()} expense assumptions, your monthly surplus ranges provide ${this.getSurplusAnalysis(monthlySurplus)} opportunities for building wealth.`
    )

    if (input.goalType === 'EMERGENCY_FUND') {
      insights.push(
        '🛡️ Emergency funds are critical: Bankrate research shows that having 3-6 months of expenses saved reduces financial stress by 70%.'
      )
      insights.push(
        '💼 Consider high-yield savings accounts (currently offering 4-5% APY) to grow your emergency fund while maintaining liquidity.'
      )
    }

    // Expense optimization insights
    const expensePercentage = (totalExpenses / input.monthlyIncome) * 100
    if (expensePercentage > 90) {
      insights.push(
        '⚠️ High expense ratio indicates limited financial flexibility. Research shows that maintaining expenses below 80% of income is critical for financial resilience.'
      )
    }

    return insights
  }

  private getSurplusAnalysis(monthlySurplus: number): string {
    if (monthlySurplus < 100) {
      return 'limited'
    } else if (monthlySurplus < 500) {
      return 'moderate'
    } else if (monthlySurplus < 1000) {
      return 'good'
    } else {
      return 'excellent'
    }
  }
}

