import { create } from 'zustand'
import { rieApi } from '../services/api'
import type { DashboardData, ConstraintResult } from '../types/rie'

interface DashboardStore {
  data: DashboardData | null
  loading: boolean
  error: string | null
  refreshing: boolean
  lastFetchedAt: string | null

  constraintDetail: ConstraintResult | null
  loadingConstraint: boolean
  errorConstraint: string | null

  fetchDashboard: () => Promise<void>
  fetchConstraint: (id: string) => Promise<void>
  clearConstraintDetail: () => void
  refresh: () => Promise<void>
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  data: null,
  loading: false,
  error: null,
  refreshing: false,
  lastFetchedAt: null,

  constraintDetail: null,
  loadingConstraint: false,
  errorConstraint: null,

  fetchDashboard: async () => {
    set({ loading: true, error: null })
    try {
      const data = await rieApi.getDashboard()
      set({ data, loading: false, lastFetchedAt: new Date().toISOString() })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard'
      set({ error: message, loading: false })
    }
  },

  fetchConstraint: async (id: string) => {
    set({ loadingConstraint: true, errorConstraint: null, constraintDetail: null })
    try {
      const constraint = await rieApi.getConstraint(id)
      set({ constraintDetail: constraint, loadingConstraint: false })
    } catch (err: unknown) {
      const detail =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof (err.response as { data?: { detail?: string } }).data?.detail === 'string'
        ? (err.response as { data: { detail: string } }).data.detail
        : null
      const message =
        detail ?? (err instanceof Error ? err.message : 'Failed to load constraint')
      set({ errorConstraint: message, loadingConstraint: false })
    }
  },

  clearConstraintDetail: () => {
    set({ constraintDetail: null, errorConstraint: null })
  },

  refresh: async () => {
    set({ refreshing: true, error: null })
    try {
      await rieApi.refresh()
      const data = await rieApi.getDashboard()
      set({ data, refreshing: false, lastFetchedAt: new Date().toISOString() })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Refresh failed'
      set({ error: message, refreshing: false })
    }
  },
}))
