/**
 * Environment Configuration Manager
 * 
 * Abstracts infrastructure details so code works locally and in cloud.
 * Just swap environment variables - no code changes needed.
 */

export type Environment = 'dev' | 'staging' | 'prod'
export type RunMode = 'local' | 'hybrid' | 'full'

export interface ServiceConfig {
  database: {
    url: string
    host: string
    port: number
    user: string
    password: string
    name: string
  }
  backend: {
    url: string
    port: number
  }
  frontend: {
    url: string
    port: number
  }
  ai: {
    ollama?: {
      url: string
      model: string
      embeddingModel: string
    }
    groq?: {
      apiKey: string
    }
    openai?: {
      apiKey: string
    }
  }
}

/**
 * Get configuration for an environment
 * Reads from environment variables (works locally and in cloud)
 */
export function getConfig(env: Environment = 'dev'): ServiceConfig {
  const prefix = env === 'dev' ? 'DEV' : env === 'staging' ? 'STAGING' : 'PROD'
  
  return {
    database: {
      url: process.env[`${prefix}_DATABASE_URL`] || 
           process.env.DATABASE_URL || 
           `postgresql://${process.env[`${prefix}_DB_USER`] || 'lifeworld_dev'}:${process.env[`${prefix}_DB_PASSWORD`] || 'password'}@${process.env[`${prefix}_DB_HOST`] || 'localhost'}:${process.env[`${prefix}_DB_PORT`] || '5433'}/${process.env[`${prefix}_DB_NAME`] || 'lifeworld_dev'}`,
      host: process.env[`${prefix}_DB_HOST`] || 'localhost',
      port: parseInt(process.env[`${prefix}_DB_PORT`] || '5433'),
      user: process.env[`${prefix}_DB_USER`] || 'lifeworld_dev',
      password: process.env[`${prefix}_DB_PASSWORD`] || 'password',
      name: process.env[`${prefix}_DB_NAME`] || 'lifeworld_dev',
    },
    backend: {
      url: process.env[`${prefix}_API_URL`] || 
           process.env.API_URL || 
           `http://localhost:${process.env[`${prefix}_BACKEND_PORT`] || '3001'}`,
      port: parseInt(process.env[`${prefix}_BACKEND_PORT`] || '3001'),
    },
    frontend: {
      url: process.env[`${prefix}_FRONTEND_URL`] || 
           process.env.FRONTEND_URL || 
           `http://localhost:${process.env[`${prefix}_FRONTEND_PORT`] || '5173'}`,
      port: parseInt(process.env[`${prefix}_FRONTEND_PORT`] || '5173'),
    },
    ai: {
      ollama: process.env.OLLAMA_URL ? {
        url: process.env.OLLAMA_URL,
        model: process.env.OLLAMA_MODEL || 'llama3.2',
        embeddingModel: process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text',
      } : undefined,
      groq: process.env.GROQ_API_KEY ? {
        apiKey: process.env.GROQ_API_KEY,
      } : undefined,
      openai: process.env.OPENAI_API_KEY ? {
        apiKey: process.env.OPENAI_API_KEY,
      } : undefined,
    },
  }
}

/**
 * Validate environment configuration
 */
export function validateConfig(config: ServiceConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!config.database.url) {
    errors.push('Database URL is required')
  }
  
  if (!config.backend.url) {
    errors.push('Backend URL is required')
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}


