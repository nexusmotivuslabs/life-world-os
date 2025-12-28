/**
 * VectorDatabasePort
 * 
 * Port (interface) for vector database operations (pgvector).
 * Used for storing and querying embeddings.
 */

export interface VectorSearchResult {
  id: string
  similarity: number // 0-1 cosine similarity score
}

export interface VectorDatabasePort {
  /**
   * Store vector embedding for an article
   */
  storeEmbedding(
    articleId: string,
    embedding: number[],
    metadata?: Record<string, unknown>
  ): Promise<void>

  /**
   * Search for similar vectors using cosine similarity
   */
  searchSimilar(
    queryEmbedding: number[],
    limit?: number,
    threshold?: number
  ): Promise<VectorSearchResult[]>

  /**
   * Search with filters (by agentId, teamId, etc.)
   */
  searchSimilarWithFilters(
    queryEmbedding: number[],
    filters: {
      agentId?: string
      teamId?: string
    },
    limit?: number,
    threshold?: number
  ): Promise<VectorSearchResult[]>

  /**
   * Delete embedding for an article
   */
  deleteEmbedding(articleId: string): Promise<void>

  /**
   * Update embedding for an article
   */
  updateEmbedding(
    articleId: string,
    embedding: number[],
    metadata?: Record<string, unknown>
  ): Promise<void>
}


