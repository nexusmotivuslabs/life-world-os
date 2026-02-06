/**
 * Pathway Knowledge Data Tests
 *
 * Ensures STRESS, INFLAMMATION, RECOVERY and other pathway knowledge
 * have expected tags for artifact filtering.
 */

import { describe, it, expect } from 'vitest'
import { PATHWAY_KNOWLEDGE } from '../pathwayKnowledgeData'

describe('pathwayKnowledgeData', () => {
  describe('STRESS pathway tags', () => {
    it('has stress-related tags for artifact filtering', () => {
      const stress = PATHWAY_KNOWLEDGE.STRESS
      expect(stress).toBeDefined()
      expect(stress.tags).toBeDefined()
      expect(stress.tags).toContain('stressor')
      expect(stress.tags).toContain('cortisol')
      expect(stress.tags).toContain('adrenaline')
      expect(stress.tags).toContain('enhanced-focus')
      expect(stress.tags).toContain('energy')
      expect(stress.tags).toContain('inflammation')
      expect(stress.tags).toContain('cognitive-decline')
      expect(stress.tags).toContain('burnout')
      expect(stress.tags).toContain('recovery')
    })

    it('has howItWorks content describing stress response', () => {
      const stress = PATHWAY_KNOWLEDGE.STRESS
      expect(stress.howItWorks).toContain('Stressor triggers cortisol and adrenaline')
      expect(stress.howItWorks).toContain('enhanced focus and energy')
      expect(stress.howItWorks).toContain('inflammation')
      expect(stress.howItWorks).toContain('cognitive decline')
      expect(stress.howItWorks).toContain('burnout')
    })
  })

  describe('INFLAMMATION pathway tags', () => {
    it('has inflammation and recovery tags', () => {
      const inflammation = PATHWAY_KNOWLEDGE.INFLAMMATION
      expect(inflammation).toBeDefined()
      expect(inflammation.tags).toBeDefined()
      expect(inflammation.tags).toContain('inflammation')
      expect(inflammation.tags).toContain('recovery')
    })
  })

  describe('RECOVERY pathway tags', () => {
    it('has recovery-related tags', () => {
      const recovery = PATHWAY_KNOWLEDGE.RECOVERY
      expect(recovery).toBeDefined()
      expect(recovery.tags).toBeDefined()
      expect(recovery.tags).toContain('recovery')
      expect(recovery.tags).toContain('stressor')
      expect(recovery.tags).toContain('burnout')
    })
  })
})
