/**
 * RAGService
 * 
 * Domain service for Retrieval-Augmented Generation logic.
 * Pure business logic for selecting and preparing knowledge for RAG.
 */

import { KnowledgeArticle } from '../entities/KnowledgeArticle.js'

export interface RAGContext {
  articles: KnowledgeArticle[]
  relevanceScores: Map<string, number> // articleId -> relevance score
  totalArticles: number
}

export class RAGService {
  /**
   * Select relevant knowledge articles for a query
   * Business logic: article relevance filtering and ranking
   */
  selectRelevantArticles(
    articles: KnowledgeArticle[],
    query: string,
    limit: number = 5,
    minRelevance: number = 0.5
  ): RAGContext {
    // Score articles by relevance
    const scoredArticles = articles.map(article => ({
      article,
      score: this.calculateRelevance(article, query),
    }))

    // Filter by minimum relevance and sort
    const relevant = scoredArticles
      .filter(item => item.score >= minRelevance)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    // Create relevance map
    const relevanceScores = new Map<string, number>()
    relevant.forEach(item => {
      relevanceScores.set(item.article.id, item.score)
    })

    return {
      articles: relevant.map(item => item.article),
      relevanceScores,
      totalArticles: articles.length,
    }
  }

  /**
   * Calculate relevance score for an article (0-1)
   * Business logic: relevance scoring algorithm
   */
  private calculateRelevance(article: KnowledgeArticle, query: string): number {
    let score = 0
    const queryLower = query.toLowerCase()
    const titleLower = article.title.toLowerCase()
    const contentLower = article.content.toLowerCase()

    // Title match (higher weight)
    if (titleLower.includes(queryLower)) {
      score += 0.5
    } else {
      // Partial title match
      const titleWords = titleLower.split(/\s+/)
      const queryWords = queryLower.split(/\s+/)
      const titleMatches = queryWords.filter(word => 
        titleWords.some(titleWord => titleWord.includes(word))
      )
      score += (titleMatches.length / queryWords.length) * 0.3
    }

    // Content match
    if (contentLower.includes(queryLower)) {
      score += 0.3
    } else {
      // Keyword matches in content
      const contentWords = contentLower.split(/\s+/)
      const queryWords = queryLower.split(/\s+/)
      const contentMatches = queryWords.filter(word => 
        contentWords.some(contentWord => contentWord.includes(word))
      )
      score += (contentMatches.length / queryWords.length) * 0.2
    }

    // Normalize to 0-1
    return Math.min(score, 1.0)
  }

  /**
   * Format knowledge articles for LLM context
   * Business logic: how to present knowledge to LLM
   */
  formatArticlesForContext(articles: KnowledgeArticle[]): string {
    if (articles.length === 0) {
      return 'No relevant knowledge articles found.'
    }

    return articles
      .map((article, index) => {
        const preview = article.getPreview(200)
        return `[${index + 1}] ${article.title}\n${preview}`
      })
      .join('\n\n---\n\n')
  }

  /**
   * Prepare RAG prompt with context
   */
  prepareRAGPrompt(
    userQuery: string,
    articles: KnowledgeArticle[],
    agentPersonality?: string
  ): string {
    const context = this.formatArticlesForContext(articles)
    const personality = agentPersonality 
      ? `\n\nYou are ${agentPersonality}.`
      : ''

    return `You are a financial expert assistant. Use the following knowledge base articles to answer the user's question accurately and helpfully.${personality}

**Knowledge Base Context:**
${context}

**User Question:**
${userQuery}

**Instructions:**
- Use the knowledge base articles to provide accurate, helpful information
- If the articles don't contain relevant information, say so
- Cite which article(s) you're using when relevant
- Provide actionable advice when possible`
  }
}


