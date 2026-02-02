// API client for Health/Capacity System

import { handleFetchError, logApiSuccess, createApiError } from './errorHandler'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export interface HealthStatus {
  capacity: number
  capacityBand: 'critical' | 'low' | 'medium' | 'high' | 'optimal'
  isInBurnout: boolean
  consecutiveHighEffortDays: number
  recoveryActionsThisWeek: number
  lastRecoveryActionAt: string | null
  energy: {
    current: number
    usable: number
    capacityCap: number
  }
  systems: {
    energy: {
      capacityModifiesEnergy: boolean
      currentEnergyCap: number
      baseEnergyCap: number
    }
    burnout: {
      isInBurnout: boolean
      riskLevel: 'high' | 'medium' | 'low'
      consecutiveLowCapacityDays: number
    }
    xp: {
      efficiencyModifier: number
    }
  }
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

export const healthApi = {
  /**
   * Get current health/capacity status
   */
  async getStatus(): Promise<HealthStatus> {
    return apiRequest<HealthStatus>('/api/health/status')
  },
}

