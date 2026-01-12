// Frontend type definitions

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

export enum ActivityType {
  WORK_PROJECT = 'WORK_PROJECT',
  EXERCISE = 'EXERCISE',
  SAVE_EXPENSES = 'SAVE_EXPENSES',
  LEARNING = 'LEARNING',
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

export interface CategoryLevels {
  capacity: number
  engines: number
  oxygen: number
  meaning: number
  optionality: number
}

export interface Clouds {
  capacity: number
  engines: number
  oxygen: number
  meaning: number
  optionality: number
}

export interface Resources {
  oxygen: number
  water: number
  gold: number
  armor: number
  keys: number
  energy?: number
  usableEnergy?: number
  energyCap?: number
}

export interface Engine {
  id: string
  type: EngineType
  name: string
  description?: string
  fragilityScore: number
  currentOutput: number
  status: EngineStatus
  createdAt: string
  updatedAt: string
}

export interface SeasonInfo {
  season: Season
  startDate: string
  daysInSeason: number
}

export interface BalanceIndicator {
  isBalanced: boolean
  averageLevel: number
  categoryLevels: CategoryLevels
  warnings: string[]
  recommendations: string[]
}

export interface DashboardData {
  user: {
    id: string
    username: string
    email: string
    firstName?: string | null // First name from Google or registration
    overallXP: number
    overallRank: OverallRank
    overallLevel: number
    xpForNextRank: number | null
    progressToNextRank: number
    isAdmin?: boolean // Admin status - only configurable in database
  }
  season: SeasonInfo
  clouds: Clouds
  resources: Resources
  xp: {
    overall: number
    category: CategoryXP
    categoryLevels: CategoryLevels
  }
  balance: BalanceIndicator
  engines: Engine[]
  isInBurnout?: boolean // Phase 1: Burnout failure state
}

// Portfolio Rebalancing Types
export enum IncomeStability {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum EmotionalTolerance {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum DecisionDiscipline {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum RebalancingFrequency {
  ANNUAL = 'ANNUAL',
  THRESHOLD_BASED = 'THRESHOLD_BASED',
}

export enum MasterDomain {
  FINANCE = 'finance',
  ENERGY = 'energy',
  TRAVEL = 'travel',
  HEALTH = 'health',
  MEANING = 'meaning',
}

export enum SystemTier {
  SURVIVAL = 'SURVIVAL',
  STABILITY = 'STABILITY',
  GROWTH = 'GROWTH',
  LEVERAGE = 'LEVERAGE',
  EXPRESSION = 'EXPRESSION',
  CROSS_SYSTEM_STATES = 'CROSS_SYSTEM_STATES',
}

export interface TierMetadata {
  tier: SystemTier
  name: string
  question: string
  description: string
  characteristics: string[]
  color: string
  bgColor: string
  borderColor: string
}

export const TIER_METADATA: Record<SystemTier, TierMetadata> = {
  [SystemTier.SURVIVAL]: {
    tier: SystemTier.SURVIVAL,
    name: 'Survival',
    question: 'Can I continue playing at all?',
    description: 'Non-negotiable systems for basic continuity. No optimisation, no growth, no upside. Only survival and continuity. Failure here collapses everything above it.',
    characteristics: [
      'No optimisation',
      'No growth',
      'No upside',
      'Only survival and continuity',
      'Failure collapses everything above'
    ],
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
  [SystemTier.STABILITY]: {
    tier: SystemTier.STABILITY,
    name: 'Stability',
    question: 'Can I absorb shocks without breaking?',
    description: 'Systems that provide buffers, predictability, and downside protection. Low volatility. This tier protects capacity to decide.',
    characteristics: [
      'Buffers',
      'Predictability',
      'Downside protection',
      'Low volatility',
      'Protects capacity to decide'
    ],
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
  },
  [SystemTier.GROWTH]: {
    tier: SystemTier.GROWTH,
    name: 'Growth',
    question: 'Can I improve over time if I behave well?',
    description: 'Systems that enable compounding and long-term expected value. Requires patience, vulnerable to neglect, rewards consistency. This is where discipline pays off.',
    characteristics: [
      'Long-term expected value',
      'Requires patience',
      'Vulnerable to neglect',
      'Rewards consistency',
      'Discipline pays off'
    ],
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
  },
  [SystemTier.LEVERAGE]: {
    tier: SystemTier.LEVERAGE,
    name: 'Leverage',
    question: 'Can I make outcomes disproportionate to effort?',
    description: 'Systems that create asymmetric outcomes through optionality, skill + capital amplification. Higher risk. Requires foundations below. This is where people get tempted too early.',
    characteristics: [
      'Optionality',
      'Skill + capital amplification',
      'Higher risk',
      'Requires foundations below',
      'People get tempted too early'
    ],
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  [SystemTier.EXPRESSION]: {
    tier: SystemTier.EXPRESSION,
    name: 'Expression',
    question: 'How do I want to live once I\'m safe and strong?',
    description: 'Systems for lifestyle, identity, taste, and non-optimal choices. This is not about winning. It\'s about living.',
    characteristics: [
      'Lifestyle',
      'Identity',
      'Taste',
      'Non-optimal choices',
      'Not about winning, about living'
    ],
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  [SystemTier.CROSS_SYSTEM_STATES]: {
    tier: SystemTier.CROSS_SYSTEM_STATES,
    name: 'Cross-System States',
    question: 'What global modifiers affect all systems?',
    description: 'States that cut across all tiers and systems, modifying behavior and outcomes globally. These are universal modifiers that influence multiple systems simultaneously.',
    characteristics: [
      'Global modifiers',
      'Affect multiple systems',
      'Cross-cutting concerns',
      'Universal influence',
      'System-wide impact'
    ],
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
  },
}

export interface PortfolioRebalancingConfig {
  id: string
  userId: string
  timeHorizonYears: number
  incomeStability: IncomeStability
  emotionalTolerance: EmotionalTolerance
  decisionDiscipline: DecisionDiscipline
  targetStocksPercent: number
  targetBondsPercent: number
  rebalancingFrequency: RebalancingFrequency
  driftThreshold: number
  preferContributions: boolean
  bondPurpose: string[]
  lastRebalancedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateRebalancingConfigInput {
  timeHorizonYears: number
  incomeStability: IncomeStability
  emotionalTolerance: EmotionalTolerance
  decisionDiscipline: DecisionDiscipline
  targetStocksPercent?: number
  targetBondsPercent?: number
  rebalancingFrequency: RebalancingFrequency
  driftThreshold: number
  preferContributions: boolean
  bondPurpose: string[]
}

export interface UpdateRebalancingConfigInput {
  timeHorizonYears?: number
  incomeStability?: IncomeStability
  emotionalTolerance?: EmotionalTolerance
  decisionDiscipline?: DecisionDiscipline
  targetStocksPercent?: number
  targetBondsPercent?: number
  rebalancingFrequency?: RebalancingFrequency
  driftThreshold?: number
  preferContributions?: boolean
  bondPurpose?: string[]
}

export interface CurrentAllocation {
  stocksPercent: number
  bondsPercent: number
  stocksValue: number
  bondsValue: number
  totalValue: number
}

export interface RebalancingRecommendation {
  assetClass: 'STOCKS' | 'BONDS'
  currentPercent: number
  targetPercent: number
  drift: number
  adjustment: number
  action: 'buy' | 'sell' | 'contribute'
  priority: 'high' | 'medium' | 'low'
  preferredMethod: 'contribution' | 'sell' | 'both'
}

export interface RebalancingStatus {
  needsRebalancing: boolean
  currentAllocation: CurrentAllocation
  targetAllocation: {
    stocksPercent: number
    bondsPercent: number
  }
  drift: {
    stocks: number
    bonds: number
  }
  recommendations: RebalancingRecommendation[]
  canUseContributions: boolean
  availableContributionAmount?: number
}

