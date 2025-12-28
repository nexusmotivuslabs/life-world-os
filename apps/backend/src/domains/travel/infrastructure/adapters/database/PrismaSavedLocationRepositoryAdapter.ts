/**
 * PrismaSavedLocationRepositoryAdapter
 * 
 * Infrastructure adapter implementing SavedLocationRepositoryPort using Prisma.
 */

import { PrismaClient } from '@prisma/client'
import { SavedLocationRepositoryPort } from '../../../application/ports/SavedLocationRepositoryPort.js'
import { SavedLocation } from '../../../domain/entities/SavedLocation.js'

export class PrismaSavedLocationRepositoryAdapter implements SavedLocationRepositoryPort {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<SavedLocation | null> {
    const data = await this.prisma.savedLocation.findUnique({
      where: { id },
    })

    if (!data) {
      return null
    }

    return SavedLocation.fromPersistence({
      id: data.id,
      userId: data.userId,
      locationId: data.locationId,
      notes: data.notes,
      isFavorite: data.isFavorite,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    })
  }

  async findByUserAndLocation(userId: string, locationId: string): Promise<SavedLocation | null> {
    const data = await this.prisma.savedLocation.findUnique({
      where: {
        userId_locationId: {
          userId,
          locationId,
        },
      },
    })

    if (!data) {
      return null
    }

    return SavedLocation.fromPersistence({
      id: data.id,
      userId: data.userId,
      locationId: data.locationId,
      notes: data.notes,
      isFavorite: data.isFavorite,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    })
  }

  async findByUserId(userId: string): Promise<SavedLocation[]> {
    const data = await this.prisma.savedLocation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return data.map(item => SavedLocation.fromPersistence({
      id: item.id,
      userId: item.userId,
      locationId: item.locationId,
      notes: item.notes,
      isFavorite: item.isFavorite,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }))
  }

  async findFavorites(userId: string): Promise<SavedLocation[]> {
    const data = await this.prisma.savedLocation.findMany({
      where: {
        userId,
        isFavorite: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return data.map(item => SavedLocation.fromPersistence({
      id: item.id,
      userId: item.userId,
      locationId: item.locationId,
      notes: item.notes,
      isFavorite: item.isFavorite,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }))
  }

  async save(savedLocation: SavedLocation): Promise<SavedLocation> {
    const data = await this.prisma.savedLocation.upsert({
      where: {
        userId_locationId: {
          userId: savedLocation.userId,
          locationId: savedLocation.locationId,
        },
      },
      create: {
        id: savedLocation.id,
        userId: savedLocation.userId,
        locationId: savedLocation.locationId,
        notes: savedLocation.notes ?? undefined,
        isFavorite: savedLocation.isFavorite,
      },
      update: {
        notes: savedLocation.notes ?? undefined,
        isFavorite: savedLocation.isFavorite,
      },
    })

    return SavedLocation.fromPersistence({
      id: data.id,
      userId: data.userId,
      locationId: data.locationId,
      notes: data.notes,
      isFavorite: data.isFavorite,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.savedLocation.delete({
      where: { id },
    })
  }
}


