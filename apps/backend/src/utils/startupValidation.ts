/**
 * Startup Validation
 * 
 * Validates critical system dependencies before allowing the app to start.
 * Similar to Spring's contextLoad - the app will not start if validation fails.
 */

import { prisma } from '../lib/prisma.js'
import { logger } from '../lib/logger.js'

export interface ValidationResult {
  name: string
  passed: boolean
  message: string
  error?: Error
}

export interface ValidationSummary {
  allPassed: boolean
  results: ValidationResult[]
  totalChecks: number
  passedChecks: number
  failedChecks: number
}

/**
 * Validate database connection
 */
async function validateDatabase(): Promise<ValidationResult> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return {
      name: 'Database Connection',
      passed: true,
      message: 'Database connection successful',
    }
  } catch (error) {
    return {
      name: 'Database Connection',
      passed: false,
      message: 'Failed to connect to database',
      error: error instanceof Error ? error : new Error(String(error)),
    }
  }
}

/**
 * Validate required environment variables
 */
function validateEnvironmentVariables(): ValidationResult {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
  ]

  const missing: string[] = []

  for (const varName of required) {
    if (!process.env[varName]) {
      missing.push(varName)
    }
  }

  if (missing.length > 0) {
    return {
      name: 'Environment Variables',
      passed: false,
      message: `Missing required environment variables: ${missing.join(', ')}`,
    }
  }

  return {
    name: 'Environment Variables',
    passed: true,
    message: 'All required environment variables are set',
  }
}

/**
 * Validate database schema (check if critical tables exist)
 */
async function validateDatabaseSchema(): Promise<ValidationResult> {
  try {
    // Check if critical tables exist by querying them
    const tables = [
      'users',
      'agents',
      'teams',
      'power_laws',
      'bible_laws',
    ]

    const missingTables: string[] = []

    for (const table of tables) {
      try {
        await prisma.$queryRawUnsafe(`SELECT 1 FROM "${table}" LIMIT 1`)
      } catch (error: any) {
        // If table doesn't exist, Prisma will throw an error
        if (error?.code === '42P01' || error?.message?.includes('does not exist')) {
          missingTables.push(table)
        } else {
          // Other errors might be okay (e.g., no rows), so we'll allow them
        }
      }
    }

    if (missingTables.length > 0) {
      return {
        name: 'Database Schema',
        passed: false,
        message: `Missing critical tables: ${missingTables.join(', ')}. Run migrations first.`,
      }
    }

    return {
      name: 'Database Schema',
      passed: true,
      message: 'All critical tables exist',
    }
  } catch (error) {
    return {
      name: 'Database Schema',
      passed: false,
      message: 'Failed to validate database schema',
      error: error instanceof Error ? error : new Error(String(error)),
    }
  }
}

/**
 * Validate that 48 Laws of Power are seeded
 */
async function validatePowerLawsSeeded(): Promise<ValidationResult> {
  try {
    const count = await prisma.powerLaw.count({
      where: {
        domain: 'MONEY',
      },
    })

    if (count < 48) {
      return {
        name: '48 Laws of Power',
        passed: false,
        message: `Only ${count} power laws found. Expected 48. Run seed script: npx tsx src/scripts/seedPowerLaws.ts`,
      }
    }

    return {
      name: '48 Laws of Power',
      passed: true,
      message: `All 48 laws are seeded (found ${count})`,
    }
  } catch (error) {
    return {
      name: '48 Laws of Power',
      passed: false,
      message: 'Failed to validate power laws',
      error: error instanceof Error ? error : new Error(String(error)),
    }
  }
}

/**
 * Validate that agents are seeded
 */
async function validateAgentsSeeded(): Promise<ValidationResult> {
  try {
    const count = await prisma.agent.count()

    if (count < 7) {
      return {
        name: 'Master Money Agents',
        passed: false,
        message: `Only ${count} agents found. Expected at least 7. Run seed script: npx tsx src/scripts/seedAgents.ts`,
      }
    }

    return {
      name: 'Master Money Agents',
      passed: true,
      message: `Agents are seeded (found ${count})`,
    }
  } catch (error) {
    return {
      name: 'Master Money Agents',
      passed: false,
      message: 'Failed to validate agents',
      error: error instanceof Error ? error : new Error(String(error)),
    }
  }
}

/**
 * Validate that Bible Laws are seeded
 */
async function validateBibleLawsSeeded(): Promise<ValidationResult> {
  try {
    const moneyCount = await prisma.bibleLaw.count({
      where: {
        domain: 'MONEY',
      },
    })

    const investmentCount = await prisma.bibleLaw.count({
      where: {
        domain: 'INVESTMENT',
      },
    })

    const totalCount = moneyCount + investmentCount

    if (moneyCount < 10) {
      return {
        name: 'Bible Laws',
        passed: false,
        message: `Only ${moneyCount} Money domain laws found. Expected at least 10. Run seed script: npx tsx src/scripts/seedBibleLaws.ts`,
      }
    }

    if (investmentCount < 5) {
      return {
        name: 'Bible Laws',
        passed: false,
        message: `Only ${investmentCount} Investment domain laws found. Expected at least 5. Run seed script: npx tsx src/scripts/seedBibleLaws.ts`,
      }
    }

    return {
      name: 'Bible Laws',
      passed: true,
      message: `Bible laws are seeded (Money: ${moneyCount}, Investment: ${investmentCount}, Total: ${totalCount})`,
    }
  } catch (error) {
    return {
      name: 'Bible Laws',
      passed: false,
      message: 'Failed to validate Bible laws',
      error: error instanceof Error ? error : new Error(String(error)),
    }
  }
}

/**
 * Validate Travel System API configuration (optional - warns if missing)
 */
async function validateGooglePlacesApi(): Promise<ValidationResult> {
  const googlePlacesKey = process.env.GOOGLE_PLACES_API_KEY
  const groqKey = process.env.GROQ_API_KEY
  const openaiKey = process.env.OPENAI_API_KEY
  const useLLM = process.env.USE_LLM_FOR_LOCATIONS === 'true' || !googlePlacesKey

  if (useLLM) {
    if (groqKey) {
      return {
        name: 'Travel System (LLM)',
        passed: true,
        message: 'Using Groq LLM for location recommendations (cost-effective)',
      }
    } else if (openaiKey) {
      return {
        name: 'Travel System (LLM)',
        passed: true,
        message: 'Using OpenAI LLM for location recommendations',
      }
    } else {
      return {
        name: 'Travel System (LLM)',
        passed: false,
        message: 'No LLM API key configured (GROQ_API_KEY or OPENAI_API_KEY recommended for cost-effective location recommendations)',
      }
    }
  } else {
    if (!googlePlacesKey) {
      return {
        name: 'Travel System (Google Places)',
        passed: false,
        message: 'Google Places API key not configured. Consider using LLM instead (set USE_LLM_FOR_LOCATIONS=true and GROQ_API_KEY)',
      }
    }
    return {
      name: 'Travel System (Google Places)',
      passed: true,
      message: 'Google Places API configured',
    }
  }
}

/**
 * Validate that Awareness Layers are seeded
 */
async function validateAwarenessLayersSeeded(): Promise<ValidationResult> {
  try {
    const bibleLayer = await prisma.awarenessLayer.findUnique({
      where: { id: 'bible-awareness-layer' },
    })

    const peopleLayer = await prisma.awarenessLayer.findUnique({
      where: { id: 'people-awareness-layer' },
    })

    const nihilismLayer = await prisma.awarenessLayer.findUnique({
      where: { id: 'nihilism-awareness-layer' },
    })

    const totalCount = await prisma.awarenessLayer.count()

    if (!bibleLayer) {
      return {
        name: 'Awareness Layers',
        passed: false,
        message: 'Bible awareness layer not found. Run seed script: npx tsx src/scripts/seedAwarenessLayers.ts',
      }
    }

    if (!peopleLayer) {
      return {
        name: 'Awareness Layers',
        passed: false,
        message: 'People awareness layer not found. Run seed script: npx tsx src/scripts/seedAwarenessLayers.ts',
      }
    }

    if (!nihilismLayer) {
      return {
        name: 'Awareness Layers',
        passed: false,
        message: 'Nihilism awareness layer not found. Run seed script: npx tsx src/scripts/seedAwarenessLayers.ts',
      }
    }

    // Verify Bible is ROOT with orderIndex 1
    if (bibleLayer.category !== 'ROOT' || bibleLayer.orderIndex !== 1) {
      return {
        name: 'Awareness Layers',
        passed: false,
        message: 'Bible layer must be ROOT category with orderIndex 1',
      }
    }

    // Verify Nihilism is EXAMINE with People as parent
    if (nihilismLayer.category !== 'EXAMINE' || nihilismLayer.parentId !== peopleLayer.id) {
      return {
        name: 'Awareness Layers',
        passed: false,
        message: 'Nihilism layer must be EXAMINE category with People as parent',
      }
    }

    return {
      name: 'Awareness Layers',
      passed: true,
      message: `Awareness layers are seeded (Bible: ROOT #1, People: ROOT, Nihilism: EXAMINE, Total: ${totalCount})`,
    }
  } catch (error) {
    return {
      name: 'Awareness Layers',
      passed: false,
      message: 'Failed to validate awareness layers',
      error: error instanceof Error ? error : new Error(String(error)),
    }
  }
}

/**
 * Run all startup validations
 */
export async function runStartupValidation(): Promise<ValidationSummary> {
  logger.info('🔍 Running startup validation...\n')

  const results: ValidationResult[] = []

  // 1. Environment Variables (synchronous)
  const envResult = validateEnvironmentVariables()
  results.push(envResult)
  logger.info(`${envResult.passed ? '✅' : '❌'} ${envResult.name}: ${envResult.message}`)

  // 2. Database Connection (async)
  const dbResult = await validateDatabase()
  results.push(dbResult)
  logger.info(`${dbResult.passed ? '✅' : '❌'} ${dbResult.name}: ${dbResult.message}`)

  // Only continue if database is connected
  if (!dbResult.passed) {
    return {
      allPassed: false,
      results,
      totalChecks: results.length,
      passedChecks: results.filter(r => r.passed).length,
      failedChecks: results.filter(r => !r.passed).length,
    }
  }

  // 3. Database Schema (async, requires DB connection)
  const schemaResult = await validateDatabaseSchema()
  results.push(schemaResult)
  logger.info(`${schemaResult.passed ? '✅' : '❌'} ${schemaResult.name}: ${schemaResult.message}`)

  // Only continue if schema is valid
  if (!schemaResult.passed) {
    return {
      allPassed: false,
      results,
      totalChecks: results.length,
      passedChecks: results.filter(r => r.passed).length,
      failedChecks: results.filter(r => !r.passed).length,
    }
  }

  // 4. Power Laws Seeded (async, requires DB connection)
  const powerLawsResult = await validatePowerLawsSeeded()
  results.push(powerLawsResult)
  logger.info(`${powerLawsResult.passed ? '✅' : '❌'} ${powerLawsResult.name}: ${powerLawsResult.message}`)

  // 5. Agents Seeded (async, requires DB connection)
  const agentsResult = await validateAgentsSeeded()
  results.push(agentsResult)
  logger.info(`${agentsResult.passed ? '✅' : '❌'} ${agentsResult.name}: ${agentsResult.message}`)

  // 6. Bible Laws Seeded (async, requires DB connection)
  const bibleLawsResult = await validateBibleLawsSeeded()
  results.push(bibleLawsResult)
  logger.info(`${bibleLawsResult.passed ? '✅' : '❌'} ${bibleLawsResult.name}: ${bibleLawsResult.message}`)

  // 7. Awareness Layers Seeded (async, requires DB connection)
  const awarenessLayersResult = await validateAwarenessLayersSeeded()
  results.push(awarenessLayersResult)
  logger.info(`${awarenessLayersResult.passed ? '✅' : '❌'} ${awarenessLayersResult.name}: ${awarenessLayersResult.message}`)

  // 8. Google Places API (optional - warns if missing but doesn't block startup)
  const googlePlacesResult = await validateGooglePlacesApi()
  results.push(googlePlacesResult)
  logger.info(`${googlePlacesResult.passed ? '✅' : '⚠️'} ${googlePlacesResult.name}: ${googlePlacesResult.message}`)

  // Count only critical failures (exclude Travel System warnings)
  const criticalFailures = results.filter(r => !r.passed && !r.name.includes('Travel System')).length
  const passedChecks = results.filter(r => r.passed).length
  const failedChecks = results.filter(r => !r.passed).length
  const allPassed = criticalFailures === 0

  logger.info(`\n📊 Validation Summary: ${passedChecks}/${results.length} checks passed`)

  return {
    allPassed,
    results,
    totalChecks: results.length,
    passedChecks,
    failedChecks,
  }
}

/**
 * Validate and exit if validation fails
 */
export async function validateAndExit(): Promise<void> {
  const summary = await runStartupValidation()

  if (!summary.allPassed) {
    logger.error('\n❌ Startup validation failed!')
    logger.error('\nFailed checks:')
    summary.results
      .filter(r => !r.passed)
      .forEach(r => {
        logger.error(`  - ${r.name}: ${r.message}`)
        if (r.error) {
          logger.error(`    Error: ${r.error.message}`)
        }
      })
    
    // Allow staging environment to start with warnings
    if (process.env.NODE_ENV === 'staging') {
      logger.error('\n⚠️  Starting in staging mode with validation warnings.')
      logger.error('   Seed scripts should be run for full functionality.')
      logger.error('   Application will start but some features may not work.\n')
      return // Don't exit, just warn
    }
    
    logger.error('\n⚠️  Application will not start until all validations pass.')
    logger.error('Please fix the issues above and restart the application.\n')
    
    // Don't disconnect prisma here - it's a singleton that other parts of the app use
    process.exit(1)
  }

  logger.info('✅ All startup validations passed!\n')
  // Don't disconnect prisma here - it's a singleton that other parts of the app use
}

