/**
 * UserEnergyContextPort
 * 
 * Port (interface) for accessing user energy context.
 * Provides user's current energy state, capacity, and resources.
 */

export interface UserEnergyContext {
  userId: string
  baseEnergy: number
  capacity: number
  capacityCap: number
  isInBurnout: boolean
  temporaryBoosts: number[]
}

export interface UserEnergyContextPort {
  /**
   * Get user's current energy context
   */
  getUserEnergyContext(userId: string): Promise<UserEnergyContext>
}

