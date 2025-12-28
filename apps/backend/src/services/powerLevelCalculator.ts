/**
 * Power Level Calculator
 * 
 * Calculates loadout power level similar to Destiny's Guardian light level system.
 * Combines item power levels with synergy bonuses and weighted calculations.
 */

export interface PowerLevelBreakdown {
  total: number
  primaryWeapon: number
  secondaryWeapon: number
  grenade: number
  armorAbility: number
  tacticalPackage: number
  supportUpgrade: number
  synergyBonus: number
}

export interface LoadoutItemData {
  id: string
  name: string
  slotType: string
  powerLevel: number
  benefits?: Record<string, any>
}

/**
 * Calculate power level for a loadout
 * 
 * Similar to Destiny's system:
 * - Base: Sum of all item power levels
 * - Weighted: Primary/Secondary weapons contribute more
 * - Synergy: Compatible item combinations provide bonuses
 */
export function calculatePowerLevel(items: LoadoutItemData[]): PowerLevelBreakdown {
  // Group items by slot type
  const itemsBySlot: Record<string, LoadoutItemData> = {}
  items.forEach(item => {
    itemsBySlot[item.slotType] = item
  })

  // Base power levels for each slot
  const primaryWeapon = itemsBySlot['PRIMARY_WEAPON']?.powerLevel || 0
  const secondaryWeapon = itemsBySlot['SECONDARY_WEAPON']?.powerLevel || 0
  const grenade = itemsBySlot['GRENADE']?.powerLevel || 0
  const armorAbility = itemsBySlot['ARMOR_ABILITY']?.powerLevel || 0
  const tacticalPackage = itemsBySlot['TACTICAL_PACKAGE']?.powerLevel || 0
  const supportUpgrade = itemsBySlot['SUPPORT_UPGRADE']?.powerLevel || 0

  // Weighted calculation (Primary and Secondary contribute more)
  const weightedPrimary = primaryWeapon * 1.2 // 20% bonus
  const weightedSecondary = secondaryWeapon * 1.1 // 10% bonus
  const weightedGrenade = grenade * 1.0
  const weightedArmor = armorAbility * 1.0
  const weightedTactical = tacticalPackage * 0.9 // Slightly less weight
  const weightedSupport = supportUpgrade * 0.9 // Slightly less weight

  // Calculate synergy bonuses
  const synergyBonus = calculateSynergyBonus(itemsBySlot)

  // Total power level
  const total = Math.round(
    weightedPrimary +
    weightedSecondary +
    weightedGrenade +
    weightedArmor +
    weightedTactical +
    weightedSupport +
    synergyBonus
  )

  return {
    total,
    primaryWeapon: Math.round(weightedPrimary),
    secondaryWeapon: Math.round(weightedSecondary),
    grenade: Math.round(weightedGrenade),
    armorAbility: Math.round(weightedArmor),
    tacticalPackage: Math.round(weightedTactical),
    supportUpgrade: Math.round(weightedSupport),
    synergyBonus: Math.round(synergyBonus),
  }
}

/**
 * Calculate synergy bonuses for compatible item combinations
 * 
 * Examples:
 * - Resilience + Courage = +50 bonus (complementary traits)
 * - Focus + Efficiency = +30 bonus (synergistic)
 */
function calculateSynergyBonus(itemsBySlot: Record<string, LoadoutItemData>): number {
  let bonus = 0

  const primary = itemsBySlot['PRIMARY_WEAPON']
  const secondary = itemsBySlot['SECONDARY_WEAPON']
  const tactical = itemsBySlot['TACTICAL_PACKAGE']
  const support = itemsBySlot['SUPPORT_UPGRADE']

  // Resilience + Courage synergy (complementary traits)
  if (
    primary?.name.toLowerCase().includes('resilience') &&
    secondary?.name.toLowerCase().includes('courage')
  ) {
    bonus += 50
  }

  // Focus + Efficiency synergy
  if (
    primary?.name.toLowerCase().includes('focus') &&
    tactical?.name.toLowerCase().includes('efficiency')
  ) {
    bonus += 30
  }

  // Discipline + Optimization synergy
  if (
    primary?.name.toLowerCase().includes('discipline') &&
    tactical?.name.toLowerCase().includes('optimization')
  ) {
    bonus += 30
  }

  // Determination + Motivation synergy
  if (
    primary?.name.toLowerCase().includes('determination') &&
    support?.name.toLowerCase().includes('motivation')
  ) {
    bonus += 25
  }

  // Adaptability + Balance synergy
  if (
    secondary?.name.toLowerCase().includes('adaptability') &&
    support?.name.toLowerCase().includes('balance')
  ) {
    bonus += 25
  }

  // Full loadout bonus (all slots filled)
  const allSlotsFilled = Object.keys(itemsBySlot).length === 6
  if (allSlotsFilled) {
    bonus += 100
  }

  return bonus
}


