/**
 * The five Constraints of Life — UK national constraint intelligence.
 * Select an area first; data is then loaded for that sector.
 */

export const CONSTRAINT_IDS = ['physical', 'biological', 'economic', 'informational', 'social'] as const
export type ConstraintId = (typeof CONSTRAINT_IDS)[number]

export interface ConstraintOfLifeMeta {
  id: ConstraintId
  name: string
  shortDescription: string
  layer: number
}

export const CONSTRAINTS_OF_LIFE: ConstraintOfLifeMeta[] = [
  { id: 'physical', name: 'Physical', layer: 1, shortDescription: 'Energy, resources, supply-side limits' },
  { id: 'biological', name: 'Biological', layer: 2, shortDescription: 'Demography, health, labour supply' },
  { id: 'economic', name: 'Economic', layer: 3, shortDescription: 'Fiscal, monetary, financial conditions' },
  { id: 'informational', name: 'Informational', layer: 4, shortDescription: 'Digital infrastructure, productivity, innovation' },
  { id: 'social', name: 'Social', layer: 5, shortDescription: 'Stability, trust, institutional stress' },
]
