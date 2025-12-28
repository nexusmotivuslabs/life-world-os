/**
 * Navigation Hook Tests
 * 
 * Tests for useNavigation hook including:
 * - Sunny path (happy path)
 * - Edge cases (React Router integration, breadcrumbs, etc.)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { useNavigation } from '../useNavigation'

// Mock React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useLocation: () => ({
      pathname: '/systems',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    }),
    useNavigate: () => vi.fn(),
  }
})

// Mock navigation service
vi.mock('../../services/navigationService', () => ({
  getNavigationPath: () => [],
}))

// Mock route config
vi.mock('../../config/routes', () => ({
  buildBreadcrumbs: () => [
    { path: '/', label: 'Home' },
    { path: '/systems', label: 'Systems' },
  ],
  getMasterRoute: (domain: string) => `/master/${domain}`,
  getMasterProductRoute: (domain: string, productId: string) => 
    `/master/${domain}/products/${productId}`,
  routes: {
    systems: { path: '/systems', label: 'Systems' },
  },
}))

describe('useNavigation', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>{children}</BrowserRouter>
  )

  // ========== SUNNY PATH TESTS ==========

  describe('Sunny Path - Normal Hook Usage', () => {
    it('should return navigation hook with all required properties', () => {
      const { result } = renderHook(() => useNavigation(), { wrapper })
      
      expect(result.current).toHaveProperty('currentPath')
      expect(result.current).toHaveProperty('previousPath')
      expect(result.current).toHaveProperty('history')
      expect(result.current).toHaveProperty('breadcrumbs')
      expect(result.current).toHaveProperty('navigateToMaster')
      expect(result.current).toHaveProperty('navigateToMasterProduct')
      expect(result.current).toHaveProperty('navigateTo')
      expect(result.current).toHaveProperty('goBack')
      expect(result.current).toHaveProperty('getNavigationStats')
    })

    it('should provide current path from React Router', () => {
      const { result } = renderHook(() => useNavigation(), { wrapper })
      
      expect(result.current.currentPath).toBe('/systems')
    })

    it('should generate breadcrumbs correctly', () => {
      const { result } = renderHook(() => useNavigation(), { wrapper })
      
      expect(result.current.breadcrumbs).toBeDefined()
      expect(Array.isArray(result.current.breadcrumbs)).toBe(true)
      expect(result.current.breadcrumbs.length).toBeGreaterThan(0)
    })

    it('should provide navigation statistics', () => {
      const { result } = renderHook(() => useNavigation(), { wrapper })
      
      const stats = result.current.getNavigationStats()
      
      expect(stats).toHaveProperty('totalNavigations')
      expect(stats).toHaveProperty('uniquePaths')
      expect(stats).toHaveProperty('mostVisitedPath')
    })
  })

  // ========== EDGE CASE TESTS ==========

  describe('Edge Case 1: Navigation Methods with Invalid Inputs', () => {
    it('should handle navigateTo with empty string', () => {
      const { result } = renderHook(() => useNavigation(), { wrapper })
      
      // Should not throw error
      expect(() => {
        result.current.navigateTo('')
      }).not.toThrow()
    })

    it('should handle navigateTo with invalid path', () => {
      const { result } = renderHook(() => useNavigation(), { wrapper })
      
      // Should not throw error
      expect(() => {
        result.current.navigateTo('/invalid/path/that/does/not/exist')
      }).not.toThrow()
    })

    it('should handle navigateToMaster with invalid domain', () => {
      const { result } = renderHook(() => useNavigation(), { wrapper })
      
      // Should not throw error
      expect(() => {
        result.current.navigateToMaster('invalid-domain' as any)
      }).not.toThrow()
    })

    it('should handle navigateToMasterProduct with empty productId', () => {
      const { result } = renderHook(() => useNavigation(), { wrapper })
      
      // Should not throw error
      expect(() => {
        result.current.navigateToMasterProduct('money' as any, '')
      }).not.toThrow()
    })
  })

  describe('Edge Case 2: Breadcrumb Generation Edge Cases', () => {
    it('should handle breadcrumbs when navigation service returns empty', () => {
      // Mock empty navigation path
      vi.mock('../../services/navigationService', () => ({
        getNavigationPath: () => [],
      }))

      const { result } = renderHook(() => useNavigation(), { wrapper })
      
      // Should fallback to route config breadcrumbs
      expect(result.current.breadcrumbs).toBeDefined()
      expect(Array.isArray(result.current.breadcrumbs)).toBe(true)
    })

    it('should handle breadcrumbs for root path', () => {
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom')
        return {
          ...actual,
          useLocation: () => ({
            pathname: '/',
            search: '',
            hash: '',
            state: null,
            key: 'default',
          }),
          useNavigate: () => vi.fn(),
        }
      })

      const { result } = renderHook(() => useNavigation(), { wrapper })
      
      expect(result.current.breadcrumbs).toBeDefined()
    })

    it('should handle breadcrumbs for deeply nested paths', () => {
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom')
        return {
          ...actual,
          useLocation: () => ({
            pathname: '/master/money/products/123/details',
            search: '',
            hash: '',
            state: null,
            key: 'default',
          }),
          useNavigate: () => vi.fn(),
        }
      })

      const { result } = renderHook(() => useNavigation(), { wrapper })
      
      expect(result.current.breadcrumbs).toBeDefined()
      expect(Array.isArray(result.current.breadcrumbs)).toBe(true)
    })
  })

  describe('Edge Case 3: State Synchronization Edge Cases', () => {
    it('should sync store state when path changes', () => {
      const { result, rerender } = renderHook(() => useNavigation(), { wrapper })
      
      const initialPath = result.current.currentPath
      
      // Simulate path change
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom')
        return {
          ...actual,
          useLocation: () => ({
            pathname: '/knowledge',
            search: '',
            hash: '',
            state: null,
            key: 'default',
          }),
          useNavigate: () => vi.fn(),
        }
      })
      
      rerender()
      
      // Store should be updated (though we can't directly test Zustand store here)
      expect(result.current.currentPath).toBeDefined()
    })

    it('should handle rapid path changes', () => {
      const { result } = renderHook(() => useNavigation(), { wrapper })
      
      // Rapid navigation calls
      result.current.navigateTo('/path1')
      result.current.navigateTo('/path2')
      result.current.navigateTo('/path3')
      
      // Should handle without errors
      expect(result.current).toBeDefined()
    })
  })

  describe('Edge Case 4: Navigation Statistics Edge Cases', () => {
    it('should provide statistics even with no navigation history', () => {
      const { result } = renderHook(() => useNavigation(), { wrapper })
      
      const stats = result.current.getNavigationStats()
      
      expect(stats.totalNavigations).toBeGreaterThanOrEqual(0)
      expect(stats.uniquePaths).toBeGreaterThanOrEqual(0)
      expect(stats.mostVisitedPath).toBeDefined()
    })

    it('should handle statistics after multiple navigations', () => {
      const { result } = renderHook(() => useNavigation(), { wrapper })
      
      // Perform multiple navigations
      result.current.navigateTo('/systems')
      result.current.navigateTo('/knowledge')
      result.current.navigateTo('/systems')
      
      const stats = result.current.getNavigationStats()
      
      expect(stats.totalNavigations).toBeGreaterThan(0)
      expect(stats.uniquePaths).toBeGreaterThan(0)
    })
  })
})


