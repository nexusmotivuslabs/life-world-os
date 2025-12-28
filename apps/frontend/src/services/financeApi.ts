// API client for Master Finance System

import { handleFetchError, logApiSuccess, createApiError } from './errorHandler'
import { logger } from '../lib/logger'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Simple in-memory cache for Reality nodes
// Cache expires after 5 minutes
const NODE_CACHE = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCached(key: string): any | null {
  const cached = NODE_CACHE.get(key)
  if (!cached) return null
  
  const now = Date.now()
  if (now - cached.timestamp > CACHE_TTL) {
    NODE_CACHE.delete(key)
    return null
  }
  
  return cached.data
}

function setCache(key: string, data: any): void {
  NODE_CACHE.set(key, { data, timestamp: Date.now() })
}

function clearCache(): void {
  NODE_CACHE.clear()
}

export interface Agent {
  id: string
  type: string
  name: string
  description: string
  expertise: string
  avatar?: string
  order: number
  metadata?: {
    proTips?: string[]
    whatToAvoid?: string[]
    bestPractices?: string[]
  }
}

export interface Team {
  id: string
  name: string
  domain: string
  description: string
  icon?: string
  order: number
  agentCount?: number
}

export interface Guide {
  id: string
  title: string
  description: string
  category: string
  difficulty: number
  estimatedTime?: number
}

export interface Product {
  id: string
  organizationId: string // Products are owned by organizations (e.g., Nexus Motivus), not teams
  name: string
  description: string
  type: string
  icon?: string
  features?: any[]
  integrationPoints?: any[]
  isActive: boolean
  order: number
  // Security and access
  url?: string // Link to actual product/app (e.g., AWS service URL)
  accessUrl?: string // User-facing access URL
  securityLevel?: string // e.g., "HIGH", "MEDIUM", "LOW"
  requiresAuth?: boolean
  // Security information (if available)
  security?: {
    complianceStandards?: string[]
    encryptionAtRest?: boolean
    encryptionInTransit?: boolean
    authenticationMethod?: string
    lastSecurityReview?: string
    nextSecurityReview?: string
  }
}

export interface EmergencyFundGoal {
  targetAmount: number
  monthsCoverage: number
  monthlyExpenses: number
}

export interface EmergencyFundStatus {
  exists: boolean
  emergencyFund?: {
    id: string
    userId: string
    goal: EmergencyFundGoal
    currentAmount: number
    progressHistory?: Array<{
      date: string
      amount: number
      notes?: string
    }>
  }
  health?: {
    status: string
    monthsCovered: number
    recommendedMonths: number
    recommendations: string[]
    colorCode: string
  }
  progress: number
  remaining: number
  isGoalMet: boolean
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
    // If it's already an ApiError, re-throw it
    if (error && typeof error === 'object' && 'endpoint' in error) {
      throw error
    }

    // Handle network errors (fetch failed completely)
    const duration = Date.now() - startTime
    logger.error('API Request Failed (network)', error instanceof Error ? error : new Error(String(error)), {
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

export const agentsApi = {
  async list(): Promise<{ agents: Agent[] }> {
    return apiRequest<{ agents: Agent[] }>('/api/agents', 'GET')
  },
  async get(agentId: string): Promise<Agent> {
    return apiRequest<Agent>(`/api/agents/${agentId}`, 'GET')
  },
}

export const teamsApi = {
  async list(): Promise<{ teams: Team[] }> {
    return apiRequest<{ teams: Team[] }>('/api/teams', 'GET')
  },
  async get(teamId: string): Promise<Team> {
    return apiRequest<Team>(`/api/teams/${teamId}`, 'GET')
  },
}

export const guidesApi = {
  async list(agentId?: string, teamId?: string): Promise<{ guides: Guide[] }> {
    const params = new URLSearchParams()
    if (agentId) params.append('agentId', agentId)
    if (teamId) params.append('teamId', teamId)
    const query = params.toString()
    return apiRequest<{ guides: Guide[] }>(`/api/guides${query ? `?${query}` : ''}`, 'GET')
  },
  async get(guideId: string): Promise<Guide> {
    return apiRequest<Guide>(`/api/guides/${guideId}`, 'GET')
  },
}

// Bible Laws API
export interface BibleLaw {
  id: string
  lawNumber: number
  title: string
  scriptureReference: string
  originalText?: string
  domain: string
  domainApplication: string
  category?: string // Category: BIBLICAL, FUNDAMENTAL, STRATEGIC, SYSTEMIC, etc.
  principles: Array<{
    text: string
    examples?: Array<{
      description: string
      impact: 'good' | 'bad' | 'neutral'
    }>
  }>
  practicalApplications: string[]
  examples?: string[]
  warnings?: string[]
  relatedVerses?: string[]
  order: number
  createdAt: string
  updatedAt: string
}

export interface BibleLawDomain {
  domain: string
  count: number
}

// Power Laws API
export interface PowerLaw {
  id: string
  lawNumber: number
  title: string
  originalDescription: string
  domain: string
  domainApplication: string
  category?: string // Category: POWER, FUNDAMENTAL, STRATEGIC, SYSTEMIC, etc.
  strategies: string[]
  examples?: string[]
  warnings?: string[]
  counterStrategies?: string[]
  order: number
  createdAt: string
  updatedAt: string
}

export interface PowerLawDomain {
  domain: string
  count: number
}

export const powerLawsApi = {
  /**
   * Get all available Power Law domains with counts
   */
  async getDomains(): Promise<PowerLawDomain[]> {
    const response = await fetch(`${API_BASE}/api/power-laws/domains`)
    if (!response.ok) {
      throw new Error('Failed to fetch Power Law domains')
    }
    const data = await response.json()
    return data.domains
  },

  /**
   * Get all Power laws for a specific domain, optionally filtered by category
   */
  async getLawsByDomain(domain: string, category?: string): Promise<PowerLaw[]> {
    const categoryParam = category ? `&category=${category}` : ''
    const response = await fetch(`${API_BASE}/api/power-laws?domain=${domain}${categoryParam}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch Power laws for domain: ${domain}`)
    }
    const data = await response.json()
    return data.laws
  },

  /**
   * Get all available categories with counts
   */
  async getCategories(): Promise<Array<{ category: string; count: number }>> {
    const response = await fetch(`${API_BASE}/api/power-laws/categories`)
    if (!response.ok) {
      throw new Error('Failed to fetch Power Law categories')
    }
    const data = await response.json()
    return data.categories
  },

  /**
   * Get a specific Power law by ID
   */
  async getLawById(id: string): Promise<PowerLaw> {
    const response = await fetch(`${API_BASE}/api/power-laws/${id}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch Power law: ${id}`)
    }
    return response.json()
  },

  /**
   * Get a Power law by number and domain
   */
  async getLawByNumber(lawNumber: number, domain: string): Promise<PowerLaw> {
    const response = await fetch(`${API_BASE}/api/power-laws/by-number/${lawNumber}?domain=${domain}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch Power law ${lawNumber} for domain: ${domain}`)
    }
    return response.json()
  },
}

export const bibleLawsApi = {
  /**
   * Get all available Bible Law domains with counts
   */
  async getDomains(): Promise<BibleLawDomain[]> {
    const response = await fetch(`${API_BASE}/api/bible-laws/domains`)
    if (!response.ok) {
      throw new Error('Failed to fetch Bible Law domains')
    }
    const data = await response.json()
    return data.domains
  },

  /**
   * Get all Bible laws for a specific domain, optionally filtered by category
   */
  async getLawsByDomain(domain: string, category?: string): Promise<BibleLaw[]> {
    const categoryParam = category ? `&category=${category}` : ''
    const response = await fetch(`${API_BASE}/api/bible-laws?domain=${domain}${categoryParam}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch Bible laws for domain: ${domain}`)
    }
    const data = await response.json()
    return data.laws
  },

  /**
   * Get all available categories with counts
   */
  async getCategories(): Promise<Array<{ category: string; count: number }>> {
    const response = await fetch(`${API_BASE}/api/bible-laws/categories`)
    if (!response.ok) {
      throw new Error('Failed to fetch Bible Law categories')
    }
    const data = await response.json()
    return data.categories
  },

  /**
   * Get a specific Bible law by ID
   */
  async getLawById(id: string): Promise<BibleLaw> {
    const response = await fetch(`${API_BASE}/api/bible-laws/${id}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch Bible law: ${id}`)
    }
    return response.json()
  },

  /**
   * Get a Bible law by number and domain
   */
  async getLawByNumber(lawNumber: number, domain: string): Promise<BibleLaw> {
    const response = await fetch(`${API_BASE}/api/bible-laws/by-number/${lawNumber}?domain=${domain}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch Bible law ${lawNumber} for domain: ${domain}`)
    }
    return response.json()
  },
}

export interface RealityNode {
  id: string
  title: string
  description?: string
  nodeType: string
  category?: string
  immutable?: boolean
  orderIndex: number
  metadata?: any
  parent?: {
    id: string
    title: string
    nodeType: string
    category?: string
  }
  children?: RealityNode[]
}

export interface RealityNodeHierarchy {
  ancestors: Array<{
    id: string
    title: string
    description?: string
    nodeType: string
    category?: string
    immutable?: boolean
    orderIndex: number
  }>
  node: RealityNode
  children: RealityNode[]
  depth: number
}

export const realityNodeApi = {
  getNodes: async (params?: {
    parentId?: string | null
    nodeType?: string
    category?: string
    immutable?: boolean
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.parentId !== undefined) {
      queryParams.append('parentId', params.parentId === null ? 'null' : params.parentId)
    }
    if (params?.nodeType) queryParams.append('nodeType', params.nodeType)
    if (params?.category) queryParams.append('category', params.category)
    if (params?.immutable !== undefined) queryParams.append('immutable', String(params.immutable))
    
    const query = queryParams.toString()
    const cacheKey = `nodes-${query}`
    
    // Check cache first
    const cached = getCached(cacheKey)
    if (cached) return cached
    
    const result = await apiRequest<{ nodes: RealityNode[]; count: number }>(
      `/api/reality-nodes${query ? `?${query}` : ''}`,
      'GET'
    )
    
    // Cache the result
    setCache(cacheKey, result)
    return result
  },

  getRoots: async () => {
    const cacheKey = 'roots'
    const cached = getCached(cacheKey)
    if (cached) return cached
    
    const result = await apiRequest<{ roots: RealityNode[]; count: number }>('/api/reality-nodes/roots', 'GET')
    setCache(cacheKey, result)
    return result
  },

  getNode: async (id: string) => {
    const cacheKey = `node-${id}`
    const cached = getCached(cacheKey)
    if (cached) return cached
    
    const result = await apiRequest<{ node: RealityNode }>(`/api/reality-nodes/${id}`, 'GET')
    setCache(cacheKey, result)
    return result
  },

  getAncestors: async (id: string) => {
    const cacheKey = `ancestors-${id}`
    const cached = getCached(cacheKey)
    if (cached) return cached
    
    const result = await apiRequest<{ ancestors: RealityNode[]; depth: number }>(`/api/reality-nodes/${id}/ancestors`, 'GET')
    setCache(cacheKey, result)
    return result
  },

  getChildren: async (id: string) => {
    const cacheKey = `children-${id}`
    const cached = getCached(cacheKey)
    if (cached) return cached
    
    const result = await apiRequest<{ children: RealityNode[]; count: number }>(`/api/reality-nodes/${id}/children`, 'GET')
    setCache(cacheKey, result)
    return result
  },

  getHierarchy: async (id: string) => {
    const cacheKey = `hierarchy-${id}`
    const cached = getCached(cacheKey)
    if (cached) return cached
    
    const result = await apiRequest<RealityNodeHierarchy>(`/api/reality-nodes/${id}/hierarchy`, 'GET')
    setCache(cacheKey, result)
    return result
  },
  
  // Cache management
  clearCache: () => clearCache(),
}

export const productsApi = {
  async list(teamId?: string): Promise<{ products: Product[] }> {
    const endpoint = teamId ? `/api/products?teamId=${teamId}` : '/api/products'
    return apiRequest<{ products: Product[] }>(endpoint, 'GET')
  },
  async get(productId: string): Promise<Product> {
    return apiRequest<Product>(`/api/products/${productId}`, 'GET')
  },
  // Emergency Fund APIs
  async setEmergencyFundGoal(data: {
    userId: string
    targetAmount: number
    monthsCoverage: number
    monthlyExpenses: number
    currentAmount?: number
  }): Promise<EmergencyFundStatus> {
    return apiRequest<EmergencyFundStatus>('/api/products/emergency-fund/goal', 'POST', data)
  },
  async updateEmergencyFundProgress(data: {
    userId: string
    amount: number
    notes?: string
  }): Promise<EmergencyFundStatus> {
    return apiRequest<EmergencyFundStatus>('/api/products/emergency-fund/progress', 'PUT', data)
  },
  async getEmergencyFundStatus(userId: string): Promise<EmergencyFundStatus> {
    return apiRequest<EmergencyFundStatus>(`/api/products/emergency-fund/status?userId=${userId}`, 'GET')
  },
  async calculateEmergencyFundRequired(data: {
    monthlyExpenses: number
    monthsCoverage?: number
  }): Promise<{
    monthlyExpenses: number
    monthsCoverage: number
    requiredAmount: number
    recommendations: string[]
  }> {
    return apiRequest('/api/products/emergency-fund/calculate', 'POST', data)
  },
  
  /**
   * Calculate emergency fund with risk profile (decision clarifier)
   */
  async calculateEmergencyFundWithRiskProfile(data: {
    employmentType: string
    jobSecurity: string
    incomeStructure: string
    numberOfDependents: number
    isSoleEarner: boolean
    riskTolerance: string
    numberOfIncomeSources: number
    monthlyEssentialExpenses: number
    currentEmergencySavings: number
    liquidityType: 'INSTANT' | 'DELAYED' | 'MIXED'
    monthlySurplus?: number
  }): Promise<any> {
    return apiRequest('/api/products/emergency-fund/calculate-with-risk-profile', 'POST', data)
  },
}
