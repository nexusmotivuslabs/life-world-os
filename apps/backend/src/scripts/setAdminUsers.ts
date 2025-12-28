/**
 * Set Admin Users Script
 * 
 * Sets specific users as admins in the database.
 * Admin status can only be changed via this script or direct database access.
 * 
 * Usage: 
 *   npx tsx src/scripts/setAdminUsers.ts           - Set specific emails as admin
 *   npx tsx src/scripts/setAdminUsers.ts --all     - Make ALL users admin (development only)
 * 
 * Development mode: Set DEV_MODE=true to make all users admin
 */

import { prisma } from '../lib/prisma.js'

const ADMIN_EMAILS = [
  'nicoleeb.taylor@gmail.com',
  // Add your email here for production
  // To find your email, check the database: SELECT email FROM users;
]

// Development mode: make all users admin
const DEV_MODE = process.env.DEV_MODE === 'true' || process.argv.includes('--all')

async function setAdminUsers() {
  try {
    console.log('Setting admin users...')

    if (DEV_MODE) {
      console.log('🔧 DEVELOPMENT MODE: Making all users admin')
      // Make all users admin in development
      const result = await prisma.user.updateMany({
        data: { isAdmin: true },
      })
      console.log(`✓ Set ${result.count} user(s) as admin`)
    } else {
      // First, set all users to non-admin
      await prisma.user.updateMany({
        data: { isAdmin: false },
      })
      console.log('✓ Reset all users to non-admin')

      // Set specified emails as admin
      for (const email of ADMIN_EMAILS) {
        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (user) {
          await prisma.user.update({
            where: { email },
            data: { isAdmin: true },
          })
          console.log(`✓ Set ${email} as admin`)
        } else {
          console.log(`⚠ User with email ${email} not found`)
        }
      }
    }

    // List all users and their admin status
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        isAdmin: true,
      },
      orderBy: { email: 'asc' },
    })

    const adminUsers = allUsers.filter(u => u.isAdmin)

    console.log('\n📋 All Users:')
    allUsers.forEach((user) => {
      const adminBadge = user.isAdmin ? ' [ADMIN]' : ''
      console.log(`  - ${user.email} (${user.username})${adminBadge}`)
    })

    console.log(`\n📊 Summary: ${adminUsers.length} admin user(s) out of ${allUsers.length} total user(s)`)
    console.log('\n✅ Admin users updated successfully')
  } catch (error) {
    console.error('❌ Error setting admin users:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setAdminUsers()

