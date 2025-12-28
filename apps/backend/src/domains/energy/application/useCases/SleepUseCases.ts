/**
 * Sleep Use Cases
 * 
 * Application layer use cases for sleep operations.
 */

import { Sleep } from '../../domain/entities/Sleep.js'
import { SleepQuality } from '../../domain/valueObjects/SleepQuality.js'
import { SleepRepositoryPort } from '../ports/SleepRepositoryPort.js'
import { UserEnergyContextPort } from '../ports/UserEnergyContextPort.js'
import { EnergyCalculationService } from '../../domain/services/EnergyCalculationService.js'
import { updateEnergyRestorationTimestamp } from '../../../../services/energyBurndownService.js'
import { prisma } from '../../../../lib/prisma.js'

export class LogSleepUseCase {
  constructor(
    private sleepRepository: SleepRepositoryPort,
    private userContext: UserEnergyContextPort
  ) {}

  async execute(
    userId: string,
    date: Date,
    hoursSlept: number,
    quality: number,
    bedTime?: Date,
    wakeTime?: Date,
    notes?: string
  ): Promise<Sleep> {
    // Get user's energy context to calculate restoration
    const context = await this.userContext.getUserEnergyContext(userId)
    const capacityCap = context.capacityCap

    // Create value objects
    const sleepQuality = SleepQuality.create(quality)

    // Check if sleep already exists for this date
    const existing = await this.sleepRepository.findByUserIdAndDate(userId, date)
    
    if (existing) {
      // Update existing sleep log
      const updated = Sleep.create(
        existing.id,
        userId,
        date,
        hoursSlept,
        sleepQuality,
        capacityCap,
        bedTime || null,
        wakeTime || null,
        notes || null
      )
      const savedSleep = await this.sleepRepository.save(updated)
      
      // Update energy restoration timestamp for live burndown
      const currentContext = await this.userContext.getUserEnergyContext(userId)
      const newBaseEnergy = Math.min(
        currentContext.baseEnergy + savedSleep.energyRestored,
        capacityCap
      )
      
      await updateEnergyRestorationTimestamp(userId, newBaseEnergy)
      await prisma.resources.update({
        where: { userId },
        data: {
          energy: newBaseEnergy,
        },
      })
      
      return savedSleep
    }

    // Create new sleep log
    const sleep = Sleep.create(
      `sleep-${userId}-${date.getTime()}`,
      userId,
      date,
      hoursSlept,
      sleepQuality,
      capacityCap,
      bedTime || null,
      wakeTime || null,
      notes || null
    )

    const savedSleep = await this.sleepRepository.save(sleep)
    
    // Update energy restoration timestamp for live burndown
    // Calculate new base energy (current + restoration, capped)
    const currentContext = await this.userContext.getUserEnergyContext(userId)
    const newBaseEnergy = Math.min(
      currentContext.baseEnergy + savedSleep.energyRestored,
      capacityCap
    )
    
    // Update restoration timestamp and energy value
    await updateEnergyRestorationTimestamp(userId, newBaseEnergy)
    
    // Also update the stored energy value in resources
    await prisma.resources.update({
      where: { userId },
      data: {
        energy: newBaseEnergy,
      },
    })
    
    return savedSleep
  }
}

export class GetSleepHistoryUseCase {
  constructor(private sleepRepository: SleepRepositoryPort) {}

  async execute(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Sleep[]> {
    if (startDate && endDate) {
      return this.sleepRepository.findByUserIdAndDateRange(userId, startDate, endDate)
    }
    return this.sleepRepository.findByUserId(userId)
  }
}

export class GetMostRecentSleepUseCase {
  constructor(private sleepRepository: SleepRepositoryPort) {}

  async execute(userId: string): Promise<Sleep | null> {
    return this.sleepRepository.findMostRecentByUserId(userId)
  }
}

export class CalculateEnergyRestorationUseCase {
  constructor(
    private sleepRepository: SleepRepositoryPort,
    private userContext: UserEnergyContextPort
  ) {}

  async execute(userId: string, date: Date): Promise<{
    sleep: Sleep | null
    restorationAmount: number
    newBaseEnergy: number
  }> {
    // Get user's current energy context
    const context = await this.userContext.getUserEnergyContext(userId)

    // Find sleep for the date (previous night)
    const sleep = await this.sleepRepository.findByUserIdAndDate(userId, date)

    if (!sleep) {
      return {
        sleep: null,
        restorationAmount: 0,
        newBaseEnergy: context.baseEnergy // No restoration
      }
    }

    // Calculate new base energy (current + restoration, capped)
    const newBaseEnergy = Math.min(
      context.baseEnergy + sleep.energyRestored,
      context.capacityCap
    )

    return {
      sleep,
      restorationAmount: sleep.energyRestored,
      newBaseEnergy
    }
  }
}

