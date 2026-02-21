// API client for Master Travel System

import { handleFetchError, logApiSuccess, createApiError } from './errorHandler'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

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

  /**
   * Visa & Move Checklist: options for dropdowns (countries, visa types, education, safety/fit).
   * AI and frontend can use this endpoint to know available dimensions.
   */
  async getVisaMoveOptions(): Promise<VisaMoveOptionsResponse> {
    return apiRequest<VisaMoveOptionsResponse>('/api/travel/visa-move/options', 'GET')
  },

  /**
   * Visa & Move Checklist: get suggested next steps for the given profile.
   * Returns suggested prerequisites, documents, residency steps, safety/fit items, key dates.
   */
  async getVisaMoveGuidance(params: VisaMoveGuidanceParams): Promise<VisaMoveGuidanceResponse> {
    return apiRequest<VisaMoveGuidanceResponse>('/api/travel/visa-move/guidance', 'POST', params)
  },

  /**
   * The 3 viable optionality paths. No hype. For feedback like "these are the only real ones".
   */
  async getVisaMovePaths(): Promise<VisaMovePathsResponse> {
    return apiRequest<VisaMovePathsResponse>('/api/travel/visa-move/paths', 'GET')
  },

  /**
   * Design Under Constraint: mental model and checklist (pensions, property, ISAs, tax residency, reframe).
   */
  async getDesignUnderConstraint(): Promise<DesignUnderConstraintResponse> {
    return apiRequest<DesignUnderConstraintResponse>('/api/travel/visa-move/design-under-constraint', 'GET')
  },

  /**
   * Get the user's move context (current location & financial plumbing).
   */
  async getVisaMoveContext(): Promise<{ context: UserMoveContextPayload | null }> {
    return apiRequest<{ context: UserMoveContextPayload | null }>('/api/travel/visa-move/context', 'GET')
  },

  /**
   * Save the user's move context so guidance respects long-term compounding.
   */
  async putVisaMoveContext(payload: UserMoveContextPayload): Promise<{ context: UserMoveContextPayload }> {
    return apiRequest<{ context: UserMoveContextPayload }>('/api/travel/visa-move/context', 'PUT', { payload })
  },
}

export interface VisaMoveOptionItem {
  value: string
  label: string
}

export interface VisaMoveOptionsResponse {
  countries: VisaMoveOptionItem[]
  visaTypes: VisaMoveOptionItem[]
  educationLevels: VisaMoveOptionItem[]
  safetyFitDimensions: VisaMoveOptionItem[]
}

export interface VisaMoveGuidanceParams {
  targetCountry: string
  visaType: string
  educationLevel?: string
  safetyFitDimension?: string
}

export interface VisaMoveGuidanceResponse {
  suggestedPrerequisites: string[]
  suggestedDocuments: string[]
  suggestedResidencySteps: string[]
  suggestedSafetyFit: string[]
  suggestedKeyDates: string[]
  note?: string
}

export interface OptionalityPathItem {
  id: string
  title: string
  subtitle: string
  bullets: string[]
  pros: string[]
  cons: string[]
  summary: string
}

export interface VisaMovePathsResponse {
  intro: string
  paths: OptionalityPathItem[]
}

/** Payload for move context: current location & financial plumbing (Design Under Constraint). */
export interface UserMoveContextPayload {
  currentCountry?: string
  currentCountryCode?: string
  pensions?: {
    hasPension?: boolean
    country?: string
    keepContributing?: boolean
    notes?: string
  }
  property?: {
    scenario?: 'keep_rent' | 'sell_before' | 'keep_empty' | 'none'
    country?: string
    canRent?: boolean
    rentCoversMortgage?: boolean
    notes?: string
  }
  isas?: {
    hasIsa?: boolean
    hasInvestments?: boolean
    country?: string
    notes?: string
  }
  taxResidency?: {
    country?: string
    residencyChangeDate?: string
    notes?: string
  }
  family?: {
    hasDependants?: boolean
    stabilityPriority?: boolean
  }
  liquidity?: {
    runwayMonths?: number
    runwayCurrency?: string
  }
  notes?: string
}

export interface DesignUnderConstraintResponse {
  firstPrinciple: { headline: string; body: string; systems: string[] }
  threeLayers: { headline: string; layers: string[] }
  pensionsUk: Record<string, unknown>
  property: Record<string, unknown>
  isas: Record<string, unknown>
  taxResidency: Record<string, unknown>
  family: Record<string, unknown>
  cleanChecklist: { title: string; intro: string; sections: Array<{ id: string; title: string; questions: string[] }>; closing: string }
  reframe: { insteadOf: string; ask: string; note: string }
}

