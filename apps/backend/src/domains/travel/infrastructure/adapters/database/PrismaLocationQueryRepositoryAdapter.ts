/**
 * PrismaLocationQueryRepositoryAdapter
 * 
 * Infrastructure adapter implementing LocationQueryRepositoryPort using Prisma.
 */

import { PrismaClient } from '@prisma/client'
import { LocationQueryRepositoryPort } from '../../../application/ports/LocationQueryRepositoryPort.js'
import { LocationQuery } from '../../../domain/entities/LocationQuery.js'

export class PrismaLocationQueryRepositoryAdapter implements LocationQueryRepositoryPort {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<LocationQuery | null> {
    const data = await this.prisma.locationQuery.findUnique({
      where: { id },
    })

    if (!data) {
      return null
    }

    return LocationQuery.fromPersistence({
      id: data.id,
      userId: data.userId,
      queryText: data.queryText,
      location: data.location,
      results: data.results as any,
      locationId: data.locationId,
      createdAt: data.createdAt,
    })
  }

  async findByUserId(userId: string): Promise<LocationQuery[]> {
    const data = await this.prisma.locationQuery.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return data.map(item => LocationQuery.fromPersistence({
      id: item.id,
      userId: item.userId,
      queryText: item.queryText,
      location: item.location,
      results: item.results as any,
      locationId: item.locationId,
      createdAt: item.createdAt,
    }))
  }

  async save(query: LocationQuery): Promise<LocationQuery> {
    const data = await this.prisma.locationQuery.upsert({
      where: { id: query.id },
      create: {
        id: query.id,
        userId: query.userId,
        queryText: query.queryText,
        location: query.location ?? undefined,
        results: query.results as any,
        locationId: query.locationId ?? undefined,
      },
      update: {
        queryText: query.queryText,
        location: query.location ?? undefined,
        results: query.results as any,
        locationId: query.locationId ?? undefined,
      },
    })

    return LocationQuery.fromPersistence({
      id: data.id,
      userId: data.userId,
      queryText: data.queryText,
      location: data.location,
      results: data.results as any,
      locationId: data.locationId,
      createdAt: data.createdAt,
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.locationQuery.delete({
      where: { id },
    })
  }
}





