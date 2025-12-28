/**
 * OllamaLMAdapter
 * 
 * Infrastructure adapter implementing LLMServicePort using Ollama (local LLM).
 * 
 * NOTE: Requires Ollama to be installed and running locally
 * Installation: https://ollama.ai
 * Default endpoint: http://localhost:11434
 * 
 * Recommended models:
 * - llama3.2 (general purpose, fast)
 * - mistral (balanced performance)
 * - qwen2.5 (good for structured tasks)
 */

import { LLMServicePort, LLMMessage, LLMResponse } from '../../../application/ports/LLMServicePort.js'
import { logger } from '../lib/logger.js'

const DEFAULT_OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'deepseek-r1:1.5b'

export class OllamaLMAdapter implements LLMServicePort {
  private ollamaUrl: string
  private defaultModel: string

  constructor(ollamaUrl?: string, defaultModel?: string) {
    this.ollamaUrl = ollamaUrl || DEFAULT_OLLAMA_URL
    this.defaultModel = defaultModel || DEFAULT_MODEL
  }

  async generateResponse(
    messages: LLMMessage[],
    options?: {
      temperature?: number
      maxTokens?: number
      model?: string
    }
  ): Promise<LLMResponse> {
    const model = options?.model || this.defaultModel
    const temperature = options?.temperature ?? 0.7
    const maxTokens = options?.maxTokens ?? 500

    try {
      const response = await fetch(`${this.ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          options: {
            temperature,
            num_predict: maxTokens,
          },
          stream: false,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Ollama API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()

      if (!data.message?.content) {
        throw new Error('No response content from Ollama')
      }

      return {
        content: data.message.content,
        model: model,
        usage: data.eval_count
          ? {
              promptTokens: data.prompt_eval_count || 0,
              completionTokens: data.eval_count,
              totalTokens: (data.prompt_eval_count || 0) + data.eval_count,
            }
          : undefined,
      }
    } catch (error: any) {
      if (error.message?.includes('fetch failed') || error.code === 'ECONNREFUSED') {
        throw new Error(
          `Cannot connect to Ollama at ${this.ollamaUrl}. Make sure Ollama is running. Install from https://ollama.ai`
        )
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
    let userMessage = `Knowledge Base Context:\n${knowledgeContext}\n\nUser Question: ${userQuery}`

    // Add user context if provided
    if (context.userContext) {
      const contextStr = JSON.stringify(context.userContext, null, 2)
      userMessage += `\n\nUser Financial Context:\n${contextStr}`
    }

    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ]

    return this.generateResponse(messages, options)
  }

  /**
   * Check if Ollama is available
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/tags`, {
        method: 'GET',
      })
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * Pull/download a model if it doesn't exist
   */
  async ensureModel(model: string = this.defaultModel): Promise<void> {
    try {
      // Check if model exists
      const tagsResponse = await fetch(`${this.ollamaUrl}/api/tags`)
      if (tagsResponse.ok) {
        const data = await tagsResponse.json()
        const modelExists = data.models?.some((m: any) => m.name.startsWith(model))
        if (modelExists) {
          return // Model already exists
        }
      }

      // Pull the model
      logger.info(`Pulling model ${model}...`)
      const pullResponse = await fetch(`${this.ollamaUrl}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: model }),
      })

      if (!pullResponse.ok) {
        throw new Error(`Failed to pull model ${model}`)
      }

      // Stream the pull progress
      const reader = pullResponse.body?.getReader()
      const decoder = new TextDecoder()
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n').filter(Boolean)
          
          for (const line of lines) {
            try {
              const data = JSON.parse(line)
              if (data.status) {
                process.stdout.write(`\r${data.status}`)
              }
              if (data.completed) {
                logger.info('\nModel pulled successfully!')
                return
              }
            } catch {
              // Skip non-JSON lines
            }
          }
        }
      }
    } catch (error: any) {
      throw new Error(`Failed to ensure model ${model}: ${error.message}`)
    }
  }
}


