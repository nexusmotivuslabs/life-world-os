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
        capacity: 0, // Level 1
        engines: 15000, // Level 16
        oxygen: 15000,
        meaning: 15000,
        optionality: 15000,
      }

      const result = calculateBalance(categoryXP)

      expect(result.isBalanced).toBe(false)
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings).toContain('Capacity level is significantly below average')
      expect(result.recommendations).toContain('Focus on health, energy, and resilience activities')
    })

    it('should detect multiple imbalances', () => {
      const categoryXP: CategoryXP = {
        capacity: 0,
        engines: 0,
        oxygen: 20000,
        meaning: 20000,
        optionality: 20000,
      }

      const result = calculateBalance(categoryXP)

      expect(result.isBalanced).toBe(false)
      expect(result.warnings.length).toBeGreaterThanOrEqual(2)
    })

    it('should calculate average level correctly', () => {
      const categoryXP: CategoryXP = {
        capacity: 1000, // Level 2
        engines: 2000, // Level 3
        oxygen: 1500, // Level 2
        meaning: 1500, // Level 2
        optionality: 1000, // Level 2
      }

      const result = calculateBalance(categoryXP)
      const expectedAverage = (2 + 3 + 2 + 2 + 2) / 5 // 11/5 = 2.2

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
      // Each 0 XP gives level 1 (floor(0/1000)+1), average = 1

      expect(result.isBalanced).toBe(true)
      expect(result.averageLevel).toBe(1)
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

