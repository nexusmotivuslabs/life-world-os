import { create } from 'zustand'
import { DashboardData } from '../types'
import { dashboardApi } from '../services/api'
import { getDemoData } from '../lib/demoData'

interface GameState {
  dashboard: DashboardData | null
  loading: boolean
  error: string | null
  isDemo: boolean
  hasCompletedQuestionnaire: boolean | null
  fetchDashboard: () => Promise<void>
  // Step 8: setDashboard removed - UI cannot mutate state directly, must fetch from backend
  loadDemo: () => void
  setQuestionnaireStatus: (completed: boolean) => void
}

export const useGameStore = create<GameState>((set) => ({
  dashboard: null,
  loading: false,
  error: null,
  isDemo: false,
  hasCompletedQuestionnaire: null,

  fetchDashboard: async () => {
    const token = localStorage.getItem('token')
    
    // If no token, use demo data
    if (!token) {
      set({ loading: true, error: null })
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      set({ dashboard: getDemoData(), loading: false, isDemo: true })
      return
    }

    set({ loading: true, error: null })
    try {
      const data = await dashboardApi.getDashboard()
      set({ dashboard: data, loading: false, isDemo: false })
    } catch (error) {
      // If API fails and no token, fall back to demo
      if (!token) {
        set({ dashboard: getDemoData(), loading: false, isDemo: true })
      } else {
        set({
          error: error instanceof Error ? error.message : 'Failed to fetch dashboard',
          loading: false,
        })
      }
    }
  },

  // Step 8: setDashboard removed - UI cannot mutate state directly, must fetch from backend
  // State can only be updated via fetchDashboard() which gets truth from backend

  loadDemo: () => {
    set({ dashboard: getDemoData(), isDemo: true, loading: false, error: null })
  },

  setQuestionnaireStatus: (completed: boolean) => {
    set({ hasCompletedQuestionnaire: completed })
  },
}))

