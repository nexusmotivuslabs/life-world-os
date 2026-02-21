/**
 * Reality Node Display Utilities
 * 
 * Provides nice display names for Reality hierarchy enum types
 */

export type RealityNodeType =
  | 'REALITY'
  | 'UNIVERSAL_FOUNDATION'
  | 'CATEGORY'
  | 'LAW'
  | 'PRINCIPLE'
  | 'FRAMEWORK'
  | 'AGENT'
  | 'ENVIRONMENT'

export type RealityNodeCategory =
  | 'FOUNDATIONAL'
  | 'FUNDAMENTAL'
  | 'POWER'
  | 'BIBLICAL'
  | 'STRATEGIC'
  | 'SYSTEMIC'
  | 'CROSS_SYSTEM'
  | 'SYSTEM_TIER'
  | 'SYSTEM'
  | 'HUMAN'
  | 'COLLECTIVE'
  | 'ARTIFICIAL'
  | 'ORGANISATIONAL'
  | 'HYBRID'
  | 'PHYSICAL'
  | 'ECONOMIC'
  | 'DIGITAL'
  | 'SOCIAL'
  | 'BIOLOGICAL'

/**
 * Get nice display name for RealityNodeType
 */
export function getNodeTypeDisplayName(nodeType: string): string {
  const displayNames: Record<string, string> = {
    REALITY: 'Reality',
    UNIVERSAL_FOUNDATION: 'Universal Foundation',
    CATEGORY: 'Category',
    LAW: 'Law',
    PRINCIPLE: 'Principle',
    FRAMEWORK: 'Framework',
    AGENT: 'Agent',
    ENVIRONMENT: 'Environment',
  }

  return displayNames[nodeType] || nodeType
}

/**
 * Get nice display name for RealityNodeCategory
 */
export function getCategoryDisplayName(category: string): string {
  const displayNames: Record<string, string> = {
    FOUNDATIONAL: 'Foundational',
    FUNDAMENTAL: 'Fundamental',
    POWER: 'Power',
    BIBLICAL: 'Biblical',
    STRATEGIC: 'Strategic',
    SYSTEMIC: 'Systemic',
    CROSS_SYSTEM: 'Cross-System',
    SYSTEM_TIER: 'Tier',
    SYSTEM: 'System',
    HUMAN: 'Human',
    COLLECTIVE: 'Collective',
    ARTIFICIAL: 'Artificial',
    ORGANISATIONAL: 'Organisational',
    HYBRID: 'Hybrid',
    PHYSICAL: 'Physical',
    ECONOMIC: 'Economic',
    DIGITAL: 'Digital',
    SOCIAL: 'Social',
    BIOLOGICAL: 'Biological',
  }

  return displayNames[category] || category
}

/**
 * Get description for RealityNodeType
 */
export function getNodeTypeDescription(nodeType: string): string {
  const descriptions: Record<string, string> = {
    REALITY: 'The single immutable root of all existence',
    UNIVERSAL_FOUNDATION: 'Foundational structures that govern reality',
    CATEGORY: 'Organizational category grouping related concepts',
    LAW: 'Universal laws that govern all systems',
    PRINCIPLE: 'Strategic and systemic principles for decision-making',
    FRAMEWORK: 'Practical frameworks for applying laws and principles',
    AGENT: 'Entities that act within reality',
    ENVIRONMENT: 'Contexts and settings where reality manifests',
  }

  return descriptions[nodeType] || ''
}

/**
 * Enum-based Tailwind classes for category badges (single source of truth)
 */
export const CATEGORY_BADGE_CLASSES: Record<string, string> = {
  FOUNDATIONAL: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  FUNDAMENTAL: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  POWER: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  BIBLICAL: 'bg-green-500/20 text-green-400 border-green-500/30',
  STRATEGIC: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  SYSTEMIC: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  CROSS_SYSTEM: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  SYSTEM_TIER: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  SYSTEM: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  HUMAN: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  COLLECTIVE: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  ARTIFICIAL: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  ORGANISATIONAL: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  HYBRID: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  PHYSICAL: 'bg-stone-500/20 text-stone-400 border-stone-500/30',
  ECONOMIC: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  DIGITAL: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  SOCIAL: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  BIOLOGICAL: 'bg-lime-500/20 text-lime-400 border-lime-500/30',
}

export function getCategoryBadgeClasses(category: string): string {
  return CATEGORY_BADGE_CLASSES[category] ?? CATEGORY_BADGE_CLASSES.FOUNDATIONAL
}

/**
 * Enum-based Tailwind classes for node type badges (law, principle, framework, etc.)
 */
export const NODE_TYPE_BADGE_CLASSES: Record<string, string> = {
  law: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  principle: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  framework: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  reality: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  constraint: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  category: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  domain: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  'power-law': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'bible-law': 'bg-green-500/20 text-green-400 border-green-500/30',
  artifact: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

export function getNodeTypeBadgeClasses(nodeType: string): string {
  return NODE_TYPE_BADGE_CLASSES[nodeType] ?? NODE_TYPE_BADGE_CLASSES.artifact
}

/**
 * System IDs used for (Travel), (Finance), etc. labels - align with ARTIFACT_SYSTEM_IDS
 */
export const SYSTEM_BADGE_CLASSES: Record<string, string> = {
  travel: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  finance: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  money: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  health: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  energy: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  software: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  optionality: 'bg-green-500/20 text-green-400 border-green-500/30',
  trust: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  reputation: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  loadout: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  meaning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  reality: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

export const SYSTEM_DISPLAY_NAMES: Record<string, string> = {
  travel: 'Travel',
  finance: 'Finance',
  money: 'Finance',
  health: 'Health',
  energy: 'Energy',
  software: 'Software',
  optionality: 'Optionality',
  trust: 'Trust',
  reputation: 'Reputation',
  loadout: 'Loadout',
  meaning: 'Meaning',
  reality: 'Reality',
}

export function getSystemBadgeClasses(systemId: string): string {
  return SYSTEM_BADGE_CLASSES[systemId] ?? 'bg-gray-500/20 text-gray-400 border-gray-500/30'
}

export function getSystemDisplayName(systemId: string): string {
  return SYSTEM_DISPLAY_NAMES[systemId] ?? systemId
}

/**
 * Get description for RealityNodeCategory
 */
export function getCategoryDescription(category: string): string {
  const descriptions: Record<string, string> = {
    FOUNDATIONAL: 'Core structure nodes that form the foundation',
    FUNDAMENTAL: 'Basic immutable laws that govern reality',
    POWER: '48 Laws of Power applied across domains',
    BIBLICAL: 'Bible Laws and biblical principles',
    STRATEGIC: 'Strategic principles and frameworks',
    SYSTEMIC: 'Systemic principles for complex systems',
    CROSS_SYSTEM: 'Cross-system state modifiers that affect all systems (Trust, Reputation, Optionality, Energy Reserve)',
    SYSTEM_TIER: 'System tier categories organizing systems by priority (Survival, Stability, Growth, Leverage, Expression)',
    SYSTEM: 'Individual operational systems and their sub-components',
    HUMAN: 'Individual human agents',
    COLLECTIVE: 'Groups of humans acting as a unit',
    ARTIFICIAL: 'AI systems and automated agents',
    ORGANISATIONAL: 'Formal organizations with structure',
    HYBRID: 'Combinations of human and artificial agents',
    PHYSICAL: 'Physical spaces and material environments',
    ECONOMIC: 'Economic systems, markets, and financial environments',
    DIGITAL: 'Digital spaces, online platforms, and virtual environments',
    SOCIAL: 'Social networks, relationships, and cultural environments',
    BIOLOGICAL: 'Biological systems, ecosystems, and living environments',
  }

  return descriptions[category] || ''
}


