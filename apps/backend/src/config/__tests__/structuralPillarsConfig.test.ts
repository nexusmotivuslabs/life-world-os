/**
 * Tests for structural pillars config
 */

import { describe, it, expect } from 'vitest'
import { STRUCTURAL_PILLARS } from '../structuralPillarsConfig'

describe('structuralPillarsConfig', () => {
  describe('STRUCTURAL_PILLARS.CHARACTER', () => {
    it('defines character as foundation with id and name', () => {
      expect(STRUCTURAL_PILLARS.CHARACTER.id).toBe('character')
      expect(STRUCTURAL_PILLARS.CHARACTER.name).toBe('Character')
    })

    it('includes mantra: Character is foundation', () => {
      expect(STRUCTURAL_PILLARS.CHARACTER.mantra).toBe('Character is foundation.')
    })

    it('includes causal rule for character fracture', () => {
      expect(STRUCTURAL_PILLARS.CHARACTER.causalRules).toContain(
        'If character fractures, everything destabilises.'
      )
    })
  })

  describe('STRUCTURAL_PILLARS.CORE_TIER_0', () => {
    it('defines Health, Career, Relationships as core tier 0 systems', () => {
      expect(STRUCTURAL_PILLARS.CORE_TIER_0.HEALTH.id).toBe('health')
      expect(STRUCTURAL_PILLARS.CORE_TIER_0.CAREER.id).toBe('career')
      expect(STRUCTURAL_PILLARS.CORE_TIER_0.RELATIONSHIPS.id).toBe('relationships')
    })

    it('Health has correct causal rule', () => {
      expect(STRUCTURAL_PILLARS.CORE_TIER_0.HEALTH.causalRule).toBe(
        'If health collapses, performance drops.'
      )
    })

    it('Career has correct causal rule', () => {
      expect(STRUCTURAL_PILLARS.CORE_TIER_0.CAREER.causalRule).toBe(
        'If career shakes but character is stable, you adapt.'
      )
    })

    it('Relationships has correct causal rule', () => {
      expect(STRUCTURAL_PILLARS.CORE_TIER_0.RELATIONSHIPS.causalRule).toBe(
        'If relationship shakes but character is stable, you respond calmly.'
      )
    })
  })
})
