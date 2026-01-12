/**
 * Seed Development Data
 * 
 * Creates test users with different capacity levels to demonstrate the health system.
 * This script only runs in development environment.
 * 
 * Creates users with:
 * - Different capacity levels (critical, low, medium, high, optimal)
 * - Sample activity logs showing recovery actions
 * - Proper Cloud, Resources, and XP records
 */

import { PrismaClient, Season, ActivityType, OverallRank } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const DEFAULT_PASSWORD = 'password123' // For dev/test users only

interface DevUserData {
  email: string
  username: string
  capacityStrength: number // 0-100
  capacityBand: 'critical' | 'low' | 'medium' | 'high' | 'optimal'
  description: string
  hasRecoveryActions?: boolean // Whether to add sample recovery actions
  isInBurnout?: boolean
  consecutiveHighEffortDays?: number
  consecutiveLowCapacityDays?: number
  recoveryActionsThisWeek?: number
}

const devUsers: DevUserData[] = [
  {
    email: 'optimal-health@dev.test',
    username: 'optimal_health_user',
    capacityStrength: 90,
    capacityBand: 'optimal',
    description: 'User with optimal capacity (90) - maximum energy cap, XP bonus',
    hasRecoveryActions: true,
    consecutiveHighEffortDays: 0,
    consecutiveLowCapacityDays: 0,
    recoveryActionsThisWeek: 4,
  },
  {
    email: 'high-capacity@dev.test',
    username: 'high_capacity_user',
    capacityStrength: 75,
    capacityBand: 'high',
    description: 'User with high capacity (75) - good energy cap, XP bonus',
    hasRecoveryActions: true,
    consecutiveHighEffortDays: 2,
    consecutiveLowCapacityDays: 0,
    recoveryActionsThisWeek: 3,
  },
  {
    email: 'medium-capacity@dev.test',
    username: 'medium_capacity_user',
    capacityStrength: 55,
    capacityBand: 'medium',
    description: 'User with medium capacity (55) - normal energy cap, standard XP',
    hasRecoveryActions: true,
    consecutiveHighEffortDays: 5,
    consecutiveLowCapacityDays: 0,
    recoveryActionsThisWeek: 2,
  },
  {
    email: 'low-capacity@dev.test',
    username: 'low_capacity_user',
    capacityStrength: 25,
    capacityBand: 'low',
    description: 'User with low capacity (25) - reduced energy cap, XP penalty, high burnout risk',
    hasRecoveryActions: false,
    consecutiveHighEffortDays: 8,
    consecutiveLowCapacityDays: 3,
    recoveryActionsThisWeek: 1,
  },
  {
    email: 'critical-capacity@dev.test',
    username: 'critical_capacity_user',
    capacityStrength: 15,
    capacityBand: 'critical',
    description: 'User with critical capacity (15) - minimum energy cap, significant XP penalty',
    hasRecoveryActions: false,
    consecutiveHighEffortDays: 12,
    consecutiveLowCapacityDays: 6,
    recoveryActionsThisWeek: 0,
  },
  {
    email: 'burnout-user@dev.test',
    username: 'burnout_user',
    capacityStrength: 18,
    capacityBand: 'critical',
    description: 'User in burnout state - very low energy cap, significant penalties',
    isInBurnout: true,
    hasRecoveryActions: true, // Recovery actions to help exit burnout
    consecutiveHighEffortDays: 0,
    consecutiveLowCapacityDays: 10,
    recoveryActionsThisWeek: 3,
  },
  {
    email: 'recovery-focused@dev.test',
    username: 'recovery_focused_user',
    capacityStrength: 45,
    capacityBand: 'medium',
    description: 'User actively recovering - building capacity through recovery actions',
    hasRecoveryActions: true,
    consecutiveHighEffortDays: 0,
    consecutiveLowCapacityDays: 0,
    recoveryActionsThisWeek: 5, // More than optimal to show active recovery
  },
]

async function createDevUser(userData: DevUserData) {
  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: userData.email },
        { username: userData.username },
      ],
    },
  })

  if (existingUser) {
    console.log(`  ⚠️  User ${userData.email} already exists, skipping...`)
    return existingUser.id
  }

  // Hash password
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10)

  // Calculate other cloud strengths (set them relative to capacity for health-focused users)
  const enginesStrength = Math.max(40, userData.capacityStrength - 10)
  const oxygenStrength = Math.max(30, userData.capacityStrength - 5)
  const meaningStrength = Math.max(40, userData.capacityStrength)
  const optionalityStrength = Math.max(30, userData.capacityStrength - 10)

  // Create user
  const user = await prisma.user.create({
    data: {
      email: userData.email,
      username: userData.username,
      passwordHash,
      currentSeason: Season.SPRING,
      isInBurnout: userData.isInBurnout || false,
      consecutiveHighEffortDays: userData.consecutiveHighEffortDays || 0,
      consecutiveLowCapacityDays: userData.consecutiveLowCapacityDays || 0,
      recoveryActionsThisWeek: userData.recoveryActionsThisWeek || 0,
      lastRecoveryActionAt: userData.hasRecoveryActions ? new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) : null,
      lastWeeklyRecoveryAt: userData.hasRecoveryActions ? new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) : null,
      burnoutTriggeredAt: userData.isInBurnout ? new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) : null,
    },
  })

  // Create Cloud record
  await prisma.cloud.create({
    data: {
      userId: user.id,
      capacityStrength: userData.capacityStrength,
      enginesStrength,
      oxygenStrength,
      meaningStrength,
      optionalityStrength,
    },
  })

  // Calculate energy based on capacity
  // Capacity >= 80: 110, >= 60: 100, >= 30: 85, <30: 70, burnout: 40
  let energyCap = 100
  if (userData.isInBurnout) {
    energyCap = 40
  } else if (userData.capacityStrength >= 80) {
    energyCap = 110
  } else if (userData.capacityStrength >= 60) {
    energyCap = 100
  } else if (userData.capacityStrength >= 30) {
    energyCap = 85
  } else {
    energyCap = 70
  }

  // Create Resources record
  await prisma.resources.create({
    data: {
      userId: user.id,
      oxygen: userData.capacityStrength > 70 ? 3.5 : userData.capacityStrength > 50 ? 2.0 : 0.5,
      water: Math.max(30, userData.capacityStrength - 10), // Water correlates with capacity
      gold: userData.capacityStrength > 60 ? 5000 : userData.capacityStrength > 40 ? 2000 : 500,
      armor: Math.max(20, userData.capacityStrength - 15),
      keys: userData.capacityStrength > 70 ? 5 : userData.capacityStrength > 50 ? 3 : 1,
      energy: energyCap,
      energyRestoredAt: new Date(),
    },
  })

  // Create XP record
  const startingXP = userData.capacityStrength > 70 ? 1500 : userData.capacityStrength > 50 ? 800 : 300
  await prisma.xP.create({
    data: {
      userId: user.id,
      overallXP: startingXP,
      overallRank: userData.capacityStrength > 70 ? OverallRank.CORPORAL : OverallRank.PRIVATE,
      overallLevel: userData.capacityStrength > 70 ? 3 : userData.capacityStrength > 50 ? 2 : 1,
      capacityXP: Math.floor(startingXP * 0.3),
      enginesXP: Math.floor(startingXP * 0.25),
      oxygenXP: Math.floor(startingXP * 0.2),
      meaningXP: Math.floor(startingXP * 0.15),
      optionalityXP: Math.floor(startingXP * 0.1),
    },
  })

  // Create sample recovery activity logs if requested
  if (userData.hasRecoveryActions) {
    const recoveryActions = [
      { type: ActivityType.EXERCISE, daysAgo: 1 },
      { type: ActivityType.LEARNING, daysAgo: 2 },
      { type: ActivityType.SAVE_EXPENSES, daysAgo: 3 },
      { type: ActivityType.REST, daysAgo: 5 },
      { type: ActivityType.EXERCISE, daysAgo: 6 },
    ]

    // Limit to the number of recovery actions this week
    const actionsToCreate = recoveryActions.slice(0, userData.recoveryActionsThisWeek || 4)

    for (const action of actionsToCreate) {
      const timestamp = new Date()
      timestamp.setDate(timestamp.getDate() - action.daysAgo)
      timestamp.setHours(14, 0, 0, 0) // Set to 2 PM on that day

      await prisma.activityLog.create({
        data: {
          userId: user.id,
          activityType: action.type,
          overallXPGained: action.type === ActivityType.REST ? 0 : 25,
          categoryXPGain: {
            capacity: action.type === ActivityType.REST ? 0 : 15,
            engines: 0,
            oxygen: action.type === ActivityType.SAVE_EXPENSES ? 10 : 0,
            meaning: 0,
            optionality: 0,
          },
          resourceChanges: {
            oxygen: action.type === ActivityType.SAVE_EXPENSES ? 0.1 : 0,
            water: action.type === ActivityType.EXERCISE ? 5 : 0,
            gold: 0,
            armor: action.type === ActivityType.EXERCISE ? 2 : 0,
            keys: 0,
          },
          seasonContext: Season.SPRING,
          seasonMultiplier: 1.0,
          description: `Sample ${action.type} recovery action`,
          timestamp,
        },
      })
    }
  }

  // Create some work project activity logs for users with high effort days
  if (userData.consecutiveHighEffortDays && userData.consecutiveHighEffortDays > 0) {
    for (let i = 0; i < Math.min(userData.consecutiveHighEffortDays, 7); i++) {
      const timestamp = new Date()
      timestamp.setDate(timestamp.getDate() - i)
      timestamp.setHours(10, 0, 0, 0)

      await prisma.activityLog.create({
        data: {
          userId: user.id,
          activityType: ActivityType.WORK_PROJECT,
          overallXPGained: 50,
          categoryXPGain: {
            capacity: 0,
            engines: 30,
            oxygen: 20,
            meaning: 0,
            optionality: 0,
          },
          resourceChanges: {
            oxygen: 0.2,
            water: -5,
            gold: 100,
            armor: 0,
            keys: 0,
          },
          seasonContext: Season.SPRING,
          seasonMultiplier: 1.0,
          description: `Sample work project activity`,
          timestamp,
        },
      })
    }
  }

  console.log(`  ✅ Created user: ${userData.email} (${userData.capacityBand} - ${userData.description})`)
  return user.id
}

async function main() {
  const env = process.env.NODE_ENV || 'development'

  // Only run in development
  if (env !== 'development') {
    console.log('⚠️  Dev data seeding only runs in development environment')
    console.log(`   Current environment: ${env}`)
    return
  }

  console.log('🌱 Seeding development data...')
  console.log('═'.repeat(60))

  try {
    const userIds: string[] = []

    for (const userData of devUsers) {
      const userId = await createDevUser(userData)
      if (userId) {
        userIds.push(userId)
      }
    }

    console.log('\n' + '═'.repeat(60))
    console.log(`✅ Created ${userIds.length} development users`)
    console.log('\n📋 Test Users Created:')
    console.log('   All users have password: password123')
    console.log('')
    devUsers.forEach((user) => {
      console.log(`   • ${user.email} (${user.username})`)
      console.log(`     Capacity: ${user.capacityStrength} (${user.capacityBand})`)
      console.log(`     ${user.description}`)
      console.log('')
    })

    console.log('💡 Usage:')
    console.log('   • Login with any of the test user emails and password "password123"')
    console.log('   • Use /api/health/status endpoint to see different capacity states')
    console.log('   • Check activity logs to see recovery actions')
    console.log('═'.repeat(60))

  } catch (error) {
    console.error('\n❌ Error seeding development data:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })




