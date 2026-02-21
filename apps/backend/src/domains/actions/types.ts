/**
 * Context → Actions Engine: event and context types.
 */

export interface ContextEventPayload {
  goal?: string           // focus, recovery, finance, travel_planning, learning
  energy?: string         // low, medium, high
  timeAvailable?: number  // 5, 15, 30, 60, 120
  locationType?: string  // home, office, commute, outside
  urgency?: string        // today, this_week, this_month
  mood?: string          // blocked, neutral, motivated
  riskTolerance?: string // low, medium, high
  budget?: string        // low, medium, high (optional)
  socialContext?: string // alone, family, with_others (optional)
}

export const CONTEXT_GOALS = ['focus', 'recovery', 'finance', 'travel_planning', 'learning'] as const
export const CONTEXT_ENERGY = ['low', 'medium', 'high'] as const
export const CONTEXT_TIME = [5, 15, 30, 60, 120] as const
export const CONTEXT_LOCATION = ['home', 'office', 'commute', 'outside'] as const
export const CONTEXT_URGENCY = ['today', 'this_week', 'this_month'] as const
export const CONTEXT_MOOD = ['blocked', 'neutral', 'motivated'] as const
export const CONTEXT_RISK = ['low', 'medium', 'high'] as const
export const CONTEXT_BUDGET = ['low', 'medium', 'high'] as const
export const CONTEXT_SOCIAL = ['alone', 'family', 'with_others'] as const
