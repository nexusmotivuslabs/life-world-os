/**
 * Seed static action catalog for the Context → Actions Engine.
 * Run once (or idempotent upsert by slug).
 */

import { prisma } from '../lib/prisma.js'
import { ACTION_CATALOG } from '../domains/actions/data/actionCatalog.js'

async function main() {
  console.log('🌱 Seeding action definitions...')
  for (const a of ACTION_CATALOG) {
    await prisma.actionDefinition.upsert({
      where: { slug: a.slug },
      create: {
        slug: a.slug,
        label: a.label,
        explanationShort: a.explanationShort,
        goalCategories: a.goalCategories,
        energyLevelMin: a.energyLevelMin,
        timeMinutesMax: a.timeMinutesMax,
        locationTypes: a.locationTypes,
        mobileFriendly: a.mobileFriendly,
        urgencyWeight: a.urgencyWeight,
        isActive: true,
        order: a.order,
      },
      update: {
        label: a.label,
        explanationShort: a.explanationShort,
        goalCategories: a.goalCategories,
        energyLevelMin: a.energyLevelMin,
        timeMinutesMax: a.timeMinutesMax,
        locationTypes: a.locationTypes,
        mobileFriendly: a.mobileFriendly,
        urgencyWeight: a.urgencyWeight,
        order: a.order,
      },
    })
    console.log(`  ✅ ${a.slug}`)
  }
  console.log('✨ Action catalog seeded.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => void prisma.$disconnect())
