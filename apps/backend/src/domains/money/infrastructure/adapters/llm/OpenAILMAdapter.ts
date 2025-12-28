/**
 * OpenAILMAdapter
 * 
 * Infrastructure adapter implementing LLMServicePort using OpenAI.
 * 
 * NOTE: Requires 'openai' package to be installed: npm install openai
 */

import { LLMServicePort, LLMMessage, LLMResponse } from '../../../application/ports/LLMServicePort.js'

export class OpenAILMAdapter implements LLMServicePort {
  private openai: any
  private defaultModel: string = 'gpt-4'

  constructor(apiKey?: string) {
    // Dynamic import to handle missing package
    try {
      const OpenAI = require('openai').default
      this.openai = new OpenAI({
        apiKey: apiKey || process.env.OPENAI_API_KEY,
      })
    } catch (error) {
      throw new Error('OpenAI package not installed. Please install it: npm install openai')
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
    const response = await this.openai.chat.completions.create({
      model: options?.model || this.defaultModel,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4096, // Maximum token count for OpenAI models
    })

    const choice = response.choices[0]
    if (!choice?.message?.content) {
      throw new Error('No response from LLM')
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
    // Build system prompt with agent personality
    const systemPrompt = `You are a financial expert assistant. ${context.agentPersonality}

Use the provided knowledge base articles to answer questions accurately. When relevant, cite which article(s) you're using.`

    // Format knowledge articles for context
    const knowledgeContext = context.knowledgeArticles
      .map((article, index) => {
        return `[Article ${index + 1}] ${article.title}\n${article.content.substring(0, 500)}`
      })
      .join('\n\n---\n\n')

    // Build user message with context
    const userMessage = `Knowledge Base Context:\n${knowledgeContext}\n\nUser Question: ${userQuery}`

    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ]

    return this.generateResponse(messages, options)
  }
}

