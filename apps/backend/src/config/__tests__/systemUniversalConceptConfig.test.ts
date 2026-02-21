import { describe, it, expect } from 'vitest'
import {
  FRONTEND_TO_BACKEND_SYSTEM_ID,
  getBibleLawDomainNodeId,
  getCanonicalSystemId,
  getCrossSystemPrincipleNodeId,
  getFrameworkNodeId,
  getFundamentalLawNodeId,
  getPowerLawDomainNodeId,
  getStrategicPrincipleNodeId,
  getSystemicPrincipleNodeId,
  SYSTEM_UNIVERSAL_CONCEPT_MAP,
} from '../systemUniversalConceptConfig'

describe('systemUniversalConceptConfig', () => {
  describe('getFundamentalLawNodeId', () => {
    it('returns slugged node id for law title', () => {
      expect(getFundamentalLawNodeId('LAW_OF_COMPOUNDING')).toBe('laws-node-fundamental-law-of-compounding')
    })
  })

  describe('getPowerLawDomainNodeId', () => {
    it('returns lowercase domain node id', () => {
      expect(getPowerLawDomainNodeId('MONEY')).toBe('laws-node-power-money')
    })
  })

  describe('getBibleLawDomainNodeId', () => {
    it('returns slugged biblical domain id', () => {
      expect(getBibleLawDomainNodeId('INVESTMENT')).toBe('laws-node-biblical-investment')
    })
  })

  describe('getStrategicPrincipleNodeId', () => {
    it('returns slugged strategic principle id', () => {
      expect(getStrategicPrincipleNodeId('MARGIN_OF_SAFETY')).toBe('principles-node-strategic-margin-of-safety')
    })
  })

  describe('getSystemicPrincipleNodeId', () => {
    it('returns slugged systemic principle id', () => {
      expect(getSystemicPrincipleNodeId('FEEDBACK_LOOPS')).toBe('principles-node-systemic-feedback-loops')
    })
  })

  describe('getCrossSystemPrincipleNodeId', () => {
    it('returns slugged cross-system principle id', () => {
      expect(getCrossSystemPrincipleNodeId('HIERARCHY')).toBe('principles-node-cross-system-hierarchy')
    })
  })

  describe('getFrameworkNodeId', () => {
    it('returns slugged framework id', () => {
      expect(getFrameworkNodeId('PARETO_PRINCIPLE')).toBe('frameworks-node-pareto-principle')
    })
  })

  describe('getCanonicalSystemId', () => {
    it('maps finance to money', () => {
      expect(getCanonicalSystemId('finance')).toBe('money')
    })

    it('returns input when no mapping exists', () => {
      expect(getCanonicalSystemId('health')).toBe('health')
      expect(getCanonicalSystemId('energy')).toBe('energy')
    })
  })

  describe('FRONTEND_TO_BACKEND_SYSTEM_ID', () => {
    it('maps finance to money', () => {
      expect(FRONTEND_TO_BACKEND_SYSTEM_ID.finance).toBe('money')
    })
  })

  describe('SYSTEM_UNIVERSAL_CONCEPT_MAP', () => {
    it('has money system with power law domains', () => {
      const money = SYSTEM_UNIVERSAL_CONCEPT_MAP.money
      expect(money).toBeDefined()
      expect(money.powerLawDomains).toContain('MONEY')
      expect(money.fundamentalLaws.length).toBeGreaterThan(0)
    })

    it('has software system with power law domains', () => {
      const software = SYSTEM_UNIVERSAL_CONCEPT_MAP.software
      expect(software).toBeDefined()
      expect(software.powerLawDomains).toContain('CAREER')
      expect(software.powerLawDomains).toContain('BUSINESS')
    })
  })
})
