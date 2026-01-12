import { OverallRank } from '../types'

// Rank thresholds (Halo 3 style)
export const RANK_THRESHOLDS: Array<{ rank: OverallRank; minXP: number; maxXP: number | null }> = [
  { rank: OverallRank.RECRUIT, minXP: 0, maxXP: 1000 },
  { rank: OverallRank.PRIVATE, minXP: 1000, maxXP: 5000 },
  { rank: OverallRank.CORPORAL, minXP: 5000, maxXP: 10000 },
  { rank: OverallRank.SERGEANT, minXP: 10000, maxXP: 20000 },
  { rank: OverallRank.STAFF_SERGEANT, minXP: 20000, maxXP: 35000 },
  { rank: OverallRank.SERGEANT_FIRST_CLASS, minXP: 35000, maxXP: 55000 },
  { rank: OverallRank.MASTER_SERGEANT, minXP: 55000, maxXP: 80000 },
  { rank: OverallRank.FIRST_SERGEANT, minXP: 80000, maxXP: 110000 },
  { rank: OverallRank.SERGEANT_MAJOR, minXP: 110000, maxXP: 150000 },
  { rank: OverallRank.COMMAND_SERGEANT_MAJOR, minXP: 150000, maxXP: null },
]

/**
 * Calculate overall rank from total XP
 */
export function calculateOverallRank(overallXP: number): OverallRank {
  for (let i = RANK_THRESHOLDS.length - 1; i >= 0; i--) {
    const threshold = RANK_THRESHOLDS[i]
    if (overallXP >= threshold.minXP) {
      return threshold.rank
    }
  }
  return OverallRank.RECRUIT
}

/**
 * Calculate overall level from XP
 * Level = floor(Overall XP / 5000) + 1
 */
export function calculateOverallLevel(overallXP: number): number {
  return Math.floor(overallXP / 5000) + 1
}

/**
 * Calculate category level from category XP
 * Level = floor(Category XP / 1000) + 1
 */
export function calculateCategoryLevel(categoryXP: number): number {
  return Math.floor(categoryXP / 1000) + 1
}

/**
 * Get XP required for next rank
 */
export function getXPForNextRank(currentRank: OverallRank, currentXP: number): number | null {
  const currentIndex = RANK_THRESHOLDS.findIndex((t) => t.rank === currentRank)
  if (currentIndex === -1 || currentIndex === RANK_THRESHOLDS.length - 1) {
    return null // Already at max rank
  }

  const nextThreshold = RANK_THRESHOLDS[currentIndex + 1]
  return nextThreshold.minXP - currentXP
}

/**
 * Get progress percentage to next rank
 */
export function getRankProgress(currentRank: OverallRank, currentXP: number): number {
  const currentThreshold = RANK_THRESHOLDS.find((t) => t.rank === currentRank)
  if (!currentThreshold) return 0

  const nextThreshold = RANK_THRESHOLDS.find((t) => t.minXP > currentThreshold.minXP)
  if (!nextThreshold) return 100 // Max rank

  const range = nextThreshold.minXP - currentThreshold.minXP
  const progress = currentXP - currentThreshold.minXP
  return Math.min(100, Math.max(0, (progress / range) * 100))
}





