/**
 * SearchKnowledgeUseCase
 * 
 * Use case for searching the knowledge base.
 */

import { KnowledgeBasePort } from '../ports/KnowledgeBasePort.js'
import { EmbeddingServicePort } from '../ports/EmbeddingServicePort.js'

export interface SearchKnowledgeRequest {
  query: string
  agentId?: string
  teamId?: string
  limit?: number
  threshold?: number
}

export interface SearchKnowledgeResponse {
  results: Array<{
    id: string
    title: string
    content: string
    preview: string
    similarity: number
    agentId?: string
    teamId?: string
  }>
  totalResults: number
}

export class SearchKnowledgeUseCase {
  constructor(
    private knowledgeBase: KnowledgeBasePort,
    private embeddingService: EmbeddingServicePort
  ) {}

  async execute(request: SearchKnowledgeRequest): Promise<SearchKnowledgeResponse> {
    const limit = request.limit || 10
    const threshold = request.threshold || 0.5

    let results

    if (request.agentId) {
      results = await this.knowledgeBase.searchByAgent(
        request.query,
        request.agentId,
        limit
      )
    } else if (request.teamId) {
      results = await this.knowledgeBase.searchByTeam(
        request.query,
        request.teamId,
        limit
      )
    } else {
      results = await this.knowledgeBase.search(request.query, limit, threshold)
    }

    // Filter by threshold
    const filteredResults = results.filter(r => r.similarity >= threshold)

    return {
      results: filteredResults.map(r => ({
        id: r.article.id,
        title: r.article.title,
        content: r.article.content,
        preview: r.article.getPreview(200),
        similarity: r.similarity,
        agentId: r.article.agentId ?? undefined,
        teamId: r.article.teamId ?? undefined,
      })),
      totalResults: filteredResults.length,
    }
  }
}


