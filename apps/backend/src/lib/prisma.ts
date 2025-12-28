import { PrismaClient } from '@prisma/client'
import { logger } from '../lib/logger.js'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  try {
    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
    
    // Verify models are available
    if (typeof client.user === 'undefined') {
      logger.error('WARNING: Prisma client models not available. Client may need regeneration.')
    }
    
    return client
  } catch (error) {
    logger.error('Failed to create Prisma client:', error)
    throw error
  }
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

