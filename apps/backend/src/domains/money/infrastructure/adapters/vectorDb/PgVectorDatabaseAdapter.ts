/**
 * PgVectorDatabaseAdapter
 * 
 * Infrastructure adapter implementing VectorDatabasePort using pgvector with raw SQL.
 * Note: Requires pgvector extension to be installed in PostgreSQL.
 */

import { PrismaClient } from '@prisma/client'
import { VectorDatabasePort, VectorSearchResult } from '../../../application/ports/VectorDatabasePort.js'

export class PgVectorDatabaseAdapter implements VectorDatabasePort {
  constructor(private prisma: PrismaClient) {}

  async storeEmbedding(
    articleId: string,
    embedding: number[],
    metadata?: Record<string, unknown>
  ): Promise<void> {
    // Convert array to PostgreSQL vector format: '[0.1,0.2,0.3]'
    const vectorString = `[${embedding.join(',')}]`
    const dimensions = embedding.length

    // Use raw SQL to update the embedding column
    // Note: This assumes the embedding column exists (added via migration)
    // Ollama embeddings are 768-dimensional, OpenAI are 1536-dimensional
    await this.prisma.$executeRawUnsafe(
      `UPDATE knowledge_articles SET embedding = $1::vector WHERE id = $2`,
      vectorString,
      articleId
    ).catch(async () => {
      // If embedding column doesn't exist yet, try to add it
      // This should normally be done via migration, but we handle it gracefully
      await this.prisma.$executeRawUnsafe(
        `ALTER TABLE knowledge_articles ADD COLUMN IF NOT EXISTS embedding vector(${dimensions})`
      )
      await this.prisma.$executeRawUnsafe(
        `UPDATE knowledge_articles SET embedding = $1::vector WHERE id = $2`,
        vectorString,
        articleId
      )
    })
  }

  async searchSimilar(
    queryEmbedding: number[],
    limit: number = 10,
    threshold: number = 0.5
  ): Promise<VectorSearchResult[]> {
    const vectorString = `[${queryEmbedding.join(',')}]`

    // Use cosine similarity with pgvector
    // 1 - cosine_distance = cosine_similarity
    const results = await this.prisma.$queryRaw<Array<{
      id: string
      similarity: number
    }>>`
      SELECT 
        id,
        1 - (embedding <=> ${vectorString}::vector) as similarity
      FROM knowledge_articles
      WHERE embedding IS NOT NULL
        AND 1 - (embedding <=> ${vectorString}::vector) >= ${threshold}
      ORDER BY embedding <=> ${vectorString}::vector
      LIMIT ${limit}
    `

    return results.map(r => ({
      id: r.id,
      similarity: Number(r.similarity),
    }))
  }

  async searchSimilarWithFilters(
    queryEmbedding: number[],
    filters: {
      agentId?: string
      teamId?: string
    },
    limit: number = 10,
    threshold: number = 0.5
  ): Promise<VectorSearchResult[]> {
    const vectorString = `[${queryEmbedding.join(',')}]`

    // Use Prisma's parameterized query to avoid SQL injection
    // First, get all articles with filters
    const articles = await this.prisma.knowledgeArticle.findMany({
      where: {
        embedding: { not: null },
        ...(filters.agentId && { agentId: filters.agentId }),
        ...(filters.teamId && { teamId: filters.teamId }),
      },
      select: { id: true },
      take: 100, // Limit initial query
    })

    if (articles.length === 0) {
      return []
    }

    const articleIds = articles.map(a => a.id)

    // Use raw SQL with parameterized values for vector similarity
    // Note: This is a simplified approach. In production, consider using a more sophisticated
    // vector search library or optimizing this query further.
    const idPlaceholders = articleIds.map((_, i) => `$${i + 4}`).join(',')

    const query = `
      SELECT 
        id,
        1 - (embedding <=> $1::vector) as similarity
      FROM knowledge_articles
      WHERE id IN (${idPlaceholders})
        AND embedding IS NOT NULL
        AND 1 - (embedding <=> $1::vector) >= $2
      ORDER BY embedding <=> $1::vector
      LIMIT $3
    `

    const results = await this.prisma.$queryRawUnsafe<Array<{
      id: string
      similarity: number
    }>>(
      query,
      vectorString,
      threshold,
      limit,
      ...articleIds
    )

    return results.map(r => ({
      id: r.id,
      similarity: Number(r.similarity),
    }))
  }

  async deleteEmbedding(articleId: string): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE knowledge_articles
      SET embedding = NULL
      WHERE id = ${articleId}
    `
  }

  async updateEmbedding(
    articleId: string,
    embedding: number[],
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.storeEmbedding(articleId, embedding, metadata)
  }
}

