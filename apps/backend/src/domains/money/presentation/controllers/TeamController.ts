/**
 * TeamController
 * 
 * Presentation layer controller for team-related endpoints.
 */

import { Router, Request, Response } from 'express'
import { ConsultTeamUseCase } from '../../application/useCases/ConsultTeamUseCase.js'
import { PrismaClient } from '@prisma/client'
import { PrismaTeamRepositoryAdapter } from '../../infrastructure/adapters/database/PrismaTeamRepositoryAdapter.js'
import { PrismaAgentRepositoryAdapter } from '../../infrastructure/adapters/database/PrismaAgentRepositoryAdapter.js'
import { PgVectorKnowledgeAdapter } from '../../infrastructure/adapters/vectorDb/PgVectorKnowledgeAdapter.js'
import { OllamaLMAdapter } from '../../infrastructure/adapters/llm/OllamaLMAdapter.js'
// import { OpenAILMAdapter } from '../../infrastructure/adapters/llm/OpenAILMAdapter.js' // Alternative: use OpenAI
import { UserContextAdapter } from '../../infrastructure/adapters/userContext/UserContextAdapter.js'
import { OllamaEmbeddingAdapter } from '../../infrastructure/adapters/embeddings/OllamaEmbeddingAdapter.js'
// import { OpenAIEmbeddingAdapter } from '../../infrastructure/adapters/embeddings/OpenAIEmbeddingAdapter.js' // Alternative: use OpenAI for embeddings
import { PgVectorDatabaseAdapter } from '../../infrastructure/adapters/vectorDb/PgVectorDatabaseAdapter.js'
import { prisma } from '../../../../lib/prisma.js'

import { authenticateToken, AuthRequest } from '../../../../middleware/auth.js'

const router = Router()

// All team routes require authentication
router.use(authenticateToken)

// Initialize adapters and use cases
const teamRepository = new PrismaTeamRepositoryAdapter(prisma)
const agentRepository = new PrismaAgentRepositoryAdapter(prisma)
// Use Ollama for local embeddings, or switch to OpenAI if preferred
const embeddingService = new OllamaEmbeddingAdapter(
  process.env.OLLAMA_URL || 'http://localhost:11434',
  process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text'
)
// Alternative: const embeddingService = new OpenAIEmbeddingAdapter()
const vectorDb = new PgVectorDatabaseAdapter(prisma)
const knowledgeBase = new PgVectorKnowledgeAdapter(prisma, embeddingService, vectorDb)
// Use Ollama for local LLM, or switch to OpenAI if preferred
const llmService = new OllamaLMAdapter(
  process.env.OLLAMA_URL || 'http://localhost:11434',
    process.env.OLLAMA_MODEL || 'deepseek-r1:1.5b'
)
// Alternative: const llmService = new OpenAILMAdapter()
const userContext = new UserContextAdapter(prisma)

const consultTeamUseCase = new ConsultTeamUseCase(
  teamRepository,
  agentRepository,
  knowledgeBase,
  llmService,
  userContext
)

/**
 * GET /api/teams
 * List all teams
 * 
 * RESILIENCE: Returns 200 with empty array instead of 500 error to prevent cascading failures.
 * This allows the frontend to handle gracefully and show appropriate empty states.
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const teams = await teamRepository.findAll()
    res.json({
      teams: teams.map(team => ({
        id: team.id,
        name: team.name,
        domain: team.domain,
        description: team.description,
        icon: team.icon,
        order: team.order,
        agentCount: team.getAgents().length,
      })),
    })
  } catch (error: any) {
    // RESILIENCE: Return 200 with empty array instead of 500 error
    console.error('⚠️  Error listing teams (returning empty array for resilience):', error)
    res.json({
      teams: [],
      warning: 'Team listing encountered issues, but system remains operational',
    })
  }
})

/**
 * GET /api/teams/:teamId
 * Get team details with agents
 */
router.get('/:teamId', async (req: AuthRequest, res: Response) => {
  try {
    const team = await teamRepository.findById(req.params.teamId)
    if (!team) {
      return res.status(404).json({ error: 'Team not found' })
    }

    res.json({
      id: team.id,
      name: team.name,
      domain: team.domain,
      description: team.description,
      icon: team.icon,
      order: team.order,
      agents: team.getAgents().map(ta => ({
        id: ta.agentId,
        name: ta.agent.name,
        role: ta.role,
        order: ta.order,
      })),
      teamLead: team.getTeamLead()
        ? {
            id: team.getTeamLead()!.id,
            name: team.getTeamLead()!.name,
          }
        : null,
    })
  } catch (error: any) {
    console.error('Error getting team:', error)
    res.status(500).json({ error: error.message || 'Failed to get team' })
  }
})

/**
 * POST /api/teams/:teamId/chat
 * Consult with a team
 */
router.post('/:teamId/chat', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!

    const { query } = req.body

    if (!query) {
      return res.status(400).json({ error: 'Query is required' })
    }

    const response = await consultTeamUseCase.execute({
      userId,
      query,
      teamId: req.params.teamId,
    })

    res.json(response)
  } catch (error: any) {
    console.error('Error consulting team:', error)
    res.status(500).json({ error: error.message || 'Failed to consult team' })
  }
})

export default router

