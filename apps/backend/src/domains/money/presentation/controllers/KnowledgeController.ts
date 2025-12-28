/**
 * KnowledgeController
 * 
 * Presentation layer controller for knowledge base endpoints.
 */

import { Router, Request, Response } from 'express'
import { SearchKnowledgeUseCase } from '../../application/useCases/SearchKnowledgeUseCase.js'
import { PgVectorKnowledgeAdapter } from '../../infrastructure/adapters/vectorDb/PgVectorKnowledgeAdapter.js'
import { OllamaEmbeddingAdapter } from '../../infrastructure/adapters/embeddings/OllamaEmbeddingAdapter.js'
// import { OpenAIEmbeddingAdapter } from '../../infrastructure/adapters/embeddings/OpenAIEmbeddingAdapter.js' // Alternative: use OpenAI
import { PgVectorDatabaseAdapter } from '../../infrastructure/adapters/vectorDb/PgVectorDatabaseAdapter.js'
import { prisma } from '../../../../lib/prisma.js'

const router = Router()

// Initialize adapters and use cases
// Use Ollama for local embeddings
const embeddingService = new OllamaEmbeddingAdapter(
  process.env.OLLAMA_URL || 'http://localhost:11434',
  process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text'
)
const vectorDb = new PgVectorDatabaseAdapter(prisma)
const knowledgeBase = new PgVectorKnowledgeAdapter(prisma, embeddingService, vectorDb)

const searchKnowledgeUseCase = new SearchKnowledgeUseCase(knowledgeBase, embeddingService)

/**
 * GET /api/knowledge/search
 * Search knowledge base
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string
    const agentId = req.query.agentId as string | undefined
    const teamId = req.query.teamId as string | undefined
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined
    const threshold = req.query.threshold ? parseFloat(req.query.threshold as string) : undefined

    if (!query) {
      return res.status(400).json({ error: 'Query parameter "q" is required' })
    }

    const response = await searchKnowledgeUseCase.execute({
      query,
      agentId,
      teamId,
      limit,
      threshold,
    })

    res.json(response)
  } catch (error: any) {
    console.error('Error searching knowledge:', error)
    res.status(500).json({ error: error.message || 'Failed to search knowledge base' })
  }
})

export default router

