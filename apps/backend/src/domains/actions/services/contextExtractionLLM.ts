/**
 * LLM-backed extraction of structured context from free-text user input.
 * Returns ContextEventPayload for the existing decision engine (same as dropdowns).
 */

import type { ContextEventPayload } from '../types.js'
import {
  CONTEXT_GOALS,
  CONTEXT_ENERGY,
  CONTEXT_TIME,
  CONTEXT_LOCATION,
  CONTEXT_URGENCY,
  CONTEXT_MOOD,
  CONTEXT_RISK,
  CONTEXT_BUDGET,
  CONTEXT_SOCIAL,
} from '../types.js'

const ALLOWED_GOALS = CONTEXT_GOALS.join(', ')
const ALLOWED_ENERGY = CONTEXT_ENERGY.join(', ')
const ALLOWED_TIME = CONTEXT_TIME.join(', ')
const ALLOWED_LOCATION = CONTEXT_LOCATION.join(', ')
const ALLOWED_URGENCY = CONTEXT_URGENCY.join(', ')
const ALLOWED_MOOD = CONTEXT_MOOD.join(', ')
const ALLOWED_RISK = CONTEXT_RISK.join(', ')
const ALLOWED_BUDGET = CONTEXT_BUDGET.join(', ')
const ALLOWED_SOCIAL = CONTEXT_SOCIAL.join(', ')

const SYSTEM_PROMPT = `You are a context extractor for an action recommender. The user describes their situation in free text. Your job is to output a single JSON object with only these keys, using ONLY the allowed values below. Omit any key you cannot infer; use null or omit for unknown. Output nothing but the JSON object (no markdown, no explanation).

Allowed values:
- goal: one of [${ALLOWED_GOALS}]
- energy: one of [${ALLOWED_ENERGY}]
- timeAvailable: one number from [${CONTEXT_TIME.join(', ')}] (minutes)
- locationType: one of [${ALLOWED_LOCATION}]
- urgency: one of [${ALLOWED_URGENCY}]
- mood: one of [${ALLOWED_MOOD}]
- riskTolerance: one of [${ALLOWED_RISK}]
- budget: one of [${ALLOWED_BUDGET}] (optional)
- socialContext: one of [${ALLOWED_SOCIAL}] (optional)

Example output: {"goal":"focus","energy":"medium","timeAvailable":15,"locationType":"home","urgency":"this_week","mood":"neutral"}`

export interface LLMAdapter {
  generateResponse(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<{ content: string }>
}

async function getAdapter(): Promise<LLMAdapter | null> {
  if (process.env.OLLAMA_URL) {
    const { OllamaLMAdapter } = await import('../../money/infrastructure/adapters/llm/OllamaLMAdapter.js')
    const url = process.env.OLLAMA_URL || 'http://localhost:11434'
    const model = process.env.OLLAMA_MODEL || 'deepseek-r1:1.5b'
    return new OllamaLMAdapter(url, model)
  }
  if (process.env.GROQ_API_KEY) {
    const { GroqLMAdapter } = await import('../../travel/infrastructure/adapters/llm/GroqLMAdapter.js')
    return new GroqLMAdapter(process.env.GROQ_API_KEY)
  }
  return null
}

function parseJsonFromResponse(content: string): Record<string, unknown> {
  const trimmed = content.trim()
  const codeBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  const raw = codeBlock ? codeBlock[1].trim() : trimmed
  return JSON.parse(raw) as Record<string, unknown>
}

function normalizePayload(raw: Record<string, unknown>): ContextEventPayload {
  const set = <T extends string>(arr: readonly T[], v: unknown): T | undefined =>
    typeof v === 'string' && arr.includes(v as T) ? (v as T) : undefined
  const num = (v: unknown): number | undefined =>
    typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' ? parseInt(v, 10) : undefined

  const time = num(raw.timeAvailable)
  const timeOk = time !== undefined && CONTEXT_TIME.includes(time as (typeof CONTEXT_TIME)[number])

  return {
    goal: set(CONTEXT_GOALS, raw.goal),
    energy: set(CONTEXT_ENERGY, raw.energy),
    timeAvailable: timeOk ? time : undefined,
    locationType: set(CONTEXT_LOCATION, raw.locationType),
    urgency: set(CONTEXT_URGENCY, raw.urgency),
    mood: set(CONTEXT_MOOD, raw.mood),
    riskTolerance: set(CONTEXT_RISK, raw.riskTolerance),
    budget: set(CONTEXT_BUDGET, raw.budget),
    socialContext: set(CONTEXT_SOCIAL, raw.socialContext),
  }
}

/**
 * Extract structured context from free-text user input using the configured LLM.
 * Returns a payload suitable for the decision engine; may be partial.
 */
export async function extractContextFromInput(userInput: string): Promise<ContextEventPayload> {
  const adapter = await getAdapter()
  if (!adapter) {
    throw new Error(
      'No LLM configured. Set OLLAMA_URL (and run Ollama) or GROQ_API_KEY to use natural language input.'
    )
  }

  const messages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    { role: 'user' as const, content: userInput },
  ]

  const response = await adapter.generateResponse(messages, {
    temperature: 0.2,
    maxTokens: 512,
  })

  const raw = parseJsonFromResponse(response.content)
  return normalizePayload(raw)
}
