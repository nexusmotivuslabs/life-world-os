// API client for Master Travel System

import { handleFetchError, logApiSuccess, createApiError } from './errorHandler'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001'

export interface Location {
  id: string
  name: string
  city: string | null
  country: string | null
  description: string | null
  officialUrl: string | null
  category: string | null
  tags: string[]
  rating: number | null
  userRatingsTotal: number | null
  latitude: number | null
  longitude: number | null
}

export interface SavedLocation {
  id: string
  userId: string
  locationId: string
  notes: string | null
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

export interface LocationWithSaved {
  savedLocation: {
    id: string
    notes: string | null
    isFavorite: boolean
    createdAt: string
  }
  location: Location | null
}

/**
 * Make an API request with detailed error handling
 */
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
      headers: {
        'Content-Type': 'application/json',
      },
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
    if (error && typeof error === 'object' && 'endpoint' in error) {
      throw error
    }

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

export const travelApi = {
  /**
   * Health check
   */
  async health(): Promise<{ status: string; locationService: string; timestamp: string }> {
    return apiRequest<{ status: string; locationService: string; timestamp: string }>(
      '/api/travel/health',
      'GET'
    )
  },

  /**
   * Query for similar locations based on description
   */
  async queryLocations(
    description: string,
    location?: string,
    limit?: number
  ): Promise<{
    locations: Location[]
    hierarchy: Array<{
      category: string
      count: number
      locations: Location[]
    }>
    queryId: string
    summary: {
      total: number
      categories: string[]
      withWebsites: number
      averageRating: number
    }
  }> {
    return apiRequest<{
      locations: Location[]
      hierarchy: Array<{
        category: string
        count: number
        locations: Location[]
      }>
      queryId: string
      summary: {
        total: number
        categories: string[]
        withWebsites: number
        averageRating: number
      }
    }>(
      '/api/travel/locations/query',
      'POST',
      {
        description,
        location,
        limit,
      }
    )
  },

  /**
   * Get location details
   */
  async getLocation(id: string, refresh?: boolean): Promise<{ location: Location }> {
    const query = refresh ? '?refresh=true' : ''
    return apiRequest<{ location: Location }>(`/api/travel/locations/${id}${query}`, 'GET')
  },

  /**
   * Get alternative locations
   */
  async getAlternatives(
    locationId: string,
    radius?: number,
    limit?: number
  ): Promise<{ alternatives: Location[] }> {
    const params = new URLSearchParams()
    if (radius) params.append('radius', radius.toString())
    if (limit) params.append('limit', limit.toString())
    const query = params.toString() ? `?${params.toString()}` : ''
    return apiRequest<{ alternatives: Location[] }>(
      `/api/travel/locations/${locationId}/alternatives${query}`,
      'GET'
    )
  },

  /**
   * Save location to user's list
   */
  async saveLocation(
    locationId: string,
    notes?: string,
    isFavorite?: boolean
  ): Promise<{ savedLocation: SavedLocation }> {
    return apiRequest<{ savedLocation: SavedLocation }>(
      `/api/travel/locations/${locationId}/save`,
      'POST',
      {
        notes,
        isFavorite,
      }
    )
  },

  /**
   * Get user's saved locations
   */
  async getSavedLocations(favorites?: boolean): Promise<{ locations: LocationWithSaved[] }> {
    const params = new URLSearchParams()
    if (favorites) params.append('favorites', 'true')
    const query = params.toString() ? `?${params.toString()}` : ''
    return apiRequest<{ locations: LocationWithSaved[] }>(`/api/travel/saved${query}`, 'GET')
  },

  /**
   * Search locations
   */
  async searchLocations(
    query: string,
    location?: string,
    limit?: number
  ): Promise<{ locations: Location[] }> {
    return apiRequest<{ locations: Location[] }>(
      '/api/travel/locations/search',
      'POST',
      {
        query,
        location,
        limit,
      }
    )
  },
}

