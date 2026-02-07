/**
 * Release Status Configuration
 * 
 * Centralized configuration for feature release statuses
 * V2 Release - Phase 2 of Active Development
 * Refactored Tier 0 and Tier 1 systems
 */

import { ReleaseStatus, type ReleaseAttributes, type ReleaseInfo } from '../types/release'

/**
 * Release status configuration for all features
 * V2 Release - Phase 2: Refactored Tier 0 and Tier 1 systems
 */
export const releaseStatuses: Record<string, ReleaseInfo> = {
  // Planes
  knowledge: {
    id: 'knowledge',
    name: 'Knowledge Plane',
    attributes: {
      status: ReleaseStatus.COMING_SOON,
      version: '2.0.0',
      estimatedReleaseDate: '2025-04-01',
      progress: 60,
      requirements: [
        'Refactored knowledge architecture',
        'Enhanced artifact management',
        'Improved search and filtering',
        'Knowledge base integration',
      ],
      notes: 'V2 Release - Phase 2: Refactored Tier 0 and Tier 1 systems. Knowledge plane refactoring in progress.',
      lastUpdated: '2025-01-25',
    },
  },
  systems: {
    id: 'systems',
    name: 'Systems Plane',
    attributes: {
      status: ReleaseStatus.LIVE,
      version: '2.0.0',
      notes: 'V2 Release - Phase 2: Refactored Tier 0 and Tier 1 systems. Finance, Energy, Health, and Software systems are live.',
      lastUpdated: '2026-02-06',
    },
  },
  insight: {
    id: 'insight',
    name: 'Insight Plane',
    attributes: {
      status: ReleaseStatus.COMING_SOON,
      version: '2.0.0',
      estimatedReleaseDate: '2025-03-01',
      progress: 45,
      requirements: [
        'Analytics dashboard implementation',
        'Trend analysis algorithms',
        'Report generation system',
        'Data visualization components',
      ],
      blockers: [
        'Backend analytics API endpoints',
        'Data aggregation pipeline',
      ],
      notes: 'V2 Release - Phase 2: Core analytics infrastructure in progress',
      lastUpdated: '2025-01-25',
    },
  },
  configuration: {
    id: 'configuration',
    name: 'Configuration',
    attributes: {
      status: ReleaseStatus.LIVE,
      version: '2.0.0',
      lastUpdated: '2025-01-25',
    },
  },
  // Individual Systems - V2 Release
      finance: {
        id: 'finance',
        name: 'Finance System',
    attributes: {
      status: ReleaseStatus.LIVE,
      version: '2.0.0',
      notes: 'V2 Release - Phase 2: Base architecture system. Refactored Tier 0 system. All systems share the same components and engine.',
      lastUpdated: '2025-01-25',
    },
  },
  energy: {
    id: 'energy',
    name: 'Energy System',
    attributes: {
      status: ReleaseStatus.LIVE,
      version: '2.0.0',
      notes: 'V2 Release - Phase 2: Refactored Tier 1 system. Shares components and engine with Finance system.',
      lastUpdated: '2025-01-25',
    },
  },
  health: {
    id: 'health',
    name: 'Health System',
    attributes: {
      status: ReleaseStatus.LIVE,
      version: '2.0.0',
      notes: 'V2 Release - Phase 2: Refactored Tier 1 system. Shares components and engine with Finance system.',
      lastUpdated: '2025-01-25',
    },
  },
  software: {
    id: 'software',
    name: 'Software System',
    attributes: {
      status: ReleaseStatus.LIVE,
      version: '2.0.0',
      notes: 'Leverage tier system for software architecture, delivery, and quality.',
      lastUpdated: '2026-02-06',
    },
  },
  investment: {
    id: 'investment',
    name: 'Investment System',
    attributes: {
      status: ReleaseStatus.COMING_SOON,
      version: '2.0.0',
      estimatedReleaseDate: '2025-03-15',
      progress: 25,
      requirements: [
        'Refactor to use shared Finance system architecture',
        'Fix existing bugs',
        'Integration with shared components and engine',
        'Tier 1 system refactoring',
      ],
      blockers: [
        'Bugs in current implementation',
        'Needs refactoring to match Finance system architecture',
      ],
      notes: 'V2 Release - Phase 2: Coming soon - needs refactoring and bug fixes. Will share components with Finance system.',
      lastUpdated: '2025-01-25',
    },
  },
  training: {
    id: 'training',
    name: 'Training System',
    attributes: {
      status: ReleaseStatus.COMING_SOON,
      version: '2.0.0',
      estimatedReleaseDate: '2025-03-15',
      progress: 20,
      requirements: [
        'Refactor to use shared Finance system architecture',
        'Fix existing bugs',
        'Integration with shared components and engine',
        'Tier 1 system refactoring',
      ],
      blockers: [
        'Bugs in current implementation',
        'Needs refactoring to match Finance system architecture',
      ],
      notes: 'V2 Release - Phase 2: Coming soon - needs refactoring and bug fixes. Will share components with Finance system.',
      lastUpdated: '2025-01-25',
    },
  },
  meaning: {
    id: 'meaning',
    name: 'Meaning System',
    attributes: {
      status: ReleaseStatus.COMING_SOON,
      version: '2.0.0',
      estimatedReleaseDate: '2025-03-15',
      progress: 15,
      requirements: [
        'Refactor to use shared Finance system architecture',
        'Fix existing bugs',
        'Integration with shared components and engine',
        'Tier 1 system refactoring',
      ],
      blockers: [
        'Bugs in current implementation',
        'Needs refactoring to match Finance system architecture',
      ],
      notes: 'V2 Release - Phase 2: Coming soon - needs refactoring and bug fixes. Will share components with Finance system.',
      lastUpdated: '2025-01-25',
    },
  },
  // Loadouts (Weapons & Armour) - Live
  loadouts: {
    id: 'loadouts',
    name: 'Loadouts',
    attributes: {
      status: ReleaseStatus.LIVE,
      version: '2.0.0',
      lastUpdated: '2025-01-25',
    },
  },
  // Coming Soon Features
  weapons: {
    id: 'weapons',
    name: 'Weapons',
    attributes: {
      status: ReleaseStatus.COMING_SOON,
      version: '2.0.0',
      estimatedReleaseDate: '2025-02-15',
      progress: 30,
      requirements: [
        'Weapon management UI',
        'Equip/unequip functionality',
        'Weapon effects system',
        'Loadout integration',
      ],
      notes: 'V2 Release - Phase 2: Weapon system UI in development',
      lastUpdated: '2025-01-25',
    },
  },
  artifacts: {
    id: 'artifacts',
    name: 'Artifacts',
    attributes: {
      status: ReleaseStatus.LIVE,
      version: '2.0.0',
      lastUpdated: '2025-01-25',
    },
  },
}

/**
 * Get release info for a feature
 */
export function getReleaseInfo(featureId: string): ReleaseInfo | null {
  return releaseStatuses[featureId] || null
}

/**
 * Get release status for a feature
 */
export function getReleaseStatus(featureId: string): ReleaseStatus | null {
  const info = getReleaseInfo(featureId)
  return info?.attributes.status || null
}

