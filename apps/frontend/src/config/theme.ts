/**
 * Life World OS colour theme
 *
 * Matches tailwind.config.ts palette. Use for consistent colours across the app
 * (blog, modals, tags, etc.).
 */

/** Pillar colours from Tailwind theme */
export const themeColors = {
  capacity: '#10b981',
  engines: '#3b82f6',
  oxygen: '#06b6d4',
  meaning: '#8b5cf6',
  optionality: '#f59e0b',
} as const

/** Default/neutral when category doesn't match */
export const themeNeutral = '#6b7280'

/**
 * Map blog (and other) category names to Life World theme colours.
 * Blog categories like "Systems", "Tech", "Career" map to the five pillars.
 */
const CATEGORY_TO_THEME: Record<string, keyof typeof themeColors> = {
  capacity: 'capacity',
  engines: 'engines',
  oxygen: 'oxygen',
  meaning: 'meaning',
  optionality: 'optionality',
  systems: 'engines',
  tech: 'oxygen',
  career: 'meaning',
  'life world os': 'capacity',
}

/**
 * Resolve a category label to a Life World theme colour hex.
 */
export function getCategoryColor(category: string): string {
  if (!category) return themeNeutral
  const key = category.toLowerCase().trim()
  const themeKey = CATEGORY_TO_THEME[key]
  return themeKey ? themeColors[themeKey] : themeNeutral
}
