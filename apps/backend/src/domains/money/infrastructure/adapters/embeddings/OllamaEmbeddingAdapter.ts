/**
 * OllamaEmbeddingAdapter
 * 
 * Infrastructure adapter implementing EmbeddingServicePort using Ollama's embedding models.
 * 
 * NOTE: Requires Ollama to be installed and running locally
 * Recommended embedding models:
 * - nomic-embed-text (good general purpose embeddings)
 * - mxbai-embed-large (larger model, better quality)
 */

import { EmbeddingServicePort, EmbeddingResult } from '../../../application/ports/EmbeddingServicePort.js'

const DEFAULT_OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'
const DEFAULT_EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text'
const EMBEDDING_DIMENSIONS = 768 // nomic-embed-text produces 768-dimensional embeddings

export class OllamaEmbeddingAdapter implements EmbeddingServicePort {
  private ollamaUrl: string
  private model: string

  constructor(ollamaUrl?: string, model?: string) {
    this.ollamaUrl = ollamaUrl || DEFAULT_OLLAMA_URL
    this.model = model || DEFAULT_EMBEDDING_MODEL
  }

  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: text,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Ollama embeddings API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()

      if (!data.embedding || !Array.isArray(data.embedding)) {
        throw new Error('Invalid embedding response from Ollama')
      }

      return {
        embedding: data.embedding,
        model: this.model,
        dimensions: data.embedding.length,
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

  async generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
    // Ollama doesn't support batch embeddings, so we'll do them sequentially
    // For better performance, consider using a different embedding service for batch operations
    const results: EmbeddingResult[] = []

    for (const text of texts) {
      const result = await this.generateEmbedding(text)
      results.push(result)
    }

    return results
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
   * Pull/download the embedding model if it doesn't exist
   */
  async ensureModel(): Promise<void> {
    try {
      // Check if model exists
      const tagsResponse = await fetch(`${this.ollamaUrl}/api/tags`)
      if (tagsResponse.ok) {
        const data = await tagsResponse.json()
        const modelExists = data.models?.some((m: any) => m.name.startsWith(this.model))
        if (modelExists) {
          return // Model already exists
        }
      }

      // Pull the model
      console.log(`Pulling embedding model ${this.model}...`)
      const pullResponse = await fetch(`${this.ollamaUrl}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: this.model }),
      })

      if (!pullResponse.ok) {
        throw new Error(`Failed to pull embedding model ${this.model}`)
      }

      // Wait for pull to complete
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
              if (data.completed) {
                console.log('Embedding model pulled successfully!')
                return
              }
            } catch {
              // Skip non-JSON lines
            }
          }
        }
      }
    } catch (error: any) {
      throw new Error(`Failed to ensure embedding model ${this.model}: ${error.message}`)
    }
  }
}


