// API service for Life World OS

import { handleFetchError, logApiSuccess, createApiError } from './errorHandler'
import { logger } from '../lib/logger'

const API_URL = (import.meta.env?.VITE_API_URL as string | undefined) || 'http://localhost:5001'

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token')
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const url = `${API_URL}${endpoint}`
  const method = options.method || 'GET'
  const startTime = Date.now()

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

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
    logger.error('API Request Failed (network)', error instanceof Error ? error : new Error(String(error)), {
      endpoint,
      method,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    })

    throw createApiError(
      'Unable to reach the API. Make sure the backend is running and VITE_API_URL is correct.',
      endpoint,
      method,
      undefined,
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error))
    )
  }
}

// Auth
export const authApi = {
  register: (email: string, username: string, password: string, firstName?: string, lastName?: string) =>
    request<{ token: string; user: { id: string; email: string; username: string; firstName?: string | null; lastName?: string | null } }>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ email, username, password, firstName, lastName }),
      }
    ),

  login: (email: string, password: string) =>
    request<{ token: string; user: { id: string; email: string; username: string; firstName?: string | null; lastName?: string | null } }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    ),

  googleLogin: (idToken: string) =>
    request<{
      token: string
      user: { id: string; email: string; username: string; firstName?: string | null; lastName?: string | null }
      requiresFirstName?: boolean
    }>(
      '/api/auth/google',
      {
        method: 'POST',
        body: JSON.stringify({ idToken }),
      }
    ),
}

// User profile
export const userApi = {
  getProfile: () =>
    request<{
      id: string
      email: string
      username: string
      firstName?: string | null
      lastName?: string | null
      [key: string]: unknown
    }>('/api/user/profile'),
  updateProfile: (data: { firstName?: string; lastName?: string }) =>
    request<{
      id: string
      email: string
      username: string
      firstName?: string | null
      lastName?: string | null
      [key: string]: unknown
    }>('/api/user/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
}

// Dashboard
export const dashboardApi = {
  getDashboard: () => request<any>('/api/dashboard'),
}

// XP
export const xpApi = {
  getXP: () => request<any>('/api/xp'),
  calculateXP: (activityType: string, customXP?: any) =>
    request<any>('/api/xp/calculate', {
      method: 'POST',
      body: JSON.stringify({ activityType, customXP }),
    }),
  recordActivity: (data: any) =>
    request<any>('/api/xp/activity', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getHistory: (limit = 50) => request<any[]>(`/api/xp/history?limit=${limit}`),
  getCategories: () => request<any>('/api/xp/categories'),
}

// Resources
export const resourcesApi = {
  getResources: () => request<any>('/api/resources'),
  updateResources: (changes: any) =>
    request<any>('/api/resources/transaction', {
      method: 'POST',
      body: JSON.stringify(changes),
    }),
  getHistory: (limit = 50) => request<any[]>(`/api/resources/history?limit=${limit}`),
}

// Clouds
export const cloudsApi = {
  getClouds: () => request<any>('/api/clouds'),
  updateCloud: (cloudType: string, strength: number) =>
    request<any>(`/api/clouds/${cloudType}`, {
      method: 'PUT',
      body: JSON.stringify({ strength }),
    }),
}

// Seasons
export const seasonsApi = {
  getCurrent: () => request<any>('/api/seasons/current'),
  transition: (season: string, reason?: string) =>
    request<any>('/api/seasons/transition', {
      method: 'POST',
      body: JSON.stringify({ season, reason }),
    }),
  getHistory: (limit = 20) => request<any[]>(`/api/seasons/history?limit=${limit}`),
}

// Engines
export const enginesApi = {
  getEngines: () => request<any[]>('/api/engines'),
  createEngine: (data: any) =>
    request<any>('/api/engines', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateEngine: (id: string, data: any) =>
    request<any>(`/api/engines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteEngine: (id: string) =>
    request<{ message: string }>(`/api/engines/${id}`, {
      method: 'DELETE',
    }),
}

// Progression
export const progressionApi = {
  getOverall: () => request<any>('/api/progression/overall'),
  getCategories: () => request<any>('/api/progression/categories'),
  getMilestones: () => request<any[]>('/api/progression/milestones'),
  checkMilestones: () =>
    request<{ newMilestones: string[]; unlockedKeys: number }>('/api/progression/check-milestones', {
      method: 'POST',
    }),
  getBalance: () => request<any>('/api/progression/balance'),
}

// Questionnaire
export const questionnaireApi = {
  getStatus: () => request<{ hasCompletedQuestionnaire: boolean }>('/api/questionnaire/status'),
  submit: (answers: any) =>
    request<{ success: boolean; message: string; stats: any }>('/api/questionnaire/submit', {
      method: 'POST',
      body: JSON.stringify(answers),
    }),
}

// Training
export const trainingApi = {
  getModules: () => request<any>('/api/training'),
  completeTask: (taskId: string, notes?: string) =>
    request<any>(`/api/training/tasks/${taskId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),
  getProgress: () => request<any>('/api/training/progress'),
}

// Investments
export const investmentsApi = {
  getInvestments: () => request<any>('/api/investments'),
  createInvestment: (data: any) =>
    request<any>('/api/investments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateInvestment: (id: string, data: any) =>
    request<any>(`/api/investments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteInvestment: (id: string) =>
    request<any>(`/api/investments/${id}`, {
      method: 'DELETE',
    }),
  processGrowth: () =>
    request<any>('/api/investments/process-growth', {
      method: 'POST',
    }),
}

// Portfolio Rebalancing
import type {
  PortfolioRebalancingConfig,
  CreateRebalancingConfigInput,
  UpdateRebalancingConfigInput,
  RebalancingStatus,
  RebalancingRecommendation,
} from '../types'

export const portfolioRebalancingApi = {
  getConfig: () => request<PortfolioRebalancingConfig>('/api/portfolio-rebalancing/config'),
  createOrUpdateConfig: (data: CreateRebalancingConfigInput) =>
    request<PortfolioRebalancingConfig>('/api/portfolio-rebalancing/config', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateConfig: (data: UpdateRebalancingConfigInput) =>
    request<PortfolioRebalancingConfig>('/api/portfolio-rebalancing/config', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getStatus: (availableContribution?: number) => {
    const query = availableContribution ? `?availableContribution=${availableContribution}` : ''
    return request<RebalancingStatus>(`/api/portfolio-rebalancing/status${query}`)
  },
  getRecommendations: (availableContribution?: number) => {
    const query = availableContribution ? `?availableContribution=${availableContribution}` : ''
    return request<{ recommendations: RebalancingRecommendation[] }>(
      `/api/portfolio-rebalancing/recommendations${query}`
    )
  },
}

// Admin - Direct data updates
export const adminApi = {
  updateXP: (data: { overallXP?: number; categoryXP?: { capacity?: number; engines?: number; oxygen?: number; meaning?: number; optionality?: number } }) =>
    request<any>('/api/xp/admin', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  updateResources: (data: { oxygen?: number; water?: number; gold?: number; armor?: number; keys?: number }) =>
    request<any>('/api/resources/admin', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

// Chat - AI Guide Bot
export const chatApi = {
  sendMessage: (message: string, sessionId?: string) =>
    request<{ response: string; sessionId: string; id: string }>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, sessionId }),
    }),
  getHistory: (sessionId: string) =>
    request<{ id: string; messages: Array<{ id: string; role: string; content: string; createdAt: string }> }>(
      `/api/chat/history/${sessionId}`
    ),
}
