/**
 * Context → Actions Engine: events, recommend, feedback, metrics.
 * Uses shared request() which sends Bearer token from localStorage.
 */

import { request } from './api'

export interface ContextEventPayload {
  goal?: string
  energy?: string
  timeAvailable?: number
  locationType?: string
  urgency?: string
  mood?: string
  riskTolerance?: string
  budget?: string
  socialContext?: string
}

export interface RecommendedAction {
  id: string
  slug: string
  label: string
  explanation: string | null
}

export type FeedbackOutcome = 'CHOSEN' | 'COMPLETED' | 'DISMISSED'

const BASE = '/api/context-actions'

export const contextActionsApi = {
  /** Ingest dropdown selections as context. */
  postEvent: (payload: ContextEventPayload, sessionId?: string) =>
    request<{ id: string; createdAt: string }>(`${BASE}/events`, {
      method: 'POST',
      body: JSON.stringify({ payload, sessionId }),
    }),

  /** Get top 3 recommended actions. Pass context or omit to use latest event. */
  recommend: (context?: ContextEventPayload, sessionId?: string) =>
    request<{ actions: RecommendedAction[] }>(`${BASE}/actions/recommend`, {
      method: 'POST',
      body: JSON.stringify({ context, sessionId }),
    }),

  /** LLM: parse free-text input into context and return extracted context + top 3 actions. */
  recommendFromInput: (input: string, sessionId?: string) =>
    request<{ extractedContext: ContextEventPayload; actions: RecommendedAction[] }>(
      `${BASE}/actions/recommend-from-input`,
      {
        method: 'POST',
        body: JSON.stringify({ input: input.trim(), sessionId }),
      }
    ),

  /** Send feedback for an action (chosen, completed, dismissed). */
  postFeedback: (
    actionId: string,
    outcome: FeedbackOutcome,
    opts?: { sessionId?: string; timeToStartSeconds?: number; timeToCompleteSeconds?: number; rating?: number }
  ) =>
    request<{ id: string }>(`${BASE}/actions/${actionId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ outcome, ...opts }),
    }),

  /** Metrics: completion rate, dismiss rate, top actions, etc. */
  getMetrics: () =>
    request<{
      contextEventsCount: number
      feedbackCount: number
      completionRate: number
      dismissRate: number
      topActions: Array<{
        slug: string
        label: string
        chosen: number
        completed: number
        dismissed: number
        completionRate: number
        avgTimeToComplete: number | null
      }>
      avoidancePatterns: Array<{ actionSlug: string; at: string }>
    }>(`${BASE}/metrics`),
}
