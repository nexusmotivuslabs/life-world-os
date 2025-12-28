/**
 * Restore Database from Dump
 * 
 * Restores a pre-seeded database dump for fast initialization.
 * 
 * Usage:
 *   tsx seeds/scripts/restoreDump.ts dev
 *   tsx seeds/scripts/restoreDump.ts staging
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as crypto from 'crypto'
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

async function restoreDump(env: 'dev' | 'staging' | 'prod') {
  console.log(`\n📦 Restoring database dump for ${env} environment...`)
  console.log('═'.repeat(60))

  // Handle both root and backend directory execution
  const projectRoot = process.cwd().includes('apps/backend')
    ? path.join(process.cwd(), '..', '..')
    : process.cwd()
  const DUMP_DIR = path.join(projectRoot, 'seeds', 'dumps')
  const latestDumpPath = path.join(DUMP_DIR, `${env}-seeded-latest.dump`)

  // Check if dump file exists
  try {
    await fs.access(latestDumpPath)
  } catch {
    console.error(`\n❌ Dump file not found: ${latestDumpPath}`)
    console.error(`\n💡 Generate a dump first:`)
    console.error(`   npm run generate-dump:${env}`)
    process.exit(1)
  }

  // Read metadata if exists
  const metadataPath = latestDumpPath.replace('.dump', '.metadata.json')
  let metadata: any = null
  try {
    const metadataContent = await fs.readFile(metadataPath, 'utf-8')
    metadata = JSON.parse(metadataContent)
    console.log(`  📋 Dump metadata:`)
    console.log(`     Version: ${metadata.version}`)
    console.log(`     Created: ${metadata.timestamp}`)
    console.log(`     Records:`, metadata.recordCounts)
  } catch {
    console.log(`  ⚠️  No metadata file found`)
  }

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

  // Set PGPASSWORD for pg_restore
  process.env.PGPASSWORD = dbPassword

  console.log(`\n  🔄 Restoring dump...`)
  console.log(`     Database: ${dbName}`)
  console.log(`     Host: ${dbHost}:${dbPort}`)

  try {
    // Drop existing database (clean slate)
    console.log(`  🗑️  Dropping existing database (if exists)...`)
    try {
      await execAsync(
        `psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d postgres -c "DROP DATABASE IF EXISTS ${dbName};"`,
        {
          env: { ...process.env, PGPASSWORD: dbPassword },
        }
      )
    } catch (error: any) {
      // Ignore errors if database doesn't exist
      if (!error.message.includes('does not exist')) {
        throw error
      }
    }

    // Create new database
    console.log(`  🆕 Creating new database...`)
    await execAsync(
      `psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d postgres -c "CREATE DATABASE ${dbName};"`,
      {
        env: { ...process.env, PGPASSWORD: dbPassword },
      }
    )

    // Restore from dump
    console.log(`  📥 Restoring data from dump...`)
    await execAsync(
      `pg_restore -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -c "${latestDumpPath}"`,
      {
        env: { ...process.env, PGPASSWORD: dbPassword },
      }
    )

    console.log(`\n  ✅ Database restored successfully!`)

    // Verify checksum if metadata exists
    if (metadata) {
      console.log(`  🔐 Verifying dump integrity...`)
      const dumpBuffer = await fs.readFile(latestDumpPath)
      const checksum = crypto.createHash('sha256').update(dumpBuffer).digest('hex')
      if (checksum === metadata.checksum) {
        console.log(`  ✅ Checksum verified`)
      } else {
        console.log(`  ⚠️  Checksum mismatch (dump may have been modified)`)
      }
    }

    console.log(`\n  💡 Database is ready to use!`)
  } catch (error: any) {
    console.error(`\n  ❌ Failed to restore dump:`, error.message)
    throw error
  }
}

async function main() {
  const env = (process.argv[2] || 'dev') as 'dev' | 'staging' | 'prod'

  if (!['dev', 'staging', 'prod'].includes(env)) {
    console.error('❌ Invalid environment. Use: dev, staging, or prod')
    process.exit(1)
  }

  try {
    await restoreDump(env)
    console.log('\n✅ Done!\n')
  } catch (error) {
    console.error('\n❌ Error restoring dump:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { restoreDump }

