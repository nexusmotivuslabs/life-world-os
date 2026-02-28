import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Recharts (and other libs) use ResizeObserver; jsdom does not provide it
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
}

// Mock useGameStore for components that depend on it (PublicRoute, ProtectedRoute)
vi.mock('../store/useGameStore', () => {
  const mockGetState = vi.fn(() => ({ dashboard: null, isDemo: false }))
  const useGameStore = vi.fn(() => ({
    fetchDashboard: vi.fn(),
    dashboard: null,
    isDemo: false,
  }))
  useGameStore.getState = mockGetState
  return { useGameStore }
})

// Cleanup after each test
afterEach(() => {
  cleanup()
})

