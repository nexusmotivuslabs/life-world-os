/**
 * Context → Actions: natural language or dropdowns → top 3 actions + feedback.
 * LLM parses free-text into context; same decision engine and feedback loop.
 */

import { useState, useCallback } from 'react'
import { contextActionsApi, type ContextEventPayload, type RecommendedAction, type FeedbackOutcome } from '../services/contextActionsApi'
import Layout from '../components/Layout'

const GOAL_OPTIONS = [
  { value: '', label: '— Goal —' },
  { value: 'focus', label: 'Focus' },
  { value: 'recovery', label: 'Recovery' },
  { value: 'finance', label: 'Finance' },
  { value: 'travel_planning', label: 'Travel planning' },
  { value: 'learning', label: 'Learning' },
]
const ENERGY_OPTIONS = [
  { value: '', label: '— Energy —' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]
const TIME_OPTIONS = [
  { value: '', label: '— Time —' },
  { value: '5', label: '5 min' },
  { value: '15', label: '15 min' },
  { value: '30', label: '30 min' },
  { value: '60', label: '60 min' },
  { value: '120', label: '2 hr' },
]
const LOCATION_OPTIONS = [
  { value: '', label: '— Location —' },
  { value: 'home', label: 'Home' },
  { value: 'office', label: 'Office' },
  { value: 'commute', label: 'Commute' },
  { value: 'outside', label: 'Outside' },
]
const URGENCY_OPTIONS = [
  { value: '', label: '— Urgency —' },
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This week' },
  { value: 'this_month', label: 'This month' },
]
const MOOD_OPTIONS = [
  { value: '', label: '— Mood —' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'motivated', label: 'Motivated' },
]
const RISK_OPTIONS = [
  { value: '', label: '— Risk —' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

function buildPayload(form: Record<string, string>): ContextEventPayload {
  const time = form.timeAvailable ? parseInt(form.timeAvailable, 10) : undefined
  return {
    goal: form.goal || undefined,
    energy: form.energy || undefined,
    timeAvailable: Number.isFinite(time) ? time : undefined,
    locationType: form.locationType || undefined,
    urgency: form.urgency || undefined,
    mood: form.mood || undefined,
    riskTolerance: form.riskTolerance || undefined,
    budget: form.budget || undefined,
    socialContext: form.socialContext || undefined,
  }
}

function formatExtractedContext(ctx: ContextEventPayload): string {
  const parts: string[] = []
  if (ctx.goal) parts.push(`goal: ${ctx.goal}`)
  if (ctx.energy) parts.push(`energy: ${ctx.energy}`)
  if (ctx.timeAvailable) parts.push(`time: ${ctx.timeAvailable} min`)
  if (ctx.locationType) parts.push(`location: ${ctx.locationType}`)
  if (ctx.urgency) parts.push(`urgency: ${ctx.urgency}`)
  if (ctx.mood) parts.push(`mood: ${ctx.mood}`)
  if (ctx.riskTolerance) parts.push(`risk: ${ctx.riskTolerance}`)
  if (ctx.budget) parts.push(`budget: ${ctx.budget}`)
  if (ctx.socialContext) parts.push(`social: ${ctx.socialContext}`)
  return parts.length ? parts.join(', ') : 'No context extracted'
}

export default function ContextActionsPage() {
  const [form, setForm] = useState<Record<string, string>>({})
  const [textInput, setTextInput] = useState('')
  const [actions, setActions] = useState<RecommendedAction[]>([])
  const [extractedContext, setExtractedContext] = useState<ContextEventPayload | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedbackSending, setFeedbackSending] = useState<Set<string>>(new Set())
  const sessionId = useState(() => `session-${Date.now()}`)[0]

  const updateForm = useCallback((key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleGetActionsFromInput = useCallback(async () => {
    setError(null)
    setExtractedContext(null)
    setLoading(true)
    try {
      const { extractedContext: ctx, actions: top } = await contextActionsApi.recommendFromInput(textInput, sessionId)
      setExtractedContext(ctx)
      setActions(top)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to parse and get recommendations.')
      setActions([])
    } finally {
      setLoading(false)
    }
  }, [textInput, sessionId])

  const handleGetActions = useCallback(async () => {
    setError(null)
    setExtractedContext(null)
    setLoading(true)
    try {
      const payload = buildPayload(form)
      if (!payload.goal && !payload.energy && !payload.timeAvailable && !payload.locationType) {
        setError('Set at least one context (e.g. goal, energy, time) so we can recommend actions.')
        setLoading(false)
        return
      }
      await contextActionsApi.postEvent(payload, sessionId)
      const { actions: top } = await contextActionsApi.recommend(payload, sessionId)
      setActions(top)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to get recommendations.')
      setActions([])
    } finally {
      setLoading(false)
    }
  }, [form, sessionId])

  const sendFeedback = useCallback(
    async (actionId: string, outcome: FeedbackOutcome) => {
      setFeedbackSending((prev) => new Set(prev).add(actionId))
      try {
        await contextActionsApi.postFeedback(actionId, outcome, { sessionId })
        setActions((prev) => prev.filter((a) => a.id !== actionId))
      } catch {
        // keep action visible on error
      } finally {
        setFeedbackSending((prev) => {
          const next = new Set(prev)
          next.delete(actionId)
          return next
        })
      }
    },
    [sessionId]
  )

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-semibold text-white mb-2">Context → Actions</h1>
        <p className="text-gray-400 text-sm mb-4">
          Describe your situation in words or set context with dropdowns. We recommend up to 3 actions. Mark chosen, completed, or dismissed so recommendations improve over time.
        </p>

        {/* LLM: free-text input */}
        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-medium mb-2">Describe your situation</label>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="e.g. I'm tired, at home, have 15 minutes, need to do something for my visa"
            rows={3}
            className="w-full bg-gray-800 border border-gray-600 rounded-md text-white text-sm px-3 py-2 placeholder-gray-500 resize-y"
          />
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={handleGetActionsFromInput}
              disabled={loading || !textInput.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-md text-sm font-medium"
            >
              {loading ? 'Getting actions…' : 'Get actions from description'}
            </button>
          </div>
          {extractedContext && (
            <p className="text-gray-400 text-xs mt-2">
              We understood: {formatExtractedContext(extractedContext)}
            </p>
          )}
        </div>

        <p className="text-gray-500 text-sm mb-3">Or set context manually:</p>
        {/* Required context */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <select
            value={form.goal ?? ''}
            onChange={(e) => updateForm('goal', e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-md text-white text-sm px-3 py-2"
          >
            {GOAL_OPTIONS.map((o) => (
              <option key={o.value || 'empty'} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            value={form.energy ?? ''}
            onChange={(e) => updateForm('energy', e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-md text-white text-sm px-3 py-2"
          >
            {ENERGY_OPTIONS.map((o) => (
              <option key={o.value || 'empty'} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            value={form.timeAvailable ?? ''}
            onChange={(e) => updateForm('timeAvailable', e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-md text-white text-sm px-3 py-2"
          >
            {TIME_OPTIONS.map((o) => (
              <option key={o.value || 'empty'} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            value={form.locationType ?? ''}
            onChange={(e) => updateForm('locationType', e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-md text-white text-sm px-3 py-2"
          >
            {LOCATION_OPTIONS.map((o) => (
              <option key={o.value || 'empty'} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            value={form.urgency ?? ''}
            onChange={(e) => updateForm('urgency', e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-md text-white text-sm px-3 py-2"
          >
            {URGENCY_OPTIONS.map((o) => (
              <option key={o.value || 'empty'} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            value={form.mood ?? ''}
            onChange={(e) => updateForm('mood', e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-md text-white text-sm px-3 py-2"
          >
            {MOOD_OPTIONS.map((o) => (
              <option key={o.value || 'empty'} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            value={form.riskTolerance ?? ''}
            onChange={(e) => updateForm('riskTolerance', e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-md text-white text-sm px-3 py-2"
          >
            {RISK_OPTIONS.map((o) => (
              <option key={o.value || 'empty'} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={handleGetActions}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-md text-sm font-medium"
          >
            {loading ? 'Getting actions…' : 'Get actions'}
          </button>
        </div>

        {error && (
          <p className="text-amber-400 text-sm mb-4">{error}</p>
        )}

        {/* Top 3 actions */}
        <div className="space-y-3">
          {actions.length === 0 && !loading && (
            <p className="text-gray-500 text-sm">Set context and click “Get actions” to see up to 3 recommendations.</p>
          )}
          {actions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              onFeedback={sendFeedback}
              sending={feedbackSending.has(action.id)}
            />
          ))}
        </div>
      </div>
    </Layout>
  )
}

function ActionCard({
  action,
  onFeedback,
  sending,
}: {
  action: RecommendedAction
  onFeedback: (actionId: string, outcome: FeedbackOutcome) => void
  sending: boolean
}) {
  return (
    <div className="bg-gray-800/80 border border-gray-600 rounded-lg p-4">
      <p className="text-white font-medium">{action.label}</p>
      {action.explanation && (
        <p className="text-gray-400 text-sm mt-1">{action.explanation}</p>
      )}
      <div className="flex flex-wrap gap-2 mt-3">
        <button
          type="button"
          onClick={() => onFeedback(action.id, 'CHOSEN')}
          disabled={sending}
          className="px-3 py-1.5 bg-emerald-700/80 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs rounded"
        >
          Chosen
        </button>
        <button
          type="button"
          onClick={() => onFeedback(action.id, 'COMPLETED')}
          disabled={sending}
          className="px-3 py-1.5 bg-blue-700/80 hover:bg-blue-600 disabled:opacity-50 text-white text-xs rounded"
        >
          Completed
        </button>
        <button
          type="button"
          onClick={() => onFeedback(action.id, 'DISMISSED')}
          disabled={sending}
          className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 text-white text-xs rounded"
        >
          Dismissed
        </button>
      </div>
    </div>
  )
}
