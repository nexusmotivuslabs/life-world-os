/**
 * PrismaUserArtifactRepositoryAdapter
 * 
 * Infrastructure adapter implementing UserArtifactRepositoryPort using Prisma.
 */

import { PrismaClient } from '@prisma/client'
import { UserArtifactRepositoryPort } from '../../../application/ports/UserArtifactRepositoryPort.js'
import { UserArtifact, ArtifactType } from '../../../domain/entities/UserArtifact.js'

export class PrismaUserArtifactRepositoryAdapter implements UserArtifactRepositoryPort {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<UserArtifact | null> {
    const data = await this.prisma.userArtifact.findUnique({
      where: { id },
    })

    if (!data) {
      return null
    }

    return UserArtifact.fromPersistence({
      id: data.id,
      userId: data.userId,
      productId: data.productId,
      productName: data.productName,
      type: data.type,
      title: data.title,
      description: data.description,
      data: data.data as any,
      tags: data.tags,
      isFavorite: data.isFavorite,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    })
  }

  async findByUserId(userId: string): Promise<UserArtifact[]> {
    const data = await this.prisma.userArtifact.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return data.map(item =>
      UserArtifact.fromPersistence({
        id: item.id,
        userId: item.userId,
        productId: item.productId,
        productName: item.productName,
        type: item.type,
        title: item.title,
        description: item.description,
        data: item.data as any,
        tags: item.tags,
        isFavorite: item.isFavorite,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })
    )
  }

  async findByProductId(productId: string): Promise<UserArtifact[]> {
    const data = await this.prisma.userArtifact.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    })

    return data.map(item =>
      UserArtifact.fromPersistence({
        id: item.id,
        userId: item.userId,
        productId: item.productId,
        productName: item.productName,
        type: item.type,
        title: item.title,
        description: item.description,
        data: item.data as any,
        tags: item.tags,
        isFavorite: item.isFavorite,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })
    )
  }

  async findByType(userId: string, type: ArtifactType): Promise<UserArtifact[]> {
    const data = await this.prisma.userArtifact.findMany({
      where: {
        userId,
        type,
      },
      orderBy: { createdAt: 'desc' },
    })

    return data.map(item =>
      UserArtifact.fromPersistence({
        id: item.id,
        userId: item.userId,
        productId: item.productId,
        productName: item.productName,
        type: item.type,
        title: item.title,
        description: item.description,
        data: item.data as any,
        tags: item.tags,
        isFavorite: item.isFavorite,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })
    )
  }

  async findFavorites(userId: string): Promise<UserArtifact[]> {
    const data = await this.prisma.userArtifact.findMany({
      where: {
        userId,
        isFavorite: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return data.map(item =>
      UserArtifact.fromPersistence({
        id: item.id,
        userId: item.userId,
        productId: item.productId,
        productName: item.productName,
        type: item.type,
        title: item.title,
        description: item.description,
        data: item.data as any,
        tags: item.tags,
        isFavorite: item.isFavorite,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })
    )
  }

  async save(artifact: UserArtifact): Promise<UserArtifact> {
    const data = await this.prisma.userArtifact.upsert({
      where: { id: artifact.id },
      create: {
        id: artifact.id,
        userId: artifact.userId,
        productId: artifact.productId ?? undefined,
        productName: artifact.productName,
        type: artifact.type,
        title: artifact.title,
        description: artifact.description ?? undefined,
        data: artifact.data as any,
        tags: artifact.tags,
        isFavorite: artifact.isFavorite,
      },
      update: {
        productName: artifact.productName,
        title: artifact.title,
        description: artifact.description ?? undefined,
        data: artifact.data as any,
        tags: artifact.tags,
        isFavorite: artifact.isFavorite,
      },
    })

    return UserArtifact.fromPersistence({
      id: data.id,
      userId: data.userId,
      productId: data.productId,
      productName: data.productName,
      type: data.type,
      title: data.title,
      description: data.description,
      data: data.data as any,
      tags: data.tags,
      isFavorite: data.isFavorite,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.userArtifact.delete({
      where: { id },
    })
  }

  async search(userId: string, query: string): Promise<UserArtifact[]> {
    const data = await this.prisma.userArtifact.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { productName: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    })

    return data.map(item =>
      UserArtifact.fromPersistence({
        id: item.id,
        userId: item.userId,
        productId: item.productId,
        productName: item.productName,
        type: item.type,
        title: item.title,
        description: item.description,
        data: item.data as any,
        tags: item.tags,
        isFavorite: item.isFavorite,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })
    )
  }
}





