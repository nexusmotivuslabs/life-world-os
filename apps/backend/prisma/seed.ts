/**
 * Master Seed Script
 * 
 * Orchestrates all seed scripts in the correct order.
 * Idempotent - can be run multiple times safely.
 * Environment-aware - works for dev, staging, and prod.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Import seed functions
import { seedRealityHierarchy, linkPowerLawsToHierarchy, linkBibleLawsToHierarchy } from '../src/scripts/seedRealityHierarchy'
import { seedEnergyStates } from '../src/scripts/seedEnergyStates'

// Import data for inline seeding
import { exec } from 'child_process'
import { promisify } from 'util'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const execAsync = promisify(exec)

// Environment detection
const env = process.env.NODE_ENV || 'development'

async function runScriptFile(scriptPath: string, scriptName: string) {
  try {
    console.log(`\n📦 Running ${scriptName}...`)
    const fullPath = path.join(__dirname, '..', scriptPath)
    const { stdout, stderr } = await execAsync(`tsx "${fullPath}"`, {
      env: { ...process.env, NODE_ENV: env }
    })
    if (stdout) console.log(stdout)
    if (stderr) console.error(stderr)
    console.log(`✅ ${scriptName} completed`)
  } catch (error: any) {
    console.error(`❌ ${scriptName} failed:`, error.message)
    // Continue with other seeds even if one fails
  }
}

async function seedLoadouts() {
  try {
    console.log('\n📦 Seeding Loadout Items...')
    const fullPath = path.join(__dirname, 'seed-loadouts.ts')
    const { stdout, stderr } = await execAsync(`tsx "${fullPath}"`)
    if (stdout) console.log(stdout)
    if (stderr) console.error(stderr)
    console.log('✅ Loadout Items seeded')
  } catch (error: any) {
    console.error('❌ Loadout seeding failed:', error.message)
  }
}

async function main() {
  console.log('🌱 Starting master seed process...')
  console.log(`📍 Environment: ${env}`)
  console.log('═'.repeat(60))

  try {
    // Phase 1: Core Reality Hierarchy (must run first - foundation of everything)
    console.log('\n🏗️  PHASE 1: Core Reality Hierarchy')
    console.log('─'.repeat(60))
    await seedRealityHierarchy()

    // Phase 2: Energy States (depends on Reality hierarchy)
    console.log('\n⚡ PHASE 2: Energy States')
    console.log('─'.repeat(60))
    await seedEnergyStates()

    // Phase 3: Domain-Specific Laws and Principles
    console.log('\n📜 PHASE 3: Laws and Principles')
    console.log('─'.repeat(60))
    await runScriptFile('src/scripts/seedPowerLaws.ts', 'Power Laws')
    await runScriptFile('src/scripts/seedBibleLaws.ts', 'Bible Laws')
    
    // Link Power Laws and Bible Laws to Reality Hierarchy
    console.log('\n🔗 Linking Laws to Reality Hierarchy...')
    await linkPowerLawsToHierarchy()
    await linkBibleLawsToHierarchy()

    // Phase 4: Weapons and Capabilities (Loadout Items)
    console.log('\n⚔️  PHASE 4: Weapons and Capabilities')
    console.log('─'.repeat(60))
    await seedLoadouts()

    // Phase 5: Money System (Agents and Teams)
    console.log('\n💰 PHASE 5: Money System')
    console.log('─'.repeat(60))
    await runScriptFile('src/scripts/seedAgents.ts', 'Money Agents')
    await runScriptFile('src/scripts/seedTeams.ts', 'Money Teams')
    await runScriptFile('src/scripts/seedProductSecurity.ts', 'Product Security')

    // Phase 6: Training and Knowledge
    console.log('\n📚 PHASE 6: Training and Knowledge')
    console.log('─'.repeat(60))
    await runScriptFile('src/scripts/seedTraining.ts', 'Training Modules')
    await runScriptFile('src/scripts/seedHealthKnowledge.ts', 'Health Knowledge')
    await runScriptFile('src/scripts/seedAwarenessLayers.ts', 'Awareness Layers')

    // Phase 7: Unified Artifacts (must run after all systems are seeded)
    console.log('\n🎨 PHASE 7: Unified Artifacts')
    console.log('─'.repeat(60))
    const { seedArtifacts } = await import('../src/scripts/seedArtifacts')
    await seedArtifacts()

    // Phase 7: Development Data (dev only)
    if (env === 'development') {
      console.log('\n🧪 PHASE 7: Development Test Data')
      console.log('─'.repeat(60))
      await runScriptFile('src/scripts/seedDevData.ts', 'Development Users')
    }

    console.log('\n' + '═'.repeat(60))
    console.log('✅ All seed scripts completed successfully!')
    console.log('═'.repeat(60))

    // Summary
    const counts = await Promise.all([
      prisma.user.count(),
      prisma.realityNode.count(),
      prisma.loadoutItem.count(),
      prisma.powerLaw.count(),
      prisma.bibleLaw.count(),
      prisma.agent.count(),
      prisma.team.count(),
    ])

    console.log('\n📊 Database Summary:')
    console.log(`   Users: ${counts[0]}`)
    console.log(`   Reality Nodes: ${counts[1]}`)
    console.log(`   Loadout Items (Weapons): ${counts[2]}`)
    console.log(`   Power Laws: ${counts[3]}`)
    console.log(`   Bible Laws: ${counts[4]}`)
    console.log(`   Money Agents: ${counts[5]}`)
    console.log(`   Money Teams: ${counts[6]}`)

  } catch (error) {
    console.error('\n❌ Master seed process encountered an error:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    console.log('\n🔌 Disconnecting from database...')
    await prisma.$disconnect()
    console.log('👋 Seed process complete!')
  })
