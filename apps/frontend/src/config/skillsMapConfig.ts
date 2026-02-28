/**
 * Skills Map Config
 *
 * Per-system skills and capabilities plotted on a quadrant chart.
 * X = System Leverage (0–10), Y = Compounding Power (0–10).
 * Optional realityNodeId links a skill to a Reality node for exploration.
 *
 * Each system maintains exactly SKILLS_PER_SYSTEM skills for consistent chart density.
 * System IDs use the canonical SystemId enum for tracking.
 */

import { SystemId } from '../types'

export interface SkillsMapSkill {
  id: string
  label: string
  x: number
  y: number
  realityNodeId?: string
  description?: string
  /** Parent capability for structural display (Capability → Skill) */
  capability?: string
}

/** Leverage framework content for when a skill is opened. Keyed by skill id. */
export interface SkillLeverageContent {
  /** 1. What problem does this skill solve? */
  problem?: {
    constraint?: string
    failurePrevented?: string
    upsideUnlocked?: string
  }
  /** 2. Structural: Capability → Skill; then Skill → system metrics */
  systemImpacts?: string[]
  /** 3. Leverage profile (quantified) */
  leverage?: 'Low' | 'Moderate' | 'High' | 'Extreme'
  compounding?: 'Linear' | 'Moderate' | 'High' | 'Exponential'
  transferability?: 'Narrow' | 'Moderate' | 'Broad'
  /** 4. Why it compounds */
  compoundingMechanism?: string[]
  /** 5. Cost to mastery */
  costToMastery?: {
    timeToCompetence?: string
    timeToMastery?: string
    maintenanceCost?: string
    cognitiveLoad?: string
  }
  /** 6. Signal vs noise */
  signalVsNoise?: { fake: string; real: string }
  /** 7. Interaction effects (skills this amplifies / is amplified by) */
  interactionEffects?: string[]
  /** 8. Observable metrics */
  observableMetrics?: string[]
  /** Decision: Invest / Maintain / Avoid */
  decision: 'Invest' | 'Maintain' | 'Avoid'
}

export interface SkillsMapSystemConfig {
  axisLabels: { x: string; y: string }
  skills: SkillsMapSkill[]
}

export type SkillsMapSystemId = string

export const SKILLS_MAP_AXIS_LABELS = {
  x: 'System Leverage',
  y: 'Compounding Power',
} as const

const SCALE_MIN = 0
const SCALE_MAX = 10

/** Number of skills to show per system on the chart (keep each system list at this size). */
export const SKILLS_PER_SYSTEM = 10

/**
 * All master system IDs (from SystemId enum). Every system that uses MasterSystemLayout
 * gets the same structure, including the Skills and Capabilities tab.
 */
export const MASTER_SYSTEM_IDS: readonly SystemId[] = [
  SystemId.FINANCE,
  SystemId.ENERGY,
  SystemId.TRAVEL,
  SystemId.SOFTWARE,
  SystemId.HEALTH,
  SystemId.MEANING,
  SystemId.CAREER,
  SystemId.TRUST,
  SystemId.REPUTATION,
  SystemId.OPTIONALITY,
]

/** Per-system skills map config. Key = SystemId; every MASTER_SYSTEM_IDS entry has config here. */
export const SKILLS_MAP_CONFIG: Record<SystemId, SkillsMapSystemConfig> = {
  [SystemId.FINANCE]: {
    axisLabels: { ...SKILLS_MAP_AXIS_LABELS },
    skills: [
      { id: 'maths-finance', label: 'Maths', x: 9, y: 8, description: 'Numeracy and quantitative reasoning underpin budgeting, investing, and risk assessment.' },
      { id: 'economics-finance', label: 'Economics', x: 8, y: 7, description: 'Understanding markets, incentives, and macro/micro dynamics.' },
      { id: 'cash-flow-finance', label: 'Cash flow management', x: 9, y: 9, description: 'Tracking income and expenses; maintaining liquidity and buffers.' },
      { id: 'compound-interest-finance', label: 'Compound interest', x: 7, y: 10, description: 'Time value of money and long-term growth.' },
      { id: 'risk-assessment-finance', label: 'Risk assessment', x: 8, y: 7, description: 'Evaluating and mitigating financial risk.' },
      { id: 'diversification-finance', label: 'Diversification', x: 8, y: 8, description: 'Spreading risk across assets; compounds as portfolio grows.' },
      { id: 'tax-efficiency-finance', label: 'Tax efficiency', x: 7, y: 6, description: 'Structuring to keep more of returns; moderate leverage.' },
      { id: 'basic-budgeting-finance', label: 'Basic budgeting', x: 3, y: 2, description: 'Simple income vs. expense tracking; foundation but limited leverage on its own.' },
      { id: 'expense-tracking-finance', label: 'Expense tracking', x: 2, y: 3, description: 'Recording where money goes; necessary but low compounding until paired with decisions.' },
      { id: 'impulse-spending-finance', label: 'Curbing impulse spend', x: 2, y: 1, description: 'Avoiding unplanned purchases; baseline discipline with low compounding.' },
    ],
  },
  [SystemId.HEALTH]: {
    axisLabels: { ...SKILLS_MAP_AXIS_LABELS },
    skills: [
      { id: 'recovery-health', label: 'Recovery', x: 8, y: 8, description: 'Rest, sleep, and practices that restore capacity.' },
      { id: 'resilience-health', label: 'Resilience', x: 8, y: 7, description: 'Mental and physical bounce-back under stress.' },
      { id: 'capacity-tracking-health', label: 'Capacity tracking', x: 7, y: 6, description: 'Awareness of energy and limits.' },
      { id: 'sustainable-rhythm-health', label: 'Sustainable rhythm', x: 8, y: 9, description: 'Pacing effort and rest over time.' },
      { id: 'sleep-hygiene-health', label: 'Sleep hygiene', x: 8, y: 8, description: 'Consistent sleep habits; high compounding for capacity.' },
      { id: 'movement-health', label: 'Regular movement', x: 7, y: 7, description: 'Physical activity; builds capacity over time.' },
      { id: 'stress-awareness-health', label: 'Stress awareness', x: 6, y: 5, description: 'Noticing triggers; foundation for better responses.' },
      { id: 'one-off-rest-health', label: 'One-off rest day', x: 2, y: 1, description: 'Single day of rest; helps in the moment but does not compound into lasting capacity.' },
      { id: 'basic-hydration-health', label: 'Basic hydration', x: 3, y: 3, description: 'Necessary baseline; limited leverage unless part of a broader routine.' },
      { id: 'occasional-vitamins-health', label: 'Occasional vitamins', x: 2, y: 2, description: 'Supplement use without system; low leverage and compounding.' },
    ],
  },
  [SystemId.CAREER]: {
    axisLabels: { ...SKILLS_MAP_AXIS_LABELS },
    skills: [
      { id: 'communication-career', label: 'Communication', x: 9, y: 8, description: 'Clarity and influence in professional contexts.' },
      { id: 'negotiation-career', label: 'Negotiation', x: 8, y: 7, description: 'Advocating for outcomes that create value.' },
      { id: 'technical-skills-career', label: 'Technical skills', x: 8, y: 7, description: 'Domain expertise that drives output.' },
      { id: 'reputation-career', label: 'Reputation management', x: 7, y: 8, description: 'Building and protecting how you are perceived.' },
      { id: 'mentorship-career', label: 'Mentorship', x: 8, y: 8, description: 'Developing others; compounds as your network grows.' },
      { id: 'strategic-thinking-career', label: 'Strategic thinking', x: 9, y: 7, description: 'Seeing the bigger picture; high leverage for decisions.' },
      { id: 'meeting-facilitation-career', label: 'Meeting facilitation', x: 6, y: 5, description: 'Running effective meetings; moderate leverage.' },
      { id: 'punctuality-career', label: 'Punctuality', x: 4, y: 3, description: 'Showing up on time; baseline expectation with limited compounding.' },
      { id: 'dress-code-career', label: 'Dress code', x: 2, y: 2, description: 'Context-appropriate appearance; low leverage for most roles.' },
      { id: 'water-cooler-chat-career', label: 'Water-cooler chat', x: 2, y: 1, description: 'Casual office small talk; minimal career compounding.' },
    ],
  },
  [SystemId.ENERGY]: {
    axisLabels: { ...SKILLS_MAP_AXIS_LABELS },
    skills: [
      { id: 'energy-awareness-energy', label: 'Energy awareness', x: 8, y: 6, description: 'Noticing peaks and dips; matching tasks to capacity.' },
      { id: 'deep-work-energy', label: 'Deep work', x: 8, y: 7, description: 'Sustained focus and flow.' },
      { id: 'recovery-energy', label: 'Recovery', x: 8, y: 8, description: 'Rest and renewal between efforts.' },
      { id: 'sleep-routine-energy', label: 'Sleep routine', x: 9, y: 9, description: 'Consistent sleep; high leverage and compounding for energy.' },
      { id: 'boundary-setting-energy', label: 'Boundary setting', x: 7, y: 7, description: 'Protecting focus time; compounds as habits stick.' },
      { id: 'single-tasking-energy', label: 'Single-tasking', x: 6, y: 6, description: 'One thing at a time; reduces drain and builds focus.' },
      { id: 'taking-breaks-energy', label: 'Taking breaks', x: 4, y: 4, description: 'Short pauses; helpful but tactical unless part of a rhythm.' },
      { id: 'caffeine-use-energy', label: 'Caffeine use', x: 3, y: 2, description: 'Short-term boost; does not build lasting capacity.' },
      { id: 'sugar-crash-energy', label: 'Sugar spikes', x: 2, y: 1, description: 'Quick energy then crash; low leverage, does not compound.' },
      { id: 'scrolling-energy', label: 'Endless scrolling', x: 1, y: 1, description: 'Drains focus and energy; negative compounding.' },
    ],
  },
  [SystemId.SOFTWARE]: {
    axisLabels: { ...SKILLS_MAP_AXIS_LABELS },
    skills: [
      { id: 'architecture-software', label: 'Architecture', x: 9, y: 8, description: 'System design and structure.' },
      { id: 'delivery-software', label: 'Delivery', x: 8, y: 7, description: 'Build, deploy, and operate.' },
      { id: 'quality-software', label: 'Quality', x: 8, y: 7, description: 'Testing, reliability, and feedback loops.' },
      { id: 'refactoring-software', label: 'Refactoring', x: 8, y: 8, description: 'Improving structure without changing behavior; compounds maintainability.' },
      { id: 'observability-software', label: 'Observability', x: 7, y: 7, description: 'Logging, metrics, tracing; high leverage for debugging and learning.' },
      { id: 'documentation-software', label: 'Documentation', x: 6, y: 6, description: 'Clear docs; moderate leverage, compounds for onboarding.' },
      { id: 'code-review-software', label: 'Code review', x: 7, y: 6, description: 'Catching issues and spreading knowledge; good leverage.' },
      { id: 'copy-paste-coding-software', label: 'Copy-paste coding', x: 2, y: 1, description: 'Reusing code without understanding; low leverage and does not compound.' },
      { id: 'manual-deploys-software', label: 'Manual deploys', x: 3, y: 2, description: 'One-off releases; fragile and does not scale.' },
      { id: 'no-tests-software', label: 'Skipping tests', x: 1, y: 1, description: 'Short-term speed, long-term debt; negative compounding.' },
    ],
  },
  [SystemId.TRAVEL]: {
    axisLabels: { ...SKILLS_MAP_AXIS_LABELS },
    skills: [
      { id: 'visa-docs-travel', label: 'Visa & docs', x: 9, y: 8, description: 'Keeping status legal and documents in order; unlocks mobility.' },
      { id: 'budget-travel-travel', label: 'Travel budgeting', x: 8, y: 7, description: 'Planning costs and buffers; avoids shocks and debt.' },
      { id: 'routines-travel-travel', label: 'Portable routines', x: 7, y: 8, description: 'Sleep, work, recovery that work across locations; compounds stability.' },
      { id: 'logistics-travel-travel', label: 'Logistics planning', x: 8, y: 6, description: 'Flights, stays, backups; high leverage per trip.' },
      { id: 'local-context-travel', label: 'Local context', x: 7, y: 6, description: 'Safety, norms, connectivity; reduces risk and friction.' },
      { id: 'health-away-travel', label: 'Health while away', x: 7, y: 7, description: 'Medication, insurance, basics; protects capacity on the road.' },
      { id: 'packing-travel-travel', label: 'Packing system', x: 5, y: 4, description: 'Consistent list and process; moderate leverage.' },
      { id: 'last-minute-booking-travel', label: 'Last-minute booking', x: 3, y: 2, description: 'Reactive; often higher cost and stress; low compounding.' },
      { id: 'souvenir-spend-travel', label: 'Souvenir spending', x: 2, y: 1, description: 'Emotional buys; low leverage for travel outcomes.' },
      { id: 'over-planning-travel', label: 'Over-planning every hour', x: 2, y: 2, description: 'Rigid itineraries; can reduce optionality and recovery.' },
    ],
  },
  [SystemId.MEANING]: {
    axisLabels: { ...SKILLS_MAP_AXIS_LABELS },
    skills: [
      { id: 'values-clarity-meaning', label: 'Values clarity', x: 9, y: 9, description: 'Knowing what matters; aligns decisions and compounds as a filter.' },
      { id: 'purpose-articulation-meaning', label: 'Purpose articulation', x: 8, y: 8, description: 'Stating why you do what you do; guides tradeoffs and resilience.' },
      { id: 'awareness-layers-meaning', label: 'Awareness layers', x: 8, y: 7, description: 'Noticing beliefs, triggers, and patterns; enables change.' },
      { id: 'alignment-check-meaning', label: 'Alignment checks', x: 7, y: 7, description: 'Regularly testing actions vs values; prevents drift.' },
      { id: 'reflection-practice-meaning', label: 'Reflection practice', x: 7, y: 8, description: 'Journaling, review; compounds self-knowledge over time.' },
      { id: 'boundaries-values-meaning', label: 'Values-based boundaries', x: 7, y: 6, description: 'Saying no from clarity; protects capacity and integrity.' },
      { id: 'legacy-thinking-meaning', label: 'Legacy thinking', x: 6, y: 6, description: 'Long-term impact view; moderate leverage for daily choices.' },
      { id: 'one-off-retreat-meaning', label: 'One-off retreat', x: 3, y: 2, description: 'Single event; limited compounding without ongoing practice.' },
      { id: 'vague-ideals-meaning', label: 'Vague ideals', x: 2, y: 2, description: 'Unclear values; low leverage for decisions.' },
      { id: 'chasing-trends-meaning', label: 'Chasing trends for meaning', x: 1, y: 1, description: 'External validation; does not compound into lasting purpose.' },
    ],
  },
  [SystemId.TRUST]: {
    axisLabels: { ...SKILLS_MAP_AXIS_LABELS },
    skills: [
      { id: 'communication-trust', label: 'Communication', x: 9, y: 8, description: 'Clear, empathetic verbal and written exchange; active listening.' },
      { id: 'trust-building-trust', label: 'Trust building', x: 8, y: 8, description: 'Consistency, reliability, and alignment with others.' },
      { id: 'boundaries-trust', label: 'Boundaries', x: 7, y: 7, description: 'Knowing and communicating limits; saying no when needed.' },
      { id: 'conflict-resolution-trust', label: 'Conflict resolution', x: 8, y: 6, description: 'De-escalation and finding mutually acceptable outcomes.' },
      { id: 'empathy-trust', label: 'Empathy', x: 8, y: 7, description: 'Understanding others’ perspectives; builds connection over time.' },
      { id: 'follow-up-trust', label: 'Follow-up', x: 6, y: 6, description: 'Staying in touch; maintains and deepens relationships.' },
      { id: 'small-talk-trust', label: 'Small talk', x: 2, y: 2, description: 'Light social exchange; low leverage for deep relationships.' },
      { id: 'remembering-names-trust', label: 'Remembering names', x: 3, y: 3, description: 'Helpful but limited impact unless combined with broader rapport.' },
      { id: 'gift-giving-trust', label: 'Gift-giving', x: 3, y: 2, description: 'Thoughtful tokens; nice but low leverage for trust.' },
      { id: 'social-media-likes-trust', label: 'Social media likes', x: 1, y: 1, description: 'Minimal leverage; does not compound into real connection.' },
    ],
  },
  [SystemId.REPUTATION]: {
    axisLabels: { ...SKILLS_MAP_AXIS_LABELS },
    skills: [
      { id: 'consistency-reputation', label: 'Consistency', x: 9, y: 8, description: 'Doing what you say; builds predictable expectations.' },
      { id: 'delivery-reputation', label: 'Delivery', x: 8, y: 8, description: 'Meeting commitments; compounds trust and access.' },
      { id: 'visibility-reputation', label: 'Strategic visibility', x: 7, y: 7, description: 'Being known for the right things; opens doors.' },
      { id: 'recovery-reputation', label: 'Recovery from mistakes', x: 7, y: 6, description: 'Acknowledging and fixing; limits lasting damage.' },
      { id: 'referrals-reputation', label: 'Referral generation', x: 8, y: 7, description: 'Others recommend you; high leverage for opportunities.' },
      { id: 'positioning-reputation', label: 'Positioning', x: 6, y: 6, description: 'How you frame your value; moderate compounding.' },
      { id: 'one-off-show-reputation', label: 'One-off showcase', x: 3, y: 2, description: 'Single event; limited lasting impact.' },
      { id: 'vanity-metrics-reputation', label: 'Vanity metrics', x: 2, y: 2, description: 'Likes and followers; low leverage for real access.' },
      { id: 'burning-bridges-reputation', label: 'Burning bridges', x: 1, y: 1, description: 'Erodes reputation; negative compounding.' },
      { id: 'over-promising-reputation', label: 'Over-promising', x: 2, y: 1, description: 'Sets expectations you can’t meet; damages reputation.' },
    ],
  },
  [SystemId.OPTIONALITY]: {
    axisLabels: { ...SKILLS_MAP_AXIS_LABELS },
    skills: [
      { id: 'multiple-engines-optionality', label: 'Multiple engines', x: 9, y: 9, description: 'Income and value from more than one source; reduces single-point failure.' },
      { id: 'transferable-skills-optionality', label: 'Transferable skills', x: 8, y: 8, description: 'Skills that apply across domains; compounds optionality.' },
      { id: 'network-optionality', label: 'Network that opens doors', x: 8, y: 7, description: 'People who refer and include you; unlocks paths.' },
      { id: 'liquidity-optionality', label: 'Liquidity & runway', x: 8, y: 8, description: 'Cash and time to say yes to opportunities.' },
      { id: 'asymmetric-thinking-optionality', label: 'Asymmetric thinking', x: 7, y: 7, description: 'Seeking upside with limited downside; core to optionality.' },
      { id: 'learning-agility-optionality', label: 'Learning agility', x: 7, y: 7, description: 'Picking up new domains quickly; expands choices.' },
      { id: 'single-path-optionality', label: 'Single path dependency', x: 2, y: 2, description: 'One employer or skill; low optionality.' },
      { id: 'burnout-optionality', label: 'Chronic burnout', x: 1, y: 1, description: 'No energy to pursue options; collapses optionality.' },
      { id: 'reactive-only-optionality', label: 'Reactive only', x: 2, y: 2, description: 'Waiting for opportunities; low leverage.' },
      { id: 'no-buffer-optionality', label: 'No financial buffer', x: 1, y: 1, description: 'Can’t take risks; eliminates optionality.' },
    ],
  },
}

export const SKILLS_MAP_SCALE = { min: SCALE_MIN, max: SCALE_MAX } as const

export function getSkillsMapConfig(systemId: string | SystemId | undefined): SkillsMapSystemConfig | null {
  if (!systemId) return null
  const key = systemId === 'relationships' ? SystemId.TRUST : (systemId as SystemId)
  return SKILLS_MAP_CONFIG[key] ?? null
}

export function hasSkillsMapConfig(systemId: string | undefined): boolean {
  return getSkillsMapConfig(systemId) !== null
}

/** Full leverage framework content per skill (optional). Missing entries fall back to description + matrix position. */
export const SKILL_LEVERAGE_CONTENT: Record<string, SkillLeverageContent> = {
  'communication-career': {
    problem: {
      constraint: 'Misalignment and ambiguity in goals, incentives, and expectations.',
      failurePrevented: 'Wasted effort, rework, and reputation damage from unclear or inconsistent messaging.',
      upsideUnlocked: 'Faster alignment, better negotiation outcomes, and influence that scales with audience.',
    },
    systemImpacts: ['Promotion probability', 'Compensation ceiling', 'Trust', 'Optionality (who refers you)'],
    leverage: 'High',
    compounding: 'High',
    transferability: 'Broad',
    compoundingMechanism: ['Increases influence', 'Increases network effects', 'Increases decision quality (others align to you)'],
    costToMastery: {
      timeToCompetence: '6–12 months of deliberate practice',
      timeToMastery: '3–5 years',
      maintenanceCost: 'Low once habits set',
      cognitiveLoad: 'Moderate (requires calibration per context)',
    },
    signalVsNoise: {
      fake: 'Talking confidently; being articulate.',
      real: 'Reducing ambiguity and aligning incentives; getting to clear commitment and follow-through.',
    },
    interactionEffects: ['Strategic thinking + Communication = Architect influence', 'Technical skills + Communication = Career acceleration'],
    observableMetrics: ['Clarity of written outcomes', 'Frequency of "we\'re aligned" confirmations', 'Reduction in rework requests'],
    decision: 'Invest',
  },
  'cash-flow-finance': {
    problem: {
      constraint: 'Limited visibility into income vs outgo; no buffer rules.',
      failurePrevented: 'Running out of runway; forced bad decisions under stress; debt spiral.',
      upsideUnlocked: 'Oxygen (months of coverage), optionality to take risks, and capital that can compound.',
    },
    systemImpacts: ['Oxygen (runway)', 'Armor (buffers)', 'Optionality', 'Engine sustainability'],
    leverage: 'Extreme',
    compounding: 'Exponential',
    transferability: 'Broad',
    compoundingMechanism: ['Increases capital efficiency', 'Increases optionality', 'Increases decision quality (no fire sales)'],
    costToMastery: {
      timeToCompetence: '1–3 months to track and project',
      timeToMastery: '6–12 months to automate and rule-design',
      maintenanceCost: 'Low with automation',
      cognitiveLoad: 'Low once system is in place',
    },
    signalVsNoise: {
      fake: 'Tracking expenses in an app.',
      real: 'Income vs expense visibility + buffer rules + save-before-spend automation; decisions that preserve runway.',
    },
    interactionEffects: ['Cash flow + Risk assessment = Sustainable investing', 'Cash flow + Compound interest = Long-term wealth'],
    observableMetrics: ['Months of runway', 'Buffer rule adherence', 'Automation coverage (e.g. % saved before spend)'],
    decision: 'Invest',
  },
  'architecture-software': {
    problem: {
      constraint: 'Complexity and coupling that make change expensive and risky.',
      failurePrevented: 'Unmaintainable systems; outages; inability to ship safely.',
      upsideUnlocked: 'Change velocity, reliability, and optionality to scale or pivot.',
    },
    systemImpacts: ['Scalability', 'Reliability', 'Delivery speed', 'Optionality (tech choices)'],
    leverage: 'High',
    compounding: 'High',
    transferability: 'Broad',
    compoundingMechanism: ['Increases decision quality (where to invest)', 'Increases optionality (clean boundaries)', 'Reduces cost of future change'],
    costToMastery: {
      timeToCompetence: '1–2 years',
      timeToMastery: '5+ years',
      maintenanceCost: 'Ongoing learning',
      cognitiveLoad: 'High',
    },
    signalVsNoise: {
      fake: 'Drawing boxes and diagrams; using buzzwords.',
      real: 'Decomposition and interface design that reduce coupling and enable independent change.',
    },
    interactionEffects: ['Architecture + Communication = Architect influence', 'Architecture + Quality (tests) = Safe refactoring'],
    observableMetrics: ['Deployment frequency', 'Lead time', 'Coupling metrics', 'Incident rate'],
    decision: 'Invest',
  },
}

export function getSkillLeverageContent(skillId: string): SkillLeverageContent | null {
  return SKILL_LEVERAGE_CONTENT[skillId] ?? null
}
