// API client for Master Energy System

import { handleFetchError, logApiSuccess, createApiError } from './errorHandler'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001'

export interface Sleep {
  id: string
  userId: string
  date: string
  hoursSlept: number
  quality: number
  bedTime?: string
  wakeTime?: string
  energyRestored: number
  notes?: string
  isOptimal: boolean
  category: 'insufficient' | 'short' | 'optimal' | 'long'
  durationFormatted: string
  createdAt: string
  updatedAt: string
}

export interface EnergyBoost {
  id: string
  userId: string
  type: 'CAFFEINE' | 'FOOD' | 'SUPPLEMENT' | 'OTHER'
  amount: number
  duration: number
  decayRate: number
  expiresAt: string
  timeUntilExpiry: number
  isActive: boolean
  createdAt: string
}

export interface EnergyStatus {
  baseEnergy: number // Live energy (after burndown)
  restoredEnergy: number // Original restored amount
  capacity: number
  capacityCap: number
  isInBurnout: boolean
  temporaryBoosts: Array<{
    id: string
    type: string
    amount: number
    duration: number
    expiresAt: string
    timeUntilExpiry: number
    isActive: boolean
  }>
  totalUsable: number
  baseEnergyPercentage: number
  burndown: {
    energyDecayed: number
    hoursElapsed: number
    decayRatePerHour: number
    hoursUntilDepletion: number | null
    depletedAt: string | null
  } | null
  restoredAt: string | null
}

export interface EnergyRestoration {
  sleep: {
    id: string
    date: string
    hoursSlept: number
    quality: number
    energyRestored: number
  } | null
  restorationAmount: number
  newBaseEnergy: number
}

/**
 * Make an API request with detailed error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token')
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await handleFetchError(response, endpoint)
    throw createApiError(error.message, response.status, endpoint)
  }

  const data = await response.json()
  logApiSuccess(endpoint, data)
  return data
}

export const sleepApi = {
  /**
   * Log sleep for a specific date
   */
  async logSleep(data: {
    date: string
    hoursSlept: number
    quality: number
    bedTime?: string
    wakeTime?: string
    notes?: string
  }): Promise<Sleep> {
    return apiRequest<Sleep>('/api/sleep', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Get sleep history
   */
  async getHistory(startDate?: string, endDate?: string): Promise<{ sleepLogs: Sleep[]; count: number }> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    
    const query = params.toString()
    return apiRequest<{ sleepLogs: Sleep[]; count: number }>(
      `/api/sleep${query ? `?${query}` : ''}`
    )
  },

  /**
   * Get most recent sleep log
   */
  async getRecent(): Promise<{ sleep: Sleep | null }> {
    return apiRequest<{ sleep: Sleep | null }>('/api/sleep/recent')
  },

  /**
   * Calculate energy restoration for a specific date
   */
  async calculateRestoration(date: string): Promise<EnergyRestoration> {
    return apiRequest<EnergyRestoration>('/api/sleep/calculate-restoration', {
      method: 'POST',
      body: JSON.stringify({ date }),
    })
  },
}

export const energyApi = {
  /**
   * Get current energy status
   */
  async getStatus(): Promise<EnergyStatus> {
    return apiRequest<EnergyStatus>('/api/energy/status')
  },

  /**
   * Create a temporary energy boost
   */
  async createBoost(data: {
    type: 'CAFFEINE' | 'FOOD' | 'SUPPLEMENT' | 'OTHER'
    amount: number
    duration: number // minutes
    decayRate: number // energy per hour
  }): Promise<EnergyBoost> {
    return apiRequest<EnergyBoost>('/api/energy/boosts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Get active energy boosts
   */
  async getBoosts(): Promise<{ boosts: EnergyBoost[]; count: number }> {
    return apiRequest<{ boosts: EnergyBoost[]; count: number }>('/api/energy/boosts')
  },

  /**
   * Clean up expired energy boosts
   */
  async cleanupBoosts(): Promise<{ success: boolean; deletedCount: number; message: string }> {
    return apiRequest<{ success: boolean; deletedCount: number; message: string }>(
      '/api/energy/boosts/cleanup',
      { method: 'POST' }
    )
  },
}

