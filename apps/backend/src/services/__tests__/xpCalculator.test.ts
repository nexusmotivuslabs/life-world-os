import { describe, it, expect } from 'vitest'
import { calculateXP } from '../xpCalculator'
import { ActivityType, Season } from '../../types'

describe('xpCalculator', () => {
  describe('calculateXP', () => {
    it('should calculate XP for WORK_PROJECT in SPRING', () => {
      const result = calculateXP(ActivityType.WORK_PROJECT, Season.SPRING)

      expect(result.overallXP).toBe(600) // 500 * 1.2
      expect(result.categoryXP.capacity).toBe(120) // 100 * 1.2
      expect(result.categoryXP.engines).toBe(360) // 300 * 1.2
      expect(result.seasonMultiplier).toBe(1.2)
    })

    it('should calculate XP for EXERCISE in SUMMER', () => {
      const result = calculateXP(ActivityType.EXERCISE, Season.SUMMER)

      expect(result.overallXP).toBe(260) // 200 * 1.3
      expect(result.categoryXP.capacity).toBe(325) // 250 * 1.3
      expect(result.seasonMultiplier).toBe(1.3)
    })

    it('should calculate XP for SAVE_EXPENSES in AUTUMN', () => {
      const result = calculateXP(ActivityType.SAVE_EXPENSES, Season.AUTUMN)

      expect(result.overallXP).toBe(1200) // 1000 * 1.2
      expect(result.categoryXP.oxygen).toBe(600) // 500 * 1.2
      expect(result.seasonMultiplier).toBe(1.2)
    })

    it('should calculate XP for REST in WINTER', () => {
      const result = calculateXP(ActivityType.REST, Season.WINTER)

      expect(result.overallXP).toBe(0)
      expect(result.categoryXP.capacity).toBe(0)
      expect(result.seasonMultiplier).toBe(1.1)
    })

    it('should use custom XP when provided', () => {
      const customXP = {
        overall: 1000,
        category: {
          capacity: 200,
          engines: 300,
        },
      }

      const result = calculateXP(ActivityType.CUSTOM, Season.SPRING, customXP)

      expect(result.overallXP).toBe(1200) // 1000 * 1.2
      expect(result.categoryXP.capacity).toBe(240) // 200 * 1.2
      expect(result.categoryXP.engines).toBe(360) // 300 * 1.2
      expect(result.categoryXP.oxygen).toBe(0) // Default for CUSTOM
    })

    it('should handle partial custom category XP', () => {
      const customXP = {
        category: {
          capacity: 500,
        },
      }

      const result = calculateXP(ActivityType.LEARNING, Season.SUMMER, customXP)

      expect(result.categoryXP.capacity).toBe(650) // 500 * 1.3
      expect(result.categoryXP.engines).toBe(130) // 100 * 1.3 (from base)
    })

    it('should apply season multiplier to all seasons correctly', () => {
      const baseXP = 1000

      const spring = calculateXP(ActivityType.SEASON_COMPLETION, Season.SPRING)
      const summer = calculateXP(ActivityType.SEASON_COMPLETION, Season.SUMMER)
      const autumn = calculateXP(ActivityType.SEASON_COMPLETION, Season.AUTUMN)
      const winter = calculateXP(ActivityType.SEASON_COMPLETION, Season.WINTER)

      expect(spring.overallXP).toBe(1200) // 1000 * 1.2
      expect(summer.overallXP).toBe(1300) // 1000 * 1.3
      expect(autumn.overallXP).toBe(1200) // 1000 * 1.2
      expect(winter.overallXP).toBe(1100) // 1000 * 1.1
    })

    it('should round XP values correctly', () => {
      const result = calculateXP(ActivityType.LEARNING, Season.SPRING)

      // All values should be integers (rounded)
      expect(Number.isInteger(result.overallXP)).toBe(true)
      expect(Number.isInteger(result.categoryXP.capacity)).toBe(true)
      expect(Number.isInteger(result.categoryXP.engines)).toBe(true)
    })
  })
})

