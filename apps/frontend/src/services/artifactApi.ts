/**
 * Artifact API Service
 * 
 * Frontend API client for user artifacts (saved recommendations, calculations, etc.)
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function apiRequest<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  }

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(url, options)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to fetch')
  }
}

export type ArtifactType = 'RECOMMENDATION' | 'CALCULATION' | 'SCENARIO' | 'REPORT' | 'NOTE'

export interface UserArtifact {
  id: string
  userId: string
  productId?: string | null
  productName: string
  type: ArtifactType
  title: string
  description?: string | null
  data: any
  tags: string[]
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

export interface SaveArtifactInput {
  productId?: string
  productName: string
  type: ArtifactType
  title: string
  data: any
  description?: string
  tags?: string[]
}

export const artifactApi = {
  /**
   * Save a new artifact
   */
  async save(input: SaveArtifactInput & { userId?: string }): Promise<{ artifact: UserArtifact }> {
    return apiRequest<{ artifact: UserArtifact }>('/api/artifacts', 'POST', input)
  },

  /**
   * List all artifacts for a user
   */
  async list(userId?: string, filters?: {
    type?: ArtifactType
    favorites?: boolean
    productId?: string
  }): Promise<{ artifacts: UserArtifact[] }> {
    const params = new URLSearchParams()
    if (userId) params.append('userId', userId)
    if (filters?.type) params.append('type', filters.type)
    if (filters?.favorites) params.append('favorites', 'true')
    if (filters?.productId) params.append('productId', filters.productId)
    
    const query = params.toString()
    const endpoint = `/api/artifacts${query ? `?${query}` : ''}`
    return apiRequest<{ artifacts: UserArtifact[] }>(endpoint, 'GET')
  },

  /**
   * Get artifact by ID
   */
  async get(id: string): Promise<{ artifact: UserArtifact }> {
    return apiRequest<{ artifact: UserArtifact }>(`/api/artifacts/${id}`, 'GET')
  },

  /**
   * Search artifacts
   */
  async search(query: string, userId?: string): Promise<{ artifacts: UserArtifact[] }> {
    const params = new URLSearchParams()
    params.append('q', query)
    if (userId) params.append('userId', userId)
    
    return apiRequest<{ artifacts: UserArtifact[] }>(`/api/artifacts/search?${params.toString()}`, 'GET')
  },

  /**
   * Toggle favorite status
   */
  async toggleFavorite(id: string): Promise<{ artifact: { id: string; isFavorite: boolean } }> {
    return apiRequest<{ artifact: { id: string; isFavorite: boolean } }>(`/api/artifacts/${id}/favorite`, 'PUT')
  },

  /**
   * Delete artifact
   */
  async delete(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/api/artifacts/${id}`, 'DELETE')
  },
}


