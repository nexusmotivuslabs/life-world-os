/**
 * PrismaProductRepositoryAdapter
 * 
 * Infrastructure adapter implementing ProductRepositoryPort using Prisma.
 * Products are owned by organizations, teams reference them via TeamProductAssociation.
 * 
 * RESILIENCE: This adapter includes fallback mechanisms to ensure products remain
 * available even when team data or associations have issues.
 */

import { PrismaClient, TeamProductType } from '@prisma/client'
import { ProductRepositoryPort } from '../../../application/ports/ProductRepositoryPort.js'
import { Product } from '../../../domain/entities/Product.js'
import { logger } from '../lib/logger.js'

export class PrismaProductRepositoryAdapter implements ProductRepositoryPort {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Product | null> {
    try {
      const productData = await this.prisma.product.findUnique({
        where: { id },
      })

      if (!productData) {
        return null
      }

      return Product.fromPersistence({
        id: productData.id,
        organizationId: productData.organizationId,
        name: productData.name,
        description: productData.description,
        type: productData.type,
        icon: productData.icon,
        features: productData.features,
        integrationPoints: productData.integrationPoints,
        isActive: productData.isActive,
        order: productData.order,
        url: productData.url,
        accessUrl: productData.accessUrl,
        securityLevel: productData.securityLevel,
        requiresAuth: productData.requiresAuth,
      })
    } catch (error) {
      logger.error(`❌ Error finding product by ID ${id}:`, error)
      throw error
    }
  }

  async findByTeamId(teamId: string): Promise<Product[]> {
    try {
      // Attempt to find products via TeamProductAssociation (many-to-many)
      const associations = await this.prisma.teamProductAssociation.findMany({
        where: { teamId },
        include: {
          product: true,
        },
        orderBy: { order: 'asc' },
      })

      return associations
        .map(assoc => assoc.product)
        .map(productData =>
          Product.fromPersistence({
            id: productData.id,
            organizationId: productData.organizationId,
            name: productData.name,
            description: productData.description,
            type: productData.type,
            icon: productData.icon,
            features: productData.features,
            integrationPoints: productData.integrationPoints,
            isActive: productData.isActive,
            order: productData.order,
          })
        )
    } catch (error) {
      // RESILIENCE: If team associations fail, log but return empty array
      // This prevents cascading failures - products still exist independently
      logger.error(`⚠️  Warning: Failed to load products for team ${teamId}, returning empty array:`, error)
      return []
    }
  }

  async findByOrganizationId(organizationId: string): Promise<Product[]> {
    try {
      const productsData = await this.prisma.product.findMany({
        where: { organizationId },
        orderBy: { order: 'asc' },
      })

      return productsData.map(productData =>
        Product.fromPersistence({
          id: productData.id,
          organizationId: productData.organizationId,
          name: productData.name,
          description: productData.description,
          type: productData.type,
          icon: productData.icon,
          features: productData.features,
          integrationPoints: productData.integrationPoints,
          isActive: productData.isActive,
          order: productData.order,
        })
      )
    } catch (error) {
      logger.error(`❌ Error finding products by organization ${organizationId}:`, error)
      throw error
    }
  }

  async findByType(type: TeamProductType): Promise<Product[]> {
    try {
      const productsData = await this.prisma.product.findMany({
        where: { type },
        orderBy: { order: 'asc' },
      })

      return productsData.map(productData =>
        Product.fromPersistence({
          id: productData.id,
          organizationId: productData.organizationId,
          name: productData.name,
          description: productData.description,
          type: productData.type,
          icon: productData.icon,
          features: productData.features,
          integrationPoints: productData.integrationPoints,
          isActive: productData.isActive,
          order: productData.order,
        })
      )
    } catch (error) {
      logger.error(`❌ Error finding products by type ${type}:`, error)
      throw error
    }
  }

  async findActiveProducts(teamId?: string): Promise<Product[]> {
    // RESILIENCE: Products can be queried independently of teams
    // If teamId is provided but associations fail, fall back to all active products
    if (teamId) {
      try {
        // Find active products associated with this team
        const associations = await this.prisma.teamProductAssociation.findMany({
          where: {
            teamId,
            product: {
              isActive: true,
            },
          },
          include: {
            product: true,
          },
          orderBy: { order: 'asc' },
        })

        return associations
          .map(assoc => assoc.product)
          .map(productData =>
            Product.fromPersistence({
              id: productData.id,
              organizationId: productData.organizationId,
              name: productData.name,
              description: productData.description,
              type: productData.type,
              icon: productData.icon,
              features: productData.features,
              integrationPoints: productData.integrationPoints,
              isActive: productData.isActive,
              order: productData.order,
            })
          )
      } catch (error) {
        // RESILIENCE: If team associations fail, log warning and fall back to all active products
        // This ensures products remain available even when team data has issues
        logger.error(
          `⚠️  Warning: Failed to load products for team ${teamId} via associations. ` +
          `Falling back to all active products from organization:`,
          error
        )
        // Fall through to return all active products
      }
    }

    // Return all active products (owned by organization, independent of teams)
    try {
      const productsData = await this.prisma.product.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      })

      return productsData.map(productData =>
        Product.fromPersistence({
          id: productData.id,
          organizationId: productData.organizationId,
          name: productData.name,
          description: productData.description,
          type: productData.type,
          icon: productData.icon,
          features: productData.features,
          integrationPoints: productData.integrationPoints,
          isActive: productData.isActive,
          order: productData.order,
        })
      )
    } catch (error) {
      logger.error('❌ Error finding active products:', error)
      throw error
    }
  }

  async save(product: Product): Promise<Product> {
    try {
      const productData = await this.prisma.product.upsert({
        where: { id: product.id },
        create: {
          id: product.id,
          organizationId: product.organizationId,
          name: product.name,
          description: product.description,
          type: product.type,
        icon: product.icon ?? undefined,
        features: product.features as any,
        integrationPoints: product.integrationPoints as any,
        isActive: product.isActive,
        order: product.order,
        url: product.url ?? undefined,
        accessUrl: product.accessUrl ?? undefined,
        securityLevel: product.securityLevel ?? undefined,
        requiresAuth: product.requiresAuth,
      },
      update: {
        name: product.name,
        description: product.description,
        type: product.type,
        icon: product.icon ?? undefined,
        features: product.features as any,
        integrationPoints: product.integrationPoints as any,
        isActive: product.isActive,
        order: product.order,
        url: product.url ?? undefined,
        accessUrl: product.accessUrl ?? undefined,
        securityLevel: product.securityLevel ?? undefined,
        requiresAuth: product.requiresAuth,
      },
      })

      return Product.fromPersistence({
        id: productData.id,
        organizationId: productData.organizationId,
        name: productData.name,
        description: productData.description,
        type: productData.type,
        icon: productData.icon,
        features: productData.features,
        integrationPoints: productData.integrationPoints,
        isActive: productData.isActive,
        order: productData.order,
        url: productData.url,
        accessUrl: productData.accessUrl,
        securityLevel: productData.securityLevel,
        requiresAuth: productData.requiresAuth,
      })
    } catch (error) {
      logger.error(`❌ Error saving product ${product.id}:`, error)
      throw error
    }
  }
}
