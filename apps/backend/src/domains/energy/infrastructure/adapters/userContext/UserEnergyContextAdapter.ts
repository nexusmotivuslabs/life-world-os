/**
 * UserEnergyContextAdapter
 * 
 * Infrastructure adapter implementing UserEnergyContextPort using Prisma.
 */

import { PrismaClient } from '@prisma/client'
import { UserEnergyContextPort, UserEnergyContext } from '../../../application/ports/UserEnergyContextPort.js'
import { EnergyCalculationService } from '../../../domain/services/EnergyCalculationService.js'
import { isInBurnout } from '../../../../../services/burnoutService.js'
import { getLiveEnergy } from '../../../../../services/energyBurndownService.js'

export class UserEnergyContextAdapter implements UserEnergyContextPort {
  constructor(private prisma: PrismaClient) {}

  async getUserEnergyContext(userId: string): Promise<UserEnergyContext> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        resources: true,
        cloud: true,
        energyBoosts: {
          where: {
            expiresAt: {
              gte: new Date(), // Not expired
            },
          },
        },
      },
    })

    if (!user || !user.resources || !user.cloud) {
      throw new Error('User, resources, or cloud not found')
    }

    const capacity = user.cloud.capacityStrength
    const capacityCap = EnergyCalculationService.calculateUsableEnergyCap(capacity)
    
    // Get live energy (with burndown calculation)
    const liveEnergy = await getLiveEnergy(userId)
    const baseEnergy = liveEnergy.currentEnergy // Use live energy, not stored value
    const userIsInBurnout = await isInBurnout(userId)

    // Calculate active boost amounts
    const temporaryBoosts = user.energyBoosts
      .map(boost => {
        // Calculate current boost amount (may have decayed)
        const now = new Date()
        if (now < boost.expiresAt) {
          return boost.amount // Still in duration, full amount
        }
        // Calculate decay
        const hoursSinceExpiry = (now.getTime() - boost.expiresAt.getTime()) / (1000 * 60 * 60)
        const decayed = hoursSinceExpiry * Number(boost.decayRate)
        return Math.max(0, boost.amount - decayed)
      })
      .filter(amount => amount > 0) // Only active boosts

    return {
      userId,
      baseEnergy,
      capacity,
      capacityCap,
      isInBurnout: userIsInBurnout,
      temporaryBoosts,
    }
  }
}

