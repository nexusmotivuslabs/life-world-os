/**
 * PrismaEnergyBoostRepositoryAdapter
 * 
 * Infrastructure adapter implementing EnergyBoostRepositoryPort using Prisma.
 */

import { PrismaClient } from '@prisma/client'
import { EnergyBoostRepositoryPort } from '../../../application/ports/EnergyBoostRepositoryPort.js'
import { EnergyBoost, BoostType } from '../../../domain/entities/EnergyBoost.js'

export class PrismaEnergyBoostRepositoryAdapter implements EnergyBoostRepositoryPort {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<EnergyBoost | null> {
    const boostData = await this.prisma.energyBoost.findUnique({
      where: { id },
    })

    if (!boostData) {
      return null
    }

    return EnergyBoost.fromPersistence({
      id: boostData.id,
      userId: boostData.userId,
      type: boostData.type as any,
      amount: boostData.amount,
      duration: boostData.duration,
      decayRate: Number(boostData.decayRate),
      expiresAt: boostData.expiresAt,
      createdAt: boostData.createdAt,
    })
  }

  async findActiveByUserId(userId: string): Promise<EnergyBoost[]> {
    const now = new Date()
    const boosts = await this.prisma.energyBoost.findMany({
      where: {
        userId,
        expiresAt: {
          gte: now, // Not expired yet
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return boosts
      .map(boostData =>
        EnergyBoost.fromPersistence({
          id: boostData.id,
          userId: boostData.userId,
          type: boostData.type as any,
          amount: boostData.amount,
          duration: boostData.duration,
          decayRate: Number(boostData.decayRate),
          expiresAt: boostData.expiresAt,
          createdAt: boostData.createdAt,
        })
      )
      .filter(boost => boost.isActive()) // Filter to only truly active boosts
  }

  async findByUserId(userId: string): Promise<EnergyBoost[]> {
    const boosts = await this.prisma.energyBoost.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return boosts.map(boostData =>
      EnergyBoost.fromPersistence({
        id: boostData.id,
        userId: boostData.userId,
        type: boostData.type as any,
        amount: boostData.amount,
        duration: boostData.duration,
        decayRate: Number(boostData.decayRate),
        expiresAt: boostData.expiresAt,
        createdAt: boostData.createdAt,
      })
    )
  }

  async save(boost: EnergyBoost): Promise<EnergyBoost> {
    const boostData = await this.prisma.energyBoost.upsert({
      where: { id: boost.id },
      create: {
        id: boost.id,
        userId: boost.userId,
        type: boost.type,
        amount: boost.amount,
        duration: boost.duration,
        decayRate: boost.decayRate,
        expiresAt: boost.expiresAt,
      },
      update: {
        amount: boost.amount,
        duration: boost.duration,
        decayRate: boost.decayRate,
        expiresAt: boost.expiresAt,
      },
    })

    return EnergyBoost.fromPersistence({
      id: boostData.id,
      userId: boostData.userId,
      type: boostData.type as any,
      amount: boostData.amount,
      duration: boostData.duration,
      decayRate: Number(boostData.decayRate),
      expiresAt: boostData.expiresAt,
      createdAt: boostData.createdAt,
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.energyBoost.delete({
      where: { id },
    })
  }

  async deleteExpiredByUserId(userId: string): Promise<number> {
    const now = new Date()
    const result = await this.prisma.energyBoost.deleteMany({
      where: {
        userId,
        expiresAt: {
          lt: now,
        },
      },
    })

    return result.count
  }
}

