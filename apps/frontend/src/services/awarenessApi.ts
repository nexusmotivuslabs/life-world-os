/**
 * Awareness Layer API Service
 * 
 * TypeScript service for interacting with the Awareness Layer API endpoints.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

// Type definitions
export type AwarenessLayerCategory = 'ROOT' | 'EXAMINE' | 'REFUTE'

export interface AwarenessLayer {
  id: string
  title: string
  description: string | null
  category: AwarenessLayerCategory
  parentId: string | null
  orderIndex: number
  isRoot: boolean
  metadata: any | null
  createdAt: string
  updatedAt: string
  parent?: {
    id: string
    title: string
    category: AwarenessLayerCategory
    orderIndex?: number
  } | null
  children?: {
    id: string
    title: string
    category: AwarenessLayerCategory
    orderIndex: number
  }[]
}

export interface AwarenessLayersResponse {
  layers: AwarenessLayer[]
  count: number
}

export interface AwarenessLayersByCategory {
  category: AwarenessLayerCategory
  layers: AwarenessLayer[]
  count: number
}

export interface CategoriesResponse {
  categories: AwarenessLayersByCategory[]
}

export interface CreateAwarenessLayerRequest {
  title: string
  description?: string
  category: AwarenessLayerCategory
  parentId?: string | null
  orderIndex?: number
  isRoot?: boolean
  metadata?: any
}

export interface UpdateAwarenessLayerRequest {
  title?: string
  description?: string
  category?: AwarenessLayerCategory
  parentId?: string | null
  orderIndex?: number
  isRoot?: boolean
  metadata?: any
}

// API client
export const awarenessApi = {
  /**
   * Get all awareness layers with optional filters
   */
  async getLayers(filters?: {
    category?: AwarenessLayerCategory
    parentId?: string | null
    isRoot?: boolean
  }): Promise<AwarenessLayersResponse> {
    const params = new URLSearchParams()
    if (filters?.category) params.append('category', filters.category)
    if (filters?.parentId !== undefined) {
      params.append('parentId', filters.parentId || 'null')
    }
    if (filters?.isRoot !== undefined) {
      params.append('isRoot', filters.isRoot.toString())
    }

    const queryString = params.toString()
    const url = `${API_BASE}/api/awareness-layers${queryString ? `?${queryString}` : ''}`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Failed to fetch awareness layers')
    }
    return response.json()
  },

  /**
   * Get all root awareness layers
   */
  async getRootLayers(): Promise<AwarenessLayersResponse> {
    const response = await fetch(`${API_BASE}/api/awareness-layers/roots`)
    if (!response.ok) {
      throw new Error('Failed to fetch root awareness layers')
    }
    return response.json()
  },

  /**
   * Get a specific awareness layer by ID
   */
  async getLayerById(id: string): Promise<AwarenessLayer> {
    const response = await fetch(`${API_BASE}/api/awareness-layers/${id}`)
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Awareness layer not found')
      }
      throw new Error('Failed to fetch awareness layer')
    }
    return response.json()
  },

  /**
   * Get all children of a specific awareness layer
   */
  async getChildren(id: string): Promise<AwarenessLayersResponse> {
    const response = await fetch(`${API_BASE}/api/awareness-layers/${id}/children`)
    if (!response.ok) {
      throw new Error('Failed to fetch children')
    }
    return response.json()
  },

  /**
   * Get awareness layers grouped by category
   */
  async getLayersByCategory(): Promise<CategoriesResponse> {
    const response = await fetch(`${API_BASE}/api/awareness-layers/categories`)
    if (!response.ok) {
      throw new Error('Failed to fetch layers by category')
    }
    return response.json()
  },

  /**
   * Create a new awareness layer (admin)
   */
  async createLayer(data: CreateAwarenessLayerRequest): Promise<AwarenessLayer> {
    const response = await fetch(`${API_BASE}/api/awareness-layers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create awareness layer' }))
      throw new Error(error.error || 'Failed to create awareness layer')
    }
    return response.json()
  },

  /**
   * Update an awareness layer (admin)
   */
  async updateLayer(id: string, data: UpdateAwarenessLayerRequest): Promise<AwarenessLayer> {
    const response = await fetch(`${API_BASE}/api/awareness-layers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update awareness layer' }))
      throw new Error(error.error || 'Failed to update awareness layer')
    }
    return response.json()
  },

  /**
   * Get Bible awareness layer (the primary root, orderIndex: 1)
   */
  async getBibleLayer(): Promise<AwarenessLayer> {
    return this.getLayerById('bible-awareness-layer')
  },

  /**
   * Get Nihilism awareness layer
   */
  async getNihilismLayer(): Promise<AwarenessLayer> {
    return this.getLayerById('nihilism-awareness-layer')
  },

  /**
   * Get People awareness layer
   */
  async getPeopleLayer(): Promise<AwarenessLayer> {
    return this.getLayerById('people-awareness-layer')
  },
}


