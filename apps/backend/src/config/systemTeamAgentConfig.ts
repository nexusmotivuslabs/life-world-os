import { AgentType, TeamDomain } from '@prisma/client'
import { getCanonicalSystemId } from './systemUniversalConceptConfig.js'

const SYSTEM_TEAM_DOMAINS: Record<string, TeamDomain[]> = {
  money: [
    TeamDomain.INVESTMENT,
    TeamDomain.TAX_OPTIMIZATION,
    TeamDomain.CASH_FLOW,
    TeamDomain.BUSINESS_ADVISORY,
    TeamDomain.COMPREHENSIVE_PLANNING,
    TeamDomain.DEBT_MANAGEMENT,
    TeamDomain.EMERGENCY_FUND,
    TeamDomain.CORE_MONEY_SYSTEM,
  ],
  health: [
    TeamDomain.HEALTH_CAPACITY,
    TeamDomain.HEALTH_NUTRITION,
    TeamDomain.HEALTH_MOVEMENT,
    TeamDomain.HEALTH_SLEEP,
    TeamDomain.HEALTH_MENTAL,
  ],
  software: [
    TeamDomain.PLATFORM_ENGINEERING,
    TeamDomain.SOFTWARE_ARCHITECTURE,
    TeamDomain.SOFTWARE_DELIVERY,
    TeamDomain.SOFTWARE_QUALITY,
    TeamDomain.SOFTWARE_API_DESIGN,
  ],
  optionality: [
    TeamDomain.DECISION_ANALYSIS,
    TeamDomain.SKILL_DEVELOPMENT,
    TeamDomain.PROOF_BUILDING,
    TeamDomain.OPTIONALITY_CAPITAL,
    TeamDomain.OPTIONALITY_NETWORK,
  ],
  trust: [
    TeamDomain.TRUST_BUILDING,
    TeamDomain.TRUST_ALIGNMENT,
    TeamDomain.TRUST_COMMUNICATION,
    TeamDomain.TRUST_DELIVERY,
    TeamDomain.EGO_MANAGEMENT,
  ],
  reputation: [
    TeamDomain.REPUTATION_DEFENSE,
    TeamDomain.REPUTATION_SIGNAL,
    TeamDomain.REPUTATION_RECOVERY,
    TeamDomain.REPUTATION_VISIBILITY,
    TeamDomain.REPUTATION_TRUST,
  ],
  energy: [
    TeamDomain.ENERGY_MANAGEMENT,
    TeamDomain.ENERGY_RECOVERY,
    TeamDomain.ENERGY_FOCUS,
    TeamDomain.ENERGY_RHYTHM,
    TeamDomain.ENERGY_ENVIRONMENT,
  ],
  travel: [
    TeamDomain.TRAVEL_PLANNING,
    TeamDomain.TRAVEL_LOGISTICS,
    TeamDomain.TRAVEL_SAFETY,
    TeamDomain.TRAVEL_COST,
    TeamDomain.TRAVEL_EXPERIENCE,
  ],
  meaning: [
    TeamDomain.MEANING_ALIGNMENT,
    TeamDomain.MEANING_PRACTICE,
    TeamDomain.MEANING_REFLECTION,
    TeamDomain.MEANING_COMMUNITY,
    TeamDomain.MEANING_PURPOSE,
  ],
  investment: [],
  training: [],
  education: [],
}

const SYSTEM_AGENT_TYPES: Record<string, AgentType[]> = {
  money: [
    AgentType.INVESTOR,
    AgentType.FINANCIAL_ADVISOR,
    AgentType.ACCOUNTANT,
    AgentType.BOOKKEEPER,
    AgentType.TAX_STRATEGIST,
    AgentType.CASH_FLOW_SPECIALIST,
    AgentType.DEBT_SPECIALIST,
    AgentType.SECURITY_SPECIALIST,
  ],
  health: [
    AgentType.CAPACITY_SPECIALIST,
    AgentType.RECOVERY_COACH,
    AgentType.BURNOUT_PREVENTION_SPECIALIST,
  ],
  software: [
    AgentType.SOFTWARE_ARCHITECT,
    AgentType.DEVOPS_ENGINEER,
    AgentType.QA_ENGINEER,
  ],
  optionality: [
    AgentType.DECISION_ANALYST,
    AgentType.RISK_STRATEGIST,
    AgentType.SYSTEMS_THINKER,
    AgentType.LEARNING_ARCHITECT,
    AgentType.SPECIALIZATION_ADVISOR,
    AgentType.PROGRESS_TRACKER,
    AgentType.ARTIFACT_DESIGNER,
    AgentType.IMPACT_ANALYST,
    AgentType.VISIBILITY_STRATEGIST,
  ],
  trust: [
    AgentType.TRUST_ANALYST,
    AgentType.RELIABILITY_COACH,
    AgentType.ALIGNMENT_STRATEGIST,
    AgentType.REPUTATION_GUARDIAN,
    AgentType.FAILURE_ANALYST,
    AgentType.COMMUNICATION_SPECIALIST,
    AgentType.EGO_COACH,
    AgentType.FEEDBACK_PROCESSOR,
    AgentType.COURSE_CORRECTOR,
  ],
  reputation: [
    AgentType.TRUST_ANALYST,
    AgentType.RELIABILITY_COACH,
    AgentType.ALIGNMENT_STRATEGIST,
    AgentType.REPUTATION_GUARDIAN,
    AgentType.FAILURE_ANALYST,
    AgentType.COMMUNICATION_SPECIALIST,
    AgentType.EGO_COACH,
    AgentType.FEEDBACK_PROCESSOR,
    AgentType.COURSE_CORRECTOR,
  ],
  energy: [
    AgentType.ENERGY_ANALYST,
    AgentType.ENERGY_COACH,
    AgentType.ENERGY_RECOVERY_COACH,
  ],
  travel: [
    AgentType.TRAVEL_PLANNER,
    AgentType.TRAVEL_LOGISTICS_COORDINATOR,
    AgentType.TRAVEL_SAFETY_ADVISOR,
  ],
  meaning: [
    AgentType.PURPOSE_GUIDE,
    AgentType.VALUES_COACH,
    AgentType.REFLECTION_FACILITATOR,
  ],
  investment: [],
  training: [],
  education: [],
}

export function getSystemTeamDomains(systemId?: string): TeamDomain[] {
  if (!systemId) return []
  const canonicalId = getCanonicalSystemId(systemId)
  return SYSTEM_TEAM_DOMAINS[canonicalId] || []
}

export function getSystemAgentTypes(systemId?: string): AgentType[] {
  if (!systemId) return []
  const canonicalId = getCanonicalSystemId(systemId)
  return SYSTEM_AGENT_TYPES[canonicalId] || []
}
