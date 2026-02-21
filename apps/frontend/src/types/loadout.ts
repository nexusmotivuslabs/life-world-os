/**
 * Loadout System Type Definitions
 */

export enum LoadoutSlotType {
  PRIMARY_WEAPON = 'PRIMARY_WEAPON',
  SECONDARY_WEAPON = 'SECONDARY_WEAPON',
  GRENADE = 'GRENADE',
  ARMOR_ABILITY = 'ARMOR_ABILITY',
  TACTICAL_PACKAGE = 'TACTICAL_PACKAGE',
  SUPPORT_UPGRADE = 'SUPPORT_UPGRADE',
}

/** Single rank tier in the loadout item ranking system (unlock progression). */
export interface LoadoutItemRankTier {
  id: string
  name: string
  order: number
  howToUnlock: string
}

export interface LoadoutItem {
  id: string
  name: string
  slotType: LoadoutSlotType
  description: string
  powerLevel: number
  benefits: LoadoutBenefits
  icon?: string
  isDefault: boolean
  /** Optional per-item rank unlock criteria; falls back to default tiers if absent. */
  ranking?: LoadoutItemRankTier[]
  createdAt: string
  updatedAt: string
}

export interface LoadoutBenefits {
  capacity?: number // Stat bonus
  engines?: number
  oxygen?: number
  meaning?: number
  optionality?: number
  xpGain?: number // Percentage modifier (e.g., 0.05 = +5%)
  energyEfficiency?: number // Percentage modifier
  energyCostReduction?: number // Percentage reduction
  [key: string]: any // Allow additional benefits
}

export interface LoadoutSlot {
  id: string
  loadoutId: string
  itemId: string
  item: LoadoutItem
  slotType: LoadoutSlotType
  createdAt: string
}

export interface Loadout {
  id: string
  userId: string
  name: string
  isActive: boolean
  isPreset?: boolean // True for preset loadouts, false for custom loadouts
  slots: LoadoutSlot[]
  createdAt: string
  updatedAt: string
}

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

export interface CreateLoadoutInput {
  name: string
  slots: {
    slotType: LoadoutSlotType
    itemId: string
  }[]
}

export interface UpdateLoadoutInput {
  name?: string
  slots?: {
    slotType: LoadoutSlotType
    itemId: string
  }[]
}

export const SLOT_TYPE_LABELS: Record<LoadoutSlotType, string> = {
  [LoadoutSlotType.PRIMARY_WEAPON]: 'Primary Weapon',
  [LoadoutSlotType.SECONDARY_WEAPON]: 'Secondary Weapon',
  [LoadoutSlotType.GRENADE]: 'Grenade',
  [LoadoutSlotType.ARMOR_ABILITY]: 'Armor Ability',
  [LoadoutSlotType.TACTICAL_PACKAGE]: 'Tactical Package',
  [LoadoutSlotType.SUPPORT_UPGRADE]: 'Support Upgrade',
}

