/**
 * Navigation Store (Zustand)
 * 
 * Centralized navigation state management.
 * Tracks navigation history, current path, and provides navigation methods.
 */

import { create } from 'zustand'

export interface NavigationState {
  // Current navigation state
  currentPath: string
  previousPath: string | null
  history: string[]
  
  // Navigation methods
  navigateTo: (path: string, options?: { replace?: boolean; state?: unknown }) => void
  goBack: () => void
  goForward: () => void
  
  // Internal methods (used by hook)
  setCurrentPath: (path: string) => void
  clearHistory: () => void
  
  // Navigation statistics
  getNavigationStats: () => {
    totalNavigations: number
    uniquePaths: number
    mostVisitedPath: string | null
  }
}

const MAX_HISTORY_LENGTH = 50 // Limit history size

export const useNavigationStore = create<NavigationState>((set, get) => ({
  currentPath: typeof window !== 'undefined' ? window.location.pathname : '/',
  previousPath: null,
  history: [],

  setCurrentPath: (path: string) => {
    const state = get()
    const newHistory = [...state.history, state.currentPath]
    
    // Limit history size
    const limitedHistory = newHistory.slice(-MAX_HISTORY_LENGTH)
    
    set({
      currentPath: path,
      previousPath: state.currentPath !== path ? state.currentPath : state.previousPath,
      history: limitedHistory,
    })
  },

  navigateTo: (path: string, options?: { replace?: boolean; state?: unknown }) => {
    // This will be called by the hook which has access to React Router's navigate
    // The actual navigation is handled by React Router
    // This method is here for future enhancements (analytics, guards, etc.)
    const currentState = get()
    
    // Update state
    if (!options?.replace) {
      const newHistory = [...currentState.history, currentState.currentPath]
      const limitedHistory = newHistory.slice(-MAX_HISTORY_LENGTH)
      
      set({
        currentPath: path,
        previousPath: currentState.currentPath !== path ? currentState.currentPath : currentState.previousPath,
        history: limitedHistory,
      })
    } else {
      // Replace current entry (don't add to history)
      set({
        currentPath: path,
        previousPath: currentState.previousPath,
      })
    }
  },

  goBack: () => {
    const state = get()
    if (state.history.length > 0) {
      const previousPath = state.history[state.history.length - 1]
      const newHistory = state.history.slice(0, -1)
      
      set({
        currentPath: previousPath,
        previousPath: state.currentPath,
        history: newHistory,
      })
    }
  },

  goForward: () => {
    // Forward navigation would require a forward history stack
    // For now, this is a placeholder for future implementation
    // React Router handles browser forward/back natively
  },

  clearHistory: () => {
    set({
      history: [],
      previousPath: null,
    })
  },

  getNavigationStats: () => {
    const state = get()
    const pathCounts = new Map<string, number>()
    
    // Count all paths in history
    state.history.forEach(path => {
      pathCounts.set(path, (pathCounts.get(path) || 0) + 1)
    })
    
    // Count current path
    pathCounts.set(state.currentPath, (pathCounts.get(state.currentPath) || 0) + 1)
    
    // Find most visited path
    let mostVisitedPath: string | null = null
    let maxCount = 0
    pathCounts.forEach((count, path) => {
      if (count > maxCount) {
        maxCount = count
        mostVisitedPath = path
      }
    })
    
    return {
      totalNavigations: state.history.length + 1, // +1 for current path
      uniquePaths: pathCounts.size,
      mostVisitedPath,
    }
  },
}))





