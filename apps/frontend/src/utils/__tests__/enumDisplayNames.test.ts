/**
 * Tests for enum display name utilities
 */

import { describe, it, expect } from 'vitest'
import {
  getSystemTierDisplayName,
  getMasterDomainDisplayName,
} from '../enumDisplayNames'
import { SystemTier, MasterDomain } from '../../types'

describe('enumDisplayNames', () => {
  describe('getSystemTierDisplayName', () => {
    it('returns "Core Systems" for CORE_TIER_0', () => {
      expect(getSystemTierDisplayName(SystemTier.CORE_TIER_0)).toBe('Core Systems')
    })

    it('returns correct display names for all tiers', () => {
      expect(getSystemTierDisplayName(SystemTier.SURVIVAL)).toBe('Survival')
      expect(getSystemTierDisplayName(SystemTier.STABILITY)).toBe('Stability')
      expect(getSystemTierDisplayName(SystemTier.GROWTH)).toBe('Growth')
      expect(getSystemTierDisplayName(SystemTier.LEVERAGE)).toBe('Leverage')
      expect(getSystemTierDisplayName(SystemTier.EXPRESSION)).toBe('Expression')
      expect(getSystemTierDisplayName(SystemTier.CROSS_SYSTEM_STATES)).toBe('Cross-System States')
    })
  })

  describe('getMasterDomainDisplayName', () => {
    it('returns "Career" for CAREER', () => {
      expect(getMasterDomainDisplayName(MasterDomain.CAREER)).toBe('Career')
    })

    it('returns "Relationships" for RELATIONSHIPS', () => {
      expect(getMasterDomainDisplayName(MasterDomain.RELATIONSHIPS)).toBe('Relationships')
    })

    it('returns correct display names for existing domains', () => {
      expect(getMasterDomainDisplayName(MasterDomain.FINANCE)).toBe('Finance')
      expect(getMasterDomainDisplayName(MasterDomain.HEALTH)).toBe('Health')
    })
  })
})
