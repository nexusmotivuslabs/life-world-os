/**
 * EmbeddingServicePort
 * 
 * Port (interface) for embedding generation service.
 * Used for generating vector embeddings for knowledge articles.
 */

export interface EmbeddingResult {
  embedding: number[]
  model: string
  dimensions: number
}

export interface EmbeddingServicePort {
  /**
   * Generate embedding for a single text
   */
  generateEmbedding(text: string): Promise<EmbeddingResult>

  /**
   * Generate embeddings for multiple texts
   */
  generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]>
}





