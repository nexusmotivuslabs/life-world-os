/**
 * Artifact Category and Metadata Types
 * 
 * Defines categories, metadata, and color coding for artifacts
 * with knowledge base on color choices.
 */

/**
 * Artifact Category Enum
 * 
 * Categories represent the fundamental classification of artifacts
 * in the Life World OS system.
 */
export enum ArtifactCategory {
  RESOURCE = 'RESOURCE',
  STAT = 'STAT',
  SYSTEM = 'SYSTEM',
  CONCEPT = 'CONCEPT',
  LAW = 'LAW',
  PRINCIPLE = 'PRINCIPLE',
  FRAMEWORK = 'FRAMEWORK',
  WEAPON = 'WEAPON',
}

/**
 * Artifact Metadata
 * 
 * Contains category and color information with rationale
 */
export interface ArtifactMetadata {
  category: ArtifactCategory
  color: {
    text: string
    bg: string
    border: string
    label: string
  }
  rationale: string // Knowledge base: why this color was chosen
}

/**
 * Color Knowledge Base
 * 
 * Maps categories to colors with semantic meaning and rationale.
 * Colors are chosen based on psychological associations, cultural meanings,
 * and visual hierarchy principles.
 */
export const ARTIFACT_CATEGORY_COLORS: Record<ArtifactCategory, ArtifactMetadata> = {
  [ArtifactCategory.RESOURCE]: {
    category: ArtifactCategory.RESOURCE,
    color: {
      text: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      label: 'text-green-300',
    },
    rationale: 'Green represents growth, abundance, and value. Resources are assets that can be accumulated and used, similar to money and natural resources which are culturally associated with green.',
  },
  [ArtifactCategory.STAT]: {
    category: ArtifactCategory.STAT,
    color: {
      text: 'text-pink-400',
      bg: 'bg-pink-500/10',
      border: 'border-pink-500/30',
      label: 'text-pink-300',
    },
    rationale: 'Pink represents health, vitality, and life force. Stats like Capacity and Health are measures of living systems, and pink is associated with biological health indicators.',
  },
  [ArtifactCategory.SYSTEM]: {
    category: ArtifactCategory.SYSTEM,
    color: {
      text: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      label: 'text-blue-300',
    },
    rationale: 'Blue represents structure, stability, and technology. Systems are organized structures that operate according to rules, similar to how blue is associated with order and reliability.',
  },
  [ArtifactCategory.CONCEPT]: {
    category: ArtifactCategory.CONCEPT,
    color: {
      text: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      label: 'text-purple-300',
    },
    rationale: 'Purple represents wisdom, abstraction, and higher-order thinking. Concepts are abstract ideas that require mental processing, and purple is historically associated with knowledge and philosophy.',
  },
  [ArtifactCategory.LAW]: {
    category: ArtifactCategory.LAW,
    color: {
      text: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      label: 'text-orange-300',
    },
    rationale: 'Orange represents energy, power, and transformation. Laws govern behavior and create change, and orange conveys the dynamic nature of power and influence.',
  },
  [ArtifactCategory.PRINCIPLE]: {
    category: ArtifactCategory.PRINCIPLE,
    color: {
      text: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      label: 'text-cyan-300',
    },
    rationale: 'Cyan represents clarity, flow, and guidance. Principles provide clear direction and flow of logic, and cyan is associated with clear thinking and communication.',
  },
  [ArtifactCategory.FRAMEWORK]: {
    category: ArtifactCategory.FRAMEWORK,
    color: {
      text: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/30',
      label: 'text-indigo-300',
    },
    rationale: 'Indigo represents depth, structure, and integration. Frameworks provide deep structural understanding and integrate multiple concepts, and indigo conveys depth and sophistication.',
  },
  [ArtifactCategory.WEAPON]: {
    category: ArtifactCategory.WEAPON,
    color: {
      text: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      label: 'text-red-300',
    },
    rationale: 'Red represents power, strength, and action. Weapons are tools that amplify capability and provide advantages in achieving goals, and red conveys strength and determination.',
  },
}

/**
 * Human-readable labels: RESOURCE -> Resource, STAT -> Stat, etc.
 * Single source of truth for display across the app.
 */
export const ARTIFACT_CATEGORY_LABELS: Record<ArtifactCategory, string> = {
  [ArtifactCategory.RESOURCE]: 'Resource',
  [ArtifactCategory.STAT]: 'Stat',
  [ArtifactCategory.SYSTEM]: 'System',
  [ArtifactCategory.CONCEPT]: 'Concept',
  [ArtifactCategory.LAW]: 'Law',
  [ArtifactCategory.PRINCIPLE]: 'Principle',
  [ArtifactCategory.FRAMEWORK]: 'Framework',
  [ArtifactCategory.WEAPON]: 'Weapon',
}

/** Config shape for display (label + colour) - matches DomainTag pattern */
export interface ArtifactCategoryConfig {
  label: string
  color: string
  bgColor: string
  borderColor: string
}

/**
 * Get category config (label + colour). Handles unknown categories with fallback.
 */
export function getArtifactCategoryConfig(category: ArtifactCategory | string): ArtifactCategoryConfig {
  const meta = ARTIFACT_CATEGORY_COLORS[category as ArtifactCategory]
  if (meta) {
    return {
      label: ARTIFACT_CATEGORY_LABELS[category as ArtifactCategory],
      color: meta.color.text,
      bgColor: meta.color.bg,
      borderColor: meta.color.border,
    }
  }
  const fallbackLabel = String(category).replace(/_/g, ' ').replace(/\b\w/g, c => c.toLowerCase())
  return {
    label: fallbackLabel,
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30',
  }
}

/**
 * Get category metadata
 */
export function getArtifactCategoryMetadata(category: ArtifactCategory | string): ArtifactMetadata {
  const meta = ARTIFACT_CATEGORY_COLORS[category as ArtifactCategory]
  if (meta) return meta
  const config = getArtifactCategoryConfig(category)
  return {
    category: category as ArtifactCategory,
    color: {
      text: config.color,
      bg: config.bgColor,
      border: config.borderColor,
      label: config.color.replace('-400', '-300'),
    },
    rationale: '',
  }
}

/**
 * Get category display label (singular: Resource, Stat, System, etc.)
 */
export function getArtifactCategoryLabel(category: ArtifactCategory | string): string {
  return getArtifactCategoryConfig(category).label
}

/**
 * Get category description
 */
export function getArtifactCategoryDescription(category: ArtifactCategory): string {
  const descriptions: Record<ArtifactCategory, string> = {
    [ArtifactCategory.RESOURCE]: 'Assets, currencies, and consumable items that enable actions.',
    [ArtifactCategory.STAT]: 'Measurable attributes that affect system behavior and capabilities.',
    [ArtifactCategory.SYSTEM]: 'Organized structures with defined rules and interactions.',
    [ArtifactCategory.CONCEPT]: 'Abstract ideas and mental models for understanding reality.',
    [ArtifactCategory.LAW]: 'Immutable rules that govern behavior and outcomes.',
    [ArtifactCategory.PRINCIPLE]: 'Fundamental truths that guide decision-making.',
    [ArtifactCategory.FRAMEWORK]: 'Structured approaches for analysis and problem-solving.',
    [ArtifactCategory.WEAPON]: 'Capabilities and tools that amplify effectiveness and provide strategic advantages.',
  }
  return descriptions[category]
}

