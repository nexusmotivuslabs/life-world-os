/**
 * Navigation Store Tests
 * 
 * Tests for Zustand navigation store including:
 * - Sunny path (happy path)
 * - Edge cases (empty history, max history, concurrent updates, etc.)
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useNavigationStore } from '../useNavigationStore'

describe('useNavigationStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useNavigationStore())
    act(() => {
      result.current.clearHistory()
      result.current.setCurrentPath('/')
    })
  })

  // ========== SUNNY PATH TESTS ==========

  describe('Sunny Path - Normal Navigation Flow', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useNavigationStore())
      
      expect(result.current.currentPath).toBeDefined()
      expect(result.current.previousPath).toBeNull()
      expect(result.current.history).toEqual([])
    })

    it('should update current path when navigating', () => {
      const { result } = renderHook(() => useNavigationStore())
      
      act(() => {
        result.current.setCurrentPath('/systems')
      })
      
      expect(result.current.currentPath).toBe('/systems')
      expect(result.current.previousPath).toBe('/')
    })

    it('should track navigation history', () => {
      const { result } = renderHook(() => useNavigationStore())
      
      act(() => {
        result.current.setCurrentPath('/')
        result.current.setCurrentPath('/systems')
        result.current.setCurrentPath('/knowledge')
      })
      
      expect(result.current.history).toContain('/')
      expect(result.current.history).toContain('/systems')
      expect(result.current.currentPath).toBe('/knowledge')
      expect(result.current.previousPath).toBe('/systems')
    })

    it('should provide navigation statistics', () => {
      const { result } = renderHook(() => useNavigationStore())
      
      act(() => {
        result.current.setCurrentPath('/')
        result.current.setCurrentPath('/systems')
        result.current.setCurrentPath('/knowledge')
        result.current.setCurrentPath('/systems') // Visit again
      })
      
      const stats = result.current.getNavigationStats()
      
      expect(stats.totalNavigations).toBeGreaterThan(0)
      expect(stats.uniquePaths).toBeGreaterThan(0)
      expect(stats.mostVisitedPath).toBeDefined()
    })
  })

  // ========== EDGE CASE TESTS ==========

  describe('Edge Case 1: Empty History and Initial State', () => {
    it('should handle empty history gracefully', () => {
      const { result } = renderHook(() => useNavigationStore())
      
      act(() => {
        result.current.clearHistory()
      })
      
      expect(result.current.history).toEqual([])
      expect(result.current.previousPath).toBeNull()
    })

    it('should handle navigation from empty state', () => {
      const { result } = renderHook(() => useNavigationStore())
      
      act(() => {
        result.current.clearHistory()
        result.current.setCurrentPath('/systems')
      })
      
      expect(result.current.currentPath).toBe('/systems')
      expect(result.current.history).toHaveLength(0) // No previous path to track
    })

    it('should handle goBack with empty history', () => {
      const { result } = renderHook(() => useNavigationStore())
      
      act(() => {
        result.current.clearHistory()
        result.current.goBack()
      })
      
      // Should not crash, history should remain empty
      expect(result.current.history).toEqual([])
    })
  })

  describe('Edge Case 2: Maximum History Length', () => {
    it('should limit history to MAX_HISTORY_LENGTH (50)', () => {
      const { result } = renderHook(() => useNavigationStore())
      const MAX_HISTORY = 50
      
      act(() => {
        // Navigate more than MAX_HISTORY times
        for (let i = 0; i < MAX_HISTORY + 10; i++) {
          result.current.setCurrentPath(`/path-${i}`)
        }
      })
      
      // History should be limited to MAX_HISTORY
      expect(result.current.history.length).toBeLessThanOrEqual(MAX_HISTORY)
    })

    it('should maintain most recent history when limit is reached', () => {
      const { result } = renderHook(() => useNavigationStore())
      
      act(() => {
        result.current.setCurrentPath('/initial')
        // Navigate many times
        for (let i = 0; i < 60; i++) {
          result.current.setCurrentPath(`/path-${i}`)
        }
      })
      
      // Most recent paths should be in history
      expect(result.current.history).toContain('/path-58')
      expect(result.current.history).toContain('/path-59')
      // Oldest paths should be removed
      expect(result.current.history).not.toContain('/initial')
    })
  })

  describe('Edge Case 3: Concurrent Navigation Updates', () => {
    it('should handle rapid consecutive navigation calls', () => {
      const { result } = renderHook(() => useNavigationStore())
      
      act(() => {
        // Rapid navigation calls
        result.current.setCurrentPath('/path1')
        result.current.setCurrentPath('/path2')
        result.current.setCurrentPath('/path3')
        result.current.setCurrentPath('/path4')
      })
      
      // Should have correct final state
      expect(result.current.currentPath).toBe('/path4')
      expect(result.current.previousPath).toBe('/path3')
      expect(result.current.history.length).toBe(3) // path1, path2, path3
    })

    it('should handle navigateTo with replace option', () => {
      const { result } = renderHook(() => useNavigationStore())
      
      act(() => {
        result.current.setCurrentPath('/initial')
        result.current.navigateTo('/replaced', { replace: true })
      })
      
      // Replace should not add to history
      expect(result.current.currentPath).toBe('/replaced')
      // History should not include /replaced (since it replaced /initial)
      expect(result.current.history).not.toContain('/replaced')
    })
  })

  describe('Edge Case 4: Invalid and Edge Path Values', () => {
    it('should handle empty string path', () => {
      const { result } = renderHook(() => useNavigationStore())
      
      act(() => {
        result.current.setCurrentPath('')
      })
      
      expect(result.current.currentPath).toBe('')
    })

    it('should handle very long paths', () => {
      const { result } = renderHook(() => useNavigationStore())
      const longPath = '/very/long/path/' + 'a'.repeat(1000)
      
      act(() => {
        result.current.setCurrentPath(longPath)
      })
      
      expect(result.current.currentPath).toBe(longPath)
    })

    it('should handle special characters in paths', () => {
      const { result } = renderHook(() => useNavigationStore())
      const specialPath = '/path-with-special-chars-!@#$%^&*()'
      
      act(() => {
        result.current.setCurrentPath(specialPath)
      })
      
      expect(result.current.currentPath).toBe(specialPath)
    })

    it('should handle same path navigation (no-op)', () => {
      const { result } = renderHook(() => useNavigationStore())
      
      act(() => {
        result.current.setCurrentPath('/systems')
        result.current.setCurrentPath('/systems') // Same path
      })
      
      expect(result.current.currentPath).toBe('/systems')
      // Previous path should remain unchanged if navigating to same path
      expect(result.current.previousPath).toBe('/')
    })
  })

  describe('Edge Case 5: Navigation Statistics Edge Cases', () => {
    it('should handle statistics with no navigation history', () => {
      const { result } = renderHook(() => useNavigationStore())
      
      act(() => {
        result.current.clearHistory()
      })
      
      const stats = result.current.getNavigationStats()
      
      expect(stats.totalNavigations).toBeGreaterThanOrEqual(0)
      expect(stats.uniquePaths).toBeGreaterThanOrEqual(0)
    })

    it('should correctly identify most visited path', () => {
      const { result } = renderHook(() => useNavigationStore())
      
      act(() => {
        // Visit /systems multiple times
        result.current.setCurrentPath('/systems')
        result.current.setCurrentPath('/knowledge')
        result.current.setCurrentPath('/systems')
        result.current.setCurrentPath('/tiers')
        result.current.setCurrentPath('/systems')
      })
      
      const stats = result.current.getNavigationStats()
      
      expect(stats.mostVisitedPath).toBe('/systems')
    })

    it('should handle tie in most visited paths', () => {
      const { result } = renderHook(() => useNavigationStore())
      
      act(() => {
        // Equal visits
        result.current.setCurrentPath('/path1')
        result.current.setCurrentPath('/path2')
        result.current.setCurrentPath('/path1')
        result.current.setCurrentPath('/path2')
      })
      
      const stats = result.current.getNavigationStats()
      
      // Should return one of the tied paths
      expect(['/path1', '/path2']).toContain(stats.mostVisitedPath)
    })
  })
})


