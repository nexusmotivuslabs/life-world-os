import { MilestoneType } from '../types'
import { prisma } from '../lib/prisma'

/**
 * Check for new milestones and award them
 */
export async function checkMilestones(userId: string): Promise<{
  newMilestones: MilestoneType[]
  unlockedKeys: number
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      resources: true,
      xp: true,
      engines: true,
      milestones: true,
    },
  })

  if (!user || !user.resources || !user.xp) {
    return { newMilestones: [], unlockedKeys: 0 }
  }

  const existingMilestoneTypes = new Set(
    user.milestones.map((m) => m.milestoneType)
  )

  const newMilestones: MilestoneType[] = []
  let unlockedKeys = 0

  // Check oxygen milestones
  const oxygenMonths = Number(user.resources.oxygen)
  if (oxygenMonths >= 6 && !existingMilestoneTypes.has(MilestoneType.SIX_MONTHS_EXPENSES)) {
    newMilestones.push(MilestoneType.SIX_MONTHS_EXPENSES)
    unlockedKeys += 1
  }
  if (oxygenMonths >= 12 && !existingMilestoneTypes.has(MilestoneType.ONE_YEAR_EXPENSES)) {
    newMilestones.push(MilestoneType.ONE_YEAR_EXPENSES)
    unlockedKeys += 2
  }

  // Check for first asset (gold > 0)
  const gold = Number(user.resources.gold)
  if (gold > 0 && !existingMilestoneTypes.has(MilestoneType.FIRST_ASSET)) {
    newMilestones.push(MilestoneType.FIRST_ASSET)
    unlockedKeys += 1
  }

  // Check for multiple engines (reduced fragility)
  const activeEngines = user.engines.filter((e) => e.status === 'ACTIVE').length
  if (activeEngines >= 2 && !existingMilestoneTypes.has(MilestoneType.REDUCED_FRAGILITY)) {
    newMilestones.push(MilestoneType.REDUCED_FRAGILITY)
    unlockedKeys += 1
  }

  // Create milestone records
  for (const milestoneType of newMilestones) {
    await prisma.milestone.create({
      data: {
        userId,
        milestoneType,
        valueAtAchievement: milestoneType.includes('OXYGEN') ? user.resources.oxygen : user.resources.gold,
        unlockedKeys: milestoneType === MilestoneType.ONE_YEAR_EXPENSES ? 2 : 1,
      },
    })
  }

  // Update user's keys
  if (unlockedKeys > 0) {
    await prisma.resources.update({
      where: { userId },
      data: {
        keys: {
          increment: unlockedKeys,
        },
      },
    })
  }

  return { newMilestones, unlockedKeys }
}


