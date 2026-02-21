/**
 * Structural Pillars Configuration
 *
 * Core self (Character) is the foundation. Health, Career, and Relationships
 * are the three core tier 0 support systems that sit on top of it.
 *
 * - If character fractures, everything destabilises.
 * - If health collapses, performance drops.
 * - If career shakes but character is stable, you adapt.
 * - If relationship shakes but character is stable, you respond calmly.
 *
 * Character is foundation. Not status. Not title. Not being chosen.
 */

export const STRUCTURAL_PILLARS = {
  /** Foundation layer—not a system, the base everything rests on. */
  CHARACTER: {
    id: 'character',
    name: 'Character',
    description: 'Core self. The foundation everything rests on. Character is foundation. Not status. Not title. Not being chosen.',
    mantra: 'Character is foundation.',
    causalRules: [
      'If character fractures, everything destabilises.',
    ],
  },
  /** Core tier 0 support systems. */
  CORE_TIER_0: {
    HEALTH: {
      id: 'health',
      name: 'Health',
      description: 'Human operating stability: physical health, mental resilience, cognitive efficiency, and recovery elasticity.',
      mantra: 'Capacity governs everything else.',
      causalRule: 'If health collapses, performance drops.',
    },
    CAREER: {
      id: 'career',
      name: 'Career',
      description: 'Income generation, professional development, and strategic optionality. Engines, Trust, Reputation, Optionality.',
      mantra: 'If career shakes but character is stable, you adapt.',
      causalRule: 'If career shakes but character is stable, you adapt.',
    },
    RELATIONSHIPS: {
      id: 'relationships',
      name: 'Relationships',
      description: 'Trust, reputation, and relational capital. Governs access to opportunities, partnerships, and resources.',
      mantra: 'If relationship shakes but character is stable, you respond calmly.',
      causalRule: 'If relationship shakes but character is stable, you respond calmly.',
    },
  },
} as const

export type StructuralPillarId = keyof typeof STRUCTURAL_PILLARS.CORE_TIER_0
export type CoreTier0SystemId = (typeof STRUCTURAL_PILLARS.CORE_TIER_0)[StructuralPillarId]['id']
