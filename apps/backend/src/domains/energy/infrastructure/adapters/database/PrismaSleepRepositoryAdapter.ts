/**
 * PrismaSleepRepositoryAdapter
 * 
 * Infrastructure adapter implementing SleepRepositoryPort using Prisma.
 */

import { PrismaClient } from '@prisma/client'
import { SleepRepositoryPort } from '../../../application/ports/SleepRepositoryPort.js'
import { Sleep } from '../../../domain/entities/Sleep.js'

export class PrismaSleepRepositoryAdapter implements SleepRepositoryPort {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Sleep | null> {
    const sleepData = await this.prisma.sleepLog.findUnique({
      where: { id },
    })

    if (!sleepData) {
      return null
    }

    return Sleep.fromPersistence({
      id: sleepData.id,
      userId: sleepData.userId,
      date: sleepData.date,
      hoursSlept: Number(sleepData.hoursSlept),
      quality: sleepData.quality,
      bedTime: sleepData.bedTime,
      wakeTime: sleepData.wakeTime,
      energyRestored: sleepData.energyRestored,
      notes: sleepData.notes,
      createdAt: sleepData.createdAt,
      updatedAt: sleepData.updatedAt,
    })
  }

  async findByUserIdAndDate(userId: string, date: Date): Promise<Sleep | null> {
    // Normalize date to start of day for comparison
    const dateOnly = new Date(date)
    dateOnly.setHours(0, 0, 0, 0)

    const sleepData = await this.prisma.sleepLog.findUnique({
      where: {
        userId_date: {
          userId,
          date: dateOnly,
        },
      },
    })

    if (!sleepData) {
      return null
    }

    return Sleep.fromPersistence({
      id: sleepData.id,
      userId: sleepData.userId,
      date: sleepData.date,
      hoursSlept: Number(sleepData.hoursSlept),
      quality: sleepData.quality,
      bedTime: sleepData.bedTime,
      wakeTime: sleepData.wakeTime,
      energyRestored: sleepData.energyRestored,
      notes: sleepData.notes,
      createdAt: sleepData.createdAt,
      updatedAt: sleepData.updatedAt,
    })
  }

  async findByUserId(userId: string): Promise<Sleep[]> {
    const sleepLogs = await this.prisma.sleepLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    })

    return sleepLogs.map(sleepData =>
      Sleep.fromPersistence({
        id: sleepData.id,
        userId: sleepData.userId,
        date: sleepData.date,
        hoursSlept: Number(sleepData.hoursSlept),
        quality: sleepData.quality,
        bedTime: sleepData.bedTime,
        wakeTime: sleepData.wakeTime,
        energyRestored: sleepData.energyRestored,
        notes: sleepData.notes,
        createdAt: sleepData.createdAt,
        updatedAt: sleepData.updatedAt,
      })
    )
  }

  async findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Sleep[]> {
    const sleepLogs = await this.prisma.sleepLog.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'desc' },
    })

    return sleepLogs.map(sleepData =>
      Sleep.fromPersistence({
        id: sleepData.id,
        userId: sleepData.userId,
        date: sleepData.date,
        hoursSlept: Number(sleepData.hoursSlept),
        quality: sleepData.quality,
        bedTime: sleepData.bedTime,
        wakeTime: sleepData.wakeTime,
        energyRestored: sleepData.energyRestored,
        notes: sleepData.notes,
        createdAt: sleepData.createdAt,
        updatedAt: sleepData.updatedAt,
      })
    )
  }

  async findMostRecentByUserId(userId: string): Promise<Sleep | null> {
    const sleepData = await this.prisma.sleepLog.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    })

    if (!sleepData) {
      return null
    }

    return Sleep.fromPersistence({
      id: sleepData.id,
      userId: sleepData.userId,
      date: sleepData.date,
      hoursSlept: Number(sleepData.hoursSlept),
      quality: sleepData.quality,
      bedTime: sleepData.bedTime,
      wakeTime: sleepData.wakeTime,
      energyRestored: sleepData.energyRestored,
      notes: sleepData.notes,
      createdAt: sleepData.createdAt,
      updatedAt: sleepData.updatedAt,
    })
  }

  async save(sleep: Sleep): Promise<Sleep> {
    // Normalize date to start of day
    const dateOnly = new Date(sleep.date)
    dateOnly.setHours(0, 0, 0, 0)

    const sleepData = await this.prisma.sleepLog.upsert({
      where: {
        userId_date: {
          userId: sleep.userId,
          date: dateOnly,
        },
      },
      create: {
        id: sleep.id,
        userId: sleep.userId,
        date: dateOnly,
        hoursSlept: sleep.hoursSlept,
        quality: sleep.quality.value,
        bedTime: sleep.bedTime,
        wakeTime: sleep.wakeTime,
        energyRestored: sleep.energyRestored,
        notes: sleep.notes,
      },
      update: {
        hoursSlept: sleep.hoursSlept,
        quality: sleep.quality.value,
        bedTime: sleep.bedTime,
        wakeTime: sleep.wakeTime,
        energyRestored: sleep.energyRestored,
        notes: sleep.notes,
        updatedAt: new Date(),
      },
    })

    return Sleep.fromPersistence({
      id: sleepData.id,
      userId: sleepData.userId,
      date: sleepData.date,
      hoursSlept: Number(sleepData.hoursSlept),
      quality: sleepData.quality,
      bedTime: sleepData.bedTime,
      wakeTime: sleepData.wakeTime,
      energyRestored: sleepData.energyRestored,
      notes: sleepData.notes,
      createdAt: sleepData.createdAt,
      updatedAt: sleepData.updatedAt,
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.sleepLog.delete({
      where: { id },
    })
  }
}

