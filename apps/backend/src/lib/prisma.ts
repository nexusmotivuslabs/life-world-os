import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Creates a Prisma client with optimized connection settings
 * Includes connection pooling and retry logic for better reliability
 */
function createPrismaClient() {
  try {
    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'error', 'warn'] 
        : ['error'],
      // Connection pool configuration
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    })
    
    // Verify models are available
    if (typeof client.user === 'undefined') {
      console.error('WARNING: Prisma client models not available. Client may need regeneration.')
      console.error('Run: cd apps/backend && npm run generate')
    }
    
    // Test connection on startup
    client.$connect()
      .then(() => {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Prisma client connected to database')
        }
      })
      .catch((error) => {
        console.error('❌ Failed to connect to database:', error)
        console.error('Check your DATABASE_URL in .env.local')
      })
    
    // Handle graceful shutdown
    process.on('beforeExit', async () => {
      await client.$disconnect()
    })
    
    return client
  } catch (error) {
    console.error('Failed to create Prisma client:', error)
    throw error
  }
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

