/**
 * Artifact-to-System Mapping
 *
 * Each artifact belongs to one or more systems. This config drives filtering
 * so artifacts are only shown in the context of their owning system(s).
 */

/** System IDs used across the app (aligns with MasterDomain, career systems, etc.) */
export const ARTIFACT_SYSTEM_IDS = [
  'finance',
  'health',
  'energy',
  'travel',
  'software',
  'optionality',
  'trust',
  'reputation',
  'loadout',
  'meaning',
  'reality',
] as const

export type ArtifactSystemId = (typeof ARTIFACT_SYSTEM_IDS)[number]

/** Human-readable labels for system filter dropdown */
export const ARTIFACT_SYSTEM_LABELS: Record<ArtifactSystemId, string> = {
  finance: 'Finance',
  health: 'Health',
  energy: 'Energy',
  travel: 'Travel',
  software: 'Software',
  optionality: 'Optionality',
  trust: 'Trust',
  reputation: 'Reputation',
  loadout: 'Loadout',
  meaning: 'Meaning',
  reality: 'Reality',
}

/**
 * Maps artifact IDs to the system(s) they belong to.
 * An artifact can belong to multiple systems when it's cross-cutting.
 */
export const ARTIFACT_SYSTEM_MAP: Record<string, ArtifactSystemId[]> = {
  // Resources
  energy: ['energy'],
  capacity: ['health'],
  money: ['finance'],
  oxygen: ['finance'],
  water: ['health'],
  armor: ['health'],
  keys: ['optionality'],

  // Stats
  engines: ['finance'],
  meaning: ['meaning'],
  optionality: ['optionality'],

  // Systems (meta-artifacts)
  'money-system': ['finance'],
  'energy-system': ['energy'],
  'finance-system': ['finance'],
  'health-system': ['health'],

  // Concepts - universal / reality
  'tier-system': ['reality'],

  // Laws - knowledge / reality
  'laws-power': ['reality'],
  'bible-laws': ['reality'],

  // Principles - by primary domain
  'compound-growth-principle': ['finance', 'optionality'],
  'energy-conservation-principle': ['energy', 'health'],
  'risk-return-tradeoff': ['finance', 'optionality'],
  'progressive-overload': ['health'],
  'sustainable-balance': ['reality'],
  'time-value-of-money': ['finance'],
  'asymmetric-risk-reward': ['finance', 'optionality'],
  'diversification-hedging': ['finance'],
  'cash-flow-management': ['finance'],
  'compound-interest': ['finance'],
  'recovery-over-depletion': ['energy', 'health'],
  'energy-conservation-law': ['energy'],
  'sustainable-rhythm': ['energy', 'health'],
  'capacity-building': ['health'],
  'burnout-prevention': ['health'],

  // Frameworks
  'financial-frameworks': ['finance'],
  'energy-frameworks': ['energy'],
  'strategic-frameworks': ['optionality', 'reality'],
}

/**
 * System ID for dynamically created artifacts (weapons, engines, reality nodes).
 * Used when artifact ID doesn't match ARTIFACT_SYSTEM_MAP.
 */
export const DYNAMIC_ARTIFACT_SYSTEMS: Record<string, ArtifactSystemId> = {
  weapon: 'loadout',
  engine: 'finance',
  'reality-node': 'reality',
}

/**
 * Default system for artifacts not in the map (e.g. new static artifacts).
 * 'reality' = universal knowledge, shown in all system contexts.
 */
export const DEFAULT_ARTIFACT_SYSTEM: ArtifactSystemId = 'reality'

/**
 * Power Law domains that apply per system (aligned with backend systemUniversalConceptConfig).
 * Used to filter 48 Laws of Power by system context.
 */
export const SYSTEM_POWER_LAW_DOMAINS: Partial<Record<ArtifactSystemId, string[]>> = {
  finance: ['MONEY'],
  energy: ['ENERGY'],
  software: ['CAREER', 'BUSINESS'],
  optionality: ['NEGOTIATION', 'CAREER'],
  trust: ['RELATIONSHIPS', 'LEADERSHIP'],
  reputation: ['RELATIONSHIPS', 'LEADERSHIP'],
  health: [],
  travel: [],
  loadout: [],
  meaning: [],
  reality: [],
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
