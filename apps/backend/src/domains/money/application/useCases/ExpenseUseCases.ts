/**
 * Expense Management Use Cases
 * 
 * Application layer use cases for monthly expense operations.
 */
import { MonthlyExpense, CategoryExpense } from '../../domain/entities/MonthlyExpense.js'
import { ExpenseCategory, ExpenseCategoryType } from '../../domain/valueObjects/ExpenseCategory.js'
import { MonthlyExpenseRepositoryPort } from '../ports/MonthlyExpenseRepositoryPort.js'

export class CreateOrUpdateMonthlyExpenseUseCase {
  constructor(private repository: MonthlyExpenseRepositoryPort) {}

  async execute(
    userId: string,
    monthlyIncome: number,
    expenses: CategoryExpense[],
    month?: number,
    year?: number
  ): Promise<MonthlyExpense> {
    const now = new Date()
    const targetMonth = month || now.getMonth() + 1
    const targetYear = year || now.getFullYear()

    const existing = await this.repository.findByUserAndMonth(userId, targetMonth, targetYear)

    if (existing) {
      // Update existing
      let updated = existing.updateIncome(monthlyIncome)
      
      // Update all expenses
      for (const expense of expenses) {
        updated = updated.updateExpense(expense.category, expense.amount, expense.notes)
      }

      return this.repository.save(updated)
    }

    // Create new
    const monthlyExpense = MonthlyExpense.create(
      `expense-${userId}-${targetYear}-${targetMonth}-${Date.now()}`,
      userId,
      monthlyIncome,
      expenses,
      targetMonth,
      targetYear
    )

    return this.repository.save(monthlyExpense)
  }
}

export class GetExpenseBreakdownUseCase {
  constructor(private repository: MonthlyExpenseRepositoryPort) {}

  async execute(userId: string, month?: number, year?: number): Promise<{
    expense: MonthlyExpense | null
    breakdown: any
    recommendations: string[]
    emergencyFundRequired: number
  }> {
    const now = new Date()
    const targetMonth = month || now.getMonth() + 1
    const targetYear = year || now.getFullYear()

    const expense = await this.repository.findByUserAndMonth(userId, targetMonth, targetYear)

    if (!expense) {
      return {
        expense: null,
        breakdown: null,
        recommendations: [
          'No expense data found for this month. Start by adding your monthly expenses.',
          'Track all your expenses by category to get an accurate picture of your spending.',
        ],
        emergencyFundRequired: 0,
      }
    }

    const breakdown = expense.getBreakdown()
    const recommendations: string[] = []

    // Generate recommendations based on breakdown
    if (expense.getExpensePercentage() > 100) {
      recommendations.push('⚠️ Your expenses exceed your income. Consider reducing expenses or increasing income.')
    } else if (expense.getExpensePercentage() > 80) {
      recommendations.push('⚠️ You\'re spending over 80% of your income. Consider reducing expenses to build savings.')
    }

    if (expense.getNetCashFlow() < 0) {
      recommendations.push('⚠️ You have negative cash flow this month. Focus on reducing expenses or increasing income.')
    }

    // Check category spending
    const categories = ExpenseCategory.getAllCategories()
    for (const category of categories) {
      const categoryExpense = expense.getExpenseByCategory(category.info.type)
      if (categoryExpense > 0 && category.info.recommendedPercentage) {
        const recommended = category.calculateRecommended(expense.monthlyIncome)
        if (categoryExpense > recommended * 1.2) {
          recommendations.push(
            `💡 Consider reducing ${category.info.name} expenses. You're spending $${categoryExpense.toFixed(2)}, recommended is around $${recommended.toFixed(2)}`
          )
        }
      }
    }

    const emergencyFundRequired = expense.calculateEmergencyFundRequired(6)

    return {
      expense,
      breakdown,
      recommendations,
      emergencyFundRequired,
    }
  }
}

export class CalculateEmergencyFundFromExpensesUseCase {
  constructor(private repository: MonthlyExpenseRepositoryPort) {}

  async execute(
    userId: string,
    monthsCoverage: number = 6,
    month?: number,
    year?: number
  ): Promise<number> {
    const now = new Date()
    const targetMonth = month || now.getMonth() + 1
    const targetYear = year || now.getFullYear()

    const expense = await this.repository.findByUserAndMonth(userId, targetMonth, targetYear)

    if (!expense) {
      return 0
    }

    return expense.calculateEmergencyFundRequired(monthsCoverage)
  }
}

export class GetExpenseSuggestionsUseCase {
  async execute(
    monthlyIncome: number,
    currentExpenses?: CategoryExpense[]
  ): Promise<Array<{
    category: ExpenseCategoryType
    suggestedAmount: number
    currentAmount: number
    isOverBudget: boolean
    info: any
  }>> {
    const categories = ExpenseCategory.getAllCategories()
    const suggestions = categories
      .filter(cat => cat.info.recommendedPercentage !== undefined)
      .map(category => {
        const suggestedAmount = category.calculateRecommended(monthlyIncome)
        const currentAmount = currentExpenses?.find(e => e.category === category.info.type)?.amount || 0
        const isOverBudget = currentAmount > suggestedAmount * 1.2

        return {
          category: category.info.type,
          suggestedAmount,
          currentAmount,
          isOverBudget,
          info: category.info,
        }
      })

    return suggestions.sort((a, b) => {
      // Sort by essential first, then by amount
      if (a.info.isEssential !== b.info.isEssential) {
        return a.info.isEssential ? -1 : 1
      }
      return b.suggestedAmount - a.suggestedAmount
    })
  }
}





