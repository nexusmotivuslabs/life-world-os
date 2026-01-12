/**
 * LLMServicePort
 * 
 * Port (interface) for LLM (Large Language Model) service operations.
 * Used for generating agent responses with RAG context.
 */

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LLMResponse {
  content: string
  model: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface LLMServicePort {
  /**
   * Generate response using LLM
   */
  generateResponse(
    messages: LLMMessage[],
    options?: {
      temperature?: number
      maxTokens?: number
      model?: string
    }
  ): Promise<LLMResponse>

  /**
   * Generate response with RAG context (knowledge articles)
   */
  generateResponseWithRAG(
    userQuery: string,
    context: {
      agentPersonality: string
      knowledgeArticles: Array<{
        title: string
        content: string
        similarity: number
      }>
      userContext?: Record<string, unknown>
    },
    options?: {
      temperature?: number
      maxTokens?: number
      model?: string
    }
  ): Promise<LLMResponse>
}





