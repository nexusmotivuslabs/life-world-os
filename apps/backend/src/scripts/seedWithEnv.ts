/**
 * Environment-Aware Seeding Script
 * 
 * Loads environment-specific .env files and runs the master seed script.
 * Supports: local, dev, staging, prod
 * 
 * Usage:
 *   npm run seed:local   - Seeds local database
 *   npm run seed:dev    - Seeds dev database
 *   npm run seed:staging - Seeds staging database
 *   npm run seed:prod   - Seeds prod database (use with caution)
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const execAsync = promisify(exec)

// Get environment from command line argument
const targetEnv = process.argv[2] || 'local'

// Map environment names to .env file paths
const envFileMap: Record<string, string> = {
  local: resolve(process.cwd(), 'apps/backend/.env'),
  dev: resolve(process.cwd(), '.env.dev'),
  staging: resolve(process.cwd(), '.env.staging'),
  prod: resolve(process.cwd(), '.env.prod'),
}

// Map environment names to display names
const envDisplayMap: Record<string, string> = {
  local: 'Local Development',
  dev: 'Development',
  staging: 'Staging',
  prod: 'Production',
}

async function loadEnvironment(env: string) {
  const envFile = envFileMap[env]
  const displayName = envDisplayMap[env] || env

  if (!envFile) {
    throw new Error(`Unknown environment: ${env}. Supported: ${Object.keys(envFileMap).join(', ')}`)
  }

  console.log(`\n🔧 Loading environment: ${displayName}`)
  console.log(`   Environment file: ${envFile}`)

  // Load the environment file
  const result = config({ path: envFile })

  if (result.error) {
    console.warn(`⚠️  Warning: Could not load ${envFile}`)
    console.warn(`   ${result.error.message}`)
    console.warn(`   Using system environment variables instead`)
  } else {
    console.log(`✅ Environment loaded from ${envFile}`)
  }

  // Display key environment variables (without sensitive values)
  const dbUrl = process.env.DATABASE_URL || process.env.DEV_DATABASE_URL || 
                process.env.STAGING_DATABASE_URL || process.env.PROD_DATABASE_URL
  if (dbUrl) {
    // Mask password in DATABASE_URL
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@')
    console.log(`   Database: ${maskedUrl}`)
  }

  const nodeEnv = process.env.NODE_ENV || 'development'
  console.log(`   NODE_ENV: ${nodeEnv}`)

  return {
    env,
    displayName,
    envFile,
    nodeEnv,
  }
}

async function runSeed(envInfo: { env: string; displayName: string; nodeEnv: string }) {
  console.log(`\n🌱 Starting seed process for ${envInfo.displayName}...`)
  console.log('═'.repeat(60))

  // Special handling for production
  if (envInfo.env === 'prod') {
    console.log('\n⚠️  WARNING: Production seeding is typically disabled for safety.')
    console.log('   Production databases should only be seeded during initial setup.')
    console.log('   Continuing in 3 seconds... (Ctrl+C to cancel)')
    await new Promise(resolve => setTimeout(resolve, 3000))
  }

  try {
    // Run the master seed script
    // The seed script will use DATABASE_URL from the loaded environment
    const seedScriptPath = resolve(__dirname, '../../prisma/seed.ts')
    const command = `tsx "${seedScriptPath}"`

    console.log(`\n📦 Executing seed script...`)
    const { stdout, stderr } = await execAsync(command, {
      env: {
        ...process.env,
        NODE_ENV: envInfo.nodeEnv,
      },
      cwd: resolve(__dirname, '../..'),
    })

    if (stdout) {
      console.log(stdout)
    }
    if (stderr) {
      console.error(stderr)
    }

    console.log(`\n✅ Seed process completed for ${envInfo.displayName}`)
  } catch (error: any) {
    console.error(`\n❌ Seed process failed for ${envInfo.displayName}:`)
    console.error(error.message)
    if (error.stdout) console.error('STDOUT:', error.stdout)
    if (error.stderr) console.error('STDERR:', error.stderr)
    process.exit(1)
  }
}

async function main() {
  try {
    // Load environment
    const envInfo = await loadEnvironment(targetEnv)

    // Run seed
    await runSeed(envInfo)

    console.log('\n' + '═'.repeat(60))
    console.log(`✅ Seeding complete for ${envInfo.displayName}`)
    console.log('═'.repeat(60))
  } catch (error: any) {
    console.error(`\n❌ Error: ${error.message}`)
    process.exit(1)
  }
}

main()




