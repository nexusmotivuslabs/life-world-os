/**
 * PrismaLocationRepositoryAdapter
 * 
 * Infrastructure adapter implementing LocationRepositoryPort using Prisma.
 */

import { PrismaClient } from '@prisma/client'
import { LocationRepositoryPort } from '../../../application/ports/LocationRepositoryPort.js'
import { Location } from '../../../domain/entities/Location.js'

export class PrismaLocationRepositoryAdapter implements LocationRepositoryPort {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Location | null> {
    const data = await this.prisma.location.findUnique({
      where: { id },
    })

    if (!data) {
      return null
    }

    return Location.fromPersistence({
      id: data.id,
      name: data.name,
      city: data.city,
      country: data.country,
      description: data.description,
      officialUrl: data.officialUrl,
      category: data.category,
      tags: data.tags,
      metadata: data.metadata as any,
      googlePlaceId: data.googlePlaceId,
      latitude: data.latitude ? Number(data.latitude) : null,
      longitude: data.longitude ? Number(data.longitude) : null,
      rating: data.rating ? Number(data.rating) : null,
      userRatingsTotal: data.userRatingsTotal,
      cachedAt: data.cachedAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    })
  }

  async findByGooglePlaceId(googlePlaceId: string): Promise<Location | null> {
    const data = await this.prisma.location.findUnique({
      where: { googlePlaceId },
    })

    if (!data) {
      return null
    }

    return Location.fromPersistence({
      id: data.id,
      name: data.name,
      city: data.city,
      country: data.country,
      description: data.description,
      officialUrl: data.officialUrl,
      category: data.category,
      tags: data.tags,
      metadata: data.metadata as any,
      googlePlaceId: data.googlePlaceId,
      latitude: data.latitude ? Number(data.latitude) : null,
      longitude: data.longitude ? Number(data.longitude) : null,
      rating: data.rating ? Number(data.rating) : null,
      userRatingsTotal: data.userRatingsTotal,
      cachedAt: data.cachedAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    })
  }

  async findByCity(city: string): Promise<Location[]> {
    const data = await this.prisma.location.findMany({
      where: { city },
      orderBy: { rating: 'desc' },
    })

    return data.map(item => Location.fromPersistence({
      id: item.id,
      name: item.name,
      city: item.city,
      country: item.country,
      description: item.description,
      officialUrl: item.officialUrl,
      category: item.category,
      tags: item.tags,
      metadata: item.metadata as any,
      googlePlaceId: item.googlePlaceId,
      latitude: item.latitude ? Number(item.latitude) : null,
      longitude: item.longitude ? Number(item.longitude) : null,
      rating: item.rating ? Number(item.rating) : null,
      userRatingsTotal: item.userRatingsTotal,
      cachedAt: item.cachedAt,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }))
  }

  async findByCountry(country: string): Promise<Location[]> {
    const data = await this.prisma.location.findMany({
      where: { country },
      orderBy: { rating: 'desc' },
    })

    return data.map(item => Location.fromPersistence({
      id: item.id,
      name: item.name,
      city: item.city,
      country: item.country,
      description: item.description,
      officialUrl: item.officialUrl,
      category: item.category,
      tags: item.tags,
      metadata: item.metadata as any,
      googlePlaceId: item.googlePlaceId,
      latitude: item.latitude ? Number(item.latitude) : null,
      longitude: item.longitude ? Number(item.longitude) : null,
      rating: item.rating ? Number(item.rating) : null,
      userRatingsTotal: item.userRatingsTotal,
      cachedAt: item.cachedAt,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }))
  }

  async findByCategory(category: string): Promise<Location[]> {
    const data = await this.prisma.location.findMany({
      where: { category },
      orderBy: { rating: 'desc' },
    })

    return data.map(item => Location.fromPersistence({
      id: item.id,
      name: item.name,
      city: item.city,
      country: item.country,
      description: item.description,
      officialUrl: item.officialUrl,
      category: item.category,
      tags: item.tags,
      metadata: item.metadata as any,
      googlePlaceId: item.googlePlaceId,
      latitude: item.latitude ? Number(item.latitude) : null,
      longitude: item.longitude ? Number(item.longitude) : null,
      rating: item.rating ? Number(item.rating) : null,
      userRatingsTotal: item.userRatingsTotal,
      cachedAt: item.cachedAt,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }))
  }

  async search(query: string): Promise<Location[]> {
    const data = await this.prisma.location.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
          { country: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { rating: 'desc' },
      take: 20,
    })

    return data.map(item => Location.fromPersistence({
      id: item.id,
      name: item.name,
      city: item.city,
      country: item.country,
      description: item.description,
      officialUrl: item.officialUrl,
      category: item.category,
      tags: item.tags,
      metadata: item.metadata as any,
      googlePlaceId: item.googlePlaceId,
      latitude: item.latitude ? Number(item.latitude) : null,
      longitude: item.longitude ? Number(item.longitude) : null,
      rating: item.rating ? Number(item.rating) : null,
      userRatingsTotal: item.userRatingsTotal,
      cachedAt: item.cachedAt,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }))
  }

  async save(location: Location): Promise<Location> {
    const data = await this.prisma.location.upsert({
      where: { id: location.id },
      create: {
        id: location.id,
        name: location.name,
        city: location.city ?? undefined,
        country: location.country ?? undefined,
        description: location.description ?? undefined,
        officialUrl: location.officialUrl ?? undefined,
        category: location.category ?? undefined,
        tags: location.tags,
        metadata: location.metadata as any,
        googlePlaceId: location.googlePlaceId ?? undefined,
        latitude: location.latitude ? location.latitude : undefined,
        longitude: location.longitude ? location.longitude : undefined,
        rating: location.rating ? location.rating : undefined,
        userRatingsTotal: location.userRatingsTotal ?? undefined,
        cachedAt: location.cachedAt ?? undefined,
      },
      update: {
        name: location.name,
        city: location.city ?? undefined,
        country: location.country ?? undefined,
        description: location.description ?? undefined,
        officialUrl: location.officialUrl ?? undefined,
        category: location.category ?? undefined,
        tags: location.tags,
        metadata: location.metadata as any,
        googlePlaceId: location.googlePlaceId ?? undefined,
        latitude: location.latitude ? location.latitude : undefined,
        longitude: location.longitude ? location.longitude : undefined,
        rating: location.rating ? location.rating : undefined,
        userRatingsTotal: location.userRatingsTotal ?? undefined,
        cachedAt: location.cachedAt ?? undefined,
      },
    })

    return Location.fromPersistence({
      id: data.id,
      name: data.name,
      city: data.city,
      country: data.country,
      description: data.description,
      officialUrl: data.officialUrl,
      category: data.category,
      tags: data.tags,
      metadata: data.metadata as any,
      googlePlaceId: data.googlePlaceId,
      latitude: data.latitude ? Number(data.latitude) : null,
      longitude: data.longitude ? Number(data.longitude) : null,
      rating: data.rating ? Number(data.rating) : null,
      userRatingsTotal: data.userRatingsTotal,
      cachedAt: data.cachedAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.location.delete({
      where: { id },
    })
  }
}





