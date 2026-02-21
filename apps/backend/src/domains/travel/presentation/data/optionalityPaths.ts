/**
 * The 3 viable optionality paths for work/live abroad.
 * No hype. No Instagram nonsense. These are the only real ones.
 * Used by GET /api/travel/visa-move/paths and for AI/feedback.
 */

export interface OptionalityPath {
  id: string
  title: string
  subtitle: string
  bullets: string[]
  pros: string[]
  cons: string[]
  summary: string
}

export const OPTIONALITY_PATHS: OptionalityPath[] = [
  {
    id: 'employer-sponsored',
    title: 'Path 1: Employer-sponsored mobility',
    subtitle: 'Internal transfer · Global company · Relocation package',
    bullets: [
      'Internal transfer',
      'Global company',
      'Relocation package',
    ],
    pros: [
      'Safest for family',
      'Healthcare and admin handled',
    ],
    cons: [
      'Slow',
      'You trade autonomy for security',
      "You're dependent on corporate timing",
    ],
    summary: 'This path works, but only if you deliberately aim at companies with global footprints.',
  },
  {
    id: 'remote-residency',
    title: 'Path 2: Remote-first income + residency',
    subtitle: 'UK income · Live abroad legally · Digital nomad or residence visas',
    bullets: [
      'UK income',
      'Live abroad legally',
      'Digital nomad or residence visas',
    ],
    pros: [
      'Faster',
      'Keeps income stable',
      'High control',
    ],
    cons: [
      'Requires employer or contract flexibility',
      'Requires discipline and planning',
    ],
    summary: 'This is where optionality usually opens first.',
  },
  {
    id: 'ownership-income',
    title: 'Path 3: Ownership-based income',
    subtitle: 'Consulting · Advisory · IP · Long-term, low-maintenance income',
    bullets: [
      'Consulting',
      'Advisory',
      'IP',
      'Long-term, low-maintenance income',
    ],
    pros: [
      'Maximum control',
      'Long-term family optionality',
    ],
    cons: [
      'Slow to build',
      'Not a short-term escape hatch',
    ],
    summary: 'This is the second leg, not the first.',
  },
]

export const OPTIONALITY_PATHS_INTRO =
  'The 3 viable optionality paths for someone like you. No hype. No Instagram nonsense. These are the only real ones.'
