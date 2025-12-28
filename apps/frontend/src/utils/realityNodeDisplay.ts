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


