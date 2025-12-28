/**
 * KnowledgeBasePort
 * 
 * Port (interface) for knowledge base operations (vector search, CRUD).
 */

import { KnowledgeArticle } from '../../domain/entities/KnowledgeArticle.js'

export interface SearchResult {
  article: KnowledgeArticle
  similarity: number // 0-1 score
}

export interface KnowledgeBasePort {
  /**
   * Search knowledge base using vector similarity
   */
  search(
    query: string,
    limit?: number,
    threshold?: number
  ): Promise<SearchResult[]>

  /**
   * Search by agent ID
   */
  searchByAgent(
    query: string,
    agentId: string,
    limit?: number
  ): Promise<SearchResult[]>

  /**
   * Search by team ID
   */
  searchByTeam(
    query: string,
    teamId: string,
    limit?: number
  ): Promise<SearchResult[]>

  /**
   * Find article by ID
   */
  findById(id: string): Promise<KnowledgeArticle | null>

  /**
   * Save article (create or update with embedding)
   */
  save(article: KnowledgeArticle, embedding?: number[]): Promise<KnowledgeArticle>

  /**
   * Delete article
   */
  delete(id: string): Promise<void>
}


