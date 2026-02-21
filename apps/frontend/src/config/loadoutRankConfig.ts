/**
 * Loadout item ranking system: tier definitions and default "how to unlock" criteria.
 * Each item can optionally override ranking via item.ranking; otherwise these defaults apply.
 */

import type { LoadoutItemRankTier } from '../types/loadout'

export const LOADOUT_RANK_TIERS: LoadoutItemRankTier[] = [
  {
    id: 'recruit',
    name: 'Recruit',
    order: 1,
    howToUnlock: 'Available when the item is first unlocked. Equip it in any loadout to start using it.',
  },
  {
    id: 'operative',
    name: 'Operative',
    order: 2,
    howToUnlock: 'Equip this item in your active loadout for 7 consecutive days.',
  },
  {
    id: 'veteran',
    name: 'Veteran',
    order: 3,
    howToUnlock: 'Complete 50 actions while this item is equipped in your active loadout.',
  },
  {
    id: 'master',
    name: 'Master',
    order: 4,
    howToUnlock: 'Reach 30 days with this item equipped and complete 200 actions with it in your loadout.',
  },
  {
    id: 'elite',
    name: 'Elite',
    order: 5,
    howToUnlock: 'Achieve Master rank and maintain this item in your active loadout for 90 days total.',
  },
]

export const RANK_TIER_BY_ID = Object.fromEntries(
  LOADOUT_RANK_TIERS.map((t) => [t.id, t])
) as Record<string, LoadoutItemRankTier>

/** Default "current rank" until user progress is available (e.g. from API). */
export const DEFAULT_CURRENT_RANK_ID = 'recruit'
