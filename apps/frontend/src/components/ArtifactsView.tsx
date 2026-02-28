/**
 * Artifacts View - Source of Truth for All Artifacts
 * 
 * ARCHITECTURE:
 * - Located in Knowledge Plane as the central repository for viewing ALL artifacts
 * - Each system (Money, Energy, Loadout, etc.) manages/creates its own artifacts
 * - This view aggregates artifacts from all systems into a unified, filterable interface
 * - Provides comprehensive search and category filtering for reading
 * 
 * ARTIFACT SOURCES:
 * - Static artifacts: Core resources, stats, systems, concepts (defined in this file)
 * - Dynamic artifacts: Weapons/LoadoutItems (fetched from Loadout API)
 * - Reality Nodes: Laws and Principles (fetched from Reality Node API)
 * 
 * RESPONSIBILITY:
 * - Read-only view: No creation or modification
 * - Central discovery: Users find and learn about all viewable entities
 * - Cross-system navigation: Links to system-specific management interfaces
 */

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  HeartPulse,
  DollarSign,
  Shield,
  TrendingUp,
  Target,
  BookOpen,
  Search,
  X,
  ChevronRight,
  Droplet,
  Key,
  Brain,
  Sparkles,
  Info,
  Sword,
  Lightbulb,
  Network,
  Grid3x3,
  LayoutGrid,
  Layers
} from 'lucide-react'
import { getMasterRoute } from '../config/routes'
import { MasterDomain } from '../types'
import { 
  ArtifactCategory, 
  getArtifactCategoryMetadata, 
  getArtifactCategoryLabel,
  getArtifactCategoryDescription 
} from '../types/artifact'
import { loadoutApi } from '../services/loadoutApi'
import type { LoadoutItem } from '../types/loadout'
import { useGameStore } from '../store/useGameStore'
import { resourcesApi } from '../services/api'
import { enginesApi } from '../services/api'
import { realityNodeApi, type RealityNode } from '../services/financeApi'
import HierarchyTreeView from './knowledge/HierarchyTreeView'
import KeyDetailsList from './KeyDetailsList'
import ArtifactCategoryTag from './ArtifactCategoryTag'
import { getCategoryDisplayName } from '../utils/realityNodeDisplay'
import type { ArtifactSystemId } from '../config/artifactSystemConfig'
import * as artifactSystemConfig from '../config/artifactSystemConfig'

const {
  filterArtifactsBySystem,
  ARTIFACT_SYSTEM_IDS,
  ARTIFACT_SYSTEM_LABELS,
  getSystemsForPowerLawDomain,
  SYSTEM_POWER_LAW_DOMAINS,
} = artifactSystemConfig

const SYSTEM_POWER_LAW_DOMAINS_SAFE =
  (SYSTEM_POWER_LAW_DOMAINS ?? {}) as Partial<Record<ArtifactSystemId, string[]>>

interface SystemFeature {
  title: string
  description: string
  items?: string[]
}

interface ArtifactInstance {
  // User-specific instance data (only present when user has this artifact)
  value?: number | string
  label?: string
  status?: string
  metadata?: Record<string, any>
}

interface Artifact {
  id: string
  name: string
  description: string // Generic understanding/description of the element
  category: ArtifactCategory
  icon: React.ComponentType<{ className?: string }>
  route?: string
  systemId?: ArtifactSystemId // For system-based filtering (e.g. reality nodes)
  systemIds?: ArtifactSystemId[] // When artifact applies to multiple systems (e.g. power laws)
  details?: string[] // Generic details about what this artifact is
  examples?: string[] // Real-world practical examples for readers to take action
  tags?: string[] // Additional metadata tags for filtering
  // Extended fields for System artifacts
  systemOverview?: string[]
  lawsAndPrinciples?: SystemFeature[]
  frameworks?: SystemFeature[]
  knowledgeBase?: string
  keyFeatures?: SystemFeature[]
  // Instance reference - only populated when user has an instance
  instance?: ArtifactInstance
  // References to other related artifacts worth exploring
  references?: string[] // Array of artifact IDs that are related
  // Metadata for additional information (e.g., derivedFrom for principles)
  metadata?: Record<string, any>
}

const artifacts: Artifact[] = [
  // Resources
  {
    id: 'energy',
    name: 'Energy',
    description: 'Daily budget that enables all system operations. Energy powers Finance, Health, and other systems, forcing prioritization of high-value activities across competing demands.',
    category: ArtifactCategory.RESOURCE,
    icon: Zap,
    tags: ['daily', 'scarcity', 'action', 'systems'],
    details: [
      'Enables actions across all systems.',
      'Systems consume energy for operations.',
      'Resets at daily tick.',
      'Cannot stack across days.',
      'Modified by Capacity stat.',
      'Every action requires Energy.',
      'Forces prioritization across competing systems.'
    ],
    references: ['capacity', 'water', 'armor']
  },
  {
    id: 'capacity',
    name: 'Capacity',
    description: 'Foundation for system performance. High Capacity enables sustained operation across Finance, Health, and Energy systems. Low Capacity degrades all system effectiveness and increases burnout risk.',
    category: ArtifactCategory.STAT,
    icon: HeartPulse,
    tags: ['health', 'resilience', 'survival', 'systems', 'burnout', 'recovery'],
    details: [
      'Range: 0-100.',
      'Modifies usable Energy cap across all systems.',
      'Low Capacity = degraded system performance.',
      'Governs burnout resistance for all operations.',
      'Supports sustained system execution.',
      'Critical for multi-system coordination.'
    ],
    references: ['energy', 'water', 'armor', 'meaning']
  },
  {
    id: 'money',
    name: 'Money (Gold)',
    description: 'Currency of the Power Game. Enables influence, control, and expansion of options.',
    category: ArtifactCategory.RESOURCE,
    icon: DollarSign,
    tags: ['currency', 'influence', 'power'],
    route: getMasterRoute(MasterDomain.FINANCE),
    details: [
      'Primary currency of influence.',
      'Generated by Engines.',
      'Used for investments.',
      'Enables risk-taking when combined with Oxygen.',
      'Cannot provide meaning or identity.'
    ],
    references: ['engines', 'oxygen', 'optionality', 'laws-power', 'time-value-of-money']
  },
  {
    id: 'oxygen',
    name: 'Oxygen',
    description: 'Financial safety net measured in months of expenses. Primary survival buffer.',
    category: ArtifactCategory.RESOURCE,
    icon: Shield,
    tags: ['financial', 'safety', 'survival'],
    details: [
      'Measured in months covered.',
      'Decays daily if not maintained.',
      'Enables risk-taking when high.',
      'Critical for survival game.',
      'Protects against financial shocks.'
    ],
    references: ['money', 'armor', 'capacity', 'time-value-of-money']
  },
  {
    id: 'water',
    name: 'Water',
    description: 'Health and vitality score. Low Water triggers Winter season and blocks progression.',
    category: ArtifactCategory.RESOURCE,
    icon: Droplet,
    tags: ['health', 'vitality', 'survival'],
    details: [
      'Range: 0-100.',
      'Health and vitality indicator.',
      'Low Water forces rest (Winter).',
      'Blocks progression when too low.',
      'Affected by exercise and recovery.'
    ],
    references: ['capacity', 'energy', 'armor', 'progressive-overload']
  },
  {
    id: 'armor',
    name: 'Armor',
    description: 'Systems, buffers, boundaries. Protects against stress events and reduces failure penalties.',
    category: ArtifactCategory.RESOURCE,
    icon: Shield,
    tags: ['protection', 'systems', 'stability'],
    details: [
      'Range: 0-100.',
      'Protects against stress events.',
      'Reduces failure state penalties.',
      'Built through systems and boundaries.',
      'Critical for stability.'
    ],
    references: ['capacity', 'water', 'energy', 'tier-system', 'sustainable-balance']
  },
  {
    id: 'keys',
    name: 'Keys',
    description: 'Unlocked options and opportunities. Count of available choices and pathways.',
    category: ArtifactCategory.RESOURCE,
    icon: Key,
    tags: ['options', 'opportunities', 'unlocks'],
    details: [
      'Count of unlocked options.',
      'Enables new pathways.',
      'Gained through achievements.',
      'Increases optionality.',
      'Opens new system access.'
    ],
    references: ['optionality', 'engines', 'money', 'compound-growth-principle']
  },
  // Stats
  {
    id: 'engines',
    name: 'Engines',
    description: 'Income generation capability. Governs multiple income sources and unlocks higher-value actions.',
    category: ArtifactCategory.STAT,
    icon: TrendingUp,
    tags: ['income', 'generation', 'capability'],
    details: [
      'Range: 0-100.',
      'Governs income generation.',
      'Career, Business, Investment Engines.',
      'High Engines unlocks higher-value actions.',
      'Reflects multiple income sources.'
    ],
    references: ['money', 'optionality', 'capacity', 'meaning', 'compound-growth-principle', 'time-value-of-money']
  },
  {
    id: 'meaning',
    name: 'Meaning',
    description: 'Purpose, values alignment. Provides burnout resistance and prevents decay when actions align with values.',
    category: ArtifactCategory.STAT,
    icon: Sparkles,
    tags: ['purpose', 'values', 'burnout-resistance'],
    details: [
      'Range: 0-100.',
      'Purpose and values alignment.',
      'Provides burnout resistance.',
      'Decays when actions drift from values.',
      'Cannot be bought with money.'
    ],
    references: ['capacity', 'engines', 'optionality', 'sustainable-balance']
  },
  {
    id: 'optionality',
    name: 'Optionality',
    description: 'Available choices and pathways. Increases with investments, keys, and unlocked systems.',
    category: ArtifactCategory.STAT,
    icon: Target,
    tags: ['choices', 'pathways', 'asymmetry'],
    details: [
      'Range: 0-100.',
      'Available choices and pathways.',
      'Increases with investments.',
      'Gained through keys and achievements.',
      'Enables asymmetric outcomes.'
    ],
    references: ['keys', 'money', 'engines', 'meaning', 'asymmetric-risk-reward', 'compound-growth-principle']
  },
  // Concepts
  {
    id: 'tier-system',
    name: 'Tier System',
    description: 'Universal system hierarchy: Survival, Stability, Growth, Leverage, Expression.',
    category: ArtifactCategory.CONCEPT,
    icon: BookOpen,
    tags: ['hierarchy', 'structure', 'framework'],
    route: '/tiers',
    details: [
      'Tier 0: Survival (Non-negotiable)',
      'Tier 1: Stability (Variance control)',
      'Tier 2: Growth (Compounding)',
      'Tier 3: Leverage (Asymmetry)',
      'Tier 4: Expression (Freedom/Preference)'
    ],
    references: ['energy', 'capacity', 'money', 'oxygen', 'water', 'armor', 'engines', 'meaning', 'optionality', 'sustainable-balance']
  },
  {
    id: 'laws-power',
    name: '48 Laws of Power',
    description: 'Strategic principles applied across domains: Money, Career, Business, Relationships, Leadership.',
    category: ArtifactCategory.LAW,
    icon: BookOpen,
    tags: ['power', 'strategy', 'principles', 'optionality'],
    route: '/knowledge/laws',
    details: [
      '48 strategic principles.',
      'Applied across multiple domains.',
      'Money, Career, Business domains.',
      'Relationships, Leadership, Negotiation.',
      'Energy domain applications.'
    ],
    examples: [
      'Law 1: Never Outshine the Master - Let your boss take credit, build trust, then advance.',
      'Law 3: Conceal Your Intentions - Keep your plans private until ready to execute.',
      'Law 6: Court Attention at All Costs - Build your personal brand through consistent visibility.',
      'Law 13: When Asking for Help, Appeal to Self-Interest - Frame requests to benefit the other party.',
      'Law 15: Crush Your Enemy Totally - In business, eliminate competition completely when possible.',
      'Law 20: Do Not Commit to Anyone - Keep options open, avoid premature commitments.',
      'Law 29: Plan All the Way to the End - Think through consequences before acting.',
      'Law 48: Assume Formlessness - Stay flexible, adapt to circumstances.'
    ],
    references: ['money', 'engines', 'optionality', 'bible-laws', 'compound-growth-principle', 'asymmetric-risk-reward']
  },
  {
    id: 'bible-laws',
    name: 'Bible Laws',
    description: 'Biblical principles applied to financial and life domains.',
    category: ArtifactCategory.LAW,
    icon: BookOpen,
    tags: ['biblical', 'principles', 'spiritual'],
    route: '/knowledge/laws',
    details: [
      'Biblical principles.',
      'Applied to financial domains.',
      'Money, Investment, Career.',
      'Business, Relationships, Leadership.',
      'Spiritual Growth, Stewardship.'
    ],
    examples: [
      'Stewardship: Tithe 10%, save 20%, invest for long-term (Parable of the Talents).',
      'Debt management: Avoid unnecessary debt, pay debts promptly (Romans 13:8).',
      'Hard work: Consistent effort leads to provision (Proverbs 14:23).',
      'Generosity: Give first, then receive (Luke 6:38).',
      'Contentment: Avoid greed, find satisfaction in what you have (Hebrews 13:5).',
      'Planning: Count the cost before starting projects (Luke 14:28).',
      'Integrity: Honest business practices build trust and reputation.',
      'Sabbath rest: Take regular breaks to maintain capacity and perspective.'
    ],
    references: ['money', 'meaning', 'engines', 'laws-power', 'time-value-of-money', 'sustainable-balance']
  },
  // Principles - Universal
  {
    id: 'compound-growth-principle',
    name: 'Compound Growth Principle',
    description: 'Small consistent gains compound exponentially over time, creating asymmetric long-term outcomes.',
    category: ArtifactCategory.PRINCIPLE,
    icon: Lightbulb,
    tags: ['universal', 'compound', 'growth', 'exponential'],
    details: [
      'Applies to wealth, skills, relationships.',
      'Time is the critical variable.',
      'Consistency > Intensity.',
      'Long-term mindset required.',
      'Exponential growth curves.'
    ],
    examples: [
      'Reading 20 pages daily: 7,300 pages/year = 36 books, builds knowledge exponentially over 10 years.',
      'Saving £200/month at 7%: £24K invested becomes £350K in 30 years (14x return).',
      'Learning coding 1 hour/day: In 2 years, skill level exceeds most professionals.',
      'Writing daily: 365 blog posts/year builds authority and career opportunities over time.',
      'Exercise 30 min/day: Small daily investment prevents major health costs and increases lifespan.',
      'Networking: One meaningful connection/month compounds into powerful network over years.',
      'Learning a language 15 min/day: Fluent in 2-3 years without intensive study.',
      'Investing in relationships: Regular check-ins compound into deep, supportive networks.'
    ],
    references: ['engines', 'money', 'optionality', 'keys', 'time-value-of-money', 'compound-interest', 'tier-system']
  },
  {
    id: 'energy-conservation-principle',
    name: 'Energy Conservation Principle',
    description: 'Total energy in a system remains constant; it can only be transferred or transformed, never created or destroyed.',
    category: ArtifactCategory.PRINCIPLE,
    icon: Lightbulb,
    tags: ['universal', 'energy', 'conservation', 'physics'],
    details: [
      'First law of thermodynamics.',
      'Energy transfers between forms.',
      'Efficiency matters in transformations.',
      'No perpetual motion.',
      'Zero-sum in closed systems.'
    ],
    examples: [
      'Work-life balance: Energy spent on work must come from personal time - manage the tradeoff.',
      'Decision fatigue: Making many small decisions depletes energy for important ones later.',
      'Task batching: Group similar tasks to reduce energy lost in context switching.',
      'Morning routine: Use peak energy for high-value work, save low-energy tasks for afternoon.',
      'Social energy: Time with extroverts recharges them but drains introverts - plan accordingly.',
      'Exercise timing: Physical energy investment can increase mental energy through improved circulation.',
      'Meal planning: Reduces daily decision energy, freeing mental capacity for important work.',
      'Automation: Systems that run themselves preserve your energy for higher-leverage activities.'
    ],
    references: ['energy', 'capacity', 'water', 'sustainable-balance']
  },
  {
    id: 'risk-return-tradeoff',
    name: 'Risk-Return Tradeoff',
    description: 'Higher potential returns require accepting higher levels of risk and uncertainty.',
    category: ArtifactCategory.PRINCIPLE,
    icon: Lightbulb,
    tags: ['universal', 'risk', 'return', 'tradeoff'],
    details: [
      'Universal economic principle.',
      'No free lunch in markets.',
      'Asymmetry exists but is rare.',
      'Risk management is critical.',
      'Diversification reduces risk.'
    ],
    examples: [
      'Stocks vs Bonds: Stocks average 10% returns but can drop 50%, bonds are safer at 3-5%.',
      'Starting a business: High income potential but risk of losing investment and time.',
      'Switching careers: Higher salary potential but risk of starting over and income gap.',
      'Real estate: Rental properties offer cash flow but require maintenance and vacancy risk.',
      'Education investment: Degree costs £50K-200K, higher earnings but no guaranteed job.',
      'Moving for opportunity: Better job market but costs and relationship disruption.',
      'Investing vs saving: Market investments grow faster than savings but can lose value.',
      'Time vs money: Spending time learning skills (risk) can save money long-term (return).'
    ],
    references: ['money', 'oxygen', 'optionality', 'asymmetric-risk-reward', 'diversification-hedging', 'cash-flow-management']
  },
  {
    id: 'progressive-overload',
    name: 'Progressive Overload',
    description: 'Gradual increase in stress or demand over time leads to adaptation and capacity growth.',
    category: ArtifactCategory.PRINCIPLE,
    icon: Lightbulb,
    tags: ['universal', 'growth', 'adaptation', 'capacity'],
    details: [
      'Applies to physical & mental training.',
      'Stress triggers adaptation.',
      'Recovery enables growth.',
      'Too much too fast = injury.',
      'Systematic progression required.'
    ],
    examples: [
      'Weightlifting: Add 5lbs per week to bench press, not 50lbs - body adapts gradually.',
      'Running: Increase distance 10% weekly (3 miles → 3.3 → 3.6), not doubling immediately.',
      'Learning coding: Start with tutorials, then small projects, then complex apps - build complexity.',
      'Public speaking: Start with small groups, then larger audiences, then conferences.',
      'Writing: Begin with 500 words/day, increase to 1000, then longer-form content.',
      'Meditation: Start 5 minutes daily, add 1 minute weekly until reaching 20 minutes.',
      'Cold exposure: Begin with 30 seconds, increase by 15 seconds weekly.',
      'Work responsibilities: Take on slightly more challenging projects, not overwhelming ones.'
    ],
    references: ['capacity', 'water', 'energy', 'armor', 'sustainable-balance', 'energy-conservation-principle']
  },
  {
    id: 'sustainable-balance',
    name: 'Sustainable Balance Principle',
    description: 'Long-term success requires balancing competing forces: growth vs recovery, risk vs safety, short-term vs long-term.',
    category: ArtifactCategory.PRINCIPLE,
    icon: Lightbulb,
    tags: ['universal', 'balance', 'sustainability', 'equilibrium'],
    details: [
      'Extremes lead to collapse.',
      'Dynamic equilibrium.',
      'Context-dependent balance.',
      'Pendulum swings inevitable.',
      'Long-term orientation.'
    ],
    examples: [
      'Work schedule: 50-hour weeks with 2-week vacation quarterly, not 80-hour weeks or 20-hour weeks.',
      'Investment strategy: 70% stocks/30% bonds balances growth with safety, rebalance annually.',
      'Fitness: Train 4 days/week with 3 rest days, not 7 days or 0 days.',
      'Social life: 2-3 social events/week maintains relationships without exhaustion.',
      'Learning: Study 2 hours daily with weekends off, not 8-hour marathons or no study.',
      'Spending: Save 20% income while enjoying 80%, not hoarding or spending everything.',
      'Diet: 80% healthy foods, 20% treats maintains nutrition without deprivation.',
      'Career growth: Take calculated risks while maintaining safety net, not all-in or all-safe.'
    ],
    references: ['capacity', 'energy', 'meaning', 'optionality', 'tier-system', 'progressive-overload', 'risk-return-tradeoff']
  },
  // Principles - Financial
  {
    id: 'time-value-of-money',
    name: 'Time Value of Money',
    description: 'Money available now is worth more than the same amount in the future due to earning potential.',
    category: ArtifactCategory.PRINCIPLE,
    icon: Lightbulb,
    tags: ['financial', 'time', 'value', 'opportunity-cost'],
    details: [
      'Present value > Future value.',
      'Opportunity cost of capital.',
      'Discounting future cash flows.',
      'Foundation of finance.',
      'Inflation erodes purchasing power.'
    ],
    examples: [
      'Pay off debt vs invest: £10K credit card debt at 20% costs more than investing that £10K at 7% - pay debt first.',
      'Early retirement savings: £5K invested at 25 grows to £75K by 65, but £5K at 35 only grows to £38K.',
      'Delayed gratification: Buying £50K car now costs opportunity to earn £400K+ by retirement.',
      'Salary negotiation: £5K raise now worth £200K+ over career through compounding raises.',
      'Education ROI: £100K MBA pays off if increases earnings £10K/year for 10+ years.',
      'Renting vs buying: Rent and invest down payment if investment returns exceed home appreciation.',
      'Discount rates: £1000 today is worth more than £1000 in 5 years due to earning potential.',
      'Prepayment decisions: Pay extra on mortgage only if rate > investment return potential.'
    ],
    references: ['money', 'engines', 'oxygen', 'compound-interest', 'compound-growth-principle', 'cash-flow-management']
  },
  {
    id: 'asymmetric-risk-reward',
    name: 'Asymmetric Risk-Reward',
    description: 'Seek opportunities where potential upside significantly exceeds downside risk.',
    category: ArtifactCategory.PRINCIPLE,
    icon: Lightbulb,
    tags: ['financial', 'asymmetry', 'risk', 'reward'],
    details: [
      'Limited downside, unlimited upside.',
      'Options thinking.',
      'Venture capital model.',
      'Antifragility.',
      'Convexity in returns.'
    ],
    examples: [
      'Investing in startups: Risk £10K with potential for £1M+ return (100x upside, limited downside).',
      'Writing a book: Invest time for potential royalties and career advancement, minimal downside.',
      'Learning valuable skills: Time investment with unlimited career upside, low financial risk.',
      'Real estate options: Small option fee controls large property, limited to option cost if unfavorable.',
      'Stock options/LEAPS: Small premium controls 100 shares, downside limited to premium paid.',
      'Side business while employed: Build income stream with job security as downside protection.',
      'Networking at conferences: Time cost vs. potential career-changing connections.',
      'Creating content online: Low-cost publishing with potential for viral reach and income.'
    ],
    references: ['optionality', 'money', 'engines', 'keys', 'risk-return-tradeoff', 'compound-growth-principle']
  },
  {
    id: 'diversification-hedging',
    name: 'Diversification & Hedging',
    description: 'Spread risk across uncorrelated assets to reduce portfolio volatility while maintaining returns.',
    category: ArtifactCategory.PRINCIPLE,
    icon: Lightbulb,
    tags: ['financial', 'diversification', 'risk-management', 'hedging'],
    details: [
      'Don\'t put all eggs in one basket.',
      'Uncorrelated assets reduce risk.',
      'Modern Portfolio Theory.',
      'Hedging protects downside.',
      'Over-diversification dilutes returns.'
    ],
    examples: [
      'Stock portfolio: Invest in 20+ companies across sectors (tech, healthcare, finance), not just one industry.',
      'Asset allocation: 60% stocks, 30% bonds, 10% real estate - different assets perform in different cycles.',
      'Income streams: Salary + freelance + rental income + investments - if one fails, others continue.',
      'Career skills: Technical skills + communication + business knowledge - makes you less replaceable.',
      'Emergency fund: Keep 6 months expenses in high-yield savings as hedge against job loss.',
      'Geographic diversification: Invest in US, international, emerging markets - reduces country risk.',
      'Industry exposure: Work in tech but invest across healthcare, finance, consumer goods.',
      'Option hedging: Own 100 shares of stock, buy put option to limit downside to 10% loss.'
    ],
    references: ['money', 'optionality', 'oxygen', 'risk-return-tradeoff', 'cash-flow-management']
  },
  {
    id: 'cash-flow-management',
    name: 'Cash Flow Management',
    description: 'Sustainable wealth requires managing the timing and magnitude of cash inflows and outflows.',
    category: ArtifactCategory.PRINCIPLE,
    icon: Lightbulb,
    tags: ['financial', 'cash-flow', 'liquidity', 'management'],
    details: [
      'Cash is king.',
      'Liquidity enables optionality.',
      'Timing mismatches create risk.',
      'Operating cash flow critical.',
      'Burn rate awareness.'
    ],
    examples: [
      'Monthly budget: Track income timing (bi-weekly pay) vs expenses (monthly bills) to avoid shortfalls.',
      'Emergency fund: Keep 3-6 months expenses in savings to handle cash flow gaps.',
      'Business operations: Ensure receivables (30-60 days) don\'t exceed payables timing.',
      'Credit card strategy: Pay in full monthly, use 30-day float to optimize cash timing.',
      'Side hustle timing: Start part-time while employed to maintain cash flow during transition.',
      'Expense timing: Schedule large purchases after payday, not before, to maintain liquidity.',
      'Investment liquidity: Keep some assets easily accessible (not all in retirement accounts).',
      'Subscription audit: Cancel unused subscriptions to improve monthly cash flow by £50-200.'
    ],
    references: ['oxygen', 'money', 'engines', 'optionality', 'time-value-of-money', 'diversification-hedging']
  },
  {
    id: 'compound-interest',
    name: 'Compound Interest',
    description: 'Earnings on earnings create exponential growth over time, making time your greatest ally.',
    category: ArtifactCategory.PRINCIPLE,
    icon: Lightbulb,
    tags: ['financial', 'compound', 'interest', 'exponential'],
    details: [
      'Eighth wonder of the world.',
      'Exponential vs linear growth.',
      'Start early, benefit greatly.',
      'Reinvestment drives compounding.',
      'Works for and against you.'
    ],
    examples: [
      'Pension contributions: £500/month from age 25-65 at 7% = £1.2M (your £240K becomes £1.2M).',
      'Dividend reinvestment: £10K in dividend stocks reinvesting dividends doubles in 10 years vs 14 years without.',
      'High-yield savings: £20K at 5% compounds to £32K in 10 years with no additional deposits.',
      'Debt compounding: £5K credit card at 20% becomes £31K in 10 years if only minimum payments.',
      'Investment returns: £100K at 10% annual return becomes £260K in 10 years, £673K in 20 years.',
      'Early investing advantage: Starting at 20 vs 30 means 2-3x more wealth at retirement.',
      'Reinvestment strategy: Taking profits and reinvesting accelerates growth vs spending gains.',
      'Compound effect: Small regular investments (£200/month) outperform large sporadic ones (£10K every 5 years).'
    ],
    references: ['money', 'engines', 'optionality', 'compound-growth-principle', 'time-value-of-money']
  },
  // Principles - Energy
  {
    id: 'recovery-over-depletion',
    name: 'Recovery > Depletion',
    description: 'Long-term performance requires that recovery consistently exceeds depletion.',
    category: ArtifactCategory.PRINCIPLE,
    icon: Lightbulb,
    tags: ['energy', 'recovery', 'depletion', 'balance'],
    details: [
      'Sustainable performance equation.',
      'Sleep is non-negotiable.',
      'Active recovery strategies.',
      'Burnout = chronic deficit.',
      'Recovery is productive.'
    ],
    examples: [
      'Sleep 7-9 hours nightly: Non-negotiable recovery that enables next-day performance.',
      'Take weekends off: 2 days recovery per week prevents chronic depletion.',
      'Active recovery days: Light walking/yoga instead of complete rest maintains momentum.',
      'Vacation planning: Take 1-2 week breaks quarterly to fully recharge.',
      'Daily breaks: 15-min breaks every 90 minutes maintain focus and energy.',
      'Evening wind-down: 1-hour screen-free routine before bed improves sleep quality.',
      'Meditation/breathing: 10-min daily practice reduces stress and aids recovery.',
      'Seasonal rhythms: Lighter workload in winter, peak performance in spring/summer.'
    ],
    references: ['energy', 'capacity', 'water', 'burnout-prevention', 'sustainable-rhythm', 'sustainable-balance']
  },
  {
    id: 'energy-conservation-law',
    name: 'Energy Conservation Law',
    description: 'You have finite energy; allocate it strategically to high-leverage activities.',
    category: ArtifactCategory.PRINCIPLE,
    icon: Lightbulb,
    tags: ['energy', 'conservation', 'allocation', 'finite'],
    details: [
      'Energy is your scarcest resource.',
      'Prioritization is essential.',
      'Say no to protect energy.',
      'Low-leverage tasks drain you.',
      'Energy ROI thinking.'
    ],
    examples: [
      'Time blocking: Schedule high-energy tasks (deep work) during peak hours (morning).',
      'Eliminate low-value activities: Stop checking email constantly, batch process 2x/day.',
      'Delegate or eliminate: Outsource tasks below your hourly rate (house cleaning, errands).',
      'Say no strategically: Decline meetings/projects that don\'t align with goals.',
      'Automate decisions: Meal prep on Sunday, wear similar outfits, reduce daily choices.',
      'Focus on 20/80: Spend 80% of energy on top 20% highest-impact activities.',
      'Reduce context switching: Group similar tasks (all calls together, all writing together).',
      'Protect peak hours: Block calendar for focused work, reject low-priority requests.'
    ],
    references: ['energy', 'capacity', 'energy-conservation-principle', 'sustainable-rhythm', 'tier-system']
  },
  {
    id: 'sustainable-rhythm',
    name: 'Sustainable Rhythm',
    description: 'Establish consistent, repeatable rhythms for work, rest, and recovery to maximize long-term output.',
    category: ArtifactCategory.PRINCIPLE,
    icon: Lightbulb,
    tags: ['energy', 'rhythm', 'consistency', 'sustainability'],
    details: [
      'Consistency > Heroic bursts.',
      'Circadian rhythm optimization.',
      'Weekly/daily cycles.',
      'Predictable patterns reduce stress.',
      'Sustainable pace.'
    ],
    examples: [
      'Daily routine: Wake 6am, exercise 6:30-7:30, deep work 8-12, meetings 2-5pm.',
      'Weekly rhythm: Monday planning, Tue-Thu focused work, Friday review/cleanup.',
      'Sleep schedule: Same bedtime/wake time daily, even weekends (circadian alignment).',
      'Workout schedule: Monday/Wednesday/Friday strength, Tuesday/Thursday cardio.',
      'Monthly cycles: Weeks 1-3 push hard, Week 4 lighter recovery and planning.',
      'Seasonal adjustments: More intense summer/fall, lighter winter/spring.',
      'Meal timing: Breakfast 7am, lunch 12pm, dinner 6pm (consistent fuel schedule).',
      'Review rhythms: Daily 5-min review, weekly 30-min planning, monthly 2-hour strategic review.'
    ],
    references: ['energy', 'capacity', 'water', 'recovery-over-depletion', 'capacity-building', 'sustainable-balance']
  },
  {
    id: 'capacity-building',
    name: 'Capacity Building',
    description: 'Systematically increase your energy capacity through progressive overload and recovery.',
    category: ArtifactCategory.PRINCIPLE,
    icon: Lightbulb,
    tags: ['energy', 'capacity', 'growth', 'training'],
    details: [
      'Train your capacity like a muscle.',
      'Stress + Recovery = Growth.',
      'Physical & mental capacity.',
      'Progressive overload applies.',
      'Long-term investment.'
    ],
    examples: [
      'Fitness progression: Start 30-min workouts, increase to 60-min over 3 months.',
      'Work capacity: Gradually increase work hours from 40 to 50 over 6 months, then maintain.',
      'Mental endurance: Start with 2-hour focus sessions, build to 4-hour deep work blocks.',
      'Stress tolerance: Take on slightly bigger challenges monthly, build resilience.',
      'Physical capacity: Run 1 mile, add 0.25 miles weekly until reaching 5K goal.',
      'Learning capacity: Study 1 hour/day, increase to 2 hours, then 3 hours gradually.',
      'Social capacity: Start networking 1x/month, increase to weekly as comfort grows.',
      'Recovery capacity: Improve sleep quality, reduce recovery time needed between intense periods.'
    ],
    references: ['capacity', 'energy', 'water', 'progressive-overload', 'sustainable-rhythm', 'recovery-over-depletion']
  },
  {
    id: 'burnout-prevention',
    name: 'Burnout Prevention',
    description: 'Proactively manage energy depletion before it becomes chronic and leads to burnout.',
    category: ArtifactCategory.PRINCIPLE,
    icon: Lightbulb,
    tags: ['energy', 'burnout', 'prevention', 'health', 'recovery', 'stressor', 'cognitive-decline'],
    details: [
      'Early warning signs matter.',
      'Prevention > Recovery.',
      'Chronic depletion = burnout.',
      'Mental & physical exhaustion.',
      'Strategic rest cycles.'
    ],
    examples: [
      'Monitor energy levels: Track daily energy 1-10, take rest when consistently below 5.',
      'Set boundaries: No work emails after 6pm, protect personal time strictly.',
      'Regular check-ins: Weekly self-assessment of stress, sleep, mood, and energy.',
      'Preventive breaks: Take vacation before feeling exhausted, not after.',
      'Reduce commitments: Say no to new projects when energy reserves are low.',
      'Stress management: Daily meditation, exercise, or hobbies to release tension.',
      'Sleep hygiene: Maintain 7-9 hours sleep even during busy periods.',
      'Support systems: Build relationships and ask for help before crisis point.'
    ],
    references: ['capacity', 'energy', 'meaning', 'recovery-over-depletion', 'sustainable-rhythm', 'sustainable-balance']
  },
  // Frameworks
  {
    id: 'financial-frameworks',
    name: 'Financial Frameworks',
    description: 'Strategic frameworks for investment, cash flow management, debt strategy, and wealth building.',
    category: ArtifactCategory.FRAMEWORK,
    icon: Network,
    tags: ['financial', 'investment', 'strategy', 'wealth'],
    details: [
      'Investment Portfolio Framework.',
      'Cash Flow Optimization Framework.',
      'Debt Management Framework.',
      'Asset Allocation Model.',
      'Risk Assessment Framework.'
    ],
    references: ['money', 'engines', 'oxygen', 'optionality', 'diversification-hedging', 'cash-flow-management', 'time-value-of-money', 'compound-interest']
  },
  {
    id: 'energy-frameworks',
    name: 'Energy Frameworks',
    description: 'Structured approaches for capacity management, recovery planning, and performance optimization.',
    category: ArtifactCategory.FRAMEWORK,
    icon: Network,
    tags: ['energy', 'capacity', 'recovery', 'performance', 'burnout', 'stressor'],
    details: [
      'Capacity Management Framework.',
      'Recovery Planning Framework.',
      'Performance Optimization Model.',
      'Energy Allocation Strategy.',
      'Burnout Prevention System.'
    ],
    references: ['energy', 'capacity', 'water', 'recovery-over-depletion', 'capacity-building', 'burnout-prevention', 'sustainable-rhythm']
  },
  {
    id: 'strategic-frameworks',
    name: 'Strategic Frameworks',
    description: 'High-level frameworks for decision-making, goal achievement, and strategic planning.',
    category: ArtifactCategory.FRAMEWORK,
    icon: Network,
    tags: ['strategy', 'decision-making', 'planning', 'goals'],
    details: [
      'Goal Setting Framework (SMART).',
      'Decision Matrix Model.',
      'Strategic Planning Framework.',
      'Priority Management System.',
      'Risk-Opportunity Analysis.'
    ],
    references: ['tier-system', 'optionality', 'meaning', 'sustainable-balance', 'risk-return-tradeoff', 'laws-power']
  }
]

interface ArtifactsViewProps {
  searchQuery?: string
  /** When provided, only artifacts belonging to this system are shown */
  systemId?: ArtifactSystemId
}

type ViewMode = 'grid' | 'museum'

export default function ArtifactsView({ searchQuery: externalSearchQuery, systemId }: ArtifactsViewProps = {}) {
  const [searchParams] = useSearchParams()
  const [internalSearchQuery, setInternalSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ArtifactCategory | 'hierarchy-tree' | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [loadoutItems, setLoadoutItems] = useState<LoadoutItem[]>([])
  const [isLoadingWeapons, setIsLoadingWeapons] = useState(true)
  const [realityNodes, setRealityNodes] = useState<RealityNode[]>([]) // Laws and Principles
  const [isLoadingRealityNodes, setIsLoadingRealityNodes] = useState(true)
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null)
  const { dashboard, isDemo } = useGameStore()
  const [userResources, setUserResources] = useState<any>(null)
  const [userEngines, setUserEngines] = useState<any[]>([])
  const [treeRefreshTrigger, setTreeRefreshTrigger] = useState(0)
  const [systemFilter, setSystemFilter] = useState<ArtifactSystemId | 'all'>('all')

  // Use external search query if provided, otherwise use internal state
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery

  // Effective system filter: prop takes precedence, then local state
  const effectiveSystemId: ArtifactSystemId | null =
    systemId ?? (systemFilter === 'all' ? null : systemFilter)

  // Check if user is authenticated
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const isAuthenticated = !isDemo && token && dashboard

  // Fetch user instances (resources, engines) when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setUserResources(null)
      setUserEngines([])
      return
    }

    const fetchUserInstances = async () => {
      try {
        // Fetch resources
        const resources = await resourcesApi.getResources()
        setUserResources(resources)

        // Fetch engines
        const engines = await enginesApi.getEngines()
        setUserEngines(engines)
      } catch (error) {
        console.error('Error fetching user instances:', error)
        // Silently fail - artifacts will show without instances
      }
    }

    fetchUserInstances()
  }, [isAuthenticated])

  // Fetch loadout items (weapons) on mount
  useEffect(() => {
    const fetchLoadoutItems = async () => {
      try {
        setIsLoadingWeapons(true)
        const items = await loadoutApi.getLoadoutItems()
        setLoadoutItems(items)
      } catch (error: any) {
        // If unauthorized (401), silently skip loading weapons
        // They'll show up when user logs in
        if (error?.status !== 401) {
          console.error('Error loading loadout items:', error)
        }
      } finally {
        setIsLoadingWeapons(false)
      }
    }

    fetchLoadoutItems()
  }, [])

  // Fetch Reality Nodes (Laws and Principles) on mount and periodically
  useEffect(() => {
    const fetchRealityNodes = async () => {
      try {
        setIsLoadingRealityNodes(true)
        // Clear cache to ensure fresh data
        realityNodeApi.clearCache()
        // Fetch all LAW, PRINCIPLE, FRAMEWORK, and CATEGORY type nodes
        const [lawsResponse, principlesResponse, frameworksResponse, categoryResponse] = await Promise.all([
          realityNodeApi.getNodes({ nodeType: 'LAW' }),
          realityNodeApi.getNodes({ nodeType: 'PRINCIPLE' }),
          realityNodeApi.getNodes({ nodeType: 'FRAMEWORK' }),
          realityNodeApi.getNodes({ nodeType: 'CATEGORY' }),
        ])
        
        // Include category nodes: knowledge templates and universal concepts
        const categoryNodes = (categoryResponse.nodes || []).filter(
          (n: any) => n.metadata?._templateType === 'knowledge' || n.metadata?.isUniversalConcept === true || n.metadata?.summary
        )
        
        const allNodes = [
          ...(lawsResponse.nodes || []),
          ...(principlesResponse.nodes || []),
          ...(frameworksResponse.nodes || []),
          ...categoryNodes,
        ]
        setRealityNodes(allNodes)
      } catch (error: any) {
        console.error('Error loading reality nodes (laws/principles):', error)
        // Continue even if fetch fails - artifacts will just not include them
      } finally {
        setIsLoadingRealityNodes(false)
      }
    }

    fetchRealityNodes()
    
    // Set up periodic refresh every 30 seconds to keep artifacts live
    const refreshInterval = setInterval(() => {
      fetchRealityNodes()
      // Trigger tree refresh when artifacts refresh
      setTreeRefreshTrigger(prev => prev + 1)
    }, 30000)

    return () => clearInterval(refreshInterval)
  }, [])

  /**
   * ARTIFACT AGGREGATION - Source of Truth
   * 
   * This is where ALL artifacts from different systems are combined into a unified view.
   * Each system manages its own artifact data, but Knowledge aggregates them here.
   * 
   * Artifacts hold generic descriptions/understanding of elements.
   * Instances are only referenced when the user has an instance that applies.
   * 
   * Current sources:
   * 1. Static artifacts (defined in `artifacts` array above):
   *    - Core resources: Energy, Money, Oxygen, Water, Armor, Keys
   *    - Stats: Capacity, Engines, Meaning, Optionality
   *    - Systems: Finance System, Energy System
   *    - Concepts: Tier System
   *    - Laws: 48 Laws of Power, Bible Laws
   * 
   * 2. Dynamic artifacts from Loadout System:
   *    - Weapons/LoadoutItems fetched from backend API
   *    - Each weapon becomes an artifact with WEAPON category
   * 
   * Future expansion:
   * - Reality Nodes could be fetched and added as artifacts
   * - Training modules, Awareness layers, etc.
   * - Each system's entities can be exposed as artifacts here
   */
  const allArtifacts = useMemo(() => {
    const baseArtifacts = [...artifacts]

    // Adapt "48 Laws of Power" for current system: only some domains apply per system
    const powerLawDomainsForSystem = effectiveSystemId ? SYSTEM_POWER_LAW_DOMAINS_SAFE[effectiveSystemId] : []
    const baseWithSystemLaws = baseArtifacts.map((artifact) => {
      if (artifact.id !== 'laws-power' || !effectiveSystemId || powerLawDomainsForSystem.length === 0) return artifact
      const systemLabel = ARTIFACT_SYSTEM_LABELS[effectiveSystemId]
      const domainList = powerLawDomainsForSystem.join(', ')
      const extraDetail = `For ${systemLabel}, only these domains apply: ${domainList}. The list below shows only laws from these domains.`
      return {
        ...artifact,
        details: [...(artifact.details ?? []), extraDetail],
      }
    })

    // Map user instances to artifacts when user has instances
    const artifactsWithInstances = baseWithSystemLaws.map(artifact => {
      // Only add instance data if user is authenticated and has the instance
      if (!isAuthenticated || !userResources || !dashboard) {
        return artifact
      }

      const instance: ArtifactInstance | undefined = (() => {
        // Map resources
        if (artifact.id === 'energy' && userResources.energy !== undefined) {
          return {
            value: userResources.usableEnergy || userResources.energy,
            label: `Current: ${userResources.usableEnergy || userResources.energy}/${userResources.energyCap || 100}`,
            metadata: { energyCap: userResources.energyCap, isInBurnout: userResources.isInBurnout }
          }
        }
        if (artifact.id === 'oxygen' && userResources.oxygen !== undefined) {
          return {
            value: userResources.oxygen,
            label: `Current: ${userResources.oxygen.toFixed(1)} months`,
            metadata: {}
          }
        }
        if (artifact.id === 'money' && userResources.gold !== undefined) {
          return {
            value: userResources.gold,
            label: `Current: ${userResources.gold.toFixed(2)}`,
            metadata: {}
          }
        }
        if (artifact.id === 'water' && userResources.water !== undefined) {
          return {
            value: userResources.water,
            label: `Current: ${userResources.water}/100`,
            metadata: {}
          }
        }
        if (artifact.id === 'armor' && userResources.armor !== undefined) {
          return {
            value: userResources.armor,
            label: `Current: ${userResources.armor}/100`,
            metadata: {}
          }
        }
        if (artifact.id === 'keys' && userResources.keys !== undefined) {
          return {
            value: userResources.keys,
            label: `Current: ${userResources.keys}`,
            metadata: {}
          }
        }

        // Map stats (clouds)
        if (artifact.id === 'capacity' && dashboard.clouds?.capacity !== undefined) {
          return {
            value: dashboard.clouds.capacity,
            label: `Current: ${dashboard.clouds.capacity}/100`,
            metadata: {}
          }
        }
        if (artifact.id === 'engines' && dashboard.clouds?.engines !== undefined) {
          return {
            value: dashboard.clouds.engines,
            label: `Current: ${dashboard.clouds.engines}/100`,
            metadata: { engineCount: userEngines.length }
          }
        }
        if (artifact.id === 'meaning' && dashboard.clouds?.meaning !== undefined) {
          return {
            value: dashboard.clouds.meaning,
            label: `Current: ${dashboard.clouds.meaning}/100`,
            metadata: {}
          }
        }
        if (artifact.id === 'optionality' && dashboard.clouds?.optionality !== undefined) {
          return {
            value: dashboard.clouds.optionality,
            label: `Current: ${dashboard.clouds.optionality}/100`,
            metadata: {}
          }
        }

        return undefined
      })()

      return instance ? { ...artifact, instance } : artifact
    })

    // Add weapon artifacts (these are already instances)
    const weaponArtifacts: Artifact[] = loadoutItems.map(item => ({
      id: `weapon-${item.id}`,
      name: item.name,
      description: item.description,
      category: ArtifactCategory.WEAPON,
      icon: Sword,
      route: '/loadout',
      tags: ['weapon', 'loadout', 'capability', item.slotType.toLowerCase()],
      details: [
        `Power Level: ${item.powerLevel}.`,
        ...(item.benefits?.capacity ? [`+${item.benefits.capacity} Capacity.`] : []),
        ...(item.benefits?.engines ? [`+${item.benefits.engines} Engines.`] : []),
        ...(item.benefits?.meaning ? [`+${item.benefits.meaning} Meaning.`] : []),
        ...(item.benefits?.optionality ? [`+${item.benefits.optionality} Optionality.`] : []),
        ...(item.benefits?.energyCostReduction ? [`-${(item.benefits.energyCostReduction * 100).toFixed(0)}% Energy Cost.`] : []),
        ...(item.isDefault ? ['Default Equipment.'] : []),
      ].filter(Boolean),
    }))

    // Add engine type artifacts with instances
    const engineTypeArtifacts: Artifact[] = userEngines.map(engine => {
      const engineTypeMap: Record<string, { name: string; icon: React.ComponentType<{ className?: string }> }> = {
        CAREER: { name: 'Career Engine', icon: TrendingUp },
        BUSINESS: { name: 'Business Engine', icon: TrendingUp },
        INVESTMENT: { name: 'Investment Engine', icon: TrendingUp },
        LEARNING: { name: 'Learning Engine', icon: BookOpen },
      }
      const typeInfo = engineTypeMap[engine.type] || { name: `${engine.type} Engine`, icon: TrendingUp }
      
      return {
        id: `engine-instance-${engine.id}`,
        name: engine.name || typeInfo.name,
        description: `A ${engine.type.toLowerCase()} engine that generates income. Generic understanding: Engines are value creation mechanisms.`,
        category: ArtifactCategory.STAT,
        icon: typeInfo.icon,
        tags: ['engine', engine.type.toLowerCase(), 'income'],
        details: [
          `Type: ${engine.type}.`,
          `Status: ${engine.status}.`,
          `Output: ${engine.currentOutput} Oxygen/month.`,
          `Fragility: ${engine.fragilityScore}/100.`,
        ],
        instance: {
          value: engine.currentOutput,
          label: `Output: ${engine.currentOutput} Oxygen/month`,
          status: engine.status,
          metadata: { type: engine.type, fragilityScore: engine.fragilityScore }
        }
      }
    })

    // Add Reality Node artifacts (Laws, Principles, Frameworks, Knowledge, Universal Concepts)
    const realityNodeArtifacts: Artifact[] = realityNodes.map(node => {
      const isLaw = node.nodeType === 'LAW'
      const isFramework = node.nodeType === 'FRAMEWORK'
      const isKnowledge = node.metadata?._templateType === 'knowledge'
      const isUniversalConcept = node.metadata?.isUniversalConcept === true
      
      // Determine category and icon based on node type
      let artifactCategory: ArtifactCategory
      let icon
      if (isUniversalConcept) {
        artifactCategory = ArtifactCategory.CONCEPT
        icon = Layers
      } else if (isKnowledge) {
        artifactCategory = ArtifactCategory.KNOWLEDGE
        icon = Brain
      } else if (isFramework) {
        artifactCategory = ArtifactCategory.FRAMEWORK
        icon = Network
      } else if (isLaw) {
        artifactCategory = ArtifactCategory.LAW
        icon = BookOpen
      } else {
        artifactCategory = ArtifactCategory.PRINCIPLE
        icon = Lightbulb
      }
      
      // Build tags from category and metadata
      const tags: string[] = []
      if (node.category) {
        tags.push(node.category.toLowerCase())
      }
      if (node.metadata?.domain) {
        tags.push(node.metadata.domain.toLowerCase())
      }
      if (node.metadata?.powerLawId) {
        tags.push('power-law')
      }
      if (node.metadata?.bibleLawId) {
        tags.push('bible-law')
      }
      if (node.metadata?.systemId) {
        tags.push(node.metadata.systemId.toLowerCase())
      }
      if (Array.isArray(node.metadata?.systemIds)) {
        node.metadata.systemIds.forEach((s: string) => {
          const lower = String(s).toLowerCase()
          if (lower && !tags.includes(lower)) tags.push(lower)
        })
      }
      if (isKnowledge) {
        tags.push('knowledge')
      }
      // Include pathway knowledge tags (e.g. stressor, cortisol, burnout)
      if (Array.isArray(node.metadata?.tags)) {
        tags.push(...node.metadata.tags)
      }
      
      // Build details array
      const details: string[] = []
      if (node.category) {
        details.push(`Category: ${getCategoryDisplayName(node.category)}.`)
      }
      if (node.metadata?.domain) {
        details.push(`Domain: ${node.metadata.domain}.`)
      }
      if (node.metadata?.scriptureReference) {
        details.push(`Scripture: ${node.metadata.scriptureReference}.`)
      }
      if (node.metadata?.lawNumber) {
        details.push(`Law #${node.metadata.lawNumber}.`)
      }
      if (node.immutable) {
        details.push('Immutable.')
      }
      // Extract template metadata based on node type
      const metadata: Record<string, unknown> = {}
      if (isUniversalConcept && node.metadata?.summary) {
        metadata.summary = node.metadata.summary
      }
      if (isKnowledge && node.metadata) {
        // Knowledge template fields
        if (node.metadata.definition) metadata.definition = node.metadata.definition
        if (node.metadata.keyInsight) metadata.keyInsight = node.metadata.keyInsight
        if (node.metadata.howItWorks) metadata.howItWorks = node.metadata.howItWorks
        if (node.metadata.keyRisks) metadata.keyRisks = node.metadata.keyRisks
        if (node.metadata.practicalApplication) metadata.practicalApplication = node.metadata.practicalApplication
      } else if (isLaw && node.metadata) {
        // Law template fields
        if (node.metadata.derivedFrom) metadata.derivedFrom = node.metadata.derivedFrom
        if (node.metadata.statement) metadata.statement = node.metadata.statement
        if (node.metadata.recursiveBehavior) metadata.recursiveBehavior = node.metadata.recursiveBehavior
        if (node.metadata.violationOutcome) metadata.violationOutcome = node.metadata.violationOutcome
        if (node.metadata.whyThisLawPersists) metadata.whyThisLawPersists = node.metadata.whyThisLawPersists
      } else if (node.nodeType === 'PRINCIPLE' && node.metadata) {
        // Principle template fields
        if (node.metadata.alignedWith) metadata.alignedWith = node.metadata.alignedWith
        if (node.metadata.principle) metadata.principle = node.metadata.principle
        if (node.metadata.whyItWorks) metadata.whyItWorks = node.metadata.whyItWorks
        if (node.metadata.violationPattern) metadata.violationPattern = node.metadata.violationPattern
        if (node.metadata.predictableResult) metadata.predictableResult = node.metadata.predictableResult
      } else if (isFramework && node.metadata) {
        // Framework template fields
        if (node.metadata.basedOn) metadata.basedOn = node.metadata.basedOn
        if (node.metadata.purpose) metadata.purpose = node.metadata.purpose
        if (node.metadata.structure) metadata.structure = node.metadata.structure
        if (node.metadata.whenToUse) metadata.whenToUse = node.metadata.whenToUse
        if (node.metadata.whenNotToUse) metadata.whenNotToUse = node.metadata.whenNotToUse
      }

      const description = node.metadata?.summary || node.description || (isUniversalConcept ? `Universal concept for ${node.metadata?.systemId || 'system'}.` : `A ${isLaw ? 'law' : isFramework ? 'framework' : isKnowledge ? 'knowledge' : 'principle'} from the reality hierarchy.`)
      const nodeSystemId = node.metadata?.systemId
      const artifactSystemId = nodeSystemId && ARTIFACT_SYSTEM_IDS.includes(nodeSystemId as ArtifactSystemId) ? (nodeSystemId as ArtifactSystemId) : undefined
      // Power-law filter: derive systemIds from domain so only applicable laws show per system
      let systemIdsArray: ArtifactSystemId[] | undefined
      if (isUniversalConcept) {
        systemIdsArray = [...ARTIFACT_SYSTEM_IDS]
      } else if (node.metadata?.powerLawId && node.metadata?.domain) {
        const domainSystems = getSystemsForPowerLawDomain(String(node.metadata.domain))
        systemIdsArray = domainSystems.length ? domainSystems : undefined
      } else if (Array.isArray(node.metadata?.systemIds)) {
        systemIdsArray = (node.metadata.systemIds as string[]).filter(
          (s): s is ArtifactSystemId => ARTIFACT_SYSTEM_IDS.includes(s as ArtifactSystemId)
        )
        if (systemIdsArray.length === 0) systemIdsArray = undefined
      }
      return {
        id: `reality-node-${node.id}`,
        name: node.title,
        description,
        category: artifactCategory,
        icon,
        route: `/knowledge/hierarchy?node=${node.id}`,
        systemId: isUniversalConcept ? undefined : artifactSystemId,
        ...(systemIdsArray?.length ? { systemIds: systemIdsArray } : {}),
        tags,
        details: details.length > 0 ? details : undefined,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      }
    })

    return [...artifactsWithInstances, ...weaponArtifacts, ...engineTypeArtifacts, ...realityNodeArtifacts]
  }, [loadoutItems, realityNodes, isAuthenticated, userResources, dashboard, userEngines, effectiveSystemId])

  const systemFilteredArtifacts = useMemo(
    () => filterArtifactsBySystem(allArtifacts, effectiveSystemId),
    [allArtifacts, effectiveSystemId]
  )

  const filteredArtifacts = useMemo(() => {
    // If hierarchy tree is selected, return empty (will show tree instead)
    if (selectedCategory === 'hierarchy-tree') {
      return []
    }

    return systemFilteredArtifacts.filter(artifact => {
      const query = searchQuery.toLowerCase().trim()
      const matchesSearch = !query || 
        artifact.name.toLowerCase().includes(query) ||
        artifact.description.toLowerCase().includes(query) ||
        artifact.details?.some(d => d.toLowerCase().includes(query)) ||
        artifact.tags?.some(tag => tag.toLowerCase().includes(query))
      
      const matchesCategory = !selectedCategory || artifact.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory, systemFilteredArtifacts])

  // Helper function to get artifact by ID
  const getArtifactById = useCallback((id: string): Artifact | undefined => {
    return allArtifacts.find(a => a.id === id)
  }, [allArtifacts])

  // Helper function to get referenced artifacts
  const getReferencedArtifacts = (artifact: Artifact): Artifact[] => {
    if (!artifact.references || artifact.references.length === 0) {
      return []
    }
    return artifact.references
      .map(refId => getArtifactById(refId))
      .filter((ref): ref is Artifact => ref !== undefined)
  }

  // Handle artifact ID from URL query parameter - open the exact artifact selected
  useEffect(() => {
    const artifactId = searchParams.get('id')
    if (artifactId && allArtifacts.length > 0) {
      const artifact = getArtifactById(artifactId)
      if (artifact) {
        setSelectedArtifact(artifact)
        // Set category and system filter so the list shows the artifact (not "All")
        setSelectedCategory(artifact.category)
        if (artifact.systemId && !systemId) {
          setSystemFilter(artifact.systemId)
        }
      }
    }
  }, [searchParams, allArtifacts, getArtifactById, systemId])

  const handleArtifactClick = (artifact: Artifact) => {
    setSelectedArtifact(artifact)
  }

  // Get all unique categories for filter buttons in a logical order
  const categoryOrder: ArtifactCategory[] = [
    ArtifactCategory.RESOURCE,
    ArtifactCategory.STAT,
    ArtifactCategory.CONCEPT,
    ArtifactCategory.LAW,
    ArtifactCategory.PRINCIPLE,
    ArtifactCategory.FRAMEWORK,
    ArtifactCategory.KNOWLEDGE,
    ArtifactCategory.WEAPON,
  ]
  
  const availableCategories = Array.from(new Set(systemFilteredArtifacts.map(a => a.category)))
  const categories = categoryOrder.filter(cat => availableCategories.includes(cat))

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h1 className="text-4xl font-bold">Artifacts</h1>
            </div>
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1 border border-gray-700">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-all ${
                    viewMode === 'grid'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Grid view"
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('museum')}
                  className={`p-2 rounded transition-all ${
                    viewMode === 'museum'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Museum view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded border border-gray-700">
                Artifacts
              </span>
            </div>
          </div>
        <p className="text-gray-400">
            Tools and concepts that support your systems. View resources, stats, concepts, laws, principles, frameworks, and weapons. Optional but valuable for understanding how to optimize system performance.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Each system leverages artifacts for better outcomes • Explore how they enhance your operations
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search artifacts by name, description, tags, or details..."
            value={externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery}
            onChange={(e) => {
              if (externalSearchQuery === undefined) {
                setInternalSearchQuery(e.target.value)
              }
            }}
            className="w-full pl-12 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-lg"
          />
          {(externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery) && (
            <button
              onClick={() => {
                if (externalSearchQuery === undefined) {
                  setInternalSearchQuery('')
                }
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* System Filter - only when not constrained by systemId prop */}
        {!systemId && (
          <div className="flex items-center gap-2">
            <label htmlFor="system-filter" className="text-sm text-gray-400 whitespace-nowrap">
              System:
            </label>
            <select
              id="system-filter"
              value={systemFilter}
              onChange={(e) =>
                setSystemFilter(e.target.value === 'all' ? 'all' : (e.target.value as ArtifactSystemId))
              }
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Systems</option>
              {ARTIFACT_SYSTEM_IDS.map((id) => (
                <option key={id} value={id}>
                  {ARTIFACT_SYSTEM_LABELS[id]}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Category Filter Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-300">Filter by Category</h3>
            {selectedCategory && (
          <button
            onClick={() => setSelectedCategory(null)}
                className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear filter
              </button>
            )}
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {/* View All Button */}
            <button
              onClick={() => setSelectedCategory(null)}
              className={`group relative p-3 rounded-lg border-2 transition-all ${
              selectedCategory === null
                  ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/20'
                  : 'bg-gray-800 border-gray-700 hover:border-blue-500/50 hover:shadow-md'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedCategory === null ? 'bg-blue-500/20' : 'bg-gray-700'
                }`}>
                  <span className="text-xl">🌐</span>
                </div>
                <span className={`text-xs font-medium ${
                  selectedCategory === null ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'
                }`}>
                  All
                </span>
                <span className={`text-[10px] ${
                  selectedCategory === null ? 'text-blue-300' : 'text-gray-500'
                }`}>
                  {systemFilteredArtifacts.length} items
                </span>
              </div>
          </button>

            {/* Full Hierarchy Tree Button */}
            <button
              onClick={() => setSelectedCategory(selectedCategory === 'hierarchy-tree' ? null : 'hierarchy-tree')}
              className={`group relative p-3 rounded-lg border-2 transition-all ${
                selectedCategory === 'hierarchy-tree'
                  ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/20'
                  : 'bg-gray-800 border-gray-700 hover:border-indigo-500/50 hover:shadow-md'
              }`}
              title="View the full hierarchy tree of reality, constraints, laws, principles, and frameworks"
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedCategory === 'hierarchy-tree' ? 'bg-indigo-500/20' : 'bg-gray-700'
                }`}>
                  <Network className={`w-5 h-5 ${
                    selectedCategory === 'hierarchy-tree' ? 'text-indigo-400' : 'text-gray-400 group-hover:text-indigo-400'
                  }`} />
                </div>
                <span className={`text-xs font-medium ${
                  selectedCategory === 'hierarchy-tree' ? 'text-indigo-400' : 'text-gray-400 group-hover:text-white'
                }`}>
                  Hierarchy
                </span>
                <span className={`text-[10px] ${
                  selectedCategory === 'hierarchy-tree' ? 'text-indigo-300' : 'text-gray-500'
                }`}>
                  Tree
                </span>
              </div>
              
              {/* Selection Indicator */}
              {selectedCategory === 'hierarchy-tree' && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>

            {/* Category Buttons */}
          {categories.map((category) => {
            const metadata = getArtifactCategoryMetadata(category)
            const label = getArtifactCategoryLabel(category)
              const description = getArtifactCategoryDescription(category)
            const isSelected = selectedCategory === category
              const count = systemFilteredArtifacts.filter(a => a.category === category).length
            
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(isSelected ? null : category)}
                  className={`group relative p-3 rounded-lg border-2 transition-all ${
                  isSelected
                      ? `${metadata.color.bg} ${metadata.color.border} shadow-lg ${metadata.color.border.replace('border-', 'shadow-')}/20`
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600 hover:shadow-md'
                  }`}
                  title={description}
                >
                  <div className="flex flex-col items-center gap-2">
                    {/* Color Indicator Circle */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isSelected 
                        ? metadata.color.bg.replace('/10', '/30') 
                        : 'bg-gray-700 group-hover:' + metadata.color.bg.replace('/10', '/20')
                    }`}>
                      <span className={`w-5 h-5 rounded-full ${
                        isSelected 
                          ? metadata.color.bg.replace('/10', '') 
                          : 'bg-gray-600 group-hover:' + metadata.color.bg.replace('/10', '')
                      }`} />
                    </div>
                    
                    {/* Label */}
                    <span className={`text-xs font-medium transition-colors ${
                      isSelected 
                        ? metadata.color.text 
                        : 'text-gray-400 group-hover:text-white'
                    }`}>
                {label}
                    </span>
                    
                    {/* Count Badge */}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                      isSelected
                        ? `${metadata.color.bg} ${metadata.color.text}`
                        : 'bg-gray-700 text-gray-500 group-hover:bg-gray-600'
                    }`}>
                      {count}
                    </span>
                  </div>
                  
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${metadata.color.bg.replace('/10', '')} flex items-center justify-center`}>
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
              </button>
            )
          })}
          </div>

          {/* Active Filter Display */}
          {selectedCategory && selectedCategory !== 'hierarchy-tree' && (
            <div className="flex items-center gap-2 p-2 bg-gray-700/50 rounded-lg">
              <span className="text-xs text-gray-400">Active filter:</span>
              <ArtifactCategoryTag category={selectedCategory} size="sm" />
              <span className="text-xs text-gray-400">
                ({filteredArtifacts.length} {filteredArtifacts.length === 1 ? 'item' : 'items'})
              </span>
            </div>
          )}
          {selectedCategory === 'hierarchy-tree' && (
            <div className="flex items-center gap-2 p-2 bg-gray-700/50 rounded-lg">
              <span className="text-xs text-gray-400">Active view:</span>
              <div className="flex items-center gap-2 px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/30">
                <Network className="w-3 h-3 text-indigo-400" />
                <span className="text-xs font-medium text-indigo-400">
                  Full Hierarchy Tree
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoadingWeapons && (
        <div className="text-center py-4 text-gray-400">
          <p>Loading weapons...</p>
        </div>
      )}

      {/* Content Area - Show Hierarchy Tree or Artifacts */}
      {selectedCategory === 'hierarchy-tree' ? (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <HierarchyTreeView 
            rootNodeId="reality" 
            refreshTrigger={treeRefreshTrigger}
            onArtifactClick={(artifactId) => {
              // Find and open the artifact modal directly
              const artifact = getArtifactById(artifactId)
              if (artifact) {
                setSelectedArtifact(artifact)
              }
            }}
          />
        </div>
      ) : filteredArtifacts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No artifacts found matching your search.</p>
        </div>
      ) : viewMode === 'museum' ? (
        /* Museum View - Gallery Style */
        <div className="space-y-12">
          {filteredArtifacts.map((artifact, index) => {
            const Icon = artifact.icon
            const categoryMeta = getArtifactCategoryMetadata(artifact.category)
            return (
              <motion.div
                key={artifact.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                onClick={() => handleArtifactClick(artifact)}
                className={`bg-gray-800/50 rounded-xl p-8 border-2 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-2xl group ${categoryMeta.color.border}`}
              >
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Left: Icon and Category */}
                  <div className="flex-shrink-0 flex flex-col items-center md:items-start">
                    <div className={`p-6 rounded-2xl mb-4 ${categoryMeta.color.bg} border-2 ${categoryMeta.color.border}`}>
                      <Icon className={`w-12 h-12 ${categoryMeta.color.text}`} />
                    </div>
                    <ArtifactCategoryTag category={artifact.category} size="md" />
                    {artifact.instance && (
                      <div className="mt-3 px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-medium">
                        Active
                      </div>
                    )}
                  </div>

                  {/* Right: Content */}
                  <div className="flex-1">
                    <div className="mb-4">
                      <h3 className="text-3xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">
                        {artifact.name}
                      </h3>
                      <p className="text-gray-300 text-lg leading-relaxed">
                        {artifact.description}
                      </p>
                    </div>

                    {/* Instance preview */}
                    {artifact.instance && artifact.instance.label && (
                      <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-blue-300 font-medium text-sm">{artifact.instance.label}</p>
                      </div>
                    )}

                    {/* Details */}
                    {artifact.details && artifact.details.length > 0 && (
                      <div className="mb-6">
                        <KeyDetailsList
                          title="Key Details"
                          items={artifact.details}
                          bulletColor={categoryMeta.color.bg.replace('/10', '')}
                        />
                      </div>
                    )}

                    {/* Tags */}
                    {artifact.tags && artifact.tags.length > 0 && (
                      <div className="mb-6">
                        <div className="flex flex-wrap gap-2">
                          {artifact.tags.map((tag, idx) => (
                            <span key={idx} className="px-3 py-1 rounded-full bg-gray-700/50 text-gray-400 text-xs border border-gray-600">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-700">
                      <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                        Click to explore in detail.
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        /* Grid View - Original Compact Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtifacts.map((artifact, index) => {
            const Icon = artifact.icon
            return (
              <motion.div
                key={artifact.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleArtifactClick(artifact)}
                className={`bg-gray-800 rounded-lg p-6 border-2 cursor-pointer transition-all hover:scale-105 ${
                    getArtifactCategoryMetadata(artifact.category).color.border
                  } hover:border-opacity-60`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${getArtifactCategoryMetadata(artifact.category).color.bg}`}>
                    <Icon className={`w-6 h-6 ${getArtifactCategoryMetadata(artifact.category).color.text}`} />
                  </div>
                  <ArtifactCategoryTag category={artifact.category} size="sm" />
                </div>

                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-white">
                  {artifact.name}
                </h3>
                    {artifact.instance && (
                      <span className="px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        Active
                      </span>
                    )}
                  </div>
                <p className="text-gray-400 text-sm mb-4">
                  {artifact.description}
                </p>

                  {/* Instance preview on card */}
                  {artifact.instance && artifact.instance.label && (
                    <div className="mb-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs">
                      <p className="text-blue-300 font-medium">{artifact.instance.label}</p>
                    </div>
                  )}

                {artifact.details && artifact.details.length > 0 && (
                  <div className="mb-4">
                    <KeyDetailsList
                      title="Key Details"
                      items={artifact.details}
                      compact
                      maxItems={3}
                    />
                  </div>
                )}

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                    <span className="text-sm text-gray-400">Click to learn more.</span>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
              </motion.div>
            )
          })}
          </div>
      )}

      {/* Artifact Detail Modal */}
      <AnimatePresence>
        {selectedArtifact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedArtifact(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`bg-gray-800 rounded-lg border-2 ${
                getArtifactCategoryMetadata(selectedArtifact.category).color.border
              } max-w-3xl w-full max-h-[90vh] overflow-y-auto`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className={`p-6 border-b-2 ${getArtifactCategoryMetadata(selectedArtifact.category).color.border}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-4 rounded-lg ${getArtifactCategoryMetadata(selectedArtifact.category).color.bg}`}>
                      {(() => {
                        const Icon = selectedArtifact.icon
                        return <Icon className={`w-8 h-8 ${getArtifactCategoryMetadata(selectedArtifact.category).color.text}`} />
                      })()}
            </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-3xl font-bold text-white">{selectedArtifact.name}</h2>
                        <ArtifactCategoryTag category={selectedArtifact.category} size="md" />
            </div>
                      <p className="text-gray-400 text-lg">
                        {selectedArtifact.description}
                      </p>
          </div>
                  </div>
                  <button
                    onClick={() => setSelectedArtifact(null)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors ml-4"
                  >
                    <X className="w-6 h-6 text-gray-400" />
        </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Instance Data Section - Only shown when user has an instance */}
                {selectedArtifact.instance && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-400 mb-2 flex items-center gap-2">
                      <Info className="w-5 h-5" />
                      Your Instance
                </h3>
                <div className="space-y-2">
                      {selectedArtifact.instance.label && (
                        <p className="text-white font-medium">{selectedArtifact.instance.label}</p>
                      )}
                      {selectedArtifact.instance.status && (
                        <p className="text-gray-300 text-sm">
                          Status: <span className="text-blue-400">{selectedArtifact.instance.status}</span>
                        </p>
                      )}
                      {selectedArtifact.instance.metadata && Object.keys(selectedArtifact.instance.metadata).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-blue-500/20">
                          <p className="text-gray-400 text-xs mb-2">Additional Details:</p>
                          <div className="space-y-1">
                            {Object.entries(selectedArtifact.instance.metadata).map(([key, value]) => (
                              <p key={key} className="text-gray-300 text-xs">
                                <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>{' '}
                                <span className="text-blue-300">{String(value)}</span>
                              </p>
                            ))}
                  </div>
                  </div>
                      )}
                  </div>
                  </div>
                )}
                {/* System Artifact Template */}
                {selectedArtifact.category === ArtifactCategory.SYSTEM && selectedArtifact.systemOverview ? (
                  <>
                    {/* Overview Section */}
                    {selectedArtifact.systemOverview && selectedArtifact.systemOverview.length > 0 && (
                      <div>
                        <KeyDetailsList
                          title="Overview"
                          items={selectedArtifact.systemOverview}
                          bulletColor="bg-blue-400"
                          iconColor="text-blue-400"
                        />
                  </div>
                    )}

                    {/* Laws & Principles Section */}
                    {selectedArtifact.lawsAndPrinciples && selectedArtifact.lawsAndPrinciples.length > 0 && (
              <div>
                        <h3 className="text-2xl font-bold text-white mb-4">Laws & Principles</h3>
                        <p className="text-gray-400 mb-4">
                          48 Laws of Power and Bible Laws applied to {selectedArtifact.name.replace(' System', '').toLowerCase()}
                        </p>
                        <div className="space-y-4">
                          {selectedArtifact.lawsAndPrinciples.map((law, idx) => (
                            <div key={idx} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                              <h4 className="text-lg font-semibold text-white mb-2">{law.title}</h4>
                              <p className="text-gray-300 text-sm mb-3">{law.description}</p>
                              {law.items && law.items.length > 0 && (
                                <KeyDetailsList
                                  items={law.items}
                                  hideTitle
                                  compact
                                  bulletColor="bg-blue-400"
                                  contentClassName=""
                                />
                              )}
                  </div>
                          ))}
                  </div>
                  </div>
                    )}

                    {/* Frameworks Section */}
                    {selectedArtifact.frameworks && selectedArtifact.frameworks.length > 0 && (
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-4">Financial Frameworks</h3>
                        <p className="text-gray-400 mb-4">
                          Strategic frameworks for {selectedArtifact.name.replace(' System', '').toLowerCase()} decision-making
                        </p>
                        <div className="space-y-4">
                          {selectedArtifact.frameworks.map((framework, idx) => (
                            <div key={idx} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                              <h4 className="text-lg font-semibold text-white mb-2">{framework.title}</h4>
                              <p className="text-gray-300 text-sm mb-3">{framework.description}</p>
                              {framework.items && framework.items.length > 0 && (
                                <ul className="space-y-1 pl-4">
                                  {framework.items.map((item, i) => (
                                    <li key={i} className="text-gray-400 text-sm flex items-start gap-2">
                                      <span className="text-green-400 mt-1">•</span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                  </div>
                          ))}
                </div>
              </div>
                    )}

                    {/* Knowledge Base Section */}
                    {selectedArtifact.knowledgeBase && (
              <div>
                        <h3 className="text-2xl font-bold text-white mb-4">Knowledge Base</h3>
                        <div className="bg-gray-700/50 rounded-lg p-4">
                          <p className="text-gray-300">{selectedArtifact.knowledgeBase}</p>
                  </div>
                  </div>
                    )}

                    {/* Key Features Section */}
                    {selectedArtifact.keyFeatures && selectedArtifact.keyFeatures.length > 0 && (
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-4">Key Features</h3>
                        <div className="space-y-4">
                          {selectedArtifact.keyFeatures.map((feature, idx) => (
                            <div key={idx} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                              <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
                              <p className="text-gray-300 text-sm">{feature.description}</p>
                </div>
                          ))}
              </div>
                      </div>
                    )}

                    {/* Read-Only Reference Notice for Systems */}
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                          <p className="text-blue-300 text-sm font-medium mb-1">
                            Read-Only Reference
                          </p>
                          <p className="text-blue-200/80 text-sm">
                            All content is read-only knowledge base material. No state changes, no consequences, safe exploration.
                          </p>
                  </div>
                  </div>
                  </div>
                  </>
                ) : (
                  <>
                    {/* Category Description */}
                    <div className={`p-4 rounded-lg border ${
                      getArtifactCategoryMetadata(selectedArtifact.category).color.bg
                    } ${getArtifactCategoryMetadata(selectedArtifact.category).color.border}`}>
                      <h3 className={`text-sm font-semibold mb-2 ${
                        getArtifactCategoryMetadata(selectedArtifact.category).color.text
                      }`}>
                        About {getArtifactCategoryLabel(selectedArtifact.category)}
                      </h3>
                      <p className="text-gray-300 text-sm">
                        {getArtifactCategoryDescription(selectedArtifact.category)}
                      </p>
                </div>

                    {/* Law Template Fields */}
                    {selectedArtifact.category === ArtifactCategory.LAW && selectedArtifact.metadata && (
                      <>
                        {selectedArtifact.metadata.derivedFrom && Array.isArray(selectedArtifact.metadata.derivedFrom) && selectedArtifact.metadata.derivedFrom.length > 0 && (
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-3">Derived From</h3>
                            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                              <div className="flex flex-wrap gap-2">
                                {selectedArtifact.metadata.derivedFrom.map((constraint: string, idx: number) => (
                                  <span key={idx} className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded border border-purple-500/30 text-sm font-medium">
                                    {constraint}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        {selectedArtifact.metadata.statement && (
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-3">Statement</h3>
                            <p className="text-gray-300 leading-relaxed bg-gray-700/50 rounded-lg p-4">{selectedArtifact.metadata.statement}</p>
                          </div>
                        )}
                        {selectedArtifact.metadata.recursiveBehavior && (
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-3">Recursive Behavior</h3>
                            <p className="text-gray-300 leading-relaxed bg-gray-700/50 rounded-lg p-4">{selectedArtifact.metadata.recursiveBehavior}</p>
                          </div>
                        )}
                        {selectedArtifact.metadata.violationOutcome && (
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-3">Violation Outcome</h3>
                            <p className="text-gray-300 leading-relaxed bg-red-500/10 border border-red-500/30 rounded-lg p-4">{selectedArtifact.metadata.violationOutcome}</p>
                          </div>
                        )}
                        {selectedArtifact.metadata.whyThisLawPersists && (
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-3">Why This Law Persists</h3>
                            <p className="text-gray-300 leading-relaxed bg-gray-700/50 rounded-lg p-4">{selectedArtifact.metadata.whyThisLawPersists}</p>
                          </div>
                        )}
                      </>
                    )}

                    {/* Principle Template Fields */}
                    {selectedArtifact.category === ArtifactCategory.PRINCIPLE && selectedArtifact.metadata && (
                      <>
                        {selectedArtifact.metadata.alignedWith && Array.isArray(selectedArtifact.metadata.alignedWith) && selectedArtifact.metadata.alignedWith.length > 0 && (
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-3">Aligned With</h3>
                            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                              <div className="flex flex-wrap gap-2">
                                {selectedArtifact.metadata.alignedWith.map((law: string, idx: number) => (
                                  <span key={idx} className="px-3 py-1.5 bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30 text-sm font-medium">
                                    {law}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        {selectedArtifact.metadata.principle && (
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-3">Principle</h3>
                            <p className="text-gray-300 leading-relaxed bg-gray-700/50 rounded-lg p-4">{selectedArtifact.metadata.principle}</p>
                          </div>
                        )}
                        {selectedArtifact.metadata.whyItWorks && (
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-3">Why It Works</h3>
                            <p className="text-gray-300 leading-relaxed bg-gray-700/50 rounded-lg p-4">{selectedArtifact.metadata.whyItWorks}</p>
                          </div>
                        )}
                        {selectedArtifact.metadata.violationPattern && (
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-3">Violation Pattern</h3>
                            <p className="text-gray-300 leading-relaxed bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">{selectedArtifact.metadata.violationPattern}</p>
                          </div>
                        )}
                        {selectedArtifact.metadata.predictableResult && (
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-3">Predictable Result of Violation</h3>
                            <p className="text-gray-300 leading-relaxed bg-red-500/10 border border-red-500/30 rounded-lg p-4">{selectedArtifact.metadata.predictableResult}</p>
                          </div>
                        )}
                      </>
                    )}

                    {/* Framework Template Fields */}
                    {selectedArtifact.category === ArtifactCategory.FRAMEWORK && selectedArtifact.metadata && (
                      <>
                        {selectedArtifact.metadata.basedOn && Array.isArray(selectedArtifact.metadata.basedOn) && selectedArtifact.metadata.basedOn.length > 0 && (
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-3">Based On</h3>
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                              <div className="flex flex-wrap gap-2">
                                {selectedArtifact.metadata.basedOn.map((principle: string, idx: number) => (
                                  <span key={idx} className="px-3 py-1.5 bg-green-500/20 text-green-300 rounded border border-green-500/30 text-sm font-medium">
                                    {principle}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        {selectedArtifact.metadata.purpose && (
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-3">Purpose</h3>
                            <p className="text-gray-300 leading-relaxed bg-gray-700/50 rounded-lg p-4">{selectedArtifact.metadata.purpose}</p>
                          </div>
                        )}
                        {selectedArtifact.metadata.structure && (
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-3">Structure</h3>
                            <div className="text-gray-300 leading-relaxed bg-gray-700/50 rounded-lg p-4 whitespace-pre-line">{selectedArtifact.metadata.structure}</div>
                          </div>
                        )}
                        {selectedArtifact.metadata.whenToUse && (
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-3">When to Use</h3>
                            <p className="text-gray-300 leading-relaxed bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">{selectedArtifact.metadata.whenToUse}</p>
                          </div>
                        )}
                        {selectedArtifact.metadata.whenNotToUse && (
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-3">When Not to Use</h3>
                            <p className="text-gray-300 leading-relaxed bg-red-500/10 border border-red-500/30 rounded-lg p-4">{selectedArtifact.metadata.whenNotToUse}</p>
                          </div>
                        )}
                      </>
                    )}

                    {/* Knowledge Template: 1. Definition  2. Insights (max 3)  3. How to apply in reality  4. Risks */}
                    {selectedArtifact.category === ArtifactCategory.KNOWLEDGE && selectedArtifact.metadata && (
                      <>
                        {selectedArtifact.metadata.definition && (
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-3">1. Definition</h3>
                            <p className="text-gray-300 leading-relaxed bg-gray-700/50 rounded-lg p-4">{String(selectedArtifact.metadata.definition)}</p>
                          </div>
                        )}
                        {(() => {
                          const insights: string[] = Array.isArray(selectedArtifact.metadata.insights)
                            ? selectedArtifact.metadata.insights.slice(0, 3)
                            : selectedArtifact.metadata.keyInsight
                              ? [String(selectedArtifact.metadata.keyInsight)]
                              : []
                          return insights.length > 0 ? (
                            <div>
                              <h3 className="text-xl font-semibold text-white mb-3">2. Insights</h3>
                              <ul className="list-disc list-inside space-y-2 text-gray-300 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                                {insights.map((insight, idx) => (
                                  <li key={idx} className="leading-relaxed">{String(insight)}</li>
                                ))}
                              </ul>
                            </div>
                          ) : null
                        })()}
                        {(selectedArtifact.metadata.howToApplyInReality ?? selectedArtifact.metadata.practicalApplication) && (
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-3">3. How to apply in reality</h3>
                            <p className="text-gray-300 leading-relaxed bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                              {String(selectedArtifact.metadata.howToApplyInReality ?? selectedArtifact.metadata.practicalApplication)}
                            </p>
                          </div>
                        )}
                        {(selectedArtifact.metadata.risks ?? selectedArtifact.metadata.keyRisks) && (
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-3">4. Risks</h3>
                            <p className="text-gray-300 leading-relaxed bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                              {String(selectedArtifact.metadata.risks ?? selectedArtifact.metadata.keyRisks)}
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {/* Details Section */}
                    {selectedArtifact.details && selectedArtifact.details.length > 0 && (
                      <div>
                        <KeyDetailsList
                          title="Key Details"
                          items={selectedArtifact.details}
                          bulletColor={getArtifactCategoryMetadata(selectedArtifact.category).color.bg.replace('/10', '')}
                        />
                      </div>
                    )}

                    {/* Real-World Examples Section */}
                    {selectedArtifact.examples && selectedArtifact.examples.length > 0 && (
                      <div>
                        <KeyDetailsList
                          title="Real-World Examples"
                          items={selectedArtifact.examples}
                          icon={Lightbulb}
                          iconColor="text-yellow-400"
                          bulletColor="bg-yellow-400"
                          contentClassName="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4"
                        />
                        <p className="text-yellow-200/90 text-sm mt-2">
                          Practical examples to help you take action.
                        </p>
                      </div>
                    )}

                    {/* Related Artifacts Section */}
                    {getReferencedArtifacts(selectedArtifact).length > 0 && (
              <div>
                        <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                          <Network className="w-5 h-5 text-purple-400" />
                          Related Artifacts
                </h3>
                        <p className="text-gray-400 text-sm mb-4">
                          Explore these related artifacts to deepen your understanding:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {getReferencedArtifacts(selectedArtifact).map((refArtifact) => {
                            const RefIcon = refArtifact.icon
                            const categoryMeta = getArtifactCategoryMetadata(refArtifact.category)
                            return (
                              <button
                                key={refArtifact.id}
                                onClick={() => setSelectedArtifact(refArtifact)}
                                className="bg-gray-700/50 hover:bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-purple-500/50 transition-all text-left group"
                              >
                                <div className="flex items-center gap-3 mb-2">
                                  <div className={`p-2 rounded-lg ${categoryMeta.color.bg}`}>
                                    <RefIcon className={`w-4 h-4 ${categoryMeta.color.text}`} />
                  </div>
                                  <ArtifactCategoryTag category={refArtifact.category} size="sm" />
                  </div>
                                <h4 className="text-white font-semibold mb-1 group-hover:text-purple-300 transition-colors">
                                  {refArtifact.name}
                                </h4>
                                <p className="text-gray-400 text-xs line-clamp-2">
                                  {refArtifact.description}
                                </p>
                              </button>
                            )
                          })}
                  </div>
                  </div>
                    )}

                    {/* Tags Section */}
                    {selectedArtifact.tags && selectedArtifact.tags.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedArtifact.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded-full border border-gray-600"
                            >
                              {tag}
                            </span>
                          ))}
                  </div>
                </div>
                    )}

                    {/* Read-Only Notice */}
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-blue-300 text-sm font-medium mb-1">
                            Read-Only View
                          </p>
                          <p className="text-blue-200/80 text-sm">
                            This is an informational artifact. To interact with or manage this {getArtifactCategoryLabel(selectedArtifact.category).toLowerCase()}, navigate to the relevant system from the main navigation.
                          </p>
              </div>
            </div>
              </div>
                  </>
        )}
      </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-700 flex justify-end">
                <button
                  onClick={() => setSelectedArtifact(null)}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
