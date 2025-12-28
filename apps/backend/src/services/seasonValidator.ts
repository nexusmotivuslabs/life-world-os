import { Season } from '../types'
import { prisma } from '../lib/prisma'

const MIN_SEASON_DURATION_DAYS = 28 // 4 weeks

/**
 * Validate if season transition is allowed
 */
export async function validateSeasonTransition(
  userId: string,
  newSeason: Season,
  currentSeason: Season,
  seasonStartDate: Date,
  waterLevel: number
): Promise<{ allowed: boolean; reason?: string }> {
  // Can't transition to same season
  if (newSeason === currentSeason) {
    return { allowed: false, reason: 'Already in this season' }
  }

  // Check minimum duration
  const daysInSeason = Math.floor(
    (Date.now() - seasonStartDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  if (daysInSeason < MIN_SEASON_DURATION_DAYS) {
    return {
      allowed: false,
      reason: `Must stay in current season for at least ${MIN_SEASON_DURATION_DAYS} days`,
    }
  }

  // Winter restrictions
  if (currentSeason === Season.WINTER) {
    // Can transition from winter to spring (recovery complete)
    if (newSeason !== Season.SPRING) {
      return {
        allowed: false,
        reason: 'Can only transition from Winter to Spring',
      }
    }
  }

  // Force winter if water too low
  if (waterLevel < 20 && newSeason !== Season.WINTER) {
    return {
      allowed: false,
      reason: 'Water level too low. Must enter Winter season for recovery',
    }
  }

  // Block progression if water too low
  if (waterLevel < 30 && newSeason === Season.SUMMER) {
    return {
      allowed: false,
      reason: 'Water level too low for Summer season. Focus on recovery first',
    }
  }

  return { allowed: true }
}

/**
 * Check if major bets/expansion are allowed in current season
 */
export function canMakeMajorBets(season: Season, oxygenMonths: number): {
  allowed: boolean
  reason?: string
} {
  // Winter: NO major bets
  if (season === Season.WINTER) {
    return {
      allowed: false,
      reason: 'No major bets allowed during Winter season',
    }
  }

  // Need oxygen surplus for expansion
  if (oxygenMonths < 3) {
    return {
      allowed: false,
      reason: 'Need at least 3 months of expenses (Oxygen) before expansion',
    }
  }

  return { allowed: true }
}


