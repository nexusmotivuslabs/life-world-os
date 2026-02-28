/**
 * Reality node display utils — ontology refactor (STATE, CAPABILITY, METRIC, INFORMATIONAL, TEMPORAL, ORGANIZATIONAL)
 */
import { describe, it, expect } from 'vitest'
import {
  getNodeTypeDisplayName,
  getCategoryDisplayName,
  getNodeTypeDescription,
  getCategoryDescription,
  getCategoryBadgeClasses,
  getNodeTypeBadgeClasses,
} from '../realityNodeDisplay'

describe('realityNodeDisplay', () => {
  describe('getNodeTypeDisplayName', () => {
    it('returns display names for ontology refactor node types', () => {
      expect(getNodeTypeDisplayName('STATE')).toBe('State')
      expect(getNodeTypeDisplayName('CAPABILITY')).toBe('Capability')
      expect(getNodeTypeDisplayName('METRIC')).toBe('Metric')
    })

    it('returns known display names for existing types', () => {
      expect(getNodeTypeDisplayName('REALITY')).toBe('Reality')
      expect(getNodeTypeDisplayName('AGENT')).toBe('Agent')
    })

    it('returns raw type for unknown', () => {
      expect(getNodeTypeDisplayName('UNKNOWN_TYPE')).toBe('UNKNOWN_TYPE')
    })
  })

  describe('getCategoryDisplayName', () => {
    it('returns display names for ontology refactor categories', () => {
      expect(getCategoryDisplayName('INFORMATIONAL')).toBe('Informational')
      expect(getCategoryDisplayName('TEMPORAL')).toBe('Temporal')
      expect(getCategoryDisplayName('ORGANIZATIONAL')).toBe('Organizational')
    })
  })

  describe('getNodeTypeDescription', () => {
    it('returns descriptions for STATE, CAPABILITY, METRIC', () => {
      expect(getNodeTypeDescription('STATE')).toContain('State')
      expect(getNodeTypeDescription('CAPABILITY')).toContain('Constraint')
      expect(getNodeTypeDescription('METRIC')).toContain('Measurable')
    })
  })

  describe('getCategoryDescription', () => {
    it('returns descriptions for INFORMATIONAL, TEMPORAL, ORGANIZATIONAL', () => {
      expect(getCategoryDescription('INFORMATIONAL')).toContain('Information')
      expect(getCategoryDescription('TEMPORAL')).toContain('Time')
      expect(getCategoryDescription('ORGANIZATIONAL')).toContain('Structures')
    })
  })

  describe('getCategoryBadgeClasses', () => {
    it('returns badge classes for new categories', () => {
      expect(getCategoryBadgeClasses('INFORMATIONAL')).toContain('sky')
      expect(getCategoryBadgeClasses('TEMPORAL')).toContain('amber')
      expect(getCategoryBadgeClasses('ORGANIZATIONAL')).toContain('violet')
    })
  })

  describe('getNodeTypeBadgeClasses', () => {
    it('returns badge classes for state, capability, metric', () => {
      expect(getNodeTypeBadgeClasses('state')).toContain('slate')
      expect(getNodeTypeBadgeClasses('capability')).toContain('indigo')
      expect(getNodeTypeBadgeClasses('metric')).toContain('emerald')
    })
  })
})
