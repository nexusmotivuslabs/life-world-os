/**
 * Enum Display Name Utilities
 * 
 * Provides nice, human-readable display names for all enums in the application.
 * Converts uppercase enum values (e.g., LAW_OF_COMPOUNDING) to nice display names (e.g., "Law of Compounding").
 */

import {
  OverallRank,
  Season,
  EngineType,
  EngineStatus,
  ActivityType,
  TrainingModuleType,
  TaskStatus,
  InvestmentType,
  IncomeStability,
  EmotionalTolerance,
  DecisionDiscipline,
  RebalancingFrequency,
  MasterDomain,
  SystemTier,
} from '../types/index'

/**
 * Get display name for OverallRank
 */
export function getOverallRankDisplayName(rank: OverallRank): string {
  const displayNames: Record<OverallRank, string> = {
    [OverallRank.RECRUIT]: 'Recruit',
    [OverallRank.PRIVATE]: 'Private',
    [OverallRank.CORPORAL]: 'Corporal',
    [OverallRank.SERGEANT]: 'Sergeant',
    [OverallRank.STAFF_SERGEANT]: 'Staff Sergeant',
    [OverallRank.SERGEANT_FIRST_CLASS]: 'Sergeant First Class',
    [OverallRank.MASTER_SERGEANT]: 'Master Sergeant',
    [OverallRank.FIRST_SERGEANT]: 'First Sergeant',
    [OverallRank.SERGEANT_MAJOR]: 'Sergeant Major',
    [OverallRank.COMMAND_SERGEANT_MAJOR]: 'Command Sergeant Major',
  }
  return displayNames[rank] || rank
}

/**
 * Get display name for Season
 */
export function getSeasonDisplayName(season: Season): string {
  const displayNames: Record<Season, string> = {
    [Season.SPRING]: 'Spring',
    [Season.SUMMER]: 'Summer',
    [Season.AUTUMN]: 'Autumn',
    [Season.WINTER]: 'Winter',
  }
  return displayNames[season] || season
}

/**
 * Get display name for EngineType
 */
export function getEngineTypeDisplayName(type: EngineType): string {
  const displayNames: Record<EngineType, string> = {
    [EngineType.CAREER]: 'Career',
    [EngineType.BUSINESS]: 'Business',
    [EngineType.INVESTMENT]: 'Investment',
    [EngineType.LEARNING]: 'Learning',
  }
  return displayNames[type] || type
}

/**
 * Get display name for EngineStatus
 */
export function getEngineStatusDisplayName(status: EngineStatus): string {
  const displayNames: Record<EngineStatus, string> = {
    [EngineStatus.ACTIVE]: 'Active',
    [EngineStatus.INACTIVE]: 'Inactive',
    [EngineStatus.PLANNING]: 'Planning',
  }
  return displayNames[status] || status
}

/**
 * Get display name for ActivityType
 */
export function getActivityTypeDisplayName(type: ActivityType): string {
  const displayNames: Record<ActivityType, string> = {
    [ActivityType.WORK_PROJECT]: 'Work Project',
    [ActivityType.EXERCISE]: 'Exercise',
    [ActivityType.SAVE_EXPENSES]: 'Save Expenses',
    [ActivityType.LEARNING]: 'Learning',
    [ActivityType.SEASON_COMPLETION]: 'Season Completion',
    [ActivityType.MILESTONE]: 'Milestone',
    [ActivityType.CUSTOM]: 'Custom',
  }
  return displayNames[type] || type
}

/**
 * Get display name for TrainingModuleType
 */
export function getTrainingModuleTypeDisplayName(type: TrainingModuleType): string {
  const displayNames: Record<TrainingModuleType, string> = {
    [TrainingModuleType.EMERGENCY_FUND]: 'Emergency Fund',
    [TrainingModuleType.INCREASE_INCOME]: 'Increase Income',
    [TrainingModuleType.REDUCE_EXPENSES]: 'Reduce Expenses',
    [TrainingModuleType.AUTOMATE_SAVINGS]: 'Automate Savings',
    [TrainingModuleType.MULTIPLE_INCOME_STREAMS]: 'Multiple Income Streams',
    [TrainingModuleType.TRACK_EXPENSES]: 'Track Expenses',
    [TrainingModuleType.AVOID_LIFESTYLE_INFLATION]: 'Avoid Lifestyle Inflation',
  }
  return displayNames[type] || type
}

/**
 * Get display name for TaskStatus
 */
export function getTaskStatusDisplayName(status: TaskStatus): string {
  const displayNames: Record<TaskStatus, string> = {
    [TaskStatus.LOCKED]: 'Locked',
    [TaskStatus.AVAILABLE]: 'Available',
    [TaskStatus.IN_PROGRESS]: 'In Progress',
    [TaskStatus.COMPLETED]: 'Completed',
  }
  return displayNames[status] || status
}

/**
 * Get display name for InvestmentType
 */
export function getInvestmentTypeDisplayName(type: InvestmentType): string {
  const displayNames: Record<InvestmentType, string> = {
    [InvestmentType.CRYPTO]: 'Crypto',
    [InvestmentType.STOCKS]: 'Stocks',
    [InvestmentType.CASH]: 'Cash',
    [InvestmentType.HIGH_YIELD_SAVINGS]: 'High Yield Savings',
  }
  return displayNames[type] || type
}

/**
 * Get display name for IncomeStability
 */
export function getIncomeStabilityDisplayName(stability: IncomeStability): string {
  const displayNames: Record<IncomeStability, string> = {
    [IncomeStability.HIGH]: 'High',
    [IncomeStability.MEDIUM]: 'Medium',
    [IncomeStability.LOW]: 'Low',
  }
  return displayNames[stability] || stability
}

/**
 * Get display name for EmotionalTolerance
 */
export function getEmotionalToleranceDisplayName(tolerance: EmotionalTolerance): string {
  const displayNames: Record<EmotionalTolerance, string> = {
    [EmotionalTolerance.LOW]: 'Low',
    [EmotionalTolerance.MEDIUM]: 'Medium',
    [EmotionalTolerance.HIGH]: 'High',
  }
  return displayNames[tolerance] || tolerance
}

/**
 * Get display name for DecisionDiscipline
 */
export function getDecisionDisciplineDisplayName(discipline: DecisionDiscipline): string {
  const displayNames: Record<DecisionDiscipline, string> = {
    [DecisionDiscipline.LOW]: 'Low',
    [DecisionDiscipline.MEDIUM]: 'Medium',
    [DecisionDiscipline.HIGH]: 'High',
  }
  return displayNames[discipline] || discipline
}

/**
 * Get display name for RebalancingFrequency
 */
export function getRebalancingFrequencyDisplayName(frequency: RebalancingFrequency): string {
  const displayNames: Record<RebalancingFrequency, string> = {
    [RebalancingFrequency.ANNUAL]: 'Annual',
    [RebalancingFrequency.THRESHOLD_BASED]: 'Threshold Based',
  }
  return displayNames[frequency] || frequency
}

/**
 * Get display name for MasterDomain
 */
export function getMasterDomainDisplayName(domain: MasterDomain): string {
  const displayNames: Record<MasterDomain, string> = {
    [MasterDomain.FINANCE]: 'Finance',
    [MasterDomain.ENERGY]: 'Energy',
    [MasterDomain.TRAVEL]: 'Travel',
    [MasterDomain.SOFTWARE]: 'Software',
    [MasterDomain.HEALTH]: 'Health',
    [MasterDomain.MEANING]: 'Meaning',
  }
  return displayNames[domain] || domain
}

/**
 * Get display name for SystemTier
 */
export function getSystemTierDisplayName(tier: SystemTier): string {
  const displayNames: Record<SystemTier, string> = {
    [SystemTier.SURVIVAL]: 'Survival',
    [SystemTier.STABILITY]: 'Stability',
    [SystemTier.GROWTH]: 'Growth',
    [SystemTier.LEVERAGE]: 'Leverage',
    [SystemTier.EXPRESSION]: 'Expression',
    [SystemTier.CROSS_SYSTEM_STATES]: 'Cross-System States',
  }
  return displayNames[tier] || tier
}

/**
 * Generic function to convert uppercase enum value to display name
 * Handles common patterns like:
 * - LAW_OF_COMPOUNDING -> "Law of Compounding"
 * - STAFF_SERGEANT -> "Staff Sergeant"
 * - WORK_PROJECT -> "Work Project"
 */
export function enumToDisplayName(enumValue: string): string {
  return enumValue
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

