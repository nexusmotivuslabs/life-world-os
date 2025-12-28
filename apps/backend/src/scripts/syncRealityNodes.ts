/**
 * Sync Reality Nodes
 * 
 * Syncs Reality nodes from source data definitions to database.
 * Intelligently merges new fields without overwriting existing data.
 * 
 * Usage:
 *   npx tsx src/scripts/syncRealityNodes.ts [--source=seed] [--dry-run]
 */

import { PrismaClient, RealityNodeType } from '@prisma/client'
import { seedRealityHierarchy } from './seedRealityHierarchy.js'

const prisma = new PrismaClient()

interface SyncResult {
  synced: number
  created: number
  updated: number
  skipped: number
  errors: number
}

/**
 * Sync nodes from seed script definitions
 * This ensures all nodes in seed script are in database with latest template structure
 */
export async function syncFromSeed(dryRun: boolean = false): Promise<SyncResult> {
  const result: SyncResult = {
    synced: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  }

  console.log(`\n🔄 Syncing Reality Nodes from Seed Definitions${dryRun ? ' (DRY RUN)' : ''}...`)
  console.log('')

  try {
    // Run seed script which uses upsert - this will update existing nodes
    if (!dryRun) {
      await seedRealityHierarchy()
      console.log('✅ Seed script executed - all nodes synced')
    } else {
      console.log('🔍 DRY RUN: Would execute seed script')
    }

    // Count results
    const laws = await prisma.realityNode.count({
      where: { nodeType: RealityNodeType.LAW },
    })
    const principles = await prisma.realityNode.count({
      where: { nodeType: RealityNodeType.PRINCIPLE },
    })
    const frameworks = await prisma.realityNode.count({
      where: { nodeType: RealityNodeType.FRAMEWORK },
    })

    result.synced = laws + principles + frameworks

    console.log(`\n📊 Sync Summary:`)
    console.log(`   Laws: ${laws}`)
    console.log(`   Principles: ${principles}`)
    console.log(`   Frameworks: ${frameworks}`)
    console.log(`   Total: ${result.synced}`)

    return result
  } catch (error) {
    console.error('❌ Sync failed:', error)
    throw error
  }
}

/**
 * Check version consistency across nodes
 */
export async function checkVersionConsistency(): Promise<{
  consistent: boolean
  inconsistencies: Array<{
    nodeId: string
    title: string
    nodeType: string
    currentVersion: string | null
    expectedVersion: string
  }>
}> {
  const TEMPLATE_VERSIONS = {
    LAW: '2.0.0',
    PRINCIPLE: '2.0.0',
    FRAMEWORK: '2.0.0',
  }

  const inconsistencies: Array<{
    nodeId: string
    title: string
    nodeType: string
    currentVersion: string | null
    expectedVersion: string
  }> = []

  // Check Laws
  const laws = await prisma.realityNode.findMany({
    where: { nodeType: RealityNodeType.LAW },
    select: { id: true, title: true, metadata: true },
  })

  for (const law of laws) {
    const metadata = law.metadata as Record<string, any> | null
    const currentVersion = metadata?._version || null
    if (currentVersion !== TEMPLATE_VERSIONS.LAW) {
      inconsistencies.push({
        nodeId: law.id,
        title: law.title,
        nodeType: 'LAW',
        currentVersion,
        expectedVersion: TEMPLATE_VERSIONS.LAW,
      })
    }
  }

  // Check Principles
  const principles = await prisma.realityNode.findMany({
    where: { nodeType: RealityNodeType.PRINCIPLE },
    select: { id: true, title: true, metadata: true },
  })

  for (const principle of principles) {
    const metadata = principle.metadata as Record<string, any> | null
    const currentVersion = metadata?._version || null
    if (currentVersion !== TEMPLATE_VERSIONS.PRINCIPLE) {
      inconsistencies.push({
        nodeId: principle.id,
        title: principle.title,
        nodeType: 'PRINCIPLE',
        currentVersion,
        expectedVersion: TEMPLATE_VERSIONS.PRINCIPLE,
      })
    }
  }

  // Check Frameworks
  const frameworks = await prisma.realityNode.findMany({
    where: { nodeType: RealityNodeType.FRAMEWORK },
    select: { id: true, title: true, metadata: true },
  })

  for (const framework of frameworks) {
    const metadata = framework.metadata as Record<string, any> | null
    const currentVersion = metadata?._version || null
    if (currentVersion !== TEMPLATE_VERSIONS.FRAMEWORK) {
      inconsistencies.push({
        nodeId: framework.id,
        title: framework.title,
        nodeType: 'FRAMEWORK',
        currentVersion,
        expectedVersion: TEMPLATE_VERSIONS.FRAMEWORK,
      })
    }
  }

  return {
    consistent: inconsistencies.length === 0,
    inconsistencies,
  }
}

// CLI execution
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     process.argv[1]?.endsWith('syncRealityNodes.ts') ||
                     process.argv[1]?.endsWith('syncRealityNodes.js')

if (isMainModule) {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const checkOnly = args.includes('--check')

  if (checkOnly) {
    checkVersionConsistency()
      .then(({ consistent, inconsistencies }) => {
        if (consistent) {
          console.log('✅ All nodes are at current version')
        } else {
          console.log(`⚠️  Found ${inconsistencies.length} nodes with outdated versions:`)
          inconsistencies.forEach(inc => {
            console.log(`   - ${inc.title} (${inc.nodeType}): ${inc.currentVersion || 'none'} → ${inc.expectedVersion}`)
          })
        }
        process.exit(consistent ? 0 : 1)
      })
      .catch((error) => {
        console.error('❌ Version check failed:', error)
        process.exit(1)
      })
      .finally(() => {
        prisma.$disconnect()
      })
  } else {
    syncFromSeed(dryRun)
      .then(() => {
        console.log('\n✅ Sync script completed')
        process.exit(0)
      })
      .catch((error) => {
        console.error('❌ Sync script failed:', error)
        process.exit(1)
      })
      .finally(() => {
        prisma.$disconnect()
      })
  }
}

