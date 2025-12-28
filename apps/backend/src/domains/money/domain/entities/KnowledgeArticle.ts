/**
 * KnowledgeArticle Domain Entity
 * 
 * Pure business logic entity representing a knowledge article in the vector database.
 * No infrastructure dependencies - pure TypeScript class.
 */

export class KnowledgeArticle {
  private constructor(
    public readonly id: string,
    public readonly agentId: string | null,
    public readonly teamId: string | null,
    public readonly title: string,
    public readonly content: string,
    public readonly embedding: number[] | null, // Vector embedding (768 for Ollama, 1536 for OpenAI)
    public readonly metadata: Record<string, unknown> | null
  ) {
    // Validate embedding dimensions if present
    // Ollama embeddings: 768 dimensions (nomic-embed-text)
    // OpenAI embeddings: 1536 dimensions (text-embedding-3-small)
    if (embedding && embedding.length !== 768 && embedding.length !== 1536) {
      throw new Error(`Embedding must be 768 (Ollama) or 1536 (OpenAI) dimensions, got ${embedding.length}`)
    }
  }

  /**
   * Create a new KnowledgeArticle entity
   */
  static create(
    id: string,
    title: string,
    content: string,
    agentId: string | null = null,
    teamId: string | null = null,
    embedding: number[] | null = null,
    metadata: Record<string, unknown> | null = null
  ): KnowledgeArticle {
    // Validate that either agentId or teamId is set, but not both
    if (agentId && teamId) {
      throw new Error('Knowledge article cannot belong to both an agent and a team')
    }

    return new KnowledgeArticle(id, agentId, teamId, title, content, embedding, metadata)
  }

  /**
   * Create KnowledgeArticle from persisted data
   */
  static fromPersistence(data: {
    id: string
    agentId: string | null
    teamId: string | null
    title: string
    content: string
    embedding: number[] | null
    metadata: unknown // JSON from database
  }): KnowledgeArticle {
    const metadata = data.metadata
      ? (typeof data.metadata === 'object' && data.metadata !== null
          ? (data.metadata as Record<string, unknown>)
          : JSON.parse(data.metadata as string) as Record<string, unknown>)
      : null

    return new KnowledgeArticle(
      data.id,
      data.agentId,
      data.teamId,
      data.title,
      data.content,
      data.embedding,
      metadata
    )
  }

  /**
   * Check if article has embedding
   */
  hasEmbedding(): boolean {
    return this.embedding !== null && this.embedding.length > 0
  }

  /**
   * Extract keywords from content for search
   * Business logic: keyword extraction
   */
  extractKeywords(): string[] {
    // Simple keyword extraction - can be enhanced
    const words = this.content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3) // Filter short words

    // Get unique words
    const uniqueWords = [...new Set(words)]

    // Return top keywords (first 20)
    return uniqueWords.slice(0, 20)
  }

  /**
   * Get content preview (first N characters)
   */
  getPreview(maxLength: number = 200): string {
    if (this.content.length <= maxLength) {
      return this.content
    }

    return this.content.substring(0, maxLength) + '...'
  }

  /**
   * Check if article matches a query (simple text matching)
   * Business logic: basic text matching (vector similarity is done at infrastructure level)
   */
  matchesQuery(query: string): boolean {
    const queryLower = query.toLowerCase()
    const titleLower = this.title.toLowerCase()
    const contentLower = this.content.toLowerCase()

    return titleLower.includes(queryLower) || contentLower.includes(queryLower)
  }
}

