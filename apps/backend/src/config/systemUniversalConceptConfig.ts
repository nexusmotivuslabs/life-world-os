/**
 * System → Universal Concepts Mapping
 *
 * Maps each system to the laws, principles, and frameworks that apply to it.
 * Used by the seed script to populate LAWS/PRINCIPLES/FRAMEWORKS branches
 * under each system's universal concept node in the reality hierarchy.
 *
 * References existing global nodes (from CONSTRAINTS_OF_REALITY).
 * Aligned with frontend ARTIFACT_SYSTEM_MAP in artifactSystemConfig.ts.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SystemConceptMapping {
  /** Titles of fundamental laws (from FUNDAMENTAL_LAWS array in seed) */
  fundamentalLaws: string[]
  /** Power Law domain names that apply to this system */
  powerLawDomains: string[]
  /** Bible Law domain names that apply to this system */
  bibleLawDomains: string[]
  /** Titles of strategic principles (from STRATEGIC_PRINCIPLES array in seed) */
  strategicPrinciples: string[]
  /** Titles of systemic principles (from SYSTEMIC_PRINCIPLES array in seed) */
  systemicPrinciples: string[]
  /** Titles of cross-system principles (from CROSS_SYSTEM_PRINCIPLES array in seed) */
  crossSystemPrinciples: string[]
  /** Titles of frameworks (from FRAMEWORKS array in seed) */
  frameworks: string[]
}

// ---------------------------------------------------------------------------
// Node ID generation helpers (must match seed logic in seedRealityHierarchy.ts)
// ---------------------------------------------------------------------------

const LAWS_NODE_ID = 'laws-node'
const PRINCIPLES_NODE_ID = 'principles-node'
const FRAMEWORKS_NODE_ID = 'frameworks-node'

const toSlug = (title: string) => title.toLowerCase().replace(/_/g, '-')

export function getFundamentalLawNodeId(title: string): string {
  return `${LAWS_NODE_ID}-fundamental-${toSlug(title)}`
}

export function getPowerLawDomainNodeId(domain: string): string {
  return `${LAWS_NODE_ID}-power-${domain.toLowerCase()}`
}

export function getBibleLawDomainNodeId(domain: string): string {
  return `${LAWS_NODE_ID}-biblical-${domain.toLowerCase()}`
}

export function getStrategicPrincipleNodeId(title: string): string {
  return `${PRINCIPLES_NODE_ID}-strategic-${toSlug(title)}`
}

export function getSystemicPrincipleNodeId(title: string): string {
  return `${PRINCIPLES_NODE_ID}-systemic-${toSlug(title)}`
}

export function getCrossSystemPrincipleNodeId(title: string): string {
  return `${PRINCIPLES_NODE_ID}-cross-system-${toSlug(title)}`
}

export function getFrameworkNodeId(title: string): string {
  return `${FRAMEWORKS_NODE_ID}-${toSlug(title)}`
}

// ---------------------------------------------------------------------------
// System ID alignment
// ---------------------------------------------------------------------------

/**
 * Frontend uses 'finance' for the money system; backend uses 'money'.
 * This mapping normalises frontend IDs to backend canonical IDs.
 */
export const FRONTEND_TO_BACKEND_SYSTEM_ID: Record<string, string> = {
  finance: 'money',
}

export function getCanonicalSystemId(systemId: string): string {
  return FRONTEND_TO_BACKEND_SYSTEM_ID[systemId] || systemId
}

// ---------------------------------------------------------------------------
// The mapping
// ---------------------------------------------------------------------------

/**
 * Canonical mapping: backend system ID → concepts that apply.
 *
 * System IDs match SYSTEMS_HIERARCHY_DATA keys in seedRealityHierarchy.ts
 * (e.g. 'money', 'health', 'energy', 'education', etc.).
 */
export const SYSTEM_UNIVERSAL_CONCEPT_MAP: Record<string, SystemConceptMapping> = {
  // ── STABILITY TIER ──────────────────────────────────────────────────────
  money: {
    fundamentalLaws: ['LAW_OF_COMPOUNDING', 'LAW_OF_TIME', 'LAW_OF_CAUSE_EFFECT'],
    powerLawDomains: ['MONEY'],
    bibleLawDomains: ['MONEY', 'INVESTMENT', 'STEWARDSHIP', 'GENEROSITY'],
    strategicPrinciples: ['LEVERAGE', 'MARGIN_OF_SAFETY', 'OPPORTUNITY_COST', 'SYSTEMS_THINKING'],
    systemicPrinciples: ['FEEDBACK_LOOPS'],
    crossSystemPrinciples: [],
    frameworks: ['PARETO_PRINCIPLE', 'RISK_ASSESSMENT_FRAMEWORK', 'DECISION_MATRIX'],
  },
  energy: {
    fundamentalLaws: ['LAW_OF_ENERGY', 'LAW_OF_ENTROPY'],
    powerLawDomains: ['ENERGY'],
    bibleLawDomains: ['ENERGY'],
    strategicPrinciples: ['MARGIN_OF_SAFETY'],
    systemicPrinciples: ['FEEDBACK_LOOPS', 'ADAPTATION'],
    crossSystemPrinciples: [],
    frameworks: ['PARETO_PRINCIPLE'],
  },

  // ── SURVIVAL TIER ───────────────────────────────────────────────────────
  health: {
    fundamentalLaws: ['LAW_OF_ENTROPY', 'LAW_OF_ENERGY', 'LAW_OF_CAUSE_EFFECT'],
    powerLawDomains: [],
    bibleLawDomains: ['ENERGY'],
    strategicPrinciples: ['MARGIN_OF_SAFETY', 'SYSTEMS_THINKING'],
    systemicPrinciples: ['FEEDBACK_LOOPS', 'ADAPTATION'],
    crossSystemPrinciples: [],
    frameworks: ['GOAL_HIERARCHY_FRAMEWORK', 'RISK_ASSESSMENT_FRAMEWORK'],
  },

  // ── GROWTH TIER ─────────────────────────────────────────────────────────
  education: {
    fundamentalLaws: ['LAW_OF_COMPOUNDING', 'LAW_OF_TIME', 'LAW_OF_CAUSE_EFFECT'],
    powerLawDomains: [],
    bibleLawDomains: [],
    strategicPrinciples: ['SYSTEMS_THINKING'],
    systemicPrinciples: ['FIRST_PRINCIPLES', 'FEEDBACK_LOOPS', 'HIERARCHY'],
    crossSystemPrinciples: [],
    frameworks: ['DOMAIN_APPLICATION_FRAMEWORK', 'GOAL_HIERARCHY_FRAMEWORK'],
  },
  investment: {
    fundamentalLaws: ['LAW_OF_COMPOUNDING', 'LAW_OF_TIME'],
    powerLawDomains: ['MONEY'],
    bibleLawDomains: ['INVESTMENT'],
    strategicPrinciples: ['LEVERAGE', 'MARGIN_OF_SAFETY', 'OPPORTUNITY_COST'],
    systemicPrinciples: [],
    crossSystemPrinciples: [],
    frameworks: ['RISK_ASSESSMENT_FRAMEWORK', 'DECISION_MATRIX'],
  },
  training: {
    fundamentalLaws: ['LAW_OF_COMPOUNDING', 'LAW_OF_ENERGY'],
    powerLawDomains: [],
    bibleLawDomains: [],
    strategicPrinciples: [],
    systemicPrinciples: ['FEEDBACK_LOOPS', 'ADAPTATION', 'HIERARCHY'],
    crossSystemPrinciples: [],
    frameworks: ['GOAL_HIERARCHY_FRAMEWORK'],
  },

  // ── EXPRESSION TIER ─────────────────────────────────────────────────────
  travel: {
    fundamentalLaws: ['LAW_OF_TIME', 'LAW_OF_ENERGY'],
    powerLawDomains: [],
    bibleLawDomains: [],
    strategicPrinciples: ['OPPORTUNITY_COST', 'INVERSION'],
    systemicPrinciples: [],
    crossSystemPrinciples: [],
    frameworks: ['DECISION_MATRIX'],
  },
  meaning: {
    fundamentalLaws: ['LAW_OF_CAUSE_EFFECT', 'LAW_OF_TIME'],
    powerLawDomains: [],
    bibleLawDomains: ['SPIRITUAL_GROWTH'],
    strategicPrinciples: ['SYSTEMS_THINKING'],
    systemicPrinciples: ['FIRST_PRINCIPLES', 'HIERARCHY'],
    crossSystemPrinciples: [],
    frameworks: ['GOAL_HIERARCHY_FRAMEWORK'],
  },

  // ── CROSS-SYSTEM STATES ─────────────────────────────────────────────────
  trust: {
    fundamentalLaws: ['LAW_OF_COMPOUNDING', 'LAW_OF_CAUSE_EFFECT'],
    powerLawDomains: ['RELATIONSHIPS', 'LEADERSHIP'],
    bibleLawDomains: ['RELATIONSHIPS', 'LEADERSHIP'],
    strategicPrinciples: [],
    systemicPrinciples: ['FEEDBACK_LOOPS', 'ADAPTATION'],
    crossSystemPrinciples: ['TRUST'],
    frameworks: ['RISK_ASSESSMENT_FRAMEWORK'],
  },
  reputation: {
    fundamentalLaws: ['LAW_OF_COMPOUNDING', 'LAW_OF_ENTROPY'],
    powerLawDomains: ['RELATIONSHIPS', 'LEADERSHIP'],
    bibleLawDomains: ['RELATIONSHIPS', 'LEADERSHIP'],
    strategicPrinciples: [],
    systemicPrinciples: ['FEEDBACK_LOOPS', 'ADAPTATION'],
    crossSystemPrinciples: ['REPUTATION'],
    frameworks: ['RISK_ASSESSMENT_FRAMEWORK'],
  },
  optionality: {
    fundamentalLaws: ['LAW_OF_TIME', 'LAW_OF_COMPOUNDING'],
    powerLawDomains: ['NEGOTIATION', 'CAREER'],
    bibleLawDomains: ['CAREER'],
    strategicPrinciples: ['LEVERAGE', 'OPPORTUNITY_COST', 'INVERSION', 'MARGIN_OF_SAFETY'],
    systemicPrinciples: [],
    crossSystemPrinciples: ['OPTIONALITY'],
    frameworks: ['DECISION_MATRIX', 'RISK_ASSESSMENT_FRAMEWORK'],
  },
  'energy-reserve': {
    fundamentalLaws: ['LAW_OF_ENERGY', 'LAW_OF_ENTROPY'],
    powerLawDomains: ['ENERGY'],
    bibleLawDomains: ['ENERGY'],
    strategicPrinciples: ['MARGIN_OF_SAFETY'],
    systemicPrinciples: ['ADAPTATION'],
    crossSystemPrinciples: ['ENERGY_RESERVE'],
    frameworks: ['RISK_ASSESSMENT_FRAMEWORK'],
  },
}
