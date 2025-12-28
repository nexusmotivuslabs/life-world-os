/**
 * ChatWithAgentUseCase
 * 
 * Use case for chatting with an agent using RAG (Retrieval-Augmented Generation).
 */

import { AgentRepositoryPort } from '../ports/AgentRepositoryPort.js'
import { KnowledgeBasePort } from '../ports/KnowledgeBasePort.js'
import { LLMServicePort } from '../ports/LLMServicePort.js'
import { UserContextPort } from '../ports/UserContextPort.js'
import { AgentSelectionService } from '../../domain/services/AgentSelectionService.js'
import { RAGService } from '../../domain/services/RAGService.js'
import { Agent } from '../../domain/entities/Agent.js'

export interface ChatRequest {
  userId: string
  query: string
  agentId?: string // Optional: if not provided, select best agent
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
}

export interface ChatResponse {
  agent: {
    id: string
    name: string
    type: string
  }
  response: string
  relevantArticles: Array<{
    id: string
    title: string
    preview: string
  }>
  userContext?: Record<string, unknown>
}

export class ChatWithAgentUseCase {
  constructor(
    private agentRepository: AgentRepositoryPort,
    private knowledgeBase: KnowledgeBasePort,
    private llmService: LLMServicePort,
    private userContext: UserContextPort,
    private agentSelectionService: AgentSelectionService = new AgentSelectionService(),
    private ragService: RAGService = new RAGService()
  ) {}

  async execute(request: ChatRequest): Promise<ChatResponse> {
    // Get or select agent
    let agent: Agent | null = null

    if (request.agentId) {
      agent = await this.agentRepository.findById(request.agentId)
      if (!agent) {
        throw new Error(`Agent not found: ${request.agentId}`)
      }
    } else {
      // Select best agent for query
      const allAgents = await this.agentRepository.findAll()
      agent = this.agentSelectionService.selectAgent(request.query, allAgents)
      
      if (!agent) {
        throw new Error('No suitable agent found for query')
      }
    }

    // Get user context
    const userContextData = await this.userContext.getUserContext(request.userId)

    // Search knowledge base
    const knowledgeResults = await this.knowledgeBase.searchByAgent(
      request.query,
      agent.id,
      5 // Top 5 relevant articles
    )

    // Select most relevant articles
    const relevantArticles = this.ragService.selectRelevantArticles(
      knowledgeResults.map(r => r.article),
      request.query,
      3, // Top 3 for context
      0.5 // Minimum relevance
    )

    // Generate response using LLM with RAG
    const llmResponse = await this.llmService.generateResponseWithRAG(
      request.query,
      {
        agentPersonality: agent.getPersonality(),
        knowledgeArticles: relevantArticles.articles.map(a => ({
          title: a.title,
          content: a.content,
          similarity: relevantArticles.relevanceScores.get(a.id) || 0,
        })),
        userContext: {
          resources: userContextData.resources,
          engines: userContextData.engines,
          investments: userContextData.investments,
          overallXP: userContextData.overallXP,
          overallRank: userContextData.overallRank,
        },
      },
      {
        temperature: 0.7,
        maxTokens: 4096, // Maximum token count for comprehensive responses
      }
    )

    return {
      agent: {
        id: agent.id,
        name: agent.name,
        type: agent.type,
      },
      response: llmResponse.content,
      relevantArticles: relevantArticles.articles.map(a => ({
        id: a.id,
        title: a.title,
        preview: a.getPreview(150),
      })),
      userContext: {
        resources: userContextData.resources,
        engines: userContextData.engines,
        investments: userContextData.investments,
      },
    }
  }
}


