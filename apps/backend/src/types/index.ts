// Type definitions for Life World OS

export enum OverallRank {
  RECRUIT = 'RECRUIT',
  PRIVATE = 'PRIVATE',
  CORPORAL = 'CORPORAL',
  SERGEANT = 'SERGEANT',
  STAFF_SERGEANT = 'STAFF_SERGEANT',
  SERGEANT_FIRST_CLASS = 'SERGEANT_FIRST_CLASS',
  MASTER_SERGEANT = 'MASTER_SERGEANT',
  FIRST_SERGEANT = 'FIRST_SERGEANT',
  SERGEANT_MAJOR = 'SERGEANT_MAJOR',
  COMMAND_SERGEANT_MAJOR = 'COMMAND_SERGEANT_MAJOR',
}

export enum Season {
  SPRING = 'SPRING',
  SUMMER = 'SUMMER',
  AUTUMN = 'AUTUMN',
  WINTER = 'WINTER',
}

export enum EngineType {
  CAREER = 'CAREER',
  BUSINESS = 'BUSINESS',
  INVESTMENT = 'INVESTMENT',
  LEARNING = 'LEARNING',
}

export enum EngineStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PLANNING = 'PLANNING',
}

export enum MilestoneType {
  OXYGEN_MONTHS = 'OXYGEN_MONTHS',
  FIRST_ASSET = 'FIRST_ASSET',
  ABILITY_TO_SAY_NO = 'ABILITY_TO_SAY_NO',
  SURVIVE_LOW_INCOME = 'SURVIVE_LOW_INCOME',
  REDUCED_FRAGILITY = 'REDUCED_FRAGILITY',
  FIRST_PASSIVE_INCOME = 'FIRST_PASSIVE_INCOME',
  SIX_MONTHS_EXPENSES = 'SIX_MONTHS_EXPENSES',
  ONE_YEAR_EXPENSES = 'ONE_YEAR_EXPENSES',
}

export enum ActivityType {
  WORK_PROJECT = 'WORK_PROJECT',
  EXERCISE = 'EXERCISE',
  SAVE_EXPENSES = 'SAVE_EXPENSES',
  LEARNING = 'LEARNING',
  REST = 'REST', // Recovery action - consumes energy, grants no XP, improves Capacity
  SEASON_COMPLETION = 'SEASON_COMPLETION',
  MILESTONE = 'MILESTONE',
  CUSTOM = 'CUSTOM',
}

export enum TrainingModuleType {
  EMERGENCY_FUND = 'EMERGENCY_FUND',
  INCREASE_INCOME = 'INCREASE_INCOME',
  REDUCE_EXPENSES = 'REDUCE_EXPENSES',
  AUTOMATE_SAVINGS = 'AUTOMATE_SAVINGS',
  MULTIPLE_INCOME_STREAMS = 'MULTIPLE_INCOME_STREAMS',
  TRACK_EXPENSES = 'TRACK_EXPENSES',
  AVOID_LIFESTYLE_INFLATION = 'AVOID_LIFESTYLE_INFLATION',
}

export enum TaskStatus {
  LOCKED = 'LOCKED',
  AVAILABLE = 'AVAILABLE',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum InvestmentType {
  CRYPTO = 'CRYPTO',
  STOCKS = 'STOCKS',
  CASH = 'CASH',
  HIGH_YIELD_SAVINGS = 'HIGH_YIELD_SAVINGS',
}

export interface CategoryXP {
  capacity: number
  engines: number
  oxygen: number
  meaning: number
  optionality: number
}

export interface ResourceChanges {
  oxygen?: number
  water?: number
  gold?: number
  armor?: number
  keys?: number
}

export interface XPCalculation {
  overallXP: number
  categoryXP: CategoryXP
  seasonMultiplier: number
}

export interface BalanceIndicator {
  isBalanced: boolean
  averageLevel: number
  categoryLevels: {
    capacity: number
    engines: number
    oxygen: number
    meaning: number
    optionality: number
  }
  warnings: string[]
  recommendations: string[]
}

export interface RankThreshold {
  rank: OverallRank
  minXP: number
  maxXP: number | null
}

