/**
 * Backfill Preset Loadout Slots
 *
 * Fills empty slots on preset loadouts (e.g. created before loadout items were seeded).
 * Run after: npm run db:seed or prisma seed (so LoadoutItem has isDefault items).
 *
 * Usage: npx tsx src/scripts/backfillPresetLoadoutSlots.ts
 */

import { prisma } from '../lib/prisma'
import { fillEmptyPresetSlots } from '../services/presetLoadoutService'

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true },
  })
  let totalFilled = 0
  for (const user of users) {
    const filled = await fillEmptyPresetSlots(user.id)
    if (filled > 0) {
      console.log(`User ${user.id}: filled ${filled} preset slot(s)`)
      totalFilled += filled
    }
  }
  console.log(`Done. Total slots filled: ${totalFilled}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
