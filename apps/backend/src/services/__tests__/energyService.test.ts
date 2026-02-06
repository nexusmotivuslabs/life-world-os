import { describe, it, expect } from 'vitest'
import {
  getActionEnergyCost,
  getEffectiveEnergy,
  BASE_DAILY_ENERGY,
} from '../energyService'

describe('energyService', () => {
  describe('getActionEnergyCost', () => {
    it('should return correct energy cost for WORK_PROJECT', () => {
      expect(getActionEnergyCost('WORK_PROJECT')).toBe(30)
    })

    it('should return correct energy cost for EXERCISE', () => {
      expect(getActionEnergyCost('EXERCISE')).toBe(25)
    })

    it('should return correct energy cost for LEARNING', () => {
      expect(getActionEnergyCost('LEARNING')).toBe(20)
    })

    it('should return correct energy cost for REST', () => {
      expect(getActionEnergyCost('REST')).toBe(18)
    })

    it('should return correct energy cost for SAVE_EXPENSES', () => {
      expect(getActionEnergyCost('SAVE_EXPENSES')).toBe(15)
    })

    it('should return 0 for system events', () => {
      expect(getActionEnergyCost('SEASON_COMPLETION')).toBe(0)
      expect(getActionEnergyCost('MILESTONE')).toBe(0)
    })

    it('should return default cost for unknown action types', () => {
      expect(getActionEnergyCost('UNKNOWN_ACTION')).toBe(20) // CUSTOM default
    })
  })

  describe('getEffectiveEnergy', () => {
    it('should return full energy when capacity is high and not in burnout', () => {
      const result = getEffectiveEnergy(120, 90, false)
      expect(result).toBe(110) // Capacity >= 80 gives 110 cap; min(120, 110) = 110
    })

    it('should cap energy at 100 when capacity is medium', () => {
      const result = getEffectiveEnergy(100, 70, false)
      expect(result).toBe(100) // Capacity >= 60 gives 100 cap
    })

    it('should cap energy at 85 when capacity is low', () => {
      const result = getEffectiveEnergy(100, 50, false)
      expect(result).toBe(85) // Capacity >= 30 gives 85 cap
    })

    it('should cap energy at 70 when capacity is very low', () => {
      const result = getEffectiveEnergy(100, 20, false)
      expect(result).toBe(70) // Capacity < 30 gives 70 cap
    })

    it('should apply burnout cap when in burnout', () => {
      const result = getEffectiveEnergy(100, 50, true)
      expect(result).toBe(40) // Burnout cap is 40
    })

    it('should handle energy lower than cap', () => {
      const result = getEffectiveEnergy(50, 90, false)
      expect(result).toBe(50) // Energy is lower than cap
    })

    it('should handle edge case with zero energy', () => {
      const result = getEffectiveEnergy(0, 90, false)
      expect(result).toBe(0)
    })

    it('should handle edge case with zero capacity', () => {
      const result = getEffectiveEnergy(100, 0, false)
      expect(result).toBe(70) // Minimum cap
    })
  })

  describe('BASE_DAILY_ENERGY', () => {
    it('should be a positive number', () => {
      expect(BASE_DAILY_ENERGY).toBeGreaterThan(0)
    })

    it('should be 100 by default', () => {
      expect(BASE_DAILY_ENERGY).toBe(100)
    })
  })
})

