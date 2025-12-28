import { describe, it, expect } from 'vitest'
import { calculateBalance } from '../balanceService'
import { CategoryXP } from '../../types'

describe('balanceService', () => {
  describe('calculateBalance', () => {
    it('should return balanced when all categories are equal', () => {
      const categoryXP: CategoryXP = {
        capacity: 1000,
        engines: 1000,
        oxygen: 1000,
        meaning: 1000,
        optionality: 1000,
      }

      const result = calculateBalance(categoryXP)

      expect(result.isBalanced).toBe(true)
      expect(result.warnings).toHaveLength(0)
      expect(result.recommendations).toHaveLength(0)
    })

    it('should detect imbalance when one category is significantly below average', () => {
      const categoryXP: CategoryXP = {
        capacity: 500, // Low
        engines: 2000,
        oxygen: 2000,
        meaning: 2000,
        optionality: 2000,
      }

      const result = calculateBalance(categoryXP)

      expect(result.isBalanced).toBe(false)
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings).toContain('Capacity level is significantly below average')
      expect(result.recommendations).toContain('Focus on health, energy, and resilience activities')
    })

    it('should detect multiple imbalances', () => {
      const categoryXP: CategoryXP = {
        capacity: 500,
        engines: 500,
        oxygen: 2000,
        meaning: 2000,
        optionality: 2000,
      }

      const result = calculateBalance(categoryXP)

      expect(result.isBalanced).toBe(false)
      expect(result.warnings.length).toBeGreaterThanOrEqual(2)
    })

    it('should calculate average level correctly', () => {
      const categoryXP: CategoryXP = {
        capacity: 1000,
        engines: 2000,
        oxygen: 1500,
        meaning: 1500,
        optionality: 1000,
      }

      const result = calculateBalance(categoryXP)
      const expectedAverage = (1 + 2 + 1.5 + 1.5 + 1) / 5 // Levels: 1, 2, 1.5, 1.5, 1

      expect(result.averageLevel).toBeCloseTo(expectedAverage, 1)
    })

    it('should handle edge case with zero XP', () => {
      const categoryXP: CategoryXP = {
        capacity: 0,
        engines: 0,
        oxygen: 0,
        meaning: 0,
        optionality: 0,
      }

      const result = calculateBalance(categoryXP)

      expect(result.isBalanced).toBe(true)
      expect(result.averageLevel).toBe(0)
    })

    it('should handle very high XP values', () => {
      const categoryXP: CategoryXP = {
        capacity: 100000,
        engines: 100000,
        oxygen: 100000,
        meaning: 100000,
        optionality: 100000,
      }

      const result = calculateBalance(categoryXP)

      expect(result.isBalanced).toBe(true)
      expect(result.averageLevel).toBeGreaterThan(0)
    })
  })
})

