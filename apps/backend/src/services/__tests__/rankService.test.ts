import { describe, it, expect } from 'vitest'
import {
  calculateOverallRank,
  calculateOverallLevel,
  calculateCategoryLevel,
  getXPForNextRank,
  getRankProgress,
} from '../rankService'
import { OverallRank } from '../../types'

describe('rankService', () => {
  describe('calculateOverallRank', () => {
    it('should return RECRUIT for 0 XP', () => {
      expect(calculateOverallRank(0)).toBe(OverallRank.RECRUIT)
    })

    it('should return RECRUIT for 999 XP', () => {
      expect(calculateOverallRank(999)).toBe(OverallRank.RECRUIT)
    })

    it('should return PRIVATE for 1000 XP', () => {
      expect(calculateOverallRank(1000)).toBe(OverallRank.PRIVATE)
    })

    it('should return CORPORAL for 5000 XP', () => {
      expect(calculateOverallRank(5000)).toBe(OverallRank.CORPORAL)
    })

    it('should return SERGEANT for 10000 XP', () => {
      expect(calculateOverallRank(10000)).toBe(OverallRank.SERGEANT)
    })

    it('should return highest rank for very high XP', () => {
      expect(calculateOverallRank(200000)).toBe(OverallRank.COMMAND_SERGEANT_MAJOR)
    })
  })

  describe('calculateOverallLevel', () => {
    it('should return level 1 for 0 XP', () => {
      expect(calculateOverallLevel(0)).toBe(1)
    })

    it('should return level 1 for 4999 XP', () => {
      expect(calculateOverallLevel(4999)).toBe(1)
    })

    it('should return level 2 for 5000 XP', () => {
      expect(calculateOverallLevel(5000)).toBe(2)
    })

    it('should return level 10 for 50000 XP', () => {
      expect(calculateOverallLevel(50000)).toBe(11)
    })
  })

  describe('calculateCategoryLevel', () => {
    it('should return level 1 for 0 category XP', () => {
      expect(calculateCategoryLevel(0)).toBe(1)
    })

    it('should return level 1 for 999 category XP', () => {
      expect(calculateCategoryLevel(999)).toBe(1)
    })

    it('should return level 2 for 1000 category XP', () => {
      expect(calculateCategoryLevel(1000)).toBe(2)
    })

    it('should return level 5 for 5000 category XP', () => {
      expect(calculateCategoryLevel(5000)).toBe(6)
    })
  })

  describe('getXPForNextRank', () => {
    it('should return XP needed for next rank', () => {
      expect(getXPForNextRank(OverallRank.RECRUIT, 500)).toBe(500) // Need 500 more to reach 1000
    })

    it('should return null for max rank', () => {
      expect(getXPForNextRank(OverallRank.COMMAND_SERGEANT_MAJOR, 200000)).toBeNull()
    })

    it('should calculate correctly for mid-rank', () => {
      expect(getXPForNextRank(OverallRank.PRIVATE, 2000)).toBe(3000) // Need 3000 more to reach 5000
    })
  })

  describe('getRankProgress', () => {
    it('should return 0% at start of rank', () => {
      expect(getRankProgress(OverallRank.PRIVATE, 1000)).toBe(0)
    })

    it('should return 50% at middle of rank', () => {
      expect(getRankProgress(OverallRank.PRIVATE, 3000)).toBe(50)
    })

    it('should return 100% at max rank', () => {
      expect(getRankProgress(OverallRank.COMMAND_SERGEANT_MAJOR, 200000)).toBe(100)
    })

    it('should handle edge cases correctly', () => {
      expect(getRankProgress(OverallRank.RECRUIT, 0)).toBeGreaterThanOrEqual(0)
      expect(getRankProgress(OverallRank.RECRUIT, 0)).toBeLessThanOrEqual(100)
    })
  })
})

