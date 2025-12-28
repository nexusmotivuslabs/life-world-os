/**
 * PgVectorKnowledgeAdapter
 * 
 * Infrastructure adapter implementing KnowledgeBasePort using pgvector.
 * Note: This requires pgvector extension to be installed in PostgreSQL.
 */

import { PrismaClient } from '@prisma/client'
import { KnowledgeBasePort, SearchResult } from '../../../application/ports/KnowledgeBasePort.js'
import { KnowledgeArticle } from '../../../domain/entities/KnowledgeArticle.js'
import { EmbeddingServicePort } from '../../../application/ports/EmbeddingServicePort.js'
import { VectorDatabasePort } from '../../../application/ports/VectorDatabasePort.js'

export class PgVectorKnowledgeAdapter implements KnowledgeBasePort {
  constructor(
    private prisma: PrismaClient,
    private embeddingService: EmbeddingServicePort,
    private vectorDb: VectorDatabasePort
  ) {}

  async search(
    query: string,
    limit: number = 10,
    threshold: number = 0.5
  ): Promise<SearchResult[]> {
    // Generate embedding for query
    const queryEmbedding = await this.embeddingService.generateEmbedding(query)

    // Search similar vectors
    const vectorResults = await this.vectorDb.searchSimilar(
      queryEmbedding.embedding,
      limit,
      threshold
    )

    // Fetch articles
    const articles = await Promise.all(
      vectorResults.map(result =>
        this.prisma.knowledgeArticle.findUnique({
          where: { id: result.id },
        })
      )
    )

    // Convert to domain entities and map to search results
    const results: SearchResult[] = []
    for (let i = 0; i < articles.length; i++) {
      const articleData = articles[i]
      if (articleData) {
        const article = KnowledgeArticle.fromPersistence({
          id: articleData.id,
          agentId: articleData.agentId,
          teamId: articleData.teamId,
          title: articleData.title,
          content: articleData.content,
          embedding: null, // Embedding not needed in domain entity
          metadata: articleData.metadata as Record<string, unknown> | null,
        })

        results.push({
          article,
          similarity: vectorResults[i].similarity,
        })
      }
    }

    return results
  }

  async searchByAgent(
    query: string,
    agentId: string,
    limit: number = 10
  ): Promise<SearchResult[]> {
    const queryEmbedding = await this.embeddingService.generateEmbedding(query)

    const vectorResults = await this.vectorDb.searchSimilarWithFilters(
      queryEmbedding.embedding,
      { agentId },
      limit
    )

    const articles = await Promise.all(
      vectorResults.map(result =>
        this.prisma.knowledgeArticle.findUnique({
          where: { id: result.id, agentId },
        })
      )
    )

    const results: SearchResult[] = []
    for (let i = 0; i < articles.length; i++) {
      const articleData = articles[i]
      if (articleData) {
        const article = KnowledgeArticle.fromPersistence({
          id: articleData.id,
          agentId: articleData.agentId,
          teamId: articleData.teamId,
          title: articleData.title,
          content: articleData.content,
          embedding: null,
          metadata: articleData.metadata as Record<string, unknown> | null,
        })

        results.push({
          article,
          similarity: vectorResults[i].similarity,
        })
      }
    }

    return results
  }

  async searchByTeam(
    query: string,
    teamId: string,
    limit: number = 10
  ): Promise<SearchResult[]> {
    const queryEmbedding = await this.embeddingService.generateEmbedding(query)

    const vectorResults = await this.vectorDb.searchSimilarWithFilters(
      queryEmbedding.embedding,
      { teamId },
      limit
    )

    const articles = await Promise.all(
      vectorResults.map(result =>
        this.prisma.knowledgeArticle.findUnique({
          where: { id: result.id, teamId },
        })
      )
    )

    const results: SearchResult[] = []
    for (let i = 0; i < articles.length; i++) {
      const articleData = articles[i]
      if (articleData) {
        const article = KnowledgeArticle.fromPersistence({
          id: articleData.id,
          agentId: articleData.agentId,
          teamId: articleData.teamId,
          title: articleData.title,
          content: articleData.content,
          embedding: null,
          metadata: articleData.metadata as Record<string, unknown> | null,
        })

        results.push({
          article,
          similarity: vectorResults[i].similarity,
        })
      }
    }

    return results
  }

  async findById(id: string): Promise<KnowledgeArticle | null> {
    const articleData = await this.prisma.knowledgeArticle.findUnique({
      where: { id },
    })

    if (!articleData) {
      return null
    }

    return KnowledgeArticle.fromPersistence({
      id: articleData.id,
      agentId: articleData.agentId,
      teamId: articleData.teamId,
      title: articleData.title,
      content: articleData.content,
      embedding: null,
      metadata: articleData.metadata as Record<string, unknown> | null,
    })
  }

  async save(
    article: KnowledgeArticle,
    embedding?: number[]
  ): Promise<KnowledgeArticle> {
    // Generate embedding if not provided
    let finalEmbedding = embedding
    if (!finalEmbedding) {
      const embeddingResult = await this.embeddingService.generateEmbedding(
        article.content
      )
      finalEmbedding = embeddingResult.embedding
    }

    // Save article
    const articleData = await this.prisma.knowledgeArticle.upsert({
      where: { id: article.id },
      create: {
        id: article.id,
        agentId: article.agentId ?? undefined,
        teamId: article.teamId ?? undefined,
        title: article.title,
        content: article.content,
        metadata: article.metadata ? (article.metadata as any) : undefined,
      },
      update: {
        title: article.title,
        content: article.content,
        metadata: article.metadata ? (article.metadata as any) : undefined,
      },
    })

    // Store embedding in vector database
    await this.vectorDb.storeEmbedding(article.id, finalEmbedding, {
      title: article.title,
      agentId: article.agentId,
      teamId: article.teamId,
    })

    return KnowledgeArticle.fromPersistence({
      id: articleData.id,
      agentId: articleData.agentId,
      teamId: articleData.teamId,
      title: articleData.title,
      content: articleData.content,
      embedding: finalEmbedding,
      metadata: articleData.metadata as Record<string, unknown> | null,
    })
  }

  async delete(id: string): Promise<void> {
    await Promise.all([
      this.prisma.knowledgeArticle.delete({
        where: { id },
      }),
      this.vectorDb.deleteEmbedding(id),
    ])
  }
}


