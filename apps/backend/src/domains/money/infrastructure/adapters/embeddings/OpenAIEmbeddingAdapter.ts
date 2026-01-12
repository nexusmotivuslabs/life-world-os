/**
 * OpenAIEmbeddingAdapter
 * 
 * Infrastructure adapter implementing EmbeddingServicePort using OpenAI.
 */

import { EmbeddingServicePort, EmbeddingResult } from '../../../application/ports/EmbeddingServicePort.js'
import { generateEmbedding, generateEmbeddings as generateEmbeddingsUtil } from '../../../../services/embeddingsService.js'

export class OpenAIEmbeddingAdapter implements EmbeddingServicePort {
  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    return generateEmbedding(text)
  }

  async generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
    return generateEmbeddingsUtil(texts)
  }
}





