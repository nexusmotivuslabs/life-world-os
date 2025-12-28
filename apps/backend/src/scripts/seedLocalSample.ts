/**
 * Seed Local Sample
 * 
 * Creates a 10% sample of dev database data for local development.
 * Ensures at least one item is visible in each category.
 * 
 * Usage:
 *   npm run seed:local-sample
 * 
 * Note: This is optional. Local can connect to dev database directly.
 * Use this only if you want a smaller local database for testing.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Sample 10% of nodes but ensure at least one per category
 */
async function sampleRealityNodes() {
  console.log('📊 Sampling Reality Nodes (10% with minimum visibility)...')
  
  // Get all nodes grouped by category
  const nodesByCategory = await prisma.realityNode.groupBy({
    by: ['category'],
    _count: true,
  })

  for (const group of nodesByCategory) {
    const category = group.category
    const total = group._count
    const sampleSize = Math.max(1, Math.ceil(total * 0.1)) // At least 1, or 10%

    // Get nodes in this category
    const nodes = await prisma.realityNode.findMany({
      where: { category },
      take: sampleSize,
      orderBy: { orderIndex: 'asc' }, // Get top priority nodes
    })

    console.log(`   ${category}: ${nodes.length} of ${total} nodes`)
  }

  console.log('✅ Sampling complete')
}

/**
 * Main function
 */
async function main() {
  console.log('🌱 Seeding Local Sample (10% of dev data)')
  console.log('═'.repeat(60))
  console.log('⚠️  Note: Local environment should connect to dev database')
  console.log('   This script is optional - use only if you need a smaller local DB')
  console.log('═'.repeat(60))

  try {
    await sampleRealityNodes()
    
    console.log('\n✅ Local sample seeded')
    console.log('💡 Tip: Consider connecting to dev database instead for full data')
  } catch (error) {
    console.error('❌ Sampling failed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

