import { describe, it, expect } from 'vitest'
import { RECOVERY_ACTION_TYPES } from '../capacityRecoveryService'
import { ActivityType } from '../../types'

describe('capacityRecoveryService', () => {
  describe('RECOVERY_ACTION_TYPES', () => {
    it('contains EXERCISE, LEARNING, SAVE_EXPENSES, REST', () => {
      expect(RECOVERY_ACTION_TYPES).toContain(ActivityType.EXERCISE)
      expect(RECOVERY_ACTION_TYPES).toContain(ActivityType.LEARNING)
      expect(RECOVERY_ACTION_TYPES).toContain(ActivityType.SAVE_EXPENSES)
      expect(RECOVERY_ACTION_TYPES).toContain(ActivityType.REST)
    })

    it('does not contain WORK_PROJECT', () => {
      expect(RECOVERY_ACTION_TYPES).not.toContain(ActivityType.WORK_PROJECT)
    })

    it('has exactly 4 recovery action types', () => {
      expect(RECOVERY_ACTION_TYPES).toHaveLength(4)
    })
  })
})
