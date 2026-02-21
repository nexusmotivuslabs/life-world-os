/**
 * Context → Actions Engine: rule-based candidate generation + scoring.
 * Returns top 3 actions. No LLM. Weights adapt from feedback (completion rate, recency, etc.).
 */

import type { ContextEventPayload } from '../types.js'

export interface ActionCandidate {
  id: string
  slug: string
  label: string
  explanationShort: string | null
  score: number
  scoreBreakdown?: { context: number; successRate: number; recencyPenalty: number; urgency: number }
}

export interface ActionDefinitionInput {
  id: string
  slug: string
  label: string
  explanationShort: string | null
  goalCategories: string[]
  energyLevelMin: string
  timeMinutesMax: number
  locationTypes: string[]
  mobileFriendly: boolean
  urgencyWeight: number
}

export interface UserActionStats {
  actionId: string
  showCount: number
  chosenCount: number
  completedCount: number
  dismissedCount: number
  lastShownAt: Date | null
  lastCompletedAt: Date | null
}

const ENERGY_ORDER = ['low', 'medium', 'high'] as const
const TIME_OPTIONS = [5, 15, 30, 60, 120] as const

function energyLevelOk(actionMin: string, contextEnergy: string): boolean {
  const a = ENERGY_ORDER.indexOf(actionMin as typeof ENERGY_ORDER[number])
  const c = ENERGY_ORDER.indexOf(contextEnergy as typeof ENERGY_ORDER[number])
  if (a === -1 || c === -1) return true
  return c >= a
}

function timeOk(actionTimeMax: number, contextTime: number): boolean {
  return contextTime >= actionTimeMax || contextTime >= 15 // if user chose 5 or 15, still allow short actions
}

function locationOk(actionLocations: string[], contextLocation: string): boolean {
  if (!contextLocation || actionLocations.length === 0) return true
  return actionLocations.includes(contextLocation)
}

function goalMatch(actionGoals: string[], contextGoal: string): number {
  if (!contextGoal || actionGoals.length === 0) return 0.5
  return actionGoals.includes(contextGoal) ? 1 : 0.3
}

/**
 * Step 1: Candidate generation. Rules exclude ineligible actions.
 */
export function generateCandidates(
  actions: ActionDefinitionInput[],
  context: ContextEventPayload
): ActionDefinitionInput[] {
  const timeAvailable = context.timeAvailable ?? 15
  const energy = context.energy ?? 'medium'
  const locationType = context.locationType ?? 'home'

  return actions.filter((a) => {
    if (timeAvailable < 15 && a.timeMinutesMax > 15) return false
    if (energy === 'low' && a.energyLevelMin === 'high') return false
    if (locationType === 'commute' && !a.mobileFriendly) return false
    if (!timeOk(a.timeMinutesMax, timeAvailable)) return false
    if (!energyLevelOk(a.energyLevelMin, energy)) return false
    if (!locationOk(a.locationTypes, locationType)) return false
    return true
  })
}

/**
 * Step 2: Score each candidate. Context match + past success (EMA) + recency penalty + urgency multiplier.
 */
export function scoreCandidate(
  action: ActionDefinitionInput,
  context: ContextEventPayload,
  stats: UserActionStats | null
): { score: number; breakdown: { context: number; successRate: number; recencyPenalty: number; urgency: number } } {
  const goal = context.goal ?? ''
  const urgency = context.urgency ?? 'this_week'
  const mood = context.mood ?? 'neutral'

  const contextScore = goalMatch(action.goalCategories, goal) * 0.4 +
    (action.mobileFriendly && context.locationType === 'commute' ? 0.2 : 0.1) +
    (mood === 'blocked' && action.energyLevelMin === 'low' ? 0.2 : 0.1)

  let successRate = 0.5
  if (stats && stats.chosenCount + stats.dismissedCount > 0) {
    successRate = stats.completedCount / Math.max(1, stats.chosenCount)
  } else if (stats && stats.showCount > 0) {
    successRate = 0.5 - (stats.dismissedCount / stats.showCount) * 0.3
  }

  let recencyPenalty = 0
  if (stats?.lastShownAt) {
    const hoursSince = (Date.now() - stats.lastShownAt.getTime()) / (1000 * 60 * 60)
    if (hoursSince < 24) recencyPenalty = -0.2
    else if (hoursSince < 72) recencyPenalty = -0.1
  }

  const urgencyMultiplier = urgency === 'today' ? (action.urgencyWeight || 1) * 0.2 : urgency === 'this_week' ? 0.1 : 0

  const score =
    Math.min(1, contextScore) * 0.5 +
    successRate * 0.35 +
    recencyPenalty +
    urgencyMultiplier

  return {
    score: Math.max(0, score),
    breakdown: {
      context: contextScore,
      successRate,
      recencyPenalty,
      urgency: urgencyMultiplier,
    },
  }
}

/**
 * Return top 3 actions with short explanations. Engine does not invent actions.
 */
export function getTopActions(
  actions: ActionDefinitionInput[],
  context: ContextEventPayload,
  getStats: (actionId: string) => UserActionStats | null
): ActionCandidate[] {
  const candidates = generateCandidates(actions, context)
  const scored = candidates.map((action) => {
    const { score, breakdown } = scoreCandidate(action, context, getStats(action.id))
    return {
      ...action,
      score,
      scoreBreakdown: breakdown,
    }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, 3).map(({ scoreBreakdown, ...a }) => ({
    id: a.id,
    slug: a.slug,
    label: a.label,
    explanationShort: a.explanationShort,
    score: Math.round(a.score * 100) / 100,
    scoreBreakdown: scoreBreakdown!,
  }))
}
