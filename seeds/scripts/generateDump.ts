/**
 * Generate Seeded Database Dump
 * 
 * Creates a pre-seeded database dump for fast initialization.
 * Run this AFTER seeding the database with all required data.
 * 
 * Usage:
 *   tsx seeds/scripts/generateDump.ts dev
 *   tsx seeds/scripts/generateDump.ts staging
 */

import { PrismaClient } from '@prisma/client'
import { exec } from 'child_process'
import { promisify } from 'util'
import * as crypto from 'crypto'
import * as fs from 'fs/promises'
import * as path from 'path'
import { config } from 'dotenv'

// Load environment variables
const projectRoot = process.cwd().includes('apps/backend') 
  ? path.join(process.cwd(), '..', '..')
  : process.cwd()

// Try loading .env files
config({ path: path.join(projectRoot, 'apps', 'backend', '.env') })
config({ path: path.join(projectRoot, 'apps', 'backend', '.env.local') })
config({ path: path.join(projectRoot, '.env.dev') })

const execAsync = promisify(exec)
const prisma = new PrismaClient()

interface DumpMetadata {
  version: string
  timestamp: string
  recordCounts: Record<string, number>
  checksum: string
  environment: string
}

async function getRecordCounts(prisma: PrismaClient): Promise<Record<string, number>> {
  try {
    const [
      realityNodes,
      userArtifacts,
      powerLaws,
      bibleLaws,
      agents,
      teams,
      loadoutItems,
      trainingModules,
    ] = await Promise.all([
      prisma.realityNode.count().catch(() => 0),
      prisma.userArtifact.count().catch(() => 0),
      prisma.powerLaw.count().catch(() => 0),
      prisma.bibleLaw.count().catch(() => 0),
      prisma.agent.count().catch(() => 0),
      prisma.team.count().catch(() => 0),
      prisma.loadoutItem.count().catch(() => 0),
      prisma.trainingModule.count().catch(() => 0),
    ])

    return {
      realityNodes,
      userArtifacts,
      powerLaws,
      bibleLaws,
      agents,
      teams,
      loadoutItems,
      trainingModules,
    }
  } catch (error) {
    console.error('Error getting record counts:', error)
    return {}
  }
}

async function getSchemaVersion(): Promise<string> {
  try {
    // Try to get git commit hash
    const { stdout } = await execAsync('git rev-parse --short HEAD', { cwd: process.cwd() })
    return stdout.trim()
  } catch {
    // Fallback to timestamp-based version
    return `snapshot-${Date.now().toString(36)}`
  }
}

async function generateDump(env: 'dev' | 'staging' | 'prod') {
  console.log(`\n🔨 Generating seeded dump for ${env} environment...`)
  console.log('═'.repeat(60))

  // Handle both root and backend directory execution
  const projectRoot = process.cwd().includes('apps/backend') 
    ? path.join(process.cwd(), '..', '..')
    : process.cwd()
  const DUMP_DIR = path.join(projectRoot, 'seeds', 'dumps')
  await fs.mkdir(DUMP_DIR, { recursive: true })

  // Get database connection info from environment
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable not set')
  }

  // Parse database URL
  const url = new URL(dbUrl)
  const dbHost = url.hostname
  const dbPort = url.port || '5432'
  const dbUser = url.username
  const dbName = url.pathname.slice(1) // Remove leading slash
  const dbPassword = url.password

  // Set PGPASSWORD for pg_dump
  process.env.PGPASSWORD = dbPassword

  console.log(`  📊 Checking database state...`)
  const recordCounts = await getRecordCounts(prisma)

  // Check if database has data
  const totalRecords = Object.values(recordCounts).reduce((sum, count) => sum + count, 0)
  if (totalRecords === 0) {
    console.log('  ⚠️  Database appears to be empty.')
    console.log('  💡 Run seed script first: npm run seed')
    console.log('  💡 Or the database may be empty, which is okay for initial setup.')
  } else {
    console.log('  ✅ Database has data:')
    Object.entries(recordCounts).forEach(([table, count]) => {
      if (count > 0) {
        console.log(`     ${table}: ${count}`)
      }
    })
  }

  // Get schema version
  const schemaVersion = await getSchemaVersion()
  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '')

  // Create dump filename
  const dumpFileName = `${env}-seeded-v${schemaVersion}-${timestamp}.dump`
  const dumpPath = path.join(DUMP_DIR, dumpFileName)

  console.log(`\n  📦 Creating dump: ${dumpFileName}...`)

  try {
    // Create dump using pg_dump
    await execAsync(
      `pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -Fc -f "${dumpPath}"`,
      {
        env: { ...process.env, PGPASSWORD: dbPassword },
      }
    )

    console.log(`  ✅ Dump created successfully`)
  } catch (error: any) {
    console.error(`  ❌ Failed to create dump:`, error.message)
    throw error
  }

  // Calculate checksum
  console.log(`  🔐 Calculating checksum...`)
  const dumpBuffer = await fs.readFile(dumpPath)
  const checksum = crypto.createHash('sha256').update(dumpBuffer).digest('hex')
  const fileStats = await fs.stat(dumpPath)
  const fileSizeMB = (fileStats.size / (1024 * 1024)).toFixed(2)

  // Create metadata
  const metadata: DumpMetadata = {
    version: schemaVersion,
    timestamp: new Date().toISOString(),
    recordCounts,
    checksum,
    environment: env,
  }

  const metadataPath = dumpPath.replace('.dump', '.metadata.json')
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2))

  // Create symlink to latest (remove old one first)
  const latestPath = path.join(DUMP_DIR, `${env}-seeded-latest.dump`)
  try {
    await fs.unlink(latestPath)
  } catch {
    // Ignore if doesn't exist
  }
  await fs.symlink(path.basename(dumpPath), latestPath)

  // Also create symlink for metadata
  const latestMetadataPath = path.join(DUMP_DIR, `${env}-seeded-latest.metadata.json`)
  try {
    await fs.unlink(latestMetadataPath)
  } catch {
    // Ignore if doesn't exist
  }
  await fs.symlink(path.basename(metadataPath), latestMetadataPath)

  console.log(`\n  ✅ Dump generation complete!`)
  console.log(`     File: ${dumpPath}`)
  console.log(`     Size: ${fileSizeMB} MB`)
  console.log(`     Checksum: ${checksum.substring(0, 16)}...`)
  console.log(`     Latest symlink: ${latestPath}`)
  console.log(`\n  💡 Use this dump for fast database initialization`)
  console.log(`     Restore with: npm run restore-db:${env}`)

  await prisma.$disconnect()
  return { dumpPath, metadata }
}

async function main() {
  const env = (process.argv[2] || 'dev') as 'dev' | 'staging' | 'prod'

  if (!['dev', 'staging', 'prod'].includes(env)) {
    console.error('❌ Invalid environment. Use: dev, staging, or prod')
    process.exit(1)
  }

  try {
    await generateDump(env)
    console.log('\n✅ Done!\n')
  } catch (error) {
    console.error('\n❌ Error generating dump:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { generateDump, getRecordCounts }

