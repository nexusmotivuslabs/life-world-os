/**
 * AgentController
 * 
 * Presentation layer controller for agent-related endpoints.
 * Uses use cases to handle business logic.
 */

import { Router, Request, Response } from 'express'
import { ChatWithAgentUseCase } from '../../application/useCases/ChatWithAgentUseCase.js'
import { PrismaClient } from '@prisma/client'
import { PrismaAgentRepositoryAdapter } from '../../infrastructure/adapters/database/PrismaAgentRepositoryAdapter.js'
import { PgVectorKnowledgeAdapter } from '../../infrastructure/adapters/vectorDb/PgVectorKnowledgeAdapter.js'
import { OllamaLMAdapter } from '../../infrastructure/adapters/llm/OllamaLMAdapter.js'
// import { OpenAILMAdapter } from '../../infrastructure/adapters/llm/OpenAILMAdapter.js' // Alternative: use OpenAI
import { UserContextAdapter } from '../../infrastructure/adapters/userContext/UserContextAdapter.js'
import { OllamaEmbeddingAdapter } from '../../infrastructure/adapters/embeddings/OllamaEmbeddingAdapter.js'
// import { OpenAIEmbeddingAdapter } from '../../infrastructure/adapters/embeddings/OpenAIEmbeddingAdapter.js' // Alternative: use OpenAI for embeddings
import { PgVectorDatabaseAdapter } from '../../infrastructure/adapters/vectorDb/PgVectorDatabaseAdapter.js'
import { prisma } from '../../../../lib/prisma.js'

const router = Router()

// Note: In production, add authentication middleware here
// router.use(authenticateToken)

// Initialize adapters and use cases
const agentRepository = new PrismaAgentRepositoryAdapter(prisma)
// Use Ollama for local embeddings (768 dimensions)
// Alternative: const embeddingService = new OpenAIEmbeddingAdapter() // 1536 dimensions
const embeddingService = new OllamaEmbeddingAdapter(
  process.env.OLLAMA_URL || 'http://localhost:11434',
  process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text'
)
const vectorDb = new PgVectorDatabaseAdapter(prisma)
const knowledgeBase = new PgVectorKnowledgeAdapter(prisma, embeddingService, vectorDb)
// Use Ollama for local LLM, or switch to OpenAI if preferred
const llmService = new OllamaLMAdapter(
  process.env.OLLAMA_URL || 'http://localhost:11434',
    process.env.OLLAMA_MODEL || 'deepseek-r1:1.5b'
)
// Alternative: const llmService = new OpenAILMAdapter()
const userContext = new UserContextAdapter(prisma)

const chatWithAgentUseCase = new ChatWithAgentUseCase(
  agentRepository,
  knowledgeBase,
  llmService,
  userContext
)

/**
 * GET /api/agents
 * List all agents
 * 
 * RESILIENCE: Returns 200 with empty array instead of 500 error to prevent cascading failures.
 * This allows the frontend to handle gracefully and show appropriate empty states.
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const agentsList = await prisma.agent.findMany({
      orderBy: { order: 'asc' },
    })
    
    res.json({
      agents: agentsList.map(agent => ({
        id: agent.id,
        type: agent.type,
        name: agent.name,
        description: agent.description,
        expertise: agent.expertise,
        avatar: agent.avatar,
        order: agent.order,
        metadata: agent.metadata as any,
      })),
    })
  } catch (error: any) {
    // RESILIENCE: Return 200 with empty array instead of 500 error
    console.error('⚠️  Error listing agents (returning empty array for resilience):', error)
    res.json({
      agents: [],
      warning: 'Agent listing encountered issues, but system remains operational',
    })
  }
})

/**
 * GET /api/agents/:agentId
 * Get agent details
 */
router.get('/:agentId', async (req: Request, res: Response) => {
  try {
    const agentData = await prisma.agent.findUnique({
      where: { id: req.params.agentId },
    })
    
    if (!agentData) {
      return res.status(404).json({ error: 'Agent not found' })
    }

    const agent = await agentRepository.findById(req.params.agentId)
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' })
    }

    res.json({
      id: agent.id,
      type: agent.type,
      name: agent.name,
      description: agent.description,
      expertise: agent.expertise,
      avatar: agent.avatar,
      order: agent.order,
      personality: agent.getPersonality(),
      metadata: agentData.metadata as any,
    })
  } catch (error: any) {
    console.error('Error getting agent:', error)
    res.status(500).json({ error: error.message || 'Failed to get agent' })
  }
})

/**
 * POST /api/agents/:agentId/chat
 * Chat with an agent
 */
router.post('/:agentId/chat', async (req: Request, res: Response) => {
  try {
    // TODO: Add proper authentication middleware
    const userId = (req as any).userId || 'demo-user' // Temporary for development
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { query, conversationHistory } = req.body

    if (!query) {
      return res.status(400).json({ error: 'Query is required' })
    }

    const response = await chatWithAgentUseCase.execute({
      userId,
      query,
      agentId: req.params.agentId,
      conversationHistory,
    })

    res.json(response)
  } catch (error: any) {
    console.error('Error chatting with agent:', error)
    res.status(500).json({ error: error.message || 'Failed to chat with agent' })
  }
})

export default router

