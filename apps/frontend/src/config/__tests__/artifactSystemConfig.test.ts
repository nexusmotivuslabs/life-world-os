import { describe, it, expect } from 'vitest'
import {
  ARTIFACT_SYSTEM_IDS,
  ARTIFACT_SYSTEM_LABELS,
  DEFAULT_ARTIFACT_SYSTEM,
  DYNAMIC_ARTIFACT_SYSTEMS,
  SYSTEM_POWER_LAW_DOMAINS,
  filterArtifactsBySystem,
  getArtifactSystems,
  getSystemsForPowerLawDomain,
} from '../artifactSystemConfig'

describe('artifactSystemConfig', () => {
  describe('ARTIFACT_SYSTEM_IDS', () => {
    it('contains expected system IDs', () => {
      expect(ARTIFACT_SYSTEM_IDS).toContain('finance')
      expect(ARTIFACT_SYSTEM_IDS).toContain('health')
      expect(ARTIFACT_SYSTEM_IDS).toContain('reality')
    })
  })

  describe('ARTIFACT_SYSTEM_LABELS', () => {
    it('has human-readable labels for each system', () => {
      expect(ARTIFACT_SYSTEM_LABELS.finance).toBe('Finance')
      expect(ARTIFACT_SYSTEM_LABELS.reality).toBe('Reality')
    })
  })

  describe('filterArtifactsBySystem', () => {
    it('returns all artifacts when systemId is null', () => {
      const artifacts = [{ id: 'energy' }, { id: 'money' }]
      expect(filterArtifactsBySystem(artifacts, null)).toEqual(artifacts)
    })

    it('returns all artifacts when systemId is undefined', () => {
      const artifacts = [{ id: 'energy' }]
      expect(filterArtifactsBySystem(artifacts, undefined)).toEqual(artifacts)
    })

    it('filters by systemIds when present', () => {
      const artifacts = [
        { id: 'a', systemIds: ['finance', 'optionality'] as const },
        { id: 'b', systemIds: ['health'] as const },
      ]
      expect(filterArtifactsBySystem(artifacts, 'finance')).toHaveLength(1)
      expect(filterArtifactsBySystem(artifacts, 'finance')[0].id).toBe('a')
    })

    it('filters by systemId when present', () => {
      const artifacts = [
        { id: 'a', systemId: 'finance' as const },
        { id: 'b', systemId: 'health' as const },
      ]
      expect(filterArtifactsBySystem(artifacts, 'finance')).toHaveLength(1)
    })

    it('uses getArtifactSystems for id when no systemId/systemIds', () => {
      const artifacts = [{ id: 'money' }]
      expect(filterArtifactsBySystem(artifacts, 'finance')).toHaveLength(1)
    })
  })

  describe('DEFAULT_ARTIFACT_SYSTEM', () => {
    it('is reality', () => {
      expect(DEFAULT_ARTIFACT_SYSTEM).toBe('reality')
    })
  })

  describe('getArtifactSystems', () => {
    it('returns mapped systems for known artifact IDs', () => {
      expect(getArtifactSystems('energy')).toEqual(['energy'])
      expect(getArtifactSystems('money')).toEqual(['finance'])
      expect(getArtifactSystems('compound-growth-principle')).toEqual(['finance', 'optionality'])
    })

    it('returns loadout for weapon-* prefix', () => {
      expect(getArtifactSystems('weapon-primary')).toEqual(['loadout'])
    })

    it('returns finance for engine-* prefix', () => {
      expect(getArtifactSystems('engine-career')).toEqual(['finance'])
    })

    it('returns finance for engine-type in id', () => {
      expect(getArtifactSystems('artifact-engine-type-career')).toEqual(['finance'])
    })

    it('returns reality for unknown artifact', () => {
      expect(getArtifactSystems('unknown-artifact')).toEqual(['reality'])
    })

    it('returns reality for reality-* and node-* prefixes', () => {
      expect(getArtifactSystems('reality-root')).toEqual(['reality'])
      expect(getArtifactSystems('node-abc')).toEqual(['reality'])
    })

    it('returns correct systems for flat ontology system node IDs', () => {
      expect(getArtifactSystems('systems-node-finance')).toEqual(['finance'])
      expect(getArtifactSystems('systems-node-health')).toEqual(['health'])
      expect(getArtifactSystems('systems-node-trust')).toEqual(['trust'])
      expect(getArtifactSystems('systems-node-career')).toContain('finance')
      expect(getArtifactSystems('systems-node-career')).toContain('optionality')
      expect(getArtifactSystems('systems-node-creation')).toContain('software')
    })
  })

  describe('getSystemsForPowerLawDomain', () => {
    it('returns systems that have the given domain', () => {
      expect(getSystemsForPowerLawDomain('MONEY')).toEqual(['finance'])
      expect(getSystemsForPowerLawDomain('ENERGY')).toEqual(['energy'])
      expect(getSystemsForPowerLawDomain('RELATIONSHIPS')).toContain('trust')
      expect(getSystemsForPowerLawDomain('RELATIONSHIPS')).toContain('reputation')
    })

    it('is case-insensitive', () => {
      expect(getSystemsForPowerLawDomain('money')).toEqual(['finance'])
    })

    it('returns empty array for unknown domain', () => {
      expect(getSystemsForPowerLawDomain('UNKNOWN')).toEqual([])
    })
  })

  describe('SYSTEM_POWER_LAW_DOMAINS', () => {
    it('has power law domains for finance', () => {
      expect(SYSTEM_POWER_LAW_DOMAINS.finance).toEqual(['MONEY'])
    })

    it('has power law domains for software', () => {
      expect(SYSTEM_POWER_LAW_DOMAINS.software).toEqual(['CAREER', 'BUSINESS'])
    })
  })

  describe('DYNAMIC_ARTIFACT_SYSTEMS', () => {
    it('maps weapon to loadout', () => {
      expect(DYNAMIC_ARTIFACT_SYSTEMS.weapon).toBe('loadout')
    })

    it('maps engine to finance', () => {
      expect(DYNAMIC_ARTIFACT_SYSTEMS.engine).toBe('finance')
    })

    it('maps reality-node to reality', () => {
      expect(DYNAMIC_ARTIFACT_SYSTEMS['reality-node']).toBe('reality')
    })
  })
})
