/**
 * MonthlyExpense Entity
 * 
 * Represents a user's monthly expense breakdown by category.
 */
import { ExpenseCategory, ExpenseCategoryType } from '../valueObjects/ExpenseCategory.js'

export interface CategoryExpense {
  category: ExpenseCategoryType
  amount: number
  notes?: string
}

export class MonthlyExpense {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly monthlyIncome: number,
    public readonly expenses: CategoryExpense[],
    public readonly month: number, // 1-12
    public readonly year: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Create a new MonthlyExpense entity
   */
  static create(
    id: string,
    userId: string,
    monthlyIncome: number,
    expenses: CategoryExpense[],
    month: number,
    year: number
  ): MonthlyExpense {
    if (month < 1 || month > 12) {
      throw new Error('Month must be between 1 and 12')
    }
    if (monthlyIncome <= 0) {
      throw new Error('Monthly income must be greater than 0')
    }
    if (expenses.some(e => e.amount < 0)) {
      throw new Error('Expense amounts cannot be negative')
    }

    const now = new Date()
    return new MonthlyExpense(
      id,
      userId,
      monthlyIncome,
      expenses,
      month,
      year,
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
    monthlyIncome: number
    expenses: CategoryExpense[]
    month: number
    year: number
    createdAt: Date
    updatedAt: Date
  }): MonthlyExpense {
    return new MonthlyExpense(
      data.id,
      data.userId,
      data.monthlyIncome,
      data.expenses,
      data.month,
      data.year,
      data.createdAt,
      data.updatedAt
    )
  }

  /**
   * Calculate total monthly expenses
   */
  getTotalExpenses(): number {
    return this.expenses.reduce((sum, expense) => sum + expense.amount, 0)
  }

  /**
   * Calculate net cash flow (income - expenses)
   */
  getNetCashFlow(): number {
    return this.monthlyIncome - this.getTotalExpenses()
  }

  /**
   * Calculate expense percentage of income
   */
  getExpensePercentage(): number {
    if (this.monthlyIncome === 0) return 0
    return (this.getTotalExpenses() / this.monthlyIncome) * 100
  }

  /**
   * Get expenses by category type
   */
  getExpenseByCategory(category: ExpenseCategoryType): number {
    const expense = this.expenses.find(e => e.category === category)
    return expense?.amount || 0
  }

  /**
   * Get essential expenses total
   */
  getEssentialExpenses(): number {
    const essentialCategories = ExpenseCategory.getEssentialCategories()
    return this.expenses
      .filter(e => essentialCategories.some(ec => ec.info.type === e.category))
      .reduce((sum, expense) => sum + expense.amount, 0)
  }

  /**
   * Get non-essential expenses total
   */
  getNonEssentialExpenses(): number {
    return this.getTotalExpenses() - this.getEssentialExpenses()
  }

  /**
   * Calculate recommended emergency fund amount
   * Based on essential expenses only
   */
  calculateEmergencyFundRequired(monthsCoverage: number = 6): number {
    return this.getEssentialExpenses() * monthsCoverage
  }

  /**
   * Update expense for a category
   */
  updateExpense(category: ExpenseCategoryType, amount: number, notes?: string): MonthlyExpense {
    if (amount < 0) {
      throw new Error('Expense amount cannot be negative')
    }

    const updatedExpenses = this.expenses.filter(e => e.category !== category)
    updatedExpenses.push({ category, amount, notes })

    return new MonthlyExpense(
      this.id,
      this.userId,
      this.monthlyIncome,
      updatedExpenses,
      this.month,
      this.year,
      this.createdAt,
      new Date()
    )
  }

  /**
   * Update monthly income
   */
  updateIncome(newIncome: number): MonthlyExpense {
    if (newIncome <= 0) {
      throw new Error('Monthly income must be greater than 0')
    }

    return new MonthlyExpense(
      this.id,
      this.userId,
      newIncome,
      this.expenses,
      this.month,
      this.year,
      this.createdAt,
      new Date()
    )
  }

  /**
   * Get breakdown summary
   */
  getBreakdown() {
    return {
      totalExpenses: this.getTotalExpenses(),
      essentialExpenses: this.getEssentialExpenses(),
      nonEssentialExpenses: this.getNonEssentialExpenses(),
      netCashFlow: this.getNetCashFlow(),
      expensePercentage: this.getExpensePercentage(),
      byCategory: this.expenses.map(e => ({
        category: e.category,
        amount: e.amount,
        percentage: this.monthlyIncome > 0 ? (e.amount / this.monthlyIncome) * 100 : 0,
        notes: e.notes,
      })),
    }
  }
}


