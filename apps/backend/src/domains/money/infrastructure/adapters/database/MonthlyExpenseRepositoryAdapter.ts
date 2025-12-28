/**
 * MonthlyExpenseRepositoryAdapter
 * 
 * Infrastructure adapter for storing/retrieving monthly expense data via UserFinancialData.
 */
import { PrismaClient, UserFinancialDataType } from '@prisma/client'
import { MonthlyExpense } from '../../../domain/entities/MonthlyExpense.js'
import { MonthlyExpenseRepositoryPort } from '../../../application/ports/MonthlyExpenseRepositoryPort.js'
import { CategoryExpense } from '../../../domain/entities/MonthlyExpense.js'

export class MonthlyExpenseRepositoryAdapter implements MonthlyExpenseRepositoryPort {
  constructor(private prisma: PrismaClient) {}

  async findByUserAndMonth(userId: string, month: number, year: number): Promise<MonthlyExpense | null> {
    const data = await this.prisma.userFinancialData.findFirst({
      where: {
        userId,
        dataType: UserFinancialDataType.EXPENSE_INFO,
      },
      orderBy: { updatedAt: 'desc' },
    })

    if (!data) {
      return null
    }

    const decryptedData = data.metadata as {
      id: string
      monthlyIncome: number
      expenses: CategoryExpense[]
      month: number
      year: number
    }

    // Check if this is the requested month/year
    if (decryptedData.month === month && decryptedData.year === year) {
      return MonthlyExpense.fromPersistence({
        id: decryptedData.id,
        userId,
        monthlyIncome: decryptedData.monthlyIncome,
        expenses: decryptedData.expenses as CategoryExpense[],
        month: decryptedData.month,
        year: decryptedData.year,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      })
    }

    return null
  }

  async findByUserId(userId: string): Promise<MonthlyExpense[]> {
    const dataList = await this.prisma.userFinancialData.findMany({
      where: {
        userId,
        dataType: UserFinancialDataType.EXPENSE_INFO,
      },
      orderBy: { updatedAt: 'desc' },
    })

    return dataList
      .map(data => {
        try {
          const decryptedData = data.metadata as {
            id: string
            monthlyIncome: number
            expenses: CategoryExpense[]
            month: number
            year: number
          }
          return MonthlyExpense.fromPersistence({
            id: decryptedData.id,
            userId,
            monthlyIncome: decryptedData.monthlyIncome,
            expenses: decryptedData.expenses as CategoryExpense[],
            month: decryptedData.month,
            year: decryptedData.year,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          })
        } catch (error) {
          console.error('Error parsing expense data:', error)
          return null
        }
      })
      .filter((expense): expense is MonthlyExpense => expense !== null)
  }

  async findCurrent(userId: string): Promise<MonthlyExpense | null> {
    const now = new Date()
    return this.findByUserAndMonth(userId, now.getMonth() + 1, now.getFullYear())
  }

  async save(monthlyExpense: MonthlyExpense): Promise<MonthlyExpense> {
    const metadata = {
      id: monthlyExpense.id,
      monthlyIncome: monthlyExpense.monthlyIncome,
      expenses: monthlyExpense.expenses,
      month: monthlyExpense.month,
      year: monthlyExpense.year,
    }

    const existing = await this.prisma.userFinancialData.findFirst({
      where: {
        userId: monthlyExpense.userId,
        dataType: UserFinancialDataType.EXPENSE_INFO,
      },
    })

    // In a real implementation, you'd want to store multiple months
    // For now, we'll update the most recent one or create new
    if (existing) {
      await this.prisma.userFinancialData.update({
        where: { id: existing.id },
        data: {
          metadata: metadata as any,
          updatedAt: new Date(),
          encryptedData: JSON.stringify(metadata),
        },
      })
    } else {
      await this.prisma.userFinancialData.create({
        data: {
          userId: monthlyExpense.userId,
          dataType: UserFinancialDataType.EXPENSE_INFO,
          encryptedData: JSON.stringify(metadata),
          encryptionKeyId: 'default',
          metadata: metadata as any,
        },
      })
    }

    return monthlyExpense
  }

  async delete(userId: string, month: number, year: number): Promise<void> {
    await this.prisma.userFinancialData.deleteMany({
      where: {
        userId,
        dataType: UserFinancialDataType.EXPENSE_INFO,
      },
    })
  }
}

