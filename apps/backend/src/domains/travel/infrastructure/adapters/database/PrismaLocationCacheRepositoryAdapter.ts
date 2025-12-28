/**
 * PrismaLocationCacheRepositoryAdapter
 * 
 * Infrastructure adapter implementing LocationCacheRepositoryPort using Prisma.
 */

import { PrismaClient } from '@prisma/client'
import { LocationCacheRepositoryPort, CachedLocationData } from '../../../application/ports/LocationCacheRepositoryPort.js'

export class PrismaLocationCacheRepositoryAdapter implements LocationCacheRepositoryPort {
  constructor(private prisma: PrismaClient) {}

  async findByGooglePlaceId(googlePlaceId: string): Promise<CachedLocationData | null> {
    const data = await this.prisma.locationCache.findUnique({
      where: { googlePlaceId },
    })

    if (!data) {
      return null
    }

    // Check if expired
    if (data.expiresAt < new Date()) {
      await this.delete(googlePlaceId)
      return null
    }

    return {
      googlePlaceId: data.googlePlaceId,
      data: data.data as any,
      expiresAt: data.expiresAt,
    }
  }

  async save(cachedData: CachedLocationData): Promise<CachedLocationData> {
    const data = await this.prisma.locationCache.upsert({
      where: { googlePlaceId: cachedData.googlePlaceId },
      create: {
        googlePlaceId: cachedData.googlePlaceId,
        data: cachedData.data as any,
        expiresAt: cachedData.expiresAt,
      },
      update: {
        data: cachedData.data as any,
        expiresAt: cachedData.expiresAt,
      },
    })

    return {
      googlePlaceId: data.googlePlaceId,
      data: data.data as any,
      expiresAt: data.expiresAt,
    }
  }

  async deleteExpired(): Promise<number> {
    const result = await this.prisma.locationCache.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })

    return result.count
  }

  async delete(googlePlaceId: string): Promise<void> {
    await this.prisma.locationCache.delete({
      where: { googlePlaceId },
    })
  }
}


