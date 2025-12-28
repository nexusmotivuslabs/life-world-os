/**
 * Embeddings Service
 * 
 * Service for generating and managing embeddings for knowledge articles.
 * Uses OpenAI text-embedding-3-small model for cost-effective embeddings.
 * 
 * NOTE: Requires 'openai' package to be installed: npm install openai
 * 
 * This service will be used by the knowledge base infrastructure adapters.
 */

const EMBEDDING_MODEL = 'text-embedding-3-small'
const EMBEDDING_DIMENSIONS = 1536

export interface EmbeddingResult {
  embedding: number[]
  model: string
  dimensions: number
}

/**
 * Generate embedding for a text string
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  // Dynamic import to handle missing package
  let OpenAI: any
  try {
    OpenAI = (await import('openai')).default
  } catch (error) {
    throw new Error('OpenAI package not installed. Please install it: npm install openai')
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set')
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    dimensions: EMBEDDING_DIMENSIONS,
  })

  const embedding = response.data[0]?.embedding

  if (!embedding) {
    throw new Error('Failed to generate embedding')
  }

  return {
    embedding,
    model: EMBEDDING_MODEL,
    dimensions: EMBEDDING_DIMENSIONS,
  }
}

/**
 * Generate embeddings for multiple texts
 */
export async function generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
  // Dynamic import to handle missing package
  let OpenAI: any
  try {
    OpenAI = (await import('openai')).default
  } catch (error) {
    throw new Error('OpenAI package not installed. Please install it: npm install openai')
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set')
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
    dimensions: EMBEDDING_DIMENSIONS,
  })

  return response.data.map((item) => ({
    embedding: item.embedding,
    model: EMBEDDING_MODEL,
    dimensions: EMBEDDING_DIMENSIONS,
  }))
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embeddings must have the same dimensions')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}
