/**
 * Migrate Reality Nodes
 * 
 * Migrates existing Reality nodes to new template structures.
 * Handles versioning and incremental updates without losing existing data.
 * 
 * Usage:
 *   npx tsx src/scripts/migrateRealityNodes.ts [--dry-run] [--version=2.0.0]
 */

import { PrismaClient, RealityNodeType } from '@prisma/client'

const prisma = new PrismaClient()

// Template version tracking
const TEMPLATE_VERSIONS = {
  LAW: '2.0.0',
  PRINCIPLE: '2.0.0',
  FRAMEWORK: '2.0.0',
} as const

interface MigrationResult {
  updated: number
  skipped: number
  errors: number
  details: Array<{
    nodeId: string
    title: string
    action: 'updated' | 'skipped' | 'error'
    reason?: string
  }>
}

/**
 * Merge metadata objects, preserving existing fields while adding new ones
 */
function mergeMetadata(
  existing: Record<string, any> | null,
  newFields: Record<string, any>
): Record<string, any> {
  if (!existing) return newFields
  
  // Merge: new fields take precedence, but preserve existing fields not in newFields
  return {
    ...existing,
    ...newFields,
    // Preserve version tracking
    _version: newFields._version || existing._version,
    _lastMigrated: new Date().toISOString(),
  }
}

/**
 * Check if node needs migration based on version
 */
function needsMigration(
  nodeMetadata: Record<string, any> | null,
  currentVersion: string
): boolean {
  if (!nodeMetadata) return true
  const nodeVersion = nodeMetadata._version || '1.0.0'
  return nodeVersion !== currentVersion
}

/**
 * Migrate a single law node to new template structure
 */
async function migrateLawNode(node: any, dryRun: boolean): Promise<'updated' | 'skipped' | 'error'> {
  try {
    const existingMetadata = node.metadata as Record<string, any> | null
    
    // Check if already migrated
    if (!needsMigration(existingMetadata, TEMPLATE_VERSIONS.LAW)) {
      return 'skipped'
    }

    // Get law definition from seed script (would need to import or refetch)
    // For now, we'll update based on what's in metadata
    const newMetadata = mergeMetadata(existingMetadata, {
      _version: TEMPLATE_VERSIONS.LAW,
      _templateType: 'law',
      // Preserve existing fields, add missing template fields if not present
      derivedFrom: existingMetadata?.derivedFrom || [],
      statement: existingMetadata?.statement || node.description || '',
      recursiveBehavior: existingMetadata?.recursiveBehavior || '',
      violationOutcome: existingMetadata?.violationOutcome || '',
      whyThisLawPersists: existingMetadata?.whyThisLawPersists || '',
    })

    if (!dryRun) {
      await prisma.realityNode.update({
        where: { id: node.id },
        data: { metadata: newMetadata },
      })
    }

    return 'updated'
  } catch (error) {
    console.error(`Error migrating law node ${node.id}:`, error)
    return 'error'
  }
}

/**
 * Migrate a single principle node to new template structure
 */
async function migratePrincipleNode(node: any, dryRun: boolean): Promise<'updated' | 'skipped' | 'error'> {
  try {
    const existingMetadata = node.metadata as Record<string, any> | null
    
    if (!needsMigration(existingMetadata, TEMPLATE_VERSIONS.PRINCIPLE)) {
      return 'skipped'
    }

    const newMetadata = mergeMetadata(existingMetadata, {
      _version: TEMPLATE_VERSIONS.PRINCIPLE,
      _templateType: 'principle',
      // Use alignedWith if exists, otherwise check derivedFrom for backward compatibility
      alignedWith: existingMetadata?.alignedWith || existingMetadata?.derivedFrom || [],
      principle: existingMetadata?.principle || node.description || '',
      whyItWorks: existingMetadata?.whyItWorks || '',
      violationPattern: existingMetadata?.violationPattern || '',
      predictableResult: existingMetadata?.predictableResult || '',
    })

    if (!dryRun) {
      await prisma.realityNode.update({
        where: { id: node.id },
        data: { metadata: newMetadata },
      })
    }

    return 'updated'
  } catch (error) {
    console.error(`Error migrating principle node ${node.id}:`, error)
    return 'error'
  }
}

/**
 * Migrate a single framework node to new template structure
 */
async function migrateFrameworkNode(node: any, dryRun: boolean): Promise<'updated' | 'skipped' | 'error'> {
  try {
    const existingMetadata = node.metadata as Record<string, any> | null
    
    if (!needsMigration(existingMetadata, TEMPLATE_VERSIONS.FRAMEWORK)) {
      return 'skipped'
    }

    const newMetadata = mergeMetadata(existingMetadata, {
      _version: TEMPLATE_VERSIONS.FRAMEWORK,
      _templateType: 'framework',
      basedOn: existingMetadata?.basedOn || [],
      purpose: existingMetadata?.purpose || node.description || '',
      structure: existingMetadata?.structure || '',
      whenToUse: existingMetadata?.whenToUse || '',
      whenNotToUse: existingMetadata?.whenNotToUse || '',
    })

    if (!dryRun) {
      await prisma.realityNode.update({
        where: { id: node.id },
        data: { metadata: newMetadata },
      })
    }

    return 'updated'
  } catch (error) {
    console.error(`Error migrating framework node ${node.id}:`, error)
    return 'error'
  }
}

/**
 * Main migration function
 */
export async function migrateRealityNodes(dryRun: boolean = false): Promise<MigrationResult> {
  const result: MigrationResult = {
    updated: 0,
    skipped: 0,
    errors: 0,
    details: [],
  }

  console.log(`\n🔄 Starting Reality Node Migration${dryRun ? ' (DRY RUN)' : ''}...`)
  console.log(`Template Versions:`, TEMPLATE_VERSIONS)
  console.log('')

  try {
    // Migrate Laws
    console.log('📜 Migrating Laws...')
    const laws = await prisma.realityNode.findMany({
      where: { nodeType: RealityNodeType.LAW },
    })

    for (const law of laws) {
      const action = await migrateLawNode(law, dryRun)
      result[action]++
      result.details.push({
        nodeId: law.id,
        title: law.title,
        action,
        reason: action === 'skipped' ? 'Already at current version' : undefined,
      })
    }

    // Migrate Principles
    console.log('💡 Migrating Principles...')
    const principles = await prisma.realityNode.findMany({
      where: { nodeType: RealityNodeType.PRINCIPLE },
    })

    for (const principle of principles) {
      const action = await migratePrincipleNode(principle, dryRun)
      result[action]++
      result.details.push({
        nodeId: principle.id,
        title: principle.title,
        action,
        reason: action === 'skipped' ? 'Already at current version' : undefined,
      })
    }

    // Migrate Frameworks
    console.log('🔧 Migrating Frameworks...')
    const frameworks = await prisma.realityNode.findMany({
      where: { nodeType: RealityNodeType.FRAMEWORK },
    })

    for (const framework of frameworks) {
      const action = await migrateFrameworkNode(framework, dryRun)
      result[action]++
      result.details.push({
        nodeId: framework.id,
        title: framework.title,
        action,
        reason: action === 'skipped' ? 'Already at current version' : undefined,
      })
    }

    console.log('\n✅ Migration Complete!')
    console.log(`   Updated: ${result.updated}`)
    console.log(`   Skipped: ${result.skipped}`)
    console.log(`   Errors: ${result.errors}`)

    return result
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

// CLI execution
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     process.argv[1]?.endsWith('migrateRealityNodes.ts') ||
                     process.argv[1]?.endsWith('migrateRealityNodes.js')

if (isMainModule) {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const version = args.find(arg => arg.startsWith('--version='))?.split('=')[1]

  migrateRealityNodes(dryRun)
    .then(() => {
      console.log('\n✅ Migration script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error)
      process.exit(1)
    })
    .finally(() => {
      prisma.$disconnect()
    })
}

