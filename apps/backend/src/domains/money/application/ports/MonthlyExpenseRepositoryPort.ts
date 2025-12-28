/**
 * MonthlyExpenseRepositoryPort
 * 
 * Port (interface) for monthly expense repository operations.
 */
import { MonthlyExpense } from '../../domain/entities/MonthlyExpense.js'

export interface MonthlyExpenseRepositoryPort {
  /**
   * Find monthly expense by user ID and month/year
   */
  findByUserAndMonth(userId: string, month: number, year: number): Promise<MonthlyExpense | null>

  /**
   * Find all monthly expenses for a user
   */
  findByUserId(userId: string): Promise<MonthlyExpense[]>

  /**
   * Find current month expense for a user
   */
  findCurrent(userId: string): Promise<MonthlyExpense | null>

  /**
   * Save monthly expense (create or update)
   */
  save(monthlyExpense: MonthlyExpense): Promise<MonthlyExpense>

  /**
   * Delete monthly expense
   */
  delete(userId: string, month: number, year: number): Promise<void>
}


