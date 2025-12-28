/**
 * GroqLMAdapter
 * 
 * Infrastructure adapter implementing LLMServicePort using Groq.
 * 
 * Groq is fast and cost-effective, perfect for location recommendations.
 * 
 * NOTE: Requires 'groq-sdk' package: npm install groq-sdk
 * Get API key from: https://console.groq.com
 */

import { LLMServicePort, LLMMessage, LLMResponse } from '../../../money/application/ports/LLMServicePort.js'

export class GroqLMAdapter implements LLMServicePort {
  private groq: any
  private defaultModel: string = 'llama-3.1-70b-versatile' // Fast and capable model

  constructor(apiKey?: string) {
    try {
      // Dynamic import to handle missing package
      const Groq = require('groq-sdk').default
      this.groq = new Groq({
        apiKey: apiKey || process.env.GROQ_API_KEY,
      })
    } catch (error) {
      throw new Error('Groq SDK not installed. Please install it: npm install groq-sdk')
    }
  }

  async generateResponse(
    messages: LLMMessage[],
    options?: {
      temperature?: number
      maxTokens?: number
      model?: string
    }
  ): Promise<LLMResponse> {
    try {
      const response = await this.groq.chat.completions.create({
        model: options?.model || this.defaultModel,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000, // Groq allows higher limits
      })

      const choice = response.choices[0]
      if (!choice?.message?.content) {
        throw new Error('No response from Groq')
      }

      return {
        content: choice.message.content,
        model: response.model,
        usage: response.usage
          ? {
              promptTokens: response.usage.prompt_tokens,
              completionTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens,
            }
          : undefined,
      }
    } catch (error: any) {
      if (error.message?.includes('API key')) {
        throw new Error('Invalid Groq API key. Get one from https://console.groq.com')
      }
      throw error
    }
  }

  async generateResponseWithRAG(
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
  ): Promise<LLMResponse> {
    const systemPrompt = `You are a helpful assistant. ${context.agentPersonality}

Use the provided knowledge base articles to answer questions accurately.`

    const knowledgeContext = context.knowledgeArticles
      .map((article, index) => {
        return `[Article ${index + 1}] ${article.title}\n${article.content.substring(0, 500)}`
      })
      .join('\n\n---\n\n')

    const userMessage = `Knowledge Base Context:\n${knowledgeContext}\n\nUser Question: ${userQuery}`

    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ]

    return this.generateResponse(messages, options)
  }
}


