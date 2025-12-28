/**
 * ExpenseController
 * 
 * REST API endpoints for monthly expense management.
 */
import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { MonthlyExpenseRepositoryAdapter } from '../../infrastructure/adapters/database/MonthlyExpenseRepositoryAdapter.js'
import {
  CreateOrUpdateMonthlyExpenseUseCase,
  GetExpenseBreakdownUseCase,
  CalculateEmergencyFundFromExpensesUseCase,
  GetExpenseSuggestionsUseCase,
} from '../../application/useCases/ExpenseUseCases.js'
import { ScenarioAnalysisUseCase } from '../../application/useCases/ScenarioAnalysisUseCase.js'
import { ExpenseCategoryType } from '../../domain/valueObjects/ExpenseCategory.js'
import { prisma } from '../../../../lib/prisma.js'

const router = Router()

// Initialize adapters and use cases
const expenseRepository = new MonthlyExpenseRepositoryAdapter(prisma as PrismaClient)
const createOrUpdateUseCase = new CreateOrUpdateMonthlyExpenseUseCase(expenseRepository)
const getBreakdownUseCase = new GetExpenseBreakdownUseCase(expenseRepository)
const calculateEmergencyFundUseCase = new CalculateEmergencyFundFromExpensesUseCase(expenseRepository)
const getSuggestionsUseCase = new GetExpenseSuggestionsUseCase()
const scenarioAnalysisUseCase = new ScenarioAnalysisUseCase()

/**
 * POST /api/expenses
 * Create or update monthly expenses
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    // TODO: Extract userId from authentication token
    const userId = (req.body.userId || req.query.userId || 'demo-user-id') as string
    const { monthlyIncome, expenses, month, year } = req.body

    if (!monthlyIncome || monthlyIncome <= 0) {
      return res.status(400).json({ error: 'monthlyIncome must be greater than 0' })
    }

    if (!expenses || !Array.isArray(expenses)) {
      return res.status(400).json({ error: 'expenses must be an array' })
    }

    // Validate expense structure
    for (const expense of expenses) {
      if (!expense.category || !Object.values(ExpenseCategoryType).includes(expense.category)) {
        return res.status(400).json({ error: `Invalid expense category: ${expense.category}` })
      }
      if (expense.amount === undefined || expense.amount < 0) {
        return res.status(400).json({ error: 'Expense amount must be >= 0' })
      }
    }

    const monthlyExpense = await createOrUpdateUseCase.execute(
      userId,
      monthlyIncome,
      expenses,
      month,
      year
    )

    res.json({
      id: monthlyExpense.id,
      userId: monthlyExpense.userId,
      monthlyIncome: monthlyExpense.monthlyIncome,
      expenses: monthlyExpense.expenses,
      month: monthlyExpense.month,
      year: monthlyExpense.year,
      totalExpenses: monthlyExpense.getTotalExpenses(),
      netCashFlow: monthlyExpense.getNetCashFlow(),
      expensePercentage: monthlyExpense.getExpensePercentage(),
      breakdown: monthlyExpense.getBreakdown(),
    })
  } catch (error: any) {
    console.error('Error creating/updating monthly expenses:', error)
    res.status(500).json({ error: error.message || 'Failed to create/update monthly expenses' })
  }
})

/**
 * GET /api/expenses
 * Get monthly expenses for user
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // TODO: Extract userId from authentication token
    const userId = (req.query.userId || 'demo-user-id') as string
    const month = req.query.month ? parseInt(req.query.month as string) : undefined
    const year = req.query.year ? parseInt(req.query.year as string) : undefined

    if (month && year) {
      // Get specific month
      const result = await getBreakdownUseCase.execute(userId, month, year)
      return res.json(result)
    }

    // Get current month
    const result = await getBreakdownUseCase.execute(userId)
    res.json(result)
  } catch (error: any) {
    console.error('Error getting expense breakdown:', error)
    res.status(500).json({ error: error.message || 'Failed to get expense breakdown' })
  }
})

/**
 * GET /api/expenses/suggestions
 * Get expense suggestions based on income
 */
router.get('/suggestions', async (req: Request, res: Response) => {
  try {
    const monthlyIncome = req.query.monthlyIncome
      ? parseFloat(req.query.monthlyIncome as string)
      : undefined

    if (!monthlyIncome || monthlyIncome <= 0) {
      return res.status(400).json({ error: 'monthlyIncome query parameter is required and must be > 0' })
    }

    const currentExpenses = req.query.currentExpenses
      ? JSON.parse(req.query.currentExpenses as string)
      : undefined

    const suggestions = await getSuggestionsUseCase.execute(monthlyIncome, currentExpenses)

    res.json({
      monthlyIncome,
      suggestions,
    })
  } catch (error: any) {
    console.error('Error getting expense suggestions:', error)
    res.status(500).json({ error: error.message || 'Failed to get expense suggestions' })
  }
})

/**
 * POST /api/expenses/calculate-emergency-fund
 * Calculate emergency fund required based on expenses
 */
router.post('/calculate-emergency-fund', async (req: Request, res: Response) => {
  try {
    // TODO: Extract userId from authentication token
    const userId = (req.body.userId || req.query.userId || 'demo-user-id') as string
    const { monthsCoverage = 6, month, year } = req.body

    const requiredAmount = await calculateEmergencyFundUseCase.execute(
      userId,
      monthsCoverage,
      month,
      year
    )

    res.json({
      userId,
      monthsCoverage,
      requiredAmount,
      recommendations: [
        `For ${monthsCoverage} months of coverage, you need $${requiredAmount.toFixed(2)}`,
        'Most financial experts recommend 3-6 months of essential expenses',
        'Consider your job stability and financial obligations when choosing coverage',
      ],
    })
  } catch (error: any) {
    console.error('Error calculating emergency fund from expenses:', error)
    res.status(500).json({ error: error.message || 'Failed to calculate emergency fund' })
  }
})

/**
 * POST /api/expenses/analyze-scenario
 * Analyze financial scenarios based on expense ranges
 */
router.post('/analyze-scenario', async (req: Request, res: Response) => {
  try {
    const { monthlyIncome, expenseRanges, goalType, goalAmount, timeHorizon } = req.body

    if (!monthlyIncome || monthlyIncome <= 0) {
      return res.status(400).json({ error: 'monthlyIncome must be greater than 0' })
    }

    if (!expenseRanges || !Array.isArray(expenseRanges)) {
      return res.status(400).json({ error: 'expenseRanges must be an array' })
    }

    if (!goalType || !['EMERGENCY_FUND', 'DEBT_PAYOFF', 'SAVINGS', 'RETIREMENT'].includes(goalType)) {
      return res.status(400).json({ error: 'Invalid goalType' })
    }

    const scenarios = await scenarioAnalysisUseCase.execute({
      monthlyIncome,
      expenseRanges,
      goalType,
      goalAmount,
      timeHorizon,
    })

    res.json({ scenarios })
  } catch (error: any) {
    console.error('Error analyzing scenario:', error)
    res.status(500).json({ error: error.message || 'Failed to analyze scenario' })
  }
})

export default router

