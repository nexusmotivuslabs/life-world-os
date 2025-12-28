/**
 * UserContextPort
 * 
 * Port (interface) for accessing user context/data from existing systems.
 * This allows the money domain to read user's Resources, Engines, Investments, etc.
 */

export interface UserResources {
  oxygen: number
  water: number
  gold: number
  armor: number
  keys: number
  energy: number
}

export interface UserEngine {
  id: string
  type: string
  name: string
  currentOutput: number
  status: string
}

export interface UserInvestment {
  id: string
  type: string
  name: string
  amount: number
  currentValue: number
  expectedYield: number
}

export interface UserContext {
  userId: string
  resources: UserResources | null
  engines: UserEngine[]
  investments: UserInvestment[]
  overallXP: number
  overallRank: string
  overallLevel: number
}

export interface UserContextPort {
  /**
   * Get user context (resources, engines, investments, stats)
   */
  getUserContext(userId: string): Promise<UserContext>

  /**
   * Get user resources only
   */
  getUserResources(userId: string): Promise<UserResources | null>

  /**
   * Get user engines only
   */
  getUserEngines(userId: string): Promise<UserEngine[]>

  /**
   * Get user investments only
   */
  getUserInvestments(userId: string): Promise<UserInvestment[]>
}


