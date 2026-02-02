/**
 * useSystemData Hook
 *
 * Fetches and filters agents, teams, and products for a given system.
 * When agentTypes/teamDomains are provided, filters the global API responses.
 * When omitted (e.g. Energy, Travel), returns empty arrays or skips fetch.
 */

import { useEffect, useState } from 'react'
import { agentsApi, teamsApi, productsApi, Agent, Team, Product } from '../services/financeApi'
import { useDataFetch } from './useDataFetch'
import {
  AgentsResponseSchema,
  TeamsResponseSchema,
  validateApiResponse,
} from '../lib/dataValidation'
import { logger } from '../lib/logger'

export interface UseSystemDataOptions {
  /** System-specific cache key prefix */
  cacheKeyPrefix: string
  /** Agent types to filter by (e.g. INVESTOR, FINANCIAL_ADVISOR for Finance) */
  agentTypes?: string[]
  /** Team domains to filter by (e.g. INVESTMENT, TAX_OPTIMIZATION for Finance) */
  teamDomains?: string[]
  /** Product filter function - return true to include product */
  productFilter?: (product: Product) => boolean
  /** Whether to fetch products (default: true when productFilter provided or agentTypes/teamDomains) */
  fetchProducts?: boolean
}

export interface UseSystemDataResult {
  teams: Team[]
  agents: Agent[]
  products: Product[]
  productsLoading: boolean
  loading: boolean
}

export function useSystemData(options: UseSystemDataOptions): UseSystemDataResult {
  const {
    cacheKeyPrefix,
    agentTypes,
    teamDomains,
    productFilter,
    fetchProducts = true,
  } = options

  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(false)

  const shouldFetchAgentsTeams =
    (agentTypes && agentTypes.length > 0) || (teamDomains && teamDomains.length > 0)

  const {
    data: agentsData,
    loading: agentsLoading,
  } = useDataFetch(
    async () => {
      const response = await agentsApi.list()
      return validateApiResponse(AgentsResponseSchema, response, { agents: [] })
    },
    {
      cacheKey: `${cacheKeyPrefix}-agents`,
      fallbackData: { agents: [] },
      enableHealthCheck: true,
      retries: 3,
      dataSourceId: `${cacheKeyPrefix}-agents`,
      dataSourceName: 'Expert Agents',
      enabled: shouldFetchAgentsTeams,
    }
  )

  const {
    data: teamsData,
    loading: teamsLoading,
  } = useDataFetch(
    async () => {
      const response = await teamsApi.list()
      return validateApiResponse(TeamsResponseSchema, response, { teams: [] })
    },
    {
      cacheKey: `${cacheKeyPrefix}-teams`,
      fallbackData: { teams: [] },
      enableHealthCheck: true,
      retries: 3,
      dataSourceId: `${cacheKeyPrefix}-teams`,
      dataSourceName: 'Domain Teams',
      enabled: shouldFetchAgentsTeams,
    }
  )

  useEffect(() => {
    if (!fetchProducts) return

    const loadProducts = async () => {
      try {
        setProductsLoading(true)
        const response = await productsApi.list()
        const allProducts = response.products || []
        const filtered = productFilter
          ? allProducts.filter(productFilter)
          : allProducts
        setProducts(filtered.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)))
      } catch (error) {
        logger.error(
          'Failed to load products',
          error instanceof Error ? error : new Error(String(error))
        )
        setProducts([])
      } finally {
        setProductsLoading(false)
      }
    }
    loadProducts()
  }, [fetchProducts, productFilter])

  const allAgents = (agentsData?.agents || []).map((agent) => ({
    ...agent,
    order: agent.order ?? 0,
  }))
  const allTeams = (teamsData?.teams || []).map((team) => ({
    ...team,
    order: team.order ?? 0,
  }))

  const agents =
    agentTypes && agentTypes.length > 0
      ? allAgents.filter((a) => agentTypes.includes(a.type))
      : allAgents

  const teams =
    teamDomains && teamDomains.length > 0
      ? allTeams.filter((t) => teamDomains.includes(t.domain))
      : allTeams

  const loading = shouldFetchAgentsTeams && (agentsLoading || teamsLoading)

  return {
    teams,
    agents,
    products,
    productsLoading,
    loading,
  }
}
