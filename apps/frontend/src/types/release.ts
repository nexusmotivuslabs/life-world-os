/**
 * Release System Types
 * 
 * Defines release statuses and attributes for features, planes, and components
 */

export enum ReleaseStatus {
  REQUIREMENTS_GATHERING = 'requirements_gathering',
  COMING_SOON = 'coming_soon',
  LIVE = 'live',
}

export interface ReleaseAttributes {
  status: ReleaseStatus
  estimatedReleaseDate?: string // ISO date string
  progress?: number // 0-100 percentage
  requirements?: string[] // List of requirements to complete
  blockers?: string[] // List of blockers preventing release
  notes?: string // Additional notes about the release
  version?: string // Version number when live
  lastUpdated?: string // ISO date string
}

export interface ReleaseInfo {
  id: string
  name: string
  attributes: ReleaseAttributes
}

/**
 * Get human-readable label for release status
 */
export function getReleaseStatusLabel(status: ReleaseStatus): string {
  switch (status) {
    case ReleaseStatus.REQUIREMENTS_GATHERING:
      return 'Requirements Gathering'
    case ReleaseStatus.COMING_SOON:
      return 'Coming Soon'
    case ReleaseStatus.LIVE:
      return 'Live'
    default:
      return 'Unknown'
  }
}

/**
 * Get color for release status badge
 */
export function getReleaseStatusColor(status: ReleaseStatus): {
  bg: string
  text: string
  border: string
} {
  switch (status) {
    case ReleaseStatus.REQUIREMENTS_GATHERING:
      return {
        bg: 'bg-orange-500/20',
        text: 'text-orange-400',
        border: 'border-orange-500/30',
      }
    case ReleaseStatus.COMING_SOON:
      return {
        bg: 'bg-yellow-500/20',
        text: 'text-yellow-400',
        border: 'border-yellow-500/30',
      }
    case ReleaseStatus.LIVE:
      return {
        bg: 'bg-green-500/20',
        text: 'text-green-400',
        border: 'border-green-500/30',
      }
    default:
      return {
        bg: 'bg-gray-500/20',
        text: 'text-gray-400',
        border: 'border-gray-500/30',
      }
  }
}

/**
 * Check if a feature is selectable/accessible
 */
export function isFeatureSelectable(status: ReleaseStatus): boolean {
  return status === ReleaseStatus.LIVE
}


