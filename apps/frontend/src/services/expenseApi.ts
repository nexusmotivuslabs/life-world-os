/**
 * Expense API Client
 * 
 * Client functions for expense management API endpoints.
 */
import { handleFetchError, logApiSuccess, createApiError } from './errorHandler'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

/**
 * Make an API request with detailed error handling
 */
function getAuthHeaders(): HeadersInit {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

async function apiRequest<T>(
  endpoint: string,
  method: string = 'GET',
  body?: any
): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  const startTime = Date.now()

  try {
    const options: RequestInit = {
      method,
      headers: getAuthHeaders(),
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(url, options)
    const duration = Date.now() - startTime

    if (!response.ok) {
      await handleFetchError(response, endpoint, method)
    }

    const data = await response.json()
    logApiSuccess(endpoint, method, response.status, duration)
    return data
  } catch (error) {
    // If it's already an ApiError, re-throw it
    if (error && typeof error === 'object' && 'endpoint' in error) {
      throw error
    }

    // Handle network errors (fetch failed completely)
    const duration = Date.now() - startTime
    console.error('❌ API Request Failed (network):', {
      endpoint,
      method,
      error: error instanceof Error ? error.message : String(error),
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    })

    throw createApiError(
      `Network error: ${error instanceof Error ? error.message : 'Failed to connect to server'}`,
      endpoint,
      method,
      undefined,
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error))
    )
  }
}

export enum ExpenseCategoryType {
  HOUSING = 'HOUSING',
  FOOD = 'FOOD',
  TRANSPORTATION = 'TRANSPORTATION',
  UTILITIES = 'UTILITIES',
  INSURANCE = 'INSURANCE',
  HEALTHCARE = 'HEALTHCARE',
  DEBT_PAYMENTS = 'DEBT_PAYMENTS',
  ENTERTAINMENT = 'ENTERTAINMENT',
  PERSONAL_CARE = 'PERSONAL_CARE',
  EDUCATION = 'EDUCATION',
  SAVINGS_INVESTMENTS = 'SAVINGS_INVESTMENTS',
  MISCELLANEOUS = 'MISCELLANEOUS',
}

export interface CategoryExpense {
  category: ExpenseCategoryType
  amount: number
  notes?: string
}

export interface MonthlyExpense {
  id: string
  userId: string
  monthlyIncome: number
  expenses: CategoryExpense[]
  month: number
  year: number
  totalExpenses: number
  netCashFlow: number
  expensePercentage: number
  breakdown: {
    totalExpenses: number
    essentialExpenses: number
    nonEssentialExpenses: number
    netCashFlow: number
    expensePercentage: number
    byCategory: Array<{
      category: ExpenseCategoryType
      amount: number
      percentage: number
      notes?: string
    }>
  }
}

export interface ExpenseBreakdown {
  expense: MonthlyExpense | null
  breakdown: any
  recommendations: string[]
  emergencyFundRequired: number
}

export interface ExpenseSuggestion {
  category: ExpenseCategoryType
  suggestedAmount: number
  currentAmount: number
  isOverBudget: boolean
  info: {
    type: ExpenseCategoryType
    name: string
    description: string
    icon: string
    recommendedPercentage?: number
    isEssential: boolean
    examples: string[]
  }
}

export const expenseApi = {
  /**
   * Create or update monthly expenses
   */
  async createOrUpdate(data: {
    userId?: string
    monthlyIncome: number
    expenses: CategoryExpense[]
    month?: number
    year?: number
  }): Promise<MonthlyExpense> {
    return apiRequest<MonthlyExpense>('/api/expenses', 'POST', data)
  },

  /**
   * Get expense breakdown for a user
   */
  async getBreakdown(
    userId?: string,
    month?: number,
    year?: number
  ): Promise<ExpenseBreakdown> {
    const params = new URLSearchParams()
    if (userId) params.append('userId', userId)
    if (month) params.append('month', month.toString())
    if (year) params.append('year', year.toString())
    const query = params.toString()
    return apiRequest<ExpenseBreakdown>(`/api/expenses${query ? `?${query}` : ''}`, 'GET')
  },

  /**
   * Get expense suggestions based on income
   */
  async getSuggestions(
    monthlyIncome: number,
    currentExpenses?: CategoryExpense[]
  ): Promise<{
    monthlyIncome: number
    suggestions: ExpenseSuggestion[]
  }> {
    const params = new URLSearchParams()
    params.append('monthlyIncome', monthlyIncome.toString())
    if (currentExpenses) {
      params.append('currentExpenses', JSON.stringify(currentExpenses))
    }
    return apiRequest(`/api/expenses/suggestions?${params.toString()}`, 'GET')
  },

  /**
   * Calculate emergency fund required from expenses
   */
  async calculateEmergencyFund(data: {
    userId?: string
    monthsCoverage?: number
    month?: number
    year?: number
  }): Promise<{
    userId: string
    monthsCoverage: number
    requiredAmount: number
    recommendations: string[]
  }> {
    return apiRequest('/api/expenses/calculate-emergency-fund', 'POST', data)
  },

  /**
   * Analyze financial scenarios based on expense ranges
   */
  async analyzeScenario(data: {
    monthlyIncome: number
    expenseRanges: Array<{
      category: ExpenseCategoryType
      min: number
      max: number
    }>
    goalType: 'EMERGENCY_FUND' | 'DEBT_PAYOFF' | 'SAVINGS' | 'RETIREMENT'
    goalAmount?: number
    timeHorizon?: number
  }): Promise<{
    scenarios: Array<{
      scenario: 'OPTIMISTIC' | 'MODERATE' | 'CONSERVATIVE'
      totalExpenses: { min: number; max: number; average: number }
      essentialExpenses: { min: number; max: number; average: number }
      monthlySurplus: { min: number; max: number; average: number }
      timeToGoal: { monthsMin: number; monthsMax: number; monthsAverage: number }
      recommendations: string[]
      researchBasedInsights: string[]
    }>
  }> {
    return apiRequest('/api/expenses/analyze-scenario', 'POST', data)
  },
}

