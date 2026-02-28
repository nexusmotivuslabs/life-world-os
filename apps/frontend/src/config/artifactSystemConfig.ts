/**
 * Artifact-to-System Mapping
 *
 * Each artifact belongs to one or more systems. This config drives filtering
 * so artifacts are only shown in the context of their owning system(s).
 * Uses the canonical SystemId enum for tracking.
 */

import { SystemId } from '../types'

/** System IDs used for artifact filtering (subset of SystemId enum). */
export const ARTIFACT_SYSTEM_IDS: readonly SystemId[] = [
  SystemId.FINANCE,
  SystemId.HEALTH,
  SystemId.ENERGY,
  SystemId.TRAVEL,
  SystemId.SOFTWARE,
  SystemId.OPTIONALITY,
  SystemId.TRUST,
  SystemId.REPUTATION,
  SystemId.LOADOUT,
  SystemId.MEANING,
  SystemId.REALITY,
]

export type ArtifactSystemId = SystemId

/** Human-readable labels for system filter dropdown (artifact systems only; career not included). */
export const ARTIFACT_SYSTEM_LABELS: Partial<Record<SystemId, string>> = {
  [SystemId.FINANCE]: 'Finance',
  [SystemId.HEALTH]: 'Health',
  [SystemId.ENERGY]: 'Energy',
  [SystemId.TRAVEL]: 'Travel',
  [SystemId.SOFTWARE]: 'Software',
  [SystemId.OPTIONALITY]: 'Optionality',
  [SystemId.TRUST]: 'Trust',
  [SystemId.REPUTATION]: 'Reputation',
  [SystemId.LOADOUT]: 'Loadout',
  [SystemId.MEANING]: 'Meaning',
  [SystemId.REALITY]: 'Reality',
}

/**
 * Maps artifact IDs to the system(s) they belong to.
 * An artifact can belong to multiple systems when it's cross-cutting.
 */
export const ARTIFACT_SYSTEM_MAP: Record<string, ArtifactSystemId[]> = {
  // Resources
  energy: [SystemId.ENERGY],
  capacity: [SystemId.HEALTH],
  money: [SystemId.FINANCE],
  oxygen: [SystemId.FINANCE],
  water: [SystemId.HEALTH],
  armor: [SystemId.HEALTH],
  keys: [SystemId.OPTIONALITY],

  // Stats
  engines: [SystemId.FINANCE],
  meaning: [SystemId.MEANING],
  optionality: [SystemId.OPTIONALITY],

  // Systems (meta-artifacts) — flat ontology node IDs (systems-node-*)
  'systems-node-finance': [SystemId.FINANCE],
  'systems-node-career': [SystemId.FINANCE, SystemId.OPTIONALITY, SystemId.TRUST],
  'systems-node-trust': [SystemId.TRUST],
  'systems-node-health': [SystemId.HEALTH],
  'systems-node-production': [SystemId.REALITY],
  'systems-node-governance': [SystemId.REALITY],
  'systems-node-creation': [SystemId.SOFTWARE, SystemId.MEANING],
  'money-system': [SystemId.FINANCE],
  'energy-system': [SystemId.ENERGY],
  'finance-system': [SystemId.FINANCE],
  'health-system': [SystemId.HEALTH],

  // Concepts - universal / reality
  'tier-system': [SystemId.REALITY],

  // Laws - knowledge / reality
  'laws-power': [SystemId.REALITY],
  'bible-laws': [SystemId.REALITY],

  // Principles - by primary domain
  'compound-growth-principle': [SystemId.FINANCE, SystemId.OPTIONALITY],
  'energy-conservation-principle': [SystemId.ENERGY, SystemId.HEALTH],
  'risk-return-tradeoff': [SystemId.FINANCE, SystemId.OPTIONALITY],
  'progressive-overload': [SystemId.HEALTH],
  'sustainable-balance': [SystemId.REALITY],
  'time-value-of-money': [SystemId.FINANCE],
  'asymmetric-risk-reward': [SystemId.FINANCE, SystemId.OPTIONALITY],
  'diversification-hedging': [SystemId.FINANCE],
  'cash-flow-management': [SystemId.FINANCE],
  'compound-interest': [SystemId.FINANCE],
  'recovery-over-depletion': [SystemId.ENERGY, SystemId.HEALTH],
  'energy-conservation-law': [SystemId.ENERGY],
  'sustainable-rhythm': [SystemId.ENERGY, SystemId.HEALTH],
  'capacity-building': [SystemId.HEALTH],
  'burnout-prevention': [SystemId.HEALTH],

  // Frameworks
  'financial-frameworks': [SystemId.FINANCE],
  'energy-frameworks': [SystemId.ENERGY],
  'strategic-frameworks': [SystemId.OPTIONALITY, SystemId.REALITY],
}

/**
 * System ID for dynamically created artifacts (weapons, engines, reality nodes).
 * Used when artifact ID doesn't match ARTIFACT_SYSTEM_MAP.
 */
export const DYNAMIC_ARTIFACT_SYSTEMS: Record<string, ArtifactSystemId> = {
  weapon: SystemId.LOADOUT,
  engine: SystemId.FINANCE,
  'reality-node': SystemId.REALITY,
}

/**
 * Default system for artifacts not in the map (e.g. new static artifacts).
 * 'reality' = universal knowledge, shown in all system contexts.
 */
export const DEFAULT_ARTIFACT_SYSTEM: ArtifactSystemId = SystemId.REALITY

/**
 * Power Law domains that apply per system (aligned with backend systemUniversalConceptConfig).
 * Used to filter 48 Laws of Power by system context.
 */
export const SYSTEM_POWER_LAW_DOMAINS: Partial<Record<ArtifactSystemId, string[]>> = {
  [SystemId.FINANCE]: ['MONEY'],
  [SystemId.ENERGY]: ['ENERGY'],
  [SystemId.SOFTWARE]: ['CAREER', 'BUSINESS'],
  [SystemId.OPTIONALITY]: ['NEGOTIATION', 'CAREER'],
  [SystemId.TRUST]: ['RELATIONSHIPS', 'LEADERSHIP'],
  [SystemId.REPUTATION]: ['RELATIONSHIPS', 'LEADERSHIP'],
  [SystemId.HEALTH]: [],
  [SystemId.TRAVEL]: [],
  [SystemId.LOADOUT]: [],
  [SystemId.MEANING]: [],
  [SystemId.REALITY]: [],
}

/**
 * Get which system IDs have a given Power Law domain.
 * Used to map reality nodes (with domain metadata) to artifact systems.
 */
export function getSystemsForPowerLawDomain(domain: string): ArtifactSystemId[] {
  const domainUpper = domain.toUpperCase()
  const systems: ArtifactSystemId[] = []
  for (const [systemId, domains] of Object.entries(SYSTEM_POWER_LAW_DOMAINS)) {
    if (domains?.includes(domainUpper)) {
      systems.push(systemId as ArtifactSystemId)
    }
  }
  return systems
}

/**
 * Resolve which system(s) an artifact belongs to.
 * Algorithm:
 * 1. Check ARTIFACT_SYSTEM_MAP by exact id
 * 2. For dynamic artifacts (weapon-*, engine-*), use prefix mapping
 * 3. Fall back to DEFAULT_ARTIFACT_SYSTEM
 */
export function getArtifactSystems(artifactId: string): ArtifactSystemId[] {
  if (ARTIFACT_SYSTEM_MAP[artifactId]) {
    return [...ARTIFACT_SYSTEM_MAP[artifactId]]
  }
  if (artifactId.startsWith('weapon-')) {
    return [DYNAMIC_ARTIFACT_SYSTEMS.weapon]
  }
  if (artifactId.startsWith('engine-') || artifactId.includes('engine-type')) {
    return [DYNAMIC_ARTIFACT_SYSTEMS.engine]
  }
  if (artifactId.startsWith('reality-') || artifactId.startsWith('node-')) {
    return [DYNAMIC_ARTIFACT_SYSTEMS['reality-node']]
  }
  return [DEFAULT_ARTIFACT_SYSTEM]
}

/**
 * Filter artifacts to those belonging to the given system.
 * When systemId is null/undefined, returns all artifacts (no filter).
 * Artifacts with optional systemId (e.g. reality node artifacts) use that for filtering.
 */
export function filterArtifactsBySystem<T extends { id: string; systemId?: ArtifactSystemId; systemIds?: ArtifactSystemId[] }>(
  artifacts: T[],
  systemId: ArtifactSystemId | null | undefined
): T[] {
  if (!systemId) return artifacts
  return artifacts.filter((a) => {
    if (a.systemIds?.includes(systemId)) {
      return true
    }
    // Prefer explicit systemId when present (e.g. from reality node metadata)
    if (a.systemId) {
      return a.systemId === systemId
    }
    const systems = getArtifactSystems(a.id)
    return systems.includes(systemId)
  })
}
