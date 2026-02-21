/**
 * Context → Actions Engine: event ingestion, recommend, feedback, metrics.
 * Event model + decision engine. "API" is just how the frontend sends events.
 */

import { Router, Response } from 'express'
import { prisma } from '../../../lib/prisma.js'
import { authenticateToken, AuthRequest } from '../../../middleware/auth.js'
import { getTopActions } from '../services/actionsEngine.js'
import type { UserActionStats } from '../services/actionsEngine.js'
import { extractContextFromInput } from '../services/contextExtractionLLM.js'
import type { ContextEventPayload } from '../types.js'

const router = Router()
router.use(authenticateToken)

/**
 * POST /events
 * Ingest dropdown selections as context signals. Body: { sessionId?, payload: ContextEventPayload }
 */
router.post('/events', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const { sessionId, payload } = req.body || {}
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'payload object is required' })
    }
    const event = await prisma.contextEvent.create({
      data: {
        userId,
        sessionId: sessionId ?? null,
        payload: payload as object,
      },
    })
    res.status(201).json({ id: event.id, createdAt: event.createdAt })
  } catch (error: any) {
    console.error('Context event ingestion error:', error)
    res.status(500).json({ error: error.message || 'Failed to store event' })
  }
})

/**
 * POST /actions/recommend-from-input
 * Body: { input: string, sessionId? }. LLM parses user text into context, stores event, returns extracted context + top 3 actions.
 */
router.post('/actions/recommend-from-input', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const { input, sessionId } = req.body || {}
    const text = typeof input === 'string' ? input.trim() : ''
    if (!text) {
      return res.status(400).json({ error: 'input string is required (e.g. "I have 15 minutes at home, low energy, want to do something for my visa")' })
    }

    const extractedContext = await extractContextFromInput(text)

    await prisma.contextEvent.create({
      data: {
        userId,
        sessionId: sessionId ?? null,
        payload: extractedContext as object,
      },
    })

    const actions = await prisma.actionDefinition.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    })
    const actionInputs = actions.map((a) => ({
      id: a.id,
      slug: a.slug,
      label: a.label,
      explanationShort: a.explanationShort,
      goalCategories: a.goalCategories,
      energyLevelMin: a.energyLevelMin,
      timeMinutesMax: a.timeMinutesMax,
      locationTypes: a.locationTypes,
      mobileFriendly: a.mobileFriendly,
      urgencyWeight: a.urgencyWeight,
    }))
    const allFeedback = await prisma.actionFeedback.findMany({
      where: { userId },
      select: { actionDefinitionId: true, outcome: true, completedAt: true },
    })
    const getStats = (actionId: string): UserActionStats | null => {
      const forAction = allFeedback.filter((f) => f.actionDefinitionId === actionId)
      const chosenCount = forAction.filter((f) => f.outcome === 'CHOSEN').length
      const completedCount = forAction.filter((f) => f.outcome === 'COMPLETED').length
      const dismissedCount = forAction.filter((f) => f.outcome === 'DISMISSED').length
      const lastCompleted = forAction.filter((f) => f.completedAt).sort((a, b) => (b.completedAt!.getTime() - a.completedAt!.getTime()))[0]?.completedAt ?? null
      return {
        actionId,
        showCount: chosenCount + dismissedCount + completedCount,
        chosenCount,
        completedCount,
        dismissedCount,
        lastShownAt: null,
        lastCompletedAt: lastCompleted ?? null,
      }
    }
    const top = getTopActions(actionInputs, extractedContext, getStats)

    res.json({
      extractedContext: extractedContext,
      actions: top.map((a) => ({
        id: a.id,
        slug: a.slug,
        label: a.label,
        explanation: a.explanationShort,
      })),
    })
  } catch (error: any) {
    console.error('Recommend-from-input error:', error)
    const message = error?.message || 'Failed to parse input and recommend actions.'
    const isLLMNotConfigured = message.includes('No LLM configured')
    return res.status(isLLMNotConfigured ? 503 : 500).json({ error: message })
  }
})

/**
 * POST /actions/recommend
 * Body: { context: ContextEventPayload, sessionId? } or omit to use latest event.
 * Returns top 3 actions with short explanations.
 */
router.post('/actions/recommend', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const { context: bodyContext, sessionId } = req.body || {}

    let context: ContextEventPayload
    if (bodyContext && typeof bodyContext === 'object') {
      context = bodyContext as ContextEventPayload
    } else {
      const latest = await prisma.contextEvent.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      })
      if (!latest || !latest.payload) {
        return res.status(400).json({
          error: 'No context provided. Send { context: { goal, energy, timeAvailable, ... } } or set dropdowns and send an event first.',
        })
      }
      context = latest.payload as ContextEventPayload
    }

    const actions = await prisma.actionDefinition.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    })

    const actionInputs = actions.map((a) => ({
      id: a.id,
      slug: a.slug,
      label: a.label,
      explanationShort: a.explanationShort,
      goalCategories: a.goalCategories,
      energyLevelMin: a.energyLevelMin,
      timeMinutesMax: a.timeMinutesMax,
      locationTypes: a.locationTypes,
      mobileFriendly: a.mobileFriendly,
      urgencyWeight: a.urgencyWeight,
    }))

    const allFeedback = await prisma.actionFeedback.findMany({
      where: { userId },
      select: { actionDefinitionId: true, outcome: true, completedAt: true },
    })

    const getStats = (actionId: string): UserActionStats | null => {
      const forAction = allFeedback.filter((f) => f.actionDefinitionId === actionId)
      const chosenCount = forAction.filter((f) => f.outcome === 'CHOSEN').length
      const completedCount = forAction.filter((f) => f.outcome === 'COMPLETED').length
      const dismissedCount = forAction.filter((f) => f.outcome === 'DISMISSED').length
      const lastCompleted = forAction.filter((f) => f.completedAt).sort((a, b) => (b.completedAt!.getTime() - a.completedAt!.getTime()))[0]?.completedAt ?? null
      return {
        actionId,
        showCount: chosenCount + dismissedCount + completedCount,
        chosenCount,
        completedCount,
        dismissedCount,
        lastShownAt: null,
        lastCompletedAt: lastCompleted ?? null,
      }
    }

    const top = getTopActions(actionInputs, context, getStats)

    res.json({
      actions: top.map((a) => ({
        id: a.id,
        slug: a.slug,
        label: a.label,
        explanation: a.explanationShort,
      })),
    })
  } catch (error: any) {
    console.error('Recommend error:', error)
    res.status(500).json({ error: error.message || 'Failed to recommend actions' })
  }
})

/**
 * POST /actions/:id/feedback
 * Body: { outcome: 'CHOSEN' | 'COMPLETED' | 'DISMISSED', timeToStartSeconds?, timeToCompleteSeconds?, rating? }
 */
router.post('/actions/:id/feedback', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const actionId = req.params.id
    const { outcome, sessionId, timeToStartSeconds, timeToCompleteSeconds, rating } = req.body || {}

    if (!['CHOSEN', 'COMPLETED', 'DISMISSED'].includes(outcome)) {
      return res.status(400).json({ error: 'outcome must be CHOSEN, COMPLETED, or DISMISSED' })
    }

    const action = await prisma.actionDefinition.findUnique({
      where: { id: actionId },
    })
    if (!action) {
      return res.status(404).json({ error: 'Action not found' })
    }

    const feedback = await prisma.actionFeedback.create({
      data: {
        userId,
        actionDefinitionId: actionId,
        sessionId: sessionId ?? null,
        outcome,
        completedAt: outcome === 'COMPLETED' ? new Date() : null,
        dismissedAt: outcome === 'DISMISSED' ? new Date() : null,
        timeToStartSeconds: timeToStartSeconds ?? null,
        timeToCompleteSeconds: timeToCompleteSeconds ?? null,
        rating: rating ?? null,
      },
    })

    res.status(201).json({ id: feedback.id, outcome: feedback.outcome })
  } catch (error: any) {
    console.error('Feedback error:', error)
    res.status(500).json({ error: error.message || 'Failed to store feedback' })
  }
})

/**
 * GET /metrics
 * Completion rate, dismiss rate, time-to-complete, top actions, avoidance patterns.
 */
router.get('/metrics', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const [feedback, actions, eventCount] = await Promise.all([
      prisma.actionFeedback.findMany({
        where: { userId },
        include: { actionDefinition: true },
        orderBy: { createdAt: 'desc' },
        take: 500,
      }),
      prisma.actionDefinition.findMany({ where: { isActive: true }, select: { id: true, slug: true, label: true } }),
      prisma.contextEvent.count({ where: { userId } }),
    ])

    const byAction = new Map<string, { chosen: number; completed: number; dismissed: number; timeToCompleteSum: number; count: number }>()
    for (const a of actions) {
      byAction.set(a.id, { chosen: 0, completed: 0, dismissed: 0, timeToCompleteSum: 0, count: 0 })
    }
    for (const f of feedback) {
      const row = byAction.get(f.actionDefinitionId)
      if (!row) continue
      if (f.outcome === 'CHOSEN') row.chosen++
      if (f.outcome === 'COMPLETED') {
        row.completed++
        if (f.timeToCompleteSeconds) row.timeToCompleteSum += f.timeToCompleteSeconds
      }
      if (f.outcome === 'DISMISSED') row.dismissed++
      row.count++
    }

    const completionRate = feedback.filter((f) => f.outcome === 'COMPLETED').length / Math.max(1, feedback.filter((f) => f.outcome === 'CHOSEN').length)
    const dismissRate = feedback.filter((f) => f.outcome === 'DISMISSED').length / Math.max(1, feedback.length)

    const topActions = actions
      .map((a) => {
        const row = byAction.get(a.id)!
        return {
          slug: a.slug,
          label: a.label,
          chosen: row.chosen,
          completed: row.completed,
          dismissed: row.dismissed,
          completionRate: row.chosen > 0 ? row.completed / row.chosen : 0,
          avgTimeToComplete: row.completed > 0 ? Math.round(row.timeToCompleteSum / row.completed) : null,
        }
      })
      .filter((x) => x.chosen + x.dismissed > 0)
      .sort((a, b) => b.completed - a.completed)
      .slice(0, 10)

    res.json({
      contextEventsCount: eventCount,
      feedbackCount: feedback.length,
      completionRate: Math.round(completionRate * 100) / 100,
      dismissRate: Math.round(dismissRate * 100) / 100,
      topActions,
      avoidancePatterns: feedback
        .filter((f) => f.outcome === 'DISMISSED')
        .slice(0, 20)
        .map((f) => ({ actionSlug: f.actionDefinition.slug, at: f.createdAt })),
    })
  } catch (error: any) {
    console.error('Metrics error:', error)
    res.status(500).json({ error: error.message || 'Failed to get metrics' })
  }
})

export default router
