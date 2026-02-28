import { describe, it, expect } from 'vitest'
import {
  SKILLS_MAP_AXIS_LABELS,
  SKILLS_PER_SYSTEM,
  SKILLS_MAP_SCALE,
  MASTER_SYSTEM_IDS,
  SKILLS_MAP_CONFIG,
  getSkillsMapConfig,
  hasSkillsMapConfig,
  getSkillLeverageContent,
  SKILL_LEVERAGE_CONTENT,
} from '../skillsMapConfig'

describe('skillsMapConfig', () => {
  describe('constants', () => {
    it('SKILLS_MAP_AXIS_LABELS has x and y labels', () => {
      expect(SKILLS_MAP_AXIS_LABELS.x).toBe('System Leverage')
      expect(SKILLS_MAP_AXIS_LABELS.y).toBe('Compounding Power')
    })

    it('SKILLS_PER_SYSTEM is 10', () => {
      expect(SKILLS_PER_SYSTEM).toBe(10)
    })

    it('SKILLS_MAP_SCALE has min 0 and max 10', () => {
      expect(SKILLS_MAP_SCALE.min).toBe(0)
      expect(SKILLS_MAP_SCALE.max).toBe(10)
    })

    it('MASTER_SYSTEM_IDS contains all master systems', () => {
      expect(MASTER_SYSTEM_IDS).toContain('finance')
      expect(MASTER_SYSTEM_IDS).toContain('energy')
      expect(MASTER_SYSTEM_IDS).toContain('travel')
      expect(MASTER_SYSTEM_IDS).toContain('software')
      expect(MASTER_SYSTEM_IDS).toContain('health')
      expect(MASTER_SYSTEM_IDS).toContain('meaning')
      expect(MASTER_SYSTEM_IDS).toContain('career')
      expect(MASTER_SYSTEM_IDS).toContain('trust')
      expect(MASTER_SYSTEM_IDS).toContain('reputation')
      expect(MASTER_SYSTEM_IDS).toContain('optionality')
      expect(MASTER_SYSTEM_IDS).toHaveLength(10)
    })
  })

  describe('getSkillsMapConfig', () => {
    it('returns null for undefined systemId', () => {
      expect(getSkillsMapConfig(undefined)).toBeNull()
    })

    it('returns null for empty string', () => {
      expect(getSkillsMapConfig('')).toBeNull()
    })

    it('returns null for unknown systemId', () => {
      expect(getSkillsMapConfig('unknown-system')).toBeNull()
    })

    it('returns config for finance', () => {
      const config = getSkillsMapConfig('finance')
      expect(config).not.toBeNull()
      expect(config!.axisLabels).toEqual(SKILLS_MAP_AXIS_LABELS)
      expect(config!.skills).toHaveLength(SKILLS_PER_SYSTEM)
      expect(config!.skills[0]).toMatchObject({ id: 'maths-finance', label: 'Maths', x: 9, y: 8 })
    })

    it('returns config for every MASTER_SYSTEM_IDS entry', () => {
      for (const systemId of MASTER_SYSTEM_IDS) {
        const config = getSkillsMapConfig(systemId)
        expect(config).not.toBeNull()
        expect(config!.skills).toHaveLength(SKILLS_PER_SYSTEM)
        expect(config!.axisLabels.x).toBeDefined()
        expect(config!.axisLabels.y).toBeDefined()
      }
    })

    it('returns config for travel, trust, meaning, optionality, reputation', () => {
      expect(getSkillsMapConfig('travel')).not.toBeNull()
      expect(getSkillsMapConfig('trust')).not.toBeNull()
      expect(getSkillsMapConfig('meaning')).not.toBeNull()
      expect(getSkillsMapConfig('optionality')).not.toBeNull()
      expect(getSkillsMapConfig('reputation')).not.toBeNull()
    })

    it('returns config for relationships (alias)', () => {
      const config = getSkillsMapConfig('relationships')
      expect(config).not.toBeNull()
      expect(config!.skills).toHaveLength(SKILLS_PER_SYSTEM)
    })
  })

  describe('hasSkillsMapConfig', () => {
    it('returns false for undefined or empty', () => {
      expect(hasSkillsMapConfig(undefined)).toBe(false)
      expect(hasSkillsMapConfig('')).toBe(false)
    })

    it('returns false for unknown system', () => {
      expect(hasSkillsMapConfig('unknown')).toBe(false)
    })

    it('returns true for known systems', () => {
      expect(hasSkillsMapConfig('finance')).toBe(true)
      expect(hasSkillsMapConfig('travel')).toBe(true)
      expect(hasSkillsMapConfig('trust')).toBe(true)
    })
  })

  describe('SKILLS_MAP_CONFIG', () => {
    it('each system has exactly SKILLS_PER_SYSTEM skills', () => {
      for (const [systemId, config] of Object.entries(SKILLS_MAP_CONFIG)) {
        expect(config.skills).toHaveLength(SKILLS_PER_SYSTEM)
        config.skills.forEach((skill, i) => {
          expect(skill.id).toBeTruthy()
          expect(skill.label).toBeTruthy()
          expect(typeof skill.x).toBe('number')
          expect(typeof skill.y).toBe('number')
          expect(skill.x).toBeGreaterThanOrEqual(0)
          expect(skill.x).toBeLessThanOrEqual(10)
          expect(skill.y).toBeGreaterThanOrEqual(0)
          expect(skill.y).toBeLessThanOrEqual(10)
        })
      }
    })
  })

  describe('getSkillLeverageContent', () => {
    it('returns null for unknown skill id', () => {
      expect(getSkillLeverageContent('unknown-skill')).toBeNull()
    })

    it('returns full content for communication-career', () => {
      const content = getSkillLeverageContent('communication-career')
      expect(content).not.toBeNull()
      expect(content!.decision).toBe('Invest')
      expect(content!.problem?.constraint).toBeTruthy()
      expect(content!.systemImpacts).toBeDefined()
      expect(content!.leverage).toBe('High')
      expect(content!.compounding).toBe('High')
      expect(content!.signalVsNoise?.fake).toBeTruthy()
      expect(content!.signalVsNoise?.real).toBeTruthy()
    })

    it('returns full content for cash-flow-finance', () => {
      const content = getSkillLeverageContent('cash-flow-finance')
      expect(content).not.toBeNull()
      expect(content!.decision).toBe('Invest')
      expect(content!.leverage).toBe('Extreme')
      expect(content!.compounding).toBe('Exponential')
    })

    it('returns full content for architecture-software', () => {
      const content = getSkillLeverageContent('architecture-software')
      expect(content).not.toBeNull()
      expect(content!.decision).toBe('Invest')
      expect(content!.observableMetrics).toContain('Deployment frequency')
    })
  })

  describe('SKILL_LEVERAGE_CONTENT', () => {
    it('each entry has decision', () => {
      for (const [skillId, content] of Object.entries(SKILL_LEVERAGE_CONTENT)) {
        expect(['Invest', 'Maintain', 'Avoid']).toContain(content.decision)
        expect(skillId).toBeTruthy()
      }
    })
  })
})
